// DOM Elements
const personalInfoForm = document.getElementById('personal-info-form');
const vehicleModal = document.getElementById('vehicle-modal');
const paymentModal = document.getElementById('payment-modal');
const vehicleForm = document.getElementById('vehicle-form');
const paymentForm = document.getElementById('payment-form');
const addVehicleBtn = document.querySelector('.add-vehicle');
const addPaymentBtn = document.querySelector('.add-payment');
const closeButtons = document.querySelectorAll('.close-modal');
const deleteAccountBtn = document.querySelector('.danger-zone .btn-danger');
const editAvatarBtn = document.querySelector('.edit-avatar');

// Mock parking history data
const parkingHistory = [
    {
        id: 1,
        location: { lat: 51.505, lng: -0.09 },
        address: "Central Parking Garage, London",
        date: "2024-02-15",
        duration: "4 hours",
        cost: "$12.00"
    },
    {
        id: 2,
        location: { lat: 51.51, lng: -0.1 },
        address: "City Square Parking, London",
        date: "2024-02-10",
        duration: "2 hours",
        cost: "$6.00"
    }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners
    personalInfoForm.addEventListener('submit', handlePersonalInfoSubmit);
    vehicleForm.addEventListener('submit', handleVehicleSubmit);
    paymentForm.addEventListener('submit', handlePaymentSubmit);
    addVehicleBtn.addEventListener('click', () => vehicleModal.classList.add('active'));
    addPaymentBtn.addEventListener('click', () => paymentModal.classList.add('active'));
    
    // Close modal functionality
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            vehicleModal.classList.remove('active');
            paymentModal.classList.remove('active');
        });
    });
    
    // Delete vehicle functionality
    document.querySelectorAll('.vehicle-actions .btn-danger').forEach(btn => {
        btn.addEventListener('click', handleVehicleDelete);
    });
    
    // Edit vehicle functionality
    document.querySelectorAll('.vehicle-actions .btn-secondary').forEach(btn => {
        btn.addEventListener('click', handleVehicleEdit);
    });
    
    // Delete payment method functionality
    document.querySelectorAll('.card-actions .btn-danger').forEach(btn => {
        btn.addEventListener('click', handlePaymentDelete);
    });
    
    // Delete account functionality
    deleteAccountBtn.addEventListener('click', handleAccountDelete);
    
    // Edit avatar functionality
    editAvatarBtn.addEventListener('click', handleAvatarEdit);
    
    // Format card number input
    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput.addEventListener('input', formatCardNumber);
    
    // Format expiry date input
    const expiryDateInput = document.getElementById('expiry-date');
    expiryDateInput.addEventListener('input', formatExpiryDate);
    
    // Format CVV input
    const cvvInput = document.getElementById('cvv');
    cvvInput.addEventListener('input', formatCVV);

    // Initialize new features
    if (document.getElementById('history-map')) {
        // Add Leaflet CSS
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(leafletCSS);

        // Add Leaflet JS
        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
        leafletScript.onload = initHistoryMap;
        document.head.appendChild(leafletScript);
    }

    // Initialize achievements
    initAchievements();

    // Add scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.profile-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        observer.observe(section);
    });
});

// Handle personal information form submission
function handlePersonalInfoSubmit(e) {
    e.preventDefault();
    const formData = {
        fullname: document.getElementById('fullname').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
    
    // Demo: Show success message
    showNotification('Personal information updated successfully!');
}

// Handle vehicle form submission
function handleVehicleSubmit(e) {
    e.preventDefault();
    const formData = {
        make: document.getElementById('vehicle-make').value,
        model: document.getElementById('vehicle-model').value,
        plate: document.getElementById('vehicle-plate').value,
        color: document.getElementById('vehicle-color').value
    };
    
    // Demo: Add vehicle to list
    const vehiclesList = document.querySelector('.vehicles-list');
    const newVehicle = createVehicleCard(formData);
    vehiclesList.insertBefore(newVehicle, addVehicleBtn);
    
    // Close modal and reset form
    vehicleModal.classList.remove('active');
    vehicleForm.reset();
    showNotification('Vehicle added successfully!');
}

// Handle payment form submission
function handlePaymentSubmit(e) {
    e.preventDefault();
    const formData = {
        cardNumber: document.getElementById('card-number').value,
        expiryDate: document.getElementById('expiry-date').value,
        cvv: document.getElementById('cvv').value,
        cardName: document.getElementById('card-name').value
    };
    
    // Demo: Add payment method to list
    const paymentMethods = document.querySelector('.payment-methods');
    const newPayment = createPaymentCard(formData);
    paymentMethods.insertBefore(newPayment, addPaymentBtn);
    
    // Close modal and reset form
    paymentModal.classList.remove('active');
    paymentForm.reset();
    showNotification('Payment method added successfully!');
}

// Handle vehicle deletion
function handleVehicleDelete(e) {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this vehicle?')) {
        e.target.closest('.vehicle-card').remove();
        showNotification('Vehicle removed successfully!');
    }
}

// Handle vehicle edit
function handleVehicleEdit(e) {
    e.stopPropagation();
    // Demo: Show edit functionality
    showNotification('Edit vehicle functionality will be implemented soon!');
}

// Handle payment method deletion
function handlePaymentDelete(e) {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this payment method?')) {
        e.target.closest('.payment-card').remove();
        showNotification('Payment method removed successfully!');
    }
}

// Handle account deletion
function handleAccountDelete() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('Please confirm again that you want to delete your account permanently.')) {
            showNotification('Account deletion request submitted!');
        }
    }
}

// Handle avatar edit
function handleAvatarEdit() {
    // Demo: Show file upload functionality
    showNotification('Avatar upload functionality will be implemented soon!');
}

// Create vehicle card element
function createVehicleCard(data) {
    const div = document.createElement('div');
    div.className = 'vehicle-card';
    div.innerHTML = `
        <div class="vehicle-info">
            <h3>${data.make} ${data.model}</h3>
            <p>License Plate: ${data.plate}</p>
            <p>Color: ${data.color}</p>
        </div>
        <div class="vehicle-actions">
            <button class="btn btn-secondary"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    // Add event listeners to new buttons
    div.querySelector('.btn-danger').addEventListener('click', handleVehicleDelete);
    div.querySelector('.btn-secondary').addEventListener('click', handleVehicleEdit);
    
    return div;
}

// Create payment card element
function createPaymentCard(data) {
    const div = document.createElement('div');
    div.className = 'payment-card';
    div.innerHTML = `
        <div class="card-info">
            <i class="fab fa-cc-visa"></i>
            <span>•••• •••• •••• ${data.cardNumber.slice(-4)}</span>
            <span>Expires ${data.expiryDate}</span>
        </div>
        <div class="card-actions">
            <button class="btn btn-danger"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    // Add event listener to new delete button
    div.querySelector('.btn-danger').addEventListener('click', handlePaymentDelete);
    
    return div;
}

// Format card number input
function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    e.target.value = value.substring(0, 19); // Limit to 16 digits + 3 spaces
}

// Format expiry date input
function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    e.target.value = value.substring(0, 5); // Limit to MM/YY format
}

// Format CVV input
function formatCVV(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value.substring(0, 3); // Limit to 3 digits
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add notification styles
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--primary-color)';
    notification.style.color = 'white';
    notification.style.padding = '1rem 2rem';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = 'var(--shadow)';
    notification.style.animation = 'slideIn 0.3s ease-out';
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize map
function initHistoryMap() {
    // Add Leaflet map
    const map = L.map('history-map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for each parking location
    parkingHistory.forEach(parking => {
        const marker = L.marker([parking.location.lat, parking.location.lng])
            .addTo(map)
            .bindPopup(`
                <strong>${parking.address}</strong><br>
                Date: ${parking.date}<br>
                Duration: ${parking.duration}<br>
                Cost: ${parking.cost}
            `);
    });
}

// Initialize achievements system
function initAchievements() {
    const achievements = [
        {
            id: 'first_parking',
            title: 'First Timer',
            description: 'Complete your first parking',
            icon: 'fa-star',
            achieved: true
        },
        {
            id: 'ten_parkings',
            title: 'Regular Parker',
            description: 'Park 10 times',
            icon: 'fa-award',
            achieved: true
        },
        {
            id: 'hundred_hours',
            title: 'Century Club',
            description: 'Accumulate 100 hours of parking',
            icon: 'fa-trophy',
            achieved: true
        }
    ];

    // Add achievements to profile
    const achievementsSection = document.createElement('section');
    achievementsSection.className = 'profile-section';
    achievementsSection.innerHTML = `
        <h2><i class="fas fa-trophy"></i> Achievements</h2>
        <div class="achievements-grid">
            ${achievements.map(achievement => `
                <div class="achievement-card ${achievement.achieved ? 'achieved' : ''}">
                    <i class="fas ${achievement.icon}"></i>
                    <h3>${achievement.title}</h3>
                    <p>${achievement.description}</p>
                </div>
            `).join('')}
        </div>
    `;

    // Insert before danger zone
    document.querySelector('.danger-zone').parentNode.insertBefore(
        achievementsSection,
        document.querySelector('.danger-zone')
    );
}

// Add CSS for achievements
const achievementStyles = document.createElement('style');
achievementStyles.textContent = `
    .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }

    .achievement-card {
        background: var(--bg-color);
        padding: 1.5rem;
        border-radius: 10px;
        text-align: center;
        border: 1px solid var(--border-color);
        opacity: 0.5;
        transition: all 0.3s ease;
    }

    .achievement-card.achieved {
        opacity: 1;
        border-color: var(--primary-color);
    }

    .achievement-card i {
        font-size: 2rem;
        color: var(--primary-color);
        margin-bottom: 1rem;
    }

    .achievement-card h3 {
        color: var(--text-color);
        margin-bottom: 0.5rem;
    }

    .achievement-card p {
        color: var(--text-muted);
        font-size: 0.9rem;
    }
`;

document.head.appendChild(achievementStyles);

// Add animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .fade-in {
        animation: fadeIn 0.6s ease forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

document.head.appendChild(animationStyles); 