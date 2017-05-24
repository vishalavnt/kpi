_ = require('underscore')
trim = require('string.prototype.trim')

txtid = require('./model.utils').txtid

tx_string_to_object = (translation, index)->
  out =
    name: translation
    index: index

  mtch = translation.match(/(.+)\((\w+)\)/)
  if mtch
    out.name = trim(mtch[1])
    out.code = mtch[2]

  out

tx_strings_to_objects = (translations)->
  translations.map tx_string_to_object

set_tx_id = (translation_object)->
  if not ('$uid' of translation_object)
    translation_object['$uid'] = txtid()
  translation_object

add_translation_list = (content)->
  if 'translation_list' not of content and 'translations' of content
    content.translation_list = tx_strings_to_objects(content.translations)
  content

prioritize_translation = (content, translation_name)->
  index = content.translations.indexOf translation_name
  if index is -1
    throw new Error('translation not found')
  else if index > 0
    translatedcols = content.translated
    for sheetName in ['survey', 'choices'] when content[sheetName]
      for row, n in content[sheetName]
        for colname in translatedcols
          col = row[colname]
          val = col[index]
          col.splice(index, 1)
          col.unshift(val)
  content


module.exports = {
  add_translation_list: add_translation_list
  set_tx_id: set_tx_id
  tx_strings_to_objects: tx_strings_to_objects
  tx_string_to_object: tx_string_to_object
  prioritize_translation: prioritize_translation
}