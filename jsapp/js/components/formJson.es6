import reactMixin from 'react-mixin';
import React from 'react';
import Reflux from 'reflux';
import autoBind from 'react-autobind';
import stores from 'js/stores';
import actions from 'js/actions';
import ui from 'js/ui';
import bem from 'js/bem';

export class FormJson extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      assetcontent: false
    };
    autoBind(this);
  }
  componentDidMount () {
    this.listenTo(stores.asset, this.assetStoreTriggered);
    actions.resources.loadAsset({id: this.props.params.assetid});

  }
  assetStoreTriggered (data, uid) {
    this.setState({
      assetcontent: data[uid].content
    });
  }
  render () {
    let content = JSON.parse(JSON.stringify(this.state.assetcontent));
    function indentSection(key){
      let str, obj = {};
      if (key) {
        obj[key] = content[key];
        str = JSON.stringify(obj, null, 2);
        delete content[key];
      } else {
        str = JSON.stringify(content, null, 2);
      }
      str = str.replace(/^\{.*\n/, '')
               .replace(/\n\}$/, '');
      return str;
    }
    if (!this.state.assetcontent) {
      return null;
    }
    return (
        <ui.Panel>
          <bem.FormView>
            <pre>
            <code>
              {"{\n"}
              {[
                indentSection("settings"),
                indentSection("survey"),
                indentSection("choices"),
                indentSection()
                ].join(',\n')}
              {"\n}"}
            </code>
            </pre>
          </bem.FormView>
        </ui.Panel>
      );
  }
};

reactMixin(FormJson.prototype, Reflux.ListenerMixin);