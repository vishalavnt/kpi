'''
Created on Jun 19, 2015

@author: esmail
'''

from zipfile import ZipFile, ZIP_DEFLATED
import io
import optparse

from django.core.management.base import BaseCommand

from ...models.asset import Asset, ASSET_TYPES
from ...models.collection import Collection


ASSET_TYPE_LIST= dict(ASSET_TYPES).keys()


class ExportCollectionCommand(BaseCommand):
    args= '[--no_gather] collection_uid'
    option_list= BaseCommand.option_list + (
        optparse.make_option('--no_gather',
                             action='store_true',
                             dest='no_gather',
                             default=False,
                             help='Do not gather saved questions and blocks into a single XLSForm-like file.'),
    )

    def handle(self, *args, **options):
        if not options.get('username'):
            raise Exception("username flag required '--username'")
        collection_uid= args[0]
        collection= Collection.objects.get(uid=collection_uid)
        gather = not options.get('no_gather')
        zip_export= export_collection_contents(collection.children.all(), gather)
        destination_filename= args[1]
        with open(destination_filename, 'wb') as out_file:
            out_file.write(zip_export.read())


# def export_collection(collection, gather=True):
#     return export_collection_contents(collection.children.all(), gather)


def _export_collection_contents_recursive(collection_contents, zipfile_out, aggregate=True,
                                          out_path_prefix=''):
    unnamed_collection_count= 0
    for obj in collection_contents:
        if isinstance(obj, Asset):
            if (obj.asset_type == 'text'):
                # Survey to XLSForm.
                raise NotImplementedError
            elif aggregate is False:
                # Individual block/question to XLSForm-like file.
                raise NotImplementedError
            else:
                # Aggregate this block/question.
                raise NotImplementedError
        else:
            # Recur into the sub-collection.
            sub_collection_folder_name= obj.name or 'unnamed_collection'
            if (not obj.name) and (unnamed_collection_count > 1):
                sub_collection_folder_name+= '_' + str(unnamed_collection_count)
            sub_path= out_path_prefix + sub_collection_folder_name + '/'

            _export_collection_contents_recursive(
                obj.children.all(), zipfile_out, aggregate, sub_path)

    if aggregate:
        # Export all aggregated blocks/questions to one XLSForm-like file.
        raise NotImplementedError


def export_collection_contents(collection_contents, aggregate=True):
    io_out= io.BytesIO()
    with ZipFile(io_out, 'w', ZIP_DEFLATED) as zipfile_out:
        _export_collection_contents_recursive(collection_contents, zipfile_out, aggregate)
