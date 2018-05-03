{expect} = require('../helper/fauxChai')
_ = require('underscore')

{Map} = require('immutable')

$model = require("../../jsapp/xlform/src/_model")

SC = ()->
  JSON.parse('''
{
  "translation_list": [
    {
      "$id": "t6LT",
      "code": "en_us",
      "name": "English"
    }
  ],
  "settings": {},
  "meta": {},
  "survey": [
    {
      "$autoname": "abc",
      "$kuid": "ef1bfb2d",
      "required": true,
      "type": "text",
      "label": {
        "t6LT": "abc"
      }
    },
    {
      "$autoname": "def",
      "$kuid": "60d4ce2b",
      "required": true,
      "type": "text",
      "label": {
        "t6LT": "def"
      }
    },
    {
      "$autoname": "ghi",
      "$kuid": "115d0249",
      "required": true,
      "type": "text",
      "label": {
        "t6LT": "ghi"
      }
    }
  ],
  "schema": 2
}
''')

{ServerAsset} = require("js/model/serverAsset")


validators = require("js/validators")

# fromJS = require("immutable").fromJS
expectRow =
  invalid: (row)->
    is_valid = validators.row(row)
    # if is_valid
    #   console.error("%c"+"row", "text-decoration:underline", row);
    #   console.error(JSON.stringify(validators.row.errors, null, 2))
    expect(is_valid).not.toBe(true)
  valid: (row)->
    is_valid = validators.row(row)
    # if !is_valid
    #   console.log("%c"+"row", "text-decoration:underline", row);
    #   console.log(validators.schemas.row)
    #   console.error(JSON.stringify(validators.row.errors, null, 2))
    expect(is_valid).toBe(true)

AAA="aaaaaa"

describe "serverAsset", ->

  describe "direct validator tests", ->
    it "valid types", ->
      expectRow.valid(type: "text", $kuid: AAA)
    it "invalid types", ->
      expectRow.invalid(type: "bad test", $kuid: AAA)
    it "doesnt expect aliases", ->
      expectRow.invalid(type: "select1", $kuid: AAA)

  describe "validates document", ->
    warningsContain = (sa, warningStrings)->
      if warningStrings is undefined
        console.log("%c"+"JSON.stringify(sa.warnings)", "text-decoration:underline", JSON.stringify(sa.warnings, null, 2));
        warningStrings = []
      if _.isString(warningStrings)
        warningStrings = [warningStrings]
      for str in warningStrings
        expect(JSON.stringify(sa.warnings)).toContain(str)

    it "checks validity of translation", ->
      sa = ServerAsset.minimal(translations: [{
          order: 2,
          name: "xyz",
          code: "def",
        }])
      warningsContain(sa, "should have required property '$id'")

    it "basic valid survey", ->
      sa1 = ServerAsset.minimal({
        survey: [
          {
            type: 'select_one'
            select_from_list_name: 'xyz'
            $kuid: 'abc123'
            label: {
              tx1: 'Label1'
            }
          }
        ]
        # choices: [
        #   {list_name: 'x', name: 'x', label: 'x'}
        # ],
        choices: {
          xyz: [
            {
              name: 'xx'
              $kuid: 'xx1',
              label: {
                tx1: 'ChocieLabel1'
              }
            }
            {
              name: 'yy',
              $kuid: 'yy1',
              label: {
                tx1: 'ChoiceLabel2'
              }
            }
          ]
        }
        translation_list: [
          {
            $id: 'tx1'
            name: 'Translation1'
            code: 'tx1'
          }
        ]
      })
      warningsContain(sa1)

    describe "individual fields on base document must be expected type", ->
      it "survey", ->
        warningsContain(ServerAsset.minimal(survey: {}),
          ['survey', 'should be array'])

      it "translations", ->
        warningsContain(ServerAsset.minimal(translations: {}),
          ['translations', 'should be array'])

      it "meta", ->
        warningsContain(ServerAsset.minimal(meta: []),
          ['meta', 'should be object'])

      it "settings", ->
        warningsContain(ServerAsset.minimal(settings: []),
          ['settings', 'should be object'])

      it "choices", ->
        warningsContain(ServerAsset.minimal(choices: []),
          ['choices', 'should be object'])


  describe "update field", ->
    it "something", ->
      sa1 = ServerAsset.create({
        survey: [
          {
            type: 'select_one'
            select_from_list_name: 'xyz'
            $kuid: 'abc123'
            label: {
              tx1: 'Label1'
            }
          }
        ]
        choices: {
          xyz: [
            {
              name: 'xx'
              $kuid: 'xx1',
              label: {
                tx1: 'ChocieLabel1'
              }
            }
            {
              name: 'yy',
              $kuid: 'yy1',
              label: {
                tx1: 'ChoiceLabel2'
              }
            }
          ]
        }
        translation_list: [
          {
            $id: 'tx1'
            name: 'Translation1'
            code: 'tx1'
          }
        ]
      })
      expect(sa1.choices($kuid: 'abc123').toJS()).toEqual([
        {
          name: 'xx'
          $kuid: 'xx1',
          label: {
            tx1: 'ChocieLabel1'
          }
        }
        {
          name: 'yy',
          $kuid: 'yy1',
          label: {
            tx1: 'ChoiceLabel2'
          }
        }
      ])
      # log(sa1._map_.toJS())
    it "works", ->
      sa1 = ServerAsset.create(SC())
      rows = (x['$kuid'] for x in SC().survey).map((kuid)=>
        sa1.getIn(['kuids', kuid]).toJS()
      )

      runChange = (fn, exp=false)->
        s2 = fn(sa1)
        _chgz = s2.diffSinceSavePoint().toJS()
        if (exp)
          expect(_chgz).toEqual(exp)
        return _chgz;

      runChange(((a)->
          a.setIn(['kuids', 'ef1bfb2d', 'required'], false)
        ), [{
          op: "replace"
          path: "/kuids/ef1bfb2d/required"
          value: false
        }])

      runChange(((a)->
          a.deleteKuid(kuid: '60d4ce2b')
        ), [{
          op: 'remove'
          path: '/order/1'
        }])

      runChange(((a)->
          a.updateMeta(field: 'start', name: 'start', _kuid: 'true')
        ), [
        {
          "op": "add",
          "path": "/meta/start",
          "value": {
            "name": "start",
            "$kuid": "true",
            "disabled": true
          }
        }
      ])

      runChange(((a)->
          a.updateMeta(field: 'start', name: 'start', _kuid: 'aaa')
        ), [
        {
          "op": "add",
          "path": "/meta/start",
          "value": {
            "name": "start",
            "$kuid": "aaa",
            "disabled": true
          }
        }
      ])

      runChange(((a)->
          a.addTranslation(name: 'xyz', code: 'en_us', $id: 'xxx')
        ), [
            {
              "op": "add",
              "path": "/translations/xxx",
              "value": {
                "name": "xyz",
                "code": "en_us",
                "$id": "xxx"
              }
            }
          ])

      runChange(((a)->
          a.disableTranslation({ $id: 't6LT' })
        ), [
            {
              "op": "add",
              "path": "/translations/t6LT/disabled",
              "value": true
            }
          ])

      runChange(((a)->a.addRow({ type: 'text', name: 'name', kuid: 'ddd' })),
          [
            {
              "op": "add",
              "path": "/kuids/ddd",
              "value": {
                "type": "text",
                "name": "name"
              }
            },
            {
              "op": "add",
              "path": "/order/3",
              "value": "ddd"
            }
          ]
        )

      # runChange(((a)->a.groupRows({ rows: ['60d4ce2b'], kuid: 'grp123', position: [0] })),
      #   []
      #   )



      # runChange(((a)-> a.moveRow({ kuid: '115d0249', position: [0] })),
      #     [
      #       {
      #         "op": "add",
      #         "path": "/kuids/ddd",
      #         "value": {
      #           "type": "text",
      #           "name": "name"
      #         }
      #       },
      #       {
      #         "op": "add",
      #         "path": "/order/3",
      #         "value": "ddd"
      #       }
      #     ]
      #   )


      # debugger
      # asdfasdf = '123'
      # row = row3.key
      # field = 'label'
      # sheet = 'survey'
      # translation = 't6LT'
      # sa.update({sheet, row, field, translation}, 'xvalue')
      # console.log(sa.content);
      # console.log(JSON.stringify(sa.asJson(), null, 2))
      # window.xyz = diff(sa.history[0], sa.content)
      # xxx = sa.asJson()
      # console.log(JSON.stringify(xxx, null, 2))
      # console.log(zz)
      # xx = sa._export()
      # expect(xx?.survey[2].label['t6LT']).toEqual('Value')
      # log(sa.survey)
