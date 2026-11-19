import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export class LoyKrathongScene {
  constructor(container, onSelectKrathong) {
    this.container = container;
    this.onSelectKrathong = onSelectKrathong;
    this.krathongMeshes = new Map();
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Animated dynamic object collections
    this.skyLanterns = [];
    this.riverCandles = [];
    this.torchFlames = [];
    this.swayingTrees = [];
    this.swayingPalms = [];
    this.flickerLights = [];
    this.lotusBlossoms = [];

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1a264a, 0.0075);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 19, 42);

    // 3. Renderer with ACES Tone Mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.38;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 110;
    this.controls.target.set(0, 3, 0);

    // 5. Generate Procedural Textures (Thai Architecture & Flora)
    this.createTextures();

    // 6. Lighting
    this.setupLighting();

    // 7. Sky, Moon, Stars
    this.createSkyDome();
    this.createMoon();
    this.createTwinklingStars();

    // 8. River Water
    this.createRiver();

    // 9. Grand Thai Chedi & Temple Complex (ความสมจริง 80%+ ตามรูป 2, 3, 4)
    this.createRealisticTempleComplex();

    // 10. Realistic Thai Traditional Teak House (เรือนไทยไม้สักฝาปะกนแท้)
    this.createRealisticThaiHouse();

    // 11. Realistic Trees & Palms (ต้นจามจุรีโบราณ & ต้นมะพร้าวริมน้ำ)
    this.createRealisticTrees();

    // 12. Water Lilies / Lotus Pads (กอบัวหลวงริมฝั่งน้ำ ตามรูป 3)
    this.createWaterLilies();

    // 13. Bamboo Torches (คบเพลิงไม้ไผ่โบราณ ตามรูป 3)
    this.createBambooTorches();

    // 14. Floating Elements (โคมลอยยี่เป็ง & กระทงสาย)
    this.createSkyLanterns();
    this.createKrathongSai();

    // Event Listeners
    this.handleResize = this.onWindowResize.bind(this);
    this.handleClick = this.onPointerDown.bind(this);
    window.addEventListener("resize", this.handleResize);
    this.renderer.domElement.addEventListener("pointerdown", this.handleClick);

    // Start Animation Loop
    this.animate();
  }

  /* ==========================================================
     TEXTURE GENERATION (Authentic Thai Craftsmanship Details)
  ========================================================== */
  createTextures() {
    // 1. Thai Teak Pagon Wall Texture (ฝาปะกนเรือนไทยแท้ ลูกฟักไม้สัก)
    const pagonCanvas = document.createElement("canvas");
    pagonCanvas.width = 512;
    pagonCanvas.height = 512;
    const pCtx = pagonCanvas.getContext("2d");

    // Base teak wood color with subtle grain
    pCtx.fillStyle = "#63381a";
    pCtx.fillRect(0, 0, 512, 512);

    // Wood grain lines
    pCtx.strokeStyle = "rgba(45, 23, 10, 0.35)";
    pCtx.lineWidth = 1.5;
    for (let i = 0; i < 512; i += 4) {
      pCtx.beginPath();
      pCtx.moveTo(0, i + (Math.random() - 0.5) * 3);
      pCtx.bezierCurveTo(150, i + 2, 350, i - 2, 512, i);
      pCtx.stroke();
    }

    // Grid of recessed Pagon panels (ลูกฟักฝาปะกน)
    const cols = 4;
    const rows = 3;
    const cellW = 512 / cols;
    const cellH = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW + 8;
        const y = r * cellH + 8;
        const w = cellW - 16;
        const h = cellH - 16;

        // Outer stiles/rails shadow (ร่องคิ้วไม้)
        pCtx.fillStyle = "#381c0c";
        pCtx.fillRect(x - 3, y - 3, w + 6, h + 6);

        // Recessed panel
        pCtx.fillStyle = "#7c4420";
        pCtx.fillRect(x, y, w, h);

        // Inner beveled highlight
        pCtx.fillStyle = "rgba(255, 210, 150, 0.12)";
        pCtx.fillRect(x + 4, y + 4, w - 8, 4);
        pCtx.fillRect(x + 4, y + 4, 4, h - 8);

        // Inner bevel shadow
        pCtx.fillStyle = "rgba(20, 10, 5, 0.4)";
        pCtx.fillRect(x + 4, y + h - 8, w - 8, 4);
        pCtx.fillRect(x + w - 8, y + 4, 4, h - 8);
      }
    }
    this.pagonTexture = new THREE.CanvasTexture(pagonCanvas);
    this.pagonTexture.wrapS = THREE.RepeatWrapping;
    this.pagonTexture.wrapT = THREE.RepeatWrapping;

    // 2. Thai Terracotta Fish-Scale Roof Tiles (กระเบื้องดินเผาเกล็ดเต่าหลังคาวัดและเรือนไทย)
    const tileCanvas = document.createElement("canvas");
    tileCanvas.width = 512;
    tileCanvas.height = 512;
    const tCtx = tileCanvas.getContext("2d");

    tCtx.fillStyle = "#a83515"; // Rich terracotta base
    tCtx.fillRect(0, 0, 512, 512);

    const tileW = 32;
    const tileH = 24;
    for (let row = 0; row < 512 / tileH + 1; row++) {
      const offsetX = (row % 2) * (tileW / 2);
      for (let col = -1; col < 512 / tileW + 1; col++) {
        const tx = col * tileW + offsetX;
        const ty = row * tileH;

        // Fish scale tile shingle with curved bottom
        tCtx.beginPath();
        tCtx.moveTo(tx, ty);
        tCtx.lineTo(tx + tileW, ty);
        tCtx.bezierCurveTo(tx + tileW, ty + tileH * 0.9, tx, ty + tileH * 0.9, tx, ty);
        tCtx.fillStyle = (row + col) % 3 === 0 ? "#b83f1d" : "#982d11";
        tCtx.fill();

        // Shingle highlight edge
        tCtx.strokeStyle = "rgba(255, 170, 120, 0.25)";
        tCtx.lineWidth = 1;
        tCtx.stroke();
      }
    }
    this.roofTileTexture = new THREE.CanvasTexture(tileCanvas);
    this.roofTileTexture.wrapS = THREE.RepeatWrapping;
    this.roofTileTexture.wrapT = THREE.RepeatWrapping;
    this.roofTileTexture.repeat.set(3, 3);

    // 3. Golden Thai Kanok Pediment Motif (ลายกนกหน้าบันช่อฟ้าสีทองอร่าม)
    const kanokCanvas = document.createElement("canvas");
    kanokCanvas.width = 512;
    kanokCanvas.height = 256;
    const kCtx = kanokCanvas.getContext("2d");

    // Dark crimson lacquered ground (พื้นรักสีแดงชาด)
    kCtx.fillStyle = "#630b14";
    kCtx.fillRect(0, 0, 512, 256);

    // Golden sunburst rays & lotus filigree
    kCtx.strokeStyle = "#facc15";
    kCtx.fillStyle = "#eab308";
    kCtx.lineWidth = 3;

    const centerX = 256;
    const centerY = 210;

    // Center lotus flower
    kCtx.beginPath();
    kCtx.arc(centerX, centerY, 28, 0, Math.PI * 2);
    kCtx.fill();

    // Radiating stylized flame petals (กนกเปลว)
    for (let a = -Math.PI * 0.85; a <= -Math.PI * 0.15; a += 0.15) {
      const len = 90 + Math.sin(a * 4) * 35;
      const ex = centerX + Math.cos(a) * len;
      const ey = centerY + Math.sin(a) * len;
      kCtx.beginPath();
      kCtx.moveTo(centerX, centerY);
      kCtx.quadraticCurveTo(centerX + Math.cos(a + 0.1) * (len * 0.6), centerY + Math.sin(a + 0.1) * (len * 0.6), ex, ey);
      kCtx.stroke();
    }
    this.kanokTexture = new THREE.CanvasTexture(kanokCanvas);

    // 4. Organic Tree Bark Texture
    const barkCanvas = document.createElement("canvas");
    barkCanvas.width = 256;
    barkCanvas.height = 512;
    const bCtx = barkCanvas.getContext("2d");
    bCtx.fillStyle = "#3e2716";
    bCtx.fillRect(0, 0, 256, 512);

    for (let x = 0; x < 256; x += 3) {
      bCtx.strokeStyle = (x % 6 === 0) ? "#27160c" : "#563820";
      bCtx.lineWidth = 2 + Math.random() * 2;
      bCtx.beginPath();
      bCtx.moveTo(x, 0);
      bCtx.bezierCurveTo(x + (Math.random() - 0.5) * 8, 170, x + (Math.random() - 0.5) * 8, 340, x, 512);
      bCtx.stroke();
    }
    this.barkTexture = new THREE.CanvasTexture(barkCanvas);
    this.barkTexture.wrapS = THREE.RepeatWrapping;
    this.barkTexture.wrapT = THREE.RepeatWrapping;
  }

  /* ==========================================================
     LIGHTING
  ========================================================== */
  setupLighting() {
    // 1. Ambient Light - twilight sky blue & warm reflection
    const ambientLight = new THREE.AmbientLight(0x406295, 2.1);
    this.scene.add(ambientLight);

    // 2. Moonlight Directional Light
    const moonLight = new THREE.DirectionalLight(0xfffaea, 2.5);
    moonLight.position.set(22, 58, -42);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 10;
    moonLight.shadow.camera.far = 180;
    moonLight.shadow.camera.left = -55;
    moonLight.shadow.camera.right = 55;
    moonLight.shadow.camera.top = 55;
    moonLight.shadow.camera.bottom = -55;
    moonLight.shadow.bias = -0.0005;
    this.scene.add(moonLight);

    // 3. Warm Festival River Ambient (Golden water glow)
    const riverGlowLight = new THREE.DirectionalLight(0xff9e24, 1.4);
    riverGlowLight.position.set(-15, 20, 20);
    this.scene.add(riverGlowLight);

    // 4. Temple Architectural Floodlight (สปอตไลต์ส่องเจดีย์เรืองรอง)
    const templeFlood = new THREE.PointLight(0xffd56b, 5.5, 80, 1.2);
    templeFlood.position.set(16, 20, -42);
    this.scene.add(templeFlood);
    this.templeLight = templeFlood;

    // 5. Pier Warm Festival Glow
    const pierLight = new THREE.PointLight(0xff8811, 4.2, 36, 1.3);
    pierLight.position.set(-15, 6, 8);
    this.scene.add(pierLight);
    this.flickerLights.push({ light: pierLight, baseIntensity: 4.2, speed: 4.5 });
  }

  /* ==========================================================
     SKY, MOON, STARS
  ========================================================== */
  createSkyDome() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, "#081b3c"); // Midnight royal navy
    grad.addColorStop(0.3, "#102c5e"); // Deep cerulean
    grad.addColorStop(0.55, "#341d58"); // Royal indigo violet
    grad.addColorStop(0.72, "#742458"); // Sunset magenta / plum
    grad.addColorStop(0.85, "#bd4925"); // Rich warm sunset orange
    grad.addColorStop(0.94, "#e57c1d"); // Horizon warm amber
    grad.addColorStop(1.0, "#fde047"); // Golden horizon line glow

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    const skyGeo = new THREE.SphereGeometry(240, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.position.y = -25;
    this.scene.add(skyMesh);
  }

  createMoon() {
    const moonGeo = new THREE.SphereGeometry(7.5, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
    this.moon = new THREE.Mesh(moonGeo, moonMat);
    this.moon.position.set(32, 54, -75);
    this.scene.add(this.moon);

    // Multi-layered Glowing Halo
    const haloGeo = new THREE.PlaneGeometry(36, 36);
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(128, 128, 25, 128, 128, 126);
    grad.addColorStop(0, "rgba(255, 252, 235, 0.95)");
    grad.addColorStop(0.25, "rgba(255, 235, 160, 0.55)");
    grad.addColorStop(0.55, "rgba(255, 180, 90, 0.25)");
    grad.addColorStop(0.85, "rgba(90, 140, 255, 0.1)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const haloTexture = new THREE.CanvasTexture(canvas);
    const haloMat = new THREE.MeshBasicMaterial({
      map: haloTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(this.moon.position);
    halo.position.z += 1.5;
    halo.lookAt(0, 20, 35);
    this.scene.add(halo);
  }

  createTwinklingStars() {
    const count = 900;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 260;
      positions[i * 3 + 1] = 18 + Math.random() * 95;
      positions[i * 3 + 2] = -140 + Math.random() * 110;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.1,
      transparent: true,
      opacity: 0.85,
    });
    this.starField = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starField);
  }

  /* ==========================================================
     RIVER WATER
  ========================================================== */
  createRiver() {
    const riverGeo = new THREE.PlaneGeometry(180, 180, 80, 80);
    riverGeo.rotateX(-Math.PI / 2);

    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x0a3258,
      metalness: 0.65,
      roughness: 0.2,
      flatShading: false,
    });

    this.waterMesh = new THREE.Mesh(riverGeo, this.waterMat);
    this.waterMesh.position.y = 0;
    this.waterMesh.receiveShadow = true;
    this.scene.add(this.waterMesh);

    this.riverPositions = riverGeo.attributes.position;
    this.baseRiverCoords = this.riverPositions.array.slice();
  }

  /* ==========================================================
     1. GRAND THAI CHEDI & TEMPLE (เจดีย์สุโขทัย / วัดอรุณ 80%+ Detail)
     อ้างอิงตามรูป 2, 3, 4: เจดีย์ทรงระฆังคว่ำสีทอง, พระวิหารเสาขาว,
     หลังคาซ้อน 3 ชั้น, ช่อฟ้า ใบระกา หางหงส์, แสงสะท้อนผิวน้ำ
  ========================================================== */
  createRealisticTempleComplex() {
    const templeGroup = new THREE.Group();
    templeGroup.position.set(16, 0, -42);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf5b041,
      metalness: 0.65,
      roughness: 0.25,
    });
    const whiteStoneMat = new THREE.MeshStandardMaterial({
      color: 0xf4f1ea,
      roughness: 0.45,
    });
    const marbleStairsMat = new THREE.MeshStandardMaterial({
      color: 0xd9d3c7,
      roughness: 0.6,
    });
    const thaiRoofMat = new THREE.MeshStandardMaterial({
      map: this.roofTileTexture,
      roughness: 0.4,
    });
    const pedimentMat = new THREE.MeshBasicMaterial({
      map: this.kanokTexture,
    });

    // --- A. Grand Riverbank Foundation Platform (ฐานไพทีหินอ่อนริมน้ำ) ---
    const platform = new THREE.Mesh(new THREE.BoxGeometry(40, 3.2, 30), whiteStoneMat);
    platform.position.set(0, 1.6, 0);
    platform.receiveShadow = true;
    templeGroup.add(platform);

    // Marble balustrade (ราวลูกกรงหินอ่อนรอบลานประทักษิณ)
    const railingGeo = new THREE.BoxGeometry(39, 0.6, 0.4);
    const railFront = new THREE.Mesh(railingGeo, whiteStoneMat);
    railFront.position.set(0, 3.4, 14.6);
    templeGroup.add(railFront);

    // Grand Stairs descending toward the water (บันไดนาคทอดลงท่าน้ำวัด)
    for (let s = 0; s < 5; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(10, 0.35, 1.2), marbleStairsMat);
      step.position.set(0, 1.4 - s * 0.35, 15.6 + s * 1.0);
      step.receiveShadow = true;
      templeGroup.add(step);
    }

    // --- B. Grand Sukhothai Golden Bell Chedi (เจดีย์ทรงระฆังคว่ำสีทองอร่าม) ---
    const chediGroup = new THREE.Group();
    chediGroup.position.set(-6, 3.2, -3);

    // 1. ฐานเขียง 3 ชั้น (Tiered Square Plinths with stepped moldings)
    const baseTiers = [
      { w: 13, h: 1.4 },
      { w: 10.8, h: 1.2 },
      { w: 8.8, h: 1.0 },
    ];
    let chediY = 0;
    baseTiers.forEach((tier) => {
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(tier.w, tier.h, tier.w), goldMat);
      bMesh.position.y = chediY + tier.h / 2;
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      chediGroup.add(bMesh);
      chediY += tier.h;
    });

    // 2. ฐานบัวคว่ำบัวหงาย & มาลัยเถา (Octagonal / Cylindrical Lotus Rings)
    const ring1 = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.4, 1.0, 24), goldMat);
    ring1.position.y = chediY + 0.5;
    chediGroup.add(ring1);
    chediY += 1.0;

    const ring2 = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.9, 0.8, 24), goldMat);
    ring2.position.y = chediY + 0.4;
    chediGroup.add(ring2);
    chediY += 0.8;

    // 3. องค์ระฆังคว่ำสีทอง (Golden Bell-shaped Stupa Dome)
    const bellGeo = new THREE.SphereGeometry(3.5, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const bellMesh = new THREE.Mesh(bellGeo, goldMat);
    bellMesh.position.y = chediY + 1.2;
    bellMesh.scale.set(1.0, 1.2, 1.0);
    bellMesh.castShadow = true;
    chediGroup.add(bellMesh);
    chediY += 3.8;

    // 4. บัลลังก์สี่เหลี่ยม (Square Harmika Throne)
    const harmika = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 2.4), goldMat);
    harmika.position.y = chediY + 0.55;
    chediGroup.add(harmika);
    chediY += 1.1;

    // 5. ปล้องไฉน 13 ชั้น (13-Tiered Spire Rings tapering to sky)
    const spireRingsCount = 13;
    for (let r = 0; r < spireRingsCount; r++) {
      const radius = 1.1 * (1 - (r / spireRingsCount) * 0.82);
      const sRing = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.9, radius, 0.42, 16), goldMat);
      sRing.position.y = chediY + r * 0.44;
      sRing.castShadow = true;
      chediGroup.add(sRing);
    }
    chediY += spireRingsCount * 0.44;

    // 6. ปลียอด / เม็ดน้ำค้าง / ยอดฉัตรทอง (Lotus Bud Finial & Spire Peak)
    const finialGeo = new THREE.ConeGeometry(0.25, 2.5, 12);
    const finial = new THREE.Mesh(finialGeo, goldMat);
    finial.position.y = chediY + 1.25;
    chediGroup.add(finial);

    // Sparkling pinnacle gem
    const gemGeo = new THREE.SphereGeometry(0.35, 10, 10);
    const gemMesh = new THREE.Mesh(gemGeo, new THREE.MeshBasicMaterial({ color: 0xfff3a8 }));
    gemMesh.position.y = chediY + 2.4;
    chediGroup.add(gemMesh);

    templeGroup.add(chediGroup);

    // --- C. Royal Viharn / Ordination Hall (พระวิหารหลวงทรงไทยประดับมุข) ---
    const viharn = new THREE.Group();
    viharn.position.set(10, 3.2, 2);

    // 1. Colonnade of White Pillars (เสาสี่เหลี่ยมสีขาวหัวบัว)
    const pillarGeo = new THREE.BoxGeometry(0.5, 4.8, 0.5);
    const pillarCoords = [];
    for (let px = -3.5; px <= 3.5; px += 2.3) {
      pillarCoords.push([px, -4.5], [px, 4.5]);
    }
    pillarCoords.forEach(([px, pz]) => {
      const pil = new THREE.Mesh(pillarGeo, whiteStoneMat);
      pil.position.set(px, 2.4, pz);
      pil.castShadow = true;
      viharn.add(pil);

      // Lotus capital top
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.7), goldMat);
      cap.position.set(px, 4.8, pz);
      viharn.add(cap);
    });

    // 2. Interior Sanctuary & Golden Buddha (พระพุทธรูปทองคำในวิหาร)
    const innerWall = new THREE.Mesh(new THREE.BoxGeometry(5.2, 4.6, 7.2), whiteStoneMat);
    innerWall.position.set(0, 2.3, 0);
    viharn.add(innerWall);

    // Glowing Viharn Doorway
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.2), new THREE.MeshBasicMaterial({ color: 0xffd56b }));
    door.position.set(0, 2.1, 3.65);
    viharn.add(door);

    // 3. Multi-tiered Overlapping Thai Gable Roof (หลังคาซ้อน 3 ชั้นลด)
    for (let t = 0; t < 3; t++) {
      const roofCone = new THREE.Mesh(new THREE.ConeGeometry(5.6 - t * 0.7, 2.8, 4), thaiRoofMat);
      roofCone.rotateY(Math.PI / 4);
      roofCone.scale.set(1.15, 0.7, 1.45);
      roofCone.position.set(0, 5.2 + t * 1.3, 0);
      roofCone.castShadow = true;
      viharn.add(roofCone);

      // Chofa (ช่อฟ้า ปลายจั่วทุกชั้น)
      [1, -1].forEach((dir) => {
        const chofa = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.6, 6), goldMat);
        chofa.position.set(0, 7.2 + t * 1.3, dir * (4.8 - t * 0.6));
        chofa.rotation.x = dir * 0.42;
        viharn.add(chofa);
      });
    }

    // 4. Carved Golden Pediment (หน้าบันลายกนกปิดทอง)
    const gPedi = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.2), pedimentMat);
    gPedi.position.set(0, 6.2, 4.9);
    viharn.add(gPedi);

    templeGroup.add(viharn);

    // --- D. Temple Floodlights casting dramatic golden water reflections ---
    const spot1 = new THREE.PointLight(0xffbe42, 6.5, 60, 1.2);
    spot1.position.set(-6, 8, 10);
    templeGroup.add(spot1);

    const spot2 = new THREE.PointLight(0xffd700, 5.5, 50, 1.3);
    spot2.position.set(10, 7, 10);
    templeGroup.add(spot2);

    this.scene.add(templeGroup);
    this.templeGroup = templeGroup;
  }

  /* ==========================================================
     2. REALISTIC THAI TRADITIONAL TEAK HOUSE (เรือนไทยไม้สักฝาปะกน 80%+ Detail)
     เสาเรือนโอนสอบยกใต้ถุนสูง, ฝาปะกนลูกฟักแท้, หน้าต่างลูกกรงมะหวด,
     หลังคาจั่วไทยแอ่นโค้ง, หน้าบันลายไทย, ช่อฟ้า ใบระกา หางหงส์, ชานเรือน, โอ่งน้ำ
  ========================================================== */
  createRealisticThaiHouse() {
    const house = new THREE.Group();
    house.position.set(-25, 1.6, -6);
    house.scale.set(1.35, 1.35, 1.35);

    const teakMat = new THREE.MeshStandardMaterial({
      map: this.pagonTexture,
      roughness: 0.65,
    });
    const woodBeamMat = new THREE.MeshStandardMaterial({
      color: 0x4e2810,
      roughness: 0.7,
    });
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.8,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      map: this.roofTileTexture,
      roughness: 0.45,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf5b041,
      metalness: 0.6,
      roughness: 0.3,
    });
    const pediMat = new THREE.MeshBasicMaterial({
      map: this.kanokTexture,
    });
    const warmLightMat = new THREE.MeshBasicMaterial({ color: 0xffdf78 });

    // --- 1. Elevated Stilts with Stone Plinths (เสาเรือนไทย 12 ต้นพร้อมตอม่อ) ---
    const pillarRows = [-4.5, 0, 4.5];
    const pillarCols = [-3.5, -1.2, 1.2, 3.5];

    pillarCols.forEach((pz) => {
      pillarRows.forEach((px) => {
        // Concrete/stone stilt footing (ตอม่อหิน)
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.7), plinthMat);
        plinth.position.set(px, 0.3, pz);
        house.add(plinth);

        // Teak stilt tapering inward slightly (เสาเรือนไม้สักกลมโอนสอบ)
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 4.2, 10), woodBeamMat);
        stilt.position.set(px * 0.96, 2.4, pz * 0.96);
        stilt.castShadow = true;
        house.add(stilt);
      });
    });

    // --- 2. Under-floor Beams & Joists (รอด ตง คาน) ---
    const beamX = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.45, 0.3), woodBeamMat);
    beamX.position.set(0, 4.4, 0);
    house.add(beamX);

    // --- 3. Elevated Teak Plank Deck (ชานเรือนและนอกชาน) ---
    const deck = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.35, 9.6), woodBeamMat);
    deck.position.set(0, 4.6, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    house.add(deck);

    // Veranda balustrade (ราวระเบียงโปร่ง)
    const railingBack = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.8, 0.15), woodBeamMat);
    railingBack.position.set(0, 5.2, -4.5);
    house.add(railingBack);

    // Traditional glazed Dragon Water Jar / Lotus Pot on veranda (โอ่งมังกร / อ่างบัวบนชาน)
    const jarGeo = new THREE.CylinderGeometry(0.55, 0.35, 1.1, 14);
    const jarMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.3 });
    const jar = new THREE.Mesh(jarGeo, jarMat);
    jar.position.set(4.2, 5.2, 3.2);
    house.add(jar);

    // --- 4. Authentic Teak Pagon House Walls (ตัวเรือนฝาปะกนไม้สัก) ---
    const bodyGeo = new THREE.BoxGeometry(7.8, 4.4, 6.0);
    const body = new THREE.Mesh(bodyGeo, teakMat);
    body.position.set(-0.8, 6.8, -0.6);
    body.castShadow = true;
    body.receiveShadow = true;
    house.add(body);

    // Windows with Carved Spindle Shutters & Warm Glow (หน้าต่างลูกกรงมะหวด)
    [-2.2, 1.2].forEach((wx) => {
      const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.2), woodBeamMat);
      winFrame.position.set(-0.8 + wx, 7.0, 2.45);
      house.add(winFrame);

      const winGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.6), warmLightMat);
      winGlow.position.set(-0.8 + wx, 7.0, 2.56);
      house.add(winGlow);

      // 3 vertical wooden bars (ลูกกรงมะหวด)
      for (let b = -0.35; b <= 0.35; b += 0.35) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), woodBeamMat);
        bar.position.set(-0.8 + wx + b, 7.0, 2.58);
        house.add(bar);
      }
    });

    // Traditional Raised Door Threshold (ธรณีประตูและบานประตูไม้)
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 0.15), woodBeamMat);
    doorFrame.position.set(2.4, 6.2, 2.42);
    house.add(doorFrame);

    // --- 5. Sweeping Curved Thai Gable Roof (หลังคาเรือนไทยแอ่นโค้งอ่อนช้อย) ---
    // Primary roof cone
    const roofGeo = new THREE.ConeGeometry(6.4, 4.2, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.scale.set(1.42, 0.88, 1.15);
    roof.position.set(-0.8, 10.4, -0.6);
    roof.castShadow = true;
    house.add(roof);

    // Overhang Eaves & Rafters (ชายคาปีกนกยื่นยาว)
    const eave = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.3, 8.8), roofMat);
    eave.position.set(-0.8, 9.2, -0.6);
    house.add(eave);

    // Carved Golden Tympanum (หน้าบันไม้แกะสลักสีทอง)
    const pediment = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.4), pediMat);
    pediment.position.set(-0.8, 9.8, 2.45);
    house.add(pediment);

    // --- 6. Chofa, Bai Raka, Hang Hong (ช่อฟ้า ใบระกา หางหงส์) ---
    // Chofa peaks
    [1, -1].forEach((dir) => {
      const chofa = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.8, 6), goldMat);
      chofa.position.set(-0.8, 12.3, -0.6 + dir * 3.8);
      chofa.rotation.x = dir * 0.38;
      house.add(chofa);

      // Hang Hong at lower eave corners (หางหงส์ปลายชายคา)
      const hangHongL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.0, 5), goldMat);
      hangHongL.position.set(-5.6, 9.1, -0.6 + dir * 4.2);
      hangHongL.rotation.z = -0.5;
      house.add(hangHongL);

      const hangHongR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.0, 5), goldMat);
      hangHongR.position.set(4.0, 9.1, -0.6 + dir * 4.2);
      hangHongR.rotation.z = 0.5;
      house.add(hangHongR);
    });

    // Hanging Woven Thai Festival Lanterns under veranda eaves
    const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffaa22 });
    [-1.5, 1.5].forEach((lx) => {
      const hLantern = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.7, 8), lanternMat);
      hLantern.position.set(lx, 8.5, 3.2);
      house.add(hLantern);
    });

    // --- 7. Wooden Staircase down to Pier (บันไดเรือนไทยไม้สัก) ---
    for (let st = 0; st < 6; st++) {
      const stair = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 0.6), woodBeamMat);
      stair.position.set(3.2, 4.4 - st * 0.7, 4.6 + st * 0.7);
      house.add(stair);
    }

    this.scene.add(house);

    // Traditional Thai Riverside Pavilion (ศาลาริมน้ำทรงไทย)
    const salaGroup = this.buildThaiSalaMesh();
    salaGroup.position.set(-21, 1.8, 16);
    salaGroup.scale.set(1.2, 1.2, 1.2);
    this.scene.add(salaGroup);

    // River embankment & wooden pier
    this.createRiverbankPromenade();
  }

  buildThaiSalaMesh() {
    const sala = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4e2810, roughness: 0.7 });
    const roofMat = new THREE.MeshStandardMaterial({ map: this.roofTileTexture, roughness: 0.45 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5b041, metalness: 0.7 });

    // 4 Columns
    const colGeo = new THREE.CylinderGeometry(0.18, 0.24, 3.6, 8);
    [[-2, 1.8, -2], [2, 1.8, -2], [-2, 1.8, 2], [2, 1.8, 2]].forEach(([x, y, z]) => {
      const col = new THREE.Mesh(colGeo, woodMat);
      col.position.set(x, y, z);
      sala.add(col);
    });

    const floor = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 5.4), woodMat);
    floor.position.set(0, 0.2, 0);
    sala.add(floor);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.0, 2.6, 4), roofMat);
    roof.rotateY(Math.PI / 4);
    roof.position.set(0, 4.8, 0);
    sala.add(roof);

    const apex = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.4, 6), goldMat);
    apex.position.set(0, 6.4, 0);
    sala.add(apex);

    return sala;
  }

  createRiverbankPromenade() {
    const bankGeo = new THREE.BoxGeometry(32, 10, 180);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x223a1a, roughness: 0.85 });
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.position.set(-36, -3, 0);
    bank.receiveShadow = true;
    this.scene.add(bank);

    const stoneEdge = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2, 180),
      new THREE.MeshStandardMaterial({ color: 0x5a6369, roughness: 0.7 })
    );
    stoneEdge.position.set(-20, 0.5, 0);
    stoneEdge.receiveShadow = true;
    this.scene.add(stoneEdge);

    // Wooden Pier
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x422d19, roughness: 0.7 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 14), pierMat);
    deck.position.set(-16, 0.8, 6);
    deck.receiveShadow = true;
    this.scene.add(deck);

    // Pilings
    const pileGeo = new THREE.CylinderGeometry(0.3, 0.3, 6, 8);
    [[-13, 0, 0], [-13, 0, 12], [-18, 0, 0], [-18, 0, 12]].forEach(([x, y, z]) => {
      const pile = new THREE.Mesh(pileGeo, pierMat);
      pile.position.set(x, y, z);
      this.scene.add(pile);
    });

    // Stairs down to water
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 2.5), pierMat);
      step.position.set(-11.5 + i * 0.8, 0.6 - i * 0.25, 6);
      this.scene.add(step);
    }
  }

  /* ==========================================================
     3. REALISTIC TREES & PALMS (ต้นจามจุรีโบราณ & ต้นมะพร้าวริมน้ำ 80%+ Detail)
     อ้างอิงรูป 3: ต้นจามจุรีทรงพุ่มกว้าง ลำต้นแตกกิ่งแผ่เงาเหนือผืนน้ำ
     มีไฟส่องโคนต้นไม้สีเขียว-ทอง, ต้นมะพร้าวโน้มกิ่งลงสู่แม่น้ำ
  ========================================================== */
  createRealisticTrees() {
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x1f5c22,
      roughness: 0.65,
    });
    const darkLeafMat = new THREE.MeshStandardMaterial({
      color: 0x144018,
      roughness: 0.7,
    });
    const trunkMat = new THREE.MeshStandardMaterial({
      map: this.barkTexture,
      roughness: 0.85,
    });

    // --- A. Ancient Rain Tree / Banyan Tree (ต้นจามจุรีโบราณทรงพุ่มแผ่กว้างริมน้ำ แบบในรูป 3) ---
    const banyan = new THREE.Group();
    banyan.position.set(-27, 1.5, -20);

    // 1. Massive Gnarled Trunk with Buttress Roots (โคนต้นและพอนรากไม้)
    const baseTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.6, 6.0, 12), trunkMat);
    baseTrunk.position.y = 3.0;
    baseTrunk.castShadow = true;
    banyan.add(baseTrunk);

    // Buttress roots sprawling along the bank
    for (let r = 0; r < 5; r++) {
      const angle = (r / 5) * Math.PI * 2;
      const root = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3.5, 6), trunkMat);
      root.position.set(Math.cos(angle) * 1.8, 1.2, Math.sin(angle) * 1.8);
      root.rotation.z = Math.cos(angle) * 0.7;
      root.rotation.x = Math.sin(angle) * 0.7;
      banyan.add(root);
    }

    // 2. Multi-forked Spreading Boughs (กิ่งไม้ใหญ่แยก 3 ทิศทาง)
    const boughConfigs = [
      { rx: 0.45, rz: 0.35, len: 7.5, py: 5.5 },
      { rx: -0.35, rz: -0.45, len: 7.0, py: 5.8 },
      { rx: 0.2, rz: -0.6, len: 8.5, py: 5.2 }, // Overhanging the water
    ];

    const foliageCanopy = new THREE.Group();
    foliageCanopy.position.y = 9.0;

    boughConfigs.forEach((cfg) => {
      const bough = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, cfg.len, 8), trunkMat);
      bough.position.set(Math.sin(cfg.rz) * 2.5, cfg.py, Math.sin(cfg.rx) * 2.5);
      bough.rotation.x = cfg.rx;
      bough.rotation.z = cfg.rz;
      bough.castShadow = true;
      banyan.add(bough);

      // Layered Foliage Clouds on each limb (พุ่มใบไม้แน่นหนาเป็นชั้นๆ)
      for (let fc = 0; fc < 4; fc++) {
        const fMesh = new THREE.Mesh(
          new THREE.SphereGeometry(3.2 - fc * 0.4, 10, 8),
          fc % 2 === 0 ? leafMat : darkLeafMat
        );
        fMesh.scale.set(1.6, 0.85, 1.4);
        fMesh.position.set(
          Math.sin(cfg.rz) * (4.0 + fc * 2.0) + (Math.random() - 0.5) * 2,
          fc * 1.6 + 2.0,
          Math.sin(cfg.rx) * (4.0 + fc * 2.0) + (Math.random() - 0.5) * 2
        );
        fMesh.castShadow = true;
        foliageCanopy.add(fMesh);
      }
    });

    banyan.add(foliageCanopy);

    // Green & Amber Uplights illuminating the ancient tree from below (เหมือนในรูป 3)
    const treeUplight = new THREE.PointLight(0x22c55e, 4.0, 30, 1.3);
    treeUplight.position.set(0, 1.5, 0);
    banyan.add(treeUplight);

    const treeGoldLight = new THREE.PointLight(0xf59e0b, 3.5, 25, 1.4);
    treeGoldLight.position.set(2, 2.0, -2);
    banyan.add(treeGoldLight);

    this.scene.add(banyan);
    this.swayingTrees.push({ group: foliageCanopy, speed: 1.1, phase: 0.5 });

    // --- B. Curved Coconut Palms leaning toward water (ต้นมะพร้าวริมน้ำ) ---
    const palmPositions = [
      { x: -24, z: 28, rotY: 0.2, leanAngle: 0.28 },
      { x: -26, z: -38, rotY: -0.4, leanAngle: 0.32 },
      { x: -25, z: 40, rotY: 0.6, leanAngle: 0.25 },
    ];

    palmPositions.forEach((pCfg) => {
      const palm = new THREE.Group();
      palm.position.set(pCfg.x, 1.5, pCfg.z);

      // Segmented Curved Trunk (ลำต้นมะพร้าวมีปล้องโค้งโน้มลงสู่แม่น้ำ)
      let curPalmY = 0;
      let curPalmX = 0;
      const trunkSegments = 10;
      for (let s = 0; s < trunkSegments; s++) {
        const segH = 1.3;
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, segH, 8), trunkMat);
        seg.position.set(curPalmX, curPalmY + segH / 2, 0);
        seg.rotation.z = -pCfg.leanAngle * (s / trunkSegments);
        seg.castShadow = true;
        palm.add(seg);

        curPalmX += Math.sin(pCfg.leanAngle) * 0.45;
        curPalmY += Math.cos(pCfg.leanAngle) * 1.15;
      }

      // Crown of Drooping Feathered Fronds (ยอดและทางมะพร้าว 14 ทาง)
      const crown = new THREE.Group();
      crown.position.set(curPalmX, curPalmY, 0);

      // Coconuts cluster
      const nutMat = new THREE.MeshStandardMaterial({ color: 0x4d3811, roughness: 0.7 });
      for (let n = 0; n < 5; n++) {
        const nut = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), nutMat);
        nut.position.set(Math.cos(n * 1.2) * 0.5, -0.4, Math.sin(n * 1.2) * 0.5);
        crown.add(nut);
      }

      // 14 Curved Fronds
      for (let fr = 0; fr < 14; fr++) {
        const fAngle = (fr / 14) * Math.PI * 2;
        const frondRib = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.1, 5.5, 6),
          new THREE.MeshStandardMaterial({ color: 0x84cc16 })
        );
        frondRib.position.set(Math.cos(fAngle) * 2.2, -0.8, Math.sin(fAngle) * 2.2);
        frondRib.rotation.y = -fAngle;
        frondRib.rotation.z = 0.85;

        // Leaf blade on frond
        const leafBlade = new THREE.Mesh(
          new THREE.PlaneGeometry(1.4, 4.8),
          new THREE.MeshStandardMaterial({
            color: 0x16a34a,
            side: THREE.DoubleSide,
            roughness: 0.5,
          })
        );
        leafBlade.rotation.x = Math.PI / 2;
        frondRib.add(leafBlade);

        crown.add(frondRib);
      }

      palm.add(crown);
      this.scene.add(palm);
      this.swayingPalms.push({ group: crown, speed: 1.4, phase: Math.random() * Math.PI });
    });
  }

  /* ==========================================================
     4. WATER LILIES / LOTUS PADS (กอบัวหลวงริมน้ำ ตามรูป 3)
     ใบบัวลอยบนผิวน้ำ มีรอยเว้า V-notch + ดอกบัวหลวงสีชมพูบาน
  ========================================================== */
  createWaterLilies() {
    this.lotusBlossoms = [];
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const lotusPetalMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6, // Pink royal lotus
      roughness: 0.35,
    });
    const pollenMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    const clusterCenters = [
      [-13, -15],
      [-12, -2],
      [-11, 18],
      [-12, 32],
    ];

    clusterCenters.forEach(([cx, cz]) => {
      for (let i = 0; i < 7; i++) {
        const padGroup = new THREE.Group();
        const px = cx + (Math.random() - 0.5) * 6;
        const pz = cz + (Math.random() - 0.5) * 8;
        padGroup.position.set(px, 0.08, pz);

        // Circular lily pad with V-slit (ใบบัวผ่าแฉก)
        const padGeo = new THREE.CircleGeometry(0.85 + Math.random() * 0.4, 20, 0, Math.PI * 1.85);
        padGeo.rotateX(-Math.PI / 2);
        const pad = new THREE.Mesh(padGeo, padMat);
        padGroup.add(pad);

        // 30% chance of blooming pink lotus flower on pad
        if (i % 3 === 0) {
          const lotus = new THREE.Group();
          lotus.position.y = 0.2;

          for (let p = 0; p < 8; p++) {
            const pAng = (p / 8) * Math.PI * 2;
            const petal = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 4), lotusPetalMat);
            petal.position.set(Math.cos(pAng) * 0.28, 0.15, Math.sin(pAng) * 0.28);
            petal.rotation.z = Math.cos(pAng) * 0.5;
            petal.rotation.x = Math.sin(pAng) * 0.5;
            lotus.add(petal);
          }
          // Pollen center
          const pol = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), pollenMat);
          pol.position.y = 0.2;
          lotus.add(pol);

          padGroup.add(lotus);
        }

        this.scene.add(padGroup);
        this.lotusBlossoms.push({ group: padGroup, baseY: 0.08, phase: Math.random() * Math.PI * 2 });
      }
    });
  }

  /* ==========================================================
     5. BAMBOO FIRE TORCHES (คบเพลิงไม้ไผ่โบราณ ตามรูป 3)
     ปักเรียงรายริมน้ำตลอดแนวตลิ่ง เบ้าสาน เปลวไฟสะบัดไหวสะท้อนน้ำ
  ========================================================== */
  createBambooTorches() {
    const torchCount = 12;
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xd4a359, roughness: 0.6 });
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });

    for (let i = 0; i < torchCount; i++) {
      const zPos = -45 + i * 14;
      const torch = new THREE.Group();
      torch.position.set(-18.2, 1.0, zPos);

      // Slender Bamboo Stake
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.8, 8), bambooMat);
      pole.position.y = 2.4;
      pole.castShadow = true;
      torch.add(pole);

      // Woven Flared Torch Basket (เบ้าคบเพลิงทรงกรวยสานแบบล้านนา/สุโขทัย)
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.18, 0.75, 8), coneMat);
      basket.position.y = 4.8;
      torch.add(basket);

      // Dynamic Animated Fire Flame (เปลวไฟลุกโชน)
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.9, 8),
        new THREE.MeshBasicMaterial({ color: 0xff6600 })
      );
      flame.position.y = 5.4;
      torch.add(flame);

      // Bright Core Glow
      const core = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.65, 8),
        new THREE.MeshBasicMaterial({ color: 0xffea33 })
      );
      core.position.y = 5.3;
      torch.add(core);

      // Vertical reflection PointLight onto water
      const fLight = new THREE.PointLight(0xff7700, 3.4, 19, 1.3);
      fLight.position.set(0, 5.6, 0);
      torch.add(fLight);

      this.scene.add(torch);

      this.torchFlames.push({
        flame,
        core,
        light: fLight,
        speed: 6.5 + Math.random() * 4.0,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /* ==========================================================
     FLOATING SKY LANTERNS (โคมลอยยี่เป็ง นับร้อยดวง)
  ========================================================== */
  createSkyLanterns() {
    this.skyLanterns = [];
    const lanternCount = 95;
    const lanternGeo = new THREE.CylinderGeometry(0.4, 0.55, 0.95, 8, 1, true);

    for (let i = 0; i < lanternCount; i++) {
      const lanternMat = new THREE.MeshBasicMaterial({
        color: 0xffd060,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
      });
      const mesh = new THREE.Mesh(lanternGeo, lanternMat);

      const fireCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      fireCore.position.y = -0.35;
      mesh.add(fireCore);

      const spawnX = (Math.random() - 0.5) * 110 + 5;
      const spawnY = 8 + Math.random() * 55;
      const spawnZ = -5 - Math.random() * 85;

      mesh.position.set(spawnX, spawnY, spawnZ);
      const scale = 0.7 + Math.random() * 0.7;
      mesh.scale.set(scale, scale, scale);

      this.scene.add(mesh);

      this.skyLanterns.push({
        mesh,
        baseX: spawnX,
        baseZ: spawnZ,
        speedY: 0.025 + Math.random() * 0.035,
        driftAmp: 1.0 + Math.random() * 2.0,
        driftFreq: 0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
      });
    }
  }

  /* ==========================================================
     KRATHONG SAI / RIVER CANDLES (กระทงสายลอยสว่างทั่วแม่น้ำ)
  ========================================================== */
  createKrathongSai() {
    this.riverCandles = [];
    const count = 60;
    const bowlGeo = new THREE.CylinderGeometry(0.45, 0.25, 0.22, 10);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xc49a45, roughness: 0.5 });
    const flameGeo = new THREE.ConeGeometry(0.15, 0.45, 6);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff9900 });

    for (let i = 0; i < count; i++) {
      const candleGroup = new THREE.Group();

      const bowl = new THREE.Mesh(bowlGeo, bowlMat);
      bowl.position.y = 0.1;
      candleGroup.add(bowl);

      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 0.38;
      candleGroup.add(flame);

      const posX = (Math.random() - 0.5) * 45 + Math.sin(i) * 5;
      const posZ = -30 + Math.random() * 75;
      candleGroup.position.set(posX, 0.1, posZ);

      this.scene.add(candleGroup);

      this.riverCandles.push({
        group: candleGroup,
        flame,
        speed: 0.012 + Math.random() * 0.018,
        swaySpeed: 1.5 + Math.random() * 1.5,
        bobPhase: Math.random() * Math.PI * 2,
        originX: posX,
      });
    }
  }

  /* ==========================================================
     USER KRATHONG MESH
  ========================================================== */
  buildKrathongMesh(data) {
    const group = new THREE.Group();
    group.userData = { id: data.id, entry: data };

    const themeColor = new THREE.Color(data.color || "#f59e0b");
    const leafColor = 0x2e7d32;

    // 1. Base Trunk
    const baseGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.45, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x3d6b24,
      roughness: 0.8,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    base.castShadow = true;
    group.add(base);

    // 2. Folded Banana Leaves
    const petalCount = 14;
    const petalGeo = new THREE.ConeGeometry(0.4, 1.2, 4);
    petalGeo.scale(1.2, 1, 0.3);
    const petalMat = new THREE.MeshStandardMaterial({
      color: leafColor,
      roughness: 0.6,
    });

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(Math.cos(angle) * 1.7, 0.5, Math.sin(angle) * 1.7);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.z = 0.35;
      petal.castShadow = true;
      group.add(petal);
    }

    // 3. Flower Bed
    const flowerBedGeo = new THREE.TorusGeometry(1.1, 0.28, 8, 18);
    flowerBedGeo.rotateX(Math.PI / 2);
    const flowerBedMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      roughness: 0.4,
      metalness: 0.15,
    });
    const flowerBed = new THREE.Mesh(flowerBedGeo, flowerBedMat);
    flowerBed.position.y = 0.45;
    group.add(flowerBed);

    // 4. Candle & Dynamic Flame
    const candleGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.1, 10);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.set(0.3, 1.0, 0.2);
    group.add(candle);

    const flameGeo = new THREE.ConeGeometry(0.14, 0.45, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff7700 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0.3, 1.75, 0.2);
    flame.name = "candleFlame";
    group.add(flame);

    const flameLight = new THREE.PointLight(0xffa500, 2.5, 9, 1.5);
    flameLight.position.set(0.3, 1.85, 0.2);
    group.add(flameLight);

    // 5. Incense Sticks
    const incenseGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6);
    const incenseMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });

    [[-0.2, 0], [-0.35, 0.15], [-0.35, -0.15]].forEach(([ix, iz], idx) => {
      const stick = new THREE.Mesh(incenseGeo, incenseMat);
      stick.position.set(ix, 1.1, iz);
      stick.rotation.z = -0.15 * (idx + 1);
      group.add(stick);

      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 4, 4), tipMat);
      tip.position.set(ix - 0.15, 1.9, iz);
      group.add(tip);
    });

    // 6. User Photo Stand Billboard
    const photoGroup = new THREE.Group();
    photoGroup.position.set(0, 1.6, -0.4);

    const frameGeo = new THREE.BoxGeometry(1.6, 1.6, 0.1);
    const frameMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      metalness: 0.35,
      roughness: 0.4,
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    photoGroup.add(frame);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    const photoCanvas = document.createElement("canvas");
    photoCanvas.width = 128;
    photoCanvas.height = 128;
    const pCtx = photoCanvas.getContext("2d");
    pCtx.fillStyle = "#ffffff";
    pCtx.fillRect(0, 0, 128, 128);
    pCtx.fillStyle = "#1e293b";
    pCtx.font = "bold 14px sans-serif";
    pCtx.textAlign = "center";
    pCtx.fillText((data.name || "").slice(0, 8), 64, 70);

    const defaultTex = new THREE.CanvasTexture(photoCanvas);
    const photoMat = new THREE.MeshBasicMaterial({
      map: defaultTex,
      side: THREE.DoubleSide,
    });
    const photoPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), photoMat);
    photoPlane.position.z = 0.06;
    photoGroup.add(photoPlane);

    const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), photoMat);
    backPlane.position.z = -0.06;
    backPlane.rotation.y = Math.PI;
    photoGroup.add(backPlane);

    if (data.photoUrl) {
      textureLoader.load(
        data.photoUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          photoMat.map = tex;
          photoMat.needsUpdate = true;
        },
        undefined,
        () => {}
      );
    }

    group.add(photoGroup);

    // 7. Interactive selection highlight ring
    const ringGeo = new THREE.RingGeometry(1.9, 2.3, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.06;
    ring.name = "highlightRing";
    group.add(ring);

    group.position.set(data.x || 0, 0, data.z || 10);
    group.userData.speed = data.speed || 0.009;
    group.userData.bobOffset = Math.random() * Math.PI * 2;
    group.userData.rotSpeed = (Math.random() - 0.5) * 0.006;

    return group;
  }

  updateKrathongs(entries) {
    const currentIds = new Set(entries.map((e) => e.id));

    for (const [id, mesh] of this.krathongMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        this.krathongMeshes.delete(id);
      }
    }

    entries.forEach((entry, index) => {
      let mesh = this.krathongMeshes.get(entry.id);
      if (!mesh) {
        if (entry.x === undefined) {
          entry.x = ((index % 5) - 2) * 7 + (Math.random() - 0.5) * 3;
          entry.z = 5 + index * 6;
        }
        mesh = this.buildKrathongMesh(entry);
        this.scene.add(mesh);
        this.krathongMeshes.set(entry.id, mesh);
      } else {
        mesh.userData.entry = entry;
      }
    });
  }

  highlightKrathong(id) {
    for (const [mId, mesh] of this.krathongMeshes.entries()) {
      const ring = mesh.getObjectByName("highlightRing");
      if (ring) {
        ring.material.opacity = mId === id ? 0.95 : 0;
      }
    }
  }

  focusOnKrathong(id) {
    const mesh = this.krathongMeshes.get(id);
    if (!mesh) return;

    this.highlightKrathong(id);
    const targetPos = mesh.position.clone();
    targetPos.y += 1.6;
    this.controls.target.copy(targetPos);
  }

  onPointerDown(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const interactables = [];
    for (const mesh of this.krathongMeshes.values()) {
      mesh.traverse((child) => {
        if (child.isMesh) {
          interactables.push(child);
        }
      });
    }

    const intersects = this.raycaster.intersectObjects(interactables, false);
    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData?.id && obj.parent) {
        obj = obj.parent;
      }

      if (obj && obj.userData?.id) {
        this.highlightKrathong(obj.userData.id);
        if (this.onSelectKrathong) {
          this.onSelectKrathong(obj.userData.entry);
        }
      }
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /* ==========================================================
     ANIMATION LOOP ("วัตถุทุกอย่างมีความเคลื่อนไหว")
  ========================================================== */
  animate() {
    this.animId = requestAnimationFrame(this.animate.bind(this));
    const time = this.clock.getElapsedTime();

    // 1. Controls
    this.controls.update();

    // 2. Animated River Water Waves (ผิวน้ำกระเพื่อมไหว)
    if (this.riverPositions && this.baseRiverCoords) {
      const pos = this.riverPositions.array;
      for (let i = 0; i < pos.length; i += 3) {
        const x = this.baseRiverCoords[i];
        const z = this.baseRiverCoords[i + 2];
        pos[i + 1] =
          Math.sin(x * 0.12 + time * 2.0) * 0.22 +
          Math.cos(z * 0.15 + time * 1.6) * 0.18 +
          Math.sin((x + z) * 0.08 + time * 2.4) * 0.12;
      }
      this.riverPositions.needsUpdate = true;
    }

    // 3. Krathongs Flow Downstream & Rocking (กระทงลอยและโคลงเคลง)
    for (const mesh of this.krathongMeshes.values()) {
      const speed = mesh.userData.speed || 0.009;
      const bob = mesh.userData.bobOffset || 0;

      mesh.position.z -= speed * 4.6;
      if (mesh.position.z < -46) {
        mesh.position.z = 36 + Math.random() * 15;
        mesh.position.x = (Math.random() - 0.5) * 26;
      }

      mesh.position.y = Math.sin(time * 2.8 + bob) * 0.1 + 0.06;
      mesh.rotation.z = Math.sin(time * 2.0 + bob) * 0.035;
      mesh.rotation.x = Math.cos(time * 1.7 + bob) * 0.03;
      mesh.rotation.y += mesh.userData.rotSpeed || 0.002;

      const flame = mesh.getObjectByName("candleFlame");
      if (flame) {
        const flicker = Math.sin(time * 16.0 + bob) * 0.15 + 1.0;
        flame.scale.set(flicker, flicker * 1.1, flicker);
      }
    }

    // 4. Sky Lanterns Rising & Swaying (โคมลอยลอยขึ้นฟ้า)
    if (this.skyLanterns) {
      this.skyLanterns.forEach((item) => {
        item.mesh.position.y += item.speedY;
        item.mesh.position.x =
          item.baseX + Math.sin(time * item.driftFreq + item.phase) * item.driftAmp;
        item.mesh.position.z =
          item.baseZ + Math.cos(time * (item.driftFreq * 0.8) + item.phase) * (item.driftAmp * 0.5);

        item.mesh.rotation.y += item.rotSpeed;
        item.mesh.rotation.z = Math.sin(time * 1.5 + item.phase) * 0.04;

        if (item.mesh.position.y > 75) {
          item.mesh.position.y = 8 + Math.random() * 8;
          item.mesh.position.x = (Math.random() - 0.5) * 110 + 5;
          item.mesh.position.z = -10 - Math.random() * 85;
          item.baseX = item.mesh.position.x;
          item.baseZ = item.mesh.position.z;
        }
      });
    }

    // 5. Krathong Sai / River Candles (กระทงสายลอยสว่าง)
    if (this.riverCandles) {
      this.riverCandles.forEach((item) => {
        item.group.position.z -= item.speed * 4.0;
        if (item.group.position.z < -45) {
          item.group.position.z = 40 + Math.random() * 15;
          item.group.position.x = (Math.random() - 0.5) * 45;
          item.originX = item.group.position.x;
        }
        item.group.position.y = 0.08 + Math.sin(time * item.swaySpeed + item.bobPhase) * 0.08;
        item.group.position.x = item.originX + Math.sin(time * 1.2 + item.bobPhase) * 0.5;

        const fScale = 0.85 + Math.sin(time * 12.0 + item.bobPhase) * 0.2;
        item.flame.scale.set(fScale, fScale, fScale);
      });
    }

    // 6. Bamboo Torch Flames Dancing (คบเพลิงลุกโชน)
    if (this.torchFlames) {
      this.torchFlames.forEach((item) => {
        const flameDance = Math.sin(time * item.speed + item.phase) * 0.2 + 1.0;
        item.flame.scale.set(flameDance * 0.9, flameDance * 1.2, flameDance * 0.9);
        item.flame.rotation.z = Math.sin(time * 8.0 + item.phase) * 0.12;
        item.core.scale.set(flameDance, flameDance, flameDance);
        item.light.intensity = 3.0 + Math.sin(time * 14.0 + item.phase) * 0.8;
      });
    }

    // 7. Ancient Trees & Palms Swaying in Wind (ต้นจามจุรีและมะพร้าวไหวตามลม)
    if (this.swayingTrees) {
      this.swayingTrees.forEach((item) => {
        item.group.rotation.z = Math.sin(time * item.speed + item.phase) * 0.05;
        item.group.rotation.x = Math.cos(time * (item.speed * 0.7) + item.phase) * 0.035;
      });
    }

    if (this.swayingPalms) {
      this.swayingPalms.forEach((item) => {
        item.group.rotation.z = Math.sin(time * item.speed + item.phase) * 0.08;
        item.group.rotation.x = Math.cos(time * (item.speed * 0.8) + item.phase) * 0.06;
      });
    }

    // 8. Lotus Blossoms Bobbing on Water (ใบบัวลอยกระเพื่อม)
    if (this.lotusBlossoms) {
      this.lotusBlossoms.forEach((item) => {
        item.group.position.y = item.baseY + Math.sin(time * 2.2 + item.phase) * 0.04;
      });
    }

    // 9. Temple Architectural Light Shimmer
    if (this.templeLight) {
      this.templeLight.intensity = 5.5 + Math.sin(time * 1.5) * 0.5;
    }

    // 10. Stars Rotation
    if (this.starField) {
      this.starField.rotation.y = time * 0.002;
    }

    // 11. Render
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
    window.removeEventListener("resize", this.handleResize);
    if (this.renderer?.domElement) {
      this.renderer.domElement.removeEventListener("pointerdown", this.handleClick);
      if (this.container && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
    }
  }
}
