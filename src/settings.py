from django.conf import settings

REST_PANDAS = getattr(settings, 'REST_PANDAS', None) or {}

RENDERERS: tuple[str] = REST_PANDAS.get(
    'RENDERERS',
    (
        'wq.db.rest.renderers.HTMLRenderer' if getattr(settings, 'WQ_APP_TEMPLATE', None) else 'rest_pandas.renderers.PandasHTMLRenderer',
        'rest_pandas.renderers.PandasCsvRenderer',
        'rest_pandas.renderers.PandasTextRenderer',
        'rest_pandas.renderers.PandasJsonRenderer',
        'rest_pandas.renderers.PandasExcelRenderer',
        'rest_pandas.renderers.PandasOldExcelRenderer',
        'rest_pandas.renderers.PandasPNGRenderer',
        'rest_pandas.renderers.PandasSVGRenderer',
    ),
)

APPLY_FIELD_LABELS: bool = REST_PANDAS.get('APPLY_FIELD_LABELS', True)

INDEX_NONE_VALUE: object = REST_PANDAS.get('INDEX_NONE_VALUE', None)
