import React from 'react/addons';
import Reflux from 'reflux';
import _ from 'underscore';
import {
  Navigation,
} from 'react-router';
import actions from '../actions';
import bem from '../bem';
import stores from '../stores';
import Select from 'react-select';
import {
  assign,
  t,
  log,
} from '../utils';

var ChartWrap = bem.create('chart-wrap'),
    ChartDiv = bem.create('chart-div');

function labelVal(label, value) {
  // returns {label: "Some Value", value: "some_value"} for react-select
  return {label: t(label), value: (value || label.toLowerCase().replace(/\W+/g, '_'))};
}
let chartStyles = [
  labelVal('Pie Chart'),
  labelVal('Ring Chart'),
  labelVal('Bar Chart'),
  labelVal('Scatter Plot'),
];


var DefaultChartStylePicker = React.createClass({
  defaultChartStyleChange (value) {
    this.props.onChange({
      default: true,
    }, {
      chart_type: value || false
    });
  },
  render () {
    return (
        <div>
          <p>Default styles</p>
          <Select
            name='default_chart_type'
            value={this.props.defaultStyle.chart_type}
            clearable={false}
            searchPromptText={t('chart type')}
            placeholder={t('default chart type')}
            options={chartStyles}
            onChange={this.defaultChartStyleChange}
          />
        </div>
      );
  },
});

var IndividualChartStylePicker = React.createClass({
  specificChartStyleChange (value) {
    this.props.onChange({
      kuid: this.props.row.$kuid,
    }, {
      chart_type: value || false,
    });
  },
  render () {
    let kuid = this.props.row.$kuid;
    return (
        <div>
          <Select
            name={`chart_type__${kuid}`}
            value={this.props.style.chart_type}
            clearable={true}
            clearValueText={t('none')}
            placeholder={t('chart type')}
            options={chartStyles}
            onChange={this.specificChartStyleChange}
          />
        </div>
      );
  },
});

var Charts = React.createClass({
  mixins: [
    Navigation,
    Reflux.ListenerMixin,
  ],
  componentDidMount () {
    let uid = this.props.params.assetid;
    this.listenTo(actions.charts.setStyle.completed, (asset)=>{
      if (asset.uid === uid) {
        this.setState({
          chartStyles: asset.chart_styles,
        });
      }
    });
    stores.allAssets.whenLoaded(uid, (asset)=>{
      let rowsByKuid = {};
      asset.content.survey.forEach(function(r){
        rowsByKuid[r.$kuid] = r;
      });
      this.setState({
        asset: asset,
        rowsByKuid: rowsByKuid,
        chartStyles: asset.chart_styles,
      });
    });
  },
  getInitialState () {
    return {
      translationIndex: 0,
    };
  },
  chartStyleChange (params, value) {
    let assetUid = this.state.asset.uid;
    let sett_ = this.state.chartStyles;
    if (params.default) {
      assign(sett_.default, value);
    } else if (params.kuid) {
      let kuid = params.kuid;
      if (!sett_.specified[kuid]) {
        sett_.specified[kuid] = {};
      }
      assign(sett_.specified[kuid], value);
    }
    actions.charts.setStyle(assetUid, sett_);
    this.setState({
      chartStyles: sett_,
    });
  },
  translationIndexChange (val) {
    this.setState({translationIndex: val});
  },
  render () {
    let asset = this.state.asset,
        rowsByKuid = this.state.rowsByKuid,
        explicitStyles,
        explicitStylesList = [],
        defaultStyle;
    let translations;
    if (asset && asset.content) {
      explicitStyles = this.state.chartStyles.specified || {};
      defaultStyle = this.state.chartStyles.default || {};
      explicitStylesList = this.state.asset.content.survey.map(function(r){
        r.chartStyle = explicitStyles[r.$kuid];
        return r;
      });
      if (asset.content.translations) {
        translations = asset.content.translations.map(function(tt, n){
          if (!tt) {
            return {
              label: 'None',
              value: n,
            }
          }
          return {
            label: tt,
            value: n,
          };
        });
      }
    }
    var getTranslatedIndex = (label)=> {
      if (!label || _.isString(label)) {
        return label;
      }
      return label[this.state.translationIndex];
    };

    return (
        <div>
          <h2>Chart styles</h2>
          {this.state.asset ?
            <div>
              {
                translations ?
                  <Select
                      name={`translation-switcher`}
                      value={this.state.translationIndex}
                      clearable={false}
                      default={0}
                      placeholder={t('Translation')}
                      options={translations}
                      onChange={this.translationIndexChange}
                    />
                : null
              }
              <DefaultChartStylePicker
                  defaultStyle={defaultStyle}
                  onChange={this.chartStyleChange}
                  translationIndex={this.state.translationIndex}
                />
              <ChartWrap>
                {
                  explicitStylesList.length === 0 ?
                    <p>No styles to be specified</p>
                  :
                  explicitStylesList.map((row)=>{
                    let kuid = row.$kuid;
                    return (
                        <ChartDiv title={row.$kuid}>
                          {getTranslatedIndex(row.label) || row.name}
                          <IndividualChartStylePicker key={kuid}
                              row={row}
                              onChange={this.chartStyleChange}
                              translationIndex={this.state.translationIndex}
                              asset={asset}
                              style={row.chartStyle}
                            />
                        </ChartDiv>
                      );
                  })
                }
              </ChartWrap>
            </div>
          :
            <p>loading</p>
          }
        </div>
      );
  }
})

export default Charts;
