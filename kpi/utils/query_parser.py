# -*- coding: utf-8 -*-
from __future__ import print_function, unicode_literals

'''
How to use this:
* Open a terminal;
* Run `ipython`;
* Type `from adventure import *`;
* The `testy_test()` function will be called automatically. You may want to
    comment this out for development;
* Your `ipython` shell will now have access to everything bound in
    `adventure.py`, most notably `query`. You can call `query.parseString()`
    to play with different queries. You may want to `print query.parseString()`
    for more legible results.

Hopefully the `testy_test()` function gives an idea of the purpose of this code,
which is more than just a parser: it translates strings with a particular
Boolean syntax into Django queries.
'''

from __future__ import (unicode_literals, print_function,
                        absolute_import, division)

import pyparsing as parse
from django.db.models import Q
# import CORE_RE as AWESOMELY_AS_YOU_CAN
import re
import sys

import time # temporary

AND_OPERATOR = 'AND'
OR_OPERATOR = 'OR'
NOT_OPERATOR = 'NOT'
# We need a default field name for cases when the user does not specify a field,
# e.g. they input "peach" instead of "fruit:peach". This will be set elsewhere
# in the larger Django project
DEFAULT_FIELD_NAME = str('PLACEHOLDER_FIELD')

def negate_Q_object(matched_tokens):
    # `matched_tokens` should be `['NOT', <Q object>]`
    assert len(matched_tokens[0]) == 2
    assert matched_tokens[0][0] == NOT_OPERATOR
    return ~matched_tokens[0][1]

def combine_Q_objects(matched_tokens):
    # `matched_tokens` must be `[<Q object>, <operator>, <Q object>, ...]`
    # All the operators must be the same each time this function is called.
    # Take the first operator:
    operator = matched_tokens[0][1]
    # ...and make sure it matches all the subsequent operators
    for subsequent_operator in matched_tokens[0][3::2]:
        assert subsequent_operator == operator
    # Start with the first operand:
    result = matched_tokens[0][0]
    # ...and combine it with all the subsequent operands
    for operand in matched_tokens[0][2::2]:
        if operator == AND_OPERATOR:
            result &= operand
        elif operator == OR_OPERATOR:
            result |= operand
        else:
            # The parser should never allow this to happen
            assert False
    return result

quotedString = parse.dblQuotedString.setParseAction(parse.removeQuotes)
andOperator = parse.Literal(AND_OPERATOR)
orOperator = parse.Literal(OR_OPERATOR)
notOperator = parse.Literal(NOT_OPERATOR)
notAnyOperators = ~andOperator + ~orOperator + ~notOperator
wordExcludeChars = '()'

'''
??? https://github.com/erikrose/parsimonious
'''

#thus sprach Paul McG -- https://stackoverflow.com/questions/2339386/python-pyparsing-unicode-characters
unicodePrintables = u''.join(unichr(c) for c in xrange(sys.maxunicode)
                                        if not unichr(c).isspace())

word = notAnyOperators + parse.Word(re.sub('[' + wordExcludeChars + ']', '', unicodePrintables))
field = notAnyOperators + parse.Word(parse.alphanums + '_')
value = quotedString | word

def phil_magic(query_string, queryset):
    model = queryset.model

    sys.stdout.write('PYPARSING BS START! ')
    sys.stdout.flush()
    t0 = time.time()
    def process_value(field, value):
      return model._meta.get_field(field).to_python(value)

    def create_Q_object(matched_tokens):
        if len(matched_tokens) == 3:
            # A field, a colon, and a value
            field = str(matched_tokens['field'][0])
            value = matched_tokens['value']
            # Make the value the right type, based on the model
            value = process_value(field, value)
            return Q(**{field: value})
        elif len(matched_tokens) == 1:
            # A search term by itself without a specified field
            field = DEFAULT_FIELD_NAME
            value = matched_tokens['value']
            # Make the value the right type, based on the model's default field
            value = process_value(field, value)
            return Q(**{field: value})
        else:
            # The parser should never allow this to happen
            assert False

    term = (
        parse.Optional(field.setResultsName('field') + parse.Literal(':')) +
        value.setResultsName('value')
    ).setResultsName('term').setParseAction(create_Q_object)
    query = parse.infixNotation(
        term,
        [
            (notOperator, 1, parse.opAssoc.RIGHT, negate_Q_object),
            (parse.Optional(andOperator, default='AND'), 2, parse.opAssoc.LEFT,
                combine_Q_objects),
            (orOperator, 2, parse.opAssoc.LEFT, combine_Q_objects),
        ]
    ).setResultsName('q_object')

    te = time.time() - t0
    print("DONE in ", te)
    parse_results = query.parseString(query_string)
    print('Our query is:', parse_results.q_object)
    return queryset.filter(parse_results.q_object)

'''
### TEST 'EM ###
def testy_test(query_parser):
    # TODO: test queries with invalid syntax
    TEST_QUERIES = {
        # keys are input strings, values are expected Q objects
        '"lordy i hope there are tapes"': Q(**{DEFAULT_FIELD_NAME: 'lordy i hope there are tapes'}),
        'brag:"don\'t i look amazing? won\'t you flatter me?!"': Q(brag="don't i look amazing? won't you flatter me?!"),
        'hello, there!': Q(**{DEFAULT_FIELD_NAME: 'hello,'}) &
                         Q(**{DEFAULT_FIELD_NAME: 'there!'}),

        'first_name:John OR first_name:Phil': Q(first_name='John') |
                                              Q(first_name='Phil'),

        'NOT first_name:John': ~Q(first_name='John'),

        '(a:a OR b:b AND c:c) AND d:d OR (google:evil NOT alphabet:soup)':
            Q(Q(a='a') | Q(b='b') & Q(c='c')) & Q(d='d') | Q(
                Q(google='evil') & ~Q(alphabet='soup')),

        # Unicode test case w/ snek and soup
        # Inspired, of course, by classic novel, "The Snake and the Soup"
        '(a:a OR b:b AND c:c) AND d:d OR (snakes:🐍 NOT alphabet:🍲soup)':
            Q(Q(a='a') | Q(b='b') & Q(c='c')) & Q(d='d') | Q(
                Q(snakes='🐍') & ~Q(alphabet='🍲soup')),
    }
    sys.stdout.write('Testing')
    for query, q_obj in TEST_QUERIES.iteritems():
        # FIXME: gross! maybe there's a better way to compare Qs?
        result = repr(list(query_parser.parseString(query))[0])
        expected = repr(q_obj)
        if not result == expected:
            print('These are not the same!\n\t{}\n\t{}'.format(result, expected))
            break
        sys.stdout.write('.')
        sys.stdout.flush()
    print('Done with testy time.')
################
'''
# Maybe don't run the test function automatically while tinkering.
#testy_test(query)
