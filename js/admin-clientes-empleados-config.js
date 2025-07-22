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
    });

    document.getElementById('saveEmployee').addEventListener('click', saveEmployee);
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
                    .where('isCustomer', '==', true)
                    .orderBy('createdAt', 'desc')
                    .onSnapshot(snapshot => {
                        table.clear();
                        snapshot.forEach(doc => {
                            const user = doc.data();
                            const date = user.createdAt?.toDate().toLocaleString() || 'N/A';
                            
                            table.row.add([
                                doc.id,
                                user.profile?.name || 'N/A',
                                user.email,
                                formatPhoneNumber(user.profile?.phone || 'N/A'),
                                date,
                                user.orderCount || 0,
                                `<button class="btn btn-outline view-customer" data-id="${doc.id}">Ver</button>`
                            ]).draw(false);
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
                const table = $('#employeesTable').DataTable();
                table.clear().draw();

                // Escuchar cambios en tiempo real
                const unsubscribe = db.collection('users')
                    .where('isEmployee', '==', true)
                    .orderBy('createdAt', 'desc')
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

                            table.row.add([
                                doc.id,
                                user.profile?.name || 'N/A',
                                user.email,
                                formatPhoneNumber(user.profile?.phone || 'N/A'),
                                roleMap[user.role] || user.role,
                                user.status === 'active' ? 
                                    '<span class="status-badge status-completed">Activo</span>' : 
                                    '<span class="status-badge status-cancelled">Inactivo</span>',
                                `<button class="btn btn-outline edit-employee" data-id="${doc.id}">Editar</button>`
                            ]).draw(false);
                        });
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
    document.querySelectorAll('.edit-employee').forEach(btn => {
        btn.addEventListener('click', function () {
            editEmployee(this.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.delete-employee').forEach(btn => {
        btn.addEventListener('click', function () {
            deleteEmployee(this.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.reset-password').forEach(btn => {
        btn.addEventListener('click', function () {
            resetEmployeePassword(this.getAttribute('data-id'), this.getAttribute('data-email'));
        });
    });
}

// View Order Details
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


// En la función saveEmployee, actualiza el objeto employeeData:
// Employee Functions
// Modifica la función saveEmployee para verificar primero si el usuario existe
function saveEmployee() {
    const email = document.getElementById('employeeEmail').value.toLowerCase();
    const name = document.getElementById('employeeName').value;
    const phone = document.getElementById('employeePhone').value;
    const role = document.getElementById('employeeRole').value;

    const profileData = {
        name: name,
        phone: phone,
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

    const passwordInput = document.getElementById('employeePassword');
    const password = passwordInput.value;

    // Mostrar indicador de carga
    const saveBtn = document.getElementById('saveEmployee');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    if (isEditMode) {
        if (!selectedEmployeeId) {
            showToast('Error: No se ha seleccionado un empleado para editar', 'error');
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Guardar Empleado';
            return;
        }

        db.collection('users').doc(selectedEmployeeId).update(employeeData)
            .then(() => {
                showToast('Empleado actualizado correctamente', 'success');
                loadEmployeesTable();

                // Restaurar el botón
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Guardar Empleado';
            })
            .catch(error => {
                showToast('Error al actualizar empleado: ' + error.message, 'error');
                console.error("Error al actualizar:", error);

                // Restaurar el botón
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Guardar Empleado';
            });
    } else {
        // Lógica para nuevo empleado (mantener la existente)
        checkUserExists(email).then(result => {
            if (result.exists) {
                passwordInput.disabled = true;
                passwordInput.placeholder = "No necesario (usuario existente)";

                const confirmMessage = `El usuario ${email} ya existe. ¿Deseas convertirlo en empleado?`;

                if (!confirm(confirmMessage)) {
                    passwordInput.disabled = false;
                    passwordInput.placeholder = "";
                    return;
                }

                updateExistingUserToEmployee(employeeData);
            } else {
                if (password.length < 6) {
                    alert('La contraseña debe tener al menos 6 caracteres');
                    return;
                }

                createNewEmployee(employeeData, password);
            }
        }).catch(error => {
            console.error("Error verificando usuario:", error);
            alert('Error al verificar usuario: ' + error.message);
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
        })
        .catch(error => {
            console.error("Error al convertir usuario:", error);
            alert('Error al convertir usuario: ' + error.message);
        });
}

// Función para crear nuevo empleado (mantén tu lógica existente)
function createNewEmployee(employeeData, password) {
    const currentUser = auth.currentUser;

    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    auth.createUserWithEmailAndPassword(employeeData.email, password)
        .then((userCredential) => {
            return auth.signInWithEmailAndPassword(currentUser.email, password)
                .then(() => {
                    employeeData.userId = userCredential.user.uid;
                    employeeData.registrationDate = firebase.firestore.FieldValue.serverTimestamp(); // Cambiado aquí
                    return db.collection('users').doc(userCredential.user.uid).set(employeeData);
                });
        })
        .then(() => {
            alert('Empleado creado correctamente');
            document.getElementById('employeeModal').style.display = 'none';
            loadEmployeesTable();
        })
        .catch(error => {
            console.error("Error al crear empleado:", error);
            alert('Error al crear empleado: ' + error.message);

            if (currentUser) {
                auth.signInWithEmailAndPassword(currentUser.email, password)
                    .catch(loginError => {
                        console.error("Error al restaurar sesión:", loginError);
                    });
            }
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
        document.getElementById('employeePhone').value = employee.profile?.phone || '';
        document.getElementById('employeeRole').value = employee.role || 'customer_service';

        // Deshabilitar campo de email (no se debe cambiar)
        document.getElementById('employeeEmail').disabled = true;

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

