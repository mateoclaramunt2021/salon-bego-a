# 📸 Configuración de la Imagen Hero

## Imagen Principal del Hero

El hero fullscreen requiere una imagen de fondo premium. Actualmente está configurado para usar:

```
/assets/hero.jpg
```

## 🎯 Especificaciones Recomendadas

- **Dimensiones**: Mínimo 1920x1080px (Full HD)
- **Formato**: JPG o WebP (optimizado para web)
- **Tamaño de archivo**: Máximo 300KB (usar TinyPNG o similar)
- **Tema**: Editorial/Comercial de belleza
  - Modelo con cabello rizado (curly)
  - Modelo con cabello rubio
  - Colores cálidos (dorados, beige, tonos piel)
  - Iluminación profesional
  - Fondo uniforme o blurred para legibilidad del texto

## 📁 Cómo Reemplazar la Imagen

1. **Obtén una imagen premium** de:
   - Unsplash.com (busca: "hair model editorial")
   - Pexels.com (busca: "blonde hair curly")
   - Pixabay.com
   - O usa una foto profesional propia

2. **Optimiza la imagen**:
   - Redimensiona a 1920x1080px
   - Comprime con TinyPNG.com
   - Convierte a WebP si es posible

3. **Reemplaza el archivo**:
   - Copia tu imagen optimizada
   - Pégala en la carpeta `/assets/`
   - Renómbrala como `hero.jpg`

## ✅ Validación

Una vez agregues la imagen:
1. Abre `http://localhost:8080` en el navegador
2. El hero debe mostrar la imagen de fondo con overlay oscuro
3. El texto blanco debe ser legible encima
4. Los botones dorados deben contrastar bien

## 🎨 Alternativa: Usar Imagen Existente

Si prefieres usar una de las imágenes existentes, puedes cambiar en `styles.css`:

```css
.hero-fullscreen {
    background-image: url('/assets/imagen sala.webp');
}
```

O cualquier otra imagen de assets.

---

**Nota**: Sin esta imagen, el hero mostrará solo el overlay oscuro. Reemplázala lo antes posible para el efecto completo.
