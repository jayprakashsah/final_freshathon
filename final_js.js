// Model configuration
const MODEL_URL = "./model/";
let model, webcam, maxPredictions;
let currentLanguage = 'en';

// DOM elements
const webcamBtn = document.getElementById('webcam-btn');
const uploadBtn = document.getElementById('upload-btn');
const detectBtn = document.getElementById('detect-btn');
const fileInput = document.getElementById('file-input');
const webcamContainer = document.getElementById('webcam-container');
const imagePreview = document.getElementById('image-preview');
const labelContainer = document.getElementById('label-container');
const treatmentText = document.getElementById('treatment-text');
const medicineInfo = document.getElementById('medicine-info');
const preventionInfo = document.getElementById('prevention-info');
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
        
        // Display captured image
        document.querySelector('.upload-label').style.display = 'none';
        imagePreview.innerHTML = <img src="${imageData}" alt="Captured plant image">;
        imagePreview.style.display = 'block';
        document.getElementById('clear-image-btn').style.display = 'block';
        detectBtn.disabled = false;
    } catch (error) {
        console.error("Error capturing photo:", error);
        alert("Could not capture photo. Please try again.");
    }
}

// Handle file upload
function handleFileUpload() {
    const file = fileInput.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
        alert('Please select an image file.');
        return;
    }
    
    // Display the image
    const reader = new FileReader();
    reader.onload = (e) => {
        // Hide placeholder
        document.querySelector('.upload-label').style.display = 'none';
        
        // Show image preview
        imagePreview.innerHTML = <img src="${e.target.result}" alt="Uploaded plant image">;
        imagePreview.style.display = 'block';
        document.getElementById('clear-image-btn').style.display = 'block';
        
        // Enable detect button
        detectBtn.disabled = false;
        
        // Remove webcam if active
        if (webcam) {
            webcam.stop();
            webcam = null;
        }
    };
    reader.readAsDataURL(file);
}

// Clear uploaded image
function clearImage() {
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';
    document.getElementById('clear-image-btn').style.display = 'none';
    document.querySelector('.upload-label').style.display = 'flex';
    detectBtn.disabled = true;
    fileInput.value = '';
}

// Run prediction
async function predict() {
    if (!model) {
        alert("Model is not loaded yet. Please try again shortly.");
        return;
    }
    
    let prediction;
    try {
        detectBtn.disabled = true;
        detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
        
        // Get the image source
        const image = webcam ? webcam.canvas : document.querySelector('#image-preview img');
        if (!image) {
            alert("Please select an image or enable webcam first.");
            return;
        }
        
        prediction = await model.predict(image);
        
        // Display results
        displayResults(prediction);
    } catch (error) {
        console.error("Prediction error:", error);
        labelContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error during detection. Please try again.</p>
            </div>
        `;
    } finally {
        detectBtn.disabled = false;
        detectBtn.innerHTML = '<i class="fas fa-search"></i> Detect Disease';
    }
}

// Display prediction results
function displayResults(prediction) {
    // Clear previous results
    labelContainer.innerHTML = '';
    
    // Find the top prediction
    let topPrediction = prediction.reduce((prev, current) => 
        (prev.probability > current.probability) ? prev : current
    );

    // Display only the main result
    const resultItem = document.createElement('div');
    resultItem.className = 'main-result';
    resultItem.innerHTML = `
        <div class="disease-name">${topPrediction.className}</div>
        <div class="confidence">
            <span>Confidence:</span>
            <div class="progress-bar">
                <div class="progress" style="width: ${topPrediction.probability * 100}%"></div>
            </div>
            <span class="percentage">${Math.round(topPrediction.probability * 100)}%</span>
        </div>
    `;
    labelContainer.appendChild(resultItem);

    // Display detailed information
    displayDetailedInfo(topPrediction.className);
}

// Display detailed disease information
function displayDetailedInfo(diseaseName) {
    const diseaseKey = diseaseName.toLowerCase().replace(/\s+/g, '_');
    const disease = diseaseDatabase[diseaseKey] || diseaseDatabase['healthy'];
    const translation = disease.translations[currentLanguage] || disease.translations['en'];
    
    // Treatment
    treatmentText.innerHTML = `
        <p>${translation.treatment}</p>
        <div class="affected-plants">
            <strong>Affected Plants:</strong> ${disease.affected_plants.join(', ')}
        </div>
        <div class="scientific-name">
            <strong>Scientific Name:</strong> ${disease.scientific_name}
        </div>
    `;
    
    // Medicines
    medicineInfo.innerHTML = translation.medicines.length > 0 
        ? translation.medicines.map(med => `
            <div class="medicine-card">
                <h5>${med.name} <span class="badge">${med.type}</span></h5>
                <div class="medicine-detail">
                    <label>Dosage:</label>
                    <span>${med.dosage}</span>
                </div>
                <div class="medicine-detail">
                    <label>Frequency:</label>
                    <span>${med.frequency}</span>
                </div>
                <div class="medicine-detail">
                    <label>Instructions:</label>
                    <span>${med.instructions}</span>
                </div>
            </div>
        `).join('')
        : <p>No specific medicines recommended for this condition.</p>;
    
    // Prevention
    preventionInfo.innerHTML = `
        <p>${translation.prevention}</p>
    `;
}

// Set language for the page
function setLanguage(lang) {
    currentLanguage = lang;
    const translations = {
        en: {
            "home": "Home",
            "about": "About",
            "diseases": "Diseases",
            "contact": "Contact",
            "hero-title": "Detect Crop Diseases with AI",
            "hero-subtitle": "Upload an image or use your camera to identify plant diseases instantly",
            "use-webcam": "Use Webcam",
            "upload-image": "Upload Image",
            "detection-title": "Disease Detection",
            "webcam-placeholder": "Webcam feed will appear here",
            "upload-label": "Choose or drag an image",
            "results-placeholder": "Results will appear here",
            "detect-disease": "Detect Disease",
            "results-title": "Detection Results",
            "treatment-title": "Recommended Treatment",
            "medicine-title": "Recommended Medicines",
            "prevention-title": "Prevention Tips",
            "stop-webcam": "Stop Camera",
            "capture-photo": "Capture Photo",
            "clear-image": "Clear Image",
            "footer-about": "About AgroVision",
            "footer-about-text": "AI-powered crop disease detection system helping farmers worldwide.",
            "footer-links": "Quick Links",
            "footer-contact": "Contact Us",
            "footer-copyright": "© 2023 AgroVision. All rights reserved.",
            "chatbot-title": "AgroVision Assistant",
            "chatbot-placeholder": "Type your question..."
        },
        es: {
            "home": "Inicio",
            "about": "Acerca de",
            "diseases": "Enfermedades",
            "contact": "Contacto",
            "hero-title": "Detecta Enfermedades de Cultivos con IA",
            "hero-subtitle": "Sube una imagen o usa tu cámara para identificar enfermedades de plantas al instante",
            "use-webcam": "Usar Cámara",
            "upload-image": "Subir Imagen",
            "detection-title": "Detección de Enfermedades",
            "webcam-placeholder": "La cámara aparecerá aquí",
            "upload-label": "Elige o arrastra una imagen",
            "results-placeholder": "Los resultados aparecerán aquí",
            "detect-disease": "Detectar Enfermedad",
            "results-title": "Resultados de Detección",
            "treatment-title": "Tratamiento Recomendado",
            "medicine-title": "Medicamentos Recomendados",
            "prevention-title": "Consejos de Prevención",
            "stop-webcam": "Detener Cámara",
            "capture-photo": "Capturar Foto",
            "clear-image": "Limpiar Imagen",
            "footer-about": "Acerca de AgroVision",
            "footer-about-text": "Sistema de detección de enfermedades en cultivos potenciado por IA que ayuda a agricultores en todo el mundo.",
            "footer-links": "Enlaces Rápidos",
            "footer-contact": "Contáctenos",
            "footer-copyright": "© 2023 AgroVision. Todos los derechos reservados.",
            "chatbot-title": "Asistente AgroVision",
            "chatbot-placeholder": "Escribe tu pregunta..."
        },
        hi: {
            "home": "होम",
            "about": "हमारे बारे में",
            "diseases": "रोग",
            "contact": "संपर्क करें",
            "hero-title": "AI के साथ फसल रोगों का पता लगाएं",
            "hero-subtitle": "पौधों की बीमारियों को तुरंत पहचानने के लिए एक छवि अपलोड करें या अपने कैमरे का उपयोग करें",
            "use-webcam": "वेबकैम का उपयोग करें",
            "upload-image": "छवि अपलोड करें",
            "detection-title": "रोग पहचान",
            "webcam-placeholder": "वेबकैम फीड यहां दिखाई देगी",
            "upload-label": "एक छवि चुनें या खींचें",
            "results-placeholder": "परिणाम यहां दिखाई देंगे",
            "detect-disease": "रोग का पता लगाएं",
            "results-title": "पहचान परिणाम",
            "treatment-title": "अनुशंसित उपचार",
            "medicine-title": "अनुशंसित दवाएं",
            "prevention-title": "रोकथाम के उपाय",
            "stop-webcam": "कैमरा बंद करें",
            "capture-photo": "फोटो कैप्चर करें",
            "clear-image": "छवि साफ करें",
            "footer-about": "एग्रोविजन के बारे में",
            "footer-about-text": "AI-संचालित फसल रोग पहचान प्रणाली जो दुनिया भर के किसानों की मदद करती है।",
            "footer-links": "त्वरित लिंक",
            "footer-contact": "हमसे संपर्क करें",
            "footer-copyright": "© 2023 एग्रोविजन। सर्वाधिकार सुरक्षित।",
            "chatbot-title": "एग्रोविजन सहायक",
            "chatbot-placeholder": "अपना प्रश्न टाइप करें..."
        },
        np: {
            "home": "गृहपृष्ठ",
            "about": "हाम्रो बारेमा",
            "diseases": "रोगहरू",
            "contact": "सम्पर्क गर्नुहोस्",
            "hero-title": "AI को साथ बालीनाली रोगहरू पत्ता लगाउनुहोस्",
            "hero-subtitle": "एउटा तस्वीर अपलोड गर्नुहोस् वा आफ्नो क्यामेरा प्रयोग गरेर रोगहरू पत्ता लगाउनुहोस्",
            "use-webcam": "वेबक्याम प्रयोग गर्नुहोस्",
            "upload-image": "तस्वीर अपलोड गर्नुहोस्",
            "detection-title": "रोग पत्ता लगाउने",
            "webcam-placeholder": "वेबक्याम यहाँ देखिनेछ",
            "upload-label": "तस्वीर छान्नुहोस् वा तान्नुहोस्",
            "results-placeholder": "नतिजा यहाँ देखिनेछ",
            "detect-disease": "रोग पत्ता लगाउनुहोस्",
            "results-title": "पत्ता लगाउने नतिजा",
            "treatment-title": "सिफारिस गरिएको उपचार",
            "medicine-title": "सिफारिस गरिएका औषधिहरू",
            "prevention-title": "रोकथाम सल्लाहहरू",
            "stop-webcam": "क्यामेरा बन्द गर्नुहोस्",
            "capture-photo": "फोटो क्याप्चर गर्नुहोस्",
            "clear-image": "तस्वीर मेटाउनुहोस्",
            "footer-about": "AgroVision को बारेमा",
            "footer-about-text": "AI-सक्षम बालीनाली रोग पत्ता लगाउने प्रणाली जसले विश्वभरका किसानहरूलाई मद्दत गर्दछ।",
            "footer-links": "छिटो लिङ्कहरू",
            "footer-contact": "हामीलाई सम्पर्क गर्नुहोस्",
            "footer-copyright": "© २०२३ AgroVision. सर्वाधिकार सुरक्षित।",
            "chatbot-title": "AgroVision सहायक",
            "chatbot-placeholder": "आफ्नो प्रश्न टाइप गर्नुहोस्..."
        },
        bh: {
            "home": "घर",
            "about": "हमार बारे में",
            "diseases": "रोग",
            "contact": "संपर्क करीं",
            "hero-title": "AI के सहायता से फसल के बीमारी के पता लगाव",
            "hero-subtitle": "एगो तस्वीर अपलोड करीं या अपना कैमरा के इस्तेमाल करके पौधा के बीमारी के पहचान करीं",
            "use-webcam": "वेबकैम इस्तेमाल करीं",
            "upload-image": "तस्वीर अपलोड करीं",
            "detection-title": "बीमारी के पहचान",
            "webcam-placeholder": "वेबकैम यहाँ देखाई देई",
            "upload-label": "तस्वीर चुनीं या खींचीं",
            "results-placeholder": "नतीजा यहाँ देखाई देई",
            "detect-disease": "बीमारी के पता लगाव",
            "results-title": "पहचान के नतीजा",
            "treatment-title": "सलाह दिहल उपचार",
            "medicine-title": "सलाह दिहल दवाई",
            "prevention-title": "रोकथाम के सलाह",
            "stop-webcam": "कैमरा बंद करीं",
            "capture-photo": "फोटो कैप्चर करीं",
            "clear-image": "तस्वीर साफ करीं",
            "footer-about": "एग्रोविजन के बारे में",
            "footer-about-text": "AI-चालित फसल बीमारी पहचान प्रणाली जवन दुनिया भर के किसान के मदद करेला।",
            "footer-links": "जल्दी लिंक",
            "footer-contact": "हमसे संपर्क करीं",
            "footer-copyright": "© 2023 एग्रोविजन। सब अधिकार सुरक्षित।",
            "chatbot-title": "एग्रोविजन सहायक",
            "chatbot-placeholder": "अपना सवाल टाइप करीं..."
        }
    };

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = translations[lang]?.[key] || translations['en'][key];
        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        }
    });

    // Update disease info if results are showing
    if (labelContainer.querySelector('.main-result')) {
        const diseaseName = labelContainer.querySelector('.disease-name').textContent;
        displayDetailedInfo(diseaseName);
    }
}

// Google Assistant Integration
function setupVoiceAssistant() {
    const assistantBtn = document.getElementById('assistant-btn');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        assistantBtn.style.display = 'none';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguage;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    assistantBtn.addEventListener('click', () => {
        recognition.start();
        assistantBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        assistantBtn.classList.add('listening');
    });

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(command);
    };

    recognition.onerror = (event) => {
        console.error('Voice recognition error', event.error);
        resetAssistantButton();
    };

    recognition.onend = resetAssistantButton;

    function resetAssistantButton() {
        assistantBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        assistantBtn.classList.remove('listening');
    }
}

function handleVoiceCommand(command) {
    console.log("Voice command:", command);
    
    if (command.includes('detect') || command.includes('scan')) {
        document.getElementById('detect-btn').click();
    } 
    else if (command.includes('camera') || command.includes('webcam')) {
        document.getElementById('webcam-btn').click();
    }
    else if (command.includes('upload')) {
        document.getElementById('upload-btn').click();
    }
    else if (command.includes('stop')) {
        if (webcam) stopWebcam();
    }
    else if (command.includes('change language')) {
        const langMap = {
            'english': 'en', 'spanish': 'es', 'french': 'fr',
            'hindi': 'hi', 'nepali': 'np', 'bhojpuri': 'bh'
        };
        
        for (const [key, value] of Object.entries(langMap)) {
            if (command.includes(key)) {
                currentLanguage = value;
                languageSelect.value = value;
                setLanguage(value);
                break;
            }
        }
    }
    else {
        // Route to chatbot
        document.getElementById('chatbot-input-field').value = command;
        document.getElementById('send-chatbot-message').click();
    }
}

// Chatbot functions
function toggleChatbot() {
    const chatbot = document.getElementById('chatbot-container');
    if (chatbot.style.display === 'flex') {
        chatbot.style.display = 'none';
    } else {
        chatbot.style.display = 'flex';
        // Initialize with a welcome message
        if (document.getElementById('chatbot-messages').children.length === 0) {
            addChatbotMessage('bot', "Hello! I'm AgroVision Assistant. How can I help you with plant diseases today?");
        }
    }
}

function addChatbotMessage(sender, message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', ${sender}-message);
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function sendChatbotMessage() {
    const inputField = document.getElementById('chatbot-input-field');
    const message = inputField.value.trim();
    
    if (!message) return;
    
    addChatbotMessage('user', message);
    inputField.value = '';
    
    // Show typing indicator
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing';
    typingIndicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
        // Get AI response (simplified for demo)
        let response;
        if (message.toLowerCase().includes('hello')) {
            response = "Hello! I'm AgroVision Assistant. How can I help with plant diseases today?";
        } else if (message.toLowerCase().includes('treatment')) {
            response = "For treatment recommendations, please use the disease detection tool first.";
        } else if (message.toLowerCase().includes('language')) {
            response = "You can change language using the dropdown menu in the top right corner.";
        } else {
            response = "I can help with plant disease information. Try asking about specific diseases or use the detection tool.";
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove typing indicator and show response
        typingIndicator.remove();
        addChatbotMessage('bot', response);
    } catch (error) {
        console.error("Chatbot error:", error);
        typingIndicator.remove();
        addChatbotMessage('bot', "Sorry, I'm having trouble responding. Please try again.");
    }
}

function startVoiceInput() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = currentLanguage;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            document.getElementById('voice-input-btn').innerHTML = '<i class="fas fa-microphone-slash"></i>';
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chatbot-input-field').value = transcript;
            document.getElementById('voice-input-btn').innerHTML = '<i class="fas fa-microphone"></i>';
            sendChatbotMessage();
        };
        
        recognition.onerror = (event) => {
            console.error('Voice recognition error', event.error);
            document.getElementById('voice-input-btn').innerHTML = '<i class="fas fa-microphone"></i>';
        };
        
        recognition.start();
    } else {
        alert("Voice recognition not supported in your browser. Try Chrome or Edge.");
    }
}