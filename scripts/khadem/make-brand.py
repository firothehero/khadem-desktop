import sys
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONT = sys.argv[1]; OUT = sys.argv[2]
tt = TTFont(FONT); gs = tt.getGlyphSet(); order = tt.getGlyphOrder()
import io
buf_bytes = io.BytesIO(); tt.flavor = None; tt.save(buf_bytes)
face = hb.Face(buf_bytes.getvalue()); font = hb.Font(face)

def shaped_path(text):
    b = hb.Buffer(); b.add_str(text); b.guess_segment_properties()
    hb.shape(font, b, {})
    pen = SVGPathPen(gs); bp = BoundsPen(gs)
    x = 0
    # RTL buffer: glyphs come in visual order (left-to-right) after shaping
    for info, pos in zip(b.glyph_infos, b.glyph_positions):
        name = order[info.codepoint]
        t = (1, 0, 0, 1, x + pos.x_offset, pos.y_offset)
        gs[name].draw(TransformPen(pen, t)); gs[name].draw(TransformPen(bp, t))
        x += pos.x_advance
    return pen.getCommands(), bp.bounds

def place(bounds, cx, cy, height):
    x0, y0, x1, y1 = bounds
    s = height / (y1 - y0)
    return f"translate({cx} {cy}) scale({s:.5f} {-s:.5f}) translate({-(x0+x1)/2:.1f} {-(y0+y1)/2:.1f})", s * (x1 - x0)

# Emblem: seal ring + isolated khah.
d, bnd = shaped_path("خ")
tr, _ = place(bnd, 500, 520, 600)
emblem = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" role="img" aria-label="خادم">
  <defs>
    <linearGradient id="k" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#c9d4ff"/>
    </linearGradient>
  </defs>
  <circle cx="500" cy="500" r="452" fill="none" stroke="url(#k)" stroke-width="40"/>
  <circle cx="500" cy="500" r="392" fill="none" stroke="url(#k)" stroke-width="10" stroke-opacity="0.45"/>
  <path fill="url(#k)" transform="{tr}" d="{d}"/>
</svg>
'''
open(f"{OUT}/khadem-emblem.svg", "w").write(emblem)

# Wordmark: «خادم» (+ small latin KHADEM underneath).
d2, b2 = shaped_path("خادم")
tr2, w = place(b2, 360, 128, 200)
# Latin line as outlines too (an <img> SVG cannot use the app's web fonts).
lat = sys.argv[3] if len(sys.argv) > 3 else None
latin_svg = ""
if lat:
    tl = TTFont(lat); gl = tl.getGlyphSet(); cm = tl.getBestCmap(); upm = tl["head"].unitsPerEm
    pen = SVGPathPen(gl); x = 0; track = 0.36 * upm
    for ch in "KHADEM":
        g = cm[ord(ch)]; gl[g].draw(TransformPen(pen, (1, 0, 0, 1, x, 0))); x += gl[g].width + track
    x -= track; s = 44 / (0.72 * upm)
    latin_svg = f'<path fill="#9aa6c8" transform="translate({360 - x*s/2:.1f} 312) scale({s:.5f} {-s:.5f})" d="{pen.getCommands()}"/>'
word = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 330" role="img" aria-label="خادم — Khadem">
  <path fill="#f2f4fa" transform="{tr2}" d="{d2}"/>
  {latin_svg}
</svg>
'''
open(f"{OUT}/khadem-wordmark.svg", "w").write(word)
print("ok", w)
