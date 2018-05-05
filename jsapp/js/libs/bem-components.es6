/*
 a simple method to define a hierarchy of bem elements

 A simple way to create a react div using BEM classes:
  <ul className="block">
    <li className="block__element block__element--modifier"></li>
  </ul>

 new way:
  // define the react components in js:
  const bem = bemComponents({
    Buttons: 'buttons',             // <div> is implied
    Block: ['block', 'ul'],         // Other tags (e.g. <ul>) can be specified
    Block__el: ['block__el', 'li'],
  })

  // use them in jsx:
  <bem.Block>
    <bem.Block__element>
      hello
    </bem.Block__element>
    <bem.Block__element m='modifier'>
      world
    </bem.Block__element>
    <bem.Block__element mkey='excl1'>
      !
    </bem.Block__element>
    <bem.Block__element className='arbitrary-classname'>
      !
    </bem.Block__element>
  </bem.Block>

  // equates to this jsx:

  <ul className="block">
    <li className="block__element">hello</li>
    <li className="block__element block__element--modifier">world</li>
    <li className="block__element block__element--excl1">!</li>
    <li className="block__element arbitrary-classname">!</li>
    <li className="block__element arbitrary-classname">!</li>
  </ul>

*/
import React from 'react';
import cns from 'classnames';
import assign from 'object-assign';
import PropTypes from 'prop-types';

const isString = require('lodash.isstring');


function unpackElementTag ( tagString ) {
  if ( !isString(tagString) ) {
    return tagString;
  }
  let _m = tagString.match(/<(\w+)\s?\/?>/);
  if (_m) {
    return _m[1];
  }
  return tagString;
}

const simpleBemComponent = function ({ baseClass, tag }) {
  return function ( params ) {
    let { children, mkey } = params;
    tag = unpackElementTag( tag || 'div' );

    let subParams = {
      className: baseClass,
    };
    if (mkey) {
      subParams.key = mkey;
      subParams.className += ` ${baseClass}--${mkey}`;
    }
    return React.createElement( tag, subParams, children);
  };
};

const bemComponent = function ({ tag, baseClass }) {
  tag = unpackElementTag(tag);
  const reduceModify = function (s, modifier) {
    if (Object.prototype.toString.call(modifier) === '[object Object]') {
      Object.keys(modifier).forEach(function(key){
        if (modifier[key]) {
          s[`${baseClass}--${key}`] = true;
        }
      });
    } else if (modifier) {
      s[`${baseClass}--${modifier}`] = true;
    }
    return s;
  };
  return function ({ children, className, classNames, mkey, ...props }) {
    let modifier = [].concat(props.m);
    if (mkey) {
      modifier.push(mkey);
      props.key = mkey;
    }
    modifier = modifier.reduce(reduceModify, {});
    delete props.m;

    let compiledClassName = cns(baseClass,
      modifier,
      classNames,
      className,
    );

    props.className = compiledClassName;
    return React.createElement(tag, props, children);
  };
};

export default function bemComponents ( allParams ) {
  return Object.freeze(Object.keys(allParams).reduce(function ( hsh, key ) {
    let params = allParams[key];
    let baseClass, simple, tag;
    if (params === true) {
      params = { baseClass: key };
    } else if ( params instanceof Array ) {
      [ baseClass, tag ] = params;
      params = {
        baseClass,
        tag,
      }
    } else if ( isString(params) ) {
      let _match = params.match(/^<(\S+)\.(\S+)>$/);
      if (_match) {
        console.log(`%c`+`_match`, `text-decoration:underline`, _match);
        [tag, baseClass] = _match.slice(1);
      } else {
        baseClass = params;
        tag = 'div';
      }
      params = {
        baseClass,
        tag,
      };
    }
    ({ baseClass, tag, simple } = params);
    if ( !tag ) {
      tag = 'div';
    }
    if ( !baseClass ) {
      baseClass = key;
    }
    if (simple) {
      hsh[key] = simpleBemComponent({
        baseClass,
        tag,
      });
    } else {
      hsh[key] = bemComponent({
        baseClass,
        tag,
      });
    }
    return hsh;
  }, {}));
}
