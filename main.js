// Initialize Three.js components
let scene, camera, renderer, car, carBody;
let isRotating = true;

// Car color
let currentColor = '#ff0000'; // Default red

// Key mapping for visual feedback
const keyMap = {
    'w': 'w-key',
    'arrowup': 'w-key-arrow',
    's': 's-key',
    'arrowdown': 's-key-arrow',
    'a': 'a-key',
    'arrowleft': 'a-key-arrow',
    'd': 'd-key',
    'arrowright': 'd-key-arrow',
    ' ': 'space-key'
};

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e1e1e);

    // Get container dimensions
    const container = document.getElementById('car-model');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Create camera with correct aspect ratio
    camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 4); // Adjusted camera position
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerWidth, containerHeight);
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);

    // Create car
    createCar();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

// Create a simple F1-style racing car
function createCar() {
    car = new THREE.Group();
    
    // Create car body (main chassis)
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 4);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: currentColor });
    carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    carBody.position.y = 0.5;
    car.add(carBody);

    // Create cockpit
    const cockpitGeometry = new THREE.BoxGeometry(0.8, 0.4, 1.2);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.7, -0.2);
    car.add(cockpit);

    // Create front wing
    const frontWingGeometry = new THREE.BoxGeometry(2.2, 0.1, 0.5);
    const frontWingMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const frontWing = new THREE.Mesh(frontWingGeometry, frontWingMaterial);
    frontWing.position.set(0, 0.3, 2);
    car.add(frontWing);

    // Create rear wing
    const rearWingGeometry = new THREE.BoxGeometry(2.2, 0.5, 0.1);
    const rearWingMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const rearWing = new THREE.Mesh(rearWingGeometry, rearWingMaterial);
    rearWing.position.set(0, 0.8, -1.8);
    car.add(rearWing);

    // Create rear wing supports
    const supportGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.4);
    const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
    leftSupport.position.set(0.8, 0.6, -1.8);
    car.add(leftSupport);
    
    const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
    rightSupport.position.set(-0.8, 0.6, -1.8);
    car.add(rightSupport);

    // Create wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 24);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
    
    // Front left wheel
    const frontLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontLeftWheel.rotation.z = Math.PI / 2;
    frontLeftWheel.position.set(1, 0.4, 1.3);
    car.add(frontLeftWheel);
    
    // Front right wheel
    const frontRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontRightWheel.rotation.z = Math.PI / 2;
    frontRightWheel.position.set(-1, 0.4, 1.3);
    car.add(frontRightWheel);
    
    // Rear left wheel
    const rearLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearLeftWheel.rotation.z = Math.PI / 2;
    rearLeftWheel.position.set(1, 0.4, -1.3);
    car.add(rearLeftWheel);
    
    // Rear right wheel
    const rearRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearRightWheel.rotation.z = Math.PI / 2;
    rearRightWheel.position.set(-1, 0.4, -1.3);
    car.add(rearRightWheel);

    // Add car to scene
    scene.add(car);
}

// Update car color
function updateCarColor(color) {
    currentColor = color;
    carBody.material.color.set(color);
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('car-model');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(containerWidth, containerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate car if rotation is enabled
    if (isRotating && car) {
        car.rotation.y += 0.005; // Slower rotation speed
    }
    
    renderer.render(scene, camera);
}

// Set up color selection buttons
function setupColorButtons() {
    const colorButtons = document.querySelectorAll('.color-btn');
    
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            colorButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update car color
            const color = button.getAttribute('data-color');
            updateCarColor(color);
        });
    });
    
    // Set default active button
    colorButtons[0].classList.add('active');
}

// Set up start button
function setupStartButton() {
    const startButton = document.getElementById('start-btn');
    
    startButton.addEventListener('click', () => {
        // For now, just log a message
        console.log('Start button clicked! Game would start here.');
        alert('Game functionality coming soon!');
    });
}

// Set up keyboard visual feedback
function setupKeyboardFeedback() {
    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (keyMap[key]) {
            const keyElement = document.getElementById(keyMap[key]);
            if (keyElement) {
                keyElement.classList.add('active');
            }
        }
    });

    document.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        if (keyMap[key]) {
            const keyElement = document.getElementById(keyMap[key]);
            if (keyElement) {
                keyElement.classList.remove('active');
            }
        }
    });
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupColorButtons();
    setupStartButton();
    setupKeyboardFeedback();
}); 
