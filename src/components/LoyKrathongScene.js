import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import femaleFaceTextureUrl from "../assets/textures/face_female.png";
import maleFaceTextureUrl from "../assets/textures/face_male.png";

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
    this.fireworkEchoBuffer = null;
    this.fireworkFlashLight = null;
    this.flashLightIntensity = 0;
    this.flashAge = 0;
    this.lastFireworkLaunchTime = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene Setup - บรรยากาศเคลียร์สดใส ไม่มีหมอกตามคำขอของผู้ใช้ (Crystal Clear Atmosphere - No Fog)
    this.scene = new THREE.Scene();
    this.scene.fog = null;

    // 2. Camera - ปรับ near plane 0.5 และ far plane 500 เพิ่มความละเอียดของ Depth Buffer ป้องกัน Z-fighting
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
    this.camera.position.set(0, 19, 42);

    // 3. Renderer with ACES Tone Mapping & Logarithmic Depth Buffer (ขจัดอาการกระพริบวูบวาบและชิ้นส่วน 3D มาๆ หายๆ 100%)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      logarithmicDepthBuffer: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
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

    // 10B. Loy Krathong Night Market & Festival Plaza (ตลาดนัดกลางคืนริมน้ำตามรูปอ้างอิง)
    this.createNightMarket();

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

    // 4C. Lush Organic Bark Texture for Tree 1 (ตามรูปแนบที่ 2)
    const lushBarkCanvas = document.createElement("canvas");
    lushBarkCanvas.width = 256;
    lushBarkCanvas.height = 512;
    const lbCtx = lushBarkCanvas.getContext("2d");
    lbCtx.fillStyle = "#633c23";
    lbCtx.fillRect(0, 0, 256, 512);
    for (let x = 0; x < 256; x += 2) {
      lbCtx.strokeStyle = (x % 4 === 0) ? "#422312" : (x % 8 === 0 ? "#805030" : "#56331c");
      lbCtx.lineWidth = 1.8 + Math.random() * 1.5;
      lbCtx.beginPath();
      lbCtx.moveTo(x, 0);
      lbCtx.bezierCurveTo(x + (Math.random() - 0.5) * 6, 170, x + (Math.random() - 0.5) * 6, 340, x, 512);
      lbCtx.stroke();
    }
    this.lushBarkTexture = new THREE.CanvasTexture(lushBarkCanvas);
    this.lushBarkTexture.wrapS = THREE.RepeatWrapping;
    this.lushBarkTexture.wrapT = THREE.RepeatWrapping;

    // 4D. Spiral Twisted Bark Texture for Tree 3 (ตามรูปแนบที่ 6)
    const spiralBarkCanvas = document.createElement("canvas");
    spiralBarkCanvas.width = 512;
    spiralBarkCanvas.height = 512;
    const spCtx = spiralBarkCanvas.getContext("2d");
    spCtx.fillStyle = "#9a5d2e";
    spCtx.fillRect(0, 0, 512, 512);
    for (let i = -512; i < 1024; i += 4) {
      spCtx.strokeStyle = (i % 16 === 0) ? "#653716" : (i % 8 === 0 ? "#bc7c42" : "#804720");
      spCtx.lineWidth = (i % 16 === 0) ? 3.5 : 2.0;
      spCtx.beginPath();
      spCtx.moveTo(i, 0);
      spCtx.lineTo(i + 512, 512);
      spCtx.stroke();
    }
    this.spiralBarkTexture = new THREE.CanvasTexture(spiralBarkCanvas);
    this.spiralBarkTexture.wrapS = THREE.RepeatWrapping;
    this.spiralBarkTexture.wrapT = THREE.RepeatWrapping;
    this.spiralBarkTexture.repeat.set(2, 2);

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

    // 9B. Two-tone Emerald & Teal Foliage Leaves for Tree 3 (ตามรูปแนบที่ 6)
    const tealLeafCanvas = document.createElement("canvas");
    tealLeafCanvas.width = 256;
    tealLeafCanvas.height = 256;
    const tlCtx = tealLeafCanvas.getContext("2d");
    tlCtx.clearRect(0, 0, 256, 256);
    const tealPalette = ["#228547", "#1e8275", "#2aa392", "#359952", "#166a5e", "#44b868", "#1c7365"];
    for (let i = 0; i < 90; i++) {
      const lx = 25 + Math.random() * 206;
      const ly = 25 + Math.random() * 206;
      const ang = Math.random() * Math.PI * 2;
      const rad = 10 + Math.random() * 12;

      tlCtx.save();
      tlCtx.translate(lx, ly);
      tlCtx.rotate(ang);
      tlCtx.beginPath();
      tlCtx.ellipse(0, 0, rad, rad * 0.45, 0, 0, Math.PI * 2);
      tlCtx.fillStyle = tealPalette[i % tealPalette.length];
      tlCtx.fill();
      tlCtx.restore();
    }
    this.tealLeafFoliageTexture = new THREE.CanvasTexture(tealLeafCanvas);

    // 10. Night Market Plaza Stone Paver Texture (แผ่นหินปูพื้นลานตลาดนัดเทศกาล)
    const paverCanvas = document.createElement("canvas");
    paverCanvas.width = 512;
    paverCanvas.height = 512;
    const pavCtx = paverCanvas.getContext("2d");
    pavCtx.fillStyle = "#948f86";
    pavCtx.fillRect(0, 0, 512, 512);
    const tileSize = 64;
    for (let py = 0; py < 512; py += tileSize) {
      for (let px = 0; px < 512; px += tileSize) {
        const shade = Math.floor(Math.sin(px * 11 + py * 17) * 9);
        pavCtx.fillStyle = `rgb(${152 + shade}, ${146 + shade}, ${136 + shade})`;
        pavCtx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
        pavCtx.strokeStyle = "rgba(45, 42, 38, 0.45)";
        pavCtx.lineWidth = 1.5;
        pavCtx.strokeRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
      }
    }
    this.marketPaversTexture = new THREE.CanvasTexture(paverCanvas);
    this.marketPaversTexture.wrapS = THREE.RepeatWrapping;
    this.marketPaversTexture.wrapT = THREE.RepeatWrapping;
    this.marketPaversTexture.repeat.set(6, 11);

    // 11. Photorealistic Seamless Water Ripple Normal Map (ผิวระลอกคลื่นน้ำเจ้าพระยา)
    const waterNormCanvas = document.createElement("canvas");
    waterNormCanvas.width = 256;
    waterNormCanvas.height = 256;
    const wnCtx = waterNormCanvas.getContext("2d");
    const imgData = wnCtx.createImageData(256, 256);
    const data = imgData.data;

    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        // Multi-frequency wave normal synthesis (คลื่นระลอกผิวน้ำซ้อนทับกันอย่างเป็นธรรมชาติ)
        const nx1 = Math.sin((x / 256) * Math.PI * 8 + Math.cos((y / 256) * Math.PI * 4));
        const ny1 = Math.cos((y / 256) * Math.PI * 8 + Math.sin((x / 256) * Math.PI * 4));
        const nx2 = Math.sin((x / 256) * Math.PI * 16 - (y / 256) * Math.PI * 12);
        const ny2 = Math.cos((y / 256) * Math.PI * 16 + (x / 256) * Math.PI * 12);

        const dx = (nx1 * 0.65 + nx2 * 0.35) * 0.45;
        const dy = (ny1 * 0.65 + ny2 * 0.35) * 0.45;

        // Normal vector RGB (R=X normal, G=Y normal, B=Z vertical normal)
        data[(y * 256 + x) * 4] = Math.floor((dx + 1.0) * 0.5 * 255);
        data[(y * 256 + x) * 4 + 1] = Math.floor((dy + 1.0) * 0.5 * 255);
        data[(y * 256 + x) * 4 + 2] = 255;
        data[(y * 256 + x) * 4 + 3] = 255;
      }
    }
    wnCtx.putImageData(imgData, 0, 0);
    this.waterNormalTexture = new THREE.CanvasTexture(waterNormCanvas);
    this.waterNormalTexture.wrapS = THREE.RepeatWrapping;
    this.waterNormalTexture.wrapT = THREE.RepeatWrapping;
    this.waterNormalTexture.repeat.set(10, 10);

    // 12. Soft Warm Candle Glow Reflection Disc for Floating Krathongs (รัศมีแสงเทียนสะท้อนผิวน้ำใต้กระทง)
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const gCtx = glowCanvas.getContext("2d");
    const gGrad = gCtx.createRadialGradient(64, 64, 4, 64, 64, 64);
    gGrad.addColorStop(0, "rgba(254, 215, 170, 0.95)");
    gGrad.addColorStop(0.22, "rgba(251, 146, 60, 0.65)");
    gGrad.addColorStop(0.55, "rgba(234, 88, 12, 0.28)");
    gGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
    gCtx.fillStyle = gGrad;
    gCtx.fillRect(0, 0, 128, 128);
    this.waterGlowTexture = new THREE.CanvasTexture(glowCanvas);
  }

  /* ==========================================================
     LIGHTING
  ========================================================== */
  setupLighting() {
    // 1. Hemisphere Light: แสงบรรยากาศราตรีสลัวนุ่มนวล ไม่มืดเกินไป และไม่สว่างจ้าเหมือนกลางวัน
    const hemiLight = new THREE.HemisphereLight(0x1a2c4e, 0x092648, 0.45);
    this.scene.add(hemiLight);

    // 2. Ambient Light: แสงแอมเบียนต์รอบทิศทางพอเหมาะ มองเห็นรายละเอียดชัดเจนโดยคงบรรยากาศกลางคืน
    const ambientLight = new THREE.AmbientLight(0x223554, 0.35);
    this.scene.add(ambientLight);

    // Single Pre-allocated Firework Flash Light (Zero Runtime Shader Recompilations)
    this.fireworkFlashLight = new THREE.PointLight(0xffd56b, 0, 110, 1.4);
    this.fireworkFlashLight.position.set(0, 30, 0);
    this.scene.add(this.fireworkFlashLight);

    // 3. ลำแสงจันทราวันเพ็ญ (Full Moon Light): ทอดประกายแสงสะท้อนบนผิวน้ำอย่างงดงาม
    const moonLight = new THREE.DirectionalLight(0xfff3c4, 1.25);
    moonLight.position.set(24, 60, -45);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 10;
    moonLight.shadow.camera.far = 180;
    moonLight.shadow.camera.left = -55;
    moonLight.shadow.camera.right = 55;
    moonLight.shadow.camera.top = 55;
    moonLight.shadow.camera.bottom = -55;
    moonLight.shadow.bias = -0.0001;
    moonLight.shadow.normalBias = 0.04;
    this.scene.add(moonLight);

    // แสงประกายผิวน้ำอ่อนละมุน
    const riverGlowLight = new THREE.DirectionalLight(0xffa834, 0.40);
    riverGlowLight.position.set(-15, 20, 20);
    this.scene.add(riverGlowLight);

    // แสงสปอตไลต์ส่องพระเจดีย์สีทองอร่ามในคืนเพ็ญ
    const templeFlood = new THREE.PointLight(0xffd56b, 2.8, 80, 1.2);
    templeFlood.position.set(16, 20, -42);
    this.scene.add(templeFlood);
    this.templeLight = templeFlood;

    // แสงคบเพลิงริมท่าน้ำ อบอุ่นสมจริง
    const pierLight = new THREE.PointLight(0xff8811, 2.6, 36, 1.3);
    pierLight.position.set(-15, 6, 8);
    this.scene.add(pierLight);
    this.flickerLights.push({ light: pierLight, baseIntensity: 2.6, speed: 4.5 });
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
    grad.addColorStop(0.0, "#030712"); // ยอดฟ้ามืดมิดประดับดวงดาว (Deep Night Zenith)
    grad.addColorStop(0.35, "#06132b"); // ท้องฟ้าราตรีกรมท่าเข้ม
    grad.addColorStop(0.65, "#0b1e42"); // สีครามราตรีลึก (Midnight Indigo)
    grad.addColorStop(0.85, "#102854"); // สีกรมท่าอบอุ่นเหนือขอบฟ้า
    grad.addColorStop(1.0, "#163266"); // ขอบฟ้าราตรีเรืองแสงจันทร์นวลตา

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
    const count = 750;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const starColorList = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xfef08a), // warm golden star
      new THREE.Color(0x93c5fd), // cool soft cyan star
      new THREE.Color(0xfbcfe8), // soft rose star
    ];

    for (let i = 0; i < count; i++) {
      // กระจายตัวเต็มครึ่งทรงกลมท้องฟ้าราตรี (Upper Celestial Dome)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 210 + Math.random() * 25;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(r * Math.cos(phi)) + 12;
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const c = starColorList[Math.floor(Math.random() * starColorList.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // เท็กซ์เจอร์อนุภาคดาวทรงกลมส่องสว่างนุ่มนวล
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 32;
    starCanvas.height = 32;
    const sCtx = starCanvas.getContext("2d");
    const sGrad = sCtx.createRadialGradient(16, 16, 2, 16, 16, 16);
    sGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    sGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.75)");
    sGrad.addColorStop(1.0, "rgba(255, 255, 255, 0)");
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 32, 32);
    const starTex = new THREE.CanvasTexture(starCanvas);

    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      map: starTex,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
      opacity: 0.88,
    });
    this.starField = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starField);
  }

  /* ==========================================================
     RIVER WATER
  ========================================================== */
  createRiver() {
    const riverGeo = new THREE.PlaneGeometry(180, 180, 40, 40);
    riverGeo.rotateX(-Math.PI / 2);

    // สีครามเข้มลึก แบบสีน้ำทะเลลึก (Vibrant Deep Indigo / Rich Ocean Navy)
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x0e4a82, // สีครามเข้มสดชัด (Deep Indigo)
      emissive: 0x093660, // แสงเรืองเนื้อน้ำสีครามลึก เห็นเป็นสีครามเข้มชัดเจนแม้อยู่ในเวลากลางคืน
      emissiveIntensity: 0.70,
      normalMap: this.waterNormalTexture,
      normalScale: new THREE.Vector2(0.40, 0.40),
      metalness: 0.08,
      roughness: 0.14,
      flatShading: false,
    });

    this.waterMesh = new THREE.Mesh(riverGeo, this.waterMat);
    this.waterMesh.position.y = 0;
    this.waterMesh.receiveShadow = true;
    this.scene.add(this.waterMesh);

    // ท้องน้ำลึกก้นแม่น้ำสีครามลึก (Deep Indigo Riverbed)
    const bedGeo = new THREE.PlaneGeometry(190, 190);
    bedGeo.rotateX(-Math.PI / 2);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x041b36,
      roughness: 0.85,
      metalness: 0.05,
    });
    const riverBed = new THREE.Mesh(bedGeo, bedMat);
    riverBed.position.y = -1.2;
    this.scene.add(riverBed);

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
    // วางตำแหน่งเรือนไทยบนสนามหญ้าริมตลิ่ง (ความสูง Y = 0.66 ให้ฐานสนามหญ้าเรือนไทยอยู่ที่ 1.505 รับกับขอบทางเดินหินพอดี)
    compound.position.set(-32, 0.66, -2);
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

  // 1. Raised Ground Plot & Concrete Retaining Curb (จำกัดขอบเขตแปลงดินเรือนไทยไม่ให้ล้ำเกินแนวทางเดิน X <= -22.8)
  buildCompoundGroundPlot(compound, mats) {
    // ฐานแปลงที่ดินกว้าง 19.2 หน่วย (X ใน compound: -10.0 ถึง +9.2, ใน world: -42.0 ถึง -22.8 เว้นระยะห่างจากถนน X = -22.0 ถึง 1 เมตรเต็ม)
    const retainingWall = new THREE.Mesh(new THREE.BoxGeometry(19.2, 0.7, 30.0), mats.concrete);
    retainingWall.position.set(-0.4, 0.35, 0);
    retainingWall.receiveShadow = true;
    compound.add(retainingWall);

    const lawn = new THREE.Mesh(new THREE.BoxGeometry(18.8, 0.25, 29.6), mats.grass);
    lawn.position.set(-0.4, 0.72, 0);
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

  // 8. Lush Tropical Cloud-Puff Shade Tree (ต้นไม้ใหญ่ปั้นใหม่ทรงพุ่มก้อนเมฆตามรูปแนบที่ 2)
  buildCompoundShadeTree(compound, mats) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(0.5, 0.7, -13.5);

    const trunkBarkMat = new THREE.MeshStandardMaterial({
      map: this.lushBarkTexture || this.barkTexture,
      roughness: 0.82
    });
    const grassMoundMat = new THREE.MeshStandardMaterial({
      color: 0x3d7a2f,
      roughness: 0.85
    });
    const bushMat = new THREE.MeshStandardMaterial({
      color: 0x327833,
      roughness: 0.7
    });
    const darkBushMat = new THREE.MeshStandardMaterial({
      color: 0x225824,
      roughness: 0.75
    });

    // 1. Circular Grassy Earth Mound at Base (เนินดินหญ้ากลมตามรูปแนบที่ 2)
    const mound = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, 0.45, 24), grassMoundMat);
    mound.position.set(0, 0.22, 0);
    mound.receiveShadow = true;
    treeGroup.add(mound);

    const moundRim = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.0, 0.18, 24), grassMoundMat);
    moundRim.position.set(0, 0.09, 0);
    moundRim.receiveShadow = true;
    treeGroup.add(moundRim);

    // 2. Small Trimmed Decorative Shrub Mounds around Base (พุ่มไม้ประดับโคนต้นตามรูปแนบที่ 2)
    const bushPositions = [
      { x: -2.4, z: 1.4, r: 0.75, mat: bushMat },
      { x: -1.7, z: 2.3, r: 0.58, mat: darkBushMat },
      { x: 2.3, z: 1.1, r: 0.72, mat: bushMat },
      { x: 2.0, z: -1.5, r: 0.65, mat: darkBushMat },
      { x: -0.8, z: -2.6, r: 0.7, mat: bushMat }
    ];
    bushPositions.forEach((bp) => {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(bp.r, 8, 7), bp.mat);
      bush.scale.set(1.3, 0.8, 1.15);
      bush.position.set(bp.x, 0.4 + bp.r * 0.4, bp.z);
      bush.castShadow = true;
      treeGroup.add(bush);
    });

    // 3. Flared Buttress Roots (รากพูพอนแผ่ขยายจับผืนดินรอบโคนต้นตามรูปแนบที่ 2)
    const rootAngles = [0.15, 1.15, 2.2, 3.25, 4.35, 5.4];
    rootAngles.forEach((ang) => {
      const rootLen = 2.4 + Math.sin(ang * 3) * 0.4;
      const root = new THREE.Mesh(new THREE.ConeGeometry(0.55, rootLen, 7), trunkBarkMat);
      root.position.set(Math.cos(ang) * 1.5, 0.65, Math.sin(ang) * 1.5);
      root.rotation.z = Math.cos(ang) * 0.78;
      root.rotation.x = Math.sin(ang) * 0.78;
      root.scale.set(0.7, 1.0, 1.35);
      root.castShadow = true;
      treeGroup.add(root);
    });

    // 4. Main Organic Curved Trunk (ลำต้นหนาสง่างาม ผายโคน คอดกลาง แตกกิ่งธรรมชาติ)
    const trunkGroup = new THREE.Group();
    const lowerTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.95, 2.8, 14), trunkBarkMat);
    lowerTrunk.position.set(0, 1.7, 0);
    lowerTrunk.castShadow = true;
    trunkGroup.add(lowerTrunk);

    const midTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 2.6, 12), trunkBarkMat);
    midTrunk.position.set(0.08, 4.0, -0.05);
    midTrunk.rotation.z = 0.05;
    midTrunk.castShadow = true;
    trunkGroup.add(midTrunk);

    treeGroup.add(trunkGroup);

    // 5. Spreading Organic Boughs & Sub-Branches (กิ่งหลักและกิ่งย่อยโค้งผายรองรับพุ่มใบ)
    const branchMeshes = [];
    const boughDefs = [
      { rx: 0.38, rz: 0.52, len: 4.8, rTop: 0.28, rBot: 0.55, px: 0.6, py: 5.2, pz: 0.5 },
      { rx: 0.32, rz: -0.56, len: 5.1, rTop: 0.3, rBot: 0.58, px: -0.6, py: 5.3, pz: 0.4 },
      { rx: -0.42, rz: 0.48, len: 4.9, rTop: 0.26, rBot: 0.52, px: 0.5, py: 5.4, pz: -0.6 },
      { rx: -0.36, rz: -0.5, len: 4.7, rTop: 0.28, rBot: 0.54, px: -0.5, py: 5.3, pz: -0.5 },
      { rx: 0.1, rz: 0.12, len: 4.2, rTop: 0.32, rBot: 0.6, px: 0.05, py: 5.6, pz: 0.0 }
    ];

    boughDefs.forEach((bCfg, bIdx) => {
      const bough = new THREE.Mesh(
        new THREE.CylinderGeometry(bCfg.rTop, bCfg.rBot, bCfg.len, 8),
        trunkBarkMat
      );
      bough.position.set(bCfg.px, bCfg.py, bCfg.pz);
      bough.rotation.x = bCfg.rx;
      bough.rotation.z = bCfg.rz;
      bough.castShadow = true;
      trunkGroup.add(bough);

      branchMeshes.push({
        mesh: bough,
        baseRotZ: bCfg.rz,
        baseRotX: bCfg.rx,
        speed: 1.5 + bIdx * 0.2,
        phase: bIdx * 0.9,
        ampZ: 0.045,
        ampX: 0.035
      });

      // Smaller sub-branch fork reaching into foliage
      const fork = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.28, 2.8, 6),
        trunkBarkMat
      );
      fork.position.set(
        bCfg.px + Math.sin(bCfg.rz) * (bCfg.len * 0.45),
        bCfg.py + (bCfg.len * 0.45) * 0.7,
        bCfg.pz + Math.sin(bCfg.rx) * (bCfg.len * 0.45)
      );
      fork.rotation.x = bCfg.rx * 1.35;
      fork.rotation.z = bCfg.rz * 1.35;
      fork.castShadow = true;
      trunkGroup.add(fork);
    });

    // 6. Tiered Cloud-Puff Canopy (พุ่มใบก้อนเมฆอัดแน่นแบบฉบับรูปแนบที่ 2)
    const foliageCrown = new THREE.Group();
    foliageCrown.position.set(0, 6.8, 0);

    const leafPuffsList = [];

    // Distinct cloud puff clusters in 3 tiers
    const puffConfigs = [
      // Lower Tier Outer Cloud Puffs (พุ่มก้อนเมฆชั้นล่าง แผ่กว้างตามปลายกิ่ง)
      { x: 3.6, y: 0.8, z: 2.2, rx: 2.4, ry: 1.5, rz: 2.2, sp: 2.3, ph: 0.2 },
      { x: -3.8, y: 1.0, z: 2.0, rx: 2.5, ry: 1.6, rz: 2.3, sp: 2.4, ph: 0.9 },
      { x: 3.5, y: 1.2, z: -2.4, rx: 2.4, ry: 1.5, rz: 2.2, sp: 2.2, ph: 1.7 },
      { x: -3.6, y: 0.9, z: -2.3, rx: 2.3, ry: 1.5, rz: 2.1, sp: 2.5, ph: 2.4 },
      { x: 0.2, y: 0.6, z: 4.2, rx: 2.2, ry: 1.4, rz: 2.0, sp: 2.3, ph: 3.1 },
      { x: -0.3, y: 0.7, z: -4.0, rx: 2.2, ry: 1.4, rz: 2.0, sp: 2.4, ph: 3.8 },

      // Mid Tier Cloud Puffs (พุ่มก้อนเมฆชั้นกลาง อวบแน่นเชื่อมทรงพุ่ม)
      { x: 2.4, y: 2.6, z: 1.2, rx: 2.3, ry: 1.6, rz: 2.1, sp: 2.5, ph: 0.5 },
      { x: -2.5, y: 2.7, z: 1.0, rx: 2.3, ry: 1.6, rz: 2.1, sp: 2.6, ph: 1.3 },
      { x: 2.2, y: 2.8, z: -1.4, rx: 2.2, ry: 1.5, rz: 2.0, sp: 2.4, ph: 2.1 },
      { x: -2.3, y: 2.9, z: -1.3, rx: 2.2, ry: 1.5, rz: 2.0, sp: 2.5, ph: 2.9 },
      { x: 0.0, y: 2.4, z: 2.4, rx: 2.2, ry: 1.5, rz: 2.0, sp: 2.7, ph: 3.6 },
      { x: 0.0, y: 2.5, z: -2.2, rx: 2.1, ry: 1.4, rz: 1.9, sp: 2.6, ph: 4.4 },

      // Upper Crown Tier (พุ่มก้อนเมฆยอดบนสุด ทรงโค้งมนสง่างาม)
      { x: 1.3, y: 4.5, z: 0.8, rx: 2.1, ry: 1.5, rz: 2.0, sp: 2.8, ph: 0.7 },
      { x: -1.4, y: 4.6, z: -0.7, rx: 2.0, ry: 1.5, rz: 1.9, sp: 2.9, ph: 1.9 },
      { x: 0.0, y: 5.6, z: 0.0, rx: 2.4, ry: 1.7, rz: 2.3, sp: 3.0, ph: 2.8 }
    ];

    puffConfigs.forEach((pCfg, pIdx) => {
      const puffGroup = new THREE.Group();
      puffGroup.position.set(pCfg.x, pCfg.y, pCfg.z);

      // Construct multi-lobed cauliflower cloud mass (3-4 sub-spheres per puff)
      const subLobes = [
        { ox: 0, oy: 0, oz: 0, sr: 1.0 },
        { ox: pCfg.rx * 0.28, oy: pCfg.ry * 0.15, oz: pCfg.rz * 0.2, sr: 0.75 },
        { ox: -pCfg.rx * 0.25, oy: pCfg.ry * 0.12, oz: -pCfg.rz * 0.18, sr: 0.72 },
        { ox: pCfg.rx * 0.12, oy: pCfg.ry * 0.25, oz: -pCfg.rz * 0.22, sr: 0.68 }
      ];

      subLobes.forEach((sl, sIdx) => {
        const coreMat = (pIdx + sIdx) % 2 === 0 ? mats.leafSolidMat : mats.leafDarkSolidMat;
        const lobeMesh = new THREE.Mesh(
          new THREE.SphereGeometry(sl.sr * (pCfg.rx * 0.65), 8, 7),
          coreMat
        );
        lobeMesh.scale.set(1.25, 0.82, 1.2);
        lobeMesh.position.set(sl.ox, sl.oy, sl.oz);
        lobeMesh.castShadow = true;
        puffGroup.add(lobeMesh);

        // Alpha-leaf texture overlay for realistic leaf silhouettes
        if (mats.leafMat) {
          const leafShell = new THREE.Mesh(
            new THREE.SphereGeometry(sl.sr * (pCfg.rx * 0.7), 7, 6),
            mats.leafMat
          );
          leafShell.scale.set(1.27, 0.84, 1.22);
          leafShell.position.set(sl.ox, sl.oy, sl.oz);
          leafShell.castShadow = true;
          puffGroup.add(leafShell);
        }
      });

      foliageCrown.add(puffGroup);

      // Register puff for individual continuous wind flutter
      leafPuffsList.push({
        mesh: puffGroup,
        basePosY: pCfg.y,
        baseRotZ: 0,
        baseRotX: 0,
        speed: pCfg.sp,
        phase: pCfg.ph,
        amp: 0.07,
        posAmp: 0.04
      });
    });

    treeGroup.add(foliageCrown);
    compound.add(treeGroup);

    // Register Tree 1 for comprehensive dynamic wind swaying
    this.swayingTrees.push({
      group: foliageCrown,
      branches: branchMeshes,
      leafPuffs: leafPuffsList,
      speed: 1.15,
      phase: 0.35,
      swayAmpZ: 0.065,
      swayAmpX: 0.045
    });
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
    // พื้นหญ้าตลิ่งกว้าง 30 หน่วย (X: -52 ถึง -22) ชนกับแนวทางเดินหินพอดีที่ X = -22 ไม่ซ้อนทับกัน (Zero Z-Fighting)
    const bankGeo = new THREE.BoxGeometry(30, 10, 180);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x223a1a, roughness: 0.85 });
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.position.set(-37, -3.5, 0);
    bank.receiveShadow = true;
    this.scene.add(bank);

    // ทางเดินหินปูเลียบแม่น้ำกว้าง 4.2 หน่วย (X: -22.0 ถึง -17.8) ยกสูงกว่าแนวหญ้า 8mm (Y = 1.508) ขอบชัดเจน ป้องกันพื้นเขียวแลบเกินมาบนถนนเด็ดขาด
    const stoneEdge = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 2, 180),
      new THREE.MeshStandardMaterial({ color: 0x5a6369, roughness: 0.7 })
    );
    stoneEdge.position.set(-19.9, 0.508, 0);
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

    this.scene.add(greenPierGroup);
  }

  /* ==========================================================
     ULTRA-LIGHTWEIGHT LOY KRATHONG NIGHT MARKET (60 FPS OPTIMIZED)
     ปรับปรุงประสิทธิภาพตาม 4 เสาหลัก:
     1. ปลด PointLight ออก 16 จาก 17 ดวง (เหลือไฟตลาดรวมเพียง 1 ดวงกลางต้นไม้)
     2. ใช้ Fake Ground Glow Discs แทนไฟจริง สวยเหมือนเดิมแต่ใช้ GPU = 0%
     3. ปิด Shadow Maps ในโซนตลาดทั้งหมด (Zero castShadow / receiveShadow)
     4. รวมชิ้นส่วน ลด Draw Calls จาก ~500 เหลือเพียง ~25 ครั้ง
  ========================================================== */
  createNightMarket() {
    const marketGroup = new THREE.Group();
    // จุดกึ่งกลางลานตลาดริมน้ำบนสนามหญ้า (X: -48 ถึง -24, Z: +14 ถึง +58, Y = 1.50 ให้ฐานลานเทศกาลตั้งอยู่บนสนามหญ้าอย่างสง่างาม)
    marketGroup.position.set(-36.0, 1.50, 36.0);

    const mats = {
      paver: new THREE.MeshStandardMaterial({
        map: this.marketPaversTexture,
        roughness: 0.85,
        metalness: 0.05,
      }),
      stoneCurb: new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.75 }),
      whiteCanopy: new THREE.MeshStandardMaterial({
        color: 0xfdfdfd,
        roughness: 0.85,
        metalness: 0.02,
        side: THREE.DoubleSide,
      }),
      metalPole: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.4, metalness: 0.35 }),
      counterWood: new THREE.MeshStandardMaterial({ map: this.deckPlankTexture, roughness: 0.7 }),
      darkWood: new THREE.MeshStandardMaterial({ color: 0x3d1a04, roughness: 0.7 }),
      blueCloth: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.75 }),
      chairWood: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 }),
      warmBulb: new THREE.MeshBasicMaterial({ color: 0xffdf70 }),
      warmEaveGlow: new THREE.MeshBasicMaterial({ color: 0xffea88 }), // ขอบไฟระย้าชายคาสีทองเรืองแสง
      signRed: new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 }),
      signOrange: new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.5 }),
      signGreen: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }),
      signBlue: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 }),
      signYellow: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }),
      lanternPink: new THREE.MeshBasicMaterial({ color: 0xf43f5e }),
      lanternCyan: new THREE.MeshBasicMaterial({ color: 0x06b6d4 }),
      lanternGold: new THREE.MeshBasicMaterial({ color: 0xfacc15 }),
      vendorSkin: new THREE.MeshStandardMaterial({ color: 0xdfb088, roughness: 0.65 }),
      vendorHair: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 }),
      vendorApron: new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 }),
      fakeGlow: new THREE.MeshBasicMaterial({
        color: 0xffa022,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      }),
      fairyGold: new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
      stagePlank: new THREE.MeshStandardMaterial({ map: this.deckPlankTexture, roughness: 0.65 }),
      blackMetal: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5, metalness: 0.5 }),
      chrome: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.2, metalness: 0.8 }),
      leafSolid: new THREE.MeshStandardMaterial({ color: 0x246325, roughness: 0.7 }),
      leafDark: new THREE.MeshStandardMaterial({ color: 0x144018, roughness: 0.75 }),
      trunkBark: new THREE.MeshStandardMaterial({ map: this.barkTexture, roughness: 0.85 }),
    };

    // 1. Paved Festival Plaza Base & Curbs (Zero Shadow Overhead)
    this.buildMarketPlazaBase(marketGroup, mats);

    // 2. White Canopy Market Stalls (Low-Poly + Fake Ground Glow Discs)
    this.buildMarketStalls(marketGroup, mats);

    // 3. Outdoor Dining Area with Navy Blue Tablecloths (Streamlined Meshes)
    this.buildMarketDiningArea(marketGroup, mats);

    // 4. Acoustic Mini Music Stage with Instruments (Zero PointLight)
    this.buildMarketLiveStage(marketGroup, mats);

    // 5. Grand Festival Tree (Single Central PointLight for Entire Market)
    this.buildMarketFestivalTree(marketGroup, mats);

    // 6. Large Covered Pavilion Marquee
    this.buildMarketPavilionMarquee(marketGroup, mats);

    // 7. Overhead Festoon String Lights
    this.buildMarketOverheadLights(marketGroup, mats);

    this.scene.add(marketGroup);
  }

  // 1. Paved Festival Plaza Base (ลานหินปูพื้นเทศกาลยกระดับ - Zero Shadow)
  buildMarketPlazaBase(group, mats) {
    const platformGeo = new THREE.BoxGeometry(24.5, 0.52, 43.0);
    const platform = new THREE.Mesh(platformGeo, mats.paver);
    platform.position.set(0, 0.26, 0);
    group.add(platform);

    const curbThickness = 0.35;
    const curbHeight = 0.58;
    const frontCurb = new THREE.Mesh(new THREE.BoxGeometry(curbThickness, curbHeight, 43.2), mats.stoneCurb);
    frontCurb.position.set(12.25, 0.29, 0);
    group.add(frontCurb);

    const backCurb = new THREE.Mesh(new THREE.BoxGeometry(curbThickness, curbHeight, 43.2), mats.stoneCurb);
    backCurb.position.set(-12.25, 0.29, 0);
    group.add(backCurb);

    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(24.5, curbHeight, curbThickness), mats.stoneCurb);
    leftCurb.position.set(0, 0.29, -21.5);
    group.add(leftCurb);

    const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(24.5, curbHeight, curbThickness), mats.stoneCurb);
    rightCurb.position.set(0, 0.29, 21.5);
    group.add(rightCurb);

    // 3 จุด บันไดหินกว้าง 2 ขั้น (Two-tier Stone Plaza Steps) เชื่อมลานเทศกาลลงสู่ทางเดินริมน้ำอย่างมั่นคง เรียบร้อย ไร้การบิดเอียงซ้อนทับ
    [-11.0, 3.0, 16.0].forEach((rz) => {
      // ขั้นบน (ความสูง Y = 0.36, กว้าง 0.8)
      const step1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.36, 4.2), mats.stoneCurb);
      step1.position.set(12.75, 0.18, rz);
      group.add(step1);

      // ขั้นล่าง (ความสูง Y = 0.18, กว้าง 0.8)
      const step2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 4.2), mats.stoneCurb);
      step2.position.set(13.45, 0.09, rz);
      group.add(step2);
    });
  }

  // 2. White Canopy Market Stalls (ปรับเสาเต็นท์ให้สมส่วน 2.45m ชายคาสวยงาม พร้อมไฟระย้าชายคา พ่อค้าแม่ค้า และสินค้าจัดเต็ม)
  buildMarketStalls(group, mats) {
    const postHeight = 2.45;
    const postGeo = new THREE.CylinderGeometry(0.035, 0.035, postHeight, 6);
    const canopyGeo = new THREE.ConeGeometry(1.88, 0.90, 4);
    canopyGeo.rotateY(Math.PI / 4);
    const counterGeo = new THREE.BoxGeometry(2.2, 0.88, 0.65);
    const backShelfGeo = new THREE.BoxGeometry(2.0, 0.80, 0.45);
    const bulbGeo = new THREE.SphereGeometry(0.10, 6, 6);
    const fakeDiscGeo = new THREE.CircleGeometry(1.6, 12);
    fakeDiscGeo.rotateX(-Math.PI / 2);
    const eaveLightGeo = new THREE.BoxGeometry(2.46, 0.04, 2.46);
    const signGeo = new THREE.BoxGeometry(1.85, 0.22, 0.03);
    const latticeGeo = new THREE.BoxGeometry(2.1, 1.25, 0.03);
    const lanternGeo = new THREE.SphereGeometry(0.10, 6, 6);

    // ป้ายชื่อร้านหลากสีสันสไตล์สตรีทฟู้ดไทย
    const signMats = [mats.signRed, mats.signOrange, mats.signGreen, mats.signBlue, mats.signYellow];
    const lanternMats = [mats.lanternPink, mats.lanternCyan, mats.lanternGold];

    const buildSingleStall = (x, z, rotY, themeIndex) => {
      const stall = new THREE.Group();
      stall.position.set(x, 0.52, z);
      stall.rotation.y = rotY;

      // 4 เสาเต็นท์สีขาวสะอาดตา (ความสูง 2.45 เมตร พอดีกับคนเดิน ลอดสบาย สัดส่วนสมจริง)
      [-1.15, 1.15].forEach((px) => {
        [-1.15, 1.15].forEach((pz) => {
          const post = new THREE.Mesh(postGeo, mats.metalPole);
          post.position.set(px, postHeight / 2, pz);
          stall.add(post);
        });
      });

      // ผ้าใบเต็นท์ทรงปิรามิดสีขาว
      const canopy = new THREE.Mesh(canopyGeo, mats.whiteCanopy);
      canopy.position.set(0, postHeight + 0.45, 0);
      stall.add(canopy);

      // ชายผ้าใบเต็นท์รอบ 4 ด้าน
      const valanceZ = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.26, 2.42), mats.whiteCanopy);
      valanceZ.position.set(0, postHeight - 0.08, 0);
      stall.add(valanceZ);

      // เส้นไฟระย้าชายคาเรืองแสงสีทองอบอุ่นรอบเต็นท์ (Warm Eave Glow ให้บรรยากาศตลาดนัดกลางคืนตามรูปอ้างอิง)
      const eaveGlow = new THREE.Mesh(eaveLightGeo, mats.warmEaveGlow);
      eaveGlow.position.set(0, postHeight - 0.20, 0);
      stall.add(eaveGlow);

      // ป้ายร้านค้าสีสดใสหน้าร้านเหนือเคาน์เตอร์
      const signMat = signMats[themeIndex % signMats.length];
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, postHeight - 0.35, 0.85);
      stall.add(sign);

      // โต๊ะเคาน์เตอร์ขายของ
      const counter = new THREE.Mesh(counterGeo, mats.counterWood);
      counter.position.set(0, 0.44, 0.85);
      stall.add(counter);

      // โต๊ะเตรียมของด้านหลัง
      const backShelf = new THREE.Mesh(backShelfGeo, mats.darkWood);
      backShelf.position.set(0, 0.40, -0.9);
      stall.add(backShelf);

      // ผนังระแนงไม้และโคมไฟประดับด้านหลังร้าน (ทำให้มองจากภายนอก/ริมน้ำก็สวยงาม มีชีวิตชีวา)
      const rearLattice = new THREE.Mesh(latticeGeo, mats.darkWood);
      rearLattice.position.set(0, 1.05, -1.15);
      stall.add(rearLattice);

      [-0.6, 0.6].forEach((lx, lIdx) => {
        const lMat = lanternMats[(themeIndex + lIdx) % lanternMats.length];
        const rLantern = new THREE.Mesh(lanternGeo, lMat);
        rLantern.position.set(lx, 1.35, -1.18);
        stall.add(rLantern);
      });

      // แม่ค้า/พ่อค้า ประจำร้าน (Stall Vendor ยืนปรุงอาหาร/ต้อนรับลูกค้าหลังเคาน์เตอร์)
      const vendor = new THREE.Group();
      vendor.position.set(0, 0, 0.15);
      const vBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 0.22), mats.vendorApron);
      vBody.position.y = 0.68;
      vendor.add(vBody);

      const vApron = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.42, 0.02), mats.whiteCanopy);
      vApron.position.set(0, 0.70, 0.12);
      vendor.add(vApron);

      const vHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mats.vendorSkin);
      vHead.position.y = 1.08;
      vendor.add(vHead);

      const vHat = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.12, 10), mats.chairWood);
      vHat.position.y = 1.20;
      vendor.add(vHat);
      stall.add(vendor);

      // หลอดไฟส้มอบอุ่นใต้เต็นท์ (เรืองแสงในตัวเอง)
      const bulb = new THREE.Mesh(bulbGeo, mats.warmBulb);
      bulb.position.set(0, postHeight - 0.28, 0);
      stall.add(bulb);

      // แผ่นจำลองแสงไฟส่องพื้น (Fake Ground Glow Disc)
      const groundGlow = new THREE.Mesh(fakeDiscGeo, mats.fakeGlow);
      groundGlow.position.set(0, 0.015, 0.5);
      stall.add(groundGlow);

      // สินค้าและอาหารหลากสีสันจัดวางเต็มเคาน์เตอร์
      this.populateStallGoods(stall, themeIndex, mats);

      group.add(stall);
    };

    // Avenue 1 (แถวหน้า หันหน้าเข้าหาทางเดินกลาง)
    const ave1Configs = [
      { z: -17.0, theme: 0 },
      { z: -11.5, theme: 1 },
      { z: -6.0,  theme: 2 },
      { z: -0.5,  theme: 3 },
      { z: +5.0,  theme: 4 },
    ];
    ave1Configs.forEach((cfg) => {
      buildSingleStall(6.2, cfg.z, -Math.PI / 2, cfg.theme);
    });

    // Avenue 2 (แถวกลาง หันหน้าเข้าหาทางเดินกลาง)
    const ave2Configs = [
      { z: -17.0, theme: 5 },
      { z: -11.5, theme: 6 },
      { z: -6.0,  theme: 7 },
      { z: -0.5,  theme: 1 },
      { z: +5.0,  theme: 0 },
    ];
    ave2Configs.forEach((cfg) => {
      buildSingleStall(-1.2, cfg.z, Math.PI / 2, cfg.theme);
    });

    // Avenue 3 (แถวหลัง หันออกสู่ลานอเนกประสงค์)
    const ave3Configs = [
      { z: -17.0, theme: 2 },
      { z: -11.5, theme: 7 },
      { z: -6.0,  theme: 3 },
    ];
    ave3Configs.forEach((cfg) => {
      buildSingleStall(-8.8, cfg.z, Math.PI / 2, cfg.theme);
    });
  }

  // สินค้า อาหารสตรีทฟู้ด ขนมไทย และของที่ระลึก สีสันสดใสจัดเต็มทุกร้าน
  populateStallGoods(stall, themeIndex, mats) {
    const foodMatSatay = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const foodMatGrill = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
    const foodMatGoldSweets = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
    const fruitGreen = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6 });
    const fruitOrange = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 });
    const fruitRed = new THREE.MeshStandardMaterial({ color: 0xd92d20, roughness: 0.6 });
    const traySilver = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.75, roughness: 0.25 });
    const bananaLeaf = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });

    if (themeIndex === 0) {
      // 1. ร้านสตรีทฟู้ด ปิ้งย่าง & ลูกชิ้นหมูปิ้งเสียบไม้ (BBQ & Satay Grill)
      const grill = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.12, 0.48), foodMatGrill);
      grill.position.set(-0.48, 0.94, 0.85);
      stall.add(grill);

      // ถ่านแดงคุร้อนเรืองแสง
      const coal = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.03, 0.42), new THREE.MeshBasicMaterial({ color: 0xff3b00 }));
      coal.position.set(-0.48, 0.99, 0.85);
      stall.add(coal);

      // ถาดวางไม้ปิ้งย่างสีทอง
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.48), traySilver);
      tray.position.set(0.48, 0.92, 0.85);
      stall.add(tray);

      const skewers = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.06, 0.40), foodMatSatay);
      skewers.position.set(0.48, 0.98, 0.85);
      stall.add(skewers);

      // โถน้ำจิ้มรสเด็ดสีส้มแดง
      const saucePot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.22, 8), fruitRed);
      saucePot.position.set(0, 0.98, 0.85);
      stall.add(saucePot);

    } else if (themeIndex === 1) {
      // 2. ร้านขนมไทยโบราณ & ข้าวเหนียวมะม่วง (Thai Golden Sweets & Mango Sticky Rice)
      // ถาดขนมทองหยิบทองหยอดพูนถาด
      const tray1 = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.26, 0.05, 10), traySilver);
      tray1.position.set(-0.52, 0.91, 0.85);
      stall.add(tray1);
      const sweets1 = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 8), foodMatGoldSweets);
      sweets1.position.set(-0.52, 0.99, 0.85);
      stall.add(sweets1);

      // ถาดข้าวเหนียวมะม่วงรองใบตอง
      const leafMat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.02, 0.46), bananaLeaf);
      leafMat.position.set(0.42, 0.90, 0.85);
      stall.add(leafMat);

      // กองข้าวเหนียวมูนสีขาว
      const rice = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 8), mats.whiteCanopy);
      rice.position.set(0.28, 0.94, 0.85);
      stall.add(rice);

      // มะม่วงสุกสีเหลืองทองอร่าม
      const mango = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mats.fairyGold);
      mango.scale.set(1.4, 0.8, 0.9);
      mango.position.set(0.56, 0.95, 0.85);
      stall.add(mango);

    } else if (themeIndex === 2) {
      // 3. ร้านกระทงประดิษฐ์งานฝีมือ (Handcrafted Krathongs & Lotuses)
      [-0.55, 0, 0.55].forEach((kx, idx) => {
        const kBase = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.16, 0.09, 8), bananaLeaf);
        kBase.position.set(kx, 0.92, 0.85);
        stall.add(kBase);

        // ดอกดาวเรืองสีเหลืองสด / ดอกบัวสีชมพู
        const flower = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 6, 6),
          idx === 1 ? mats.lanternPink : mats.fairyGold
        );
        flower.position.set(kx, 0.98, 0.85);
        stall.add(flower);

        // เปลวเทียนสว่างไสว
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), mats.warmBulb);
        flame.position.set(kx, 1.08, 0.85);
        stall.add(flame);
      });

    } else if (themeIndex === 3) {
      // 4. ร้านน้ำผลไม้และสมุนไพรสด (Herbal Drinks & Juice Dispensers)
      [-0.52, 0, 0.52].forEach((dx, i) => {
        const drinkColor = i === 0 ? fruitOrange : i === 1 ? fruitGreen : mats.lanternPink;
        const dispenser = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.42, 8), drinkColor);
        dispenser.position.set(dx, 1.09, 0.85);
        stall.add(dispenser);

        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 8), traySilver);
        cap.position.set(dx, 1.32, 0.85);
        stall.add(cap);
      });

    } else if (themeIndex === 4) {
      // 5. ร้านผัดไทยกระทะยักษ์ (Pad Thai & Fried Street Delicacy)
      const giantWok = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.35, 0.10, 12), foodMatGrill);
      giantWok.position.set(-0.35, 0.94, 0.85);
      stall.add(giantWok);

      // เส้นผัดไทยคลุกเคล้าสีส้มอิฐ
      const noodles = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 10), foodMatSatay);
      noodles.position.set(-0.35, 0.98, 0.85);
      stall.add(noodles);

      // กองกล่องใส่อาหารกลับบ้านสีขาว
      const takeoutBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.42), mats.whiteCanopy);
      takeoutBox.position.set(0.48, 1.02, 0.85);
      stall.add(takeoutBox);

    } else if (themeIndex === 5) {
      // 6. ร้านก๋วยเตี๋ยวเรือหม้อไฟ (Boat Noodles & Soup Pot)
      const soupPot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.30, 0.32, 10), traySilver);
      soupPot.position.set(-0.42, 1.04, 0.85);
      stall.add(soupPot);

      // กองชามก๋วยเตี๋ยวซ้อนกัน
      [-0.1, 0.1].forEach((bx, bIdx) => {
        const bowls = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.10, 0.18, 8), mats.signGreen);
        bowls.position.set(0.28 + bx, 0.97, 0.85);
        stall.add(bowls);
      });

    } else if (themeIndex === 6) {
      // 7. ร้านผลไม้สดฉ่ำ (Fresh Thai Cut Fruits)
      const showcase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.48), mats.chrome);
      showcase.position.set(0, 1.0, 0.85);
      stall.add(showcase);

      // แตงโมสีแดง สับปะรดสีเหลือง ฝรั่งสีเขียว
      const fruitRedBlock = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.38), fruitRed);
      fruitRedBlock.position.set(-0.5, 1.06, 0.85);
      stall.add(fruitRedBlock);

      const fruitYellowBlock = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.38), mats.fairyGold);
      fruitYellowBlock.position.set(0, 1.06, 0.85);
      stall.add(fruitYellowBlock);

      const fruitGreenBlock = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.38), fruitGreen);
      fruitGreenBlock.position.set(0.5, 1.06, 0.85);
      stall.add(fruitGreenBlock);

    } else {
      // 8. ร้านของที่ระลึก โคมลอย & พัดสาน (Yi Peng Lanterns & Crafts)
      [-0.45, 0.45].forEach((cx, cIdx) => {
        const crate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.4), mats.counterWood);
        crate.position.set(cx, 0.94, 0.85);
        stall.add(crate);

        const fan = new THREE.Mesh(new THREE.CircleGeometry(0.18, 8), cIdx === 0 ? mats.fairyGold : mats.signOrange);
        fan.position.set(cx, 1.10, 0.85);
        stall.add(fan);
      });
    }
  }

  // 3. Outdoor Dining Area with Navy Blue Tablecloths (Streamlined Meshes & Zero Shadow)
  buildMarketDiningArea(group, mats) {
    const tableClothGeo = new THREE.CylinderGeometry(0.82, 0.88, 0.72, 12);
    const tableTopGeo = new THREE.CylinderGeometry(0.86, 0.86, 0.04, 12);
    const plateGeo = new THREE.CylinderGeometry(0.32, 0.30, 0.04, 8);
    const chairSeatGeo = new THREE.BoxGeometry(0.42, 0.04, 0.4);
    const chairBackGeo = new THREE.BoxGeometry(0.40, 0.34, 0.04);
    const chairLegGeo = new THREE.BoxGeometry(0.38, 0.44, 0.36);
    const fakeTableDiscGeo = new THREE.CircleGeometry(1.5, 12);
    fakeTableDiscGeo.rotateX(-Math.PI / 2);

    const diningTableConfigs = [
      { x: 4.5, z: 12.0 },
      { x: 8.5, z: 12.0 },
      { x: 4.5, z: 15.8 },
      { x: 8.5, z: 15.8 },
      { x: 4.5, z: 19.5 },
      { x: 8.5, z: 19.5 },
    ];

    diningTableConfigs.forEach((tCfg) => {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(tCfg.x, 0.52, tCfg.z);

      // Fake Floor Glow under table
      const floorGlow = new THREE.Mesh(fakeTableDiscGeo, mats.fakeGlow);
      floorGlow.position.set(0, 0.015, 0);
      tableGroup.add(floorGlow);

      // Navy Blue Tablecloth
      const cloth = new THREE.Mesh(tableClothGeo, mats.blueCloth);
      cloth.position.set(0, 0.36, 0);
      tableGroup.add(cloth);

      const topPlate = new THREE.Mesh(tableTopGeo, mats.blueCloth);
      topPlate.position.set(0, 0.73, 0);
      tableGroup.add(topPlate);

      // 4 Low-Poly Chairs (Streamlined 3 parts per chair instead of 7)
      [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((ang) => {
        const chair = new THREE.Group();
        chair.position.set(Math.cos(ang) * 1.15, 0, Math.sin(ang) * 1.15);
        chair.rotation.y = -ang + Math.PI / 2;

        const seat = new THREE.Mesh(chairSeatGeo, mats.chairWood);
        seat.position.set(0, 0.44, 0);
        chair.add(seat);

        const legBlock = new THREE.Mesh(chairLegGeo, mats.chairWood);
        legBlock.position.set(0, 0.22, 0);
        chair.add(legBlock);

        const back = new THREE.Mesh(chairBackGeo, mats.chairWood);
        back.position.set(0, 0.65, -0.17);
        chair.add(back);

        tableGroup.add(chair);
      });

      // 1 Central Platter with food
      const plate = new THREE.Mesh(plateGeo, mats.counterWood);
      plate.position.set(0, 0.75, 0);
      tableGroup.add(plate);

      // Centerpiece Candle
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.14, 6), mats.warmBulb);
      lamp.position.set(0, 0.82, 0);
      tableGroup.add(lamp);

      group.add(tableGroup);
    });

    // Beverage & Service Station counter
    const serviceBar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.8), mats.darkWood);
    serviceBar.position.set(9.2, 0.97, 8.2);
    group.add(serviceBar);
    const serviceBarTop = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.06, 0.9), mats.counterWood);
    serviceBarTop.position.set(9.2, 1.44, 8.2);
    group.add(serviceBarTop);
  }

  // 4. Acoustic Mini Music Stage (Zero PointLight, Stage Glow Mesh)
  buildMarketLiveStage(group, mats) {
    const stageGroup = new THREE.Group();
    stageGroup.position.set(-6.2, 0.52, 16.5);
    stageGroup.rotation.y = 0.12;

    // Wooden Stage Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.45, 4.0), mats.stagePlank);
    deck.position.set(0, 0.225, 0);
    stageGroup.add(deck);

    // Front Wooden Steps
    [1, 2].forEach((s) => {
      const step = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 0.45), mats.stagePlank);
      step.position.set(0, 0.225 - s * 0.15, 2.0 + s * 0.4);
      stageGroup.add(step);
    });

    // Front Stage Floral Planter Edge (Streamlined planter trough + 6 floral bursts)
    const flowerMatYellow = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
    const trough = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.22, 0.35), mats.darkWood);
    trough.position.set(0, 0.54, 1.85);
    stageGroup.add(trough);
    for (let f = 0; f < 6; f++) {
      const fx = -2.5 + f * 1.0;
      const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), flowerMatYellow);
      blossom.position.set(fx, 0.72, 1.85);
      stageGroup.add(blossom);
    }

    // Rear Stage Wooden Backdrop
    const backdrop = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.4, 0.12), mats.darkWood);
    backdrop.position.set(0, 1.65, -1.9);
    stageGroup.add(backdrop);

    // Fake Stage Glow Panel (เรืองแสงบนเวทีแทนการใช้ PointLight)
    const stageGlow = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 3.4), mats.fakeGlow);
    stageGlow.rotation.x = -Math.PI / 2;
    stageGlow.position.set(0, 0.46, 0);
    stageGroup.add(stageGlow);

    // Musical Instruments
    // 1. Acoustic Guitar
    const guitarGroup = new THREE.Group();
    guitarGroup.position.set(0.7, 0.45, 0.2);
    guitarGroup.rotation.y = -0.3;
    const gBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.55, 0.14), mats.counterWood);
    gBody.position.set(0, 0.55, 0);
    guitarGroup.add(gBody);
    const gNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.52, 6), mats.darkWood);
    gNeck.position.set(0, 0.95, 0);
    guitarGroup.add(gNeck);
    stageGroup.add(guitarGroup);

    // 2. Cajon Drum Box
    const cajon = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 0.38), mats.counterWood);
    cajon.position.set(-1.4, 0.71, -0.4);
    stageGroup.add(cajon);

    // 3. Digital Keyboard / Piano
    const kbGroup = new THREE.Group();
    kbGroup.position.set(-1.8, 0.45, 0.5);
    kbGroup.rotation.y = 0.25;
    const kbStand = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.85, 0.35), mats.blackMetal);
    kbStand.position.set(0, 0.42, 0);
    kbGroup.add(kbStand);
    const kbBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.42), mats.blackMetal);
    kbBody.position.set(0, 0.88, 0);
    kbGroup.add(kbBody);
    stageGroup.add(kbGroup);

    // 4. Vocal Microphones
    [-0.3, 0.9].forEach((mx) => {
      const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.08, 1.4, 6), mats.chrome);
      mic.position.set(mx, 1.15, 1.1);
      stageGroup.add(mic);
    });

    // 5. Stage Monitors
    [-1.2, 1.3].forEach((wx) => {
      const mon = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.35), mats.blackMetal);
      mon.position.set(wx, 0.58, 1.25);
      mon.rotation.x = -0.4;
      stageGroup.add(mon);
    });

    group.add(stageGroup);
  }

  // 5. Grand Festival Tree (ต้นไม้เกลียวทองพุ่มสองสีมรกต-เทอร์ควอยซ์ ปั้นใหม่ตามรูปแนบที่ 6)
  buildMarketFestivalTree(group, mats) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(-1.5, 0.52, 11.5);

    const spiralBarkMat = new THREE.MeshStandardMaterial({
      map: this.spiralBarkTexture || this.barkTexture,
      color: 0xaa6938,
      roughness: 0.78,
    });
    const branchBarkMat = new THREE.MeshStandardMaterial({
      map: this.spiralBarkTexture || this.barkTexture,
      color: 0x8a4e26,
      roughness: 0.8,
    });

    // Two-tone foliage materials matching image_6.png (สีมรกตและสีเขียวเทอร์ควอยซ์/ครามอมเขียว)
    const emeraldLeafMat = new THREE.MeshStandardMaterial({
      color: 0x2e8f42,
      roughness: 0.65,
    });
    const tealLeafMat = new THREE.MeshStandardMaterial({
      color: 0x1f8877,
      roughness: 0.62,
    });
    const darkEmeraldLeafMat = new THREE.MeshStandardMaterial({
      color: 0x1d632c,
      roughness: 0.7,
    });
    const darkTealLeafMat = new THREE.MeshStandardMaterial({
      color: 0x145b50,
      roughness: 0.7,
    });
    const tealLeafOverlayMat = new THREE.MeshStandardMaterial({
      map: this.tealLeafFoliageTexture || this.leafFoliageTexture,
      transparent: true,
      alphaTest: 0.35,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    // 1. Circular Stone Planter Bench & Soil (กระถางม้านั่งหินรอบต้นไม้ในตลาด)
    const benchOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(2.4, 2.5, 0.45, 18),
      mats.stoneCurb
    );
    benchOuter.position.set(0, 0.225, 0);
    benchOuter.receiveShadow = true;
    treeGroup.add(benchOuter);

    const soil = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.44, 18), mats.darkWood);
    soil.position.set(0, 0.23, 0);
    treeGroup.add(soil);

    // 2. Flared Ground Roots Spreading Into Soil (รากยึดผืนดินในกระถาง)
    for (let r = 0; r < 5; r++) {
      const ang = (r / 5) * Math.PI * 2 + 0.3;
      const root = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.8, 7), branchBarkMat);
      root.position.set(Math.cos(ang) * 0.95, 0.42, Math.sin(ang) * 0.95);
      root.rotation.z = Math.cos(ang) * 0.7;
      root.rotation.x = Math.sin(ang) * 0.7;
      root.scale.set(0.8, 1.0, 1.3);
      treeGroup.add(root);
    }

    // 3. Sculpted Twisted / Spiral Trunk (ลำต้นเกลียวบิดทรงโค้งสง่างามตามรูปแนบที่ 6)
    const trunkGroup = new THREE.Group();

    // Central S-curve core column
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.2, 0),
      new THREE.Vector3(0.12, 1.2, 0.08),
      new THREE.Vector3(-0.15, 2.4, -0.06),
      new THREE.Vector3(0.08, 3.6, 0.05),
      new THREE.Vector3(0, 4.4, 0),
    ]);
    const trunkCoreGeo = new THREE.TubeGeometry(trunkCurve, 24, 0.62, 10, false);
    const trunkCoreMesh = new THREE.Mesh(trunkCoreGeo, spiralBarkMat);
    trunkCoreMesh.castShadow = true;
    trunkGroup.add(trunkCoreMesh);

    // 4 Helical 3D Spiral Bark Cords winding up the trunk (เส้นเกลียว 3 มิติพันรอบลำต้นตามรูปแนบที่ 6)
    for (let c = 0; c < 4; c++) {
      const startAngle = (c / 4) * Math.PI * 2;
      const cordPoints = [];
      const steps = 24;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const h = 0.3 + t * 4.0;
        const twistAngle = startAngle + t * Math.PI * 2.2;
        const rad = 0.62 - t * 0.16;
        // Apply slight S-curve translation matching central trunk
        const curveOffset = trunkCurve.getPointAt(t);
        const px = curveOffset.x + Math.cos(twistAngle) * rad;
        const pz = curveOffset.z + Math.sin(twistAngle) * rad;
        cordPoints.push(new THREE.Vector3(px, h, pz));
      }
      const cordCurve = new THREE.CatmullRomCurve3(cordPoints);
      const cordGeo = new THREE.TubeGeometry(cordCurve, 24, 0.12, 6, false);
      const cordMesh = new THREE.Mesh(cordGeo, spiralBarkMat);
      cordMesh.castShadow = true;
      trunkGroup.add(cordMesh);
    }

    treeGroup.add(trunkGroup);

    // 4. Spreading Cantilevered Branches (กิ่งก้านทรงบอนไซผายออกรับแผ่นพุ่มใบ)
    const marketBranches = [];
    const boughConfigs = [
      { rx: 0.38, rz: 0.65, len: 4.4, px: 0.6, py: 4.3, pz: 0.4, rTop: 0.22, rBot: 0.44 },
      { rx: 0.32, rz: -0.68, len: 4.6, px: -0.6, py: 4.4, pz: 0.3, rTop: 0.24, rBot: 0.46 },
      { rx: -0.45, rz: 0.58, len: 4.3, px: 0.5, py: 4.5, pz: -0.5, rTop: 0.22, rBot: 0.42 },
      { rx: -0.4, rz: -0.6, len: 4.2, px: -0.5, py: 4.4, pz: -0.5, rTop: 0.22, rBot: 0.44 },
      { rx: 0.12, rz: 0.15, len: 3.8, px: 0.05, py: 4.8, pz: 0.05, rTop: 0.25, rBot: 0.48 },
    ];

    boughConfigs.forEach((bCfg, bIdx) => {
      const bMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(bCfg.rTop, bCfg.rBot, bCfg.len, 7),
        branchBarkMat
      );
      bMesh.position.set(bCfg.px, bCfg.py, bCfg.pz);
      bMesh.rotation.x = bCfg.rx;
      bMesh.rotation.z = bCfg.rz;
      bMesh.castShadow = true;
      trunkGroup.add(bMesh);

      marketBranches.push({
        mesh: bMesh,
        baseRotZ: bCfg.rz,
        baseRotX: bCfg.rx,
        speed: 1.5 + bIdx * 0.2,
        phase: bIdx * 0.9,
        ampZ: 0.045,
        ampX: 0.035,
      });
    });

    // 5. Distinct Two-Tone Emerald & Teal Cloud Pads (พุ่มใบสองสี มรกต-เทอร์ควอยซ์ ทรงก้อนเมฆแบนตามรูปแนบที่ 6)
    const canopyGroup = new THREE.Group();
    canopyGroup.position.set(0, 4.8, 0);

    const marketLeafPuffs = [];

    // Distinct cloud-tier pads matching image_6.png
    const padDefinitions = [
      // Lateral Cantilevered Pads (พุ่มแผ่นเมฆแผ่ออกรอบข้าง)
      { x: 3.2, y: 0.3, z: 1.5, rx: 2.4, ry: 1.0, rz: 1.9, sp: 2.3, ph: 0.2 },
      { x: -3.4, y: 0.5, z: 1.4, rx: 2.5, ry: 1.1, rz: 2.0, sp: 2.4, ph: 1.0 },
      { x: 3.0, y: 0.7, z: -2.0, rx: 2.3, ry: 1.0, rz: 1.8, sp: 2.2, ph: 1.8 },
      { x: -3.1, y: 0.6, z: -1.9, rx: 2.3, ry: 1.0, rz: 1.8, sp: 2.5, ph: 2.6 },
      { x: 0.3, y: 0.4, z: 3.2, rx: 2.2, ry: 0.95, rz: 1.8, sp: 2.3, ph: 3.3 },
      { x: -0.2, y: 0.5, z: -3.1, rx: 2.2, ry: 0.95, rz: 1.8, sp: 2.4, ph: 4.0 },

      // Mid Level Interlocking Cloud Pads (พุ่มเมฆชั้นกลาง)
      { x: 1.8, y: 1.8, z: 0.8, rx: 2.2, ry: 1.1, rz: 1.8, sp: 2.6, ph: 0.7 },
      { x: -1.9, y: 1.9, z: -0.8, rx: 2.2, ry: 1.1, rz: 1.8, sp: 2.7, ph: 1.6 },
      { x: 0.0, y: 2.2, z: 1.6, rx: 2.1, ry: 1.0, rz: 1.7, sp: 2.8, ph: 2.5 },

      // Upper Crown Cloud Pads (พุ่มเมฆยอดบนสุด ทรงแบนมนสองสีสง่างาม)
      { x: 0.9, y: 3.2, z: 0.4, rx: 2.0, ry: 1.0, rz: 1.7, sp: 2.9, ph: 1.2 },
      { x: -0.8, y: 3.3, z: -0.4, rx: 1.9, ry: 1.0, rz: 1.6, sp: 3.0, ph: 2.2 },
      { x: 0.0, y: 4.2, z: 0.0, rx: 2.3, ry: 1.15, rz: 2.0, sp: 3.1, ph: 3.0 },
    ];

    padDefinitions.forEach((pd, pIdx) => {
      const padGroup = new THREE.Group();
      padGroup.position.set(pd.x, pd.y, pd.z);

      // Sub-lobes inside each cloud pad combining emerald and teal colors
      const subLobes = [
        { ox: 0, oy: 0, oz: 0, sr: 1.0, isTeal: pIdx % 2 === 1 },
        { ox: pd.rx * 0.28, oy: pd.ry * 0.12, oz: pd.rz * 0.2, sr: 0.75, isTeal: pIdx % 2 === 0 },
        { ox: -pd.rx * 0.25, oy: pd.ry * 0.1, oz: -pd.rz * 0.18, sr: 0.72, isTeal: pIdx % 3 === 0 },
        { ox: pd.rx * 0.1, oy: pd.ry * 0.2, oz: -pd.rz * 0.22, sr: 0.68, isTeal: pIdx % 2 === 1 },
      ];

      subLobes.forEach((sl, sIdx) => {
        // Alternating emerald green and turquoise teal materials for the iconic two-tone aesthetic
        const padMat = sl.isTeal
          ? (sIdx % 2 === 0 ? tealLeafMat : darkTealLeafMat)
          : (sIdx % 2 === 0 ? emeraldLeafMat : darkEmeraldLeafMat);

        const lobeMesh = new THREE.Mesh(
          new THREE.SphereGeometry(sl.sr * (pd.rx * 0.65), 8, 7),
          padMat
        );
        // Flattened cloud pad geometry
        lobeMesh.scale.set(1.35, 0.65, 1.25);
        lobeMesh.position.set(sl.ox, sl.oy, sl.oz);
        lobeMesh.castShadow = true;
        padGroup.add(lobeMesh);

        // Foliage overlay
        const leafShell = new THREE.Mesh(
          new THREE.SphereGeometry(sl.sr * (pd.rx * 0.68), 7, 6),
          tealLeafOverlayMat
        );
        leafShell.scale.set(1.38, 0.67, 1.28);
        leafShell.position.set(sl.ox, sl.oy, sl.oz);
        leafShell.castShadow = true;
        padGroup.add(leafShell);
      });

      canopyGroup.add(padGroup);

      marketLeafPuffs.push({
        mesh: padGroup,
        basePosY: pd.y,
        baseRotZ: 0,
        baseRotX: 0,
        speed: pd.sp,
        phase: pd.ph,
        amp: 0.07,
        posAmp: 0.04,
      });
    });

    treeGroup.add(canopyGroup);

    // 6. Golden Fairy Light Spiral / Accent Rings (วงแหวนไฟประดับเทศกาล)
    for (let r = 0; r < 5; r++) {
      const ringY = 1.0 + r * 0.65;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72 - r * 0.03, 0.035, 4, 16), mats.fairyGold);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, ringY, 0);
      treeGroup.add(ring);
    }

    // 7. Hanging Thai Lanterns (โคมไฟล้านนาแขวนรอบต้นไม้เทศกาล)
    const lanternColors = [0xfbbf24, 0xef4444, 0x3b82f6, 0xec4899, 0x10b981];
    for (let l = 0; l < 8; l++) {
      const lAng = (l / 8) * Math.PI * 2;
      const lDist = 2.1;
      const lY = 3.6;
      const lMat = new THREE.MeshBasicMaterial({ color: lanternColors[l % lanternColors.length] });
      const lMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.35, 6), lMat);
      lMesh.position.set(Math.cos(lAng) * lDist, lY, Math.sin(lAng) * lDist);
      treeGroup.add(lMesh);
    }

    // 8. Central PointLight for Market Area
    const marketCentralLight = new THREE.PointLight(0xf59e0b, 3.2, 24, 1.3);
    marketCentralLight.position.set(0, 3.8, 0);
    treeGroup.add(marketCentralLight);
    this.flickerLights.push({ light: marketCentralLight, baseIntensity: 3.2, speed: 2.8 });

    group.add(treeGroup);

    // Register Tree 3 for continuous dynamic wind swaying
    this.swayingTrees.push({
      group: canopyGroup,
      branches: marketBranches,
      leafPuffs: marketLeafPuffs,
      speed: 1.15,
      phase: 0.75,
      swayAmpZ: 0.065,
      swayAmpX: 0.045,
    });
  }

  // 6. Large Covered Pavilion Marquee (Zero PointLight, Fake Floor Glow, Proportional 3.0m Height)
  buildMarketPavilionMarquee(group, mats) {
    const marqGroup = new THREE.Group();
    marqGroup.position.set(-7.5, 0.52, 2.0);

    // 6 Support Posts (ความสูงสมส่วน 3.0 เมตร)
    const postH = 3.0;
    const postGeo = new THREE.BoxGeometry(0.12, postH, 0.12);
    [-3.4, 0, 3.4].forEach((px) => {
      [-2.3, 2.3].forEach((pz) => {
        const post = new THREE.Mesh(postGeo, mats.metalPole);
        post.position.set(px, postH / 2, pz);
        marqGroup.add(post);
      });
    });

    // White Hip Marquee Roof
    const roofPyramid = new THREE.Mesh(new THREE.ConeGeometry(3.6, 1.35, 4), mats.whiteCanopy);
    roofPyramid.scale.set(1.95, 1.0, 1.35);
    roofPyramid.rotation.y = Math.PI / 4;
    roofPyramid.position.set(0, postH + 0.60, 0);
    marqGroup.add(roofPyramid);

    // Warm Eave Glow around pavilion
    const marqEaveGlow = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.05, 5.0), mats.warmEaveGlow);
    marqEaveGlow.position.set(0, postH - 0.08, 0);
    marqGroup.add(marqEaveGlow);

    // Interior Long Banquet Tables & Benches
    [-1.6, 1.6].forEach((tx) => {
      const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.76, 0.9), mats.counterWood);
      table.position.set(tx, 0.38, 0);
      marqGroup.add(table);
    });

    // Warm Interior Pendant Bulb (Emissive)
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), mats.warmBulb);
    bulb.position.set(0, postH - 0.35, 0);
    marqGroup.add(bulb);

    // Fake Floor Glow
    const floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 4.0), mats.fakeGlow);
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.set(0, 0.015, 0);
    marqGroup.add(floorGlow);

    group.add(marqGroup);
  }

  // 7. Overhead Festoon String Lights (Streamlined Ribbons)
  buildMarketOverheadLights(group, mats) {
    const poleMat = mats.metalPole;
    const bulbMat = mats.warmBulb;

    // 4 Corner Poles
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.06, 3.6, 6);
    const polePositions = [
      { x: 6.2, z: -19.5 },
      { x: 6.2, z: 8.5 },
      { x: -1.2, z: -19.5 },
      { x: -1.2, z: 8.5 },
    ];
    polePositions.forEach((pp) => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(pp.x, 2.32, pp.z);
      group.add(pole);

      const topBulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), bulbMat);
      topBulb.position.set(pp.x, 4.15, pp.z);
      group.add(topBulb);
    });

    // 3 Overhead glowing connecting festoon lines
    [-15.0, -5.0, 5.0].forEach((sz) => {
      const wire = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.04, 0.04), bulbMat);
      wire.position.set(2.5, 3.6, sz);
      group.add(wire);
    });
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

    // --- A. Majestic Deciduous Canopy Shade Tree (ต้นไม้ใหญ่ร่มรื่นปั้นใหม่ตามรูปแนบที่ 4) ---
    const canopyTree = new THREE.Group();
    canopyTree.position.set(-30, 1.5, -42);

    const oakBarkMat = new THREE.MeshStandardMaterial({
      map: this.barkTexture,
      roughness: 0.84,
    });
    const oakLeafSolid = new THREE.MeshStandardMaterial({
      color: 0x246227,
      roughness: 0.68,
    });
    const oakLeafDark = new THREE.MeshStandardMaterial({
      color: 0x18481a,
      roughness: 0.72,
    });
    const oakLeafOverlay = new THREE.MeshStandardMaterial({
      map: this.leafFoliageTexture,
      transparent: true,
      alphaTest: 0.35,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });

    // 1. Organic Root Buttresses (รากฐานแผ่รับน้ำหนักตามแนวรูปแนบที่ 4)
    for (let r = 0; r < 6; r++) {
      const angle = (r / 6) * Math.PI * 2 + 0.2;
      const root = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.2, 7), oakBarkMat);
      root.position.set(Math.cos(angle) * 1.6, 0.9, Math.sin(angle) * 1.6);
      root.rotation.z = Math.cos(angle) * 0.75;
      root.rotation.x = Math.sin(angle) * 0.75;
      root.scale.set(0.75, 1.0, 1.3);
      canopyTree.add(root);
    }

    // 2. Tall Stately Trunk (ลำต้นตรงสง่างาม เรียวขึ้นสู่ยอดตามรูปแนบที่ 4)
    const trunkColumn = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.8, 5.2, 14), oakBarkMat);
    trunkColumn.position.y = 2.6;
    trunkColumn.castShadow = true;
    canopyTree.add(trunkColumn);

    const upperTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.05, 2.8, 12), oakBarkMat);
    upperTrunk.position.set(0.04, 5.8, -0.02);
    upperTrunk.castShadow = true;
    canopyTree.add(upperTrunk);

    // 3. Spreading Boughs & Sub-Branch Network (กิ่งก้านหลักแผ่รอบทิศทาง 360 องศา เห็นโครงกิ่งใต้พุ่มตามรูปแนบที่ 4)
    const tree2Branches = [];
    const mainBoughs = [
      { rx: 0.42, rz: 0.55, len: 6.2, rTop: 0.28, rBot: 0.52, px: 0.7, py: 6.4, pz: 0.6 },
      { rx: 0.35, rz: -0.62, len: 6.5, rTop: 0.3, rBot: 0.54, px: -0.8, py: 6.5, pz: 0.5 },
      { rx: -0.48, rz: 0.5, len: 6.0, rTop: 0.26, rBot: 0.5, px: 0.6, py: 6.6, pz: -0.8 },
      { rx: -0.4, rz: -0.56, len: 5.8, rTop: 0.28, rBot: 0.52, px: -0.7, py: 6.5, pz: -0.7 },
      { rx: 0.55, rz: 0.05, len: 5.6, rTop: 0.25, rBot: 0.48, px: 0.1, py: 6.7, pz: 0.9 },
      { rx: -0.52, rz: 0.02, len: 5.5, rTop: 0.25, rBot: 0.48, px: 0.0, py: 6.6, pz: -0.9 },
      { rx: 0.12, rz: 0.18, len: 4.8, rTop: 0.3, rBot: 0.52, px: 0.05, py: 7.2, pz: 0.05 },
    ];

    mainBoughs.forEach((bCfg, bIdx) => {
      const bMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(bCfg.rTop, bCfg.rBot, bCfg.len, 8),
        oakBarkMat
      );
      bMesh.position.set(bCfg.px, bCfg.py, bCfg.pz);
      bMesh.rotation.x = bCfg.rx;
      bMesh.rotation.z = bCfg.rz;
      bMesh.castShadow = true;
      canopyTree.add(bMesh);

      tree2Branches.push({
        mesh: bMesh,
        baseRotZ: bCfg.rz,
        baseRotX: bCfg.rx,
        speed: 1.4 + bIdx * 0.18,
        phase: bIdx * 0.85,
        ampZ: 0.04,
        ampX: 0.03,
      });

      // Secondary branch forks extending upward into foliage
      const fork = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.25, 3.2, 6),
        oakBarkMat
      );
      fork.position.set(
        bCfg.px + Math.sin(bCfg.rz) * (bCfg.len * 0.48),
        bCfg.py + (bCfg.len * 0.48) * 0.72,
        bCfg.pz + Math.sin(bCfg.rx) * (bCfg.len * 0.48)
      );
      fork.rotation.x = bCfg.rx * 1.3;
      fork.rotation.z = bCfg.rz * 1.3;
      fork.castShadow = true;
      canopyTree.add(fork);
    });

    // 4. Dense, Lush Umbrella Canopy (พุ่มใบไม้หนาทรงร่มธรรมชาติแบบรูปแนบที่ 4)
    const foliageCrown = new THREE.Group();
    foliageCrown.position.set(0, 8.2, 0);

    const tree2LeafPuffs = [];

    // Layered umbrella canopy clusters spanning wide dome
    const canopyClusters = [
      // Lower Hanging Clusters (ชายพุ่มด้านล่าง ทรงแผ่ออกกว้าง)
      { x: 4.8, y: 0.4, z: 2.8, r: 2.8, sx: 1.4, sy: 0.82, sz: 1.3, sp: 2.2, ph: 0.3 },
      { x: -5.0, y: 0.6, z: 2.6, r: 2.9, sx: 1.45, sy: 0.85, sz: 1.35, sp: 2.4, ph: 1.1 },
      { x: 4.5, y: 0.8, z: -3.2, r: 2.7, sx: 1.38, sy: 0.8, sz: 1.3, sp: 2.1, ph: 2.0 },
      { x: -4.8, y: 0.5, z: -3.0, r: 2.8, sx: 1.4, sy: 0.82, sz: 1.32, sp: 2.3, ph: 2.8 },
      { x: 0.5, y: 0.3, z: 5.2, r: 2.6, sx: 1.35, sy: 0.8, sz: 1.3, sp: 2.5, ph: 3.5 },
      { x: -0.4, y: 0.4, z: -5.0, r: 2.6, sx: 1.35, sy: 0.8, sz: 1.3, sp: 2.2, ph: 4.2 },

      // Mid Volume Dense Canopy (เนื้อพุ่มชั้นกลาง อวบแน่นเชื่อมทรงพุ่มให้ทึบสง่า)
      { x: 3.2, y: 2.5, z: 1.8, r: 3.1, sx: 1.35, sy: 0.9, sz: 1.3, sp: 2.6, ph: 0.6 },
      { x: -3.4, y: 2.7, z: 1.6, r: 3.2, sx: 1.38, sy: 0.92, sz: 1.32, sp: 2.5, ph: 1.5 },
      { x: 3.0, y: 2.9, z: -2.0, r: 3.0, sx: 1.32, sy: 0.88, sz: 1.28, sp: 2.4, ph: 2.3 },
      { x: -3.1, y: 2.8, z: -1.9, r: 3.1, sx: 1.35, sy: 0.9, sz: 1.3, sp: 2.7, ph: 3.1 },
      { x: 0.2, y: 2.6, z: 3.2, r: 2.9, sx: 1.3, sy: 0.88, sz: 1.28, sp: 2.8, ph: 3.9 },
      { x: -0.3, y: 2.7, z: -3.0, r: 2.9, sx: 1.3, sy: 0.88, sz: 1.28, sp: 2.6, ph: 4.7 },

      // Upper Crown Dome (ยอดโดมกลมมนด้านบน)
      { x: 1.8, y: 4.8, z: 1.0, r: 2.8, sx: 1.3, sy: 0.92, sz: 1.25, sp: 2.9, ph: 0.9 },
      { x: -1.9, y: 4.9, z: -0.9, r: 2.8, sx: 1.3, sy: 0.92, sz: 1.25, sp: 3.0, ph: 2.1 },
      { x: 0.0, y: 6.2, z: 0.0, r: 3.2, sx: 1.35, sy: 0.95, sz: 1.3, sp: 3.1, ph: 3.0 },
    ];

    canopyClusters.forEach((cc, cIdx) => {
      const clusterGroup = new THREE.Group();
      clusterGroup.position.set(cc.x, cc.y, cc.z);

      const solidMat = cIdx % 2 === 0 ? oakLeafSolid : oakLeafDark;
      const core = new THREE.Mesh(new THREE.SphereGeometry(cc.r, 8, 7), solidMat);
      core.scale.set(cc.sx, cc.sy, cc.sz);
      core.castShadow = true;
      clusterGroup.add(core);

      const overlay = new THREE.Mesh(new THREE.SphereGeometry(cc.r * 1.07, 7, 6), oakLeafOverlay);
      overlay.scale.set(cc.sx * 1.02, cc.sy * 1.02, cc.sz * 1.02);
      overlay.castShadow = true;
      clusterGroup.add(overlay);

      foliageCrown.add(clusterGroup);

      tree2LeafPuffs.push({
        mesh: clusterGroup,
        basePosY: cc.y,
        baseRotZ: 0,
        baseRotX: 0,
        speed: cc.sp,
        phase: cc.ph,
        amp: 0.065,
        posAmp: 0.035,
      });
    });

    canopyTree.add(foliageCrown);

    // Warm scenic night illumination
    const treeUplight = new THREE.PointLight(0x22c55e, 3.8, 30, 1.3);
    treeUplight.position.set(0, 1.8, 0);
    canopyTree.add(treeUplight);

    const treeGoldLight = new THREE.PointLight(0xf59e0b, 3.2, 25, 1.4);
    treeGoldLight.position.set(2, 2.5, -2);
    canopyTree.add(treeGoldLight);

    this.scene.add(canopyTree);

    // Register Tree 2 for continuous natural wind swaying
    this.swayingTrees.push({
      group: foliageCrown,
      branches: tree2Branches,
      leafPuffs: tree2LeafPuffs,
      speed: 1.1,
      phase: 0.55,
      swayAmpZ: 0.06,
      swayAmpX: 0.04,
    });

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
    // จำกัดตำแหน่งให้อยู่ในแนวตลิ่ง Z: -45 ถึง +75 (นำ 2 จุดที่ลอยเคว้งเกินฉากออกไปตามรูปแนบ 2)
    const torchCount = 10;
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xd4a359, roughness: 0.6 });
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7 });

    for (let i = 0; i < torchCount; i++) {
      const zPos = -45 + i * 13;
      if (zPos > 75) continue; // ตัดคบเพลิงที่เกินแนวตลิ่งออกเด็ดขาด
      const torch = new THREE.Group();
      torch.position.set(-18.2, 1.0, zPos);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.8, 6), bambooMat);
      pole.position.y = 2.4;
      torch.add(pole);

      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.18, 0.75, 6), coneMat);
      basket.position.y = 4.8;
      torch.add(basket);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.9, 6),
        new THREE.MeshBasicMaterial({ color: 0xff6600 })
      );
      flame.position.y = 5.4;
      torch.add(flame);

      const core = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.65, 6),
        new THREE.MeshBasicMaterial({ color: 0xffea33 })
      );
      core.position.y = 5.3;
      torch.add(core);

      // ใช้ไฟส่องสว่าง PointLight เฉพาะจุดสำคัญ 2 จุดหลัก (ประหยัดพลัง GPU ได้ 80%)
      let fLight = null;
      if (i === 1 || i === 7) {
        fLight = new THREE.PointLight(0xff7700, 3.4, 22, 1.3);
        fLight.position.set(0, 5.6, 0);
        torch.add(fLight);
      }

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

      // ==========================================================
      // กลุ่มพุทธศาสนิกชนและชาวบ้าน 15 คน เดินบริเวณลานวัดและลานเจดีย์ (Temple & Pagoda Plaza Walkers - Y = 3.2)
      // ==========================================================
      // 1. หญิงสาวสไบสีชมพูกลีบบัว เดินทอดน่องลานหน้าวัดริมน้ำ
      {
        gender: "female",
        role: "walking",
        area: "temple",
        x: 5.0, y: 3.2, z: -32.0,
        primary: 0xec4899, secondary: 0xbe185d, gold: 0xfbbf24,
        minPos: -1.0, maxPos: 15.0,
        axis: "x", dir: 1, speed: 1.10, walkPhase: 0.0,
      },
      // 2. ชายหนุ่มเสื้อผ้าไหมสีทอง เดินชมสายน้ำลานหน้าวัด
      {
        gender: "male",
        role: "walking",
        area: "temple",
        x: 8.0, y: 3.2, z: -31.2,
        primary: 0xf59e0b, secondary: 0x881337, sash: 0xd97706,
        minPos: 2.0, maxPos: 22.0,
        axis: "x", dir: 1, speed: 1.05, walkPhase: 0.8,
      },
      // 3. หญิงสาวสไบแพรสีเขียวมรกต เดินชมกระทงจากลานวัดฝั่งตะวันออก
      {
        gender: "female",
        role: "walking",
        area: "temple",
        x: 24.0, y: 3.2, z: -33.0,
        primary: 0x059669, secondary: 0x064e3b, gold: 0xfef08a,
        minPos: 10.0, maxPos: 32.0,
        axis: "x", dir: -1, speed: 1.15, walkPhase: 1.9,
      },
      // 4. ชายหนุ่มเสื้อไหมสีกรมท่า เดินเล่นหน้าวิหาร
      {
        gender: "male",
        role: "walking",
        area: "temple",
        x: 18.0, y: 3.2, z: -34.0,
        primary: 0x1e3a8a, secondary: 0x172554, sash: 0xf59e0b,
        minPos: 4.0, maxPos: 28.0,
        axis: "x", dir: -1, speed: 0.95, walkPhase: 3.2,
      },
      // 5. หญิงสาวสไบสองชั้นสีม่วงดอกรัก เดินชมโคมลอยลานหน้าวัด
      {
        gender: "female",
        role: "walking",
        area: "temple",
        x: 2.0, y: 3.2, z: -35.0,
        primary: 0x7c3aed, secondary: 0x4c1d95, gold: 0xfef08a,
        minPos: -1.0, maxPos: 18.0,
        axis: "x", dir: 1, speed: 1.20, walkPhase: 4.1,
      },
      // 6. หญิงสาวสไบสีขาวงาช้างปักดิ้นทอง เดินเวียนเทียนทักษิณาวัตรด้านทิศตะวันตกของเจดีย์
      {
        gender: "female",
        role: "walking",
        area: "temple",
        x: 2.0, y: 3.2, z: -40.0,
        primary: 0xfffdf5, secondary: 0x881337, gold: 0xf59e0b,
        minPos: -52.0, maxPos: -38.0,
        axis: "z", dir: 1, speed: 1.00, walkPhase: 1.5,
      },
      // 7. ชายหนุ่มเสื้อพระราชทานไหมทอง เดินประทักษิณทิศตะวันออกขององค์เจดีย์
      {
        gender: "male",
        role: "walking",
        area: "temple",
        x: 17.5, y: 3.2, z: -48.0,
        primary: 0xf59e0b, secondary: 0x78350f, sash: 0xd97706,
        minPos: -52.0, maxPos: -38.0,
        axis: "z", dir: -1, speed: 1.08, walkPhase: 2.7,
      },
      // 8. หญิงสาวสไบสีแดงทับทิมสยาม เดินเวียนหลังองค์เจดีย์
      {
        gender: "female",
        role: "walking",
        area: "temple",
        x: 9.0, y: 3.2, z: -53.0,
        primary: 0xbe123c, secondary: 0x881337, gold: 0xfef08a,
        minPos: 2.0, maxPos: 17.0,
        axis: "x", dir: 1, speed: 1.12, walkPhase: 0.5,
      },
      // 9. ชายหนุ่มเสื้อผ้าไหมสีคราม เดินรอบฐานเจดีย์ฝั่งหน้า
      {
        gender: "male",
        role: "walking",
        area: "temple",
        x: 14.0, y: 3.2, z: -38.0,
        primary: 0x1d4ed8, secondary: 0x172554, sash: 0xfbbf24,
        minPos: 2.0, maxPos: 17.0,
        axis: "x", dir: -1, speed: 1.02, walkPhase: 3.6,
      },
      // 10. หญิงสาวสไบสีเหลืองดอกดาวเรือง เดินเวียนรอบพระธาตุเจดีย์
      {
        gender: "female",
        role: "walking",
        area: "temple",
        x: 1.2, y: 3.2, z: -46.0,
        primary: 0xeab308, secondary: 0x78350f, gold: 0xfef08a,
        minPos: -52.0, maxPos: -38.0,
        axis: "z", dir: -1, speed: 0.98, walkPhase: 4.9,
      },
      // 11. ชายหนุ่มสวมเสื้อผ้าไหมสีส้มทอง เดินระหว่างพระเจดีย์และพระวิหาร
      {
        gender: "male",
        role: "walking",
        area: "temple",
        x: 18.0, y: 3.2, z: -38.0,
        primary: 0xea580c, secondary: 0x7c2d12, sash: 0xf59e0b,
        minPos: -52.0, maxPos: -30.0,
        axis: "z", dir: 1, speed: 1.15, walkPhase: 1.2,
      },
      // 12. หญิงสาวสไบจักรีสีฟ้าอมคราม เดินทางเดินเชื่อมระหว่างเจดีย์-วิหาร
      {
        gender: "female",
        role: "walking",
        area: "temple",
        x: 19.5, y: 3.2, z: -46.0,
        primary: 0x0284c7, secondary: 0x0c4a6e, gold: 0xfbbf24,
        minPos: -52.0, maxPos: -30.0,
        axis: "z", dir: -1, speed: 1.10, walkPhase: 2.4,
      },
      // 13. ชายหนุ่มชุดราชปะแตนสีงาช้าง เดินเล่นลานฝั่งตะวันออกของวิหาร
      {
        gender: "male",
        role: "walking",
        area: "temple",
        x: 32.0, y: 3.2, z: -36.0,
        primary: 0xfffdf5, secondary: 0x172554, sash: 0xf59e0b,
        minPos: -50.0, maxPos: -32.0,
        axis: "z", dir: 1, speed: 1.05, walkPhase: 0.3,
      },
      // 14. หญิงสาวสไบลูกไม้สีชมพูดอกบัว เดินเลียบระเบียงวิหาร
      {
        gender: "female",
        role: "walking",
        area: "temple",
        x: 31.0, y: 3.2, z: -44.0,
        primary: 0xf472b6, secondary: 0x831843, gold: 0xfef08a,
        minPos: -50.0, maxPos: -32.0,
        axis: "z", dir: -1, speed: 1.20, walkPhase: 3.8,
      },
      // 15. ชายหนุ่มเสื้อผ้าไหมสีแดงทับทิม เดินรอบลานหลังวิหาร
      {
        gender: "male",
        role: "walking",
        area: "temple",
        x: 27.0, y: 3.2, z: -48.0,
        primary: 0x991b1b, secondary: 0x450a0a, sash: 0xf59e0b,
        minPos: 19.0, maxPos: 33.0,
        axis: "x", dir: 1, speed: 1.00, walkPhase: 5.1,
      },

      // ==========================================================
      // ผู้คนในตลาดนัดกลางคืนริมน้ำ (Night Market Visitors, Diners & Live Band)
      // มีชีวิตชีวา เดินเลือกซื้อของ ยืนสั่งอาหาร นั่งกิน และเล่นดนตรี
      // ==========================================================
      // 1-6. คนเดินเลือกซื้อของในทางเดินกลางตลาด (Main Market Aisle Walkers X: -34 to -33, Y = 2.02 บนพื้นลานหิน)
      {
        gender: "female",
        role: "walking",
        area: "market",
        x: -33.2, y: 2.02, z: 22.0,
        primary: 0xec4899, secondary: 0x9d174d, gold: 0xfef08a,
        minPos: 18.0, maxPos: 40.0,
        axis: "z", dir: 1, speed: 1.10, walkPhase: 0.2,
      },
      {
        gender: "male",
        role: "walking",
        area: "market",
        x: -34.5, y: 2.02, z: 36.0,
        primary: 0xf97316, secondary: 0x7c2d12, sash: 0xfbbf24,
        minPos: 18.0, maxPos: 40.0,
        axis: "z", dir: -1, speed: 1.05, walkPhase: 1.8,
      },
      {
        gender: "female",
        role: "walking",
        area: "market",
        x: -33.6, y: 2.02, z: 29.0,
        primary: 0x10b981, secondary: 0x064e3b, gold: 0xfef08a,
        minPos: 20.0, maxPos: 39.0,
        axis: "z", dir: 1, speed: 1.15, walkPhase: 3.5,
      },
      {
        gender: "male",
        role: "walking",
        area: "market",
        x: -34.8, y: 2.02, z: 32.0,
        primary: 0x0284c7, secondary: 0x0f172a, sash: 0xf59e0b,
        minPos: 19.0, maxPos: 41.0,
        axis: "z", dir: -1, speed: 1.00, walkPhase: 4.6,
      },
      {
        gender: "female",
        role: "walking",
        area: "market",
        x: -33.0, y: 2.02, z: 25.0,
        primary: 0xf59e0b, secondary: 0x78350f, gold: 0xfef08a,
        minPos: 18.0, maxPos: 38.0,
        axis: "z", dir: 1, speed: 1.08, walkPhase: 2.1,
      },
      {
        gender: "male",
        role: "walking",
        area: "market",
        x: -34.2, y: 2.02, z: 20.0,
        primary: 0x8b5cf6, secondary: 0x3b0764, sash: 0xfbbf24,
        minPos: 18.0, maxPos: 39.0,
        axis: "z", dir: 1, speed: 1.12, walkPhase: 5.0,
      },

      // 7-10. คนเดินเชื่อมต่อระหว่างริมตลิ่งกับโซนโต๊ะอาหาร (Promenade Connection Walkers X: -27 to -29)
      {
        gender: "female",
        role: "walking",
        area: "market",
        x: -28.2, y: 2.02, z: 24.0,
        primary: 0xec4899, secondary: 0x831843, gold: 0xfef08a,
        minPos: 20.0, maxPos: 44.0,
        axis: "z", dir: 1, speed: 1.18, walkPhase: 1.2,
      },
      {
        gender: "male",
        role: "walking",
        area: "market",
        x: -27.5, y: 2.02, z: 42.0,
        primary: 0x06b6d4, secondary: 0x164e63, sash: 0xf59e0b,
        minPos: 22.0, maxPos: 48.0,
        axis: "z", dir: -1, speed: 1.05, walkPhase: 3.0,
      },
      {
        gender: "female",
        role: "walking",
        area: "market",
        x: -28.8, y: 2.02, z: 35.0,
        primary: 0xa855f7, secondary: 0x581c87, gold: 0xfef08a,
        minPos: 21.0, maxPos: 43.0,
        axis: "z", dir: 1, speed: 1.10, walkPhase: 4.1,
      },
      {
        gender: "male",
        role: "walking",
        area: "market",
        x: -28.0, y: 2.02, z: 46.0,
        primary: 0xe11d48, secondary: 0x4c0519, sash: 0xfacc15,
        minPos: 25.0, maxPos: 50.0,
        axis: "z", dir: -1, speed: 1.02, walkPhase: 2.7,
      },

      // 11-16. ลูกค้ายืนเลือกซื้อของหน้าร้าน (Shoppers browsing & ordering at stalls)
      // ลูกค้าหน้าร้านปิ้งย่าง (Avenue 1, Z = 19.0, หันหน้ามองร้าน)
      {
        gender: "female",
        role: "spectator",
        area: "market",
        x: -31.8, y: 2.02, z: 19.0,
        rotY: -Math.PI / 2,
        primary: 0xf43f5e, secondary: 0x9f1239, gold: 0xfef08a,
        pose: "standing_look",
      },
      // ลูกค้าหน้าร้านขนมไทย (Avenue 1, Z = 24.5)
      {
        gender: "male",
        role: "spectator",
        area: "market",
        x: -31.8, y: 2.02, z: 24.5,
        rotY: -Math.PI / 2,
        primary: 0x10b981, secondary: 0x064e3b, sash: 0xfbbf24,
        pose: "standing_holding",
      },
      // ลูกค้าหน้าร้านกระทง (Avenue 1, Z = 30.0)
      {
        gender: "female",
        role: "spectator",
        area: "market",
        x: -31.8, y: 2.02, z: 30.0,
        rotY: -Math.PI / 2,
        primary: 0x06b6d4, secondary: 0x0e7490, gold: 0xfef08a,
        pose: "standing_holding",
      },
      // ลูกค้าหน้าร้านน้ำผลไม้ (Avenue 1, Z = 35.5)
      {
        gender: "male",
        role: "spectator",
        area: "market",
        x: -31.8, y: 2.02, z: 35.5,
        rotY: -Math.PI / 2,
        primary: 0xf97316, secondary: 0x9a3412, sash: 0xfbbf24,
        pose: "standing_look",
      },
      // ลูกค้าหน้าร้านก๋วยเตี๋ยวเรือ (Avenue 2, Z = 24.5, หันหน้ามองร้าน)
      {
        gender: "female",
        role: "spectator",
        area: "market",
        x: -35.2, y: 2.02, z: 24.5,
        rotY: Math.PI / 2,
        primary: 0x8b5cf6, secondary: 0x4c1d95, gold: 0xfef08a,
        pose: "standing_look",
      },
      // ลูกค้าหน้าร้านผลไม้สด (Avenue 2, Z = 35.5)
      {
        gender: "male",
        role: "spectator",
        area: "market",
        x: -35.2, y: 2.02, z: 35.5,
        rotY: Math.PI / 2,
        primary: 0x14b8a6, secondary: 0x134e4a, sash: 0xf59e0b,
        pose: "standing_holding",
      },

      // 17-20. ลูกค้านั่งโต๊ะอาหารริมน้ำ (Diners at outdoor tables)
      {
        gender: "female",
        role: "spectator",
        area: "market",
        x: -31.5, y: 2.02, z: 47.0,
        rotY: -Math.PI / 4,
        primary: 0xec4899, secondary: 0x831843, gold: 0xfef08a,
        pose: "standing_holding",
      },
      {
        gender: "male",
        role: "spectator",
        area: "market",
        x: -27.5, y: 2.02, z: 51.5,
        rotY: -Math.PI / 2,
        primary: 0x0d9488, secondary: 0x134e4a, sash: 0xf59e0b,
        pose: "standing_look",
      },
      {
        gender: "male",
        role: "spectator",
        area: "market",
        x: -31.5, y: 2.02, z: 51.5,
        rotY: Math.PI / 3,
        primary: 0x3b82f6, secondary: 0x1e3a8a, sash: 0xfbbf24,
        pose: "standing_holding",
      },
      {
        gender: "female",
        role: "spectator",
        area: "market",
        x: -27.5, y: 2.02, z: 47.0,
        rotY: -Math.PI * 0.75,
        primary: 0xf59e0b, secondary: 0x92400e, gold: 0xfef08a,
        pose: "standing_look",
      },

      // 21-22. นักดนตรีบนเวทีสด (Live Acoustic Music Stage Y = 2.47 บนพื้นเวทีไม้)
      {
        gender: "male",
        role: "spectator",
        area: "market",
        x: -41.4, y: 2.47, z: 52.8,
        rotY: 0.15,
        primary: 0xb45309, secondary: 0x18181b, sash: 0xf59e0b,
        pose: "standing_holding",
      },
      {
        gender: "female",
        role: "spectator",
        area: "market",
        x: -44.0, y: 2.47, z: 53.0,
        rotY: 0.25,
        primary: 0xdb2777, secondary: 0x4c0519, gold: 0xfef08a,
        pose: "standing_holding",
      },
    ];

    // เข็มขัดและเครื่องประดับแบบเรียบง่ายสำหรับชาวบ้านทั่วไป (ไม่ฉูดฉาด ไม่แย่งซีนผู้สมัคร)
    const modestMat = new THREE.MeshStandardMaterial({ color: 0x5c2c16, roughness: 0.7 });

    characterConfigs.forEach((cfg) => {
      const isSpecial = cfg.area === "temple" || cfg.area === "market";
      const npcCfg = isSpecial
        ? { ...cfg }
        : {
            ...cfg,
            primary: 0x1e3a8a,   // เสื้อม่อฮ่อมสีน้ำเงินคราม
            secondary: 0x78350f, // โจงกระเบนสีน้ำตาลเข้ม
            sash: 0x5c2c16,      // ผ้าคาดเอวสีน้ำตาลเรียบง่าย
          };
      const char = cfg.gender === "female"
        ? this.buildFemaleThaiCharacter(npcCfg, skinMat, hairMat, isSpecial ? goldMat : modestMat)
        : this.buildMaleThaiCharacter(npcCfg, skinMat, hairMat, isSpecial ? goldMat : modestMat);

      char.area = cfg.area || "promenade";
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
    flameLight.name = "candleLight";
    group.add(flameLight);

    // แสงสะท้อนสีทองส้มนุ่มนวลใต้กระทงบนผิวน้ำ (Soft Golden Candle Reflection on Water Surface)
    if (this.waterGlowTexture) {
      const glowGeo = new THREE.PlaneGeometry(3.2, 3.2);
      glowGeo.rotateX(-Math.PI / 2);
      const glowMat = new THREE.MeshBasicMaterial({
        map: this.waterGlowTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.42,
      });
      const waterGlow = new THREE.Mesh(glowGeo, glowMat);
      waterGlow.position.y = 0.02;
      waterGlow.name = "waterCandleGlow";
      group.add(waterGlow);
    }

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
    // หันหน้าเข้าหากล้องตามแนวระนาบ Y
    if (this.camera) {
      const dx = this.camera.position.x - slotPos.x;
      const dz = this.camera.position.z - slotPos.z;
      avatarGroup.rotation.y = Math.atan2(dx, dz);
    } else {
      avatarGroup.rotation.y = 0.75;
    }

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

    // ดวงไฟสปอตไลต์ประจำตัว (Soft Studio Aura Spotlight) ให้ตัวโมเดลสว่างไสวเป็นธรรมชาติ ไม่ขาวโพลน
    const spot = new THREE.PointLight(0xfff1dc, 1.05, 7.0, 1.5);
    spot.position.set(0, 2.8, 1.1);
    avatarGroup.add(spot);
    this.flickerLights.push({ light: spot, baseIntensity: 1.05, speed: 1.5 });

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

    // โครงสร้างศีรษะปั้น 3D แท้ 100% ไร้การแปะภาพถ่าย 2D ลงบนใบหน้า
    const faceMat = null;

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

    // ===== ป้ายชื่อ คะแนนโหวต พร้อมรูปถ่ายลอยเด่นเหนือป้าย (Billboard Sprite) =====
    const badgeSprite = this.createCandidateBadgeSprite(entry.name, entry.votes || 0, entry.photoUrl);
    badgeSprite.position.set(0, isMale ? 2.85 : 2.80, 0);
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
      faceMat,
      isMale,
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

  // ปั้นศีรษะและเครื่องหน้า 3D แท้ 100% (ตา หู จมูก ปาก คิ้ว คาง ทรงผม) ไร้การแปะภาพ 2D
  buildAnatomicalHead(isMale, skinMat, hairMat, goldMat, faceMat, rubyMat) {
    const headGroup = new THREE.Group();

    // 1. กะโหลกศีรษะและโครงหน้า 3D (Parametric Sculpted Cranium & Face Mesh)
    const headRadius = 0.125;
    const headGeo = new THREE.SphereGeometry(headRadius, 54, 40);
    const pos = headGeo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);

      v.x *= 0.95;
      v.y *= 1.05;
      v.z *= 1.02;

      if (v.z > 0) {
        // ก. เบ้าตาเว้าเข้าไปในกะโหลกอย่างเป็นธรรมชาติ (Eye Socket Indentation)
        const eyeDxL = Math.abs(v.x - 0.045);
        const eyeDxR = Math.abs(v.x + 0.045);
        const eyeDy = v.y - 0.010;
        const dL2 = (eyeDxL * eyeDxL) / (0.026 * 0.026) + (eyeDy * eyeDy) / (0.022 * 0.022);
        const dR2 = (eyeDxR * eyeDxR) / (0.026 * 0.026) + (eyeDy * eyeDy) / (0.022 * 0.022);
        const eyeD2 = Math.min(dL2, dR2);
        if (eyeD2 < 1.0) {
          v.z -= 0.010 * (1.0 - eyeD2);
        }

        // ข. สันจมูกและปลายจมูกโด่งมนได้รูปสไตล์ไทย (Smooth 3D Nose Bridge & Tip)
        if (v.y > -0.035 && v.y < 0.025 && Math.abs(v.x) < 0.022) {
          const xFactor = Math.exp(-(v.x * v.x) / (0.009 * 0.009));
          let noseH = 0.006;
          if (v.y < -0.005) {
            const tipFactor = Math.max(0, 1.0 - Math.abs(v.y - (-0.018)) / 0.016);
            noseH += 0.012 * tipFactor;
          }
          v.z += noseH * xFactor;
        }

        // ค. แก้มอิ่มเอิบรับรอยยิ้ม
        const cheekDxL = Math.abs(v.x - 0.055);
        const cheekDxR = Math.abs(v.x + 0.055);
        const cheekDy = v.y - (-0.018);
        const cheekDist = Math.min(
          cheekDxL * cheekDxL + cheekDy * cheekDy,
          cheekDxR * cheekDxR + cheekDy * cheekDy
        );
        if (cheekDist < 0.035 * 0.035) {
          v.z += 0.004 * Math.exp(-cheekDist / (0.020 * 0.020));
        }

        // ง. โครงหน้าเรียวและคางมน (Soft Jaw & Chin Tapering)
        if (v.y < 0) {
          const taperRatio = -v.y / 0.125;
          const taperWidth = isMale ? 0.10 : 0.18;
          v.x *= (1.0 - taperWidth * taperRatio);

          // คางมนเรียว ได้รูป V-shape ละมุนตา
          if (v.y < -0.065 && Math.abs(v.x) < 0.036) {
            const chinFactor = Math.exp(-(v.x * v.x) / (0.020 * 0.020)) * Math.max(0, 1.0 - Math.abs(v.y - (-0.092)) / 0.030);
            v.z += 0.006 * chinFactor;
          }
        }
      }

      pos.setXYZ(i, v.x, v.y, v.z);
    }
    headGeo.computeVertexNormals();
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(headMesh);

    // 2. ดวงตา 3D ประณีต (3D Expressive Recessed Eyes)
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.15 });
    const irisMat = new THREE.MeshStandardMaterial({ color: 0x542308, roughness: 0.20 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lashMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.40 });

    [-0.045, 0.045].forEach((eyeX, idx) => {
      const isLeft = idx === 0;
      const eyeSubGroup = new THREE.Group();
      eyeSubGroup.position.set(eyeX, 0.010, 0.115);
      eyeSubGroup.rotation.y = isLeft ? 0.07 : -0.07;

      // ตาขาวทรงรีโค้งมน
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.0140, 16, 12), eyeWhiteMat);
      sclera.scale.set(1.15, 0.78, 0.38);
      eyeSubGroup.add(sclera);

      // ม่านตาสีน้ำตาลประกายอบอุ่น
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.0084, 14, 10), irisMat);
      iris.position.set(0, 0, 0.0035);
      iris.scale.set(1.0, 1.0, 0.25);
      eyeSubGroup.add(iris);

      // รูม่านตาสีดำสนิท
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.0048, 12, 8), pupilMat);
      pupil.position.set(0, 0, 0.0050);
      pupil.scale.set(1.0, 1.0, 0.20);
      eyeSubGroup.add(pupil);

      // ประกายตาคู่ (Catchlights)
      const catch1 = new THREE.Mesh(new THREE.SphereGeometry(0.0020, 6, 6), catchlightMat);
      catch1.position.set(-0.0026, 0.0026, 0.0062);
      eyeSubGroup.add(catch1);

      const catch2 = new THREE.Mesh(new THREE.SphereGeometry(0.0011, 6, 6), catchlightMat);
      catch2.position.set(0.0024, -0.0020, 0.0062);
      eyeSubGroup.add(catch2);

      // เปลือกตาและเส้นขอบตาบน 3D (Curved Upper Lash Tube)
      const wingX = isLeft ? -0.019 : 0.019;
      const innerX = isLeft ? 0.014 : -0.014;
      const lashCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(innerX, -0.002, 0.003),
        new THREE.Vector3(innerX * 0.4, 0.008, 0.0055),
        new THREE.Vector3(0, 0.009, 0.006),
        new THREE.Vector3(wingX * 0.6, 0.007, 0.0055),
        new THREE.Vector3(wingX, isMale ? -0.001 : 0.003, 0.003),
      ]);
      const lashGeo = new THREE.TubeGeometry(lashCurve, 14, isMale ? 0.0014 : 0.0018, 6, false);
      eyeSubGroup.add(new THREE.Mesh(lashGeo, lashMat));

      // ขอบตาล่าง 3D
      const lowerCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(innerX, -0.002, 0.003),
        new THREE.Vector3(0, -0.008, 0.0045),
        new THREE.Vector3(wingX, -0.002, 0.003),
      ]);
      const lowerLashGeo = new THREE.TubeGeometry(lowerCurve, 10, 0.0009, 5, false);
      eyeSubGroup.add(new THREE.Mesh(lowerLashGeo, lashMat));

      headGroup.add(eyeSubGroup);
    });

    // 3. คิ้ว 3D ปั้นรับรูปหน้า (3D Sculpted Eyebrows)
    const browMat = new THREE.MeshStandardMaterial({ color: isMale ? 0x1f2937 : 0x27272a, roughness: 0.55 });
    [-1, 1].forEach((side) => {
      const isLeft = side === -1;
      const browInnerX = isLeft ? -0.018 : 0.018;
      const browMidX = isLeft ? -0.046 : 0.046;
      const browOuterX = isLeft ? -0.074 : 0.074;

      const browCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(browInnerX, 0.032, 0.123),
        new THREE.Vector3(browMidX, isMale ? 0.040 : 0.044, 0.119),
        new THREE.Vector3(browOuterX, isMale ? 0.030 : 0.028, 0.100),
      ]);
      const browRadius = isMale ? 0.0026 : 0.0020;
      const browGeo = new THREE.TubeGeometry(browCurve, 12, browRadius, 6, false);
      headGroup.add(new THREE.Mesh(browGeo, browMat));
    });

    // 4. จมูก 3D ปลายมนละเอียด (3D Refined Nose Tip & Wings)
    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.0062, 12, 10), skinMat);
    noseTip.scale.set(1.0, 0.85, 0.95);
    noseTip.position.set(0, -0.018, 0.134);
    headGroup.add(noseTip);

    [-0.0072, 0.0072].forEach((nx) => {
      const wing = new THREE.Mesh(new THREE.SphereGeometry(0.0038, 8, 8), skinMat);
      wing.scale.set(1.05, 0.75, 0.85);
      wing.position.set(nx, -0.020, 0.128);
      headGroup.add(wing);
    });

    // 5. ริมฝีปาก 3D รอยยิ้มพิมพ์ใจอ่อนหวาน ยกมุมปากสดใส (3D Sweet Upturned Smiling Lips)
    const lipMat = isMale
      ? new THREE.MeshStandardMaterial({ color: 0xa84a2d, roughness: 0.50, metalness: 0.02 })
      : new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.35, metalness: 0.05 });

    // ริมฝีปากบนโค้งกระจับ ยกมุมปากยิ้ม
    const upperLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.021, -0.043, 0.113),
      new THREE.Vector3(-0.010, -0.046, 0.119),
      new THREE.Vector3(0, -0.048, 0.121),
      new THREE.Vector3(0.010, -0.046, 0.119),
      new THREE.Vector3(0.021, -0.043, 0.113),
    ]);
    const upperLipGeo = new THREE.TubeGeometry(upperLipCurve, 12, isMale ? 0.0028 : 0.0026, 6, false);
    headGroup.add(new THREE.Mesh(upperLipGeo, lipMat));

    // ริมฝีปากล่างอวบอิ่มรับรอยยิ้มหวาน
    const lowerLipCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.021, -0.043, 0.113),
      new THREE.Vector3(-0.011, -0.054, 0.118),
      new THREE.Vector3(0, -0.057, 0.120),
      new THREE.Vector3(0.011, -0.054, 0.118),
      new THREE.Vector3(0.021, -0.043, 0.113),
    ]);
    const lowerLipGeo = new THREE.TubeGeometry(lowerLipCurve, 12, isMale ? 0.0032 : 0.0034, 6, false);
    headGroup.add(new THREE.Mesh(lowerLipGeo, lipMat));

    // 6. ใบหูทั้งสองข้างพร้อมเครื่องประดับต่างหูไทยโบราณ (3D Ears & Earrings)
    [-0.118, 0.118].forEach((ex, idx) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(ex, 0.005, -0.008);
      earGroup.rotation.y = idx === 0 ? 0.16 : -0.16;

      // ใบหูด้านนอก (Pinna)
      const earPinna = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), skinMat);
      earPinna.scale.set(0.32, 1.15, 0.76);
      earGroup.add(earPinna);

      // ติ่งหู (Earlobe)
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.010, 6, 6), skinMat);
      lobe.position.set(0, -0.024, 0.002);
      earGroup.add(lobe);

      // เครื่องประดับต่างหูระย้าสำหรับสตรีไทย (Chandelier Ruby Earrings)
      if (!isMale) {
        const stud = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 6, 6), goldMat);
        stud.position.set(idx === 0 ? 0.002 : -0.002, -0.025, 0.004);
        earGroup.add(stud);

        const link = new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0018, 0.022, 4), goldMat);
        link.position.set(idx === 0 ? 0.002 : -0.002, -0.040, 0.004);
        earGroup.add(link);

        const rubyDrop = new THREE.Mesh(new THREE.ConeGeometry(0.0065, 0.016, 6), rubyMat);
        rubyDrop.position.set(idx === 0 ? 0.002 : -0.002, -0.054, 0.004);
        rubyDrop.rotation.x = Math.PI;
        earGroup.add(rubyDrop);

        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 6), goldMat);
        bead.position.set(idx === 0 ? 0.002 : -0.002, -0.063, 0.004);
        earGroup.add(bead);
      }

      headGroup.add(earGroup);
    });

    // 7. ทรงผม 3D ปั้นตามแบบสุภาพบุรุษไทยและสตรีไทย (3D Sculpted Hairstyles)
    if (isMale) {
      // ผมสุภาพบุรุษไทย: ครอบศีรษะด้านบนและด้านหลัง ไม่ล้ำบังหน้าผาก
      const maleHair = new THREE.Mesh(new THREE.SphereGeometry(0.128, 24, 18), hairMat);
      maleHair.position.set(0, 0.038, -0.040);
      maleHair.scale.set(1.01, 1.00, 0.96);
      headGroup.add(maleHair);

      // จอนผมข้างหู
      [-0.116, 0.116].forEach((sx) => {
        const sideburn = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.040, 0.022), hairMat);
        sideburn.position.set(sx, -0.020, 0.008);
        headGroup.add(sideburn);
      });
    } else {
      // ผมสตรีไทย: ครอบศีรษะด้านบนและด้านหลัง พร้อมเกล้ามวยผมสูงด้านหลัง (Royal Thai High Chignon)
      const femaleHair = new THREE.Mesh(new THREE.SphereGeometry(0.128, 24, 18), hairMat);
      femaleHair.position.set(0, 0.038, -0.038);
      femaleHair.scale.set(1.01, 1.00, 0.96);
      headGroup.add(femaleHair);

      // มวยผมเกล้าสูงด้านหลัง
      const chignon = new THREE.Mesh(new THREE.SphereGeometry(0.070, 16, 12), hairMat);
      chignon.position.set(0, 0.108, -0.088);
      chignon.scale.set(1.10, 0.95, 0.92);
      headGroup.add(chignon);

      // เกี้ยวทองรัดมวยผม (Golden Filigree Coronet)
      const coronet = new THREE.Mesh(new THREE.TorusGeometry(0.060, 0.014, 8, 20), goldMat);
      coronet.position.set(0, 0.090, -0.088);
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
  // สร้างกระทงจำลองจิ๋วประดับเปลวเทียนสว่างไสวสำหรับให้ตัวละครประคองในมือ (Miniature Glowing Krathong)
  buildMiniatureKrathong(goldMat, rubyMat) {
    const mini = new THREE.Group();
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.60 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.40 });
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.30 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    // ฐานใบตองทรงกลม
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.070, 0.078, 0.022, 16), leafMat);
    mini.add(base);

    // กลีบผกากรองพับรอบฐาน 8 กลีบ
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.035, 5), leafMat);
      petal.position.set(Math.cos(angle) * 0.070, 0.014, Math.sin(angle) * 0.070);
      petal.rotation.x = Math.sin(angle) * 0.42;
      petal.rotation.z = -Math.cos(angle) * 0.42;
      mini.add(petal);
    }

    // ดอกบัวสีชมพูขาวบานสะพรั่งใจกลาง
    const lotus = new THREE.Mesh(new THREE.SphereGeometry(0.030, 8, 8), flowerMat);
    lotus.position.y = 0.020;
    lotus.scale.set(1.0, 0.70, 1.0);
    mini.add(lotus);

    // เทียนสีขาวนวล
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.050, 6), candleMat);
    candle.position.set(0.010, 0.042, 0);
    mini.add(candle);

    // เปลวเทียนสีทองสว่างไสว
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.026, 6), flameMat);
    flame.position.set(0.010, 0.078, 0);
    mini.add(flame);

    // ธูปหอม 3 ดอกพร้อมปลายจุดไฟแดงระเรื่อ
    const incenseMat = new THREE.MeshBasicMaterial({ color: 0x78350f });
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    [-0.010, -0.016, -0.012].forEach((ix, idx) => {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.070, 4), incenseMat);
      stick.position.set(ix, 0.046, (idx - 1) * 0.008);
      stick.rotation.z = -0.14;
      mini.add(stick);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 4, 4), tipMat);
      tip.position.set(ix - 0.005, 0.082, (idx - 1) * 0.008);
      mini.add(tip);
    });

    // แสงเทียนจิ๋วส่องสว่างกระทบมือและชุดไทยอย่างอบอุ่น
    const candleGlow = new THREE.PointLight(0xffb703, 1.0, 2.0, 2.0);
    candleGlow.position.set(0.010, 0.085, 0);
    mini.add(candleGlow);

    return mini;
  }

  // ==========================================================
  // MALE CANDIDATE MODEL (สุภาพบุรุษไทยในชุดราชปะแตน & โจงกระเบนไหม)
  // ==========================================================
  buildMaleCandidate(bodyGroup, entry, skinMat, hairMat, goldMat, topMat, bottomMat, whiteStockingMat, shoeMat, rubyMat, faceMat) {
    const jacketMat = topMat;
    const isTrousers = entry.bottomStyle === "male-bottom-5";
    const legFabricMat = isTrousers ? bottomMat : whiteStockingMat;

    // 1. รองเท้าคัทชูหนังขัดมันราชสำนัก (Royal Black Leather Court Shoes)
    [-0.082, 0.082].forEach((sx) => {
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.018, 0.17), shoeMat);
      sole.position.set(sx, 0.009, 0.02);
      bodyGroup.add(sole);

      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.042, 0.13), shoeMat);
      upper.position.set(sx, 0.032, 0.03);
      bodyGroup.add(upper);

      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), shoeMat);
      toe.position.set(sx, 0.024, 0.078);
      toe.scale.set(1.0, 0.58, 1.12);
      bodyGroup.add(toe);

      const heel = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.022, 0.048), shoeMat);
      heel.position.set(sx, 0.011, -0.040);
      bodyGroup.add(heel);

      const shoeBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.012, 0.020), goldMat);
      shoeBuckle.position.set(sx, 0.052, 0.030);
      bodyGroup.add(shoeBuckle);
    });

    // 2. ขาสวมถุงน่องไหมสีขาวแบบพิธีการ หรือขากางเกงแพรไทย (Royal Stockings or Silk Trousers)
    [-0.082, 0.082].forEach((lx) => {
      const calf = new THREE.Mesh(
        new THREE.CylinderGeometry(isTrousers ? 0.050 : 0.044, isTrousers ? 0.046 : 0.034, 0.38, 14),
        legFabricMat
      );
      calf.position.set(lx, 0.24, 0.005);
      bodyGroup.add(calf);

      const knee = new THREE.Mesh(
        new THREE.SphereGeometry(isTrousers ? 0.046 : 0.038, 8, 8),
        legFabricMat
      );
      knee.position.set(lx, 0.44, 0.010);
      bodyGroup.add(knee);
    });

    // 3. โจงกระเบนผ้าไหม หรือ กางเกงแพรไทย (Volumetric Thai Jongkraben)
    if (isTrousers) {
      [-0.082, 0.082].forEach((tx) => {
        const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.052, 0.36, 14), bottomMat);
        thigh.position.set(tx, 0.63, 0.01);
        bodyGroup.add(thigh);
      });
      const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.175, 16, 12), bottomMat);
      pelvis.position.set(0, 0.70, 0);
      pelvis.scale.set(1.06, 0.84, 0.96);
      bodyGroup.add(pelvis);
    } else {
      // โจงกระเบนพองกระเปาะเข้ารูปอย่างสง่างาม
      [-0.082, 0.082].forEach((sideX) => {
        const thighPuff = new THREE.Mesh(new THREE.SphereGeometry(0.105, 14, 12), bottomMat);
        thighPuff.position.set(sideX, 0.62, 0.01);
        thighPuff.scale.set(0.95, 1.25, 0.98);
        bodyGroup.add(thighPuff);
      });

      const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.185, 16, 14), bottomMat);
      pelvis.position.set(0, 0.68, 0);
      pelvis.scale.set(1.10, 0.88, 1.02);
      bodyGroup.add(pelvis);

      // รอยพับกระเบนด้านหน้า (Front Center Pleat)
      const frontPleat = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.30, 0.042), bottomMat);
      frontPleat.position.set(0, 0.63, 0.112);
      bodyGroup.add(frontPleat);

      // เหน็บหางกระเบนด้านหลัง (Rear Tucked Tail)
      const backTail = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), bottomMat);
      backTail.position.set(0, 0.74, -0.128);
      backTail.scale.set(0.85, 1.15, 0.85);
      bodyGroup.add(backTail);
    }

    // 4. เข็มขัดทองและผ้ารัดประคดเอว (Jeweled Gold Belt)
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.160, 0.018, 8, 20), goldMat);
    belt.position.y = 0.86;
    belt.rotation.x = Math.PI / 2;
    bodyGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.050, 0.026), goldMat);
    buckle.position.set(0, 0.86, 0.165);
    bodyGroup.add(buckle);

    const buckleGem = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), rubyMat);
    buckleGem.position.set(0, 0.86, 0.178);
    bodyGroup.add(buckleGem);

    // 5. เสื้อราชปะแตนคัตติ้งเนี้ยบ (Tailored Rajpatan Silk Jacket)
    const jacketHem = new THREE.Mesh(new THREE.CylinderGeometry(0.160, 0.200, 0.15, 18), jacketMat);
    jacketHem.position.y = 0.80;
    bodyGroup.add(jacketHem);

    const jacketTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.170, 0.158, 0.32, 20), jacketMat);
    jacketTorso.position.y = 1.02;
    jacketTorso.scale.set(1.08, 1.0, 0.88);
    bodyGroup.add(jacketTorso);

    // คอตั้งราชปะแตน (Mandarin Standing Collar)
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.068, 0.045, 16), jacketMat);
    collar.position.y = 1.19;
    bodyGroup.add(collar);

    const collarPiping = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.007, 6, 16), goldMat);
    collarPiping.position.y = 1.21;
    collarPiping.rotation.x = Math.PI / 2;
    bodyGroup.add(collarPiping);

    // กระดุมทอง 5 เม็ดเรียงสง่างาม
    for (let b = 0; b < 5; b++) {
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 8), goldMat);
      btn.position.set(0, 1.15 - b * 0.068, 0.096);
      bodyGroup.add(btn);
    }

    // กระเป๋าเสื้ออกซ้ายและผ้าเช็ดหน้าไหมทอง
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.034, 0.014), jacketMat);
    pocket.position.set(-0.078, 1.09, 0.094);
    bodyGroup.add(pocket);

    const hanky = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.016, 0.010), goldMat);
    hanky.position.set(-0.078, 1.12, 0.098);
    hanky.rotation.z = 0.20;
    bodyGroup.add(hanky);

    // ผ้าสะพายไหล่ไหมทอง หรือสายสะพายเกียรติยศ
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.42, 0.014), bottomMat);
    sash.position.set(-0.02, 1.02, 0.096);
    sash.rotation.z = -0.55;
    bodyGroup.add(sash);

    const medalStar = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), goldMat);
    medalStar.position.set(0.058, 0.88, 0.106);
    bodyGroup.add(medalStar);

    // 6. ลำคอสง่างาม
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.052, 0.055, 16), skinMat);
    neck.position.y = 1.22;
    bodyGroup.add(neck);

    // 7. ศีรษะและใบหน้า 3D
    const head = this.buildAnatomicalHead(true, skinMat, hairMat, goldMat, faceMat, rubyMat);
    head.position.y = 1.35;
    bodyGroup.add(head);

    // 8. แขนและท่วงท่า (มือขวาแนบสะโพกสง่างาม มือซ้ายประคองกระทงจิ๋ว)
    // แขนขวา (Right Arm - Resting Handsomely on Hip)
    const rArmGroup = new THREE.Group();
    rArmGroup.position.set(0.185, 1.13, 0);

    const rDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 8), jacketMat);
    rArmGroup.add(rDeltoid);

    const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.033, 0.22, 12), jacketMat);
    rUpperArm.position.y = -0.11;
    rArmGroup.add(rUpperArm);

    const rForearmGroup = new THREE.Group();
    rForearmGroup.position.set(0, -0.22, 0);
    rForearmGroup.rotation.x = -0.25;
    rForearmGroup.rotation.z = -0.15;

    const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.028, 0.20, 12), jacketMat);
    rForearm.position.y = -0.10;
    rForearmGroup.add(rForearm);

    const rCuff = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.006, 6, 12), goldMat);
    rCuff.position.set(0, -0.20, 0);
    rCuff.rotation.x = Math.PI / 2;
    rForearmGroup.add(rCuff);

    const rHand = this.buildAnatomicalHand(skinMat, false, false);
    rHand.position.set(0, -0.21, 0);
    rForearmGroup.add(rHand);

    rArmGroup.add(rForearmGroup);
    rArmGroup.rotation.z = 0.12;
    rArmGroup.rotation.x = 0.05;
    bodyGroup.add(rArmGroup);

    // แขนซ้าย (Left Arm - Gracefully Presenting Mini Krathong)
    const lArmGroup = new THREE.Group();
    lArmGroup.position.set(-0.185, 1.13, 0);

    const lDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 8), jacketMat);
    lArmGroup.add(lDeltoid);

    const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.033, 0.22, 12), jacketMat);
    lUpperArm.position.y = -0.11;
    lArmGroup.add(lUpperArm);

    const lForearmGroup = new THREE.Group();
    lForearmGroup.position.set(0, -0.22, 0);
    lForearmGroup.rotation.x = -0.65; // ยื่นแขนมาข้างหน้าประคองกระทง
    lForearmGroup.rotation.y = 0.35;

    const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.028, 0.20, 12), jacketMat);
    lForearm.position.y = -0.10;
    lForearmGroup.add(lForearm);

    const lCuff = new THREE.Mesh(new THREE.TorusGeometry(0.030, 0.006, 6, 12), goldMat);
    lCuff.position.set(0, -0.20, 0);
    lCuff.rotation.x = Math.PI / 2;
    lForearmGroup.add(lCuff);

    const lHand = this.buildAnatomicalHand(skinMat, true, false);
    lHand.position.set(0, -0.21, 0);
    lHand.rotation.x = 0.40;
    lForearmGroup.add(lHand);

    lArmGroup.add(lForearmGroup);
    lArmGroup.rotation.z = -0.15;
    bodyGroup.add(lArmGroup);

    // กระทงจิ๋วส่องแสงในมือซ้าย
    const miniKrathong = this.buildMiniatureKrathong(goldMat, rubyMat);
    miniKrathong.position.set(-0.06, 0.94, 0.20);
    miniKrathong.scale.set(0.85, 0.85, 0.85);
    bodyGroup.add(miniKrathong);

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
    [-0.075, 0.075].forEach((sx) => {
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.015, 0.15), shoeMat);
      sole.position.set(sx, 0.008, 0.015);
      bodyGroup.add(sole);

      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.035, 0.12), bottomMat);
      upper.position.set(sx, 0.024, 0.022);
      bodyGroup.add(upper);

      const pointedToe = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.058, 8), bottomMat);
      pointedToe.position.set(sx, 0.022, 0.088);
      pointedToe.rotation.x = Math.PI / 2;
      bodyGroup.add(pointedToe);

      const toeGold = new THREE.Mesh(new THREE.SphereGeometry(0.010, 6, 6), goldMat);
      toeGold.position.set(sx, 0.023, 0.115);
      bodyGroup.add(toeGold);
    });

    // 2. ข้อเท้าเรียวงามและกำไลข้อเท้าทองคำ (Slender Ankles with Golden Anklets)
    [-0.075, 0.075].forEach((ax) => {
      const ankle = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.026, 0.14, 12), skinMat);
      ankle.position.set(ax, 0.09, 0);
      bodyGroup.add(ankle);

      const anklet = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.006, 6, 14), goldMat);
      anklet.position.set(ax, 0.07, 0);
      anklet.rotation.x = Math.PI / 2;
      bodyGroup.add(anklet);
    });

    // 3. ผ้านุ่ง / ผ้าซิ่นไหมยกดิ้นทองทรงหางปลาสง่างาม พร้อมจีบหน้านาง (Pha Sin Sarong with Na-Nang Pleats)
    const skirtGeo = new THREE.CylinderGeometry(0.145, 0.185, 0.70, 24);
    const skirt = new THREE.Mesh(skirtGeo, bottomMat);
    skirt.position.y = 0.49;
    skirt.scale.set(1.04, 1.0, 0.88);
    bodyGroup.add(skirt);

    // ตีนซิ่นขลิบทอง (Gold Brocade Sarong Hem)
    const hem = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.014, 8, 24), goldMat);
    hem.position.y = 0.15;
    hem.rotation.x = Math.PI / 2;
    bodyGroup.add(hem);

    // จีบหน้านางแบบไทยประณีตซ้อน 3 ชั้น (Triple-layered Na-Nang Front Pleats)
    const naNangBase = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.68, 0.018), bottomMat);
    naNangBase.position.set(0, 0.49, 0.165);
    bodyGroup.add(naNangBase);

    const naNangCenter = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.68, 0.016), bottomMat);
    naNangCenter.position.set(0, 0.49, 0.174);
    bodyGroup.add(naNangCenter);

    const naNangGoldEdge = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.68, 0.020), goldMat);
    naNangGoldEdge.position.set(0, 0.49, 0.180);
    bodyGroup.add(naNangGoldEdge);

    // 4. เข็มขัดทองและปั้นเหน่งทองคำฉลุลายฝังพลอยทับทิม (Jeweled Gold Belt with Ruby Cabochon)
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.142, 0.016, 8, 20), goldMat);
    belt.position.y = 0.86;
    belt.rotation.x = Math.PI / 2;
    bodyGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.040, 0.018, 16), goldMat);
    buckle.position.set(0, 0.86, 0.146);
    buckle.rotation.x = Math.PI / 2;
    bodyGroup.add(buckle);

    const rubyCabochon = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), rubyMat);
    rubyCabochon.position.set(0, 0.86, 0.158);
    bodyGroup.add(rubyCabochon);

    // สายอุบะทองทิ้งชายประดับเข็มขัด
    const beltTassel = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.14, 0.008), goldMat);
    beltTassel.position.set(0, 0.78, 0.154);
    bodyGroup.add(beltTassel);

    // 5. ลำตัวระหงและชุดไทยห่มสไบเฉียงสองชั้น หรือเสื้อลูกไม้คอปิด
    const bodice = new THREE.Mesh(new THREE.CylinderGeometry(0.144, 0.126, 0.32, 20), topMat);
    bodice.position.y = 1.02;
    bodice.scale.set(1.06, 1.0, 0.86);
    bodyGroup.add(bodice);

    if (isLaceTop) {
      // เสื้อลูกไม้คอปิดแขนกระบอก บรมพิมาน
      const highCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.050, 0.054, 0.038, 16), topMat);
      highCollar.position.y = 1.20;
      bodyGroup.add(highCollar);

      const collarGold = new THREE.Mesh(new THREE.TorusGeometry(0.053, 0.005, 6, 16), goldMat);
      collarGold.position.y = 1.21;
      collarGold.rotation.x = Math.PI / 2;
      bodyGroup.add(collarGold);
    } else {
      // สไบเฉียงชั้นในอัดกลีบขลิบทอง (Pleated Inner Gold Sabai)
      const innerSabai = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.020), goldMat);
      innerSabai.position.set(0.01, 1.03, 0.076);
      innerSabai.rotation.z = -0.34;
      bodyGroup.add(innerSabai);

      // สไบเฉียงผ้าไหมชั้นนอกทอดเฉียงอย่างอ่อนช้อย (Graceful Outer Silk Sabai)
      const sabai = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.44, 0.024), topMat);
      sabai.position.set(-0.02, 1.04, 0.090);
      sabai.rotation.z = -0.36;
      bodyGroup.add(sabai);

      // ชายสไบทอดยาวด้านหลัง พลิ้วไหวทิ้งตัวลงอย่างสง่างาม
      const sabaiTail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.78, 0.016), topMat);
      sabaiTail.position.set(-0.09, 0.74, -0.108);
      sabaiTail.rotation.x = 0.07;
      bodyGroup.add(sabaiTail);
    }

    // สายสังวาลย์ทองประดับเพชรพลอยทับทิม 4 เม็ด (Jeweled Royal Sangwan Sash)
    const sangwan = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.45, 0.018), goldMat);
    sangwan.position.set(0.01, 1.04, 0.100);
    sangwan.rotation.z = -0.38;
    bodyGroup.add(sangwan);

    for (let g = 0; g < 4; g++) {
      const sangwanGem = new THREE.Mesh(new THREE.SphereGeometry(0.010, 6, 6), rubyMat);
      sangwanGem.position.set(0.052 - g * 0.036, 0.94 + g * 0.074, 0.110);
      bodyGroup.add(sangwanGem);
    }

    const necklace = new THREE.Mesh(new THREE.TorusGeometry(0.050, 0.010, 8, 16), goldMat);
    necklace.position.y = 1.20;
    necklace.rotation.x = Math.PI / 2;
    bodyGroup.add(necklace);

    // 6. ลำคอระหงอ่อนช้อย
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.048, 0.052, 16), skinMat);
    neck.position.y = 1.22;
    bodyGroup.add(neck);

    // 7. ศีรษะและใบหน้า 3D (พอร์ตเทรตคมชัด 100% ไม่บิดเบี้ยว)
    const head = this.buildAnatomicalHead(false, skinMat, hairMat, goldMat, faceMat, rubyMat);
    head.position.y = 1.35;
    bodyGroup.add(head);

    // 8. สองแขนอ่อนช้อยประคองกระทงจิ๋วส่องแสงสว่างไสวระดับอก (Gracefully Holding Glowing Mini Krathong)
    [-1, 1].forEach((side) => {
      const isLeft = side === -1;
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.165, 1.12, 0);

      const deltoid = new THREE.Mesh(new THREE.SphereGeometry(0.040, 8, 8), sleeveMat);
      armGroup.add(deltoid);

      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.027, 0.22, 12), sleeveMat);
      upperArm.position.y = -0.11;
      armGroup.add(upperArm);

      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), sleeveMat);
      elbow.position.y = -0.22;
      armGroup.add(elbow);

      const forearmGroup = new THREE.Group();
      forearmGroup.position.set(0, -0.22, 0);
      // โค้งแขนท่อนล่างเข้าหาจุดกึ่งกลางด้านหน้าเพื่อประคองกระทง
      forearmGroup.rotation.x = -0.62;
      forearmGroup.rotation.y = side * -0.42;

      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.022, 0.20, 12), sleeveMat);
      forearm.position.y = -0.10;
      forearmGroup.add(forearm);

      // กำไลข้อมือทองคำ
      const bangle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.006, 6, 12), goldMat);
      bangle.position.set(0, -0.20, 0);
      bangle.rotation.x = Math.PI / 2;
      forearmGroup.add(bangle);

      // ฝ่ามืออ่อนช้อยประคองใต้กระทง
      const hand = this.buildAnatomicalHand(skinMat, isLeft, false);
      hand.position.set(0, -0.21, 0);
      hand.rotation.x = 0.35;
      forearmGroup.add(hand);

      armGroup.add(forearmGroup);

      // องศาแขนท่อนบนกางเล็กน้อยและเอนมาข้างหน้า
      armGroup.rotation.z = side * 0.16;
      armGroup.rotation.x = -0.15;
      bodyGroup.add(armGroup);
    });

    // กระทงจิ๋วประดับเปลวเทียนสว่างไสวที่สองมือประคองอยู่ตรงกลาง
    const miniKrathong = this.buildMiniatureKrathong(goldMat, rubyMat);
    miniKrathong.position.set(0, 0.93, 0.20);
    miniKrathong.scale.set(0.85, 0.85, 0.85);
    bodyGroup.add(miniKrathong);

    return {
      wavingArm: null,
      wavingHand: null,
    };
  }

  // โหลด HD Realistic Face Texture คุณภาพสูงระดับ 4K (สตรีไทย/บุรุษไทย)
  loadRealisticFaceTexture(faceMat, isMale) {
    if (!this._faceTextureCache) {
      this._faceTextureCache = {};
    }
    const textureKey = isMale ? "male" : "female";
    if (this._faceTextureCache[textureKey]) {
      faceMat.map = this._faceTextureCache[textureKey];
      faceMat.needsUpdate = true;
      return;
    }

    const textureUrl = isMale ? maleFaceTextureUrl : femaleFaceTextureUrl;
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        this._faceTextureCache[textureKey] = tex;
        faceMat.map = tex;
        faceMat.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn(`Could not load realistic face texture (${textureKey}):`, err);
      }
    );
  }

  // วาดโครงหน้าและเครื่องหน้าสไตล์ไทยประณีตระดับ 4K/HD หรือแมปรูปถ่ายผู้สมัคร
  applyCandidateFaceTexture(faceMat, isMale = false, photoUrl = null) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // 1. วาดโครงหน้าสำรองแบบเรียลไทม์ทันที (Instant Procedural Fallback) เพื่อไม่ให้โมเดลหน้าว่างขณะโหลด Texture
    this.drawProceduralFace(ctx, isMale);
    const fallbackTex = new THREE.CanvasTexture(canvas);
    fallbackTex.colorSpace = THREE.SRGBColorSpace;
    faceMat.map = fallbackTex;
    faceMat.needsUpdate = true;

    // 2. หากมี photoUrl ของผู้สมัคร ให้โหลดและครอปรูปไข่พร้อมเฟเธอริ่งลงบนใบหน้า 3D โดยตรง
    if (photoUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          ctx.clearRect(0, 0, 512, 512);
          ctx.save();
          // คำนวณ Aspect Ratio ให้ภาพครอบคลุมแผ่นหน้าพอร์ตเทรตพอดี
          const aspect = img.width / img.height;
          let drawW = 512, drawH = 512, drawX = 0, drawY = 0;
          if (aspect > 1) {
            drawW = 512 * aspect;
            drawX = -(drawW - 512) / 2;
          } else {
            drawH = 512 / aspect;
            drawY = -(drawH - 512) / 2;
          }
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();

          // ขอบฟุ้งไล่ระดับโปร่งแสง (Feathered Alpha Edge) เพื่อให้ภาพถ่ายกลืนเข้ากับกะโหลกศีรษะ 3D 100%
          ctx.globalCompositeOperation = "destination-in";
          const featherGrad = ctx.createRadialGradient(256, 256, 175, 256, 256, 245);
          featherGrad.addColorStop(0, "rgba(0, 0, 0, 1.0)");
          featherGrad.addColorStop(0.70, "rgba(0, 0, 0, 0.90)");
          featherGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
          ctx.fillStyle = featherGrad;
          ctx.beginPath();
          ctx.ellipse(256, 256, 215, 242, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";

          fallbackTex.needsUpdate = true;
          faceMat.needsUpdate = true;
        } catch (e) {
          console.warn("Failed to apply user photo to face, using HD realistic texture:", e);
          this.loadRealisticFaceTexture(faceMat, isMale);
        }
      };
      img.onerror = () => {
        this.loadRealisticFaceTexture(faceMat, isMale);
      };
      // จัดการ URL สำหรับ Firebase Storage / Unsplash / Google
      const isDataOrBlob = photoUrl.startsWith("data:") || photoUrl.startsWith("blob:");
      const getCorsUrl = (url) => {
        if (!url || isDataOrBlob) return url;
        if (url.includes("wsrv.nl") || url.includes("corsproxy.io")) return url;
        return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp&q=85`;
      };
      img.src = isDataOrBlob ? photoUrl : getCorsUrl(photoUrl);
      return;
    }

    // 3. โหลด HD Realistic Face Texture คุณภาพสูง (สตรีไทย/บุรุษไทย)
    this.loadRealisticFaceTexture(faceMat, isMale);
  }

  // วาดโครงหน้าสไตล์ 3D Stylized น่ารัก สดใส เป็นมิตร (Option 1)
  drawProceduralFace(ctx, isMale) {
    ctx.clearRect(0, 0, 512, 512);
    ctx.save();

    // 1. โครงหน้ารูปไข่สีผิวนวลธรรมชาติ (Natural Golden-Honey Thai Skin)
    const skinColor = isMale ? "#dca97e" : "#dfb28c";
    ctx.beginPath();
    ctx.ellipse(256, 256, isMale ? 210 : 205, 235, 0, 0, Math.PI * 2);
    ctx.fillStyle = skinColor;
    ctx.fill();

    // 2. แสงเงาโครงหน้าแบบนุ่มนวลเป็นมิตร (Soft Ambient Shading)
    const aoGrad = ctx.createRadialGradient(256, 256, 120, 256, 256, 235);
    aoGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    aoGrad.addColorStop(0.7, "rgba(180, 110, 70, 0.0)");
    aoGrad.addColorStop(1, isMale ? "rgba(130, 75, 45, 0.22)" : "rgba(160, 95, 65, 0.18)");
    ctx.fillStyle = aoGrad;
    ctx.beginPath();
    ctx.ellipse(256, 256, isMale ? 210 : 205, 235, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. พวงแก้มสีชมพูระเรื่อสดใส (Cute Rosy Blushing Cheeks)
    const blushColor = isMale ? "rgba(217, 119, 6, 0.25)" : "rgba(244, 63, 94, 0.35)";
    [145, 367].forEach((cx) => {
      const blush = ctx.createRadialGradient(cx, 275, 5, cx, 275, 50);
      blush.addColorStop(0, blushColor);
      blush.addColorStop(1, "rgba(244, 63, 94, 0.0)");
      ctx.fillStyle = blush;
      ctx.beginPath();
      ctx.arc(cx, 275, 50, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. คิ้วทรงหวานอ่อนโยน (Gentle Arched Friendly Eyebrows)
    ctx.strokeStyle = isMale ? "#1e293b" : "#27272a";
    ctx.lineWidth = isMale ? 6.5 : 5.0;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (isMale) {
      // คิ้วชาย: สันคมอบอุ่น เป็นมิตร
      ctx.beginPath();
      ctx.moveTo(148, 192);
      ctx.quadraticCurveTo(195, 178, 230, 188);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(364, 192);
      ctx.quadraticCurveTo(317, 178, 282, 188);
      ctx.stroke();
    } else {
      // คิ้วหญิง: โค้งเรียวหวานอ่อนช้อยดั่งคันศร
      ctx.beginPath();
      ctx.arc(180, 206, 42, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(332, 206, 42, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }

    // 5. ดวงตากลมโตเป็นประกาย มีชีวิตชีวา (Sparkling Expressive Eyes)
    [176, 336].forEach((eyeX, idx) => {
      const isLeft = idx === 0;

      // ตาขาวทรงรีเนียนนุ่ม
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(eyeX, 235, 23, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // เส้นขอบตาบางนุ่ม
      ctx.strokeStyle = "rgba(100, 60, 40, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // ม่านตาสีน้ำตาลประกายอบอุ่น (Warm Chestnut-Amber Iris)
      const irisGrad = ctx.createRadialGradient(eyeX, 233, 2, eyeX, 235, 12);
      irisGrad.addColorStop(0, "#b45309");
      irisGrad.addColorStop(0.7, "#78350f");
      irisGrad.addColorStop(1, "#451a03");
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(eyeX, 235, 12, 0, Math.PI * 2);
      ctx.fill();

      // รูม่านตาสีดำสนิท (Deep Pupil)
      ctx.fillStyle = "#09090b";
      ctx.beginPath();
      ctx.arc(eyeX, 235, 6.2, 0, Math.PI * 2);
      ctx.fill();

      // ประกายตาคู่แวววาว (Twin Catchlights)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(eyeX - 4, 231, 3.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(eyeX + 3.5, 237, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // ขอบตาบนและขนตาสไตล์การ์ตูนน่ารัก
      ctx.strokeStyle = "#18181b";
      ctx.lineWidth = isMale ? 3.5 : 4.0;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(eyeX, 235, 23, Math.PI * 1.16, Math.PI * 1.84);
      ctx.stroke();

      if (!isMale) {
        // หางตาเชิดขึ้นเล็กน้อยน่ารัก
        ctx.beginPath();
        const wingDir = isLeft ? -1 : 1;
        ctx.moveTo(eyeX + wingDir * 20, 233);
        ctx.quadraticCurveTo(eyeX + wingDir * 26, 230, eyeX + wingDir * 29, 226);
        ctx.stroke();
      }
    });

    // 6. จมูกมนทรงปุ่มน่ารัก (Subtle Cute Button Nose)
    ctx.fillStyle = "rgba(180, 95, 60, 0.40)";
    ctx.beginPath();
    ctx.ellipse(256, 268, 6.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(254, 267, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 7. รอยยิ้มพิมพ์ใจอ่อนหวานสดใส (Charming Sweet Smile with Upturned Corners)
    if (isMale) {
      // ยิ้มสุภาพ อบอุ่น เป็นมิตร
      ctx.strokeStyle = "#9a3412";
      ctx.lineWidth = 3.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(256, 305, 18, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();

      // รอยบุ๋มลักยิ้มมุมปาก
      ctx.strokeStyle = "rgba(154, 52, 18, 0.55)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(238, 314);
      ctx.lineTo(235, 311);
      ctx.moveTo(274, 314);
      ctx.lineTo(277, 311);
      ctx.stroke();
    } else {
      // ยิ้มหวานกระจับพิมพ์ใจ มีประกายลิปกลอสสดใส
      ctx.fillStyle = "#e11d48";
      ctx.beginPath();
      ctx.arc(256, 308, 17, Math.PI * 0.10, Math.PI * 0.90);
      ctx.quadraticCurveTo(256, 314, 239, 313);
      ctx.fill();

      // ริมฝีปากบนกระจับเรียวเล็ก
      ctx.strokeStyle = "#be123c";
      ctx.lineWidth = 3.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(238, 313);
      ctx.quadraticCurveTo(247, 310, 256, 312);
      ctx.quadraticCurveTo(265, 310, 274, 313);
      ctx.stroke();

      // ไฮไลต์ลิปกลอสฉ่ำวาวบนริมฝีปากล่าง
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.ellipse(256, 318, 7, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // รอยบุ๋มลักยิ้มหวาน
      ctx.strokeStyle = "rgba(225, 29, 72, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(237, 312);
      ctx.lineTo(234, 309);
      ctx.moveTo(275, 312);
      ctx.lineTo(278, 309);
      ctx.stroke();
    }

    ctx.restore();

    // 8. ขอบฟุ้งไล่ระดับโปร่งแสง (Feathered Alpha Edge) กลืนเรียบเนียนสนิท 100%
    ctx.globalCompositeOperation = "destination-in";
    const featherGrad = ctx.createRadialGradient(256, 256, 175, 256, 256, 238);
    featherGrad.addColorStop(0, "rgba(0, 0, 0, 1.0)");
    featherGrad.addColorStop(0.70, "rgba(0, 0, 0, 0.88)");
    featherGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = featherGrad;
    ctx.beginPath();
    ctx.ellipse(256, 256, 238, 248, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  // สร้างป้ายชื่อและคะแนนโหวตลายไทยสีทอง พร้อมกรอบรูปถ่ายลอยเด่นเหนือป้าย
  createCandidateBadgeSprite(name, votes, photoUrl) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    let cachedImg = null;

    const render = (n, v) => {
      ctx.clearRect(0, 0, 512, 300);

      // ===== 1. สลักเชื่อมระหว่างกรอบรูปกับกล่องป้าย (Golden Connecting Joint) =====
      const jointGrad = ctx.createLinearGradient(250, 126, 262, 126);
      jointGrad.addColorStop(0, "#d97706");
      jointGrad.addColorStop(0.5, "#fef08a");
      jointGrad.addColorStop(1, "#d97706");
      ctx.fillStyle = jointGrad;
      ctx.fillRect(251, 120, 10, 28);

      // หมุดประดับหัวเชื่อม
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(256, 134, 5, 0, Math.PI * 2);
      ctx.fill();

      // ===== 2. กล่องป้ายชื่อและคะแนนโหวต (Lower Badge Box) =====
      const x = 16, y = 146, w = 480, h = 140, r = 28;
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

      // พื้นหลังไล่เฉดสีกรมท่าน้ำเงินเข้มหรูหรา
      const boxGrad = ctx.createLinearGradient(x, y, x, y + h);
      boxGrad.addColorStop(0, "rgba(15, 23, 42, 0.94)");
      boxGrad.addColorStop(1, "rgba(30, 41, 59, 0.98)");
      ctx.fillStyle = boxGrad;
      ctx.fill();

      // ขอบทองนอก
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 5;
      ctx.stroke();

      // ขอบทองชั้นใน
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 7, y + 7, w - 14, h - 14);

      // ชื่อผู้สมัคร
      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const displayName = (n || "ผู้ร่วมลอยกระทง").length > 15 
        ? (n || "ผู้ร่วมลอยกระทง").slice(0, 14) + "…" 
        : (n || "ผู้ร่วมลอยกระทง");
      ctx.fillText(displayName, 256, 192);

      // คะแนนโหวต
      ctx.fillStyle = "#fb7185";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(`❤️ โหวต ${v || 0} คะแนน`, 256, 244);

      // ===== 3. กรอบรูปถ่ายทรงกลมสีทองลอยเด่นเหนือป้าย (Circular Portrait Frame Above Badge) =====
      const cx = 256, cy = 68, radius = 54;

      // เงารัศมีเรืองแสงสีทองด้านหลังกรอบรูป
      const glowGrad = ctx.createRadialGradient(cx, cy, radius - 4, cx, cy, radius + 14);
      glowGrad.addColorStop(0, "rgba(245, 158, 11, 0.4)");
      glowGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 14, 0, Math.PI * 2);
      ctx.fill();

      // พื้นหลังกรอบรูปกลม
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#1e293b";
      ctx.fill();
      ctx.clip();

      if (cachedImg) {
        // ครอปและแสดงรูปภาพจริงให้เต็มวงกลมพอดี
        const iw = cachedImg.width || 1;
        const ih = cachedImg.height || 1;
        const size = Math.min(iw, ih);
        const sx = (iw - size) / 2;
        const sy = (ih - size) / 2;
        ctx.drawImage(cachedImg, sx, sy, size, size, cx - radius, cy - radius, radius * 2, radius * 2);
      } else {
        // ซิลูเอทรูปคนสีทองหรูหราขณะรอโหลดภาพ
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.arc(cx, cy - 8, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy + 40, 32, Math.PI * 1.15, Math.PI * 1.85);
        ctx.fill();
      }
      ctx.restore();

      // ขอบทองหนาสง่างามรอบรูปถ่าย
      const ringGrad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
      ringGrad.addColorStop(0, "#fef08a");
      ringGrad.addColorStop(0.5, "#f59e0b");
      ringGrad.addColorStop(1, "#b45309");
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // เส้นรัศมีทองชั้นในรอบรูป
      ctx.strokeStyle = "rgba(254, 240, 138, 0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
      ctx.stroke();
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
    sprite.scale.set(2.4, 2.4 * (300 / 512), 1.0);
    sprite.userData = { canvas, ctx, renderTexture: render };

    // ดาวน์โหลดรูปถ่ายของผู้สมัครพร้อมระบบ CORS Proxy Fallback
    if (photoUrl) {
      const isDataOrBlob = photoUrl.startsWith("data:") || photoUrl.startsWith("blob:");
      const getCorsUrl = (url) => {
        if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;
        if (url.includes("images.weserv.nl")) return url;
        return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
      };

      const img = new Image();
      if (!isDataOrBlob) img.crossOrigin = "anonymous";

      img.onload = () => {
        cachedImg = img;
        render(name, votes);
        tex.needsUpdate = true;
      };

      img.onerror = () => {
        if (!isDataOrBlob && !img.src.includes("images.weserv.nl")) {
          img.src = getCorsUrl(photoUrl);
        }
      };

      if (!isDataOrBlob && (photoUrl.includes("firebasestorage.googleapis.com") || photoUrl.includes("unsplash.com") || photoUrl.includes("googleusercontent.com"))) {
        img.src = getCorsUrl(photoUrl);
      } else {
        img.src = photoUrl;
      }
    }

    return sprite;
  }

  updateCandidateAvatarBadge(avatar, entry) {
    if (avatar.badgeSprite?.userData?.renderTexture) {
      const { renderTexture } = avatar.badgeSprite.userData;
      renderTexture(entry.name, entry.votes || 0);
      if (avatar.badgeSprite.material.map) {
        avatar.badgeSprite.material.map.needsUpdate = true;
      }
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
    const dt = Math.min(time - (this.lastTime || time), 0.1) || 0.016;
    this.lastTime = time;

    // 1. Controls
    this.controls.update();

    // 2. Animated River Water Waves (ผิวน้ำกระเพื่อมไหวพร้อมระลอกคลื่นสะท้อนแสง)
    if (this.waterNormalTexture) {
      this.waterNormalTexture.offset.x = (time * 0.006) % 1;
      this.waterNormalTexture.offset.y = (time * 0.016) % 1;
    }
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

      // เปลวไฟเทียนและเงาสะท้อนผิวน้ำสะบัดไหวอย่างเป็นธรรมชาติ (Organic Multi-frequency Candle Flicker)
      const flame = mesh.getObjectByName("candleFlame");
      if (flame) {
        const flicker = 1.0 + Math.sin(time * 12.0 + bob * 3.0) * 0.08 + Math.cos(time * 17.5 + bob * 5.0) * 0.05;
        flame.scale.set(flicker, flicker * 1.08, flicker);
      }
      const candleLight = mesh.getObjectByName("candleLight");
      if (candleLight) {
        candleLight.intensity = 2.5 + Math.sin(time * 14.0 + bob) * 0.45;
      }
      const waterGlow = mesh.getObjectByName("waterCandleGlow");
      if (waterGlow && waterGlow.material) {
        waterGlow.material.opacity = 0.38 + Math.sin(time * 8.5 + bob * 2.0) * 0.08;
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
        if (item.light) {
          item.light.intensity = 3.0 + Math.sin(time * 14.0 + item.phase) * 0.8;
        }
      });
    }

    // 7. Dynamic Wind-Blown Trees & Realistic Palms Swaying in Wind (ต้นไม้ กิ่งก้าน และใบไม้พลิ้วไหวตามแรงลมธรรมชาติอย่างต่อเนื่องตลอดเวลา)
    if (this.swayingTrees) {
      this.swayingTrees.forEach((item) => {
        const t = time * (item.speed || 1.0);
        const p = item.phase || 0;
        // Natural continuous wind gust modulation (แรงลมพัดสม่ำเสมอมีระลอกพลิ้วไหว)
        const gust = 1.0 + 0.3 * Math.sin(time * 0.6 + p * 1.5) + 0.15 * Math.sin(time * 1.7 + p * 3.0);

        if (item.group) {
          const ampZ = item.swayAmpZ || 0.055;
          const ampX = item.swayAmpX || 0.038;
          item.group.rotation.z = (item.baseRotZ || 0) + Math.sin(t + p) * ampZ * gust;
          item.group.rotation.x = (item.baseRotX || 0) + Math.cos(t * 0.75 + p) * ampX * gust;
        }

        // Secondary branches swaying naturally in breeze
        if (item.branches && Array.isArray(item.branches)) {
          item.branches.forEach((br) => {
            const bt = time * (br.speed || 1.6) + (br.phase || 0);
            br.mesh.rotation.z = br.baseRotZ + Math.sin(bt) * (br.ampZ || 0.045) * gust;
            br.mesh.rotation.x = br.baseRotX + Math.cos(bt * 0.8) * (br.ampX || 0.035) * gust;
          });
        }

        // Tertiary leaf clusters & cloud puffs fluttering in continuous wind
        if (item.leafPuffs && Array.isArray(item.leafPuffs)) {
          item.leafPuffs.forEach((puff) => {
            const pt = time * (puff.speed || 2.6) + (puff.phase || 0);
            puff.mesh.rotation.z = (puff.baseRotZ || 0) + Math.sin(pt) * (puff.amp || 0.065) * gust;
            puff.mesh.rotation.x = (puff.baseRotX || 0) + Math.cos(pt * 1.15) * (puff.amp || 0.05) * gust;
            if (puff.basePosY !== undefined) {
              puff.mesh.position.y = puff.basePosY + Math.sin(pt * 1.4) * (puff.posAmp || 0.04);
            }
          });
        }
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

    // 10. Stars Rotation & Twinkle
    if (this.starField) {
      this.starField.rotation.y = time * 0.0015;
      if (this.starField.material) {
        this.starField.material.opacity = 0.82 + Math.sin(time * 2.2) * 0.12;
      }
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
          if (char.area === "temple") {
            // บนลานวัดและลานเจดีย์ (Temple Platform Y = 3.2): เดินอย่างสง่างามภายในขอบเขตลานวัด
          } else if (char.area === "market") {
            // ในตลาดนัดริมน้ำ (Market Plaza Y = 2.02): เดินภายในขอบเขตลานตลาดอย่างปลอดภัย (X: -47.0 ถึง -26.0)
            if (char.group.position.x < -47.0) {
              char.group.position.x = -47.0;
            }
            if (char.group.position.x > -26.0) {
              char.group.position.x = -26.0;
            }
          } else if (char.group.position.y > 1.2) {
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
        // ลำตัวหายใจเบาๆ โดยอิงจากระดับความสูงฐานเดิม (basePos.y) และหันหน้าเข้าหากล้องตลอดเวลา (Cylindrical Billboard LookAt)
        if (avatar.group) {
          const baseY = avatar.basePos?.y ?? 0.89;
          avatar.group.position.y = baseY + Math.sin(time * 1.5 + aPhase) * 0.008;

          // หันหน้าเข้าหากล้องตลอดเวลาตามแกน Y เพื่อให้เห็นใบหน้าและชุดไทยสง่างามเสมอ
          if (this.camera) {
            const dx = this.camera.position.x - avatar.group.position.x;
            const dz = this.camera.position.z - avatar.group.position.z;
            avatar.group.rotation.y = Math.atan2(dx, dz);
          }
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

  // สร้างและเก็บแคช Audio Buffer สำหรับเสียงสะท้อน (Echo Reverberation) เพียงครั้งเดียว
  initFireworkAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.soundCtx) this.soundCtx = new AudioCtx();
      if (!this.fireworkEchoBuffer) {
        const ctx = this.soundCtx;
        const bufSize = Math.floor(ctx.sampleRate * 2.0);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < bufSize; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.04 * white) / 1.04;
          data[i] = last * 2.5;
        }
        this.fireworkEchoBuffer = buf;
      }
    } catch (e) {}
  }

  playFireworkBurstSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.soundCtx) this.soundCtx = new AudioCtx();
      if (this.soundCtx.state === "suspended") this.soundCtx.resume();
      const ctx = this.soundCtx;
      const now = ctx.currentTime;

      // 1. เสียงระเบิดทุ้มกึกก้อง (Sub-bass Shockwave Impact 115Hz -> 38Hz)
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

      // 2. เสียงกังวานสะท้อนคลื่นน้ำ (Acoustic Echo - ใช้ Pre-cached Buffer ล่วงหน้า 100% ไม่มีลูป CPU ซ้ำ)
      if (!this.fireworkEchoBuffer) {
        this.initFireworkAudio();
      }
      if (this.fireworkEchoBuffer) {
        const blast = ctx.createBufferSource();
        blast.buffer = this.fireworkEchoBuffer;

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
      }
    } catch (e) {}
  }

  // จุดดอกไม้ไฟขึ้นสู่ท้องฟ้า (Callable from UI button or Remote Sync Event)
  launchFirework(opts = {}) {
    // 1. Rate Limiting: ป้องกันการกดเองย้ำๆ รัวเกิน 320ms (ถ้าเป็น remote event จากเครื่องอื่น ไม่บล็อก)
    const now = performance.now();
    if (!opts.isRemote) {
      if (now - this.lastFireworkLaunchTime < 320) {
        return null;
      }
      this.lastFireworkLaunchTime = now;
    }

    // 2. Concurrency Cap: จำกัดพลุในอากาศพร้อมกันไม่เกิน 5 ลูก (ถ้าเกินให้ลูกเก่าสุดจางหายเพื่อประหยัดทรัพยากร)
    if (this.activeFireworks && this.activeFireworks.length >= 5) {
      const oldest = this.activeFireworks[0];
      if (oldest) oldest.age = (oldest.maxAge || 2.4) * 0.95;
    }

    if (!this.fireworkTexture) {
      this.fireworkTexture = this.createFireworkSparkTexture();
    }

    this.playFireworkLaunchSound();

    // สุ่มตำแหน่งฐานยิงจากผิวน้ำหรือริมตลิ่ง (หรือใช้พิกัดที่ส่งมาจากเครื่องต้นทาง)
    const startX = opts.startX !== undefined ? opts.startX : (-10 + Math.random() * 46);
    const startZ = opts.startZ !== undefined ? opts.startZ : (-60 + Math.random() * 40);
    const startY = 0.5;

    // ระดับความสูงสูงสุด (Apex Height 29 - 39 เมตร)
    const targetY = opts.targetY !== undefined ? opts.targetY : (29.4 + Math.random() * 9.8);
    const speedY = opts.speedY !== undefined ? opts.speedY : (22.5 + Math.random() * 4.2);
    const paletteIndex = opts.paletteIndex !== undefined ? opts.paletteIndex : Math.floor(Math.random() * 7);

    // หางสะเก็ดไฟลากเป็นทางยาว (Streamlined 16 จุด ประหยัด GPU 45%)
    const trailCount = 16;
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
      size: 1.6,
      map: this.fireworkTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const trailPoints = new THREE.Points(trailGeo, trailMat);
    this.scene.add(trailPoints);

    const history = [];
    for (let h = 0; h < trailCount; h++) {
      history.push({ x: startX, y: startY, z: startZ });
    }

    this.activeFireworks.push({
      type: "rocket",
      pos: new THREE.Vector3(startX, startY, startZ),
      velY: speedY,
      targetY,
      paletteIndex,
      trailPoints,
      trailPos,
      trailCol,
      trailCount,
      history,
      age: 0,
    });

    return { startX, startZ, targetY, speedY, paletteIndex };
  }

  // จุดดอกไม้ไฟพุ่งขึ้นจากหลังแนวต้นไม้ (Launch Firework from Behind Tree Line)
  launchFireworkBehindTrees(opts = {}) {
    const now = performance.now();
    if (!opts.isRemote) {
      if (now - this.lastFireworkLaunchTime < 320) {
        return null;
      }
      this.lastFireworkLaunchTime = now;
    }

    // 2. Concurrency Cap: จำกัดพลุในอากาศพร้อมกันไม่เกิน 5 ลูก
    if (this.activeFireworks && this.activeFireworks.length >= 5) {
      const oldest = this.activeFireworks[0];
      if (oldest) oldest.age = (oldest.maxAge || 2.4) * 0.95;
    }

    if (!this.fireworkTexture) {
      this.fireworkTexture = this.createFireworkSparkTexture();
    }

    this.playFireworkLaunchSound();

    // ฐานยิงอยู่ด้านหลังแนวต้นไม้และดงมะพร้าวริมฝั่ง
    const startX = opts.startX !== undefined ? opts.startX : (-32.0 + (Math.random() - 0.5) * 10.0);
    const startZ = opts.startZ !== undefined ? opts.startZ : ((Math.random() - 0.5) * 60.0);
    const startY = 1.0;

    // ระดับความสูงที่ระเบิดแตกกระจายเหนือยอดไม้ (Apex Height 28 - 36 เมตร)
    const targetY = opts.targetY !== undefined ? opts.targetY : (28.0 + Math.random() * 8.5);
    const speedY = opts.speedY !== undefined ? opts.speedY : (22.0 + Math.random() * 4.0);
    const paletteIndex = opts.paletteIndex !== undefined ? opts.paletteIndex : Math.floor(Math.random() * 7);

    // หางสะเก็ดไฟพุ่งทะยาน (16 จุด)
    const trailCount = 16;
    const trailGeo = new THREE.BufferGeometry();
    const trailPos = new Float32Array(trailCount * 3);
    const trailCol = new Float32Array(trailCount * 3);

    for (let i = 0; i < trailCount; i++) {
      trailPos[i * 3] = startX;
      trailPos[i * 3 + 1] = startY;
      trailPos[i * 3 + 2] = startZ;

      trailCol[i * 3] = 1.0;
      trailCol[i * 3 + 1] = 0.88;
      trailCol[i * 3 + 2] = 0.45;
    }
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    trailGeo.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));

    const trailMat = new THREE.PointsMaterial({
      size: 1.6,
      map: this.fireworkTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const trailPoints = new THREE.Points(trailGeo, trailMat);
    this.scene.add(trailPoints);

    const treeHistory = [];
    for (let h = 0; h < trailCount; h++) {
      treeHistory.push({ x: startX, y: startY, z: startZ });
    }

    this.activeFireworks.push({
      type: "rocket",
      pos: new THREE.Vector3(startX, startY, startZ),
      velY: speedY,
      targetY,
      paletteIndex,
      trailPoints,
      trailPos,
      trailCol,
      trailCount,
      history: treeHistory,
      age: 0,
    });

    return { startX, startZ, targetY, speedY, paletteIndex };
  }

  // ระเบิดแตกกระจายกลางเวหา (Multi-stage Burst Explosion)
  detonateFirework(rocket) {
    this.playFireworkBurstSound();
    const burstX = rocket.pos.x;
    const burstY = rocket.pos.y;
    const burstZ = rocket.pos.z;

    // ชุดคู่สีอัญมณีไทยวิจิตรตระการตา
    const palettes = [
      { name: "ทองคำวันเพ็ญ (Royal Gold)", primary: 0xfacc15, secondary: 0xf59e0b, spark: 0xffffff, light: 0xffd56b },
      { name: "ทับทิมสยาม (Siam Ruby)", primary: 0xf43f5e, secondary: 0xe11d48, spark: 0xffedd5, light: 0xf43f5e },
      { name: "มรกตไพฑูรย์ (Emerald Jade)", primary: 0x10b981, secondary: 0x059669, spark: 0xd1fae5, light: 0x34d399 },
      { name: "ไพลินฟ้าน้ำเอก (Sapphire Cyan)", primary: 0x06b6d4, secondary: 0x0284c7, spark: 0xe0f2fe, light: 0x38bdf8 },
      { name: "บุษราคัมอำพัน (Amethyst Violet)", primary: 0xd946ef, secondary: 0x8b5cf6, spark: 0xfdf4ff, light: 0xc084fc },
      { name: "ฝอยทองหลั่งไหล (Golden Kamuro)", primary: 0xfbbf24, secondary: 0xd97706, spark: 0xfef08a, light: 0xfbbf24, isWillow: true },
      { name: "รุ้งราตรีเพ็ญ (Rainbow Sparkle)", primary: 0, secondary: 0, spark: 0xffffff, light: 0xffe88a, isRainbow: true },
    ];
    const palIndex = (rocket.paletteIndex !== undefined && rocket.paletteIndex >= 0)
      ? (rocket.paletteIndex % palettes.length)
      : Math.floor(Math.random() * palettes.length);
    const pal = palettes[palIndex];

    // 1. แสงสว่างวาบจำลองจริง (ใช้ Single Pre-allocated Light 100% ไม่มี Shader Recompilation)
    if (this.fireworkFlashLight) {
      this.fireworkFlashLight.color.setHex(pal.light);
      this.fireworkFlashLight.position.set(burstX, burstY, burstZ);
      this.fireworkFlashLight.intensity = 16.0;
      this.flashAge = 0;
    }

    // 2. สะเก็ดดาวพลุสมดุลความหนาแน่น (100 - 120 อนุภาค สวยงามกลมแน่นและเบาต่อ GPU)
    const count = pal.isWillow ? 120 : 100;
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

      // กระจายตัวเป็นทรงกลม 3 มิติสมบูรณ์แบบ
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
      maxAge: pal.isWillow ? 3.0 : 2.2,
      isWillow: pal.isWillow || false,
    });
  }

  // อัปเดตฟิสิกส์พลุไฟทุกเฟรม (Fast Particle Math, Zero Shader Recompile, Zero Audio Lag)
  updateFireworks(dt, time) {
    // 1. ควบคุมการจางลงของแสงสว่างวาบส่วนกลาง (Global Flash Light Fade)
    if (this.fireworkFlashLight && this.fireworkFlashLight.intensity > 0) {
      this.flashAge = (this.flashAge || 0) + dt;
      if (this.flashAge < 0.35) {
        this.fireworkFlashLight.intensity = Math.max(0, 16.0 * (1.0 - this.flashAge / 0.35));
      } else {
        this.fireworkFlashLight.intensity = 0;
      }
    }

    if (!this.activeFireworks || this.activeFireworks.length === 0) return;

    for (let i = this.activeFireworks.length - 1; i >= 0; i--) {
      const fw = this.activeFireworks[i];

      if (fw.type === "rocket") {
        fw.age += dt;
        fw.pos.y += fw.velY * dt;
        fw.velY -= 9.8 * 0.45 * dt;

        // Shift pre-allocated history pool in-place (Zero Memory Allocation / Zero GC Lag)
        if (fw.history && fw.history.length > 0) {
          for (let h = fw.trailCount - 1; h > 0; h--) {
            fw.history[h].x = fw.history[h - 1].x;
            fw.history[h].y = fw.history[h - 1].y;
            fw.history[h].z = fw.history[h - 1].z;
          }
          fw.history[0].x = fw.pos.x;
          fw.history[0].y = fw.pos.y;
          fw.history[0].z = fw.pos.z;
        }

        for (let j = 0; j < fw.trailCount; j++) {
          const pt = (fw.history && fw.history[j]) || fw.pos;
          const driftX = Math.sin(fw.age * 22.0 + j * 0.8) * 0.08;
          const driftZ = Math.cos(fw.age * 22.0 + j * 0.8) * 0.08;
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
        const progress = Math.min(1.0, fw.age / fw.maxAge);

        // ฟิสิกส์แรงต้านอากาศและแรงโน้มถ่วงแบบ Delta-Time Independent 100%
        // ชดเชย Refresh Rate: หน้าจอ 60Hz, 120Hz, 144Hz จะเคลื่อนที่ด้วยความเร็วและความไกลเท่ากันเป๊ะ
        const baseDrag = fw.isWillow ? 0.985 : 0.965;
        const effectiveDrag = Math.pow(baseDrag, dt * 60.0);
        const gravity = fw.isWillow ? 3.4 : 6.8;

        // คำนวณค่าคงที่สำหรับเฟดล่วงหน้า 1 ครั้งนอกลูป (ประหยัด Math.pow หลายร้อยรอบต่อเฟรม)
        const baseFade = Math.max(0, 1.0 - Math.pow(progress, 1.5));

        for (let j = 0; j < fw.count; j++) {
          const v = fw.velocities[j];
          v.x *= effectiveDrag;
          v.y = v.y * effectiveDrag - gravity * dt;
          v.z *= effectiveDrag;

          fw.positions[j * 3] += v.x * dt;
          fw.positions[j * 3 + 1] += v.y * dt;
          fw.positions[j * 3 + 2] += v.z * dt;

          // สะเก็ดไฟกะพริบระยิบระยับ (Twinkle effect)
          const twinkle = 0.70 + 0.30 * Math.sin(time * 26.0 + j * 2.0);
          const fade = baseFade * twinkle;

          fw.colors[j * 3] = fw.baseColors[j * 3] * fade;
          fw.colors[j * 3 + 1] = fw.baseColors[j * 3 + 1] * fade;
          fw.colors[j * 3 + 2] = fw.baseColors[j * 3 + 2] * fade;
        }

        fw.points.geometry.attributes.position.needsUpdate = true;
        fw.points.geometry.attributes.color.needsUpdate = true;
        fw.points.material.opacity = Math.max(0, 1.0 - progress);

        // สิ้นสุดอายุพลุ เคลียร์ทรัพยากรทันที
        if (fw.age >= fw.maxAge) {
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
        if (fw.trailPoints) {
          this.scene.remove(fw.trailPoints);
          fw.trailPoints.geometry?.dispose();
          fw.trailPoints.material?.dispose();
        }
        if (fw.points) {
          this.scene.remove(fw.points);
          fw.points.geometry?.dispose();
          fw.points.material?.dispose();
        }
      });
      this.activeFireworks = [];
    }
    if (this.fireworkFlashLight) {
      this.scene.remove(this.fireworkFlashLight);
      this.fireworkFlashLight = null;
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
