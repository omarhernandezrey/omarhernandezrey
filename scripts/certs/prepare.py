#!/usr/bin/env python3
"""
Prepara certificados y logos para la sección de educación.

- Oculta datos personales sensibles (número de cédula) antes de publicar.
- Genera la versión completa (enlace) y la miniatura (embebida en el SVG).

Uso (solo cuando cambien los certificados):
    pip install pillow
    python3 scripts/certs/prepare.py <ruta>/public/images/education
"""
from __future__ import annotations

import sys
from dataclasses import dataclass, field
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT_FULL = ROOT / "assets" / "certificates"
OUT_THUMB = OUT_FULL / "thumbs"
OUT_LOGO = ROOT / "assets" / "logos"

FULL_MAX = 1600
THUMB_W = 560
THUMB_H = 348  # proporción de la ventana de la tarjeta (296x184)

Box = tuple[int, int, int, int]


@dataclass(frozen=True)
class Cert:
    id: str
    src: str
    focus: str = "center"  # 'center' | 'top'
    redact: list[Box] = field(default_factory=list)


CERTS: list[Cert] = [
    Cert(
        "sena-tecnologo-adsi",
        "sena/01tecnologoEnTituloAnalisisYDesarrolloDeSistemasDeInformacion.png",
        focus="top",
        # Número de cédula y código de registro que la contiene.
        redact=[(722, 808, 872, 850), (168, 1876, 404, 1904)],
    ),
    Cert(
        "talento-tech-full-stack",
        "talento-tech/desarrolloWebFullStack_page-0001.jpg",
        redact=[(765, 530, 1078, 592)],
    ),
    Cert("itcertificate-full-stack", "ITCertificate/fullStackDeveloperCertifiedSpecialist_page-0001.jpg"),
    Cert("itcertificate-back-end", "ITCertificate/backEndDeveloperCertifiedProfessional_page-0001.jpg"),
    Cert("ibm-git-github", "IBM-skillsbuild/04 Fundamentos_De_Git_&_Github_IBM.png"),
    Cert("platzi-react", "platzi/54 diploma-react.jpg"),
]

LOGOS: dict[str, str] = {
    "politecnico": "politecnico/politecnico-logo.png",
    "sena": "sena/sena-logo.png",
}

# Logos recortados del propio certificado (fondo blanco, mejor legibilidad).
LOGO_CROPS: dict[str, tuple[str, Box]] = {
    "talento-tech": ("talento-tech/desarrolloWebFullStack_page-0001.jpg", (590, 150, 1160, 330)),
}


def redact(img: Image.Image, boxes: list[Box]) -> Image.Image:
    if not boxes:
        return img
    out = img.copy()
    draw = ImageDraw.Draw(out)
    for box in boxes:
        draw.rectangle(box, fill=(24, 28, 34))
    return out


def cover(img: Image.Image, w: int, h: int, focus: str) -> Image.Image:
    scale = max(w / img.width, h / img.height)
    resized = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    left = (resized.width - w) // 2
    top = 0 if focus == "top" else (resized.height - h) // 2
    return resized.crop((left, top, left + w, top + h))


def flatten(img: Image.Image) -> Image.Image:
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        return bg
    return img.convert("RGB")


def logo(img: Image.Image, box: tuple[int, int] = (240, 120)) -> Image.Image:
    img = img.convert("RGBA")
    # Recorta bordes transparentes o casi blancos para aprovechar el espacio.
    ink = Image.eval(flatten(img).convert("L"), lambda v: 255 if v < 235 else 0)
    bbox = ink.getbbox()
    if bbox:
        img = img.crop(bbox)
    img.thumbnail(box, Image.LANCZOS)
    canvas = Image.new("RGBA", box, (0, 0, 0, 0))
    canvas.paste(img, ((box[0] - img.width) // 2, (box[1] - img.height) // 2), img)
    return canvas


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 1
    src = Path(sys.argv[1])
    for d in (OUT_FULL, OUT_THUMB, OUT_LOGO):
        d.mkdir(parents=True, exist_ok=True)

    for c in CERTS:
        img = redact(flatten(Image.open(src / c.src)), c.redact)
        full = img.copy()
        full.thumbnail((FULL_MAX, FULL_MAX), Image.LANCZOS)
        full.save(OUT_FULL / f"{c.id}.jpg", quality=84, optimize=True, progressive=True)
        cover(img, THUMB_W, THUMB_H, c.focus).save(OUT_THUMB / f"{c.id}.jpg", quality=72, optimize=True)
        print(f"{c.id}: {(OUT_THUMB / f'{c.id}.jpg').stat().st_size // 1024} KB miniatura")

    for name, path in LOGOS.items():
        logo(Image.open(src / path)).save(OUT_LOGO / f"{name}.png", optimize=True)
    for name, (path, box) in LOGO_CROPS.items():
        logo(flatten(Image.open(src / path)).crop(box)).save(OUT_LOGO / f"{name}.png", optimize=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
