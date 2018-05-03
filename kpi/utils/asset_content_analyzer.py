import re
from collections import OrderedDict

from formpack.utils.replace_aliases import META_TYPES, GEO_TYPES
# from formpack.utils.replace_aliases import META_TYPES, GEO_TYPES

MEDIA_TYPES = [
    'media::image',
    'media::video',
]


class AssetContentAnalyzer(object):
    def __init__(self, *args, **kwargs):
        self.survey = kwargs.get('survey')
        self.settings = kwargs.get('settings', False)
        self.choices = kwargs.get('choices', [])
        self.translations = kwargs.get('translations', [])
        self.default_translation = False
        if len(self.translations) > 0:
            self.default_translation = self.translations[0]
        self.summary = self.get_summary()

    def get_summary(self):
        row_count = 0
        geo = False
        labels = []
        metas = set()
        types = set()
        summary_errors = []
        keys = OrderedDict()
        naming_conflicts = []
        media_files = OrderedDict()
        if not self.survey:
            return {}

        for row in self.survey:
            if isinstance(row, dict):
                if '$given_name' in row:
                    naming_conflicts.append(row['$given_name'])
                _type = row.get('type')
                _label = row.get('label')
                if _type in GEO_TYPES:
                    geo = True

                for media_type in MEDIA_TYPES:
                    if media_type in row:
                        _media = row[media_type]
                        if not isinstance(_media, list):
                            _media = [_media]
                        for _mfile in _media:
                            media_files[_mfile] = True

                if not _type or isinstance(_type, dict) or _type.startswith('end'):
                    summary_errors.append(row)
                    continue
                if _type in META_TYPES:
                    metas.add(_type)
                    continue
                row_count += 1
                types.add(_type)
                if isinstance(_label, list) and len(_label) > 0:
                    labels.append(_label[0])
                elif isinstance(_label, basestring) and len(_label) > 0:
                    labels.append(_label)
                keys.update(OrderedDict.fromkeys(row.keys()))

        summary = {
            'row_count': row_count,
            'languages': self.translations,
            'default_translation': self.default_translation,
            'geo': geo,
            'labels': labels[0:5],
            'media_files': media_files.keys(),
            'columns': filter(lambda k: not k.startswith('$'), keys.keys()),
        }
        if len(naming_conflicts) > 0:
            summary['naming_conflicts'] = naming_conflicts
        return summary
