// Model configuration
const MODEL_URL = "./model/";
let model, webcam, maxPredictions;
let cwebcamBtnguage = 'en';

// DOM elements
const webcamBtn = document.getElementById('webcam-btn');
const detectBtn = document.getElementById('detect-btn');
const detectBtn = document.getElementById('detect-btn');
const fileInput = document.getElementById('file-input');
const webcamContainer = document.getElementupload-btnam-container');
const imagePreview = document.getElementById('image-preview');

const languageSelect = document.getElementById('language-select');

// Disease database with translations
// Disease database with translations
const diseaseDatabase = {
    "healthy": {
        "scientific_name": "Healthy Plant",
        "affected_plants": ["All"],
        "translations": {
            "en": {
                "treatment": "Your plant appears healthy. Continue regular care and monitoring.",
                "medicines": [],
                "prevention": "Maintain proper watering, sunlight, and nutrient levels."
            },
            // Other languages...
        }
    },
    
    // Apple Diseases
    "apple_scab": {
        "scientific_name": "Venturia inaequalis",
        "affected_plants": ["Apple (Malus domestica)"],
        "translations": {
            "en": {
                "treatment": "Apply fungicides such as Captan, Mancozeb, or sulfur-based sprays starting at the green tip stage of bud development.",
                "medicines": ["Captan", "Mancozeb", "Sulfur-based fungicides"],
                "prevention": "Prune trees to improve air circulation. Remove fallen leaves and debris. Plant resistant apple varieties."
            }
            // Other languages...
        }
    },
    "black_rot_apple": {
        "scientific_name": "Botryosphaeria obtusa",
        "affected_plants": ["Apple (Malus domestica)"],
        "translations": {
            "en": {
                "treatment": "Use copper-based fungicides during the growing season.",
                "medicines": ["Copper-based fungicides"],
                "prevention": "Prune and destroy infected branches. Remove plant debris. Avoid overhead irrigation."
            }
            // Other languages...
        }
    },
    "cedar_apple_rust": {
        "scientific_name": "Gymnosporangium juniperi-virginianae",
        "affected_plants": ["Apple (Malus domestica)", "Eastern Red Cedar (Juniperus virginiana)"],
        "translations": {
            "en": {
                "treatment": "Apply fungicides like myclobutanil or propiconazole during early leaf development.",
                "medicines": ["Myclobutanil", "Propiconazole"],
                "prevention": "Remove nearby juniper hosts. Plant resistant apple cultivars. Prune infected areas."
            }
            // Other languages...
        }
    },
    
    // Grape Diseases
    "black_rot_grape": {
        "scientific_name": "Guignardia bidwellii",
        "affected_plants": ["Grape (Vitis vinifera)"],
        "translations": {
            "en": {
                "treatment": "Apply fungicides such as myclobutanil or captan from bud break through fruit development.",
                "medicines": ["Myclobutanil", "Captan"],
                "prevention": "Prune and remove infected canes. Ensure good air circulation. Implement regular spray program."
            }
            // Other languages...
        }
    },
    "esca": {
        "scientific_name": "Phaeomoniella chlamydospora and Phaeoacremonium aleophilum",
        "affected_plants": ["Grape (Vitis vinifera)"],
        "translations": {
            "en": {
                "treatment": "No effective chemical control; focus on cultural practices.",
                "medicines": [],
                "prevention": "Avoid pruning during wet conditions. Remove infected vines. Implement proper irrigation."
            }
            // Other languages...
        }
    },
    
    // Citrus Disease
    "huanglongbing": {
        "scientific_name": "Candidatus Liberibacter spp.",
        "affected_plants": ["Citrus trees (Citrus spp.)"],
        "translations": {
            "en": {
                "treatment": "No cure; manage by controlling the vector and removing infected trees.",
                "medicines": [],
                "prevention": "Control Asian citrus psyllid populations. Use certified disease-free planting material."
            }
            // Other languages...
        }
    },
    
    // Bell Pepper Disease
    "bacterial_spot_pepper": {
        "scientific_name": "Xanthomonas campestris pv. vesicatoria",
        "affected_plants": ["Bell Pepper (Capsicum annuum)"],
        "translations": {
            "en": {
                "treatment": "Use copper-based bactericides at the first sign of disease.",
                "medicines": ["Copper-based bactericides"],
                "prevention": "Use disease-free seeds. Avoid working when plants are wet. Rotate crops."
            }
            // Other languages...
        }
    },
    
    // Tomato Diseases
    "bacterial_spot_tomato": {
        "scientific_name": "Xanthomonas campestris pv. vesicatoria",
        "affected_plants": ["Tomato (Solanum lycopersicum)"],
        "translations": {
            "en": {
                "treatment": "Use copper-based bactericides at the first sign of disease.",
                "medicines": ["Copper-based bactericides"],
                "prevention": "Use disease-free seeds. Avoid wet conditions. Implement crop rotation."
            }
            // Other languages...
        }
    },
    "early_blight_tomato": {
        "scientific_name": "Alternaria solani",
        "affected_plants": ["Tomato (Solanum lycopersicum)"],
        "translations": {
            "en": {
                "treatment": "Apply fungicides such as chlorothalonil or mancozeb when symptoms appear.",
                "medicines": ["Chlorothalonil", "Mancozeb"],
                "prevention": "Remove infected plant debris. Stake plants. Rotate crops annually."
            }
            // Other languages...
        }
    },
    
    // Potato Diseases
    "early_blight_potato": {
        "scientific_name": "Alternaria solani",
        "affected_plants": ["Potato (Solanum tuberosum)"],
        "translations": {
            "en": {
                "treatment": "Start fungicide applications early in the season, especially under warm, wet conditions.",
                "medicines": ["Chlorothalonil", "Mancozeb", "Azoxystrobin"],
                "prevention": "Remove crop residues. Use certified disease-free seed potatoes. Maintain proper spacing."
            }
            // Other languages...
        }
    },
    "late_blight": {
        "scientific_name": "Phytophthora infestans",
        "affected_plants": ["Potato (Solanum tuberosum)"],
        "translations": {
            "en": {
                "treatment": "Apply protective fungicides before the disease appears. Destroy infected tubers.",
                "medicines": ["Metalaxyl", "Mancozeb", "Cymoxanil"],
                "prevention": "Avoid overhead irrigation. Plant resistant varieties. Use proper crop rotation."
            }
            // Other languages...
        }
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    initEventListeners();
    await loadModel();
    setupVoiceAssistant();
    setLanguage(currentLanguage);
    initChatbot();
});

// Set up event listeners
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

// Initialize chatbot
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