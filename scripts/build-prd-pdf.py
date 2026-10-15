#!/usr/bin/env python3
"""Render docs/PRD.md to an A4 review PDF.

Requires `pandoc` and Python `weasyprint` in the environment. Not a Bun project
runtime dependency. This is a document-generation utility for future updates.
"""
from __future__ import annotations

import html
import re
import subprocess
import sys
from pathlib import Path

try:
    from weasyprint import HTML
except ImportError:
    raise SystemExit('Missing Python package weasyprint; pip install weasyprint')

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs' / 'PRD.md'
OUTPUT = ROOT / 'docs' / 'Laviann-PRD-v1.0.pdf'


result = subprocess.run(
    ['pandoc', str(SOURCE), '--from=gfm', '--to=html5', '--section-divs', '--wrap=none'],
    check=True, capture_output=True, text=True,
)
fragment = result.stdout
# The Markdown title and human-editable front matter live on the custom PDF cover.
first_section = re.search(r'<section\b[^>]*class="level2"', fragment)
if not first_section:
    raise SystemExit('Could not locate numbered sections in PRD Markdown')
body = fragment[first_section.start():]

headings = re.findall(
    r'<section\s+id="([^"]+)"\s+class="level2">\s*<h2>(.*?)</h2>',
    body,
    flags=re.DOTALL,
)
if len(headings) < 15:
    raise SystemExit(f'Expected >=15 main headings, got {len(headings)}')

links = '\n'.join(
    f'<li><a href="#{html.escape(ident, quote=True)}">'
    f'<span>{re.sub("<[^>]+>", "", label)}</span></a></li>'
    for ident, label in headings
)

css = r'''
@page {
  size: A4;
  margin: 22mm 18mm 20mm;
  @top-left {
    content: "LAVIANN  /  PRODUCT REQUIREMENTS";
    font: 600 8pt Inter, sans-serif;
    letter-spacing: .10em;
    color: #547569;
    padding-top: 7mm;
  }
  @top-right {
    content: "PRD V1.0";
    font: 600 8pt Inter, sans-serif;
    color: #547569;
    padding-top: 7mm;
  }
  @bottom-left {
    content: "14 OCT 2026   |   PLANNING BASELINE";
    font: 500 7.5pt Inter, sans-serif;
    color: #71847d;
    padding-bottom: 4mm;
  }
  @bottom-right {
    content: "LAVIANN  /  " counter(page);
    font: 600 8pt Inter, sans-serif;
    color: #315649;
    padding-bottom: 4mm;
  }
}
@page cover {
  margin: 0;
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-left { content: none; }
  @bottom-right { content: none; }
}
:root {
  --ink: #16392f;
  --text: #263d35;
  --muted: #687a73;
  --rule: #d8e2db;
  --paper: #ffffff;
  --wash: #f4f7f3;
  --accent: #afc799;
}
* { box-sizing: border-box; }
html { font-family: Inter, Arial, sans-serif; font-size: 9.2pt; color: var(--text); }
body { margin: 0; }
.cover {
  page: cover;
  position: relative;
  height: 297mm;
  padding: 27mm 25mm 24mm;
  background: #12382f;
  color: #f4f6f2;
  break-after: page;
  overflow: hidden;
}
.cover:before {
  content: "";
  position: absolute;
  width: 120mm;
  height: 120mm;
  border: 1.1px solid #719282;
  border-radius: 50%;
  right: -46mm;
  top: 27mm;
  opacity: .6;
}
.cover:after {
  content: "";
  position: absolute;
  width: 160mm;
  height: 160mm;
  border: 1.1px solid #466d5f;
  border-radius: 50%;
  right: -77mm;
  top: 5mm;
  opacity: .62;
}
.cover .brand {
  font-weight: 700;
  font-size: 12pt;
  letter-spacing: .21em;
  position: relative;
  z-index: 1;
}
.cover .overline {
  margin-top: 48mm;
  font-size: 8.8pt;
  text-transform: uppercase;
  letter-spacing: .18em;
  color: #bcd1c3;
  position: relative;
  z-index: 1;
}
.cover h1 {
  font-size: 45pt;
  letter-spacing: -.06em;
  line-height: 1.01;
  margin: 7mm 0 5mm;
  color: #ffffff;
  font-weight: 800;
  position: relative;
  z-index: 1;
}
.cover h2 {
  color: #dae6dc;
  font-size: 23pt;
  line-height: 1.15;
  letter-spacing: -.037em;
  font-weight: 500;
  margin: 0;
  position: relative;
  z-index: 1;
  max-width: 138mm;
}
.cover .tagline {
  color: #d5e3d9;
  font-size: 11pt;
  line-height: 1.6;
  max-width: 133mm;
  margin-top: 15mm;
  position: relative;
  z-index: 1;
}
.cover .line { width: 38mm; height: 2px; background: #c3d9ad; margin-top: 10mm; }
.cover .metadata {
  position: absolute;
  left: 25mm;
  right: 25mm;
  bottom: 29mm;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #648276;
  padding-top: 7mm;
  color: #cbdcd0;
  font-size: 9pt;
  line-height: 1.65;
}
.cover .metadata b { color: white; font-weight: 600; }
.toc {
  break-after: page;
  padding: 11mm 3mm 2mm;
}
.toc .eyebrow { font-size: 8pt; font-weight: 700; color: #7d9285; letter-spacing: .16em; }
.toc h2 { font-size: 27pt; letter-spacing: -.045em; margin: 4mm 0 13mm; }
.toc ol { list-style: none; margin: 0; padding: 0; counter-reset: item; }
.toc li { border-bottom: 1px solid #dfebe3; }
.toc a { display: flex; gap: 7mm; justify-content: space-between; align-items: baseline; padding: 1.8mm 0; color: #244739; text-decoration: none; font-size: 10.1pt; }
.toc a::after { content: target-counter(attr(href), page); color: #809487; font-weight: 600; }
.toc .note { font-size: 8.7pt; margin-top: 8mm; color: #6d8175; max-width: 130mm; line-height: 1.6; }
.doc { max-width: 100%; }
.doc section.level2 { margin-top: 0; }
.doc h2 {
  font-size: 16pt;
  color: #153f32;
  line-height: 1.16;
  margin: 11mm 0 3mm;
  font-weight: 750;
  letter-spacing: -.025em;
  break-after: avoid-page;
}
.doc h3 {
  font-size: 11.4pt;
  color: #36594a;
  margin: 6mm 0 2.1mm;
  font-weight: 700;
  break-after: avoid-page;
}
.doc h2 + h3 { margin-top: 2.7mm; }
.doc p, .doc li { font-size: 9.3pt; line-height: 1.56; color: #354a40; }
.doc p { margin: 0 0 3.25mm; hyphens: auto; }
.doc ul, .doc ol { margin: 1.4mm 0 3.3mm; padding-left: 6mm; }
.doc li { padding-left: .8mm; margin-bottom: 1mm; }
.doc li::marker { color: #7c9c84; }
.doc strong { color: #183f30; }
.doc blockquote {
  background: #f2f7f2;
  border-left: 3px solid #729b78;
  padding: 4mm 5mm 3mm;
  margin: 4mm 0;
  break-inside: avoid-page;
}
.doc blockquote p { margin: 0; }
.doc table {
  border-collapse: collapse;
  width: 100%;
  margin: 3.5mm 0 5.2mm;
  font-size: 8.1pt;
  table-layout: auto;
  break-inside: auto;
}
.doc thead { display: table-header-group; }
.doc tr { break-inside: avoid; }
.doc th {
  background: #e9f0e9;
  color: #1d4a38;
  font-size: 8.0pt;
  line-height: 1.35;
  font-weight: 700;
  padding: 2.6mm 2.4mm;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid #c6d8c9;
}
.doc td {
  font-size: 7.95pt;
  line-height: 1.39;
  padding: 2.55mm 2.4mm;
  vertical-align: middle;
  border-bottom: 1px solid #e3e9e3;
  color: #33453d;
  overflow-wrap: anywhere;
}
.doc tbody tr:nth-child(even) { background: #fafcf9; }
.doc hr { height: 1px; border: 0; background: #d8e4d7; margin: 8mm 0; }
.doc code {
  font-family: Consolas, 'Liberation Mono', monospace;
  font-size: 8.3pt;
  color: #2f5542;
  background: #f1f5f1;
  padding: .2mm .6mm;
}
.doc pre { white-space: pre-wrap; background: #f4f6f3; padding: 3mm; }
.doc a { color: #236b4a; text-decoration: none; }
.doc section.level2:first-child h2 { margin-top: 0; }
'''

page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Laviann - Product Requirements Document v1.0</title><style>{css}</style></head><body>
<div class="cover">
  <div class="brand">LAVIANN</div>
  <div class="overline">Single vendor / Mauritius / Proof of concept</div>
  <h1>Laviann.</h1>
  <h2>Product Requirements<br/>Document</h2>
  <div class="line"></div>
  <p class="tagline">A mobile-first raw meat ordering experience and a focused vendor workspace for quotations, inventory and region-based deliveries.</p>
  <div class="metadata">
    <div><b>DOCUMENT</b><br/>Product Requirements / PRD v1.0<br/>Initial product planning baseline</div>
    <div><b>PREPARED</b><br/>14 October 2026<br/>Mauritius</div>
  </div>
</div>
<div class="toc">
  <div class="eyebrow">DOCUMENT GUIDE</div>
  <h2>Contents</h2>
  <ol>{links}</ol>
  <p class="note">Working baseline for a vendor pitch. All product prices, delivery fees, scheduled days and inventory figures are illustrative until validated with the vendor.</p>
</div>
<article class="doc">{body}</article>
</body></html>'''

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
HTML(string=page, base_url=str(ROOT)).write_pdf(str(OUTPUT))
print(f'Wrote {OUTPUT} ({OUTPUT.stat().st_size:,} bytes; {len(headings)} sections)')
