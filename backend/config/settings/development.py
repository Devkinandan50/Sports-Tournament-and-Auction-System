from .base import *  # noqa: F401, F403

DEBUG = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

# Enable GraphiQL in development
GRAPHENE["MIDDLEWARE"] = [  # noqa: F405
    "graphene_django.debug.DjangoDebugMiddleware",
]
