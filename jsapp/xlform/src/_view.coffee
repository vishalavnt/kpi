_ = require 'underscore'
$surveyApp = require './view.surveyApp'
$viewUtils = require './view.utils'

module.exports = do ->
  view = {}

  _.extend(view,
                $surveyApp
                )

  view.utils = $viewUtils

  view
