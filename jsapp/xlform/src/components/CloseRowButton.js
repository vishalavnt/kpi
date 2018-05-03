import React from 'react'

const { t } = require('utils');

const CloseRowButton = ({ onClick }) => (
  <button type='button'
    onClick={onClick}
    aria-hidden='true'
    key='close-row'
    className={[
      'row__questiontypes__close',
      'js-close-row-selector',
      'shrink',
      'pull-right',
      'close',
      'close-button',
      'close-button--depr',
    ].join(' ')}
  >
    {'×'}
  </button>
)

export default CloseRowButton;
