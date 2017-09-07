import {rowGrouper} from 'js/model/utils/rowGrouper';
import $configs from 'xlform/model.configs';
import {
  Map,
  Record,
  Collection,
  List,
  OrderedMap,
  fromJS,
} from 'immutable';

window.OrderedMap = OrderedMap;
import _ from 'underscore';

// window._ajv = ajv;

import validators from 'js/validators';

console.log("%c"+"validators", "text-decoration:underline", validators);

console.log("%c"+"validators", "text-decoration:underline", validators);

const META_TYPES = $configs.surveyDetailSchema.typeList();
const KUID = '$kuid';
const ROWS_KEY = '__rows';
const TXID_KEY = '$id';

import { txtid } from 'xlform/model.utils'

import { isObject } from 'js/utils';


export function swapTxValues (state, what, towhat) {
  let other = what === 'tx1' ? 'tx2' : 'tx1';
  if (!state[what] && (state[other] === towhat)) {
    return {...state};
  }
  if (towhat !== state[other]) {
    return {
      ...state,
      [what]: towhat,
    }
  } else {
    return {
      ...state,
      [other]: state[what],
      [what]: towhat,
    };
  }
}

class Valued {
  constructor (data) {
    this._data = data;
    this.key = this._data.$kuid;
    this.type = this._data.type;
  }
  getTranslation (field, translation) {
    let txid = translation.$id;
    if (translation === undefined) {
      return new Error('Must supply a translation with an id: `$id`')
    }
    if (this._data[field]) {
      return this._data[field].txid(txid);
    } else {
      log('field not found', field, this);
    }
  }
  has (field) {
    if (this.isTranslated(field)) {
      return Object.keys(field).length > 0;
    }
    return (field in this._data) && this._data[field];
  }
  get (field) {
    let val = this._data[field];
    let isTranslated = isObject(val);
    if (isTranslated) {
      throw new Error('cannot get untranslated value for this field');
    }
    return val;
  }
  isTranslated (field) {
    return this._data[field] instanceof TranslatedValue
  }
}

class TranslatedValue {
  constructor (values, {row, field, survey}) {
    this._values = values;
    // Object.assign(this, values);
    this._context = {row, field, survey};
  }
  txid (txid) {
    return this._values[txid];
  }
}

class XPathStructure {
  constructor (values, {row, field, survey}) {
    this.values = values;
    this._context = {row, field, survey};
  }
}

class Row extends Valued {
}

class Group extends Valued {
  constructor (data, {initRow}) {
    super(data);
    this.rows = [];
    if (data[ROWS_KEY]) {
      let _rows = data[ROWS_KEY];
      delete data[ROWS_KEY];
      _rows.forEach((_r) => {
        this.rows.push(initRow(_r, this));
      });
    }
  }
  get isGroup () {
    return true;
  }
}

// window.knownKeys = [];

function parseValues ({ row, survey }) {
  for (let field in row) {
    if (row.hasOwnProperty(field)) {
      if (field === ROWS_KEY) {
        continue;
      }
      let value = row[field];
      if (field.match(/^\$/)) {
        continue;
      }

      //   // skip $kuid, $autoname
      // } else if (_.isArray(value)) {
      //   row[field] = new XPathStructure(value, {row, field, survey});
      // } else if (_.isObject(value)) {
      //   row[field] = new TranslatedValue(value, {row, field, survey});
      // }
      // if (knownKeys.indexOf(field) === -1) {
      //   knownKeys.push(field);
      // }
    }
  }
}

function isGroup (row) {
  return ROWS_KEY in row;
}

export class EmptyServerAsset {
  constructor() {
    this.isEmpty = true;
  }
}

const TRANSLATION_STATS = '#TRANSLATION_STATS';


// a few colors samples from the material design
// color palette:
const COLORS = ('673ab7 f44336 3f51b5 2196f3' +
  ' 009688 00bcd4 03a9f4 4caf50 cddc39 8bc34a' +
  ' ffeb3b ffc107 ff9800 795548 ff5722 607d8b').split(' ');


function fisherYates (arr) {
  var i = arr.length,
    j, tmpI, tmpJ;
  if (i === 0) { return false; }
  while (--i) {
    j = Math.floor(Math.random() * (i+1));
    tmpI = arr[i];
    tmpJ = arr[j];
    arr[i] = tmpJ;
    arr[j] = tmpI;
  }
  return arr;
}

function ensureKuids(content) {
  if (!content.has('kuids')) {
    let kuids = content.get('survey').reduce(function (kuids, row) {
      let kuid = row[KUID];
      if (kuid) {
        kuids[kuid] = row;
      }
      return kuids;
    }, {});
    content = content.set('kuids', fromJS(kuids));
  }
  return content;
}

function convertTxListsToOrderedMap(map) {
  let txs = map.get('translations').reduce(function (omap, tx){
    let $id = tx.get('$id');
    return omap.set($id, tx);
  }, new OrderedMap());
  return map.set('translations', txs);
}

export function makeServerAsset (content) {
  // console.log('JSON.stringify(content, null, 4)', JSON.stringify(content, null, 4));
  content.surveyCopy = fromJS(content);
  content.kuids = fromJS(content.survey.reduce(function iter (kuids, row) {
    let kuid = row[KUID];
    if (kuid) {
      kuids[kuid] = row;
    }
    // if (row.select_from_list_name) {
    //   row['choices'] = `#/choices/${row.select_from_list_name}`
    // }
    return kuids;
  }, {}));

  if (content.choices instanceof Array) {
    content.choices = fromJS(content.choices.reduce((hsh, choice)=>{
      let { list_name } = choice;
      if (!hsh[list_name]) {
        hsh[list_name] = [];
      }
      hsh[list_name].push(choice)
      return hsh;
    }, {}));
  }

  content.order = rowGrouper(content.survey).map(function initRow (row) {
    if (isGroup(row)) {
      return new Group(row, {
        initRow,
        survey: content,
      });
    } else {
      return new Row(row);
    }
  }).map(function iterGrouped (row) {
    if (row.isGroup) {
      return {[row.key]: row.rows.map(iterGrouped)};
    }
    return row.key;
  });

  let availableColors = fisherYates([...COLORS]);
  content.translations = content.translation_list.reduce((list, tx)=>{
    if (!tx.color) {
      tx.color = availableColors.pop();
    }
    let txid = tx[TXID_KEY];
    tx[TXID_KEY] = undefined;
    return list.set(txid, fromJS(tx));
  }, new OrderedMap());

  delete content.translation_list;
  let _mapped = fromJS(content);
  return new ServerAsset(_mapped);
}

import diff from 'immutablediff';


// class Ass

export class ServerAsset {
  constructor (map, savePoint=false) {
    this.warnings = [];

    if (map instanceof ServerAsset) {
      return map;
    }
    if (!Map.isMap(map)) {
      map = fromJS(map);
    }
    this.validate('base', map.toJS());
    let choiceListNames = [];
    map.get('choices').forEach((val, key) => {
      this.validate('choiceList', val.toJS(), {
        list_name: `choices: ${key}`
      });
    });
    map = ensureKuids(map);

    if (List.isList(map.get('translations'))) {
      map = convertTxListsToOrderedMap(map);
    }

    if (!map.has('choices')) {
      map = map.set('choices', new Map());
    }

    this.savePoint = savePoint || this;

    // an effective way to subclass immutable structure without going
    if (!map.has(TRANSLATION_STATS)) {
      map = map.set(TRANSLATION_STATS, this._translationStats(map));
    }

    const asset = this;
    ['set', 'delete', 'update', 'merge', 'mergeDeep'].forEach((fn1)=>{
      ['', 'In'].forEach(function (fn2) {
        asset.makeFn(fn1 + fn2, true);
      });
    });
    ['get', 'getIn', 'toJS'].forEach(function ( fnName ) {
      asset.makeFn(fnName, false);
    });

    this._map_ = map;

    this.get('translations').entrySeq().forEach(([txid, tx], i)=>{
      this.validate('translations', tx.toJS(), {
        translation_index: i,
      });
    });
  }
  validate (validatorName, _doc, context) {
    const validator = validators[validatorName](context);
    console.log("%c"+"validator", "text-decoration:underline", validator);
    console.log("%c"+"validator(_doc)", "text-decoration:underline", validator(_doc));
    console.log("%c"+"validator(_doc)", "text-decoration:underline", validator(_doc));
    if (!validator(_doc)) {
      this.warnings = [...this.warnings, ...validator.errors];
      this.valid = false;
    }
    // this.get('translations').entrySeq().forEach(([txid, tx])=>{
    //   validators.translations(tx);
    //   // console.log("%c"+"txid, tx", "text-decoration:underline", txid, tx);
    //   // console.log("%c"+"validators.translations", "text-decoration:underline", validators.translations);
    // });
    // return valid;
  }
  choices ({ $kuid }) {
    let row = this.getIn(['kuids', $kuid]);
    let choiceId = this.getIn(['kuids', $kuid]).get('select_from_list_name')
    return this.getIn(['choices', choiceId]);
  }
  static create (content) {
    return makeServerAsset(content);
  }
  static minimal (content) {
    ['settings', 'choices', 'meta'].forEach((key)=>{
      if (!content[key]) {
        content[key] = {};
      }
    });
    ['survey', 'translations'].forEach((key)=>{
      if (!content[key]) {
        content[key] = [];
      }
    });
    return new ServerAsset(content);
  }
  makeFn (fnName, wrapConstructor) {
    this[fnName] = (...args) => {
      const _map = this._map_;
      let result = _map[fnName].apply(_map, args);
      if (wrapConstructor) {
        return new ServerAsset(result, this.savePoint);
      }
      return result;
    }
  }
  addTranslation ({ name, code, $id }) {
    if (!$id) {
      $id = `t${txtid().slice(0, 3)}`;
    }
    let txs = this.get('translations');
    txs = txs.set($id, fromJS({ name, code, $id }));
    return this.set('translations', txs);
  }
  disableTranslation ({ $id }) {
    return this.setIn(['translations', $id, 'disabled'], true);
  }
  diffSinceSavePoint () {
    let makeOrderDiffable = (mp) => {
      return mp.set('order', this.flattenOrder(mp.get('order')))
    }
    return diff(this.savePoint._map_, this._map_);
  }
  _translationStats (map) {
    let stats = {};
    let txIds = [];
    this._tlist(map).forEach(function ({ $id }) {
      stats[$id] = {
        total: 0,
        completed: 0,
      };
      txIds.push($id);
    });

    map.get('kuids').forEach((row, kuid) => {
      row.forEach((val, _type)=>{
        if (Map.isMap(val)) {
          txIds.forEach((txid) => {
            stats[txid].total++;
            if (val.get(txid)) {
              stats[txid].completed++;
            }
          });
        }
      });
    });
    return fromJS(stats);
  }
  addRow ({ type, name, kuid, ...props }) {
    if (!kuid) {
      kuid = txtid();
    }
    return new ServerAsset(
      this._map_
      .setIn(['kuids', kuid], {
          type,
          name,
          ...props,
        })
      .update('order', (arr)=> arr.push(kuid))
      ,
      this.savePoint
    );
  }
  moveRow ({ kuid, position }) {
    let path = this.paths[kuid];
    let index = path.pop();
    let parent = this.getIn(['order', ...path]);
    let newIndex = position.pop();
    let newPath = position;
    let map = this._map_
              .setIn(['order', ...path], parent.delete(index))
              .updateIn(['order', ...newPath],
                        (list)=> list.insert(newIndex, kuid));
    return new ServerAsset(map, this.savePoint);
  }
  groupRows () {

  }
  updateMeta ({ field, value, _kuid }) {
    let _field = this.getIn(['meta', field]) || fromJS({
      name: field,
      $kuid: _kuid || `fld${Math.floor(Math.random() * 10000)}`,
    });
    if (value && _field.get('disabled')) {
      _field = _field.delete('disabled');
    } else if (!value && !_field.get('disabled')) {
      _field = _field.set('disabled', true);
    }
    return this.setIn(['meta', field], _field);
  }
  flattenOrder (order) {
    let out = {};
    let prev = false;
    order.toJS().forEach((kuid) => {
      out[kuid] = {'$prev': prev};
      prev = kuid;
    });
    return fromJS(out);
  }
  getPaths (order) {
    let paths = {};
    function withList (path) {
      return function (identifier, n) {
        if (isObject(identifier)) {
          let kuid = Object.keys(identifier)[0];
          let rows = identifier[kuid];
          rows.forEach(withList(path.push(n).push(kuid)));
        } else {
          paths[identifier] = path.push(n).toJS();
        }
      }
    }
    order.toJS().forEach(withList(new List()));
    return paths;
  }
  get paths () {
    if (!this._paths_) {
      this._paths_ = this.getPaths(this.get('order'));
    }
    return this._paths_;
  }
  deleteRow ({ kuid }) {
    return this.deleteKuid({ kuid });
  }
  deleteKuid ({ kuid }) {
    let path = this.paths[kuid];
    let index = path.pop();
    let parent = this.getIn(['order', ...path]);
    return this.setIn(['order', ...path], parent.delete(index));
  }
  get translationList () {
    if (!this._translationList_) {
      this._translationList_ = this._tlist(this._map_);
    }
    return this._translationList_;
  }
  _tlist (tt) {
    return tt.get('translations').map((tx, $id) => {
      return {
        ...tx.toJS(),
        $id,
      };
    });
  }
  reducedMeta () {
    let meta = this.get('meta');
    if (!meta._reduced) {
      meta._reduced = Object.keys(meta.toJS()).reduce((hsh, key) => {
        let metaEntry = this.getIn(['meta', key]);
        if (metaEntry) {
          metaEntry = metaEntry.toJS();
        } else {
          return hsh;
        }
        hsh[key] = !metaEntry.disabled;
        return hsh;
      }, {});
    }
    return meta._reduced;
  }
}
