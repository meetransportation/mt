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

// Global variables
let currentAdmin = null;
let selectedOrderId = null;
let selectedQuoteId = null;
let selectedEmployeeId = null;
let selectedServiceId = null;
let selectedProductId = null;
let isEditMode = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    initUI();
    initDataTables();
    initModals();
});

// Initialize Authentication
function initAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentAdmin = user;
            loadAdminProfile(user);
            initDashboard();
        } else {
            window.location.href = 'index.html';
        }
    });
}

// Initialize UI Elements
function initUI() {
    // Sidebar menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            showTab(tab);
            
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
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
}

// Order Modal
function initOrderModal() {
    document.getElementById('cancelOrderChanges').addEventListener('click', () => {
        document.getElementById('orderModal').style.display = 'none';
    });
    
    document.getElementById('saveOrderChanges').addEventListener('click', saveOrderChanges);
}

// Quote Modal
function initQuoteModal() {
    document.getElementById('cancelQuoteChanges').addEventListener('click', () => {
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
function initEmployeeModal() {
    document.getElementById('addEmployee').addEventListener('click', () => {
        isEditMode = false;
        selectedEmployeeId = null;
        document.getElementById('employeeForm').reset();
        document.getElementById('employeePassword').required = true;
        document.getElementById('employeeModalTitle').textContent = 'Agregar Nuevo Empleado';
        document.getElementById('employeeModal').style.display = 'flex';
    });
    
    document.getElementById('cancelEmployee').addEventListener('click', () => {
        document.getElementById('employeeModal').style.display = 'none';
    });
    
    document.getElementById('saveEmployee').addEventListener('click', saveEmployee);
}

// Refresh Buttons
function initRefreshButtons() {
    document.getElementById('refreshOrders')?.addEventListener('click', loadRecentOrders);
    document.getElementById('refreshInTransit')?.addEventListener('click', loadInTransitTable);
    document.getElementById('refreshCompleted')?.addEventListener('click', loadCompletedOrdersTable);
    document.getElementById('exportCompleted')?.addEventListener('click', () => {
        $('#completedOrdersTable').DataTable().button('.buttons-excel').trigger();
    });
}

// Load admin profile
function loadAdminProfile(user) {
    document.getElementById('adminName').textContent = user.displayName || 'Administrador';
    if (user.photoURL) {
        document.getElementById('adminPhoto').src = user.photoURL;
    }
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
        'completed-orders': () => { if (window.completedOrdersUnsubscribe) window.completedOrdersUnsubscribe(); }
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
    
    // Load data for the tab
    const tabLoaders = {
        'dashboard': () => { loadStats(); loadRecentOrders(); },
        'orders': loadOrdersTable,
        'quotes': loadQuotesTable,
        'customers': loadCustomersTable,
        'employees': loadEmployeesTable,
        'in-transit': loadInTransitTable,
        'completed-orders': loadCompletedOrdersTable,
        'services': loadServicesTable,
        'products': loadProductsTable
    };
    
    if (tabLoaders[tabName]) {
        tabLoaders[tabName]();
    }
}

// Dashboard functions
function initDashboard() {
    loadStats();
    loadRecentOrders();
}

// Función original de loadStats (se mantiene como respaldo)
function loadStatsOriginal() {
    // Total orders
    db.collection('orders').get().then(snapshot => {
        document.getElementById('totalOrders').textContent = snapshot.size;
    });
    
    // Total quotes
    db.collection('quotes').get().then(snapshot => {
        document.getElementById('totalQuotes').textContent = snapshot.size;
    });
    
    // Pending items
    Promise.all([
        db.collection('orders').where('status', '==', 'order-pending').get(),
        db.collection('quotes').where('status', '==', 'quotes-pending').get()
    ]).then(([ordersSnapshot, quotesSnapshot]) => {
        const totalPending = ordersSnapshot.size + quotesSnapshot.size;
        document.getElementById('pendingItems').textContent = totalPending;
        document.getElementById('pendingOrdersBadge').textContent = ordersSnapshot.size;
        document.getElementById('pendingQuotesBadge').textContent = quotesSnapshot.size;
    });
    
    // In transit orders
    db.collection('orders').where('status', 'in', ['recogidaUSA', 'enTransito', 'enAduana', 'repartoLocal']).get().then(snapshot => {
        document.getElementById('inTransitOrders').textContent = snapshot.size;
        document.getElementById('inTransitBadge').textContent = snapshot.size;
    });
    
    // Completed orders
    db.collection('orders').where('status', '==', 'completed').get().then(snapshot => {
        document.getElementById('completedOrdersBadge').textContent = snapshot.size;
    });
}

// Nueva versión de loadStats con actualización en tiempo real
function loadStats() {
    // Escuchar cambios en las órdenes
    const ordersUnsubscribe = db.collection('orders').onSnapshot(snapshot => {
        document.getElementById('totalOrders').textContent = snapshot.size;
        
        // Calcular órdenes pendientes
        let pendingOrders = 0;
        snapshot.forEach(doc => {
            if (doc.data().status === 'order-pending') {
                pendingOrders++;
            }
        });
        document.getElementById('pendingOrdersBadge').textContent = pendingOrders;
        
        // Calcular órdenes en tránsito
        let inTransitOrders = 0;
        snapshot.forEach(doc => {
            const status = doc.data().status;
            if (['recogidaUSA', 'enTransito', 'enAduana', 'repartoLocal'].includes(status)) {
                inTransitOrders++;
            }
        });
        document.getElementById('inTransitOrders').textContent = inTransitOrders;
        document.getElementById('inTransitBadge').textContent = inTransitOrders;
        
        // Calcular órdenes completadas
        let completedOrders = 0;
        snapshot.forEach(doc => {
            if (doc.data().status === 'completed') {
                completedOrders++;
            }
        });
        document.getElementById('completedOrdersBadge').textContent = completedOrders;
    });
    
    // Escuchar cambios en las cotizaciones
    const quotesUnsubscribe = db.collection('quotes').onSnapshot(snapshot => {
        document.getElementById('totalQuotes').textContent = snapshot.size;
        
        // Calcular cotizaciones pendientes
        let pendingQuotes = 0;
        snapshot.forEach(doc => {
            if (doc.data().status === 'quotes-pending') {
                pendingQuotes++;
            }
        });
        document.getElementById('pendingQuotesBadge').textContent = pendingQuotes;
        
        // Actualizar contador total de pendientes
        const pendingOrders = parseInt(document.getElementById('pendingOrdersBadge').textContent) || 0;
        document.getElementById('pendingItems').textContent = pendingOrders + pendingQuotes;
    });
    
    // Guardar las funciones unsubscribe para limpiar cuando sea necesario
    window.statsOrdersUnsubscribe = ordersUnsubscribe;
    window.statsQuotesUnsubscribe = quotesUnsubscribe;
}

// Función original de loadRecentOrders (se mantiene como respaldo)
function loadRecentOrdersOriginal() {
    const table = $('#recentOrdersTable').DataTable();
    table.clear().draw();
    
    db.collection('orders')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const order = doc.data();
                table.row.add(createOrderRowData(doc.id, order)).draw(false);
            });
            addViewOrderHandlers();
        });
}

// Nueva versión de loadRecentOrders con actualización en tiempo real
function loadRecentOrders() {
    const table = $('#recentOrdersTable').DataTable();
    table.clear().draw();
    
    const unsubscribe = db.collection('orders')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .onSnapshot(snapshot => {
            table.clear();
            
            snapshot.forEach(doc => {
                const order = doc.data();
                table.row.add(createOrderRowData(doc.id, order)).draw(false);
            });
            
            addViewOrderHandlers();
        });
    
    window.recentOrdersUnsubscribe = unsubscribe;
}

// Order Table Functions
function loadOrdersTableOriginal() {
    const table = $('#ordersTable').DataTable();
    table.clear().draw();
    
    db.collection('orders')
        .orderBy('timestamp', 'desc')
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const order = doc.data();
                table.row.add(createOrderRowData(doc.id, order, true)).draw(false);
            });
            addViewOrderHandlers();
        });
}

// Nueva versión de loadOrdersTable con actualización en tiempo real
function loadOrdersTable() {
    const table = $('#ordersTable').DataTable();
    table.clear().draw();
    
    const unsubscribe = db.collection('orders')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            table.clear();
            
            snapshot.forEach(doc => {
                const order = doc.data();
                table.row.add(createOrderRowData(doc.id, order, true)).draw(false);
            });
            
            addViewOrderHandlers();
        });
    
    window.ordersUnsubscribe = unsubscribe;
}

function createOrderRowData(id, order, showPaymentMethod = false) {
    const date = order.timestamp?.toDate().toLocaleDateString() || 'N/A';
    const rowData = [
        id,
        order.sender.name,
        order.service.name,
        date,
        order.service.price,
        getStatusBadge(order.status)
    ];
    
    if (showPaymentMethod) {
        rowData.splice(5, 0, getPaymentMethodText(order.paymentMethod));
    }
    
    rowData.push(`<button class="btn btn-outline view-order" data-id="${id}">Ver</button>`);
    
    return rowData;
}

function addViewOrderHandlers() {
    document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', function() {
            viewOrderDetails(this.getAttribute('data-id'));
        });
    });
}

// Función original de loadInTransitTable (se mantiene como respaldo)
function loadInTransitTableOriginal() {
    const table = $('#inTransitTable').DataTable();
    table.clear().draw();
    
    db.collection('orders')
        .where('status', 'in', ['recogidaUSA', 'enTransito', 'enAduana', 'repartoLocal'])
        .orderBy('timestamp', 'desc')
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const order = doc.data();
                table.row.add(createOrderRowData(doc.id, order)).draw(false);
            });
            addViewOrderHandlers();
        });
}

// Nueva versión de loadInTransitTable con actualización en tiempo real
function loadInTransitTable() {
    const table = $('#inTransitTable').DataTable();
    table.clear().draw();
    
    const unsubscribe = db.collection('orders')
        .where('status', 'in', ['recogidaUSA', 'enTransito', 'enAduana', 'repartoLocal'])
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            table.clear();
            
            snapshot.forEach(doc => {
                const order = doc.data();
                table.row.add(createOrderRowData(doc.id, order)).draw(false);
            });
            
            addViewOrderHandlers();
        });
    
    window.inTransitUnsubscribe = unsubscribe;
}

// Función original de loadCompletedOrdersTable (se mantiene como respaldo)
function loadCompletedOrdersTableOriginal() {
    const table = $('#completedOrdersTable').DataTable();
    table.clear().draw();
    
    db.collection('orders')
        .where('status', '==', 'completed')
        .orderBy('timestamp', 'desc')
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const order = doc.data();
                table.row.add(createOrderRowData(doc.id, order, true)).draw(false);
            });
            addViewOrderHandlers();
        });
}

// Nueva versión de loadCompletedOrdersTable con actualización en tiempo real
function loadCompletedOrdersTable() {
    const table = $('#completedOrdersTable').DataTable();
    table.clear().draw();
    
    const unsubscribe = db.collection('orders')
        .where('status', '==', 'completed')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            table.clear();
            
            snapshot.forEach(doc => {
                const order = doc.data();
                table.row.add(createOrderRowData(doc.id, order, true)).draw(false);
            });
            
            addViewOrderHandlers();
        });
    
    window.completedOrdersUnsubscribe = unsubscribe;
}

// Función original de loadQuotesTable (se mantiene como respaldo)
function loadQuotesTableOriginal() {
    const table = $('#quotesTable').DataTable();
    table.clear().draw();
    
    db.collection('quotes')
        .orderBy('timestamp', 'desc')
        .get()
        .then(snapshot => {
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
            
            document.querySelectorAll('.view-quote').forEach(btn => {
                btn.addEventListener('click', function() {
                    viewQuoteDetails(this.getAttribute('data-id'));
                });
            });
        });
}

// Nueva versión de loadQuotesTable con actualización en tiempo real
function loadQuotesTable() {
    const table = $('#quotesTable').DataTable();
    table.clear().draw();
    
    const unsubscribe = db.collection('quotes')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
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
            
            document.querySelectorAll('.view-quote').forEach(btn => {
                btn.addEventListener('click', function() {
                    viewQuoteDetails(this.getAttribute('data-id'));
                });
            });
        });
    
    window.quotesUnsubscribe = unsubscribe;
}

// Función original de loadCustomersTable (se mantiene como respaldo)
function loadCustomersTableOriginal() {
    const table = $('#customersTable').DataTable();
    table.clear().draw();
    
    db.collection('users')
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const user = doc.data();
                const date = user.registrationDate?.toDate().toLocaleDateString() || 'N/A';
                
                table.row.add([
                    doc.id,
                    user.profile?.name || user.email,
                    user.email,
                    user.profile?.phone || 'N/A',
                    date,
                    user.orders?.length || 0,
                    `<button class="btn btn-outline view-customer" data-id="${doc.id}">Ver</button>`
                ]).draw(false);
            });
        });
}

// Nueva versión de loadCustomersTable con actualización en tiempo real
function loadCustomersTable() {
    const table = $('#customersTable').DataTable();
    table.clear().draw();
    
    const unsubscribe = db.collection('users')
        .onSnapshot(snapshot => {
            table.clear();
            
            snapshot.forEach(doc => {
                const user = doc.data();
                const date = user.registrationDate?.toDate().toLocaleDateString() || 'N/A';
                
                table.row.add([
                    doc.id,
                    user.profile?.name || user.email,
                    user.email,
                    user.profile?.phone || 'N/A',
                    date,
                    user.orders?.length || 0,
                    `<button class="btn btn-outline view-customer" data-id="${doc.id}">Ver</button>`
                ]).draw(false);
            });
        });
    
    window.customersUnsubscribe = unsubscribe;
}

// Función original de loadEmployeesTable (se mantiene como respaldo)
function loadEmployeesTableOriginal() {
    const table = $('#employeesTable').DataTable();
    table.clear().draw();
    
    db.collection('employees')
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const employee = doc.data();
                
                table.row.add([
                    doc.id,
                    employee.name,
                    employee.email,
                    employee.phone || 'N/A',
                    getRoleText(employee.role),
                    employee.status === 'active' ? 'Activo' : 'Inactivo',
                    `<button class="btn btn-outline edit-employee" data-id="${doc.id}">Editar</button>
                     <button class="btn btn-primary reset-password" data-id="${doc.id}" data-email="${employee.email}">Recuperar Contraseña</button>
                     <button class="btn btn-danger delete-employee" data-id="${doc.id}">Eliminar</button>`
                ]).draw(false);
            });
            
            addEmployeeHandlers();
        });
}

// Nueva versión de loadEmployeesTable con actualización en tiempo real
function loadEmployeesTable() {
    const table = $('#employeesTable').DataTable();
    table.clear().draw();
    
    const unsubscribe = db.collection('employees')
        .onSnapshot(snapshot => {
            table.clear();
            
            snapshot.forEach(doc => {
                const employee = doc.data();
                
                table.row.add([
                    doc.id,
                    employee.name,
                    employee.email,
                    employee.phone || 'N/A',
                    getRoleText(employee.role),
                    employee.status === 'active' ? 'Activo' : 'Inactivo',
                    `<button class="btn btn-outline edit-employee" data-id="${doc.id}">Editar</button>
                     <button class="btn btn-primary reset-password" data-id="${doc.id}" data-email="${employee.email}">Recuperar Contraseña</button>
                     <button class="btn btn-danger delete-employee" data-id="${doc.id}">Eliminar</button>`
                ]).draw(false);
            });
            
            addEmployeeHandlers();
        });
}

function addEmployeeHandlers() {
    document.querySelectorAll('.edit-employee').forEach(btn => {
        btn.addEventListener('click', function() {
            editEmployee(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-employee').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteEmployee(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.reset-password').forEach(btn => {
        btn.addEventListener('click', function() {
            resetEmployeePassword(this.getAttribute('data-id'), this.getAttribute('data-email'));
        });
    });
}

// View Order Details
function viewOrderDetails(orderId) {
    selectedOrderId = orderId;
    
    db.collection('orders').doc(orderId).get().then(doc => {
        if (!doc.exists) {
            alert('Orden no encontrada');
            return;
        }
        
        const order = doc.data();
        const date = order.timestamp?.toDate().toLocaleString() || 'N/A';
        
        // Fill modal with order data
        document.getElementById('modalOrderId').textContent = orderId;
        document.getElementById('modalOrderDate').textContent = date;
        document.getElementById('modalOrderStatus').value = order.status;
        document.getElementById('modalPaymentMethod').textContent = getPaymentMethodText(order.paymentMethod);
        document.getElementById('modalOrderTotal').textContent = order.service.price;
        
        // Llenar fecha y hora de recogida
        if (order.sender.pickupDateTime) {
            document.getElementById('modalPickupDate').value = order.sender.pickupDateTime.date;
            
            // Llenar el select de horas
            const timeSelect = document.getElementById('modalPickupTime');
            timeSelect.innerHTML = '<option value="">Seleccione una hora</option>';
            
            // Generar opciones de hora (8am a 9pm)
            for (let hour = 8; hour <= 21; hour++) {
                const formattedHour = hour.toString().padStart(2, '0') + ':00';
                const option = document.createElement('option');
                option.value = formattedHour;
                option.textContent = formattedHour;
                timeSelect.appendChild(option);
            }
            
            // Seleccionar la hora guardada
            timeSelect.value = order.sender.pickupDateTime.time;
        }
        
        // Sender info
        document.getElementById('modalSenderName').textContent = order.sender.name;
        document.getElementById('modalSenderEmail').textContent = order.sender.email;
        document.getElementById('modalSenderPhone').textContent = order.sender.phone;
        document.getElementById('modalSenderAddress').textContent = order.sender.address;
        
        // Receiver info
        document.getElementById('modalReceiverName').textContent = order.receiver.name;
        document.getElementById('modalReceiverPhone').textContent = order.receiver.phone;
        document.getElementById('modalReceiverCedula').textContent = order.receiver.cedula;
        document.getElementById('modalReceiverAddress').textContent = order.receiver.address;
        document.getElementById('modalReceiverProvince').textContent = order.receiver.province;
        
        // Service info
        document.getElementById('modalServiceType').textContent = order.service.type === 'promo' ? 'Promoción' : 'Regular';
        document.getElementById('modalServiceName').textContent = order.service.name;
        document.getElementById('modalServicePrice').textContent = order.service.price;
        
        // Additional notes
        document.getElementById('modalAdditionalNotes').textContent = order.additionalNotes || 'Ninguna';
        
        // Items list
        const itemsList = document.getElementById('modalItemsList');
        itemsList.innerHTML = '';
        
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item-row';
                
                // Construir la imagen - usa base64 si está disponible, sino un placeholder
                let imageSrc = 'https://via.placeholder.com/60';
                if (item.imageBase64) {
                    imageSrc = `data:image/jpeg;base64,${item.imageBase64}`;
                } else if (item.icon) {
                    imageSrc = item.icon;
                }
                
                // Construir el contenido del artículo según el tipo
                if (order.service.description === 'Artículo Común' || item.name) {
                    // Artículo común
                    itemDiv.innerHTML = `
                        <img src="${imageSrc}" class="item-image">
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-meta">
                                <div><strong>Dimensiones:</strong> ${item.dimensions}</div>
                                <div><strong>Peso:</strong> ${item.weight} lbs</div>
                                <div><strong>Cantidad:</strong> ${item.quantity || 1}</div>
                                ${item.commercialValue ? `<div><strong>Valor comercial:</strong> $${item.commercialValue}</div>` : ''}
                            </div>
                        </div>
                    `;
                } else if (order.service.description === 'Personalizado' || item.item) {
                    // Artículo personalizado
                    itemDiv.innerHTML = `
                        <img src="${imageSrc}" class="item-image">
                        <div class="item-info">
                            <div class="item-name">${item.item || 'Artículo personalizado'}</div>
                            <div class="item-meta">
                                <div><strong>Dimensiones:</strong> ${item.length}" x ${item.width}" x ${item.height}"</div>
                                <div><strong>Peso:</strong> ${item.weight} lbs</div>
                                ${item.commercialValue ? `<div><strong>Valor comercial:</strong> $${item.commercialValue}</div>` : ''}
                            </div>
                        </div>
                    `;
                }
                
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
        const date = quote.timestamp?.toDate().toLocaleString() || 'N/A';
        
        // Fill modal with quote data
        document.getElementById('modalQuoteId').textContent = quoteId;
        document.getElementById('modalQuoteDate').textContent = date;
        
        // Customer info
        document.getElementById('modalQuoteName').textContent = quote.name;
        document.getElementById('modalQuoteEmail').textContent = quote.email;
        document.getElementById('modalQuotePhone').textContent = quote.phone;
        
        // Shipping info
        document.getElementById('modalQuoteType').textContent = quote.packageType;
        document.getElementById('modalQuoteOrigin').textContent = quote.origin;
        document.getElementById('modalQuoteDestination').textContent = quote.destination;
        
        // Price input field
        document.getElementById('quotePriceInput').value = quote.estimatedPrice || '';
        
        // Receiver info (if exists)
        document.getElementById('quoteReceiverName').value = quote.receiver?.name || '';
        document.getElementById('quoteReceiverPhone').value = quote.receiver?.phone || '';
        document.getElementById('quoteReceiverCedula').value = quote.receiver?.cedula || '';
        document.getElementById('quoteReceiverAddress').value = quote.receiver?.address || '';
        document.getElementById('quoteReceiverProvince').value = quote.receiver?.province || quote.destination || '';
        document.getElementById('quoteAdditionalNotes').value = quote.additionalNotes || '';
        
        // Items list
        renderQuoteItems(quote);
        
        // Validate fields
        validateQuoteForm(false);
        
        // Show modal
        document.getElementById('quoteModal').style.display = 'flex';
    });
}

function renderQuoteItems(quote) {
    const itemsList = document.getElementById('modalQuoteItemsList');
    itemsList.innerHTML = '';
    
    if (quote.packageType === 'Artículo Común' && quote.commonItems) {
        quote.commonItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-row';
            itemDiv.innerHTML = `
                <img src="${item.icon || './img/default_icon_1.png'}" class="item-image">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-meta">
                        <div><strong>Dimensiones:</strong> ${item.dimensions}</div>
                        <div><strong>Peso:</strong> ${item.weight} lbs</div>
                        <div><strong>Cantidad:</strong> ${item.quantity}</div>
                    </div>
                </div>
            `;
            itemsList.appendChild(itemDiv);
        });
    } else if (quote.packageType === 'Personalizado' && quote.customItem) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-row';
        itemDiv.innerHTML = `
            <img src="./img/default_icon_1.png" class="item-image">
            <div class="item-info">
                <div class="item-name">${quote.customItem.item}</div>
                <div class="item-meta">
                    <div><strong>Dimensiones:</strong> ${quote.customItem.length}" x ${quote.customItem.width}" x ${quote.customItem.height}"</div>
                    <div><strong>Peso:</strong> ${quote.customItem.weight} lbs</div>
                    <div><strong>Valor comercial:</strong> $${quote.customItem.commercialValue || '0'}</div>
                </div>
            </div>
        `;
        itemsList.appendChild(itemDiv);
    }
}

function validateQuoteForm(isForConversion = false) {
    const requiredFields = document.querySelectorAll('#quoteModal .required-field');
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
    
    // Validación especial para el precio (requerido solo para conversión)
    if (isForConversion && !priceInput.value.trim()) {
        priceInput.classList.add('invalid-field');
        priceInput.classList.remove('valid-field');
        allValid = false;
    } else if (priceInput.value.trim() && isNaN(parseFloat(priceInput.value))) {
        priceInput.classList.add('invalid-field');
        priceInput.classList.remove('valid-field');
        allValid = false;
    } else {
        priceInput.classList.add('valid-field');
        priceInput.classList.remove('invalid-field');
    }
    
    // Habilitar/deshabilitar botones según el modo
    if (isForConversion) {
        convertBtn.disabled = !allValid;
    } else {
        // Para guardar cambios, solo requerimos que no haya campos inválidos (NaN en precio)
        saveChangesBtn.disabled = !allValid;
    }
    
    return allValid;
}

// Convert Quote to Order Handler
// Modifica la función convertQuoteToOrderHandler
function convertQuoteToOrderHandler() {
    if (!validateQuoteForm(true)) {
        alert('Complete todos los campos y asegure un precio válido');
        return;
    }

    const confirmation = confirm('¿Convertir esta cotización en orden?');
    if (!confirmation) return;

    const convertBtn = document.getElementById('convertToOrderBtn');
    convertBtn.disabled = true;
    convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

    const quoteData = {
        price: parseFloat(document.getElementById('quotePriceInput').value),
        receiver: {
            name: document.getElementById('quoteReceiverName').value,
            phone: document.getElementById('quoteReceiverPhone').value,
            cedula: document.getElementById('quoteReceiverCedula').value,
            address: document.getElementById('quoteReceiverAddress').value,
            province: document.getElementById('quoteReceiverProvince').value
        }
    };

    // 1. Actualizar la cotización
    db.collection('quotes').doc(selectedQuoteId).update({
        status: 'converted',
        estimatedPrice: quoteData.price,
        receiver: quoteData.receiver,
        convertedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        // 2. Obtener los datos actualizados de la cotización
        return db.collection('quotes').doc(selectedQuoteId).get();
    })
    .then((doc) => {
        const quote = doc.data();
        
        // 3. Crear la nueva orden usando el mismo ID que la cotización
        const orderData = {
            // Información del servicio
            service: {
                name: quote.packageType,
                price: quoteData.price,
                type: 'regular',
                description: quote.packageType
            },
            
            // Información del remitente (de la cotización)
            sender: {
                name: quote.name,
                email: quote.email,
                phone: quote.phone,
                address: quote.origin || 'N/A'
            },
            
            // Información del destinatario (del formulario)
            receiver: quoteData.receiver,
            
            // Información de pago (valor por defecto)
            paymentMethod: 'pickup',
            
            // Estado y fechas
            status: 'order-pending',
            timestamp: quote.timestamp || firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            
            // Referencia a la cotización original (ahora será el mismo ID)
            quoteId: selectedQuoteId,
            userId: quote.userId || null,
            
            // Items (según tipo de cotización)
            items: quote.packageType === 'Artículo Común' ? 
                quote.commonItems : 
                [quote.customItem]
        };
        
        // 4. Crear la nueva orden en Firestore usando el mismo ID que la cotización
        return db.collection('orders').doc(selectedQuoteId).set(orderData);
    })
    .then(() => {
        alert('¡Orden creada con éxito!');
        document.getElementById('quoteModal').style.display = 'none';
        loadQuotesTable();
        loadOrdersTable();
    })
    .catch(error => {
        console.error("Error en conversión:", error);
        alert('Error: ' + error.message);
    })
    .finally(() => {
        convertBtn.disabled = false;
        convertBtn.innerHTML = 'Convertir a Orden';
    });
}

// Save Quote Changes
function saveQuoteChanges() {
    const quoteId = selectedQuoteId;
    const priceValue = document.getElementById('quotePriceInput').value;
    const receiverData = {
        name: document.getElementById('quoteReceiverName').value,
        phone: document.getElementById('quoteReceiverPhone').value,
        cedula: document.getElementById('quoteReceiverCedula').value,
        address: document.getElementById('quoteReceiverAddress').value,
        province: document.getElementById('quoteReceiverProvince').value
    };
    const additionalNotes = document.getElementById('quoteAdditionalNotes').value;
    
    const updateData = {
        receiver: receiverData,
        additionalNotes: additionalNotes,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Solo actualizamos el precio si se proporcionó un valor válido
    if (priceValue && !isNaN(parseFloat(priceValue))) {
        updateData.estimatedPrice = parseFloat(priceValue);
    }
    
    db.collection('quotes').doc(quoteId).update(updateData)
    .then(() => {
        alert('Cambios guardados correctamente');
        document.getElementById('quoteModal').style.display = 'none';
        loadQuotesTable();
    })
    .catch(error => {
        alert('Error al guardar cambios: ' + error.message);
    });
}

// Save Order Changes
function saveOrderChanges() {
    const orderId = selectedOrderId;
    const newStatus = document.getElementById('modalOrderStatus').value;
    const pickupDate = document.getElementById('modalPickupDate').value;
    const pickupTime = document.getElementById('modalPickupTime').value;
    
    const updateData = {
        status: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Solo actualizar fecha/hora si se proporcionaron valores válidos
    if (pickupDate && pickupTime) {
        updateData['sender.pickupDateTime'] = {
            date: pickupDate,
            time: pickupTime
        };
    }
    
    db.collection('orders').doc(orderId).update(updateData)
    .then(() => {
        alert('Cambios guardados correctamente');
        document.getElementById('orderModal').style.display = 'none';
        refreshOrderTables();
    })
    .catch(error => {
        alert('Error al guardar cambios: ' + error.message);
    });
}

function refreshOrderTables() {
    loadOrdersTable();
    loadRecentOrders();
    loadInTransitTable();
    loadCompletedOrdersTable();
}

// Employee Functions
function editEmployee(employeeId) {
    isEditMode = true;
    selectedEmployeeId = employeeId;
    
    db.collection('employees').doc(employeeId).get().then(doc => {
        if (!doc.exists) {
            alert('Empleado no encontrado');
            return;
        }
        
        const employee = doc.data();
        
        document.getElementById('employeeName').value = employee.name;
        document.getElementById('employeeEmail').value = employee.email;
        document.getElementById('employeePhone').value = employee.phone || '';
        document.getElementById('employeeRole').value = employee.role;
        document.getElementById('employeePassword').required = false;
        document.getElementById('employeeModalTitle').textContent = 'Editar Empleado';
        document.getElementById('employeeModal').style.display = 'flex';
    });
}

function saveEmployee() {
    const employeeData = {
        name: document.getElementById('employeeName').value,
        email: document.getElementById('employeeEmail').value,
        phone: document.getElementById('employeePhone').value,
        role: document.getElementById('employeeRole').value,
        status: 'active',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const password = document.getElementById('employeePassword').value;
    
    if (isEditMode) {
        if (password && password.length >= 6) {
            updateEmployeeWithPassword(selectedEmployeeId, employeeData, password);
        } else {
            db.collection('employees').doc(selectedEmployeeId).update(employeeData)
                .then(() => {
                    alert('Empleado actualizado correctamente');
                    document.getElementById('employeeModal').style.display = 'none';
                    loadEmployeesTable();
                })
                .catch(error => {
                    alert('Error al actualizar: ' + error.message);
                });
        }
    } else {
        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        auth.createUserWithEmailAndPassword(employeeData.email, password)
            .then((userCredential) => {
                employeeData.userId = userCredential.user.uid;
                employeeData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                
                return db.collection('employees').add(employeeData);
            })
            .then(() => {
                alert('Empleado creado correctamente');
                document.getElementById('employeeModal').style.display = 'none';
                loadEmployeesTable();
            })
            .catch(error => {
                alert('Error al crear empleado: ' + error.message);
            });
    }
}

function deleteEmployee(employeeId) {
    if (!confirm('¿Estás seguro de eliminar este empleado? Esta acción no se puede deshacer.')) {
        return;
    }
    
    db.collection('employees').doc(employeeId).get()
        .then(doc => {
            if (!doc.exists) throw new Error('Empleado no encontrado');
            
            const employeeData = doc.data();
            const userId = employeeData.userId;
            
            return db.collection('employees').doc(employeeId).delete()
                .then(() => {
                    if (userId) {
                        return firebase.auth().deleteUser(userId)
                            .catch(error => {
                                console.error('Error eliminando usuario de Auth:', error);
                            });
                    }
                });
        })
        .then(() => {
            alert('Empleado eliminado correctamente');
            loadEmployeesTable();
        })
        .catch(error => {
            alert('Error al eliminar empleado: ' + error.message);
        });
}

function updateEmployeeWithPassword(employeeId, employeeData, newPassword) {
    db.collection('employees').doc(employeeId).get()
        .then(doc => {
            if (!doc.exists) throw new Error('Empleado no encontrado');
            
            const userId = doc.data().userId;
            if (!userId) throw new Error('Este empleado no tiene cuenta de usuario');
            
            const user = firebase.auth().currentUser;
            
            if (user.uid !== userId) {
                return firebase.auth().updateUser(userId, {
                    password: newPassword
                });
            } else {
                throw new Error('No puedes cambiar tu propia contraseña desde aquí');
            }
        })
        .then(() => {
            return db.collection('employees').doc(employeeId).update(employeeData);
        })
        .then(() => {
            alert('Empleado actualizado correctamente');
            document.getElementById('employeeModal').style.display = 'none';
            loadEmployeesTable();
        })
        .catch(error => {
            alert('Error al actualizar: ' + error.message);
        });
}

function resetEmployeePassword(employeeId, email) {
    if (!confirm(`¿Enviar correo de recuperación de contraseña a ${email}?`)) {
        return;
    }
    
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert(`Se ha enviado un correo de recuperación a ${email}. El empleado puede seguir el enlace para establecer una nueva contraseña.`);
        })
        .catch(error => {
            alert('Error al enviar el correo de recuperación: ' + error.message);
            console.error('Error details:', error);
        });
}

// Helper Functions
function getRoleText(role) {
    const roles = {
        'admin': 'Administrador',
        'driver': 'Chofer',
        'warehouse': 'Almacén',
        'customer_service': 'Servicio al Cliente'
    };
    return roles[role] || role;
}

function getStatusBadge(status) {
    const statusMap = {
        'quotes-pending': ['status-pending', 'Cotización Pendiente'],
        'order-pending': ['status-pending', 'Pendiente'],
        'pending': ['status-pending', 'Pendiente'],
        'processing': ['status-processing', 'Procesando'],
        'completed': ['status-completed', 'Completado'],
        'cancelled': ['status-cancelled', 'Cancelado'],
        'shipped': ['status-shipped', 'Enviado'],
        'processed': ['status-completed', 'Procesada'],
        'rejected': ['status-cancelled', 'Rechazada'],
        'converted': ['status-completed', 'Convertida'],
        'recogidaUSA': ['status-processing', 'Recogida USA'],
        'enTransito': ['status-processing', 'En Tránsito'],
        'enAduana': ['status-processing', 'En Aduana'],
        'repartoLocal': ['status-processing', 'Reparto Local']
    };
    
    const [badgeClass, badgeText] = statusMap[status] || ['status-pending', status];
    return `<span class="status-badge ${badgeClass}">${badgeText}</span>`;
}

function getPaymentMethodText(method) {
    const methods = {
        'online': 'En línea',
        'pickup': 'Al recoger',
        'delivery': 'Al recibir (RD)'
    };
    return methods[method] || method;
}

// Logout
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => {
        alert('Error al cerrar sesión: ' + error.message);
    });
}

// Initialize DataTables
function initDataTables() {
    const commonOptions = {
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
        }
    };
    
    const exportOptions = {
        dom: 'Bfrtip',
        buttons: ['excel', 'print'],
        ...commonOptions
    };
    
    // Orders table
    $('#ordersTable').DataTable(exportOptions);
    
    // Quotes table
    $('#quotesTable').DataTable(exportOptions);
    
    // Customers table
    $('#customersTable').DataTable(exportOptions);
    
    // Employees table
    $('#employeesTable').DataTable(commonOptions);
    
    // In Transit table
    $('#inTransitTable').DataTable(commonOptions);
    
    // Completed Orders table
    $('#completedOrdersTable').DataTable(exportOptions);
    
    // Services table
    $('#servicesTable').DataTable(commonOptions);
    
    // Products table
    $('#productsTable').DataTable(commonOptions);
    
    // Recent Orders table (dashboard)
    $('#recentOrdersTable').DataTable(commonOptions);
}

//1