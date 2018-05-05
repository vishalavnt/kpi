import React from 'react';
// import Select from 'react-select';
// import autoBind from 'react-autobind';
import PropTypes from 'prop-types';


import bemComponents from 'js/libs/bem-components';
import { t } from 'js/utils';


const bem = bemComponents({
  Row: 'row',
  Row__questiontypes__close: ['row__questiontypes__close', '<button>'],
  Row__questiontypes: 'row__questiontypes',
  Row__questiontypes__list: 'row__questiontypes__list'
});


class DraftRow extends React.Component {
  render () {
    let {
      cancelRowDraft,
    } = this.props;
    return (
        <bem.Row style={{ position: 'relative' }}>
          <bem.Row__questiontypes>
            <bem.Row__questiontypes__close
              onClick={cancelRowDraft}>
            </bem.Row__questiontypes__close>
            <input className={'row__questiontypes__new-question-name'} />
            <bem.Row__questiontypes__list>
            </bem.Row__questiontypes__list>
          </bem.Row__questiontypes>
        </bem.Row>
      );
  }
}

export default DraftRow;