const webcamBtn = document.getElementById('webcam-btn');
const uploadBtn = document.getElementById('upload-btn');
const detectBtn = document.getElementById('detect-btn');
const fileInput = document.getElementById('file-input');
const webcamContainer = document.getElementById('webcam-container');
const imagePreview = document.getElementById('image-preview');

function initEventListeners() {
    webcamBtn.addEventListener('click', initWebcam);
    uploadBtn.addEventListener('click', () => fileInput.click());
    detectBtn.addEventListener('click', predict);
    fileInput.addEventListener('change', handleFileUpload);
    languageSelect.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        setLanguage(currentLanguage);
    });
    
    // Drag and drop for file upload
    const uploadLabel = document.querySelector('.upload-label');
    uploadLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadLabel.classList.add('dragover');
    });
    
    uploadLabel.addEventListener('dragleave', () => {
        uploadLabel.classList.remove('dragover');
    });
    
    uploadLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadLabel.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileUpload();
        }
    });
}
function initChatbot() {
    const chatbotBtn = document.getElementById('chatbot-btn');
    const closeBtn = document.getElementById('close-chatbot');
    const sendBtn = document.getElementById('send-chatbot-message');
    const voiceBtn = document.getElementById('voice-input-btn');
    
    chatbotBtn.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', toggleChatbot);
    sendBtn.addEventListener('click', sendChatbotMessage);
    voiceBtn.addEventListener('click', startVoiceInput);
    
    // Enter key support
    document.getElementById('chatbot-input-field').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatbotMessage();
    });
}

// Load the Teachable Machine model
async function loadModel() {
    try {
        detectBtn.disabled = true;
        detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading Model...';
        
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        
        detectBtn.disabled = false;
        detectBtn.innerHTML = '<i class="fas fa-search"></i> Detect Disease';
    } catch (error) {
        console.error("Error loading model:", error);
        detectBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Model Failed';
        labelContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Model failed to load. Please refresh the page.</p>
            </div>
        `;
    }
}

// Initialize webcam
async function initWebcam() {
    try {
        // Hide placeholder
        webcamContainer.querySelector('.placeholder').style.display = 'none';
        
        // Setup webcam
        const flip = true;
        webcam = new tmImage.Webcam(400, 400, flip);
        await webcam.setup();
        await webcam.play();
        
        // Clear container and add webcam
        webcamContainer.innerHTML = '';
        webcamContainer.appendChild(webcam.canvas);
        
        // Add controls
        const controls = document.createElement('div');
        controls.className = 'webcam-controls';
        controls.innerHTML = `
            <button id="stop-webcam-btn" class="btn danger">
                <i class="fas fa-stop"></i> <span>Stop Camera</span>
            </button>
            <button id="capture-btn" class="btn secondary">
                <i class="fas fa-camera"></i> <span>Capture Photo</span>
            </button>
        `;
        webcamContainer.appendChild(controls);
        
        // Add event listeners
        document.getElementById('stop-webcam-btn').addEventListener('click', stopWebcam);
        document.getElementById('capture-btn').addEventListener('click', capturePhoto);
        
        // Enable detect button
        detectBtn.disabled = false;
        
        // Update webcam feed
        window.requestAnimationFrame(updateWebcam);
        
        // Hide image preview if showing
        imagePreview.style.display = 'none';
        document.getElementById('clear-image-btn').style.display = 'none';
        document.querySelector('.upload-label').style.display = 'flex';
    } catch (error) {
        console.error("Error initializing webcam:", error);
        webcamContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Could not access the webcam. Please check permissions.</p>
            </div>
        `;
    }
}

// Update webcam feed
function updateWebcam() {
    if (webcam) {
        webcam.update();
        window.requestAnimationFrame(updateWebcam);
    }
}

// Stop webcam
function stopWebcam() {
    if (webcam) {
        webcam.stop();
        webcam = null;
        
        // Show placeholder again
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.innerHTML = `
            <i class="fas fa-camera"></i>
            <p>Webcam feed will appear here</p>
        `;
        
        webcamContainer.innerHTML = '';
        webcamContainer.appendChild(placeholder);
    }
}

// Capture photo from webcam
function capturePhoto() {
    if (!webcam) return;
    
    try {
        // Create canvas to capture image
        const canvas = document.createElement('canvas');
        canvas.width = webcam.canvas.width;
        canvas.height = webcam.canvas.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(webcam.canvas, 0, 0);
        
        // Convert to data URL
        const imageData = canvas.toDataURL('image/png');
        
        // Stop webcam
        stopWebcam();