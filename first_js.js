const webcamBtn = document.getElementById('webcam-btn');
const uploadBtn = document.getElementById('upload-btn');
const detectBtn = document.getElementById('detect-btn');

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