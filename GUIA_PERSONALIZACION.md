# Guía de Personalización - Salón Begoña Gómez

## 🎨 Cambios Rápidos de Colores

Abre `styles.css` y edita las variables CSS en `:root` (líneas 10-20):

### Opción 1: Usar los colores predeterminados
Ya están listos con la paleta premium. Perfecto para empezar.

### Opción 2: Personalizar con tus colores
Si tienes colores específicos del logo o Instagram de Begoña:

```css
:root {
    /* Reemplaza estos valores hexadecimales con tus colores */
    --color-dark: #0F1115;        /* Color fondo principal */
    --color-white: #F5F1EC;       /* Blanco/crema */
    --color-nude: #D8B4A0;        /* Accent secundario */
    --color-gold: #C8A25A;        /* Color principal (CTA) */
    --color-gray: #B8B2AA;        /* Gris neutro */
}
```

**Ejemplo:** Si el logo es dorado #D4AF37, cambia:
```css
--color-gold: #D4AF37;
```

## 📝 Cambiar Contenidos

### Precios de Servicios
Busca la sección "Servicios Completos" en `index.html` (línea ~350).
Edita los valores dentro de `<span class="price">desde X€</span>`:

```html
<li><span>Corte de mujer</span> <span class="price">desde 35€</span></li>
<!-- Cambia 35 por tu precio -->
```

### Horario de Apertura
En la sección "Contacto" (línea ~435), edita la tabla:

```html
<table class="horario">
    <tr>
        <td>Lun - Mié, Vie - Sáb</td>
        <td>9:30 - 19:00</td>
    </tr>
    <!-- Cambia los horarios según tu salón -->
</table>
```

### Reseñas de Clientes
Busca `.resena` (línea ~405) y edita el texto y autor:

```html
<div class="resena active">
    <div class="resena__stars">★★★★★</div>
    <p class="resena__text">"Tu reseña aquí..."</p>
    <p class="resena__author">— Nombre de cliente</p>
</div>
```

### Teléfono y WhatsApp
Busca `602 44 99 95` en `index.html` y reemplaza por el tuyo.
Aparece en:
- Header (línea ~65)
- Hero section (línea ~145)
- Contacto (línea ~425)
- Footer (línea ~560)

**Busca y reemplaza:** Ctrl+H en VS Code
- Busca: `602 44 99 95`
- Reemplaza: `tu número`

Haz lo mismo con `+34602449995` (versión con código de país).

### Instagram
Busca `salonbegonagomezbelleza` y reemplaza con tu usuario.

Aparece en:
- Link en Hero (línea ~72)
- Enlace en Reservar (línea ~485)
- Footer (línea ~560)

### Email para WhatsApp
Si quieres usar WhatsApp, mantén el teléfono igual. El enlace es:
```html
<a href="https://wa.me/34602449995">WhatsApp</a>
```

El número debe incluir el código de país (34 para España).

## 🖼️ Actualizar Galería

### Reemplazar imágenes placeholder

1. **Toma fotos de calidad** de tus trabajos:
   - Ángulo frontal del cabello
   - Con buena iluminación
   - Tamaño mínimo: 600x600 píxeles

2. **Guarda en `/assets/`:**
   - `gallery-01.jpg` → Tu primer trabajo
   - `gallery-02.jpg` → Tu segundo trabajo
   - ... hasta `gallery-09.jpg`

3. **Formatos soportados:** JPG, PNG, WebP

### Tamaños recomendados:
- Galería: 600x600 píxeles (cuadradas ideales)
- Hero: 1200x600 píxeles
- Máximo 200KB por imagen (para carga rápida)

### Compresores de imagen online (gratuitos):
- TinyPNG.com
- ImageOptimizer.com
- Squoosh.app (Google)

## 🔧 Cambiar Tipografía

Si no te gusta Playfair Display o Inter, edita en `index.html` (línea ~11):

```html
<!-- Actual -->
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

<!-- Alternativas premium -->
<!-- Opción 1: Elegant -->
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Lato:wght@300;400;500;600&display=swap" rel="stylesheet">

<!-- Opción 2: Modern -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">

<!-- Opción 3: Minimal -->
<link href="https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

Luego actualiza `styles.css`:
```css
:root {
    --font-serif: 'Nueva tipografía serif', serif;  /* Para titulares */
    --font-sans: 'Nueva tipografía sans', sans-serif; /* Para texto */
}
```

## 🌐 Integración con Booksy

El botón "Reservar en Booksy" está en la sección "Reservar" (línea ~480).

Para conectar tu negocio de Booksy:

1. Abre https://booking.com o tu enlace de Booksy
2. Copia la URL de tu perfil
3. En `index.html`, cambia:
```html
<a href="https://booking.com" class="btn btn--primary btn--lg">Reservar en Booksy</a>
```

Por:
```html
<a href="https://booksy.com/es-es/salon-begona-gomez_salon_castelldefels" class="btn btn--primary btn--lg">Reservar en Booksy</a>
```

## 📧 Formulario de Contacto

Actualmente, el formulario es solo visual. Para hacerlo funcional, necesitas:

### Opción 1: Formspree (Gratuito y fácil)
1. Ve a formspree.io
2. Crea una cuenta
3. Crea un formulario nuevo
4. En `index.html`, cambia el `action` del formulario

### Opción 2: EmailJS (Para JavaScript puro)
Permite enviar emails sin servidor backend.

## 📱 Probar en Móvil

### Opción 1: Mismo PC
1. Abre http://localhost:8000 en tu móvil (misma red WiFi)
2. Cambia `localhost` por tu IP: http://192.168.x.x:8000

### Opción 2: Chrome DevTools
1. Abre Chrome → F12 → Ctrl+Shift+M
2. Selecciona "iPhone" o "Android"
3. Redimensiona para ver responsive

## 🚀 Desplegar (Publicar Online)

### Opción 1: Netlify (Gratuito, recomendado)
1. Ve a netlify.com
2. Arrastra la carpeta `salon-begona` 
3. ¡Listo! Tu web estará online en ~30 segundos

### Opción 2: GitHub Pages (Gratuito)
1. Sube a GitHub
2. En Settings → Pages, selecciona la rama
3. Tu web estará en `username.github.io/salon-begona`

### Opción 3: Hosting tradicional
- GoDaddy, Bluehost, etc.
- Sube los archivos vía FTP
- Apunta el dominio al hosting

## ✅ Checklist Antes de Publicar

- [ ] Cambié el teléfono al mío
- [ ] Actualicé el Instagram
- [ ] Edité los precios correctos
- [ ] Cambié el horario
- [ ] Reemplacé las imágenes de galería
- [ ] Probé en móvil
- [ ] Los botones CTA funcionan

## 🐛 Troubleshooting

### Las imágenes no aparecen
- Verifica que estén en `/assets/`
- Que sean JPG o PNG
- Que el nombre sea exacto (sensible a mayúsculas)

### Los colores no cambien
- Borra la caché del navegador (Ctrl+Shift+Del)
- Recarga la página (F5 o Ctrl+R)

### El menú móvil no funciona
- Abre la consola (F12)
- Verifica que no haya errores de JavaScript
- Recarga la página

### La página carga lenta
- Comprime las imágenes (máximo 200KB)
- Verifica el tamaño de las fotos (600x600px es suficiente)

## 📞 Necesitas Ayuda

Si tienes dudas sobre cómo editar:
1. Abre VS Code
2. Presiona Ctrl+H (Buscar y Reemplazar)
3. Busca el texto que quieres cambiar
4. Reemplaza por el nuevo

¡Es tan fácil como encontrar y cambiar texto en Word!

---

**¡Tu web premium está lista para ser personalizada!** ✨
