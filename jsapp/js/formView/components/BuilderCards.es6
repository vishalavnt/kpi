import React from 'react';
import { bemComponents } from 'js/libs/reactBemComponents';

import RowCard from '../containers/RowCard';
import GroupCard from '../containers/GroupCard';

import DraftRow from './DraftRow';

const bem = bemComponents({
  Builder: 'builder',
});

export class BuilderCards extends React.Component {
  render () {
    let {
      settingsExpanded,
      asset,
      store,
      tx1,
      tx2,
    } = this.props;

    return (
      <bem.Builder>
        {asset.get("order").map(function iter ( identifier ) {
          let isGroup = typeof identifier !== 'string';
          let kuid = identifier;
          let rows;

          if (isGroup) {
            let info = identifier.toJS();
            kuid = Object.keys(info)[0];
            rows = info[kuid];
            return (
                <GroupCard kuid={kuid}
                  key={kuid}
                  store={store}
                  isExpanded={settingsExpanded === kuid}
                  tx1={tx1}
                  tx2={tx2}
                  >
                  {rows.map(iter)}
                </GroupCard>
              )
          } else {
            return (
                <RowCard kuid={kuid}
                  key={kuid}
                  store={store}
                  isExpanded={settingsExpanded === kuid}
                  tx1={tx1}
                  tx2={tx2}
                />
              );
          }
        })}
      </bem.Builder>
    );
  }
}
