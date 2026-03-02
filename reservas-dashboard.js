/* =====================================================
   RESERVAS DASHBOARD — SALÓN BEGOÑA GÓMEZ
   =====================================================
   JS completo para:
   - Countdown mensual
   - Tabs de precios
   - Sede toggle
   - Formulario WhatsApp inteligente
   - Dashboard admin (PIN: 2026)
   ===================================================== */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════
    // DATOS DE OFERTAS MENSUALES
    // ═══════════════════════════════════════════════
    const MONTHLY_OFFERS = {
        enero: {
            title: 'Año Nuevo, Pelo Nuevo',
            desc: 'Pack Renovación: Corte + Hidratación profunda + Diagnóstico gratuito. Empieza el año cuidándote.',
            oldPrice: '80€',
            newPrice: '59€',
            save: 'Ahorras 21€',
            img: '../assets/trabajo 1.webp',
            badge: '🔥 OFERTA ENERO'
        },
        febrero: {
            title: 'San Valentín Beauty',
            desc: 'Pack Pareja o Amigas: 2 lavados + peinados + hidratación. Ideal para compartir.',
            oldPrice: '90€',
            newPrice: '69€',
            save: 'Ahorras 21€',
            img: '../assets/trabajo 3.webp',
            badge: '💕 OFERTA FEBRERO'
        },
        marzo: {
            title: 'Primavera Curly',
            desc: 'Pack Curly Completo con regalo de producto mini exclusivo de la línea Begoña Gómez. Diagnóstico + Corte en seco + Hidratación profunda + Rutina personalizada.',
            oldPrice: '89€',
            newPrice: '79€',
            save: 'Ahorras 10€ + regalo',
            img: '../assets/curly DEMOSTRACION.jpg',
            badge: '🔥 OFERTA MARZO'
        },
        abril: {
            title: 'Renovación Capilar',
            desc: 'Tinte Orgánico Completo + Mascarilla + Diagnóstico. Renueva tu color para la primavera.',
            oldPrice: '105€',
            newPrice: '79€',
            save: 'Ahorras 26€',
            img: '../assets/color orgoanico.jpg',
            badge: '🌸 OFERTA ABRIL'
        },
        mayo: {
            title: 'Especial Día de la Madre',
            desc: 'Regala belleza: Corte + Color + Tratamiento + Producto regalo. Pack para mamá.',
            oldPrice: '140€',
            newPrice: '109€',
            save: 'Ahorras 31€',
            img: '../assets/portada-begona.jpeg',
            badge: '💐 OFERTA MAYO'
        },
        junio: {
            title: 'Summer Ready',
            desc: 'Babylights Express + Matizado + Protector Solar Capilar. Lista para el verano.',
            oldPrice: '155€',
            newPrice: '119€',
            save: 'Ahorras 36€',
            img: '../assets/CABELLOS RUBIOS.jpg',
            badge: '☀️ OFERTA JUNIO'
        },
        julio: {
            title: 'Protección Solar Capilar',
            desc: 'Hidratación profunda + Tratamiento reparador + Pack mini protección UV para casa.',
            oldPrice: '75€',
            newPrice: '55€',
            save: 'Ahorras 20€',
            img: '../assets/trabajo 2.webp',
            badge: '🌊 OFERTA JULIO'
        },
        agosto: {
            title: 'Back to Natural',
            desc: 'Transición a canas 1ª sesión + Diagnóstico + Hidratación. Empieza tu transición.',
            oldPrice: '125€',
            newPrice: '89€',
            save: 'Ahorras 36€',
            img: '../assets/transcicion a canas 2.jpeg',
            badge: '🍃 OFERTA AGOSTO'
        },
        septiembre: {
            title: 'Vuelta al Cole Beauty',
            desc: 'Corte + Tratamiento + Peinado. Vuelve renovada de las vacaciones.',
            oldPrice: '85€',
            newPrice: '65€',
            save: 'Ahorras 20€',
            img: '../assets/trabajo 5.webp',
            badge: '📚 OFERTA SEPTIEMBRE'
        },
        octubre: {
            title: 'Alisado Season',
            desc: 'Alisado Keratina + Mascarilla post-alisado + Champú regalo. Temporada de alisados.',
            oldPrice: '210€',
            newPrice: '159€',
            save: 'Ahorras 51€',
            img: '../assets/alisado.webp',
            badge: '✨ OFERTA OCTUBRE'
        },
        noviembre: {
            title: 'Black Friday Beauty',
            desc: '-30% en TODOS los packs. La oferta más grande del año. Solo en noviembre.',
            oldPrice: '30%',
            newPrice: '-30%',
            save: 'Máximo ahorro del año',
            img: '../assets/imagen sala.webp',
            badge: '🖤 BLACK FRIDAY'
        },
        diciembre: {
            title: 'Navidad Brillante',
            desc: 'Pack Regalo Navidad: Peinado evento + Tratamiento brillo + Recogido. Brilla estas fiestas.',
            oldPrice: '110€',
            newPrice: '85€',
            save: 'Ahorras 25€',
            img: '../assets/balayage.webp',
            badge: '🎄 OFERTA DICIEMBRE'
        }
    };

    // ═══════════════════════════════════════════════
    // PACKS DATA (for admin toggles)
    // ═══════════════════════════════════════════════
    const PACKS = [
        { id: 'pack-curly', name: 'Pack Curly Completo', price: '89€' },
        { id: 'pack-rubios-premium', name: 'Pack Rubios Premium', price: '149€' },
        { id: 'pack-rubios-express', name: 'Pack Rubios Express', price: '119€' },
        { id: 'pack-canas', name: 'Pack Transición Canas', price: '329€' },
        { id: 'pack-organico', name: 'Pack Orgánico Total', price: '109€' },
        { id: 'pack-alisado', name: 'Pack Alisado + Cuidado', price: '169€' },
        { id: 'pack-spa', name: 'Pack Spa Capilar', price: '85€' },
        { id: 'pack-primera-vez', name: 'Pack Primera Vez', price: '-25%' },
        { id: 'pack-amigas', name: 'Pack Amigas', price: '-15%' },
        { id: 'pack-productos', name: 'Pack Productos Casa', price: '79€' }
    ];

    const WEEKLY = [
        { id: 'weekly-martes', name: 'Martes Fresh', day: 'Martes' },
        { id: 'weekly-miercoles', name: 'Happy Hours', day: 'Miércoles' },
        { id: 'weekly-jueves', name: 'Jueves Tratamiento', day: 'Jueves' },
        { id: 'weekly-viernes', name: 'Flash Friday', day: 'Viernes' },
        { id: 'weekly-sabado', name: 'Early Bird', day: 'Sábado' }
    ];

    const MEMBERSHIPS = [
        { id: 'plan-esencial', name: 'Esencial', price: '399€/año' },
        { id: 'plan-premium', name: 'Premium', price: '699€/año' },
        { id: 'plan-vip', name: 'VIP', price: '999€/año' }
    ];

    const PRICE_ITEMS = [
        { key: 'corte-mujer', label: 'Corte Mujer', price: '45' },
        { key: 'corte-curly-seco', label: 'Corte Curly Seco', price: '60' },
        { key: 'corte-curly-premium', label: 'Corte Curly Premium', price: '85' },
        { key: 'lavado-peinado', label: 'Lavado + Peinado', price: '25' },
        { key: 'balayage', label: 'Balayage Artesanal', price: '130' },
        { key: 'babylights', label: 'Babylights', price: '115' },
        { key: 'mechas-completas', label: 'Mechas Completas', price: '95' },
        { key: 'tinte-organico', label: 'Tinte Orgánico', price: '70' },
        { key: 'tinte-raiz', label: 'Tinte Raíz Orgánico', price: '50' },
        { key: 'hidratacion', label: 'Hidratación Profunda', price: '35' }
    ];

    // ═══════════════════════════════════════════════
    // STORAGE KEY
    // ═══════════════════════════════════════════════
    const STORAGE_KEY = 'rv-dashboard-config';
    const PIN = '2026';

    // ═══════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════
    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

    function loadConfig() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function saveConfig(config) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (e) {
            console.warn('No se pudo guardar la configuración');
        }
    }

    function getDefaultConfig() {
        return {
            month: 'marzo',
            hiddenOffers: [],
            urgencyHero: 'Solo <strong>8 plazas</strong> disponibles esta semana',
            badgeText: '🔥 Ofertas Marzo 2026',
            finalUrgency: 'Las plazas de esta semana se agotan rápido. Reserva ahora y asegura tu momento de belleza.',
            prices: {}
        };
    }

    function getConfig() {
        return loadConfig() || getDefaultConfig();
    }

    // ═══════════════════════════════════════════════
    // 1. COUNTDOWN TIMER
    // ═══════════════════════════════════════════════
    function initCountdown() {
        const daysEl = $('#rv-days');
        const hoursEl = $('#rv-hours');
        const minsEl = $('#rv-mins');
        if (!daysEl || !hoursEl || !minsEl) return;

        function getEndOfMonth() {
            const now = new Date();
            return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        function updateCountdown() {
            const now = new Date();
            const end = getEndOfMonth();
            const diff = end - now;
            if (diff <= 0) {
                daysEl.textContent = '0';
                hoursEl.textContent = '0';
                minsEl.textContent = '0';
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            daysEl.textContent = days;
            hoursEl.textContent = hours;
            minsEl.textContent = mins;
        }

        updateCountdown();
        setInterval(updateCountdown, 60000);
    }

    // ═══════════════════════════════════════════════
    // 2. TABS DE PRECIOS
    // ═══════════════════════════════════════════════
    function initTabs() {
        const tabs = $$('.rv-tab');
        const panels = $$('.rv-tab-panel');
        if (!tabs.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.getAttribute('data-tab');
                const panel = $(`[data-panel="${target}"]`);
                if (panel) panel.classList.add('active');
            });
        });
    }

    // ═══════════════════════════════════════════════
    // 3. SEDE TOGGLE
    // ═══════════════════════════════════════════════
    function initSedes() {
        const btns = $$('.rv-sede-btn');
        const panels = $$('.rv-sede-panel');
        if (!btns.length) return;

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const target = btn.getAttribute('data-sede-tab');
                const panel = $(`[data-sede-panel="${target}"]`);
                if (panel) panel.classList.add('active');
            });
        });
    }

    // ═══════════════════════════════════════════════
    // 4. FORMULARIO WHATSAPP
    // ═══════════════════════════════════════════════
    function initForm() {
        const form = $('#rv-booking-form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const sede = $('input[name="sede"]:checked', form);
            const servicio = $('#rv-servicio', form);
            const nombre = $('#rv-nombre', form);
            const fecha = $('#rv-fecha', form);

            if (!nombre.value.trim()) {
                nombre.focus();
                return;
            }

            const sedeValue = sede ? sede.value : 'castelldefels';
            const phone = sedeValue === 'santa-perpetua' ? '34672928374' : '34602449995';
            const sedeName = sedeValue === 'santa-perpetua' ? 'Santa Perpètua' : 'Castelldefels';

            let msg = `Hola Begoña! Soy ${nombre.value.trim()}.\n`;
            msg += `Quiero reservar cita en ${sedeName}.\n`;
            msg += `Servicio: ${servicio.value}\n`;
            if (fecha.value.trim()) {
                msg += `Preferencia: ${fecha.value.trim()}\n`;
            }
            msg += `¡Gracias!`;

            const encoded = encodeURIComponent(msg);
            window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
        });
    }

    // ═══════════════════════════════════════════════
    // 5. SMOOTH SCROLL
    // ═══════════════════════════════════════════════
    function initSmoothScroll() {
        $$('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function (e) {
                const target = $(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // ═══════════════════════════════════════════════
    // 6. APPLY SAVED CONFIG
    // ═══════════════════════════════════════════════
    function applyConfig() {
        const config = getConfig();

        // Hidden offers
        if (config.hiddenOffers && config.hiddenOffers.length) {
            config.hiddenOffers.forEach(id => {
                const el = $(`[data-offer="${id}"]`);
                if (el) el.classList.add('rv-offer-hidden');
            });
        }

        // Urgency texts
        const urgencyText = $('#rv-urgency-text');
        if (urgencyText && config.urgencyHero) {
            urgencyText.innerHTML = config.urgencyHero;
        }

        const badge = $('#rv-hero-badge');
        if (badge && config.badgeText) {
            badge.textContent = config.badgeText;
        }

        const finalUrgency = $('#rv-final-urgency');
        if (finalUrgency && config.finalUrgency) {
            finalUrgency.textContent = config.finalUrgency;
        }

        // Monthly offer
        if (config.month && MONTHLY_OFFERS[config.month]) {
            applyMonthlyOffer(config.month);
        }
    }

    function applyMonthlyOffer(month) {
        const offer = MONTHLY_OFFERS[month];
        if (!offer) return;

        const title = $('#rv-monthly-title');
        const desc = $('#rv-monthly-desc');
        const oldP = $('#rv-monthly-old');
        const newP = $('#rv-monthly-new');
        const img = $('.rv-oferta-mes__img');
        const badgeImg = $('.rv-oferta-mes__badge-img');

        if (title) title.textContent = offer.title;
        if (desc) desc.textContent = offer.desc;
        if (oldP) oldP.textContent = offer.oldPrice;
        if (newP) newP.textContent = offer.newPrice;
        if (img) { img.src = offer.img; img.alt = offer.title; }
        if (badgeImg) badgeImg.textContent = offer.badge;
    }

    // ═══════════════════════════════════════════════
    // 7. ADMIN DASHBOARD
    // ═══════════════════════════════════════════════
    function initAdmin() {
        const toggleBtn = $('#rv-admin-toggle');
        const panel = $('#rv-admin-panel');
        const closeBtn = $('#rv-admin-close');
        if (!toggleBtn || !panel) return;

        // Show PIN modal
        toggleBtn.addEventListener('click', showPinModal);

        // Close panel
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                panel.hidden = true;
            });
        }

        // Month selector
        const monthSelect = $('#admin-month');
        if (monthSelect) {
            monthSelect.addEventListener('change', function () {
                applyMonthlyOffer(this.value);
            });
        }

        // Save
        const saveBtn = $('#admin-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', adminSave);
        }

        // Reset
        const resetBtn = $('#admin-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('¿Restaurar toda la configuración a los valores por defecto?')) {
                    localStorage.removeItem(STORAGE_KEY);
                    location.reload();
                }
            });
        }

        // Export
        const exportBtn = $('#admin-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', adminExport);
        }

        // Build toggles
        buildToggles();
    }

    function showPinModal() {
        // Remove existing modal
        const existing = $('#rv-pin-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'rv-pin-overlay';
        overlay.className = 'rv-pin-modal';
        overlay.innerHTML = `
            <div class="rv-pin-modal__content">
                <h3>🔒 Acceso Dashboard</h3>
                <input type="password" class="rv-pin-modal__input" id="rv-pin-input" maxlength="4" placeholder="····" autocomplete="off">
                <p class="rv-pin-error" id="rv-pin-error">PIN incorrecto</p>
                <button class="btn btn--primary" id="rv-pin-submit" style="width:100%">Acceder</button>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = $('#rv-pin-input');
        const submit = $('#rv-pin-submit');
        const error = $('#rv-pin-error');

        setTimeout(() => input && input.focus(), 100);

        function verifyPin() {
            if (input.value === PIN) {
                overlay.remove();
                openDashboard();
            } else {
                error.style.display = 'block';
                input.value = '';
                input.focus();
            }
        }

        submit.addEventListener('click', verifyPin);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') verifyPin();
        });

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    function openDashboard() {
        const panel = $('#rv-admin-panel');
        if (!panel) return;
        panel.hidden = false;

        // Sync config values to inputs
        const config = getConfig();

        const monthSelect = $('#admin-month');
        if (monthSelect) monthSelect.value = config.month || 'marzo';

        const urgencyInput = $('#admin-urgency-hero');
        if (urgencyInput) urgencyInput.value = config.urgencyHero ? config.urgencyHero.replace(/<[^>]*>/g, '') : '';

        const badgeInput = $('#admin-badge-text');
        if (badgeInput) badgeInput.value = config.badgeText || '';

        const finalInput = $('#admin-final-urgency');
        if (finalInput) finalInput.value = config.finalUrgency || '';

        // Sync toggles
        syncToggles(config);

        // Build price editor
        buildPriceEditor(config);
    }

    function buildToggles() {
        const packsContainer = $('#admin-packs-toggles');
        const weeklyContainer = $('#admin-weekly-toggles');
        const membershipContainer = $('#admin-membership-toggles');

        if (packsContainer) {
            packsContainer.innerHTML = PACKS.map(p => createToggleRow(p.id, `${p.name} (${p.price})`)).join('');
        }
        if (weeklyContainer) {
            weeklyContainer.innerHTML = WEEKLY.map(w => createToggleRow(w.id, `${w.day}: ${w.name}`)).join('');
        }
        if (membershipContainer) {
            membershipContainer.innerHTML = MEMBERSHIPS.map(m => createToggleRow(m.id, `${m.name} (${m.price})`)).join('');
        }
    }

    function createToggleRow(id, label) {
        return `
            <div class="rv-admin__toggle-row">
                <span>${label}</span>
                <label class="rv-toggle">
                    <input type="checkbox" data-toggle-offer="${id}" checked>
                    <span class="rv-toggle__slider"></span>
                </label>
            </div>
        `;
    }

    function syncToggles(config) {
        const hidden = config.hiddenOffers || [];
        $$('[data-toggle-offer]').forEach(toggle => {
            const id = toggle.getAttribute('data-toggle-offer');
            toggle.checked = !hidden.includes(id);
        });
    }

    function buildPriceEditor(config) {
        const container = $('#admin-prices');
        if (!container) return;

        container.innerHTML = PRICE_ITEMS.map(item => {
            const val = (config.prices && config.prices[item.key]) || item.price;
            return `
                <div class="rv-admin__price-row">
                    <span>${item.label}</span>
                    <input type="text" data-price-key="${item.key}" value="${val}">
                </div>
            `;
        }).join('');
    }

    function adminSave() {
        const config = getConfig();

        // Month
        const monthSelect = $('#admin-month');
        if (monthSelect) config.month = monthSelect.value;

        // Hidden offers
        const hidden = [];
        $$('[data-toggle-offer]').forEach(toggle => {
            if (!toggle.checked) {
                hidden.push(toggle.getAttribute('data-toggle-offer'));
            }
        });
        config.hiddenOffers = hidden;

        // Urgency texts
        const urgencyInput = $('#admin-urgency-hero');
        if (urgencyInput) config.urgencyHero = urgencyInput.value;

        const badgeInput = $('#admin-badge-text');
        if (badgeInput) config.badgeText = badgeInput.value;

        const finalInput = $('#admin-final-urgency');
        if (finalInput) config.finalUrgency = finalInput.value;

        // Prices
        config.prices = config.prices || {};
        $$('[data-price-key]').forEach(input => {
            config.prices[input.getAttribute('data-price-key')] = input.value;
        });

        saveConfig(config);
        applyConfig();

        // Visual feedback
        const saveBtn = $('#admin-save');
        if (saveBtn) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = '✅ Guardado!';
            saveBtn.style.background = '#388E3C';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = '';
            }, 2000);
        }
    }

    function adminExport() {
        const config = getConfig();
        const json = JSON.stringify(config, null, 2);

        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(json).then(() => {
                const exportBtn = $('#admin-export');
                if (exportBtn) {
                    const originalText = exportBtn.textContent;
                    exportBtn.textContent = '✅ Copiado!';
                    setTimeout(() => {
                        exportBtn.textContent = originalText;
                    }, 2000);
                }
            });
        } else {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = json;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Configuración copiada al portapapeles');
        }
    }

    // ═══════════════════════════════════════════════
    // 8. SCROLL ANIMATIONS (Intersection Observer)
    // ═══════════════════════════════════════════════
    function initScrollAnimations() {
        if (!('IntersectionObserver' in window)) return;

        const elements = $$('.rv-plan, .rv-pack, .rv-weekly__card, .rv-testimonio, .rv-faq__item');

        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, i * 80);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        elements.forEach(el => observer.observe(el));
    }

    // ═══════════════════════════════════════════════
    // 9. SEDE CHIP CLICK (Hero)
    // ═══════════════════════════════════════════════
    function initSedeChips() {
        $$('.rv-sede-chip').forEach(chip => {
            chip.addEventListener('click', function (e) {
                const sede = this.getAttribute('data-sede');
                if (!sede) return;

                // Pre-select sede in form
                const radioMap = {
                    'castelldefels': 'castelldefels',
                    'santa-perpetua': 'santa-perpetua'
                };
                const radio = $(`input[name="sede"][value="${radioMap[sede] || sede}"]`);
                if (radio) radio.checked = true;
            });
        });
    }

    // ═══════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════
    function init() {
        initCountdown();
        initTabs();
        initSedes();
        initForm();
        initSmoothScroll();
        initSedeChips();
        initAdmin();
        applyConfig();
        initScrollAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
