import React from 'react';
import PropTypes from 'prop-types';

const models = require('xlform/view.icons').models;
const iconClasses = models.reduce(function( hsh, model ){
  hsh[model.attributes.id] = model.attributes.faClass;
  return hsh;
}, {});

export default (props)=> {
  let iconKls = iconClasses[props.type] || 'fighter-jet';
  return (
      <i className={`fa fa-fw card__header-icon fa-${iconKls}`} />
    )
};
