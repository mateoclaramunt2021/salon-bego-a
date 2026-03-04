/* =====================================================
   FIREBASE CONFIG — SALÓN BEGOÑA GÓMEZ
   =====================================================
   Configuración central de Firebase:
   - Authentication (login clientas + admin)
   - Firestore (base de datos)
   - Inicialización de servicios
   ===================================================== */

// Firebase SDK v9+ (modular, via CDN importmap in HTML)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, increment, arrayUnion, arrayRemove, writeBatch } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ═══════════════════════════════════════════════
// FIREBASE CONFIG (Proyecto: salonbego-52530)
// ═══════════════════════════════════════════════
const firebaseConfig = {
    apiKey: "AIzaSyD1zxiJhrWtV72OTh3eT5rk5CO-bMwZAFs",
    authDomain: "salonbego-52530.firebaseapp.com",
    projectId: "salonbego-52530",
    storageBucket: "salonbego-52530.firebasestorage.app",
    messagingSenderId: "1034750457843",
    appId: "1:1034750457843:web:ba300da6849270f06b0486",
    measurementId: "G-21GR3Z08PX"
};

// ═══════════════════════════════════════════════
// INITIALIZE
// ═══════════════════════════════════════════════
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ═══════════════════════════════════════════════
// ADMIN EMAIL (Begoña's login)
// ═══════════════════════════════════════════════
const ADMIN_EMAILS = ['neuriaxx@gmail.com', 'begona@salonbegona.com'];

function isAdmin(email) {
    return ADMIN_EMAILS.includes(email?.toLowerCase());
}

// ═══════════════════════════════════════════════
// GENERATE CLIENT NUMBER (BG-0001, BG-0002...)
// ═══════════════════════════════════════════════
async function generateClientNumber() {
    const counterRef = doc(db, 'config', 'counters');
    const counterSnap = await getDoc(counterRef);

    let nextNum = 1;
    if (counterSnap.exists()) {
        nextNum = (counterSnap.data().lastClientNumber || 0) + 1;
    }

    await setDoc(counterRef, { lastClientNumber: nextNum }, { merge: true });
    return `BG-${String(nextNum).padStart(4, '0')}`;
}

// ═══════════════════════════════════════════════
// CREATE CLIENT PROFILE
// ═══════════════════════════════════════════════
async function createClientProfile(userId, data) {
    const clientNumber = await generateClientNumber();
    const profile = {
        uid: userId,
        clientNumber: clientNumber,
        nombre: data.nombre || '',
        apellidos: data.apellidos || '',
        email: data.email || '',
        telefono: data.telefono || '',
        fechaNacimiento: data.fechaNacimiento || '',
        sedePreferida: data.sedePreferida || 'castelldefels',
        foto: '',
        nivel: 'bronce',
        puntos: 50, // Bienvenida
        puntosHistorico: 50,
        membresiaId: null,
        membresiaInicio: null,
        membresiaFin: null,
        serviciosRestantes: {},
        notas: '',
        etiquetas: ['nueva'],
        cupones: ['BIENVENIDA-15'],
        visitas: 0,
        gastoTotal: 0,
        ultimaVisita: null,
        walletPassId: null,
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp()
    };

    await setDoc(doc(db, 'clientes', userId), profile);

    // Create welcome coupon
    await setDoc(doc(db, 'cupones', 'BIENVENIDA-15-' + clientNumber), {
        codigo: 'BIENVENIDA-15',
        tipo: 'porcentaje',
        valor: 15,
        servicios: ['todos'],
        usoMaximo: 1,
        usosActuales: 0,
        clienteId: userId,
        clientNumber: clientNumber,
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaExpiracion: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        activo: true,
        creadoPor: 'sistema',
        descripcion: '15% de descuento en tu primera visita',
        creadoEn: serverTimestamp()
    });

    return { clientNumber, profile };
}

// ═══════════════════════════════════════════════
// GET CLIENT PROFILE
// ═══════════════════════════════════════════════
async function getClientProfile(userId) {
    const snap = await getDoc(doc(db, 'clientes', userId));
    return snap.exists() ? snap.data() : null;
}

// ═══════════════════════════════════════════════
// UPDATE CLIENT PROFILE
// ═══════════════════════════════════════════════
async function updateClientProfile(userId, data) {
    data.actualizadoEn = serverTimestamp();
    await updateDoc(doc(db, 'clientes', userId), data);
}

// ═══════════════════════════════════════════════
// LOYALTY LEVEL CALCULATOR
// ═══════════════════════════════════════════════
function calculateLevel(puntos) {
    if (puntos >= 2500) return 'diamante';
    if (puntos >= 1000) return 'oro';
    if (puntos >= 500) return 'plata';
    return 'bronce';
}

const LEVEL_CONFIG = {
    bronce: { name: 'Bronce', icon: '🥉', discount: 0, color: '#CD7F32', minPoints: 0 },
    plata: { name: 'Plata', icon: '🥈', discount: 5, color: '#C0C0C0', minPoints: 500 },
    oro: { name: 'Oro', icon: '🥇', discount: 10, color: '#FFD700', minPoints: 1000 },
    diamante: { name: 'Diamante', icon: '💎', discount: 15, color: '#B9F2FF', minPoints: 2500 }
};

// ═══════════════════════════════════════════════
// POINTS SYSTEM
// ═══════════════════════════════════════════════
const POINTS_CONFIG = {
    eurGastado: 1,        // 1 punto por euro
    reservaOnline: 25,    // bonus por reservar online
    resenaGoogle: 100,    // por dejar reseña
    referirAmiga: 200,    // por referir amiga
    cumpleanos: 50,       // regalo cumpleaños
    compraProducto: 2     // multiplicador productos
};

async function addPoints(userId, puntos, concepto) {
    const clientRef = doc(db, 'clientes', userId);
    await updateDoc(clientRef, {
        puntos: increment(puntos),
        puntosHistorico: increment(puntos),
        actualizadoEn: serverTimestamp()
    });

    // Log the transaction
    const logRef = doc(collection(db, 'puntosLog'));
    await setDoc(logRef, {
        clienteId: userId,
        puntos: puntos,
        concepto: concepto,
        fecha: serverTimestamp()
    });

    // Check level upgrade
    const snap = await getDoc(clientRef);
    if (snap.exists()) {
        const data = snap.data();
        const newLevel = calculateLevel(data.puntosHistorico);
        if (newLevel !== data.nivel) {
            await updateDoc(clientRef, { nivel: newLevel });
        }
    }
}

// ═══════════════════════════════════════════════
// COUPONS
// ═══════════════════════════════════════════════
async function validateCoupon(code, userId) {
    const q = query(
        collection(db, 'cupones'),
        where('codigo', '==', code.toUpperCase()),
        where('activo', '==', true)
    );
    const snap = await getDocs(q);

    if (snap.empty) return { valid: false, error: 'Cupón no encontrado' };

    let validCoupon = null;
    snap.forEach(docSnap => {
        const data = docSnap.data();
        // Check if it's for this client or for everyone
        if (!data.clienteId || data.clienteId === userId) {
            // Check expiration
            if (data.fechaExpiracion && new Date(data.fechaExpiracion) < new Date()) {
                return; // expired
            }
            // Check usage
            if (data.usoMaximo && data.usosActuales >= data.usoMaximo) {
                return; // max uses reached
            }
            validCoupon = { id: docSnap.id, ...data };
        }
    });

    if (!validCoupon) return { valid: false, error: 'Cupón no válido o expirado' };
    return { valid: true, coupon: validCoupon };
}

async function useCoupon(couponId) {
    await updateDoc(doc(db, 'cupones', couponId), {
        usosActuales: increment(1)
    });
}

// ═══════════════════════════════════════════════
// APPOINTMENTS / CITAS
// ═══════════════════════════════════════════════
async function createAppointment(data) {
    const citaRef = doc(collection(db, 'citas'));
    const cita = {
        clienteId: data.clienteId || '',
        clientNumber: data.clientNumber || '',
        clienteNombre: data.clienteNombre || '',
        clienteTelefono: data.clienteTelefono || '',
        servicios: data.servicios || [],
        fecha: data.fecha || '',
        hora: data.hora || '',
        sede: data.sede || 'castelldefels',
        empleada: data.empleada || 'begona',
        estado: 'pendiente', // pendiente, confirmada, en-curso, completada, cancelada, no-show
        cuponAplicado: data.cuponAplicado || null,
        descuentoMiembro: data.descuentoMiembro || 0,
        totalOriginal: data.totalOriginal || 0,
        totalFinal: data.totalFinal || 0,
        puntosGanados: data.puntosGanados || 0,
        notas: data.notas || '',
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp()
    };
    await setDoc(citaRef, cita);
    return citaRef.id;
}

async function updateAppointment(citaId, data) {
    data.actualizadoEn = serverTimestamp();
    await updateDoc(doc(db, 'citas', citaId), data);
}

// ═══════════════════════════════════════════════
// SALES / VENTAS
// ═══════════════════════════════════════════════
async function createSale(data) {
    const ventaRef = doc(collection(db, 'ventas'));
    const venta = {
        citaId: data.citaId || '',
        clienteId: data.clienteId || '',
        clientNumber: data.clientNumber || '',
        servicios: data.servicios || [],
        productos: data.productos || [],
        subtotal: data.subtotal || 0,
        descuento: data.descuento || 0,
        total: data.total || 0,
        metodoPago: data.metodoPago || 'tarjeta',
        propina: data.propina || 0,
        sede: data.sede || 'castelldefels',
        empleada: data.empleada || 'begona',
        creadoEn: serverTimestamp()
    };
    await setDoc(ventaRef, venta);
    return ventaRef.id;
}

// ═══════════════════════════════════════════════
// PRODUCTS / INVENTORY
// ═══════════════════════════════════════════════
async function updateStock(productoId, cantidad) {
    await updateDoc(doc(db, 'productos', productoId), {
        stock: increment(cantidad),
        actualizadoEn: serverTimestamp()
    });
}

// ═══════════════════════════════════════════════
// SERVICES CATALOG
// ═══════════════════════════════════════════════
const DEFAULT_SERVICES = [
    { id: 'corte-mujer', nombre: 'Corte Mujer', precio: 45, duracion: 45, categoria: 'cortes', activo: true },
    { id: 'corte-curly-seco', nombre: 'Corte Curly en Seco', precio: 60, duracion: 60, categoria: 'cortes', activo: true },
    { id: 'corte-curly-premium', nombre: 'Corte Curly Premium', precio: 85, duracion: 75, categoria: 'cortes', activo: true },
    { id: 'lavado-peinado', nombre: 'Lavado + Peinado', precio: 25, duracion: 30, categoria: 'cortes', activo: true },
    { id: 'balayage', nombre: 'Balayage Artesanal', precio: 130, duracion: 120, categoria: 'rubios', activo: true },
    { id: 'babylights', nombre: 'Babylights', precio: 115, duracion: 120, categoria: 'rubios', activo: true },
    { id: 'mechas-completas', nombre: 'Mechas Completas', precio: 95, duracion: 90, categoria: 'rubios', activo: true },
    { id: 'tinte-organico', nombre: 'Tinte Orgánico Completo', precio: 70, duracion: 75, categoria: 'color', activo: true },
    { id: 'tinte-raiz', nombre: 'Tinte Raíz Orgánico', precio: 50, duracion: 45, categoria: 'color', activo: true },
    { id: 'hidratacion', nombre: 'Hidratación Profunda', precio: 35, duracion: 30, categoria: 'tratamientos', activo: true },
    { id: 'keratina', nombre: 'Alisado Keratina', precio: 180, duracion: 150, categoria: 'alisados', activo: true },
    { id: 'nanoplastia', nombre: 'Nanoplastia', precio: 200, duracion: 150, categoria: 'alisados', activo: true },
    { id: 'transicion-canas', nombre: 'Transición a Canas (sesión)', precio: 90, duracion: 90, categoria: 'canas', activo: true },
    { id: 'spa-capilar', nombre: 'Spa Capilar', precio: 45, duracion: 45, categoria: 'tratamientos', activo: true },
    { id: 'diagnostico', nombre: 'Diagnóstico Capilar', precio: 0, duracion: 15, categoria: 'tratamientos', activo: true }
];

async function initializeServices() {
    const servicesRef = collection(db, 'servicios');
    const snap = await getDocs(servicesRef);
    if (snap.empty) {
        const batch = writeBatch(db);
        DEFAULT_SERVICES.forEach(svc => {
            batch.set(doc(db, 'servicios', svc.id), {
                ...svc,
                creadoEn: serverTimestamp()
            });
        });
        await batch.commit();
    }
}

// ═══════════════════════════════════════════════
// MEMBERSHIPS
// ═══════════════════════════════════════════════
const MEMBERSHIP_PLANS = {
    'plan-esencial': {
        name: 'Esencial',
        price: 599,
        priceMonthly: 49.92,
        services: { cortes: 5, hidrataciones: 3 },
        discount: 5,
        features: ['5 cortes al año', '3 hidrataciones profundas', '5% dto. en extras', '5% dto. en productos', 'Diagnóstico capilar incluido']
    },
    'plan-premium': {
        name: 'Premium',
        price: 999,
        priceMonthly: 83.25,
        services: { cortes: 6, coloraciones: 3, hidrataciones: 4 },
        discount: 10,
        features: ['6 cortes al año', '3 coloraciones raíz', '4 hidrataciones', '10% dto. permanente', 'Prioridad de cita', 'Regalo cumpleaños']
    },
    'plan-vip': {
        name: 'VIP',
        price: 1499,
        priceMonthly: 124.92,
        services: { cortes: 8, coloraciones: 4, tratamientos: 6, especiales: 1 },
        discount: 15,
        features: ['8 cortes al año', '4 coloraciones completas', '6 tratamientos premium', '1 servicio especial', '15% dto. permanente', 'Pack 2 productos GRATIS', 'WhatsApp directo', 'Masaje capilar gratis']
    }
};

async function activateMembership(userId, planId) {
    const plan = MEMBERSHIP_PLANS[planId];
    if (!plan) return false;

    const inicio = new Date();
    const fin = new Date(inicio);
    fin.setFullYear(fin.getFullYear() + 1);

    await updateDoc(doc(db, 'clientes', userId), {
        membresiaId: planId,
        membresiaInicio: inicio.toISOString().split('T')[0],
        membresiaFin: fin.toISOString().split('T')[0],
        serviciosRestantes: { ...plan.services },
        actualizadoEn: serverTimestamp()
    });

    return true;
}

async function useServiceFromMembership(userId, serviceType) {
    const client = await getClientProfile(userId);
    if (!client || !client.membresiaId) return false;
    if (!client.serviciosRestantes[serviceType] || client.serviciosRestantes[serviceType] <= 0) return false;

    const update = {};
    update[`serviciosRestantes.${serviceType}`] = increment(-1);
    update.actualizadoEn = serverTimestamp();
    await updateDoc(doc(db, 'clientes', userId), update);
    return true;
}

// ═══════════════════════════════════════════════
// AVAILABILITY
// ═══════════════════════════════════════════════
const BUSINESS_HOURS = {
    castelldefels: {
        lunes: null, // cerrado
        martes: { open: '09:00', close: '19:00' },
        miercoles: { open: '09:00', close: '19:00' },
        jueves: { open: '09:00', close: '19:00' },
        viernes: { open: '09:00', close: '19:00' },
        sabado: { open: '09:00', close: '14:00' },
        domingo: null
    },
    'santa-perpetua': {
        lunes: null,
        martes: { open: '09:00', close: '19:00' },
        miercoles: { open: '09:00', close: '19:00' },
        jueves: { open: '09:00', close: '19:00' },
        viernes: { open: '09:00', close: '19:00' },
        sabado: { open: '09:00', close: '14:00' },
        domingo: null
    }
};

async function getAvailableSlots(sede, fecha) {
    const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const date = new Date(fecha);
    const dayName = dayNames[date.getDay()];
    const hours = BUSINESS_HOURS[sede]?.[dayName];

    if (!hours) return []; // closed

    // Generate 45-min slots
    const slots = [];
    let [h, m] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);

    while (h < closeH || (h === closeH && m < closeM)) {
        const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        slots.push(time);
        m += 45;
        if (m >= 60) { h++; m -= 60; }
    }

    // Check existing appointments
    const q = query(
        collection(db, 'citas'),
        where('sede', '==', sede),
        where('fecha', '==', fecha),
        where('estado', 'in', ['pendiente', 'confirmada', 'en-curso'])
    );
    const snap = await getDocs(q);
    const booked = [];
    snap.forEach(d => booked.push(d.data().hora));

    return slots.map(s => ({ time: s, available: !booked.includes(s) }));
}

// ═══════════════════════════════════════════════
// PLANES ANUALES DE SERVICIOS (-15%)
// ═══════════════════════════════════════════════

const ANNUAL_SERVICE_PLANS = [
    { id: 'anual-corte-mujer',       serviceId: 'corte-mujer',       nombre: 'Corte Mujer',              precioUnitario: 45,  frecuencia: 'mensual',    sesiones: 12, precioAnual: 459,    ahorro: 81 },
    { id: 'anual-corte-curly-seco',  serviceId: 'corte-curly-seco',  nombre: 'Corte Curly en Seco',       precioUnitario: 60,  frecuencia: 'mensual',    sesiones: 12, precioAnual: 612,    ahorro: 108 },
    { id: 'anual-corte-curly-premium', serviceId: 'corte-curly-premium', nombre: 'Corte Curly Premium',   precioUnitario: 85,  frecuencia: 'mensual',    sesiones: 12, precioAnual: 867,    ahorro: 153 },
    { id: 'anual-lavado-peinado',    serviceId: 'lavado-peinado',    nombre: 'Lavado + Peinado',          precioUnitario: 25,  frecuencia: 'mensual',    sesiones: 12, precioAnual: 255,    ahorro: 45 },
    { id: 'anual-tinte-raiz',        serviceId: 'tinte-raiz',        nombre: 'Tinte Raíz Orgánico',      precioUnitario: 50,  frecuencia: 'cada 5 sem', sesiones: 10, precioAnual: 425,    ahorro: 75 },
    { id: 'anual-tinte-organico',    serviceId: 'tinte-organico',    nombre: 'Tinte Orgánico Completo',   precioUnitario: 70,  frecuencia: 'cada 6 sem', sesiones: 8,  precioAnual: 476,    ahorro: 84 },
    { id: 'anual-mechas',            serviceId: 'mechas-completas',  nombre: 'Mechas Completas',          precioUnitario: 95,  frecuencia: 'trimestral', sesiones: 4,  precioAnual: 323,    ahorro: 57 },
    { id: 'anual-balayage',          serviceId: 'balayage',          nombre: 'Balayage Artesanal',        precioUnitario: 130, frecuencia: 'cada 4 meses', sesiones: 3, precioAnual: 331.50, ahorro: 58.50 },
    { id: 'anual-babylights',        serviceId: 'babylights',        nombre: 'Babylights',                precioUnitario: 115, frecuencia: 'trimestral', sesiones: 4,  precioAnual: 391,    ahorro: 69 },
    { id: 'anual-hidratacion',       serviceId: 'hidratacion',       nombre: 'Hidratación Profunda',      precioUnitario: 35,  frecuencia: 'mensual',    sesiones: 12, precioAnual: 357,    ahorro: 63 },
    { id: 'anual-nutricion',         serviceId: 'spa-capilar',       nombre: 'Nutrición Premium',         precioUnitario: 45,  frecuencia: 'mensual',    sesiones: 12, precioAnual: 459,    ahorro: 81 },
    { id: 'anual-keratina',          serviceId: 'keratina',          nombre: 'Alisado Keratina',          precioUnitario: 160, frecuencia: 'cada 4 meses', sesiones: 3, precioAnual: 408,    ahorro: 72 },
    { id: 'anual-botox',             serviceId: 'botox-capilar',     nombre: 'Botox Capilar',             precioUnitario: 100, frecuencia: 'trimestral', sesiones: 4,  precioAnual: 340,    ahorro: 60 },
    { id: 'anual-cobertura-canas',   serviceId: 'cobertura-canas',   nombre: 'Cobertura de Canas',        precioUnitario: 65,  frecuencia: 'cada 5 sem', sesiones: 10, precioAnual: 552.50, ahorro: 97.50 },
    { id: 'anual-transicion-canas',  serviceId: 'transicion-canas',  nombre: 'Transición a Canas',        precioUnitario: 90,  frecuencia: 'cada 6 sem', sesiones: 8,  precioAnual: 612,    ahorro: 108 }
];

async function subscribeAnnualPlan(userId, planId) {
    const plan = ANNUAL_SERVICE_PLANS.find(p => p.id === planId);
    if (!plan) throw new Error('Plan no encontrado');

    const now = new Date();
    const fin = new Date(now);
    fin.setFullYear(fin.getFullYear() + 1);

    const ref = doc(collection(db, 'planesAnuales'));
    await setDoc(ref, {
        userId,
        planId: plan.id,
        serviceId: plan.serviceId,
        nombre: plan.nombre,
        precioUnitario: plan.precioUnitario,
        precioAnual: plan.precioAnual,
        sesionesTotal: plan.sesiones,
        sesionesUsadas: 0,
        sesionesRestantes: plan.sesiones,
        inicio: now.toISOString().split('T')[0],
        fin: fin.toISOString().split('T')[0],
        estado: 'activo',
        creadoEn: serverTimestamp()
    });
    return ref.id;
}

async function getClientAnnualPlans(userId) {
    const q = query(
        collection(db, 'planesAnuales'),
        where('userId', '==', userId),
        where('estado', '==', 'activo')
    );
    const snap = await getDocs(q);
    const plans = [];
    snap.forEach(d => plans.push({ id: d.id, ...d.data() }));
    return plans;
}

async function useAnnualPlanSession(planDocId) {
    const ref = doc(db, 'planesAnuales', planDocId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Plan no encontrado');
    const data = snap.data();
    if (data.sesionesRestantes <= 0) throw new Error('Sin sesiones restantes');
    
    await updateDoc(ref, {
        sesionesUsadas: increment(1),
        sesionesRestantes: increment(-1)
    });
}

// ═══════════════════════════════════════════════
// SUPER ADMIN CHECK
// ═══════════════════════════════════════════════

function isSuperAdmin(email) {
    return email === 'neuriaxx@gmail.com';
}

// ═══════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════
export {
    app, auth, db,
    // Auth
    onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile,
    // Firestore
    collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, increment, arrayUnion, arrayRemove, writeBatch,
    // Custom functions
    isAdmin, isSuperAdmin, ADMIN_EMAILS,
    generateClientNumber, createClientProfile, getClientProfile, updateClientProfile,
    calculateLevel, LEVEL_CONFIG, POINTS_CONFIG, addPoints,
    validateCoupon, useCoupon,
    createAppointment, updateAppointment,
    createSale, updateStock,
    DEFAULT_SERVICES, initializeServices,
    MEMBERSHIP_PLANS, activateMembership, useServiceFromMembership,
    ANNUAL_SERVICE_PLANS, subscribeAnnualPlan, getClientAnnualPlans, useAnnualPlanSession,
    BUSINESS_HOURS, getAvailableSlots
};
