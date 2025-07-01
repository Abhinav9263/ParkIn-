class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.currentLanguage = 'en-US';
        this.voices = [];
        
        // Load voices when they are ready
        this.synthesis.onvoiceschanged = () => {
            this.voices = this.synthesis.getVoices();
            this.setVoiceForLanguage(this.currentLanguage);
        };

        // Language-specific voices
        this.languageVoices = {
            'en-US': null,
            'bn-IN': null,
            'hi-IN': null
        };

        // Commands in different languages
        this.commands = {
            'en-US': {
                'find parking near': this.findParking.bind(this),
                'navigate to': this.navigateToSpot.bind(this),
                'extend parking': this.extendParking.bind(this),
                'how much time': this.checkTimeLeft.bind(this),
                'add hour': this.addTime.bind(this),
                'set reminder': this.setReminder.bind(this),
                'book favorite': this.bookFavorite.bind(this),
                'cancel reservation': this.cancelReservation.bind(this),
                'save location': this.saveLocation.bind(this),
                'show rates': this.showRates.bind(this),
                'is covered parking': this.checkCoveredParking.bind(this),
                'parking history': this.showHistory.bind(this),
                'find ev charging': this.findEVCharging.bind(this),
                'reserve disabled spot': this.reserveDisabledSpot.bind(this),
                'valet parking': this.valetParking.bind(this),
                'monthly pass': this.monthlyPass.bind(this),
                'report issue': this.reportIssue.bind(this),
                'emergency help': this.emergencyHelp.bind(this),
                'parking rewards': this.checkRewards.bind(this),
                'share location': this.shareLocation.bind(this),
                'car wash service': this.carWashService.bind(this),
                'security check': this.securityCheck.bind(this),
                'maintenance request': this.maintenanceRequest.bind(this)
            },
            'bn-IN': {
                'পার্কিং খুঁজুন': this.findParking.bind(this),
                'নেভিগেট করুন': this.navigateToSpot.bind(this),
                'পার্কিং বাড়ান': this.extendParking.bind(this),
                'কত সময় বাকি': this.checkTimeLeft.bind(this),
                'এক ঘণ্টা যোগ করুন': this.addTime.bind(this),
                'রিমাইন্ডার সেট করুন': this.setReminder.bind(this),
                'প্রিয় স্থান বুক করুন': this.bookFavorite.bind(this),
                'রিজার্ভেশন বাতিল': this.cancelReservation.bind(this),
                'লোকেশন সেভ করুন': this.saveLocation.bind(this),
                'রেট দেখান': this.showRates.bind(this),
                'কভার্ড পার্কিং আছে': this.checkCoveredParking.bind(this),
                'পার্কিং ইতিহাস': this.showHistory.bind(this),
                'ইভি চার্জিং খুঁজুন': this.findEVCharging.bind(this),
                'প্রতিবন্ধী স্পট': this.reserveDisabledSpot.bind(this),
                'ভ্যালেট পার্কিং': this.valetParking.bind(this),
                'মাসিক পাস': this.monthlyPass.bind(this),
                'সমস্যা রিপোর্ট': this.reportIssue.bind(this),
                'জরুরি সাহায্য': this.emergencyHelp.bind(this),
                'পার্কিং রিওয়ার্ডস': this.checkRewards.bind(this),
                'লোকেশন শেয়ার': this.shareLocation.bind(this),
                'কার ওয়াশ': this.carWashService.bind(this),
                'নিরাপত্তা চেক': this.securityCheck.bind(this),
                'রক্ষণাবেক্ষণ অনুরোধ': this.maintenanceRequest.bind(this)
            },
            'hi-IN': {
                'पार्किंग खोजें': this.findParking.bind(this),
                'नेविगेट करें': this.navigateToSpot.bind(this),
                'पार्किंग बढ़ाएं': this.extendParking.bind(this),
                'कितना समय बचा': this.checkTimeLeft.bind(this),
                'एक घंटा जोड़ें': this.addTime.bind(this),
                'रिमाइंडर सेट करें': this.setReminder.bind(this),
                'पसंदीदा स्थान बुक करें': this.bookFavorite.bind(this),
                'रिजर्वेशन रद्द करें': this.cancelReservation.bind(this),
                'लोकेशन सेव करें': this.saveLocation.bind(this),
                'रेट दिखाएं': this.showRates.bind(this),
                'कवर्ड पार्किंग है': this.checkCoveredParking.bind(this),
                'पार्किंग इतिहास': this.showHistory.bind(this),
                'ईवी चार्जिंग खोजें': this.findEVCharging.bind(this),
                'विकलांग स्पॉट': this.reserveDisabledSpot.bind(this),
                'वैलेट पार्किंग': this.valetParking.bind(this),
                'मासिक पास': this.monthlyPass.bind(this),
                'समस्या रिपोर्ट': this.reportIssue.bind(this),
                'आपातकालीन मदद': this.emergencyHelp.bind(this),
                'पार्किंग रिवॉर्ड्स': this.checkRewards.bind(this),
                'लोकेशन शेयर': this.shareLocation.bind(this),
                'कार वॉश': this.carWashService.bind(this),
                'सुरक्षा जांच': this.securityCheck.bind(this),
                'मेंटेनेंस रिक्वेस्ट': this.maintenanceRequest.bind(this)
            }
        };

        this.setupVoiceRecognition();
        this.setupUI();
    }

    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('Voice recognition is not supported in your browser. Please try Chrome or Edge.');
            return;
        }

        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;

        this.recognition.onstart = () => this.onRecognitionStart();
        this.recognition.onresult = (event) => this.onRecognitionResult(event);
        this.recognition.onerror = (event) => this.onRecognitionError(event);
        this.recognition.onend = () => this.onRecognitionEnd();
    }

    setupUI() {
        this.voiceButton = document.querySelector('.voice-try-now button');
        this.voiceText = document.querySelector('.voice-text');
        this.voiceAnimation = document.querySelector('.voice-animation');
        
        // Add language selector
        this.setupLanguageSelector();

        // Add help button handler
        const helpButton = document.querySelector('.voice-help');
        if (helpButton) {
            helpButton.addEventListener('click', () => this.showCommandsGuide());
        }

        if (this.voiceButton) {
            this.voiceButton.addEventListener('click', () => this.toggleListening());
        }
    }

    setupLanguageSelector() {
        const languageSelector = document.createElement('div');
        languageSelector.className = 'language-selector';
        languageSelector.innerHTML = `
            <select class="language-select">
                <option value="en-US">English</option>
                <option value="bn-IN">বাংলা</option>
                <option value="hi-IN">हिंदी</option>
            </select>
        `;

        this.voiceButton.parentNode.insertBefore(languageSelector, this.voiceButton.nextSibling);
        
        const select = languageSelector.querySelector('select');
        select.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
    }

    setVoiceForLanguage(lang) {
        const voices = this.synthesis.getVoices();
        
        // Try to find a voice that matches the language exactly
        let voice = voices.find(v => v.lang === lang);
        
        // If no exact match, try to find a voice that starts with the language code
        if (!voice) {
            const langPrefix = lang.split('-')[0];
            voice = voices.find(v => v.lang.startsWith(langPrefix));
        }
        
        // Fallback to any available voice if no match found
        if (!voice && voices.length > 0) {
            voice = voices[0];
        }

        this.languageVoices[lang] = voice;
    }

    speak(text, lang = this.currentLanguage) {
        // Stop any ongoing speech
        this.synthesis.cancel();

        // Create utterance with the text
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language and voice
        utterance.lang = lang;
        utterance.voice = this.languageVoices[lang];

        // Adjust speech parameters based on language
        switch(lang) {
            case 'en-US':
                utterance.pitch = 1;
                utterance.rate = 1;
                break;
            case 'bn-IN':
                utterance.pitch = 1;
                utterance.rate = 0.9; // Slightly slower for Bengali
                break;
            case 'hi-IN':
                utterance.pitch = 1;
                utterance.rate = 0.9; // Slightly slower for Hindi
                break;
        }

        // Add sound effects for different states
        this.playSound('response');

        // Speak the text
        this.synthesis.speak(utterance);
    }

    playSound(type) {
        const sounds = {
            start: new Audio('sounds/start-listening.mp3'),
            stop: new Audio('sounds/stop-listening.mp3'),
            response: new Audio('sounds/response.mp3'),
            error: new Audio('sounds/error.mp3')
        };

        if (sounds[type]) {
            sounds[type].play().catch(e => console.log('Sound play failed:', e));
        }
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        this.recognition.lang = lang;
        this.setVoiceForLanguage(lang);
        this.updatePlaceholderText();
        
        // Announce language change
        const announcements = {
            'en-US': 'Switched to English',
            'bn-IN': 'বাংলা ভাষায় পরিবর্তন করা হয়েছে',
            'hi-IN': 'हिंदी में बदल दिया गया है'
        };
        this.speak(announcements[lang], lang);
    }

    updatePlaceholderText() {
        const placeholders = {
            'en-US': 'Try saying: "Find parking near Central Station"',
            'bn-IN': 'বলুন: "পার্কিং খুঁজুন সেন্ট্রাল স্টেশনের কাছে"',
            'hi-IN': 'बोलें: "सेंट्रल स्टेशन के पास पार्किंग खोजें"'
        };
        this.voiceText.textContent = placeholders[this.currentLanguage];
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        try {
            this.recognition.start();
            this.isListening = true;
            this.updateUI('Listening...');
            this.voiceAnimation.classList.add('active');
            this.voiceButton.classList.add('listening');
            this.playSound('start');
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.showError('Could not start voice recognition. Please try again.');
            this.playSound('error');
        }
    }

    stopListening() {
        this.recognition.stop();
        this.isListening = false;
        this.voiceAnimation.classList.remove('active');
        this.voiceButton.classList.remove('listening');
        this.playSound('stop');
    }

    onRecognitionStart() {
        this.updateUI('Listening...');
    }

    onRecognitionResult(event) {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

        this.updateUI(transcript);

        if (event.results[0].isFinal) {
            this.processCommand(transcript.toLowerCase());
        }
    }

    onRecognitionError(event) {
        console.error('Recognition error:', event.error);
        this.showError(`Error: ${event.error}`);
        this.stopListening();
    }

    onRecognitionEnd() {
        this.isListening = false;
        this.voiceAnimation.classList.remove('active');
        this.voiceButton.classList.remove('listening');
    }

    processCommand(transcript) {
        const commands = this.commands[this.currentLanguage];
        for (const [trigger, handler] of Object.entries(commands)) {
            if (transcript.includes(trigger)) {
                handler(transcript);
                return;
            }
        }
        
        const errorMessages = {
            'en-US': "I didn't understand that command. Please try again.",
            'bn-IN': "আমি কমান্ডটি বুঝতে পারিনি। অনুগ্রহ করে আবার চেষ্টা করুন।",
            'hi-IN': "मैं वह कमांड नहीं समझ पाया। कृपया पुनः प्रयास करें।"
        };
        this.showResponse(errorMessages[this.currentLanguage]);
    }

    // Command handlers
    findParking(transcript) {
        const location = transcript.split(/find parking near|পার্কিং খুঁজুন|पार्किंग खोजें/)[1]?.trim() || 'current location';
        const responses = {
            'en-US': `Searching for parking near ${location}. I found 3 spots available.`,
            'bn-IN': `${location} এর কাছে পার্কিং খোঁজা হচ্ছে। আমি ৩টি স্পট পেয়েছি।`,
            'hi-IN': `${location} के पास पार्किंग खोज रहे हैं। मुझे 3 स्पॉट मिले हैं।`
        };
        this.showResponse(responses[this.currentLanguage]);
    }

    navigateToSpot(transcript) {
        this.showResponse('Starting navigation to your parking spot...');
        // Integrate with navigation system
    }

    extendParking(transcript) {
        this.showResponse('Extending your parking time...');
        // Integrate with parking management system
    }

    checkTimeLeft(transcript) {
        this.showResponse('You have 2 hours and 15 minutes remaining.');
        // Get actual time from parking system
    }

    addTime(transcript) {
        this.showResponse('Adding 1 hour to your parking time...');
        // Integrate with payment and time extension system
    }

    setReminder(transcript) {
        this.showResponse('Setting a reminder for 15 minutes before your parking expires.');
        // Set up notification system
    }

    bookFavorite(transcript) {
        this.showResponse('Booking your favorite parking spot...');
        // Integrate with booking system
    }

    cancelReservation(transcript) {
        this.showResponse('Cancelling your reservation...');
        // Integrate with booking system
    }

    saveLocation(transcript) {
        this.showResponse('Saving current location to favorites...');
        // Integrate with user preferences system
    }

    showRates(transcript) {
        this.showResponse('Current parking rates: $2 per hour, $10 for all day parking.');
        // Get actual rates from system
    }

    checkCoveredParking(transcript) {
        this.showResponse('Yes, covered parking is available on levels 2 and 3.');
        // Get actual availability from system
    }

    showHistory(transcript) {
        this.showResponse('Displaying your parking history...');
        // Integrate with user history system
    }

    // New command handlers
    findEVCharging(transcript) {
        const response = {
            'en-US': 'Searching for EV charging stations nearby...',
            'bn-IN': 'কাছাকাছি ইভি চার্জিং স্টেশন খোঁজা হচ্ছে...',
            'hi-IN': 'नज़दीकी ईवी चार्जिंग स्टेशन खोज रहे हैं...'
        };
        this.showResponse(response[this.currentLanguage]);
        // Integration with EV charging station API
    }

    reserveDisabledSpot(transcript) {
        const response = {
            'en-US': 'Checking availability of accessible parking spots...',
            'bn-IN': 'প্রতিবন্ধী পার্কিং স্পটের উপলব্ধতা চেক করা হচ্ছে...',
            'hi-IN': 'विकलांग पार्किंग स्पॉट की उपलब्धता की जांच की जा रही है...'
        };
        this.showResponse(response[this.currentLanguage]);
        // Integration with accessibility parking system
    }

    valetParking(transcript) {
        const response = {
            'en-US': 'Requesting valet parking service...',
            'bn-IN': 'ভ্যালেট পার্কিং সেবা অনুরোধ করা হচ্ছে...',
            'hi-IN': 'वैलेट पार्किंग सेवा का अनुरोध किया जा रहा है...'
        };
        this.showResponse(response[this.currentLanguage]);
        // Integration with valet service
    }

    monthlyPass(transcript) {
        const response = {
            'en-US': 'Checking monthly parking pass options...',
            'bn-IN': 'মাসিক পার্কিং পাসের অপশন দেখা হচ্ছে...',
            'hi-IN': 'मासिक पार्किंग पास के विकल्प देखे जा रहे हैं...'
        };
        this.showResponse(response[this.currentLanguage]);
        // Integration with subscription system
    }

    reportIssue(transcript) {
        const response = {
            'en-US': 'Opening issue reporting form...',
            'bn-IN': 'সমস্যা রিপোর্টিং ফর্ম খোলা হচ্ছে...',
            'hi-IN': 'समस्या रिपोर्टिंग फॉर्म खोला जा रहा है...'
        };
        this.showResponse(response[this.currentLanguage]);
        // Integration with issue tracking system
    }

    emergencyHelp(transcript) {
        const response = {
            'en-US': 'Contacting emergency services...',
            'bn-IN': 'জরুরি পরিষেবার সাথে যোগাযোগ করা হচ্ছে...',
            'hi-IN': 'आपातकालीन सेवाओं से संपर्क किया जा रहा है...'
        };
        this.showResponse(response[this.currentLanguage]);
        // Integration with emergency services
    }

    checkRewards(transcript) {
        const response = {
            'en-US': 'Checking your parking rewards points...',
            'bn-IN': 'আপনার পার্কিং রিওয়ার্ড পয়েন্ট চেক করা হচ্ছে...',
            'hi-IN': 'आपके पार्किंग रिवॉर्ड पॉइंट्स की जांच की जा रही है...'
        };
        this.showResponse(response[this.currentLanguage]);
        // Integration with rewards system
    }

    shareLocation(transcript) {
        const response = {
            'en-US': 'Preparing to share your parking location...',
            'bn-IN': 'আপনার পার্কিং লোকেশন শেয়ার করার জন্য প্রস্তুত হচ্ছে...',
            'hi-IN': 'आपका पार्किंग लोकेशन शेयर करने की तैयारी हो रही है...'
        };
        this.showResponse(response[this.currentLanguage]);
        // Integration with sharing functionality
    }

    carWashService(transcript) {
        const response = {
            'en-US': 'Checking car wash service availability...',
            'bn-IN': 'কার ওয়াশ সেবার উপলব্ধতা চেক করা হচ্ছে...',
            'hi-IN': 'कार वॉश सेवा की उपलब्धता की जांच की जा रही है...'
        };
        this.showResponse(response[this.currentLanguage]);
        // Integration with car wash service
    }

    securityCheck(transcript) {
        const response = {
            'en-US': 'Requesting security check of your vehicle...',
            'bn-IN': 'আপনার গাড়ির নিরাপত্তা চেক অনুরোধ করা হচ্ছে...',
            'hi-IN': 'आपके वाहन की सुरक्षा जांच का अनुरोध किया जा रहा है...'
        };
        this.showResponse(response[this.currentLanguage]);
        // Integration with security system
    }

    maintenanceRequest(transcript) {
        const response = {
            'en-US': 'Submitting maintenance request...',
            'bn-IN': 'রক্ষণাবেক্ষণ অনুরোধ জমা দেওয়া হচ্ছে...',
            'hi-IN': 'मेंटेनेंस रिक्वेस्ट सबमिट की जा रही है...'
        };
        this.showResponse(response[this.currentLanguage]);
        // Integration with maintenance system
    }

    // UI updates
    updateUI(text) {
        if (this.voiceText) {
            this.voiceText.textContent = `"${text}"`;
        }
    }

    showResponse(message) {
        this.updateUI(message);
        this.speak(message);
        
        // Reset placeholder after delay
        setTimeout(() => {
            this.updatePlaceholderText();
        }, 5000); // Increased delay to account for speech duration
    }

    showError(message) {
        console.error(message);
        this.updateUI(`Error: ${message}`);
        this.playSound('error');
        this.speak(message);
    }

    // Add method to check if speech synthesis is supported
    checkSpeechSupport() {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis is not supported in this browser');
            return false;
        }
        return true;
    }

    // Add method to handle speech synthesis errors
    handleSpeechError(event) {
        console.error('Speech synthesis error:', event);
        this.playSound('error');
    }

    showCommandsGuide() {
        // Create modal for commands guide
        const modal = document.createElement('div');
        modal.className = 'commands-modal';
        modal.innerHTML = `
            <div class="commands-content">
                <div class="commands-header">
                    <h2>Voice Commands Guide</h2>
                    <button class="close-modal">×</button>
                </div>
                <div class="commands-body">
                    <div class="commands-tabs">
                        <button class="tab-btn active" data-category="basic">Basic Commands</button>
                        <button class="tab-btn" data-category="booking">Booking</button>
                        <button class="tab-btn" data-category="services">Services</button>
                        <button class="tab-btn" data-category="support">Support</button>
                    </div>
                    <div class="commands-list">
                        <div class="command-category active" id="basic">
                            <h3>Basic Parking Commands</h3>
                            <ul>
                                <li>
                                    <strong>${this.getCommandInCurrentLanguage('find parking')}</strong>
                                    <span>Search for available parking spots</span>
                                </li>
                                <li>
                                    <strong>${this.getCommandInCurrentLanguage('navigate to')}</strong>
                                    <span>Get directions to your parked vehicle</span>
                                </li>
                                <!-- Add more basic commands -->
                            </ul>
                        </div>
                        <!-- Add more categories -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => modal.remove());

        const tabs = modal.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show corresponding category
                const category = tab.dataset.category;
                const categories = modal.querySelectorAll('.command-category');
                categories.forEach(c => c.classList.remove('active'));
                modal.querySelector(`#${category}`).classList.add('active');
            });
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    getCommandInCurrentLanguage(command) {
        const commands = {
            'find parking': {
                'en-US': 'Find parking near [location]',
                'bn-IN': 'পার্কিং খুঁজুন [location]',
                'hi-IN': 'पार्किंग खोजें [location]'
            },
            'navigate to': {
                'en-US': 'Navigate to my parking spot',
                'bn-IN': 'নেভিগেট করুন',
                'hi-IN': 'नेविगेट करें'
            }
            // Add more commands
        };

        return commands[command][this.currentLanguage] || commands[command]['en-US'];
    }
}

// Initialize voice assistant when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const voiceAssistant = new VoiceAssistant();
}); 