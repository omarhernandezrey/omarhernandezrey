#!/usr/bin/env python3
"""
Subsetea las fuentes del perfil y genera métricas de avance para medir texto.

Uso (solo cuando cambien fuentes o caracteres):
    pip install fonttools brotli
    python3 scripts/fonts/subset.py <dir_con_woff2_fuente>

Salida:
    assets/fonts/<nombre>.woff2   -> se embeben en base64 en los SVG
    assets/fonts/metrics.json     -> anchos por carácter (unidades/em) para layout
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "fonts"

# ASCII imprimible + español + tipografía usada en las tarjetas.
CHARS = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "áéíóúÁÉÍÓÚñÑüÜ¿¡°·—–“”‘’…•×→←↗−"
)

FONTS: dict[str, str] = {
    "display-500": "space-grotesk-latin-500-normal.woff2",
    "display-700": "space-grotesk-latin-700-normal.woff2",
    "mono-400": "jetbrains-mono-latin-400-normal.woff2",
    "mono-700": "jetbrains-mono-latin-700-normal.woff2",
}


def subset_font(src: Path, dst: Path) -> None:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["kern", "liga", "calt"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.hinting = False
    font = subset.load_font(str(src), options)
    subsetter = subset.Subsetter(options)
    subsetter.populate(text=CHARS)
    subsetter.subset(font)
    subset.save_font(font, str(dst), options)


def metrics(path: Path) -> dict[str, object]:
    font = TTFont(str(path))
    upm = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    widths = {ch: hmtx[cmap[ord(ch)]][0] for ch in CHARS if ord(ch) in cmap}
    fallback = hmtx[cmap[ord("n")]][0]
    return {"unitsPerEm": upm, "fallback": fallback, "widths": widths}


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 1
    src_dir = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    all_metrics: dict[str, object] = {}
    for name, file in FONTS.items():
        matches = list(src_dir.rglob(file))
        if not matches:
            print(f"No se encontró {file} en {src_dir}", file=sys.stderr)
            return 2
        dst = OUT / f"{name}.woff2"
        subset_font(matches[0], dst)
        all_metrics[name] = metrics(dst)
        print(f"{name}: {dst.stat().st_size / 1024:.1f} KB")
    (OUT / "metrics.json").write_text(json.dumps(all_metrics, ensure_ascii=False), "utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
