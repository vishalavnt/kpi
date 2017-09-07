{expect} = require('../helper/fauxChai')
$utils = require("../../jsapp/xlform/src/model.utils")
_ = require("underscore")

$translationUtils = require("../../jsapp/xlform/src/model.translationUtils")

pasted = [
            ["list_name", "name", "label", "state", "county"],
            ["state", "texas", "Texas", ""],
            ["state", "washington", "Washington", ""],
            ["county", "king 1", "King", "washington", ""],
            ["county", "pierce", "Pierce", "washington", ""],
            ["county", "king 2", "King", "texas", ""],
            ["county", "cameron", "Cameron", "texas", ""],
            ["city", "dumont", "Dumont", "texas", "king 2"],
            ["city", "finney", "Finney", "texas", "king 2"],
            ["city", "brownsville", "brownsville", "texas", "cameron"],
            ["city", "harlingen", "harlingen", "texas", "cameron"],
            ["city", "seattle", "Seattle", "washington", "king 1"],
            ["city", "redmond", "Redmond", "washington", "king 1"],
            ["city", "tacoma", "Tacoma", "washington", "pierce"],
            ["city", "puyallup", "Puyallup", "washington", "pierce"]
        ].map((r)-> r.join("\t")).join("\n")

expectation = JSON.parse("""
[
    {
        "list_name": "state",
        "name": "texas",
        "label": "Texas"
    },
    {
        "list_name": "state",
        "name": "washington",
        "label": "Washington"
    },
    {
        "list_name": "county",
        "name": "king 1",
        "label": "King",
        "state": "washington"
    },
    {
        "list_name": "county",
        "name": "pierce",
        "label": "Pierce",
        "state": "washington"
    },
    {
        "list_name": "county",
        "name": "king 2",
        "label": "King",
        "state": "texas"
    },
    {
        "list_name": "county",
        "name": "cameron",
        "label": "Cameron",
        "state": "texas"
    },
    {
        "list_name": "city",
        "name": "dumont",
        "label": "Dumont",
        "state": "texas",
        "county": "king 2"
    },
    {
        "list_name": "city",
        "name": "finney",
        "label": "Finney",
        "state": "texas",
        "county": "king 2"
    },
    {
        "list_name": "city",
        "name": "brownsville",
        "label": "brownsville",
        "state": "texas",
        "county": "cameron"
    },
    {
        "list_name": "city",
        "name": "harlingen",
        "label": "harlingen",
        "state": "texas",
        "county": "cameron"
    },
    {
        "list_name": "city",
        "name": "seattle",
        "label": "Seattle",
        "state": "washington",
        "county": "king 1"
    },
    {
        "list_name": "city",
        "name": "redmond",
        "label": "Redmond",
        "state": "washington",
        "county": "king 1"
    },
    {
        "list_name": "city",
        "name": "tacoma",
        "label": "Tacoma",
        "state": "washington",
        "county": "pierce"
    },
    {
        "list_name": "city",
        "name": "puyallup",
        "label": "Puyallup",
        "state": "washington",
        "county": "pierce"
    }
]
""")


do ->
  describe 'model.utils', ->
    describe 'pasted', ->
      _eqKeyVals = (a, b)->
        expect(_.keys(a).sort().join(',')).toEqual(_.keys(b).sort().join(','))
        expect(_.values(a).sort().join(',')).toEqual(_.values(b).sort().join(','))

      it 'splits pasted code into appropriate chunks', ->
        splitted = $utils.split_paste(pasted)
        expect(splitted.length).toEqual(expectation.length)
        for i in [0..splitted.length]
            _eqKeyVals(splitted[i], expectation[i])

    describe 'sluggify', ->
      it 'lowerCases: true', ->
        expect($utils.sluggify("TESTING LOWERCASE TRUE", lowerCase: true)).toEqual('testing_lowercase_true')
      it 'lowerCases: false', ->
        expect($utils.sluggify("TESTING LOWERCASE FALSE", lowerCase: false)).toEqual('TESTING_LOWERCASE_FALSE')
      it 'isValidXmlTag passes with valid strings', ->
        valid_xml = [
          'abc',
          '_123',
          'a456',
          '_.',
        ]
        for str in valid_xml
          expect($utils.isValidXmlTag(str)).toBeTruthy()
      it 'isValidXmlTag fails with invalid strings', ->
        invalid_xml = [
          '1xyz',
          ' startswithspace',
          '._',
        ]
        for str in invalid_xml
          expect($utils.isValidXmlTag(str)).not.toBeTruthy()
 
      it 'handles a number of strings consistenly', ->
        inp_exps = [
            [["asdf jkl"],              "asdf_jkl"],
            [["asdf", ["asdf"]],        "asdf_001"],
            [["2. asdf"],               "_2_asdf"],
            [["2. asdf", ["_2_asdf"]],  "_2_asdf_001"],
            [["asdf#123"],              "asdf_123"],
            [[" hello "],               "hello"],
        ]
        for [inps, exps], i in inp_exps
          [str, additionals] = inps
          _out = $utils.sluggifyLabel(str, additionals)
          expect(_out).toBe(exps)

describe 'model.translationUtils', ->
  fn = $translationUtils._tx_string_to_object

  it 'converts translation list to objects', ->
    expect(['English', 'French', 'Spanish'].map(fn)).toEqual(
      [
        {
          name: 'English'
          code: 't1'
          order: 0
        }
        {
          name: 'French'
          code: 't2'
          order: 1
        }
        {
          name: 'Spanish'
          code: 't3'
          order: 2
        }
      ])

  it 'extracts codes', ->
    expect(fn('English(en)', 0)).toEqual(
        name: 'English'
        code: 'en'
        order: 0
      )

  it 'sets $uid', ->
    item = {
      name: 'xx'
      code: 'yy'
    }

    item2 = $translationUtils.set_tx_id(item)
    expect(Object.keys(item2)).toEqual(['name', 'code', '$uid'])
    expect(item2['$uid']).toBeDefined()

    existing_item = {
      name: 'xx'
      code: 'yy'
      '$uid': 'abcdef'
    }
    item3 = $translationUtils.set_tx_id(existing_item)
    expect(Object.keys(item3)).toEqual(['name', 'code', '$uid'])
    expect(item3['$uid']).toEqual('abcdef')


  describe 'reorders translated fields', ->
    copy_obj = (obj)->
      JSON.parse(JSON.stringify(obj))

    surv = ->
      {
        survey: [
          {
            label: ['Lang1', 'Lang2']
            type: 'select_one'
            select_from_list_name: 'cl1'
            name: 'somename'
          }
        ]
        choices: [
          {
            list_name: 'cl1'
            label: ['L1C1', 'L2C1']
          }
          {
            list_name: 'cl1'
            label: ['L1C2', 'L2C2']
          }
        ]
        translations: ['Lang1', 'Lang2']
        translated: ['label']
      }

    it 'rearranges list by changing order', ->
      items = [
        {
          name: 'Lang1',
          order: 0,
        }
        {
          name: 'Lang2',
          order: 1,
        }
      ]
      expect(_.pluck(items, 'order')).toEqual([0, 1])
      $translationUtils.change_order_by_name(items, 'Lang2')
      expect(_.pluck(items, 'order')).toEqual([1, 0])
    it 'renames first translation to null when asked to do so', ->
      tls = [
        {
          name: 'Lang1',
          order: 2,
        }
        {
          name: 'Lang2',
          order: 1,
        }
        {
          name: 'Lang3',
          order: 0,
        }
      ]
      expect(_.pluck(tls, 'name')).toEqual(['Lang1', 'Lang2', 'Lang3'])
      $translationUtils.rename_first_translation_to_null(tls)
      expect(_.pluck(tls, 'name')).toEqual(['Lang1', 'Lang2', null])
      expect(_.pluck(tls, 'savename')).toEqual([undefined, undefined, 'Lang3'])
    it 'moves existing null translation', ->
      tls = [
        {
          name: 'Lang1',
          order: 2,
        }
        {
          name: null,
          order: 1,
        }
        {
          name: 'Lang3',
          order: 0,
        }
      ]
      expect(_.pluck(tls, 'name')).toEqual(['Lang1', null, 'Lang3'])
      $translationUtils.rename_first_translation_to_null(tls)
      expect(_.pluck(tls, 'name')).toEqual(['Lang1', 'NOT_NAMED', null])
      expect(_.pluck(tls, 'savename')).toEqual([undefined, null, 'Lang3'])
