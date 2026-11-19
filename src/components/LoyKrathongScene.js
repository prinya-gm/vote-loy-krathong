import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export class LoyKrathongScene {
  constructor(container, onSelectKrathong) {
    this.container = container;
    this.onSelectKrathong = onSelectKrathong;
    this.krathongMeshes = new Map(); // id -> mesh group
    this.waterMesh = null;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040817); // Night deep blue
    this.scene.fog = new THREE.FogExp2(0x060c24, 0.018);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 18, 38);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls (Pan, Orbit, Zoom)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below water plane
    this.controls.minDistance = 6;
    this.controls.maxDistance = 85;
    this.controls.target.set(0, 2, 0);

    // 5. Lights
    this.setupLighting();

    // 6. Moon & Sky elements
    this.createMoon();
    this.createStars();

    // 7. River Water
    this.createRiver();

    // 8. Thai Traditional House & River Bank
    this.createThaiRiverBank();

    // 9. Floating Lanterns (โคมลอย)
    this.createSkyLanterns();

    // Event Listeners
    this.handleResize = this.onWindowResize.bind(this);
    this.handleClick = this.onPointerDown.bind(this);
    window.addEventListener("resize", this.handleResize);
    this.renderer.domElement.addEventListener("pointerdown", this.handleClick);

    // Start Animation Loop
    this.animate();
  }

  setupLighting() {
    // Ambient moonlight
    const ambientLight = new THREE.AmbientLight(0x1a2b4c, 1.2);
    this.scene.add(ambientLight);

    // Moonlight directional
    const moonDirLight = new THREE.DirectionalLight(0xd9e8ff, 1.5);
    moonDirLight.position.set(25, 45, -35);
    moonDirLight.castShadow = true;
    moonDirLight.shadow.mapSize.width = 2048;
    moonDirLight.shadow.mapSize.height = 2048;
    moonDirLight.shadow.camera.near = 10;
    moonDirLight.shadow.camera.far = 150;
    moonDirLight.shadow.camera.left = -40;
    moonDirLight.shadow.camera.right = 40;
    moonDirLight.shadow.camera.top = 40;
    moonDirLight.shadow.camera.bottom = -40;
    this.scene.add(moonDirLight);

    // Warm temple/house glow
    const houseWarmLight = new THREE.PointLight(0xffaa33, 4, 35, 1.5);
    houseWarmLight.position.set(-16, 8, -6);
    this.scene.add(houseWarmLight);

    const houseWarmLight2 = new THREE.PointLight(0xff7711, 2.5, 25, 1.5);
    houseWarmLight2.position.set(-14, 5, 4);
    this.scene.add(houseWarmLight2);
  }

  createMoon() {
    // 3D Moon sphere
    const moonGeo = new THREE.SphereGeometry(6, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xfffae0,
    });
    this.moon = new THREE.Mesh(moonGeo, moonMat);
    this.moon.position.set(30, 48, -65);
    this.scene.add(this.moon);

    // Glowing halo around the moon
    const haloGeo = new THREE.PlaneGeometry(28, 28);
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
    grad.addColorStop(0, "rgba(255, 250, 220, 0.9)");
    grad.addColorStop(0.3, "rgba(255, 230, 150, 0.4)");
    grad.addColorStop(0.7, "rgba(100, 150, 255, 0.15)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const haloTexture = new THREE.CanvasTexture(canvas);
    const haloMat = new THREE.MeshBasicMaterial({
      map: haloTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(this.moon.position);
    halo.position.z += 1;
    halo.lookAt(0, 20, 30);
    this.scene.add(halo);
  }

  createStars() {
    const starGeo = new THREE.BufferGeometry();
    const count = 700;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = 20 + Math.random() * 80;
      positions[i + 2] = -120 + Math.random() * 100;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      transparent: true,
      opacity: 0.75
    });
    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
  }

  createRiver() {
    // River plane with fine subdivisions for wave animation
    const riverGeo = new THREE.PlaneGeometry(160, 160, 64, 64);
    riverGeo.rotateX(-Math.PI / 2);

    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x051b3b,
      metalness: 0.85,
      roughness: 0.15,
      flatShading: true,
    });

    this.waterMesh = new THREE.Mesh(riverGeo, this.waterMat);
    this.waterMesh.position.y = 0;
    this.waterMesh.receiveShadow = true;
    this.scene.add(this.waterMesh);

    // Save base vertex positions for wave displacement
    this.riverPositions = riverGeo.attributes.position;
    this.baseRiverCoords = this.riverPositions.array.slice();
  }

  createThaiRiverBank() {
    // 1. River Bank (ฝั่งแม่น้ำ)
    const bankGeo = new THREE.BoxGeometry(32, 10, 160);
    const bankMat = new THREE.MeshStandardMaterial({
      color: 0x1f2e1a, // Dark green riverbank
      roughness: 0.9,
    });
    const bank = new THREE.Mesh(bankGeo, bankMat);
    bank.position.set(-36, -3, 0);
    bank.receiveShadow = true;
    this.scene.add(bank);

    // River Stone edge
    const stoneEdgeGeo = new THREE.BoxGeometry(4, 2, 160);
    const stoneEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x4a4f52,
      roughness: 0.8
    });
    const stoneEdge = new THREE.Mesh(stoneEdgeGeo, stoneEdgeMat);
    stoneEdge.position.set(-20, 0.5, 0);
    stoneEdge.receiveShadow = true;
    this.scene.add(stoneEdge);

    // Wooden Pier (ท่าน้ำ)
    this.createWoodenPier();

    // 2. Thai Traditional House (เรือนไทย)
    const houseGroup = this.buildThaiHouseMesh();
    houseGroup.position.set(-25, 2, -5);
    houseGroup.scale.set(1.4, 1.4, 1.4);
    this.scene.add(houseGroup);

    // Additional mini pavilion / ศาลาริมน้ำ
    const salaGroup = this.buildThaiSalaMesh();
    salaGroup.position.set(-21, 1.8, 16);
    salaGroup.scale.set(1.1, 1.1, 1.1);
    this.scene.add(salaGroup);

    // Traditional festival flags & lights
    this.createFestivalLanternPoles();
  }

  createWoodenPier() {
    // Pier extending into river for launching krathongs
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.7 });
    
    // Deck
    const deckGeo = new THREE.BoxGeometry(8, 0.5, 14);
    const deck = new THREE.Mesh(deckGeo, pierMat);
    deck.position.set(-16, 0.8, 6);
    deck.receiveShadow = true;
    this.scene.add(deck);

    // Pilings
    const pileGeo = new THREE.CylinderGeometry(0.3, 0.3, 6, 8);
    const pilePositions = [
      [-13, 0, 0],
      [-13, 0, 12],
      [-18, 0, 0],
      [-18, 0, 12],
    ];
    pilePositions.forEach(([x, y, z]) => {
      const pile = new THREE.Mesh(pileGeo, pierMat);
      pile.position.set(x, y, z);
      this.scene.add(pile);
    });

    // Stairs down to water
    for (let i = 0; i < 3; i++) {
      const stepGeo = new THREE.BoxGeometry(3, 0.3, 2.5);
      const step = new THREE.Mesh(stepGeo, pierMat);
      step.position.set(-11.5 + i * 0.8, 0.6 - i * 0.25, 6);
      this.scene.add(step);
    }
  }

  buildThaiHouseMesh() {
    const house = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2711, roughness: 0.7 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x6e3b19, roughness: 0.6 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xb53b1b, roughness: 0.5 }); // Terracotta tile
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 }); // Chofa ornament

    // Pillars (เสาเรือนไทย ยกใต้ถุนสูง)
    const pillarGeo = new THREE.CylinderGeometry(0.25, 0.25, 4, 8);
    const pillarCoords = [
      [-5, 2, -4], [0, 2, -4], [5, 2, -4],
      [-5, 2, 0],  [0, 2, 0],  [5, 2, 0],
      [-5, 2, 4],  [0, 2, 4],  [5, 2, 4],
    ];
    pillarCoords.forEach(([px, py, pz]) => {
      const p = new THREE.Mesh(pillarGeo, woodMat);
      p.position.set(px, py, pz);
      p.castShadow = true;
      house.add(p);
    });

    // Floor Platform (ชานเรือน)
    const floorGeo = new THREE.BoxGeometry(12, 0.4, 10);
    const floor = new THREE.Mesh(floorGeo, woodMat);
    floor.position.set(0, 4, 0);
    floor.castShadow = true;
    floor.receiveShadow = true;
    house.add(floor);

    // House Main Body (ตัวเรือนฝาปะกน)
    const bodyGeo = new THREE.BoxGeometry(8, 4.5, 6);
    const body = new THREE.Mesh(bodyGeo, wallMat);
    body.position.set(0, 6.4, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    house.add(body);

    // Traditional Thai Gable Roof (ทรงจั่วปลายงอน)
    const roofP1Geo = new THREE.ConeGeometry(6.5, 4, 4);
    roofP1Geo.rotateY(Math.PI / 4);
    const roofP1 = new THREE.Mesh(roofP1Geo, roofMat);
    roofP1.scale.set(1.4, 0.9, 1.1);
    roofP1.position.set(0, 10, 0);
    roofP1.castShadow = true;
    house.add(roofP1);

    // Eaves overhang (ชายคาปีกนก)
    const eaveGeo = new THREE.BoxGeometry(10.5, 0.3, 8.5);
    const eave = new THREE.Mesh(eaveGeo, roofMat);
    eave.position.set(0, 8.8, 0);
    house.add(eave);

    // Chofa (ช่อฟ้า ปลายหน้าบันไทย)
    const chofaGeo = new THREE.ConeGeometry(0.2, 1.6, 5);
    const chofaFront = new THREE.Mesh(chofaGeo, goldMat);
    chofaFront.position.set(0, 12, 3.8);
    chofaFront.rotation.x = 0.35;
    house.add(chofaFront);

    const chofaBack = new THREE.Mesh(chofaGeo, goldMat);
    chofaBack.position.set(0, 12, -3.8);
    chofaBack.rotation.x = -0.35;
    house.add(chofaBack);

    // Windows with warm light inside
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xffe277 });
    const win1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), windowMat);
    win1.position.set(-2, 6.5, 3.01);
    house.add(win1);

    const win2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), windowMat);
    win2.position.set(2, 6.5, 3.01);
    house.add(win2);

    return house;
  }

  buildThaiSalaMesh() {
    const sala = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2711, roughness: 0.6 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xc44520, roughness: 0.5 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 });

    // 4 Columns
    const colGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.5, 8);
    [[-2, 1.75, -2], [2, 1.75, -2], [-2, 1.75, 2], [2, 1.75, 2]].forEach(([x, y, z]) => {
      const col = new THREE.Mesh(colGeo, woodMat);
      col.position.set(x, y, z);
      sala.add(col);
    });

    // Sala Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.4, 5.2), woodMat);
    floor.position.set(0, 0.2, 0);
    sala.add(floor);

    // Sala Thai Roof
    const roofGeo = new THREE.ConeGeometry(3.8, 2.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 4.6, 0);
    sala.add(roof);

    // Sala Chofa apex
    const apex = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.2, 6), goldMat);
    apex.position.set(0, 6.2, 0);
    sala.add(apex);

    return sala;
  }

  createFestivalLanternPoles() {
    // Colorful Thai lanterns hanging along the bank
    this.lanternLights = [];
    const colors = [0xff5533, 0xffd23f, 0xee4266, 0x540d6e, 0x0ebd8a];
    
    for (let i = -3; i <= 3; i++) {
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 5, 6);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x221105 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      const zPos = i * 14 + 5;
      pole.position.set(-18, 2.5, zPos);
      this.scene.add(pole);

      // Lantern sphere
      const lanternGeo = new THREE.SphereGeometry(0.6, 12, 12);
      const lanternColor = colors[Math.abs(i) % colors.length];
      const lanternMat = new THREE.MeshBasicMaterial({ color: lanternColor });
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(-17.5, 4.5, zPos);
      this.scene.add(lantern);

      // Glow light
      const pLight = new THREE.PointLight(lanternColor, 1.2, 8, 2);
      pLight.position.copy(lantern.position);
      this.scene.add(pLight);
      this.lanternLights.push(pLight);
    }
  }

  createSkyLanterns() {
    // Floating lanterns in the sky (โคมลอย)
    this.skyLanterns = [];
    const count = 35;
    const lanternGeo = new THREE.CylinderGeometry(0.35, 0.5, 0.8, 8, 1, true);
    
    for (let i = 0; i < count; i++) {
      const lanternMat = new THREE.MeshBasicMaterial({
        color: 0xffd97d,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const mesh = new THREE.Mesh(lanternGeo, lanternMat);
      mesh.position.set(
        (Math.random() - 0.5) * 80 + 10,
        15 + Math.random() * 35,
        -10 - Math.random() * 70
      );
      this.scene.add(mesh);

      this.skyLanterns.push({
        mesh,
        baseX: mesh.position.x,
        speedY: 0.015 + Math.random() * 0.02,
        driftSpeed: 0.005 + Math.random() * 0.008,
        driftFreq: 0.5 + Math.random() * 1.5,
        offset: Math.random() * Math.PI * 2
      });
    }
  }

  // Build a distinct 3D Krathong mesh with Banana Leaf base, Candle flame, incense, & Photo
  buildKrathongMesh(data) {
    const group = new THREE.Group();
    group.userData = { id: data.id, entry: data };

    const themeColor = new THREE.Color(data.color || "#f59e0b");
    const leafColor = 0x2e7d32; // banana leaf green

    // 1. Base Trunk (หยวกกล้วยฐานกระทง)
    const baseGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.45, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x3d6b24,
      roughness: 0.8,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    base.castShadow = true;
    group.add(base);

    // 2. Folded Banana Leaves layer (กลีบกระทงพับรอบฐาน)
    const petalCount = 14;
    const petalGeo = new THREE.ConeGeometry(0.4, 1.2, 4);
    petalGeo.scale(1.2, 1, 0.3); // Flatten petal
    const petalMat = new THREE.MeshStandardMaterial({
      color: leafColor,
      roughness: 0.6
    });

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(
        Math.cos(angle) * 1.7,
        0.5,
        Math.sin(angle) * 1.7
      );
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.z = 0.35;
      petal.castShadow = true;
      group.add(petal);
    }

    // 3. Inner Flower Bed (ดอกไม้หลากสีรอบฐาน)
    const flowerBedGeo = new THREE.TorusGeometry(1.1, 0.28, 8, 18);
    flowerBedGeo.rotateX(Math.PI / 2);
    const flowerBedMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      roughness: 0.5,
      metalness: 0.1
    });
    const flowerBed = new THREE.Mesh(flowerBedGeo, flowerBedMat);
    flowerBed.position.y = 0.45;
    group.add(flowerBed);

    // 4. Candle & Flame (เทียนและเปลวไฟ)
    const candleGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.1, 10);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.set(0.3, 1.0, 0.2);
    group.add(candle);

    // Flame
    const flameGeo = new THREE.ConeGeometry(0.12, 0.4, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff8811 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0.3, 1.7, 0.2);
    group.add(flame);

    // Flame PointLight
    const flameLight = new THREE.PointLight(0xffa500, 1.5, 6, 2);
    flameLight.position.set(0.3, 1.8, 0.2);
    group.add(flameLight);

    // 5. Incense Sticks (ธูป 3 ดอก)
    const incenseGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 6);
    const incenseMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });

    [[-0.2, 0], [-0.35, 0.15], [-0.35, -0.15]].forEach(([ix, iz], idx) => {
      const stick = new THREE.Mesh(incenseGeo, incenseMat);
      stick.position.set(ix, 1.1, iz);
      stick.rotation.z = -0.15 * (idx + 1);
      group.add(stick);

      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), tipMat);
      tip.position.set(ix - 0.15, 1.9, iz);
      group.add(tip);
    });

    // 6. User Photo Stand Billboard (ป้ายรูปถ่ายของผู้โหวตบนกระทง)
    const photoGroup = new THREE.Group();
    photoGroup.position.set(0, 1.6, -0.4);

    // Frame
    const frameGeo = new THREE.BoxGeometry(1.6, 1.6, 0.1);
    const frameMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      metalness: 0.3,
      roughness: 0.4
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    photoGroup.add(frame);

    // Texture image loader for photo
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    
    // Default placeholder texture
    const photoCanvas = document.createElement("canvas");
    photoCanvas.width = 128;
    photoCanvas.height = 128;
    const pCtx = photoCanvas.getContext("2d");
    pCtx.fillStyle = "#ffffff";
    pCtx.fillRect(0, 0, 128, 128);
    pCtx.fillStyle = "#1e293b";
    pCtx.font = "bold 14px sans-serif";
    pCtx.textAlign = "center";
    pCtx.fillText(data.name.slice(0, 8), 64, 70);

    const defaultTex = new THREE.CanvasTexture(photoCanvas);
    const photoMat = new THREE.MeshBasicMaterial({
      map: defaultTex,
      side: THREE.DoubleSide
    });
    const photoPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), photoMat);
    photoPlane.position.z = 0.06;
    photoGroup.add(photoPlane);

    // Back photo plane too so it looks good from reverse
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
        () => {
          // Keep canvas fallback
        }
      );
    }

    group.add(photoGroup);

    // 7. Interactive selection ring (เมื่อชี้หรือกด)
    const ringGeo = new THREE.RingGeometry(1.9, 2.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.05;
    ring.name = "highlightRing";
    group.add(ring);

    // Set Initial Position from data
    group.position.set(data.x || 0, 0, data.z || 10);
    
    // Save animation parameters
    group.userData.speed = data.speed || 0.008;
    group.userData.bobOffset = Math.random() * Math.PI * 2;
    group.userData.rotSpeed = (Math.random() - 0.5) * 0.005;

    return group;
  }

  updateKrathongs(entries) {
    const currentIds = new Set(entries.map((e) => e.id));

    // Remove old meshes that don't exist anymore
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
        // Distribute nicely along river if new
        if (entry.x === undefined) {
          entry.x = ((index % 5) - 2) * 7 + (Math.random() - 0.5) * 3;
          entry.z = 5 + (index * 6);
        }
        mesh = this.buildKrathongMesh(entry);
        this.scene.add(mesh);
        this.krathongMeshes.set(entry.id, mesh);
      } else {
        // Update user data (e.g. votes count)
        mesh.userData.entry = entry;
      }
    });
  }

  highlightKrathong(id) {
    for (const [mId, mesh] of this.krathongMeshes.entries()) {
      const ring = mesh.getObjectByName("highlightRing");
      if (ring) {
        ring.material.opacity = mId === id ? 0.9 : 0;
      }
    }
  }

  focusOnKrathong(id) {
    const mesh = this.krathongMeshes.get(id);
    if (!mesh) return;

    this.highlightKrathong(id);

    // Smoothly focus camera target
    const targetPos = mesh.position.clone();
    targetPos.y += 1.5;
    
    // Animate target
    this.controls.target.copy(targetPos);
  }

  onPointerDown(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check intersection with any krathong children
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
      // Find top group
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

  animate() {
    this.animId = requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime();

    // 1. Controls update
    this.controls.update();

    // 2. Animate Water Surface Waves
    if (this.riverPositions && this.baseRiverCoords) {
      const pos = this.riverPositions.array;
      for (let i = 0; i < pos.length; i += 3) {
        const x = this.baseRiverCoords[i];
        const z = this.baseRiverCoords[i + 2];
        // Sine wave formula
        pos[i + 1] = Math.sin(x * 0.15 + time * 1.8) * 0.22 +
                     Math.cos(z * 0.18 + time * 1.4) * 0.25;
      }
      this.riverPositions.needsUpdate = true;
    }

    // 3. Animate Krathongs floating downstream
    for (const mesh of this.krathongMeshes.values()) {
      const speed = mesh.userData.speed || 0.008;
      const bob = mesh.userData.bobOffset || 0;

      // Float along Z axis (from +Z to -Z)
      mesh.position.z -= speed * 4.5;
      if (mesh.position.z < -45) {
        // Loop back to upstream
        mesh.position.z = 35 + Math.random() * 15;
        mesh.position.x = (Math.random() - 0.5) * 24;
      }

      // Gentle water bobbing and rocking
      mesh.position.y = Math.sin(time * 2.5 + bob) * 0.08 + 0.05;
      mesh.rotation.z = Math.sin(time * 1.8 + bob) * 0.03;
      mesh.rotation.x = Math.cos(time * 1.5 + bob) * 0.025;
      mesh.rotation.y += mesh.userData.rotSpeed || 0.001;
    }

    // 4. Animate Sky Lanterns rising gently
    if (this.skyLanterns) {
      this.skyLanterns.forEach((item) => {
        item.mesh.position.y += item.speedY;
        item.mesh.position.x = item.baseX + Math.sin(time * item.driftFreq + item.offset) * 1.5;
        // reset if too high
        if (item.mesh.position.y > 60) {
          item.mesh.position.y = 12;
          item.mesh.position.z = -20 - Math.random() * 50;
        }
      });
    }

    // 5. Render
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
    window.removeEventListener("resize", this.handleResize);
    if (this.renderer?.domElement) {
      this.renderer.domElement.removeEventListener("pointerdown", this.handleClick);
      if (this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
    }
  }
}
