from kpi.models import AssetSnapshot


def delete_n_oldest_snapshots_before(count, before_dt):
    oldest_snapshots = AssetSnapshot.objects.filter(
        date_created__lt=before_dt,
        ).order_by('date_created')[0:count]
    _existing = oldest_snapshots.count()
    if _existing == 0:
        return 0
    date_of_n_oldest = oldest_snapshots[_existing-1].date_created
    # query and delete
    _q = AssetSnapshot.objects.filter(
        date_created__lte=date_of_n_oldest,
        )
    _deleted = _q.count()
    _q.delete()
    return _deleted
