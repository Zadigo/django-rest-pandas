from django.conf import settings
from faker import Faker

faker_instance = Faker()

def pytest_configure(config):
    if not settings.configured:
        settings.configure(
            DEBUG=True,
            SECRET_KEY=faker_instance.uuid4(),
            DATABASES={
                'default': {
                    'ENGINE': 'django.db.backends.sqlite3',
                    'NAME': ':memory:',
                }
            },
            INSTALLED_APPS=[
                'django.contrib.admin',
                'django.contrib.auth',
                'django.contrib.contenttypes',
                'django.contrib.sessions',
                'django.contrib.messages',
                'django.contrib.staticfiles',
                'django_extensions',
                'django.contrib.sitemaps',
                'django.contrib.sites',
                'django.contrib.humanize',
                'tests.testapp',
                'tests.weather',
            ],
            ROOT_URLCONF='tests.urls'
        )
