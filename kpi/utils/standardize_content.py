from copy import deepcopy
import re

from formpack.utils.replace_aliases import replace_aliases
from formpack.utils.aliases import META_TYPES
from formpack.utils.expand_content import expand_content, SCHEMA_VERSION
from .random_id import random_id

ALLOWED_TYPES = {
    u'score__row': True,
    u'rank__level': True,
    u'begin_score': [
        u'begin score',
    ],
    u'end_score': [
        u'end score',
    ],
    u'begin_rank': [
        u'begin rank',
    ],
    u'end_rank': [
        u'end rank',
    ],
    u'begin_kobomatrix': [
        u'begin kobomatrix',
    ],
    u'end_kobomatrix': [
        u'end kobomatrix',
    ],
}


def needs_standardization(_c):
    if not isinstance(_c, dict):
        raise ValueError("Content argument needs to be a dict")
    return not _c.get('schema') is SCHEMA_VERSION


def standardize_content(content):
    _content = deepcopy(content)
    standardize_content_in_place(_content)
    return _content


def _tlist_from_name(args):
    (index, translation_name) = args
    code = False
    if isinstance(translation_name, basestring):
        mtch = re.match('^\s*(.*\S)\s*\((\w+)\)', translation_name)
        if mtch:
            (translation_name, code) = mtch.groups()
    out = {'name': translation_name,
           'order': index,
           }
    if code:
        out['code'] = code
    return out


def ensure_translation_list_in_content(content, existing_list=False):
    if not existing_list:
        if 'translations' in content:
            existing_list = map(_tlist_from_name,
                                enumerate(content['translations']))
    content['translation_list'] = existing_list


def ensure_ids_in_translations(translation_list):
    changed = False
    for translation in translation_list:
        if '$kuid' in translation:
            del translation['$kuid']
        if 'code' in translation:
            del translation['code']
        if 'order' in translation:
            del translation['order']
        if '$id' not in translation:
            changed = True
            translation['$id'] = 't' + random_id(3)
    return changed


def on_retrieve_asset_content(content):
    '''
    this allows us to make adjustments to asset content format without
    needing to migrate all existing assets.
    these adjustments are done for ease of handling on the client side.
    '''
    changed = False
    if 'translation_list' not in content:
        ensure_translation_list_in_content(content)
        ensure_ids_in_translations(content['translation_list'])
        changed = True
    else:
        changed = ensure_ids_in_translations(content['translation_list'])
    return changed


def sheet_lists_to_dicts(rows, translations, translated_cols):
    for row in rows:
        if 'kuid' in row:
            del row['kuid']
        for col in translated_cols:
            if col in row:
                _newvals = {}
                _vals = row[col]
                for (n, val) in enumerate(_vals):
                    tx = translations[n]
                    txid = tx.get('code', tx['$id'])
                    _newvals[txid] = val
                row[col] = _newvals


def asset_lists_to_dicts(content):
    translations = content.get('translation_list')
    translated_cols = content.get('translated')
    sheet_lists_to_dicts(content.get('survey', []),
                         translations,
                         translated_cols)
    sheet_lists_to_dicts(content.get('choices', []),
                         translations,
                         translated_cols)


def separate_meta_fields(content):
    if 'meta' not in content:
        content['meta'] = {}
    metas = filter(lambda row: row['type'] in META_TYPES,
                   content['survey'][:])
    for row in metas:
        content['survey'].remove(row)
        content['meta'][row.pop('type')] = row


def standardize_content_in_place(content):
    existing_list = None
    if 'translation_list' in content:
        existing_list = content.pop('translation_list')

    if 'settings' not in content:
        content['settings'] = {}
    if 'survey' not in content:
        content['survey'] = []
    expand_content(content, in_place=True)
    replace_aliases(content, in_place=True, allowed_types=ALLOWED_TYPES)
    ensure_translation_list_in_content(content, existing_list)
    ensure_ids_in_translations(content['translation_list'])
