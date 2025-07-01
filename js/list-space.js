// Initialize the map
let map = L.map('location-map').setView([51.505, -0.09], 13);
let marker = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Handle map clicks to set location
map.on('click', function(e) {
    if (marker) {
        map.removeLayer(marker);
    }
    marker = L.marker(e.latlng).addTo(map);
    
    // Update hidden input with coordinates
    document.getElementById('lat').value = e.latlng.lat;
    document.getElementById('lng').value = e.latlng.lng;
    
    // Reverse geocode to get address (in a real app)
    console.log(`Selected location: ${e.latlng.lat}, ${e.latlng.lng}`);
});

// Handle address input
const addressInput = document.getElementById('address');
addressInput.addEventListener('change', function() {
    // In a real app, geocode the address to get coordinates
    console.log(`Searching for address: ${this.value}`);
});

// Handle photo upload
const photoUpload = document.getElementById('photo-upload');
const photoPreview = document.getElementById('photo-preview');
const maxPhotos = 6;
let uploadedPhotos = [];

photoUpload.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    
    if (uploadedPhotos.length + files.length > maxPhotos) {
        alert(`You can only upload up to ${maxPhotos} photos`);
        return;
    }
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload only image files');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoId = Date.now() + Math.random().toString(36).substr(2, 9);
            uploadedPhotos.push({
                id: photoId,
                file: file,
                url: e.target.result
            });
            
            updatePhotoPreview();
        };
        reader.readAsDataURL(file);
    });
});

// Update photo preview
function updatePhotoPreview() {
    photoPreview.innerHTML = uploadedPhotos.map(photo => `
        <div class="preview-image">
            <img src="${photo.url}" alt="Preview">
            <button type="button" class="remove-image" data-id="${photo.id}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // Add remove button listeners
    document.querySelectorAll('.remove-image').forEach(button => {
        button.addEventListener('click', function() {
            const photoId = this.dataset.id;
            uploadedPhotos = uploadedPhotos.filter(photo => photo.id !== photoId);
            updatePhotoPreview();
        });
    });
}

// Handle drag and drop
const dropZone = document.querySelector('.photo-upload');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropZone.classList.add('highlight');
}

function unhighlight(e) {
    dropZone.classList.remove('highlight');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = Array.from(dt.files);
    
    if (uploadedPhotos.length + files.length > maxPhotos) {
        alert(`You can only upload up to ${maxPhotos} photos`);
        return;
    }
    
    files.forEach(file => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload only image files');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoId = Date.now() + Math.random().toString(36).substr(2, 9);
            uploadedPhotos.push({
                id: photoId,
                file: file,
                url: e.target.result
            });
            updatePhotoPreview();
        };
        reader.readAsDataURL(file);
    });
}

// Handle form submission
const listSpaceForm = document.getElementById('list-space-form');

listSpaceForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Gather form data
    const formData = new FormData(this);
    
    // Add photos
    uploadedPhotos.forEach(photo => {
        formData.append('photos[]', photo.file);
    });
    
    // Add coordinates if marker exists
    if (marker) {
        formData.append('latitude', marker.getLatLng().lat);
        formData.append('longitude', marker.getLatLng().lng);
    }
    
    // Get selected facilities
    const facilities = Array.from(document.querySelectorAll('input[name="facilities"]:checked'))
        .map(input => input.value);
    formData.append('facilities', JSON.stringify(facilities));
    
    // Get availability
    const availability = {
        days: Array.from(document.querySelectorAll('input[name="days"]:checked'))
            .map(input => input.value),
        startTime: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value
    };
    formData.append('availability', JSON.stringify(availability));
    
    // In a real app, send formData to server
    console.log('Form submitted with data:', Object.fromEntries(formData));
    alert('Your parking space has been listed successfully! (This is a demo)');
});

// Handle "Save as Draft" button
document.querySelector('.btn-secondary').addEventListener('click', function() {
    // In a real app, save the current form state
    alert('Draft saved! (This is a demo)');
}); 