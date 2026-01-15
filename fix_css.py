#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re

with open('styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the corrupted line with grid-column
content = content.replace("grid-column: 1;`n}", "grid-column: 1;\n}")

# Add the hero-ctas-wrapper class if it doesn't exist
if '.hero-ctas-wrapper {' not in content:
    # Find the position after .hero-zone-actions
    pattern = r'(\.hero-zone-actions\s*\{[^}]*\n\})'
    replacement = r'\1\n\n/* COLUMNA DERECHA: CTAs LATERAL */\n.hero-ctas-wrapper {\n    grid-column: 2;\n    grid-row: 1 / 4;\n    display: flex;\n    flex-direction: column;\n    gap: 32px;\n    position: sticky;\n    top: 100px;\n}'
    
    content = re.sub(pattern, replacement, content, count=1)

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(content)

print('CSS actualizado correctamente')
