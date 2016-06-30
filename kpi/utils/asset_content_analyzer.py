import re
import json

import pyxform

# possibly pull these aliases from pyxform
GEO_TYPES = ['gps', 'geopoint', 'geoshape', 'geotrace',]
_unlisted_meta_types = ['username']
META_QUESTION_TYPES = pyxform.constants.XLSFORM_METADATA_TYPES | set(_unlisted_meta_types)

class AssetContentAnalyzer(object):
    def __init__(self, *args, **kwargs):
        self.survey = kwargs.get('survey')
        self.settings = kwargs.get('settings', False)
        self.choices = kwargs.get('choices', [])
        self.pyxform_feedback = self._run_through_pyxform(kwargs.get('xlsform_content'))
        self.summary = self.get_summary()

    def _run_through_pyxform(self, source):
        warnings = []
        default_name = None
        default_language = u'default'
        # settingslist
        if 'settings' in source and len(source['settings']) > 0:
            settings = source['settings'][0]
        else:
            settings = {}
        settings.setdefault('id_string', 'xform_id_string')
        default_form_title = 'Untitled'
        settings.setdefault('form_title', default_form_title)
        source['settings'] = [settings]
        try:
            dict_repr = pyxform.xls2json.workbook_to_json(
                source, default_name, default_language, warnings)

            for k in (u'name', u'id_string', u'sms_keyword'):
                dict_repr.setdefault(k, 'xform_id_string')
                if not isinstance(dict_repr[k], basestring):
                    dict_repr[k] = 'xform_id_string'
            survey = pyxform.builder.create_survey_element_from_dict(dict_repr)
            if len(warnings) > 0:
                return {'warnings': warnings}
            else:
                return {}
        except Exception, e:
            return {'error': e.message}

    def _get_languages_from_column_names(self, cols):
        langs = set()
        for col in cols:
            media_mtch = re.match('^media\:', col)
            mtch = re.match('.*\:\:?(.+)', col)
            if mtch and not media_mtch:
                langs.add(mtch.groups()[0])
        return list(langs)

    def get_summary(self):
        row_count = 0
        languages = set()
        geo = False
        labels = []
        metas = set()
        types = set()
        summary_errors = []
        keys = set()
        if not self.survey:
            return {}

        for row in self.survey:
            # pyxform's csv_to_dict() returns an OrderedDict, so we have to be
            # more tolerant than `type(row) == dict`
            if isinstance(row, dict):
                _type = row.get('type')
                _label = row.get('label')
                if _type in GEO_TYPES:
                    geo = True
                if isinstance(_type, dict):
                    summary_errors.append(['invalidtype', str(_type)])
                    _type = _type.keys()[0]

                if not _type:
                    summary_errors.append(row)
                    continue
                if re.match('^end', _type):
                    continue
                if _type in META_QUESTION_TYPES:
                    metas.add(_type)
                    continue
                row_count += 1
                types.add(_type)
                if _label != None and len(_label) > 0:
                    labels.append(_label)
                keys = keys | set(row.keys())

        summary = {
            'row_count': row_count,
            'languages': self._get_languages_from_column_names(keys),
            'geo': geo,
            'labels': labels[0:5],
            'pyxform_feedbacl': self.pyxform_feedback,
            'columns': list(keys),
        }
        return summary
