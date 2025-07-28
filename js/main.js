// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUPUM36QOLPGb-FmPx6-qMZoS2pCZdurI",
    authDomain: "meetransportation.firebaseapp.com",
    projectId: "meetransportation",
    storageBucket: "meetransportation.firebasestorage.app",
    messagingSenderId: "1087042032724",
    appId: "1:1087042032724:web:0975e57ca30ff342f349c1",
    measurementId: "G-8XHXKXL0CV"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();


// Proveedor Google
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Translations
const translations = {
    es: {
        "inicio": "Inicio",
        "servicios": "Servicios",
        "cotizacion": "Cotización",
        "contacto": "Contacto",
        "login": "Iniciar Sesión",
        "logout": "Cerrar Sesión",
        "miPerfil": "Mi perfil",
        "heroTitle": "Envíos seguros de USA a República Dominicana",
        "heroText": "Especializados en el envío de cajas y tanques azules desde Nueva York a todo el territorio dominicano. Confiabilidad, rapidez y transparencia en cada envío.",
        "quoteBtn": "Solicitar Cotización",
        "servicesBtn": "Nuestros Servicios",
        "EstadosUnidos": "Estados Unidos",
        "RD": "República Dominicana",
        "NY": "Nueva York, NY",
        "TodoPais": "Todo el país",
        "rastreo": "Rastreo",

        // Nuevos textos
        "NuestrosServiciosTitle": "Nuestros Servicios",
        "noArroz": "¿No tienes arroz o aceite?",
        "vendemosArroz": "¡No te preocupes! Nosotros te lo vendemos al mejor precio.",
        "noCaja": "¿No tienes caja o tanque?",
        "vendemosCaja": "¡No te preocupes! Nosotros te lo vendemos al mejor precio.",
        "orderBtn": "Ordenar",
        "solicitaCotizacion": "Solicita tu Cotización",
        "nombreCompleto": "Nombre Completo",
        "correoElectronico": "Correo Electrónico",
        "contraseña": "Contraseña",
        "telefono": "Teléfono",
        "tipoPaquete": "Tipo de Paquete",
        "articuloComun": "Artículo Común",
        "personalizado": "Personalizado",
        "seleccioneArticulo": "Seleccione el artículo",
        "articuloEnviar": "Artículo a enviar",
        "valorComercial": "Valor comercial (USD)",
        "largo": "Largo (pulgadas)",
        "ancho": "Ancho (pulgadas)",
        "alto": "Alto (pulgadas)",
        "peso": "Peso (lbs)",
        //"origen": "Origen",
        //"destino": "Destino",
        "seleccioneProvincia": "Seleccione una provincia",
        "mensajeAdicional": "Mensaje adicional (opcional)",
        "enviarSolicitud": "Enviar Solicitud",
        "contactoTitle": "Contacto",
        "preguntaContacto": "¿Tienes alguna pregunta? No dudes en contactarnos. Estamos aquí para ayudarte con tus necesidades de envío.",
        "especialistas": "Especialistas en envíos desde Estados Unidos a República Dominicana. Confiabilidad y rapidez encada entrega.",
        "enlacesrapidos": "Enlaces Rápidos",
        "horarioTitle": "Horario",
        "lunesSabado": "Lunes - Sábado: 9:30am - 8:00pm",
        "domingoCerrado": "Domingo: Cerrado",
        "derechosReservados": "© 2025 MeeTransportation. Todos los derechos reservados.",
        "solicitudEnviada": "¡Solicitud Enviada!",
        "confirmacionSolicitud": "Hemos recibido tu solicitud de cotización. Nos pondremos en contacto contigo en las próximas 24 horas con los detalles de tu envío.",
        "cerrar": "Cerrar",
        "iniciarRegistroTitle": "Iniciar Sesión / Registrarse",
        "yaTengoCuenta": "Ya tengo cuenta",
        "crearCuenta": "Crear cuenta",
        "oIniciaGoogle": "O inicia sesión con",
        "paisreg": "País:",
        "selectpais": "Seleccione un país:",
        "selectstate": "Estado/Provincia:",
        "direccionreg": "Dirección (Calle y Número):",
        "Ciudad": "Ciudad:",
        "codigopostal": "Código Postal:",
        "aceptoTerminos": "Acepto los",
        "terminosCondiciones": "Términos y Condiciones",
        "Aceptar": "Accept",
        "tuCarrito": "Tu Carrito",
        "carritoVacio": "Tu carrito está vacío",
        "vaciarCarrito": "Vaciar Carrito",
        "pago": "Proceder al Pago",
        "infoCompra": "Información de Compra",
        "llamanosParaComprar": "Nos encantaría ayudarte con tu pedido. Por favor llámanos al siguiente número y te lo vendemos al mejor precio:",
        "llamanosParaComprar2": "Nuestro equipo estará encantado de atenderte y proporcionarte toda la información que necesites.",
        "entendido": "Entendido",
        "continuarcongoogle": "Continuar con Google",
        "nombrePlaceholder": "Nombre y Apellido",
        "tuemail": "tucorreo@email.com"
    },
    en: {
        "inicio": "Home",
        "servicios": "Services",
        "cotizacion": "Quote",
        "contacto": "Contact",
        "login": "Login",
        "logout": "Logout",
        "miPerfil": "My Profile",
        "heroTitle": "Secure shipping from USA to Dominican Republic",
        "heroText": "Specialized in shipping boxes and blue tanks from New York to all Dominican territory. Reliability, speed and transparency in every shipment.",
        "quoteBtn": "Request Quote",
        "servicesBtn": "Our Services",
        "EstadosUnidos": "United States",
        "RD": "Dominican Republic",
        "NY": "New York, NY",
        "TodoPais": "The whole country",
        "rastreo": "Tracking",

        // Nuevos textos
        "NuestrosServiciosTitle": "Our Services",
        "noArroz": "Don't have rice or oil?",
        "vendemosArroz": "Don't worry! We’ll sell it to you at the best price.",
        "noCaja": "Don't have a box or tank?",
        "vendemosCaja": "Don't worry! We’ll sell it to you at the best price.",
        "orderBtn": "Order",
        "solicitaCotizacion": "Request your Quote",
        "nombreCompleto": "Full Name",
        "correoElectronico": "Email Address",
        "contraseña": "Password",
        "telefono": "Phone Number",
        "tipoPaquete": "Package Type",
        "articuloComun": "Common Item",
        "personalizado": "Custom",
        "seleccioneArticulo": "Select the item",
        "articuloEnviar": "Item to send",
        "valorComercial": "Commercial Value (USD)",
        "largo": "Length (inches)",
        "ancho": "Width (inches)",
        "alto": "Height (inches)",
        "peso": "Weight (lbs)",
        "origen": "Origin",
        "destino": "Destination",
        "seleccioneProvincia": "Select a province",
        "mensajeAdicional": "Additional message (optional)",
        "enviarSolicitud": "Submit Request",
        "contactoTitle": "Contact",
        "preguntaContacto": "Have a question? Don’t hesitate to contact us. We’re here to help with your shipping needs.",
        "especialistas": "Specialists in shipping from the United States to the Dominican Republic. Reliability and speed in every delivery.",
        "enlacesrapidos": "Quick Links",
        "horarioTitle": "Hours",
        "lunesSabado": "Monday - Saturday: 9:30am - 8:00pm",
        "domingoCerrado": "Sunday: Closed",
        "derechosReservados": "© 2025 MeeTransportation. All rights reserved.",
        "solicitudEnviada": "Request Sent!",
        "confirmacionSolicitud": "We have received your quote request. We'll contact you within 24 hours with the shipping details.",
        "cerrar": "Close",
        "iniciarRegistroTitle": "Sign In / Register",
        "yaTengoCuenta": "I already have an account",
        "crearCuenta": "Create Account",
        "oIniciaGoogle": "Or sign in with",
        "direccionreg": "Address (Street and Number):",
        "Ciudad": "City:",
        "codigopostal": "Postal Code:",
        "aceptoTerminos": "I accept the",
        "terminosCondiciones": "Terms and Conditions",
        "Aceptar": "Accept",
        "paisreg": "Country:",
        "selectpais": "Select a country:",
        "selectstate": "State/Province:",
        "tuCarrito": "Your Cart",
        "carritoVacio": "Your cart is empty",
        "vaciarCarrito": "Empty Cart",
        "pago": "Proceed to Checkout",
        "infoCompra": "Purchase Information",
        "llamanosParaComprar": "We'd love to help with your order. Please call us at the number below and we’ll sell it to you at the best price:",
        "llamanosParaComprar2": "Our team will be happy to assist you and provide all the information you need.",
        "entendido": "Understood",
        "continuarcongoogle": "Continue with Google",
        "nombrePlaceholder": "Full Name",
        "tuemail": "yourmail@email.com"
    }
};


let currentLanguage = 'es'; // Default language
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function changeLanguage(lang) {
    currentLanguage = lang;
    document.getElementById('languageSelector').value = lang;

    // Update document language and title
    document.documentElement.lang = lang;
    document.title = lang === 'es' 
        ? "Meetransportation - Envíos de USA a República Dominicana"
        : "Meetransportation - Shipping from USA to Dominican Republic";
        
    // Actualizar el texto del idioma actual
    document.getElementById('currentLanguageText').textContent = lang === 'es' ? 'ES' : 'EN';

        // Actualizar la bandera según el idioma
    const flagImg = document.querySelector('#languageToggle img');
    if (flagImg) {
        flagImg.src = lang === 'es' 
            ? "./img/icons/bandera_rd_1.svg" 
            : "./img/icons/bandera_usa_1.svg";
    }

    // Actualizar textos normales
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Actualizar placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.setAttribute('placeholder', translations[lang][key]);
        }
    });

    // Actualizar el texto "Mi perfil" si el usuario está logueado
if (currentUser) {
    const userProfile = document.getElementById('userProfile');
    if (userProfile) {
        // Solo actualiza el texto del span que tiene el data-i18n, no todo el contenido
        const miPerfilSpan = userProfile.querySelector('[data-i18n="miPerfil"]');
        if (miPerfilSpan) {
            miPerfilSpan.textContent = translations[lang]['miPerfil'];
        }
    }
}

    // Actualizar servicios y artículos comunes
    const servicesContainer = document.getElementById('servicesContainer');
    const cachedServices = localStorage.getItem('cachedServices');
    if (cachedServices) {
        try {
            const services = JSON.parse(cachedServices);
            renderServices(services, servicesContainer);
        } catch (e) {
            console.error('Error parsing cached services:', e);
        }
    }

    const commonItemsContainer = document.getElementById('commonItemsContainer');
    const cachedCommonItems = localStorage.getItem('cachedCommonItems');
    if (cachedCommonItems) {
        try {
            const items = JSON.parse(cachedCommonItems);
            const selectedItemsContainer = document.querySelector('.selected-items-container');
            renderCommonItems(items, commonItemsContainer, selectedItemsContainer || document.createElement('div'));
        } catch (e) {
            console.error('Error parsing cached common items:', e);
        }
    }

    // Save language preference
    localStorage.setItem('preferredLanguage', lang);
}

// Global variables
let currentUser = null;

// DOM Elements
const quoteForm = document.getElementById('quoteForm');
const successModal = document.getElementById('successModal');
const loginModal = document.getElementById('loginModal');
const profileModal = document.getElementById('profileModal');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userProfile = document.getElementById('userProfile');
const customPackageDiv = document.getElementById('customPackage');
const commonItemDiv = document.getElementById('commonItemDiv');

// Funciones del carrito
// Para el contador
function updateCartCount() {
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    document.getElementById('cartCount').textContent = count;
    // Si tienes un segundo contador con ID diferente
    const cartCount2 = document.getElementById('cartCount2');
    if (cartCount2) cartCount2.textContent = count;
}

// Para los botones
document.getElementById('cartBtn').addEventListener('click', function (e) {
    e.preventDefault();
    renderCartItems();
    showModal(document.getElementById('cartModal'));
});

// Si tienes un segundo botón con ID diferente
const cartBtn2 = document.getElementById('cartBtn2');
if (cartBtn2) {
    cartBtn2.addEventListener('click', function (e) {
        e.preventDefault();
        renderCartItems();
        showModal(document.getElementById('cartModal'));
    });
}

function renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    const totalElement = document.getElementById('cartTotal');

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align: center;">Your cart is empty</p>';
        totalElement.textContent = '';
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const price = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
        const quantity = item.quantity || 1;
        const subtotal = price * quantity;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.style.display = 'flex';
        itemElement.style.justifyContent = 'space-between';
        itemElement.style.alignItems = 'center';
        itemElement.style.padding = '10px';
        itemElement.style.borderBottom = '1px solid #eee';

        // Mostrar la imagen si existe, o una imagen por defecto si no
        const itemImage = item.icon || item.iconUrl || './img/placeholder-item.png';

        itemElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <img src="${itemImage}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 5px;">
                <div style="flex: 1;">
                    <div style="font-weight: bold;">${item.name}</div>
                    <div style="font-size: 0.9em; color: #666;">USD$${item.price}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                <button class="change-quantity" data-index="${index}" data-change="-1">-</button>
               <span style="margin: 0 10px;background: #0000001c;padding: 0rem 1rem;border-radius: 6px;">${quantity}</span>
                <button class="change-quantity" data-index="${index}" data-change="1">+</button>
                <button class="remove-item" data-index="${index}" style="background: none; border: none; color: var(--accent); margin-left: 15px; cursor: pointer;">
                    <i class="fas fa-trash" style="font-size: 1.2rem;"></i>
                </button>
            </div>
        `;

        container.appendChild(itemElement);
        total += subtotal;
    });

    totalElement.textContent = `Total: US$${total.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(service) {
    const existingItem = cart.find(item => item.id === service.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            ...service,
            quantity: 1
        });
    }

    saveCart();
    renderCartItems();

    // Mostrar notificación
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '60px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--success)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.textContent = 'Servicio agregado al carrito';

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Función para cargar los servicios desde Firebase
// Modifica la función loadServices para implementar el caché
async function loadServices() {
    const servicesContainer = document.getElementById('servicesContainer');

    // Verificar si hay datos en el localStorage
    const cachedServices = localStorage.getItem('cachedServices');
    const lastUpdated = localStorage.getItem('servicesLastUpdated');
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000; // 1 hora en milisegundos

    // Mostrar datos cacheados si son recientes (menos de 1 hora)
    if (cachedServices && lastUpdated && (now - parseInt(lastUpdated)) < oneHour) {
        try {
            const services = JSON.parse(cachedServices);
            renderServices(services, servicesContainer);
        } catch (e) {
            console.error('Error parsing cached services:', e);
            // Si hay error al parsear, cargar desde Firebase
            loadFromFirebase(servicesContainer);
        }
    } else {
        // No hay caché o está desactualizado, cargar desde Firebase
        loadFromFirebase(servicesContainer);
    }

    // Configurar listener en tiempo real para actualizaciones
    setupRealtimeListener();
}

// Función para cargar servicios desde Firebase
async function loadFromFirebase(container) {
    container.innerHTML = '<p>Cargando servicios...</p>';

    try {
        const snapshot = await db.collection('services')
            .orderBy('position', 'asc')
            .get();

        if (snapshot.empty) {
            container.innerHTML = '<p>No hay servicios disponibles</p>';
            return;
        }

        const services = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Guardar en caché
        localStorage.setItem('cachedServices', JSON.stringify(services));
        localStorage.setItem('servicesLastUpdated', new Date().getTime().toString());

        // Renderizar servicios
        renderServices(services, container);

    } catch (error) {
        console.error('Error cargando servicios:', error);
        container.innerHTML = '<p>Error al cargar los servicios</p>';
    }
}

// Función para configurar el listener en tiempo real
function setupRealtimeListener() {
    db.collection('services')
        .orderBy('position', 'asc')
        .onSnapshot(snapshot => {
            const services = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Actualizar caché
            localStorage.setItem('cachedServices', JSON.stringify(services));
            localStorage.setItem('servicesLastUpdated', new Date().getTime().toString());

            // Si la página está visible, actualizar la UI
            if (!document.hidden) {
                const container = document.getElementById('servicesContainer');
                renderServices(services, container);
            }
        }, error => {
            console.error('Error en listener de servicios:', error);
        });
}

// Función para renderizar los servicios (extraída de la lógica original)
function renderServices(services, container) {
    container.innerHTML = '';

    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';

        const isPromo = service.type === 'promo';
        if (isPromo) {
            serviceCard.classList.add('offer-card');
        }

        // Usar el idioma actual para todos los campos traducibles
        const serviceName = service[`name_${currentLanguage}`] || service.name;
        const slot1 = service[`slot1_${currentLanguage}`] || service.slot1;
        const slot2 = service[`slot2_${currentLanguage}`] || service.slot2;
        const slot3 = service[`slot3_${currentLanguage}`] || service.slot3;
        const slot4 = service[`slot4_${currentLanguage}`] || service.slot4;
        const price = service[`price_${currentLanguage}`] || service.price;

        // Formatear el precio según si es promoción o no
        const priceContent = isPromo
            ? `<div class="service-price">${price}</div>`
            : `<div class="service-price">${currentLanguage === 'es' ? 'US$' : 'USD$'}${price}</div>`;

        const headerContent = `
            <div class="service-header">
                ${!isPromo && service.icon ? `<div class="service-icon"><img src="${service.icon}" alt="${serviceName}"></div>` : ''}
                <div class="service-title">${serviceName}</div>
                ${priceContent}
            </div>
        `;

        const detailsAndButtons = `
            <div class="service-details-buttons-container">
                <div class="service-details-container">
                    <ul class="service-details">
                        ${slot1 ? `<li><strong>${slot1.split(':')[0]}:</strong> ${slot1.split(':').slice(1).join(':')}</li>` : ''}
                        ${slot2 ? `<li><strong>${slot2.split(':')[0]}:</strong> ${slot2.split(':').slice(1).join(':')}</li>` : ''}
                        ${slot3 ? `<li><strong>${slot3.split(':')[0]}:</strong> ${slot3.split(':').slice(1).join(':')}</li>` : ''}
                        ${slot4 ? `<li><strong>${slot4.split(':')[0]}:</strong> ${slot4.split(':').slice(1).join(':')}</li>` : ''}
                    </ul>
                </div>
                ${!isPromo ? `
                <div class="service-buttons">
                    <button class="btn-ordenar" data-service-id="${service.id}">${currentLanguage === 'es' ? 'Ordenar' : 'Order'}</button>
                    <button class="btn-add-to-cart" data-service-id="${service.id}">${currentLanguage === 'es' ? 'Añadir al carrito' : 'Add to cart'}</button>
                </div>
                ` : ''}
            </div>
        `;

        serviceCard.innerHTML = headerContent + detailsAndButtons;
        container.appendChild(serviceCard);
    });

    setupServiceButtons();
}

// Función para configurar los event listeners de los botones
function setupServiceButtons() {
    // Event listeners para los botones de ordenar
    document.querySelectorAll('.btn-ordenar').forEach(button => {
        button.addEventListener('click', async function () {
            const serviceId = this.getAttribute('data-service-id');
            try {
                const doc = await db.collection('services').doc(serviceId).get();
                if (doc.exists) {
                    const service = doc.data();

                    // Agregar el servicio al carrito
                    addToCart({
                        id: doc.id,
                        name: service.name,
                        price: service.price,
                        icon: service.icon || null,
                        type: service.type,
                        slot1: service.slot1,
                        slot2: service.slot2,
                        slot3: service.slot3,
                        slot4: service.slot4
                    });

                    // Redirigir al checkout
                    window.location.href = 'checkout.html';
                }
            } catch (error) {
                console.error('Error al obtener el servicio:', error);
                alert('Error al procesar la orden. Por favor intente nuevamente.');
            }
        });
    });

    // Event listeners para los botones de añadir al carrito
    document.querySelectorAll('.btn-add-to-cart').forEach(button => {
        button.addEventListener('click', async function () {
            const serviceId = this.getAttribute('data-service-id');
            try {
                const doc = await db.collection('services').doc(serviceId).get();
                if (doc.exists) {
                    const service = doc.data();
                    addToCart({
                        id: doc.id,
                        name: service.name,
                        price: service.price,
                        icon: service.icon || null,
                        type: service.type,
                        slot1: service.slot1,
                        slot2: service.slot2,
                        slot3: service.slot3,
                        slot4: service.slot4
                    });
                }
            } catch (error) {
                console.error('Error al agregar al carrito:', error);
                alert('Error al agregar al carrito. Por favor intente nuevamente.');
            }
        });
    });
}

// Función para cargar los artículos comunes
// Función para cargar los artículos comunes desde Firebase con caché
async function loadCommonItems() {
    const container = document.getElementById('commonItemsContainer');
    container.innerHTML = '<p>Cargando artículos...</p>';

    const selectedItemsContainer = document.createElement('div');
    selectedItemsContainer.className = 'selected-items-container';
    container.parentNode.insertBefore(selectedItemsContainer, container.nextSibling);

    // Verificar si hay datos en el localStorage
    const cachedItems = localStorage.getItem('cachedCommonItems');
    const lastUpdated = localStorage.getItem('commonItemsLastUpdated');
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000; // 1 hora en milisegundos

    // Mostrar datos cacheados si son recientes (menos de 1 hora)
    if (cachedItems && lastUpdated && (now - parseInt(lastUpdated)) < oneHour) {
        try {
            const items = JSON.parse(cachedItems);
            renderCommonItems(items, container, selectedItemsContainer);
        } catch (e) {
            console.error('Error parsing cached common items:', e);
            // Si hay error al parsear, cargar desde Firebase
            loadCommonItemsFromFirebase(container, selectedItemsContainer);
        }
    } else {
        // No hay caché o está desactualizado, cargar desde Firebase
        loadCommonItemsFromFirebase(container, selectedItemsContainer);
    }

    // Configurar listener en tiempo real para actualizaciones
    setupCommonItemsRealtimeListener(container, selectedItemsContainer);
}

// Función para cargar artículos comunes desde Firebase
async function loadCommonItemsFromFirebase(container, selectedItemsContainer) {
    container.innerHTML = '<p>Cargando artículos...</p>';

    try {
        const snapshot = await db.collection('CommonItems').get();

        if (snapshot.empty) {
            container.innerHTML = '<p>No hay artículos disponibles</p>';
            return;
        }

        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Guardar en caché
        localStorage.setItem('cachedCommonItems', JSON.stringify(items));
        localStorage.setItem('commonItemsLastUpdated', new Date().getTime().toString());

        // Renderizar artículos
        renderCommonItems(items, container, selectedItemsContainer);

    } catch (error) {
        console.error('Error loading common items:', error);
        container.innerHTML = '<p>Error al cargar los artículos</p>';
    }
}

// Función para configurar el listener en tiempo real de artículos comunes
function setupCommonItemsRealtimeListener(container, selectedItemsContainer) {
    db.collection('CommonItems')
        .onSnapshot(snapshot => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Actualizar caché
            localStorage.setItem('cachedCommonItems', JSON.stringify(items));
            localStorage.setItem('commonItemsLastUpdated', new Date().getTime().toString());

            // Si la página está visible, actualizar la UI
            if (!document.hidden) {
                renderCommonItems(items, container, selectedItemsContainer);
            }
        }, error => {
            console.error('Error en listener de artículos comunes:', error);
        });
}

// Función para renderizar los artículos comunes (extraída de la lógica original)
// En la función renderCommonItems, modifica la parte donde se muestra el nombre del artículo
function renderCommonItems(items, container, selectedItemsContainer) {
    container.innerHTML = '';

    items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'common-item-btn';
        btn.type = 'button';
        btn.dataset.id = item.id;

        // Formatear dimensiones si es un array
        let dimensionsText = item.dimensions;
        if (Array.isArray(item.dimensions)) {
            dimensionsText = item.dimensions.join('" x ') + '"';
        }

        // Mostrar peso si existe
        const weightText = item.weight ? `${item.weight} lbs` : 'N/A';

        // Mostrar el nombre en el idioma correspondiente
        const itemName = currentLanguage === 'en' && item.name_en ? item.name_en : item.name;

        btn.innerHTML = `
            <img src="${item.icon || 'https://via.placeholder.com/50'}" alt="${itemName}" style="width: 50px; height: 50px; object-fit: contain;">
            <span class="item-name">${itemName}</span>
            <span class="item-dimensions">${dimensionsText}</span>
            <span class="item-weight">${weightText}</span>
        `;

        btn.addEventListener('click', () => {
            const existingItem = selectedItemsContainer.querySelector(`[data-id="${item.id}"]`);

            if (existingItem) {
                existingItem.remove();
                btn.classList.remove('selected');
                updateSelectedItemsField(selectedItemsContainer);
                return;
            }

            btn.classList.add('selected');

            const selectedItem = document.createElement('div');
            selectedItem.className = 'selected-item';
            selectedItem.dataset.id = item.id;

            const defaultDims = Array.isArray(item.dimensions) ? item.dimensions : [0, 0, 0];
            const defaultWeight = item.weight || 0;

            // Usar el nombre en el idioma correspondiente también en el item seleccionado
            const selectedItemName = currentLanguage === 'en' && item.name_en ? item.name_en : item.name;

            selectedItem.innerHTML = `
                <img src="${item.icon || 'https://via.placeholder.com/50'}" alt="${selectedItemName}">
                <div class="item-info">
                    <span id="item-info-name">${selectedItemName}</span>
                    <div class="dimension-inputs">
                        <div>
                            <label>Largo (pulg):</label>
                            <input type="number" class="dimension-input" data-dim="length" value="${defaultDims[0]}" min="1">
                        </div>
                        <div>
                            <label>Ancho (pulg):</label>
                            <input type="number" class="dimension-input" data-dim="width" value="${defaultDims[1]}" min="1">
                        </div>
                        <div>
                            <label>Alto (pulg):</label>
                            <input type="number" class="dimension-input" data-dim="height" value="${defaultDims[2]}" min="1">
                        </div>
                        <div>
                            <label style="color: #ff6000;">Peso (lbs):</label>
                            <input type="number" class="weight-input" value="${defaultWeight}" min="1">
                        </div>
                        <div>
                            <label style="color: #0089cd;">Cantidad:</label>
                            <input type="number" class="item-quantity" value="1" min="1" data-price="${item.price || 0}">
                        </div>
                        <div>
                            <span class="remove-item" onclick="removeSelectedItem('${item.id}')">×</span>
                        </div>
                    </div>
                </div>
            `;

            selectedItem.querySelectorAll('.dimension-input, .weight-input').forEach(input => {
                input.addEventListener('change', () => updateSelectedItemsField(selectedItemsContainer));
            });

            selectedItem.querySelector('.item-quantity').addEventListener('change', () => {
                updateSelectedItemsField(selectedItemsContainer);
            });

            selectedItemsContainer.appendChild(selectedItem);
            updateSelectedItemsField(selectedItemsContainer);
        });

        container.appendChild(btn);
    });
}

// Función para eliminar un artículo seleccionado
function removeSelectedItem(itemId) {
    const item = document.querySelector(`.selected-item[data-id="${itemId}"]`);
    const btn = document.querySelector(`.common-item-btn[data-id="${itemId}"]`);

    if (item) {
        item.remove();
        if (btn) {
            btn.classList.remove('selected');
        }
        updateSelectedItemsField(document.querySelector('.selected-items-container'));
    }
}

// Función para actualizar el campo oculto con los artículos seleccionados
function updateSelectedItemsField(container) {
    const selectedItems = [];
    container.querySelectorAll('.selected-item').forEach(item => {
        const name = item.querySelector('.item-info span').textContent;
        const length = parseFloat(item.querySelector('[data-dim="length"]').value) || 0;
        const width = parseFloat(item.querySelector('[data-dim="width"]').value) || 0;
        const height = parseFloat(item.querySelector('[data-dim="height"]').value) || 0;
        const weight = parseFloat(item.querySelector('.weight-input').value) || 0;
        const quantity = parseInt(item.querySelector('.item-quantity').value) || 1;
        const price = parseFloat(item.querySelector('.item-quantity').dataset.price) || 0;

        selectedItems.push({
            id: item.dataset.id,
            name: name,
            dimensions: `${length}" x ${width}" x ${height}"`,
            dimensionsArray: [length, width, height],
            weight: weight,
            quantity: quantity,
            price: price
        });
    });

    // Actualiza el campo oculto
    document.getElementById('commonItemType').value = JSON.stringify(selectedItems);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    
    // Cargar artículos comunes
    loadCommonItems();
    loadServices();

    // Hide registration fields by default
    document.getElementById('registerFields').style.display = 'none';
    document.getElementById('showLoginBtn').style.display = 'none';

    // Package type change listener
    const packageOptions = document.querySelectorAll('input[name="package"]');
    packageOptions.forEach(option => {
        option.addEventListener('change', function () {
            customPackageDiv.classList.remove('show');
            commonItemDiv.classList.remove('show');

            if (this.value === 'Personalizado') {
                customPackageDiv.classList.add('show');
            } else if (this.value === 'Artículo Común') {
                commonItemDiv.classList.add('show');
            }
        });
    });


    // Address country change listeners
    document.getElementById('country')?.addEventListener('change', function () {
        loadStates(this.value, 'state');
    });

    document.getElementById('profileCountry')?.addEventListener('change', function () {
        loadStates(this.value, 'profileState');
    });

    // Quote form submission
    quoteForm.addEventListener('submit', handleQuoteSubmission);

    // Modal listeners
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    document.querySelectorAll('.close-terms-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            document.getElementById('termsModal').style.display = 'none';
            if (document.getElementById('registerFields').style.display === 'block') {
                document.getElementById('loginModal').style.display = 'flex';
            }
        });
    });

    // Authentication listeners
    loginBtn.addEventListener('click', () => showModal(loginModal));
    logoutBtn.addEventListener('click', logout);
    userProfile.addEventListener('click', () => showModal(profileModal));

    document.getElementById('loginUserBtn').addEventListener('click', loginUser);
    document.getElementById('registerUserBtn').addEventListener('click', registerUser);
    document.getElementById('showLoginBtn').addEventListener('click', showLoginForm);

    // Event listener para el formulario de autenticación
    document.getElementById('authForm').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            // Solo activar login si no estamos en modo registro
            if (document.getElementById('registerFields').style.display === 'none') {
                e.preventDefault(); // Prevenir el comportamiento por defecto
                loginUser(); // Llamar a la función de login
            }
        }
    });

    // Google Sign-In Button
    document.getElementById('googleSignInBtn').addEventListener('click', signInWithGoogle);

    // Close modal with X button
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Language selector
    document.getElementById('languageSelector').addEventListener('change', (e) => {
        changeLanguage(e.target.value);
    });

    // Carrito functionality
    document.getElementById('cartBtn').addEventListener('click', function (e) {
        e.preventDefault();
        renderCartItems();
        showModal(document.getElementById('cartModal'));
    });

    document.getElementById('checkoutBtn').addEventListener('click', function () {
        if (cart.length === 0) return;
        localStorage.setItem('cart', JSON.stringify(cart));
        window.location.href = 'checkout.html';
    });

    document.getElementById('clearCartBtn').addEventListener('click', function () {
        cart = [];
        saveCart();
        renderCartItems();
    });

    // Delegación de eventos para los botones de cantidad y eliminar
    document.getElementById('cartItemsContainer').addEventListener('click', function (e) {
        if (e.target.classList.contains('change-quantity') || e.target.parentElement.classList.contains('change-quantity')) {
            const button = e.target.classList.contains('change-quantity') ? e.target : e.target.parentElement;
            const index = parseInt(button.getAttribute('data-index'));
            const change = parseInt(button.getAttribute('data-change'));

            cart[index].quantity = (cart[index].quantity || 1) + change;

            if (cart[index].quantity < 1) {
                cart.splice(index, 1);
            }

            saveCart();
            renderCartItems();
        }

        if (e.target.classList.contains('remove-item') || e.target.parentElement.classList.contains('remove-item')) {
            const button = e.target.classList.contains('remove-item') ? e.target : e.target.parentElement;
            const index = parseInt(button.getAttribute('data-index'));

            cart.splice(index, 1);
            saveCart();
            renderCartItems();
        }
    });



    // Inicializar el contador del carrito
    updateCartCount();

    // Load saved language or detect browser language
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const browserLanguage = navigator.language.split('-')[0];
    const initialLanguage = savedLanguage || (browserLanguage === 'es' ? 'es' : 'en');
    
    // Apply language change but skip animation/transition if it's the initial load
    const preloadStyleEl = document.getElementById('preload-language-styles');
    
    // If we're starting with English and the preload style exists, we'll handle transitions ourselves
    if (initialLanguage === 'en' && preloadStyleEl) {
        changeLanguage(initialLanguage);
        // Remove the preload style after a short delay to ensure translations are applied
        setTimeout(() => {
            preloadStyleEl.remove();
        }, 50);
    } else {
        // For Spanish or when no preload style exists, just change normally
        changeLanguage(initialLanguage);
    }

    // Check authentication state
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            updateUIForLoggedInUser(user);
        } else {
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    });


    // Toggle language with globe icon
    document.getElementById('languageToggle').addEventListener('click', function () {
        const newLang = currentLanguage === 'es' ? 'en' : 'es';
        changeLanguage(newLang);
    });

});

// Sign in with Google
async function signInWithGoogle() {
    const messageDiv = document.getElementById('authMessage');
    const googleBtn = document.getElementById('googleSignInBtn');
    const originalText = googleBtn.innerHTML;

    try {
        googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
        googleBtn.disabled = true;

        const result = await firebase.auth().signInWithPopup(googleProvider);
        const user = result.user;

        // Check if new user
        if (result.additionalUserInfo?.isNewUser) {
            // Create user profile in Firestore
            await db.collection('users').doc(user.uid).set({
                email: user.email,
                registrationDate: firebase.firestore.FieldValue.serverTimestamp(),
                profile: {
                    name: user.displayName || user.email.split('@')[0],
                    phone: user.phoneNumber || '',
                    photoURL: user.photoURL || ''
                },
                termsAccepted: true,
                termsAcceptanceDate: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Show success message
        messageDiv.style.color = 'var(--success)';
        messageDiv.textContent = 'Inicio de sesión con Google exitoso!';

        // Close modal after short delay
        setTimeout(() => {
            closeModals();
        }, 1500);

    } catch (error) {
        console.error('Error en autenticación con Google:', error);
        messageDiv.textContent = getAuthErrorMessage(error.code);
    } finally {
        if (googleBtn) {
            googleBtn.innerHTML = originalText;
            googleBtn.disabled = false;
        }
    }
}


async function handleQuoteSubmission(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        const formData = await collectFormData();
        const quoteId = await generateId('mt');
        let itemCounter = 1;
        let itemsWithSubIds = [];

        if (formData.packageType === 'Artículo Común' && formData.commonItems) {
            itemsWithSubIds = formData.commonItems.flatMap(item => {
                const items = [];
                const quantity = item.quantity || 1;

                for (let i = 0; i < quantity; i++) {
                    const itemData = {
                        id: item.id,
                        subId: `${quoteId}-${itemCounter++}`,
                        name: item.name,
                        dimensions: item.dimensions, // Mantenemos el formato de cadena existente
                        weight: item.weight,
                        price: item.price,
                        commercialValue: item.price || 0, // Usamos el precio como valor comercial
                        iconUrl: item.iconUrl || "https://firebasestorage.googleapis.com/v0/b/meetransportation.firebasestorage.app/o/icons%2Fcaja_icon_1.png?alt=media&token=203a7bd1-d2ea-4cc2-bc86-c2772382b363"
                    };

                    Object.keys(itemData).forEach(key => {
                        if (itemData[key] === undefined) {
                            delete itemData[key];
                        }
                    });

                    items.push(itemData);
                }
                return items;
            });
        } else if (formData.packageType === 'Personalizado' && formData.customItem) {
            // Crear array de items para artículos personalizados
            const dimensionsStr = `"${formData.customItem.length}" x "${formData.customItem.width}" x "${formData.customItem.height}"`;

            itemsWithSubIds = [{
                subId: `${quoteId}-${itemCounter++}`,
                name: formData.customItem.item || "Artículo personalizado",
                dimensions: dimensionsStr,
                weight: formData.customItem.weight,
                price: 0, // Para artículos personalizados, el precio se calcula después
                commercialValue: formData.customItem.commercialValue || 0,
                iconUrl: "https://firebasestorage.googleapis.com/v0/b/meetransportation.firebasestorage.app/o/icons%2Fcaja_icon_2.png?alt=media&token=4f2e5a1a-adaa-4156-86b8-f26eafa2ad48"
            }];
        }

        // Preparar datos de la cotización
        const quoteData = {
            quoteId: quoteId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            packageType: formData.packageType,
            origin: formData.origin,
            destination: formData.destination,
            message: formData.message || null,
            items: itemsWithSubIds,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'quotes-pending',
            estimatedPrice: calculateEstimatedPrice(formData.packageType, itemsWithSubIds.length > 0 ? itemsWithSubIds : formData.customItem)
        };

        // Agregar userId si está autenticado
        if (currentUser) {
            quoteData.userId = currentUser.uid;
        }

        // Limpiar campos undefined
        Object.keys(quoteData).forEach(key => {
            if (quoteData[key] === undefined) {
                delete quoteData[key];
            }
        });

        // Guardar en quotes
        await db.collection('quotes').doc(quoteId).set(quoteData);

        // Si hay usuario autenticado, guardar también en userQuotes
        if (currentUser) {
            await db.collection('users').doc(currentUser.uid).collection('userQuotes').doc(quoteId).set(quoteData);
        }

        quoteForm.reset();
        customPackageDiv.classList.remove('show');
        resetCommonItemsSelection();

        if (currentUser) {
            fillQuoteFormWithUserData(
                await getUserData(currentUser.uid),
                currentUser
            );
        }

        showModal(successModal);

    } catch (error) {
        console.error('Error submitting quote:', error);
        alert('Error submitting quote: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}


// Nueva función para resetear la selección de artículos comunes
function resetCommonItemsSelection() {
    const container = document.querySelector('.selected-items-container');
    if (container) {
        container.innerHTML = '';
    }

    document.getElementById('commonItemType').value = '';

    // Remover la clase 'selected' de todos los botones
    document.querySelectorAll('.common-item-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
}




// Función para generar el ID único (ahora compartido entre quotes y orders)
async function generateId(prefix = 'mt') {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePart = year + month + day;

    const counterRef = db.collection('counters').doc('orders');

    return db.runTransaction(async (transaction) => {
        const doc = await transaction.get(counterRef);

        // Caso 1: El contador existe (flujo normal)
        if (doc.exists) {
            const data = doc.data();
            let { lastLetter, lastNumber, lastDate } = data;

            // Reiniciar contadores si es un nuevo día
            if (lastDate !== datePart) {
                lastLetter = 'a';
                lastNumber = 1;
                lastDate = datePart;
            } else {
                // Incrementar número (y letra si es necesario)
                lastNumber++;
                if (lastNumber > 99) {
                    lastNumber = 1;
                    lastLetter = String.fromCharCode(lastLetter.charCodeAt(0) + 1);
                    if (lastLetter > 'z') lastLetter = 'a'; // Reiniciar letras
                }
            }

            // Actualizar contador
            transaction.update(counterRef, {
                lastLetter,
                lastNumber,
                lastDate
            });

            return `${prefix}${datePart}${lastLetter}${String(lastNumber).padStart(2, '0')}`;
        }

        // Caso 2: El contador NO existe (primera vez o fue eliminado)
        console.warn('Contador no encontrado. Regenerando desde colecciones...');

        // Buscar el documento más reciente entre orders y quotes
        const [lastOrder, lastQuote] = await Promise.all([
            db.collection('orders').orderBy('timestamp', 'desc').limit(1).get(),
            db.collection('quotes').orderBy('timestamp', 'desc').limit(1).get()
        ]);

        let lastDoc = null;
        let lastTimestamp = null;

        // Determinar cuál es el documento más reciente
        if (!lastOrder.empty && !lastQuote.empty) {
            const orderTime = lastOrder.docs[0].data().timestamp?.toMillis() || 0;
            const quoteTime = lastQuote.docs[0].data().timestamp?.toMillis() || 0;

            if (orderTime > quoteTime) {
                lastDoc = lastOrder.docs[0];
            } else {
                lastDoc = lastQuote.docs[0];
            }
        } else if (!lastOrder.empty) {
            lastDoc = lastOrder.docs[0];
        } else if (!lastQuote.empty) {
            lastDoc = lastQuote.docs[0];
        }

        // Si encontramos un documento, extraer el último ID
        if (lastDoc) {
            console.log(`Documento más reciente encontrado: ${lastDoc.id}`);

            const regex = /^mt\d{6}([a-z])(\d{2})$/;
            const match = lastDoc.id.match(regex);

            if (match) {
                const lastLetter = match[1];
                const lastNumber = parseInt(match[2]);
                const lastDate = lastDoc.id.substring(2, 8);

                // Si es del mismo día, incrementar
                if (lastDate === datePart) {
                    const newId = generateNextId(datePart, lastLetter, lastNumber);

                    // Crear el contador con los valores actualizados
                    transaction.set(counterRef, {
                        lastLetter: newId.charAt(8), // La letra del nuevo ID
                        lastNumber: parseInt(newId.substring(9)), // El número del nuevo ID
                        lastDate: datePart
                    });

                    return newId;
                }
            }
        }

        // Si no hay documentos o el formato no coincide, iniciar nueva secuencia
        transaction.set(counterRef, {
            lastLetter: 'a',
            lastNumber: 1,
            lastDate: datePart
        });

        return `${prefix}${datePart}a01`;
    }).catch(error => {
        console.error('Error en la transacción:', error);
        throw new Error('No se pudo generar el ID. Intente nuevamente.');
    });
}

// Función auxiliar para generar el siguiente ID basado en el último encontrado
function generateNextId(datePart, lastLetter, lastNumber) {
    let nextLetter = lastLetter;
    let nextNumber = lastNumber + 1;

    if (nextNumber > 99) {
        nextNumber = 1;
        nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
        if (nextLetter > 'z') nextLetter = 'a';
    }

    return `mt${datePart}${nextLetter}${String(nextNumber).padStart(2, '0')}`;
}

// Collect form data
async function collectFormData() {
    const packageType = document.querySelector('input[name="package"]:checked').value;
    const phoneInput = document.getElementById('phone');
    const cleanPhone = window.getCleanPhoneNumber(phoneInput);

    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: cleanPhone,
        packageType: packageType,
        origin: document.getElementById('origin').value.trim(),
        destination: document.getElementById('destination').value.trim(),
        message: document.getElementById('message').value.trim()
    };

    if (packageType === 'Artículo Común') {
        try {
            const commonItemsValue = document.getElementById('commonItemType').value;
            if (commonItemsValue) {
                const items = JSON.parse(commonItemsValue);
                const snapshot = await db.collection('CommonItems').get();
                const commonItemsData = {};
                snapshot.forEach(doc => {
                    commonItemsData[doc.id] = doc.data();
                });

                formData.commonItems = items.map(item => ({
                    id: item.id,
                    name: item.name,
                    dimensions: item.dimensions,
                    dimensionsArray: item.dimensionsArray,
                    weight: parseFloat(item.weight) || 0,
                    price: item.price,
                    iconUrl: commonItemsData[item.id]?.icon || '',
                    quantity: item.quantity || 1  // Mantenemos quantity para el frontend
                }));
            }
        } catch (e) {
            console.error('Error parsing common items:', e);
        }
    }
    else if (packageType === 'Personalizado') {
        formData.customItem = {
            item: document.getElementById('item').value.trim(),
            commercialValue: parseFloat(document.getElementById('commercialValue').value) || 0,
            length: parseInt(document.getElementById('length').value) || 0,
            width: parseInt(document.getElementById('width').value) || 0,
            height: parseInt(document.getElementById('height').value) || 0,
            weight: parseInt(document.getElementById('weight').value) || 0
        };
    }

    return formData;
}

// Validate form data
function validateFormData(data) {
    const required = ['name', 'email', 'phone', 'packageType', 'origin', 'destination'];

    for (let field of required) {
        if (!data[field] || data[field].length === 0) {
            return false;
        }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return false;
    }

    // Validate common item
    if (data.packageType === 'Artículo Común') {
        if (!data.commonItems || data.commonItems.length === 0) {
            return false;
        }
    }
    // Validate custom package
    else if (data.packageType === 'Personalizado') {
        if (!data.customItem?.item ||
            data.customItem.length <= 0 ||
            data.customItem.width <= 0 ||
            data.customItem.height <= 0 ||
            data.customItem.weight <= 0) {
            return false;
        }
    }

    return true;
}

function calculateEstimatedPrice(packageType, additionalItems) {
    // For custom items, we'll need to calculate based on dimensions/weight
    // This would need to be replaced with your actual pricing logic
    if (packageType === 'Personalizado') {
        // Example calculation - replace with your actual formula
        const length = parseInt(document.getElementById('length').value) || 0;
        const width = parseInt(document.getElementById('width').value) || 0;
        const height = parseInt(document.getElementById('height').value) || 0;
        const weight = parseInt(document.getElementById('weight').value) || 0;

        // Simple example formula - adjust according to your pricing model
        return Math.max(50, (length * width * height) / 100 + weight * 0.5);
    }

    // For common items, you might have fixed prices or another calculation
    return 0; // Will be calculated based on the selected common item
}

// Show terms and conditions
function showTerms() {
    document.getElementById('termsModal').style.display = 'flex';
}

// Show login form
function showLoginForm() {
    document.getElementById('registerFields').style.display = 'none';
    document.getElementById('loginUserBtn').style.display = 'inline-block';

    // Restaurar completamente el botón de registro
    const registerBtn = document.getElementById('registerUserBtn');
    registerBtn.textContent = 'Crear cuenta'; // Cambiar texto a español
    registerBtn.style.backgroundColor = ''; // Quitar color de fondo
    registerBtn.style.color = ''; // Quitar color de texto
    registerBtn.style.border = ''; // Restaurar borde

    document.getElementById('showLoginBtn').style.display = 'none';

    // Clear error messages
    const messageDiv = document.getElementById('authMessage');
    if (messageDiv) {
        messageDiv.textContent = '';
    }
}

// Login user
async function loginUser() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const messageDiv = document.getElementById('authMessage');
    const loginBtn = document.getElementById('loginUserBtn'); // Mover esta línea aquí

    if (!email || !password) {
        messageDiv.textContent = 'Por favor ingrese correo y contraseña';
        return;
    }

    try {
        // Mostrar indicador de carga
        const originalText = loginBtn.textContent;
        loginBtn.textContent = 'Iniciando sesión...';
        loginBtn.disabled = true;

        await auth.signInWithEmailAndPassword(email, password);
        messageDiv.style.color = 'var(--success)';
        messageDiv.textContent = '¡Inicio de sesión exitoso!';

        // Cerrar modal después de un breve retraso
        setTimeout(() => {
            closeModals();
        }, 1500);
    } catch (error) {
        messageDiv.textContent = getAuthErrorMessage(error.code);
        console.error('Error de inicio de sesión:', error);
    } finally {
        // Restaurar botón
        const btn = document.getElementById('loginUserBtn');
        if (btn) {
            btn.textContent = 'Iniciar Sesión'; // Texto fijo en español
            btn.disabled = false;
        }
    }
}

// Register user
async function registerUser() {
    const registerFields = document.getElementById('registerFields');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const loginBtn = document.getElementById('loginUserBtn');
    const registerBtn = this;

    // If registration fields are hidden, show them first
    if (registerFields.style.display === 'none' || !registerFields.style.display) {
        registerFields.style.display = 'block';
        loginBtn.style.display = 'none';
        registerBtn.textContent = 'Completar Registro';
        registerBtn.style.backgroundColor = 'var(--secondary)';
        registerBtn.style.color = 'white';
        registerBtn.style.border = 'none';
        showLoginBtn.style.display = 'inline-block';
        return;
    }

    // Proceed with registration if fields are visible
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const fullName = document.getElementById('fullName').value;
    const phoneInput = document.getElementById('phoneNumber');
    const phoneIti = window.intlTelInputGlobals.getInstance(phoneInput);
    const phoneNumber = phoneIti.getNumber(intlTelInputUtils.numberFormat.E164);

    // New address fields
    const country = document.getElementById('country').value;
    const state = document.getElementById('state').value;
    const city = document.getElementById('city').value.trim();
    const street = document.getElementById('street').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();

    const termsChecked = document.getElementById('termsCheckbox').checked;
    const messageDiv = document.getElementById('authMessage');

    // Validations
    if (!email || !password || !fullName || !phoneNumber || !country || !state || !city || !street || !zipCode) {
        messageDiv.textContent = 'Por favor complete todos los campos';
        return;
    }

    if (!termsChecked) {
        messageDiv.textContent = 'Debe aceptar los términos y condiciones';
        return;
    }

    if (password.length < 6) {
        messageDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
        return;
    }

    try {
        // Show loading indicator
        const originalText = registerBtn.textContent;
        registerBtn.textContent = 'Registrando...';
        registerBtn.disabled = true;

        // Create user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        // Create user document with complete address
        await db.collection('users').doc(userCredential.user.uid).set({
            email: email,
            registrationDate: firebase.firestore.FieldValue.serverTimestamp(),
            profile: {
                name: fullName,
                phone: phoneNumber,
                address: {
                    country: country,
                    state: state,
                    city: city,
                    street: street,
                    zipCode: zipCode
                }
            },
            termsAccepted: true,
            termsAcceptanceDate: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Show success message
        messageDiv.style.color = 'var(--success)';
        messageDiv.textContent = '¡Registro exitoso! Iniciando sesión...';

        // Close modal after short delay
        setTimeout(() => {
            closeModals();
        }, 1500);

    } catch (error) {
        messageDiv.textContent = getAuthErrorMessage(error.code);
        console.error('Registration error:', error);
    } finally {
        // Restore button
        registerBtn.textContent = originalText;
        registerBtn.disabled = false;
    }
}

// Logout
async function logout() {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout error: ' + error.message);
    }
}


// En la función updateUIForLoggedInUser, añade el event listener para el modal de perfil
function updateUIForLoggedInUser(user) {
    loginBtn.style.display = 'none';
    userProfile.style.display = 'flex';
    logoutBtn.style.display = 'flex';

    // Usar la traducción para "Mi perfil"
const miPerfilSpan = userProfile.querySelector('[data-i18n="miPerfil"]');
if (miPerfilSpan) {
  miPerfilSpan.textContent = translations[currentLanguage]['miPerfil'];
}

    // Get user data
    db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
            const userData = doc.data();

            // Auto-fill quote form with user data
            fillQuoteFormWithUserData(userData, user);
        }
    }).catch(error => {
        console.error("Error getting user data:", error);
        fillQuoteFormWithUserData({}, user);
    });
}


// Modificar la función fillQuoteFormWithUserData para aceptar userData como parámetro
function fillQuoteFormWithUserData(userData, user) {
    // Fill name if available
    if (userData?.profile?.name) {
        document.getElementById('name').value = userData.profile.name;
    } else if (user.displayName) {
        document.getElementById('name').value = user.displayName;
    }

    // Fill email
    document.getElementById('email').value = user.email || '';

    // Fill phone if available
    const phoneInput = document.getElementById('phone');
    if (userData?.profile?.phone) {
        try {
            const phoneIti = window.intlTelInputGlobals.getInstance(phoneInput);
            phoneIti.setNumber(userData.profile.phone);
        } catch (e) {
            console.error('Error setting phone number:', e);
            phoneInput.value = userData.profile.phone;
        }
    }

    // Set a flag to know this is a logged-in user's quote
    document.getElementById('quoteForm').dataset.userId = user.uid;
}

// Nueva función para obtener datos del usuario
async function getUserData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            return userDoc.data();
        }
        return {};
    } catch (error) {
        console.error("Error getting user data:", error);
        return {};
    }
}

// Nueva función para mostrar el modal de perfil con datos editables
async function showProfileModal(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const user = auth.currentUser;

        if (userDoc.exists) {
            const userData = userDoc.data();

            // Fill basic info
            document.getElementById('profileName').value = userData.profile?.name || '';
            document.getElementById('profileEmail').value = user.email;

            // Fill phone
            const phoneInput = document.getElementById('profilePhone');
            if (window.intlTelInput) {
                const phoneIti = window.intlTelInput(phoneInput, {
                    preferredCountries: ['us', 'do'],
                    separateDialCode: true,
                    initialCountry: "us",
                    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
                });

                if (userData.profile?.phone) {
                    phoneIti.setNumber(userData.profile.phone);
                }
            } else {
                phoneInput.value = userData.profile?.phone || '';
            }

            // Fill address
            if (userData.profile?.address) {
                const address = userData.profile.address;
                document.getElementById('profileCountry').value = address.country || '';
                loadStates(address.country, 'profileState');

                // Need timeout to ensure states are loaded before setting value
                setTimeout(() => {
                    document.getElementById('profileState').value = address.state || '';
                }, 100);

                document.getElementById('profileCity').value = address.city || '';
                document.getElementById('profileStreet').value = address.street || '';
                document.getElementById('profileZipCode').value = address.zipCode || '';
            }


            // Configurar event listeners para los botones
            document.getElementById('saveProfileBtn').addEventListener('click', () => saveProfileChanges(userId));
            document.getElementById('deleteAccountBtn').addEventListener('click', () => confirmDeleteAccount(userId));

            // Mostrar el modal
            showModal(document.getElementById('profileModal'));
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}



// Función para guardar los cambios del perfil
async function saveProfileChanges(userId) {
    try {
        const name = document.getElementById('profileName').value.trim();
        const phoneInput = document.getElementById('profilePhone');
        const phoneIti = window.intlTelInputGlobals.getInstance(phoneInput);
        const phone = phoneIti.getNumber();

        const country = document.getElementById('profileCountry').value;
        const state = document.getElementById('profileState').value;
        const city = document.getElementById('profileCity').value.trim();
        const street = document.getElementById('profileStreet').value.trim();
        const zipCode = document.getElementById('profileZipCode').value.trim();

        if (!name || !country || !state || !city || !street || !zipCode) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        // Actualizar en Firestore
        await db.collection('users').doc(userId).update({
            'profile.name': name,
            'profile.phone': phone,
            'profile.address': {
                country: country,
                state: state,
                city: city,
                street: street,
                zipCode: zipCode
            }
        });

        // Actualizar la UI
        const firstName = name.split(' ')[0];
        userProfile.textContent = firstName;

        alert('Cambios guardados exitosamente');
        closeModals();
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error al guardar los cambios: ' + error.message);
    }
}

// Función para confirmar la eliminación de la cuenta
function confirmDeleteAccount(userId) {
    if (confirm('¿Está seguro que desea eliminar su cuenta? Esta acción no se puede deshacer.')) {
        deleteAccount(userId);
    }
}

// Función para eliminar la cuenta
async function deleteAccount(userId) {
    try {
        const user = auth.currentUser;

        // Primero eliminar los datos de Firestore
        await db.collection('users').doc(userId).delete();

        // Luego eliminar la cuenta de autenticación
        await user.delete();

        // Cerrar sesión y actualizar UI
        await auth.signOut();
        updateUIForLoggedOutUser();
        closeModals();

        alert('Su cuenta ha sido eliminada exitosamente');
    } catch (error) {
        console.error('Error deleting account:', error);

        // Si el error es que necesita reautenticación
        if (error.code === 'auth/requires-recent-login') {
            if (confirm('Por seguridad, necesita volver a autenticarse para eliminar la cuenta. ¿Desea hacerlo ahora?')) {
                reauthenticateAndDelete(userId);
            }
        } else {
            alert('Error al eliminar la cuenta: ' + error.message);
        }
    }
}

// Función para reautenticar antes de eliminar la cuenta
async function reauthenticateAndDelete(userId) {
    const user = auth.currentUser;
    const email = user.email;
    const password = prompt('Por favor ingrese su contraseña para confirmar la eliminación de la cuenta:');

    if (!password) return;

    try {
        // Crear credenciales
        const credential = firebase.auth.EmailAuthProvider.credential(email, password);

        // Reautenticar
        await user.reauthenticateWithCredential(credential);

        // Ahora eliminar la cuenta
        await deleteAccount(userId);
    } catch (error) {
        console.error('Reauthentication error:', error);
        alert('Error al autenticar: ' + error.message);
    }
}

function updateUIForLoggedOutUser() {
    loginBtn.style.display = 'inline-block';
    userProfile.style.display = 'none';
    logoutBtn.style.display = 'none';
}

async function loadUserProfile(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const firstName = userData.profile?.name?.split(' ')[0] || currentUser.email.split('@')[0];

            document.getElementById('userInfo').innerHTML = `
                    <p><strong>Email:</strong> ${currentUser.email}</p>
                    <p><strong>Name:</strong> ${userData.profile?.name || 'Not specified'}</p>
                    <p><strong>Phone:</strong> ${userData.profile?.phone || 'Not specified'}</p>
                    <p><strong>Member since:</strong> ${userData.registrationDate?.toDate().toLocaleDateString() || 'N/A'}</p>
                `;
        }

        // Load user shipments
        loadUserShipments(userId);
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadUserShipments(userId) {
    try {
        const shipmentsQuery = await db.collection('quotes')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        const shipmentsDiv = document.getElementById('userShipments');

        if (shipmentsQuery.empty) {
            shipmentsDiv.innerHTML = '<p>No shipments registered</p>';
            return;
        }

        let shipmentsHTML = '';
        shipmentsQuery.forEach(doc => {
            const shipment = doc.data();
            const date = shipment.timestamp?.toDate().toLocaleDateString() || 'N/A';
            shipmentsHTML += `
                    <div style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 5px;">
                        <p><strong>Type:</strong> ${shipment.packageType}</p>
                        <p><strong>Destination:</strong> ${shipment.destination}</p>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Status:</strong> <span style="color: var(--secondary);">${shipment.status}</span></p>
                        <p><strong>Estimated price:</strong> $${shipment.estimatedPrice}</p>
                    </div>
                `;
        });

        shipmentsDiv.innerHTML = shipmentsHTML;
    } catch (error) {
        console.error('Error loading shipments:', error);
        document.getElementById('userShipments').innerHTML = '<p>Error loading shipments</p>';
    }
}

// Utility Functions
function showModal(modal) {
    // Previene el scroll del body
    document.body.classList.add('body-no-scroll');

    modal.style.display = 'flex';
    // Clear previous error messages
    const authMessage = document.getElementById('authMessage');
    if (authMessage) {
        authMessage.textContent = '';
        authMessage.style.color = 'var(--accent)';
    }
}

function closeModals() {
    // Restaura el scroll del body
    document.body.classList.remove('body-no-scroll');

    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });

    // Reset forms
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.reset();
        document.getElementById('registerFields').style.display = 'none';
        document.getElementById('loginUserBtn').style.display = 'inline-block';
        document.getElementById('registerUserBtn').textContent = 'Register';
        document.getElementById('showLoginBtn').style.display = 'none';
    }
}

function getAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'Usuario no encontrado';
        case 'auth/wrong-password':
            return 'Contraseña incorrecta';
        case 'auth/email-already-in-use':
            return 'Este correo ya está registrado';
        case 'auth/weak-password':
            return 'La contraseña es demasiado débil (mínimo 6 caracteres)';
        case 'auth/invalid-email':
            return 'Correo electrónico inválido';
        case 'auth/too-many-requests':
            return 'Demasiados intentos. Por favor intente más tarde';
        default:
            return 'Correo o contraseña incorrecta';
    }
}


// Event listeners para los botones de ordenar arroz/aceite y cajas/tanques
document.getElementById('comprar-arroz-tanque-content').addEventListener('click', function (e) {
    if (e.target.id === 'comprar-arroz-tanque-btn' || e.target.closest('#comprar-arroz-tanque-btn')) {
        e.preventDefault();
        showModal(document.getElementById('orderItemsModal'));
    }
});


// Ajustar el botón de WhatsApp cerca del copyright
function adjustWhatsAppButton() {
    const whatsappBtn = document.querySelector('.whatsapp-float');
    const copyright = document.querySelector('.copyright');

    if (!copyright || !whatsappBtn) return;

    const copyrightRect = copyright.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const distanceToCopyright = copyrightRect.top - viewportHeight;

    // Si el copyright está visible o cerca (100px antes de que aparezca)
    if (distanceToCopyright < -30) {
        whatsappBtn.classList.add('near-copyright');
    } else {
        whatsappBtn.classList.remove('near-copyright');
    }
}

// Ejecutar al cargar y al hacer scroll/resize
window.addEventListener('load', adjustWhatsAppButton);
window.addEventListener('scroll', adjustWhatsAppButton);
window.addEventListener('resize', adjustWhatsAppButton);


document.addEventListener('click', function (event) {
    const nav = document.getElementById('main-nav');
    const toggle = document.getElementById('mobile-menu');
    const toggleIcon = toggle.querySelector('i');

    // Verifica si el nav está activo y si el clic fue fuera del nav y del botón
    if (nav.classList.contains('active') && !nav.contains(event.target) && !toggle.contains(event.target)) {
        nav.classList.remove('active');
        toggleIcon.classList.remove('fa-times');
        toggleIcon.classList.add('fa-bars');
    }
});


//ocultar li cuando los a estan en display none
document.addEventListener('DOMContentLoaded', function() {
    // Función para ocultar los li cuando su contenido está oculto
    function hideEmptyListItems() {
        document.querySelectorAll('li > a').forEach(link => {
            const li = link.parentElement;
            if (window.getComputedStyle(link).display === 'none') {
                li.style.display = 'none';
            } else {
                li.style.display = ''; // Restaura el display original
            }
        });
    }

    // Ejecutar al cargar y cuando cambie el DOM (opcional)
    hideEmptyListItems();
    const observer = new MutationObserver(hideEmptyListItems);
    observer.observe(document.body, { subtree: true, attributes: true });
});
//ocultar li cuando los a estan en display none FIN


