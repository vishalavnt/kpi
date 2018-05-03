import React from 'react'
import PropTypes from 'prop-types'

import CloseRowButton from './CloseRowButton';

const { t } = require("utils");

const RowNamer = ({ onCloseClick, onSubmit, onNameChange }) => (
  <div className='row__questiontypes row__questiontypes--namer'>
    <CloseRowButton onClick={onCloseClick} />
    <form className='row__questiontypes__form'
      action='javascript:void(0)'
      onSubmit={onSubmit}
    >
      <input type='text'
        className='js-cancel-sort mdl-textfield__input'
        onChange={onNameChange}
      />
      <button>{`+ ${t('Add Question')}`}</button>
    </form>
  </div>
);

RowNamer.propTypes = {
  onCloseClick: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default RowNamer;
