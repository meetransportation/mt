// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDUPUM36QOLPGb-FmPx6-qMZoS2pCZdurI",
    authDomain: "meetransportation.firebaseapp.com",
    projectId: "meetransportation",
    storageBucket: "meetransportation.appspot.com",
    messagingSenderId: "1087042032724",
    appId: "1:1087042032724:web:0975e57ca30ff342f349c1",
    measurementId: "G-8XHXKXL0CV"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Global variables
let currentAdmin = null;
let selectedOrderId = null;
let selectedQuoteId = null;
let selectedEmployeeId = null;
let selectedServiceId = null;
let selectedProductId = null;
let isEditMode = false;
let quotesUnsubscribe = null;
let currentQuoteFilter = 'pending';
let selectedProductImageFile = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
    initAuth();
});

// Initialize Authentication
function initAuth() {
    // Mostrar indicador de carga global
    const globalLoader = document.createElement('div');
    globalLoader.className = 'global-loader';
    globalLoader.innerHTML = `
        <p>Mee<span style="color:#5cc528;">Transportation</span></p>
        <div class="loader-spinner"></div>
    `;
    document.body.appendChild(globalLoader);

    auth.onAuthStateChanged(user => {
        // Ocultar indicador de carga cuando se complete
        if (document.body.contains(globalLoader)) {
            document.body.removeChild(globalLoader);
        }
        if (user) {
            // User is signed in, verify if they are an employee
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().isEmployee === true) {
                    // User is an employee, show admin panel
                    currentAdmin = user;
                    document.getElementById('loginContainer').style.display = 'none';
                    document.querySelector('.admin-container').style.display = 'flex';
                    loadAdminProfile(user);

                    // Solo inicializar UI y datos después de autenticación verificada
                    initUI();
                    initDataTables();
                    initModals();
                    initDashboard();
                } else {
                    // User is not an employee, sign them out
                    auth.signOut().then(() => {
                        document.getElementById('loginContainer').style.display = 'flex';
                        document.querySelector('.admin-container').style.display = 'none';
                        showToast('Acceso restringido a empleados', 'error');
                    });
                }
            });
        } else {
            // No user is signed in, show login form
            document.getElementById('loginContainer').style.display = 'flex';
            document.querySelector('.admin-container').style.display = 'none';
        }
    });

    // Setup login form (código existente permanece igual)
   document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorElement = document.getElementById('loginError');

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return db.collection('users').doc(userCredential.user.uid).get();
        })
        .then((doc) => {
            if (doc.exists && doc.data().isEmployee === true) {
                currentAdmin = auth.currentUser;
                document.getElementById('loginContainer').style.display = 'none';
                document.querySelector('.admin-container').style.display = 'flex';
                loadAdminProfile(currentAdmin);
                
                initUI();
                initDataTables();
                initModals();
                initDashboard();

                // Restablecer el botón después de un inicio de sesión exitoso
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            } else {
                auth.signOut();
                throw new Error('Solo los empleados pueden acceder a esta sección');
            }
        })
        .catch((error) => {
            console.error("Login error:", error);
            
            // Mensaje personalizado para credenciales incorrectas
            let errorMessage = error.message;
            if (error.code === 'auth/invalid-login-credentials') {
                errorMessage = 'Credenciales incorrectas';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Correo electrónico inválido';
            } else if (error.code === 'auth/missing-password') {
                errorMessage = 'Ingrese una contraseña';
            }
            
            errorElement.textContent = errorMessage;
            
            // Restablecer el botón después de un error
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        });
});
}

// Añade esta función al inicio del archivo (puede ir junto con las otras funciones de formato)
function formatFullDateWithTime(date) {
    if (!date) return 'N/A';

    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
}


function setupWhatsAppButton(buttonId, phoneNumber) {
    const whatsappBtn = document.getElementById(buttonId);
    if (!whatsappBtn) return; // Si no existe el botón, salir

    if (phoneNumber) {
        const cleanedNumber = phoneNumber.replace(/\D/g, '');
        const whatsappNumber = cleanedNumber.length === 10 ? `+1${cleanedNumber}` : `+${cleanedNumber}`;
        whatsappBtn.onclick = () => window.open(`https://wa.me/${whatsappNumber}`, '_blank');
        whatsappBtn.style.display = 'inline-flex';
    } else {
        whatsappBtn.style.display = 'none';
    }
}

// Initialize UI Elements
function initUI() {
    // Sidebar menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function () {
            const tab = this.getAttribute('data-tab');
            showTab(tab);

            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Stat cards click handlers
    document.querySelectorAll('.stat-card').forEach(card => {
        card.style.cursor = 'pointer'; // Cambia el cursor a pointer para indicar que es clickeable
        card.addEventListener('click', function () {
            const tab = this.getAttribute('data-tab');
            showTab(tab);

            // Actualiza el menú activo
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-tab') === tab) {
                    item.classList.add('active');
                }
            });
        });
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Initialize Modals
function initModals() {
    initOrderModal();
    initQuoteModal();
    initEmployeeModal();
    initRefreshButtons();
    initServicesProductsModals();



    // Asignación de choferes
    document.getElementById('refreshAssignDriver')?.addEventListener('click', loadAssignDriverTable);

    // Event delegation para los selects de choferes
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('driver-select')) {
            const orderId = e.target.getAttribute('data-order');
            const driverId = e.target.value;

            if (driverId) {
                assignDriverToOrder(orderId, driverId);
            } else {
                unassignDriverFromOrder(orderId);
            }
        }
    });


    document.getElementById('refreshAssignDriverRD')?.addEventListener('click', loadAssignDriverRDTable);


    // Filtros de cotizaciones
    document.getElementById('filterPendingQuotes')?.addEventListener('click', () => {
        if (currentQuoteFilter !== 'pending') {
            loadQuotesTable('pending', true);
        }
    });

    document.getElementById('filterConvertedQuotes')?.addEventListener('click', () => {
        if (currentQuoteFilter !== 'converted') {
            loadQuotesTable('converted', true);
        }
    });

    document.getElementById('refreshQuotes')?.addEventListener('click', () => {
        loadQuotesTable(currentQuoteFilter, true);
    });


    // Event delegation para los selects de choferes RD
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('driver-rd-select')) {
            const orderId = e.target.getAttribute('data-order');
            const driverId = e.target.value;

            if (driverId) {
                assignDriverRDToOrder(orderId, driverId);
            } else {
                unassignDriverRDFromOrder(orderId);
            }
        }
    });

}

// Order Modal
function initOrderModal() {
    // Agrega el event listener para el botón "X" del header
    document.querySelector('#orderModal .close-modal').addEventListener('click', function () {
        document.getElementById('orderModal').style.display = 'none';
    });

    document.getElementById('saveOrderChanges').addEventListener('click', saveOrderChanges);
}

// Quote Modal
function initQuoteModal() {
    // Cerrar el modal al hacer clic en el botón X
    document.querySelector('#quoteModal .close-modal')?.addEventListener('click', function () {
        document.getElementById('quoteModal').style.display = 'none';
    });

    document.getElementById('saveQuoteChanges').addEventListener('click', saveQuoteChanges);
    document.getElementById('convertToOrderBtn').addEventListener('click', convertQuoteToOrderHandler);

    // Input validation
    document.querySelectorAll('#quoteModal .required-field').forEach(field => {
        field.addEventListener('input', () => validateQuoteForm(false));
    });
    document.getElementById('quotePriceInput').addEventListener('input', () => validateQuoteForm(false));
}

// Employee Modal
function initRefreshButtons() {
    document.getElementById('refreshOrders')?.addEventListener('click', loadRecentOrders);
    document.getElementById('refreshInTransit')?.addEventListener('click', loadInTransitTable);
    document.getElementById('refreshCompleted')?.addEventListener('click', loadCompletedOrdersTable);
    document.getElementById('exportCompleted')?.addEventListener('click', () => {
        $('#completedOrdersTable').DataTable().button('.buttons-excel').trigger();
    });
}

// Load admin profile
function initDashboard() {
    loadStats();
    loadRecentOrders();
}


// Modificación en la función loadStats()
function loadStats() {
    if (!currentAdmin) return;
    // Escuchar cambios en las órdenes
    const ordersUnsubscribe = db.collection('orders').onSnapshot(snapshot => {
        let pendingAndAssignedCount = 0;
        let pendingOrdersCount = 0; // Nuevo contador solo para order-pending

        snapshot.forEach(doc => {
            const status = doc.data().status;

            // Contar órdenes pendientes y asignadas para el card 1
            if (status === 'order-pending' || status === 'assignedDriver') {
                pendingAndAssignedCount++;
            }

            // Contar solo órdenes pendientes para el card 3
            if (status === 'order-pending') {
                pendingOrdersCount++;
            }
        });

        // Actualizar los contadores de órdenes
        document.getElementById('totalOrders').textContent = pendingAndAssignedCount;
        document.getElementById('pendingItems').textContent = pendingOrdersCount;

        let pendingOrders = 0;
        let assignedDriverOrders = 0;
        let receivedWarehouseRD = 0;
        let assignedDriverRD = 0;
        let inTransitOrders = 0;
        let deliveredOrders = 0;

        snapshot.forEach(doc => {
            const status = doc.data().status;

            // Estados para "Asignar recolector (USA)"
            if (status === 'order-pending') {
                pendingOrders++;
            } else if (status === 'assignedDriver') {
                assignedDriverOrders++;
            }
            // Estados para "Asignar repartidor (RD)"
            else if (status === 'Received_Warehouse_rd') {
                receivedWarehouseRD++;
            } else if (status === 'assignedDriver_rd') {
                assignedDriverRD++;
                inTransitOrders++; // También cuenta como en tránsito
            }
            // Estados para "Envíos en tránsito"
            else if ([
                'driverPickup',
                'Received_Warehouse_usa',
                'Warehouse_Exit_usa',
                'Warehouse_Exit_rd'
            ].includes(status)) {
                inTransitOrders++;
            }
            // Estados completados
            else if (status === 'delivered') {
                deliveredOrders++;
            }
        });

        // Actualizar todos los contadores
        document.getElementById('pendingOrdersBadge').textContent = pendingOrders + assignedDriverOrders;
        document.getElementById('assignDriverBadge').textContent = pendingOrders + assignedDriverOrders;
        document.getElementById('assignDriverRDBadge').textContent = receivedWarehouseRD + assignedDriverRD;
        document.getElementById('inTransitOrders').textContent = inTransitOrders;
        document.getElementById('inTransitBadge').textContent = inTransitOrders;
        document.getElementById('completedOrdersBadge').textContent = deliveredOrders;
    });

    // Escuchar cambios en las cotizaciones
    const quotesUnsubscribe = db.collection('quotes').onSnapshot(snapshot => {
        let pendingQuotesCount = 0;

        snapshot.forEach(doc => {
            if (doc.data().status === 'quotes-pending') {
                pendingQuotesCount++;
            }
        });

        // Actualizar solo el contador de cotizaciones pendientes
        document.getElementById('totalQuotes').textContent = pendingQuotesCount;
        document.getElementById('pendingQuotesBadge').textContent = pendingQuotesCount;

        // Actualizar el contador de pendientes (card 3) que ahora solo usa order-pending
        const pendingOrders = parseInt(document.getElementById('pendingItems').textContent) || 0;
        document.getElementById('pendingItems').textContent = pendingOrders; // Ya no suma las cotizaciones
    });

    window.statsOrdersUnsubscribe = ordersUnsubscribe;
    window.statsQuotesUnsubscribe = quotesUnsubscribe;
}



// Show selected tab
function showTab(tabName) {
    // Limpiar listeners anteriores si existen
    const tabUnsubscribers = {
        'dashboard': () => {
            if (window.recentOrdersUnsubscribe) window.recentOrdersUnsubscribe();
            if (window.statsOrdersUnsubscribe) window.statsOrdersUnsubscribe();
            if (window.statsQuotesUnsubscribe) window.statsQuotesUnsubscribe();
        },
        'orders': () => { if (window.ordersUnsubscribe) window.ordersUnsubscribe(); },
        'quotes': () => { if (window.quotesUnsubscribe) window.quotesUnsubscribe(); },
        'customers': () => { if (window.customersUnsubscribe) window.customersUnsubscribe(); },
        'employees': () => { if (window.employeesUnsubscribe) window.employeesUnsubscribe(); },
        'in-transit': () => { if (window.inTransitUnsubscribe) window.inTransitUnsubscribe(); },
        'completed-orders': () => { if (window.completedOrdersUnsubscribe) window.completedOrdersUnsubscribe(); },
        'assign-driver': () => { if (window.assignDriverUnsubscribe) window.assignDriverUnsubscribe(); }
    };

    if (tabUnsubscribers[tabName]) {
        tabUnsubscribers[tabName]();
    }

    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');

    const tabId = `${tabName}Tab`;
    const tabElement = document.getElementById(tabId);

    if (!tabElement) {
        console.error(`No se encontró la pestaña con ID: ${tabId}`);
        return;
    }

    tabElement.style.display = 'block';

    // Asegurar que DataTables esté inicializado antes de cargar datos
    const initTable = () => {
        if (!$.fn.DataTable.isDataTable(`#${tabName.replace('-', '')}Table`)) {
            initDataTables();
        }
    };

    // Load data for the tab
    const tabLoaders = {
        'dashboard': () => { initTable(); loadStats(); loadRecentOrders(); },
        'orders': () => { initTable(); loadOrdersTable(); },
        'quotes': () => { 
            initTable(); 
            // Esperar un breve momento para asegurar que DataTables esté listo
            setTimeout(() => loadQuotesTable('pending'), 50);
        },
        'customers': () => { initTable(); loadCustomersTable().catch(console.error); },
        'employees': () => { initTable(); loadEmployeesTable(); },
        'in-transit': () => { initTable(); loadInTransitTable(); },
        'completed-orders': () => { initTable(); loadCompletedOrdersTable(); },
        'services': () => { initTable(); loadServicesTable(); },
        'products': () => { initTable(); loadProductsTable(); },
        'assign-driver-rd': () => { initTable(); loadAssignDriverRDTable(); },
        'assign-driver': () => { initTable(); loadAssignDriverTable(); }
    };

    if (tabLoaders[tabName]) {
        tabLoaders[tabName]();
    }
}


// Función helper para manejar el estado de carga
function handleTableLoading(tableId, callback) {
    const table = $(`#${tableId}`).DataTable();
    const container = $(`#${tableId}`).closest('.table-container');
    const loadingOverlay = container.find('.loading-overlay');

    // Mostrar cargando y ocultar tabla
    table.clear().draw();
    loadingOverlay.show();
    $(`#${tableId}`).removeClass('ready');

    // Ejecutar la función de callback (que contendrá la lógica de carga de datos)
    callback()
        .then(() => {
            // Ocultar cargando y mostrar tabla cuando los datos estén listos
            loadingOverlay.hide();
            $(`#${tableId}`).addClass('ready');
            table.columns.adjust().draw();
        })
        .catch(error => {
            console.error(`Error loading ${tableId}:`, error);
            loadingOverlay.hide();
            // Opcional: mostrar mensaje de error al usuario
        });
}

// Nueva versión de loadRecentOrders con actualización en tiempo real
function loadRecentOrders() {
    if (!currentAdmin) return Promise.reject('No autenticado');
    return new Promise((resolve, reject) => {
        handleTableLoading('recentOrdersTable', () => {
            return new Promise((innerResolve, innerReject) => {
                const table = $('#recentOrdersTable').DataTable();
                table.clear().draw();

                // Escuchar cambios en tiempo real, ordenando por timestamp (más recientes primero) y limitando a 10
                const unsubscribe = db.collection('orders')
                    .orderBy('timestamp', 'desc') // Ordena por fecha de creación (más reciente primero)
                    .limit(10) // Solo trae las 10 más recientes
                    .onSnapshot(snapshot => {
                        table.clear();
                        snapshot.forEach(doc => {
                            const order = doc.data();
                            table.row.add(createOrderRowData(doc.id, order)).draw(false);
                        });
                        addRowClickHandlers('recentOrdersTable', viewOrderDetails);
                    }, error => {
                        console.error("Error en tiempo real (Dashboard):", error);
                        innerReject(error);
                    });

                // Guardar el listener para limpiarlo después
                window.recentOrdersUnsubscribe = unsubscribe;
                innerResolve();
            });
        });
    });
}


// Nueva versión de loadOrdersTable con actualización en tiempo real
function loadOrdersTable() {
    if (!currentAdmin) return Promise.reject('No autenticado');
    return new Promise((resolve, reject) => {
        handleTableLoading('ordersTable', () => {
            return new Promise((innerResolve, innerReject) => {
                const table = $('#ordersTable').DataTable();
                table.clear().draw();

                // Escuchar cambios en tiempo real SOLO para órdenes pendientes y asignadas
                const unsubscribe = db.collection('orders')
                    .where('status', 'in', ['order-pending', 'assignedDriver'])
                    .orderBy('timestamp', 'desc')
                    .onSnapshot(snapshot => {
                        table.clear(); // Limpiar la tabla antes de agregar nuevos datos

                        snapshot.forEach(doc => {
                            const order = doc.data();
                            table.row.add(createOrderRowData(doc.id, order, true)).draw(false);
                        });

                        // Agregar manejadores de clic a las filas
                        addRowClickHandlers('ordersTable', viewOrderDetails);
                    }, error => {
                        console.error("Error en tiempo real:", error);
                        innerReject(error);
                    });

                // Guardar la función unsubscribe para limpiar cuando sea necesario
                window.ordersUnsubscribe = unsubscribe;
                innerResolve();
            });
        });
    });
}


// Dashboard functions
function loadQuotesTable(filter = 'pending', forceReload = false) {
    return new Promise((resolve, reject) => {
        // Inicializar DataTables si no está inicializado
        if (!$.fn.DataTable.isDataTable('#quotesTable')) {
            initDataTables('quotesTable');
        }


        handleTableLoading('quotesTable', () => {
            return new Promise((innerResolve, innerReject) => {
                const table = $('#quotesTable').DataTable();
                table.clear().draw();

                // Actualizar estado del filtro
                currentQuoteFilter = filter;
                updateQuoteFilterButtons();

                // Configurar la consulta según el filtro
                let query = db.collection('quotes')
                    .orderBy('timestamp', 'desc');

                if (filter === 'pending') {
                    query = query.where('status', '==', 'quotes-pending');
                } else if (filter === 'converted') {
                    query = query.where('status', '==', 'converted');
                }

                // Crear nuevo listener
                quotesUnsubscribe = query.onSnapshot(snapshot => {
                    table.clear();

                    snapshot.forEach(doc => {
                        const quote = doc.data();
                        const date = quote.timestamp?.toDate().toLocaleString() || 'N/A';
                        table.row.add([
                            doc.id,
                            quote.name,
                            quote.email,
                            quote.phone,
                            quote.packageType,
                            quote.destination,
                            date,
                            getStatusBadge(quote.status),
                            `<button class="btn btn-outline view-quote" data-id="${doc.id}">Ver</button>`
                        ]).draw(false);
                    });

                    addRowClickHandlers('quotesTable', viewQuoteDetails);
                    innerResolve();
                }, error => {
                    console.error("Error en tiempo real:", error);
                    innerReject(error);
                });

                // Guardar el unsubscribe en el ámbito global
                window.quotesUnsubscribe = quotesUnsubscribe;
            });
        });
    });
}

// Función auxiliar para actualizar botones de filtro
function updateQuoteFilterButtons() {
    const pendingBtn = document.getElementById('filterPendingQuotes');
    const convertedBtn = document.getElementById('filterConvertedQuotes');

    if (pendingBtn && convertedBtn) {
        pendingBtn.classList.toggle('active', currentQuoteFilter === 'pending');
        convertedBtn.classList.toggle('active', currentQuoteFilter === 'converted');
    }
}


function createOrderRowData(id, order, showPaymentMethod = false) {
    const date = order.timestamp?.toDate() ? formatDate(order.timestamp.toDate()) : 'N/A';

    let serviceName = 'Múltiples servicios';
    if (order.services && order.services.length === 1) {
        serviceName = order.services[0].name;
    } else if (order.service) {
        serviceName = order.service.name || 'Servicio no especificado';
    }

    let totalPrice = 'N/A';
    if (order.totalPrice) {
        totalPrice = `US$${order.totalPrice.toFixed(2)}`;
    } else if (order.service?.price) {
        totalPrice = order.service.price;
    }

    const rowData = [
        id,
        order.sender?.name || 'N/A',
        serviceName,
        date,
        totalPrice,
        getStatusBadge(order.status)
    ];

    if (showPaymentMethod) {
        rowData.splice(5, 0, getPaymentMethodText(order.paymentMethod));
    }

    return rowData;
}

// Modificar la función para añadir eventos a las filas
function addRowClickHandlers(tableId, clickHandler) {
    $(`#${tableId} tbody`).on('click', 'tr', function () {
        const table = $(`#${tableId}`).DataTable();
        const rowData = table.row(this).data();
        if (rowData) {
            clickHandler(rowData[0]); // El ID está en la primera columna
        }
    });
}

function addViewOrderHandlers() {
    document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', function () {
            viewOrderDetails(this.getAttribute('data-id'));
        });
    });
}


// Función para cargar envíos en tránsito
function loadInTransitTable() {
    return new Promise((resolve, reject) => {
        handleTableLoading('inTransitTable', () => {
            return new Promise((innerResolve, innerReject) => {
                const table = $('#inTransitTable').DataTable();
                table.clear().draw();

                const unsubscribe = db.collection('orders')
                    .where('status', 'in', [
                        'driverPickup',
                        'Received_Warehouse_usa',
                        'Warehouse_Exit_usa',
                        'Received_Warehouse_rd',
                        'assignedDriver_rd',
                        'Warehouse_Exit_rd'
                    ])
                    .orderBy('timestamp', 'desc')
                    .onSnapshot(snapshot => {
                        table.clear();

                        snapshot.forEach(doc => {
                            const order = doc.data();
                            table.row.add(createOrderRowData(doc.id, order)).draw(false);
                        });

                        addRowClickHandlers('inTransitTable', viewOrderDetails);
                    }, error => {
                        console.error("Error en tiempo real:", error);
                        innerReject(error);
                    });

                window.inTransitUnsubscribe = unsubscribe;
                innerResolve();
            });
        });
    });
}


// Función para cargar órdenes completadas
// Función para cargar órdenes completadas (modificada para mostrar órdenes con status "delivered")
function loadCompletedOrdersTable() {
    return new Promise((resolve, reject) => {
        handleTableLoading('completedOrdersTable', () => {
            return new Promise((innerResolve, innerReject) => {
                const table = $('#completedOrdersTable').DataTable();
                table.clear().draw();

                const unsubscribe = db.collection('orders')
                    .where('status', '==', 'delivered') // Cambiado a 'delivered' en lugar de 'completed'
                    .orderBy('timestamp', 'desc')
                    .onSnapshot(snapshot => {
                        table.clear();

                        snapshot.forEach(doc => {
                            const order = doc.data();
                            table.row.add(createOrderRowData(doc.id, order, true)).draw(false);
                        });

                        // Agregar manejadores de clic a las filas para abrir el modal de detalles
                        addRowClickHandlers('completedOrdersTable', viewOrderDetails);
                    }, error => {
                        console.error("Error en tiempo real:", error);
                        innerReject(error);
                    });

                window.completedOrdersUnsubscribe = unsubscribe;
                innerResolve();
            });
        });
    });
}



// Nueva versión de loadQuotesTable con actualización en tiempo real
function viewOrderDetails(orderId) {
    if (!currentAdmin) return;
    selectedOrderId = orderId;

    db.collection('orders').doc(orderId).get().then(doc => {
        if (!doc.exists) {
            alert('Orden no encontrada');
            return;
        }

        const order = doc.data();
        const date = order.timestamp?.toDate() ? formatFullDateWithTime(order.timestamp.toDate()) : 'N/A';

        // Fill modal with order data
        document.getElementById('modalOrderId').textContent = orderId;
        document.getElementById('modalOrderDate').textContent = date;

        // Mostrar estado como texto en lugar de select
        document.getElementById('modalOrderStatusDisplay').innerHTML = getStatusBadge(order.status || 'order-pending');

        // Mostrar estado del pago
        document.getElementById('modalPaymentStatus').innerHTML = getPaymentStatusBadge(order.paymentStatus || 'pending');

        document.getElementById('modalPaymentMethod').textContent = getPaymentMethodText(order.paymentMethod || 'pickup');
        document.getElementById('modalInternalNotes').value = order.internalNotes || '';

        // Mostrar precio total
        if (order.totalPrice) {
            document.getElementById('modalOrderTotal').textContent = `US$${order.totalPrice.toFixed(2)}`;
        } else if (order.service?.price) {
            document.getElementById('modalOrderTotal').textContent = order.service.price;
        } else {
            document.getElementById('modalOrderTotal').textContent = 'N/A';
        }

        if (order.sender?.pickupDateTime) {
            document.getElementById('modalPickupDate').value = order.sender.pickupDateTime.date || '';

            // Calcular días restantes para recogida
            const pickupDate = new Date(order.sender.pickupDateTime.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const timeDiff = pickupDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            let daysText = 'N/A';
            let urgencyClass = '';

            if (daysDiff > 1) {
                daysText = `${daysDiff} días`;
                urgencyClass = 'normal';
            } else if (daysDiff === 1) {
                daysText = 'Mañana';
                urgencyClass = 'tomorrow';
            } else if (daysDiff === 0) {
                daysText = 'Hoy';
                urgencyClass = 'today';
            } else {
                daysText = 'Fecha pasada';
                urgencyClass = 'past';
            }

            const daysElement = document.getElementById('modalDaysUntilPickup');
            daysElement.textContent = daysText;
            daysElement.dataset.urgency = urgencyClass;

            document.getElementById('modalDaysUntilPickup').textContent = daysText;

            // Llenar el select de horas con los intervalos
            const timeSelect = document.getElementById('modalPickupTime');
            timeSelect.innerHTML = '<option value="">Seleccione una hora</option>';

            const timeSlots = [
                { value: '07:00 a 10:00', text: '7:00 a 10:00' },
                { value: '10:00 a 13:00', text: '10:00 a 13:00' },
                { value: '13:00 a 16:00', text: '13:00 a 16:00' },
                { value: '16:00 a 19:00', text: '16:00 a 19:00' },
                { value: '19:00 a 21:00', text: '19:00 a 21:00' }
            ];

            timeSlots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot.value;
                option.textContent = slot.text;
                timeSelect.appendChild(option);
            });

            // Seleccionar la hora guardada
            timeSelect.value = order.sender.pickupDateTime.time || '';
        } else {
            document.getElementById('modalDaysUntilPickup').textContent = 'No programada';
        }

        function getPaymentStatusBadge(status) {
            const statusMap = {
                'pending': ['status-pending', 'Pendiente'],
                'paid': ['status-completed', 'Pagado'],
                'failed': ['status-cancelled', 'Fallido'],
                'refunded': ['status-cancelled', 'Reembolsado'],
                'partially_refunded': ['status-processing', 'Reembolsado Parcialmente']
            };

            const [badgeClass, badgeText] = statusMap[status] || ['status-pending', status];
            return `<span class="status-badge ${badgeClass}">${badgeText}</span>`;
        }


        // Sender info
        document.getElementById('modalSenderName').textContent = order.sender?.name || 'N/A';
        document.getElementById('modalSenderEmail').textContent = order.sender?.email || 'N/A';

        // Configurar botón de copiar email
        const copyOrderEmailBtn = document.getElementById('copyOrderEmailBtn');
        const copyOrderFeedback = document.querySelector('#orderModal .copy-feedback');
        const orderEmail = order.sender?.email || '';

        copyOrderEmailBtn.onclick = () => {
            if (orderEmail) {
                navigator.clipboard.writeText(orderEmail).then(() => {
                    copyOrderFeedback.style.display = 'inline';
                    setTimeout(() => {
                        copyOrderFeedback.style.display = 'none';
                    }, 2000);
                }).catch(err => {
                    console.error('Error al copiar: ', err);
                    copyOrderFeedback.textContent = 'Error al copiar';
                    copyOrderFeedback.style.color = 'red';
                    copyOrderFeedback.style.display = 'inline';
                    setTimeout(() => {
                        copyOrderFeedback.style.display = 'none';
                        copyOrderFeedback.textContent = '¡Copiado!';
                        copyOrderFeedback.style.color = 'green';
                    }, 2000);
                });
            }
        };

        // Mostrar/ocultar botón según si hay email
        if (orderEmail) {
            copyOrderEmailBtn.style.display = 'inline-block';
        } else {
            copyOrderEmailBtn.style.display = 'none';
        }



        document.getElementById('modalSenderPhone').textContent = formatPhoneNumber(order.sender?.phone || 'N/A');


        // Mostrar/ocultar botón según si hay email
        if (orderEmail) {
            copyOrderEmailBtn.style.display = 'inline-block';
        } else {
            copyOrderEmailBtn.style.display = 'none';
        }

        // Configurar botón de WhatsApp
        setupWhatsAppButton('whatsappOrderBtn', order.sender?.phone || '');


        // Construir dirección del remitente
        const senderAddressParts = [];
        if (order.sender?.address?.street) senderAddressParts.push(order.sender.address.street);
        if (order.sender?.address?.apt) senderAddressParts.push(`Apt/Suite: ${order.sender.address.apt}`);
        if (order.sender?.address?.city) senderAddressParts.push(order.sender.address.city);
        if (order.sender?.address?.state) senderAddressParts.push(order.sender.address.state);
        if (order.sender?.address?.zipCode) senderAddressParts.push(order.sender.address.zipCode);

        document.getElementById('modalSenderAddress').textContent = senderAddressParts.join(', ') || 'N/A';

        // Receiver info
        document.getElementById('modalReceiverName').textContent = order.receiver?.name || 'N/A';
        document.getElementById('modalReceiverPhone').textContent = formatPhoneNumber(order.receiver?.phone || 'N/A');
        // Agrega esto donde configuras los datos del destinatario:
        setupWhatsAppButton('whatsappReceiverBtn', order.receiver?.phone || '');

        document.getElementById('modalReceiverCedula').textContent = order.receiver?.cedula || 'N/A';
        document.getElementById('modalReceiverAddress').textContent = order.receiver?.address || 'N/A';
        document.getElementById('modalReceiverProvince').textContent = order.receiver?.province || 'N/A';

        // Service info
        // Dentro de la función viewOrderDetails, busca la sección de Service info y reemplázala con esto:

        // Service info
        let serviceName = 'Múltiples servicios';
        if (order.services && order.services.length === 1) {
            serviceName = order.services[0].name;
        } else if (order.service) {
            serviceName = order.service.name || 'Servicio no especificado';
        }

        document.getElementById('modalServiceName').textContent = serviceName;

        // Mostrar la cantidad de artículos en la orden
        if (order.services && order.services.length > 0) {
            document.getElementById('modalServiceType').textContent = order.services[0].type === 'promo' ? 'Promoción' : 'Regular';
            document.getElementById('modalServicePrice').textContent = order.services.length;
        } else if (order.service) {
            document.getElementById('modalServiceType').textContent = order.service.type === 'promo' ? 'Promoción' : 'Regular';
            document.getElementById('modalServicePrice').textContent = '1';
        } else {
            document.getElementById('modalServiceType').textContent = 'N/A';
            document.getElementById('modalServicePrice').textContent = '0';
        }

        // Additional notes
        document.getElementById('modalAdditionalNotes').textContent = order.additionalNotes || 'Ninguna';

        // Items list
        const itemsList = document.getElementById('modalItemsList');
        itemsList.innerHTML = '';

        if (order.services && order.services.length > 0) {
            order.services.forEach(service => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item-row';

                const imageSrc = service.icon || './img/default_icon_1.png';

                itemDiv.innerHTML = `
    ${imageSrc ? `<img src="${imageSrc}" class="item-image">` : ''}
    <div class="item-info">
        ${service.name ? `<div class="item-name">${service.name}</div>` : ''}
        <div class="item-meta">
            ${service.subId ? `<div><strong>Sub-ID:</strong> ${service.subId}</div>` : ''}
            ${service.dimensions ? `<div><strong>Dimensiones:</strong> ${service.dimensions}</div>` : ''}
            ${service.type ? `<div><strong>Tipo:</strong> ${service.type === 'promo' ? 'Promoción' : 'Regular'}</div>` : ''}
            ${service.weight ? `<div><strong>Peso (lbs):</strong> ${service.weight}</div>` : ''}
            ${service.price ? `<div><strong>Precio (USD):</strong> <span style="color: #299bef;font-weight: bold;">${service.price}</span></div>` : ''}
        </div>
    </div>
`;
                itemsList.appendChild(itemDiv);
            });
        } else {
            itemsList.innerHTML = '<p>No hay artículos registrados para esta orden.</p>';
        }

        // Show modal
        document.getElementById('orderModal').style.display = 'flex';
    });
}



// View Quote Details
function viewQuoteDetails(quoteId) {
    selectedQuoteId = quoteId;

    db.collection('quotes').doc(quoteId).get().then(doc => {
        if (!doc.exists) {
            alert('Cotización no encontrada');
            return;
        }

        const quote = doc.data();
        const date = quote.timestamp?.toDate() ? formatFullDateWithTime(quote.timestamp.toDate()) : 'N/A';


        // Fill modal with quote data
        document.getElementById('modalQuoteId').textContent = quoteId;
        document.getElementById('modalQuoteDate').textContent = date;
        document.getElementById('quoteInternalNotes').value = quote.internalNotes || '';

        // Customer info
        document.getElementById('modalQuoteName').textContent = quote.name;
        document.getElementById('modalQuoteEmail').textContent = quote.email;

        // Configurar botón de copiar email
        const copyEmailBtn = document.getElementById('copyEmailBtn');
        const copyFeedback = document.querySelector('.copy-feedback');
        const quoteEmail = quote.email || '';

        copyEmailBtn.onclick = () => {
            if (quoteEmail) {
                navigator.clipboard.writeText(quoteEmail).then(() => {
                    copyFeedback.style.display = 'inline';
                    setTimeout(() => {
                        copyFeedback.style.display = 'none';
                    }, 2000);
                }).catch(err => {
                    console.error('Error al copiar: ', err);
                    copyFeedback.textContent = 'Error al copiar';
                    copyFeedback.style.color = 'red';
                    copyFeedback.style.display = 'inline';
                    setTimeout(() => {
                        copyFeedback.style.display = 'none';
                        copyFeedback.textContent = '¡Copiado!';
                        copyFeedback.style.color = 'green';
                    }, 2000);
                });
            }
        };

        // Mostrar/ocultar botón según si hay email
        if (quoteEmail) {
            copyEmailBtn.style.display = 'inline-block';
        } else {
            copyEmailBtn.style.display = 'none';
        }

        // Mostrar teléfono del remitente formateado con guiones y con +
        const phoneToShow = quote.phone || quote.sender?.phone || 'N/A';
        document.getElementById('modalQuotePhone').textContent = formatPhoneNumber(phoneToShow);



        // Configurar botón de WhatsApp
        setupWhatsAppButton('whatsappBtn', quote.phone || quote.sender?.phone || '');

        // Resto del código permanece igual...
        // Inicializar el input de teléfono del destinatario (República Dominicana)
        const receiverPhoneInput = document.getElementById('quoteReceiverPhone');
        window.quoteReceiverPhoneIti = window.intlTelInput(receiverPhoneInput, {
            preferredCountries: ['do', 'us'],
            separateDialCode: true,
            initialCountry: 'do',
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
        });

        // Configurar el valor inicial si existe
        if (quote.receiver?.phone) {
            window.quoteReceiverPhoneIti.setNumber(quote.receiver.phone);
        }

        // Configurar el formato de guiones para el input del destinatario
        receiverPhoneInput.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');
            let formatted = value.substring(0, 3);
            if (value.length > 3) formatted += '-' + value.substring(3, 6);
            if (value.length > 6) formatted += '-' + value.substring(6, 10);
            this.value = formatted;
        });

        // Establecer el valor del teléfono del destinatario si existe
        if (quote.receiver?.phone) {
            window.quoteReceiverPhoneIti.setNumber(quote.receiver.phone);
        }

        // Shipping info
        document.getElementById('modalQuoteType').textContent = quote.packageType;
        document.getElementById('modalQuoteOrigin').textContent = quote.origin;
        document.getElementById('modalQuoteDestination').textContent = quote.destination;

        // Price input field
        document.getElementById('quotePriceInput').value = quote.estimatedPrice || '';

        // Message/notes
        document.getElementById('quoteAdditionalNotes').value = quote.message || '';

        // Receiver info (if exists)
        document.getElementById('quoteReceiverName').value = quote.receiver?.name || '';
        document.getElementById('quoteReceiverPhone').value = quote.receiver?.phone || '';
        document.getElementById('quoteReceiverCedula').value = quote.receiver?.cedula || '';
        // Dentro de viewQuoteDetails, después de establecer el valor de la cédula:
        if (quote.receiver?.cedula) {
            document.getElementById('quoteReceiverCedula').value = formatCedula(quote.receiver.cedula);
        }

        // Agregar event listener para el formato automático
        document.getElementById('quoteReceiverCedula').addEventListener('input', function (e) {
            this.value = formatCedula(this.value);
        });

        // Función para formatear la cédula
        function formatCedula(cedula) {
            if (!cedula) return '';

            // Eliminar todos los caracteres no numéricos
            let cleaned = cedula.replace(/\D/g, '');

            // Aplicar formato: 000-0000000-0
            let formatted = cleaned.substring(0, 3);
            if (cleaned.length > 3) {
                formatted += '-' + cleaned.substring(3, 10);
            }
            if (cleaned.length > 10) {
                formatted += '-' + cleaned.substring(10, 11);
            }

            return formatted;
        }

        document.getElementById('quoteReceiverAddress').value = quote.receiver?.address || '';
        document.getElementById('quoteReceiverProvince').value = quote.receiver?.province || quote.destination || '';

        // Cargar dirección del remitente - Versión corregida
        if (quote.senderAddress) {
            // Si los datos están en el objeto senderAddress directamente
            document.getElementById('quoteSenderStreet').value = quote.senderAddress.street || '';
            document.getElementById('quoteSenderApt').value = quote.senderAddress.apt || '';
            document.getElementById('quoteSenderCity').value = quote.senderAddress.city || '';
            document.getElementById('quoteSenderState').value = quote.senderAddress.state || '';
            document.getElementById('quoteSenderZipCode').value = quote.senderAddress.zipCode || '';
        } else if (quote.sender?.address) {
            // Si los datos están anidados bajo sender.address
            document.getElementById('quoteSenderStreet').value = quote.sender.address.street || '';
            document.getElementById('quoteSenderApt').value = quote.sender.address.apt || '';
            document.getElementById('quoteSenderCity').value = quote.sender.address.city || '';
            document.getElementById('quoteSenderState').value = quote.sender.address.state || '';
            document.getElementById('quoteSenderZipCode').value = quote.sender.address.zipCode || '';
        } else {
            // Limpiar los campos si no hay datos
            document.getElementById('quoteSenderStreet').value = '';
            document.getElementById('quoteSenderApt').value = '';
            document.getElementById('quoteSenderCity').value = '';
            document.getElementById('quoteSenderState').value = '';
            document.getElementById('quoteSenderZipCode').value = '';
        }

        // Pickup date and time
        if (quote.pickupDate) {
            document.getElementById('quotePickupDate').value = quote.pickupDate;
        }
        if (quote.pickupTime) {
            document.getElementById('quotePickupTime').value = quote.pickupTime;
        }

        // Payment method
        if (quote.paymentMethod) {
            document.getElementById('quotePaymentMethod').value = quote.paymentMethod;
        }

        // Validate fields
        validateQuoteForm(false);

        // Render items
        renderQuoteItems(quote);

        // Show modal
        document.getElementById('quoteModal').style.display = 'flex';
    });
}

function renderQuoteItems(quote) {
    const itemsList = document.getElementById('modalQuoteItemsList');
    itemsList.innerHTML = '';

    if (quote.items && quote.items.length > 0) {
        quote.items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-row';

            const imageSrc = item.iconUrl || './img/default_icon_1.png';
            const itemPrice = item.price || 0;

            // Verificar si es un artículo personalizado
            const isCustomItem = quote.packageType === 'Personalizado';
            const commercialValue = item.commercialValue ? `US$${item.commercialValue.toFixed(2)}` : 'N/A';

            itemDiv.innerHTML = `
                <img src="${imageSrc}" class="item-image" alt="${item.name}">
                <div class="item-info">
                    <div class="item-name">
                        ${isCustomItem ? 'Artículo personalizado' : ''}
                        <div style="font-weight: normal; margin-top: 4px; color: black;">${item.name}</div>
                    </div>
                    <div class="item-meta">
                        ${!isCustomItem ? `<div><strong>SubID:</strong> ${item.subId || 'N/A'}</div>` : ''}
                        <div><strong>Dimensiones:</strong> ${item.dimensions}</div>
                        <div><strong>Peso (lbs):</strong> ${item.weight} lbs</div>
                        ${isCustomItem ? `<div><strong>Valor comercial:</strong> ${commercialValue}</div>` : ''}
                        <div style="display: inline-flex;flex-direction: row;align-items: center;gap: 0.5rem;">
                            <strong>Precio (USD):</strong>
                            <input type="number" class="item-price-input" data-index="${index}" 
                                   value="${itemPrice}" min="0" step="0.01" placeholder="0.00" required>
                        </div>
                    </div>
                </div>
            `;
            itemsList.appendChild(itemDiv);
        });

        // Resto del código (event listeners para los inputs de precio)...
        document.querySelectorAll('.item-price-input').forEach(input => {
            input.addEventListener('input', function () {
                if (this.value === '' || parseFloat(this.value) === 0) {
                    this.classList.add('empty-or-zero');
                } else {
                    this.classList.remove('empty-or-zero');
                }
                updateQuoteTotal();
                validateQuoteForm(false);
            });

            if (input.value === '' || parseFloat(input.value) === 0) {
                input.classList.add('empty-or-zero');
            }
        });

        updateQuoteTotal();
    } else {
        itemsList.innerHTML = '<p>No hay artículos registrados para esta cotización.</p>';
    }
}

function validateQuoteForm(isForConversion = false) {
    const requiredFields = document.querySelectorAll('#quoteModal .required-field');
    const priceInputs = document.querySelectorAll('.item-price-input');
    const priceInput = document.getElementById('quotePriceInput');
    const convertBtn = document.getElementById('convertToOrderBtn');
    const saveChangesBtn = document.getElementById('saveQuoteChanges');

    let allValid = true;

    // Validación para campos requeridos
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('invalid-field');
            field.classList.remove('valid-field');
            if (isForConversion) allValid = false;
        } else {
            field.classList.add('valid-field');
            field.classList.remove('invalid-field');
        }
    });

    // Validación de precios de artículos
    priceInputs.forEach(input => {
        const value = input.value.trim();
        if (value === '' || parseFloat(value) === 0) {
            input.classList.add('empty-or-zero');
            if (isForConversion) allValid = false;
        } else {
            input.classList.remove('empty-or-zero');
        }
    });

    // Validación especial para el precio total (requerido solo para conversión)
    if (isForConversion && (!priceInput.value.trim() || isNaN(parseFloat(priceInput.value)))) {
        priceInput.classList.add('invalid-field');
        priceInput.classList.remove('valid-field');
        allValid = false;
    } else if (priceInput.value.trim() && !isNaN(parseFloat(priceInput.value))) {
        priceInput.classList.add('valid-field');
        priceInput.classList.remove('invalid-field');
    }

    // Validación adicional para conversión a orden
    if (isForConversion) {
        const requiredForOrder = [
            'quoteSenderStreet',
            'quoteSenderCity',
            'quoteSenderState',
            'quoteSenderZipCode',
            'quotePickupDate',
            'quotePickupTime',
            'quotePaymentMethod'
        ];

        requiredForOrder.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.classList.add('invalid-field');
                field.classList.remove('valid-field');
                allValid = false;
            } else if (field) {
                field.classList.add('valid-field');
                field.classList.remove('invalid-field');
            }
        });
    }

    if (!isForConversion) {
        saveChangesBtn.disabled = !allValid;
    }

    return allValid;
}

// Modifica la función convertQuoteToOrderHandler
function convertQuoteToOrderHandler() {
    const convertBtn = document.getElementById('convertToOrderBtn');

    if (!validateQuoteForm(true)) {
        alert('Complete todos los campos requeridos antes de convertir a orden');
        return;
    }

    const confirmation = confirm('¿Convertir esta cotización en orden?');
    if (!confirmation) return;

    convertBtn.disabled = true;
    convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    // Obtener datos del formulario
    const quoteData = {
        price: parseFloat(document.getElementById('quotePriceInput').value),
        receiver: {
            name: document.getElementById('quoteReceiverName').value,
            phone: window.quoteReceiverPhoneIti
                ? window.quoteReceiverPhoneIti.getNumber(intlTelInputUtils.numberFormat.E164)
                : document.getElementById('quoteReceiverPhone').value.replace(/[-\s]/g, ''),
            cedula: document.getElementById('quoteReceiverCedula').value,
            address: document.getElementById('quoteReceiverAddress').value,
            province: document.getElementById('quoteReceiverProvince').value,
            country: "DO"
        },
        senderAddress: {
            street: document.getElementById('quoteSenderStreet').value,
            apt: document.getElementById('quoteSenderApt').value,
            city: document.getElementById('quoteSenderCity').value,
            state: document.getElementById('quoteSenderState').value,
            zipCode: document.getElementById('quoteSenderZipCode').value,
            country: "US"
        },
        pickupDateTime: {
            date: document.getElementById('quotePickupDate').value,
            time: document.getElementById('quotePickupTime').value
        },
        paymentMethod: document.getElementById('quotePaymentMethod').value,
        internalNotes: document.getElementById('quoteInternalNotes').value || '',
        additionalNotes: document.getElementById('quoteAdditionalNotes').value
    };

    // Primero actualizar la cotización con los precios actuales
    db.collection('quotes').doc(selectedQuoteId).get().then(quoteDoc => {
        if (!quoteDoc.exists) {
            throw new Error('Cotización no encontrada');
        }

        const quote = quoteDoc.data();

        // Capturar precios actualizados de los inputs
        const updatedItems = [...quote.items];
        document.querySelectorAll('.item-price-input').forEach((input, index) => {
            if (updatedItems[index]) {
                const price = parseFloat(input.value);
                updatedItems[index] = {
                    ...updatedItems[index],
                    price: isNaN(price) ? 0 : price
                };
            }
        });

        // Actualizar la cotización con los nuevos datos
        return db.collection('quotes').doc(selectedQuoteId).update({
            status: 'converted',
            estimatedPrice: quoteData.price,
            receiver: quoteData.receiver,
            senderAddress: quoteData.senderAddress,
            pickupDate: quoteData.pickupDateTime.date,
            pickupTime: quoteData.pickupDateTime.time,
            paymentMethod: quoteData.paymentMethod,
            items: updatedItems, // Guardar los items con precios actualizados
            convertedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    })
        .then(() => {
            // Obtener los datos actualizados de la cotización
            return db.collection('quotes').doc(selectedQuoteId).get();
        })
        .then((quoteDoc) => {
            const quote = quoteDoc.data();
            const orderId = selectedQuoteId;
            const batch = db.batch();

            // Procesar los items para la orden
            const processedItems = quote.items.map((item, index) => {
                return {
                    id: item.id || `item-${index}`,
                    subId: `${orderId}-${index + 1}`,
                    name: item.name,
                    price: item.price || 0, // Usar el precio ya actualizado
                    type: "standard",
                    icon: item.iconUrl || null,
                    dimensions: item.dimensions,
                    weight: item.weight
                };
            });

            // Crear el objeto de la orden
            const orderData = {
                id: orderId,
                status: 'order-pending',
                paymentMethod: quoteData.paymentMethod || 'pickup',
                paymentStatus: 'pending',
                totalPrice: quoteData.price,
                timestamp: quote.timestamp || firebase.firestore.FieldValue.serverTimestamp(),
                userId: quote.userId || null,
                sender: {
                    name: quote.name,
                    email: quote.email,
                    phone: quote.phone,
                    address: quoteData.senderAddress,
                    pickupDateTime: quoteData.pickupDateTime
                },
                receiver: quoteData.receiver,
                services: processedItems,
                additionalNotes: quoteData.additionalNotes || '',
                internalNotes: quoteData.internalNotes || '', // Añade esta línea
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Crear la orden en la colección 'orders'
            const orderRef = db.collection('orders').doc(orderId);
            batch.set(orderRef, orderData);

            // Si tiene userId, crear también en userOrders
            if (quote.userId) {
                const userOrderRef = db.collection('users').doc(quote.userId)
                    .collection('userOrders').doc(orderId);

                const userOrderData = {
                    ...orderData,
                    simplified: true
                };

                batch.set(userOrderRef, userOrderData);
            }

            return batch.commit();
        })
        .then(() => {
            alert('¡Orden creada con éxito!');
            document.getElementById('quoteModal').style.display = 'none';
            loadQuotesTable();
            loadOrdersTable();
            if (document.getElementById('dashboardTab').style.display === 'block') {
                loadStats();
            }
        })
        .catch(error => {
            console.error("Error en conversión:", error);
            alert('Error al crear la orden: ' + error.message);
        })
        .finally(() => {
            convertBtn.disabled = false;
            convertBtn.innerHTML = 'Convertir a Orden';
        });
}


// Función para actualizar el total cuando cambian los precios individuales
function updateQuoteTotal() {
    let total = 0;

    // Sumar todos los precios de los artículos
    document.querySelectorAll('.item-price-input').forEach(input => {
        const price = parseFloat(input.value);
        if (!isNaN(price)) {
            total += price;
        }
    });

    // Actualizar el campo de precio total
    document.getElementById('quotePriceInput').value = total.toFixed(2);

    // Validar el formulario
    validateQuoteForm(false);
}

// Save Quote Changes
async function saveQuoteChanges() {
    const quoteId = selectedQuoteId;
    const priceValue = document.getElementById('quotePriceInput').value;

    // Obtener el teléfono formateado correctamente
    let receiverPhone = '';
    if (window.quoteReceiverPhoneIti) {
        receiverPhone = window.quoteReceiverPhoneIti.getNumber(intlTelInputUtils.numberFormat.E164);
        receiverPhone = receiverPhone.replace(/[-\s]/g, ''); // Eliminar guiones y espacios por si acaso
    } else {
        receiverPhone = document.getElementById('quoteReceiverPhone').value.replace(/[-\s]/g, '');
        if (!receiverPhone.startsWith('+')) {
            receiverPhone = '+1' + receiverPhone; // Asumir que es un número de RD o USA
        }
    }

    const receiverData = {
        name: document.getElementById('quoteReceiverName').value,
        phone: receiverPhone, // Usar el número formateado
        cedula: document.getElementById('quoteReceiverCedula').value,
        address: document.getElementById('quoteReceiverAddress').value,
        province: document.getElementById('quoteReceiverProvince').value
    };

    const additionalNotes = document.getElementById('quoteAdditionalNotes').value;

    // Mostrar indicador de carga
    const saveBtn = document.getElementById('saveQuoteChanges');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    db.collection('quotes').doc(quoteId).get().then(quoteDoc => {
        if (!quoteDoc.exists) {
            throw new Error('Cotización no encontrada');
        }

        const quoteData = quoteDoc.data();
        const updateData = {
            receiver: receiverData,
            message: additionalNotes,
            internalNotes: document.getElementById('quoteInternalNotes').value || '',
            pickupDate: document.getElementById('quotePickupDate').value,
            pickupTime: document.getElementById('quotePickupTime').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (priceValue && !isNaN(parseFloat(priceValue))) {
            updateData.estimatedPrice = parseFloat(priceValue);
        }

        // Capturar precios actualizados de los inputs
        const updatedItems = [...quoteData.items];
        document.querySelectorAll('.item-price-input').forEach((input, index) => {
            if (updatedItems[index]) {
                const price = parseFloat(input.value);
                updatedItems[index] = {
                    ...updatedItems[index],
                    price: isNaN(price) ? 0 : price
                };
            }
        });

        updateData.items = updatedItems;

        return db.collection('quotes').doc(quoteId).update(updateData);
    })
        .then(() => {
            showToast('Cambios guardados correctamente', 'success');
            loadQuotesTable();
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Guardar Cambios';
        })
        .catch(error => {
            showToast('Error al guardar cambios: ' + error.message, 'error');
            console.error("Error al guardar:", error);
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Guardar Cambios';
        });
}

// Save Order Changes
function saveOrderChanges() {
    const orderId = selectedOrderId;
    const pickupDate = document.getElementById('modalPickupDate').value;
    const pickupTime = document.getElementById('modalPickupTime').value;
    const internalNotes = document.getElementById('modalInternalNotes').value;

    const updateData = {
        internalNotes: internalNotes || '',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Solo actualizar fecha/hora si ambos campos están completos
    if (pickupDate && pickupTime) {
        updateData['sender.pickupDateTime'] = {
            date: pickupDate,
            time: pickupTime
        };
    }

    // Mostrar indicador de carga
    const saveBtn = document.getElementById('saveOrderChanges');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    db.collection('orders').doc(orderId).update(updateData)
        .then(() => {
            showToast('Cambios guardados correctamente', 'success');

            // Actualizar las tablas afectadas sin cerrar el modal
            refreshOrderTables();

            // Quitar esta línea para que no se cierre el modal
            // document.getElementById('orderModal').style.display = 'none';
        })
        .catch(error => {
            showToast('Error al guardar cambios: ' + error.message, 'error');
            console.error("Error al guardar:", error);
        })
        .finally(() => {
            // Restaurar el botón
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Guardar Cambios';
        });
}

function refreshOrderTables() {
    // Actualizar todas las tablas que muestran órdenes
    if (document.getElementById('dashboardTab').style.display === 'block') {
        loadRecentOrders();
    }
    if (document.getElementById('ordersTab').style.display === 'block') {
        loadOrdersTable();
    }
    if (document.getElementById('in-transitTab').style.display === 'block') {
        loadInTransitTable();
    }
    if (document.getElementById('completed-ordersTab').style.display === 'block') {
        loadCompletedOrdersTable();
    }
    if (document.getElementById('assign-driverTab').style.display === 'block') {
        loadAssignDriverTable();
    }

    // Actualizar estadísticas
    loadStats();
}

// Employee Functions
function getStatusBadge(status) {
    const statusMap = {
        'quotes-pending': ['status-pending', 'Cot. Pendiente'],
        'order-pending': ['status-pending', 'Pendiente'],

        'pending': ['status-pending', 'Pendiente'],
        'cancelled': ['status-cancelled', 'Cancelado'],
        'converted': ['status-completed', 'Convertida'],

        'assignedDriver': ['status-assigned-driver-usa', 'Chofer Asignado USA'],
        'driverPickup': ['status-assigned', 'Recogido por Chofer'],
        'Received_Warehouse_usa': ['status-assigned', 'Recibido en Almacén USA'],
        'Warehouse_Exit_usa': ['status-assigned', 'Salida de Almacén USA'],
        'Received_Warehouse_rd': ['status-assigned', 'Recibido en Almacén RD'],
        'assignedDriver_rd': ['status-assigned-driver-rd', 'Chofer Asignado RD'],
        'Warehouse_Exit_rd': ['status-assigned', 'Salida de Almacén RD'],
        'delivered': ['status-completed', 'Entregado ✓']
    };

    const [badgeClass, badgeText] = statusMap[status] || ['status-pending', status];
    return `<span class="status-badge ${badgeClass}">${badgeText}</span>`;
}

function getPaymentMethodText(method) {
    const methods = {
        'online': 'En línea',
        'pickup': 'Al recoger (USA)',
        'delivery': 'Al recibir (RD)'
    };
    return methods[method] || method;
}


// Función para cargar órdenes pendientes de asignación
// Función para cargar órdenes pendientes de asignación
function loadAssignDriverTable() {
    return new Promise((resolve, reject) => {
        handleTableLoading('assignDriverTable', () => {
            return new Promise((innerResolve, innerReject) => {
                const table = $('#assignDriverTable').DataTable();
                table.clear().draw();

                const unsubscribe = db.collection('orders')
                    .where('status', 'in', ['order-pending', 'assignedDriver'])
                    .orderBy('timestamp', 'desc')
                    .onSnapshot(snapshot => {
                        table.clear();

                        // Consulta SOLO para choferes de USA
                        db.collection('users')
                            .where('isEmployee', '==', true)
                            .where('role', 'in', ['driver', 'driver_usa']) // Solo USA
                            .where('status', '==', 'active')
                            .get()
                            .then(driversSnapshot => {
                                const drivers = driversSnapshot.docs.map(doc => ({
                                    id: doc.id,
                                    name: doc.data().profile?.name || 'Sin nombre',
                                    role: doc.data().role
                                }));

                                const orders = [];
                                snapshot.forEach(doc => {
                                    const order = doc.data();
                                    orders.push({
                                        id: doc.id,
                                        data: order,
                                        driverName: order.driverName || 'No asignado',
                                        driverId: order.assignedDriver || null
                                    });
                                });

                                // Ordenar órdenes (primero las no asignadas)
                                orders.sort((a, b) => {
                                    if (a.driverName === 'No asignado') return -1;
                                    if (b.driverName === 'No asignado') return 1;
                                    return a.driverName.localeCompare(b.driverName);
                                });

                                orders.forEach(order => {
                                    // Formatear dirección del remitente
                                    const senderAddressParts = [];
                                    if (order.data.sender?.address?.street) senderAddressParts.push(order.data.sender.address.street);
                                    if (order.data.sender?.address?.apt) senderAddressParts.push(`Apt/Suite: ${order.data.sender.address.apt}`);
                                    if (order.data.sender?.address?.city) senderAddressParts.push(order.data.sender.address.city);
                                    if (order.data.sender?.address?.state) senderAddressParts.push(order.data.sender.address.state);
                                    if (order.data.sender?.address?.zipCode) senderAddressParts.push(order.data.sender.address.zipCode);
                                    const senderAddress = senderAddressParts.join(', ') || 'N/A';

                                    // Formatear fecha y hora de recolección
                                    let pickupDateTime = 'No programada';
                                    if (order.data.sender?.pickupDateTime?.date && order.data.sender?.pickupDateTime?.time) {
                                        const date = new Date(order.data.sender.pickupDateTime.date);
                                        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                                        pickupDateTime = `${formattedDate} - ${order.data.sender.pickupDateTime.time}`;
                                    }

                                    const rowData = [
                                        order.id,
                                        order.data.sender?.name || 'N/A',
                                        senderAddress,
                                        pickupDateTime,
                                        createAssignDriverActions(order.id, drivers, order.driverId)
                                    ];
                                    table.row.add(rowData).draw(false);
                                });
                                innerResolve();
                            })
                            .catch(innerReject);
                    });

                window.assignDriverUnsubscribe = unsubscribe;
            });
        });
    });
}



// Modificar createAssignDriverActions para mostrar solo choferes USA
function createAssignDriverActions(orderId, drivers, currentDriverId) {
    let html = '<select class="form-control driver-select" data-order="' + orderId + '">';
    html += '<option value="">Seleccionar chofer USA</option>';

    // Mostrar solo choferes USA (ya filtrados en la consulta)
    drivers.forEach(driver => {
        const selected = currentDriverId === driver.id ? 'selected' : '';
        const roleSuffix = driver.role === 'driver_usa' ? ' (USA)' : '';
        html += `<option value="${driver.id}" ${selected}>${driver.name}${roleSuffix}</option>`;
    });

    html += '</select>';
    return html;
}

function assignDriverToOrder(orderId, driverId) {
    // Primero obtenemos el nombre del chofer
    db.collection('users').doc(driverId).get()
        .then(driverDoc => {
            if (!driverDoc.exists) throw new Error('Chofer no encontrado');

            const driverName = driverDoc.data().profile?.name || 'Chofer desconocido';

            // Actualizamos la orden
            return db.collection('orders').doc(orderId).update({
                status: 'assignedDriver',
                assignedDriver: driverId,
                driverName: driverName,
                assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            showToast('Chofer asignado correctamente', 'success');
        })
        .catch(error => {
            console.error('Error al asignar chofer:', error);
            showToast('Error al asignar chofer: ' + error.message, 'error');
        });
}

function unassignDriverFromOrder(orderId) {
    db.collection('orders').doc(orderId).update({
        status: 'order-pending',
        assignedDriver: firebase.firestore.FieldValue.delete(),
        driverName: firebase.firestore.FieldValue.delete(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            showToast('Chofer desasignado correctamente', 'success');
        })
        .catch(error => {
            console.error('Error al desasignar chofer:', error);
            showToast('Error al desasignar chofer: ' + error.message, 'error');
        });
}


// Nueva función para cargar la tabla de asignación RD
function loadAssignDriverRDTable() {
    return new Promise((resolve, reject) => {
        handleTableLoading('assignDriverRDTable', () => {
            return new Promise((innerResolve, innerReject) => {
                const table = $('#assignDriverRDTable').DataTable();
                table.clear().draw();

                const unsubscribe = db.collection('orders')
                    .where('status', 'in', ['Received_Warehouse_rd', 'assignedDriver_rd'])
                    .orderBy('timestamp', 'desc')
                    .onSnapshot(snapshot => {
                        table.clear();

                        // Consulta para choferes de RD
                        db.collection('users')
                            .where('isEmployee', '==', true)
                            .where('role', '==', 'driver_rd')
                            .where('status', '==', 'active')
                            .get()
                            .then(driversSnapshot => {
                                const drivers = driversSnapshot.docs.map(doc => ({
                                    id: doc.id,
                                    name: doc.data().profile?.name || 'Sin nombre'
                                }));

                                snapshot.forEach(doc => {
                                    const order = doc.data();
                                    const rowData = [
                                        doc.id,
                                        order.receiver?.name || 'N/A',
                                        order.receiver?.address || 'N/A',
                                        formatPhoneNumber(order.receiver?.phone) || 'N/A',
                                        createAssignDriverRDActions(doc.id, drivers, order.assignedDriverRD)
                                    ];
                                    table.row.add(rowData).draw(false);
                                });
                                innerResolve();
                            })
                            .catch(innerReject);
                    });

                window.assignDriverRDUnsubscribe = unsubscribe;
            });
        });
    });
}

// Función para crear el select de choferes RD
function createAssignDriverRDActions(orderId, drivers, currentDriverId) {
    let html = '<select class="form-control driver-rd-select" data-order="' + orderId + '">';
    html += '<option value="">Seleccionar repartidor RD</option>';

    drivers.forEach(driver => {
        const selected = currentDriverId === driver.id ? 'selected' : '';
        html += `<option value="${driver.id}" ${selected}>${driver.name}</option>`;
    });

    html += '</select>';
    return html;
}

// Función para asignar chofer RD
function assignDriverRDToOrder(orderId, driverId) {
    db.collection('users').doc(driverId).get()
        .then(driverDoc => {
            if (!driverDoc.exists) throw new Error('Repartidor no encontrado');

            const driverName = driverDoc.data().profile?.name || 'Repartidor desconocido';

            return db.collection('orders').doc(orderId).update({
                status: 'assignedDriver_rd',
                assignedDriverRD: driverId,
                driverNameRD: driverName,
                assignedAtRD: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            showToast('Repartidor asignado correctamente', 'success');
        })
        .catch(error => {
            console.error('Error al asignar repartidor:', error);
            showToast('Error al asignar repartidor: ' + error.message, 'error');
        });
}

// Función para desasignar chofer RD
function unassignDriverRDFromOrder(orderId) {
    db.collection('orders').doc(orderId).update({
        status: 'Received_Warehouse_rd',
        assignedDriverRD: firebase.firestore.FieldValue.delete(),
        driverNameRD: firebase.firestore.FieldValue.delete(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            showToast('Repartidor desasignado correctamente', 'success');
        })
        .catch(error => {
            console.error('Error al desasignar repartidor:', error);
            showToast('Error al desasignar repartidor: ' + error.message, 'error');
        });
}



// Helper function para mostrar notificaciones
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }, 100);
}

// Initialize DataTables
function initDataTables(tableId = null) {
    const commonOptions = {
        language: {
            search: "",
            searchPlaceholder: "Buscar...",
            emptyTable: "No hay órdenes aquí...",
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
        },
        paging: false,
        order: [],
        dom: '<"top"<"search-container"f><"export-container"B>>rt<"bottom"i>',
        buttons: ['excel', 'print'],
        initComplete: function () {
            $('.search-container').css({
                'float': 'left',
                'margin-right': 'auto'
            });
            $('.export-container').css({
                'float': 'right',
                'margin-left': 'auto'
            });
        }
    };

    // Si se especifica una tabla, inicializar solo esa
    if (tableId) {
        if (!$.fn.DataTable.isDataTable(`#${tableId}`)) {
            return $(`#${tableId}`).DataTable(commonOptions);
        }
        return $(`#${tableId}`).DataTable();
    }

    // Inicializar todas las tablas si no se especifica una
    const tables = {
        'ordersTable': { ...commonOptions, order: [[3, 'desc']] },
        'quotesTable': { ...commonOptions, order: [[6, 'desc']] },
        'customersTable': commonOptions,
        'employeesTable': commonOptions,
        'inTransitTable': { ...commonOptions, order: [[3, 'desc']] },
        'completedOrdersTable': { ...commonOptions, order: [[3, 'desc']] },
        'servicesTable': commonOptions,
        'productsTable': commonOptions,
        'recentOrdersTable': { ...commonOptions, order: [[3, 'desc']] },
        'assignDriverRDTable': { ...commonOptions, order: [[3, 'desc']] },
        'assignDriverTable': {
            ...commonOptions,
            order: [[3, 'desc']],
            rowGroup: {
                dataSrc: 4,
                startRender: function (rows, group) {
                    return $('<tr/>')
                        .append('<td colspan="5">' + group + ' (' + rows.count() + ' órdenes)</td>');
                }
            },
            drawCallback: function (settings) {
                const api = this.api();
                api.rows().every(function () {
                    const row = this.node();
                    const driverName = this.data()[5];
                    $(row).toggleClass('no-driver', driverName === 'No asignado');
                });
            }
        }
    };

    Object.entries(tables).forEach(([tableId, options]) => {
        if (!$.fn.DataTable.isDataTable(`#${tableId}`)) {
            $(`#${tableId}`).DataTable(options);
        }
    });
}

// Logout
// Modificar la función logout
function logout() {
    // Limpiar todos los listeners de Firestore
    if (window.recentOrdersUnsubscribe) window.recentOrdersUnsubscribe();
    if (window.statsOrdersUnsubscribe) window.statsOrdersUnsubscribe();
    if (window.statsQuotesUnsubscribe) window.statsQuotesUnsubscribe();
    if (window.ordersUnsubscribe) window.ordersUnsubscribe();
    if (window.quotesUnsubscribe) window.quotesUnsubscribe();
    if (window.customersUnsubscribe) window.customersUnsubscribe();
    if (window.employeesUnsubscribe) window.employeesUnsubscribe();
    if (window.inTransitUnsubscribe) window.inTransitUnsubscribe();
    if (window.completedOrdersUnsubscribe) window.completedOrdersUnsubscribe();
    if (window.assignDriverUnsubscribe) window.assignDriverUnsubscribe();
    if (window.assignDriverRDUnsubscribe) window.assignDriverRDUnsubscribe();

    auth.signOut().then(() => {
        // Resetear variables globales
        currentAdmin = null;
        selectedOrderId = null;
        selectedQuoteId = null;
        selectedEmployeeId = null;
        selectedServiceId = null;
        selectedProductId = null;
        isEditMode = false;
        
        // Mostrar login y ocultar panel
        document.getElementById('loginContainer').style.display = 'flex';
        document.querySelector('.admin-container').style.display = 'none';
        
        // Resetear formulario de login y botón
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').textContent = '';
        
        // Restablecer el botón de inicio de sesión
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        }
    }).catch(error => {
        console.error("Logout error:", error);
        showToast('Error al cerrar sesión: ' + error.message, 'error');
    });
}

// Función para formatear fechas en el formato deseado: "7 jul 20:20"
function formatDate(date) {
    if (!date) return 'N/A';

    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${hours}:${minutes}`;
}



// Función para formatear números de teléfono con guiones y mantener el símbolo +
function formatPhoneNumber(phone) {
    if (!phone) return 'N/A';

    // Limpiar el número (quitar todo excepto dígitos)
    let cleaned = phone.replace(/\D/g, '');

    // Formatear números de USA/RD (10 dígitos)
    if (cleaned.length === 10) {
        return `+1-${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
    // Formatear números que ya incluyen el código 1 (11 dígitos)
    else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+1-${cleaned.substring(1, 4)}-${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
    }
    // Formatear números que ya tienen +1 (como "+18299149394")
    else if (phone.startsWith('+1') && cleaned.length === 11) {
        cleaned = cleaned.substring(1); // Quitamos el 1 adicional
        return `+1-${cleaned.substring(1, 4)}-${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
    }
    // Para otros formatos, devolver el original
    return phone;
}

