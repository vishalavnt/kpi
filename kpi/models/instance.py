import datetime

from django.db import models
from jsonfield import JSONField


class Instance(models.Model):
    ''' trying out a kpi-housed Instance '''
    content = JSONField(null=False)
    validation_status = JSONField(null=False, default=dict)
    asset = models.ForeignKey('Asset', related_name='instances')
    version_uid = models.CharField(max_length=100)

    def set_validation_status(self, which_status, by_whom, timestamp=None):
        available_status_uid = [status['uid']
            for status in self.asset.settings.get('validation_statuses')]

        if which_status not in available_status_uid:
            raise ValueError('status not available')
        timestamp = str(datetime.datetime.now())
        self.validation_status['value'] = which_status
        self.validation_status['by_whom'] = by_whom
        self.validation_status['timestamp'] = timestamp
        self.save()

    def to_table_json(self):
        status_uid = self.validation_status.get('value')
        if status_uid:
            available_statuses = {s['uid']: s['label']
                for s in self.asset.settings.get('validation_statuses')}
            status_label = available_statuses.get(status_uid)
            return dict(self.content, **{
                'validation_status': status_label,
            })
        else:
            return self.content
