from src.renderers import PandasCsvRenderer


class CustomCSVRenderer(PandasCsvRenderer):
    def get_pandas_kwargs(self, data, renderer_context):
        kwargs = super().get_pandas_kwargs(
            data, renderer_context
        )
        kwargs["date_format"] = "%d-%m-%Y"
        return kwargs
