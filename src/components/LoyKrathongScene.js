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

    // Dynamic animated object collections
    this.skyLanterns = [];
    this.riverCandles = [];
    this.torchFlames = [];
    this.swayingTrees = [];
    this.swayingPalms = [];
    this.flickerLights = [];
    this.lotusBlossoms = [];
    this.lotusObstacles = []; // Positions & radius for collision avoidance
    this.thaiPeople = []; // โมเดลคนในฉากสวมเสื้อม่อฮ่อมสีน้ำเงิน โจงกระเบนสีน้ำตาล
    this.candidateAvatars = new Map(); // โมเดลผู้สมัครสวมชุดไทยยืนเด่นบนท่าน้ำสีเขียว
    this.activeFireworks = []; // ระบบพลุดอกไม้ไฟ 3D สมจริง 100%
    this.fireworkTexture = null;
    this.soundCtx = null;

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

    // 5. Generate Procedural Textures (Thai Architecture, Flora, Realistic Palm Fronds)
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

    // 11. Realistic Trees & Photorealistic Coconut Palms (ต้นมะพร้าวธรรมชาติสมจริง 80%+)
    this.createRealisticTrees();

    // 12. Water Lilies / Lotus Pads (กอบัวหลวงริมน้ำ - จัดแนวชิดตลิ่ง ไม่เกะกะทางลอยกระทง)
    this.createWaterLilies();

    // 13. Bamboo Torches (คบเพลิงไม้ไผ่โบราณ ตามรูป 3)
    this.createBambooTorches();

    // 14. Floating Elements (โคมลอยยี่เป็ง & กระทงสาย)
    this.createSkyLanterns();
    this.createKrathongSai();

    // 15. Animated Thai People (โมเดลคนสวมชุดไทยหลากสี เดินเล่น และลอยกระทงริมท่าน้ำ)
    this.createThaiPeople();

    // Event Listeners
    this.handleResize = this.onWindowResize.bind(this);
    this.handlePointerDown = (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    };
    this.handlePointerUp = this.onPointerUp.bind(this);
    window.addEventListener("resize", this.handleResize);
    this.renderer.domElement.addEventListener("pointerdown", this.handlePointerDown);
    this.renderer.domElement.addEventListener("pointerup", this.handlePointerUp);

    // Start Animation Loop
    this.animate();
  }

  /* ==========================================================
     TEXTURE GENERATION
  ========================================================== */
  createTextures() {
    // 1. Thai Teak Pagon Wall Texture
    const pagonCanvas = document.createElement("canvas");
    pagonCanvas.width = 512;
    pagonCanvas.height = 512;
    const pCtx = pagonCanvas.getContext("2d");

    pCtx.fillStyle = "#63381a";
    pCtx.fillRect(0, 0, 512, 512);

    pCtx.strokeStyle = "rgba(45, 23, 10, 0.35)";
    pCtx.lineWidth = 1.5;
    for (let i = 0; i < 512; i += 4) {
      pCtx.beginPath();
      pCtx.moveTo(0, i + (Math.random() - 0.5) * 3);
      pCtx.bezierCurveTo(150, i + 2, 350, i - 2, 512, i);
      pCtx.stroke();
    }

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

        pCtx.fillStyle = "#381c0c";
        pCtx.fillRect(x - 3, y - 3, w + 6, h + 6);

        pCtx.fillStyle = "#7c4420";
        pCtx.fillRect(x, y, w, h);

        pCtx.fillStyle = "rgba(255, 210, 150, 0.12)";
        pCtx.fillRect(x + 4, y + 4, w - 8, 4);
        pCtx.fillRect(x + 4, y + 4, 4, h - 8);

        pCtx.fillStyle = "rgba(20, 10, 5, 0.4)";
        pCtx.fillRect(x + 4, y + h - 8, w - 8, 4);
        pCtx.fillRect(x + w - 8, y + 4, 4, h - 8);
      }
    }
    this.pagonTexture = new THREE.CanvasTexture(pagonCanvas);
    this.pagonTexture.wrapS = THREE.RepeatWrapping;
    this.pagonTexture.wrapT = THREE.RepeatWrapping;

    // 2. Thai Terracotta Fish-Scale Roof Tiles
    const tileCanvas = document.createElement("canvas");
    tileCanvas.width = 512;
    tileCanvas.height = 512;
    const tCtx = tileCanvas.getContext("2d");

    tCtx.fillStyle = "#a83515";
    tCtx.fillRect(0, 0, 512, 512);

    const tileW = 32;
    const tileH = 24;
    for (let row = 0; row < 512 / tileH + 1; row++) {
      const offsetX = (row % 2) * (tileW / 2);
      for (let col = -1; col < 512 / tileW + 1; col++) {
        const tx = col * tileW + offsetX;
        const ty = row * tileH;

        tCtx.beginPath();
        tCtx.moveTo(tx, ty);
        tCtx.lineTo(tx + tileW, ty);
        tCtx.bezierCurveTo(tx + tileW, ty + tileH * 0.9, tx, ty + tileH * 0.9, tx, ty);
        tCtx.fillStyle = (row + col) % 3 === 0 ? "#b83f1d" : "#982d11";
        tCtx.fill();

        tCtx.strokeStyle = "rgba(255, 170, 120, 0.25)";
        tCtx.lineWidth = 1;
        tCtx.stroke();
      }
    }
    this.roofTileTexture = new THREE.CanvasTexture(tileCanvas);
    this.roofTileTexture.wrapS = THREE.RepeatWrapping;
    this.roofTileTexture.wrapT = THREE.RepeatWrapping;
    this.roofTileTexture.repeat.set(3, 3);

    // 3. Golden Thai Kanok Pediment Motif
    const kanokCanvas = document.createElement("canvas");
    kanokCanvas.width = 512;
    kanokCanvas.height = 256;
    const kCtx = kanokCanvas.getContext("2d");

    kCtx.fillStyle = "#630b14";
    kCtx.fillRect(0, 0, 512, 256);

    kCtx.strokeStyle = "#facc15";
    kCtx.fillStyle = "#eab308";
    kCtx.lineWidth = 3;

    const centerX = 256;
    const centerY = 210;

    kCtx.beginPath();
    kCtx.arc(centerX, centerY, 28, 0, Math.PI * 2);
    kCtx.fill();

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

    // 4B. Photorealistic Coconut Palm Bark with High-Contrast Ring Scars (ตามรูปแนบ 2 และ 3)
    const cBarkCanvas = document.createElement("canvas");
    cBarkCanvas.width = 256;
    cBarkCanvas.height = 1024;
    const cbCtx = cBarkCanvas.getContext("2d");
    cbCtx.fillStyle = "#5c5046";
    cbCtx.fillRect(0, 0, 256, 1024);

    // Subtle vertical fibrous striations
    for (let x = 0; x < 256; x += 2) {
      cbCtx.strokeStyle = (x % 4 === 0) ? "#473c33" : "#695d52";
      cbCtx.lineWidth = 1.2;
      cbCtx.beginPath();
      cbCtx.moveTo(x, 0);
      cbCtx.lineTo(x, 1024);
      cbCtx.stroke();
    }

    // Dense, high-contrast horizontal ring scars (รอยปล้องกาบมะพร้าวแบบรูป 2 และ 3)
    const ringSpacing = 16;
    for (let y = 0; y < 1024; y += ringSpacing) {
      // Dark indented groove
      cbCtx.strokeStyle = "#1b140e";
      cbCtx.lineWidth = 3.5;
      cbCtx.beginPath();
      cbCtx.moveTo(0, y + (Math.random() - 0.5) * 2);
      cbCtx.lineTo(256, y + (Math.random() - 0.5) * 2);
      cbCtx.stroke();

      // Pale greyish-buff fibrous scar ridge directly above groove
      cbCtx.strokeStyle = "rgba(185, 175, 165, 0.75)";
      cbCtx.lineWidth = 2.0;
      cbCtx.beginPath();
      cbCtx.moveTo(0, y - 2);
      cbCtx.lineTo(256, y - 2);
      cbCtx.stroke();
    }
    this.coconutBarkTexture = new THREE.CanvasTexture(cBarkCanvas);
    this.coconutBarkTexture.wrapS = THREE.RepeatWrapping;
    this.coconutBarkTexture.wrapT = THREE.RepeatWrapping;
    this.coconutBarkTexture.repeat.set(1, 3);

    // 5. Photorealistic Feathered Palm Frond Leaflet Texture 90%+ (ทางมะพร้าวขนนกเสมือนจริงตามรูป 2 และ 3)
    const frondCanvas = document.createElement("canvas");
    frondCanvas.width = 512;
    frondCanvas.height = 1024;
    const fCtx = frondCanvas.getContext("2d");
    fCtx.clearRect(0, 0, 512, 1024);

    // Central golden-green spine (ก้านทางมะพร้าว)
    fCtx.strokeStyle = "#84cc16";
    fCtx.lineWidth = 8;
    fCtx.beginPath();
    fCtx.moveTo(256, 0);
    fCtx.lineTo(256, 1024);
    fCtx.stroke();

    fCtx.strokeStyle = "#a3e635";
    fCtx.lineWidth = 3.5;
    fCtx.beginPath();
    fCtx.moveTo(256, 0);
    fCtx.lineTo(256, 1024);
    fCtx.stroke();

    // 110 paired dense, sharp, tapering pinnae leaflets (ใบย่อยขนนกสองข้างเรียงถี่แบบรูป 2 และ 3)
    const pinnaeCount = 110;
    for (let i = 0; i < pinnaeCount; i++) {
      const y = (i / pinnaeCount) * 980 + 20;
      const t = i / pinnaeCount;
      // Natural palm taper: narrow at base, broadest at 40%, tapering to sharp needle tip
      const span = Math.pow(Math.sin(t * Math.PI * 0.95), 0.75) * 225 + 18;

      // Left leaflet
      fCtx.strokeStyle = i % 3 === 0 ? "#14532d" : (i % 3 === 1 ? "#15803d" : "#22c55e");
      fCtx.lineWidth = 3.0;
      fCtx.beginPath();
      fCtx.moveTo(256, y);
      fCtx.quadraticCurveTo(256 - span * 0.55, y + 25, 256 - span, y + 42);
      fCtx.stroke();

      // Right leaflet
      fCtx.strokeStyle = i % 3 === 0 ? "#166534" : (i % 3 === 1 ? "#16a34a" : "#22c55e");
      fCtx.lineWidth = 3.0;
      fCtx.beginPath();
      fCtx.moveTo(256, y);
      fCtx.quadraticCurveTo(256 + span * 0.55, y + 25, 256 + span, y + 42);
      fCtx.stroke();
    }
    this.palmFrondTexture = new THREE.CanvasTexture(frondCanvas);

    // 6. Silver Corrugated Standing-Seam Metal Roof (ตามรูปแนบ 2 และ 3)
    const roofCanvas = document.createElement("canvas");
    roofCanvas.width = 512;
    roofCanvas.height = 512;
    const rCtx = roofCanvas.getContext("2d");
    rCtx.fillStyle = "#bcc5ce";
    rCtx.fillRect(0, 0, 512, 512);

    const seamSpacing = 16;
    for (let x = 0; x < 512; x += seamSpacing) {
      rCtx.fillStyle = "#8795a3";
      rCtx.fillRect(x, 0, 2, 512);
      rCtx.fillStyle = "#eaf0f5";
      rCtx.fillRect(x + 2, 0, 3, 512);
      rCtx.fillStyle = "#cbd5df";
      rCtx.fillRect(x + 5, 0, seamSpacing - 5, 512);
    }
    this.silverRoofTexture = new THREE.CanvasTexture(roofCanvas);
    this.silverRoofTexture.wrapS = THREE.RepeatWrapping;
    this.silverRoofTexture.wrapT = THREE.RepeatWrapping;
    this.silverRoofTexture.repeat.set(3, 3);

    // 7. Horizontal Teak Wood Siding / Clapboard (ตามรูปแนบ 2 และ 3)
    const sidingCanvas = document.createElement("canvas");
    sidingCanvas.width = 512;
    sidingCanvas.height = 512;
    const sCtx = sidingCanvas.getContext("2d");
    sCtx.fillStyle = "#825d34";
    sCtx.fillRect(0, 0, 512, 512);

    const plankH = 24;
    for (let y = 0; y < 512; y += plankH) {
      sCtx.fillStyle = Math.floor(y / plankH) % 2 === 0 ? "#8c6538" : "#7c552b";
      sCtx.fillRect(0, y, 512, plankH - 3);

      sCtx.fillStyle = "#422812";
      sCtx.fillRect(0, y + plankH - 3, 512, 3);

      sCtx.fillStyle = "rgba(255, 230, 185, 0.16)";
      sCtx.fillRect(0, y + 1, 512, 2);
    }
    this.teakSidingTexture = new THREE.CanvasTexture(sidingCanvas);
    this.teakSidingTexture.wrapS = THREE.RepeatWrapping;
    this.teakSidingTexture.wrapT = THREE.RepeatWrapping;
    this.teakSidingTexture.repeat.set(2, 4);

    // 8. Teak Terrace Deck Planks
    const deckCanvas = document.createElement("canvas");
    deckCanvas.width = 512;
    deckCanvas.height = 512;
    const dCtx = deckCanvas.getContext("2d");
    dCtx.fillStyle = "#5c3318";
    dCtx.fillRect(0, 0, 512, 512);

    const boardW = 20;
    for (let x = 0; x < 512; x += boardW) {
      dCtx.fillStyle = Math.floor(x / boardW) % 2 === 0 ? "#6a3b1c" : "#562d14";
      dCtx.fillRect(x, 0, boardW - 2, 512);

      dCtx.fillStyle = "#2c1508";
      dCtx.fillRect(x + boardW - 2, 0, 2, 512);
    }
    this.deckPlankTexture = new THREE.CanvasTexture(deckCanvas);
    this.deckPlankTexture.wrapS = THREE.RepeatWrapping;
    this.deckPlankTexture.wrapT = THREE.RepeatWrapping;
    this.deckPlankTexture.repeat.set(4, 4);

    // 9. Tropical Shade Tree Foliage Leaves (ตามรูปแนบ 2 และ 3)
    const leafCanvas = document.createElement("canvas");
    leafCanvas.width = 256;
    leafCanvas.height = 256;
    const lCtx = leafCanvas.getContext("2d");
    lCtx.clearRect(0, 0, 256, 256);

    for (let i = 0; i < 90; i++) {
      const lx = 25 + Math.random() * 206;
      const ly = 25 + Math.random() * 206;
      const ang = Math.random() * Math.PI * 2;
      const rad = 10 + Math.random() * 12;

      lCtx.save();
      lCtx.translate(lx, ly);
      lCtx.rotate(ang);
      lCtx.beginPath();
      lCtx.ellipse(0, 0, rad, rad * 0.45, 0, 0, Math.PI * 2);
      lCtx.fillStyle = ["#2d6a2f", "#3c823f", "#1f4f21", "#48994b"][i % 4];
      lCtx.fill();
      lCtx.restore();
    }
    this.leafFoliageTexture = new THREE.CanvasTexture(leafCanvas);
  }

  /* ==========================================================
     LIGHTING
  ========================================================== */
  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x406295, 2.1);
    this.scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0xffe88a, 2.6);
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

    const riverGlowLight = new THREE.DirectionalLight(0xff9e24, 1.4);
    riverGlowLight.position.set(-15, 20, 20);
    this.scene.add(riverGlowLight);

    const templeFlood = new THREE.PointLight(0xffd56b, 5.5, 80, 1.2);
    templeFlood.position.set(16, 20, -42);
    this.scene.add(templeFlood);
    this.templeLight = templeFlood;

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
    grad.addColorStop(0.0, "#081b3c");
    grad.addColorStop(0.3, "#102c5e");
    grad.addColorStop(0.55, "#341d58");
    grad.addColorStop(0.72, "#742458");
    grad.addColorStop(0.85, "#bd4925");
    grad.addColorStop(0.94, "#e57c1d");
    grad.addColorStop(1.0, "#fde047");

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
    // 1. สร้างพื้นผิวพระจันทร์เต็มดวงสีเหลืองทองสุกสว่าง (Vivid Golden Moon Texture)
    const moonCanvas = document.createElement("canvas");
    moonCanvas.width = 512;
    moonCanvas.height = 512;
    const mCtx = moonCanvas.getContext("2d");

    // สีเหลืองทองสุกสว่าง ไล่ระดับจากไฮไลต์สีทองสว่างไปจนถึงขอบสีอำพัน
    const mGrad = mCtx.createRadialGradient(220, 220, 25, 256, 256, 256);
    mGrad.addColorStop(0, "#fffbeb");    // ใจกลางสว่างสีทองนวล
    mGrad.addColorStop(0.25, "#fef08a");  // สีเหลืองทองสว่างสดใส
    mGrad.addColorStop(0.55, "#facc15");  // สีทองสุกอร่าม
    mGrad.addColorStop(0.82, "#eab308");  // สีทองอิ่มตัว
    mGrad.addColorStop(1.0, "#ca8a04");   // ขอบทองประกายส้ม
    mCtx.fillStyle = mGrad;
    mCtx.fillRect(0, 0, 512, 512);

    // ลวดลายกระต่ายบนดวงจันทร์แบบไทยจางๆ อย่างเป็นธรรมชาติ
    mCtx.fillStyle = "rgba(180, 110, 10, 0.12)";
    const maria = [
      { x: 170, y: 190, r: 70 },
      { x: 310, y: 170, r: 85 },
      { x: 250, y: 310, r: 95 },
      { x: 360, y: 290, r: 60 },
      { x: 160, y: 320, r: 55 },
    ];
    maria.forEach((m) => {
      mCtx.beginPath();
      mCtx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      mCtx.fill();
    });

    const moonTexture = new THREE.CanvasTexture(moonCanvas);
    moonTexture.colorSpace = THREE.SRGBColorSpace;

    // ดวงจันทร์: ปิดผลกระทบหมอก (fog: false) เพื่อไม่ให้หมอกกลางคืนกลืนเป็นสีเทา
    const moonGeo = new THREE.SphereGeometry(8.2, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({
      map: moonTexture,
      fog: false,
    });
    this.moon = new THREE.Mesh(moonGeo, moonMat);
    this.moon.position.set(32, 54, -75);
    this.moon.rotation.y = -Math.PI / 4;
    this.scene.add(this.moon);

    // 2. รัศมีออร่าแสงสีทองเรืองรอง (Luminous Golden Halo Billboard Sprite)
    const haloCanvas = document.createElement("canvas");
    haloCanvas.width = 512;
    haloCanvas.height = 512;
    const hCtx = haloCanvas.getContext("2d");

    const hGrad = hCtx.createRadialGradient(256, 256, 35, 256, 256, 256);
    hGrad.addColorStop(0, "rgba(254, 240, 138, 0.98)");
    hGrad.addColorStop(0.20, "rgba(250, 204, 21, 0.75)");
    hGrad.addColorStop(0.45, "rgba(245, 158, 11, 0.40)");
    hGrad.addColorStop(0.70, "rgba(217, 119, 6, 0.18)");
    hGrad.addColorStop(0.90, "rgba(180, 83, 9, 0.05)");
    hGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
    hCtx.fillStyle = hGrad;
    hCtx.fillRect(0, 0, 512, 512);

    const haloTexture = new THREE.CanvasTexture(haloCanvas);
    haloTexture.colorSpace = THREE.SRGBColorSpace;

    const haloMat = new THREE.SpriteMaterial({
      map: haloTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      fog: false,
      depthWrite: false,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(52, 52, 1.0);
    halo.position.copy(this.moon.position);
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
     GRAND THAI CHEDI & TEMPLE (80%+ Detail)
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

    // 1. Foundation Platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(40, 3.2, 30), whiteStoneMat);
    platform.position.set(0, 1.6, 0);
    platform.receiveShadow = true;
    templeGroup.add(platform);

    const railingGeo = new THREE.BoxGeometry(39, 0.6, 0.4);
    const railFront = new THREE.Mesh(railingGeo, whiteStoneMat);
    railFront.position.set(0, 3.4, 14.6);
    templeGroup.add(railFront);

    for (let s = 0; s < 5; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(10, 0.35, 1.2), marbleStairsMat);
      step.position.set(0, 1.4 - s * 0.35, 15.6 + s * 1.0);
      step.receiveShadow = true;
      templeGroup.add(step);
    }

    // 2. Grand Sukhothai Golden Bell Chedi
    const chediGroup = new THREE.Group();
    chediGroup.position.set(-6, 3.2, -3);

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

    const ring1 = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.4, 1.0, 24), goldMat);
    ring1.position.y = chediY + 0.5;
    chediGroup.add(ring1);
    chediY += 1.0;

    const ring2 = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.9, 0.8, 24), goldMat);
    ring2.position.y = chediY + 0.4;
    chediGroup.add(ring2);
    chediY += 0.8;

    const bellGeo = new THREE.SphereGeometry(3.5, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const bellMesh = new THREE.Mesh(bellGeo, goldMat);
    bellMesh.position.y = chediY + 1.2;
    bellMesh.scale.set(1.0, 1.2, 1.0);
    bellMesh.castShadow = true;
    chediGroup.add(bellMesh);
    chediY += 3.8;

    const harmika = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 2.4), goldMat);
    harmika.position.y = chediY + 0.55;
    chediGroup.add(harmika);
    chediY += 1.1;

    const spireRingsCount = 13;
    for (let r = 0; r < spireRingsCount; r++) {
      const radius = 1.1 * (1 - (r / spireRingsCount) * 0.82);
      const sRing = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.9, radius, 0.42, 16), goldMat);
      sRing.position.y = chediY + r * 0.44;
      sRing.castShadow = true;
      chediGroup.add(sRing);
    }
    chediY += spireRingsCount * 0.44;

    const finialGeo = new THREE.ConeGeometry(0.25, 2.5, 12);
    const finial = new THREE.Mesh(finialGeo, goldMat);
    finial.position.y = chediY + 1.25;
    chediGroup.add(finial);

    const gemGeo = new THREE.SphereGeometry(0.35, 10, 10);
    const gemMesh = new THREE.Mesh(gemGeo, new THREE.MeshBasicMaterial({ color: 0xfff3a8 }));
    gemMesh.position.y = chediY + 2.4;
    chediGroup.add(gemMesh);

    templeGroup.add(chediGroup);

    // 3. Royal Viharn
    const viharn = new THREE.Group();
    viharn.position.set(10, 3.2, 2);

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

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.7), goldMat);
      cap.position.set(px, 4.8, pz);
      viharn.add(cap);
    });

    const innerWall = new THREE.Mesh(new THREE.BoxGeometry(5.2, 4.6, 7.2), whiteStoneMat);
    innerWall.position.set(0, 2.3, 0);
    viharn.add(innerWall);

    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.2), new THREE.MeshBasicMaterial({ color: 0xffd56b }));
    door.position.set(0, 2.1, 3.65);
    viharn.add(door);

    for (let t = 0; t < 3; t++) {
      const roofCone = new THREE.Mesh(new THREE.ConeGeometry(5.6 - t * 0.7, 2.8, 4), thaiRoofMat);
      roofCone.rotateY(Math.PI / 4);
      roofCone.scale.set(1.15, 0.7, 1.45);
      roofCone.position.set(0, 5.2 + t * 1.3, 0);
      roofCone.castShadow = true;
      viharn.add(roofCone);

      [1, -1].forEach((dir) => {
        const chofa = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.6, 6), goldMat);
        chofa.position.set(0, 7.2 + t * 1.3, dir * (4.8 - t * 0.6));
        chofa.rotation.x = dir * 0.42;
        viharn.add(chofa);
      });
    }

    const gPedi = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 2.2), pedimentMat);
    gPedi.position.set(0, 6.2, 4.9);
    viharn.add(gPedi);

    templeGroup.add(viharn);

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
     AUTHENTIC THAI STILT HOUSE COMPOUND (หมู่เรือนไทยยกใต้ถุนสูง)
     ออกแบบตรงตามรูปแนบที่ 2 และ 3 ความสมจริง 80-90%+
     - ฐานสนามหญ้าและคันกั้นดินคอนกรีต
     - เสาไม้เต็งยกใต้ถุนสูง พร้อมฐานตอม่อคอนกรีตทุกต้น
     - ชานเรือนไม้กระดานกว้างเชื่อมต่อหมู่เรือน
     - ซุ้มบันไดทางขึ้นคู่ (2 ฝั่ง) มีหลังคาคลุมและราวลูกกรงฉลุ
     - ศาลาโถงชานเรือนเปิดโล่ง พร้อมม้านั่งไม้พนักพิงยาว
     - เรือนนอนฝาไม้สักทองแนวนอน พร้อมหน้าต่างบานกระทุ้งมีไม้ค้ำเปิดออก
     - เรือนหลังซ้ายเชื่อมต่อทางเดิน
     - หลังคาทรงจั่วมนิลา/ปั้นหยา เมทัลชีท/ลอนคู่สีเทาเงิน เชิงชายสีขาว ยอดกาแล
     - ต้นไม้ใหญ่ร่มรื่นทรงพุ่มหนาเสมือนจริงด้านหลังเรือน
  ========================================================== */
  createRealisticThaiHouse() {
    const compound = new THREE.Group();
    // Position on riverbank lawn - STRICTLY PARALLEL to the river edge (rotation.y = 0)
    compound.position.set(-32, 0.4, -2);
    compound.rotation.y = 0;

    const mats = {
      concrete: new THREE.MeshStandardMaterial({ color: 0xd6dbe0, roughness: 0.82 }),
      grass: new THREE.MeshStandardMaterial({ color: 0x3d6624, roughness: 0.9 }),
      silverRoof: new THREE.MeshStandardMaterial({ map: this.silverRoofTexture, roughness: 0.42, metalness: 0.28 }),
      whiteFascia: new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.35 }),
      teakSiding: new THREE.MeshStandardMaterial({ map: this.teakSidingTexture, roughness: 0.65 }),
      deckPlank: new THREE.MeshStandardMaterial({ map: this.deckPlankTexture, roughness: 0.7 }),
      wood: new THREE.MeshStandardMaterial({ color: 0x7c3815, roughness: 0.62 }),
      darkWood: new THREE.MeshStandardMaterial({ color: 0x481e0a, roughness: 0.72 }),
      windowInterior: new THREE.MeshBasicMaterial({ color: 0x140c06 }),
      lanternGlow: new THREE.MeshBasicMaterial({ color: 0xffaa33 }),
      bark: new THREE.MeshStandardMaterial({ map: this.barkTexture, roughness: 0.85 }),
      leafMat: new THREE.MeshStandardMaterial({
        map: this.leafFoliageTexture,
        transparent: true,
        alphaTest: 0.35,
        roughness: 0.65,
        side: THREE.DoubleSide
      }),
      leafSolidMat: new THREE.MeshStandardMaterial({ color: 0x276328, roughness: 0.7 }),
      leafDarkSolidMat: new THREE.MeshStandardMaterial({ color: 0x1a4a1c, roughness: 0.75 })
    };

    // 1. Raised Plot & Concrete Retaining Curb
    this.buildCompoundGroundPlot(compound, mats);

    // 2. Concrete Footings & Elevated Stilt Columns
    this.buildStiltFoundation(compound, mats);

    // 3. Elevated Main Terrace (ชานเรือนกลางแจ้ง)
    this.buildElevatedTerrace(compound, mats);

    // 4. Two Covered Entrance Staircases (ซุ้มบันไดหน้าคู่)
    this.buildFrontStaircases(compound, mats);

    // 5. Front Open Pavilion with Bench (ศาลาโถงชานเรือนพร้อมม้านั่งยาว)
    this.buildFrontOpenPavilion(compound, mats);

    // 6. Main Teak House with Open Awning Shutters (เรือนนอนฝาไม้สักทอง หน้าต่างบานกระทุ้ง)
    this.buildMainTeakHouse(compound, mats);

    // 7. Rear Left Pavilion / Extension (เรือนหลังซ้าย)
    this.buildRearLeftPavilion(compound, mats);

    // 8. Lush Tropical Shade Tree Behind House (ต้นไม้ใหญ่ร่มรื่นหลังเรือน)
    this.buildCompoundShadeTree(compound, mats);

    // 9. Warm Illumination
    const houseWarmLight = new THREE.PointLight(0xffaa33, 4.8, 38, 1.3);
    houseWarmLight.position.set(-28, 8, -2);
    this.scene.add(houseWarmLight);

    const houseWarmLight2 = new THREE.PointLight(0xff7711, 3.8, 28, 1.4);
    houseWarmLight2.position.set(-22, 5, 4);
    this.scene.add(houseWarmLight2);

    this.scene.add(compound);
    this.customHouse = compound;

    this.createRiverbankPromenade();
  }

  // 1. Raised Ground Plot & Concrete Retaining Curb (ฐานสนามหญ้าและคันกั้นดิน ขนานกับแนวแม่น้ำ 100%)
  buildCompoundGroundPlot(compound, mats) {
    const retainingWall = new THREE.Mesh(new THREE.BoxGeometry(24.0, 0.7, 30.0), mats.concrete);
    retainingWall.position.set(0, 0.35, 0);
    retainingWall.receiveShadow = true;
    compound.add(retainingWall);

    const lawn = new THREE.Mesh(new THREE.BoxGeometry(23.6, 0.25, 29.6), mats.grass);
    lawn.position.set(0, 0.72, 0);
    lawn.receiveShadow = true;
    compound.add(lawn);

    // Stone entrance pads
    [-7.2, 5.8].forEach((sx) => {
      const stonePad = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.6), mats.concrete);
      stonePad.position.set(sx, 0.86, 12.2);
      stonePad.receiveShadow = true;
      compound.add(stonePad);
    });
  }

  // 2. Concrete Footings & Stilt Foundation (ฐานตอม่อคอนกรีตและเสาไม้ใต้ถุน)
  buildStiltFoundation(compound, mats) {
    const stiltLocations = [
      // Left staircase
      [-8.4, 8.2], [-8.4, 10.6], [-6.0, 8.2], [-6.0, 10.6],
      // Right staircase
      [4.6, 8.2], [4.6, 10.6], [7.0, 8.2], [7.0, 10.6],
      // Front Open Pavilion
      [-8.6, 1.2], [-3.8, 1.2], [-8.6, 6.2], [-3.8, 6.2],
      // Central Terrace
      [-3.8, -2.5], [1.8, -2.5], [-3.8, 1.2], [1.8, 1.2], [1.8, 6.2],
      // Main Teak House
      [2.8, -4.5], [7.8, -4.5], [2.8, 0.5], [7.8, 0.5], [2.8, 5.5], [7.8, 5.5],
      // Rear Pavilion
      [-8.6, -7.5], [-3.8, -7.5], [-8.6, -3.0], [-3.8, -3.0]
    ];

    stiltLocations.forEach(([px, pz]) => {
      // Concrete footing plinth (ฐานเสาคอนกรีตสีเทาขาว)
      const footing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.55), mats.concrete);
      footing.position.set(px, 0.95, pz);
      footing.castShadow = true;
      footing.receiveShadow = true;
      compound.add(footing);

      // Wooden stilt column (เสาไม้เต็งสีน้ำตาลแดง)
      const stilt = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.7, 0.28), mats.wood);
      stilt.position.set(px, 2.4, pz);
      stilt.castShadow = true;
      compound.add(stilt);
    });

    // Horizontal structural floor joists
    const joistConfigs = [
      { x: -6.2, z: 3.7, w: 5.2, d: 5.2 },
      { x: 5.3, z: 0.5, w: 5.4, d: 10.4 },
      { x: -1.0, z: 1.8, w: 4.8, d: 9.2 },
      { x: -6.2, z: -5.2, w: 5.2, d: 5.0 }
    ];

    joistConfigs.forEach((jc) => {
      const beamX = new THREE.Mesh(new THREE.BoxGeometry(jc.w + 0.4, 0.25, 0.25), mats.darkWood);
      beamX.position.set(jc.x, 3.55, jc.z);
      compound.add(beamX);
    });
  }

  // 3. Elevated Main Terrace (ชานเรือนกลางแจ้งพร้อมระเบียงลูกกรงไม้โปร่ง)
  buildElevatedTerrace(compound, mats) {
    // Terrace floor deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.18, 9.4), mats.deckPlank);
    deck.position.set(-1.0, 3.65, 1.8);
    deck.castShadow = true;
    deck.receiveShadow = true;
    compound.add(deck);

    // Terrace perimeter railing (ด้านหน้าชานเรือน)
    const frontRailTop = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, 0.12), mats.wood);
    frontRailTop.position.set(-1.0, 4.45, 6.45);
    compound.add(frontRailTop);

    const frontRailBot = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.08, 0.08), mats.wood);
    frontRailBot.position.set(-1.0, 3.82, 6.45);
    compound.add(frontRailBot);

    for (let rx = -3.6; rx <= 1.6; rx += 0.38) {
      const baluster = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 0.06), mats.wood);
      baluster.position.set(rx, 4.12, 6.45);
      compound.add(baluster);
    }
  }

  // 4. Two Covered Entrance Staircases (ซุ้มบันไดคู่พร้อมหลังคาคลุม)
  buildFrontStaircases(compound, mats) {
    const stairXCoords = [-7.2, 5.8];

    stairXCoords.forEach((sx) => {
      const stairGroup = new THREE.Group();
      stairGroup.position.set(sx, 0, 0);

      const numSteps = 7;
      for (let s = 0; s < numSteps; s++) {
        const stepY = 0.9 + s * 0.39;
        const stepZ = 10.8 - s * 0.58;

        const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.18, 0.52), mats.wood);
        stepMesh.position.set(0, stepY, stepZ);
        stepMesh.castShadow = true;
        stepMesh.receiveShadow = true;
        stairGroup.add(stepMesh);

        // Stair handrail balusters on both sides
        [-1.0, 1.0].forEach((sideX) => {
          const bal = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.06), mats.wood);
          bal.position.set(sideX, stepY + 0.44, stepZ);
          stairGroup.add(bal);
        });
      }

      // Diagonal handrails
      [-1.0, 1.0].forEach((sideX) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 4.5), mats.wood);
        rail.position.set(sideX, 2.65, 9.1);
        rail.rotation.x = 0.58;
        stairGroup.add(rail);
      });

      // 4 tall staircase posts supporting canopy roof
      const postCoords = [[-1.2, 8.2], [1.2, 8.2], [-1.2, 10.6], [1.2, 10.6]];
      postCoords.forEach(([px, pz]) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 4.4, 0.24), mats.wood);
        post.position.set(px, 3.2, pz);
        post.castShadow = true;
        stairGroup.add(post);

        // Carved eave bracket (คันทวย)
        const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.35), mats.wood);
        bracket.position.set(px, 5.15, pz + 0.15);
        bracket.rotation.x = -0.4;
        stairGroup.add(bracket);
      });

      // Staircase canopy roof (หลังคาซุ้มบันได)
      const canopyRoof = this.buildThaiGableRoof(3.2, 3.8, 1.25, mats, true, 0.85);
      canopyRoof.position.set(0, 5.5, 9.4);
      stairGroup.add(canopyRoof);

      compound.add(stairGroup);
    });
  }

  // 5. Front Open Pavilion with Bench (ศาลาโถงชานเรือนพร้อมม้านั่งยาว)
  buildFrontOpenPavilion(compound, mats) {
    const pavGroup = new THREE.Group();
    pavGroup.position.set(-6.2, 0, 3.7);

    // Deck floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.18, 5.6), mats.deckPlank);
    floor.position.set(0, 3.65, 0);
    floor.receiveShadow = true;
    pavGroup.add(floor);

    // 4 tall polished wooden columns extending to roof
    const cols = [[-2.4, -2.5], [2.4, -2.5], [-2.4, 2.5], [2.4, 2.5]];
    cols.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.5, 0.3), mats.wood);
      col.position.set(cx, 5.4, cz);
      col.castShadow = true;
      pavGroup.add(col);
    });

    // Roof beam ring
    const beamF = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.25, 0.25), mats.darkWood);
    beamF.position.set(0, 7.05, 2.5);
    pavGroup.add(beamF);

    const beamB = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.25, 0.25), mats.darkWood);
    beamB.position.set(0, 7.05, -2.5);
    pavGroup.add(beamB);

    // Built-in wooden bench with slanted backrest (ม้านั่งไม้พนักพิงยาว ตามรูป 2)
    const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 0.58), mats.wood);
    benchSeat.position.set(0, 4.18, 2.2);
    pavGroup.add(benchSeat);

    const benchBack = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.52, 0.08), mats.wood);
    benchBack.position.set(0, 4.58, 2.48);
    benchBack.rotation.x = -0.28;
    pavGroup.add(benchBack);

    // Bench support brackets
    [-1.6, -0.5, 0.5, 1.6].forEach((bx) => {
      const bLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.45), mats.darkWood);
      bLeg.position.set(bx, 3.92, 2.2);
      pavGroup.add(bLeg);

      const bBrace = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.08), mats.darkWood);
      bBrace.position.set(bx, 4.4, 2.44);
      bBrace.rotation.x = -0.28;
      pavGroup.add(bBrace);
    });

    // Pavilion roof: Manila / Hip-Gable Roof with silver corrugated roofing & white fascia
    const pavRoof = this.buildThaiGableRoof(5.4, 5.8, 2.2, mats, true, 1.15);
    pavRoof.position.set(0, 7.1, 0);
    pavGroup.add(pavRoof);

    // Hanging warm lantern inside pavilion
    const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.55, 8), mats.lanternGlow);
    lantern.position.set(0, 6.4, 0);
    pavGroup.add(lantern);

    compound.add(pavGroup);
  }

  // 6. Main Enclosed Teak House (เรือนนอนฝาไม้สักทอง พร้อมหน้าต่างบานกระทุ้งมีไม้ค้ำ)
  buildMainTeakHouse(compound, mats) {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(5.3, 0, 0.5);

    // Floor deck
    const floor = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.18, 8.8), mats.deckPlank);
    floor.position.set(0, 3.65, 0);
    floor.receiveShadow = true;
    houseGroup.add(floor);

    // Main walls with horizontal teak siding (ฝาไม้สักทองแนวนอน)
    const walls = new THREE.Mesh(new THREE.BoxGeometry(5.4, 3.4, 8.4), mats.teakSiding);
    walls.position.set(0, 5.35, 0);
    walls.castShadow = true;
    walls.receiveShadow = true;
    houseGroup.add(walls);

    // Dark wood corner pilasters & frieze
    [[-2.72, -4.22], [2.72, -4.22], [-2.72, 4.22], [2.72, 4.22]].forEach(([cx, cz]) => {
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.5, 0.25), mats.darkWood);
      pilaster.position.set(cx, 5.35, cz);
      houseGroup.add(pilaster);
    });

    // Traditional Thai Awning Windows with Propped Shutters (หน้าต่างบานกระทุ้ง ตามรูป 2)
    const windowConfigs = [
      // Front wall windows
      { x: -1.3, y: 5.3, z: 4.22, rotY: 0 },
      { x: 1.3, y: 5.3, z: 4.22, rotY: 0 },
      // Side wall windows
      { x: 2.72, y: 5.3, z: 1.5, rotY: Math.PI / 2 },
      { x: 2.72, y: 5.3, z: -1.8, rotY: Math.PI / 2 }
    ];

    windowConfigs.forEach((wc) => {
      const winGroup = new THREE.Group();
      winGroup.position.set(wc.x, wc.y, wc.z);
      winGroup.rotation.y = wc.rotY;

      // Dark opening inside
      const opening = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.35), mats.windowInterior);
      opening.position.set(0, 0, 0.02);
      winGroup.add(opening);

      // Wood frame around window
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.22, 1.55, 0.1), mats.darkWood);
      frame.position.set(0, 0, 0.04);
      winGroup.add(frame);

      // Propped open shutter panel (บานกระทุ้งเปิดอ้าออก)
      const shutter = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.32, 0.05), mats.wood);
      shutter.position.set(0, 0.58, 0.42);
      shutter.rotation.x = -0.55; // 31-degree open angle
      winGroup.add(shutter);

      // Wooden stay stick / prop (ไม้ค้ำบานกระทุ้ง)
      const stayStick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 6), mats.darkWood);
      stayStick.position.set(0, 0.15, 0.42);
      stayStick.rotation.x = 0.52;
      winGroup.add(stayStick);

      houseGroup.add(winGroup);
    });

    // Double-Tiered Gabled Roof (หลังคาจั่วซ้อน 2 ชั้น ตามรูป 2)
    const lowerEave = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.22, 10.2), mats.silverRoof);
    lowerEave.position.set(0, 7.15, 0);
    lowerEave.castShadow = true;
    houseGroup.add(lowerEave);

    const lowerFascia = new THREE.Mesh(new THREE.BoxGeometry(7.3, 0.24, 10.3), mats.whiteFascia);
    lowerFascia.position.set(0, 7.1, 0);
    houseGroup.add(lowerFascia);

    const mainRoof = this.buildThaiGableRoof(5.6, 8.8, 2.45, mats, false, 1.25);
    mainRoof.position.set(0, 7.25, 0);
    houseGroup.add(mainRoof);

    compound.add(houseGroup);
  }

  // 7. Rear Left Pavilion / Extension (เรือนหลังซ้าย)
  buildRearLeftPavilion(compound, mats) {
    const rearGroup = new THREE.Group();
    rearGroup.position.set(-6.2, 0, -5.2);

    // Floor deck
    const floor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.18, 5.2), mats.deckPlank);
    floor.position.set(0, 3.65, 0);
    floor.receiveShadow = true;
    rearGroup.add(floor);

    // Wooden columns
    const cols = [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]];
    cols.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.3, 0.28), mats.wood);
      col.position.set(cx, 5.3, cz);
      col.castShadow = true;
      rearGroup.add(col);
    });

    // Roof
    const roof = this.buildThaiGableRoof(5.2, 5.2, 2.1, mats, true, 1.05);
    roof.position.set(0, 6.9, 0);
    rearGroup.add(roof);

    // Walkway bridge connecting rear pavilion to central terrace
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 3.2), mats.deckPlank);
    bridge.position.set(2.4, 3.65, 2.2);
    rearGroup.add(bridge);

    compound.add(rearGroup);
  }

  // 8. Lush Tropical Shade Tree Behind House (ต้นไม้ใหญ่ร่มรื่นหลังเรือน ตามรูป 2 และ 3)
  buildCompoundShadeTree(compound, mats) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(0.5, 0.7, -13.5);

    // Thick organic gnarled trunk
    const baseTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.7, 5.5, 10), mats.bark);
    baseTrunk.position.set(0, 2.75, 0);
    baseTrunk.castShadow = true;
    treeGroup.add(baseTrunk);

    // Spreading organic boughs
    const boughs = [
      { rx: 0.35, rz: 0.45, len: 6.5, py: 5.2 },
      { rx: -0.4, rz: -0.35, len: 6.2, py: 5.5 },
      { rx: 0.2, rz: -0.55, len: 7.0, py: 5.0 },
      { rx: -0.25, rz: 0.5, len: 6.8, py: 5.3 }
    ];

    boughs.forEach((bg) => {
      const bMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.72, bg.len, 8), mats.bark);
      bMesh.position.set(Math.sin(bg.rz) * 2.2, bg.py, Math.sin(bg.rx) * 2.2);
      bMesh.rotation.x = bg.rx;
      bMesh.rotation.z = bg.rz;
      bMesh.castShadow = true;
      treeGroup.add(bMesh);
    });

    // Voluminous, dense leafy canopy towering above the rooflines
    const foliageCrown = new THREE.Group();
    foliageCrown.position.set(0, 8.5, 0);

    const clusterCoords = [
      { x: 0, y: 3.5, z: 0, r: 4.8 },
      { x: -3.2, y: 1.5, z: -1.2, r: 4.0 },
      { x: 3.2, y: 1.8, z: -0.8, r: 4.2 },
      { x: -1.5, y: 2.2, z: 2.6, r: 3.8 },
      { x: 1.8, y: 2.0, z: 2.5, r: 3.9 },
      { x: -2.0, y: 3.8, z: -2.0, r: 3.6 },
      { x: 2.2, y: 4.0, z: -1.8, r: 3.7 },
      { x: 0, y: 5.5, z: -0.5, r: 3.4 }
    ];

    clusterCoords.forEach((cl, idx) => {
      // Core volumetric mass
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(cl.r, 10, 8),
        idx % 2 === 0 ? mats.leafSolidMat : mats.leafDarkSolidMat
      );
      core.scale.set(1.2, 0.85, 1.15);
      core.position.set(cl.x, cl.y, cl.z);
      core.castShadow = true;
      foliageCrown.add(core);

      // Textured leaf layer with alpha cutout for feathered silhouette
      const leafLayer = new THREE.Mesh(
        new THREE.SphereGeometry(cl.r * 1.08, 8, 7),
        mats.leafMat
      );
      leafLayer.scale.set(1.22, 0.88, 1.18);
      leafLayer.position.set(cl.x, cl.y, cl.z);
      leafLayer.castShadow = true;
      foliageCrown.add(leafLayer);
    });

    treeGroup.add(foliageCrown);
    compound.add(treeGroup);

    // Register for gentle wind sway
    this.swayingTrees.push({ group: foliageCrown, speed: 1.0, phase: 0.3 });
  }

  // Reusable Thai Gable / Hip-Gable Roof Builder (หลังคาทรงจั่วมนิลา/ปั้นหยา)
  buildThaiGableRoof(w, d, h, mats, hasHipSkirt = false, finialScale = 1.0) {
    const roofGroup = new THREE.Group();
    const halfW = w / 2;
    const slopeLen = Math.sqrt(halfW * halfW + h * h) + 0.35;
    const slopeAng = Math.atan2(h, halfW);

    // Left slope
    const leftSlope = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.08, d + 0.6), mats.silverRoof);
    leftSlope.position.set(-halfW / 2, h / 2, 0);
    leftSlope.rotation.z = -slopeAng;
    leftSlope.castShadow = true;
    leftSlope.receiveShadow = true;
    roofGroup.add(leftSlope);

    // Right slope
    const rightSlope = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.08, d + 0.6), mats.silverRoof);
    rightSlope.position.set(halfW / 2, h / 2, 0);
    rightSlope.rotation.z = slopeAng;
    rightSlope.castShadow = true;
    rightSlope.receiveShadow = true;
    roofGroup.add(rightSlope);

    // White ridge cap along apex
    const ridgeCap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, d + 0.68), mats.whiteFascia);
    ridgeCap.position.set(0, h + 0.06, 0);
    roofGroup.add(ridgeCap);

    // White bargeboards (ปั้นลม) & Gable Pediment front & back
    [-1, 1].forEach((dir) => {
      const zPos = dir * (d / 2 + 0.31);
      const bLeft = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.22, 0.06), mats.whiteFascia);
      bLeft.position.set(-halfW / 2, h / 2, zPos);
      bLeft.rotation.z = -slopeAng;
      roofGroup.add(bLeft);

      const bRight = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.22, 0.06), mats.whiteFascia);
      bRight.position.set(halfW / 2, h / 2, zPos);
      bRight.rotation.z = slopeAng;
      roofGroup.add(bRight);

      // Triangular timber gable pediment (หน้าบันไม้ระแนง)
      const pShape = new THREE.Shape();
      pShape.moveTo(-halfW + 0.1, 0);
      pShape.lineTo(halfW - 0.1, 0);
      pShape.lineTo(0, h - 0.08);
      pShape.closePath();
      const pGeo = new THREE.ShapeGeometry(pShape);
      const pediment = new THREE.Mesh(pGeo, mats.wood);
      pediment.position.set(0, 0, zPos - dir * 0.05);
      if (dir === -1) pediment.rotation.y = Math.PI;
      roofGroup.add(pediment);

      // Galae finial at apex (ยอดกาแลไม้ฉลุ)
      const galaeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85 * finialScale, 0.05), mats.wood);
      galaeL.position.set(-0.15, h + 0.35 * finialScale, zPos);
      galaeL.rotation.z = 0.45;
      roofGroup.add(galaeL);

      const galaeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85 * finialScale, 0.05), mats.wood);
      galaeR.position.set(0.15, h + 0.35 * finialScale, zPos);
      galaeR.rotation.z = -0.45;
      roofGroup.add(galaeR);
    });

    // White fascia boards along lower eaves (เชิงชายสีขาว)
    const eaveFasciaL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, d + 0.6), mats.whiteFascia);
    eaveFasciaL.position.set(-halfW - 0.16, 0.02, 0);
    roofGroup.add(eaveFasciaL);

    const eaveFasciaR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, d + 0.6), mats.whiteFascia);
    eaveFasciaR.position.set(halfW + 0.16, 0.02, 0);
    roofGroup.add(eaveFasciaR);

    // Optional lower hip skirt (ชายคาปั้นหยาชั้นล่าง)
    if (hasHipSkirt) {
      const skirtW = w + 1.6;
      const skirtD = d + 1.6;
      const skirtH = 0.75;
      const skirtMesh = new THREE.Mesh(new THREE.ConeGeometry((skirtW + skirtD) / 3.4, skirtH, 4), mats.silverRoof);
      skirtMesh.scale.set(skirtW / ((skirtW + skirtD) / 2), 1, skirtD / ((skirtW + skirtD) / 2));
      skirtMesh.rotateY(Math.PI / 4);
      skirtMesh.position.set(0, -skirtH / 2, 0);
      skirtMesh.castShadow = true;
      roofGroup.add(skirtMesh);

      const fasciaRim = new THREE.Mesh(new THREE.BoxGeometry(skirtW + 0.2, 0.22, skirtD + 0.2), mats.whiteFascia);
      fasciaRim.position.set(0, -skirtH + 0.05, 0);
      roofGroup.add(fasciaRim);
    }

    return roofGroup;
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

    // --- ท่าน้ำ สีเขียว ขยายใหญ่พิเศษ (Grand Rectangular Green Waterfront Pier) ---
    // ขยายพื้นที่ท่าน้ำสีเขียวให้กว้างขวางเป็นพิเศษ เพื่อรองรับผู้สมัครโหวตทุกคนอย่างสง่างาม
    const greenPierGroup = new THREE.Group();
    greenPierGroup.position.set(-15.5, 0, 5.0);

    const pierWidthX = 9.0;   // X: -20 ถึง -11 (ยื่นลงสู่แม่น้ำ 9 หน่วย กว้างขวาง)
    const pierLengthZ = 38.0; // Z: -14.0 ถึง 24.0 (ยาวขนานแม่น้ำ 38 หน่วย)

    // ฐานคอนกรีตคันกั้นดินรอบท่าน้ำสีเขียว
    const pierConcreteMat = new THREE.MeshStandardMaterial({ color: 0xd6dbe0, roughness: 0.82 });
    const pierBase = new THREE.Mesh(new THREE.BoxGeometry(pierWidthX, 0.65, pierLengthZ), pierConcreteMat);
    pierBase.position.set(0, 0.45, 0);
    pierBase.receiveShadow = true;
    greenPierGroup.add(pierBase);

    // ลานหญ้าสีเขียวสี่เหลี่ยมผืนผ้าบนท่าน้ำ (ท่าน้ำ สีเขียว ลานหญ้ากว้างขวาง)
    const pierGrassMat = new THREE.MeshStandardMaterial({ color: 0x3d6624, roughness: 0.9 });
    const pierLawn = new THREE.Mesh(new THREE.BoxGeometry(pierWidthX - 0.4, 0.22, pierLengthZ - 0.4), pierGrassMat);
    pierLawn.position.set(0, 0.78, 0);
    pierLawn.receiveShadow = true;
    greenPierGroup.add(pierLawn);

    // วัสดุไม้สักสำหรับบันไดท่าน้ำและเสาโคมไฟริมน้ำ (นำเสาตอม่อที่โผล่ขึ้นมาบนลานสนามหญ้าออกอย่างหมดจด)
    const pierWoodMat = new THREE.MeshStandardMaterial({ color: 0x481e0a, roughness: 0.72 });

    // บันไดท่าน้ำไม้สักทอดลงสู่แม่น้ำสำหรับลอยกระทง 3 ช่วง (Z = -10, Z = 0, Z = 10)
    [-10, 0, 10].forEach((stepZ) => {
      for (let i = 0; i < 4; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 5.4), pierWoodMat);
        step.position.set(pierWidthX / 2 + 0.35 + i * 0.6, 0.55 - i * 0.22, stepZ);
        step.receiveShadow = true;
        greenPierGroup.add(step);
      }
    });

    // เสาหลักผูกเรือพร้อมโคมไฟประดับตามแนวริมท่าน้ำสีเขียว
    const pierLanternMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
    [-16.0, -8.0, 0, 8.0, 16.0].forEach((pz) => {
      const px = pierWidthX / 2 - 0.4;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.2, 8), pierWoodMat);
      post.position.set(px, 1.35, pz);
      greenPierGroup.add(post);

      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.4, 8), pierLanternMat);
      lamp.position.set(px, 2.05, pz);
      greenPierGroup.add(lamp);

      const lampLight = new THREE.PointLight(0xffaa33, 2.4, 12, 1.4);
      lampLight.position.set(px, 2.2, pz);
      greenPierGroup.add(lampLight);
      this.flickerLights.push({ light: lampLight, baseIntensity: 2.4, speed: 4.0 });
    });

    this.scene.add(greenPierGroup);
  }

  /* ==========================================================
     REALISTIC TREES & PHOTOREALISTIC COCONUT PALMS (80%+)
     แก้ปัญหารูป 4 (ต้นมะพร้าวเป็นก้านร่ม) ให้กลายเป็นต้นมะพร้าวธรรมชาติ
     ก้านทางมะพร้าวโค้งแอ่นทิ้งตัวสวยงาม มีใบขนนก ใบย่อยสองข้าง
     มีคอมะพร้าว กาบมะพร้าว ทะลายลูกมะพร้าว และลำต้นโค้งปล้องเสมือนจริง
  ========================================================== */
  createRealisticTrees() {
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f5c22, roughness: 0.65 });
    const darkLeafMat = new THREE.MeshStandardMaterial({ color: 0x144018, roughness: 0.7 });
    const trunkMat = new THREE.MeshStandardMaterial({ map: this.barkTexture, roughness: 0.85 });

    // --- A. Ancient Rain Tree / Banyan Tree (ต้นจามจุรีโบราณริมน้ำต้นเดิม ย้ายไปเป็นฉากหลังต้นน้ำ) ---
    const banyan = new THREE.Group();
    banyan.position.set(-30, 1.5, -42);

    const baseTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.6, 6.0, 12), trunkMat);
    baseTrunk.position.y = 3.0;
    baseTrunk.castShadow = true;
    banyan.add(baseTrunk);

    for (let r = 0; r < 5; r++) {
      const angle = (r / 5) * Math.PI * 2;
      const root = new THREE.Mesh(new THREE.ConeGeometry(0.8, 3.5, 6), trunkMat);
      root.position.set(Math.cos(angle) * 1.8, 1.2, Math.sin(angle) * 1.8);
      root.rotation.z = Math.cos(angle) * 0.7;
      root.rotation.x = Math.sin(angle) * 0.7;
      banyan.add(root);
    }

    const boughConfigs = [
      { rx: 0.45, rz: 0.35, len: 7.5, py: 5.5 },
      { rx: -0.35, rz: -0.45, len: 7.0, py: 5.8 },
      { rx: 0.2, rz: -0.6, len: 8.5, py: 5.2 },
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

    const treeUplight = new THREE.PointLight(0x22c55e, 4.0, 30, 1.3);
    treeUplight.position.set(0, 1.5, 0);
    banyan.add(treeUplight);

    const treeGoldLight = new THREE.PointLight(0xf59e0b, 3.5, 25, 1.4);
    treeGoldLight.position.set(2, 2.0, -2);
    banyan.add(treeGoldLight);

    this.scene.add(banyan);
    this.swayingTrees.push({ group: foliageCanopy, speed: 1.1, phase: 0.5 });

    // --- B. PHOTOREALISTIC COCONUT PALM TREES (ต้นมะพร้าวริมน้ำเสมือนจริง 90%+ ตามรูป 2 และ 3) ---
    // ตำแหน่งริมฝั่งตลิ่ง โดยไม่ขวางทางเดินและไม่เกะกะสายตา
    const coconutTrunkMat = new THREE.MeshStandardMaterial({
      map: this.coconutBarkTexture,
      roughness: 0.82,
    });

    const palmConfigs = [
      { x: -24, z: 28, rotY: 0.3, leanAngle: 0.18, heightScale: 1.1 },
      { x: -26, z: -38, rotY: -0.5, leanAngle: 0.22, heightScale: 1.05 },
      { x: -25, z: 42, rotY: 0.8, leanAngle: 0.16, heightScale: 1.0 },
    ];

    palmConfigs.forEach((pCfg) => {
      const palm = this.buildPhotorealisticPalmTree(pCfg, coconutTrunkMat);
      this.scene.add(palm.rootGroup);
      this.swayingPalms.push({ group: palm.crownGroup, speed: 1.2, phase: Math.random() * Math.PI });
    });
  }

  // สร้างต้นมะพร้าวเสมือนจริง 90%+ ตามรูป 2 และ 3:
  // โคนต้นบานผาย (Flared Root Bole) + ลำต้นปล้องลายขวางชัดเจน + คอมะพร้าวเขียว + พุ่มทางมะพร้าว 4 ชั้น 32 ทางพร้อมยอดแหลมชี้ฟ้า + ใบย่อยทรงจั่ว 3D
  buildPhotorealisticPalmTree(pCfg, trunkMat) {
    const rootGroup = new THREE.Group();
    rootGroup.position.set(pCfg.x, 1.5, pCfg.z);

    // 1. Flared Root Bole (โคนต้นมะพร้าวป่องผายออกที่ฐานดินตามรูป 2 และ 3)
    const baseBole = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.92, 1.3, 16), trunkMat);
    baseBole.position.y = 0.65;
    baseBole.castShadow = true;
    rootGroup.add(baseBole);

    const baseCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.88, 1.05, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0x33251a, roughness: 0.95 })
    );
    baseCollar.position.y = 0.18;
    baseCollar.castShadow = true;
    rootGroup.add(baseCollar);

    // 2. Segmented Sweeping Curved Trunk with High-Contrast Rings (ลำต้นมะพร้าวทรงเรียวสูง โค้งเอียงตามธรรมชาติ)
    let curY = 1.2;
    let curX = 0;
    const trunkSegments = 16;
    const segH = 0.88 * pCfg.heightScale;

    for (let s = 0; s < trunkSegments; s++) {
      // Tapering: 0.44 at base to 0.26 near crownshaft
      const t = s / trunkSegments;
      const tNext = (s + 1) / trunkSegments;
      const rBottom = 0.44 - t * 0.18;
      const rTop = 0.44 - tNext * 0.18;

      const seg = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, segH, 14), trunkMat);
      seg.position.set(curX, curY + segH / 2, 0);
      seg.rotation.z = -pCfg.leanAngle * t;
      seg.castShadow = true;
      rootGroup.add(seg);

      // Deep dark ring scars at segment boundaries (รอยปล้องมะพร้าวร่องลึก)
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(rTop + 0.015, 0.02, 4, 14),
        new THREE.MeshStandardMaterial({ color: 0x18120d, roughness: 0.92 })
      );
      ring.position.set(curX, curY + segH, 0);
      ring.rotateX(Math.PI / 2);
      rootGroup.add(ring);

      curX += Math.sin(pCfg.leanAngle) * (segH * 0.4);
      curY += Math.cos(pCfg.leanAngle) * (segH * 0.98);
    }

    // 3. Green Crownshaft & Brown Coir Sheath (คอมะพร้าวสีเขียวและกาบมะพร้าวสีน้ำตาลตามรูป 2 และ 3)
    const crownShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.27, 1.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.55 })
    );
    crownShaft.position.set(curX, curY + 0.75, 0);
    crownShaft.rotation.z = -pCfg.leanAngle;
    rootGroup.add(crownShaft);

    // Brown fibrous coir collar beneath crownshaft (รกกาบมะพร้าวสีน้ำตาลเข้ม)
    const coir = new THREE.Mesh(
      new THREE.CylinderGeometry(0.31, 0.27, 0.65, 10),
      new THREE.MeshStandardMaterial({ color: 0x4a2a11, roughness: 0.95 })
    );
    coir.position.set(curX, curY + 1.15, 0);
    coir.rotation.z = -pCfg.leanAngle;
    rootGroup.add(coir);

    // 4. Crown of Fronds (พุ่มทางมะพร้าวเสมือนจริง 90%+ 4 ชั้น 32 ทาง + ทางแห้ง 4 ทาง)
    const crownGroup = new THREE.Group();
    crownGroup.position.set(curX, curY + 1.55, 0);

    // Coconut Fruit Clusters (ทะลายลูกมะพร้าว 9 ผล ทรงรี)
    const nutMatGreen = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.5 });
    const nutMatBrown = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.6 });
    for (let n = 0; n < 9; n++) {
      const nAng = (n / 9) * Math.PI * 2;
      const nut = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        n % 3 === 0 ? nutMatBrown : nutMatGreen
      );
      nut.scale.set(1.0, 1.35, 1.0);
      nut.position.set(Math.cos(nAng) * 0.58, -0.32 + (n % 2) * 0.2, Math.sin(nAng) * 0.58);
      crownGroup.add(nut);
    }

    // Frond materials: vibrant healthy green with alpha cutout
    const frondMat = new THREE.MeshStandardMaterial({
      map: this.palmFrondTexture,
      transparent: true,
      alphaTest: 0.22,
      side: THREE.DoubleSide,
      roughness: 0.45,
    });

    // Young spear frond material (ยอดพุ่งสีเขียวสดใสกว่าเล็กน้อย)
    const youngFrondMat = new THREE.MeshStandardMaterial({
      map: this.palmFrondTexture,
      color: 0x4ade80,
      transparent: true,
      alphaTest: 0.22,
      side: THREE.DoubleSide,
      roughness: 0.4,
    });

    // 4-Tier Frond Canopy Architecture (ตรงตามรูป 2 และ 3: ยอดพุ่งชี้ฟ้าเป็นกรวยแหลม + ทางโค้งแอ่น + ทางแผ่กว้าง + ทางห้อย)
    const frondTiers = [
      // Tier 1: Center Pointed Spear Fronds (ยอดพุ่งชี้ตรงชันขึ้นฟ้า 8 ทาง ทำให้ได้ทรงยอดแหลมตามรูปเป๊ะ)
      { count: 8, pitch: 1.18, length: 5.6, width: 1.3, droop: 0.42, yOffset: 0.5, mat: youngFrondMat, yawOffset: 0.0 },
      // Tier 2: Upper Arching Fronds (ทางชั้นบนโค้งแอ่นออก 8 ทาง)
      { count: 8, pitch: 0.76, length: 6.8, width: 1.55, droop: 1.2, yOffset: 0.22, mat: frondMat, yawOffset: Math.PI / 8 },
      // Tier 3: Horizontal Spreading Prime Fronds (ทางชั้นกลางแผ่กว้างทิ้งตัว 8 ทาง)
      { count: 8, pitch: 0.38, length: 7.5, width: 1.7, droop: 2.1, yOffset: -0.08, mat: frondMat, yawOffset: Math.PI / 16 },
      // Tier 4: Mature Lower Drooping Skirt Fronds (ทางชั้นล่างห้อยลงล้อมรอบคอยอด 8 ทาง)
      { count: 8, pitch: 0.06, length: 7.2, width: 1.6, droop: 3.5, yOffset: -0.38, mat: frondMat, yawOffset: Math.PI / 12 },
    ];

    frondTiers.forEach((tier) => {
      for (let i = 0; i < tier.count; i++) {
        const yaw = (i / tier.count) * Math.PI * 2 + tier.yawOffset + (Math.random() - 0.5) * 0.12;
        const frondMesh = this.buildCurvedFrondMesh(tier, tier.mat);

        frondMesh.position.y = tier.yOffset;
        frondMesh.rotation.y = yaw;
        frondMesh.rotation.z = tier.pitch; // ยกมุมขึ้นตามแต่ละชั้น สร้างทรงพุ่ม 3 มิติสมจริง
        crownGroup.add(frondMesh);
      }
    });

    // 4 Dried Brown Fronds Hanging Downwards Along Trunk (ทางมะพร้าวแก่แห้งสีน้ำตาล 4 ทาง)
    const dryFrondMat = new THREE.MeshStandardMaterial({
      map: this.palmFrondTexture,
      color: 0x854d0e,
      transparent: true,
      alphaTest: 0.22,
      side: THREE.DoubleSide,
      roughness: 0.85,
    });

    for (let d = 0; d < 4; d++) {
      const dYaw = (d / 4) * Math.PI * 2 + 0.35;
      const dryMesh = this.buildCurvedFrondMesh(
        { length: 5.2, width: 1.35, droop: 3.2 },
        dryFrondMat
      );
      dryMesh.position.y = -0.58;
      dryMesh.rotation.y = dYaw;
      dryMesh.rotation.z = -0.22; // ชี้ลงแนบลำต้น
      crownGroup.add(dryMesh);
    }

    rootGroup.add(crownGroup);
    return { rootGroup, crownGroup };
  }

  // สร้างทางมะพร้าวที่มีความโค้งแอ่นตามธรรมชาติ (Gracefully Arched Frond Spine)
  // พร้อมโครงสร้างใบย่อย 3D รูปทรงจั่ว (Inverted-V Tectiform Profile) สมจริงทุกองศา ไม่แบนเป็นกระดาษ
  buildCurvedFrondMesh(cfg, material) {
    const frondGroup = new THREE.Group();
    const segs = 10;
    const len = cfg.length;
    const ribMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.55 });

    const positions = [];
    const uvs = [];
    const indices = [];

    let lastX = 0;
    let lastY = 0;

    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      // Parabolic arch formula: พุ่งขึ้นก่อนแล้วโค้งแอ่นทิ้งตัวลงอย่างสง่างาม
      const curX = t * len;
      const curY = Math.sin(t * Math.PI * 0.7) * 1.5 - Math.pow(t, 2.2) * cfg.droop;
      // ความกว้างของใบย่อย ป่องตรงกลางแล้วเรียวแหลมสู่ปลายใบ
      const w = cfg.width * Math.pow(Math.sin(t * Math.PI * 0.95), 0.75);

      // Spine center vertex
      positions.push(curX, curY, 0);
      uvs.push(0.5, 1.0 - t);

      // Left leaflet vertex (เอียงลาดลงซ้ายเหมือนหลังคาจั่วทรง ^)
      positions.push(curX, curY - w * 0.26, -w * 0.5);
      uvs.push(0.0, 1.0 - t);

      // Right leaflet vertex (เอียงลาดลงขวาเหมือนหลังคาจั่วทรง ^)
      positions.push(curX, curY - w * 0.26, w * 0.5);
      uvs.push(1.0, 1.0 - t);

      // Central woody rachis cylinder (กระดูกทางมะพร้าวสีเขียวตองอ่อน)
      if (s > 0) {
        const dx = curX - lastX;
        const dy = curY - lastY;
        const segLen = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const rTop = 0.035 * (1 - t * 0.72);
        const rBot = 0.05 * (1 - (t - 1 / segs) * 0.72);
        const rib = new THREE.Mesh(
          new THREE.CylinderGeometry(rTop, rBot, segLen, 6),
          ribMat
        );
        rib.position.set((lastX + curX) / 2, (lastY + curY) / 2, 0);
        rib.rotation.z = angle - Math.PI / 2;
        frondGroup.add(rib);
      }

      lastX = curX;
      lastY = curY;
    }

    for (let s = 0; s < segs; s++) {
      const c0 = s * 3;
      const l0 = s * 3 + 1;
      const r0 = s * 3 + 2;
      const c1 = (s + 1) * 3;
      const l1 = (s + 1) * 3 + 1;
      const r1 = (s + 1) * 3 + 2;

      // Left wing quad: (l0, c0, l1) and (c0, c1, l1)
      indices.push(l0, c0, l1);
      indices.push(c0, c1, l1);

      // Right wing quad: (c0, r0, c1) and (r0, r1, c1)
      indices.push(c0, r0, c1);
      indices.push(r0, r1, c1);
    }

    const leafGeo = new THREE.BufferGeometry();
    leafGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    leafGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    leafGeo.setIndex(indices);
    leafGeo.computeVertexNormals();

    const leafMesh = new THREE.Mesh(leafGeo, material);
    frondGroup.add(leafMesh);

    return frondGroup;
  }

  /* ==========================================================
     WATER LILIES / LOTUS PADS (กอบัวหลวงริมตลิ่ง)
     วางตำแหน่งชิดตลิ่งอย่างเป็นธรรมชาติ (X <= -13)
     ไม่ขวางเส้นทางลอยของกระทง (Fairway X: -6 ถึง +16)
  ========================================================== */
  createWaterLilies() {
    this.lotusBlossoms = [];
    this.lotusObstacles = [];

    const padMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const lotusPetalMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.35,
    });
    const pollenMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // วางกอบัวชิดริมตลิ่งฝั่งซ้าย (X: -16 ถึง -13.5) ห่างจากร่องน้ำลอยกระทง
    const clusterCenters = [
      { x: -15.5, z: -20, r: 3.2 },
      { x: -14.8, z: -6, r: 3.0 },
      { x: -14.2, z: 18, r: 3.2 },
      { x: -15.0, z: 32, r: 3.4 },
    ];

    clusterCenters.forEach((cl) => {
      this.lotusObstacles.push(cl);

      for (let i = 0; i < 6; i++) {
        const padGroup = new THREE.Group();
        const px = cl.x + (Math.random() - 0.5) * 3.5;
        const pz = cl.z + (Math.random() - 0.5) * 4.5;
        padGroup.position.set(px, 0.08, pz);

        const padGeo = new THREE.CircleGeometry(0.85 + Math.random() * 0.35, 18, 0, Math.PI * 1.85);
        padGeo.rotateX(-Math.PI / 2);
        const pad = new THREE.Mesh(padGeo, padMat);
        padGroup.add(pad);

        if (i % 2 === 0) {
          const lotus = new THREE.Group();
          lotus.position.y = 0.18;

          for (let p = 0; p < 8; p++) {
            const pAng = (p / 8) * Math.PI * 2;
            const petal = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 4), lotusPetalMat);
            petal.position.set(Math.cos(pAng) * 0.28, 0.15, Math.sin(pAng) * 0.28);
            petal.rotation.z = Math.cos(pAng) * 0.5;
            petal.rotation.x = Math.sin(pAng) * 0.5;
            lotus.add(petal);
          }
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
     BAMBOO FIRE TORCHES
  ========================================================== */
  createBambooTorches() {
    const torchCount = 12;
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xd4a359, roughness: 0.6 });
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });

    for (let i = 0; i < torchCount; i++) {
      const zPos = -45 + i * 14;
      const torch = new THREE.Group();
      torch.position.set(-18.2, 1.0, zPos);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.8, 8), bambooMat);
      pole.position.y = 2.4;
      pole.castShadow = true;
      torch.add(pole);

      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.18, 0.75, 8), coneMat);
      basket.position.y = 4.8;
      torch.add(basket);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.9, 8),
        new THREE.MeshBasicMaterial({ color: 0xff6600 })
      );
      flame.position.y = 5.4;
      torch.add(flame);

      const core = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.65, 8),
        new THREE.MeshBasicMaterial({ color: 0xffea33 })
      );
      core.position.y = 5.3;
      torch.add(core);

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
     FLOATING SKY LANTERNS
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
     KRATHONG SAI / RIVER CANDLES (ถ้วยตะไลลอยกระจายเต็มท้องน้ำ)
     กระจายเต็มท้องน้ำทั้งฝั่งซ้าย กลาง และฝั่งขวา (X: -11.5 ถึง +56.0)
     เคลื่อนที่หลายทิศทาง มีชีวิตชีวา และหมุนเวียนเติมใหม่อย่างต่อเนื่อง
  ========================================================== */
  createKrathongSai() {
    this.riverCandles = [];
    const count = 135;
    const bowlGeo = new THREE.CylinderGeometry(0.42, 0.22, 0.20, 10);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0xc49a45, roughness: 0.5 });
    const flameGeo = new THREE.ConeGeometry(0.14, 0.42, 6);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff9900 });

    for (let i = 0; i < count; i++) {
      const candleGroup = new THREE.Group();

      const bowl = new THREE.Mesh(bowlGeo, bowlMat);
      bowl.position.y = 0.1;
      candleGroup.add(bowl);

      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 0.36;
      candleGroup.add(flame);

      // กระจายเต็มท้องน้ำทั้งฝั่งซ้าย กลาง และฝั่งขวา (X: -11.5 ถึง +56.0)
      // ครอบคลุมความยาวลำน้ำ Z: -45 ถึง +65
      const posX = -11.5 + Math.random() * 67.5;
      const posZ = -45 + Math.random() * 110;
      candleGroup.position.set(posX, 0.1, posZ);

      this.scene.add(candleGroup);

      this.riverCandles.push({
        group: candleGroup,
        flame,
        driftSpeedZ: 0.012 + Math.random() * 0.024,
        driftSpeedX: (Math.random() - 0.5) * 0.006,
        curlFreq: 0.6 + Math.random() * 0.8,
        curlAmp: 0.02 + Math.random() * 0.03,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        bobPhase: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /* ==========================================================
     ANIMATED THAI PEOPLE IN TRADITIONAL COSTUMES
     (โมเดลคนสวมชุดไทยหลากสี เดินเล่น และลอยกระทงริมท่าน้ำ)
  ========================================================== */
  createThaiPeople() {
    this.thaiPeople = [];

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfb088, roughness: 0.65 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.45 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.75, roughness: 0.25 });

    const characterConfigs = [
      // --- กลุ่มชาวบ้านเดินเล่นบนทางเดินริมตลิ่งหลัก (Promenade Walkers - X <= -23.2, Y = 1.5 สวมเสื้อม่อฮ่อม & โจงกระเบนน้ำตาล) ---
      // 12. หญิงสาวสไบชมพูกลีบบัว เดินทอดน่อง
      {
        gender: "female",
        role: "walking",
        x: -23.5, y: 1.5, z: -8.0,
        primary: 0xec4899, secondary: 0xbe185d, gold: 0xfbbf24,
        minPos: -30.0, maxPos: 26.0,
        axis: "z", dir: 1, speed: 1.25, walkPhase: 0.0,
      },
      // 13. ชายหนุ่มเสื้อผ้าไหมสีทอง เดินเคียงข้าง
      {
        gender: "male",
        role: "walking",
        x: -24.4, y: 1.5, z: -6.5,
        primary: 0xf59e0b, secondary: 0x881337, sash: 0xd97706,
        minPos: -30.0, maxPos: 26.0,
        axis: "z", dir: 1, speed: 1.25, walkPhase: 0.2,
      },
      // 14. หญิงสาวสไบสีม่วงกล้วยไม้ เดินชมความงดงามฝั่งเรือนไทย
      {
        gender: "female",
        role: "walking",
        x: -23.5, y: 1.5, z: 18.0,
        primary: 0xa855f7, secondary: 0x6b21a8, gold: 0xfef08a,
        minPos: -20.0, maxPos: 32.0,
        axis: "z", dir: -1, speed: 1.15, walkPhase: 2.8,
      },
      // 15. ชายหนุ่มเสื้อสีเขียวมรกต เดินเล่นเลียบตลิ่ง
      {
        gender: "male",
        role: "walking",
        x: -24.2, y: 1.5, z: -18.0,
        primary: 0x10b981, secondary: 0x064e3b, sash: 0xf59e0b,
        minPos: -32.0, maxPos: 14.0,
        axis: "z", dir: 1, speed: 1.30, walkPhase: 3.9,
      },
      // 16. หญิงสาวสไบสีทองบุษราคัม เดินเล่นช่วงหน้าวัด
      {
        gender: "female",
        role: "walking",
        x: -23.2, y: 1.5, z: 12.0,
        primary: 0xf59e0b, secondary: 0x92400e, gold: 0xfef08a,
        minPos: -10.0, maxPos: 34.0,
        axis: "z", dir: -1, speed: 1.20, walkPhase: 4.5,
      },
      // 17. ชายหนุ่มเสื้อผ้าไหมสีน้ำเงินเข้ม เดินเล่นชมงาน
      {
        gender: "male",
        role: "walking",
        x: -24.4, y: 1.5, z: 8.5,
        primary: 0x1d4ed8, secondary: 0x1e1b4b, sash: 0xfacc15,
        minPos: -15.0, maxPos: 32.0,
        axis: "z", dir: -1, speed: 1.18, walkPhase: 1.8,
      },
      // 18. หญิงสาวสไบสีเขียวตองอ่อน เดินเล่น
      {
        gender: "female",
        role: "walking",
        x: -23.6, y: 1.5, z: -25.0,
        primary: 0x84cc16, secondary: 0x365314, gold: 0xfacc15,
        minPos: -34.0, maxPos: 5.0,
        axis: "z", dir: 1, speed: 1.12, walkPhase: 0.8,
      },
      // 19. ชายหนุ่มเสื้อไหมสีแดงทับทิมเข้ม เดินคู่กัน
      {
        gender: "male",
        role: "walking",
        x: -24.6, y: 1.5, z: -23.8,
        primary: 0xb91c1c, secondary: 0x450a0a, sash: 0xfbbf24,
        minPos: -34.0, maxPos: 5.0,
        axis: "z", dir: 1, speed: 1.12, walkPhase: 1.0,
      },
      // 20. หญิงสาวสไบสีม่วงลาเวนเดอร์ เดินเล่นโซนใต้
      {
        gender: "female",
        role: "walking",
        x: -23.4, y: 1.5, z: 28.0,
        primary: 0xc084fc, secondary: 0x581c87, gold: 0xfef08a,
        minPos: 5.0, maxPos: 38.0,
        axis: "z", dir: -1, speed: 1.08, walkPhase: 2.1,
      },
      // 21. ชายหนุ่มเสื้อราชปะแตนสีขาวมุก โจงกระเบนสีทองแดง
      {
        gender: "male",
        role: "walking",
        x: -24.3, y: 1.5, z: 26.5,
        primary: 0xf8fafc, secondary: 0x7c2d12, sash: 0xf59e0b,
        minPos: 5.0, maxPos: 38.0,
        axis: "z", dir: -1, speed: 1.08, walkPhase: 2.3,
      },
      // 22. หญิงสาวสไบสีส้มหมากสุก เดินรับลม
      {
        gender: "female",
        role: "walking",
        x: -23.8, y: 1.5, z: -2.0,
        primary: 0xf97316, secondary: 0x7c2d12, gold: 0xfacc15,
        minPos: -25.0, maxPos: 20.0,
        axis: "z", dir: 1, speed: 1.22, walkPhase: 4.0,
      },

      // --- ง. กลุ่มคนยืนชมวิวริมตลิ่ง (Promenade Spectators & Lantern Admirers) ---
      // 23. ชายหนุ่มยืนถือกระทงสว่างไสว เตรียมลอย
      {
        gender: "male",
        role: "spectator",
        x: -23.5, y: 1.5, z: -11.0,
        rotY: Math.PI / 2 - 0.12,
        primary: 0x0d9488, secondary: 0x134e4a, sash: 0xf59e0b,
        pose: "standing_holding",
      },
      // 24. หญิงสาวสไบสีกุหลาบ ยืนชมสายน้ำเคียงข้าง
      {
        gender: "female",
        role: "spectator",
        x: -23.4, y: 1.5, z: -12.2,
        rotY: Math.PI / 2 + 0.10,
        primary: 0xf43f5e, secondary: 0x881337, gold: 0xfbbf24,
        pose: "standing_look",
      },
      // 25. หญิงสาวสไบสีฟ้าใส ยืนแหงนมองโคมลอยยี่เป็งบนฟ้า
      {
        gender: "female",
        role: "spectator",
        x: -23.3, y: 1.5, z: 5.5,
        rotY: Math.PI / 2,
        primary: 0x38bdf8, secondary: 0x1e3a8a, gold: 0xfef08a,
        pose: "standing_look",
      },
      // 26. ชายหนุ่มชุดไทยสีน้ำตาลทอง ยืนถือกระทงชมวิวแม่น้ำฝั่งวัด
      {
        gender: "male",
        role: "spectator",
        x: -23.4, y: 1.5, z: 22.0,
        rotY: Math.PI / 2 - 0.15,
        primary: 0xb45309, secondary: 0x451a03, sash: 0xfbbf24,
        pose: "standing_holding",
      },
    ];

    // เข็มขัดและเครื่องประดับแบบเรียบง่ายสำหรับชาวบ้านทั่วไป (ไม่ฉูดฉาด ไม่แย่งซีนผู้สมัคร)
    const modestMat = new THREE.MeshStandardMaterial({ color: 0x5c2c16, roughness: 0.7 });

    characterConfigs.forEach((cfg) => {
      // ผู้ร่วมงานทั่วไปในฉาก: สวมเสื้อม่อฮ่อมสีน้ำเงิน และสวมโจงกระเบนสีน้ำตาล ตามคำขอของผู้ใช้
      // เพื่อไม่ให้การแต่งกายโดดเด่นกว่าผู้ที่โพสต์รูปร่วมโหวต
      const npcCfg = {
        ...cfg,
        primary: 0x1e3a8a,   // เสื้อม่อฮ่อมสีน้ำเงินคราม
        secondary: 0x78350f, // โจงกระเบนสีน้ำตาลเข้ม
        sash: 0x5c2c16,      // ผ้าคาดเอวสีน้ำตาลเรียบง่าย
      };
      const char = cfg.gender === "female"
        ? this.buildFemaleThaiCharacter(npcCfg, skinMat, hairMat, modestMat)
        : this.buildMaleThaiCharacter(npcCfg, skinMat, hairMat, modestMat);

      this.scene.add(char.group);
      this.thaiPeople.push(char);
    });
  }

  // สร้างพร็อพกระทงจิ๋วส่องสว่าง (Miniature Krathong Prop) ในมือคนลอยกระทง
  buildMiniKrathongProp(hasLight = true) {
    const kGroup = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 });
    const petalMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });

    // ฐานใบตอง
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.08, 10), baseMat);
    kGroup.add(base);

    // กลีบกระทงพับสามเหลี่ยมรอบฐาน 8 กลีบ
    for (let p = 0; p < 8; p++) {
      const pAng = (p / 8) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 4), petalMat);
      petal.position.set(Math.cos(pAng) * 0.17, 0.04, Math.sin(pAng) * 0.17);
      petal.rotation.y = pAng;
      petal.rotation.x = 0.45;
      kGroup.add(petal);
    }

    // ดอกไม้ประดับด้านในกระทง
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), flowerMat);
    flower.position.set(0.04, 0.06, 0.04);
    kGroup.add(flower);

    // เล่มเทียนสีเหลืองนวล
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.11, 6),
      new THREE.MeshBasicMaterial({ color: 0xfffbeb })
    );
    candle.position.set(0, 0.08, 0);
    kGroup.add(candle);

    // เปลวไฟเทียนสีส้มทอง
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.032, 0.09, 6),
      new THREE.MeshBasicMaterial({ color: 0xff8800 })
    );
    flame.position.set(0, 0.17, 0);
    kGroup.add(flame);

    // ธูป 3 ดอก
    const incenseMat = new THREE.MeshBasicMaterial({ color: 0x78350f });
    for (let i = 0; i < 3; i++) {
      const inc = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 4), incenseMat);
      inc.position.set(-0.04 + i * 0.03, 0.1, -0.04);
      inc.rotation.z = (i - 1) * 0.1;
      kGroup.add(inc);
    }

    // แสงเทียนส่องสว่างกระทบมือและผิวน้ำ
    let light = null;
    if (hasLight) {
      light = new THREE.PointLight(0xff9922, 2.0, 5.0, 1.4);
      light.position.set(0, 0.22, 0);
      kGroup.add(light);
    }

    return { group: kGroup, flame, light };
  }

  // สร้างโมเดลผู้หญิงสวมชุดไทย (สไบเฉียงพลิ้วไหว, ผ้านุ่ง/ผ้าซิ่นไหม, เข็มขัดทอง, มวยผมเกล้าสูงพร้อมดอกไม้ไหว)
  buildFemaleThaiCharacter(cfg, skinMat, hairMat, goldMat) {
    const root = new THREE.Group();
    root.position.set(cfg.x, cfg.y, cfg.z);
    root.rotation.y = cfg.rotY || 0;

    const body = new THREE.Group();
    root.add(body);

    // 1. ศีรษะและใบหน้า
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), skinMat);
    head.scale.set(1.0, 1.15, 0.95);
    head.position.y = 1.44;
    body.add(head);

    // ทรงผมเกล้ามวยสูง (High Chignon)
    const chignon = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), hairMat);
    chignon.position.set(0, 1.54, -0.11);
    body.add(chignon);

    // ดอกไม้ไหวปักผมสีทอง (Dok Mai Wai)
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.01, 0.07, 6), goldMat);
    pin.position.set(0.07, 1.6, -0.09);
    pin.rotation.z = -0.5;
    body.add(pin);

    // 2. ลำตัวและชุดไทยสไบเฉียง
    const topMat = new THREE.MeshStandardMaterial({ color: cfg.primary, roughness: 0.5 });
    const skirtMat = new THREE.MeshStandardMaterial({ color: cfg.secondary, roughness: 0.55 });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.42, 10), topMat);
    torso.position.y = 1.12;
    body.add(torso);

    // สไบเฉียงพาดบ่าซ้ายด้านหน้า
    const sabai = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.46, 0.03), topMat);
    sabai.position.set(0.02, 1.14, 0.07);
    sabai.rotation.z = -0.34;
    body.add(sabai);

    // ชายสไบยาวทอดตัวด้านหลัง (พลิ้วไหวตามการก้าวเดิน)
    const sabaiTail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.62, 0.02), topMat);
    sabaiTail.position.set(-0.07, 0.94, -0.11);
    body.add(sabaiTail);

    // เข็มขัดทองพร้อมหัวเข็มขัดลายไทย
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 6, 14), goldMat);
    belt.position.y = 0.91;
    belt.rotation.x = Math.PI / 2;
    body.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.03), goldMat);
    buckle.position.set(0, 0.91, 0.17);
    body.add(buckle);

    // ผ้านุ่ง / ผ้าซิ่นไหมยาว
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.68, 12), skirtMat);
    skirt.position.y = 0.57;
    body.add(skirt);

    // เชิงผ้าซิ่นขลิบทองด้านล่าง
    const hem = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.018, 6, 14), goldMat);
    hem.position.y = 0.24;
    hem.rotation.x = Math.PI / 2;
    body.add(hem);

    // 3. แขนทั้งสองข้าง
    const lArm = new THREE.Group();
    lArm.position.set(-0.23, 1.28, 0);
    const lArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.48), skinMat);
    lArmMesh.position.y = -0.24;
    lArm.add(lArmMesh);
    body.add(lArm);

    const rArm = new THREE.Group();
    rArm.position.set(0.23, 1.28, 0);
    const rArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.48), skinMat);
    rArmMesh.position.y = -0.24;
    rArm.add(rArmMesh);
    body.add(rArm);

    // กำไลข้อมือทอง
    [-0.23, 0.23].forEach((ax, idx) => {
      const bangle = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.012, 6, 10), goldMat);
      bangle.position.y = -0.42;
      bangle.rotation.x = Math.PI / 2;
      (idx === 0 ? lArm : rArm).add(bangle);
    });

    // 4. ขาทั้งสองข้าง
    const lLeg = new THREE.Group();
    lLeg.position.set(-0.09, 0.45, 0);
    const lLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.042, 0.44), skinMat);
    lLegMesh.position.y = -0.22;
    lLeg.add(lLegMesh);
    root.add(lLeg);

    const rLeg = new THREE.Group();
    rLeg.position.set(0.09, 0.45, 0);
    const rLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.042, 0.44), skinMat);
    rLegMesh.position.y = -0.22;
    rLeg.add(rLegMesh);
    root.add(rLeg);

    let miniFlame = null;
    let candleLight = null;
    let miniKGroup = null;

    // ท่าทางเฉพาะกรณีคนลอยกระทงริมท่าน้ำ หรือยืนชมวิว
    if (cfg.role === "floating" || cfg.role === "standing" || cfg.role === "spectator") {
      if (cfg.pose === "releasing_krathong") {
        body.position.y = -0.32;
        torso.rotation.x = 0.28;
        head.rotation.x = 0.25;
        skirt.rotation.x = -0.45;
        lLeg.rotation.x = -1.25;
        rLeg.rotation.x = -1.25;
        lLeg.position.set(-0.09, 0.18, -0.15);
        rLeg.position.set(0.09, 0.18, -0.15);

        // ยื่นมือทั้งสองข้างประคองกระทงลงสู่ผิวน้ำ
        lArm.rotation.x = -0.72;
        lArm.rotation.y = 0.32;
        rArm.rotation.x = -0.72;
        rArm.rotation.y = -0.32;

        const miniK = this.buildMiniKrathongProp(true);
        miniK.group.position.set(0, 0.42, 0.52);
        body.add(miniK.group);
        miniKGroup = miniK.group;
        miniFlame = miniK.flame;
        candleLight = miniK.light;
      } else if (cfg.pose === "praying_wai") {
        body.position.y = -0.32;
        torso.rotation.x = 0.18;
        head.rotation.x = 0.22;
        skirt.rotation.x = -0.45;
        lLeg.rotation.x = -1.25;
        rLeg.rotation.x = -1.25;
        lLeg.position.set(-0.09, 0.18, -0.15);
        rLeg.position.set(0.09, 0.18, -0.15);

        lArm.rotation.x = -0.88;
        lArm.rotation.z = -0.48;
        rArm.rotation.x = -0.88;
        rArm.rotation.z = 0.48;
      } else if (cfg.pose === "standing_holding") {
        lArm.rotation.x = -0.65;
        lArm.rotation.y = 0.32;
        rArm.rotation.x = -0.65;
        rArm.rotation.y = -0.32;

        const miniK = this.buildMiniKrathongProp(true);
        miniK.group.position.set(0, 0.92, 0.32);
        body.add(miniK.group);
        miniKGroup = miniK.group;
        miniFlame = miniK.flame;
        candleLight = miniK.light;
      } else if (cfg.pose === "standing_look") {
        lArm.rotation.x = -0.22;
        lArm.rotation.z = -0.12;
        rArm.rotation.x = -0.18;
        rArm.rotation.z = 0.12;
      }
    }

    return {
      group: root,
      body,
      head,
      torso,
      lArm,
      rArm,
      lLeg,
      rLeg,
      sabaiTail,
      miniFlame,
      candleLight,
      miniKGroup,
      pose: cfg.pose,
      baseY: cfg.y,
      bodyBaseY: body.position.y,
      speed: cfg.speed || 1.0,
      walkPhase: cfg.walkPhase || 0,
      dir: cfg.dir || 1,
      minPos: cfg.minPos,
      maxPos: cfg.maxPos,
      axis: cfg.axis || "z",
      role: cfg.role,
      phase: Math.random() * Math.PI * 2,
    };
  }

  // สร้างโมเดลผู้ชายสวมชุดไทย (เสื้อราชปะแตน/เสื้อผ้าไหมคอกลม, โจงกระเบนพอง, ผ้าคาดเอวไหม, รองเท้าหัวตัด)
  buildMaleThaiCharacter(cfg, skinMat, hairMat, goldMat) {
    const root = new THREE.Group();
    root.position.set(cfg.x, cfg.y, cfg.z);
    root.rotation.y = cfg.rotY || 0;

    const body = new THREE.Group();
    root.add(body);

    // 1. ศีรษะและทรงผมหวีเรียบ
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 12, 10), skinMat);
    head.scale.set(1.0, 1.15, 0.95);
    head.position.y = 1.50;
    body.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.175, 10, 8), hairMat);
    hair.position.set(0, 1.54, -0.02);
    body.add(hair);

    // 2. ลำตัวและเสื้อราชปะแตน / เสื้อผ้าไหม
    const shirtMat = new THREE.MeshStandardMaterial({ color: cfg.primary, roughness: 0.55 });
    const chongMat = new THREE.MeshStandardMaterial({ color: cfg.secondary, roughness: 0.6 });
    const sashMat = new THREE.MeshStandardMaterial({ color: cfg.sash || 0xf59e0b, roughness: 0.5 });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.20, 0.50, 10), shirtMat);
    torso.position.y = 1.18;
    body.add(torso);

    // คอเสื้อราชปะแตน (Mandarin Collar)
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.022, 6, 12), shirtMat);
    collar.position.y = 1.43;
    collar.rotation.x = Math.PI / 2;
    body.add(collar);

    // กระดุมทอง 4 เม็ดหน้าอก
    for (let b = 0; b < 4; b++) {
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.018, 4, 4), goldMat);
      btn.position.set(0, 1.38 - b * 0.08, 0.22);
      body.add(btn);
    }

    // ผ้าคาดเอวไหม (Sash / ผ้าเคียนพุง)
    const sash = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.23, 0.14, 10), sashMat);
    sash.position.y = 0.93;
    body.add(sash);

    const sashTie = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.04), sashMat);
    sashTie.position.set(-0.16, 0.82, 0.16);
    body.add(sashTie);

    // กางเกงโจงกระเบนผ้าไหมพองทรงสวยงาม
    const chong = new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 8), chongMat);
    chong.scale.set(1.18, 0.9, 1.12);
    chong.position.y = 0.76;
    body.add(chong);

    // 3. แขนทั้งสองข้าง
    const lArm = new THREE.Group();
    lArm.position.set(-0.27, 1.35, 0);
    const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.32), shirtMat);
    lSleeve.position.y = -0.16;
    lArm.add(lSleeve);
    const lHand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.24), skinMat);
    lHand.position.y = -0.40;
    lArm.add(lHand);
    body.add(lArm);

    const rArm = new THREE.Group();
    rArm.position.set(0.27, 1.35, 0);
    const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.32), shirtMat);
    rSleeve.position.y = -0.16;
    rArm.add(rSleeve);
    const rHand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.24), skinMat);
    rHand.position.y = -0.40;
    rArm.add(rHand);
    body.add(rArm);

    // 4. ขาทั้งสองข้าง
    const lLeg = new THREE.Group();
    lLeg.position.set(-0.12, 0.62, 0);
    const lLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.052, 0.62), skinMat);
    lLegMesh.position.y = -0.31;
    lLeg.add(lLegMesh);
    root.add(lLeg);

    const rLeg = new THREE.Group();
    rLeg.position.set(0.12, 0.62, 0);
    const rLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.052, 0.62), skinMat);
    rLegMesh.position.y = -0.31;
    rLeg.add(rLegMesh);
    root.add(rLeg);

    let miniFlame = null;
    let candleLight = null;
    let miniKGroup = null;

    // ท่าทางเฉพาะกรณีคนลอยกระทงริมท่าน้ำ หรือยืนชมวิว
    if (cfg.role === "floating" || cfg.role === "standing" || cfg.role === "spectator") {
      if (cfg.pose === "praying_wai") {
        body.position.y = -0.35;
        torso.rotation.x = 0.18;
        head.rotation.x = 0.22;
        lLeg.rotation.x = -1.25;
        rLeg.rotation.x = -1.25;
        lLeg.position.set(-0.12, 0.20, -0.16);
        rLeg.position.set(0.12, 0.20, -0.16);

        // ท่าพนมมือไหว้อธิษฐาน (Wai Prayer Pose)
        lArm.rotation.x = -0.88;
        lArm.rotation.z = -0.52;
        rArm.rotation.x = -0.88;
        rArm.rotation.z = 0.52;
      } else if (cfg.pose === "releasing_krathong") {
        body.position.y = -0.35;
        torso.rotation.x = 0.26;
        head.rotation.x = 0.22;
        lLeg.rotation.x = -1.25;
        rLeg.rotation.x = -1.25;
        lLeg.position.set(-0.12, 0.20, -0.16);
        rLeg.position.set(0.12, 0.20, -0.16);

        lArm.rotation.x = -0.72;
        lArm.rotation.y = 0.32;
        rArm.rotation.x = -0.72;
        rArm.rotation.y = -0.32;

        const miniK = this.buildMiniKrathongProp(true);
        miniK.group.position.set(0, 0.42, 0.52);
        body.add(miniK.group);
        miniKGroup = miniK.group;
        miniFlame = miniK.flame;
        candleLight = miniK.light;
      } else if (cfg.pose === "standing_holding") {
        // ยืนถือกระทงสว่างไสวที่ระดับอก
        lArm.rotation.x = -0.65;
        lArm.rotation.y = 0.35;
        rArm.rotation.x = -0.65;
        rArm.rotation.y = -0.35;

        const miniK = this.buildMiniKrathongProp(true);
        miniK.group.position.set(0, 0.92, 0.34);
        body.add(miniK.group);
        miniKGroup = miniK.group;
        miniFlame = miniK.flame;
        candleLight = miniK.light;
      } else if (cfg.pose === "standing_look") {
        lArm.rotation.x = -0.20;
        lArm.rotation.z = -0.10;
        rArm.rotation.x = -0.15;
        rArm.rotation.z = 0.10;
      }
    }

    return {
      group: root,
      body,
      head,
      torso,
      lArm,
      rArm,
      lLeg,
      rLeg,
      miniFlame,
      candleLight,
      miniKGroup,
      pose: cfg.pose,
      baseY: cfg.y,
      bodyBaseY: body.position.y,
      speed: cfg.speed || 1.0,
      walkPhase: cfg.walkPhase || 0,
      dir: cfg.dir || 1,
      minPos: cfg.minPos,
      maxPos: cfg.maxPos,
      axis: cfg.axis || "z",
      role: cfg.role,
      phase: Math.random() * Math.PI * 2,
    };
  }

  /* ==========================================================
     KRATHONG OWNER NAMEPLATE (แทนการเอารูปมาวางบนกระทง)
     ป้ายชื่อลายไทยประจำกระทง สลักชื่อเจ้าของและคำอธิษฐานสวยงาม
  ========================================================== */
  createKrathongNameplate(data, themeColor) {
    const nameplateGroup = new THREE.Group();
    nameplateGroup.position.set(0, 1.15, -0.38);

    const plaqueW = 1.62;
    const plaqueH = 0.68;
    const plaqueD = 0.06;

    // กรอบแผ่นป้ายไม้สักลายทอง
    const frameGeo = new THREE.BoxGeometry(plaqueW, plaqueH, plaqueD);
    const frameMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      metalness: 0.5,
      roughness: 0.35,
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    nameplateGroup.add(frame);

    // ขอบบัวทองรอบแผ่นป้าย
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.22,
    });
    const trimGeo = new THREE.BoxGeometry(plaqueW + 0.06, plaqueH + 0.06, plaqueD * 0.7);
    const trim = new THREE.Mesh(trimGeo, goldMat);
    nameplateGroup.add(trim);

    // Canvas สำหรับวาดชื่อและคำอธิษฐานลายไทยสวยงาม คมชัด
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 216;
    const ctx = canvas.getContext("2d");

    // พื้นหลังไล่สีราตรีหรูหรา
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 216);
    bgGrad.addColorStop(0, "#081226");
    bgGrad.addColorStop(0.5, "#0f172a");
    bgGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 216);

    // ขอบทองนอก
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 204);

    // ขอบทองใน
    ctx.strokeStyle = "rgba(251, 191, 36, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, 484, 188);

    // ลายมุมทอง 4 มุม
    const drawCorner = (cx, cy, dx, dy) => {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy + dy * 18);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + dx * 18, cy);
      ctx.stroke();
    };
    drawCorner(20, 20, 1, 1);
    drawCorner(492, 20, -1, 1);
    drawCorner(20, 196, 1, -1);
    drawCorner(492, 196, -1, -1);

    // หัวข้อเล็ก: 🪷 กระทงของ
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🪷 กระทงของ", 256, 42);

    // ชื่อเจ้าของกระทง (เด่น ชัดเจน สง่างาม ลอยเหนือสายน้ำ)
    ctx.shadowColor = "#f59e0b";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#ffffff";
    const rawName = data.name || "ผู้ร่วมลอยกระทง";
    const displayName = rawName.length > 18 ? rawName.slice(0, 17) + "…" : rawName;
    ctx.font = `bold ${displayName.length > 12 ? 30 : 36}px sans-serif`;
    ctx.fillText(displayName, 256, 96);
    ctx.shadowBlur = 0;

    // คำอธิษฐานใต้ชื่อ
    const wishText = data.wish || data.description || "สุขสันต์วันลอยกระทง";
    const displayWish = wishText.length > 24 ? wishText.slice(0, 23) + "…" : wishText;
    ctx.fillStyle = "#fbbf24";
    ctx.font = "italic 20px sans-serif";
    ctx.fillText(`“${displayWish}”`, 256, 156);

    const nameTex = new THREE.CanvasTexture(canvas);
    nameTex.colorSpace = THREE.SRGBColorSpace;
    const nameMat = new THREE.MeshBasicMaterial({
      map: nameTex,
      side: THREE.DoubleSide,
    });

    const planeW = plaqueW - 0.08;
    const planeH = plaqueH - 0.08;
    const frontPlane = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeH), nameMat);
    frontPlane.position.z = plaqueD / 2 + 0.005;
    nameplateGroup.add(frontPlane);

    const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(planeW, planeH), nameMat);
    backPlane.position.z = -(plaqueD / 2 + 0.005);
    backPlane.rotation.y = Math.PI;
    nameplateGroup.add(backPlane);

    return nameplateGroup;
  }

  /* ==========================================================
     USER KRATHONG MESH
  ========================================================== */
  buildKrathongMesh(data) {
    const group = new THREE.Group();
    group.userData = { id: data.id, entry: data };

    const krathongStyle = data.krathongStyle || "krathong-banana-leaf";
    const flowerStyle = data.flowerStyle || "flower-pink-lotus";
    const themeColor = new THREE.Color(data.color || "#f59e0b");

    // ===== 1. ฐานและกลีบกระทง 3D (5 แบบวิจิตรศิลป์ไทย) =====
    this.build3DKrathongBase(group, krathongStyle, themeColor);

    // ===== 2. ดอกไม้ประดับกระทง 3D (5 แบบมงคล) =====
    this.build3DFlowerDecoration(group, flowerStyle, themeColor);

    // ===== 3. เทียนและธูปสว่างไสว พร้อมเปลวไฟและแสงกะพริบ =====
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

    // ป้ายชื่อเจ้าของกระทง 3D แบบ Billboard ลอยอยู่เหนือกกระทง (❤️ <ชื่อเจ้าของกระทง>)
    const voteBadge = this.createVoteBadgeSprite(data.name || "ผู้ร่วมลอยกระทง");
    group.add(voteBadge);

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

    group.position.set(data.x !== undefined ? data.x : 0, 0, data.z !== undefined ? data.z : 10);
    // ปรับลดขนาดกระทงลงให้เหลือประมาณ 75% ของขนาดเดิมตามความต้องการของผู้ใช้งาน
    group.scale.set(0.75, 0.75, 0.75);

    group.userData.speedZ = (data.speed || 0.009) * (0.85 + Math.random() * 0.3);
    group.userData.driftSpeedX = (Math.random() - 0.5) * 0.004;
    group.userData.curlFreq = 0.35 + Math.random() * 0.35;
    group.userData.curlAmp = 0.008 + Math.random() * 0.010;
    group.userData.bobOffset = Math.random() * Math.PI * 2;
    group.userData.rotSpeed = (Math.random() - 0.5) * 0.002;

    return group;
  }

  // 1. ปั้นฐานและกลีบกระทง 3D ตามแบบที่เลือก (5 แบบ)
  build3DKrathongBase(group, krathongStyle, themeColor) {
    if (krathongStyle === "krathong-lotus") {
      // แบบที่ 2: กระทงบัวหลวงสวรรค์ (กลีบดอกบัวหลวงสีชมพูขาวซ้อนสองชั้น)
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.75, 1.75, 0.45, 24),
        new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 })
      );
      base.position.y = 0.2;
      group.add(base);

      const outerMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.5 });
      const innerMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.45 });

      // กลีบบัวหลวงชั้นนอก 16 กลีบ
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.35, 6), outerMat);
        petal.scale.set(1.3, 1, 0.35);
        petal.position.set(Math.cos(ang) * 1.75, 0.52, Math.sin(ang) * 1.75);
        petal.rotation.y = -ang + Math.PI / 2;
        petal.rotation.z = 0.42;
        group.add(petal);
      }

      // กลีบบัวหลวงชั้นใน 12 กลีบ
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + 0.26;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.15, 6), innerMat);
        petal.scale.set(1.2, 1, 0.32);
        petal.position.set(Math.cos(ang) * 1.35, 0.58, Math.sin(ang) * 1.35);
        petal.rotation.y = -ang + Math.PI / 2;
        petal.rotation.z = 0.28;
        group.add(petal);
      }

    } else if (krathongStyle === "krathong-gold-rose") {
      // แบบที่ 3: กระทงกลีบกุหลาบทองคำ (ผ้าไหมยกทองคำ ประดับดิ้นทอง)
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.8, 0.45, 24),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
      );
      base.position.y = 0.2;
      group.add(base);

      const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
      const brightGoldMat = new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.9, roughness: 0.15 });

      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.3, 5), goldMat);
        petal.scale.set(1.25, 1, 0.35);
        petal.position.set(Math.cos(ang) * 1.75, 0.52, Math.sin(ang) * 1.75);
        petal.rotation.y = -ang + Math.PI / 2;
        petal.rotation.z = 0.38;
        group.add(petal);
      }

      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + 0.26;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.1, 5), brightGoldMat);
        petal.scale.set(1.15, 1, 0.3);
        petal.position.set(Math.cos(ang) * 1.35, 0.58, Math.sin(ang) * 1.35);
        petal.rotation.y = -ang + Math.PI / 2;
        petal.rotation.z = 0.25;
        group.add(petal);
      }

    } else if (krathongStyle === "krathong-banana-stem") {
      // แบบที่ 4: กระทงกาบกล้วยแกะสลัก (ลายบากฟันปลาไทยโบราณขลิบทอง)
      const stemBase = new THREE.Mesh(
        new THREE.CylinderGeometry(1.9, 1.7, 0.55, 24),
        new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7 })
      );
      stemBase.position.y = 0.25;
      group.add(stemBase);

      const goldRim = new THREE.Mesh(
        new THREE.TorusGeometry(1.88, 0.05, 8, 28),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.25 })
      );
      goldRim.position.y = 0.52;
      goldRim.rotation.x = Math.PI / 2;
      group.add(goldRim);

      // บากลวดลายไทยกนกรอบฐานกาบกล้วย
      const notchMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const notch = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 4), notchMat);
        notch.position.set(Math.cos(ang) * 1.82, 0.42, Math.sin(ang) * 1.82);
        notch.rotation.y = -ang;
        notch.rotation.z = 0.55;
        group.add(notch);
      }

    } else if (krathongStyle === "krathong-eco-pastel") {
      // แบบที่ 5: กระทงรักษ์โลกแป้งธรรมชาติ (สีพาสเทลสายรุ้งย่อยสลายได้)
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.75, 1.75, 0.45, 24),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.65 })
      );
      base.position.y = 0.2;
      group.add(base);

      const cyanMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.55 });
      const mintMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.55 });

      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), cyanMat);
        petal.scale.set(1.2, 0.7, 0.4);
        petal.position.set(Math.cos(ang) * 1.7, 0.5, Math.sin(ang) * 1.7);
        petal.rotation.y = -ang;
        group.add(petal);
      }

      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2 + 0.3;
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 8), mintMat);
        petal.scale.set(1.1, 0.65, 0.35);
        petal.position.set(Math.cos(ang) * 1.3, 0.56, Math.sin(ang) * 1.3);
        petal.rotation.y = -ang;
        group.add(petal);
      }

    } else {
      // แบบที่ 1 (Default): กระทงใบตองกลีบผกากรอง (ใบตองสดพับจับจีบสองชั้น)
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.8, 0.45, 24),
        new THREE.MeshStandardMaterial({ color: 0x234d19, roughness: 0.8 })
      );
      base.position.y = 0.2;
      group.add(base);

      const outerMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
      const innerMat = new THREE.MeshStandardMaterial({ color: 0x3c8a38, roughness: 0.55 });

      // ชั้นนอก 16 กลีบผกา
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.3, 4), outerMat);
        petal.scale.set(1.25, 1, 0.32);
        petal.position.set(Math.cos(ang) * 1.72, 0.5, Math.sin(ang) * 1.72);
        petal.rotation.y = -ang + Math.PI / 2;
        petal.rotation.z = 0.36;
        group.add(petal);
      }

      // ชั้นใน 12 กลีบผกา
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + 0.26;
        const petal = new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.1, 4), innerMat);
        petal.scale.set(1.15, 1, 0.28);
        petal.position.set(Math.cos(ang) * 1.35, 0.56, Math.sin(ang) * 1.35);
        petal.rotation.y = -ang + Math.PI / 2;
        petal.rotation.z = 0.24;
        group.add(petal);
      }
    }
  }

  // 2. ปั้นดอกไม้ประดับใจกลางกระทง 3D ตามแบบที่เลือก (5 แบบ)
  build3DFlowerDecoration(group, flowerStyle, themeColor) {
    if (flowerStyle === "flower-jasmine-champaca") {
      // แบบที่ 2: พวงมาลัยดอกมะลิสด & ดอกจำปาทอง
      const garlandGroup = new THREE.Group();
      garlandGroup.position.y = 0.46;

      const jasmineMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
      const champacaMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });

      // วงพวงมาลัยดอกมะลิ 24 เม็ด
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2;
        const bud = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), jasmineMat);
        bud.position.set(Math.cos(ang) * 1.05, 0, Math.sin(ang) * 1.05);
        garlandGroup.add(bud);
      }

      // ดอกจำปาทอง 6 กลีบประดับ
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const champaca = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.6, 6), champacaMat);
        champaca.position.set(Math.cos(ang) * 0.95, 0.04, Math.sin(ang) * 0.95);
        champaca.rotation.z = Math.PI / 2;
        champaca.rotation.y = -ang;
        garlandGroup.add(champaca);
      }
      group.add(garlandGroup);

    } else if (flowerStyle === "flower-gold-marigold") {
      // แบบที่ 3: ดอกดาวเรืองมงคลสีทองอร่าม (5 ดอกช่อแน่น)
      const marigoldMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.45 });
      const centerGoldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });

      const offsets = [
        [0, 0], [0.55, 0.25], [-0.55, -0.25], [-0.35, 0.45], [0.35, -0.45]
      ];

      offsets.forEach(([ox, oz], idx) => {
        const r = idx === 0 ? 0.42 : 0.34;
        const marigold = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), idx === 0 ? centerGoldMat : marigoldMat);
        marigold.position.set(ox, 0.52 + (idx === 0 ? 0.08 : 0), oz);
        marigold.scale.set(1.1, 0.8, 1.1);
        group.add(marigold);
      });

    } else if (flowerStyle === "flower-purple-orchid") {
      // แบบที่ 4: ช่อดอกกล้วยไม้สีม่วงอัญชัน (4 ดอก)
      const orchidMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.4 });
      const lipMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35 });

      const orchidPos = [[-0.45, 0], [0.45, 0.1], [0, -0.45], [0.1, 0.45]];

      orchidPos.forEach(([ox, oz]) => {
        const blossom = new THREE.Group();
        blossom.position.set(ox, 0.50, oz);

        // 5 กลีบกล้วยไม้
        for (let p = 0; p < 5; p++) {
          const ang = (p / 5) * Math.PI * 2;
          const petal = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), orchidMat);
          petal.scale.set(1.2, 0.4, 0.6);
          petal.position.set(Math.cos(ang) * 0.22, 0, Math.sin(ang) * 0.22);
          petal.rotation.y = -ang;
          blossom.add(petal);
        }

        // ปากกล้วยไม้สีเหลือง
        const lip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), lipMat);
        lip.position.set(0, 0.03, 0);
        blossom.add(lip);

        group.add(blossom);
      });

    } else if (flowerStyle === "flower-red-rose") {
      // แบบที่ 5: ดอกกุหลาบมอญแดงสด & ดอกรักขาว
      const roseMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.42 });
      const darkRoseMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.45 });
      const crownFlowerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });

      // ดอกกุหลาบ 3 ดอกใจกลาง
      [[-0.25, 0.2], [0.25, 0.1], [0, -0.28]].forEach(([rx, rz], idx) => {
        const rose = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), idx === 0 ? roseMat : darkRoseMat);
        rose.scale.set(1.05, 0.75, 1.05);
        rose.position.set(rx, 0.52, rz);
        group.add(rose);
      });

      // ดอกรักสีขาว 10 เม็ดแวดล้อม
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2;
        const crown = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), crownFlowerMat);
        crown.position.set(Math.cos(ang) * 0.85, 0.48, Math.sin(ang) * 0.85);
        group.add(crown);
      }

    } else {
      // แบบที่ 1 (Default): ดอกบัวหลวงสีชมพูบานสะพรั่ง
      const lotusGroup = new THREE.Group();
      lotusGroup.position.set(0, 0.46, 0);

      const petalMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.42 });
      const podMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });

      // 10 กลีบดอกบัวหลวงบานออก
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 8), petalMat);
        petal.scale.set(1.2, 0.4, 0.7);
        petal.position.set(Math.cos(ang) * 0.55, 0.08, Math.sin(ang) * 0.55);
        petal.rotation.y = -ang;
        petal.rotation.z = 0.28;
        lotusGroup.add(petal);
      }

      // ฝักบัวใจกลางสีเหลืองทอง
      const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.25, 12), podMat);
      pod.position.y = 0.12;
      lotusGroup.add(pod);

      group.add(lotusGroup);
    }
  }

  // สร้างพื้นผิว Texture ป้ายชื่อเจ้าของกระทง (ทรงแคปซูลมน ขอบทอง พร้อมไอคอนหัวใจ ❤️ และชื่อเจ้าของกระทงคมชัด)
  createVoteBadgeTexture(name) {
    const c = document.createElement("canvas");
    c.width = 440;
    c.height = 96;
    const ctx = c.getContext("2d");

    ctx.clearRect(0, 0, c.width, c.height);

    const x = 6, y = 6, w = 428, h = 84, r = 38;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, "rgba(15, 23, 42, 0.92)");
    grad.addColorStop(1, "rgba(30, 41, 59, 0.96)");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 4;
    ctx.stroke();

    // เส้นขอบในสีทองบางๆ
    ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);

    ctx.font = "bold 34px sans-serif";
    ctx.textBaseline = "middle";

    // รูปหัวใจ ❤️ ทางซ้าย
    ctx.fillText("❤️", 46, y + h / 2 + 1);

    // ชื่อเจ้าของกระทง อยู่ข้างรูปหัวใจ แทนที่ตัวเลข
    ctx.fillStyle = "#fef08a";
    ctx.textAlign = "left";
    const displayName = (name || "ผู้ร่วมลอยกระทง").length > 15
      ? (name || "ผู้ร่วมลอยกระทง").slice(0, 14) + "…"
      : (name || "ผู้ร่วมลอยกระทง");
    ctx.fillText(displayName, 96, y + h / 2 + 1);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // สร้างวัตถุ 3D Billboard Sprite สำหรับป้ายชื่อเจ้าของกระทงลอยเหนือกกระทง
  createVoteBadgeSprite(name) {
    const tex = this.createVoteBadgeTexture(name);
    const spriteMat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.9, 0.42, 1.0);
    sprite.position.set(0, 2.45, -0.2);
    sprite.name = "voteBadgeSprite";
    return sprite;
  }

  /* ==========================================================
     CANDIDATE 3D AVATAR ON GREEN PIER
     โมเดล 3D ผู้สมัครสวมชุดไทยยืนสง่างามบนท่าน้ำสีเขียว
     - เลือกระหว่างผู้ชาย (เสื้อราชปะแตน โจงกระเบนไหม) หรือผู้หญิง (ชุดไทยสไบเฉียง ผ้านุ่งไหม)
     - ดึงรูปถ่ายจริงของผู้สมัครมาแมปบนใบหน้า 3D (Face Texture Soft Radial Masking)
     - ยืนเด่นริมท่าน้ำสีเขียว พร้อมยกมือขวาโบกทักทายผู้ชม
     - ป้ายชื่อและคะแนนโหวตลายไทยสีทองลอยเหนือศีรษะ
  ========================================================== */
  // คำนวณตำแหน่งยืนบนลานหญ้าท่าน้ำสีเขียวโดยเฉพาะ รับประกันตำแหน่งไม่ซ้อนทับกัน 100%
  getCandidateSlotPosition(index) {
    const spacing = 3.2; // ระยะห่าง 3.2 เมตร ระหว่างแท่นแต่ละคน ป้องกันการซ้อนทับ 100%
    const sign = index % 2 === 1 ? 1 : -1;
    const step = Math.ceil(index / 2);
    const posZ = 5.0 + sign * step * spacing;

    // แถวหน้าติดริมน้ำ X = -12.4 ถ้าเกินขอบเขตให้เข้าแถวที่ 2
    const isSecondRow = Math.abs(posZ - 5.0) > 14.5;
    const posX = isSecondRow ? -15.2 : -12.4;
    const adjustedZ = isSecondRow ? 5.0 + sign * (step - 5) * spacing : posZ;

    return { x: posX, y: 0.89, z: isSecondRow ? adjustedZ : posZ };
  }

  buildCandidateAvatar(entry, slotPos) {
    const avatarGroup = new THREE.Group();

    avatarGroup.position.set(slotPos.x, slotPos.y, slotPos.z);
    // ขยายขนาดสเกล 1.3 เท่า ให้สูงเด่นเป็นสง่าเหนือคนเดินเล่นทั่วไป
    avatarGroup.scale.set(1.3, 1.3, 1.3);
    // หันหน้าเฉียงรับกล้องและแม่น้ำ 45 องศา สวยงามสง่า
    avatarGroup.rotation.y = 0.75;

    const isMale = entry.gender === "male";
    const primaryColorHex = entry.costumeColor || entry.color || "#f59e0b";
    const primaryColor = new THREE.Color(primaryColorHex);

    // วัสดุคุณภาพสูงสำหรับกายวิภาคและชุดไทย
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfb088, roughness: 0.58, metalness: 0.04 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.40, metalness: 0.05 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.18 });
    const whiteStockingMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f5, roughness: 0.55 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35, metalness: 0.18 });
    const rubyMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.15, metalness: 0.65 });

    // Color definitions for 5 Male Tops / 5 Male Bottoms / 5 Female Tops / 5 Female Bottoms
    const maleTopColors = {
      "male-top-1": 0xfffdf5, // เสื้อราชปะแตนไหมงาช้าง
      "male-top-2": 0xf59e0b, // เสื้อพระราชทานไหมทอง
      "male-top-3": 0x1e3a8a, // เสื้อพระราชทานสีกรมท่า
      "male-top-4": 0x991b1b, // เสื้อกุยเฮงไหมทับทิมสยาม
      "male-top-5": 0x1e40af, // เสื้อม่อฮ่อมประยุกต์ครามธรรมชาติ
    };
    const maleBottomColors = {
      "male-bottom-1": 0x881337, // โจงกระเบนไหมสีแดงทับทิม
      "male-bottom-2": 0x172554, // โจงกระเบนไหมสีกรมท่า
      "male-bottom-3": 0xd97706, // โจงกระเบนไหมยกทองคำ
      "male-bottom-4": 0x065f46, // โจงกระเบนไหมสีเขียวมรกต
      "male-bottom-5": 0xfef3c7, // กางเกงแพรไทยสีงาช้าง
    };
    const femaleTopColors = {
      "female-top-1": 0xf59e0b, // สไบจักรพรรดิสองชั้นปักดิ้นทอง
      "female-top-2": 0xf472b6, // สไบจักรีสีชมพูกลีบบัว
      "female-top-3": 0x059669, // สไบแพรสีเขียวมรกต
      "female-top-4": 0xfff1f2, // เสื้อลูกไม้คอปิดแขนกระบอก
      "female-top-5": 0x7c3aed, // สไบสองชั้นสีม่วงดอกรัก
    };
    const femaleBottomColors = {
      "female-bottom-1": 0xf59e0b, // ผ้าซิ่นไหมยกดิ้นทองจีบหน้านาง
      "female-bottom-2": 0x1e3a8a, // ผ้าซิ่นมัดหมี่สีน้ำเงินคราม
      "female-bottom-3": 0x9f1239, // ผ้าถุงไหมสีแดงทับทิมสยาม
      "female-bottom-4": 0x065f46, // ผ้าซิ่นไหมสีเขียวมรกต
      "female-bottom-5": 0xec4899, // ผ้าถุงไหมสีชมพูกลีบบัว
    };

    const topColorHex = isMale
      ? (maleTopColors[entry.topStyle] || (entry.costumeStyle === "pra-ratchatan" ? 0xf59e0b : 0xfffdf5))
      : (femaleTopColors[entry.topStyle] || (entry.costumeColor ? new THREE.Color(entry.costumeColor).getHex() : 0xf59e0b));

    const bottomColorHex = isMale
      ? (maleBottomColors[entry.bottomStyle] || (entry.costumeColor ? new THREE.Color(entry.costumeColor).getHex() : 0x881337))
      : (femaleBottomColors[entry.bottomStyle] || (entry.costumeColor ? new THREE.Color(entry.costumeColor).getHex() : 0xf59e0b));

    const topMat = new THREE.MeshStandardMaterial({
      color: topColorHex,
      roughness: 0.44,
      metalness: 0.18,
    });
    const bottomMat = new THREE.MeshStandardMaterial({
      color: bottomColorHex,
      roughness: 0.42,
      metalness: 0.22,
    });
    const silkMat = bottomMat; // legacy fallback

    // แท่นพรมทองลายไทยยกพื้นขลิบทอง (Ceremonial Golden Dais)
    const dais = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.65, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.45, metalness: 0.25 })
    );
    dais.position.y = 0.06;
    avatarGroup.add(dais);

    const daisBorder = new THREE.Mesh(
      new THREE.TorusGeometry(0.60, 0.035, 8, 24),
      goldMat
    );
    daisBorder.position.y = 0.12;
    daisBorder.rotation.x = Math.PI / 2;
    avatarGroup.add(daisBorder);

    // ดวงไฟสปอตไลต์ประจำตัว (Golden Aura Spotlight) ให้ตัวโมเดลสว่างไสว เปล่งประกายในความมืด
    const spot = new THREE.PointLight(0xffe082, 3.2, 7.5, 1.2);
    spot.position.set(0, 2.7, 0.8);
    avatarGroup.add(spot);
    this.flickerLights.push({ light: spot, baseIntensity: 3.2, speed: 2.0 });

    // วงแหวนไฮไลต์สีทองบนพื้นหญ้าเมื่อเลือกกระทง/ตัวละคร
    const ringGeo = new THREE.RingGeometry(0.65, 0.80, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const highlightRing = new THREE.Mesh(ringGeo, ringMat);
    highlightRing.position.y = 0.02;
    highlightRing.name = "avatarHighlightRing";
    avatarGroup.add(highlightRing);

    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 0.12; // ยืนบนแท่นพรมทองพอดี
    avatarGroup.add(bodyGroup);

    // วัสดุใบหน้าพอร์ตเทรตคมชัดสูง (Planar Portrait Masking)
    const faceMat = new THREE.MeshStandardMaterial({
      roughness: 0.58,
      metalness: 0.04,
      transparent: true,
      alphaTest: 0.02,
      depthWrite: true,
    });
    this.applyCandidateFaceTexture(faceMat, entry.photoUrl, entry.name);

    let wavingArm = null;
    let wavingHand = null;

    if (isMale) {
      const maleRig = this.buildMaleCandidate(bodyGroup, entry, skinMat, hairMat, goldMat, topMat, bottomMat, whiteStockingMat, shoeMat, rubyMat, faceMat);
      wavingArm = maleRig.wavingArm;
      wavingHand = maleRig.wavingHand;
    } else {
      const femaleRig = this.buildFemaleCandidate(bodyGroup, entry, skinMat, hairMat, goldMat, topMat, bottomMat, shoeMat, rubyMat, faceMat);
      wavingArm = femaleRig.wavingArm;
      wavingHand = femaleRig.wavingHand;
    }

    // ===== ป้ายชื่อและคะแนนโหวตลายไทยสีทองลอยเหนือศีรษะ (Billboard Sprite) ไม่บดบังโมเดลคน =====
    const badgeSprite = this.createCandidateBadgeSprite(entry.name, entry.votes || 0);
    badgeSprite.position.set(0, isMale ? 2.52 : 2.48, 0);
    avatarGroup.add(badgeSprite);

    avatarGroup.userData = {
      id: entry.id,
      entry: entry,
      isCandidateAvatar: true,
    };

    return {
      group: avatarGroup,
      entry,
      basePos: { ...slotPos },
      wavingArm,
      wavingHand,
      badgeSprite,
      phase: Math.random() * Math.PI * 2,
    };
  }

  // ==========================================================
  // ANATOMICAL SCULPTING HELPERS (ปั้นโครงสร้างสรีระมนุษย์สมจริง)
  // ==========================================================

  // ปั้นมือมนุษย์ที่เรียวงาม ได้สัดส่วนสมจริง (Graceful Anatomical Hand)
  buildAnatomicalHand(skinMat, isLeft, isWaving) {
    const handGroup = new THREE.Group();

    // 1. ฝ่ามือ (Palm) รูปทรงโค้งรับสรีระ
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.052, 0.020), skinMat);
    palm.position.y = -0.026;
    handGroup.add(palm);

    // 2. นิ้วหัวแม่มือ (Thumb) แนบข้างฝ่ามืออย่างเป็นธรรมชาติ
    const thumbSign = isLeft ? -1 : 1;
    const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.007, 0.036, 8), skinMat);
    thumb.position.set(thumbSign * 0.024, -0.022, 0.004);
    thumb.rotation.z = thumbSign * (isWaving ? -0.42 : -0.25);
    thumb.rotation.x = isWaving ? -0.15 : 0.20;
    handGroup.add(thumb);

    // 3. ปลายนิ้ว 4 นิ้วรวมกลุ่มโค้งรับรูปมืออย่างสง่างาม ไม่แยกเป็นกิ่งก้านแข็ง
    const fingers = new THREE.Mesh(new THREE.BoxGeometry(0.040, 0.038, 0.016), skinMat);
    fingers.position.set(0, -0.062, isWaving ? -0.002 : 0.005);
    if (!isWaving) fingers.rotation.x = 0.22; // โค้งงอเล็กน้อยในท่ายืนพักมือ
    handGroup.add(fingers);

    // ปลายนิ้วมน 4 จุด
    [-0.015, -0.005, 0.005, 0.015].forEach((fx, idx) => {
      const fTip = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 6, 6), skinMat);
      fTip.position.set(fx, -0.081 + (idx === 1 ? -0.003 : 0), isWaving ? -0.002 : 0.008);
      handGroup.add(fTip);
    });

    return handGroup;
  }

  // ปั้นศีรษะ โครงหน้า 3D ใบหู และทรงผมไทย พร้อมแผ่นพอร์ตเทรตรูปไข่คมชัดไร้การบิดเบี้ยว
  buildAnatomicalHead(isMale, skinMat, hairMat, goldMat, faceMat, rubyMat) {
    const headGroup = new THREE.Group();

    // 1. กะโหลกศีรษะ 3D เนื้อเนียนสีผิวธรรมชาติ (Smooth Anatomical Cranium)
    const headRadius = 0.125;
    const headGeo = new THREE.SphereGeometry(headRadius, 24, 20);
    headGeo.scale(0.96, 1.12, 1.04);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(headMesh);

    // 2. แผ่นพอร์ตเทรตใบหน้าด้านหน้า (Planar Oval Portrait Face - Zero Distortion)
    // ระนาบรูปไข่แนบสนิทด้านหน้าศีรษะ ทำให้รูปถ่ายผู้โพสต์คมชัด 100% ตรงตามรูปจริง ไม่ยืดเบี้ยวเป็นเลนส์นูน
    const facePlateGeo = new THREE.PlaneGeometry(0.18, 0.22);
    const facePlate = new THREE.Mesh(facePlateGeo, faceMat);
    facePlate.position.set(0, 0.01, 0.126);
    headGroup.add(facePlate);

    // 3. ใบหูทั้งสองข้าง (3D Sculpted Ears)
    [-0.120, 0.120].forEach((ex, idx) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), skinMat);
      ear.position.set(ex, 0.005, -0.01);
      ear.scale.set(0.35, 1.15, 0.75);
      ear.rotation.y = idx === 0 ? 0.15 : -0.15;
      headGroup.add(ear);
    });

    // 4. ทรงผม 3D ปั้นตามแบบสุภาพบุรุษไทยและสตรีไทย
    if (isMale) {
      // ผมสุภาพบุรุษไทย: ทรงหวีเรียบสง่างาม ครอบรับกะโหลกศีรษะอย่างเป็นธรรมชาติ
      const maleHair = new THREE.Mesh(new THREE.SphereGeometry(0.129, 20, 16), hairMat);
      maleHair.position.set(0, 0.022, -0.018);
      maleHair.scale.set(1.02, 0.98, 1.08);
      headGroup.add(maleHair);

      // จอนผมข้างหู
      [-0.118, 0.118].forEach((sx) => {
        const sideburn = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.040, 0.022), hairMat);
        sideburn.position.set(sx, -0.020, 0.012);
        headGroup.add(sideburn);
      });
    } else {
      // ผมสตรีไทย: เกล้ามวยผมสูงด้านหลัง (Royal Thai High Chignon) พร้อมเกี้ยวทองคำและปิ่นปักผมดอกไม้ไหว
      const femaleHair = new THREE.Mesh(new THREE.SphereGeometry(0.129, 20, 16), hairMat);
      femaleHair.position.set(0, 0.022, -0.016);
      femaleHair.scale.set(1.02, 0.98, 1.06);
      headGroup.add(femaleHair);

      // มวยผมเกล้าสูงด้านหลัง
      const chignon = new THREE.Mesh(new THREE.SphereGeometry(0.070, 16, 12), hairMat);
      chignon.position.set(0, 0.105, -0.088);
      chignon.scale.set(1.10, 0.95, 0.92);
      headGroup.add(chignon);

      // เกี้ยวทองรัดมวยผม (Golden Filigree Coronet)
      const coronet = new THREE.Mesh(new THREE.TorusGeometry(0.060, 0.014, 8, 20), goldMat);
      coronet.position.set(0, 0.088, -0.088);
      coronet.rotation.x = Math.PI / 2;
      headGroup.add(coronet);

      // ปิ่นปักผมทองคำประดับอุบะดอกจำปาทอง (Golden Lotus Hairpin with Ruby Gem)
      const pinShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.002, 0.13, 6), goldMat);
      pinShaft.position.set(0.060, 0.155, -0.076);
      pinShaft.rotation.z = -0.65;
      pinShaft.rotation.x = -0.22;
      headGroup.add(pinShaft);

      const pinFlower = new THREE.Mesh(new THREE.SphereGeometry(0.020, 8, 8), goldMat);
      pinFlower.position.set(0.10, 0.195, -0.064);
      headGroup.add(pinFlower);

      const pinRuby = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 6), rubyMat);
      pinRuby.position.set(0.10, 0.195, -0.054);
      headGroup.add(pinRuby);
    }

    return headGroup;
  }

  // ==========================================================
  // MALE CANDIDATE MODEL (สุภาพบุรุษไทยในชุดราชปะแตน & โจงกระเบนไหม)
  // ==========================================================
  buildMaleCandidate(bodyGroup, entry, skinMat, hairMat, goldMat, topMat, bottomMat, whiteStockingMat, shoeMat, rubyMat, faceMat) {
    const jacketMat = topMat;
    const isTrousers = entry.bottomStyle === "male-bottom-5";
    const legFabricMat = isTrousers ? bottomMat : whiteStockingMat;

    // 1. รองเท้าคัทชูหนังขัดมันราชสำนัก (Royal Black Leather Court Shoes)
    [-0.085, 0.085].forEach((sx) => {
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.020, 0.18), shoeMat);
      sole.position.set(sx, 0.010, 0.02);
      bodyGroup.add(sole);

      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.045, 0.14), shoeMat);
      upper.position.set(sx, 0.034, 0.03);
      bodyGroup.add(upper);

      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.034, 10, 8), shoeMat);
      toe.position.set(sx, 0.025, 0.082);
      toe.scale.set(1.0, 0.60, 1.15);
      bodyGroup.add(toe);

      const heel = new THREE.Mesh(new THREE.BoxGeometry(0.070, 0.025, 0.050), shoeMat);
      heel.position.set(sx, 0.012, -0.042);
      bodyGroup.add(heel);

      const shoeBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.012, 0.022), goldMat);
      shoeBuckle.position.set(sx, 0.054, 0.032);
      bodyGroup.add(shoeBuckle);
    });

    // 2. ขาสวมถุงน่องไหมสีขาวแบบพิธีการ หรือขากางเกงแพรไทย (Royal Stockings or Silk Trousers)
    [-0.085, 0.085].forEach((lx) => {
      const calf = new THREE.Mesh(
        new THREE.CylinderGeometry(isTrousers ? 0.052 : 0.046, isTrousers ? 0.048 : 0.035, 0.38, 12),
        legFabricMat
      );
      calf.position.set(lx, 0.25, 0.005);
      bodyGroup.add(calf);

      const knee = new THREE.Mesh(
        new THREE.SphereGeometry(isTrousers ? 0.048 : 0.040, 8, 8),
        legFabricMat
      );
      knee.position.set(lx, 0.45, 0.012);
      bodyGroup.add(knee);
    });

    // 3. โจงกระเบนผ้าไหม หรือ กางเกงแพรไทย
    if (isTrousers) {
      [-0.085, 0.085].forEach((tx) => {
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.054, 0.36, 12), bottomMat);
        thigh.position.set(tx, 0.63, 0.01);
        bodyGroup.add(thigh);
      });
      const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), bottomMat);
      pelvis.position.set(0, 0.70, 0);
      pelvis.scale.set(1.08, 0.85, 0.98);
      bodyGroup.add(pelvis);
    } else {
      const leftThighPuff = new THREE.Mesh(new THREE.CylinderGeometry(0.110, 0.080, 0.36, 12), bottomMat);
      leftThighPuff.position.set(-0.085, 0.63, 0.01);
      leftThighPuff.rotation.z = 0.06;
      bodyGroup.add(leftThighPuff);

      const rightThighPuff = new THREE.Mesh(new THREE.CylinderGeometry(0.110, 0.080, 0.36, 12), bottomMat);
      rightThighPuff.position.set(0.085, 0.63, 0.01);
      rightThighPuff.rotation.z = -0.06;
      bodyGroup.add(rightThighPuff);

      const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 12), bottomMat);
      pelvis.position.set(0, 0.70, 0);
      pelvis.scale.set(1.12, 0.85, 1.02);
      bodyGroup.add(pelvis);

      const frontPleat = new THREE.Mesh(new THREE.BoxGeometry(0.090, 0.28, 0.045), bottomMat);
      frontPleat.position.set(0, 0.64, 0.115);
      bodyGroup.add(frontPleat);

      const backTail = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), bottomMat);
      backTail.position.set(0, 0.76, -0.130);
      bodyGroup.add(backTail);
    }

    // 4. เข็มขัดทองและผ้ารัดประคดเอว (Jeweled Gold Belt)
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.020, 8, 20), goldMat);
    belt.position.y = 0.86;
    belt.rotation.x = Math.PI / 2;
    bodyGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.070, 0.055, 0.028), goldMat);
    buckle.position.set(0, 0.86, 0.170);
    bodyGroup.add(buckle);

    const buckleGem = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), rubyMat);
    buckleGem.position.set(0, 0.86, 0.184);
    bodyGroup.add(buckleGem);

    // 5. เสื้อราชปะแตนคัตติ้งเนี้ยบ (Tailored Rajpatan Silk Jacket)
    const jacketHem = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.205, 0.15, 16), jacketMat);
    jacketHem.position.y = 0.80;
    bodyGroup.add(jacketHem);

    const jacketTorso = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.28, 0.19), jacketMat);
    jacketTorso.position.y = 1.02;
    bodyGroup.add(jacketTorso);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.070, 0.045, 16), jacketMat);
    collar.position.y = 1.18;
    bodyGroup.add(collar);

    const collarPiping = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.007, 6, 16), goldMat);
    collarPiping.position.y = 1.20;
    collarPiping.rotation.x = Math.PI / 2;
    bodyGroup.add(collarPiping);

    for (let b = 0; b < 5; b++) {
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), goldMat);
      btn.position.set(0, 1.14 - b * 0.065, 0.100);
      bodyGroup.add(btn);
    }

    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.036, 0.015), jacketMat);
    pocket.position.set(-0.080, 1.08, 0.098);
    bodyGroup.add(pocket);

    const hanky = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.018, 0.010), goldMat);
    hanky.position.set(-0.080, 1.11, 0.102);
    hanky.rotation.z = 0.20;
    bodyGroup.add(hanky);

    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.42, 0.015), bottomMat);
    sash.position.set(-0.02, 1.02, 0.099);
    sash.rotation.z = -0.55;
    bodyGroup.add(sash);

    const medalStar = new THREE.Mesh(new THREE.SphereGeometry(0.019, 6, 6), goldMat);
    medalStar.position.set(0.060, 0.88, 0.110);
    bodyGroup.add(medalStar);

    // 6. ลำคอสง่างาม
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.054, 0.055, 16), skinMat);
    neck.position.y = 1.22;
    bodyGroup.add(neck);

    // 7. ศีรษะและใบหน้า 3D (พอร์ตเทรตคมชัด 100% ไม่บิดเบี้ยว)
    const head = this.buildAnatomicalHead(true, skinMat, hairMat, goldMat, faceMat, rubyMat);
    head.position.y = 1.35;
    bodyGroup.add(head);

    // 8. แขนทั้งสองข้างในท่ายืนสำรวมสง่างาม สมส่วนและมั่นคง 100% (Dignified Symmetrical Arms)
    [-1, 1].forEach((side) => {
      const isLeft = side === -1;
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.195, 1.14, 0);

      // หัวไหล่มนรับกับลำตัว
      const deltoid = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), jacketMat);
      armGroup.add(deltoid);

      // ต้นแขนสวมแขนเสื้อสีเดียวกับชุด ทอดลงข้างลำตัวอย่างเป็นธรรมชาติ
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.035, 0.22, 12), jacketMat);
      upperArm.position.y = -0.11;
      armGroup.add(upperArm);

      // ข้อศอก
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), jacketMat);
      elbow.position.y = -0.22;
      armGroup.add(elbow);

      // แขนท่อนปลายสวมแขนเสื้อสีเดียวกับชุด
      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(0, -0.22, 0);
      forearmGroup.rotation.x = -0.08; // โค้งมาข้างหน้าเล็กน้อย
      forearmGroup.rotation.z = side * -0.05; // เบนเข้าหาสะโพกอย่างผ่อนคลาย

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.030, 0.20, 12), jacketMat);
      forearm.position.y = -0.10;
      forearmGroup.add(forearm);

      // ข้อมือขลิบทอง
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.007, 6, 12), goldMat);
      cuff.position.set(0, -0.20, 0);
      cuff.rotation.x = Math.PI / 2;
      forearmGroup.add(cuff);

      // ฝ่ามือเรียวงามในท่ายืนสง่างาม
      const hand = this.buildAnatomicalHand(skinMat, isLeft, false);
      hand.position.set(0, -0.21, 0);
      forearmGroup.add(hand);

      armGroup.add(forearmGroup);

      // กางแขนออกข้างลำตัวเล็กน้อย (8 องศา) ให้มองเห็นแขนครบทั้ง 2 ข้างอย่างชัดเจน ไม่มีจมเข้าเนื้อ
      armGroup.rotation.z = side * 0.08;
      armGroup.rotation.x = -0.04;
      bodyGroup.add(armGroup);
    });

    return {
      wavingArm: null,
      wavingHand: null,
    };
  }

  // ==========================================================
  // FEMALE CANDIDATE MODEL (สตรีไทยในชุดไทยจักรีห่มสไบเฉียง & ผ้าซิ่นไหมยกดิ้นทอง)
  // ==========================================================
  buildFemaleCandidate(bodyGroup, entry, skinMat, hairMat, goldMat, topMat, bottomMat, shoeMat, rubyMat, faceMat) {
    const isLaceTop = entry.topStyle === "female-top-4"; // เสื้อลูกไม้คอปิดแขนกระบอก บรมพิมาน
    const sleeveMat = isLaceTop ? topMat : skinMat;

    // 1. รองเท้าคัทชูหัวแหลมผ้าไหมไทยปักดิ้นทอง (Pointed Thai Silk Court Slippers)
    [-0.080, 0.080].forEach((sx) => {
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.016, 0.15), shoeMat);
      sole.position.set(sx, 0.008, 0.015);
      bodyGroup.add(sole);

      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.038, 0.12), bottomMat);
      upper.position.set(sx, 0.024, 0.022);
      bodyGroup.add(upper);

      const pointedToe = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.060, 8), bottomMat);
      pointedToe.position.set(sx, 0.022, 0.090);
      pointedToe.rotation.x = Math.PI / 2;
      bodyGroup.add(pointedToe);

      const toeGold = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 6), goldMat);
      toeGold.position.set(sx, 0.024, 0.118);
      bodyGroup.add(toeGold);
    });

    // 2. ข้อเท้าเรียวงามและกำไลข้อเท้าทองคำ (Slender Ankles with Golden Anklets)
    [-0.080, 0.080].forEach((ax) => {
      const ankle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.14, 12), skinMat);
      ankle.position.set(ax, 0.09, 0);
      bodyGroup.add(ankle);

      const anklet = new THREE.Mesh(new THREE.TorusGeometry(0.033, 0.007, 6, 14), goldMat);
      anklet.position.set(ax, 0.07, 0);
      anklet.rotation.x = Math.PI / 2;
      bodyGroup.add(anklet);
    });

    // 3. ผ้านุ่ง / ผ้าซิ่นไหมยกดิ้นทองทรงหางปลาสง่างาม (Pha Nung / Silk Sarong with Pleated Front)
    const lowerSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.190, 0.36, 16), bottomMat);
    lowerSkirt.position.y = 0.34;
    bodyGroup.add(lowerSkirt);

    const upperSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.165, 0.34, 16), bottomMat);
    upperSkirt.position.y = 0.68;
    bodyGroup.add(upperSkirt);

    const naNang = new THREE.Mesh(new THREE.BoxGeometry(0.070, 0.66, 0.020), bottomMat);
    naNang.position.set(0, 0.50, 0.168);
    bodyGroup.add(naNang);

    const naNangGold = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.66, 0.023), goldMat);
    naNangGold.position.set(0, 0.50, 0.173);
    bodyGroup.add(naNangGold);

    const hem = new THREE.Mesh(new THREE.TorusGeometry(0.190, 0.015, 8, 24), goldMat);
    hem.position.y = 0.17;
    hem.rotation.x = Math.PI / 2;
    bodyGroup.add(hem);

    // 4. เข็มขัดทองและปั้นเหน่งทองคำฉลุลายฝังพลอย (Jeweled Golden Belt)
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.018, 8, 20), goldMat);
    belt.position.y = 0.86;
    belt.rotation.x = Math.PI / 2;
    bodyGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.020, 16), goldMat);
    buckle.position.set(0, 0.86, 0.150);
    buckle.rotation.x = Math.PI / 2;
    bodyGroup.add(buckle);

    const rubyCabochon = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), rubyMat);
    rubyCabochon.position.set(0, 0.86, 0.164);
    bodyGroup.add(rubyCabochon);

    // 5. ลำตัวระหงและชุดไทยห่มสไบเฉียงสองชั้น หรือเสื้อลูกไม้คอปิด
    const bodice = new THREE.Mesh(new THREE.CylinderGeometry(0.148, 0.132, 0.28, 16), topMat);
    bodice.position.y = 1.02;
    bodyGroup.add(bodice);

    if (isLaceTop) {
      const highCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.056, 0.038, 16), topMat);
      highCollar.position.y = 1.20;
      bodyGroup.add(highCollar);
    } else {
      const innerSabai = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.36, 0.022), goldMat);
      innerSabai.position.set(0.01, 1.03, 0.075);
      innerSabai.rotation.z = -0.32;
      bodyGroup.add(innerSabai);

      const sabai = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.42, 0.026), topMat);
      sabai.position.set(-0.02, 1.04, 0.090);
      sabai.rotation.z = -0.35;
      bodyGroup.add(sabai);

      const sabaiTail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.80, 0.018), topMat);
      sabaiTail.position.set(-0.10, 0.76, -0.110);
      sabaiTail.rotation.x = 0.08;
      bodyGroup.add(sabaiTail);
    }

    const sangwan = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.44, 0.020), goldMat);
    sangwan.position.set(0.01, 1.04, 0.102);
    sangwan.rotation.z = -0.38;
    bodyGroup.add(sangwan);

    for (let g = 0; g < 4; g++) {
      const sangwanGem = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 6), rubyMat);
      sangwanGem.position.set(0.055 - g * 0.038, 0.94 + g * 0.075, 0.112);
      bodyGroup.add(sangwanGem);
    }

    const necklace = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.011, 8, 16), goldMat);
    necklace.position.y = 1.20;
    necklace.rotation.x = Math.PI / 2;
    bodyGroup.add(necklace);

    // 6. ลำคอระหงอ่อนช้อย
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.050, 0.052, 16), skinMat);
    neck.position.y = 1.22;
    bodyGroup.add(neck);

    // 7. ศีรษะและใบหน้า 3D (พอร์ตเทรตคมชัด 100% ไม่บิดเบี้ยว)
    const head = this.buildAnatomicalHead(false, skinMat, hairMat, goldMat, faceMat, rubyMat);
    head.position.y = 1.35;
    bodyGroup.add(head);

    // 8. แขนทั้งสองข้างในท่ายืนสง่างาม สมส่วนและมั่นคง 100%
    [-1, 1].forEach((side) => {
      const isLeft = side === -1;
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.180, 1.12, 0);

      const deltoid = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), sleeveMat);
      armGroup.add(deltoid);

      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.030, 0.22, 12), sleeveMat);
      upperArm.position.y = -0.11;
      armGroup.add(upperArm);

      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.030, 8, 8), sleeveMat);
      elbow.position.y = -0.22;
      armGroup.add(elbow);

      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(0, -0.22, 0);
      forearmGroup.rotation.x = -0.08;
      forearmGroup.rotation.z = side * -0.05;

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.025, 0.20, 12), sleeveMat);
      forearm.position.y = -0.10;
      forearmGroup.add(forearm);

      // กำไลข้อมือทองคำ
      const bangle = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.007, 6, 12), goldMat);
      bangle.position.y = -0.20;
      bangle.rotation.x = Math.PI / 2;
      forearmGroup.add(bangle);

      // ฝ่ามืออ่อนช้อย
      const hand = this.buildAnatomicalHand(skinMat, isLeft, false);
      hand.position.set(0, -0.21, 0);
      forearmGroup.add(hand);

      armGroup.add(forearmGroup);

      armGroup.rotation.z = side * 0.08;
      armGroup.rotation.x = -0.04;
      bodyGroup.add(armGroup);
    });

    return {
      wavingArm: null,
      wavingHand: null,
    };
  }

  // นำรูปภาพจริงของผู้สมัครมาตกแต่งและแมปลงบนแผ่นพอร์ตเทรตรูปไข่ด้านหน้าศีรษะ (Planar Oval Portrait Mapping)
  applyCandidateFaceTexture(faceMat, photoUrl, name) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    const drawDefaultFace = () => {
      ctx.clearRect(0, 0, 512, 512);

      // โครงหน้ารูปไข่สีผิวธรรมชาติ
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(256, 256, 215, 240, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#dfb088";
      ctx.fill();

      // นุ่มนวลด้วยเงาข้างแก้มและกรอบกราม (Ambient Occlusion)
      const aoGrad = ctx.createRadialGradient(256, 256, 120, 256, 256, 235);
      aoGrad.addColorStop(0, "rgba(180, 120, 85, 0)");
      aoGrad.addColorStop(0.70, "rgba(180, 120, 85, 0.12)");
      aoGrad.addColorStop(1, "rgba(150, 95, 65, 0.35)");
      ctx.fillStyle = aoGrad;
      ctx.beginPath();
      ctx.ellipse(256, 256, 215, 240, 0, 0, Math.PI * 2);
      ctx.fill();

      // คิ้วโก่งเรียวงามแบบไทย (Graceful Arched Eyebrows)
      ctx.strokeStyle = "#27272a";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(176, 202, 44, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(336, 202, 44, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // ดวงตารูปหางหงส์คมขำ (Almond Eyes with Iris & Pupil)
      [176, 336].forEach((eyeX) => {
        // ตาขาว
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(eyeX, 238, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // ม่านตาสีน้ำตาลประกาย
        ctx.fillStyle = "#3e2723";
        ctx.beginPath();
        ctx.arc(eyeX, 238, 11, 0, Math.PI * 2);
        ctx.fill();

        // รูม่านตาดำ
        ctx.fillStyle = "#09090b";
        ctx.beginPath();
        ctx.arc(eyeX, 238, 6, 0, Math.PI * 2);
        ctx.fill();

        // ประกายตาแวววาว (Specular Catchlight)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(eyeX - 4, 234, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // เส้นขอบตาบนและขนตา
        ctx.strokeStyle = "#18181b";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(eyeX, 238, 22, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      });

      // สันจมูกและเงาปีกจมูก (Nose Shading)
      ctx.fillStyle = "rgba(180, 110, 75, 0.25)";
      ctx.beginPath();
      ctx.ellipse(256, 266, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // แก้มอมชมพูระเรื่อสุขภาพดี (Blushing Cheeks)
      const blushGrad1 = ctx.createRadialGradient(144, 280, 5, 144, 280, 36);
      blushGrad1.addColorStop(0, "rgba(244, 63, 94, 0.35)");
      blushGrad1.addColorStop(1, "rgba(244, 63, 94, 0)");
      ctx.fillStyle = blushGrad1;
      ctx.beginPath();
      ctx.arc(144, 280, 36, 0, Math.PI * 2);
      ctx.fill();

      const blushGrad2 = ctx.createRadialGradient(368, 280, 5, 368, 280, 36);
      blushGrad2.addColorStop(0, "rgba(244, 63, 94, 0.35)");
      blushGrad2.addColorStop(1, "rgba(244, 63, 94, 0)");
      ctx.fillStyle = blushGrad2;
      ctx.beginPath();
      ctx.arc(368, 280, 36, 0, Math.PI * 2);
      ctx.fill();

      // รอยยิ้มพิมพ์ใจรูปกระจับ (Contoured Lips with Cupid's Bow)
      ctx.fillStyle = "#be123c";
      ctx.beginPath();
      ctx.ellipse(256, 312, 28, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // ไฮไลต์ริมฝีปากล่างให้ดูอิ่มเอิบ
      ctx.fillStyle = "rgba(255, 228, 230, 0.65)";
      ctx.beginPath();
      ctx.ellipse(256, 314, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ขอบฟุ้งไล่ระดับโปร่งแสง (Feathered Alpha Edge) เพื่อให้กลืนเข้ากับกะโหลกศีรษะ 3D 100%
      ctx.globalCompositeOperation = "destination-in";
      const featherGrad = ctx.createRadialGradient(256, 256, 185, 256, 256, 240);
      featherGrad.addColorStop(0, "rgba(0, 0, 0, 1.0)");
      featherGrad.addColorStop(0.75, "rgba(0, 0, 0, 0.85)");
      featherGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
      ctx.fillStyle = featherGrad;
      ctx.beginPath();
      ctx.ellipse(256, 256, 240, 250, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      faceMat.map = tex;
      faceMat.needsUpdate = true;
    };

    drawDefaultFace();

    if (!photoUrl) return;

    const isDataOrBlob = photoUrl.startsWith("data:") || photoUrl.startsWith("blob:");
    const getCorsUrl = (url) => {
      if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;
      if (url.includes("images.weserv.nl")) return url;
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    };

    const img = new Image();
    if (!isDataOrBlob) img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        ctx.clearRect(0, 0, 512, 512);

        const iw = img.width || 512;
        const ih = img.height || 512;
        const cropW = Math.min(iw, ih * 0.82);
        const cropH = cropW * 1.18;
        const sx = (iw - cropW) / 2;
        const sy = Math.max(0, ih * 0.04);

        // วาดรูปถ่ายลงในรูปทรงไข่รับกับกรอบหน้า
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(256, 256, 230, 245, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, sx, sy, cropW, Math.min(cropH, ih - sy), 16, 10, 480, 492);
        ctx.restore();

        // ขอบฟุ้งไล่ระดับโปร่งแสง (Feathered Alpha Edge) ปลายขอบโปร่งแสง 100% กลืนเข้ากับเนื้อผิว 3D
        ctx.globalCompositeOperation = "destination-in";
        const featherGrad = ctx.createRadialGradient(256, 256, 175, 256, 256, 242);
        featherGrad.addColorStop(0, "rgba(0, 0, 0, 1.0)");
        featherGrad.addColorStop(0.70, "rgba(0, 0, 0, 0.85)");
        featherGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
        ctx.fillStyle = featherGrad;
        ctx.beginPath();
        ctx.ellipse(256, 256, 242, 250, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        faceMat.map = tex;
        faceMat.needsUpdate = true;
      } catch (err) {
        console.warn("Candidate face texture error:", err);
      }
    };

    img.onerror = () => {
      if (!isDataOrBlob && !img.src.includes("images.weserv.nl")) {
        img.src = getCorsUrl(photoUrl);
      }
    };

    if (!isDataOrBlob && (photoUrl.includes("firebasestorage.googleapis.com") || photoUrl.includes("unsplash.com"))) {
      img.src = getCorsUrl(photoUrl);
    } else {
      img.src = photoUrl;
    }
  }

  // สร้างป้ายชื่อและคะแนนโหวตลายไทยสีทองเหนือศีรษะโมเดล
  createCandidateBadgeSprite(name, votes) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");

    const render = (n, v) => {
      ctx.clearRect(0, 0, 512, 140);

      const x = 10, y = 10, w = 492, h = 120, r = 32;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(x, y, x, y + h);
      grad.addColorStop(0, "rgba(15, 23, 42, 0.94)");
      grad.addColorStop(1, "rgba(30, 41, 59, 0.98)");
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 6;
      ctx.stroke();

      // เส้นขอบในสีทอง
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 8, y + 8, w - 16, h - 16);

      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 38px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const displayName = (n || "ผู้ร่วมลอยกระทง").length > 15 
        ? (n || "ผู้ร่วมลอยกระทง").slice(0, 14) + "…" 
        : (n || "ผู้ร่วมลอยกระทง");
      ctx.fillText(displayName, 256, 52);

      ctx.fillStyle = "#fb7185";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(`❤️ โหวต ${v || 0} คะแนน`, 256, 98);
    };

    render(name, votes);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(2.4, 0.65, 1.0);
    sprite.userData = { canvas, ctx, renderTexture: render };
    return sprite;
  }

  updateCandidateAvatarBadge(avatar, entry) {
    if (!avatar.badgeSprite?.userData?.renderTexture) return;
    const { renderTexture } = avatar.badgeSprite.userData;
    renderTexture(entry.name, entry.votes || 0);
    if (avatar.badgeSprite.material.map) {
      avatar.badgeSprite.material.map.needsUpdate = true;
    }
  }

  // กำหนดตำแหน่งเริ่มต้นของกระทงให้กระจายตัวเต็มความกว้างท้องน้ำทั้ง 2 ฝั่ง (ซ้าย-ขวา)
  assignKrathongInitialPosition(index) {
    // กระจายกระทงเต็มความกว้างท้องน้ำ (ฝั่งซ้าย กลางน้ำ และเวิ้งน้ำกว้างฝั่งขวา)
    const broadLanes = [-8.0, -3.5, 4.0, 12.0, 24.0, 34.0, 44.0];
    const laneIndex = index % broadLanes.length;
    const x = broadLanes[laneIndex] + (Math.random() - 0.5) * 2.5;
    // กระจายระยะต้นน้ำ Z สลับกันเป็นธรรมชาติ
    const z = 8.0 + (index % 5) * 8.0 + Math.random() * 6.0;
    return { x, z };
  }

  updateKrathongs(entries) {
    const currentIds = new Set(entries.map((e) => e.id));

    // 1. จัดการ Krathong Meshes ในแม่น้ำ
    for (const [id, mesh] of this.krathongMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        this.krathongMeshes.delete(id);
      }
    }

    // 2. จัดการ Candidate Avatars บนท่าน้ำสีเขียว
    for (const [id, avatar] of this.candidateAvatars.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(avatar.group);
        this.candidateAvatars.delete(id);
      }
    }

    entries.forEach((entry, index) => {
      // กระทงลอยในน้ำ
      let mesh = this.krathongMeshes.get(entry.id);
      if (!mesh) {
        if (entry.x === undefined || entry.x < -9.5 || entry.x > 48.0) {
          const initPos = this.assignKrathongInitialPosition(index);
          entry.x = initPos.x;
          entry.z = initPos.z;
        }
        mesh = this.buildKrathongMesh(entry);
        this.scene.add(mesh);
        this.krathongMeshes.set(entry.id, mesh);
      } else {
        const oldName = mesh.userData.entry?.name || "";
        mesh.userData.entry = entry;
        if (entry.name !== oldName) {
          const sprite = mesh.getObjectByName("voteBadgeSprite");
          if (sprite) {
            if (sprite.material.map) sprite.material.map.dispose();
            sprite.material.map = this.createVoteBadgeTexture(entry.name || "ผู้ร่วมลอยกระทง");
            sprite.material.needsUpdate = true;
          }
        }
      }

      // โมเดลผู้สมัครสวมชุดไทยยืนบนท่าน้ำสีเขียว
      const slotPos = this.getCandidateSlotPosition(index);
      let avatar = this.candidateAvatars.get(entry.id);
      if (!avatar) {
        try {
          avatar = this.buildCandidateAvatar(entry, slotPos);
          if (avatar && avatar.group) {
            this.scene.add(avatar.group);
            this.candidateAvatars.set(entry.id, avatar);
          }
        } catch (err) {
          console.error("Error creating candidate avatar:", err, entry);
        }
      } else {
        // อัปเดตตำแหน่งแท่นยืนเสมอเมื่อมีการเพิ่ม/เปลี่ยนลำดับรายการ เพื่อไม่ให้โมเดลคนยืนซ้อนทับกันเด็ดขาด 100%
        avatar.basePos = { ...slotPos };
        avatar.group.position.x = slotPos.x;
        avatar.group.position.z = slotPos.z;

        const oldVotes = avatar.entry?.votes || 0;
        avatar.entry = entry;
        avatar.group.userData.entry = entry;
        if (entry.votes !== oldVotes) {
          this.updateCandidateAvatarBadge(avatar, entry);
        }
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
    for (const [aId, avatar] of this.candidateAvatars.entries()) {
      const ring = avatar.group.getObjectByName("avatarHighlightRing");
      if (ring) {
        ring.material.opacity = aId === id ? 0.95 : 0;
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

  focusOnCandidateAvatar(id) {
    const avatar = this.candidateAvatars.get(id);
    if (!avatar) return;

    this.highlightKrathong(id);
    const targetPos = avatar.group.position.clone();
    targetPos.y += 1.6;
    this.controls.target.copy(targetPos);
    this.camera.position.set(targetPos.x + 5.2, targetPos.y + 1.2, targetPos.z + 4.2);
  }

  onPointerUp(event) {
    if (this.pointerDownPos) {
      const dx = event.clientX - this.pointerDownPos.x;
      const dy = event.clientY - this.pointerDownPos.y;
      this.pointerDownPos = null;
      if (Math.hypot(dx, dy) > 8) return; // หากเป็นการลากเลื่อนหมุนมุมกล้อง จะไม่ถือเป็นการคลิก
    }

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // ตรวจสอบการคลิกเฉพาะโมเดลคนบนท่าน้ำสีเขียวเท่านั้น
    // (ยกเลิกการคลิกแล้วเด้ง popup ที่กระทงในน้ำ เพื่อให้ผู้ใช้ลากหมุนมุมกล้องในน้ำได้อย่างอิสระ ไม่เด้ง popup มากวนใจ)
    const interactables = [];
    for (const avatar of this.candidateAvatars.values()) {
      avatar.group.traverse((child) => {
        if (child.isMesh || child.isSprite) {
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
     EXACT WATER SURFACE CALCULATION
     คำนวณระดับความสูงและระนาบผิวน้ำที่แท้จริง ณ จุด (x, z) และเวลา time
     เพื่อให้วัตถุลอยน้ำทั้งหมด (กระทง, กระทงสาย, กอบัว) ลอยอยู่บนผิวน้ำเสมอ ไม่จมน้ำเด็ดขาด
  ========================================================== */
  getWaterHeightAt(x, z, time) {
    return (
      Math.sin(x * 0.12 + time * 0.70) * 0.14 +
      Math.cos(z * 0.15 + time * 0.55) * 0.11 +
      Math.sin((x + z) * 0.08 + time * 0.82) * 0.07
    );
  }

  getWaterNormalAt(x, z, time) {
    const delta = 0.5;
    const hL = this.getWaterHeightAt(x - delta, z, time);
    const hR = this.getWaterHeightAt(x + delta, z, time);
    const hD = this.getWaterHeightAt(x, z - delta, time);
    const hU = this.getWaterHeightAt(x, z + delta, time);
    return {
      slopeX: (hR - hL) / (2 * delta),
      slopeZ: (hU - hD) / (2 * delta),
    };
  }

  /* ==========================================================
     ANIMATION LOOP ("วัตถุทุกอย่างมีความเคลื่อนไหว & ระบบป้องกันการชน/ทับซ้อน")
  ========================================================== */
  animate() {
    this.animId = requestAnimationFrame(this.animate.bind(this));
    const time = this.clock.getElapsedTime();
    const dt = Math.min(time - (this.lastTime || time), 0.05) || 0.016;
    this.lastTime = time;

    // 1. Controls
    this.controls.update();

    // 2. Animated River Water Waves (ผิวน้ำกระเพื่อมไหว)
    if (this.riverPositions && this.baseRiverCoords) {
      const pos = this.riverPositions.array;
      for (let i = 0; i < pos.length; i += 3) {
        const x = this.baseRiverCoords[i];
        const z = this.baseRiverCoords[i + 2];
        pos[i + 1] = this.getWaterHeightAt(x, z, time);
      }
      this.riverPositions.needsUpdate = true;
    }

    // 3. Krathongs Downstream Movement with Dynamic Buoyancy (ลอยบนผิวน้ำจริง ไม่จม ชะลอความเร็วให้สมจริง)
    const krathongs = Array.from(this.krathongMeshes.values());

    krathongs.forEach((mesh, idx) => {
      const speedZ = mesh.userData.speedZ || mesh.userData.speed || 0.009;
      const bob = mesh.userData.bobOffset || 0;
      const driftX = mesh.userData.driftSpeedX || 0;
      const curlFreq = mesh.userData.curlFreq || 0.45;
      const curlAmp = mesh.userData.curlAmp || 0.010;

      // 1. ไหลตามกระแสน้ำ Z อย่างเอื่อยๆ นุ่มนวล
      mesh.position.z -= speedZ * 1.1;

      // 2. วิถีการลอยอิสระซ้าย-ขวาอย่างเป็นธรรมชาติ (Multi-directional organic drift)
      mesh.position.x +=
        driftX +
        Math.sin(time * curlFreq + bob) * curlAmp +
        Math.cos(time * 0.35 + mesh.position.z * 0.05) * 0.006;

      // 3. วนกลับขึ้นต้นน้ำเมื่อลอยพ้นสายตา (-52.0) สุ่มกระจายตัวทั่วท้องน้ำ
      if (mesh.position.z < -52.0) {
        mesh.position.z = 38.0 + Math.random() * 26.0;
        // กระจายสุ่มเต็มความกว้างท้องน้ำทั้ง 2 ฝั่ง (X: -8.0 ถึง +44.0)
        const broadLanes = [-8.0, -3.5, 4.0, 12.0, 24.0, 34.0, 44.0];
        mesh.position.x = broadLanes[idx % broadLanes.length] + (Math.random() - 0.5) * 3.0;
        mesh.userData.driftSpeedX = (Math.random() - 0.5) * 0.004;
      }

      // Dynamic Water Buoyancy: ฐานกระทงลอยเหนือน้ำตลอดเวลา ไม่จมน้ำเมื่อคลื่นซัด
      const waterY = this.getWaterHeightAt(mesh.position.x, mesh.position.z, time);
      mesh.position.y = waterY + 0.08;

      // โคลงเคลงตามความชันของลูกคลื่นจริง (Wave Surface Tilt)
      const { slopeX, slopeZ } = this.getWaterNormalAt(mesh.position.x, mesh.position.z, time);
      mesh.rotation.z = -slopeX * 0.75;
      mesh.rotation.x = slopeZ * 0.75;
      mesh.rotation.y += (mesh.userData.rotSpeed || 0.001) * 0.35;

      // เปลวไฟเทียนสะบัดไหว
      const flame = mesh.getObjectByName("candleFlame");
      if (flame) {
        const flicker = Math.sin(time * 16.0 + bob) * 0.15 + 1.0;
        flame.scale.set(flicker, flicker * 1.1, flicker);
      }

      // ป้ายผลโหวตลอยพลิ้วเบาๆ เหนือกกระทง
      const vBadge = mesh.getObjectByName("voteBadgeSprite");
      if (vBadge) {
        vBadge.position.y = 2.55 + Math.sin(time * 2.0 + bob) * 0.04;
      }
    });

    // --- ระบบฟิสิกส์ป้องกันกระทงชนหรือทับกันเอง (Krathong-Krathong Repulsion) ---
    const minDistKrathong = 5.2; // รัศมีความปลอดภัย 5.2 เมตร (เส้นผ่านศูนย์กลางกระทง 3.6 เมตร)
    for (let i = 0; i < krathongs.length; i++) {
      for (let j = i + 1; j < krathongs.length; j++) {
        const kA = krathongs[i];
        const kB = krathongs[j];
        const dx = kA.position.x - kB.position.x;
        const dz = kA.position.z - kB.position.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < minDistKrathong * minDistKrathong && distSq > 0.0001) {
          const dist = Math.sqrt(distSq);
          const overlap = (minDistKrathong - dist) * 0.5;
          const nx = dx / dist;
          const nz = dz / dist;

          // ดันออกจากกันอย่างนุ่มนวล
          kA.position.x += nx * overlap * 0.18;
          kA.position.z += nz * overlap * 0.18;
          kB.position.x -= nx * overlap * 0.18;
          kB.position.z -= nz * overlap * 0.18;
        }
      }
    }

    // --- ระบบป้องกันกระทงลอยชนสิ่งกีดขวาง และแยกสายน้ำรอบฐานเจดีย์ 2 ฝั่ง ---
    krathongs.forEach((mesh) => {
      // 1. ป้องกันกระทงลอยไปทับกอบัวริมน้ำฝั่งซ้าย (Lotus Avoidance)
      if (this.lotusObstacles) {
        this.lotusObstacles.forEach((cl) => {
          const dx = mesh.position.x - cl.x;
          const dz = mesh.position.z - cl.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const safeDist = cl.r + 2.5;

          if (dist < safeDist && dist > 0.001) {
            const push = (safeDist - dist) * 0.25;
            mesh.position.x += Math.max(0.08, (dx / dist) * push);
          }
        });
      }

      // 2. ป้องกันไม่ให้กระทงชนเสาและบันไดท่าน้ำฝั่งซ้าย (Grand Pier X <= -11.0, Z ระหว่าง -15 ถึง 25)
      if (mesh.position.x < -7.0 && mesh.position.z > -15.0 && mesh.position.z < 25.0) {
        mesh.position.x += (-7.0 - mesh.position.x) * 0.2;
      }

      // 3. ระบบแยกสายน้ำอ้อมฐานเจดีย์และลานวัด 2 ฝั่ง (Bifurcated Dual-Channel Navigation)
      // ฐานวัดและเจดีย์ตั้งอยู่ที่ X: -4.0 ถึง +36.0, Z: -58.0 ถึง -26.0 (บันไดหน้าวัดยื่นถึง Z = -21.0, X: 9.0 ถึง 23.0)

      // ชั้นที่ 1: กระแสน้ำแยกสายล่วงหน้า (Early Divergence Current: Z ระหว่าง -5.0 ถึง -22.0)
      // กระทงซีกซ้าย (X < 16.0) จะเบี่ยงออกสู่ร่องน้ำฝั่งตะวันตก (X <= -5.8)
      // กระทงซีกขวา (X >= 16.0) จะเบี่ยงออกสู่เวิ้งน้ำกว้างฝั่งตะวันออก (X >= 38.5)
      if (mesh.position.z < -5.0 && mesh.position.z > -22.0) {
        if (mesh.position.x > -5.0 && mesh.position.x < 16.0) {
          mesh.position.x -= 0.045;
        } else if (mesh.position.x >= 16.0 && mesh.position.x < 38.0) {
          mesh.position.x += 0.045;
        }
      }

      // ชั้นที่ 2: ป้องกันการชนบันไดหินอ่อนหน้าลานวัด (Front Stairs: X: 8.5 ถึง 23.5, Z: -20.5 ถึง -26.0)
      if (mesh.position.x > 8.5 && mesh.position.x < 23.5 && mesh.position.z < -20.5 && mesh.position.z > -26.0) {
        if (mesh.position.x < 16.0) {
          mesh.position.x -= 0.20;
        } else {
          mesh.position.x += 0.20;
        }
        mesh.position.z = Math.max(mesh.position.z, -20.2);
      }

      // ป้องกันการชนผนังฐานลานวัดด้านหน้า (South Platform Wall: X: -5.0 ถึง 37.0, Z: -25.0 ถึง -27.2)
      if (mesh.position.x > -5.2 && mesh.position.x < 37.2 && mesh.position.z <= -25.0 && mesh.position.z > -27.2) {
        if (mesh.position.x < 16.0) {
          mesh.position.x -= 0.25;
        } else {
          mesh.position.x += 0.25;
        }
        mesh.position.z = Math.max(mesh.position.z, -24.8);
      }

      // ชั้นที่ 3: กำแพงล็อกพิกัดเด็ดขาดรอบฐานเจดีย์และลานวัด (Impenetrable Hard Clamp: Z <= -25.0 ถึง -58.0)
      // กระทงจะไม่สามารถหลุดเข้าไปในเขตฐานเจดีย์หรือลานวัดได้ 100%
      if (mesh.position.z <= -25.0 && mesh.position.z >= -58.0) {
        if (mesh.position.x < 16.0) {
          // ฝั่งตะวันตก (เลียบฐานเจดีย์ฝั่งซ้าย): ลอยในร่องน้ำหลัก ห้ามทะลุเกิน X = -5.8
          if (mesh.position.x > -5.8) mesh.position.x = -5.8;
        } else {
          // ฝั่งตะวันออก (เลียบฐานเจดีย์ฝั่งขวา): ลอยในเวิ้งน้ำกว้าง ห้ามต่ำกว่า X = 38.5
          if (mesh.position.x < 38.5) mesh.position.x = 38.5;
        }
      }

      // จำกัดขอบเขตท้องน้ำทั้งหมดอย่างปลอดภัย (Full River Boundary: X ระหว่าง -9.5 ถึง +48.0)
      if (mesh.position.x < -9.5) mesh.position.x = -9.5;
      if (mesh.position.x > 48.0) mesh.position.x = 48.0;
    });

    // 4. Sky Lanterns Rising & Swaying (โคมลอยลอยขึ้นฟ้าอย่างแช่มช้า สง่างาม)
    if (this.skyLanterns) {
      this.skyLanterns.forEach((item) => {
        item.mesh.position.y += item.speedY * 0.28;
        item.mesh.position.x =
          item.baseX + Math.sin(time * (item.driftFreq * 0.5) + item.phase) * (item.driftAmp * 0.7);
        item.mesh.position.z =
          item.baseZ + Math.cos(time * (item.driftFreq * 0.4) + item.phase) * (item.driftAmp * 0.35);

        item.mesh.rotation.y += item.rotSpeed * 0.4;
        item.mesh.rotation.z = Math.sin(time * 0.8 + item.phase) * 0.03;

        if (item.mesh.position.y > 75) {
          item.mesh.position.y = 8 + Math.random() * 8;
          item.mesh.position.x = (Math.random() - 0.5) * 110 + 5;
          item.mesh.position.z = -10 - Math.random() * 85;
          item.baseX = item.mesh.position.x;
          item.baseZ = item.mesh.position.z;
        }
      });
    }

    // 5. Krathong Sai / River Candles (ถ้วยตะไลลอยกระจายเต็มท้องน้ำทุกทิศทาง เคลื่อนไหวเอื่อยๆ ช้าๆ อย่างสมจริง)
    if (this.riverCandles) {
      this.riverCandles.forEach((item) => {
        // กระแสน้ำไหลเอื่อยๆ ลงท้ายน้ำ (-Z) ช้าลงอย่างเป็นธรรมชาติ
        item.group.position.z -= item.driftSpeedZ * 1.0;
        item.group.position.x +=
          item.driftSpeedX * 0.35 +
          Math.sin(time * (item.curlFreq * 0.5) + item.bobPhase) * (item.curlAmp * 0.6) +
          Math.cos(time * 0.35 + item.group.position.z * 0.06) * 0.008;

        item.group.rotation.y += item.rotSpeed * 0.35;

        // วงจรการเติมถ้วยตะไลใหม่อย่างต่อเนื่อง (Continuous Replenishment)
        // เมื่อลอยเลยท้ายน้ำ (-52) จะวนกลับไปปล่อยที่ต้นน้ำ (+45 ถึง +70) ครอบคลุมเต็มความกว้างแม่น้ำ
        if (item.group.position.z < -52.0) {
          item.group.position.z = 45.0 + Math.random() * 25.0;
          // กระจายเต็มท้องน้ำ ทั้งฝั่งซ้าย กลาง และฝั่งขวา (X: -11.5 ถึง +56.0)
          item.group.position.x = -11.5 + Math.random() * 67.5;
          item.driftSpeedZ = 0.012 + Math.random() * 0.024;
          item.driftSpeedX = (Math.random() - 0.5) * 0.006;
        }

        // Dynamic Buoyancy: ถ้วยตะไลลอยบนผิวน้ำตลอดเวลาตามความสูงระลอกคลื่น ไม่จม
        const cWaterY = this.getWaterHeightAt(item.group.position.x, item.group.position.z, time);
        item.group.position.y = cWaterY + 0.05;

        // เอียงตามระลอกคลื่นน้ำอย่างเป็นธรรมชาติ
        const { slopeX, slopeZ } = this.getWaterNormalAt(item.group.position.x, item.group.position.z, time);
        item.group.rotation.z = -slopeX * 0.4;
        item.group.rotation.x = slopeZ * 0.4;

        // --- ระบบป้องกันกระทงสายชนทะลุฐานเจดีย์ ลานวัด และบันไดวัด 100% (Solid Collision Box & Hard Bounds) ---
        // ฐานวัดและเจดีย์ครอบคลุมพื้นที่พิกัดโลก: X จาก -4.0 ถึง +36.0, Z จาก -57.0 ถึง -26.0
        // บันไดหินอ่อนหน้าวัดครอบคลุม: X จาก 9.0 ถึง 23.0, Z จาก -26.0 ถึง -21.0

        // ชั้นที่ 1: กระแสน้ำแยกสายล่วงหน้า (Early Divergence Current: Z ระหว่าง -5.0 ถึง -22.0)
        // นำพาถ้วยตะไลแยกออกเป็น 2 สายก่อนถึงแนววัดอย่างนุ่มนวล
        if (item.group.position.z < -5.0 && item.group.position.z > -22.0) {
          if (item.group.position.x > -5.0 && item.group.position.x < 16.0) {
            item.group.position.x -= 0.055;
          } else if (item.group.position.x >= 16.0 && item.group.position.x < 38.0) {
            item.group.position.x += 0.055;
          }
        }

        // ชั้นที่ 2: แรงผลักด้านหน้าบันไดวัดและผนังฐานวัด (Front Obstacle Deflection)
        // ป้องกันการชนบันไดหินอ่อนหน้าวัด (Stairs: X: 9.0 ถึง 23.0, Z: -20.5 ถึง -25.5)
        if (item.group.position.x > 8.5 && item.group.position.x < 23.5 && item.group.position.z < -20.5 && item.group.position.z > -26.0) {
          if (item.group.position.x < 16.0) {
            item.group.position.x -= 0.18;
          } else {
            item.group.position.x += 0.18;
          }
          item.group.position.z = Math.max(item.group.position.z, -20.2);
        }

        // ป้องกันการชนผนังหน้าฐานวัด (South Front Wall: X: -5.0 ถึง 37.0, Z: -25.0 ถึง -27.0)
        if (item.group.position.x > -5.2 && item.group.position.x < 37.2 && item.group.position.z <= -25.0 && item.group.position.z > -27.2) {
          if (item.group.position.x < 16.0) {
            item.group.position.x -= 0.25;
          } else {
            item.group.position.x += 0.25;
          }
          item.group.position.z = Math.max(item.group.position.z, -24.8);
        }

        // ชั้นที่ 3: กำแพงล็อกพิกัดเด็ดขาดรอบฐานเจดีย์และลานวัด (Impenetrable Hard Clamp: Z <= -25.0 ถึง -58.0)
        // วัตถุที่อยู่ตลอดแนวความยาวของฐานวัดและเจดีย์ ห้ามมีพิกัด X อยู่ในเขตฐานเด็ดขาด 100%
        if (item.group.position.z <= -25.0 && item.group.position.z >= -58.0) {
          if (item.group.position.x < 16.0) {
            // ฝั่งตะวันตก (West Wall เลียบฐานเจดีย์): ห้ามเกิน X = -5.5
            if (item.group.position.x > -5.5) {
              item.group.position.x = -5.5;
            }
          } else {
            // ฝั่งตะวันออก (East Wall เลียบลานวัด): ห้ามต่ำกว่า X = 38.5
            if (item.group.position.x < 38.5) {
              item.group.position.x = 38.5;
            }
          }
        }

        // หลบท่าน้ำไม้ฝั่งซ้าย (Grand Pier X <= -11.0, Z ระหว่าง -15.0 ถึง 25.0)
        if (item.group.position.x < -8.5 && item.group.position.z > -15.0 && item.group.position.z < 25.0) {
          item.group.position.x = -8.5;
        }

        // กระจายตัวหลบกระทงใหญ่ ไม่ให้ลอยซ้อนทับกัน
        krathongs.forEach((kMesh) => {
          const cdx = item.group.position.x - kMesh.position.x;
          const cdz = item.group.position.z - kMesh.position.z;
          const cdist = Math.sqrt(cdx * cdx + cdz * cdz);
          if (cdist < 2.8 && cdist > 0.001) {
            item.group.position.x += (cdx / cdist) * 0.08;
            item.group.position.z += (cdz / cdist) * 0.04;
          }
        });

        // เปลวไฟเทียนในถ้วยตะไลกระพริบไหวระยิบระยับ
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

    // 7. Ancient Trees & Realistic Palms Swaying in Wind (กิ่งจามจุรีและยอดทางมะพร้าวพลิ้วไหวตามลม)
    if (this.swayingTrees) {
      this.swayingTrees.forEach((item) => {
        item.group.rotation.z = Math.sin(time * item.speed + item.phase) * 0.05;
        item.group.rotation.x = Math.cos(time * (item.speed * 0.7) + item.phase) * 0.035;
      });
    }

    if (this.swayingPalms) {
      this.swayingPalms.forEach((item) => {
        // ยอดพุ่มมะพร้าวและทางมะพร้าวแกว่งไหวตามกระแสลมเบาๆ
        item.group.rotation.z = Math.sin(time * item.speed + item.phase) * 0.045;
        item.group.rotation.x = Math.cos(time * (item.speed * 0.8) + item.phase) * 0.035;
      });
    }

    // 8. Lotus Blossoms Bobbing on Water (ใบบัวลอยบนผิวน้ำจริง ไม่จม)
    if (this.lotusBlossoms) {
      this.lotusBlossoms.forEach((item) => {
        const padWaterY = this.getWaterHeightAt(item.group.position.x, item.group.position.z, time);
        item.group.position.y = padWaterY + 0.04;
        const { slopeX, slopeZ } = this.getWaterNormalAt(item.group.position.x, item.group.position.z, time);
        item.group.rotation.z = -slopeX * 0.6;
        item.group.rotation.x = slopeZ * 0.6;
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

    // 11. Animated Thai People (คนสวมชุดไทยหลากสี เดินเล่นไม่ทะลุขอบตลิ่ง และลอยกระทงขยับเคลื่อนไหวจริงริมท่าน้ำ)
    if (this.thaiPeople) {
      this.thaiPeople.forEach((char) => {
        if (char.role === "walking") {
          // คำนวณเฟสรอบก้าวเดิน (Walking Cycle เดินทอดน่องช้าๆ อย่างสงบเสงี่ยม)
          char.walkPhase += char.speed * 0.022;
          const phase = char.walkPhase;

          // การแกว่งขาสลับไปมาอย่างเป็นธรรมชาติ
          const legSwing = Math.sin(phase) * 0.38;
          char.lLeg.rotation.x = legSwing;
          char.rLeg.rotation.x = -legSwing;

          // การแกว่งแขนสลับตรงข้ามกับขา
          char.lArm.rotation.x = -legSwing * 0.75;
          char.rArm.rotation.x = legSwing * 0.75;

          // การยกตัวขึ้น-ลงตามจังหวะก้าวเดิน (Vertical Gait Bobbing)
          char.body.position.y = (char.bodyBaseY || 0) + Math.abs(Math.sin(phase)) * 0.028;

          // ชายสไบพลิ้วไหวตามจังหวะก้าว
          if (char.sabaiTail) {
            char.sabaiTail.rotation.x = Math.sin(phase) * 0.08 - 0.05;
          }

          // เคลื่อนที่ไปตามเส้นทางเดินอย่างแช่มช้า (Slow Graceful Walk)
          if (char.axis === "x") {
            char.group.position.x += char.dir * char.speed * 0.010;
            if (char.group.position.x > char.maxPos) {
              char.dir = -1;
              char.group.rotation.y = -Math.PI / 2;
            } else if (char.group.position.x < char.minPos) {
              char.dir = 1;
              char.group.rotation.y = Math.PI / 2;
            }
          } else {
            char.group.position.z += char.dir * char.speed * 0.011;
            if (char.group.position.z > char.maxPos) {
              char.dir = -1;
              char.group.rotation.y = Math.PI;
            } else if (char.group.position.z < char.minPos) {
              char.dir = 1;
              char.group.rotation.y = 0;
            }
          }

          // --- 2. ระบบป้องกันไม่ให้คนเดินทะลุขอบตลิ่งเด็ดขาด (Strict Riverbank Boundary Protection) ---
          if (char.group.position.y > 1.2) {
            // บนทางเดินเลียบแม่น้ำ (Promenade Y = 1.5)
            // ขอบหินกั้นแม่น้ำอยู่ที่ X = -20.0 (ขอบหินกว้างครอบคลุม X: -22.0 ถึง -18.0)
            // บังคับให้อยู่บนทางเดินคนเดิน X: -26.0 ถึง -22.8 ไม่เดินเบียดหรือทะลุขอบหินเด็ดขาด
            if (char.group.position.x > -22.8) {
              char.group.position.x = -22.8;
            }
            if (char.group.position.x < -26.0) {
              char.group.position.x = -26.0;
            }
          } else {
            // บนลานท่าน้ำสีเขียว (Green Pier Y = 0.89)
            // ขอบหินตลิ่งอยู่ฝั่งซ้าย (X <= -18.0) และขอบน้ำ/บันไดอยู่ฝั่งขวา (X >= -13.5)
            // เดินรับลมกลางสนามหญ้าอย่างปลอดภัย X: -17.2 ถึง -15.8 (ไม่เข้าใกล้ขอบหินตลิ่งเด็ดขาด)
            if (char.group.position.x < -17.2) {
              char.group.position.x = -17.2;
            }
            if (char.group.position.x > -15.8) {
              char.group.position.x = -15.8;
            }
            // และขอบเขตด้าน Z ของลานหญ้าท่าน้ำ (Z: 0.2 ถึง 9.8)
            if (char.group.position.z > 9.8) {
              char.group.position.z = 9.8;
              char.dir = -1;
              char.group.rotation.y = Math.PI;
            } else if (char.group.position.z < 0.2) {
              char.group.position.z = 0.2;
              char.dir = 1;
              char.group.rotation.y = 0;
            }
          }
        } else if (char.role === "floating" || char.role === "standing" || char.role === "spectator") {
          // --- 3. แอนิเมชันของคนที่กำลังลอยกระทงริมท่าน้ำ และคนยืนชมวิวริมตลิ่ง ให้มีการเคลื่อนไหวช้า นุ่มนวล สมจริง ---
          const tCycle = time * 0.38 + char.phase;
          const reachForward = Math.cos(tCycle);

          if (char.pose === "releasing_krathong") {
            // หญิงสาว/ชายหนุ่มที่คุกเข่าลอยกระทง:
            // 1. ลำตัวโน้มตัวลงสู่ผิวน้ำ สลับกับยกตัวขึ้นอธิษฐานอย่างนอบน้อม
            if (char.torso) {
              char.torso.rotation.x = 0.28 + reachForward * 0.18;
              char.torso.rotation.z = Math.sin(time * 0.75 + char.phase) * 0.03;
            }

            // 2. แขนทั้งสองข้างยื่นประคองกระทงลงสู่ผิวน้ำ สลับกับยกขึ้นระดับอก
            const armExt = -0.72 + reachForward * 0.22;
            char.lArm.rotation.x = armExt;
            char.rArm.rotation.x = armExt;

            // 3. ศีรษะก้มมองกระทงขณะยื่นลงน้ำ และเงยหน้าขึ้นมองสายน้ำเมื่อยกตัว
            if (char.head) {
              char.head.rotation.x = 0.22 - reachForward * 0.14;
              char.head.rotation.y = Math.sin(time * 0.45 + char.phase) * 0.10;
            }

            // 4. กระทงในมือขยับแตะผิวน้ำและยื่นไปข้างหน้าตามจังหวะโน้มตัว
            if (char.miniKGroup) {
              char.miniKGroup.position.y = 0.42 - reachForward * 0.16;
              char.miniKGroup.position.z = 0.52 + reachForward * 0.14;
              char.miniKGroup.rotation.z = Math.sin(time * 1.1) * 0.03;
            }
          } else if (char.pose === "praying_wai") {
            // คุกเข่าพนมมือไหว้อธิษฐาน:
            // 1. ท่าก้มกราบไหว้อย่างนอบน้อมต่อเนื่อง ช้าๆ
            const bowAngle = Math.sin(time * 0.65 + char.phase) * 0.16;
            if (char.torso) char.torso.rotation.x = 0.20 + Math.max(0, bowAngle);
            if (char.head) {
              char.head.rotation.x = 0.22 + Math.max(0, bowAngle * 1.2);
              char.head.rotation.y = Math.sin(time * 0.35 + char.phase) * 0.20;
            }

            // 2. มือพนมไหว้ยกขึ้น-ลงระหว่างหน้าอกและหน้าผาก
            const handLift = Math.sin(time * 0.65 + char.phase) * 0.10;
            char.lArm.rotation.x = -0.88 - handLift;
            char.rArm.rotation.x = -0.88 - handLift;
          } else if (char.pose === "standing_holding") {
            // ยืนถือกระทงสว่างไสว:
            // 1. ถ่ายเทน้ำหนักตัว โยกตัวซ้าย-ขวาอย่างผ่อนคลาย ช้าๆ
            char.body.position.x = Math.sin(time * 0.45 + char.phase) * 0.03;
            if (char.torso) char.torso.rotation.z = Math.sin(time * 0.45 + char.phase) * 0.025;

            // 2. แขนขวายกขึ้นชี้ชวนมองโคมลอยบนท้องฟ้าและเจดีย์
            char.rArm.rotation.x = -0.75 + Math.sin(time * 0.30 + char.phase) * 0.35;
            char.rArm.rotation.z = -0.35 + Math.cos(time * 0.30 + char.phase) * 0.20;

            // 3. หันมองรอบทิศทาง ชื่นชมบรรยากาศงานลอยกระทงอย่างเนิบช้า
            if (char.head) {
              char.head.rotation.y = Math.sin(time * 0.35 + char.phase) * 0.35;
              char.head.rotation.x = 0.12 + Math.cos(time * 0.35 + char.phase) * 0.12;
            }
          } else if (char.pose === "standing_look") {
            // ยืนชมวิวริมตลิ่ง: หันมองสายน้ำ แหงนมองโคมลอยอย่างสงบ
            char.body.position.x = Math.sin(time * 0.40 + char.phase) * 0.025;
            if (char.torso) char.torso.rotation.z = Math.sin(time * 0.40 + char.phase) * 0.02;
            if (char.head) {
              char.head.rotation.y = Math.sin(time * 0.28 + char.phase) * 0.28;
              char.head.rotation.x = -0.05 + Math.cos(time * 0.30 + char.phase) * 0.10;
            }
          }

          // การหายใจขยับลำตัวอย่างสงบ นุ่มนวล
          const breath = Math.sin(time * 1.2 + char.phase) * 0.015;
          char.body.position.y = (char.bodyBaseY || 0) + breath;

          // เปลวไฟเทียนในกระทงระยิบระยับ
          if (char.miniFlame) {
            const fDance = 0.9 + Math.sin(time * 9.0 + char.phase) * 0.24;
            char.miniFlame.scale.set(fDance, fDance * 1.3, fDance);
          }

          // แสงไฟกะพริบสะท้อนประกายน้ำ
          if (char.candleLight) {
            char.candleLight.intensity = 2.0 + Math.sin(time * 11.0 + char.phase) * 0.7;
          }
        }
      });
    }

    // 11.5 อัปเดตแอนิเมชันโมเดลผู้สมัครสวมชุดไทยบนท่าน้ำ (Waving Hand & Breathing)
    if (this.candidateAvatars) {
      this.candidateAvatars.forEach((avatar) => {
        const aPhase = avatar.phase || 0;
        // แขนขวาโบกมือทักทายอย่างนุ่มนวลและเป็นธรรมชาติ
        if (avatar.wavingArm) {
          avatar.wavingArm.rotation.z = -0.32 + Math.sin(time * 1.5 + aPhase) * 0.02;
        }
        if (avatar.wavingHand) {
          avatar.wavingHand.rotation.z = -0.10 + Math.sin(time * 3.5 + aPhase) * 0.14;
        }
        // ลำตัวหายใจเบาๆ โดยอิงจากระดับความสูงฐานเดิม (basePos.y)
        if (avatar.group) {
          const baseY = avatar.basePos?.y ?? 0.89;
          avatar.group.position.y = baseY + Math.sin(time * 1.5 + aPhase) * 0.008;
        }
      });
    }

    // 12. อัปเดตระบบพลุดอกไม้ไฟ 3D ฟิสิกส์สมจริง 100%
    this.updateFireworks(dt, time);

    // 13. Render
    this.renderer.render(this.scene, this.camera);
  }

  /* ==========================================================
     100% REALISTIC 3D FIREWORKS & PYROTECHNICS SYSTEM
     ระบบพลุดอกไม้ไฟ 3D ฟิสิกส์สมจริงระดับภาพยนตร์
     - จรวดพุ่งทะยานพร้อมประกายไฟและเสียงหวีด
     - แสงวาบ (Flash PointLight) ส่องสว่างท้องฟ้า เจดีย์ และผิวน้ำ
     - สะเก็ดดาวพลุกว่า 180 อนุภาคแตกกระจายตามหลักอากาศพลศาสตร์
     - สุ่มสีสันอัญมณีไทย (ทองคำ, ทับทิม, มรกต, ไพลิน, บุษราคัม, รุ้งราตรี)
     - เสียงระเบิดทุ้มกึกก้องกังวาน (Deep Sub-bass Boom) และเสียงประทุเปรี๊ยะๆ
  ========================================================== */

  createFireworkSparkTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.25, "rgba(255, 245, 215, 0.95)");
    grad.addColorStop(0.55, "rgba(255, 195, 75, 0.45)");
    grad.addColorStop(0.85, "rgba(255, 130, 20, 0.15)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  playFireworkLaunchSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.soundCtx) this.soundCtx = new AudioCtx();
      if (this.soundCtx.state === "suspended") this.soundCtx.resume();
      const ctx = this.soundCtx;
      const now = ctx.currentTime;

      // เสียงจรวดพุ่งหวีดขึ้นสู่ท้องฟ้า (Whistling Rocket Jet)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(260, now);
      filter.frequency.exponentialRampToValueAtTime(860, now + 0.85);
      filter.Q.setValueAtTime(3.5, now);

      const bufSize = ctx.sampleRate * 0.9;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.9);
    } catch (e) {}
  }

  playFireworkBurstSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.soundCtx) this.soundCtx = new AudioCtx();
      if (this.soundCtx.state === "suspended") this.soundCtx.resume();
      const ctx = this.soundCtx;
      const now = ctx.currentTime;

      // 1. เสียงระเบิดทุ้มกึกก้อง (Sub-bass Shockwave Impact 110Hz -> 38Hz)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.42);

      oscGain.gain.setValueAtTime(0.45, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);

      // 2. เสียงกังวานสะท้อนคลื่นน้ำ (Acoustic Echo & Reverberation over River)
      const bufSize = Math.floor(ctx.sampleRate * 2.2);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.04 * white) / 1.04;
        data[i] = last * 2.5;
      }
      const blast = ctx.createBufferSource();
      blast.buffer = buf;

      const blastFilter = ctx.createBiquadFilter();
      blastFilter.type = "lowpass";
      blastFilter.frequency.setValueAtTime(480, now);
      blastFilter.frequency.exponentialRampToValueAtTime(110, now + 1.8);

      const blastGain = ctx.createGain();
      blastGain.gain.setValueAtTime(0.38, now);
      blastGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      blast.connect(blastFilter);
      blastFilter.connect(blastGain);
      blastGain.connect(ctx.destination);
      blast.start(now);
      blast.stop(now + 2.1);
    } catch (e) {}
  }

  // จุดดอกไม้ไฟขึ้นสู่ท้องฟ้า (Callable from UI button)
  launchFirework() {
    if (!this.fireworkTexture) {
      this.fireworkTexture = this.createFireworkSparkTexture();
    }

    this.playFireworkLaunchSound();

    // สุ่มตำแหน่งฐานยิงจากผิวน้ำหรือริมตลิ่ง (กระจายตัวกว้างขวางทั่วท้องน้ำ)
    const startX = -10 + Math.random() * 46;
    const startZ = -60 + Math.random() * 40;
    const startY = 0.5;

    // สุ่มระดับความสูงที่ระเบิดบนท้องฟ้า (Apex Height 42 - 56 เมตร)
    const targetY = 42 + Math.random() * 14;
    const speedY = 32 + Math.random() * 6; // ความเร็วพุ่งขึ้น

    // หางสะเก็ดไฟลากเป็นทางยาว (Rocket Trailing Embers)
    const trailCount = 28;
    const trailGeo = new THREE.BufferGeometry();
    const trailPos = new Float32Array(trailCount * 3);
    const trailCol = new Float32Array(trailCount * 3);

    for (let i = 0; i < trailCount; i++) {
      trailPos[i * 3] = startX;
      trailPos[i * 3 + 1] = startY;
      trailPos[i * 3 + 2] = startZ;

      trailCol[i * 3] = 1.0;
      trailCol[i * 3 + 1] = 0.85;
      trailCol[i * 3 + 2] = 0.4;
    }
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));

    const trailMat = new THREE.PointsMaterial({
      size: 1.8,
      map: this.fireworkTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
    const trailPoints = new THREE.Points(trailGeo, trailMat);
    this.scene.add(trailPoints);

    this.activeFireworks.push({
      type: "rocket",
      pos: new THREE.Vector3(startX, startY, startZ),
      velY: speedY,
      targetY,
      trailPoints,
      trailPos,
      trailCol,
      trailCount,
      history: [],
      age: 0,
    });
  }

  // ระเบิดแตกกระจายกลางเวหา (Multi-stage Burst Explosion)
  detonateFirework(rocket) {
    this.playFireworkBurstSound();
    const burstX = rocket.pos.x;
    const burstY = rocket.pos.y;
    const burstZ = rocket.pos.z;

    // ชุดคู่สีอัญมณีไทยวิจิตรตระการตา (Thai Royal Gemstone Palettes)
    const palettes = [
      { name: "ทองคำวันเพ็ญ (Royal Gold)", primary: 0xfacc15, secondary: 0xf59e0b, spark: 0xffffff, light: 0xffd56b },
      { name: "ทับทิมสยาม (Siam Ruby)", primary: 0xf43f5e, secondary: 0xe11d48, spark: 0xffedd5, light: 0xf43f5e },
      { name: "มรกตไพฑูรย์ (Emerald Jade)", primary: 0x10b981, secondary: 0x059669, spark: 0xd1fae5, light: 0x34d399 },
      { name: "ไพลินฟ้าน้ำเอก (Sapphire Cyan)", primary: 0x06b6d4, secondary: 0x0284c7, spark: 0xe0f2fe, light: 0x38bdf8 },
      { name: "บุษราคัมอำพัน (Amethyst Violet)", primary: 0xd946ef, secondary: 0x8b5cf6, spark: 0xfdf4ff, light: 0xc084fc },
      { name: "ฝอยทองหลั่งไหล (Golden Kamuro)", primary: 0xfbbf24, secondary: 0xd97706, spark: 0xfef08a, light: 0xfbbf24, isWillow: true },
      { name: "รุ้งราตรีเพ็ญ (Rainbow Sparkle)", primary: 0, secondary: 0, spark: 0xffffff, light: 0xffe88a, isRainbow: true },
    ];
    const pal = palettes[Math.floor(Math.random() * palettes.length)];

    // 1. แสงสว่างวาบจำลองจริง (Flash PointLight ส่องสะท้อนเจดีย์และผิวน้ำ)
    const flashLight = new THREE.PointLight(pal.light, 18.0, 150, 1.3);
    flashLight.position.set(burstX, burstY, burstZ);
    this.scene.add(flashLight);

    // 2. สะเก็ดดาวพลุกว่า 180-200 อนุภาค
    const count = pal.isWillow ? 200 : 180;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = [];

    const pColor1 = new THREE.Color(pal.primary);
    const pColor2 = new THREE.Color(pal.secondary);
    const pColorSpark = new THREE.Color(pal.spark);

    const rainbowColors = [
      new THREE.Color(0xf43f5e), new THREE.Color(0xfbbf24),
      new THREE.Color(0x10b981), new THREE.Color(0x06b6d4),
      new THREE.Color(0xa855f7), new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = burstX;
      positions[i * 3 + 1] = burstY;
      positions[i * 3 + 2] = burstZ;

      // กระจายตัวเป็นทรงกลม 3 มิติสมบูรณ์แบบ (Fibonacci Spherical Shell)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const sinPhi = Math.sin(phi);

      const dirX = sinPhi * Math.cos(theta);
      const dirY = Math.cos(phi);
      const dirZ = sinPhi * Math.sin(theta);

      const speed = pal.isWillow
        ? (14.0 + Math.random() * 12.0)
        : (20.0 + Math.random() * 14.0);

      velocities.push({
        x: dirX * speed,
        y: dirY * speed,
        z: dirZ * speed,
      });

      let col = pColor1;
      if (pal.isRainbow) {
        col = rainbowColors[i % rainbowColors.length];
      } else if (i % 3 === 0) {
        col = pColorSpark;
      } else if (i % 2 === 0) {
        col = pColor2;
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: pal.isWillow ? 2.4 : 2.0,
      map: this.fireworkTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
      opacity: 1.0,
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    this.activeFireworks.push({
      type: "burst",
      points,
      positions,
      colors,
      baseColors: Float32Array.from(colors),
      velocities,
      count,
      age: 0,
      maxAge: pal.isWillow ? 3.4 : 2.4,
      isWillow: pal.isWillow || false,
      flashLight,
      flashAge: 0,
    });
  }

  // อัปเดตฟิสิกส์พลุไฟทุกเฟรม (Aerodynamic Drag, Gravity, Color Cooling & Twinkle)
  updateFireworks(dt, time) {
    if (!this.activeFireworks || this.activeFireworks.length === 0) return;

    for (let i = this.activeFireworks.length - 1; i >= 0; i--) {
      const fw = this.activeFireworks[i];

      if (fw.type === "rocket") {
        fw.age += dt;
        fw.pos.y += fw.velY * dt;
        fw.velY -= 9.8 * 0.45 * dt;

        fw.history.unshift(new THREE.Vector3().copy(fw.pos));
        if (fw.history.length > fw.trailCount) fw.history.pop();

        for (let j = 0; j < fw.trailCount; j++) {
          const pt = fw.history[j] || fw.pos;
          const driftX = (Math.random() - 0.5) * 0.16;
          const driftZ = (Math.random() - 0.5) * 0.16;
          fw.trailPos[j * 3] = pt.x + driftX;
          fw.trailPos[j * 3 + 1] = pt.y - j * 0.12;
          fw.trailPos[j * 3 + 2] = pt.z + driftZ;

          const ratio = 1.0 - j / fw.trailCount;
          fw.trailCol[j * 3] = 1.0 * ratio;
          fw.trailCol[j * 3 + 1] = (0.7 + ratio * 0.3) * ratio;
          fw.trailCol[j * 3 + 2] = (0.2 + ratio * 0.6) * ratio;
        }
        fw.trailPoints.geometry.attributes.position.needsUpdate = true;
        fw.trailPoints.geometry.attributes.color.needsUpdate = true;

        // เมื่อถึงจุดสูงสุด (Apex) ให้ระเบิดแตกตัว
        if (fw.pos.y >= fw.targetY || fw.velY <= 3.0) {
          this.scene.remove(fw.trailPoints);
          fw.trailPoints.geometry.dispose();
          fw.trailPoints.material.dispose();
          this.activeFireworks.splice(i, 1);

          this.detonateFirework(fw);
        }
      } else if (fw.type === "burst") {
        fw.age += dt;
        const progress = fw.age / fw.maxAge;

        // แสงสว่างวาบดับลงอย่างรวดเร็ว
        if (fw.flashLight) {
          fw.flashAge += dt;
          if (fw.flashAge < 0.38) {
            fw.flashLight.intensity = Math.max(0, 18.0 * (1.0 - fw.flashAge / 0.38));
          } else {
            this.scene.remove(fw.flashLight);
            fw.flashLight.dispose?.();
            fw.flashLight = null;
          }
        }

        // ฟิสิกส์แรงต้านอากาศและแรงโน้มถ่วง
        const drag = fw.isWillow ? 0.985 : 0.965;
        const gravity = fw.isWillow ? 3.4 : 6.8;

        for (let j = 0; j < fw.count; j++) {
          const v = fw.velocities[j];
          v.x *= drag;
          v.y = v.y * drag - gravity * dt;
          v.z *= drag;

          fw.positions[j * 3] += v.x * dt;
          fw.positions[j * 3 + 1] += v.y * dt;
          fw.positions[j * 3 + 2] += v.z * dt;

          // สะเก็ดไฟกะพริบระยิบระยับ (Twinkle effect)
          const twinkle = Math.sin(time * 30.0 + j * 1.7) * 0.35 + 0.65;
          const fade = Math.max(0, 1.0 - Math.pow(progress, 1.5)) * twinkle;

          fw.colors[j * 3] = fw.baseColors[j * 3] * fade;
          fw.colors[j * 3 + 1] = fw.baseColors[j * 3 + 1] * fade;
          fw.colors[j * 3 + 2] = fw.baseColors[j * 3 + 2] * fade;
        }

        fw.points.geometry.attributes.position.needsUpdate = true;
        fw.points.geometry.attributes.color.needsUpdate = true;
        fw.points.material.opacity = Math.max(0, 1.0 - progress);

        // สิ้นสุดอายุพลุ
        if (fw.age >= fw.maxAge) {
          if (fw.flashLight) {
            this.scene.remove(fw.flashLight);
            fw.flashLight = null;
          }
          this.scene.remove(fw.points);
          fw.points.geometry.dispose();
          fw.points.material.dispose();
          this.activeFireworks.splice(i, 1);
        }
      }
    }
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
    window.removeEventListener("resize", this.handleResize);
    if (this.activeFireworks) {
      this.activeFireworks.forEach((fw) => {
        if (fw.trailPoints) this.scene.remove(fw.trailPoints);
        if (fw.points) this.scene.remove(fw.points);
        if (fw.flashLight) this.scene.remove(fw.flashLight);
      });
      this.activeFireworks = [];
    }
    if (this.soundCtx) {
      try {
        this.soundCtx.close();
      } catch (e) {}
    }
    if (this.renderer?.domElement) {
      if (this.handlePointerDown) {
        this.renderer.domElement.removeEventListener("pointerdown", this.handlePointerDown);
      }
      if (this.handlePointerUp) {
        this.renderer.domElement.removeEventListener("pointerup", this.handlePointerUp);
      }
      if (this.container && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
    }
  }
}
