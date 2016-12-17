import moment
import logging
from ..purge_snapshots import delete_n_oldest_snapshots_before

ONE_MONTH_AGO = moment.utcnow().subtract(months=1).datetime
# we don't want the script to take up too much time / resources
MAX_DELETE_COUNT = 10000


def run():
    logger = logging.getLogger('django')
    try:
        _deleted = delete_n_oldest_snapshots_before(MAX_DELETE_COUNT,
                                                    ONE_MONTH_AGO)
        logger.info('Deleted %d AssetSnapshots in purge of %d items'
                    ' preceding %s.' % (_deleted, MAX_DELETE_COUNT,
                                        ONE_MONTH_AGO))
    except Exception:
        logger.error('failed to delete snapshots', exc_info=True)
