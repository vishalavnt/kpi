import React from 'react';
import Select from 'react-select';
import autoBind from 'react-autobind';

import bemComponents from 'js/libs/bem-components';
import { t } from 'js/utils';

import { LANGUAGES } from 'js/static/languages';

require('./Translations.scss');

const bem = bemComponents({
  Txs: 'txs',
  Txs__tx: 'txs__tx',
  Txs__field: 'txs__field',
  Txs__statusitem: 'txs__statusitem',
  Txs__button: ['txs__button', '<button>'],
  Txs__indicator: 'txs__indicator',
});

const LANGUAGE_FIELDS = LANGUAGES.map(({ nativeName, name, code })=>{
  return {
    label: `${code} (${name})`,
    value: code,
  }
});


class TranslationBar extends React.Component {
  constructor (props) {
    super(props);
    autoBind(this);
  }
  render () {
    let { percent, left, description, color } = this.props;
    return (
      <bem.Txs__statusitem m={['bar', 'color', color]}>
        <bem.Txs__statusitem m={'line'} style={{ width: `${percent}%` }}>
          <bem.Txs__statusitem m={['text', 'text-inner']}>
            {description}
          </bem.Txs__statusitem>
        </bem.Txs__statusitem>
        <bem.Txs__statusitem m={['text', 'text-outer']}>
          {description}
        </bem.Txs__statusitem>
      </bem.Txs__statusitem>
    );
  }
}

export class TranslationIndicator extends React.Component {
  render () {
    return (
        <bem.Txs__indicator {...this.props}>
        </bem.Txs__indicator>
      )
  }
}


class Translation extends React.Component {
  constructor () {
    super();
    this.state = {};
    autoBind(this);
  }
  setActive () {
    let { showTranslation, id } = this.props;
    let txid = id;
    showTranslation({ txid });
  }
  setSecondary () {
    let { showTranslation, id } = this.props;
    let txid = id;
    showTranslation({ txid, secondary: true });
  }
  onTxCodeChange (changes) {
    let { id, onTxCodeChange } = this.props;
    onTxCodeChange({
      ...changes,
      id,
    });
  }
  render () {
    let {
      id,
      name,
      code,
      color,
      isActive,
      isSecondary,
      onChange,
      setActive,
      setSecondary,
      txStats,
    } = this.props;

    let total = txStats.get('total'),
      completed = txStats.get('completed'),
      pct = completed === 0 ? '0' : Math.floor((100*completed)/total);
    return (
        <bem.Txs__tx key={id} m={{
          '1': isActive,
          '2': isSecondary,
        }}>
          <bem.Txs__field key={'color'} m={['color', color]} />
          <bem.Txs__field key={'name'} m={{ name: true, notset: !name }}>
            {name || 'unnamed'}
          </bem.Txs__field>
          <bem.Txs__field key={'code'} m={{ code: true, notset: !code, [color]: true }}>
            { code || 'code' }
          </bem.Txs__field>
          <bem.Txs__field key='set-tx1' m={['button', 'tx1', { 'selected': isActive }]}
              onClick={this.setActive}>
            {t(`1`)}
          </bem.Txs__field>
          <bem.Txs__field key='set-tx2' m={['button', 'tx2', { 'selected': isSecondary }]}
              onClick={this.setSecondary}>
            {t(`2`)}
          </bem.Txs__field>
          <TranslationBar {...{
            percent: pct,
            description: `${pct}% translated (${completed}/${total})`,
            color,
          }} />
        </bem.Txs__tx>
      )
  }
}

class Translations extends React.Component {
  constructor (props) {
    super(props);
    this.state = {};
    autoBind(this);
  }
  onTxCodeChange ({ label, value }) {
    console.log('label, value', label, value);
    // let { txid, field } = evt.target.dataset;
    // log('txchange', txid, field, this, this.props);
  }
  setActiveTranslation (evt) {
    let { txid } = evt.target.dataset;
    let { showTranslation } = this.props;
    showTranslation({ txid });
  }
  setSecondaryTranslation (evt) {
    let { txid } = evt.target.dataset;
    let { showTranslation } = this.props;
    showTranslation({ txid, secondary: true });
  }
  render () {
    let { asset, builder: { tx1, tx2 }, showTranslation } = this.props;
    let txs = asset.get('translations');
    let txStats = asset.get('#TRANSLATION_STATS');
    // debugger

    return (
        <bem.Txs>
          {
            asset.translationList.map(({ $id, name, color }) => {
              return (
                  <Translation
                    id={$id}
                    key={$id}
                    color={color}
                    name={name}
                    txStats={txStats.get($id)}
                    isActive={ $id === tx1 }
                    isSecondary={ $id === tx2 }
                    onChange={this.txChange}
                    onTxCodeChange={this.onTxCodeChange}
                    showTranslation={showTranslation}
                  />
                );
            })
          }
        </bem.Txs>
      );
  }
}

export default Translations;
