# -*- coding: utf-8 -*-
from django.db.migrations import Migration as DjangoMigration, AlterField
from django.db.models import CharField

class Migration(DjangoMigration):
    dependencies = [
        # Specify other dependencies, if required.
        ('auth', '0006_require_contenttypes_0002')
    ]
    operations = [
        AlterField(
            model_name='User',
            name='username',
            field=CharField(max_length=150)
        )
    ]

    def mutate_state(self, project_state, preserve=True):
        """
        This is a workaround that allows to store ``auth``
        migration outside the directory it should be stored.
        """
        app_label = self.app_label
        self.app_label = 'auth'
        state = super(Migration, self).mutate_state(project_state, preserve)
        self.app_label = app_label
        return state

    def apply(self, project_state, schema_editor, collect_sql=False):
        """
        Same workaround as described in ``mutate_state`` method.
        """
        app_label = self.app_label
        self.app_label = 'auth'
        state = super(Migration, self).apply(project_state, schema_editor, collect_sql)
        self.app_label = app_label
        return state
