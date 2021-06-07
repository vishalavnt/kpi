import _ from 'underscore';
import actions from '../actions';
import {
  notify,
  unnullifyTranslations,
  t,
  surveyToValidJson
} from '../utils';

class SurveyScope {
  constructor ({survey}) {
    this.survey = survey;
  }
  getUnnullifiedContent (assetContent) {
    /*
     * Apply translations "hack" again for saving single questions to library
     * Since `unnullifyTranslations` requires the whole survey, we need to
     * fish out the saved row and its translation settings out of the unnullified return
     */
    return JSON.parse(unnullifyTranslations(JSON.stringify(this.survey.toFlatJSON()), assetContent));
  }
  getContentChoices (unnullifiedContent, contents) {
    let contentChoices = [];
    if (contents.length > 0) {
        var contents_kuids = _.pluck(contents, '$kuid');
        var selectSurveyContents = unnullifiedContent.survey.filter(content => ['select_one', 'select_multiple'].indexOf(content.type) > -1 && contents_kuids.indexOf(content["$kuid"]) > -1);
        if (selectSurveyContents.length > 0) {
          var selectListNames = _.pluck(selectSurveyContents, 'select_from_list_name');
          contentChoices = unnullifiedContent.choices.filter(choice => selectListNames.indexOf(choice.list_name) > -1);
        }
    }
    return contentChoices;
  }
  add_rows_to_question_library (rows, assetContent) {
    let content;
    let contents = [];
    var unnullifiedContent = this.getUnnullifiedContent(assetContent);
    var settingsObj = unnullifiedContent.settings;
    var surveyObj = unnullifiedContent.survey;
    
    if (!_.isEmpty(rows)) {
      for (var idx in rows) {
        var row = rows[idx];
        var rowKuid = row.toJSON2().$kuid;
        if (row.constructor.kls === 'Row') { // regular question
          var row_content = _.find(surveyObj, function(content) { return content["$kuid"] == rowKuid; });
          if (!_.isEmpty(row_content)) {
            contents.push(row_content);
          }
        } else { // group
          var startGroupIndexFound = _.findIndex(surveyObj, function(content) {
            return content["$kuid"] == rowKuid;
          });
          if (startGroupIndexFound > -1) {
            var endGroupIndexFound = _.findIndex(surveyObj, function(content) {
              return content["$kuid"] == "/" + rowKuid;
            })
            var group_contents = surveyObj.slice(startGroupIndexFound, endGroupIndexFound + 1);
            contents = contents.concat(group_contents);
          }
        }
      }
    }

    content = JSON.stringify({
      survey: contents,
      choices: this.getContentChoices(unnullifiedContent, contents),
      settings: settingsObj
    });

    actions.resources.createResource.triggerAsync({
      asset_type: 'block',
      content: content
    }).then(function(){
      notify(t('selected questions or groups has been added to the library as a block'));
    });
  }
  add_row_to_question_library (row, assetContent) {
    let content;
    var unnullifiedContent = this.getUnnullifiedContent(assetContent);
    var settingsObj = unnullifiedContent.settings;
    var surveyObj = unnullifiedContent.survey;

    if (row.constructor.kls === 'Row') {
      var rowJSON = row.toJSON2();
      if (rowJSON.type === 'select_one' || rowJSON.type === 'select_multiple') {
        var choices = unnullifiedContent.choices.filter(s => s.list_name === rowJSON.select_from_list_name);
        for (var i in surveyObj) {
          if (surveyObj[i].$kuid == row.toJSON2().$kuid) {
            content = JSON.stringify({
              survey: [
                surveyObj[i]
              ],
              choices: choices,
              settings: settingsObj
            });
          }
        }
      } else {
        for (var j in surveyObj) {
          if (surveyObj[j].$kuid == row.toJSON2().$kuid) {
            content = JSON.stringify({
              survey: [
                surveyObj[j]
              ],
              choices: choices,
              settings: settingsObj
            });
          }
        }
      }
      actions.resources.createResource.triggerAsync({
        asset_type: 'question',
        content: content
      }).then(function(){
        notify(t('question has been added to the library'));
      });
    } else { // add group as block to library
      let contents = [];
      
      var groupKuid = row.toJSON2().$kuid;
      if (!_.isEmpty(surveyObj)) {
        var startGroupIndexFound = _.findIndex(surveyObj, function(content) {
          return content["$kuid"] == groupKuid;
        });
        if (startGroupIndexFound > -1) {
          var endGroupIndexFound = _.findIndex(surveyObj, function(content) {
            return content["$kuid"] == "/" + groupKuid;
          });
          contents = surveyObj.slice(startGroupIndexFound, endGroupIndexFound + 1);
        }
      }
      
      content = JSON.stringify({
        survey: contents,
        choices: this.getContentChoices(unnullifiedContent, contents),
        settings: settingsObj
      });

      actions.resources.createResource.triggerAsync({
        asset_type: 'block',
        content: content,
        name: row.get("name").get("value")
      }).then(function(){
        notify(t('group has been added to the library as a block'));
      });
    }
  }
  handleItem({position, itemData, groupId}) {
    actions.survey.addItemAtPosition({
      position: position,
      uid: itemData.uid,
      survey: this.survey,
      groupId: groupId
    });
  }
}

export default SurveyScope;
