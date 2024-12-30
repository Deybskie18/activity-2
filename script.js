import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer();

// Set renderer size and append to container
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Add OrbitControls for free camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 2000;

// Lighting
const ambientLight = new THREE.AmbientLight(0x444444);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Group for Earth, Moon, and objects
const earthSystem = new THREE.Group();
scene.add(earthSystem);

// Add a textured Earth sphere
function addEarthTexturedSphere() {
  const sphereGeometry = new THREE.SphereGeometry(100, 32, 32);
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load('/asset/earth.jpg');
  const sphereMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
  const earthSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  earthSphere.position.set(0, 1, 0);
  earthSystem.add(earthSphere);
}

// Add a textured Moon sphere
function addMoonTexturedSphere() {
  const moonGeometry = new THREE.SphereGeometry(15, 32, 32);
  const textureLoader = new THREE.TextureLoader();
  const moonTexture = textureLoader.load('/asset/moon.jpg');
  const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTexture });
  const moonSphere = new THREE.Mesh(moonGeometry, moonMaterial);
  moonSphere.position.set(200, 1, 0);
  earthSystem.add(moonSphere);
  return { moonSphere };
}

// Add scattered objects around the Earth in all directions
function addObjectsAroundEarth(numObjects) {
  const objects = [];
  const objectGroup = new THREE.Group(); // Group for objects around Earth
  scene.add(objectGroup);

  for (let i = 0; i < numObjects; i++) {
    // Choose a random geometry for the object
    let geometry;
    const randomShape = Math.floor(Math.random() * 4);
    switch (randomShape) {
      case 0:
        geometry = new THREE.SphereGeometry(Math.random() * 10 + 5, 16, 16);
        break;
      case 1:
        geometry = new THREE.BoxGeometry(Math.random() * 10 + 5, Math.random() * 10 + 5, Math.random() * 10 + 5);
        break;
      case 2:
        geometry = new THREE.ConeGeometry(Math.random() * 5 + 3, Math.random() * 10 + 5, 16);
        break;
      case 3:
        geometry = new THREE.TetrahedronGeometry(Math.random() * 10 + 5);
        break;
    }

    // Assign a random color to each object
    const randomColor = Math.random() * 0xffffff;
    const objectMaterial = new THREE.MeshStandardMaterial({ color: randomColor });
    const object = new THREE.Mesh(geometry, objectMaterial);

    // Position objects randomly in a 3D spherical shell around Earth
    const radius = 500 + Math.random() * 300; // Distance from Earth's center
    const theta = Math.random() * Math.PI * 2; // Random angle around the Y-axis
    const phi = Math.random() * Math.PI; // Random angle from the top of the sphere

    object.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    // Add the object to the group and array
    objectGroup.add(object);
    objects.push(object);
  }

  return { objects, objectGroup };
}

// Add Earth and Moon to the scene
addEarthTexturedSphere();
const { moonSphere } = addMoonTexturedSphere();

// Add objects around the Earth
const { objects, objectGroup } = addObjectsAroundEarth(200);

// Set initial camera position
camera.position.set(0, 300, 1000);

// Render loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the Earth
  earthSystem.rotation.y += 0.002;

  // Rotate each object around its own axis
  objects.forEach((object) => {
    object.rotation.x += 0.01;
    object.rotation.y += 0.01;
  });

  // Rotate the entire group around Earth
  objectGroup.rotation.y += 0.001;

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
}

animate();
