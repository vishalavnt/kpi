_ = require 'underscore'
$aliases = require './model.aliases'
$translationUtils = require './model.translationUtils'

rowGrouper = require('js/model/utils/rowGrouper').rowGrouper

module.exports = do ->
  inputParser = {}

  hasBeenParsed = (obj)->
    for row in obj
      if row.__rows
        return true
      else if $aliases.q.testGroupable(row.type)
        return false
    return true
  inputParser.hasBeenParsed = hasBeenParsed

  flatten_translated_fields = (item, translations)->
    if translations and translations.length is 0
      return item
    for key, val of item
      if _.isArray(val)
        delete item[key]
        _.map(translations, (translation_obj, i)->
          _t = translation_obj.name
          _translated_val = val[i]
          if _t
            lang_str = "#{key}::#{_t}"
          else
            lang_str = key
          item[lang_str] = _translated_val
        )
    item

  parseArr = (type='survey', sArr, translations=false)->
    rows = sArr.map((item)->
        flatten_translated_fields(item, translations)
      )
    rowGrouper(rows)


  inputParser.parseArr = parseArr

  inputParser.parse = (o)->
    $translationUtils.add_translation_list o
    $translationUtils.rename_first_translation_to_null o.translation_list


    if o.translations and not o.translation_list
      console.error('translations with no translation_list')
    if not o.translation_list
      throw new Error('no translations')

    t_list = o.translation_list

    if o.survey
      o.survey = parseArr('survey', o.survey, t_list)

    if o.choices
      o.choices = parseArr('choices', o.choices, t_list)

    # settings is sometimes packaged as an array length=1
    if o.settings and _.isArray(o.settings) and o.settings.length is 1
      o.settings = o.settings[0]

    o.translation_list = t_list

    o

  inputParser.loadChoiceLists = (passedChoices, choices)->
    tmp = {}
    choiceNames = []
    for choiceRow in passedChoices
      lName = choiceRow["list name"] || choiceRow["list_name"]
      unless tmp[lName]
        tmp[lName] = []
        choiceNames.push(lName)
      tmp[lName].push(choiceRow)
    for cn in choiceNames
      choices.add(name: cn, options: tmp[cn])

  # groupByVisibility = (inp, hidden=[], remain=[])->
  #   hiddenTypes = $aliases.q.hiddenTypes()
  #   throw Error("inputParser.sortByVisibility requires an array")  unless _.isArray(inp)
  #   for row in inp
  #     dest = if row.type? in hiddenTypes then hidden else remain
  #   [hidden, inp]

  # inputParser.sortByVisibility = sortByVisibility
  inputParser
