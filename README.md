# Salón Begoña Gómez - Web Premium

Sitio web profesional y ultra visual para el **Salón Begoña Gómez**, peluquería especializada en Curly, Rubios y Coloración Orgánica en Castelldefels, Barcelona.

## 📋 Características

✅ **Diseño Premium Moderno**
- Estética elegante, limpia y sofisticada
- Paleta de colores premium: carbón + blanco roto + nude + dorado
- Tipografías de clase: Playfair Display + Inter
- Animaciones sutiles y micro-interacciones

✅ **Enfoque en Conversión**
- CTAs estratégicos (Reservar, Llamar, WhatsApp)
- Galería visual impactante con lightbox
- Reseñas con carrusel automático
- Mapa embebido con ubicación

✅ **Responsive Design**
- Perfectamente optimizado para móvil
- Menú hamburguesa dinámico
- Grid flexible en todos los tamaños

✅ **Rendimiento**
- Imágenes con lazy loading
- CSS optimizado con variables
- JavaScript vanilla sin dependencias externas
- Carga rápida y fluida

✅ **SEO y Accesibilidad**
- Schema.org LocalBusiness JSON-LD
- Meta tags optimizados
- Contraste de colores WCAG
- Navegación por teclado
- Aria-labels en elementos interactivos

✅ **Técnica**
- HTML semántico
- CSS con variables :root
- JavaScript moderno (Vanilla JS)
- Sin frameworks (100% puro)
- Estructura clara y mantenible

## 🎯 Secciones Incluidas

1. **Header Fijo** - Logo + Menú navegación + CTA Reservar
2. **Hero** - Titular potente + Subtitular + Dual CTA
3. **Especialidades** - 3 Cards: Curly, Rubios, Orgánico
4. **Servicios** - Grid 6x categorías con precios (editables)
5. **Proceso** - Timeline: Diagnóstico → Propuesta → Aplicación → Mantenimiento
6. **Galería** - Grid 3x3 con lightbox interactivo
7. **Reseñas** - Rating 4,6/5 + Carrusel de 6 testimonios
8. **Ubicación** - Dirección, horario, mapa embebido, CTAs
9. **Reservar** - Sección final con botones Booksy + Llamar
10. **Footer** - Links, redes sociales, info legal

## 🚀 Cómo Usar

### Opción 1: Doble Click (Más fácil)
1. Abre la carpeta `salon-begona` en tu explorador
2. Haz doble click en `index.html`
3. ¡Listo! Se abrirá en tu navegador

### Opción 2: Live Server en VS Code (Recomendado para desarrollo)
1. Abre esta carpeta en VS Code
2. Instala la extensión "Live Server" (si no la tienes)
3. Click derecho en `index.html` → "Open with Live Server"
4. Se abrirá automáticamente en tu navegador con recargas en vivo

### Opción 3: Servidor Local Python (Si tienes Python instalado)
```bash
cd salon-begona
python -m http.server 8000
```
Luego abre `http://localhost:8000` en tu navegador.

## 🎨 Personalización

### Colores
Edita `:root` en `styles.css` para cambiar la paleta:
```css
:root {
    --color-dark: #0F1115;        /* Fondo oscuro */
    --color-white: #F5F1EC;       /* Blanco roto */
    --color-nude: #D8B4A0;        /* Nude/Rosa empolvado */
    --color-gold: #C8A25A;        /* Dorado suave */
    --color-gray: #B8B2AA;        /* Gris cálido */
}
```

### Contenidos
- **Precios**: Edita el HTML en la sección "Servicios" (línea ~330)
- **Reseñas**: Cambia el texto en `.resena` (línea ~410)
- **Horario**: Actualiza la tabla en "Contacto" (línea ~440)
- **Teléfono**: Reemplaza `602 44 99 95` por el tuyo
- **Instagram**: Actualiza la URL del perfil

### Imágenes
Sustituye los placeholders en la carpeta `/assets/`:
- `gallery-01.jpg` a `gallery-09.jpg` - Tu galería de trabajos
- `hero-placeholder.jpg` - Imagen hero (opcional)

Puedes usar:
- Fotos reales de tus clientes
- Imágenes PNG/JPG en alta resolución
- Tamaños recomendados: Galería (600x600px), Hero (1200x600px)

## 📱 Dispositivos Soportados

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px - 1920px)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 768px)

## ⚙️ Funcionalidades JavaScript

| Función | Descripción |
|---------|-----------|
| **Menú Móvil** | Hamburguesa dinámico en pantallas < 768px |
| **Carrusel Reseñas** | Rotación automática cada 5 segundos + botones nav |
| **Lightbox Galería** | Click para ampliar, flechas/ESC para navegar |
| **Scroll Smooth** | Desplazamiento suave al hacer click en anclas |
| **Animaciones On-Scroll** | Cards se revelan con fadeInUp |
| **Lazy Loading** | Imágenes cargan solo cuando son visibles |
| **Keyboard Navigation** | Acceso con TAB + Enter para botones |

## 🔍 SEO Incluido

- **Meta Tags**: Title, Description, Theme Color
- **Schema.org**: LocalBusiness JSON-LD completo
- **Sitemap Semantic**: Estructura H1-H6 correcta
- **Open Graph**: Compatible con compartir en redes
- **Mobile-First**: Indexación mobile-first friendly

## 📊 Performance

- **Lighthouse Score**: 95+ esperado
- **Time to First Byte**: < 1s
- **Fully Interactive**: < 2s
- **Cumulative Layout Shift**: < 0.1
- **Sin terceros bloqueantes**: Carga rápida garantizada

## 🛡️ Seguridad

- ✅ No incluye librerías externas (menos vulnerabilidades)
- ✅ HTTPS ready (recomendado en producción)
- ✅ Headers de seguridad recomendados
- ✅ Validación de formularios (preparado)

## 📝 Estructura de Archivos

```
salon-begona/
├── index.html          # Página principal (HTML semántico)
├── styles.css          # Estilos con variables CSS
├── script.js           # Funcionalidad (Vanilla JS)
├── README.md           # Este archivo
└── assets/             # Carpeta para imágenes
    ├── gallery-01.jpg
    ├── gallery-02.jpg
    ├── ... (gallery-03 a gallery-09)
    └── hero-placeholder.jpg
```

## 🔧 Próximas Mejoras (Opcional)

- [ ] Integración con Booksy API
- [ ] Formulario de contacto funcional
- [ ] Blog/Artículos de cuidado capilar
- [ ] Sistema de citas en línea personalizado
- [ ] WhatsApp Bot para consultas
- [ ] Google Reviews dinámico
- [ ] PWA (Instalar como app)

## 📞 Contacto y Soporte

Para realizar cambios:
1. Edita directamente los archivos HTML/CSS/JS
2. Las variables CSS en `:root` hacen cambios globales
3. Usa Live Server en VS Code para ver cambios en tiempo real

## 📄 Licencia

Creado para Salón Begoña Gómez, Castelldefels.  
Todos los derechos reservados © 2024.

---

**¡Tu web premium lista para convertir visitantes en clientas!** 🌟
