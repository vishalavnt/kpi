import React from 'react';
import autoBind from 'react-autobind';
import { connect } from 'react-redux'
import bemComponents from 'js/libs/bem-components';

const bem = bemComponents({
  Group: 'group',
  Group__header: 'group__header',
  Group__name: 'group__name',
  Group__rows: 'group__rows',
  Group__label: 'group__label',
});


class KoboMatrixMixin {
  constructor (parent) {
    log('here')
    this.group = parent.state.group;
  }
  abc () {
    console.log('xyz');
  }
  render () {
    return (
        <p>I am a group</p>
      )
  }
}


class GroupCard extends React.Component {
  constructor (props) {
    super(props);
    let { kuid, asset } = props;
    const group = asset.getIn(['kuids', kuid]);
    this.state = { group };
    autoBind(this);
  }
  render () {
    let { kuid, builder: { tx1, tx2 }, children } = this.props;
    let { group } = this.state;
    let hasLabel = group.has('label');
    return (
        <bem.Group>
          <bem.Group__header>
            <bem.Group__label key={'type'} m={'type'}>
              {group.get('type')}
            </bem.Group__label>

            { hasLabel ?
              <bem.Group__label m={'tx1'}>
                {group.getIn(['label', tx1])}
              </bem.Group__label>
            : null }
            { (hasLabel && tx2) ?
              <bem.Group__label m={'tx2'}>
                {group.getIn(['label', tx2])}
              </bem.Group__label>
            : null }
          </bem.Group__header>
          <bem.Group__rows>
            {children}
          </bem.Group__rows>
        </bem.Group>
      );
  }
}

class KoboMatrixCard extends GroupCard {
  render () {
    let { kuid, builder: { tx1, tx2 }, children } = this.props;
    let { group } = this.state;
    let hasLabel = group.has('label');
    return (
        <bem.Group>
          <bem.Group__header>
            <bem.Group__label key={'type'} m={'type'}>
              {group.get('type')}
            </bem.Group__label>

            { hasLabel ?
              <bem.Group__label m={'tx1'}>
                {group.getIn(['label', tx1])}
              </bem.Group__label>
            : null }
            { (hasLabel && tx2) ?
              <bem.Group__label m={'tx2'}>
                {group.getIn(['label', tx2])}
              </bem.Group__label>
            : null }
          </bem.Group__header>
        </bem.Group>
      );
  }
}

GroupCard.by_type = {
  begin_kobomatrix: KoboMatrixCard,
};


const mapStateToProps = (state, ownProps) => {
  let { asset, builder } = state;
  return {
    asset,
    builder,
  };
}

export default connect(mapStateToProps, {})(GroupCard);
