$modelUtils = require './model.utils'

module.exports = do ->
  # To be extended ontop of a RowDetail when the key matches
  # the attribute in XLF.RowDetailMixin

  rowDetailMixins =
    label:
      postInitialize: ()->
        # When the row's name changes, trigger the row's [finalize] function.
        return
    name:
      deduplicate: (survey) ->
        names = []
        survey.forEachRow (r)=>
          if r.get('name') != @
            name = r.getValue("name")
            names.push(name)
        , includeGroups: true

        $modelUtils.sluggifyLabel @get('value'), names
  rowDetailMixins
