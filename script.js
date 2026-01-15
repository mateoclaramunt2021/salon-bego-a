/* ============================================
   SALÓN BEGOÑA GÓMEZ - JAVASCRIPT
   ============================================ */

// Utilidades
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ============================================
// 1. NAVEGACIÓN MÓVIL
// ============================================

function initMobileNav() {
    const navToggle = $('#navToggle');
    const mainNav = $('#mainNav');
    const navLinks = $$('.nav__link');

    if (!navToggle) return;

    navToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // Cerrar menú al hacer click en un link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('active');
        });
    });

    // Cerrar menú al hacer scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 0) {
            mainNav.classList.remove('active');
        }
    });
}

// ============================================
// 2. CARRUSEL DE RESEÑAS
// ============================================

class ReviewCarousel {
    constructor() {
        this.currentIndex = 0;
        this.reviews = $$('.resena');
        this.prevBtn = $('#resenaPrev');
        this.nextBtn = $('#resenaNext');
        
        if (this.reviews.length === 0) return;

        this.init();
    }

    init() {
        this.showReview(0);
        
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Cambio automático cada 5 segundos
        setInterval(() => this.next(), 5000);
    }

    showReview(index) {
        this.reviews.forEach((review, i) => {
            review.classList.remove('active');
            if (i === index) {
                review.classList.add('active');
            }
        });
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.reviews.length;
        this.showReview(this.currentIndex);
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.reviews.length) % this.reviews.length;
        this.showReview(this.currentIndex);
    }
}

// ============================================
// 3. LIGHTBOX DE GALERÍA
// ============================================

class Lightbox {
    constructor() {
        this.galleryItems = $$('[data-lightbox="gallery"]');
        this.lightbox = $('#lightbox');
        this.lightboxImage = $('.lightbox__image');
        this.closeBtn = $('.lightbox__close');
        this.prevBtn = $('.lightbox__prev');
        this.nextBtn = $('.lightbox__next');
        this.currentIndex = 0;

        if (this.galleryItems.length === 0) return;

        this.init();
    }

    init() {
        // Click en imágenes
        this.galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.open(index);
            });
        });

        // Controles del lightbox
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Cerrar con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        // Cerrar al hacer click fuera
        this.lightbox?.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.close();
            }
        });
    }

    open(index) {
        this.currentIndex = index;
        this.updateImage();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateImage() {
        const item = this.galleryItems[this.currentIndex];
        const img = item.querySelector('img');
        this.lightboxImage.src = img.src;
        this.lightboxImage.alt = img.alt;
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.galleryItems.length;
        this.updateImage();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.galleryItems.length) % this.galleryItems.length;
        this.updateImage();
    }
}

// ============================================
// 4. ANIMACIONES AL SCROLL
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar cards y elementos especiales
    $$('.card, .servicio, .proceso__step').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// 5. SMOOTH SCROLL PARA ANCLAS
// ============================================

function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = $(href);
            if (!target) return;

            e.preventDefault();

            const headerHeight = 70;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// ============================================
// 6. LAZY LOADING DE IMÁGENES
// ============================================

function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        $$('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ============================================
// 7. MICRO-INTERACCIONES
// ============================================

function initHoverEffects() {
    // Efecto hover en cards
    $$('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });

    // Efecto en botones
    $$('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// ============================================
// 8. ACCESIBILIDAD - MANEJO DE TECLADO
// ============================================

function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        // Saltar a contenido principal con "Skip to content"
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });
}

// ============================================
// 9. TRACKING SIMPLE (SIN COOKIES INVASIVAS)
// ============================================

function trackEvent(eventName, eventData = {}) {
    // Útil para futuras integraciones con Google Analytics
    if (window.gtag) {
        gtag('event', eventName, eventData);
    }
}

// Rastrear clics en CTAs principales
$$('[data-track]').forEach(element => {
    element.addEventListener('click', function() {
        const trackName = this.dataset.track;
        trackEvent('cta_click', {
            button: trackName,
            timestamp: new Date().toISOString()
        });
    });
});

// ============================================
// 10. INICIALIZACIÓN PRINCIPAL
// ============================================

function init() {
    console.log('🏛️ Inicializando Salón Begoña Gómez...');

    // Inicializar componentes
    initMobileNav();
    new ReviewCarousel();
    new Lightbox();
    initScrollAnimations();
    initSmoothScroll();
    initLazyLoading();
    initHoverEffects();
    initKeyboardNav();

    // Variables para debugging
    window.salonDebug = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        performance: {
            navigationTiming: performance.getEntriesByType('navigation')[0]
        }
    };

    console.log('✅ Salón Begoña Gómez cargado correctamente');
    console.log('📊 Debug info:', window.salonDebug);
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================
// 11. UTILIDADES ADICIONALES
// ============================================

// Función para añadir logs en desarrollo
const log = (message, data = null) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[Salón Begoña] ${message}`, data || '');
    }
};

// Detección de navegador
const browser = {
    isIE: !!document.documentMode,
    isEdge: /Edge/.test(navigator.userAgent),
    isChrome: /Chrome/.test(navigator.userAgent),
    isFirefox: /Firefox/.test(navigator.userAgent),
    isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
    isMobile: /Mobile|Android|iPhone/.test(navigator.userAgent)
};

// Notificar incompatibilidades
if (browser.isIE) {
    console.warn('⚠️ IE no es soportado. Por favor usa Chrome, Firefox, Safari o Edge.');
}
// ============================================
// MODAL SELECTOR DE SEDE (Reservar)
// ============================================

function initReservaModal() {
    const reservarBtn = document.querySelector('.header .btn--primary');
    
    if (!reservarBtn) return;

    reservarBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Crear modal dinámico
        let modal = document.getElementById('reserva-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'reserva-modal';
            modal.className = 'reserva-modal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Elige tu Sede</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-options">
                        <a href="pages/contacto.html#castelldefels" class="modal-option">
                            <h4>Castelldefels</h4>
                            <p>+34 602 44 99 95</p>
                        </a>
                        <a href="pages/contacto.html#santa-perpeuta" class="modal-option">
                            <h4>Santa Perpètua</h4>
                            <p>+34 672 92 83 74</p>
                        </a>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Cerrar modal
            modal.querySelector('.modal-close').addEventListener('click', closeModal);
            modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
            
            function closeModal() {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        }
        
        modal.classList.add('active');
    });
}

// Inicializar en DOM ready
document.addEventListener('DOMContentLoaded', initReservaModal);