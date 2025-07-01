// Initialize the map
let map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Mock data for parking spaces
const mockParkingSpaces = [
    {
        id: 1,
        name: "Esplanade Parking Complex",
        address: "5 Jawaharlal Nehru Road, Esplanade, Kolkata 700013",
        lat: 51.505,
        lng: -0.09,
        price: 30,
        rating: 4.5,
        facilities: ["EV Charging", "CCTV", "24/7 Security"],
        image: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 2,
        name: "Park Street Underground Parking",
        address: "42 Park Street, Park Street Area, Kolkata 700016",
        lat: 51.507,
        lng: -0.087,
        price: 50,
        rating: 4.2,
        facilities: ["CCTV", "Covered"],
        image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 3,
        name: "South City Mall Parking",
        address: "375 Prince Anwar Shah Road, South Kolkata 700068",
        lat: 51.503,
        lng: -0.093,
        price: 70,
        rating: 4.8,
        facilities: ["EV Charging", "CCTV", "Covered", "24/7 Security"],
        image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"
    }
];

// DOM Elements
const searchForm = document.getElementById('search-form');
const priceRange = document.getElementById('price-range');
const priceDisplay = document.getElementById('price-display');
const resultsList = document.querySelector('.results-list');

// Update price display
priceRange.addEventListener('input', (e) => {
    priceDisplay.textContent = `₹0 - ₹${e.target.value}`;
});

// Handle form submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchParkingSpaces();
});

// Search function
function searchParkingSpaces() {
    // Show loading state
    resultsList.innerHTML = '<div class="loading"></div>';

    // Simulate API call delay
    setTimeout(() => {
        // Get filter values
        const location = document.getElementById('location').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const duration = document.getElementById('duration').value;
        const maxPrice = priceRange.value;
        const selectedFacilities = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
            .map(checkbox => checkbox.value);

        // Filter mock data (in a real app, this would be an API call)
        const filteredSpaces = mockParkingSpaces.filter(space => {
            return space.price <= maxPrice &&
                (!selectedFacilities.length || selectedFacilities.every(facility => 
                    space.facilities.map(f => f.toLowerCase().replace(/\s+/g, '-'))
                        .includes(facility)));
        });

        displayResults(filteredSpaces);
        updateMap(filteredSpaces);
    }, 1000);
}

// Display results
function displayResults(spaces) {
    if (spaces.length === 0) {
        resultsList.innerHTML = '<p>No parking spaces found matching your criteria.</p>';
        return;
    }

    resultsList.innerHTML = spaces.map(space => `
        <div class="parking-space">
            <img src="${space.image}" alt="${space.name}">
            <div class="parking-space-info">
                <h3>${space.name}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${space.address}</p>
                <p><i class="fas fa-star"></i> ${space.rating}/5.0</p>
                <div class="facility-tags">
                    ${space.facilities.map(facility => 
                        `<span class="facility-tag"><i class="fas fa-check"></i> ${facility}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="parking-space-price">
                <div class="price">₹${space.price}/hr</div>
                <button class="btn btn-primary" onclick="bookSpace(${space.id})">Book Now</button>
            </div>
        </div>
    `).join('');
}

// Update map markers
function updateMap(spaces) {
    // Clear existing markers
    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Add new markers
    spaces.forEach(space => {
        const marker = L.marker([space.lat, space.lng])
            .addTo(map)
            .bindPopup(`
                <strong>${space.name}</strong><br>
                ${space.address}<br>
                $${space.price}/hr
            `);
    });

    // Adjust map view to fit all markers if there are results
    if (spaces.length > 0) {
        const bounds = L.latLngBounds(spaces.map(space => [space.lat, space.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Book parking space
function bookSpace(spaceId) {
    // In a real app, this would navigate to a booking page or open a modal
    alert(`Booking space ${spaceId}. Booking Confirmed .`);
}

// Initialize the search on page load
searchParkingSpaces(); 