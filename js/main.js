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
        async function handleQuoteSubmission(e) {
            e.preventDefault();

            // Show loading indicator
            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                // Collect form data
                const formData = collectFormData();

                // Validate data
                if (!validateFormData(formData)) {
                    throw new Error('Please fill all required fields');
                }

                // Save to Firestore
                const docRef = await db.collection('quotes').add({
                    ...formData,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'pending',
                    userId: currentUser ? currentUser.uid : null,
                    userEmail: currentUser ? currentUser.email : formData.email
                });

                console.log('Quote saved with ID: ', docRef.id);

                // Reset form
                quoteForm.reset();
                customPackageDiv.classList.remove('show');

                // Show success modal
                showModal(successModal);

                // Update user profile if logged in
                if (currentUser) {
                    await updateUserProfile(formData);
                }

            } catch (error) {
                console.error('Error submitting quote:', error);
                alert('Error submitting quote: ' + error.message);
            } finally {
                // Restore button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }

        // Collect form data
        function collectFormData() {
            const packageType = document.querySelector('input[name="package"]:checked').value;

            // Basic data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
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
                        formData.commonItems = items.map(item => ({
                            ...item,
                            weight: parseFloat(item.weight) || 0
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
            document.getElementById('registerUserBtn').textContent = 'Register';
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

            if (!email || !password) {
                messageDiv.textContent = 'Please enter email and password';
                return;
            }

            try {
                // Show loading indicator
                const loginBtn = document.getElementById('loginUserBtn');
                const originalText = loginBtn.textContent;
                loginBtn.textContent = 'Logging in...';
                loginBtn.disabled = true;

                await auth.signInWithEmailAndPassword(email, password);
                messageDiv.style.color = 'var(--success)';
                messageDiv.textContent = 'Login successful!';

                // Close modal after short delay
                setTimeout(() => {
                    closeModals();
                }, 1500);
            } catch (error) {
                messageDiv.textContent = getAuthErrorMessage(error.code);
                console.error('Login error:', error);
            } finally {
                // Restore button
                const loginBtn = document.getElementById('loginUserBtn');
                if (loginBtn) {
                    loginBtn.textContent = originalText;
                    loginBtn.disabled = false;
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
                registerBtn.textContent = 'Complete Registration';
                registerBtn.style.backgroundColor = 'var(--secondary)';
                registerBtn.style.color = 'white';
                registerBtn.style.border = 'none';
                showLoginBtn.style.display = 'inline-block';
                return; // Exit without trying to register
            }

            // Proceed with registration if fields are visible
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            const fullName = document.getElementById('fullName').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            const address = document.getElementById('address').value;
            const termsChecked = document.getElementById('termsCheckbox').checked;
            const messageDiv = document.getElementById('authMessage');

            // Validations
            if (!email || !password || !fullName || !phoneNumber || !address) {
                messageDiv.textContent = 'Please complete all fields';
                return;
            }

            if (!termsChecked) {
                messageDiv.textContent = 'You must accept the terms and conditions';
                return;
            }

            if (password.length < 6) {
                messageDiv.textContent = 'Password must be at least 6 characters';
                return;
            }

            try {
                // Show loading indicator
                const originalText = registerBtn.textContent;
                registerBtn.textContent = 'Registering...';
                registerBtn.disabled = true;

                // Create user
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);

                // Create user document
                await db.collection('users').doc(userCredential.user.uid).set({
                    email: email,
                    registrationDate: firebase.firestore.FieldValue.serverTimestamp(),
                    profile: {
                        name: fullName,
                        phone: phoneNumber,
                        address: address
                    },
                    termsAccepted: true,
                    termsAcceptanceDate: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Show success message
                messageDiv.style.color = 'var(--success)';
                messageDiv.textContent = 'Registration successful! Logging in...';

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

        // UI Functions
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
                    return 'User not found';
                case 'auth/wrong-password':
                    return 'Incorrect password';
                case 'auth/email-already-in-use':
                    return 'This email is already registered';
                case 'auth/weak-password':
                    return 'Password is too weak (minimum 6 characters)';
                case 'auth/invalid-email':
                    return 'Invalid email';
                case 'auth/too-many-requests':
                    return 'Too many attempts. Please try again later';
                default:
                    return 'Authentication error. Please try again';
            }
        }