import Ajv from 'ajv';
import _ from 'underscore';

const ajv = new Ajv();
// ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

import schemas from 'js/schemas';

let validators = {};

export default Object.keys(schemas).reduce(function(validators, schemaName){
  // console.log('%c'+'schemaName, schemas', 'text-decoration:underline', schemaName, schemas);
  let skema = schemas[schemaName];
  let getValidator;
  if (!_.isFunction(skema)) {
    getValidator = function (params) {
      return function (content) {
        return ajv.compile(skema)(content);
      }
    }
  } else {
    getValidator = function (params) {
      return function (content) {
        return ajv.compile(skema)(content)
      }
    }
  }
  validators[schemaName] = getValidator;
  return validators;
}, {
  schemas,
});
