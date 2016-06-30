from rest_framework import serializers
from rest_framework.reverse import reverse

import chart_data as get_chart


class ChartsListSerializer(serializers.BaseSerializer):
    def to_representation(self, obj):
        request = self.context['request']
        return {
            'url': reverse('charts-detail', args=(obj.uid,), request=request),
        }


class ChartsDetailSerializer(serializers.BaseSerializer):
    def to_representation(self, obj):
        request = self.context['request']
        kuids = filter(lambda x: len(x) > 1,
                       request.query_params.get('kuids', '').split(','))
        return {
            'url': reverse('charts-detail', args=(obj.uid,), request=request),
            'kuids': kuids,
            'available_kuids': get_chart._kuids(obj),
            'data':  get_chart._data(obj, kuids),
        }
