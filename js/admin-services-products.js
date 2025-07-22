// ==================== FUNCIONES DE SERVICIOS ====================

/**
 * Carga la tabla de servicios con datos de Firestore
 */
// Función para cargar servicios
function loadServicesTable() {
    return new Promise((resolve, reject) => {
        handleTableLoading('servicesTable', () => {
            return new Promise((innerResolve, innerReject) => {
                db.collection('services')
                    .orderBy('position', 'asc')
                    .get()
                    .then(snapshot => {
                        const table = $('#servicesTable').DataTable();
                        snapshot.forEach(doc => {
                            const service = doc.data();
                            table.row.add([
                                doc.id,
                                service.name,
                                service.price,
                                service.type === 'promo' ? 'Promoción' : 'Regular',
                                service.position,
                                service.status === 'active' ? 'Activo' : 'Inactivo',
                                `<button class="btn btn-outline edit-service" data-id="${doc.id}">Editar</button>
                                 <button class="btn btn-danger delete-service" data-id="${doc.id}">Eliminar</button>`
                            ]).draw(false);
                        });
                        addServiceEventListeners();
                        innerResolve();
                    })
                    .catch(innerReject);
            });
        });
    });
}

/**
 * Edita un servicio existente
 * @param {string} serviceId - ID del servicio a editar
 */
function editService(serviceId) {
    selectedServiceId = serviceId;
    isEditMode = true;
    
    db.collection('services').doc(serviceId).get().then(doc => {
        if (doc.exists) {
            const service = doc.data();
            
            // Llenar el formulario con los datos del servicio
            document.getElementById('serviceName').value = service.name;
            document.getElementById('serviceType').value = service.type || 'regular';
            document.getElementById('servicePrice').value = service.price;
            document.getElementById('servicePosition').value = service.position || 1;
            document.getElementById('serviceIcon').value = service.icon || '';
            document.getElementById('serviceStatus').value = service.status || 'active';
            document.getElementById('serviceSlot1').value = service.slot1 || '';
            document.getElementById('serviceSlot2').value = service.slot2 || '';
            document.getElementById('serviceSlot3').value = service.slot3 || '';
            document.getElementById('serviceSlot4').value = service.slot4 || '';
            
            // Actualizar título del modal
            document.getElementById('serviceModalTitle').textContent = 'Editar Servicio';
            
            // Mostrar modal
            document.getElementById('serviceModal').style.display = 'flex';
        } else {
            alert('Servicio no encontrado');
        }
    });
}

/**
 * Elimina un servicio
 * @param {string} serviceId - ID del servicio a eliminar
 */
function deleteService(serviceId) {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
        db.collection('services').doc(serviceId).delete()
            .then(() => {
                alert('Servicio eliminado correctamente');
                loadServicesTable();
            })
            .catch(error => {
                alert('Error al eliminar: ' + error.message);
            });
    }
}

/**
 * Guarda un servicio (nuevo o existente)
 */
function saveService() {
    const serviceData = {
        name: document.getElementById('serviceName').value,
        type: document.getElementById('serviceType').value,
        price: document.getElementById('servicePrice').value,
        position: parseInt(document.getElementById('servicePosition').value) || 1,
        icon: document.getElementById('serviceIcon').value,
        status: document.getElementById('serviceStatus').value,
        slot1: document.getElementById('serviceSlot1').value,
        slot2: document.getElementById('serviceSlot2').value,
        slot3: document.getElementById('serviceSlot3').value,
        slot4: document.getElementById('serviceSlot4').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (isEditMode) {
        // Actualizar servicio existente
        db.collection('services').doc(selectedServiceId).update(serviceData)
            .then(() => {
                alert('Servicio actualizado correctamente');
                document.getElementById('serviceModal').style.display = 'none';
                loadServicesTable();
            })
            .catch(error => {
                alert('Error al actualizar: ' + error.message);
            });
    } else {
        // Agregar nuevo servicio
        serviceData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        
        db.collection('services').add(serviceData)
            .then(() => {
                alert('Servicio agregado correctamente');
                document.getElementById('serviceModal').style.display = 'none';
                loadServicesTable();
            })
            .catch(error => {
                alert('Error al agregar: ' + error.message);
            });
    }
}

// ==================== FUNCIONES DE PRODUCTOS ====================

/**
 * Carga la tabla de productos con datos de Firestore
 */
function loadProductsTable() {
    return new Promise((resolve, reject) => {
        handleTableLoading('productsTable', () => {
            return new Promise((innerResolve, innerReject) => {
                db.collection('CommonItems')
                    .get()
                    .then(snapshot => {
                        const table = $('#productsTable').DataTable();
                        snapshot.forEach(doc => {
                            const product = doc.data();
                            table.row.add([
                                doc.id,
                                product.icon ? `<img src="${product.icon}" width="50" height="50">` : 'N/A',
                                product.name,
                                Array.isArray(product.dimensions) ? product.dimensions.join('" x ') + '"' : product.dimensions,
                                product.weight ? `${product.weight} lbs` : 'N/A',
                                product.price ? `$${product.price}` : 'N/A',
                                `<button class="btn btn-outline edit-product" data-id="${doc.id}">Editar</button>
                                 <button class="btn btn-danger delete-product" data-id="${doc.id}">Eliminar</button>`
                            ]).draw(false);
                        });
                        addProductEventListeners();
                        innerResolve();
                    })
                    .catch(innerReject);
            });
        });
    });
}

/**
 * Edita un producto existente
 * @param {string} productId - ID del producto a editar
 */
function editProduct(productId) {
    selectedProductId = productId;
    isEditMode = true;
    
    db.collection('CommonItems').doc(productId).get().then(doc => {
        if (doc.exists) {
            const product = doc.data();
            
            // Llenar el formulario con los datos del producto
            document.getElementById('productName').value = product.name;
            document.getElementById('productImage').value = product.icon || '';
            
            if (Array.isArray(product.dimensions)) {
                document.getElementById('productDimensions').value = product.dimensions.join('x');
            } else {
                document.getElementById('productDimensions').value = product.dimensions || '';
            }
            
            document.getElementById('productWeight').value = product.weight || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productStatus').value = product.status || 'active';
            
            // Actualizar título del modal
            document.getElementById('productModalTitle').textContent = 'Editar Producto';
            
            // Mostrar modal
            document.getElementById('productModal').style.display = 'flex';
        } else {
            alert('Producto no encontrado');
        }
    });
}

/**
 * Elimina un producto
 * @param {string} productId - ID del producto a eliminar
 */
function deleteProduct(productId) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        db.collection('CommonItems').doc(productId).delete()
            .then(() => {
                alert('Producto eliminado correctamente');
                loadProductsTable();
            })
            .catch(error => {
                alert('Error al eliminar: ' + error.message);
            });
    }
}

/**
 * Guarda un producto (nuevo o existente)
 */
function saveProduct() {
    const dimensions = document.getElementById('productDimensions').value.split('x').map(d => d.trim());
    
    const productData = {
        name: document.getElementById('productName').value,
        icon: document.getElementById('productImage').value,
        dimensions: dimensions,
        weight: parseFloat(document.getElementById('productWeight').value) || 0,
        price: parseFloat(document.getElementById('productPrice').value) || 0,
        status: document.getElementById('productStatus').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (isEditMode) {
        // Actualizar producto existente
        db.collection('CommonItems').doc(selectedProductId).update(productData)
            .then(() => {
                alert('Producto actualizado correctamente');
                document.getElementById('productModal').style.display = 'none';
                loadProductsTable();
            })
            .catch(error => {
                alert('Error al actualizar: ' + error.message);
            });
    } else {
        // Agregar nuevo producto
        productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        
        db.collection('CommonItems').add(productData)
            .then(() => {
                alert('Producto agregado correctamente');
                document.getElementById('productModal').style.display = 'none';
                loadProductsTable();
            })
            .catch(error => {
                alert('Error al agregar: ' + error.message);
            });
    }
}

// ==================== MANEJADORES DE EVENTOS ====================

/**
 * Agrega los event listeners para los botones de servicios
 */
function addServiceEventListeners() {
    document.querySelectorAll('.edit-service').forEach(btn => {
        btn.addEventListener('click', function() {
            editService(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-service').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteService(this.getAttribute('data-id'));
        });
    });
}

/**
 * Agrega los event listeners para los botones de productos
 */
function addProductEventListeners() {
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', function() {
            editProduct(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteProduct(this.getAttribute('data-id'));
        });
    });
}

/**
 * Inicializa los modales y eventos para servicios y productos
 */
function initServicesProductsModals() {
    // Modal de servicio
    document.getElementById('addService')?.addEventListener('click', function() {
        isEditMode = false;
        selectedServiceId = null;
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceModalTitle').textContent = 'Agregar Nuevo Servicio';
        document.getElementById('serviceModal').style.display = 'flex';
    });

    document.getElementById('cancelService')?.addEventListener('click', function() {
        document.getElementById('serviceModal').style.display = 'none';
    });

    document.getElementById('saveService')?.addEventListener('click', saveService);

    // Modal de producto
    document.getElementById('addProduct')?.addEventListener('click', function() {
        isEditMode = false;
        selectedProductId = null;
        document.getElementById('productForm').reset();
        document.getElementById('productModalTitle').textContent = 'Agregar Nuevo Producto';
        document.getElementById('productModal').style.display = 'flex';
    });

    document.getElementById('cancelProduct')?.addEventListener('click', function() {
        document.getElementById('productModal').style.display = 'none';
    });

    document.getElementById('saveProduct')?.addEventListener('click', saveProduct);
}