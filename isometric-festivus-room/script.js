import * as THREE from "three";
// import GUI from "lil-gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";

/**
 * Base
 */
// Debug
const debugObject = {};
// const gui = new GUI({
//   width: 400,
// });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Textures
 */
const bakedTexture = textureLoader.load("baked.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

const bakedPoleTexture = textureLoader.load("bakedPole.jpg");
bakedPoleTexture.flipY = false;
bakedPoleTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
const bakedPoleMaterial = new THREE.MeshBasicMaterial({
  map: bakedPoleTexture,
});

/**
 * Model
 */
gltfLoader.load("festivus.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedMaterial;
  });
  gltf.scene.rotateY(Math.PI);
  scene.add(gltf.scene);

  // const bakedMesh = gltf.scene.children.find((child) => child.name === "baked");
  // bakedMesh.material = bakedMaterial;
  // scene.add(gltf.scene);
});

// Pole
const poleModel = [];

gltfLoader.load("pole.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedPoleMaterial;
  });
  gltf.scene.position.z = 5;
  gltf.scene.position.x = 5;
  scene.add(gltf.scene);
  poleModel.push(gltf.scene);
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  mouse.y = -(e.clientY / sizes.height) * 2 + 1;
});

window.addEventListener("click", () => {
  // Update raycaster to check for intersections
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(poleModel, true);

  // Check if we have intersections w the pole model
  if (intersects.length > 0) {
    const intersectedPole = intersects[0].object;

    // GSAP to spin the intersected pole
    gsap.to(intersectedPole.rotation, {
      duration: 1,
      y: intersectedPole.rotation.y + Math.PI * 2,
      ease: "power1.inOut",
    });
  }
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
