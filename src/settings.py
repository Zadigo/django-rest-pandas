from django.conf import settings

REST_PANDAS = getattr(settings, 'REST_PANDAS', None) or {}

RENDERERS: tuple[str] = REST_PANDAS.get(
    'RENDERERS',
    (
        'wq.db.rest.renderers.HTMLRenderer' if getattr(settings, 'WQ_APP_TEMPLATE', None) else 'src.renderers.PandasHTMLRenderer',
        'src.renderers.PandasCsvRenderer',
        'src.renderers.PandasTextRenderer',
        'src.renderers.PandasJsonRenderer',
        'src.renderers.PandasExcelRenderer',
        'src.renderers.PandasOldExcelRenderer',
        'src.renderers.PandasPNGRenderer',
        'src.renderers.PandasSVGRenderer',
    ),
)

APPLY_FIELD_LABELS: bool = REST_PANDAS.get('APPLY_FIELD_LABELS', True)

INDEX_NONE_VALUE: object = REST_PANDAS.get('INDEX_NONE_VALUE', None)
