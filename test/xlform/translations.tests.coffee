{expect} = require('../helper/fauxChai')

$inputParser = require("../../jsapp/xlform/src/model.inputParser")
$translationUtils = require("../../jsapp/xlform/src/model.translationUtils")
$survey = require("../../jsapp/xlform/src/model.survey")

describe " translations set proper values ", ->
  process = (src)->
    new $survey.Survey(src)

  it 'example 0', ->
    survey1 = process(
        survey: [
            type: "text"
            label: "VAL1",
            name: "val1",
          ]
        translation_list: [name: null, active: true, order: 0]
      )
    survey2 = process(
        survey: [
            type: "text"
            label: ["VAL1"],
            name: "val1",
          ]
        translation_list: [name: null, active: true, order: 0]
      )

    expect(survey1._translation_1).toEqual(null)
    expect(survey1._translation_2).toEqual(undefined)

    expect(survey2._translation_1).toEqual(null)
    expect(survey2._translation_2).toEqual(undefined)

  it 'does not have active_translation_name value when none set', ->
    survey = process(
        survey: [type: "text", label: ["VAL1"], name: "val1"]
        translation_list: [name: null, active: true]
      )
    expect(survey.active_translation_name).toEqual('NOT_NAMED')
    expect(survey.translation_list[0].active).toBe(true)

  it 'passes thru active_translation_name', ->
    survey = process(
        survey: [
            type: "text"
            label: ["VAL1_NULL", "VAL2_L2"],
            name: "val1",
          ]
        translation_list: [name: "XYZ", active: true]
      )
    expect(survey.translation_list[0]).toEqual(
      active: true
      name: "XYZ"
    )
    # todo: fix
    _json = survey.toJSON()
    expect(_json.translation_list[0]).toEqual(
      active: true
      name: "XYZ"
    )

  it 'properly reorders', ->
    survey = new $survey.Survey({
        survey: [
          type: 'text'
          label: ['L1', 'L2']
          name: 'q1'
        ]
        translation_list: [
          {
            name: "T1"
          }
          {
            name: "T2"
            active: true
          }
        ]
        translated: ['label']
      })
    expect(survey.active_translation_name).toEqual('T2')

  it 'example 1', ->
    survey = process(
        survey: [
            type: "text"
            label: ["VAL1_NULL", "VAL2_L2"],
            name: "val1",
          ]
        translation_list: [
          {
            name: null
            active: true
            order: 0
          }
          {
            name: "L2"
            order: 1
          }
        ]
      )
    # expect(survey._translation_1).toEqual(null)
    # expect(survey._translation_2).toEqual("L2")

    # expect(survey._translation_1_obj.name).toEqual("NOT_NAMED")
    # expect(survey._translation_2_obj).toEqual(name: "L2")
    # r0 = survey.rows.at(0)

    # todo: fix
    # expect(r0.getLabel('_1')).toEqual('VAL1_NULL')
    # expect(r0.getLabel('_2')).toEqual('VAL2_L2')

    sjson = survey.toJSON()
    rj0 = sjson.survey[0]
    expect(sjson.translation_list).toEqual([
      {
        name: null
        active: true
        order: 0
        savename: null
      }
      {
        name: "L2"
        order: 1
      }
    ])
    expect(rj0['label']).toEqual("VAL1_NULL")
    expect(rj0['label::L2']).toBeDefined()

  it 'example 2', ->
    content = ->
      survey: [
        type: "text"
        label: ["VAL1_L1", "VAL2_L2"],
        name: "val1",
      ]
      translation_list: [
        {
          name: null
          active: true
          savename: "L1"
          order: 0
        }
        {
          name: "L2"
          order: 1
        }
      ]
    survey = process(content())
    src = $inputParser.parse(content())

    expect(src.translation_list[0].savename).toEqual("L1")
    expect(src.translation_list).toEqual(
      [
        {
          name: null
          active: true
          savename: "L1"
          order: 0
        }
        {
          name: "L2"
          order: 1
        }
      ]
      )
    expect(survey._translation_2).toEqual("L2")

    r0 = survey.rows.at(0)
    # todo: understand/fix
    # expect(r0.getLabel('_1')).toEqual('VAL1_L1')
    # expect(r0.getLabel('_2')).toEqual('VAL2_L2')

    _sjson = survey.toJSON()
    rj0 = _sjson.survey[0]
    expect(rj0['label']).toBeDefined()
    expect(rj0['label::L2']).toBeDefined()
