// QR Code handling
class QRHandler {
    constructor() {
        this.scanner = null;
        this.currentCamera = 0;
        this.availableCameras = [];
        this.isScanning = false;

        // Bind methods to this
        this.onScanSuccess = this.onScanSuccess.bind(this);
        this.switchCamera = this.switchCamera.bind(this);
        this.closeQRModal = this.closeQRModal.bind(this);
        this.downloadQR = this.downloadQR.bind(this);
        this.shareBooking = this.shareBooking.bind(this);
        this.handleBooking = this.handleBooking.bind(this);

        // Initialize scanner if scanner container exists
        if (document.getElementById('scannerContainer')) {
            this.initializeScanner();
        }

        // Set up event listeners
        document.querySelectorAll('.close-qr-modal').forEach(button => {
            button.addEventListener('click', this.closeQRModal);
        });

        const downloadButton = document.getElementById('downloadQR');
        if (downloadButton) {
            downloadButton.addEventListener('click', this.downloadQR);
        }

        const shareButton = document.getElementById('shareBooking');
        if (shareButton) {
            shareButton.addEventListener('click', this.shareBooking);
        }

        // Add click event listeners for booking buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('book-space')) {
                this.handleBooking(e.target.dataset.spaceId);
            }
        });
    }

    handleBooking(spaceId) {
        // Mock data for the booking
        const mockBooking = {
            id: 'PK' + Math.floor(Math.random() * 10000),
            userId: 'USER123',
            userName: 'John Doe',
            spaceId: spaceId,
            location: 'Central Parking, Downtown',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            duration: '2 hours',
            amount: 10.00,
            status: 'confirmed',
            ownerName: 'Sarah Johnson',
            vehicleDetails: {
                type: 'Car',
                plate: 'ABC 123'
            }
        };

        // Generate QR code for the booking
        this.generateBookingQR(mockBooking);
    }

    async generateBookingQR(bookingData) {
        const qrContainer = document.getElementById('qrCode');
        const modalTitle = document.getElementById('qrModalTitle');
        const bookingDetails = document.getElementById('bookingDetails');

        // Generate a signature for the booking data
        const signature = this.generateSignature(bookingData);
        
        // Construct the data to be encoded in QR
        const qrData = {
            ...bookingData,
            signature
        };

        // Convert to URL-safe string
        const qrString = btoa(JSON.stringify(qrData));
        
        // Generate QR code URL
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrString}`;
        
        // Update the modal with comprehensive booking details
        qrContainer.innerHTML = `<img src="${qrCodeUrl}" alt="Booking QR Code">`;
        modalTitle.textContent = 'Booking Confirmed!';
        bookingDetails.innerHTML = `
            <div class="booking-detail">
                <span>Booking ID</span>
                <strong>#${bookingData.id}</strong>
            </div>
            <div class="booking-detail">
                <span>Customer</span>
                <strong>${bookingData.userName}</strong>
            </div>
            <div class="booking-detail">
                <span>Location</span>
                <strong>${bookingData.location}</strong>
            </div>
            <div class="booking-detail">
                <span>Date</span>
                <strong>${bookingData.date}</strong>
            </div>
            <div class="booking-detail">
                <span>Time</span>
                <strong>${bookingData.time}</strong>
            </div>
            <div class="booking-detail">
                <span>Duration</span>
                <strong>${bookingData.duration}</strong>
            </div>
            <div class="booking-detail">
                <span>Vehicle</span>
                <strong>${bookingData.vehicleDetails.type} - ${bookingData.vehicleDetails.plate}</strong>
            </div>
            <div class="booking-detail">
                <span>Amount Paid</span>
                <strong>$${bookingData.amount.toFixed(2)}</strong>
            </div>
            <div class="booking-detail">
                <span>Space Owner</span>
                <strong>${bookingData.ownerName}</strong>
            </div>
        `;

        // Show the modal
        this.showQRModal();
    }

    async initializeScanner() {
        try {
            // Get available video devices
            this.availableCameras = await QrScanner.listCameras(true);
            
            const videoElement = document.getElementById('scanner');
            this.scanner = new QrScanner(
                videoElement,
                this.onScanSuccess,
                {
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );

            // Set up camera switch button if multiple cameras available
            const switchCameraBtn = document.getElementById('switchCamera');
            if (this.availableCameras.length > 1 && switchCameraBtn) {
                switchCameraBtn.style.display = 'block';
                switchCameraBtn.addEventListener('click', this.switchCamera);
            }

        } catch (error) {
            this.showError('Failed to initialize scanner: ' + error.message);
        }
    }

    async startScanning() {
        if (!this.scanner) return;
        
        try {
            await this.scanner.start();
            this.isScanning = true;
            document.getElementById('scannerStatus').textContent = 'Scanning...';
        } catch (error) {
            this.showError('Failed to start scanner: ' + error.message);
        }
    }

    stopScanning() {
        if (!this.scanner) return;
        
        this.scanner.stop();
        this.isScanning = false;
        document.getElementById('scannerStatus').textContent = 'Scanner stopped';
    }

    async switchCamera() {
        if (!this.scanner) return;
        
        this.currentCamera = (this.currentCamera + 1) % this.availableCameras.length;
        try {
            await this.scanner.setCamera(this.availableCameras[this.currentCamera].id);
        } catch (error) {
            this.showError('Failed to switch camera: ' + error.message);
        }
    }

    async onScanSuccess(result) {
        try {
            // Decode the QR data
            const decodedData = JSON.parse(atob(result));
            
            // Verify the signature
            if (!this.verifyBooking(decodedData)) {
                throw new Error('Invalid booking signature');
            }

            // Stop scanning after successful scan
            this.stopScanning();
            
            // Show the scan result
            this.showScanResult(decodedData);

        } catch (error) {
            this.showError('Invalid QR Code: ' + error.message);
        }
    }

    verifyBooking(bookingData) {
        // In a real implementation, this would verify the signature
        // This is a dummy implementation
        return true;
    }

    showScanResult(bookingData) {
        const resultContainer = document.getElementById('scanResult');
        resultContainer.innerHTML = `
            <div class="scan-success">
                <i class="fas fa-check-circle"></i>
                <h3>Valid Booking Found</h3>
                <div class="booking-details">
                    <p><strong>Booking ID:</strong> ${bookingData.id}</p>
                    <p><strong>Location:</strong> ${bookingData.location}</p>
                    <p><strong>Date:</strong> ${bookingData.date}</p>
                    <p><strong>Duration:</strong> ${bookingData.duration}</p>
                </div>
            </div>
        `;
    }

    showError(message) {
        const errorContainer = document.getElementById('scannerError');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 3000);
        }
    }

    generateSignature(data) {
        // In a real implementation, this would generate a cryptographic signature
        // This is a dummy implementation
        return 'dummy-signature';
    }

    showQRModal() {
        const modal = document.getElementById('qrModal');
        modal.style.display = 'block';
    }

    closeQRModal() {
        const modal = document.getElementById('qrModal');
        modal.style.display = 'none';
    }

    async downloadQR() {
        const qrImage = document.querySelector('#qrCode img');
        if (!qrImage) return;

        try {
            const response = await fetch(qrImage.src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'booking-qr.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            this.showError('Failed to download QR code: ' + error.message);
        }
    }

    async shareBooking() {
        const bookingDetails = document.getElementById('bookingDetails');
        if (!bookingDetails) return;

        const shareData = {
            title: 'ParkNet Booking',
            text: bookingDetails.textContent,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (error) {
            this.showError('Failed to share booking: ' + error.message);
        }
    }
}

// Initialize the QR handler
const qrHandler = new QRHandler(); 