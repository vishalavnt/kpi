import React from 'react'
import PropTypes from 'prop-types'
import CloseRowButton from './CloseRowButton';

import bemComponents from 'js/libs/reactBemComponents';

const { t } = require('utils');
const bem = bemComponents({
  row__questiontypes: 'row__questiontypes',
})

const TypeSelector = ({ name, onNameChange, icons, onItemClick }) => (
  <bem.row__questiontypes>
    <CloseRowButton />
    <input type='text' value={name}
      onChange={onNameChange}
      className='row__questiontypes__new-question-name js-cancel-sort' />
    <div className='row__questiontypes__list clearfix'>
      {icons.map((rowIcons, n) =>
        <div className='questiontypelist__row'>
          {rowIcons.map(({ attributes }, nn) =>
            <div className='questiontypelist__item'
              data-menu-item={attributes.id}
              key={`icon-row-${nn}`}
              onClick={onItemClick}
            >
             <i className={`fa fa-fw fa-${attributes.faClass}`} />
             {attributes.label}
            </div>
          )}
        </div>
      )}
    </div>
  </bem.row__questiontypes>
);

TypeSelector.propTypes = {
  onNameChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default TypeSelector;
