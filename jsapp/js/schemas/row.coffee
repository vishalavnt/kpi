LABEL_OPTIONAL_TYPES = ['calculate', 'begin_group', 'begin_repeat',
              'start', 'today', 'end', 'deviceid', 'phone_number',
              'simserial', 'username', 'phonenumber', 'imei',
              'subscriberid']

SELECT_TYPES = ['select_one', 'select_multiple']

MAIN_TYPES = ['text', 'integer', 'decimal', 'email', 'barcode',
              'video', 'image', 'audio', 'date', 'datetime', 'time',
              'location', 'acknowledge', 'note', 'gps', 'geopoint',
              'geoshape', 'geotrace']

MAIN_SCHEMA = {
  'properties': {
    'type': {
      'type': 'string',
      'enum': MAIN_TYPES,
    },
    'name': {
      'type': 'string',
    },
    'label': {
      'type': ['array', 'string']
    },
  },
  'required': ['type'],
}

SELECT_SCHEMA = {
  'properties': {
    'type': {
      'type': 'string',
      'enum': SELECT_TYPES,
    },
    'name': {
      'type': 'string',
    },
    'label': {
      'type': ['array', 'string'],
    },
    'select_from_list_name': {
      'type': 'string',
    },
  },
  'required': ['type', 'name', 'select_from_list_name'],
}

LABEL_OPTIONAL_SCHEMA = {
  'properties': {
    'type': {
      'type': 'string',
      'enum': LABEL_OPTIONAL_TYPES,
    },
    'name': {
      'type': 'string',
    },
  },
  'required': ['type', 'name'],
}


_ROW_SCHEMA = {
    'type': 'object',
    'oneOf': [
      SELECT_SCHEMA,
      MAIN_SCHEMA,
      LABEL_OPTIONAL_SCHEMA,
      {
        'properties': {
          'type': {
            'type': 'string',
            'enum': [
              'end_group',
              'end_repeat',
            ]
          }
        }
      }
    ]
  }

_ALL_ROW_COLUMNS = [
  'name',
  'type',
  'default',
  'required',
  'label',
  'kuid',
  'appearance',
]

_props = {}
for col in _ALL_ROW_COLUMNS
  _props[col] = {
    type: [
      'string',
      'boolean',
      'array',
      'object',
    ]
  }

_ALL_PROPS = {
  type: 'object'
  properties: {
    name: {
      type: ['string']
    }
    type: {
      type: ['string']
    }
    default: {
      type: ['string', 'array']
    }
    required: {
      type: ['string', 'array', 'boolean']
    }
    label: {
      type: ['string', 'object']
    }
    $kuid: {
      type: ['string']
    }
  }
  # required: ['$kuid', 'type']
}

ROW_SCHEMA = {
  'type': 'object',
  'allOf': [
    _ALL_PROPS,
    _ROW_SCHEMA,
  ]
}

module.exports = ROW_SCHEMA