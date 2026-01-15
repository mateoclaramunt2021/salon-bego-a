/**
 * COOKIES MANAGER
 * Sistema de gestión de consentimiento de cookies con granularidad
 * Cumplimiento: RGPD, ePrivacy Directive, LSSI-CE, LOPDGDD
 * 
 * Funcionalidades:
 * - Banner inicial con opciones: Aceptar Todas, Rechazar, Personalizar
 * - Modal de configuración granular (Necesarias, Analíticas, Marketing)
 * - Bloqueo de scripts hasta consentimiento
 * - Almacenamiento en localStorage
 * - Reabrir preferencias desde footer
 */

(function() {
    'use strict';

    // ===================================================
    // CONFIGURACIÓN
    // ===================================================

    const COOKIE_CONSENT_NAME = 'sb_cookie_consent';
    const COOKIE_EXPIRY_DAYS = 365; // 12 meses

    // Categorías de cookies y sus scripts asociados
    const COOKIE_CATEGORIES = {
        necessary: {
            name: 'Cookies Necesarias',
            enabled: true, // Siempre activas
            scripts: [] // No hay scripts externos para necesarias
        },
        analytics: {
            name: 'Cookies Analíticas',
            enabled: false, // Por defecto desactivadas
            // TODO: Descomenta cuando uses Google Analytics
            scripts: [
                // {
                //     id: 'ga-script',
                //     src: 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID',
                //     async: true,
                //     inline: `
                //         window.dataLayer = window.dataLayer || [];
                //         function gtag(){dataLayer.push(arguments);}
                //         gtag('js', new Date());
                //         gtag('config', 'GA_MEASUREMENT_ID');
                //     `
                // }
            ]
        },
        marketing: {
            name: 'Cookies de Marketing',
            enabled: false, // Por defecto desactivadas
            // TODO: Descomenta cuando uses Facebook Pixel, Google Ads, etc.
            scripts: [
                // {
                //     id: 'fb-pixel',
                //     src: null,
                //     inline: `
                //         !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                //         n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                //         // ... Facebook Pixel code
                //     `
                // }
            ]
        }
    };

    // ===================================================
    // CLASE PRINCIPAL
    // ===================================================

    class CookiesManager {
        constructor() {
            this.preferences = this.loadPreferences();
            this.bannerElement = null;
            this.modalElement = null;
            this.init();
        }

        /**
         * Carga preferencias guardadas o devuelve defaults
         */
        loadPreferences() {
            const stored = localStorage.getItem(COOKIE_CONSENT_NAME);
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error('Error parsing cookie preferences:', e);
                }
            }
            
            // Preferencias por defecto
            return {
                necessary: true,
                analytics: false,
                marketing: false,
                timestamp: new Date().toISOString()
            };
        }

        /**
         * Guarda preferencias en localStorage y cookie técnica
         */
        savePreferences(preferences) {
            this.preferences = preferences;
            const now = new Date();
            const expires = new Date(now.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

            // localStorage
            localStorage.setItem(COOKIE_CONSENT_NAME, JSON.stringify(preferences));

            // Cookie técnica (necesaria para recordar)
            document.cookie = `${COOKIE_CONSENT_NAME}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

            // Cargar scripts si aplica
            this.loadScripts();
        }

        /**
         * Inicializa el banner y modal
         */
        init() {
            // Siempre mostrar el banner cuando se carga la página
            this.showBanner();
            
            // Si ya ha dado consentimiento, cargar scripts
            if (this.hasConsented()) {
                this.loadScripts();
            }

            this.attachEventListeners();
        }

        /**
         * Verifica si el usuario ya ha dado consentimiento
         */
        hasConsented() {
            return localStorage.getItem(COOKIE_CONSENT_NAME) !== null;
        }

        /**
         * Muestra el banner
         */
        showBanner() {
            const banner = document.getElementById('cookie-banner');
            if (banner) {
                banner.classList.add('active');
            }
        }

        /**
         * Oculta el banner
         */
        hideBanner() {
            const banner = document.getElementById('cookie-banner');
            if (banner) {
                banner.classList.remove('active');
            }
        }

        /**
         * Abre el modal de configuración
         */
        openModal() {
            const modal = document.getElementById('cookie-modal');
            if (modal) {
                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
                // Focus en el primer toggle para accesibilidad
                setTimeout(() => {
                    const firstToggle = modal.querySelector('.cookie-toggle');
                    if (firstToggle && !firstToggle.disabled) firstToggle.focus();
                }, 100);
            }
        }

        /**
         * Cierra el modal
         */
        closeModal() {
            const modal = document.getElementById('cookie-modal');
            if (modal) {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
            }
        }

        /**
         * Acepta todas las cookies
         */
        acceptAll() {
            const preferences = {
                necessary: true,
                analytics: true,
                marketing: true,
                timestamp: new Date().toISOString()
            };
            this.savePreferences(preferences);
            this.hideBanner();
            this.closeModal();
            console.log('Cookies: Todas aceptadas');
        }

        /**
         * Rechaza todo excepto necesarias
         */
        rejectAll() {
            const preferences = {
                necessary: true,
                analytics: false,
                marketing: false,
                timestamp: new Date().toISOString()
            };
            this.savePreferences(preferences);
            this.hideBanner();
            this.closeModal();
            console.log('Cookies: Solo necesarias aceptadas');
        }

        /**
         * Guarda preferencias personalizadas desde modal
         */
        saveCustom() {
            const preferences = {
                necessary: true, // Siempre activa
                analytics: document.getElementById('cookie-analytics').checked || false,
                marketing: document.getElementById('cookie-marketing').checked || false,
                timestamp: new Date().toISOString()
            };
            this.savePreferences(preferences);
            this.hideBanner();
            this.closeModal();
            console.log('Cookies: Preferencias personalizadas guardadas', preferences);
        }

        /**
         * Carga scripts externos basado en consentimiento
         */
        loadScripts() {
            Object.entries(COOKIE_CATEGORIES).forEach(([category, config]) => {
                if (this.preferences[category] && config.scripts.length > 0) {
                    config.scripts.forEach(script => {
                        this.loadScript(script);
                    });
                }
            });
        }

        /**
         * Carga un script específico
         */
        loadScript(scriptConfig) {
            // Evitar cargar duplicados
            if (document.getElementById(scriptConfig.id)) {
                return;
            }

            if (scriptConfig.src) {
                // Script externo
                const script = document.createElement('script');
                script.id = scriptConfig.id;
                script.src = scriptConfig.src;
                if (scriptConfig.async) script.async = true;
                if (scriptConfig.defer) script.defer = true;
                document.head.appendChild(script);
                console.log(`Script cargado: ${scriptConfig.id}`);
            }

            if (scriptConfig.inline) {
                // Script inline
                const script = document.createElement('script');
                script.id = scriptConfig.id;
                script.textContent = scriptConfig.inline;
                document.head.appendChild(script);
                console.log(`Script inline cargado: ${scriptConfig.id}`);
            }
        }

        /**
         * Actualiza valores en el modal según preferencias actuales
         */
        updateModalUI() {
            document.getElementById('cookie-necessary').checked = this.preferences.necessary;
            document.getElementById('cookie-analytics').checked = this.preferences.analytics;
            document.getElementById('cookie-marketing').checked = this.preferences.marketing;
        }

        /**
         * Adjunta event listeners a botones y elementos
         */
        attachEventListeners() {
            // Banner
            const rejectBtn = document.getElementById('cookie-reject-btn');
            const configureBtn = document.getElementById('cookie-configure-btn');
            const acceptBtn = document.getElementById('cookie-accept-btn');

            if (rejectBtn) rejectBtn.addEventListener('click', () => this.rejectAll());
            if (configureBtn) configureBtn.addEventListener('click', () => this.openModal());
            if (acceptBtn) acceptBtn.addEventListener('click', () => this.acceptAll());

            // Modal
            const closeBtn = document.getElementById('cookie-modal-close');
            const saveBtn = document.getElementById('cookie-modal-save');
            const backdrop = document.querySelector('.cookie-modal__backdrop');

            if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
            if (saveBtn) saveBtn.addEventListener('click', () => this.saveCustom());
            if (backdrop) backdrop.addEventListener('click', () => this.closeModal());

            // Cerrar modal con ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeModal();
            });

            // "Configurar Cookies" en footer
            const cookieSettingsLinks = document.querySelectorAll('.cookie-settings-trigger');
            cookieSettingsLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.updateModalUI();
                    this.openModal();
                });
            });

            // Necesarias: siempre marcada y deshabilitada
            const necessaryToggle = document.getElementById('cookie-necessary');
            if (necessaryToggle) {
                necessaryToggle.disabled = true;
                necessaryToggle.checked = true;
            }

            // Actualizar modal si ya existe
            this.updateModalUI();
        }
    }

    // ===================================================
    // INICIALIZACIÓN CUANDO EL DOM ESTÁ LISTO
    // ===================================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new CookiesManager();
        });
    } else {
        new CookiesManager();
    }

    // ===================================================
    // FUNCIONES GLOBALES (acceso desde HTML)
    // ===================================================

    window.openCookieSettings = function() {
        const banner = document.getElementById('cookie-banner');
        if (banner && banner.classList.contains('active')) {
            // Si el banner está visible, simulamos click en "Personalizar"
            document.getElementById('cookie-configure-btn').click();
        }
    };

    // ===================================================
    // EXPORTAR PARA USO EXTERNO (si es necesario)
    // ===================================================

    window.CookiesManager = CookiesManager;

    // ===================================================
    // DEBUG (Solo en desarrollo - comentar en producción)
    // ===================================================

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.debugCookies = {
            getPreferences: () => JSON.parse(localStorage.getItem(COOKIE_CONSENT_NAME)),
            clearConsent: () => {
                localStorage.removeItem(COOKIE_CONSENT_NAME);
                document.cookie = `${COOKIE_CONSENT_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                location.reload();
            },
            acceptAll: () => document.getElementById('cookie-accept-btn').click(),
            rejectAll: () => document.getElementById('cookie-reject-btn').click(),
            openModal: () => document.getElementById('cookie-configure-btn').click(),
        };
        console.log('🍪 Debug cookies disponible: window.debugCookies');
    }

})();
