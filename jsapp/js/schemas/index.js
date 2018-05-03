const translations = {
  '$schema': 'http://json-schema.org/draft-04/schema#',
  'description': '',
  'type': 'object',
  'properties': {
    '$id': {
      'type': 'string',
      'minLength': 1
    },
    'name': {
      'type': 'string',
      'minLength': 1
    },
    'code': {
      'type': 'string',
      'minLength': 1
    },
    'order': {
      'type': 'number'
    }
  },
  'required': [
    '$id'
  ]
};

// const row = {
//   "type": "array",
//   "$schema": "http://json-schema.org/draft-04/schema#",
//   "description": "",
//   "minItems": 0,
//   "uniqueItems": true,
//   "items": {
//     "type": "object",
//     "required": [
//       "$kuid",
//       "type",
//     ],
//     "properties": {
//       "$kuid": {
//         "type": "string",
//         "minLength": 6
//       },
//       "select_from_list_name": {
//         "type": "string",
//         "minLength": 1
//       },
//       "type": {
//         "type": "string",
//         "minLength": 1
//       }
//     }
//   }
// }


const base = {
  '$schema': 'http://json-schema.org/draft-04/schema#',
  'description': '',
  'type': 'object',
  'properties': {
    'meta': {
      'type': 'object',
      'properties': {}
    },
    'survey': {
      'type': 'array',
      'uniqueItems': true,
      // 'minItems': 1,
      'items': {
        'properties': {}
      }
    },
    'settings': {
      'type': 'object',
      'properties': {}
    },
    'choices': {
      'type': 'object',
      'properties': {}
    },
    'translations': {
      'type': 'array',
      'items': {
        'properties': {}
      }
    }
  },
  'required': [
    'meta',
    'survey',
    'settings',
    'choices',
    'translations'
  ]
};


export default {
  row: require('./row'),
  choiceList: require('./choiceList'),
  base,
  translations,
}