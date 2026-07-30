from collections.abc import Sequence
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.renderers import PandasBaseRenderer

type TypePandasBaseRenderer = "PandasBaseRenderer"
type TypeRenderers = Sequence["PandasBaseRenderer"]
