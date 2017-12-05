from kpi.models.asset import Inztance, Asset
import json


def run(*args, **kwargs):
    tree_survey = Asset.objects.get(uid='axpMZvSoFzMAeyJwMB5SdG')
    tree_survey.instances.all().delete()

    tree_survey.settings['validation_statuses'] = [
        {
            'label': 'Approved',
            'uid': 'vStatus_approved',
            'color': '#ff000',
        },
        {
            'label': 'Not approved',
            'uid': 'vStatus_not_approved',
            'color': '#00ff00',
        },
        {
            'label': 'On Hold',
            'uid': 'vStatus_on_hold',
            'color': '#0000ff',
        }
    ]
    tree_survey.save()

    instances = [
        tree_survey.instances.create(content={
            'What_kind_of_observation_is_th': 'house',
            'group_al4dp84/Address_number': 6035,
            'group_al4dp84/Front_door': '1352352.jpg',
            'group_al4dp84/Location': '34.23 23.235 10 4',
        }),
        tree_survey.instances.create(content={
            'What_kind_of_observation_is_th': 'house',
            'group_al4dp84/Address_number': 6035,
            'group_al4dp84/Front_door': '1352352.jpg',
            'group_al4dp84/Location': '34.23 23.235 10 4',
        }),
        tree_survey.instances.create(content={
            'What_kind_of_observation_is_th': 'house',
            'group_al4dp84/Address_number': 6035,
            'group_al4dp84/Front_door': '1352352.jpg',
            'group_al4dp84/Location': '34.23 23.235 10 4',
        }),
        tree_survey.instances.create(content={
            'What_kind_of_observation_is_th': 'house',
            'group_al4dp84/Address_number': 6035,
            'group_al4dp84/Front_door': '1352352.jpg',
            'group_al4dp84/Location': '34.23 23.235 10 4',
        })
    ]

    for (instance, status) in zip(instances, [
            'vStatus_approved',
            'vStatus_on_hold',
            'vStatus_approved',
            'vStatus_on_hold',
        ]):
        instance.set_validation_status(status, 'johnny')

    print(tree_survey.settings)
    print(json.dumps(instance1.content, indent=2))
    print(json.dumps(instance1.validation_status, indent=2))
