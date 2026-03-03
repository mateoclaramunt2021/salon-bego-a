/* =====================================================
   DASHBOARD APP — SALÓN BEGOÑA GÓMEZ
   Admin panel JavaScript (Firebase Firestore)
   ===================================================== */

import {
    auth, db,
    onAuthStateChanged, signOut, isAdmin,
    collection, doc, getDocs, updateDoc, deleteDoc,
    query, where, orderBy, limit, addDoc, serverTimestamp,
    LEVEL_CONFIG, MEMBERSHIP_PLANS, calculateLevel, addPoints,
    initializeServices, BUSINESS_HOURS
} from './firebase-config.js';

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
let allClients = [];
let allAppointments = [];
let allSales = [];
let allCoupons = [];
let allServices = [];

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ═══════════════════════════════════════════════
// AUTH CHECK
// ═══════════════════════════════════════════════
onAuthStateChanged(auth, async (user) => {
    console.log('[Dashboard] Auth state:', user ? user.email : 'no user');
    if (!user) {
        window.location.href = 'registro.html';
        return;
    }
    if (!isAdmin(user.email)) {
        console.warn('[Dashboard] Not admin, redirecting...');
        window.location.href = 'mi-cuenta.html';
        return;
    }

    // --- ALWAYS hide loading when done, no matter what ---
    try {
        // Set admin info
        const adminName = $('#db-admin-name');
        if (adminName) adminName.textContent = user.email.split('@')[0];
        const fechaHoy = $('#db-fecha-hoy');
        if (fechaHoy) {
            const today = new Date();
            fechaHoy.textContent = today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        }
        const agendaDate = $('#db-agenda-date');
        if (agendaDate) agendaDate.value = new Date().toISOString().split('T')[0];

        // Load all data in parallel (each has own try/catch, never throws)
        console.log('[Dashboard] Loading data...');
        await Promise.all([
            loadClients(),
            loadAppointments(),
            loadSales(),
            loadCoupons(),
            loadServices()
        ]);
        console.log('[Dashboard] Data loaded:', { clients: allClients.length, appointments: allAppointments.length, sales: allSales.length, coupons: allCoupons.length, services: allServices.length });

        // Render each section (individually protected)
        const renders = [
            ['KPIs', renderKPIs],
            ['TodayAppointments', renderTodayAppointments],
            ['RecentActivity', renderRecentActivity],
            ['ClientsTable', renderClientsTable],
            ['ServicesGrid', renderServicesGrid],
            ['Memberships', renderMemberships],
            ['Loyalty', renderLoyalty],
            ['CouponsTable', renderCouponsTable],
            ['Schedule', renderSchedule],
            ['SalesTable', renderSalesTable]
        ];
        for (const [name, fn] of renders) {
            try { fn(); console.log(`[Dashboard] ✓ ${name}`); } catch (e) { console.error(`[Dashboard] ✗ ${name}:`, e); }
        }

    } catch (e) {
        console.error('[Dashboard] Init error:', e);
    }
    console.log('[Dashboard] ✓ Ready');

    // Init interactions (each wrapped so one failure doesn't block others)
    const inits = [
        ['Navigation', initNavigation],
        ['Modals', initModals],
        ['ServiceForm', initServiceForm],
        ['CouponForm', initCouponForm],
        ['PointsForm', initPointsForm],
        ['WhatsApp', initWhatsApp],
        ['ExportCSV', initExportCSV],
        ['AgendaFilters', initAgendaFilters],
        ['ReviewRequest', initReviewRequest],
        ['Logout', initLogout],
        ['MobileMenu', initMobileMenu]
    ];
    for (const [name, fn] of inits) {
        try { fn(); } catch (e) { console.error(`[Dashboard] Error init ${name}:`, e); }
    }
});

// ═══════════════════════════════════════════════
// DATA LOADING
// ═══════════════════════════════════════════════
async function loadClients() {
    try {
        const snap = await getDocs(query(collection(db, 'clientes'), limit(500)));
        allClients = [];
        snap.forEach(d => allClients.push({ id: d.id, ...d.data() }));
        console.log('[Dashboard] Clients loaded:', allClients.length);
    } catch (e) { console.warn('[Dashboard] loadClients failed:', e.message); allClients = []; }
}

async function loadAppointments() {
    try {
        const snap = await getDocs(query(collection(db, 'citas'), orderBy('fecha', 'desc'), limit(200)));
        allAppointments = [];
        snap.forEach(d => allAppointments.push({ id: d.id, ...d.data() }));
        console.log('[Dashboard] Appointments loaded:', allAppointments.length);
    } catch (e) { console.warn('[Dashboard] loadAppointments failed:', e.message); allAppointments = []; }
}

async function loadSales() {
    try {
        const snap = await getDocs(query(collection(db, 'ventas'), orderBy('fecha', 'desc'), limit(200)));
        allSales = [];
        snap.forEach(d => allSales.push({ id: d.id, ...d.data() }));
        console.log('[Dashboard] Sales loaded:', allSales.length);
    } catch (e) { console.warn('[Dashboard] loadSales failed:', e.message); allSales = []; }
}

async function loadCoupons() {
    try {
        const snap = await getDocs(query(collection(db, 'cupones'), limit(500)));
        allCoupons = [];
        snap.forEach(d => allCoupons.push({ id: d.id, ...d.data() }));
        console.log('[Dashboard] Coupons loaded:', allCoupons.length);
    } catch (e) { console.warn('[Dashboard] loadCoupons failed:', e.message); allCoupons = []; }
}

async function loadServices() {
    try {
        const snap = await getDocs(collection(db, 'servicios'));
        allServices = [];
        snap.forEach(d => allServices.push({ id: d.id, ...d.data() }));
        if (allServices.length === 0) {
            try {
                await initializeServices();
                const snap2 = await getDocs(collection(db, 'servicios'));
                snap2.forEach(d => allServices.push({ id: d.id, ...d.data() }));
            } catch (initErr) {
                console.warn('[Dashboard] initializeServices failed:', initErr.message);
            }
        }
        console.log('[Dashboard] Services loaded:', allServices.length);
    } catch (e) { console.warn('[Dashboard] loadServices failed:', e.message); allServices = []; }
}

// ═══════════════════════════════════════════════
// KPIs
// ═══════════════════════════════════════════════
function renderKPIs() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    // Ventas hoy
    const salesToday = allSales.filter(s => s.fecha === today);
    const totalToday = salesToday.reduce((sum, s) => sum + (s.total || 0), 0);
    $('#kpi-ventas-hoy').textContent = `${totalToday.toFixed(0)}€`;

    // Citas hoy
    const citasHoy = allAppointments.filter(a => a.fecha === today && !['cancelada'].includes(a.estado));
    $('#kpi-citas-hoy').textContent = citasHoy.length;

    // Clientes totales
    $('#kpi-clientes-total').textContent = allClients.length;

    // Ventas mes
    const salesMonth = allSales.filter(s => s.fecha?.startsWith(currentMonth));
    const totalMonth = salesMonth.reduce((sum, s) => sum + (s.total || 0), 0);
    $('#kpi-ventas-mes').textContent = `${totalMonth.toFixed(0)}€`;

    // Membresías activas
    const memActivas = allClients.filter(c => c.membresiaId).length;
    $('#kpi-membresias').textContent = memActivas;

    // Valoración
    $('#kpi-valoracion').textContent = '4.8 ⭐';
}

// ═══════════════════════════════════════════════
// TODAY'S APPOINTMENTS
// ═══════════════════════════════════════════════
function renderTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    const citasHoy = allAppointments
        .filter(a => a.fecha === today && !['cancelada'].includes(a.estado))
        .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));

    const container = $('#db-citas-hoy');
    if (citasHoy.length === 0) {
        container.innerHTML = '<p class="db-empty">No hay citas para hoy</p>';
        return;
    }

    container.innerHTML = citasHoy.map(cita => {
        const statusBadge = {
            pendiente: '<span class="db-badge db-badge--gold">Pendiente</span>',
            confirmada: '<span class="db-badge db-badge--green">Confirmada</span>',
            'en-curso': '<span class="db-badge db-badge--blue">En curso</span>',
            completada: '<span class="db-badge db-badge--gray">Completada</span>'
        };
        return `
            <div class="db-appointment-row">
                <div class="db-appointment-row__time">${cita.hora || '—'}</div>
                <div class="db-appointment-row__info">
                    <div class="db-appointment-row__name">${cita.clienteNombre || 'Sin nombre'} (${cita.clientNumber || ''})</div>
                    <div class="db-appointment-row__services">
                        ${(cita.servicios || []).join(', ')} · ${cita.sede === 'santa-perpetua' ? 'Santa Perpètua' : 'Castelldefels'}
                    </div>
                </div>
                ${statusBadge[cita.estado] || ''}
                <div class="db-appointment-row__actions">
                    <button class="db-btn db-btn--sm db-btn--green" onclick="window.dbConfirmCita('${cita.id}')">✓</button>
                    <button class="db-btn db-btn--sm db-btn--red" onclick="window.dbCancelCita('${cita.id}')">✗</button>
                </div>
            </div>
        `;
    }).join('');
}

// Global functions for inline onclick
window.dbConfirmCita = async (id) => {
    try {
        await updateDoc(doc(db, 'citas', id), { estado: 'confirmada' });
        const cita = allAppointments.find(a => a.id === id);
        if (cita) cita.estado = 'confirmada';
        renderTodayAppointments();
        renderAgenda();
    } catch (e) { alert('Error al confirmar cita'); }
};

window.dbCancelCita = async (id) => {
    if (!confirm('¿Cancelar esta cita?')) return;
    try {
        await updateDoc(doc(db, 'citas', id), { estado: 'cancelada' });
        const cita = allAppointments.find(a => a.id === id);
        if (cita) cita.estado = 'cancelada';
        renderTodayAppointments();
        renderAgenda();
    } catch (e) { alert('Error al cancelar cita'); }
};

window.dbCompleteCita = async (id) => {
    try {
        await updateDoc(doc(db, 'citas', id), { estado: 'completada' });
        const cita = allAppointments.find(a => a.id === id);
        if (cita) cita.estado = 'completada';
        renderTodayAppointments();
        renderAgenda();
    } catch (e) { alert('Error'); }
};

// ═══════════════════════════════════════════════
// RECENT ACTIVITY
// ═══════════════════════════════════════════════
function renderRecentActivity() {
    const activities = [];

    // Recent appointments
    allAppointments.slice(0, 5).forEach(a => {
        activities.push({
            icon: '📅',
            text: `${a.clienteNombre || 'Cliente'} reservó cita para ${a.fecha}`,
            time: a.creadoEn?.toDate?.() || new Date(a.fecha)
        });
    });

    // Recent clients
    allClients
        .filter(c => c.creadoEn)
        .sort((a, b) => {
            const da = a.creadoEn?.toDate?.() || new Date(0);
            const db2 = b.creadoEn?.toDate?.() || new Date(0);
            return db2 - da;
        })
        .slice(0, 3)
        .forEach(c => {
            activities.push({
                icon: '👤',
                text: `Nuevo cliente: ${c.nombre} ${c.apellidos} (${c.clientNumber})`,
                time: c.creadoEn?.toDate?.() || new Date()
            });
        });

    activities.sort((a, b) => b.time - a.time);

    const container = $('#db-actividad');
    if (activities.length === 0) {
        container.innerHTML = '<p class="db-empty">Sin actividad reciente</p>';
        return;
    }

    container.innerHTML = activities.slice(0, 8).map(act => {
        const timeStr = act.time.toLocaleString?.('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) || '';
        return `
            <div class="db-activity-item">
                <span class="db-activity-item__icon">${act.icon}</span>
                <span>${act.text}</span>
                <span class="db-activity-item__time">${timeStr}</span>
            </div>
        `;
    }).join('');
}

// ═══════════════════════════════════════════════
// CLIENTS TABLE
// ═══════════════════════════════════════════════
function renderClientsTable(filter = '', levelFilter = 'todos') {
    const tbody = $('#db-clientes-tbody');
    let clients = [...allClients];

    if (filter) {
        const f = filter.toLowerCase();
        clients = clients.filter(c =>
            (c.nombre || '').toLowerCase().includes(f) ||
            (c.apellidos || '').toLowerCase().includes(f) ||
            (c.email || '').toLowerCase().includes(f) ||
            (c.telefono || '').includes(f) ||
            (c.clientNumber || '').toLowerCase().includes(f)
        );
    }
    if (levelFilter !== 'todos') {
        clients = clients.filter(c => c.nivel === levelFilter);
    }

    clients.sort((a, b) => (b.puntos || 0) - (a.puntos || 0));

    if (clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="db-empty">No se encontraron clientes</td></tr>';
        return;
    }

    const levelIcons = { bronce: '🥉', plata: '🥈', oro: '🥇', diamante: '💎' };

    tbody.innerHTML = clients.map(c => `
        <tr>
            <td><strong>${c.clientNumber || '—'}</strong></td>
            <td>${c.nombre || ''} ${c.apellidos || ''}</td>
            <td>${c.email || '—'}</td>
            <td>${c.telefono || '—'}</td>
            <td>${levelIcons[c.nivel] || '🥉'} ${(c.nivel || 'bronce').charAt(0).toUpperCase() + (c.nivel || 'bronce').slice(1)}</td>
            <td><strong>${c.puntos || 0}</strong></td>
            <td>${c.visitas || 0}</td>
            <td>${c.gastoTotal || 0}€</td>
            <td>
                <button class="db-btn db-btn--sm" onclick="window.dbViewClient('${c.id}')">👁</button>
                <button class="db-btn db-btn--sm" onclick="window.dbWhatsAppClient('${c.telefono}', '${c.nombre}')">📱</button>
            </td>
        </tr>
    `).join('');
}

window.dbViewClient = async (id) => {
    const c = allClients.find(cl => cl.id === id);
    if (!c) return;
    const modal = $('#db-modal-cliente');
    const detail = $('#db-cliente-detail');
    const level = LEVEL_CONFIG[c.nivel] || LEVEL_CONFIG.bronce;

    // Get client appointments
    const clientAppts = allAppointments.filter(a => a.clienteId === id);

    detail.innerHTML = `
        <h3 style="color:var(--db-gold);font-family:var(--font-display);font-size:24px;margin-bottom:20px">
            ${level.icon} ${c.nombre} ${c.apellidos}
        </h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
            <div><strong>Nº Cliente:</strong> ${c.clientNumber || '—'}</div>
            <div><strong>Email:</strong> ${c.email || '—'}</div>
            <div><strong>Teléfono:</strong> ${c.telefono || '—'}</div>
            <div><strong>Sede preferida:</strong> ${c.sedePreferida || '—'}</div>
            <div><strong>Nivel:</strong> ${level.name}</div>
            <div><strong>Puntos:</strong> ${c.puntos || 0}</div>
            <div><strong>Visitas:</strong> ${c.visitas || 0}</div>
            <div><strong>Gasto total:</strong> ${c.gastoTotal || 0}€</div>
            ${c.membresiaId ? `<div><strong>Membresía:</strong> ${MEMBERSHIP_PLANS[c.membresiaId]?.name || c.membresiaId}</div>` : ''}
            ${c.fechaNacimiento ? `<div><strong>Cumpleaños:</strong> ${c.fechaNacimiento}</div>` : ''}
        </div>
        <h4 style="font-family:var(--font-display);margin-bottom:10px">Últimas citas</h4>
        ${clientAppts.length > 0 ? clientAppts.slice(0, 5).map(a => `
            <div style="padding:8px 12px;background:var(--db-surface);border-radius:8px;margin-bottom:6px;font-size:13px">
                📅 ${a.fecha} ${a.hora} · ${(a.servicios || []).join(', ')} · <em>${a.estado}</em>
            </div>
        `).join('') : '<p class="db-empty">Sin citas registradas</p>'}
        <div style="margin-top:16px;display:flex;gap:8px">
            <button class="db-btn db-btn--gold" onclick="window.dbWhatsAppClient('${c.telefono}','${c.nombre}')">📱 WhatsApp</button>
        </div>
    `;
    modal.hidden = false;
};

window.dbWhatsAppClient = (phone, name) => {
    if (!phone) { alert('Este cliente no tiene teléfono registrado'); return; }
    const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '');
    const msg = `¡Hola ${name || ''}! Te escribimos desde Salón Begoña Gómez. `;
    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`, '_blank');
};

// ═══════════════════════════════════════════════
// AGENDA
// ═══════════════════════════════════════════════
function renderAgenda() {
    const date = $('#db-agenda-date').value;
    const sede = $('#db-agenda-sede').value;
    const estado = $('#db-agenda-estado').value;
    const container = $('#db-agenda-list');

    let filtered = allAppointments.filter(a => a.fecha === date);
    if (sede !== 'todas') filtered = filtered.filter(a => a.sede === sede);
    if (estado !== 'todas') filtered = filtered.filter(a => a.estado === estado);

    filtered.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));

    if (filtered.length === 0) {
        container.innerHTML = '<p class="db-empty">No hay citas para esta fecha</p>';
        return;
    }

    const statusBadges = {
        pendiente: 'db-badge--gold', confirmada: 'db-badge--green',
        'en-curso': 'db-badge--blue', completada: 'db-badge--gray',
        cancelada: 'db-badge--red', 'no-show': 'db-badge--red'
    };
    const statusLabels = { pendiente: 'Pendiente', confirmada: 'Confirmada', 'en-curso': 'En curso', completada: 'Completada', cancelada: 'Cancelada', 'no-show': 'No asistió' };

    container.innerHTML = filtered.map(cita => `
        <div class="db-appointment-row">
            <div class="db-appointment-row__time">${cita.hora || '—'}</div>
            <div class="db-appointment-row__info">
                <div class="db-appointment-row__name">${cita.clienteNombre || 'Sin nombre'} · ${cita.clientNumber || ''}</div>
                <div class="db-appointment-row__services">
                    ${(cita.servicios || []).join(', ')} · ${cita.sede === 'santa-perpetua' ? 'Santa Perpètua' : 'Castelldefels'}
                    ${cita.totalFinal ? ` · ${cita.totalFinal.toFixed(2)}€` : ''}
                    ${cita.notas ? ` · 📝 ${cita.notas}` : ''}
                </div>
            </div>
            <span class="db-badge ${statusBadges[cita.estado] || 'db-badge--gray'}">${statusLabels[cita.estado] || cita.estado}</span>
            <div class="db-appointment-row__actions">
                ${cita.estado === 'pendiente' ? `<button class="db-btn db-btn--sm db-btn--green" onclick="window.dbConfirmCita('${cita.id}')">✓ Confirmar</button>` : ''}
                ${['confirmada', 'en-curso'].includes(cita.estado) ? `<button class="db-btn db-btn--sm db-btn--gold" onclick="window.dbCompleteCita('${cita.id}')">✅ Completar</button>` : ''}
                ${!['cancelada', 'completada'].includes(cita.estado) ? `<button class="db-btn db-btn--sm db-btn--red" onclick="window.dbCancelCita('${cita.id}')">✗</button>` : ''}
            </div>
        </div>
    `).join('');
}

function initAgendaFilters() {
    $('#db-agenda-date')?.addEventListener('change', renderAgenda);
    $('#db-agenda-sede')?.addEventListener('change', renderAgenda);
    $('#db-agenda-estado')?.addEventListener('change', renderAgenda);
    renderAgenda();
}

// ═══════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════
function renderServicesGrid() {
    const container = $('#db-servicios-grid');
    if (allServices.length === 0) {
        container.innerHTML = '<p class="db-empty">No hay servicios. Haz clic en "Nuevo Servicio" para empezar.</p>';
        return;
    }

    const catLabels = { cortes: '✂️ Cortes', color: '🎨 Coloración', rubios: '🌟 Rubios', tratamientos: '💆 Tratamientos', alisados: '✨ Alisados', curly: '🌀 Curly', otros: '📦 Otros' };

    container.innerHTML = allServices
        .sort((a, b) => (a.categoria || '').localeCompare(b.categoria || ''))
        .map(svc => `
        <div class="db-service-card">
            <div class="db-service-card__header">
                <span class="db-service-card__name">${svc.nombre}</span>
                <span class="db-service-card__price">${svc.precio}€</span>
            </div>
            <div class="db-service-card__meta">
                <span>${catLabels[svc.categoria] || svc.categoria || 'Sin categoría'}</span>
                <span>⏱ ${svc.duracion} min</span>
                <span class="db-badge ${svc.activo !== false ? 'db-badge--green' : 'db-badge--red'}">${svc.activo !== false ? 'Activo' : 'Inactivo'}</span>
            </div>
            ${svc.descripcion ? `<p style="font-size:12px;color:var(--db-text-muted)">${svc.descripcion}</p>` : ''}
            <div class="db-service-card__actions">
                <button class="db-btn db-btn--sm" onclick="window.dbEditService('${svc.id}')">✏️ Editar</button>
                <button class="db-btn db-btn--sm db-btn--red" onclick="window.dbDeleteService('${svc.id}')">🗑</button>
            </div>
        </div>
    `).join('');
}

window.dbEditService = (id) => {
    const svc = allServices.find(s => s.id === id);
    if (!svc) return;
    $('#db-service-modal-title').textContent = 'Editar Servicio';
    $('#svc-id').value = id;
    $('#svc-nombre').value = svc.nombre || '';
    $('#svc-categoria').value = svc.categoria || 'cortes';
    $('#svc-precio').value = svc.precio || 0;
    $('#svc-duracion').value = svc.duracion || 45;
    $('#svc-descripcion').value = svc.descripcion || '';
    $('#svc-activo').checked = svc.activo !== false;
    $('#db-modal-servicio').hidden = false;
};

window.dbDeleteService = async (id) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
        await deleteDoc(doc(db, 'servicios', id));
        allServices = allServices.filter(s => s.id !== id);
        renderServicesGrid();
    } catch (e) { alert('Error al eliminar'); }
};

function initServiceForm() {
    $('#db-nuevo-servicio')?.addEventListener('click', () => {
        $('#db-service-modal-title').textContent = 'Nuevo Servicio';
        $('#svc-id').value = '';
        $('#db-service-form').reset();
        $('#svc-activo').checked = true;
        $('#db-modal-servicio').hidden = false;
    });

    $('#db-service-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            nombre: $('#svc-nombre').value.trim(),
            categoria: $('#svc-categoria').value,
            precio: parseFloat($('#svc-precio').value),
            duracion: parseInt($('#svc-duracion').value),
            descripcion: $('#svc-descripcion').value.trim(),
            activo: $('#svc-activo').checked,
            actualizadoEn: serverTimestamp()
        };

        const existingId = $('#svc-id').value;
        try {
            if (existingId) {
                await updateDoc(doc(db, 'servicios', existingId), data);
                const idx = allServices.findIndex(s => s.id === existingId);
                if (idx >= 0) allServices[idx] = { id: existingId, ...data };
            } else {
                data.creadoEn = serverTimestamp();
                const ref = await addDoc(collection(db, 'servicios'), data);
                allServices.push({ id: ref.id, ...data });
            }
            $('#db-modal-servicio').hidden = true;
            renderServicesGrid();
        } catch (err) { alert('Error al guardar servicio'); }
    });
}

// ═══════════════════════════════════════════════
// VENTAS
// ═══════════════════════════════════════════════
function renderSalesTable() {
    const periodo = $('#db-ventas-periodo').value;
    const sede = $('#db-ventas-sede').value;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    let filtered = [...allSales];

    // Period filter
    if (periodo === 'hoy') {
        filtered = filtered.filter(s => s.fecha === todayStr);
    } else if (periodo === 'semana') {
        const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(s => new Date(s.fecha) >= weekAgo);
    } else if (periodo === 'mes') {
        filtered = filtered.filter(s => s.fecha?.startsWith(todayStr.substring(0, 7)));
    } else if (periodo === 'trimestre') {
        const qStart = new Date(today); qStart.setMonth(qStart.getMonth() - 3);
        filtered = filtered.filter(s => new Date(s.fecha) >= qStart);
    }

    if (sede !== 'todas') {
        filtered = filtered.filter(s => s.sede === sede);
    }

    // KPIs
    const totalPeriodo = filtered.reduce((sum, s) => sum + (s.total || 0), 0);
    const ticketMedio = filtered.length > 0 ? totalPeriodo / filtered.length : 0;
    $('#kpi-ventas-periodo').textContent = `${totalPeriodo.toFixed(0)}€`;
    $('#kpi-ticket-medio').textContent = `${ticketMedio.toFixed(0)}€`;
    $('#kpi-num-ventas').textContent = filtered.length;

    // Top service
    const svcCount = {};
    filtered.forEach(s => {
        (s.servicios || []).forEach(svc => {
            svcCount[svc] = (svcCount[svc] || 0) + 1;
        });
    });
    const topSvc = Object.entries(svcCount).sort((a, b) => b[1] - a[1])[0];
    $('#kpi-servicio-top').textContent = topSvc ? topSvc[0] : '—';

    // Table
    const tbody = $('#db-ventas-tbody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="db-empty">Sin ventas en este período</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.slice(0, 50).map(v => {
        const desc = v.totalOriginal ? (v.totalOriginal - (v.total || 0)) : 0;
        return `
        <tr>
            <td>${v.fecha || '—'}</td>
            <td>${v.clienteNombre || '—'}</td>
            <td>${(v.servicios || []).join(', ')}</td>
            <td>${v.totalOriginal || v.total || 0}€</td>
            <td>${desc > 0 ? `-${desc.toFixed(2)}€` : '—'}</td>
            <td><strong>${(v.total || 0).toFixed(2)}€</strong></td>
            <td>${v.sede === 'santa-perpetua' ? 'S. Perpètua' : 'Castelldefels'}</td>
            <td><span class="db-badge db-badge--green">${v.estado || 'completada'}</span></td>
        </tr>
    `;
    }).join('');
}

// ═══════════════════════════════════════════════
// MEMBERSHIPS
// ═══════════════════════════════════════════════
function renderMemberships() {
    const withMem = allClients.filter(c => c.membresiaId);
    const counts = { 'plan-esencial': 0, 'plan-premium': 0, 'plan-vip': 0 };
    let totalIncome = 0;

    withMem.forEach(c => {
        if (counts[c.membresiaId] !== undefined) counts[c.membresiaId]++;
        const plan = MEMBERSHIP_PLANS[c.membresiaId];
        if (plan) totalIncome += plan.price;
    });

    $('#kpi-mem-esencial').textContent = counts['plan-esencial'];
    $('#kpi-mem-premium').textContent = counts['plan-premium'];
    $('#kpi-mem-vip').textContent = counts['plan-vip'];
    $('#kpi-ingresos-mem').textContent = `${totalIncome}€`;

    const tbody = $('#db-membresias-tbody');
    if (withMem.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="db-empty">Sin membresías activas</td></tr>';
        return;
    }

    tbody.innerHTML = withMem.map(c => {
        const plan = MEMBERSHIP_PLANS[c.membresiaId];
        const svcRemaining = c.serviciosRestantes ? 
            Object.entries(c.serviciosRestantes).map(([k, v]) => `${k}: ${v}`).join(', ') : '—';
        return `
        <tr>
            <td>${c.nombre} ${c.apellidos}</td>
            <td>${c.clientNumber || '—'}</td>
            <td><span class="db-badge db-badge--gold">${plan?.name || c.membresiaId}</span></td>
            <td>${c.membresiaInicio || '—'}</td>
            <td>${c.membresiaFin || '—'}</td>
            <td style="font-size:12px">${svcRemaining}</td>
            <td>
                <button class="db-btn db-btn--sm" onclick="window.dbViewClient('${c.id}')">👁</button>
            </td>
        </tr>
        `;
    }).join('');
}

// ═══════════════════════════════════════════════
// LOYALTY
// ═══════════════════════════════════════════════
function renderLoyalty() {
    const levelCounts = { bronce: 0, plata: 0, oro: 0, diamante: 0 };
    allClients.forEach(c => {
        const lvl = c.nivel || 'bronce';
        if (levelCounts[lvl] !== undefined) levelCounts[lvl]++;
    });

    $('#kpi-bronce').textContent = levelCounts.bronce;
    $('#kpi-plata').textContent = levelCounts.plata;
    $('#kpi-oro').textContent = levelCounts.oro;
    $('#kpi-diamante').textContent = levelCounts.diamante;

    // Leaderboard
    const top = [...allClients].sort((a, b) => (b.puntos || 0) - (a.puntos || 0)).slice(0, 10);
    const container = $('#db-leaderboard');
    if (top.length === 0) {
        container.innerHTML = '<p class="db-empty">Sin clientes aún</p>';
        return;
    }

    const medals = ['🥇', '🥈', '🥉'];
    container.innerHTML = top.map((c, i) => `
        <div class="db-leaderboard-item">
            <span class="db-leaderboard-item__rank">${medals[i] || (i + 1)}</span>
            <span class="db-leaderboard-item__name">${c.nombre} ${c.apellidos} <small style="color:var(--db-text-muted)">(${c.clientNumber || ''})</small></span>
            <span class="db-leaderboard-item__pts">${c.puntos || 0} pts</span>
        </div>
    `).join('');
}

function initPointsForm() {
    $('#db-add-points-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientInput = $('#db-pts-client').value.trim();
        const amount = parseInt($('#db-pts-amount').value);
        const motivo = $('#db-pts-motivo').value.trim();
        const resultEl = $('#db-pts-result');

        if (!clientInput || !amount) return;

        // Find client by number or email
        const client = allClients.find(c =>
            c.clientNumber?.toLowerCase() === clientInput.toLowerCase() ||
            c.email?.toLowerCase() === clientInput.toLowerCase()
        );

        if (!client) {
            resultEl.hidden = false;
            resultEl.className = 'db-alert db-alert--error';
            resultEl.textContent = `❌ Cliente "${clientInput}" no encontrado`;
            return;
        }

        try {
            await addPoints(client.id, amount, motivo || 'Puntos manuales (admin)');
            client.puntos = (client.puntos || 0) + amount;
            client.nivel = calculateLevel(client.puntosHistorico || client.puntos);

            resultEl.hidden = false;
            resultEl.className = 'db-alert db-alert--success';
            resultEl.textContent = `✅ +${amount} puntos añadidos a ${client.nombre} ${client.apellidos} (${client.clientNumber}). Total: ${client.puntos}`;

            renderLoyalty();
            renderClientsTable();
            $('#db-add-points-form').reset();
        } catch (err) {
            resultEl.hidden = false;
            resultEl.className = 'db-alert db-alert--error';
            resultEl.textContent = '❌ Error al añadir puntos';
        }
    });
}

// ═══════════════════════════════════════════════
// COUPONS
// ═══════════════════════════════════════════════
function renderCouponsTable() {
    const tbody = $('#db-cupones-tbody');
    if (allCoupons.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="db-empty">No hay cupones</td></tr>';
        return;
    }

    tbody.innerHTML = allCoupons.map(c => {
        const typeLabel = c.tipo === 'porcentaje' ? '%' : '€';
        const isExpired = c.fechaExpiracion && new Date(c.fechaExpiracion) < new Date();
        const isUsed = c.usoMaximo && c.usosActuales >= c.usoMaximo;
        let status = 'Activo';
        let statusClass = 'db-badge--green';
        if (isExpired) { status = 'Expirado'; statusClass = 'db-badge--red'; }
        if (isUsed) { status = 'Usado'; statusClass = 'db-badge--gray'; }
        if (!c.activo) { status = 'Inactivo'; statusClass = 'db-badge--gray'; }

        const clientName = c.clienteId ? (allClients.find(cl => cl.id === c.clienteId)?.nombre || c.clienteId) : 'Todos';

        return `
        <tr>
            <td><strong>${c.codigo}</strong></td>
            <td>${c.tipo === 'porcentaje' ? 'Porcentaje' : 'Importe fijo'}</td>
            <td><strong>${c.valor}${typeLabel}</strong></td>
            <td>${c.descripcion || '—'}</td>
            <td>${clientName}</td>
            <td>${c.usosActuales || 0}/${c.usoMaximo || '∞'}</td>
            <td>${c.fechaExpiracion || 'Sin expiración'}</td>
            <td><span class="db-badge ${statusClass}">${status}</span></td>
            <td>
                <button class="db-btn db-btn--sm db-btn--red" onclick="window.dbDeleteCoupon('${c.id}')">🗑</button>
            </td>
        </tr>
        `;
    }).join('');
}

window.dbDeleteCoupon = async (id) => {
    if (!confirm('¿Eliminar este cupón?')) return;
    try {
        await deleteDoc(doc(db, 'cupones', id));
        allCoupons = allCoupons.filter(c => c.id !== id);
        renderCouponsTable();
    } catch (e) { alert('Error al eliminar cupón'); }
};

function initCouponForm() {
    $('#db-nuevo-cupon')?.addEventListener('click', () => {
        $('#db-cupon-form').reset();
        $('#db-modal-cupon').hidden = false;
    });

    $('#db-cupon-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        let codigo = $('#cup-codigo').value.trim().toUpperCase();
        if (!codigo) {
            codigo = 'BGCUPON-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        }

        const data = {
            codigo,
            tipo: $('#cup-tipo').value,
            valor: parseFloat($('#cup-valor').value),
            descripcion: $('#cup-descripcion').value.trim(),
            clienteId: $('#cup-clienteId').value.trim() || null,
            usoMaximo: parseInt($('#cup-usos').value) || 1,
            usosActuales: 0,
            fechaExpiracion: $('#cup-expira').value || null,
            activo: true,
            creadoEn: serverTimestamp()
        };

        try {
            const ref = await addDoc(collection(db, 'cupones'), data);
            allCoupons.push({ id: ref.id, ...data });
            $('#db-modal-cupon').hidden = true;
            renderCouponsTable();
        } catch (err) { alert('Error al crear cupón'); }
    });
}

// ═══════════════════════════════════════════════
// WHATSAPP
// ═══════════════════════════════════════════════
function initWhatsApp() {
    // Toggle individual/group
    $('#wa-dest')?.addEventListener('change', () => {
        const isGroup = $('#wa-dest').value === 'grupo';
        $('#wa-individual-row').hidden = isGroup;
        $('#wa-grupo-row').hidden = !isGroup;
    });

    // Template selection
    const templates = {
        recordatorio: '¡Hola {nombre}! Te recordamos tu cita mañana a las {hora} en {sede}. ¡Te esperamos! ✨ — Salón Begoña Gómez',
        cumpleaños: '¡Feliz cumpleaños, {nombre}! 🎉🎂 Como regalo especial, tienes un 20% de descuento en tu próximo servicio. ¡Disfruta tu día! — Salón Begoña Gómez ❤️',
        reactivacion: '¡Hola {nombre}! Hace tiempo que no nos visitas 😢 Te tenemos preparado un cupón de -15% para tu próxima visita. ¡Te esperamos! — Salón Begoña Gómez ✂️',
        promo: '¡Hola {nombre}! 🌟 Tenemos una promoción especial esta semana. Consulta nuestras ofertas en la web o llámanos. ¡Plazas limitadas! — Salón Begoña Gómez',
        membresia: '¡Hola {nombre}! Tu membresía vence pronto. Renuévala y sigue disfrutando de tus beneficios exclusivos. — Salón Begoña Gómez 💎'
    };

    $('#wa-template')?.addEventListener('change', () => {
        const tpl = templates[$('#wa-template').value];
        if (tpl) $('#wa-message').value = tpl;
    });

    // Click on template cards
    $$('.db-template').forEach(item => {
        item.addEventListener('click', () => {
            const tpl = templates[item.dataset.tpl];
            if (tpl) {
                $('#wa-message').value = tpl;
                $('#wa-template').value = item.dataset.tpl;
            }
        });
    });

    // Send
    $('#db-wa-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = $('#wa-message').value.trim();
        if (!msg) return;

        if ($('#wa-dest').value === 'individual') {
            let phone = $('#wa-phone').value.trim();
            // Check if it's a client number
            if (phone.startsWith('BG-')) {
                const client = allClients.find(c => c.clientNumber === phone);
                if (client?.telefono) {
                    phone = client.telefono;
                    const personalMsg = msg.replace(/{nombre}/g, client.nombre || '');
                    const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '');
                    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(personalMsg)}`, '_blank');
                    return;
                } else {
                    alert('Cliente no encontrado o sin teléfono'); return;
                }
            }
            const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '');
            if (!cleaned) { alert('Introduce un teléfono'); return; }
            window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`, '_blank');
        } else {
            // Group: open for each matching client
            const nivel = $('#wa-nivel').value;
            let targetClients = allClients.filter(c => c.telefono);
            if (nivel !== 'todos') {
                targetClients = targetClients.filter(c => c.nivel === nivel);
            }
            if (targetClients.length === 0) {
                alert('No hay clientes con teléfono en este grupo'); return;
            }
            if (!confirm(`Se abrirá WhatsApp para ${targetClients.length} clientes. ¿Continuar?`)) return;

            targetClients.forEach((client, i) => {
                setTimeout(() => {
                    const personalMsg = msg
                        .replace(/{nombre}/g, client.nombre || '')
                        .replace(/{clientNumber}/g, client.clientNumber || '');
                    const cleaned = client.telefono.replace(/\s+/g, '').replace(/^\+/, '');
                    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(personalMsg)}`, '_blank');
                }, i * 1500);
            });
        }
    });
}

// ═══════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════
function initReviewRequest() {
    $('#db-resena-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        let phone = $('#resena-phone').value.trim();
        const platform = $('#resena-platform').value;

        // Check client number
        if (phone.startsWith('BG-')) {
            const client = allClients.find(c => c.clientNumber === phone);
            if (client?.telefono) phone = client.telefono;
        }

        const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '');
        if (!cleaned) { alert('Introduce un teléfono o nº cliente'); return; }

        const reviewUrl = platform === 'google'
            ? 'https://g.page/r/salonbegonagomez/review'
            : 'https://www.facebook.com/salonbegonagomez/reviews';

        const msg = `¡Hola! 😊 Gracias por visitarnos en Salón Begoña Gómez. Si disfrutaste tu experiencia, nos haría muy feliz que nos dejaras una reseña: ${reviewUrl} ¡Muchas gracias! ⭐ — Begoña`;

        window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`, '_blank');
    });
}

// ═══════════════════════════════════════════════
// SCHEDULE
// ═══════════════════════════════════════════════
function renderSchedule() {
    const days = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', domingo: 'Domingo' };

    Object.entries(BUSINESS_HOURS).forEach(([sedeKey, schedule]) => {
        const container = $(`#db-horario-${sedeKey}`);
        if (!container) return;
        container.innerHTML = Object.entries(days).map(([key, label]) => {
            const hours = schedule[key];
            let text = 'Cerrado';
            if (hours) {
                // hours is { open, close } object, not an array
                text = Array.isArray(hours)
                    ? hours.map(h => `${h.open}–${h.close}`).join(', ')
                    : `${hours.open}–${hours.close}`;
            }
            return `<div class="db-schedule-row"><span class="db-schedule-row__day">${label}</span><span class="db-schedule-row__hours">${text}</span></div>`;
        }).join('');
    });
}

// ═══════════════════════════════════════════════
// EXPORT CSV
// ═══════════════════════════════════════════════
function initExportCSV() {
    $('#db-export-clientes')?.addEventListener('click', () => {
        const headers = ['Nº Cliente', 'Nombre', 'Apellidos', 'Email', 'Teléfono', 'Nivel', 'Puntos', 'Visitas', 'Gasto Total', 'Sede Preferida', 'Membresía'];
        const rows = allClients.map(c => [
            c.clientNumber || '', c.nombre || '', c.apellidos || '',
            c.email || '', c.telefono || '', c.nivel || 'bronce',
            c.puntos || 0, c.visitas || 0, c.gastoTotal || 0,
            c.sedePreferida || '', c.membresiaId || ''
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(r => {
            csv += r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
        });

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clientes_salon_begona_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    });
}

// ═══════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════
function initNavigation() {
    $$('.db-nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.dbSection;
            $$('.db-nav-item').forEach(b => b.classList.toggle('active', b.dataset.dbSection === target));
            $$('.db-section').forEach(s => s.classList.toggle('active', s.dataset.dbPanel === target));

            // Lazy render sections
            if (target === 'agenda') renderAgenda();
            if (target === 'ventas') renderSalesTable();
            if (target === 'clientes') renderClientsTable();

            // Close mobile sidebar
            $('#db-sidebar')?.classList.remove('open');
        });
    });

    // Client search
    $('#db-buscar-cliente')?.addEventListener('input', () => {
        renderClientsTable($('#db-buscar-cliente').value, $('#db-filtro-nivel').value);
    });
    $('#db-filtro-nivel')?.addEventListener('change', () => {
        renderClientsTable($('#db-buscar-cliente').value, $('#db-filtro-nivel').value);
    });

    // Ventas filters
    $('#db-ventas-periodo')?.addEventListener('change', renderSalesTable);
    $('#db-ventas-sede')?.addEventListener('change', renderSalesTable);
}

// ═══════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════
function initModals() {
    $$('.db-modal__close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.db-modal').hidden = true;
        });
    });

    $$('.db-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.hidden = true;
        });
    });
}

// ═══════════════════════════════════════════════
// MOBILE MENU
// ═══════════════════════════════════════════════
function initMobileMenu() {
    $('#db-menu-toggle')?.addEventListener('click', () => {
        $('#db-sidebar')?.classList.toggle('open');
    });
}

// ═══════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════
function initLogout() {
    $('#db-logout')?.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'registro.html';
    });
}
