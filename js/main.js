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

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

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
        "heroTitle": "Envíos seguros de USA a República Dominicana",
        "heroText": "Especializados en el envío de cajas y tanques azules desde Nueva York a todo el territorio dominicano. Confiabilidad, rapidez y transparencia en cada envío.",
        "quoteBtn": "Solicitar Cotización",
        "servicesBtn": "Nuestros Servicios",
        "EstadosUnidos": "Estados Unidos",
        "RD": "República Dominicana",
        "NY": "Nueva York, NY",
        "TodoPais": "Todo el país",
        "rastreo": "Rastreo",
    },
    en: {
        "inicio": "Home",
        "servicios": "Services",
        "cotizacion": "Quote",
        "contacto": "Contact",
        "login": "Login",
        "logout": "Logout",
        "heroTitle": "Secure shipping from USA to Dominican Republic",
        "heroText": "Specialized in shipping boxes and blue tanks from New York to all Dominican territory. Reliability, speed and transparency in every shipment.",
        "quoteBtn": "Request Quote",
        "EstadosUnidos": "United States",
        "RD": "Dominican Republic",
        "NY": "New York, NY",
        "TodoPais": "The whole country",
        "rastreo": "Tracking",
    }
};

let currentLanguage = 'es'; // Default language

function changeLanguage(lang) {
    currentLanguage = lang;
    document.getElementById('languageSelector').value = lang;

    // Update texts
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

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

// Modifica la función loadCommonItems así:
async function loadCommonItems() {
    const container = document.getElementById('commonItemsContainer');
    container.innerHTML = '<p>Cargando artículos...</p>';

    const selectedItemsContainer = document.createElement('div');
    selectedItemsContainer.className = 'selected-items-container';
    container.parentNode.insertBefore(selectedItemsContainer, container.nextSibling);

    try {
        const snapshot = await db.collection('CommonItems').get();

        if (snapshot.empty) {
            container.innerHTML = '<p>No hay artículos disponibles</p>';
            return;
        }

        container.innerHTML = '';

        snapshot.forEach(doc => {
            const item = doc.data();
            const btn = document.createElement('button');
            btn.className = 'common-item-btn';
            btn.type = 'button';
            btn.dataset.id = doc.id;

            // Formatear dimensiones si es un array
            let dimensionsText = item.dimensions;
            if (Array.isArray(item.dimensions)) {
                dimensionsText = item.dimensions.join('" x ') + '"';
            }

            // Mostrar peso si existe
            const weightText = item.weight ? `${item.weight} lbs` : 'N/A';

            btn.innerHTML = `
                <img src="${item.icon}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain;">
                <span class="item-name">${item.name}</span>
                <span class="item-dimensions">${dimensionsText}</span>
                <span class="item-weight">${weightText}</span>
            `;

            btn.addEventListener('click', () => {
                const existingItem = selectedItemsContainer.querySelector(`[data-id="${doc.id}"]`);

                if (existingItem) {
                    // Si ya existe, lo removemos
                    existingItem.remove();
                    btn.classList.remove('selected');
                    updateSelectedItemsField(selectedItemsContainer);
                    return;
                }

                // Agregamos la clase selected al botón
                btn.classList.add('selected');

                const selectedItem = document.createElement('div');
                selectedItem.className = 'selected-item';
                selectedItem.dataset.id = doc.id;

                // Obtener dimensiones predeterminadas
                const defaultDims = Array.isArray(item.dimensions) ? item.dimensions : [0, 0, 0];
                const defaultWeight = item.weight || 0;

                selectedItem.innerHTML = `
                    <img src="${item.icon}" alt="${item.name}">
                    <div class="item-info">
                        <span id="item-info-name">${item.name}</span>
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
                                <span class="remove-item" onclick="removeSelectedItem('${doc.id}')">×</span>
                            </div>
                        </div>
                    </div>
                `;

                // Agregar event listeners para los inputs
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
    } catch (error) {
        console.error('Error loading common items:', error);
        container.innerHTML = '<p>Error al cargar los artículos</p>';
    }
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
    document.getElementById('country')?.addEventListener('change', function() {
        loadStates(this.value, 'state');
    });
    
    document.getElementById('profileCountry')?.addEventListener('change', function() {
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
document.getElementById('authForm').addEventListener('keypress', function(e) {
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

    // Load saved language or detect browser language
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const browserLanguage = navigator.language.split('-')[0];
    const initialLanguage = savedLanguage || (browserLanguage === 'es' ? 'es' : 'en');
    changeLanguage(initialLanguage);

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

// Handle quote form submission
// Modificar la función handleQuoteSubmission para guardar en subcolección de usuario
// Modificar la función handleQuoteSubmission para guardar con status "quotes-pending"
async function handleQuoteSubmission(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        const formData = await collectFormData();
        
        if (!validateFormData(formData)) {
            throw new Error('Please fill all required fields');
        }

        // Generar el ID único usando la nueva función
        const orderId = await generateId('mt');
        
        // Crear objeto de orden con status "quotes-pending"
        const orderData = {
            ...formData,
            orderId: orderId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'quotes-pending',
            estimatedPrice: calculateEstimatedPrice(formData.packageType, formData.commonItems || formData.customItem)
        };

        // Si el usuario está autenticado, agregar su ID
        if (currentUser) {
            orderData.userId = currentUser.uid;
        }

        // Guardar en la colección principal de quotes
        await db.collection('quotes').doc(orderId).set(orderData);

        // Si el usuario está autenticado, guardar también en su subcolección
        if (currentUser) {
            await db.collection('users').doc(currentUser.uid).collection('orders').doc(orderId).set(orderData);
            await updateUserProfile(formData);
        }

        quoteForm.reset();
        customPackageDiv.classList.remove('show');
        showModal(successModal);

    } catch (error) {
        console.error('Error submitting quote:', error);
        alert('Error submitting quote: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
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

    // Obtener el número de teléfono limpio (con código de país pero sin formato)
    const phoneInput = document.getElementById('phone');
    const cleanPhone = window.getCleanPhoneNumber(phoneInput);

    // Basic data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: cleanPhone,  // <-- Usamos el número limpio aquí
        packageType: packageType,
        origin: document.getElementById('origin').value.trim(),
        destination: document.getElementById('destination').value.trim(),
        message: document.getElementById('message').value.trim()
    };

    // If it's a common item
    if (packageType === 'Artículo Común') {
        try {
            const commonItemsValue = document.getElementById('commonItemType').value;
            if (commonItemsValue) {
                const items = JSON.parse(commonItemsValue);

                // Obtener los artículos comunes de Firestore para incluir los iconos
                const snapshot = await db.collection('CommonItems').get();
                const commonItemsData = {};
                snapshot.forEach(doc => {
                    commonItemsData[doc.id] = doc.data();
                });

                formData.commonItems = items.map(item => ({
                    ...item,
                    weight: parseFloat(item.weight) || 0,
                    icon: commonItemsData[item.id]?.icon || '' // Incluir el icono en base64
                }));
            }
        } catch (e) {
            console.error('Error parsing common items:', e);
        }
    }
    // If it's a custom package
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

// Update user profile
async function updateUserProfile(formData) {
    if (!currentUser) return;

    try {
        await db.collection('users').doc(currentUser.uid).update({
            'profile.name': formData.name,
            'profile.phone': formData.phone,
            lastActivity: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

// En la función updateUIForLoggedInUser, añade el event listener para el modal de perfil
function updateUIForLoggedInUser(user) {
    loginBtn.style.display = 'none';
    userProfile.style.display = 'inline-block';
    logoutBtn.style.display = 'inline-block';

    // Get user data
    db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
            const userData = doc.data();
            const fullName = userData.profile?.name || user.email;
            const firstName = fullName.split(' ')[0];

            // If user has Google photo, show it
            if (user.photoURL) {
                userProfile.innerHTML = `<img src="${user.photoURL}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 5px; vertical-align: middle;"> ${firstName}`;
            } else {
                userProfile.textContent = firstName;
            }

            // Set click event for profile modal
            userProfile.addEventListener('click', () => {
                showProfileModal(user.uid);
            });
        } else {
            // If no data in Firestore but user has Google photo
            if (user.photoURL) {
                userProfile.innerHTML = `<img src="${user.photoURL}" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 5px; vertical-align: middle;"> ${user.email.split('@')[0]}`;
            } else {
                userProfile.textContent = user.email.split('@')[0];
            }
        }
    }).catch(error => {
        console.error("Error getting user data:", error);
        userProfile.textContent = user.email.split('@')[0];
    });
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