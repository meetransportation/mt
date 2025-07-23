const secondaryAuth = firebase.initializeApp(firebase.app().options, "Secondary").auth();

// Agrega esta función al inicio del archivo para inicializar el input de teléfono
function initEmployeePhoneInput() {
    const phoneInput = document.getElementById('employeePhone');
    window.employeePhoneIti = window.intlTelInput(phoneInput, {
        preferredCountries: ['us', 'do'],
        separateDialCode: true,
        initialCountry: 'us',
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
    });

    // Formato de guiones mientras escribe
    phoneInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        let formatted = value.substring(0, 3);
        if (value.length > 3) formatted += '-' + value.substring(3, 6);
        if (value.length > 6) formatted += '-' + value.substring(6, 10);
        this.value = formatted;
    });
}

function validatePasswords() {
    const password = document.getElementById('employeePassword').value;
    const confirmPassword = document.getElementById('employeePasswordConfirm').value;
    const feedbackElement = document.getElementById('passwordMatchFeedback');
    const saveBtn = document.getElementById('saveEmployee');
    
    if (password === '' || confirmPassword === '') {
        feedbackElement.textContent = '';
        saveBtn.disabled = true;
        return false;
    }
    
    if (password === confirmPassword && password.length >= 6) {
        feedbackElement.textContent = '✓ Coincide';
        feedbackElement.style.color = '#28a745'; // Verde
        saveBtn.disabled = false;
        return true;
    } else {
        feedbackElement.textContent = '✗ No coincide';
        feedbackElement.style.color = '#dc3545'; // Rojo
        saveBtn.disabled = true;
        return false;
    }
}

// Modifica la función initEmployeeModal para incluir los event listeners
function initEmployeeModal() {
    document.getElementById('addEmployee').addEventListener('click', () => {
        isEditMode = false;
        selectedEmployeeId = null;
        document.getElementById('employeeForm').reset();
        document.getElementById('employeePassword').required = true;
        document.getElementById('employeePasswordConfirm').required = true;
        document.getElementById('employeeModalTitle').textContent = 'Agregar Nuevo Empleado';
        document.getElementById('employeeModal').style.display = 'flex';
        
        // Resetear el input de teléfono
        window.employeePhoneIti.setCountry('us');
        document.getElementById('employeePhone').value = '';
        
        // Resetear feedback de contraseña
        document.getElementById('passwordMatchFeedback').textContent = '';
        
        // Mostrar campos de contraseña en modo agregar
        document.getElementById('employeePassword').parentElement.parentElement.style.display = '';
        document.getElementById('employeePasswordConfirm').parentElement.parentElement.style.display = '';
        
        // Habilitar email en modo agregar
        document.getElementById('employeeEmail').disabled = false;
    });

    // Agregar event listener para cerrar el modal
    document.querySelector('#employeeModal .close-modal').addEventListener('click', function() {
        document.getElementById('employeeModal').style.display = 'none';
    });

    // Event listeners para validación de contraseñas en tiempo real
    document.getElementById('employeePassword').addEventListener('input', validatePasswords);
    document.getElementById('employeePasswordConfirm').addEventListener('input', validatePasswords);
    
    document.getElementById('saveEmployee').addEventListener('click', saveEmployee);
    
    // Inicializar el input de teléfono
    initEmployeePhoneInput();
    
    // Agregar botón de reset de contraseña al modal
    addResetPasswordButton();
}

function addResetPasswordButton() {
    const passwordSection = document.querySelector('#emple_div2 .detail-section');
    
    // Crear botón de reset de contraseña
    const resetBtn = document.createElement('button');
    resetBtn.id = 'resetPasswordBtn';
    resetBtn.className = 'btn btn-outline';
    resetBtn.innerHTML = '<i class="fas fa-key"></i> Enviar recuperación de contraseña';
    resetBtn.style.marginTop = '15px';
    
    // Agregar evento al botón
    resetBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('employeeEmail').value;
        if (email) {
            if (confirm(`¿Enviar correo de recuperación de contraseña a ${email}?`)) {
                firebase.auth().sendPasswordResetEmail(email)
                    .then(() => {
                        showToast('Correo de recuperación enviado correctamente', 'success');
                    })
                    .catch(error => {
                        showToast('Error al enviar correo: ' + error.message, 'error');
                    });
            }
        } else {
            showToast('No hay un correo electrónico válido', 'error');
        }
    });
    
    // Agregar botón al modal
    const passwordContainer = document.getElementById('emple_div2');
    passwordContainer.appendChild(resetBtn);
    
    // Ocultar el botón inicialmente (se mostrará solo en modo edición)
    resetBtn.style.display = 'none';
}

// Refresh Buttons
function loadAdminProfile(user) {
    // Mostrar el correo del usuario
    document.getElementById('adminEmail').textContent = user.email || 'Usuario';

    // Obtener el rol del usuario desde Firestore
    db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
            const userData = doc.data();
            const role = userData.role || 'Empleado';
            document.getElementById('adminRole').textContent = getRoleText(role);
        } else {
            document.getElementById('adminRole').textContent = 'Empleado';
        }
    }).catch(error => {
        console.error("Error al obtener datos del usuario:", error);
        document.getElementById('adminRole').textContent = 'Empleado';
    });

    // Eliminar la imagen de perfil si existe en el DOM
    const adminPhoto = document.getElementById('adminPhoto');
    if (adminPhoto) {
        adminPhoto.remove();
    }
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
    return new Promise((resolve, reject) => {
        handleTableLoading('customersTable', () => {
            return new Promise((innerResolve, innerReject) => {
                const table = $('#customersTable').DataTable();
                table.clear().draw();

                // Escuchar cambios en tiempo real
                const unsubscribe = db.collection('users')
                    .orderBy('registrationDate', 'desc')
                    .onSnapshot(snapshot => {
                        table.clear();
                        snapshot.forEach(doc => {
                            const user = doc.data();
                            
                            // Verificar si el usuario NO tiene el campo isEmployee
                            if (!('isEmployee' in user)) {
                                const date = user.registrationDate?.toDate().toLocaleString() || 'N/A';
                                
                                table.row.add([
                                    doc.id,
                                    user.profile?.name || 'N/A',
                                    user.email,
                                    formatPhoneNumber(user.profile?.phone || 'N/A'),
                                    date,
                                    user.orderCount || 0,
                                    `<button class="btn btn-outline view-customer" data-id="${doc.id}">Ver</button>`
                                ]).draw(false);
                            }
                        });
                    }, error => {
                        console.error("Error en tiempo real (Clientes):", error);
                        innerReject(error);
                    });

                window.customersUnsubscribe = unsubscribe;
                innerResolve();
            });
        });
    });
}



// Nueva versión de loadEmployeesTable con actualización en tiempo real
function loadEmployeesTable() {
    return new Promise((resolve, reject) => {
        handleTableLoading('employeesTable', () => {
            return new Promise((innerResolve, innerReject) => {
                // Verificar si la tabla ya está inicializada y destruirla si es necesario
                if ($.fn.DataTable.isDataTable('#employeesTable')) {
                    $('#employeesTable').DataTable().destroy();
                }

                // Configuración de DataTables sin paginación y mostrando todos los registros
                const table = $('#employeesTable').DataTable({
                    paging: false,
                    info: true,
                    searching: true,
                    language: {
                        info: "Total: _TOTAL_ empleados",
                        infoEmpty: "No hay empleados registrados",
                        infoFiltered: "(filtrado de _MAX_ empleados totales)",
                        search: "",
                         searchPlaceholder: "Buscar...", 
                        zeroRecords: "No se encontraron empleados"
                    },
                    dom: '<"top"f>rt<"bottom"i>',
                    order: [[1, 'asc']]
                });

                // Obtener el ID del usuario actual
                const currentUserId = auth.currentUser?.uid;

                // Escuchar cambios en tiempo real
                const unsubscribe = db.collection('users')
                    .where('isEmployee', '==', true)
                    .orderBy('registrationDate', 'desc')
                    .onSnapshot(snapshot => {
                        table.clear();
                        snapshot.forEach(doc => {
                            const user = doc.data();
                            const roleMap = {
                                'admin': 'Administrador',
                                'driver': 'Chofer',
                                'warehouse': 'Almacén',
                                'customer_service': 'Servicio al Cliente'
                            };

                            // Determinar si es el usuario actual
                            const isCurrentUser = doc.id === currentUserId;

                            table.row.add([
                                doc.id,
                                user.profile?.name || 'N/A',
                                user.email,
                                formatPhoneNumber(user.profile?.phone || 'N/A'),
                                roleMap[user.role] || user.role,
                                isCurrentUser ? 
                                    '<span class="status-badge status-current-user">Yo</span>' :
                                    user.status === 'active' ? 
                                        '<span class="status-badge status-completed">Activo</span>' : 
                                        '<span class="status-badge status-cancelled">Inactivo</span>',
                                `<button class="btn btn-outline edit-employee" data-id="${doc.id}">Editar</button>`
                            ]).draw(false);
                        });

                        // Añadir los event listeners después de cargar los datos
                        addEmployeeHandlers();
                    }, error => {
                        console.error("Error en tiempo real (Empleados):", error);
                        innerReject(error);
                    });

                window.employeesUnsubscribe = unsubscribe;
                innerResolve();
            });
        });
    });
}

function addEmployeeHandlers() {
    // Usar delegación de eventos para los botones de edición
    $(document).on('click', '.edit-employee', function() {
        editEmployee($(this).data('id'));
    });

    // Si tienes otros botones, añade sus handlers aquí
    $(document).on('click', '.delete-employee', function() {
        deleteEmployee($(this).data('id'));
    });

    $(document).on('click', '.reset-password', function() {
        resetEmployeePassword($(this).data('id'), $(this).data('email'));
    });
}

// View Order Details
function editEmployee(employeeId) {
    isEditMode = true;
    selectedEmployeeId = employeeId;

    db.collection('users').doc(employeeId).get().then(doc => {
        if (!doc.exists) {
            alert('Empleado no encontrado');
            return;
        }

        const employee = doc.data();

        // Llenar el formulario con los datos del empleado
        document.getElementById('employeeName').value = employee.profile?.name || '';
        document.getElementById('employeeEmail').value = employee.email;
        
        // Configurar el teléfono
        const phone = employee.profile?.phone || '';
        if (phone) {
            // Si el número comienza con +1 (USA), formatear con guiones
            if (phone.startsWith('+1')) {
                const cleaned = phone.replace(/\D/g, '').substring(1); // Quitar el +1
                document.getElementById('employeePhone').value = 
                    cleaned.substring(0, 3) + '-' + 
                    cleaned.substring(3, 6) + '-' + 
                    cleaned.substring(6, 10);
                window.employeePhoneIti.setCountry('us');
            } 
            // Si es un número de RD
            else if (phone.startsWith('+1')) {
                const cleaned = phone.replace(/\D/g, '').substring(1); // Quitar el +1
                document.getElementById('employeePhone').value = 
                    cleaned.substring(0, 3) + '-' + 
                    cleaned.substring(3, 6) + '-' + 
                    cleaned.substring(6, 10);
                window.employeePhoneIti.setCountry('do');
            } 
            // Para otros formatos
            else {
                document.getElementById('employeePhone').value = phone;
            }
        }

        document.getElementById('employeeRole').value = employee.role || 'customer_service';

        // Configurar campo de contraseña
        const passwordInput = document.getElementById('employeePassword');
        passwordInput.required = false;
        passwordInput.disabled = true;
        passwordInput.placeholder = "Dejar en blanco para no cambiar";

        document.getElementById('employeeModalTitle').textContent = 'Editar Empleado';
        document.getElementById('employeeModal').style.display = 'flex';
    }).catch(error => {
        console.error("Error al cargar empleado:", error);
        alert('Error al cargar datos del empleado: ' + error.message);
    });
}



// Modifica la función saveEmployee para verificar primero si el usuario existe
function saveEmployee() {
    if (!isEditMode && !validatePasswords()) {
        showToast('Las contraseñas no coinciden o son demasiado cortas', 'error');
        return;
    }

    const email = document.getElementById('employeeEmail').value.toLowerCase();
    const name = document.getElementById('employeeName').value;
    const phone = window.employeePhoneIti.getNumber(intlTelInputUtils.numberFormat.E164);
    const role = document.getElementById('employeeRole').value;
    const password = document.getElementById('employeePassword')?.value || '';

    const profileData = {
        name: name,
        phone: phone.replace(/[-\s]/g, ''), // Eliminar guiones y espacios
        address: ''
    };

    const employeeData = {
        email: email,
        profile: profileData,
        role: role,
        status: 'active',
        isEmployee: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Mostrar indicador de carga
    const saveBtn = document.getElementById('saveEmployee');
    const originalBtnText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    // Función para restablecer el botón
    const resetButton = () => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalBtnText;
    };

    if (isEditMode) {
        // Modo edición - solo actualizar datos básicos
        db.collection('users').doc(selectedEmployeeId).update(employeeData)
            .then(() => {
                showToast('Empleado actualizado correctamente', 'success');
                document.getElementById('employeeModal').style.display = 'none';
                loadEmployeesTable();
                resetButton();
            })
            .catch(error => {
                console.error("Error al actualizar empleado:", error);
                showToast('Error al actualizar empleado: ' + error.message, 'error');
                resetButton();
            });
    } else {
        // Lógica para nuevo empleado
        checkUserExists(email).then(result => {
            if (result.exists) {
                document.getElementById('employeePassword').disabled = true;
                document.getElementById('employeePasswordConfirm').disabled = true;
                document.getElementById('employeePassword').placeholder = "No necesario (usuario existente)";
                document.getElementById('employeePasswordConfirm').placeholder = "No necesario (usuario existente)";

                const confirmMessage = `El usuario ${email} ya existe. ¿Deseas convertirlo en empleado?`;

                if (!confirm(confirmMessage)) {
                    document.getElementById('employeePassword').disabled = false;
                    document.getElementById('employeePasswordConfirm').disabled = false;
                    document.getElementById('employeePassword').placeholder = "";
                    document.getElementById('employeePasswordConfirm').placeholder = "";
                    resetButton();
                    return;
                }

                updateExistingUserToEmployee(employeeData)
                    .then(() => {
                        showToast('Usuario convertido a empleado correctamente', 'success');
                        document.getElementById('employeeModal').style.display = 'none';
                        loadEmployeesTable();
                        resetButton();
                    })
                    .catch(error => {
                        console.error("Error al convertir usuario:", error);
                        showToast('Error al convertir usuario: ' + error.message, 'error');
                        resetButton();
                    });
            } else {
                if (password.length < 6) {
                    showToast('La contraseña debe tener al menos 6 caracteres', 'error');
                    resetButton();
                    return;
                }

                createNewEmployee(employeeData, password)
                    .then(() => {
                        showToast('Empleado creado correctamente', 'success');
                        document.getElementById('employeeModal').style.display = 'none';
                        loadEmployeesTable();
                        resetButton();
                    })
                    .catch(error => {
                        console.error("Error al crear empleado:", error);
                        showToast('Error al crear empleado: ' + error.message, 'error');
                        resetButton();
                    });
            }
        }).catch(error => {
            console.error("Error verificando usuario:", error);
            showToast('Error al verificar usuario: ' + error.message, 'error');
            resetButton();
        });
    }
}


// Función para verificar si un usuario ya existe
// Función para verificar si un usuario ya existe y obtener sus datos
function checkUserExists(email) {
    return db.collection('users')
        .where('email', '==', email.toLowerCase())
        .get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                return { exists: false };
            } else {
                const userData = querySnapshot.docs[0].data();
                return {
                    exists: true,
                    data: userData
                };
            }
        });
}

// Función para actualizar usuario existente a empleado
function updateExistingUserToEmployee(employeeData) {
    return new Promise((resolve, reject) => {
        db.collection('users')
            .where('email', '==', employeeData.email.toLowerCase())
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty) throw new Error('Usuario no encontrado');

                const userId = querySnapshot.docs[0].id;
                const updateData = {
                    isEmployee: true,
                    role: employeeData.role,
                    status: 'active',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    'profile.name': employeeData.profile.name,
                    'profile.phone': employeeData.profile.phone
                };

                // Si el usuario no tiene registrationDate, lo añadimos
                if (!querySnapshot.docs[0].data().registrationDate) {
                    updateData.registrationDate = firebase.firestore.FieldValue.serverTimestamp();
                }

                return db.collection('users').doc(userId).update(updateData);
            })
            .then(() => {
                alert(`Usuario ${employeeData.email} convertido a empleado correctamente`);
                document.getElementById('employeeModal').style.display = 'none';
                loadEmployeesTable();
                resolve();
            })
            .catch(error => {
                console.error("Error al convertir usuario:", error);
                reject(error);
            });
    });
}

// Función para crear nuevo empleado (mantén tu lógica existente)
function createNewEmployee(employeeData, password) {
    return new Promise((resolve, reject) => {
        if (password.length < 6) {
            reject(new Error('La contraseña debe tener al menos 6 caracteres'));
            return;
        }

        secondaryAuth.createUserWithEmailAndPassword(employeeData.email, password)
            .then((userCredential) => {
                employeeData.userId = userCredential.user.uid;
                employeeData.registrationDate = firebase.firestore.FieldValue.serverTimestamp();
                return db.collection('users').doc(userCredential.user.uid).set(employeeData);
            })
            .then(() => {
                alert('Empleado creado correctamente');
                document.getElementById('employeeModal').style.display = 'none';
                loadEmployeesTable();
                resolve();
            })
            .catch(error => {
                console.error("Error al crear empleado:", error);
                reject(error);
            })
            .finally(() => {
                secondaryAuth.signOut(); // limpia la sesión secundaria
            });
    });
}


// Agrega un event listener para el campo de email que verifique si el usuario existe
document.getElementById('employeeEmail')?.addEventListener('blur', function () {
    if (isEditMode) return; // No verificar en modo edición

    const email = this.value.toLowerCase();
    if (!email) return;

    checkUserExists(email).then(result => {
        const passwordInput = document.getElementById('employeePassword');
        const nameInput = document.getElementById('employeeName');
        const phoneInput = document.getElementById('employeePhone');

        if (result.exists) {
            // Deshabilitar campo de contraseña
            passwordInput.disabled = true;
            passwordInput.placeholder = "No necesario (usuario existente)";
            passwordInput.value = ""; // Limpiar el valor por seguridad

            // Autocompletar campos con los datos del usuario
            if (result.data.profile) {
                nameInput.value = result.data.profile.name || '';
                phoneInput.value = result.data.profile.phone || '';
            }
        } else {
            // Restaurar campos si el usuario no existe
            passwordInput.disabled = false;
            passwordInput.placeholder = "";
            passwordInput.required = true;

            // Limpiar campos (opcional, dependiendo de tu flujo)
            // nameInput.value = '';
            // phoneInput.value = '';
        }
    }).catch(error => {
        console.error("Error verificando usuario:", error);
    });
});


// En la función editEmployee, actualiza cómo se llenan los campos:
function editEmployee(employeeId) {
    isEditMode = true;
    selectedEmployeeId = employeeId;

    db.collection('users').doc(employeeId).get().then(doc => {
        if (!doc.exists) {
            alert('Empleado no encontrado');
            return;
        }

        const employee = doc.data();

        // Llenar el formulario con los datos del empleado
        document.getElementById('employeeName').value = employee.profile?.name || '';
        document.getElementById('employeeEmail').value = employee.email;
        document.getElementById('employeeEmail').disabled = true; // Deshabilitar edición de email
        
        // Configurar el teléfono
        const phone = employee.profile?.phone || '';
        if (phone) {
            // Extraer el código de país y el número
            let countryCode = 'us'; // Por defecto USA
            let nationalNumber = phone;
            
            // Si el número comienza con +1 (USA o RD)
            if (phone.startsWith('+1')) {
                nationalNumber = phone.substring(2); // Quitar el +1
                // Verificar si es RD (basado en los primeros dígitos)
                if (nationalNumber.startsWith('809') || nationalNumber.startsWith('829') || nationalNumber.startsWith('849')) {
                    countryCode = 'do';
                }
            }
            
            // Formatear el número nacional con guiones
            let formattedNumber = nationalNumber.replace(/\D/g, '');
            if (formattedNumber.length >= 3) {
                formattedNumber = formattedNumber.substring(0, 3) + '-' + formattedNumber.substring(3);
                if (formattedNumber.length > 7) {
                    formattedNumber = formattedNumber.substring(0, 7) + '-' + formattedNumber.substring(7);
                }
            }
            
            // Configurar el input de teléfono
            window.employeePhoneIti.setCountry(countryCode);
            document.getElementById('employeePhone').value = formattedNumber;
        } else {
            window.employeePhoneIti.setCountry('us');
            document.getElementById('employeePhone').value = '';
        }

        document.getElementById('employeeRole').value = employee.role || 'customer_service';

        // Ocultar campos de contraseña y mostrar botón de reset
        document.getElementById('employeePassword').parentElement.parentElement.style.display = 'none';
        document.getElementById('employeePasswordConfirm').parentElement.parentElement.style.display = 'none';

        // Mostrar el botón de reset de contraseña
        document.getElementById('resetPasswordBtn').style.display = 'block';

        document.getElementById('employeeModalTitle').textContent = 'Editar Empleado';
        document.getElementById('employeeModal').style.display = 'flex';
    }).catch(error => {
        console.error("Error al cargar empleado:", error);
        alert('Error al cargar datos del empleado: ' + error.message);
    });
}


// En la función deleteEmployee, cambia la referencia a la colección:
function deleteEmployee(employeeId) {
    if (!confirm('¿Estás seguro de desactivar este empleado? El usuario permanecerá en el sistema pero ya no tendrá acceso como empleado.')) {
        return;
    }

    db.collection('users').doc(employeeId).update({
        isEmployee: false,
        status: 'inactive',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            alert('Empleado desactivado correctamente');
            loadEmployeesTable();
        })
        .catch(error => {
            alert('Error al desactivar empleado: ' + error.message);
            console.error('Error details:', error);
        });
}

// En la función updateEmployeeWithPassword, cambia la referencia a la colección:
function updateEmployeeWithPassword(employeeId, employeeData, newPassword) {
    db.collection('users').doc(employeeId).get()
        .then(doc => {
            if (!doc.exists) throw new Error('Empleado no encontrado');

            const userId = doc.data().userId || employeeId;

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
            return db.collection('users').doc(employeeId).update(employeeData);
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
        'admin_usa': 'Administrador USA',
        'admin_rd': 'Administrador RD',
        'driver_usa': 'Chofer USA',
        'driver_rd': 'Chofer RD',
        'warehouse_usa': 'Almacén USA',
        'warehouse_rd': 'Almacén RD',
        'customer_service_usa': 'Servicio al Cliente USA',
        'customer_service_rd': 'Servicio al Cliente RD'
    };
    return roles[role] || role;
}

// En el formulario de empleados (initEmployeeModal o donde se defina el select)
document.getElementById('employeeRole').innerHTML = `
    <option value="admin_usa">Administrador USA</option>
    <option value="admin_rd">Administrador RD</option>
    <option value="driver_usa">Chofer USA</option>
    <option value="driver_rd">Chofer RD</option>
    <option value="warehouse_usa">Almacén USA</option>
    <option value="warehouse_rd">Almacén RD</option>
    <option value="customer_service_usa">Servicio al Cliente USA</option>
    <option value="customer_service_rd">Servicio al Cliente RD</option>
`;

