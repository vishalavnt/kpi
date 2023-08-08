# coding: utf-8
from .base import *

LOGGING['handlers']['console'] = {
    'level': 'DEBUG',
    'class': 'logging.StreamHandler',
    'formatter': 'verbose'
}

# Add specific VARIABLES for production environment here
# So far, all values are declared in `base.py`

ENV = 'prod'
