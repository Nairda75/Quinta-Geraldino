/* Quinta Geraldino — vista aérea 3D que roda com o scroll.
   Ilustração gerada em código a partir da planta do Google Maps (satélite):
   salão de telhado branco a norte, relvado e jardim arborizado ao centro,
   estacionamento em L a nascente e a sul, entrada pela Rua Nova da Bajouca.
   Coordenadas em "píxeis do mapa" (vista de satélite ~0,45 m por píxel). */
import * as THREE from "../vendor/three.module.min.js";

const section = document.querySelector(".aerial");
const canvasHost = section && section.querySelector(".aerial-canvas");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglOK() {
  try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
  catch (e) { return false; }
}

if (section && canvasHost && webglOK()) init();
else if (section) section.classList.add("aerial--fallback");

function init() {
  const S = 0.45;                 // metros por píxel do mapa
  const C = { x: 445, y: 275 };   // centro da Quinta no mapa
  const W = (x, y, h = 0) => new THREE.Vector3((x - C.x) * S, h, (y - C.y) * S);
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const lowPower = isMobile || (navigator.hardwareConcurrency || 8) <= 4;

  /* ---------- Renderizador ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasHost.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xdfe2d5, 260, 620);
  const camera = new THREE.PerspectiveCamera(32, 1, 1, 2000);

  scene.add(new THREE.HemisphereLight(0xf6f1e4, 0x5d6b47, 1.25));
  const sun = new THREE.DirectionalLight(0xffeccc, 2.4);
  sun.position.set(-140, 190, 110);
  sun.castShadow = true;
  const sm = lowPower ? 1024 : 2048;
  sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 10, far: 600 });
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.6;
  scene.add(sun);

  /* ---------- Solo: textura desenhada a partir da planta ---------- */
  const X0 = -40, X1 = 920, Y0 = -80, Y1 = 680;
  const TW = lowPower ? 1536 : 2048, TH = Math.round(TW * (Y1 - Y0) / (X1 - X0));
  const cv = document.createElement("canvas"); cv.width = TW; cv.height = TH;
  const g = cv.getContext("2d");
  const k = TW / (X1 - X0);
  const P = (x, y) => [(x - X0) * k, (y - Y0) * k];
  const poly = (pts, fill, stroke, lw) => {
    g.beginPath(); pts.forEach(([x, y], i) => { const [a, b] = P(x, y); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw * k; g.stroke(); }
  };
  const line = (pts, color, w) => {
    g.beginPath(); pts.forEach(([x, y], i) => { const [a, b] = P(x, y); i ? g.lineTo(a, b) : g.moveTo(a, b); });
    g.strokeStyle = color; g.lineWidth = w * k; g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
  };
  // campos agrícolas com sulcos
  g.fillStyle = "#6f8650"; g.fillRect(0, 0, TW, TH);
  const fields = [
    { pts: [[520, -80], [920, -80], [920, 120], [640, 200], [560, 120]], a: -0.42, c: "#62803f" },
    { pts: [[600, 140], [920, 60], [920, 330], [700, 400], [620, 320]], a: -0.45, c: "#6a8a45" },
    { pts: [[640, 420], [920, 340], [920, 680], [700, 680]], a: -0.42, c: "#5f7d3d" },
    { pts: [[-40, 520], [180, 470], [300, 560], [300, 680], [-40, 680]], a: 0.5, c: "#738b4f" },
    { pts: [[200, 330], [300, 300], [340, 420], [250, 470]], a: 0.3, c: "#7f915a" },
  ];
  fields.forEach(f => {
    g.save(); poly(f.pts, f.c); g.clip();
    g.strokeStyle = "rgba(255,255,255,.07)"; g.lineWidth = 2.2 * k;
    const [cx, cy] = P(f.pts[0][0], f.pts[0][1]);
    g.translate(cx, cy); g.rotate(f.a);
    for (let i = -1400; i < 1400; i += 3.2 * k) { g.beginPath(); g.moveTo(-1600, i); g.lineTo(1600, i); g.stroke(); }
    g.restore();
    poly(f.pts, null, "rgba(60,70,40,.35)", 1.2);
  });
  // aldeia (lotes, quintais)
  poly([[-40, 120], [140, 60], [300, 0], [300, 120], [250, 260], [180, 330], [-40, 420]], "#b9ad93");
  poly([[300, 470], [460, 450], [640, 410], [700, 680], [300, 680]], "#b8ab90");
  poly([[200, -80], [520, -80], [470, 40], [300, 70]], "#bdb196");
  // estradas
  const roadA = [[-40, 300], [60, 230], [150, 165], [230, 110], [300, 75], [390, 35], [470, 0], [560, -60]];
  const roadB = [[175, 170], [215, 250], [250, 330], [290, 420], [322, 490], [332, 680]];
  const roadC = [[300, 505], [450, 472], [620, 425], [790, 378], [920, 345]];
  [roadA, roadB, roadC].forEach(r => { line(r, "#8d8a83", 17); line(r, "#5d5b57", 13); });
  // propriedade
  const prop = [[285, 118], [345, 92], [425, 66], [470, 70], [505, 82], [560, 232], [602, 338], [612, 408], [435, 456], [402, 432], [352, 330], [300, 205]];
  poly(prop, "#a99f86");
  // estacionamento (saibro em L)
  poly([[470, 78], [503, 84], [557, 232], [600, 340], [607, 402], [440, 449], [402, 428], [418, 388], [525, 366], [548, 300], [512, 214], [492, 140]], "#d6c3a0");
  // marcas de lugares
  g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 0.6 * k;
  for (let t = 0; t < 1; t += 0.045) {
    const x = 505 + t * 85, y = 120 + t * 250; const [a, b] = P(x, y), [c, d] = P(x + 12, y - 4);
    g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke();
  }
  // acesso interior e pátio
  line([[420, 452], [392, 405], [360, 335], [330, 262], [306, 200], [300, 150]], "#9b968c", 9);
  poly([[330, 214], [418, 182], [434, 232], [350, 266]], "#c9c4b8");
  // relvado
  poly([[372, 246], [470, 206], [494, 262], [396, 302]], "#7fae4f", "rgba(255,255,255,.25)", 0.8);
  // corredor da cerimónia
  line([[402, 284], [462, 222]], "#e6dccb", 2.4);
  // canteiros e sombras do jardim
  poly([[395, 302], [494, 262], [528, 300], [520, 372], [430, 392], [404, 350]], "#55703a");
  // sebe a nascente
  line([[505, 82], [560, 232], [602, 338], [612, 408]], "#3f5a2c", 7);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry((X1 - X0) * S, (Y1 - Y0) * S),
    new THREE.MeshLambertMaterial({ map: tex })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(((X0 + X1) / 2 - C.x) * S, 0, ((Y0 + Y1) / 2 - C.y) * S);
  ground.receiveShadow = true;
  scene.add(ground);

  /* ---------- Edifícios ---------- */
  const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
  const wallM = mat(0xefe9dc), roofWhite = mat(0xf4f5f2), roofRed = mat(0xb4553a), roofGrey = mat(0x8e9290), glassM = mat(0x51605a);
  function building({ x, y, l, w, h, ang, roof = "gable", roofM = roofWhite, wall = wallM }) {
    const grp = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(l * S, h, w * S), wall);
    body.position.y = h / 2; body.castShadow = body.receiveShadow = true; grp.add(body);
    // faixa de janelas
    const win = new THREE.Mesh(new THREE.BoxGeometry(l * S * 0.92, h * 0.28, w * S + 0.2), glassM);
    win.position.y = h * 0.45; grp.add(win);
    if (roof === "gable") {
      // telhado de duas águas baixo (prisma triangular)
      const hw = w * S * 0.53, rh = Math.min(3.2, w * S * 0.12);
      const sh = new THREE.Shape(); sh.moveTo(-hw, 0); sh.lineTo(hw, 0); sh.lineTo(0, rh); sh.closePath();
      const rg = new THREE.ExtrudeGeometry(sh, { depth: l * S * 1.02, bevelEnabled: false });
      rg.translate(0, 0, -l * S * 0.51); rg.rotateY(Math.PI / 2);
      const r = new THREE.Mesh(rg, roofM); r.position.y = h; r.castShadow = true; grp.add(r);
    } else if (roof === "hip") {
      const r = new THREE.Mesh(new THREE.ConeGeometry(Math.max(l, w) * S * 0.72, h * 0.55, 4), roofM);
      r.rotation.y = Math.PI / 4; r.scale.set(l / Math.max(l, w), 1, w / Math.max(l, w));
      r.position.y = h + h * 0.27; r.castShadow = true; grp.add(r);
    } else {
      const r = new THREE.Mesh(new THREE.BoxGeometry(l * S * 1.03, 0.6, w * S * 1.06), roofM);
      r.position.y = h + 0.3; r.castShadow = true; grp.add(r);
    }
    const p = W(x, y); grp.position.copy(p); grp.rotation.y = -ang;
    scene.add(grp); return grp;
  }
  const hallAng = Math.atan2(-75, 170);
  building({ x: 390, y: 180, l: 176, w: 72, h: 7.5, ang: hallAng, roof: "gable" });          // salão
  building({ x: 330, y: 168, l: 42, w: 40, h: 6, ang: hallAng, roof: "flat", roofM: mat(0xd9d6cf) }); // anexo / cozinha
  building({ x: 318, y: 186, l: 22, w: 18, h: 5, ang: hallAng, roof: "hip", roofM: roofRed });
  building({ x: 436, y: 90, l: 52, w: 30, h: 5.5, ang: hallAng, roof: "hip", roofM: roofRed });
  building({ x: 372, y: 62, l: 96, w: 32, h: 5, ang: hallAng, roof: "flat", roofM: roofGrey });
  building({ x: 466, y: 206, l: 14, w: 10, h: 3, ang: hallAng, roof: "flat", roofM: mat(0xe9e4da) });  // pérgola do relvado

  /* ---------- Casas da aldeia ---------- */
  const inside = (x, y, pts) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const houses = [];
  function alongRoad(road, side, step, from = 0, to = 1) {
    let total = 0; const segs = [];
    for (let i = 1; i < road.length; i++) { const d = Math.hypot(road[i][0] - road[i - 1][0], road[i][1] - road[i - 1][1]); segs.push(d); total += d; }
    for (let s = from * total; s < to * total; s += step + rnd() * step * 0.6) {
      let acc = 0, i = 0; while (i < segs.length - 1 && acc + segs[i] < s) { acc += segs[i]; i++; }
      const t = (s - acc) / segs[i], [ax, ay] = road[i], [bx, by] = road[i + 1];
      const x = ax + (bx - ax) * t, y = ay + (by - ay) * t, ang = Math.atan2(by - ay, bx - ax);
      const off = side * (24 + rnd() * 10);
      houses.push({ x: x - Math.sin(ang) * off, y: y + Math.cos(ang) * off, ang });
    }
  }
  alongRoad(roadA, 1, 26); alongRoad(roadA, -1, 30, 0, 0.75);
  alongRoad(roadB, -1, 26); alongRoad(roadB, 1, 28, 0.62, 1);
  alongRoad(roadC, 1, 28, 0, 0.55);
  houses.filter(hh => !inside(hh.x, hh.y, prop) && hh.x > X0 + 20 && hh.x < X1 - 20 && hh.y > Y0 + 20 && hh.y < Y1 - 20)
    .forEach(hh => building({ x: hh.x, y: hh.y, l: 14 + rnd() * 10, w: 11 + rnd() * 6, h: 5 + rnd() * 3, ang: -hh.ang, roof: "hip", roofM: rnd() > 0.2 ? roofRed : roofGrey, wall: mat(rnd() > 0.5 ? 0xf2ede3 : 0xe5dccb) }));

  /* ---------- Árvores (instanciadas) ---------- */
  const trees = [], palms = [];
  const scatter = (cx, cy, r, n, arr) => { for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * r; const x = cx + Math.cos(a) * d * 1.3, y = cy + Math.sin(a) * d; if (inside(x, y, [[395, 302], [494, 262], [528, 300], [520, 372], [430, 392], [404, 350]])) arr.push([x, y]); } };
  scatter(462, 330, 70, 70, trees);
  palms.push([420, 318], [448, 300], [476, 352], [502, 312], [438, 372], [488, 286], [462, 334]);
  const hedge = [[505, 82], [560, 232], [602, 338], [612, 408]];
  for (let i = 1; i < hedge.length; i++) for (let t = 0; t < 1; t += 0.14) trees.push([hedge[i - 1][0] + (hedge[i][0] - hedge[i - 1][0]) * t + 6, hedge[i - 1][1] + (hedge[i][1] - hedge[i - 1][1]) * t]);
  for (let t = 0; t <= 1; t += 0.07) trees.push([352 + t * 60, 330 + t * 110], [300 + t * 30, 200 + t * 125]);
  for (let t = 0; t <= 1; t += 0.12) trees.push([292 + t * 120, 118 - t * 40]);
  [[120, 330], [90, 380], [240, 420], [600, 470], [660, 455], [250, 20], [180, 60], [560, 60]].forEach(p => trees.push(p));
  const crownG = new THREE.IcosahedronGeometry(1, 1), trunkG = new THREE.CylinderGeometry(0.22, 0.32, 1, 6);
  const crownM = mat(0x3f5f2d), crownM2 = mat(0x4f7136), trunkM = mat(0x6d5236);
  const crowns = new THREE.InstancedMesh(crownG, crownM, trees.length), crowns2 = new THREE.InstancedMesh(crownG, crownM2, trees.length);
  const trunks = new THREE.InstancedMesh(trunkG, trunkM, trees.length + palms.length);
  const o = new THREE.Object3D();
  trees.forEach(([x, y], i) => {
    const s = 2.6 + rnd() * 2.6, p = W(x, y);
    o.position.set(p.x, s * 1.35, p.z); o.scale.set(s, s * (0.85 + rnd() * 0.3), s); o.rotation.set(rnd(), rnd(), 0); o.updateMatrix(); crowns.setMatrixAt(i, o.matrix);
    o.position.set(p.x + 0.6, s * 1.9, p.z - 0.4); o.scale.set(s * 0.65, s * 0.6, s * 0.65); o.updateMatrix(); crowns2.setMatrixAt(i, o.matrix);
    o.rotation.set(0, 0, 0); o.position.set(p.x, s * 0.5, p.z); o.scale.set(1, s, 1); o.updateMatrix(); trunks.setMatrixAt(i, o.matrix);
  });
  // palmeiras: tronco alto + coroa de folhas
  const leafG = new THREE.ConeGeometry(0.5, 5.5, 4); leafG.translate(0, 2.75, 0); leafG.rotateX(Math.PI / 2.4);
  const leaves = new THREE.InstancedMesh(leafG, mat(0x587c34), palms.length * 9);
  palms.forEach(([x, y], i) => {
    const p = W(x, y), h = 11 + rnd() * 4;
    o.rotation.set(0, 0, 0); o.position.set(p.x, h / 2, p.z); o.scale.set(1.1, h, 1.1); o.updateMatrix(); trunks.setMatrixAt(trees.length + i, o.matrix);
    for (let j = 0; j < 9; j++) { o.position.set(p.x, h, p.z); o.rotation.set(0, (j / 9) * Math.PI * 2 + rnd() * 0.3, 0); o.scale.set(1, 1, 1); o.updateMatrix(); leaves.setMatrixAt(i * 9 + j, o.matrix); }
  });
  [crowns, crowns2, trunks, leaves].forEach(m => { m.castShadow = true; m.receiveShadow = true; m.instanceMatrix.needsUpdate = true; scene.add(m); });

  /* ---------- Carros no estacionamento ---------- */
  const carG = new THREE.BoxGeometry(4.3, 1.5, 1.9); carG.translate(0, 0.75, 0);
  const cars = new THREE.InstancedMesh(carG, new THREE.MeshLambertMaterial(), 26);
  const carColors = [0xf2f2f0, 0x2d2f33, 0x8e959b, 0x6e2b25, 0x2e4057, 0xc9c6bf];
  for (let i = 0; i < 26; i++) {
    const t = i / 26; let x, y, a;
    if (i < 17) { x = 512 + t * 1.55 * 85 + (rnd() - 0.5) * 2; y = 122 + t * 1.55 * 250; a = Math.atan2(-4, 12); }
    else { const u = (i - 17) / 9; x = 455 + u * 130; y = 432 - u * 34; a = Math.atan2(-34, 130) + Math.PI / 2; }
    const p = W(x, y); o.position.set(p.x, 0, p.z); o.rotation.set(0, -a, 0); o.scale.set(1, 1, 1); o.updateMatrix();
    cars.setMatrixAt(i, o.matrix); cars.setColorAt(i, new THREE.Color(carColors[i % carColors.length]));
  }
  cars.castShadow = true; scene.add(cars);

  /* ---------- Cerimónia: arco floral e cadeiras ---------- */
  const arch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.45, 6, 16, Math.PI), mat(0xd77a62));
  const ap = W(464, 224); arch.position.set(ap.x, 0, ap.z); arch.rotation.y = -hallAng + Math.PI / 2; arch.castShadow = true; scene.add(arch);
  const chairG = new THREE.BoxGeometry(0.9, 0.9, 0.9); chairG.translate(0, 0.45, 0);
  const chairs = new THREE.InstancedMesh(chairG, mat(0xc89b6a), 96);
  let ci = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) for (const side of [-1, 1]) {
    const along = 0.18 + r * 0.075, base = [402 + (462 - 402) * along, 284 + (222 - 284) * along];
    const nx = 0.72, ny = 0.7; // perpendicular ao corredor
    const p = W(base[0] + side * (3 + c * 2.1) * nx, base[1] + side * (3 + c * 2.1) * ny);
    o.position.set(p.x, 0, p.z); o.rotation.set(0, -hallAng, 0); o.scale.set(1, 1, 1); o.updateMatrix(); chairs.setMatrixAt(ci++, o.matrix);
  }
  chairs.castShadow = true; scene.add(chairs);

  /* ---------- Pontos de interesse ---------- */
  const spots = [...section.querySelectorAll("[data-spot]")].map(el => ({
    el, pos: W(+el.dataset.x, +el.dataset.y, +(el.dataset.h || 4)), from: +el.dataset.from, to: +el.dataset.to,
  }));

  /* ---------- Câmara: órbita em função do scroll ---------- */
  const target = W(445, 268, 0);
  let progress = 0, smooth = 0, running = false, visible = true, needResize = true;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function camAt(p) {
    const tilt = ease(Math.min(1, p / 0.42));
    const elev = lerp(89, 34, tilt) * Math.PI / 180;            // de cima (satélite) para vista oblíqua
    const az = (-28 + p * 300) * Math.PI / 180;                 // volta à Quinta
    const aspect = camera.aspect;
    const fit = aspect < 1 ? 1.05 + (1 - aspect) * 0.5 : 1;
    const dist = lerp(470, lerp(250, 205, ease(p)), tilt) * fit;
    scene.fog.near = dist * 0.75; scene.fog.far = dist * 2.4;
    camera.position.set(
      target.x + Math.cos(elev) * Math.sin(az) * dist,
      target.y + Math.sin(elev) * dist,
      target.z + Math.cos(elev) * Math.cos(az) * dist
    );
    camera.lookAt(target.x, target.y + lerp(0, 6, tilt), target.z);
  }
  function resize() {
    const w = canvasHost.clientWidth, h = canvasHost.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = camera.aspect < 1 ? 52 : (camera.aspect < 1.3 ? 40 : 32); camera.updateProjectionMatrix(); needResize = false;
  }
  const v = new THREE.Vector3();
  function placeSpots() {
    const w = canvasHost.clientWidth, h = canvasHost.clientHeight;
    spots.forEach(s => {
      const on = smooth >= s.from && smooth <= s.to;
      v.copy(s.pos).project(camera);
      const x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      s.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      s.el.classList.toggle("on", on && v.z < 1);
    });
  }
  function readProgress() {
    const r = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    progress = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
  }
  function frame() {
    if (needResize) resize();
    readProgress();
    smooth = reduceMotion ? progress : lerp(smooth, progress, 0.085);
    if (Math.abs(smooth - progress) < 0.0004) smooth = progress;
    camAt(smooth);
    renderer.render(scene, camera);
    placeSpots();
    section.style.setProperty("--p", smooth.toFixed(4));
    section.dispatchEvent(new CustomEvent("aerial:progress", { detail: smooth }));
    if (visible && (smooth !== progress || needResize)) requestAnimationFrame(frame);
    else running = false;
  }
  function kick() { if (!running && visible) { running = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", kick, { passive: true });
  let lastW = window.innerWidth;
  window.addEventListener("resize", () => { if (!isMobile || window.innerWidth !== lastW) { lastW = window.innerWidth; needResize = true; kick(); } });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; kick(); }, { rootMargin: "100px" }).observe(section);

  // capítulos clicáveis (saltam para um ponto da volta)
  section.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => {
    const total = section.offsetHeight - window.innerHeight;
    const y = section.getBoundingClientRect().top + window.scrollY + total * +b.dataset.goto;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.6 }); else window.scrollTo({ top: y, behavior: "smooth" });
  }));

  resize(); camAt(0); renderer.render(scene, camera);
  section.classList.add("aerial--ready");
  kick();
}
