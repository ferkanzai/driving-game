// Initialize Three.js components
let scene, camera, renderer, car, carBody;
let isRotating = true;
let gameActive = false;
let drivingScene, drivingCamera, drivingRenderer;
let drivingCar, drivingCarBody;
let keysPressed = {};
let velocity = 0;
let acceleration = 0;
let carAngle = 0;
let carPosition = { x: 0, z: 0 };
let trees = [];
let buildings = [];

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

// Game physics constants
const MAX_SPEED = 0.3;
const ACCELERATION = 0.005;
const DECELERATION = 0.003;
const TURN_SPEED = 0.03;
const FRICTION = 0.99;

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
    
    // Update driving car color if it exists
    if (drivingCarBody) {
        drivingCarBody.material.color.set(color);
    }
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('car-model');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(containerWidth, containerHeight);
    
    // Handle driving scene resize if active
    if (gameActive && drivingRenderer) {
        const gameContainer = document.getElementById('game-container');
        drivingCamera.aspect = gameContainer.clientWidth / gameContainer.clientHeight;
        drivingCamera.updateProjectionMatrix();
        drivingRenderer.setSize(gameContainer.clientWidth, gameContainer.clientHeight);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate car if rotation is enabled
    if (isRotating && car && !gameActive) {
        car.rotation.y += 0.005; // Slower rotation speed
    }
    
    // Update driving scene if game is active
    if (gameActive) {
        updateDrivingScene();
    }
    
    // Render appropriate scene
    if (gameActive) {
        drivingRenderer.render(drivingScene, drivingCamera);
    } else {
        renderer.render(scene, camera);
    }
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
        startGame();
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
        
        // Store key state for driving controls
        keysPressed[key] = true;
    });

    document.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        if (keyMap[key]) {
            const keyElement = document.getElementById(keyMap[key]);
            if (keyElement) {
                keyElement.classList.remove('active');
            }
        }
        
        // Clear key state for driving controls
        keysPressed[key] = false;
    });
}

// Start the driving game
function startGame() {
    // Hide start screen
    document.querySelector('.container').style.display = 'none';
    
    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    gameContainer.style.width = '100vw';
    gameContainer.style.height = '100vh';
    gameContainer.style.position = 'absolute';
    gameContainer.style.top = '0';
    gameContainer.style.left = '0';
    document.body.appendChild(gameContainer);
    
    // Create back button
    const backButton = document.createElement('button');
    backButton.id = 'back-btn';
    backButton.textContent = 'Back to Menu';
    backButton.style.position = 'absolute';
    backButton.style.top = '20px';
    backButton.style.left = '20px';
    backButton.style.zIndex = '100';
    backButton.style.padding = '10px 20px';
    backButton.style.backgroundColor = '#4caf50';
    backButton.style.color = 'white';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '5px';
    backButton.style.cursor = 'pointer';
    backButton.style.fontWeight = 'bold';
    backButton.addEventListener('click', stopGame);
    gameContainer.appendChild(backButton);
    
    // Create speedometer
    const speedometer = document.createElement('div');
    speedometer.id = 'speedometer';
    speedometer.style.position = 'absolute';
    speedometer.style.bottom = '20px';
    speedometer.style.right = '20px';
    speedometer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    speedometer.style.color = 'white';
    speedometer.style.padding = '10px 20px';
    speedometer.style.borderRadius = '5px';
    speedometer.style.fontFamily = 'Arial, sans-serif';
    speedometer.style.fontSize = '18px';
    speedometer.style.fontWeight = 'bold';
    speedometer.style.zIndex = '100';
    speedometer.textContent = 'Speed: 0 km/h';
    gameContainer.appendChild(speedometer);
    
    // Initialize driving scene
    initDrivingScene(gameContainer);
    
    // Set game as active
    gameActive = true;
    
    // Reset car position and velocity
    carPosition = { x: 0, z: 0 };
    velocity = 0;
    carAngle = 0;
}

// Stop the game and return to menu
function stopGame() {
    // Remove game container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        document.body.removeChild(gameContainer);
    }
    
    // Show start screen
    document.querySelector('.container').style.display = 'flex';
    
    // Set game as inactive
    gameActive = false;
    
    // Clear driving scene
    drivingScene = null;
    drivingCamera = null;
    drivingRenderer = null;
    drivingCar = null;
    drivingCarBody = null;
    trees = [];
    buildings = [];
}

// Initialize the driving scene
function initDrivingScene(container) {
    // Create scene
    drivingScene = new THREE.Scene();
    drivingScene.background = new THREE.Color(0x87ceeb); // Sky blue
    
    // Create camera
    drivingCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    // Create renderer
    drivingRenderer = new THREE.WebGLRenderer({ antialias: true });
    drivingRenderer.setSize(container.clientWidth, container.clientHeight);
    drivingRenderer.shadowMap.enabled = true;
    drivingRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(drivingRenderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    drivingScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 10;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    drivingScene.add(directionalLight);
    
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1e8449,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    drivingScene.add(ground);
    
    // Create driving car (copy of display car)
    createDrivingCar();
    
    // Add environment objects
    createEnvironment();
}

// Create the car for driving
function createDrivingCar() {
    drivingCar = new THREE.Group();
    
    // Create car body (main chassis)
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 4);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: currentColor });
    drivingCarBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    drivingCarBody.position.y = 0.5;
    drivingCarBody.castShadow = true;
    drivingCar.add(drivingCarBody);

    // Create cockpit
    const cockpitGeometry = new THREE.BoxGeometry(0.8, 0.4, 1.2);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0.7, -0.2);
    cockpit.castShadow = true;
    drivingCar.add(cockpit);

    // Create front wing
    const frontWingGeometry = new THREE.BoxGeometry(2.2, 0.1, 0.5);
    const frontWingMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const frontWing = new THREE.Mesh(frontWingGeometry, frontWingMaterial);
    frontWing.position.set(0, 0.3, 2);
    frontWing.castShadow = true;
    drivingCar.add(frontWing);

    // Create rear wing
    const rearWingGeometry = new THREE.BoxGeometry(2.2, 0.5, 0.1);
    const rearWingMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const rearWing = new THREE.Mesh(rearWingGeometry, rearWingMaterial);
    rearWing.position.set(0, 0.8, -1.8);
    rearWing.castShadow = true;
    drivingCar.add(rearWing);

    // Create rear wing supports
    const supportGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.4);
    const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
    leftSupport.position.set(0.8, 0.6, -1.8);
    leftSupport.castShadow = true;
    drivingCar.add(leftSupport);
    
    const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
    rightSupport.position.set(-0.8, 0.6, -1.8);
    rightSupport.castShadow = true;
    drivingCar.add(rightSupport);

    // Create wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 24);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });
    
    // Front left wheel
    const frontLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontLeftWheel.rotation.z = Math.PI / 2;
    frontLeftWheel.position.set(1, 0.4, 1.3);
    frontLeftWheel.castShadow = true;
    frontLeftWheel.name = 'frontLeftWheel';
    drivingCar.add(frontLeftWheel);
    
    // Front right wheel
    const frontRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontRightWheel.rotation.z = Math.PI / 2;
    frontRightWheel.position.set(-1, 0.4, 1.3);
    frontRightWheel.castShadow = true;
    frontRightWheel.name = 'frontRightWheel';
    drivingCar.add(frontRightWheel);
    
    // Rear left wheel
    const rearLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearLeftWheel.rotation.z = Math.PI / 2;
    rearLeftWheel.position.set(1, 0.4, -1.3);
    rearLeftWheel.castShadow = true;
    rearLeftWheel.name = 'rearLeftWheel';
    drivingCar.add(rearLeftWheel);
    
    // Rear right wheel
    const rearRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearRightWheel.rotation.z = Math.PI / 2;
    rearRightWheel.position.set(-1, 0.4, -1.3);
    rearRightWheel.castShadow = true;
    rearRightWheel.name = 'rearRightWheel';
    drivingCar.add(rearRightWheel);

    // Add car to scene
    drivingScene.add(drivingCar);
}

// Create environment objects (trees and buildings)
function createEnvironment() {
    // Create trees
    const treePositions = [];
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 180 - 90;
        const z = Math.random() * 180 - 90;
        
        // Ensure trees aren't too close to starting position
        if (Math.sqrt(x * x + z * z) > 10) {
            treePositions.push({ x, z });
        }
    }
    
    treePositions.forEach(pos => {
        const tree = createTree();
        tree.position.set(pos.x, 0, pos.z);
        drivingScene.add(tree);
        trees.push(tree);
    });
    
    // Create buildings
    const buildingPositions = [];
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 160 - 80;
        const z = Math.random() * 160 - 80;
        
        // Ensure buildings aren't too close to starting position
        if (Math.sqrt(x * x + z * z) > 20) {
            buildingPositions.push({ x, z });
        }
    }
    
    buildingPositions.forEach(pos => {
        const building = createBuilding();
        building.position.set(pos.x, 0, pos.z);
        building.rotation.y = Math.random() * Math.PI * 2;
        drivingScene.add(building);
        buildings.push(building);
    });
}

// Create a tree
function createTree() {
    const tree = new THREE.Group();
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 3, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    tree.add(trunk);
    
    // Tree foliage
    const foliageGeometry = new THREE.ConeGeometry(2, 4, 8);
    const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x2E8B57 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 5;
    foliage.castShadow = true;
    tree.add(foliage);
    
    return tree;
}

// Create a building
function createBuilding() {
    const building = new THREE.Group();
    
    // Random building dimensions
    const width = 5 + Math.random() * 10;
    const depth = 5 + Math.random() * 10;
    const height = 5 + Math.random() * 15;
    
    // Building body
    const bodyGeometry = new THREE.BoxGeometry(width, height, depth);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(
            0.5 + Math.random() * 0.5,
            0.5 + Math.random() * 0.5,
            0.5 + Math.random() * 0.5
        )
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = height / 2;
    body.castShadow = true;
    building.add(body);
    
    return building;
}

// Update the driving scene
function updateDrivingScene() {
    // Handle car controls
    handleDrivingControls();
    
    // Update car position
    drivingCar.position.x = carPosition.x;
    drivingCar.position.z = carPosition.z;
    drivingCar.rotation.y = carAngle;
    
    // Update wheels
    updateWheels();
    
    // Update camera position to follow car
    const cameraOffset = new THREE.Vector3(0, 3, 8);
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), carAngle);
    
    drivingCamera.position.x = drivingCar.position.x - cameraOffset.x;
    drivingCamera.position.y = drivingCar.position.y + cameraOffset.y;
    drivingCamera.position.z = drivingCar.position.z - cameraOffset.z;
    
    drivingCamera.lookAt(
        drivingCar.position.x,
        drivingCar.position.y + 1,
        drivingCar.position.z
    );
    
    // Update speedometer
    const speedometer = document.getElementById('speedometer');
    if (speedometer) {
        // Convert velocity to km/h (arbitrary scale for game feel)
        const speedKmh = Math.abs(Math.round(velocity * 100));
        speedometer.textContent = `Speed: ${speedKmh} km/h`;
        
        // Change color based on speed
        if (speedKmh > 25) {
            speedometer.style.color = '#ff9800'; // Orange for high speed
        } else if (speedKmh > 10) {
            speedometer.style.color = '#4caf50'; // Green for medium speed
        } else {
            speedometer.style.color = 'white'; // White for low speed
        }
    }
}

// Update wheel rotations
function updateWheels() {
    // Get wheel objects
    const frontLeftWheel = drivingCar.getObjectByName('frontLeftWheel');
    const frontRightWheel = drivingCar.getObjectByName('frontRightWheel');
    const rearLeftWheel = drivingCar.getObjectByName('rearLeftWheel');
    const rearRightWheel = drivingCar.getObjectByName('rearRightWheel');
    
    if (!frontLeftWheel || !frontRightWheel || !rearLeftWheel || !rearRightWheel) return;
    
    // Rotate wheels based on velocity (rolling forward/backward)
    const wheelRotationSpeed = velocity * 5;
    frontLeftWheel.rotation.x += wheelRotationSpeed;
    frontRightWheel.rotation.x += wheelRotationSpeed;
    rearLeftWheel.rotation.x += wheelRotationSpeed;
    rearRightWheel.rotation.x += wheelRotationSpeed;
    
    // Turn front wheels when steering
    const maxSteerAngle = Math.PI / 8; // 22.5 degrees
    let steerAngle = 0;
    
    if (keysPressed['a'] || keysPressed['arrowleft']) {
        steerAngle = maxSteerAngle;
    } else if (keysPressed['d'] || keysPressed['arrowright']) {
        steerAngle = -maxSteerAngle;
    }
    
    // Apply steering angle to front wheels (around Y axis)
    frontLeftWheel.rotation.y = steerAngle;
    frontRightWheel.rotation.y = steerAngle;
}

// Handle driving controls
function handleDrivingControls() {
    // Apply friction
    velocity *= FRICTION;
    
    // Forward/backward movement
    if (keysPressed['w'] || keysPressed['arrowup']) {
        velocity += ACCELERATION;
    }
    
    if (keysPressed['s'] || keysPressed['arrowdown']) {
        velocity -= ACCELERATION;
    }
    
    // Limit speed
    velocity = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, velocity));
    
    // Apply handbrake
    if (keysPressed[' ']) {
        velocity *= 0.95;
    }
    
    // Turning
    if (velocity !== 0) {
        if (keysPressed['a'] || keysPressed['arrowleft']) {
            carAngle += TURN_SPEED * (velocity > 0 ? 1 : -1);
        }
        
        if (keysPressed['d'] || keysPressed['arrowright']) {
            carAngle -= TURN_SPEED * (velocity > 0 ? 1 : -1);
        }
    }
    
    // Update position based on velocity and angle
    carPosition.x += Math.sin(carAngle) * velocity;
    carPosition.z += Math.cos(carAngle) * velocity;
    
    // Limit driving area
    carPosition.x = Math.max(-95, Math.min(95, carPosition.x));
    carPosition.z = Math.max(-95, Math.min(95, carPosition.z));
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupColorButtons();
    setupStartButton();
    setupKeyboardFeedback();
}); 
