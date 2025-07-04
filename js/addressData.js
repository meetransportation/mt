// Address Data
const addressData = {
  countries: [
    { code: 'US', name: 'Estados Unidos' },
    { code: 'DO', name: 'República Dominicana' }
  ],
  states: {
    US: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
      'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
      'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
      'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
      'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
      'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ],
    DO: [
      'Distrito Nacional', 'Santo Domingo', 'Santiago', 'Azua', 'Bahoruco', 'Barahona', 'Dajabón',
      'Duarte', 'El Seibo', 'Elías Piña', 'Espaillat', 'Hato Mayor', 'Hermanas Mirabal', 'Independencia',
      'La Altagracia', 'La Romana', 'La Vega', 'María Trinidad Sánchez', 'Monseñor Nouel', 'Monte Cristi',
      'Monte Plata', 'Pedernales', 'Peravia', 'Puerto Plata', 'Samaná', 'San Cristóbal', 'San José de Ocoa',
      'San Juan', 'San Pedro de Macorís', 'Sánchez Ramírez', 'Santiago Rodríguez', 'Valverde'
    ]
  }
};

// Cargar estados/provincias basados en el país seleccionado
function loadStates(countryCode, targetSelectId) {
    const stateSelect = document.getElementById(targetSelectId);
    stateSelect.innerHTML = '<option value="" disabled selected>Seleccione un estado/provincia</option>';
    
    if (countryCode && addressData.states[countryCode]) {
        addressData.states[countryCode].forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });
    }
}