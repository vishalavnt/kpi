import { combineReducers, applyMiddleware, createStore } from 'redux'

import {
  SET_ASSET,
  DELETE_CARD,
  COPY_ROW,
  UPDATE_META,
  TOGGLE_META_VIEW,
  TOGGLE_SETTINGS,
  SHOW_TRANSLATION,
  TOGGLE_SECONDARY_TRANSLATION,
} from '../actions';


import { EmptyServerAsset, ServerAsset } from 'js/model/serverAsset';

const asset = (assetState=(new EmptyServerAsset()), action) => {
  switch (action.type) {
    case SET_ASSET:
      return action.asset;
    case UPDATE_META:
      let { field, value } = action;
      return assetState.updateMeta({ field, value });
    case DELETE_CARD:
      let { kuid } = action;
      return assetState.deleteKuid({ kuid });
    default:
      return assetState;
  }
}


const builder = (state = {
  metaExpanded: false,
  settingsExpanded: false,
  tx1: null,
  tx2: null,
}, action) => {
  switch (action.type) {
    case TOGGLE_META_VIEW:
      return {
        ...state,
        metaExpanded: !state.metaExpanded
      };
    case TOGGLE_SETTINGS:
      let settingsExpanded = action.kuid;
      if (state.settingsExpanded === action.kuid) {
        settingsExpanded = false;
      }
      return {
        ...state,
        settingsExpanded,
      }
    case SHOW_TRANSLATION:
      let [ what, other ] = action.secondary ? ['tx2', 'tx1'] : ['tx1', 'tx2'];
      let towhat = action.txid;
      if (!state[what] && (state[other] === towhat)) {
        return {...state};
      }
      if (what === 'tx2' && state[what] === towhat) {
        return {...state, [what]: undefined};
      }
      if (towhat !== state[other]) {
        return {
          ...state,
          [what]: towhat,
        }
      } else {
        return {
          ...state,
          [other]: state[what],
          [what]: towhat,
        };
      }
    default:
      return state;
  }
}

export default combineReducers({ asset, builder });
