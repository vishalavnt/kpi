import React from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';
import deepFreeze from 'deep-freeze';
import autoBind from 'react-autobind';

import bemComponents from 'js/libs/bem-components';
import {t} from 'js/utils';

/*
The main component of this file, "MetaEditor" receives two
props:
 - meta (an object, e.g. {start: true, username: false})
 - onChange (a callback which gets called when the value changes)
*/
const META_FIELDS = deepFreeze([
  ['start', 'end', 'today', 'deviceid'],
  ['username', 'simserial', 'subscriberid', 'phonenumber'],
]);

const bem = bemComponents({
  FormMeta: 'form-meta',
  FormMeta__content: 'form-meta__content',
  FormMeta__button: 'form-meta__button',
});

class MetaEditor extends ImmutablePureComponent {
  constructor (props) {
    super(props);
    autoBind(this);
  }
  valueChange (evt) {
    let field = evt.target.id;
    let value = !!evt.target.checked;
    this.props.onMetaChange({ field, value });
  }
  render () {
    let metaData = t('none (0 metadata specified)');
    let { onToggle, expanded, onChange, meta } = this.props;
    return (
        <bem.FormMeta>
          <bem.FormMeta__button m={'expand'} onClick={onToggle}>
            <i />
          </bem.FormMeta__button>
          { expanded ?
            (
              <IndividualMetaEditor 
                onCheckboxChange={this.valueChange}
                meta={meta}
              />
            ) : (
              <bem.FormMeta__button m={'metasummary'} onClick={onToggle}>
                {t('metadata:')}
                {metaData}
              </bem.FormMeta__button>
            )
          }
        </bem.FormMeta>
      )
  }
}

class IndividualMetaEditor extends React.Component {
  render () {
    return (
      <div className="mdl-grid">
        {META_FIELDS.map((fieldList, colnum)=>{
          return (
            <div className="mdl-cell mdl-cell--4-col" key={`settings-${colnum}`}>
              {fieldList.map((mtype) => {
                return (
                    <div className="form-group" key={mtype}>
                      <input type="checkbox" id={mtype}
                        checked={!!this.props.meta[mtype]}
                        onChange={this.props.onCheckboxChange}
                      />
                      <label htmlFor={mtype}>
                        {t(mtype)}
                      </label>
                    </div>
                  );
              })}
            </div>
          );
        })}
      </div>
    );
  }
}

export default MetaEditor;
