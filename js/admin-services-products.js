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
/**
 * Carga los productos en formato de tarjetas
 */
function loadProductsTable() {
    return new Promise((resolve, reject) => {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = ''; // Limpiar el contenedor
        
        db.collection('CommonItems')
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const product = doc.data();
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.dataset.id = doc.id;
                    
                    // Formatear dimensiones si es un array
                    let dimensions = product.dimensions;
                    if (Array.isArray(dimensions)) {
                        dimensions = dimensions.join('" × ') + '"';
                    }
                    
productCard.innerHTML = `
    ${product.icon ? `<img src="${product.icon}" class="product-image" alt="${product.name}">` : '<div class="product-image no-image">No hay imagen</div>'}
    <div class="product-details">
        <h3 class="product-name">${product.name}</h3>
        ${product.name_en ? `<div class="product-name-en">${product.name_en}</div>` : ''}
        <div class="product-detail"><strong></strong> ${dimensions || 'N/A'}</div>
        <div class="product-detail-lbs"><strong></strong> ${product.weight ? product.weight + ' lbs' : 'N/A'}</div>
    </div>
    <div class="product-actions">
        <button class="btn btn-danger delete-product" data-id="${doc.id}">Eliminar</button>
        <button class="btn btn-outline edit-product" data-id="${doc.id}">Editar</button>
    </div>
`;

                    
                    productsGrid.appendChild(productCard);
                });
                
                addProductEventListeners();
                resolve();
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                reject(error);
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
    selectedProductImageFile = null; // Resetear la imagen seleccionada
    
    db.collection('CommonItems').doc(productId).get().then(doc => {
        if (doc.exists) {
            const product = doc.data();
            
            // Llenar el formulario con los datos del producto
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productNameEn').value = product.name_en || ''; // Nuevo campo
            
            
            // Mostrar la imagen existente
            const imagePreview = document.getElementById('productImagePreview');
            if (product.icon) {
                imagePreview.innerHTML = `<img src="${product.icon}" style="max-width: 170px; max-height: 170px; border-radius: 4px;">`;
                document.getElementById('productImage').value = product.icon;
            } else {
                imagePreview.innerHTML = '<div class="no-image">No hay imagen</div>';
                document.getElementById('productImage').value = '';
            }
            
            // Llenar dimensiones individuales
            if (Array.isArray(product.dimensions) && product.dimensions.length === 3) {
                document.getElementById('productLength').value = product.dimensions[0] || '';
                document.getElementById('productWidth').value = product.dimensions[1] || '';
                document.getElementById('productHeight').value = product.dimensions[2] || '';
            } else {
                document.getElementById('productLength').value = '';
                document.getElementById('productWidth').value = '';
                document.getElementById('productHeight').value = '';
            }
            
            document.getElementById('productWeight').value = product.weight || '';
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
 * Sube una imagen a Firebase Storage
 * @param {File} file - Archivo de imagen a subir
 * @returns {Promise<string>} URL de descarga de la imagen
 */
function uploadProductImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No file selected');
      return;
    }
    
    // Use the initialized storage reference
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(`product-images/${Date.now()}_${file.name}`);
    
    fileRef.put(file).then(snapshot => {
      snapshot.ref.getDownloadURL().then(url => {
        resolve(url);
      }).catch(reject);
    }).catch(reject);
  });
}

/**
 * Guarda un producto (nuevo o existente)
 */
function saveProduct() {
    const length = parseFloat(document.getElementById('productLength').value) || 0;
    const width = parseFloat(document.getElementById('productWidth').value) || 0;
    const height = parseFloat(document.getElementById('productHeight').value) || 0;
    const dimensions = [length, width, height];
    
    const productData = {
        name: document.getElementById('productName').value,
        name_en: document.getElementById('productNameEn').value || '', // Nuevo campo
        dimensions: dimensions,
        weight: parseFloat(document.getElementById('productWeight').value) || 0,
        status: document.getElementById('productStatus').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Mostrar loader mientras se procesa
    const saveBtn = document.getElementById('saveProduct');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    // Primero subir la imagen si hay una nueva
    const imageUploadPromise = selectedProductImageFile 
        ? uploadProductImage(selectedProductImageFile) 
        : Promise.resolve(document.getElementById('productImage').value);
    
    imageUploadPromise.then(imageUrl => {
        if (imageUrl) {
            productData.icon = imageUrl;
        }
        
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
                })
                .finally(() => {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = 'Guardar Producto';
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
                })
                .finally(() => {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = 'Guardar Producto';
                });
        }
    }).catch(error => {
        alert('Error al subir la imagen: ' + error);
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Guardar Producto';
    });
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
    // Modal de producto
    document.getElementById('addProduct')?.addEventListener('click', function() {
        isEditMode = false;
        selectedProductId = null;
        selectedProductImageFile = null;
        document.getElementById('productForm').reset();
        document.getElementById('productImagePreview').innerHTML = '<div class="no-image">No hay imagen</div>';
        document.getElementById('productModalTitle').textContent = 'Agregar Nuevo Producto';
        document.getElementById('productModal').style.display = 'flex';
    });

    // Cerrar modal al hacer clic en la X
    document.querySelector('#productModal .close-modal')?.addEventListener('click', function() {
        document.getElementById('productModal').style.display = 'none';
    });

    document.getElementById('saveProduct')?.addEventListener('click', saveProduct);
    
    // Evento para subir imagen
    document.getElementById('uploadImageBtn')?.addEventListener('click', function() {
        document.getElementById('productImageUpload').click();
    });
    
    document.getElementById('productImageUpload')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.match('image.*')) {
                alert('Por favor selecciona un archivo de imagen (JPEG, PNG, etc.)');
                return;
            }
            
            // Validar tamaño (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('La imagen no debe exceder los 2MB');
                return;
            }
            
            selectedProductImageFile = file;
            const reader = new FileReader();
            reader.onload = function(event) {
                const imagePreview = document.getElementById('productImagePreview');
                imagePreview.innerHTML = `<img src="${event.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 4px;">`;
            };
            reader.readAsDataURL(file);
        }
    });
}
