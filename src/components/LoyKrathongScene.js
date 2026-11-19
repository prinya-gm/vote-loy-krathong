import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export class LoyKrathongScene {
  constructor(container, onSelectKrathong) {
    this.container = container;
    this.onSelectKrathong = onSelectKrathong;
    this.krathongMeshes = new Map(); // id -> mesh group
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Dynamic animated object collections
    this.skyLanterns = [];
    this.riverCandles = []; // กระทงสาย / ตะคันลอยน้ำ
    this.torchFlames = [];  // คบเพลิงริมน้ำ
    this.swayingTrees = []; // ต้นไม้ไหวตามลม
    this.floatingPetals = []; // กลีบดอกไม้ลอยน้ำ
    this.flickerLights = [];

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    // Soft twilight fog - light enough to see the glowing temple across the river
    this.scene.fog = new THREE.FogExp2(0x1a264a, 0.0075);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 19, 40);

    // 3. Renderer with Bright ACES Film Exposure
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35; // Bright, vibrant festival exposure
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't clip below water surface
    this.controls.minDistance = 6;
    this.controls.maxDistance = 100;
    this.controls.target.set(0, 3, 0);

    // 5. Lighting Setup (Bright & Warm Golden Festival Atmosphere)
    this.setupLighting();

    // 6. Sky & Celestial (Twilight Sky Dome, Glowing Moon, Stars)
    this.createSkyDome();
    this.createMoon();
    this.createTwinklingStars();

    // 7. River Water with Sparkling Reflections
    this.createRiver();

    // 8. Wat Arun / Grand Thai Temple Complex (เรืองแสงทองสะท้อนแม่น้ำ)
    this.createThaiTempleComplex();

    // 9. Riverbank, Thai House, Pavilion, Pier, Torches & Trees
    this.createThaiRiverBank();

    // 10. Floating Sky Lanterns (โคมลอยยี่เป็ง นับร้อยดวง)
    this.createSkyLanterns();

    // 11. Krathong Sai / Floating River Candles (กระทงสายลอยสว่างทั่วแม่น้ำ)
    this.createKrathongSai();

    // Event Listeners
    this.handleResize = this.onWindowResize.bind(this);
    this.handleClick = this.onPointerDown.bind(this);
    window.addEventListener("resize", this.handleResize);
    this.renderer.domElement.addEventListener("pointerdown", this.handleClick);

    // Start Animation Loop
    this.animate();
  }

  setupLighting() {
    // 1. Ambient Light - Brighter royal twilight blue mix with warm golden bounce
    const ambientLight = new THREE.AmbientLight(0x406090, 2.0);
    this.scene.add(ambientLight);

    // 2. Moonlight Directional Light - Casting crisp shadows and surface specular highlights
    const moonLight = new THREE.DirectionalLight(0xfffae8, 2.4);
    moonLight.position.set(20, 55, -40);
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

    // 3. Warm Festival River Ambient (Golden water glow from thousands of lanterns)
    const riverGlowLight = new THREE.DirectionalLight(0xff9922, 1.2);
    riverGlowLight.position.set(-15, 20, 20);
    this.scene.add(riverGlowLight);

    // 4. Temple Architectural Floodlight
    const templeFloodLight = new THREE.PointLight(0xffd56b, 5.0, 75, 1.2);
    templeFloodLight.position.set(15, 18, -40);
    this.scene.add(templeFloodLight);
    this.templeLight = templeFloodLight;

    // 5. Pier & Shoreline Festival Warm Glow
    const pierLight = new THREE.PointLight(0xff8811, 4.0, 35, 1.4);
    pierLight.position.set(-15, 6, 8);
    this.scene.add(pierLight);
    this.flickerLights.push({ light: pierLight, baseIntensity: 4.0, speed: 4.5 });
  }

  createSkyDome() {
    // Breathtaking twilight gradient sky matching images 2, 3, 4
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, "#071738"); // Midnight royal navy
    grad.addColorStop(0.3, "#102a5c"); // Deep cerulean
    grad.addColorStop(0.55, "#301d54"); // Royal indigo violet
    grad.addColorStop(0.72, "#702356"); // Sunset magenta / plum
    grad.addColorStop(0.85, "#b84724"); // Rich warm sunset orange
    grad.addColorStop(0.94, "#e0781c"); // Horizon warm amber
    grad.addColorStop(1.0, "#fcd34d"); // Golden horizon line glow

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
    // Large, luminous 3D Full Moon
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
    this.moonHalo = halo;
  }

  createTwinklingStars() {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 260;
      positions[i * 3 + 1] = 18 + Math.random() * 95;
      positions[i * 3 + 2] = -140 + Math.random() * 110;
      opacities[i] = 0.3 + Math.random() * 0.7;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.1,
      transparent: true,
      opacity: 0.85,
    });
    this.starField = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starField);
  }

  createRiver() {
    // Large river plane with fine grid for wave physics
    const riverGeo = new THREE.PlaneGeometry(180, 180, 80, 80);
    riverGeo.rotateX(-Math.PI / 2);

    // Glowing vibrant river water reflecting lights
    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x0a3258,
      metalness: 0.65,
      roughness: 0.22,
      flatShading: false,
    });

    this.waterMesh = new THREE.Mesh(riverGeo, this.waterMat);
    this.waterMesh.position.y = 0;
    this.waterMesh.receiveShadow = true;
    this.scene.add(this.waterMesh);

    this.riverPositions = riverGeo.attributes.position;
    this.baseRiverCoords = this.riverPositions.array.slice();
  }

  // Wat Arun / Grand Royal Thai Temple Complex (วัดอรุณราชวราราม และสถาปัตยกรรมไทยเรืองแสงทอง)
  createThaiTempleComplex() {
    const templeGroup = new THREE.Group();
    templeGroup.position.set(16, 0, -42);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf5b041,
      metalness: 0.5,
      roughness: 0.3,
    });
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xecd0a1,
      roughness: 0.6,
    });
    const roofRedMat = new THREE.MeshStandardMaterial({
      color: 0x9b2226,
      roughness: 0.45,
    });
    const brightLightMat = new THREE.MeshBasicMaterial({ color: 0xffea79 });

    // 1. Grand Riverbank Foundation Platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(36, 3, 24), stoneMat);
    platform.position.set(0, 1.5, 0);
    platform.receiveShadow = true;
    templeGroup.add(platform);

    // 2. Main Phra Prang (พระปรางค์ประธานทรงวัดอรุณ)
    const prangGroup = new THREE.Group();
    prangGroup.position.set(0, 3, 0);

    // Multi-tiered stepped base
    const baseTiers = [
      { w: 14, h: 2.2 },
      { w: 11.5, h: 2.0 },
      { w: 9.5, h: 1.8 },
      { w: 7.8, h: 1.6 },
    ];
    let curY = 0;
    baseTiers.forEach((tier) => {
      const tierMesh = new THREE.Mesh(new THREE.BoxGeometry(tier.w, tier.h, tier.w), goldMat);
      tierMesh.position.y = curY + tier.h / 2;
      tierMesh.castShadow = true;
      tierMesh.receiveShadow = true;
      prangGroup.add(tierMesh);

      // Niches with warm glowing lights (ซุ้มทิศเรืองแสง)
      [-1, 1].forEach((dir) => {
        const nicheX = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.4), brightLightMat);
        nicheX.position.set(dir * (tier.w / 2 + 0.05), curY + tier.h / 2, 0);
        prangGroup.add(nicheX);

        const nicheZ = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 1.0), brightLightMat);
        nicheZ.position.set(0, curY + tier.h / 2, dir * (tier.w / 2 + 0.05));
        prangGroup.add(nicheZ);
      });

      curY += tier.h;
    });

    // Main Prang Body (องค์ปรางค์ทรงระฆังคว่ำย่อมุม)
    const bodyGeo = new THREE.CylinderGeometry(2.6, 3.4, 11, 16);
    const bodyMesh = new THREE.Mesh(bodyGeo, goldMat);
    bodyMesh.position.y = curY + 5.5;
    bodyMesh.castShadow = true;
    prangGroup.add(bodyMesh);

    // Prang Spire (ยอดนภศูล / ปล้องไฉนทองอร่าม)
    const spireGeo = new THREE.ConeGeometry(2.2, 14, 16);
    const spireMesh = new THREE.Mesh(spireGeo, goldMat);
    spireMesh.position.y = curY + 11 + 7;
    spireMesh.castShadow = true;
    prangGroup.add(spireMesh);

    // Glowing Golden Pinnacle Crest (ยอดฉัตรทองคำเปล่งประกาย)
    const pinnacleGeo = new THREE.SphereGeometry(0.6, 12, 12);
    const pinnacleMesh = new THREE.Mesh(pinnacleGeo, brightLightMat);
    pinnacleMesh.position.y = curY + 25;
    prangGroup.add(pinnacleMesh);

    // 4 Corner Prangs (ปรางค์ทิศทั้ง 4 มุม)
    const cornerOffsets = [
      [-6, -6],
      [6, -6],
      [-6, 6],
      [6, 6],
    ];
    cornerOffsets.forEach(([cx, cz]) => {
      const cPrang = new THREE.Group();
      cPrang.position.set(cx, curY - 5, cz);
      const cBase = new THREE.Mesh(new THREE.BoxGeometry(3.0, 4.0, 3.0), goldMat);
      cBase.position.y = 2.0;
      cPrang.add(cBase);

      const cSpire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 7.5, 12), goldMat);
      cSpire.position.y = 7.75;
      cPrang.add(cSpire);

      prangGroup.add(cPrang);
    });

    templeGroup.add(prangGroup);

    // 3. Side Ordination Pavilion (พระอุโบสถ / มณฑปเครื่องยอดทรงไทย)
    [-15, 15].forEach((sideX) => {
      const pavilion = new THREE.Group();
      pavilion.position.set(sideX, 3, 2);

      // Pavilion Body
      const pBody = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.8, 8.5), stoneMat);
      pBody.position.y = 1.9;
      pBody.castShadow = true;
      pavilion.add(pBody);

      // Tiered Thai Gable Roof (หลังคาซ้อนชั้นลด)
      for (let r = 0; r < 2; r++) {
        const roofCone = new THREE.Mesh(new THREE.ConeGeometry(4.8 - r * 0.8, 2.5, 4), roofRedMat);
        roofCone.rotateY(Math.PI / 4);
        roofCone.scale.set(1.1, 0.75, 1.35);
        roofCone.position.set(0, 4.2 + r * 1.5, 0);
        pavilion.add(roofCone);
      }

      // Golden Chofa (ช่อฟ้า)
      const chofa = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.4, 6), goldMat);
      chofa.position.set(0, 6.8, 4.2);
      chofa.rotation.x = 0.35;
      pavilion.add(chofa);

      // Glowing Interior Lights
      const winMat = new THREE.MeshBasicMaterial({ color: 0xffe680 });
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0), winMat);
      win.position.set(0, 2.0, 4.26);
      pavilion.add(win);

      templeGroup.add(pavilion);
    });

    // 4. Temple Front Lights projecting reflections onto water
    const templeSpot = new THREE.PointLight(0xffbe42, 6.0, 50, 1.3);
    templeSpot.position.set(0, 6, 12);
    templeGroup.add(templeSpot);
    this.flickerLights.push({ light: templeSpot, baseIntensity: 6.0, speed: 2.0 });

    this.scene.add(templeGroup);
    this.templeGroup = templeGroup;
  }

  createThaiRiverBank() {
    // 1. River Bank (ฝั่งแม่น้ำฝั่งซ้าย)
    const bankGeo = new THREE.BoxGeometry(32, 10, 180);
    const bankMat = new THREE.MeshStandardMaterial({
      color: 0x223a1a, // Lush riverbank green
      roughness: 0.85,
    });
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.position.set(-36, -3, 0);
    bank.receiveShadow = true;
    this.scene.add(bank);

    // Stone pathway promenade edge
    const stoneEdge = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2, 180),
      new THREE.MeshStandardMaterial({ color: 0x5a6369, roughness: 0.7 })
    );
    stoneEdge.position.set(-20, 0.5, 0);
    stoneEdge.receiveShadow = true;
    this.scene.add(stoneEdge);

    // 2. Wooden Pier (ท่าน้ำ)
    this.createWoodenPier();

    // 3. Thai Traditional House (เรือนไทยยกใต้ถุนสูง)
    const houseGroup = this.buildThaiHouseMesh();
    houseGroup.position.set(-25, 2, -6);
    houseGroup.scale.set(1.4, 1.4, 1.4);
    this.scene.add(houseGroup);

    // 4. Thai Riverside Pavilion (ศาลาริมน้ำ)
    const salaGroup = this.buildThaiSalaMesh();
    salaGroup.position.set(-21, 1.8, 16);
    salaGroup.scale.set(1.15, 1.15, 1.15);
    this.scene.add(salaGroup);

    // 5. Fire Torches along the Riverbank (คบเพลิงไม้ไผ่ / ตะคันไฟแบบในรูป 3)
    this.createRiverbankTorches();

    // 6. Swaying Coconut & Palm Trees along the Shore (ต้นไม้ไหวตามลม)
    this.createSwayingTrees();

    // 7. Festive Hanging Lantern Strings
    this.createFestivalLanternPoles();
  }

  // คบเพลิงไม้ไผ่ริมน้ำ (Bamboo Fire Torches like image 3)
  createRiverbankTorches() {
    const torchCount = 10;
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xc89858, roughness: 0.6 });
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });

    for (let i = 0; i < torchCount; i++) {
      const zPos = -40 + i * 14;
      const torchGroup = new THREE.Group();
      torchGroup.position.set(-18.5, 1.0, zPos);

      // Bamboo Pole
      const poleGeo = new THREE.CylinderGeometry(0.1, 0.14, 4.5, 8);
      const pole = new THREE.Mesh(poleGeo, bambooMat);
      pole.position.y = 2.25;
      pole.castShadow = true;
      torchGroup.add(pole);

      // Woven Fire Cup / Basin
      const cupGeo = new THREE.CylinderGeometry(0.4, 0.2, 0.6, 8);
      const cup = new THREE.Mesh(cupGeo, bowlMat);
      cup.position.y = 4.5;
      torchGroup.add(cup);

      // Dancing Fire Flame
      const flameGeo = new THREE.ConeGeometry(0.3, 0.85, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.y = 5.0;
      torchGroup.add(flame);

      // Flame Inner Core Glow
      const coreGeo = new THREE.ConeGeometry(0.18, 0.6, 8);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffea33 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = 4.9;
      torchGroup.add(core);

      // Dynamic Flame Light reflecting on water
      const flameLight = new THREE.PointLight(0xff7700, 3.2, 18, 1.4);
      flameLight.position.set(0, 5.2, 0);
      torchGroup.add(flameLight);

      this.scene.add(torchGroup);

      // Record for real-time flicker and dance animation
      this.torchFlames.push({
        flame,
        core,
        light: flameLight,
        baseScale: 1.0,
        speed: 6.0 + Math.random() * 4.0,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  // ต้นไม้และต้นมะพร้าวริมน้ำที่กิ่งใบพลิ้วไหวตามสายลม (Swaying in wind)
  createSwayingTrees() {
    const treePositions = [
      [-30, -25],
      [-28, -15],
      [-29, 2],
      [-27, 28],
      [-31, 42],
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3219, roughness: 0.8 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f5c22, roughness: 0.6 });

    treePositions.forEach(([x, z], idx) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(x, 2, z);

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.4, 0.65, 9, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 4.5;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Foliage Clumps (พุ่มใบไม้)
      const foliageGroup = new THREE.Group();
      foliageGroup.position.set(0, 8.5, 0);

      for (let f = 0; f < 3; f++) {
        const foliage = new THREE.Mesh(
          new THREE.SphereGeometry(2.4 - f * 0.4, 8, 8),
          leafMat
        );
        foliage.scale.set(1.4, 0.9, 1.2);
        foliage.position.y = f * 1.4;
        foliage.castShadow = true;
        foliageGroup.add(foliage);
      }
      treeGroup.add(foliageGroup);

      this.scene.add(treeGroup);

      this.swayingTrees.push({
        group: foliageGroup,
        speed: 1.2 + idx * 0.2,
        phase: idx * 1.5,
      });
    });
  }

  createWoodenPier() {
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x422d19, roughness: 0.7 });

    // Deck
    const deckGeo = new THREE.BoxGeometry(8, 0.5, 14);
    const deck = new THREE.Mesh(deckGeo, pierMat);
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

  buildThaiHouseMesh() {
    const house = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3116, roughness: 0.7 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x7c431d, roughness: 0.6 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xba3c1b, roughness: 0.45 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5b041, metalness: 0.6, roughness: 0.3 });

    // Elevated Pillars (เสาเรือนไทย)
    const pillarGeo = new THREE.CylinderGeometry(0.25, 0.25, 4, 8);
    [
      [-5, 2, -4], [0, 2, -4], [5, 2, -4],
      [-5, 2, 0],  [0, 2, 0],  [5, 2, 0],
      [-5, 2, 4],  [0, 2, 4],  [5, 2, 4],
    ].forEach(([px, py, pz]) => {
      const p = new THREE.Mesh(pillarGeo, woodMat);
      p.position.set(px, py, pz);
      p.castShadow = true;
      house.add(p);
    });

    // Floor Platform
    const floor = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 10), woodMat);
    floor.position.set(0, 4, 0);
    floor.castShadow = true;
    floor.receiveShadow = true;
    house.add(floor);

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(8, 4.5, 6), wallMat);
    body.position.set(0, 6.4, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    house.add(body);

    // Thai Gable Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.5, 4, 4), roofMat);
    roof.rotateY(Math.PI / 4);
    roof.scale.set(1.4, 0.9, 1.1);
    roof.position.set(0, 10, 0);
    roof.castShadow = true;
    house.add(roof);

    // Overhang Eaves
    const eave = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.3, 8.5), roofMat);
    eave.position.set(0, 8.8, 0);
    house.add(eave);

    // Chofa (ช่อฟ้า)
    [1, -1].forEach((dir) => {
      const chofa = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.6, 5), goldMat);
      chofa.position.set(0, 12, dir * 3.8);
      chofa.rotation.x = dir * 0.35;
      house.add(chofa);
    });

    // Glowing Warm Windows
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffe077 });
    [-2, 2].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), winMat);
      win.position.set(wx, 6.5, 3.01);
      house.add(win);
    });

    return house;
  }

  buildThaiSalaMesh() {
    const sala = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3116, roughness: 0.6 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xc44520, roughness: 0.45 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5b041, metalness: 0.7 });

    // Columns
    const colGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.5, 8);
    [[-2, 1.75, -2], [2, 1.75, -2], [-2, 1.75, 2], [2, 1.75, 2]].forEach(([x, y, z]) => {
      const col = new THREE.Mesh(colGeo, woodMat);
      col.position.set(x, y, z);
      sala.add(col);
    });

    const floor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 5.2), woodMat);
    floor.position.set(0, 0.2, 0);
    sala.add(floor);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 2.5, 4), roofMat);
    roof.rotateY(Math.PI / 4);
    roof.position.set(0, 4.6, 0);
    sala.add(roof);

    const apex = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.2, 6), goldMat);
    apex.position.set(0, 6.2, 0);
    sala.add(apex);

    return sala;
  }

  createFestivalLanternPoles() {
    this.lanternLights = [];
    const colors = [0xff4422, 0xffbb22, 0xee2255, 0x9922cc, 0x00cc88];

    for (let i = -3; i <= 3; i++) {
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 5, 6);
      const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x221105 }));
      const zPos = i * 15 + 4;
      pole.position.set(-18, 2.5, zPos);
      this.scene.add(pole);

      const lColor = colors[Math.abs(i) % colors.length];
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 12, 12),
        new THREE.MeshBasicMaterial({ color: lColor })
      );
      lantern.position.set(-17.5, 4.6, zPos);
      this.scene.add(lantern);

      const pLight = new THREE.PointLight(lColor, 1.6, 9, 2);
      pLight.position.copy(lantern.position);
      this.scene.add(pLight);
      this.lanternLights.push(pLight);
    }
  }

  // โคมลอยยี่เป็งนับร้อยดวงลอยขึ้นสู่ท้องฟ้า (Sky Lanterns as in images 2 & 4)
  createSkyLanterns() {
    this.skyLanterns = [];
    const lanternCount = 85; // Count increased to fill sky majestically
    const lanternGeo = new THREE.CylinderGeometry(0.4, 0.55, 0.95, 8, 1, true);

    for (let i = 0; i < lanternCount; i++) {
      const lanternMat = new THREE.MeshBasicMaterial({
        color: 0xffd060,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
      });
      const mesh = new THREE.Mesh(lanternGeo, lanternMat);

      // Inner fire flame glow
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
        speedY: 0.025 + Math.random() * 0.035, // Natural smooth rise
        driftAmp: 1.0 + Math.random() * 2.0,
        driftFreq: 0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
      });
    }
  }

  // กระทงสายและตะคันไฟลอยสว่างทั่วผืนน้ำ (Krathong Sai as in images 2, 3, 4)
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

      const posX = ((Math.random() - 0.5) * 45) + (Math.sin(i) * 5);
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

  // สร้างกระทง 3D พร้อมรูปถ่ายและองค์ประกอบครบเครื่อง
  buildKrathongMesh(data) {
    const group = new THREE.Group();
    group.userData = { id: data.id, entry: data };

    const themeColor = new THREE.Color(data.color || "#f59e0b");
    const leafColor = 0x2e7d32;

    // 1. Base Trunk (ฐานหยวกกล้วย)
    const baseGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.45, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x3d6b24,
      roughness: 0.8,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    base.castShadow = true;
    group.add(base);

    // 2. Folded Banana Leaves (กลีบใบตองพับรอบฐาน)
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

    // 3. Flower Bed (พวงมาลัยดอกไม้รอบฐานกระทง)
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

    // 4. Candle & Dynamic Flame (เทียนและเปลวไฟ)
    const candleGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.1, 10);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.set(0.3, 1.0, 0.2);
    group.add(candle);

    // Flame with fluttering movement
    const flameGeo = new THREE.ConeGeometry(0.14, 0.45, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff7700 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0.3, 1.75, 0.2);
    flame.name = "candleFlame";
    group.add(flame);

    // Bright PointLight from Candle
    const flameLight = new THREE.PointLight(0xffa500, 2.5, 9, 1.5);
    flameLight.position.set(0.3, 1.85, 0.2);
    group.add(flameLight);

    // 5. Incense Sticks (ธูป 3 ดอก)
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

    // 6. User Photo Stand Billboard (ป้ายรูปถ่ายของผู้โหวตบนกระทง)
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

    // Position & speed
    group.position.set(data.x || 0, 0, data.z || 10);
    group.userData.speed = data.speed || 0.009;
    group.userData.bobOffset = Math.random() * Math.PI * 2;
    group.userData.rotSpeed = (Math.random() - 0.5) * 0.006;

    return group;
  }

  updateKrathongs(entries) {
    const currentIds = new Set(entries.map((e) => e.id));

    // Remove old meshes
    for (const [id, mesh] of this.krathongMeshes.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        this.krathongMeshes.delete(id);
      }
    }

    // Add or update
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

  // Animation Loop: "วัตถุทุกอย่างมีความเคลื่อนไหว"
  animate() {
    this.animId = requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime();

    // 1. Controls
    this.controls.update();

    // 2. Animated River Water Ripples & Waves (ผิวน้ำเคลื่อนไหวกระเพื่อมเป็นระลอก)
    if (this.riverPositions && this.baseRiverCoords) {
      const pos = this.riverPositions.array;
      for (let i = 0; i < pos.length; i += 3) {
        const x = this.baseRiverCoords[i];
        const z = this.baseRiverCoords[i + 2];
        // Multi-frequency wave formula
        pos[i + 1] =
          Math.sin(x * 0.12 + time * 2.0) * 0.22 +
          Math.cos(z * 0.15 + time * 1.6) * 0.18 +
          Math.sin((x + z) * 0.08 + time * 2.4) * 0.12;
      }
      this.riverPositions.needsUpdate = true;
    }

    // 3. User Krathongs: Flow downstream + 3D Bobbing + Flame Dance
    for (const mesh of this.krathongMeshes.values()) {
      const speed = mesh.userData.speed || 0.009;
      const bob = mesh.userData.bobOffset || 0;

      // Float along downstream Z
      mesh.position.z -= speed * 4.6;
      if (mesh.position.z < -46) {
        mesh.position.z = 36 + Math.random() * 15;
        mesh.position.x = (Math.random() - 0.5) * 26;
      }

      // Natural river rocking & bobbing
      mesh.position.y = Math.sin(time * 2.8 + bob) * 0.1 + 0.06;
      mesh.rotation.z = Math.sin(time * 2.0 + bob) * 0.035;
      mesh.rotation.x = Math.cos(time * 1.7 + bob) * 0.03;
      mesh.rotation.y += mesh.userData.rotSpeed || 0.002;

      // Candle Flame Flutter
      const flame = mesh.getObjectByName("candleFlame");
      if (flame) {
        const flicker = Math.sin(time * 16.0 + bob) * 0.15 + 1.0;
        flame.scale.set(flicker, flicker * 1.1, flicker);
      }
    }

    // 4. Sky Lanterns: Ascending smoothly with harmonic wind drift (โคมลอยลอยขึ้นฟ้า)
    if (this.skyLanterns) {
      this.skyLanterns.forEach((item) => {
        item.mesh.position.y += item.speedY;
        // Sway gently with wind
        item.mesh.position.x =
          item.baseX + Math.sin(time * item.driftFreq + item.phase) * item.driftAmp;
        item.mesh.position.z =
          item.baseZ + Math.cos(time * (item.driftFreq * 0.8) + item.phase) * (item.driftAmp * 0.5);

        item.mesh.rotation.y += item.rotSpeed;
        item.mesh.rotation.z = Math.sin(time * 1.5 + item.phase) * 0.04;

        // Reset if reached high sky
        if (item.mesh.position.y > 75) {
          item.mesh.position.y = 8 + Math.random() * 8;
          item.mesh.position.x = (Math.random() - 0.5) * 110 + 5;
          item.mesh.position.z = -10 - Math.random() * 85;
          item.baseX = item.mesh.position.x;
          item.baseZ = item.mesh.position.z;
        }
      });
    }

    // 5. Krathong Sai / River Candles: Flowing downstream in golden ribbons (กระทงสายลอยน้ำ)
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

        // Flame flicker
        const fScale = 0.85 + Math.sin(time * 12.0 + item.bobPhase) * 0.2;
        item.flame.scale.set(fScale, fScale, fScale);
      });
    }

    // 6. Riverbank Torches: Dancing fire flames and light flickering (คบเพลิงลุกโชน)
    if (this.torchFlames) {
      this.torchFlames.forEach((item) => {
        const flameDance = Math.sin(time * item.speed + item.phase) * 0.2 + 1.0;
        item.flame.scale.set(flameDance * 0.9, flameDance * 1.2, flameDance * 0.9);
        item.flame.rotation.z = Math.sin(time * 8.0 + item.phase) * 0.12;
        item.core.scale.set(flameDance, flameDance, flameDance);
        item.light.intensity = 3.0 + Math.sin(time * 14.0 + item.phase) * 0.8;
      });
    }

    // 7. Swaying Trees in Night Breeze (กิ่งใบไม้ไหวตามลม)
    if (this.swayingTrees) {
      this.swayingTrees.forEach((item) => {
        item.group.rotation.z = Math.sin(time * item.speed + item.phase) * 0.05;
        item.group.rotation.x = Math.cos(time * (item.speed * 0.7) + item.phase) * 0.035;
      });
    }

    // 8. Temple Architectural Light Shimmer (แสงไฟวัดนวลตา)
    if (this.templeLight) {
      this.templeLight.intensity = 5.0 + Math.sin(time * 1.5) * 0.4;
    }

    // 9. Stars Twinkling
    if (this.starField) {
      this.starField.rotation.y = time * 0.002;
    }

    // 10. Render
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
