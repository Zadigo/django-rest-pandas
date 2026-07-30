

from django.http import HttpRequest

from src.renderers import PandasBaseRenderer
from src.typings import TypeRenderers

try:
    from rest_framework.views import APIView
except ImportError as e:
    if "APIView" in e.msg:
        raise ImportError(
            "Try importing rest_pandas before rest_framework.views"
        )
    else:
        raise
from rest_framework.generics import ListAPIView
from rest_framework.mixins import ListModelMixin
from rest_framework.pagination import BasePagination
from rest_framework.response import Response
from rest_framework.settings import perform_import
from rest_framework.viewsets import GenericViewSet

from src import settings
from src.serializers import PandasSerializer, SimpleSerializer

PANDAS_RENDERERS: TypeRenderers = perform_import(settings.RENDERERS, 'REST_PANDAS["RENDERERS"]')


class PandasMixin[T = PandasSerializer]:
    pandas_serializer_class: type[T] = PandasSerializer

    def with_list_serializer(self, cls: T):
        meta: type = getattr(cls, "Meta", object)
        if getattr(meta, "list_serializer_class", None):
            return cls

        class SerializerWithListSerializer(cls):
            class Meta(meta):
                list_serializer_class = self.pandas_serializer_class

        return SerializerWithListSerializer

    def get_serializer_class(self) -> type[PandasSerializer]:
        if getattr(self, "serializer_class", None) is None:
            raise ValueError(
                f"'{self.__class__.__name__}' should either include a `serializer_class` attribute, "
                "or override the `get_serializer_class()` method."
            )

        renderer = self.request.accepted_renderer
        if hasattr(renderer, "get_default_renderer"):
            # BrowsableAPIRenderer
            renderer = renderer.get_default_renderer(self)

        if isinstance(renderer, PandasBaseRenderer):
            return self.with_list_serializer(self.serializer_class)
        else:
            return self.serializer_class

    def get_pandas_filename(self, request: HttpRequest, format: str) -> str | None:
        return None

    def get_pandas_headers(self, request: HttpRequest) -> dict[str, str]:
        format = request.accepted_renderer.format
        filename = self.get_pandas_filename(request, format)
        if not filename:
            return {}

        extension = "." + format
        if not filename.endswith(extension):
            filename += extension

        return {
            "Content-Disposition": f'attachment; filename="{filename}"'
        }

    def update_pandas_headers(self, response: Response) -> Response:
        headers = self.get_pandas_headers(self.request)
        for key, val in headers.items():
            response[key] = val
        return response


class PandasViewBase(PandasMixin):
    renderer_classes = PANDAS_RENDERERS
    pagination_class: type[BasePagination] | None = None
    template_name: str = 'src/viewer.html'


class PandasSimpleView(PandasViewBase, APIView):
    """
    Simple (non-model) Pandas API view; override get_data
    with a function that returns a list of dicts.
    """

    serializer_class: type[PandasSerializer] = SimpleSerializer

    def get_data(self, request: HttpRequest, *args, **kwargs):
        return []

    def get(self, request: HttpRequest, *args, **kwargs):
        data = self.get_data(request, *args, **kwargs)

        serializer_class = self.get_serializer_class()
        serializer = serializer_class(data, many=True)

        response = Response(serializer.data)
        return self.update_pandas_headers(response)


class PandasView(PandasViewBase, ListAPIView):
    """
    Pandas-capable model list view
    """

    def list(self, request: HttpRequest, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return self.update_pandas_headers(response)


class PandasViewSet(PandasViewBase, ListModelMixin, GenericViewSet):
    """
    Pandas-capable model ViewSet (list only)
    """

    def list(self, request: HttpRequest, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return self.update_pandas_headers(response)
