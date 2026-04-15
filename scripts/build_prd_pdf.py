#!/usr/bin/env python3
"""Generate PDF for CapitalBridge PRD in Clikalia-inspired style."""

import markdown
from weasyprint import HTML, CSS
from pathlib import Path

MD_PATH = Path("docs/prd_capitalbridge.md")
PDF_PATH = Path("docs/prd_capitalbridge.pdf")

md_text = MD_PATH.read_text(encoding="utf-8")

# Convert markdown to HTML
html_body = markdown.markdown(
    md_text,
    extensions=["tables", "fenced_code", "sane_lists"],
)

# Post-process: style severity markers
html_body = html_body.replace("<strong>! ", '<strong class="sev-high">! ')
html_body = html_body.replace("<strong>~ ", '<strong class="sev-mid">~ ')

# Full HTML with embedded CSS inspired by Clikalia PRD style
html_doc = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>PRD — CapitalBridge</title>
</head>
<body>
<header class="doc-header">
  <div class="brand">CAPITALBRIDGE · PRODUCT</div>
  <div class="brand-right">PRD — CapitalBridge · Draft v0.1</div>
</header>
<main>
{html_body}
</main>
</body>
</html>
"""

css = CSS(string="""
@page {
    size: A4;
    margin: 18mm 16mm 16mm 16mm;
    @bottom-left {
        content: "CAPITALBRIDGE · PRODUCT";
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 8pt;
        color: #8a8a8a;
        letter-spacing: 0.1em;
    }
    @bottom-right {
        content: "PRD — CapitalBridge · Draft v0.1 · p. " counter(page);
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 8pt;
        color: #8a8a8a;
    }
}

:root {
    --accent: #e85d3d;
    --ink: #1a1a1a;
    --muted: #6b6b6b;
    --line: #e5e5e5;
    --bg-soft: #fafafa;
    --sev-high: #c8472b;
    --sev-mid: #b88a20;
}

* { box-sizing: border-box; }

body {
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 9.5pt;
    line-height: 1.5;
    color: var(--ink);
    margin: 0;
    padding: 0;
}

.doc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8pt;
    color: var(--muted);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--ink);
    margin-bottom: 20px;
}

.brand { font-weight: 700; color: var(--ink); }

h1 {
    font-size: 22pt;
    font-weight: 700;
    margin: 6px 0 2px 0;
    letter-spacing: -0.01em;
}

h1 + p {
    font-size: 9pt;
    color: var(--muted);
    margin: 0 0 24px 0;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--line);
}

h2 {
    font-size: 14pt;
    font-weight: 700;
    margin: 28px 0 10px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--line);
    page-break-after: avoid;
    color: var(--ink);
}

/* Section numbers accent */
h2::first-letter { color: var(--accent); }

h3 {
    font-size: 10.5pt;
    font-weight: 700;
    margin: 16px 0 6px 0;
    color: var(--ink);
    page-break-after: avoid;
}

p { margin: 0 0 10px 0; text-align: justify; }

hr {
    border: none;
    border-top: 1px solid var(--line);
    margin: 18px 0;
}

strong { font-weight: 700; }

strong.sev-high {
    color: var(--sev-high);
    font-weight: 700;
}

strong.sev-mid {
    color: var(--sev-mid);
    font-weight: 700;
}

ul, ol {
    margin: 0 0 12px 0;
    padding-left: 18px;
}

li {
    margin-bottom: 4px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 16px 0;
    font-size: 9pt;
    page-break-inside: avoid;
}

th {
    background: var(--bg-soft);
    border-bottom: 2px solid var(--ink);
    padding: 7px 8px;
    text-align: left;
    font-weight: 700;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

td {
    padding: 7px 8px;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
}

tr:nth-child(even) td { background: var(--bg-soft); }

code {
    font-family: 'Courier', monospace;
    font-size: 8.5pt;
    background: var(--bg-soft);
    padding: 1px 4px;
    border-radius: 2px;
    color: var(--accent);
}

em {
    color: var(--muted);
    font-style: italic;
}

blockquote {
    border-left: 3px solid var(--accent);
    padding: 6px 0 6px 14px;
    margin: 12px 0;
    color: var(--muted);
    font-size: 9pt;
    font-style: italic;
    background: var(--bg-soft);
    page-break-inside: avoid;
}

/* Keep sections together where possible */
h2 + p, h2 + ul, h2 + table { page-break-before: avoid; }

/* Persona / problem entries */
p strong:first-child {
    display: inline-block;
    margin-bottom: 2px;
}

/* Closing note */
main > p:last-child {
    margin-top: 24px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
    font-size: 8.5pt;
    color: var(--muted);
    font-style: italic;
    text-align: center;
}
""")

HTML(string=html_doc).write_pdf(str(PDF_PATH), stylesheets=[css])
print(f"PDF generated: {PDF_PATH} ({PDF_PATH.stat().st_size // 1024} KB)")
