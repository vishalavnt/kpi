from django.conf import settings
from formpack import FormPack

from .constants import (CHARTABLE_TYPES,
                        SPECIFIC_CHARTS_KEY, DEFAULT_CHARTS_KEY
                        )


def get_instances_for_userform_id(userform_id, submission=None):
    query = {'_userform_id': userform_id, '_deleted_at': {'$exists': False}}
    if submission:
        query['_id'] = submission
    return settings.MONGO_DB.instances.find(query)


def _kuids(asset, cache=False):
    if not cache or not hasattr(asset, '_available_chart_uids'):
        survey = asset.content.get('survey', [])
        asset._available_chart_uids = [
            row.get('$kuid') for row in survey
            if 'type' in row and row['type'] in CHARTABLE_TYPES
        ]
    return asset._available_chart_uids


def _data(asset, kuids, lang=None, fields=None, split_by=None):
    schema = {
        "id_string": asset.deployment.xform_id_string,
        "version": 'v1',
        "content": asset.valid_xlsform_content(),
    }

    pack = FormPack([schema])
    report = pack.autoreport()
    fields = fields or [field.name for field in pack.get_fields_for_versions()]
    translations = pack.available_translations
    lang = lang or next(iter(translations), None)

    data = [("v1", get_instances_for_userform_id(asset.deployment.mongo_userform_id))]
    stats = report.get_stats(data, fields, lang, split_by)

    available_kuids = set(_kuids(asset, cache=True)) & set(kuids)
    default_style = asset.chart_styles[DEFAULT_CHARTS_KEY]
    specified = asset.chart_styles[SPECIFIC_CHARTS_KEY]
    chart_styles = dict([(kuid, specified[kuid])
                         for kuid in available_kuids if kuid in specified])

    return [
        {
            'data': None,
            'style': chart_styles.get(kuid, default_style),
            'kuid': kuid,
        } for kuid in available_kuids
    ]
