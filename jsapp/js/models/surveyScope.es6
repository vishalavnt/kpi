import _ from 'underscore';
import actions from '../actions';
import {
  notify,
  t,
  surveyToValidJson
} from '../utils';

class SurveyScope {
  constructor ({survey}) {
    this.survey = survey;
  }
  add_rows_to_question_library (rows) {
    var contents = [];
    var choices = [];
    var rows_kuids = _.map(rows, function(row) { return row.constructor.kls === 'Row' && row.get("$kuid").get("value"); });
    var currentAsset = JSON.parse(surveyToValidJson(this.survey));
    var currentAssetContents = currentAsset.survey;
    if (!_.isEmpty(currentAssetContents)) {
      contents = _.filter(currentAssetContents, function(content) { return rows_kuids.indexOf(content["$kuid"]) > -1; });
    }
    if (contents.length > 0) {
        currentAsset.survey = contents;

        var selectSurveyContents = currentAssetContents.filter(content => ['select_one', 'select_multiple'].indexOf(content.type) > -1);
        if (selectSurveyContents.length > 0) {
          var selectListNames = _.pluck(selectSurveyContents, 'select_from_list_name');
          choices = currentAsset.choices.filter(choice => selectListNames.indexOf(choice.list_name) > -1);

          currentAsset.choices = choices;
        }
    }

    var styleSettings = currentAsset.settings[0]['style'];
    var versionSettings = currentAsset.settings[0]['version'];
    currentAsset.settings = [{}];
    currentAsset.settings[0]['style'] = styleSettings;
    currentAsset.settings[0]['version'] = versionSettings;
    currentAsset.settings[0]['form_id'] = '';

    actions.resources.createResource.triggerAsync({
      asset_type: 'block',
      content: JSON.stringify(currentAsset)
    }).then(function(){
      notify(t('selected questions has been added to the library as a block'));
    });
  }
  add_row_to_question_library (row) {
    if (row.constructor.kls === 'Row') {
      var rowJSON = row.toJSON2();
      let content;
      if (rowJSON.type === 'select_one' || rowJSON.type === 'select_multiple') {
        var surv = this.survey.toFlatJSON();
        var choices = surv.choices.filter(s => s.list_name === rowJSON.select_from_list_name);
        content = JSON.stringify({
          survey: [
            row.toJSON2()
          ],
          choices: choices || undefined
        });
      } else {
        content = JSON.stringify({
          survey: [
            row.toJSON2()
          ]
        });
      }
      actions.resources.createResource.triggerAsync({
        asset_type: 'question',
        content: content
      }).then(function(){
        notify(t('question has been added to the library'));
      });
    } else { // add group as block to library
      var groupContents = [];
      var groupChoices = [];
      
      var groupKuid = row.get("$kuid").get("value");
      var groupAsset = JSON.parse(surveyToValidJson(this.survey));
      var surveyContents = groupAsset.survey;
      if (!_.isEmpty(surveyContents)) {
        var startGroupIndexFound = _.findIndex(surveyContents, function(content) {
          return content["$kuid"] == groupKuid;
        })
        if (startGroupIndexFound > -1) {
          var endGroupIndexFound = _.findIndex(surveyContents, function(content) {
            return content["$kuid"] == "/" + groupKuid;
          })
          groupContents = surveyContents.slice(startGroupIndexFound, endGroupIndexFound + 1);
        }
      }

      if (groupContents.length > 0) {
        groupAsset.survey = groupContents;

        var selectSurveyContents = surveyContents.filter(content => ['select_one', 'select_multiple'].indexOf(content.type) > -1);
        if (selectSurveyContents.length > 0) {
          var selectListNames = _.pluck(selectSurveyContents, 'select_from_list_name');
          groupChoices = groupAsset.choices.filter(choice => selectListNames.indexOf(choice.list_name) > -1);
          groupAsset.choices = groupChoices;
        }
        
      }

      var styleSettings = groupAsset.settings[0]['style'];
      var versionSettings = groupAsset.settings[0]['version'];
      groupAsset.settings = [{}];
      groupAsset.settings[0]['style'] = styleSettings;
      groupAsset.settings[0]['version'] = versionSettings;
      groupAsset.settings[0]['form_id'] = '';

      actions.resources.createResource.triggerAsync({
        asset_type: 'block',
        content: JSON.stringify(groupAsset),
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
