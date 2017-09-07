import React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux'
import { bemComponents } from 'js/libs/reactBemComponents';

import TypeIcon from '../components/TypeIcon';
import CardSettings from '../components/CardSettings';

import {
  deleteCard,
  copyRow,
  toggleSettings,
  popupConfirmAction,
} from '../actions';

const bem = bemComponents({
  Card: 'card',
  Card__header: 'card__header',
  Card__name: 'card__name',
  Card__label: 'card__label',
  Card__indicator: 'card__indicator',
  Card__indicator__icon: 'card__indicator__icon',
  Card__buttons: 'card__buttons',
  Card__buttons__button: 'card__buttons__button',

  Card__options: 'card--selectquestion__expansion',
  Card__settings: ['card__settings', '<section>'],
  Card__closebutton: ['card__settings-close', '<i>'],
  Card__settingstabs: ['card__settings__tabs', '<ul>'],
  Card__settingstabs__tab: ['card__settings__tabs__tab', '<li>'], 
  Card__settings__content: 'card__settings__content',
  Card__settings__fields: ['card__settings__fields', '<ul>'],

  Multioptions__option: ['multioptions__option', '<li>'],
  Multioptions__label: 'multioptions__label',
});


const TAB_IDS = [
  'options',
  'skipLogic',
  'validation-criteria',
  'responseType',
];


class RowCard extends React.Component {
  constructor (props) {
    super(props);
    let { kuid, asset } = props;
    let row = asset.getIn(['kuids', kuid]);
    let choices = asset.choices({ $kuid: kuid });

    window.asset = asset;

    this.state = {
      row,
      choices,
      translations: asset.get('translations'),
    };
    autoBind(this);
  }
  toggleSettings () {
    let { toggleSettings, kuid, isExpanded } = this.props;
    toggleSettings({ kuid: isExpanded ? false : kuid });
  }
  delete () {
    let { kuid } = this.props;
    // deleteCard is not pulled from props. It is not wrapped
    // in a dispatch fn
    popupConfirmAction({
      action: deleteCard({ kuid }),
    });
  }
  copy () {
    let { copyRow, kuid } = this.props;
    copyRow({ kuid });
  }
  addToLibrary () {
    let { addToLibrary, kuid } = this.props;
    addToLibrary({ kuid });
  }
  render () {
    let { kuid, builder: { tx1, tx2 }, isExpanded } = this.props;
    let { row, choices } = this.state;
    let name = row.get('name', row.get('$kuid'));
    let type = row.get('type');


    let tabs = [
      {label: 'Question Options', id: 'options'},
      {label: 'Skip Logic', id: 'skipLogic'},
      {label: 'Validation Criteria', id: 'validation-criteria'},
      // {label: 'Response Type', id: 'responseType'},
    ];
    let viewTab = 'options';

    return (
        <bem.Card m={{ 'expanded-settings': isExpanded }}>
          <bem.Card__header>
            <bem.Card__indicator>
              <bem.Card__indicator__icon>
                <TypeIcon type={row.get('type')} />
              </bem.Card__indicator__icon>
            </bem.Card__indicator>
            {/*
            <bem.Card__name>{`#${name}`}</bem.Card__name>
            */}
            <bem.Card__label m={'1'}>
              {tx1 ? row.getIn(['label', tx1]) : 'no tx selected'}
            </bem.Card__label>
            {tx2 ? (
              <bem.Card__label m={'2'}>
                {row.getIn(['label', tx2])}
              </bem.Card__label>
            ) : null }
            <bem.Card__buttons>
              <bem.Card__buttons__button m={['settings', 'gray']} onClick={this.toggleSettings}>
                <i className="fa fa-cog" />
              </bem.Card__buttons__button>
              <bem.Card__buttons__button m={['delete', 'red']} onClick={this.delete}>
                <i className="fa fa-trash-o" />
              </bem.Card__buttons__button>
              <bem.Card__buttons__button m={['copy', 'blue']} onClick={this.copy}>
                <i className="fa fa-copy" />
              </bem.Card__buttons__button>
              <bem.Card__buttons__button m={['add', 'gray-green']} onClick={this.addToLibrary}>
                <i className="fa fa-folder-o"><i className="fa fa-plus" /></i>
              </bem.Card__buttons__button>
            </bem.Card__buttons>
          </bem.Card__header>
          { choices ?
            <bem.Card__options>
              <ul>
                {choices.map((choice)=>{
                  return (
                    <bem.Multioptions__option key={choice.get('$kuid')}>
                      <bem.Multioptions__label m={'tx1'}>
                        {choice.getIn(['label', tx1])}
                      </bem.Multioptions__label>
                      { tx2 ?
                        <bem.Multioptions__label m={'tx2'}>
                          {choice.getIn(['label', tx2])}
                        </bem.Multioptions__label>
                      : null }
                    </bem.Multioptions__option>
                  )
                })}
              </ul>
            </bem.Card__options>
          : null}
          { isExpanded ?
            <bem.Card__settings>
              <bem.Card__closebutton
                className={'fa fa-times'}
                onClick={this.toggleSettings}
              />
              <bem.Card__settingstabs>
                <li className='heading' key={'heading'}>
                  <i className={'fa fa-cog'} />
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
          : null}
          {/* isExpanded ?
            <CardSettings viewTab={TAB_IDS[n++]}
              item={row}
            />
          : null */}
        </bem.Card>
      );
  }
}

const mapStateToProps = (state, ownProps) => {
  let { asset, builder } = state;
  return {
    asset,
    builder,
  };
};

export default connect(mapStateToProps, {
  copyRow,
  toggleSettings,
})(RowCard);
