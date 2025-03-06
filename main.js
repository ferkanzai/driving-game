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
let isCrashed = false;
let fireParticles = [];
let lastCollisionTime = 0;
let collisionCooldown = 1000; // 1 second cooldown between collisions
let crashSound;

// Health system
let playerHealth = 5;
let healthContainer;
let gameOverScreen;

// Touch controls
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let isTouching = false;
let touchThrottle = false;
let touchAcceleration = false;
let touchBrake = false;
let touchLeft = false;
let touchRight = false;
let virtualControls;
let isMobileDevice = false;

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
  
  // Reset player health
  playerHealth = 5;
  
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
  
  // Create health container
  healthContainer = document.createElement('div');
  healthContainer.id = 'health-container';
  healthContainer.style.position = 'absolute';
  healthContainer.style.top = '20px';
  healthContainer.style.right = '20px';
  healthContainer.style.zIndex = '100';
  healthContainer.style.display = 'flex';
  healthContainer.style.gap = '10px';
  gameContainer.appendChild(healthContainer);
  
  // Create hearts
  updateHealthDisplay();
  
  // Create game over screen (hidden initially)
  gameOverScreen = document.createElement('div');
  gameOverScreen.id = 'game-over-screen';
  gameOverScreen.style.position = 'absolute';
  gameOverScreen.style.top = '0';
  gameOverScreen.style.left = '0';
  gameOverScreen.style.width = '100%';
  gameOverScreen.style.height = '100%';
  gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  gameOverScreen.style.color = 'white';
  gameOverScreen.style.display = 'flex';
  gameOverScreen.style.flexDirection = 'column';
  gameOverScreen.style.justifyContent = 'center';
  gameOverScreen.style.alignItems = 'center';
  gameOverScreen.style.zIndex = '200';
  gameOverScreen.style.display = 'none';
  
  const gameOverText = document.createElement('h1');
  gameOverText.textContent = 'GAME OVER';
  gameOverText.style.fontSize = '48px';
  gameOverText.style.marginBottom = '20px';
  gameOverText.style.color = '#ff0000';
  gameOverText.style.textShadow = '0 0 10px #ff0000';
  
  const gameOverMessage = document.createElement('p');
  gameOverMessage.textContent = 'You crashed too many times!';
  gameOverMessage.style.fontSize = '24px';
  gameOverMessage.style.marginBottom = '30px';
  
  const returnButton = document.createElement('button');
  returnButton.textContent = 'Return to Menu';
  returnButton.style.padding = '15px 30px';
  returnButton.style.backgroundColor = '#4caf50';
  returnButton.style.color = 'white';
  returnButton.style.border = 'none';
  returnButton.style.borderRadius = '5px';
  returnButton.style.cursor = 'pointer';
  returnButton.style.fontSize = '18px';
  returnButton.style.fontWeight = 'bold';
  returnButton.addEventListener('click', stopGame);
  
  gameOverScreen.appendChild(gameOverText);
  gameOverScreen.appendChild(gameOverMessage);
  gameOverScreen.appendChild(returnButton);
  gameContainer.appendChild(gameOverScreen);
  
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
  
  // Create crash indicator
  const crashIndicator = document.createElement('div');
  crashIndicator.id = 'crash-indicator';
  crashIndicator.style.position = 'absolute';
  crashIndicator.style.top = '50%';
  crashIndicator.style.left = '50%';
  crashIndicator.style.transform = 'translate(-50%, -50%)';
  crashIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
  crashIndicator.style.color = 'white';
  crashIndicator.style.padding = '20px 40px';
  crashIndicator.style.borderRadius = '10px';
  crashIndicator.style.fontFamily = 'Arial, sans-serif';
  crashIndicator.style.fontSize = '32px';
  crashIndicator.style.fontWeight = 'bold';
  crashIndicator.style.zIndex = '100';
  crashIndicator.style.display = 'none';
  crashIndicator.style.textAlign = 'center';
  crashIndicator.style.textShadow = '0 0 10px #ff0000';
  crashIndicator.textContent = 'CRASHED!';
  gameContainer.appendChild(crashIndicator);
  
  // Initialize driving scene
  initDrivingScene(gameContainer);
  
  // Create virtual controls for mobile devices
  if (isMobileDevice) {
    createVirtualControls(gameContainer);
    setupTouchEvents();
  }
  
  // Set game as active
  gameActive = true;
  
  // Reset car position and velocity
  carPosition = { x: 0, z: 0 };
  velocity = 0;
  carAngle = 0;
}

// Update the health display with hearts
function updateHealthDisplay() {
  // Clear existing hearts
  if (healthContainer) {
    healthContainer.innerHTML = '';

    // Add hearts based on current health
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart';
      heart.style.width = '35px';
      heart.style.height = '35px';
      heart.style.display = 'flex';
      heart.style.justifyContent = 'center';
      heart.style.alignItems = 'center';

      // Create heart using SVG for a better shape
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '30');
      svg.setAttribute('height', '30');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
      path.setAttribute('fill', i < playerHealth ? '#ff0000' : '#555555');

      svg.appendChild(path);
      heart.appendChild(svg);

      healthContainer.appendChild(heart);
    }
  }
}

// Stop the game and return to menu
function stopGame() {
  // Remove game container
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    // Remove touch event listeners if mobile
    if (isMobileDevice) {
      gameContainer.removeEventListener('touchstart', handleTouchStart);
      gameContainer.removeEventListener('touchmove', handleTouchMove);
      gameContainer.removeEventListener('touchend', handleTouchEnd);
    }
    
    document.body.removeChild(gameContainer);
  }
  
  // Show start screen
  document.querySelector('.container').style.display = 'flex';
  
  // Set game as inactive
  gameActive = false;
  
  // Reset health system
  playerHealth = 5;
  healthContainer = null;
  gameOverScreen = null;
  virtualControls = null;
  
  // Reset touch controls
  touchAcceleration = false;
  touchBrake = false;
  touchLeft = false;
  touchRight = false;
  isTouching = false;
  
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

  // Reset crash state
  isCrashed = false;
  fireParticles = [];
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

  // Check for collisions
  checkCollisions();

  // Update fire particles if car is crashed
  if (isCrashed) {
    updateFireParticles();
  }

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

// Check for collisions with environment objects
function checkCollisions() {
  // Skip collision check if we're in cooldown period
  const currentTime = Date.now();
  if (currentTime - lastCollisionTime < collisionCooldown) {
    return;
  }

  // Car collision box (simplified as a sphere)
  const carRadius = 0.8; // Reduced significantly to require more direct hits

  // Store previous position to revert if collision occurs
  const prevPosition = { x: carPosition.x, z: carPosition.z };
  let hasCollided = false;

  // Check collisions with trees
  for (const tree of trees) {
    const distance = Math.sqrt(
      Math.pow(drivingCar.position.x - tree.position.x, 2) +
      Math.pow(drivingCar.position.z - tree.position.z, 2)
    );

    // Tree collision radius (trunk + minimal buffer)
    const treeRadius = 0.6; // Reduced significantly for more precise collision

    if (distance < carRadius + treeRadius) {
      // Revert to previous position to prevent passing through
      carPosition.x = prevPosition.x;
      carPosition.z = prevPosition.z;

      handleCollision(tree.position);
      hasCollided = true;
      break;
    }
  }

  // Check collisions with buildings
  if (!hasCollided) {
    for (const building of buildings) {
      // Get building dimensions
      const buildingBox = new THREE.Box3().setFromObject(building);
      const buildingSize = new THREE.Vector3();
      buildingBox.getSize(buildingSize);

      // Calculate distance from car to building center
      const distance = Math.sqrt(
        Math.pow(drivingCar.position.x - building.position.x, 2) +
        Math.pow(drivingCar.position.z - building.position.z, 2)
      );

      // Building collision radius (approximated as half the diagonal of the base)
      const buildingRadius = Math.sqrt(
        Math.pow(buildingSize.x / 2, 2) +
        Math.pow(buildingSize.z / 2, 2)
      ) - 1.0; // Reduced more for more precise collision

      if (distance < carRadius + buildingRadius) {
        // Revert to previous position to prevent passing through
        carPosition.x = prevPosition.x;
        carPosition.z = prevPosition.z;

        handleCollision(building.position);
        hasCollided = true;
        break;
      }
    }
  }
}

// Handle collision event
function handleCollision(objectPosition) {
  // Set crash state
  isCrashed = true;

  // Record collision time
  lastCollisionTime = Date.now();

  // Decrease player health
  playerHealth--;
  updateHealthDisplay();

  // Check if game over
  if (playerHealth <= 0) {
    // Stop the car immediately
    velocity = 0;

    // Show game over screen
    if (gameOverScreen) {
      gameOverScreen.style.display = 'flex';

      // Return to menu after 5 seconds
      setTimeout(() => {
        stopGame();
      }, 5000);
    }
  }

  // Calculate collision direction vector
  const collisionDirection = {
    x: carPosition.x - objectPosition.x,
    z: carPosition.z - objectPosition.z
  };

  // Normalize the direction vector
  const length = Math.sqrt(collisionDirection.x * collisionDirection.x + collisionDirection.z * collisionDirection.z);
  if (length > 0) {
    collisionDirection.x /= length;
    collisionDirection.z /= length;
  }

  // Push the car away from the collision point more significantly to prevent clipping
  const pushDistance = 0.5; // Increased from 0.3 to 0.5
  carPosition.x += collisionDirection.x * pushDistance;
  carPosition.z += collisionDirection.z * pushDistance;

  // Apply a bounce effect in the opposite direction of travel
  const bounceForce = Math.abs(velocity) * 0.3; // 30% of current velocity as bounce
  velocity = -velocity * 0.2; // Reverse direction with reduced magnitude

  // Stop the car
  setTimeout(() => {
    velocity = 0;
  }, 100); // Small delay for bounce effect

  // Create fire effect
  createFireEffect();

  // Play crash sound
  if (crashSound) {
    crashSound.currentTime = 0;
    const soundPromise = crashSound.play();

    // Handle browsers that return a promise from play()
    if (soundPromise !== undefined) {
      soundPromise.catch(error => {
        console.log("Error playing crash sound:", error);

        // Try to enable audio on user interaction
        document.addEventListener('click', function playOnClick() {
          crashSound.play().catch(e => console.log("Still can't play sound:", e));
          document.removeEventListener('click', playOnClick);
        }, { once: true });
      });
    }
  }

  // Show crash indicator
  const crashIndicator = document.getElementById('crash-indicator');
  if (crashIndicator) {
    crashIndicator.style.display = 'block';

    // Add shake animation
    document.body.style.animation = 'shake 0.5s';
    document.body.style.animationIterationCount = '1';

    // Hide after 2 seconds
    setTimeout(() => {
      crashIndicator.style.display = 'none';
      document.body.style.animation = '';
    }, 2000);
  }

  // Auto-repair after 5 seconds (only if not game over)
  if (playerHealth > 0) {
    setTimeout(() => {
      isCrashed = false;
      // Remove fire particles
      fireParticles.forEach(particle => {
        drivingScene.remove(particle);
      });
      fireParticles = [];
    }, 5000);
  }
}

// Create fire effect on the car
function createFireEffect() {
  // Create fire particles
  const particleCount = 40; // Increased from 30 to 40
  const particleSize = 0.25; // Increased from 0.2 to 0.25

  for (let i = 0; i < particleCount; i++) {
    const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        Math.random() * 0.2 + 0.8, // Red (0.8-1.0)
        Math.random() * 0.5,       // Green (0-0.5)
        0                          // Blue (0)
      ),
      transparent: true,
      opacity: 0.8
    });

    const particle = new THREE.Mesh(particleGeometry, particleMaterial);

    // Position particle on top of the car
    particle.position.x = drivingCar.position.x + (Math.random() - 0.5) * 2;
    particle.position.y = drivingCar.position.y + 0.5 + Math.random() * 1;
    particle.position.z = drivingCar.position.z + (Math.random() - 0.5) * 3;

    // Add some properties for animation
    particle.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.08,
        Math.random() * 0.15 + 0.05,
        (Math.random() - 0.5) * 0.08
      ),
      size: particleSize,
      life: Math.random() * 2 + 1.5 // 1.5-3.5 seconds (increased from 1-3)
    };

    drivingScene.add(particle);
    fireParticles.push(particle);
  }

  // Add smoke particles
  const smokeCount = 20;
  for (let i = 0; i < smokeCount; i++) {
    const smokeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const smokeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.2, 0.2, 0.2), // Dark gray
      transparent: true,
      opacity: 0.6
    });

    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);

    // Position smoke around the car
    smoke.position.x = drivingCar.position.x + (Math.random() - 0.5) * 3;
    smoke.position.y = drivingCar.position.y + 1 + Math.random() * 1.5;
    smoke.position.z = drivingCar.position.z + (Math.random() - 0.5) * 3;

    // Add some properties for animation
    smoke.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        Math.random() * 0.1 + 0.05,
        (Math.random() - 0.5) * 0.05
      ),
      size: 0.3,
      life: Math.random() * 3 + 2, // 2-5 seconds
      isSmoke: true
    };

    drivingScene.add(smoke);
    fireParticles.push(smoke);
  }
}

// Update fire particles
function updateFireParticles() {
  // Update each particle
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    const particle = fireParticles[i];
    const isSmoke = particle.userData.isSmoke;

    // Update position
    particle.position.add(particle.userData.velocity);

    // Follow car's movement (smoke follows less closely)
    const followFactor = isSmoke ? 0.05 : 0.1;
    particle.position.x += (drivingCar.position.x - particle.position.x) * followFactor;
    particle.position.z += (drivingCar.position.z - particle.position.z) * followFactor;

    // Decrease life
    particle.userData.life -= 0.05;

    // Update opacity and size based on life
    if (isSmoke) {
      // Smoke gets larger as it rises
      particle.material.opacity = particle.userData.life / 5;
      const scale = (3 - particle.userData.life) * 0.5;
      particle.scale.set(scale, scale, scale);
    } else {
      // Fire gets smaller as it burns out
      particle.material.opacity = particle.userData.life / 3;
      const scale = particle.userData.life / 3 + 0.5;
      particle.scale.set(scale, scale, scale);
    }

    // Remove dead particles
    if (particle.userData.life <= 0) {
      drivingScene.remove(particle);
      fireParticles.splice(i, 1);
    }
  }

  // Add new particles to maintain the effect
  if (fireParticles.length < 30 && isCrashed) {
    // Determine if we should add fire or smoke
    const addSmoke = Math.random() > 0.7; // 30% chance of smoke

    if (addSmoke) {
      // Add smoke particle
      const smokeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const smokeMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.2, 0.2, 0.2), // Dark gray
        transparent: true,
        opacity: 0.6
      });

      const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);

      // Position smoke around the car
      smoke.position.x = drivingCar.position.x + (Math.random() - 0.5) * 3;
      smoke.position.y = drivingCar.position.y + 1 + Math.random() * 0.5;
      smoke.position.z = drivingCar.position.z + (Math.random() - 0.5) * 3;

      // Add some properties for animation
      smoke.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          Math.random() * 0.1 + 0.05,
          (Math.random() - 0.5) * 0.05
        ),
        size: 0.3,
        life: Math.random() * 3 + 2, // 2-5 seconds
        isSmoke: true
      };

      drivingScene.add(smoke);
      fireParticles.push(smoke);
    } else {
      // Add fire particle
      const particleGeometry = new THREE.SphereGeometry(0.25, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(
          Math.random() * 0.2 + 0.8, // Red (0.8-1.0)
          Math.random() * 0.5,       // Green (0-0.5)
          0                          // Blue (0)
        ),
        transparent: true,
        opacity: 0.8
      });

      const particle = new THREE.Mesh(particleGeometry, particleMaterial);

      // Position particle on top of the car
      particle.position.x = drivingCar.position.x + (Math.random() - 0.5) * 2;
      particle.position.y = drivingCar.position.y + 0.5 + Math.random() * 0.5;
      particle.position.z = drivingCar.position.z + (Math.random() - 0.5) * 3;

      // Add some properties for animation
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.08,
          Math.random() * 0.15 + 0.05,
          (Math.random() - 0.5) * 0.08
        ),
        size: 0.25,
        life: Math.random() * 2 + 1.5, // 1.5-3.5 seconds
        isSmoke: false
      };

      drivingScene.add(particle);
      fireParticles.push(particle);
    }
  }
}

// Handle driving controls
function handleDrivingControls() {
  // If player has no health left, disable all controls
  if (playerHealth <= 0) {
    velocity = 0;
    return;
  }

  // Apply friction
  velocity *= FRICTION;

  // Forward/backward movement (reduced control when crashed)
  const controlFactor = isCrashed ? 0.1 : 1.0; // Reduced from 0.3 to 0.1

  // Check for keyboard or touch controls for acceleration
  if (keysPressed['w'] || keysPressed['arrowup'] || touchAcceleration) {
    velocity += ACCELERATION * controlFactor;
  }

  // Check for keyboard or touch controls for braking
  if (keysPressed['s'] || keysPressed['arrowdown'] || touchBrake) {
    velocity -= ACCELERATION * controlFactor;
  }

  // Limit speed (severely reduced when crashed)
  const maxSpeed = isCrashed ? MAX_SPEED * 0.2 : MAX_SPEED; // Reduced from 0.5 to 0.2
  velocity = Math.max(-maxSpeed, Math.min(maxSpeed, velocity));

  // Apply handbrake
  if (keysPressed[' ']) {
    velocity *= 0.95;
  }

  // Turning (reduced control when crashed)
  if (velocity !== 0) {
    // Check for keyboard or touch controls for turning left
    if (keysPressed['a'] || keysPressed['arrowleft'] || touchLeft) {
      carAngle += TURN_SPEED * (velocity > 0 ? 1 : -1) * controlFactor;
    }

    // Check for keyboard or touch controls for turning right
    if (keysPressed['d'] || keysPressed['arrowright'] || touchRight) {
      carAngle -= TURN_SPEED * (velocity > 0 ? 1 : -1) * controlFactor;
    }
  }

  // Store previous position before updating
  const prevX = carPosition.x;
  const prevZ = carPosition.z;

  // Update position based on velocity and angle
  carPosition.x += Math.sin(carAngle) * velocity;
  carPosition.z += Math.cos(carAngle) * velocity;

  // Limit driving area
  carPosition.x = Math.max(-95, Math.min(95, carPosition.x));
  carPosition.z = Math.max(-95, Math.min(95, carPosition.z));
}

// Preload sound effects
function preloadSounds() {
  // Create crash sound - using a short MP3 URL instead of data URL
  crashSound = new Audio('https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3');
  crashSound.volume = 1.0; // Increased volume

  // Force preload the sound
  crashSound.load();

  // Add a user interaction handler to enable audio
  document.addEventListener('click', function enableAudio() {
    // Play and immediately pause to enable audio
    crashSound.play().then(() => {
      crashSound.pause();
      crashSound.currentTime = 0;
    }).catch(e => console.log("Error enabling audio:", e));

    // Remove the event listener after first click
    document.removeEventListener('click', enableAudio);
  });
}

// Check if the device is mobile
function detectMobileDevice() {
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobileDevice;
}

// Create virtual controls for mobile
function createVirtualControls(container) {
    if (!isMobileDevice) return;
    
    // Create virtual controls container
    virtualControls = document.createElement('div');
    virtualControls.id = 'virtual-controls';
    virtualControls.style.position = 'absolute';
    virtualControls.style.bottom = '20px';
    virtualControls.style.left = '0';
    virtualControls.style.width = '100%';
    virtualControls.style.display = 'flex';
    virtualControls.style.justifyContent = 'space-between';
    virtualControls.style.padding = '0 20px';
    virtualControls.style.boxSizing = 'border-box';
    virtualControls.style.zIndex = '100';
    
    // Create acceleration button
    const accelerateBtn = document.createElement('div');
    accelerateBtn.id = 'accelerate-btn';
    accelerateBtn.className = 'virtual-btn';
    accelerateBtn.innerHTML = '⬆️';
    accelerateBtn.style.width = '60px';
    accelerateBtn.style.height = '60px';
    accelerateBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    accelerateBtn.style.color = 'white';
    accelerateBtn.style.borderRadius = '50%';
    accelerateBtn.style.display = 'flex';
    accelerateBtn.style.justifyContent = 'center';
    accelerateBtn.style.alignItems = 'center';
    accelerateBtn.style.fontSize = '24px';
    accelerateBtn.style.userSelect = 'none';
    accelerateBtn.style.touchAction = 'none';
    
    // Create brake button
    const brakeBtn = document.createElement('div');
    brakeBtn.id = 'brake-btn';
    brakeBtn.className = 'virtual-btn';
    brakeBtn.innerHTML = '⬇️';
    brakeBtn.style.width = '60px';
    brakeBtn.style.height = '60px';
    brakeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    brakeBtn.style.color = 'white';
    brakeBtn.style.borderRadius = '50%';
    brakeBtn.style.display = 'flex';
    brakeBtn.style.justifyContent = 'center';
    brakeBtn.style.alignItems = 'center';
    brakeBtn.style.fontSize = '24px';
    brakeBtn.style.userSelect = 'none';
    brakeBtn.style.touchAction = 'none';
    
    // Create left button
    const leftBtn = document.createElement('div');
    leftBtn.id = 'left-btn';
    leftBtn.className = 'virtual-btn';
    leftBtn.innerHTML = '⬅️';
    leftBtn.style.width = '60px';
    leftBtn.style.height = '60px';
    leftBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    leftBtn.style.color = 'white';
    leftBtn.style.borderRadius = '50%';
    leftBtn.style.display = 'flex';
    leftBtn.style.justifyContent = 'center';
    leftBtn.style.alignItems = 'center';
    leftBtn.style.fontSize = '24px';
    leftBtn.style.userSelect = 'none';
    leftBtn.style.touchAction = 'none';
    
    // Create right button
    const rightBtn = document.createElement('div');
    rightBtn.id = 'right-btn';
    rightBtn.className = 'virtual-btn';
    rightBtn.innerHTML = '➡️';
    rightBtn.style.width = '60px';
    rightBtn.style.height = '60px';
    rightBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    rightBtn.style.color = 'white';
    rightBtn.style.borderRadius = '50%';
    rightBtn.style.display = 'flex';
    rightBtn.style.justifyContent = 'center';
    rightBtn.style.alignItems = 'center';
    rightBtn.style.fontSize = '24px';
    rightBtn.style.userSelect = 'none';
    rightBtn.style.touchAction = 'none';
    
    // Create left container
    const leftContainer = document.createElement('div');
    leftContainer.style.display = 'flex';
    leftContainer.style.flexDirection = 'column';
    leftContainer.style.gap = '10px';
    leftContainer.appendChild(accelerateBtn);
    leftContainer.appendChild(brakeBtn);
    
    // Create right container
    const rightContainer = document.createElement('div');
    rightContainer.style.display = 'flex';
    rightContainer.style.flexDirection = 'column';
    rightContainer.style.gap = '10px';
    rightContainer.appendChild(leftBtn);
    rightContainer.appendChild(rightBtn);
    
    // Add buttons to virtual controls
    virtualControls.appendChild(leftContainer);
    virtualControls.appendChild(rightContainer);
    
    // Add virtual controls to container
    container.appendChild(virtualControls);
    
    // Add event listeners for virtual buttons
    setupVirtualControlEvents();
}

// Setup touch and swipe events
function setupTouchEvents() {
    if (!gameActive) return;
    
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;
    
    // Add touch event listeners for swipe detection
    gameContainer.addEventListener('touchstart', handleTouchStart, false);
    gameContainer.addEventListener('touchmove', handleTouchMove, false);
    gameContainer.addEventListener('touchend', handleTouchEnd, false);
}

// Handle touch start event
function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isTouching = true;
}

// Handle touch move event
function handleTouchMove(event) {
    if (!isTouching) return;
    
    // Prevent scrolling
    event.preventDefault();
    
    const touch = event.touches[0];
    touchEndX = touch.clientX;
    touchEndY = touch.clientY;
    
    // Calculate swipe direction and distance
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // Minimum swipe distance to trigger action
    const minSwipeDistance = 30;
    
    // Reset touch flags
    touchAcceleration = false;
    touchBrake = false;
    touchLeft = false;
    touchRight = false;
    
    // Determine swipe direction
    if (Math.abs(diffY) > Math.abs(diffX)) {
        // Vertical swipe
        if (diffY < -minSwipeDistance) {
            // Swipe up - accelerate
            touchAcceleration = true;
        } else if (diffY > minSwipeDistance) {
            // Swipe down - brake
            touchBrake = true;
        }
    } else {
        // Horizontal swipe
        if (diffX < -minSwipeDistance) {
            // Swipe left - turn left
            touchLeft = true;
        } else if (diffX > minSwipeDistance) {
            // Swipe right - turn right
            touchRight = true;
        }
    }
}

// Handle touch end event
function handleTouchEnd(event) {
    isTouching = false;
    
    // Reset touch flags after a short delay
    setTimeout(() => {
        touchAcceleration = false;
        touchBrake = false;
        touchLeft = false;
        touchRight = false;
    }, 100);
}

// Setup virtual control button events
function setupVirtualControlEvents() {
    if (!virtualControls) return;
    
    // Get virtual buttons
    const accelerateBtn = document.getElementById('accelerate-btn');
    const brakeBtn = document.getElementById('brake-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    
    // Accelerate button
    if (accelerateBtn) {
        accelerateBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchAcceleration = true;
        });
        
        accelerateBtn.addEventListener('touchend', () => {
            touchAcceleration = false;
        });
    }
    
    // Brake button
    if (brakeBtn) {
        brakeBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchBrake = true;
        });
        
        brakeBtn.addEventListener('touchend', () => {
            touchBrake = false;
        });
    }
    
    // Left button
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchLeft = true;
        });
        
        leftBtn.addEventListener('touchend', () => {
            touchLeft = false;
        });
    }
    
    // Right button
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchRight = true;
        });
        
        rightBtn.addEventListener('touchend', () => {
            touchRight = false;
        });
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupColorButtons();
  setupStartButton();
  setupKeyboardFeedback();
  preloadSounds();
  detectMobileDevice();
  createVirtualControls(document.getElementById('game-container'));
}); 
