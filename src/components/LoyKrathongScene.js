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

    // Event Listeners
    this.handleResize = this.onWindowResize.bind(this);
    this.handleClick = this.onPointerDown.bind(this);
    window.addEventListener("resize", this.handleResize);
    this.renderer.domElement.addEventListener("pointerdown", this.handleClick);

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

    // 5. Photorealistic Feathered Palm Frond Leaflet Texture (ทางมะพร้าวขนนกเสมือนจริง)
    const frondCanvas = document.createElement("canvas");
    frondCanvas.width = 256;
    frondCanvas.height = 512;
    const fCtx = frondCanvas.getContext("2d");
    fCtx.clearRect(0, 0, 256, 512);

    // Central golden-green spine (ก้านทางมะพร้าว)
    fCtx.strokeStyle = "#a3e635";
    fCtx.lineWidth = 5;
    fCtx.beginPath();
    fCtx.moveTo(128, 0);
    fCtx.lineTo(128, 512);
    fCtx.stroke();

    // 60 paired tapering drooping leaflets
    const pinnaeCount = 60;
    for (let i = 0; i < pinnaeCount; i++) {
      const y = (i / pinnaeCount) * 490 + 12;
      // Leaflets are longest in middle and taper toward tip
      const span = Math.sin((i / pinnaeCount) * Math.PI) * 115 + 10;

      // Left leaflet
      fCtx.strokeStyle = i % 2 === 0 ? "#15803d" : "#22c55e";
      fCtx.lineWidth = 2.4;
      fCtx.beginPath();
      fCtx.moveTo(128, y);
      fCtx.quadraticCurveTo(128 - span * 0.55, y + 15, 128 - span, y + 26);
      fCtx.stroke();

      // Right leaflet
      fCtx.strokeStyle = i % 2 === 0 ? "#166534" : "#16a34a";
      fCtx.beginPath();
      fCtx.moveTo(128, y);
      fCtx.quadraticCurveTo(128 + span * 0.55, y + 15, 128 + span, y + 26);
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
    const moonGeo = new THREE.SphereGeometry(7.5, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
    this.moon = new THREE.Mesh(moonGeo, moonMat);
    this.moon.position.set(32, 54, -75);
    this.scene.add(this.moon);

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

    // --- ท่าน้ำ สีเขียว สี่เหลี่ยมผืนผ้า (Rectangular Green Waterfront Pier) ---
    // ขนานกับแนวแม่น้ำ 100% เป็นพื้นที่สี่เหลี่ยมผืนผ้าสวยงามตามคำขอของผู้ใช้
    const greenPierGroup = new THREE.Group();
    greenPierGroup.position.set(-16.5, 0, 5.0);

    const pierWidthX = 7.0;   // X: -20 ถึง -13 (ยื่นลงสู่แม่น้ำ 7 หน่วย)
    const pierLengthZ = 15.0; // Z: -2.5 ถึง 12.5 (ยาวขนานแม่น้ำ 15 หน่วย เป็นสี่เหลี่ยมผืนผ้าแท้)

    // ฐานคอนกรีตคันกั้นดินรอบท่าน้ำสีเขียว
    const pierConcreteMat = new THREE.MeshStandardMaterial({ color: 0xd6dbe0, roughness: 0.82 });
    const pierBase = new THREE.Mesh(new THREE.BoxGeometry(pierWidthX, 0.65, pierLengthZ), pierConcreteMat);
    pierBase.position.set(0, 0.45, 0);
    pierBase.receiveShadow = true;
    greenPierGroup.add(pierBase);

    // ลานหญ้าสีเขียวสี่เหลี่ยมผืนผ้าบนท่าน้ำ (ท่าน้ำ สีเขียว)
    const pierGrassMat = new THREE.MeshStandardMaterial({ color: 0x3d6624, roughness: 0.9 });
    const pierLawn = new THREE.Mesh(new THREE.BoxGeometry(pierWidthX - 0.35, 0.22, pierLengthZ - 0.35), pierGrassMat);
    pierLawn.position.set(0, 0.78, 0);
    pierLawn.receiveShadow = true;
    greenPierGroup.add(pierLawn);

    // เสาตอม่อค้ำใต้ถุนท่าน้ำในน้ำ (Under-pier Stilts)
    const pierWoodMat = new THREE.MeshStandardMaterial({ color: 0x481e0a, roughness: 0.72 });
    const pileGeo = new THREE.CylinderGeometry(0.25, 0.25, 5.5, 8);
    [
      [pierWidthX / 2 - 0.4, pierLengthZ / 2 - 0.6],
      [pierWidthX / 2 - 0.4, -pierLengthZ / 2 + 0.6],
      [pierWidthX / 2 - 0.4, 0],
      [0, pierLengthZ / 2 - 0.6],
      [0, -pierLengthZ / 2 + 0.6]
    ].forEach(([px, pz]) => {
      const pile = new THREE.Mesh(pileGeo, pierWoodMat);
      pile.position.set(px, -0.8, pz);
      greenPierGroup.add(pile);
    });

    // บันไดท่าน้ำไม้สักทอดลงสู่แม่น้ำสำหรับลอยกระทง (Landing Steps into River)
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 5.4), pierWoodMat);
      step.position.set(pierWidthX / 2 + 0.35 + i * 0.6, 0.55 - i * 0.22, 0);
      step.receiveShadow = true;
      greenPierGroup.add(step);
    }

    // เสาหลักผูกเรือพร้อมโคมไฟประดับที่มุมท่าน้ำสีเขียว
    const pierLanternMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
    [
      [pierWidthX / 2 - 0.4, pierLengthZ / 2 - 0.6],
      [pierWidthX / 2 - 0.4, -pierLengthZ / 2 + 0.6]
    ].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.2, 8), pierWoodMat);
      post.position.set(px, 1.35, pz);
      greenPierGroup.add(post);

      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.4, 8), pierLanternMat);
      lamp.position.set(px, 2.05, pz);
      greenPierGroup.add(lamp);

      const lampLight = new THREE.PointLight(0xffaa33, 2.8, 14, 1.4);
      lampLight.position.set(px, 2.2, pz);
      greenPierGroup.add(lampLight);
      this.flickerLights.push({ light: lampLight, baseIntensity: 2.8, speed: 4.0 });
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

    // --- B. PHOTOREALISTIC COCONUT PALM TREES (ต้นมะพร้าวริมน้ำเสมือนจริง 80%+) ---
    // ตำแหน่งริมฝั่งตลิ่ง โดยไม่ขวางทางเดินและไม่เกะกะสายตา
    const palmConfigs = [
      { x: -24, z: 28, rotY: 0.3, leanAngle: 0.22, heightScale: 1.1 },
      { x: -26, z: -38, rotY: -0.5, leanAngle: 0.26, heightScale: 1.05 },
      { x: -25, z: 42, rotY: 0.8, leanAngle: 0.2, heightScale: 1.0 },
    ];

    palmConfigs.forEach((pCfg) => {
      const palm = this.buildPhotorealisticPalmTree(pCfg, trunkMat);
      this.scene.add(palm.rootGroup);
      this.swayingPalms.push({ group: palm.crownGroup, speed: 1.3, phase: Math.random() * Math.PI });
    });
  }

  // สร้างต้นมะพร้าวเสมือนจริง: ลำต้นโค้งงอนวลตา + ทางมะพร้าวโค้งแอ่นทิ้งตัว + ใบขนนกย่อย + ทะลายมะพร้าว
  buildPhotorealisticPalmTree(pCfg, trunkMat) {
    const rootGroup = new THREE.Group();
    rootGroup.position.set(pCfg.x, 1.5, pCfg.z);

    // 1. Swollen Root Base (โคนต้นมะพร้าวป่องตามธรรมชาติ)
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.9 });
    const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.8, 1.2, 10), bulbMat);
    bulb.position.y = 0.6;
    bulb.castShadow = true;
    rootGroup.add(bulb);

    // 2. Segmented Sweeping Curved Trunk (ลำต้นมะพร้าวโค้งเอียงโน้มเข้าหาแม่น้ำอย่างอ่อนช้อย)
    let curY = 1.0;
    let curX = 0;
    const trunkSegments = 14;
    const segH = 0.95 * pCfg.heightScale;

    for (let s = 0; s < trunkSegments; s++) {
      // Tapering: 0.42 at bottom to 0.25 near crown
      const rBottom = 0.42 - (s / trunkSegments) * 0.16;
      const rTop = 0.42 - ((s + 1) / trunkSegments) * 0.16;

      const seg = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, segH, 10), trunkMat);
      seg.position.set(curX, curY + segH / 2, 0);
      seg.rotation.z = -pCfg.leanAngle * (s / trunkSegments);
      seg.castShadow = true;
      rootGroup.add(seg);

      // Distinct Palm Ring Scars (รอยปล้องมะพร้าว)
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(rTop + 0.02, 0.025, 4, 12),
        new THREE.MeshStandardMaterial({ color: 0x26170d, roughness: 0.9 })
      );
      ring.position.set(curX, curY + segH, 0);
      ring.rotateX(Math.PI / 2);
      rootGroup.add(ring);

      curX += Math.sin(pCfg.leanAngle) * (segH * 0.45);
      curY += Math.cos(pCfg.leanAngle) * (segH * 0.96);
    }

    // 3. Green Crownshaft & Brown Coir Sheath (คอมะพร้าวสีเขียวอ่อนและรกกาบมะพร้าวสีน้ำตาล)
    const crownShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.26, 1.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.6 })
    );
    crownShaft.position.set(curX, curY + 0.8, 0);
    crownShaft.rotation.z = -pCfg.leanAngle;
    rootGroup.add(crownShaft);

    // Brown fibrous coir collar (รกมะพร้าว)
    const coir = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.26, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x543212, roughness: 0.95 })
    );
    coir.position.set(curX, curY + 1.2, 0);
    coir.rotation.z = -pCfg.leanAngle;
    rootGroup.add(coir);

    // 4. Crown of Fronds (พุ่มทางมะพร้าวโค้งแอ่นทิ้งตัวเสมือนจริง 20 ทาง)
    const crownGroup = new THREE.Group();
    crownGroup.position.set(curX, curY + 1.6, 0);

    // Coconut Fruit Clusters (ทะลายลูกมะพร้าว 8-10 ผล)
    const nutMatGreen = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.5 });
    const nutMatBrown = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.6 });
    for (let n = 0; n < 9; n++) {
      const nAng = (n / 9) * Math.PI * 2;
      const nut = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 8, 8),
        n % 3 === 0 ? nutMatBrown : nutMatGreen
      );
      nut.scale.set(1.0, 1.35, 1.0); // Ovoid coconut shape
      nut.position.set(Math.cos(nAng) * 0.6, -0.35 + (n % 2) * 0.2, Math.sin(nAng) * 0.6);
      crownGroup.add(nut);
    }

    // Frond material with alpha transparency for realistic feathered leaflets
    const frondMat = new THREE.MeshStandardMaterial({
      map: this.palmFrondTexture,
      transparent: true,
      alphaTest: 0.25,
      side: THREE.DoubleSide,
      roughness: 0.45,
    });

    const frondConfigs = [
      // Tier 1: Young fronds (พุ่งขึ้นบนและโค้งออก - 6 ทาง)
      { count: 6, pitch: 0.55, length: 5.2, width: 1.4, droop: 0.6, yOffset: 0.3 },
      // Tier 2: Prime arching fronds (แอ่นโค้งทิ้งตัวรอบทิศ - 8 ทาง)
      { count: 8, pitch: 1.05, length: 6.4, width: 1.6, droop: 1.4, yOffset: 0.0 },
      // Tier 3: Mature low-drooping fronds (ทิ้งตัวลงต่ำล้อมรอบต้น - 6 ทาง)
      { count: 6, pitch: 1.45, length: 6.8, width: 1.7, droop: 2.2, yOffset: -0.35 },
    ];

    frondConfigs.forEach((tier) => {
      for (let i = 0; i < tier.count; i++) {
        const yaw = (i / tier.count) * Math.PI * 2 + Math.random() * 0.2;
        const frondMesh = this.buildCurvedFrondMesh(tier, frondMat);

        frondMesh.position.y = tier.yOffset;
        frondMesh.rotation.y = yaw;
        // Natural tilt
        frondMesh.rotation.x = 0;
        crownGroup.add(frondMesh);
      }
    });

    // 2-3 dried brown fronds hanging limp downwards along trunk (ทางมะพร้าวแห้งสีน้ำตาล)
    const dryFrondMat = new THREE.MeshStandardMaterial({
      map: this.palmFrondTexture,
      color: 0x854d0e,
      transparent: true,
      alphaTest: 0.25,
      side: THREE.DoubleSide,
      roughness: 0.8,
    });
    for (let d = 0; d < 3; d++) {
      const dYaw = d * 2.1 + 0.5;
      const dryMesh = this.buildCurvedFrondMesh({ length: 4.8, width: 1.3, droop: 2.8, pitch: 1.8 }, dryFrondMat);
      dryMesh.position.y = -0.5;
      dryMesh.rotation.y = dYaw;
      crownGroup.add(dryMesh);
    }

    rootGroup.add(crownGroup);
    return { rootGroup, crownGroup };
  }

  // สร้างทางมะพร้าวที่มีความโค้งแอ่นตามธรรมชาติ (Gracefully Arched Frond Spine)
  buildCurvedFrondMesh(cfg, material) {
    const frondGroup = new THREE.Group();

    // Central arching rib (กระดูกทางมะพร้าวโค้งแอ่น)
    const segs = 6;
    const len = cfg.length;
    const ribMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.6 });

    let lastX = 0;
    let lastY = 0;
    for (let s = 1; s <= segs; s++) {
      const t = s / segs;
      // Parabolic arch formula: rises initially, then gracefully droops down
      const curX = t * len;
      const curY = Math.sin(t * Math.PI * 0.7) * 1.5 - Math.pow(t, 2.2) * cfg.droop;

      const dx = curX - lastX;
      const dy = curY - lastY;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const rib = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03 * (1 - t * 0.7), 0.05 * (1 - (t - 1 / segs) * 0.7), segLen, 5),
        ribMat
      );
      rib.position.set((lastX + curX) / 2, (lastY + curY) / 2, 0);
      rib.rotation.z = angle - Math.PI / 2;
      frondGroup.add(rib);

      // Feathered Leaflet Quad along this segment - angled like an inverted roof V (^)
      const leafGeo = new THREE.PlaneGeometry(cfg.width * Math.sin(t * Math.PI), segLen * 1.05);
      const leafMesh = new THREE.Mesh(leafGeo, material);
      leafMesh.position.set((lastX + curX) / 2, (lastY + curY) / 2, 0);
      leafMesh.rotation.z = angle - Math.PI / 2;
      leafMesh.rotation.y = Math.PI / 2; // Face outward
      leafMesh.rotation.x = -0.35; // Droop downward angle
      frondGroup.add(leafMesh);

      lastX = curX;
      lastY = curY;
    }

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
     KRATHONG SAI / RIVER CANDLES
     ลอยอยู่ในร่องน้ำเปิด ไม่ไปทับกอบัวหรือกระทงหลัก
  ========================================================== */
  createKrathongSai() {
    this.riverCandles = [];
    const count = 55;
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

      // กระจายอยู่ในร่องน้ำเปิด X: -4 ถึง +18
      const posX = -4 + Math.random() * 22;
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

    const baseGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.45, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x3d6b24,
      roughness: 0.8,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    base.castShadow = true;
    group.add(base);

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

  // กำหนดเลนลอยของกระทงในร่องน้ำเปิด เพื่อไม่ให้เกิดการทับซ้อนตั้งแต่เริ่ม
  assignKrathongInitialPosition(index) {
    // 5 เลนลอยที่ปลอดภัยในร่องน้ำหลัก (ห่างจากกอบัว X <= -13 และสะพาน X <= -11)
    const lanes = [-5.0, -1.0, 3.5, 8.0, 13.0];
    const laneIndex = index % lanes.length;
    const x = lanes[laneIndex] + (Math.random() - 0.5) * 1.2;
    // ระยะห่างในแนวสายน้ำ (Z) อย่างน้อย 9-12 เมตรต่อลำ
    const z = 12 + index * 10;
    return { x, z };
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
        if (entry.x === undefined || entry.x < -6.5 || entry.x > 16.5) {
          const initPos = this.assignKrathongInitialPosition(index);
          entry.x = initPos.x;
          entry.z = initPos.z;
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
     ANIMATION LOOP ("วัตถุทุกอย่างมีความเคลื่อนไหว & ระบบป้องกันการชน/ทับซ้อน")
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

    // 3. Krathongs Downstream Movement with Collision Avoidance & Physics
    const krathongs = Array.from(this.krathongMeshes.values());

    krathongs.forEach((mesh, idx) => {
      const speed = mesh.userData.speed || 0.009;
      const bob = mesh.userData.bobOffset || 0;

      // ไหลตามกระแสน้ำ Z (จาก +Z ไปสู่ -Z)
      mesh.position.z -= speed * 4.2;

      // วนกลับขึ้นต้นน้ำเมื่อลอยพ้นสายตา
      if (mesh.position.z < -46) {
        // กำหนดเลนลอยใหม่ให้กระจายตัวในร่องน้ำเปิด X: -5 ถึง +14
        const lanes = [-5.0, -1.0, 3.5, 8.0, 13.0];
        mesh.position.x = lanes[idx % lanes.length] + (Math.random() - 0.5) * 1.2;
        mesh.position.z = 36 + Math.random() * 16;
      }

      // การโคลงเคลงตามระลอกคลื่นน้ำ
      mesh.position.y = Math.sin(time * 2.8 + bob) * 0.1 + 0.06;
      mesh.rotation.z = Math.sin(time * 2.0 + bob) * 0.035;
      mesh.rotation.x = Math.cos(time * 1.7 + bob) * 0.03;
      mesh.rotation.y += mesh.userData.rotSpeed || 0.002;

      // เปลวไฟเทียนสะบัดไหว
      const flame = mesh.getObjectByName("candleFlame");
      if (flame) {
        const flicker = Math.sin(time * 16.0 + bob) * 0.15 + 1.0;
        flame.scale.set(flicker, flicker * 1.1, flicker);
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

    // --- ระบบป้องกันกระทงลอยไปทับกอบัวริมน้ำ (Lotus Avoidance) ---
    krathongs.forEach((mesh) => {
      if (this.lotusObstacles) {
        this.lotusObstacles.forEach((cl) => {
          const dx = mesh.position.x - cl.x;
          const dz = mesh.position.z - cl.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const safeDist = cl.r + 2.5; // รัศมีปลอดภัยจากใจกลางกอบัว

          if (dist < safeDist && dist > 0.001) {
            // ดันกระทงออกจากกอบัว เข้าสู่ร่องน้ำหลัก (+X) ทันที
            const push = (safeDist - dist) * 0.25;
            mesh.position.x += Math.max(0.08, (dx / dist) * push);
          }
        });
      }

      // ป้องกันไม่ให้กระทงชนเสาและบันไดท่าน้ำ (Pier: X <= -11.5, Z ระหว่าง -2 ถึง 14)
      if (mesh.position.x < -6.8 && mesh.position.z > -2 && mesh.position.z < 15) {
        mesh.position.x += (-6.8 - mesh.position.x) * 0.2;
      }

      // จำกัดขอบเขตช่องน้ำลอยกระทงที่ปลอดภัย (Fairway Boundary: X ระหว่าง -6.5 ถึง +16.5)
      if (mesh.position.x < -6.5) mesh.position.x = -6.5;
      if (mesh.position.x > 16.5) mesh.position.x = 16.5;
    });

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

    // 5. Krathong Sai / River Candles (กระทงสายลอยสว่าง พร้อมหลบกระทงใหญ่)
    if (this.riverCandles) {
      this.riverCandles.forEach((item) => {
        item.group.position.z -= item.speed * 4.0;
        if (item.group.position.z < -45) {
          item.group.position.z = 40 + Math.random() * 15;
          item.group.position.x = -4 + Math.random() * 21;
          item.originX = item.group.position.x;
        }
        item.group.position.y = 0.08 + Math.sin(time * item.swaySpeed + item.bobPhase) * 0.08;
        item.group.position.x = item.originX + Math.sin(time * 1.2 + item.bobPhase) * 0.5;

        // หลบกระทงใหญ่ ไม่ให้ลอยทะลุกัน
        krathongs.forEach((kMesh) => {
          const cdx = item.group.position.x - kMesh.position.x;
          const cdz = item.group.position.z - kMesh.position.z;
          const cdist = Math.sqrt(cdx * cdx + cdz * cdz);
          if (cdist < 3.2 && cdist > 0.001) {
            item.group.position.x += (cdx / cdist) * 0.12;
          }
        });

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
