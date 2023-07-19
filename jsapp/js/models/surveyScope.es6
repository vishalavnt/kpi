import _ from 'underscore';
import {actions} from '../actions';
import {
  ASSET_TYPES,
  QUESTION_TYPES,
  CHOICE_LISTS,
} from 'js/constants';
import {notify} from 'utils';
import {unnullifyTranslations} from 'js/components/formBuilder/formBuilderUtils';

class SurveyScope {
  constructor ({survey, rawSurvey, assetType}) {
    this.survey = survey;
    this.rawSurvey = rawSurvey;
    this.assetType = assetType;
  }

  getUnnullifiedContent(assetContent) {
    const surv = this.survey.toFlatJSON();
    /*
     * Apply translations "hack" again for saving single questions to library
     * Since `unnullifyTranslations` requires the whole survey, we need to
     * fish out the saved row and its translation settings out of the unnullified return
     */
    return JSON.parse(unnullifyTranslations(JSON.stringify(surv), assetContent));
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

  addItemToLibrary(row, assetContent) {
    const unnullifiedContent = this.getUnnullifiedContent(assetContent);

    if (row.constructor.kls === 'Row') {
      this.addQuestionToLibrary(row, unnullifiedContent);
    } else {
      this.addGroupToLibrary(row, unnullifiedContent);
    }
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

  addQuestionToLibrary(row, unnullifiedContent) {
    const rowJSON = row.toJSON2();

    const question = unnullifiedContent.survey.find((s) =>
      s.$kuid === rowJSON.$kuid
    );

    let choices;
    if (
      rowJSON.type === QUESTION_TYPES.select_one.id ||
      rowJSON.type === QUESTION_TYPES.select_multiple.id
    ) {
      choices = unnullifiedContent.choices.filter((s) =>
        s.list_name === rowJSON.select_from_list_name
      );
    }

    const content = JSON.stringify({
      survey: [question],
      choices, // included only if question is select_one or select_multiple
      settings: unnullifiedContent.settings,
    });

    actions.resources.createResource.triggerAsync({
      asset_type: ASSET_TYPES.question.id,
      content: content,
    }).then(() => {
      notify(t('question has been added to the library'));
    });
  }

  addGroupToLibrary(row, unnullifiedContent) {
    let contents = [];
    let choices = [];
    const groupKuid = row.toJSON2().$kuid;

    if (!_.isEmpty(unnullifiedContent.survey)) {
      const startGroupIndexFound = _.findIndex(unnullifiedContent.survey, (content) =>
        content['$kuid'] === groupKuid
      );
      if (startGroupIndexFound > -1) {
        const endGroupIndexFound = _.findIndex(unnullifiedContent.survey, (content) =>
          content['$kuid'] === '/' + groupKuid
        );
        contents = unnullifiedContent.survey.slice(startGroupIndexFound, endGroupIndexFound + 1);
      }
    }

    if (contents.length > 0) {
      const contents_kuids = _.pluck(contents, '$kuid');
      const selectSurveyContents = unnullifiedContent.survey.filter((content) =>
        [QUESTION_TYPES.select_one.id, QUESTION_TYPES.select_multiple.id].indexOf(content.type) > -1 &&
        contents_kuids.indexOf(content['$kuid']) > -1
      );
      if (selectSurveyContents.length > 0) {
        const selectListNames = _.pluck(selectSurveyContents, CHOICE_LISTS.SELECT);
        choices = unnullifiedContent.choices.filter((choice) =>
          selectListNames.indexOf(choice.list_name) > -1
        );
      }
    }

    const content = JSON.stringify({
      survey: contents,
      choices: choices,
      settings: unnullifiedContent.settings,
    });

    actions.resources.createResource.triggerAsync({
      asset_type: ASSET_TYPES.block.id,
      content: content,
      name: row.get('label').get('value') || row.get('name').get('value'),
    }).then(() => {
      notify(t('group has been added to the library as a block'));
    });
  }

  handleItem({position, itemUid, groupId}) {
    if (!itemUid) {
      throw new Error('itemUid not provided!');
    }

    actions.survey.addExternalItemAtPosition({
      position: position,
      uid: itemUid,
      survey: this.survey,
      groupId: groupId,
    });
  }
  
  handleCloneGroup({position, groupId, itemDict, assetContent}) {
    let content;
    let contents = [];
    
    const surv = this.survey.toFlatJSON();
    /*
     * Apply translations "hack" again for saving single questions to library
     * Since `unnullifyTranslations` requires the whole survey, we need to
     * fish out the saved row and its translation settings out of the unnullified return
     */
    const unnullifiedContent = JSON.parse(unnullifyTranslations(JSON.stringify(surv), assetContent));
    
    const surveyObj = unnullifiedContent.survey;
    var settingsObj = unnullifiedContent.settings;
    var groupKuid = itemDict.toJSON2().$kuid;
    var groupName = itemDict.toJSON2().name;

    if (!_.isEmpty(surveyObj)) {
      var startGroupIndexFound = _.findIndex(surveyObj, function(surveyObjItem) {
        return surveyObjItem["$kuid"] == groupKuid && surveyObjItem["name"] ==  groupName;
      });

      if (startGroupIndexFound > -1) {
        var endGroups = [];
        for (var i = startGroupIndexFound; i < surveyObj.length; i++) {
          var surveyObjRow = surveyObj[i];
          if (surveyObjRow["$kuid"] == "/" + groupKuid) {
            endGroups.push(i);
          }
        }

        if (endGroups.length > 0) {
          for (i = 0; i < endGroups.length; i++) {
            var endGroupSurveyObjIndex = endGroups[i];
            var slicedSurveyObj = surveyObj.slice(startGroupIndexFound, endGroupSurveyObjIndex + 1);
            var startGroupCount = _.filter(slicedSurveyObj, function(obj) { return obj["type"] == "begin_group" }).length;
            var endGroupCount = _.filter(slicedSurveyObj, function(obj) { return obj["type"] == "end_group" }).length;
            if (startGroupCount ==  endGroupCount) {
              contents = slicedSurveyObj;
              break;
            }
          }
        }
      }
    }
    
    content = {
      survey: contents,
      choices: this.getContentChoices(unnullifiedContent, contents),
      settings: settingsObj
    };

    actions.survey.addItemAtPosition({
      position: position,
      survey: this.survey,
      itemDict: content,
      groupId: groupId
    });
  }
}

export default SurveyScope;
