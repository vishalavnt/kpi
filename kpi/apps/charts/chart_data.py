from .constants import (CHARTABLE_TYPES,
                        SPECIFIC_CHARTS_KEY, DEFAULT_CHARTS_KEY
                        )

from pymongo import MongoClient
kobo_instances = MongoClient().formhub.instances


def _kuids(asset, cache=False):
    if not cache or not hasattr(asset, '_available_chart_uids'):
        survey = asset.content.get('survey', [])
        asset._available_chart_uids = [
            row.get('$kuid') for row in survey
            if 'type' in row and row['type'] in CHARTABLE_TYPES
        ]
    return asset._available_chart_uids


def _data(asset, kuids):
    cursor = kobo_instances.find({
        '_userform_id': asset.deployment.mongo_userform_id,
        '_deleted_at': {
            '$exists': False
        }
    }).count()

    packaged_data = {}
    # packaged_data = formpack.autoreport(cursor,
    #                                     kuids=kuids,
    #                                     run_calculations=necessary_calculations,
    #                                     ).get_stats_as_object()

    available_kuids = set(_kuids(asset, cache=True)) & set(kuids)
    default_style = asset.chart_styles[DEFAULT_CHARTS_KEY]
    specified = asset.chart_styles[SPECIFIC_CHARTS_KEY]
    chart_styles = dict([(kuid, specified[kuid])
                         for kuid in available_kuids if kuid in specified])

    return [
        {
            'data': packaged_data.get(kuid, {}),
            'style': chart_styles.get(kuid, default_style),
            'kuid': kuid,
        } for kuid in available_kuids
    ]
