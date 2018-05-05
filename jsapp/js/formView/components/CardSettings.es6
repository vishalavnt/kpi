import React from 'react';
// import Select from 'react-select';
// import autoBind from 'react-autobind';
import PropTypes from 'prop-types';


import bemComponents from 'js/libs/bem-components';
import { t } from 'js/utils';

const bem = bemComponents({
  Card__settings: ['card__settings', '<section>'],
  Card__closebutton: ['card__settings-close', '<i>'],
  Card__settingstabs: ['card__settings__tabs', '<ul>'],
  Card__settingstabs__tab: ['card__settings__tabs__tab', '<li>'], 
  Card__settings__content: 'card__settings__content',
  Card__settings__fields: ['card__settings__fields', '<ul>']
});

const TAB_IDS = [
  'options',
  'skipLogic',
  'validation-criteria',
  'responseType',
];


class CardSettings extends React.Component {
  render () {
    let {
      toggleSettings,
      viewTab,
    } = this.props;

    let tabs = [
      {label: 'Question Options', id: 'options'},
      {label: 'Skip Logic', id: 'skipLogic'},
      {label: 'Validation Criteria', id: 'validation-criteria'},
      {label: 'Response Type', id: 'responseType'},
    ];

    return (
        <bem.Card__settings>
          <bem.Card__closebutton
            className={'fa fa-times'}
            onClick={toggleSettings}
          />
          <bem.Card__settingstabs>
            <li className='heading' key={'heading'}>
              {'Settings'}
            </li>
            {tabs.map(function({ id, label }){
              let isActive = id === viewTab;
              return (
                  <bem.Card__settingstabs__tab key={id}
                      m={{ [id]: true, active: isActive }}>
                    {label}
                  </bem.Card__settingstabs__tab>
                );
            })}
          </bem.Card__settingstabs>
          <bem.Card__settings__content>
            <bem.Card__settings__fields m={'options'}>
              {'Question options'}
            </bem.Card__settings__fields>
          </bem.Card__settings__content>
        </bem.Card__settings>
      );

  }
}

CardSettings.propTypes = {
  viewTab: PropTypes.oneOf(TAB_IDS).isRequired,
};

export default CardSettings;