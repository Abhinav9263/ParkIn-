// Mock data for bookings
const mockBookings = {
    active: [
        {
            id: 1,
            spaceName: "Esplanade Parking Complex",
            address: "5 Jawaharlal Nehru Road, Esplanade, Kolkata 700013",
            startTime: "2025-02-20T10:00:00",
            endTime: "2025-02-20T18:00:00",
            price: 40,
            status: "active",
            spaceImage: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
        }
    ],
    upcoming: [
        {
            id: 2,
            spaceName: "City Centre Salt Lake Parking",
            address: "DC Block, Sector 1, Salt Lake City, Kolkata 700064",
            startTime: "2024-02-25T09:00:00",
            endTime: "2024-02-25T17:00:00",
            price: 50,
            status: "upcoming",
            spaceImage: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=60"
        }
    ],
    past: [
        {
            id: 3,
            spaceName: "Howrah Station Parking Zone",
            address: "7Howrah Station Road, Howrah 711101",
            startTime: "2024-02-10T08:00:00",
            endTime: "2024-02-10T16:00:00",
            price: 20,
            status: "completed",
            spaceImage: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
        }
    ]
};

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const bookingSections = document.querySelectorAll('.booking-section');
const bookingModal = document.getElementById('booking-modal');
const extensionModal = document.getElementById('extension-modal');
const closeButtons = document.querySelectorAll('.close-modal');
const extensionForm = document.getElementById('extension-form');
const extensionDuration = document.getElementById('extension-duration');
const extensionCost = document.querySelector('.extension-cost');

// Current booking being viewed/modified
let currentBooking = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load initial bookings
    loadBookings('active');
    
    // Add tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            switchTab(tab);
            loadBookings(tab);
        });
    });
    
    // Add modal close functionality
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            bookingModal.classList.remove('active');
            extensionModal.classList.remove('active');
        });
    });
    
    // Handle booking extension
    document.querySelector('.extend-booking').addEventListener('click', () => {
        bookingModal.classList.remove('active');
        extensionModal.classList.add('active');
        updateExtensionCost();
    });
    
    // Handle extension duration change
    extensionDuration.addEventListener('change', updateExtensionCost);
    
    // Handle extension form submission
    extensionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const duration = extensionDuration.value;
        alert(`Booking extended by ${duration} hour(s)! (This is a demo)`);
        extensionModal.classList.remove('active');
    });
    
    // Handle booking cancellation
    document.querySelector('.cancel-booking').addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            alert('Booking cancelled successfully! (This is a demo)');
            bookingModal.classList.remove('active');
            loadBookings('active'); // Refresh the active bookings
        }
    });
});

// Switch between tabs
function switchTab(tab) {
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.tab === tab) {
            button.classList.add('active');
        }
    });
    
    bookingSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${tab}-bookings`) {
            section.classList.add('active');
        }
    });
}

// Load bookings for a specific tab
function loadBookings(tab) {
    const bookings = mockBookings[tab];
    const container = document.querySelector(`#${tab}-bookings .booking-cards`);
    
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>No ${tab} bookings found</p>
                <a href="search.html" class="btn btn-primary">Find Parking</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card" onclick="showBookingDetails(${booking.id})">
            <span class="booking-status status-${booking.status}">${capitalizeFirst(booking.status)}</span>
            <h3>${booking.spaceName}</h3>
            <div class="booking-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>${booking.address}</span>
            </div>
            <div class="booking-info">
                <i class="fas fa-clock"></i>
                <span>${formatDateTime(booking.startTime)} - ${formatTime(booking.endTime)}</span>
            </div>
            <div class="booking-price">₹${booking.price}/hr</div>
        </div>
    `).join('');
}

// Show booking details in modal
function showBookingDetails(bookingId) {
    // Find booking in mock data
    currentBooking = [...mockBookings.active, ...mockBookings.upcoming, ...mockBookings.past]
        .find(booking => booking.id === bookingId);
    
    if (!currentBooking) return;
    
    const details = document.querySelector('.booking-details');
    details.innerHTML = `
        <div class="detail-group">
            <label>Location</label>
            <p>${currentBooking.spaceName}</p>
            <p>${currentBooking.address}</p>
        </div>
        <div class="detail-group">
            <label>Date & Time</label>
            <p>${formatDateTime(currentBooking.startTime)} - ${formatTime(currentBooking.endTime)}</p>
        </div>
        <div class="detail-group">
            <label>Status</label>
            <p><span class="booking-status status-${currentBooking.status}">${capitalizeFirst(currentBooking.status)}</span></p>
        </div>
        <div class="detail-group">
            <label>Price</label>
            <p class="booking-price">₹${currentBooking.price}/hr</p>
        </div>
    `;
    
    // Show/hide action buttons based on booking status
    const extendButton = document.querySelector('.extend-booking');
    const cancelButton = document.querySelector('.cancel-booking');
    
    if (currentBooking.status === 'active') {
        extendButton.style.display = 'block';
        cancelButton.style.display = 'block';
    } else {
        extendButton.style.display = 'none';
        cancelButton.style.display = 'none';
    }
    
    bookingModal.classList.add('active');
}

// Update extension cost based on selected duration
function updateExtensionCost() {
    if (!currentBooking) return;
    
    const duration = parseInt(extensionDuration.value);
    const cost = duration * currentBooking.price;
    extensionCost.textContent = `₹${cost.toFixed(2)}`;
}

// Helper function to format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Helper function to format time only
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Helper function to capitalize first letter
function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
} 