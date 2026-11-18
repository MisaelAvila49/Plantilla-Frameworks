# scripts/reducir_miniaturas.py
# Reduce las miniaturas de la página «Catálogo de formas» a 256 colores, sin
# tramado, igual que catalogo/herramientas/reducir_miniaturas.py: las figuras
# son tintas planas, así que no se nota y el peso baja cerca de 60 %.
# Lo llama scripts/miniaturas_galeria.mjs al terminar; también se corre solo.
# Uso (desde la carpeta Plantilla):
#   python scripts/reducir_miniaturas.py [id ...]
import sys
from pathlib import Path

from PIL import Image

CARPETA = Path(__file__).resolve().parent.parent / "src" / "catalogo" / "miniaturas"
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
print(f"reducir_miniaturas: {antes / 1e6:.1f} MB -> {despues / 1e6:.1f} MB")
