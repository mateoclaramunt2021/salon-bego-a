#!/usr/bin/env python3
# -*- coding: utf-8 -*-

path = r'c:\Users\perez\OneDrive\Escritorio\MATEO\Salón Begoña Gómez\salon-begona\styles.css'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix line 388 (index 387)
print(f"Line 388 before: {repr(lines[387])}")
if 'grid-column: 1;`n}' in lines[387]:
    lines[387] = '}\n'
print(f"Line 388 after: {repr(lines[387])}")

# Fix line 1489 (index 1488)  
print(f"\nLine 1489 before: {repr(lines[1488])}")
if 'grid-column: 1;`n}' in lines[1488]:
    lines[1488] = '}\n'
print(f"Line 1489 after: {repr(lines[1488])}")

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
    
print("\nFixed!")
