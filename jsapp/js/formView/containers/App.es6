import reactMixin from 'react-mixin';
import React from 'react';
import Reflux from 'reflux';
import autoBind from 'react-autobind';
import stores from 'js/stores';
import actions from 'js/actions';
import ui from 'js/ui';
import { connect } from 'react-redux'
import bem from 'js/bem';
import {
  log,
  t,
} from 'js/utils';

import reducers from 'js/formView/reducers';
import { makeServerAsset, ServerAsset } from 'js/model/serverAsset';

import MetaEditor from '../components/MetaEditor';
import { BuilderCards } from '../components/BuilderCards';

import {
  addStar,
  updateMeta,
  setAsset,
  showTranslation,
  toggleMetaView,
} from '../actions';

import { Map } from 'immutable';

import store from 'js/formView/store';

import Translations from '../components/Translations';
import { fromJS } from 'immutable';
/*
function starString({count, outOf}) {
  let out = '', n = 0;
  while (n < outOf) {
    out += n < count ? '★' : '☆';
    n += 1;
  }
  return out;
}
  <p onClick={this.addStar} style={{
    userSelect: 'none',
    cursor: 'pointer',
  }}>
    {starString({ count: stars.length, outOf: 5 })}
  </p>
*/


class FormView extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
    autoBind(this);
  }
  componentDidMount () {
    this.listenTo(stores.asset, this.assetStoreTriggered);
    actions.resources.loadAsset({ id: this.props.params.assetid });
  }
  assetStoreTriggered (data, uid) {
    let { setAsset, showTranslation, store } = this.props;
    let asset = makeServerAsset(data[uid].xcontent);
    setAsset(asset);
    showTranslation({
      txid: fromJS(asset.translationList.valueSeq().first()).toJS().$id,
    });
  }
  addStar () {
    let { addStar } = this.props;
    addStar();
  }
  toggleMetaView () {
    let { toggleMetaView } = this.props;
    toggleMetaView();
  }
  render () {
    let { asset, updateMeta } = this.props;
    if (!asset || (asset.isEmpty===true)) {
      return <p>loading</p>;
    }
    let [ translation, secondaryTranslation ] = asset.get('translations');
    let props = {
      asset,
      translation,
      secondaryTranslation,
    };

    let assetMeta = asset.reducedMeta();

    // let starsOn = this.props.stars.length || 0,
    //   starsOff = 5 - starsOn;
    let metaz = asset.get('meta').toJS();
    let { builder, showTranslation } = this.props;
    let { tx1, tx2, settingsExpanded } = builder;
    return (
        <ui.Panel>
          <bem.FormView>
            <h4>Language</h4>
            <Translations {...{ store, asset, builder, showTranslation }} />
            <hr />
            <h4>Meta</h4>
            <MetaEditor meta={assetMeta}
              onMetaChange={updateMeta}
              onToggle={this.toggleMetaView}
              expanded={builder.metaExpanded}
            />
            <hr />
            <BuilderCards store={store}
              asset={asset}
              settingsExpanded={settingsExpanded}
            />
          </bem.FormView>
        </ui.Panel>
      );
  }
};
reactMixin(FormView.prototype, Reflux.ListenerMixin);

const mapStateToProps = (state, ownProps) => {
  // state => store's state
  // ownProps => component's props
  let { asset, builder } = state;
  return {
    asset,
    builder,
  };
};

const FormViewConnected = connect(mapStateToProps, {
  updateMeta,
  setAsset,
  showTranslation,
  toggleMetaView,
})(FormView);

export default (props)=>{
  return (
    <FormViewConnected store={store} {...props} />
  );
};
