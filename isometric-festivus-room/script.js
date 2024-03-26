import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import energyMeterVertexShader from "./shaders/energyMeter/vertex.glsl";
import energyMeterFragmentShader from "./shaders/energyMeter/fragment.glsl";

/**
 * Base
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */
const loadingBarElement = document.querySelector(".loading-bar");

const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    gsap.delayedCall(0.5, () => {
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 });
      loadingBarElement.classList.add("ended");
      loadingBarElement.style.transform = ``;
    });
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.transform = `scaleX(${progressRatio})`;
  }
);

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager);

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 },
  },
  vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0,0.0,0.0,uAlpha);
        }
    `,
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
scene.add(overlay);

/**
 * Textures
 */
const bakedTexture = textureLoader.load("baked.jpg");
bakedTexture.flipY = false;
bakedTexture.colorSpace = THREE.SRGBColorSpace;

const bakedPoleTexture = textureLoader.load("bakedPole.jpg");
bakedPoleTexture.flipY = false;
bakedPoleTexture.colorSpace = THREE.SRGBColorSpace;

const bakedMalletTexture = textureLoader.load("bakedMallet.jpg");
bakedMalletTexture.flipY = false;
bakedMalletTexture.colorSpace = THREE.SRGBColorSpace;

const bakedDingerTexture = textureLoader.load("bakedDinger.jpg");
bakedDingerTexture.flipY = false;
bakedDingerTexture.colorSpace = THREE.SRGBColorSpace;

const bakedGrievancesTexture = textureLoader.load("bakedGrievances.jpg");
bakedGrievancesTexture.flipY = false;
bakedGrievancesTexture.colorSpace = THREE.SRGBColorSpace;

const matcapTexture = textureLoader.load("/textures/matcaps/8.png");
matcapTexture.colorSpace = THREE.SRGBColorSpace;

/**
 * Fonts
 */
const fontLoader = new FontLoader();

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture });
const bakedPoleMaterial = new THREE.MeshBasicMaterial({
  map: bakedPoleTexture,
});
const bakedMalletMaterial = new THREE.MeshBasicMaterial({
  map: bakedMalletTexture,
});
const bakedDingerMaterial = new THREE.MeshBasicMaterial({
  map: bakedDingerTexture,
});
const textMaterial = new THREE.MeshBasicMaterial({
  color: "#4170DA",
});
const bakedGrievancesMaterial = new THREE.MeshBasicMaterial({
  map: bakedGrievancesTexture,
});
// Energy meter material
const energyMeterMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uFillAmount: { value: 0.0 },
    uTime: { value: 0.0 },
    uTurnRed: { value: 0.0 },
    uTime: { value: 0.0 },
  },
  vertexShader: energyMeterVertexShader,
  fragmentShader: energyMeterFragmentShader,
});

/**
 * Model
 */
let energyMeterMesh;

gltfLoader.load("festivus.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedMaterial;
  });

  energyMeterMesh = gltf.scene.children.find(
    (child) => child.name === "energyMeter"
  );
  energyMeterMesh.material = energyMeterMaterial;

  const textMesh = gltf.scene.children.find((child) => child.name === "Text");
  textMesh.material = textMaterial;
  const textMesh1 = gltf.scene.children.find((child) => child.name === "Text1");
  textMesh1.material = textMaterial;
  const textMesh2 = gltf.scene.children.find((child) => child.name === "Text2");
  textMesh2.material = textMaterial;
  const textMesh3 = gltf.scene.children.find((child) => child.name === "Text3");
  textMesh3.material = textMaterial;

  gltf.scene.position.y -= 1;
  scene.add(gltf.scene);
});

// Pole
const poleModel = [];

gltfLoader.load("pole.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedPoleMaterial;
  });

  gltf.scene.position.y -= 1;
  scene.add(gltf.scene);
  poleModel.push(gltf.scene);
});

// Mallet
const malletModel = [];

gltfLoader.load("mallet.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedMalletMaterial;
  });

  gltf.scene.position.y -= 1;
  scene.add(gltf.scene);
  malletModel.push(gltf.scene);
});

// Particles
const createParticleSystem = () => {
  const particlesCount = 100;
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  const color = new THREE.Color();

  for (let i = 0; i < positions.length; i += 3) {
    // Positions
    positions[i] = 0;
    positions[i + 1] = 0;
    positions[i + 2] = 0;

    // Colors
    color.set(Math.random() * 0xffffff); // Random color
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 1,
  });

  const particleSystem = new THREE.Points(geometry, material);

  return particleSystem;
};

// Dinger
const dingerModel = [];

gltfLoader.load("dinger.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedDingerMaterial;
  });

  gltf.scene.position.y -= 1;
  scene.add(gltf.scene);
  dingerModel.push(gltf.scene);
});

// Grievances
const grievancesModel = [];

gltfLoader.load("grievances.glb", (gltf) => {
  gltf.scene.traverse((child) => {
    child.material = bakedGrievancesMaterial;
  });

  gltf.scene.position.y -= 1;
  scene.add(gltf.scene);
  grievancesModel.push(gltf.scene);
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
camera.position.x = -12;
camera.position.y = 8;
camera.position.z = -11;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const panLimits = {
  minX: -18,
  maxX: 4,
  minY: 2,
  maxY: 20,
  minZ: -18,
  maxZ: 4,
};

controls.addEventListener("change", () => {
  camera.position.x = Math.max(
    panLimits.minX,
    Math.min(panLimits.maxX, camera.position.x)
  );
  camera.position.y = Math.max(
    panLimits.minY,
    Math.min(panLimits.maxY, camera.position.y)
  );
  camera.position.z = Math.max(
    panLimits.minZ,
    Math.min(panLimits.maxZ, camera.position.z)
  );
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.setClearColor("#19191f");

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  mouse.y = -(e.clientY / sizes.height) * 2 + 1;
});

// Pole event listener and animation
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

// Mallet event listener and animation
// Prevent double clicks while animation is in motion
let isAnimating = false;
// Tracks if the click is the first or second click
let isFilling = false;
let fillAmount = 0.0;
const maxFill = 1.03;
const fillSpeed = 0.005; // Speed at which the meter fills per second

window.addEventListener("click", () => {
  if (isAnimating) return;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(malletModel, true);

  if (intersects.length > 0) {
    if (!isFilling) {
      isFilling = true; // Start filling the meter
    } else {
      // Stop filling the meter and start the animations
      isFilling = false;
      fillAmount = energyMeterMaterial.uniforms.uFillAmount.value;
      animateMalletAndDinger(intersects[0].object);
    }
  }
});

const animateMalletAndDinger = (mallet) => {
  isAnimating = true; // Prevent further clicks

  // Create and add the particle system after mallet's animation
  const particleSystem = createParticleSystem();
  particleSystem.position.copy(mallet.position);
  particleSystem.position.x += 0.5;
  particleSystem.position.z -= 1.2;
  particleSystem.position.y -= 1.6;
  scene.add(particleSystem);

  // Helper function to calculate the movement based on fillAmount
  const calculateDingerMovement = () => {
    let movementPercentage;
    if (fillAmount < 0.2) movementPercentage = 0.1;
    else if (fillAmount < 0.4) movementPercentage = 0.2;
    else if (fillAmount < 0.6) movementPercentage = 0.4;
    else if (fillAmount < 0.8) movementPercentage = 0.6;
    else if (fillAmount < 0.96) movementPercentage = 0.8;
    else if (
      fillAmount <= maxFill &&
      energyMeterMaterial.uniforms.uTurnRed.value === 0
    ) {
      movementPercentage = 1.0;
      // Bell sound
      const hitSound = new Audio("/sounds/bell.mp3");
      setTimeout(() => {
        hitSound.play();
      }, 700);
    } else movementPercentage = 0.25; // For red state or any other cases

    return 2.4 * movementPercentage;
  };

  // Helper function to reset energy meter
  const resetEnergyMeter = () => {
    energyMeterMaterial.uniforms.uFillAmount.value = 0.0;
    energyMeterMaterial.uniforms.uTurnRed.value = 0.0;
    fillAmount = 0.0;
  };

  // GSAP timeline for the mallet swing animation
  const tl = gsap.timeline();
  tl.to(mallet.rotation, {
    x: mallet.rotation.x + Math.PI / 2, // Swing up
    duration: 0.3,
    ease: "power1.inOut",
    onComplete: () => {
      const hitSound = new Audio("/sounds/thump.mp3");
      setTimeout(() => {
        hitSound.play();
      }, 180);
    },
  })
    .to(mallet.rotation, {
      x: mallet.rotation.x, // Swing back to original position
      duration: 0.3,
      ease: "power1.inOut",
      onComplete: () => {
        const totalParticles =
          particleSystem.geometry.attributes.position.count;
        let completedAnimations = 0;

        for (let i = 0; i < totalParticles; i++) {
          const index = i * 3;
          const positions = particleSystem.geometry.attributes.position.array;

          const originalY = positions[index + 1];
          const dy = Math.max(0, (Math.random() - 0.5) * 3); // Ensure dy doesn't move below the original Y

          gsap.to(positions, {
            duration: 0.75,
            ease: "power1.out",
            [index + 0]: "+=" + (Math.random() - 0.5) * 3,
            [index + 1]: "+=" + dy,
            [index + 2]: "+=" + (Math.random() - 0.5) * 3,
            onUpdate: () =>
              (particleSystem.geometry.attributes.position.needsUpdate = true),
            onComplete: () => {
              completedAnimations++;
              if (completedAnimations === totalParticles) {
                // All particle animations have completed, start fade-out
                gsap.to(particleSystem.material, {
                  opacity: 0,
                  duration: 0.5,
                  onComplete: () => {
                    scene.remove(particleSystem);
                    particleSystem.geometry.dispose();
                    particleSystem.material.dispose();
                  },
                });
              }
            },
          });
        }
      },
    })
    .to(
      dingerModel[0].position,
      {
        // Dynamically determine the vertical movement
        y: "+=" + calculateDingerMovement(),
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.2"
    )
    .to(dingerModel[0].position, {
      y: dingerModel[0].position.y, // Return to original position
      duration: 0.6,
      ease: "bounce.out",
      onComplete: () => {
        setTimeout(() => {
          resetEnergyMeter();
          isAnimating = false;
        }, 200);
      },
    });
};

// Grivances event listener, modal, text
const textMeshes = [];

const speakText = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.7;
  window.speechSynthesis.speak(utterance);
};

window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(grievancesModel, true);

  if (intersects.length > 0) {
    document.getElementById("grievanceModal").style.display = "flex";
  }
});

document.getElementById("submitGrievance").addEventListener("click", () => {
  const text = document.getElementById("grievanceInput").value;
  if (text.trim() !== "") {
    document.getElementById("grievanceModal").style.display = "none";

    fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.5,
        height: 0.2,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 4,
      });
      textGeometry.center();
      const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture });
      const textMesh = new THREE.Mesh(textGeometry, material);

      setTimeout(() => {
        // Set the initial scale of the text mesh to almost zero
        textMesh.scale.set(0.01, 0.01, 0.01);
        textMesh.position.set(-3.5, 3.25, 4);
        textMesh.rotateY(Math.PI * 1.2);
        scene.add(textMesh);

        textMesh.userData.creationTime = clock.getElapsedTime();
        textMesh.userData.growthEndTime = clock.getElapsedTime() + 0.5;
        textMesh.userData.lastUpdateTime = clock.getElapsedTime();
        textMeshes.push(textMesh);

        speakText(text);
      }, 200);
    });

    document.getElementById("grievanceInput").value = "";
  }
});

document.getElementById("closeModal").addEventListener("click", function () {
  document.getElementById("grievanceModal").style.display = "none";
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  energyMeterMaterial.uniforms.uTime.value = elapsedTime;

  // Increase fillAmount if we are in the filling state
  if (isFilling) {
    fillAmount += fillSpeed;
    fillAmount = Math.min(fillAmount, maxFill); // Clamp the value
    energyMeterMaterial.uniforms.uFillAmount.value = fillAmount;
  }

  if (fillAmount >= maxFill && !energyMeterMaterial.uniforms.uTurnRed.value) {
    energyMeterMaterial.uniforms.uTurnRed.value = 1.0;
  }

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  const hoverPoleIntersects = raycaster.intersectObjects(poleModel, true);
  const hoverMalletIntersects = raycaster.intersectObjects(malletModel, true);
  const hoverGrievancesIntersects = raycaster.intersectObjects(
    grievancesModel,
    true
  );

  // Change cursor when hovering over clickable events
  canvas.style.cursor =
    hoverPoleIntersects.length > 0 ||
    hoverMalletIntersects.length > 0 ||
    hoverGrievancesIntersects.length > 0
      ? "pointer"
      : "auto";

  // Animate text
  for (let i = textMeshes.length - 1; i >= 0; i--) {
    const mesh = textMeshes[i];
    const age = elapsedTime - mesh.userData.creationTime;
    if (age < 1) {
      const scale = Math.min(age, 1);
      mesh.scale.set(scale, scale, scale);
    }

    const speed = 1;
    mesh.position.z -= speed * (elapsedTime - mesh.userData.lastUpdateTime);
    mesh.position.y += (speed * Math.sin(mesh.position.z) * 0.1) / 8;

    // Remove the mesh if it's too far away
    if (Math.abs(mesh.position.z) > 10) {
      mesh.geometry.dispose();
      mesh.material.dispose();
      scene.remove(mesh);
      textMeshes.splice(i, 1);
    } else mesh.userData.lastUpdateTime = clock.getElapsedTime();
  }

  //

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
