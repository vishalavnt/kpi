from rest_framework import viewsets, mixins
from .serializers import ChartsListSerializer, ChartsDetailSerializer

from kpi.models import AssetVersion, Asset


class ChartsViewSet(mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    viewsets.GenericViewSet):
    lookup_field = 'uid'

    def get_serializer_class(self):
        if self.action == 'list':
            return ChartsListSerializer
        else:
            return ChartsDetailSerializer

    def get_queryset(self):
        return self.request.user.assets.filter(asset_type='survey',
                                               asset_versions__deployed=True)
