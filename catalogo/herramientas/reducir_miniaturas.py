# catalogo/herramientas/reducir_miniaturas.py
# Reduce las miniaturas del catálogo a 256 colores, sin tramado. Las figuras
# son tintas planas, así que no se nota y el peso baja cerca de 60 %
# (8.2 MB → 3.2 MB con las 42 de noviembre de 2026).
# Uso (desde la carpeta Plantilla): python catalogo/herramientas/reducir_miniaturas.py [id ...]
import os
import sys
from pathlib import Path

from PIL import Image

CARPETA = Path(__file__).resolve().parent.parent / "miniaturas"
ids = set(sys.argv[1:])
antes = despues = 0
for f in sorted(CARPETA.glob("*.png")):
    if ids and f.stem.removesuffix("-oscuro") not in ids:
        continue
    antes += f.stat().st_size
    im = Image.open(f)
    if im.mode != "P":
        im.convert("RGB").quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(f, optimize=True)
    despues += f.stat().st_size
print(f"{antes / 1e6:.1f} MB -> {despues / 1e6:.1f} MB")
