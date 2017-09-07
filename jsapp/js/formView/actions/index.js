
export const ADD_STAR = 'ADD_STAR';
export const SET_ASSET = 'SET_ASSET';

export const addStar = () => ({ type: ADD_STAR });

export const UPDATE_META = 'UPDATE_META';
export const updateMeta = ({field, value}) => {
  return {
    type: UPDATE_META,
    field,
    value,
  };
};

export const setAsset = (asset) => ({ type: SET_ASSET, asset });

export const TOGGLE_META_VIEW = 'TOGGLE_META_VIEW';
export const toggleMetaView = () => {
  return {
    type: TOGGLE_META_VIEW,
  }
};

export const POPUP_CONFIRM_ACTION = 'POPUP_CONFIRM_ACTION';
export const popupConfirmACtion = ({ action }) => {
  return {
    type: POPUP_CONFIRM_ACTION,
    action,
  }
};

export const TOGGLE_SETTINGS = 'TOGGLE_SETTINGS';
export const toggleSettings = ({ kuid }) => {
  return {
    type: TOGGLE_SETTINGS,
    kuid,
  }
};

export const NEW_ROW_DRAFT = 'NEW_ROW_DRAFT';
export const newRowDraft = ({ beneathKuid }) => {
  return {
    type: NEW_ROW_DRAFT,
    beneathKuid,
  }
};

export const COPY_ROW = 'COPY_ROW';
export const copyRow = ({ kuid }) => {
  return {
    type: COPY_ROW,
    kuid,
  }
};


export const TOGGLE_SECONDARY_TRANSLATION = 'TOGGLE_SECONDARY_TRANSLATION';
export const SHOW_TRANSLATION = 'SHOW_TRANSLATION';
export const showTranslation = ({ txid, secondary }) => {
  return {
    type: SHOW_TRANSLATION,
    txid,
    secondary,
  };
};


export const DELETE_CARD = 'DELETE_CARD';
export const deleteCard = ({ kuid }) => {
  return {
    type: DELETE_CARD,
    kuid,
  }
};
