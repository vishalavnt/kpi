CX_SCHEMA = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "description": "",
  "type": "object",
  "properties": {
    "list_name": {
      "type": "string",
      "minLength": 1
    },
    "value": {
      "type": "string",
      "minLength": 1
    },
    "label": {
      "type": "object",
      "properties": {},
      "required": []
    }
  }
}



module.exports = (txids=[])->
  CX_SCHEMA