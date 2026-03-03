/* =====================================================
   CLIENTE APP — SALÓN BEGOÑA GÓMEZ
   Portal de clienta: perfil, reservas, puntos,
   membresía, cupones, tarjeta wallet
   ===================================================== */

import {
    auth, db,
    onAuthStateChanged, signOut,
    getClientProfile, updateClientProfile, isAdmin,
    validateCoupon, useCoupon,
    createAppointment, getAvailableSlots,
    LEVEL_CONFIG, calculateLevel, MEMBERSHIP_PLANS,
    collection, doc, getDocs, getDoc, query, where, orderBy, onSnapshot, serverTimestamp
} from './firebase-config.js';

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
let currentUser = null;
let clientProfile = null;
let selectedServices = [];
let selectedTime = null;
let appliedCoupon = null;
let services = [];

// ═══════════════════════════════════════════════
// DOM HELPERS
// ═══════════════════════════════════════════════
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ═══════════════════════════════════════════════
// AUTH CHECK
// ═══════════════════════════════════════════════
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = 'registro.html';
        return;
    }
    if (isAdmin(user.email)) {
        window.location.href = 'dashboard.html';
        return;
    }

    currentUser = user;

    try {
        clientProfile = await getClientProfile(user.uid);
    } catch (e) {
        console.error('Error loading profile:', e);
        clientProfile = null;
    }

    if (!clientProfile) {
        // Profile doesn't exist yet (still creating?), wait 2s and retry once
        await new Promise(r => setTimeout(r, 2000));
        try {
            clientProfile = await getClientProfile(user.uid);
        } catch (e) {
            console.error('Retry failed:', e);
        }
        if (!clientProfile) {
            window.location.href = 'registro.html';
            return;
        }
    }

    // Load services catalog (non-blocking — use defaults on fail)
    await loadServices();

    // Render everything
    try {
        renderWelcome();
        renderStats();
        renderLevel();
        renderBookingServices();
        renderMembership();
        renderCoupons();
        renderWalletCard();
        renderProfile();
        loadAppointments();
    } catch (e) {
        console.error('Error rendering portal:', e);
    }

    // Show main, hide loading
    $('#cp-loading').hidden = true;
    $('#cp-main').hidden = false;

    // Initialize tabs and interactions
    initTabs();
    initBookingForm();
    initProfileForm();
    initLogout();
    initQuickActions();

    // Set min date for booking
    const dateInput = $('#cp-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
});

// ═══════════════════════════════════════════════
// LOAD SERVICES FROM FIRESTORE
// ═══════════════════════════════════════════════
async function loadServices() {
    try {
        const snap = await getDocs(collection(db, 'servicios'));
        services = [];
        snap.forEach(d => {
            const data = d.data();
            if (data.activo !== false) {
                services.push({ id: d.id, ...data });
            }
        });
        // Sort by category
        services.sort((a, b) => (a.categoria || '').localeCompare(b.categoria || ''));
    } catch (e) {
        console.warn('No se pudieron cargar servicios de Firestore, usando defaults');
    }
    // Use fallback defaults if Firestore is empty or failed
    if (services.length === 0) {
        services = [
            { id: 'corte-mujer', nombre: 'Corte Mujer', precio: 45, duracion: 45, categoria: 'cortes' },
            { id: 'corte-curly-seco', nombre: 'Corte Curly en Seco', precio: 60, duracion: 60, categoria: 'cortes' },
            { id: 'lavado-peinado', nombre: 'Lavado + Peinado', precio: 25, duracion: 30, categoria: 'cortes' },
            { id: 'balayage', nombre: 'Balayage Artesanal', precio: 130, duracion: 120, categoria: 'rubios' },
            { id: 'tinte-organico', nombre: 'Tinte Orgánico Completo', precio: 70, duracion: 75, categoria: 'color' },
            { id: 'tinte-raiz', nombre: 'Tinte Raíz Orgánico', precio: 50, duracion: 45, categoria: 'color' },
            { id: 'hidratacion', nombre: 'Hidratación Profunda', precio: 35, duracion: 30, categoria: 'tratamientos' },
            { id: 'keratina', nombre: 'Alisado Keratina', precio: 180, duracion: 150, categoria: 'alisados' },
        ];
    }
}

// ═══════════════════════════════════════════════
// RENDER WELCOME
// ═══════════════════════════════════════════════
function renderWelcome() {
    const p = clientProfile;
    const initials = (p.nombre?.[0] || '') + (p.apellidos?.[0] || '');
    $('#cp-avatar').textContent = initials.toUpperCase();
    $('#cp-name').textContent = p.nombre || 'Cliente';
    $('#cp-client-num').textContent = p.clientNumber || '—';
    const level = LEVEL_CONFIG[p.nivel] || LEVEL_CONFIG.bronce;
    $('#cp-level-icon').textContent = level.icon;
    $('#cp-level-name').textContent = level.name;
    $('#cp-points').textContent = p.puntos || 0;
}

// ═══════════════════════════════════════════════
// RENDER STATS
// ═══════════════════════════════════════════════
function renderStats() {
    const p = clientProfile;
    $('#stat-puntos').textContent = p.puntos || 0;
    $('#stat-visitas').textContent = p.visitas || 0;
    const cupones = (p.cupones || []).length;
    $('#stat-cupones').textContent = cupones;
    $('#quick-cupon-count').textContent = `${cupones} disponible${cupones !== 1 ? 's' : ''}`;
}

// ═══════════════════════════════════════════════
// RENDER LEVEL PROGRESS
// ═══════════════════════════════════════════════
function renderLevel() {
    const pts = clientProfile.puntosHistorico || clientProfile.puntos || 0;
    const maxPts = 2500;
    const pct = Math.min((pts / maxPts) * 100, 100);
    $('#cp-level-fill').style.width = `${pct}%`;

    // Highlight achieved markers
    if (pts >= 500) $('#marker-plata')?.classList.add('active');
    if (pts >= 1000) $('#marker-oro')?.classList.add('active');
    if (pts >= 2500) $('#marker-diamante')?.classList.add('active');

    // Hint text
    const level = clientProfile.nivel || 'bronce';
    const nextLevels = { bronce: { name: 'Plata', pts: 500, perk: '5% dto. permanente' }, plata: { name: 'Oro', pts: 1000, perk: '10% dto. + regalo cumpleaños' }, oro: { name: 'Diamante', pts: 2500, perk: '15% dto. + WhatsApp directo' } };
    const next = nextLevels[level];
    const hintEl = $('#cp-level-hint');
    if (next && hintEl) {
        const remaining = next.pts - pts;
        if (remaining > 0) {
            hintEl.innerHTML = `Te faltan <strong>${remaining} puntos</strong> para subir a ${next.name} (${next.perk})`;
        } else {
            hintEl.innerHTML = `<strong>¡Enhorabuena!</strong> Ya eres nivel ${LEVEL_CONFIG[level]?.name || level}`;
        }
    } else if (hintEl) {
        hintEl.innerHTML = '<strong>¡Eres Diamante!</strong> El nivel máximo. Disfruta de todos los beneficios.';
    }
}

// ═══════════════════════════════════════════════
// RENDER BOOKING SERVICES
// ═══════════════════════════════════════════════
function renderBookingServices() {
    const container = $('#cp-services-list');
    if (!container) return;

    container.innerHTML = services.map(svc => `
        <label class="cp-service-item" data-service-id="${svc.id}" data-price="${svc.precio}">
            <input type="checkbox" value="${svc.id}">
            <div class="cp-service-item__check">✓</div>
            <span class="cp-service-item__name">${svc.nombre}</span>
            <span class="cp-service-item__price">${svc.precio}€</span>
        </label>
    `).join('');

    // Click handlers
    container.querySelectorAll('.cp-service-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.tagName === 'INPUT') return;
            const checkbox = item.querySelector('input');
            checkbox.checked = !checkbox.checked;
            item.classList.toggle('selected', checkbox.checked);
            updateSelectedServices();
        });

        const checkbox = item.querySelector('input');
        checkbox.addEventListener('change', () => {
            item.classList.toggle('selected', checkbox.checked);
            updateSelectedServices();
        });
    });
}

function updateSelectedServices() {
    const checked = $$('.cp-service-item input:checked');
    selectedServices = checked.map(input => {
        const svc = services.find(s => s.id === input.value);
        return svc;
    }).filter(Boolean);

    const selectedDiv = $('#cp-selected-services');
    const selectedList = $('#cp-selected-list');
    if (selectedServices.length > 0) {
        selectedDiv.hidden = false;
        selectedList.innerHTML = selectedServices.map(s => `<li>${s.nombre} — ${s.precio}€</li>`).join('');
    } else {
        selectedDiv.hidden = true;
    }

    updateSummary();
}

// ═══════════════════════════════════════════════
// BOOKING DATE & TIME
// ═══════════════════════════════════════════════
function initBookingForm() {
    const dateInput = $('#cp-date');
    const sedeInputs = $$('input[name="cp-sede"]');

    if (dateInput) {
        dateInput.addEventListener('change', loadTimeSlots);
    }
    sedeInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (dateInput.value) loadTimeSlots();
        });
    });

    // Coupon
    const couponBtn = $('#cp-apply-coupon');
    if (couponBtn) {
        couponBtn.addEventListener('click', applyCoupon);
    }

    // Submit
    const form = $('#cp-booking-form');
    if (form) {
        form.addEventListener('submit', submitBooking);
    }
}

async function loadTimeSlots() {
    const date = $('#cp-date').value;
    const sede = $('input[name="cp-sede"]:checked')?.value || 'castelldefels';
    const container = $('#cp-time-slots');
    const step = $('#cp-time-step');

    if (!date || !container) return;

    step.hidden = false;
    container.innerHTML = '<p style="color:rgba(255,255,255,0.4)">Cargando horarios...</p>';

    try {
        const slots = await getAvailableSlots(sede, date);
        if (slots.length === 0) {
            container.innerHTML = '<p style="color:#e74c3c">No hay horarios disponibles para esta fecha (puede ser festivo o día de cierre)</p>';
            return;
        }

        container.innerHTML = slots.map(s => `
            <button type="button" class="cp-time-slot ${s.available ? '' : 'disabled'}" 
                    data-time="${s.time}" ${s.available ? '' : 'disabled'}>
                ${s.time}
            </button>
        `).join('');

        container.querySelectorAll('.cp-time-slot:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.cp-time-slot').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTime = btn.dataset.time;
                updateSummary();
            });
        });
    } catch (e) {
        container.innerHTML = '<p style="color:#e74c3c">Error al cargar horarios. Inténtalo de nuevo.</p>';
    }
}

async function applyCoupon() {
    const code = $('#cp-coupon-code').value.trim().toUpperCase();
    const resultEl = $('#cp-coupon-result');

    if (!code) {
        resultEl.className = 'cp-coupon-result error';
        resultEl.textContent = 'Introduce un código de cupón';
        return;
    }

    const result = await validateCoupon(code, currentUser.uid);
    if (result.valid) {
        appliedCoupon = result.coupon;
        resultEl.className = 'cp-coupon-result success';
        const valText = result.coupon.tipo === 'porcentaje' ? `-${result.coupon.valor}%` : `-${result.coupon.valor}€`;
        resultEl.textContent = `✅ Cupón aplicado: ${valText} — ${result.coupon.descripcion || ''}`;
        updateSummary();
    } else {
        appliedCoupon = null;
        resultEl.className = 'cp-coupon-result error';
        resultEl.textContent = `❌ ${result.error}`;
        updateSummary();
    }
}

function updateSummary() {
    const summaryDiv = $('#cp-summary');
    const detailsDiv = $('#cp-summary-details');
    const totalEl = $('#cp-total');
    const pointsEl = $('#cp-points-earn');
    const bookBtn = $('#cp-book-btn');
    const date = $('#cp-date').value;

    if (selectedServices.length === 0) {
        summaryDiv.hidden = true;
        bookBtn.disabled = true;
        return;
    }

    summaryDiv.hidden = false;

    let subtotal = selectedServices.reduce((sum, s) => sum + (s.precio || 0), 0);
    let discountLines = '';
    let totalDiscount = 0;

    // Membership discount
    if (clientProfile.membresiaId) {
        const plan = MEMBERSHIP_PLANS[clientProfile.membresiaId];
        if (plan) {
            const memDiscount = subtotal * (plan.discount / 100);
            totalDiscount += memDiscount;
            discountLines += `<div style="display:flex;justify-content:space-between;color:#2ecc71"><span>🏷️ Dto. Membresía ${plan.name} (${plan.discount}%)</span><span>-${memDiscount.toFixed(2)}€</span></div>`;
        }
    }

    // Coupon discount
    if (appliedCoupon) {
        if (appliedCoupon.tipo === 'porcentaje') {
            const couponDiscount = (subtotal - totalDiscount) * (appliedCoupon.valor / 100);
            totalDiscount += couponDiscount;
            discountLines += `<div style="display:flex;justify-content:space-between;color:#2ecc71"><span>🎟️ Cupón ${appliedCoupon.codigo} (-${appliedCoupon.valor}%)</span><span>-${couponDiscount.toFixed(2)}€</span></div>`;
        } else if (appliedCoupon.tipo === 'importe_fijo') {
            totalDiscount += appliedCoupon.valor;
            discountLines += `<div style="display:flex;justify-content:space-between;color:#2ecc71"><span>🎟️ Cupón ${appliedCoupon.codigo}</span><span>-${appliedCoupon.valor}€</span></div>`;
        }
    }

    const total = Math.max(0, subtotal - totalDiscount);
    const points = Math.floor(total);

    detailsDiv.innerHTML = `
        ${selectedServices.map(s => `<div style="display:flex;justify-content:space-between;padding:4px 0;color:rgba(255,255,255,0.7)"><span>${s.nombre}</span><span>${s.precio}€</span></div>`).join('')}
        ${discountLines}
    `;

    totalEl.textContent = `${total.toFixed(2)}€`;
    pointsEl.textContent = `+${points}`;

    // Enable submit if all required fields filled
    bookBtn.disabled = !(selectedServices.length > 0 && date && selectedTime);
}

async function submitBooking(e) {
    e.preventDefault();
    const bookBtn = $('#cp-book-btn');
    bookBtn.disabled = true;
    bookBtn.textContent = '⏳ Reservando...';

    const date = $('#cp-date').value;
    const sede = $('input[name="cp-sede"]:checked')?.value || 'castelldefels';
    const notes = $('#cp-notes')?.value || '';

    let subtotal = selectedServices.reduce((sum, s) => sum + s.precio, 0);
    let totalDiscount = 0;
    let memberDiscount = 0;

    if (clientProfile.membresiaId) {
        const plan = MEMBERSHIP_PLANS[clientProfile.membresiaId];
        if (plan) {
            memberDiscount = plan.discount;
            totalDiscount += subtotal * (plan.discount / 100);
        }
    }
    if (appliedCoupon) {
        if (appliedCoupon.tipo === 'porcentaje') {
            totalDiscount += (subtotal - totalDiscount) * (appliedCoupon.valor / 100);
        } else {
            totalDiscount += appliedCoupon.valor;
        }
    }

    const total = Math.max(0, subtotal - totalDiscount);

    try {
        const citaId = await createAppointment({
            clienteId: currentUser.uid,
            clientNumber: clientProfile.clientNumber,
            clienteNombre: `${clientProfile.nombre} ${clientProfile.apellidos}`,
            clienteTelefono: clientProfile.telefono,
            servicios: selectedServices.map(s => s.nombre),
            fecha: date,
            hora: selectedTime,
            sede: sede,
            cuponAplicado: appliedCoupon?.codigo || null,
            descuentoMiembro: memberDiscount,
            totalOriginal: subtotal,
            totalFinal: total,
            puntosGanados: Math.floor(total),
            notas: notes
        });

        // Use coupon if applied
        if (appliedCoupon) await useCoupon(appliedCoupon.id);

        // Send WhatsApp confirmation
        const phone = sede === 'santa-perpetua' ? '34672928374' : '34602449995';
        const sedeName = sede === 'santa-perpetua' ? 'Santa Perpètua' : 'Castelldefels';
        const servList = selectedServices.map(s => s.nombre).join(', ');
        const msg = `Hola Begoña! Soy ${clientProfile.nombre} ${clientProfile.apellidos} (${clientProfile.clientNumber}).\n\nHe reservado cita online:\n📅 ${date} a las ${selectedTime}\n📍 ${sedeName}\n✂️ ${servList}\n💰 Total: ${total.toFixed(2)}€\n\n¡Gracias!`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');

        // Show success
        bookBtn.textContent = '✅ ¡Reserva enviada!';
        bookBtn.style.background = '#2ecc71';

        setTimeout(() => {
            bookBtn.textContent = '✨ Confirmar Reserva';
            bookBtn.style.background = '';
            bookBtn.disabled = true;
            // Reset form
            selectedServices = [];
            selectedTime = null;
            appliedCoupon = null;
            $$('.cp-service-item').forEach(i => { i.classList.remove('selected'); i.querySelector('input').checked = false; });
            $$('.cp-time-slot').forEach(b => b.classList.remove('selected'));
            $('#cp-date').value = '';
            $('#cp-coupon-code').value = '';
            $('#cp-coupon-result').textContent = '';
            $('#cp-summary').hidden = true;
            $('#cp-time-step').hidden = true;
            $('#cp-selected-services').hidden = true;
            loadAppointments();
        }, 3000);

    } catch (err) {
        bookBtn.textContent = '❌ Error — Inténtalo de nuevo';
        bookBtn.style.background = '#e74c3c';
        bookBtn.disabled = false;
        setTimeout(() => {
            bookBtn.textContent = '✨ Confirmar Reserva';
            bookBtn.style.background = '';
        }, 3000);
    }
}

// ═══════════════════════════════════════════════
// LOAD APPOINTMENTS
// ═══════════════════════════════════════════════
async function loadAppointments() {
    const container = $('#cp-upcoming-list');
    if (!container) return;

    try {
        const q2 = query(
            collection(db, 'citas'),
            where('clienteId', '==', currentUser.uid),
            orderBy('fecha', 'desc')
        );
        const snap = await getDocs(q2);

        if (snap.empty) {
            container.innerHTML = '<p class="cp-empty">No tienes citas registradas</p>';
            return;
        }

        let html = '';
        const today = new Date().toISOString().split('T')[0];
        snap.forEach(d => {
            const cita = d.data();
            const isPast = cita.fecha < today;
            const statusClass = cita.estado === 'confirmada' ? 'confirmada' : 'pendiente';
            const statusLabels = { pendiente: 'Pendiente', confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada', 'no-show': 'No asistió', 'en-curso': 'En curso' };
            html += `
                <div class="cp-appointment" style="${isPast ? 'opacity:0.5' : ''}">
                    <div class="cp-appointment__info">
                        <strong>📅 ${cita.fecha} a las ${cita.hora}</strong>
                        <span>📍 ${cita.sede === 'santa-perpetua' ? 'Santa Perpètua' : 'Castelldefels'} · ${(cita.servicios || []).join(', ')}</span>
                    </div>
                    <span class="cp-appointment__status cp-appointment__status--${statusClass}">
                        ${statusLabels[cita.estado] || cita.estado}
                    </span>
                </div>
            `;
        });
        container.innerHTML = html;

        // Update next appointment stat
        const upcoming = [];
        snap.forEach(d => {
            const cita = d.data();
            if (cita.fecha >= today && ['pendiente', 'confirmada'].includes(cita.estado)) {
                upcoming.push(cita);
            }
        });
        if (upcoming.length > 0) {
            upcoming.sort((a, b) => a.fecha.localeCompare(b.fecha));
            $('#stat-proxima').textContent = upcoming[0].fecha;
        }

    } catch (e) {
        container.innerHTML = '<p class="cp-empty">Error al cargar citas</p>';
    }
}

// ═══════════════════════════════════════════════
// RENDER MEMBERSHIP
// ═══════════════════════════════════════════════
function renderMembership() {
    const p = clientProfile;
    const noMem = $('#cp-no-membership');
    const hasMem = $('#cp-has-membership');

    if (!p.membresiaId) {
        if (noMem) noMem.hidden = false;
        if (hasMem) hasMem.hidden = true;
        return;
    }

    if (noMem) noMem.hidden = true;
    if (hasMem) hasMem.hidden = false;

    const plan = MEMBERSHIP_PLANS[p.membresiaId];
    if (!plan) return;

    $('#cp-mem-badge').textContent = plan.name.toUpperCase();
    $('#cp-mem-plan').textContent = `Membresía ${plan.name}`;
    $('#cp-mem-inicio').textContent = p.membresiaInicio || '—';
    $('#cp-mem-fin').textContent = p.membresiaFin || '—';
    $('#cp-mem-price').textContent = `${plan.price}€/año`;
    $('#cp-mem-discount').textContent = `${plan.discount}%`;

    // Services remaining
    const servContainer = $('#cp-mem-services');
    if (servContainer && p.serviciosRestantes) {
        const icons = { cortes: '✂️', coloraciones: '🎨', hidrataciones: '💧', tratamientos: '💆', especiales: '✨' };
        const labels = { cortes: 'Cortes', coloraciones: 'Coloraciones', hidrataciones: 'Hidrataciones', tratamientos: 'Tratamientos', especiales: 'Especiales' };

        servContainer.innerHTML = Object.entries(plan.services).map(([key, total]) => {
            const remaining = p.serviciosRestantes[key] ?? total;
            const pct = (remaining / total) * 100;
            return `
                <div class="cp-mem-service">
                    <span class="cp-mem-service__icon">${icons[key] || '📦'}</span>
                    <span class="cp-mem-service__count">${remaining}/${total}</span>
                    <span class="cp-mem-service__label">${labels[key] || key}</span>
                    <div class="cp-mem-service__bar"><div class="cp-mem-service__bar-fill" style="width:${pct}%"></div></div>
                </div>
            `;
        }).join('');
    }

    // Update wallet card membership too
    const walletMem = $('#wallet-membership');
    if (walletMem) walletMem.textContent = plan.name;
}

// ═══════════════════════════════════════════════
// RENDER COUPONS
// ═══════════════════════════════════════════════
async function renderCoupons() {
    const container = $('#cp-cupones-list');
    if (!container) return;

    try {
        const q2 = query(
            collection(db, 'cupones'),
            where('clienteId', '==', currentUser.uid),
            where('activo', '==', true)
        );
        const snap = await getDocs(q2);

        if (snap.empty) {
            container.innerHTML = '<p class="cp-empty">No tienes cupones activos. ¡Sigue visitándonos para ganar más!</p>';
            return;
        }

        let html = '';
        snap.forEach(d => {
            const c = d.data();
            const isUsed = c.usoMaximo && c.usosActuales >= c.usoMaximo;
            const expired = c.fechaExpiracion && new Date(c.fechaExpiracion) < new Date();
            const valText = c.tipo === 'porcentaje' ? `-${c.valor}%` : `-${c.valor}€`;

            if (!expired && !isUsed) {
                html += `
                    <div class="cp-cupon ${isUsed ? 'cp-cupon--used' : ''}">
                        <span class="cp-cupon__value">${valText}</span>
                        <div class="cp-cupon__code">${c.codigo}</div>
                        <div class="cp-cupon__desc">${c.descripcion || 'Cupón de descuento'}</div>
                        <div class="cp-cupon__expiry">Válido hasta: ${c.fechaExpiracion || 'Sin expiración'}</div>
                    </div>
                `;
            }
        });

        container.innerHTML = html || '<p class="cp-empty">No tienes cupones activos</p>';

    } catch (e) {
        container.innerHTML = '<p class="cp-empty">No tienes cupones activos</p>';
    }
}

// ═══════════════════════════════════════════════
// RENDER WALLET CARD
// ═══════════════════════════════════════════════
function renderWalletCard() {
    const p = clientProfile;
    const fullName = `${p.nombre || ''} ${p.apellidos || ''}`.trim();
    const level = LEVEL_CONFIG[p.nivel] || LEVEL_CONFIG.bronce;

    $('#wallet-name').textContent = fullName;
    $('#wallet-num').textContent = p.clientNumber || '—';
    $('#wallet-level-icon').textContent = level.icon;
    $('#wallet-level-name').textContent = level.name.toUpperCase();
    $('#wallet-points').textContent = p.puntos || 0;

    // Membership
    if (p.membresiaId) {
        const plan = MEMBERSHIP_PLANS[p.membresiaId];
        $('#wallet-membership').textContent = plan?.name || '—';

        // Show services remaining
        const servicesDiv = $('#wallet-services');
        const servicesList = $('#wallet-services-list');
        if (servicesDiv && servicesList && p.serviciosRestantes) {
            servicesDiv.hidden = false;
            const icons = { cortes: '✂️', coloraciones: '🎨', hidrataciones: '💧', tratamientos: '💆', especiales: '✨' };
            const labels = { cortes: 'Cortes', coloraciones: 'Coloraciones', hidrataciones: 'Hidrataciones', tratamientos: 'Tratamientos', especiales: 'Especiales' };
            const plan2 = MEMBERSHIP_PLANS[p.membresiaId];
            servicesList.innerHTML = Object.entries(plan2?.services || {}).map(([key, total]) => {
                const remaining = p.serviciosRestantes[key] ?? total;
                return `<div class="cp-wallet__service-row"><span>${icons[key] || ''} ${labels[key] || key}</span><span>${remaining}/${total}</span></div>`;
            }).join('');
        }
    }

    // Simple QR code (text-based, no library needed)
    const canvas = $('#wallet-qr-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = 100; canvas.height = 100;
        // Draw a simple placeholder QR pattern
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#0F1115';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.clientNumber || 'BG-0001', 50, 45);
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText('Salón Begoña', 50, 62);
        ctx.fillText('Gómez', 50, 74);
        // Border
        ctx.strokeStyle = '#C8A25A';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, 96, 96);
    }

    // Download card button
    const downloadBtn = $('#btn-download-card');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            // Create a simple downloadable card image via canvas
            const cardEl = $('#cp-wallet-card');
            alert(`Tu tarjeta digital:\n\nNombre: ${fullName}\nNº Cliente: ${p.clientNumber}\nNivel: ${level.name}\nPuntos: ${p.puntos}\n\nMuestra este número en tu próxima visita.`);
        });
    }

    // Apple/Google wallet buttons
    const appleBtn = $('#btn-apple-wallet');
    const googleBtn = $('#btn-google-wallet');
    if (appleBtn) {
        appleBtn.addEventListener('click', () => {
            alert('La tarjeta de Apple Wallet estará disponible próximamente. Por ahora, puedes descargar la versión imagen o hacer una captura de pantalla.');
        });
    }
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            alert('La tarjeta de Google Wallet estará disponible próximamente. Por ahora, puedes descargar la versión imagen o hacer una captura de pantalla.');
        });
    }
}

// ═══════════════════════════════════════════════
// RENDER PROFILE
// ═══════════════════════════════════════════════
function renderProfile() {
    const p = clientProfile;
    $('#pf-nombre').value = p.nombre || '';
    $('#pf-apellidos').value = p.apellidos || '';
    $('#pf-email').value = p.email || currentUser.email;
    $('#pf-telefono').value = p.telefono || '';
    $('#pf-nacimiento').value = p.fechaNacimiento || '';
    $('#pf-sede').value = p.sedePreferida || 'castelldefels';
    $('#pf-visitas').textContent = p.visitas || 0;
    $('#pf-gasto').textContent = `${p.gastoTotal || 0}€`;
    $('#pf-puntos-total').textContent = p.puntosHistorico || p.puntos || 0;

    if (p.creadoEn) {
        const d = p.creadoEn.toDate ? p.creadoEn.toDate() : new Date(p.creadoEn);
        $('#pf-miembro-desde').textContent = d.toLocaleDateString('es-ES');
    }
}

function initProfileForm() {
    const form = $('#cp-profile-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await updateClientProfile(currentUser.uid, {
                nombre: $('#pf-nombre').value.trim(),
                apellidos: $('#pf-apellidos').value.trim(),
                telefono: $('#pf-telefono').value.trim(),
                fechaNacimiento: $('#pf-nacimiento').value,
                sedePreferida: $('#pf-sede').value
            });
            const saved = $('#pf-saved');
            saved.hidden = false;
            setTimeout(() => saved.hidden = true, 2000);

            // Refresh profile data
            clientProfile = await getClientProfile(currentUser.uid);
            renderWelcome();
        } catch (err) {
            alert('Error al guardar. Inténtalo de nuevo.');
        }
    });
}

// ═══════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════
function initTabs() {
    const tabs = $$('.cp-nav__item');
    const panels = $$('.cp-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.cpTab;
            tabs.forEach(t => t.classList.toggle('active', t.dataset.cpTab === target));
            panels.forEach(p => p.classList.toggle('active', p.dataset.cpPanel === target));
        });
    });
}

function initQuickActions() {
    $$('.cp-quick-action[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.goto;
            $$('.cp-nav__item').forEach(t => t.classList.toggle('active', t.dataset.cpTab === target));
            $$('.cp-panel').forEach(p => p.classList.toggle('active', p.dataset.cpPanel === target));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// ═══════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════
function initLogout() {
    const btn = $('#btn-logout');
    if (btn) {
        btn.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = 'registro.html';
        });
    }
}
