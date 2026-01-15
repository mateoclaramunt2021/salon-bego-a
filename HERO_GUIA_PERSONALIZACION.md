# 🎬 HERO PREMIUM - GUÍA DE USO Y PERSONALIZACIÓN

## 📌 UBICACIÓN DEL HERO

El nuevo hero está en: **`index.html` (líneas 36-56)**

```html
<!-- Hero Premium Fullscreen -->
<section class="hero-fullscreen">
    <!-- Contenido del hero -->
</section>
```

---

## 🎨 PERSONALIZACIONES COMUNES

### 1️⃣ CAMBIAR LA IMAGEN DE FONDO

**Ubicación**: `styles.css` línea ~333

**Actual**:
```css
background-image: url('/assets/imagen sala.webp');
```

**Para cambiar**:
1. Coloca tu imagen en `/assets/`
2. Reemplaza la ruta:
```css
background-image: url('/assets/tu-imagen.jpg');
```

**Recomendaciones**:
- Tamaño: 1920x1080px mínimo
- Formato: JPG o WebP (más rápido)
- Peso: < 300KB (optimiza en TinyPNG.com)
- Contenido: Foto editorial/modelo cabello

---

### 2️⃣ CAMBIAR LOS TEXTOS

**Ubicación**: `index.html` líneas 39-48

**Título** (Cambia el H1):
```html
<h1 class="hero-fullscreen__title">
    Tu nuevo título aquí<br>
    Línea 2<br>
    Línea 3.
</h1>
```

**Subtítulo** (Cambia el párrafo):
```html
<p class="hero-fullscreen__subtitle">
    Tu nuevo subtítulo aquí
</p>
```

---

### 3️⃣ CAMBIAR LOS BOTONES

**Ubicación**: `index.html` líneas 51-55

```html
<!-- Botón Primario -->
<a href="pages/contacto.html" class="btn btn--primary btn--lg">
    Tu texto aquí
</a>

<!-- Botón Secundario -->
<a href="tel:+34602449995" class="btn btn--secondary btn--lg">
    Tu texto aquí
</a>
```

---

### 4️⃣ CAMBIAR COLORES

**Ubicación**: `styles.css` línea ~19 (variables)

```css
:root {
    --color-gold: #C8A25A;      /* Color botones, logo */
    --color-white: #F5F1EC;     /* Color texto principal */
    --color-dark: #0F1115;      /* Fondo header */
}
```

**Ejemplo cambiar dorado**:
```css
--color-gold: #D4AF37;  /* Dorado más brillante */
```

---

### 5️⃣ CAMBIAR TAMAÑO DEL TEXTO

**Ubicación**: `styles.css` líneas ~360-380

```css
.hero-fullscreen__title {
    font-size: clamp(2.5rem, 8vw, 4rem);  /* Min, preferido, max */
}

.hero-fullscreen__subtitle {
    font-size: var(--font-size-md);  /* 18px */
}
```

**Notas**:
- `clamp()` = responsive automático
- Cambiar solo el máximo (ej: `4.5rem` para más grande)

---

### 6️⃣ CAMBIAR EL OVERLAY OSCURO

**Ubicación**: `styles.css` línea ~339

```css
.hero-fullscreen::before {
    background: linear-gradient(90deg, 
        rgba(15,17,21,0.75) 0%,      /* Izquierda: más oscuro */
        rgba(15,17,21,0.35) 55%,     /* Centro: medio */
        rgba(15,17,21,0.10) 100%     /* Derecha: más claro */
    );
}
```

**Para más oscuridad**:
```css
rgba(15,17,21,0.85) 0%,    /* Aumenta 0.85 */
```

**Para más claridad**:
```css
rgba(15,17,21,0.65) 0%,    /* Reduce a 0.65 */
```

---

### 7️⃣ CAMBIAR VELOCIDAD DE ANIMACIONES

**Ubicación**: `styles.css` línea ~387

```css
.hero-fullscreen__content {
    animation: fadeIn 1s ease-out;  /* 1s = duración */
}

.hero-fullscreen__text {
    animation: slideInLeft 0.8s ease-out;  /* 0.8s = duración */
}
```

**Más rápido**: Cambia `1s` a `0.5s`  
**Más lento**: Cambia `1s` a `2s`

---

## 🔧 AJUSTES TÉCNICOS AVANZADOS

### Parallax Scroll (Efecto de Profundidad)

Ya está activado con:
```css
background-attachment: fixed;
```

Para desactivarlo:
```css
background-attachment: scroll;  /* Muévete con la página */
```

---

### Cambiar Alineación del Contenido

**Actual**: Alineado a la izquierda

Para centrar:
```css
.hero-fullscreen {
    justify-content: center;  /* Centro en lugar de flex-start */
}
```

Para alinear a la derecha:
```css
.hero-fullscreen {
    justify-content: flex-end;  /* Derecha */
}
```

---

### Cambiar Altura del Hero

**Actual**: `height: 100vh;` (pantalla completa)

Para 80% de la pantalla:
```css
.hero-fullscreen {
    height: 80vh;  /* 80% viewport height */
}
```

---

## 📱 TESTING RESPONSIVO

### En Navegador (Chrome/Firefox)
1. Abre `http://localhost:8080`
2. Presiona **F12** (Developer Tools)
3. Click en **dispositivo (📱)** icon
4. Selecciona "iPhone 12" o "Tablet"
5. Verifica que se vea bien

### En Móvil Real
1. En el mismo WiFi que tu PC
2. Obtén IP del PC: `ipconfig` (Windows)
3. Abre en móvil: `http://TU_IP:8080`
4. Verifica botones, tamaño texto, etc.

---

## 🎯 CHECKLIST DE CUSTOMIZACIÓN

- [ ] Imagen de fondo personalizada
- [ ] Título y subtítulo actualizados
- [ ] Botones con texto correcto
- [ ] Colores ajustados a tu marca
- [ ] Probado en móvil
- [ ] Probado en tablet
- [ ] Probado en desktop
- [ ] Links funcionan correctamente
- [ ] Teléfono actualizado en botón "Llamar"

---

## ⚠️ ERRORES COMUNES

### "La imagen no se ve"
✅ **Solución**: Revisa que la ruta sea correcta
```css
background-image: url('/assets/mi-imagen.webp');
/* Nota: Comienza con / */
```

### "El texto no se lee"
✅ **Solución**: Aumenta la opacidad del overlay
```css
rgba(15,17,21,0.85) 0%,  /* Más opaco */
```

### "Los botones se superponen en móvil"
✅ **Solución**: Ya está resuelto en CSS responsive (auto stack)

### "La imagen se ve pixelada"
✅ **Solución**: Usa imagen más grande (1920x1080px mínimo)

---

## 🚀 OPTIMIZACIÓN PARA PRODUCCIÓN

Antes de publicar:

1. **Optimiza imagen**
   - Descarga en TinyPNG.com
   - Máximo 200KB

2. **Minifica CSS**
   - Online en cssminifier.com

3. **Comprime JavaScript**
   - Ya optimizado (no toques)

4. **Valida HTML**
   - Validator.w3.org

5. **Test velocidad**
   - PageSpeed Insights
   - GTmetrix

---

## 📞 CONTACTO Y AYUDA

Si necesitas cambiar algo más:

1. **Documentación**: Lee `HERO_PREMIUM_ACTUALIZADO.md`
2. **Detalles técnicos**: Lee `CAMBIOS_HERO_DETALLES.md`
3. **Imágenes**: Lee `README_HERO.md`

---

## ✨ RESULTADO

Con esta guía puedes:
✅ Personalizar completamente el hero  
✅ Cambiar imagen, texto, colores  
✅ Ajustar animaciones  
✅ Optimizar para velocidad  

**Tu hero es completamente flexible y profesional.**

---

Última actualización: 8 Enero 2026  
Status: ✅ Documentado y Listo
