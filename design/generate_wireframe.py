#!/usr/bin/env python3
"""
Whiteboard App — UI Wireframe
Design philosophy: Spatial Residue
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os

FONTS = "/Users/mrsky/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/88a40b1e-5fe4-4df4-a35e-5a5fdb5429ea/54cff46d-977e-4296-891d-9de630af1447/skills/canvas-design/canvas-fonts"

# ── Canvas ──────────────────────────────────────────────────────────────────
W, H = 1600, 960
img = Image.new("RGB", (W, H), "#0d0d0f")
d = ImageDraw.Draw(img)

# ── Palette ──────────────────────────────────────────────────────────────────
BG          = "#0d0d0f"
SURFACE     = "#141417"
BORDER      = "#242428"
BORDER_MID  = "#2e2e34"
TEXT_DIM    = "#3a3a42"
TEXT_MID    = "#6b6b78"
TEXT_SOFT   = "#9d9daa"
TEXT_MAIN   = "#e2e2e8"
ACCENT      = "#6366f1"   # indigo — action
ACCENT_DIM  = "#2a2b4a"
ACCENT_GLOW = "#818cf8"
RED_TOOL    = "#f43f5e"
HAIR        = "#1e1e22"

# ── Fonts ────────────────────────────────────────────────────────────────────
def font(name, size):
    try:
        return ImageFont.truetype(os.path.join(FONTS, name), size)
    except:
        return ImageFont.load_default()

f_label   = font("JetBrainsMono-Regular.ttf", 11)
f_label_b = font("JetBrainsMono-Bold.ttf", 11)
f_mono    = font("JetBrainsMono-Regular.ttf", 10)
f_ui      = font("InstrumentSans-Regular.ttf", 13)
f_ui_b    = font("InstrumentSans-Bold.ttf", 13)
f_ui_sm   = font("InstrumentSans-Regular.ttf", 11)
f_title   = font("BricolageGrotesque-Bold.ttf", 15)
f_section = font("InstrumentSans-Regular.ttf", 10)
f_large   = font("BricolageGrotesque-Bold.ttf", 48)
f_tag     = font("JetBrainsMono-Regular.ttf", 9)

# ── Helpers ──────────────────────────────────────────────────────────────────
def rect(x, y, w, h, fill=None, outline=None, radius=0):
    if radius:
        d.rounded_rectangle([x, y, x+w, y+h], radius=radius, fill=fill, outline=outline)
    else:
        d.rectangle([x, y, x+w, y+h], fill=fill, outline=outline)

def line(x1, y1, x2, y2, fill=BORDER, width=1):
    d.line([(x1, y1), (x2, y2)], fill=fill, width=width)

def text(x, y, s, font=None, fill=TEXT_SOFT, anchor="la"):
    d.text((x, y), s, font=font or f_ui, fill=fill, anchor=anchor)

def dot(cx, cy, r, fill):
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=fill)

def circle_outline(cx, cy, r, outline, width=1):
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=outline, width=width)

# ── Grid (very subtle) ───────────────────────────────────────────────────────
GRID = 40
for gx in range(0, W, GRID):
    line(gx, 0, gx, H, fill="#12121500")   # transparent ghost
for gy in range(0, H, GRID):
    line(0, gy, W, gy, fill="#12121500")

# Subtle dot-grid on canvas area
TOOLBAR_W = 64
HEADER_H  = 48
OPT_H     = 44
CANVAS_X  = TOOLBAR_W
CANVAS_Y  = HEADER_H + OPT_H
CANVAS_W  = W - TOOLBAR_W
CANVAS_H  = H - CANVAS_Y

for gx in range(CANVAS_X + 20, W, 28):
    for gy in range(CANVAS_Y + 20, H, 28):
        dot(gx, gy, 1, "#1c1c21")

# ── Header bar ───────────────────────────────────────────────────────────────
rect(0, 0, W, HEADER_H, fill=SURFACE)
line(0, HEADER_H, W, HEADER_H, fill=BORDER)

# Logo / app name
dot(20, HEADER_H//2, 6, ACCENT)
text(34, HEADER_H//2, "whiteboard", font=f_title, fill=TEXT_MAIN, anchor="lm")

# Header — center: room name
text(W//2, HEADER_H//2, "room / untitled", font=f_ui_sm, fill=TEXT_MID, anchor="mm")

# Header — right: presence avatars + share
AV_CX = W - 180
for i, color in enumerate(["#6366f1", "#f43f5e", "#22c55e"]):
    cx = AV_CX + i * 22
    dot(cx, HEADER_H//2, 10, color)
    circle_outline(cx, HEADER_H//2, 10, SURFACE, width=2)
    # initials
    initials = ["S", "A", "M"][i]
    text(cx, HEADER_H//2, initials, font=f_tag, fill="white", anchor="mm")

# share button
rect(W - 118, 12, 70, 24, fill=ACCENT, radius=6)
text(W - 83, HEADER_H//2, "Share", font=f_ui_sm, fill="white", anchor="mm")

# export button
rect(W - 42, 12, 30, 24, fill=SURFACE, outline=BORDER_MID, radius=6)
text(W - 27, HEADER_H//2, "↑", font=f_ui_sm, fill=TEXT_SOFT, anchor="mm")

# ── Options bar ──────────────────────────────────────────────────────────────
OPT_Y = HEADER_H
rect(TOOLBAR_W, OPT_Y, W - TOOLBAR_W, OPT_H, fill=SURFACE)
line(TOOLBAR_W, OPT_Y + OPT_H, W, OPT_Y + OPT_H, fill=BORDER)
line(TOOLBAR_W, OPT_Y, TOOLBAR_W, OPT_Y + OPT_H, fill=BORDER)

# Options label
text(TOOLBAR_W + 16, OPT_Y + OPT_H//2, "pen", font=f_label_b, fill=ACCENT, anchor="lm")
line(TOOLBAR_W + 52, OPT_Y + 10, TOOLBAR_W + 52, OPT_Y + OPT_H - 10, fill=BORDER_MID)

# Stroke width control
text(TOOLBAR_W + 66, OPT_Y + OPT_H//2, "width", font=f_label, fill=TEXT_MID, anchor="lm")
# slider track
SL_X = TOOLBAR_W + 116
SL_Y = OPT_Y + OPT_H//2
SL_W = 100
rect(SL_X, SL_Y - 2, SL_W, 3, fill=BORDER_MID, radius=2)
rect(SL_X, SL_Y - 2, 38, 3, fill=ACCENT, radius=2)
dot(SL_X + 38, SL_Y, 6, ACCENT)
circle_outline(SL_X + 38, SL_Y, 6, SURFACE, width=2)
text(SL_X + SL_W + 10, OPT_Y + OPT_H//2, "2px", font=f_label, fill=TEXT_SOFT, anchor="lm")

line(SL_X + SL_W + 42, OPT_Y + 10, SL_X + SL_W + 42, OPT_Y + OPT_H - 10, fill=BORDER_MID)

# Dash style
DS_X = SL_X + SL_W + 56
text(DS_X, OPT_Y + OPT_H//2, "style", font=f_label, fill=TEXT_MID, anchor="lm")
styles = ["—", "- -", "···"]
for i, s in enumerate(styles):
    bx = DS_X + 44 + i * 44
    is_active = i == 0
    rect(bx - 2, OPT_Y + 10, 38, 24, fill=ACCENT_DIM if is_active else None, outline=ACCENT if is_active else BORDER_MID, radius=5)
    text(bx + 17, OPT_Y + OPT_H//2, s, font=f_label, fill=TEXT_MAIN if is_active else TEXT_MID, anchor="mm")

line(DS_X + 180, OPT_Y + 10, DS_X + 180, OPT_Y + OPT_H - 10, fill=BORDER_MID)

# Opacity
OP_X = DS_X + 194
text(OP_X, OPT_Y + OPT_H//2, "opacity", font=f_label, fill=TEXT_MID, anchor="lm")
rect(OP_X + 56, OPT_Y + 10, 52, 24, fill=HAIR, outline=BORDER_MID, radius=5)
text(OP_X + 82, OPT_Y + OPT_H//2, "100%", font=f_label, fill=TEXT_SOFT, anchor="mm")

# ── Left Toolbar ──────────────────────────────────────────────────────────────
rect(0, 0, TOOLBAR_W, H, fill=SURFACE)
line(TOOLBAR_W, 0, TOOLBAR_W, H, fill=BORDER)

# Tool items
tools = [
    ("pen",    True,   ACCENT),
    ("eraser", False,  None),
]

TOOL_START_Y = HEADER_H + OPT_H + 24
TOOL_SPACING = 60

for i, (name, active, color) in enumerate(tools):
    cy = TOOL_START_Y + i * TOOL_SPACING
    cx = TOOLBAR_W // 2

    if active:
        rect(8, cy - 22, TOOLBAR_W - 16, 44, fill=ACCENT_DIM, radius=8)

    # icon box
    icon_r = 14
    if name == "pen":
        # pen nib shape — simplified as rotated square
        d.polygon([
            (cx, cy - icon_r),
            (cx + icon_r, cy),
            (cx, cy + icon_r * 0.6),
            (cx - icon_r, cy),
        ], fill=ACCENT if active else TEXT_MID)
        # highlight
        d.polygon([
            (cx, cy - icon_r),
            (cx + icon_r, cy),
            (cx + 2, cy),
            (cx, cy - icon_r + 4),
        ], fill=ACCENT_GLOW if active else TEXT_DIM)
    elif name == "eraser":
        rect(cx - icon_r, cy - 10, icon_r * 2, 18, fill=TEXT_MID, radius=4)
        rect(cx - icon_r, cy + 6, icon_r * 2 * 0.6, 4, fill=RED_TOOL, radius=2)

    # label
    text(cx, cy + icon_r + 10, name, font=f_tag, fill=ACCENT if active else TEXT_MID, anchor="mm")

# separator
SEP_Y = TOOL_START_Y + len(tools) * TOOL_SPACING + 8
line(16, SEP_Y, TOOLBAR_W - 16, SEP_Y, fill=BORDER_MID)

# Color picker
CP_Y = SEP_Y + 24
cx = TOOLBAR_W // 2

# Color swatch (active color)
ring_r = 16
dot(cx, CP_Y, ring_r, "#1a1a3e")
circle_outline(cx, CP_Y, ring_r, ACCENT, width=2)
dot(cx, CP_Y, 11, "#6366f1")
# color wheel hint dots
for angle_deg in range(0, 360, 45):
    angle = math.radians(angle_deg)
    wx = cx + math.cos(angle) * ring_r
    wy = CP_Y + math.sin(angle) * ring_r
    colors_ring = ["#f43f5e","#f97316","#eab308","#22c55e","#06b6d4","#6366f1","#8b5cf6","#ec4899"]
    dot(int(wx), int(wy), 2, colors_ring[angle_deg // 45])

text(cx, CP_Y + ring_r + 12, "color", font=f_tag, fill=TEXT_MID, anchor="mm")

# Bottom of toolbar — zoom + undo
BOTTOM_Y = H - 100
line(16, BOTTOM_Y, TOOLBAR_W - 16, BOTTOM_Y, fill=BORDER_MID)

for i, (sym, lbl) in enumerate([("↩", "undo"), ("↪", "redo")]):
    cy2 = BOTTOM_Y + 20 + i * 32
    text(cx, cy2, sym, font=f_ui_sm, fill=TEXT_MID, anchor="mm")

# ── Canvas area ───────────────────────────────────────────────────────────────
# Faint sample strokes to show canvas in use
# Pencil stroke (bezier-like approximation)
stroke_pts = [
    (220, 400), (260, 360), (320, 390), (380, 340), (450, 370),
    (520, 310), (580, 340), (640, 290), (700, 330)
]
for i in range(1, len(stroke_pts)):
    x1, y1 = stroke_pts[i-1]
    x2, y2 = stroke_pts[i]
    d.line([(x1, y1), (x2, y2)], fill="#4a4a60", width=2)

# Second stroke
stroke_pts2 = [
    (300, 520), (360, 480), (420, 510), (480, 460), (540, 500),
    (600, 450), (660, 480)
]
for i in range(1, len(stroke_pts2)):
    x1, y1 = stroke_pts2[i-1]
    x2, y2 = stroke_pts2[i]
    d.line([(x1, y1), (x2, y2)], fill="#4a4a60", width=3)

# Eraser indication (lighter path)
erase_pts = [
    (480, 390), (500, 375), (520, 385)
]
for i in range(1, len(erase_pts)):
    x1, y1 = erase_pts[i-1]
    x2, y2 = erase_pts[i]
    d.line([(x1, y1), (x2, y2)], fill=BG, width=18)

# Remote cursor — another user
RCX, RCY = 780, 430
# cursor triangle
d.polygon([(RCX, RCY), (RCX+6, RCY+14), (RCX+10, RCY+10)], fill=RED_TOOL)
# name label
rect(RCX + 10, RCY - 4, 52, 18, fill=RED_TOOL, radius=4)
text(RCX + 36, RCY + 5, "Aakash", font=f_tag, fill="white", anchor="mm")

# ── Annotation callouts ───────────────────────────────────────────────────────
ANNO_COLOR = "#2e2e3a"
ANNO_LINE  = "#3a3a50"

def callout(x, y, tx, ty, label, sub=""):
    line(x, y, tx, ty, fill=ANNO_LINE)
    dot(x, y, 3, ANNO_LINE)
    bw = max(len(label), len(sub)) * 7 + 16
    bh = 28 if not sub else 40
    rect(tx, ty - bh//2, bw, bh, fill=ANNO_COLOR, radius=5)
    text(tx + 8, ty - bh//2 + 8, label, font=f_label, fill=TEXT_SOFT)
    if sub:
        text(tx + 8, ty - bh//2 + 22, sub, font=f_tag, fill=TEXT_DIM)

# Toolbar callout
callout(TOOLBAR_W + 4, TOOL_START_Y + 10, TOOLBAR_W + 80, TOOL_START_Y + 80,
        "Toolbar", "compound component")

# Options bar callout
callout(TOOLBAR_W + 300, HEADER_H + OPT_H//2, TOOLBAR_W + 300, HEADER_H + OPT_H + 50,
        "Options bar", "contextual per tool")

# Canvas callout
callout(600, 600, 700, 660, "Canvas", "fullscreen · HiDPI")

# Remote cursor callout
callout(RCX + 5, RCY + 5, RCX + 80, RCY + 60, "Remote cursor", "Socket.IO presence")

# Color picker callout
callout(TOOLBAR_W//2, CP_Y, TOOLBAR_W + 60, CP_Y + 40, "ColorPicker", "activeColor → Zustand")

# ── Redline annotations (dimensions) ─────────────────────────────────────────
# toolbar width
line(0, H - 24, TOOLBAR_W, H - 24, fill="#3a2a2a", width=1)
line(0, H - 28, 0, H - 20, fill="#3a2a2a")
line(TOOLBAR_W, H - 28, TOOLBAR_W, H - 20, fill="#3a2a2a")
text(TOOLBAR_W // 2, H - 24, "64px", font=f_tag, fill="#5a3a3a", anchor="mm")

# header height
line(W - 24, 0, W - 24, HEADER_H, fill="#3a2a2a", width=1)
line(W - 28, 0, W - 20, 0, fill="#3a2a2a")
line(W - 28, HEADER_H, W - 20, HEADER_H, fill="#3a2a2a")
text(W - 24, HEADER_H // 2, "48px", font=f_tag, fill="#5a3a3a", anchor="mm")

# options bar height
line(W - 24, HEADER_H, W - 24, HEADER_H + OPT_H, fill="#3a2a2a", width=1)
line(W - 28, HEADER_H + OPT_H, W - 20, HEADER_H + OPT_H, fill="#3a2a2a")
text(W - 24, HEADER_H + OPT_H // 2, "44px", font=f_tag, fill="#5a3a3a", anchor="mm")

# ── Corner watermark ──────────────────────────────────────────────────────────
text(W - 16, H - 14, "whiteboard · UI specification · 1600×960", font=f_tag, fill=TEXT_DIM, anchor="rm")
text(16, H - 14, "spatial residue", font=f_tag, fill=TEXT_DIM, anchor="lm")

# ── Save ──────────────────────────────────────────────────────────────────────
out = "/Users/mrsky/mine/white-board/design/wireframe.png"
img.save(out, "PNG", dpi=(144, 144))
print(f"Saved → {out}")
