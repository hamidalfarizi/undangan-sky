'use strict';
/* ══════════════════════════════════════════════════════════
   SKY WEDDING 3D — REALISTIC DAYLIGHT PRAIRIE EDITION ✨
   3 Portals · +50% Speed · Soft Shadows & PBR Textures
   Ancient Bell Towers · Lush Meadows · Crystal Brook
   ══════════════════════════════════════════════════════════ */
import * as THREE from 'three';

/* ─── PHYSICS & MOVEMENT (+50% SPEED) ─────────────────────── */
const PHY = {
  GRAVITY: 0.012,
  JUMP: 0.32,
  FLY: 0.013,
  MAX_WING: 100,
  W_DRAIN: 1.4,
  W_REGEN: 1.4,
  SPEED: 0.205,       // +50% faster than previous 0.135!
  ACCEL: 0.22         // Responsive acceleration & braking
};

/* ─── 4 CHAPTERS CONNECTED BY EXACTLY 3 PORTALS ───────────── */
const REALMS = [
  {
    id: 1,
    name: 'Padang Kupu-Kupu',
    sub: 'Daylight Prairie ✦ Perkenalan & Mempelai',
    sky: { top: '#1676db', mid: '#66befa', bot: '#fff0cb' },
    fog: { c: 0xbfe6fd, d: 0.004 },
    ambC: '#6ea6e6', dirC: '#fffcf0', dirP: [55, 75, -40],
    gHex: 0x5ab826, pHex: 0x8ce838,
    deco: 'butterfly_meadows',
    items: [
      { p: [0, 0, 22],  d: { type: 'intro' } },
      { p: [-4, 0, 50], d: { type: 'groom' } },
      { p: [4, 0, 78],  d: { type: 'bride' } },
      { p: [-3, 0, 106], d: { type: 'quote' } }
    ],
    portal: [0, 0, 132], next: 2, depth: 152   // ✦ PORTAL 1
  },
  {
    id: 2,
    name: 'Tiga Menara Lonceng',
    sub: 'Daylight Prairie ✦ Kisah Cinta Kita',
    sky: { top: '#146cd4', mid: '#5eb4f6', bot: '#ffebb0' },
    fog: { c: 0xb5defa, d: 0.0038 },
    ambC: '#669fe2', dirC: '#fff8e4', dirP: [60, 80, -45],
    gHex: 0x54b224, pHex: 0x88e236,
    deco: 'bell_towers',
    items: [
      { p: [0, 0, 26],  d: { type: 'story1' } },
      { p: [5, 0, 62],  d: { type: 'story2' } },
      { p: [-5, 0, 96], d: { type: 'story3' } }
    ],
    portal: [0, 0, 128], next: 3, depth: 148   // ✦ PORTAL 2
  },
  {
    id: 3,
    name: 'Desa Praire & Altar Suci',
    sub: 'Daylight Prairie ✦ Akad, Resepsi & RSVP',
    sky: { top: '#1c7adc', mid: '#6cc2f8', bot: '#fff2ce' },
    fog: { c: 0xbce4fd, d: 0.004 },
    ambC: '#6aa2e6', dirC: '#fffbe8', dirP: [50, 70, -35],
    gHex: 0x5cb828, pHex: 0x90e83c,
    deco: 'prairie_village',
    items: [
      { p: [0, 0, 22],  d: { type: 'akad_time' } },
      { p: [-5, 0, 48], d: { type: 'akad_place' } },
      { p: [5, 0, 74],  d: { type: 'resepsi_time' } },
      { p: [-4, 0, 98], d: { type: 'resepsi_place' } },
      { p: [0, 0, 122], d: { type: 'rsvp' } }
    ],
    portal: [0, 0, 150], next: 4, depth: 170   // ✦ PORTAL 3
  },
  {
    id: 4,
    name: 'Kuil Cahaya Praire',
    sub: 'Daylight Prairie ✦ Doa Restu & Penutup',
    sky: { top: '#2282e4', mid: '#78cdfc', bot: '#fff6de' },
    fog: { c: 0xc8ebff, d: 0.0035 },
    ambC: '#76b2f4', dirC: '#ffffff', dirP: [0, 85, -25],
    gHex: 0x58bc28, pHex: 0x92ea40,
    deco: 'grand_temple',
    items: [
      { p: [-4, 0, 44], d: { type: 'thankyou' } },
      { p: [4, 0, 92],  d: { type: 'ending' } }
    ],
    portal: null, next: null, depth: 135        // ✦ FINAL CHAPTER (No portal needed!)
  }
];

/* ─── PROCEDURAL TEXTURE GENERATORS (FOR REALISTIC PBR) ───── */
const TEXTURES = (() => {
  /* 1. Realistic Meadow Grass Texture */
  const grassCanvas = document.createElement('canvas');
  grassCanvas.width = grassCanvas.height = 512;
  const gctx = grassCanvas.getContext('2d');
  // Gradient base
  const grad = gctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#58b422');
  grad.addColorStop(0.5, '#6ec62a');
  grad.addColorStop(1, '#4ea21c');
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 512, 512);

  // Micro blade strokes & organic noise
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * 512, y = Math.random() * 512;
    const len = 3 + Math.random() * 6;
    const ang = -0.5 + Math.random() * 1.0;
    const col = ['#7cd832', '#4aa01a', '#8ee63c', '#3c8812', '#9ae848'][Math.floor(Math.random() * 5)];
    gctx.strokeStyle = col;
    gctx.lineWidth = 1.2 + Math.random() * 1.5;
    gctx.globalAlpha = 0.55 + Math.random() * 0.35;
    gctx.beginPath();
    gctx.moveTo(x, y);
    gctx.lineTo(x + Math.sin(ang) * len, y - Math.cos(ang) * len);
    gctx.stroke();
  }
  // Soft wildflower flecks in texture
  for (let i = 0; i < 240; i++) {
    const x = Math.random() * 512, y = Math.random() * 512;
    gctx.fillStyle = ['#ffffff', '#ffdd44', '#ffa0bb', '#88ccff'][Math.floor(Math.random() * 4)];
    gctx.globalAlpha = 0.8;
    gctx.beginPath();
    gctx.arc(x, y, 1.2 + Math.random() * 1.5, 0, Math.PI * 2);
    gctx.fill();
  }
  gctx.globalAlpha = 1.0;
  const grassTex = new THREE.CanvasTexture(grassCanvas);
  grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(14, 38);

  /* 2. Ancient Limestone / White Marble Texture */
  const stoneCanvas = document.createElement('canvas');
  stoneCanvas.width = stoneCanvas.height = 512;
  const sctx = stoneCanvas.getContext('2d');
  sctx.fillStyle = '#f6f4eb';
  sctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 18000; i++) {
    const x = Math.random() * 512, y = Math.random() * 512;
    sctx.fillStyle = Math.random() > 0.5 ? 'rgba(215, 208, 195, 0.15)' : 'rgba(255, 255, 255, 0.25)';
    sctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3);
  }
  // Subtle stone cracks / veins
  sctx.strokeStyle = 'rgba(180, 172, 160, 0.18)';
  sctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    let cx = Math.random() * 512, cy = Math.random() * 512;
    sctx.beginPath();
    sctx.moveTo(cx, cy);
    for (let j = 0; j < 6; j++) {
      cx += (Math.random() - 0.5) * 60;
      cy += (Math.random() - 0.5) * 60;
      sctx.lineTo(cx, cy);
    }
    sctx.stroke();
  }
  const stoneTex = new THREE.CanvasTexture(stoneCanvas);
  stoneTex.wrapS = stoneTex.wrapT = THREE.RepeatWrapping;

  /* 3. Natural Wood Bark Texture */
  const barkCanvas = document.createElement('canvas');
  barkCanvas.width = 256; barkCanvas.height = 512;
  const bctx = barkCanvas.getContext('2d');
  bctx.fillStyle = '#6e4b2d';
  bctx.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 256, y = Math.random() * 512;
    const h = 10 + Math.random() * 40;
    bctx.fillStyle = Math.random() > 0.5 ? 'rgba(60, 38, 20, 0.4)' : 'rgba(130, 94, 60, 0.35)';
    bctx.fillRect(x, y, 1.5 + Math.random() * 2, h);
  }
  const barkTex = new THREE.CanvasTexture(barkCanvas);
  barkTex.wrapS = barkTex.wrapT = THREE.RepeatWrapping;

  /* 4. Organic Leaf Foliage Texture */
  const leafCanvas = document.createElement('canvas');
  leafCanvas.width = leafCanvas.height = 256;
  const lctx = leafCanvas.getContext('2d');
  lctx.fillStyle = '#4ea41c';
  lctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3500; i++) {
    const x = Math.random() * 256, y = Math.random() * 256;
    lctx.fillStyle = ['#62ba26', '#7cd630', '#3e8c14', '#8ee038'][Math.floor(Math.random() * 4)];
    lctx.beginPath();
    lctx.arc(x, y, 2.5 + Math.random() * 3.5, 0, Math.PI * 2);
    lctx.fill();
  }
  const leafTex = new THREE.CanvasTexture(leafCanvas);
  leafTex.wrapS = leafTex.wrapT = THREE.RepeatWrapping;

  return { grassTex, stoneTex, barkTex, leafTex };
})();

/* ─── UTILITIES ────────────────────────────────────────────── */
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const rand = (lo, hi) => Math.random() * (hi - lo) + lo;

function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= 6.2831853;
  while (d < -Math.PI) d += 6.2831853;
  return a + d * t;
}

/* Organic Rolling Hills of Daylight Prairie */
function gY(x, z, id) {
  const pathFactor = Math.min(Math.abs(x) / 7.5, 1.0);
  const baseH = Math.sin(x * 0.075) * 1.5 + Math.sin(z * 0.06) * 1.7 + Math.cos(x * 0.13 + z * 0.075) * 1.0;
  const sideHill = Math.pow(pathFactor, 1.7) * (Math.sin(z * 0.045 + x * 0.035) * 2.4 + 2.2);

  switch (id) {
    case 1: return baseH * 0.6 + sideHill * 0.8;
    case 2: return baseH * 0.75 + sideHill * 1.1 + Math.sin(z * 0.04) * 1.2;
    case 3: return baseH * 0.7 + sideHill * 0.9 + Math.cos(z * 0.06) * 0.9;
    case 4: return (z * 0.045) + baseH * 0.5 + sideHill * 0.75;
    default: return 0;
  }
}

/* ─── GLOW SPRITE GENERATOR ────────────────────────────────── */
const _GT = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const cx = c.getContext('2d');
  const g = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.22)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  cx.fillStyle = g;
  cx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();

function mkGlow(hex, scale, op = 0.75) {
  const m = new THREE.SpriteMaterial({
    map: _GT,
    color: new THREE.Color(hex),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: op
  });
  const s = new THREE.Sprite(m);
  s.scale.setScalar(scale);
  return s;
}

/* ══════════════════════════════════════════════════════════
   CHARACTER (Sky Child with Soft Realistic Shadows)
   ══════════════════════════════════════════════════════════ */
class Character {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.position = this.group.position;
    this.velocity = new THREE.Vector3();
    this.onGround = false;
    this.wingEnergy = 100;
    this.flying = false;
    this.targetRY = 0;
    this.capeT = 0;
    this.haloT = 0;
    this.stepT = 0;
    this.moveSpd = 0;
    this.lastSafe = new THREE.Vector3(0, 3, 5);

    /* Robe — elegant warm cream robe with golden hem */
    const pts = [
      new THREE.Vector2(0.64, 0.02),
      new THREE.Vector2(0.60, 0.28),
      new THREE.Vector2(0.52, 0.72),
      new THREE.Vector2(0.38, 1.20),
      new THREE.Vector2(0.24, 1.58),
      new THREE.Vector2(0.16, 1.78)
    ];
    const robeMat = new THREE.MeshStandardMaterial({
      color: 0xfdfaf0,
      emissive: 0xffe280,
      emissiveIntensity: 0.15,
      roughness: 0.82,
      metalness: 0.05
    });
    this.robe = new THREE.Mesh(new THREE.LatheGeometry(pts, 18), robeMat);
    this.robe.castShadow = true;
    this.group.add(this.robe);

    /* Golden border hem */
    const hemMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.5,
      roughness: 0.35,
      metalness: 0.6
    });
    const hem = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 24), hemMat);
    hem.rotation.x = Math.PI / 2;
    hem.position.y = 0.05;
    this.group.add(hem);

    /* Shoulder dome */
    const sh = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45),
      robeMat
    );
    sh.scale.y = 0.65;
    sh.position.y = 1.76;
    sh.castShadow = true;
    this.group.add(sh);

    /* Head / Mask */
    const headM = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff4d5,
      emissiveIntensity: 0.5,
      roughness: 0.55
    });
    this.head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), headM);
    this.head.position.y = 2.12;
    this.head.castShadow = true;
    this.group.add(this.head);

    /* Radiant Hair tuft / Crown */
    const hairM = new THREE.MeshStandardMaterial({
      color: 0xfff4c2,
      emissive: 0xffd038,
      emissiveIntensity: 2.0,
      roughness: 0.4
    });
    this.hair = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), hairM);
    this.hair.position.y = 2.42;
    this.group.add(this.hair);

    /* Cape (Prairie Amber / Warm Golden Cape with diamond star) */
    const capeGeo = new THREE.PlaneGeometry(1.05, 1.35, 5, 8);
    const capeMat = new THREE.MeshStandardMaterial({
      color: 0xf5eed8,
      emissive: 0xffbc30,
      emissiveIntensity: 0.22,
      side: THREE.DoubleSide,
      roughness: 0.78
    });
    this.cape = new THREE.Mesh(capeGeo, capeMat);
    this.cape.position.set(0, 0.98, -0.26);
    this.cape.castShadow = true;
    this.group.add(this.cape);

    /* Diamond star on cape back */
    const starMat = new THREE.MeshBasicMaterial({ color: 0xfff6cf });
    const starG = new THREE.Mesh(new THREE.OctahedronGeometry(0.11), starMat);
    starG.scale.set(1, 1.4, 0.2);
    starG.position.set(0, 1.25, -0.31);
    this.group.add(starG);

    /* Soft Angelic Halo & Lights */
    this.halo = mkGlow('#ffe878', 3.5, 0.25);
    this.halo.position.y = 1.8;
    this.group.add(this.halo);

    this.headG = mkGlow('#ffffff', 1.8, 0.38);
    this.headG.position.y = 2.3;
    this.group.add(this.headG);

    /* Soft player point light */
    this.pLight = new THREE.PointLight(0xffe890, 0.85, 12);
    this.pLight.position.y = 1.8;
    this.group.add(this.pLight);
  }

  update(inp, realmId) {
    /* ── MOVEMENT CONTROLS (+50% SPEED) ── */
    const mv = new THREE.Vector3();
    if (inp.forward) mv.z += 1;
    if (inp.back)    mv.z -= 1;
    if (inp.left)    mv.x += 1;  // 'A' key: moves left on screen!
    if (inp.right)   mv.x -= 1;  // 'D' key: moves right on screen!

    if (inp.joystick && (Math.abs(inp.joystick.x) > 0.08 || Math.abs(inp.joystick.y) > 0.08)) {
      mv.x = -inp.joystick.x;
      mv.z = -inp.joystick.y;
    }

    const ml = mv.length();
    if (ml > 0.01) {
      mv.normalize();
      this.targetRY = -Math.atan2(mv.x, mv.z);
      this.group.rotation.y = lerpAngle(this.group.rotation.y, this.targetRY, 0.16);
    }
    this.moveSpd = lerp(this.moveSpd, ml > 0.05 ? 1 : 0, 0.2);
    this.velocity.x = lerp(this.velocity.x, mv.x * PHY.SPEED, PHY.ACCEL);
    this.velocity.z = lerp(this.velocity.z, mv.z * PHY.SPEED, PHY.ACCEL);

    /* ── Jump ── */
    if (inp.jumpPressed && this.onGround) {
      this.velocity.y = PHY.JUMP;
      inp.jumpPressed = false;
      audioManager?.playFly?.();
    }

    /* ── Fly / Wing Energy ── */
    const fly = (inp.jump || inp.flyHeld) && this.wingEnergy > 0 && !this.onGround;
    if (fly) {
      this.velocity.y = Math.min(this.velocity.y + PHY.FLY, 0.35);
      this.wingEnergy = Math.max(0, this.wingEnergy - PHY.W_DRAIN);
      this.flying = true;
    } else {
      this.flying = false;
      this.wingEnergy = Math.min(PHY.MAX_WING, this.wingEnergy + PHY.W_REGEN);
    }

    /* ── Gravity + apply ── */
    if (!this.onGround) this.velocity.y -= PHY.GRAVITY;
    this.velocity.y = clamp(this.velocity.y, -0.5, 0.48);
    this.velocity.x = clamp(this.velocity.x, -PHY.SPEED * 1.8, PHY.SPEED * 1.8);
    this.velocity.z = clamp(this.velocity.z, -PHY.SPEED * 1.8, PHY.SPEED * 1.8);

    this.group.position.add(this.velocity);
    this.group.position.x = clamp(this.group.position.x, -16, 16);
    this.group.position.z = Math.max(this.group.position.z, -2);

    /* ── Ground Collision ── */
    const gy = gY(this.group.position.x, this.group.position.z, realmId);
    const minY = gy + 1.05;
    if (this.group.position.y <= minY) {
      this.group.position.y = minY;
      if (this.velocity.y < 0) this.velocity.y = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    if (this.group.position.y < -18) {
      this.group.position.copy(this.lastSafe);
      this.velocity.set(0, 0, 0);
    }
    if (this.onGround) this.lastSafe.copy(this.group.position);

    /* ── Animations ── */
    this.capeT += 0.07;
    this.haloT += 0.04;
    if (this.onGround && ml > 0.08) this.stepT += 0.25;
    this._animCape();
    this._animGlow();
  }

  _animCape() {
    const pos = this.cape.geometry.attributes.position;
    const t = this.capeT;
    const spd = Math.hypot(this.velocity.x, this.velocity.z);
    for (let r = 1; r <= 8; r++) {
      const rf = r / 8;
      for (let c = 0; c < 5; c++) {
        const i = r * 5 + c;
        if (i >= pos.count) continue;
        const cf = c / 4;
        const w1 = Math.sin(t * 3.6 + rf * Math.PI * 1.4) * 0.12 * rf;
        const w2 = Math.sin(t * 5.2 + cf * Math.PI + rf * 2.0) * 0.06 * rf;
        const bow = (this.flying ? rf * 0.44 : 0) + (spd * 0.38 * rf);
        pos.setZ(i, w1 + w2 + bow);
      }
    }
    pos.needsUpdate = true;
  }

  _animGlow() {
    const p = 0.92 + Math.sin(this.haloT * 1.6) * 0.08;
    this.halo.scale.setScalar(3.5 * p);
    this.halo.material.opacity = 0.24 + Math.sin(this.haloT) * 0.06;
    this.pLight.intensity = 0.85 + Math.sin(this.haloT * 2.4) * 0.15;
    this.head.position.y = 2.12 + Math.sin(this.stepT) * 0.05;
    this.group.rotation.x = lerp(this.group.rotation.x, this.flying ? -0.22 : 0, 0.12);
  }

  collectFx(wpos, scene, hex) {
    for (let i = 0; i < 24; i++) {
      const sp = mkGlow(hex, rand(0.8, 2.5), rand(0.6, 0.95));
      sp.position.copy(wpos).add(new THREE.Vector3(rand(-1.5, 1.5), rand(0.2, 2.6), rand(-1.5, 1.5)));
      scene.add(sp);
      const vx = rand(-0.07, 0.07), vy = rand(0.05, 0.14), vz = rand(-0.07, 0.07);
      const fade = () => {
        sp.position.x += vx;
        sp.position.y += vy;
        sp.position.z += vz;
        sp.material.opacity -= 0.024;
        if (sp.material.opacity > 0) requestAnimationFrame(fade);
        else scene.remove(sp);
      };
      requestAnimationFrame(fade);
    }
  }
}

/* ══════════════════════════════════════════════════════════
   CANDLE — Warm Beeswax Candle with Real Shadows
   ══════════════════════════════════════════════════════════ */
class Candle {
  constructor(scene, x, y, z, data) {
    this.scene = scene;
    this.data = data;
    this.done = false;
    this.baseY = y;
    this.ph = rand(0, Math.PI * 2);
    this.R = 3.0;
    this.g = new THREE.Group();
    this.g.position.set(x, y, z);
    scene.add(this.g);

    // Candle wax body
    const bm = new THREE.MeshStandardMaterial({
      color: 0xfff2c2,
      emissive: 0xffaa20,
      emissiveIntensity: 0.22,
      roughness: 0.55
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.65, 10), bm);
    body.position.y = 0.325;
    body.castShadow = true;
    this.g.add(body);

    // Stone dish pedestal
    const dm = new THREE.MeshStandardMaterial({
      map: TEXTURES.stoneTex,
      color: 0xede4d0,
      roughness: 0.75
    });
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.26, 0.14, 12), dm);
    dish.position.y = 0.07;
    dish.receiveShadow = true;
    this.g.add(dish);

    // Flame
    const fm = new THREE.MeshStandardMaterial({
      color: 0xff8800,
      emissive: 0xff4400,
      emissiveIntensity: 5.5,
      transparent: true,
      opacity: 0.95
    });
    this.flame = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), fm);
    this.flame.position.y = 0.78;
    this.flame.scale.y = 1.6;
    this.g.add(this.flame);

    // Glow layers
    this.gi = mkGlow('#fff090', 2.2, 0.95);
    this.gi.position.y = 0.8;
    this.g.add(this.gi);

    this.go = mkGlow('#ffa020', 6.5, 0.55);
    this.go.position.y = 0.8;
    this.g.add(this.go);
  }

  update(t, pp) {
    if (this.done) return false;
    this.ph += 0.045;
    this.g.position.y = this.baseY + Math.sin(this.ph) * 0.16;
    this.g.rotation.y += 0.016;

    const ff = 0.75 + Math.sin(this.ph * 4.5) * 0.25;
    this.flame.scale.y = 1.4 + ff * 0.45;
    this.flame.scale.x = 0.9 + (1 - ff) * 0.25;
    this.gi.material.opacity = 0.75 + ff * 0.25;
    this.go.material.opacity = 0.4 + ff * 0.25;

    if (pp.distanceTo(this.g.position) < this.R) {
      this._kill();
      return true;
    }
    return false;
  }

  _kill() {
    this.done = true;
    this.scene.remove(this.g);
  }
}

/* ══════════════════════════════════════════════════════════
   PORTAL — Sacred White Stone Gate of Light
   ══════════════════════════════════════════════════════════ */
class Portal {
  constructor(scene, x, y, z, next) {
    this.scene = scene;
    this.next = next;
    this.active = false;
    this.ph = 0;
    this.g = new THREE.Group();
    this.g.position.set(x, y + 3.2, z);
    scene.add(this.g);

    // Stone Arch Pillars with realistic limestone texture
    const archMat = new THREE.MeshStandardMaterial({
      map: TEXTURES.stoneTex,
      color: 0xf6f3e8,
      roughness: 0.8
    });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 5.4, 12), archMat);
    p1.position.set(-2.8, 0, 0);
    p1.castShadow = true; p1.receiveShadow = true;

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 5.4, 12), archMat);
    p2.position.set(2.8, 0, 0);
    p2.castShadow = true; p2.receiveShadow = true;

    const topArch = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.4, 10, 32, Math.PI), archMat);
    topArch.position.y = 2.5;
    topArch.castShadow = true; topArch.receiveShadow = true;
    this.g.add(p1, p2, topArch);

    // Radiant Golden Light Ring
    const rm = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffc820,
      emissiveIntensity: 3.5,
      metalness: 0.8,
      roughness: 0.2
    });
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.16, 8, 48), rm);
    this.ring.position.y = 1.0;
    this.g.add(this.ring);

    // Portal Light Disc
    const dm = new THREE.MeshStandardMaterial({
      color: 0xfffae0,
      emissive: 0xffd950,
      emissiveIntensity: 2.5,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.disk = new THREE.Mesh(new THREE.CircleGeometry(2.2, 32), dm);
    this.disk.position.y = 1.0;
    this.g.add(this.disk);

    // Glow Sprites
    this.bigG = mkGlow('#ffe470', 20, 0.7);
    this.bigG.position.y = 1.0;
    this.g.add(this.bigG);

    this.lockG = mkGlow('#eedcb0', 8, 0.35);
    this.lockG.position.y = 1.0;
    this.g.add(this.lockG);

    // Orbiting Golden Butterflies / Orbs
    const orbG = new THREE.SphereGeometry(0.13, 6, 6);
    const orbM = new THREE.MeshBasicMaterial({ color: 0xfff490 });
    this.orbs = new THREE.InstancedMesh(orbG, orbM, 16);
    this.orbs.visible = false;
    this.g.add(this.orbs);
    this._orbAngles = Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2);

    this.pl = new THREE.PointLight(0xffdf60, 2.5, 32);
    this.pl.position.y = 1.0;
    this.g.add(this.pl);
  }

  update(t, pp, coll, total) {
    this.active = coll >= total;
    this.ph += 0.026;
    this.ring.rotation.z += 0.015;

    if (this.active) {
      this.pl.intensity = 3.2 + Math.sin(this.ph * 3) * 1.2;
      this.bigG.material.opacity = 0.65 + Math.sin(this.ph * 2) * 0.18;
      this.lockG.visible = false;
      this.disk.material.opacity = 0.55 + Math.sin(this.ph * 1.5) * 0.15;
      this.orbs.visible = true;

      const dm = new THREE.Object3D();
      this._orbAngles.forEach((a0, i) => {
        const ang = a0 + this.ph * 1.8;
        const r = 2.1 + Math.sin(this.ph * 2 + i) * 0.35;
        dm.position.set(Math.cos(ang) * r, 1.0 + Math.sin(ang * 1.2) * 0.8, Math.sin(ang) * r);
        dm.scale.setScalar(1);
        dm.updateMatrix();
        this.orbs.setMatrixAt(i, dm.matrix);
      });
      this.orbs.instanceMatrix.needsUpdate = true;

      if (pp.distanceTo(this.g.position) < 4.2) return true;
    } else {
      this.pl.intensity = 0.8;
      this.bigG.material.opacity = 0.2;
      this.lockG.visible = true;
      this.orbs.visible = false;
    }
    return false;
  }

  dispose() {
    this.scene.remove(this.g);
  }
}

/* ══════════════════════════════════════════════════════════
   BUTTERFLY SWARM (Flapping Wings & Light Sparkles)
   ══════════════════════════════════════════════════════════ */
class ButterflySwarm {
  constructor(scene, count = 46, depth = 140) {
    this.scene = scene;
    this.count = count;
    this.butterflies = [];
    this.group = new THREE.Group();
    scene.add(this.group);

    const wingMat = new THREE.MeshBasicMaterial({
      color: 0xffe258,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < count; i++) {
      const bg = new THREE.Group();
      const x = rand(-14, 14);
      const z = rand(8, depth - 6);
      const y = gY(x, z, 1) + rand(1.2, 4.2);
      bg.position.set(x, y, z);

      const lWing = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.22), wingMat);
      lWing.position.x = -0.14;
      const rWing = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.22), wingMat);
      rWing.position.x = 0.14;
      bg.add(lWing, rWing);

      const bGlow = mkGlow('#ffee70', 0.9, 0.6);
      bg.add(bGlow);

      this.group.add(bg);
      this.butterflies.push({
        group: bg,
        lWing,
        rWing,
        baseX: x,
        baseY: y,
        baseZ: z,
        offset: rand(0, Math.PI * 2),
        speed: rand(1.2, 2.4),
        wingSpd: rand(16, 26),
        radius: rand(1.5, 3.8)
      });
    }
  }

  update(t, playerPos) {
    this.butterflies.forEach(b => {
      const ang = t * b.speed + b.offset;
      b.group.position.x = b.baseX + Math.cos(ang) * b.radius;
      b.group.position.z = b.baseZ + Math.sin(ang) * b.radius;
      b.group.position.y = b.baseY + Math.sin(t * 3.0 + b.offset) * 0.75;
      b.group.rotation.y = -ang + Math.PI / 2;

      const flap = Math.sin(t * b.wingSpd) * 0.85;
      b.lWing.rotation.y = flap;
      b.rWing.rotation.y = -flap;

      if (playerPos) {
        const dist = b.group.position.distanceTo(playerPos);
        if (dist < 3.2) {
          b.group.position.y += (3.2 - dist) * 0.08;
        }
      }
    });
  }

  dispose() {
    this.scene.remove(this.group);
  }
}

/* ══════════════════════════════════════════════════════════
   AMBIENT SUN PARTICLES & DANDELIONS
   ══════════════════════════════════════════════════════════ */
class AmbFX {
  constructor(scene, id, depth) {
    this.n = 80;
    this.scene = scene;
    const pos = new Float32Array(this.n * 3);
    this.vel = [];
    for (let i = 0; i < this.n; i++) {
      pos[i * 3]     = rand(-16, 16);
      pos[i * 3 + 1] = rand(0.5, 18);
      pos[i * 3 + 2] = rand(0, depth);
      this.vel.push({ x: rand(-0.015, 0.015), y: rand(0.008, 0.025), z: rand(-0.008, 0.008) });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.38,
      color: new THREE.Color('#fff4a8'),
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    this.pts = new THREE.Points(geo, mat);
    scene.add(this.pts);
    this._d = depth;
  }

  update() {
    const p = this.pts.geometry.attributes.position;
    for (let i = 0; i < this.n; i++) {
      let x = p.getX(i) + this.vel[i].x;
      let y = p.getY(i) + this.vel[i].y;
      let z = p.getZ(i) + this.vel[i].z;
      if (x < -18) x = 18;
      if (x > 18) x = -18;
      if (y > 20) y = 0.5;
      if (z < 0) z = this._d;
      if (z > this._d) z = 0;
      p.setXYZ(i, x, y, z);
    }
    p.needsUpdate = true;
  }

  dispose() {
    this.scene.remove(this.pts);
    this.pts.geometry.dispose();
    this.pts.material.dispose();
  }
}

/* ══════════════════════════════════════════════════════════
   REALM 3D (REALISTIC DAYLIGHT PRAIRIE)
   ══════════════════════════════════════════════════════════ */
class Realm3D {
  constructor(scene, data) {
    this.scene = scene;
    this.data = data;
    this._o = [];
    this.collected = 0;
    this.total = data.items.length;

    // Candles
    this.candles = data.items.map(({ p, d }) => {
      const y = gY(p[0], p[2], data.id) + 1.0;
      return new Candle(scene, p[0], y, p[2], d);
    });

    // Portal (Only for Chapters 1, 2, 3!)
    this.portal = data.portal ? new Portal(scene, ...data.portal, data.next) : null;
    if (this.portal) {
      const [px, , pz] = data.portal;
      this.portal.g.position.y = gY(px, pz, data.id) + 3.2;
    }

    // World Elements
    this._sky();
    this._sun();
    this._lights();
    this._terrain();
    this._creek();
    this._decos();
    this._floatingIslands();
    this._cloudSea();

    // Butterflies & Ambient
    this.butterflies = new ButterflySwarm(scene, 46, data.depth);
    this.amb = new AmbFX(scene, data.id, data.depth);
  }

  _sky() {
    const d = this.data.sky;
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uT: { value: new THREE.Color(d.top) },
        uM: { value: new THREE.Color(d.mid) },
        uB: { value: new THREE.Color(d.bot) }
      },
      vertexShader: `
        varying vec3 vP;
        void main(){
          vP = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uT, uM, uB;
        varying vec3 vP;
        void main(){
          float h = clamp(vP.y, -1.0, 1.0);
          vec3 c = h >= 0.0 ? mix(uM, uT, pow(h, 0.72)) : mix(uM, uB, pow(-h, 0.6));
          gl_FragColor = vec4(c, 1.0);
        }
      `
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(450, 24, 14), m);
    this.scene.add(sky);
    this._o.push(sky);
  }

  _sun() {
    const sunG = mkGlow('#fff6cc', 85, 0.95);
    sunG.position.set(65, 95, -50);
    const sunCore = mkGlow('#ffffff', 40, 1.0);
    sunCore.position.copy(sunG.position);
    this.scene.add(sunG, sunCore);
    this._o.push(sunG, sunCore);
  }

  _lights() {
    const d = this.data;
    const al = new THREE.AmbientLight(new THREE.Color(d.ambC), 0.75);

    // Directional Sunlight with Soft Shadow Mapping
    const dl = new THREE.DirectionalLight(new THREE.Color(d.dirC), 2.2);
    dl.position.set(...d.dirP);
    dl.castShadow = true;
    dl.shadow.mapSize.width = 2048;
    dl.shadow.mapSize.height = 2048;
    dl.shadow.camera.near = 1.0;
    dl.shadow.camera.far = 280;
    dl.shadow.camera.left = -30;
    dl.shadow.camera.right = 30;
    dl.shadow.camera.top = 50;
    dl.shadow.camera.bottom = -50;
    dl.shadow.bias = -0.0006;

    const hl = new THREE.HemisphereLight(0x7ed4ff, 0x5eb824, 0.85);
    this.scene.add(al, dl, hl);
    this._o.push(al, dl, hl);
  }

  _terrain() {
    const d = this.data, D = d.depth + 32;
    const geo = new THREE.PlaneGeometry(54, D, 48, Math.min(Math.floor(D * 0.95), 140));
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const pC = new THREE.Color(d.pHex);
    const sC = new THREE.Color(d.gHex);
    const pathC = new THREE.Color(0xeadeba);
    const cols = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i) + D / 2;
      pos.setY(i, gY(x, z, d.id));
      const distFromCenter = Math.abs(x);
      const isPath = clamp(1.0 - (distFromCenter / 4.4), 0.0, 1.0);

      const y = pos.getY(i);
      const ht = clamp(y * 0.05, -0.02, 0.12);

      const grassR = lerp(sC.r, pC.r, clamp(distFromCenter / 12, 0, 1)) + ht;
      const grassG = lerp(sC.g, pC.g, clamp(distFromCenter / 12, 0, 1)) + ht;
      const grassB = lerp(sC.b, pC.b, clamp(distFromCenter / 12, 0, 1)) + ht;

      cols[i * 3]     = lerp(grassR, pathC.r, isPath * 0.72);
      cols[i * 3 + 1] = lerp(grassG, pathC.g, isPath * 0.72);
      cols[i * 3 + 2] = lerp(grassB, pathC.b, isPath * 0.72);
    }

    geo.computeVertexNormals();
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

    // Realistic PBR Terrain Material with Procedural Grass Texture
    const mat = new THREE.MeshStandardMaterial({
      map: TEXTURES.grassTex,
      vertexColors: true,
      roughness: 0.82,
      metalness: 0.02
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = D / 2 - 18;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this._o.push(mesh);
  }

  /* Gentle Crystal Prairie Brook / Creek */
  _creek() {
    const dep = this.data.depth;
    const pts = [];
    for (let z = 10; z < dep - 10; z += 12) {
      const x = -8.5 + Math.sin(z * 0.08) * 2.5;
      const y = gY(x, z, this.data.id) + 0.12;
      pts.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const waterGeo = new THREE.TubeGeometry(curve, 32, 1.1, 8, false);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x58ccf5,
      roughness: 0.12,
      metalness: 0.1,
      transparent: true,
      opacity: 0.82
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    this.scene.add(water);
    this._o.push(water);
  }

  /* Floating Sky Islands */
  _floatingIslands() {
    const islGroup = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({
      map: TEXTURES.stoneTex,
      color: 0xc8baa6,
      roughness: 0.92
    });
    const grassMat = new THREE.MeshStandardMaterial({
      map: TEXTURES.grassTex,
      color: 0x76ce32,
      roughness: 0.82
    });

    const islands = [
      { x: -28, y: 16, z: 25, r: 6.5, h: 7 },
      { x: 28, y: 20, z: 55, r: 7.2, h: 8 },
      { x: -32, y: 22, z: 90, r: 8.5, h: 9 },
      { x: 30, y: 26, z: 120, r: 6.8, h: 7 }
    ];

    islands.forEach(({ x, y, z, r, h }) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);

      const rock = new THREE.Mesh(new THREE.ConeGeometry(r, h, 9), stoneMat);
      rock.rotation.x = Math.PI;
      rock.position.y = -h / 2;
      rock.castShadow = true; rock.receiveShadow = true;
      g.add(rock);

      const top = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.05, r * 0.95, 1.2, 10), grassMat);
      top.position.y = 0.5;
      top.receiveShadow = true;
      g.add(top);

      // Ancient shrine
      const shrine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.38, 2.0, 8),
        new THREE.MeshStandardMaterial({ map: TEXTURES.stoneTex, color: 0xf6f4eb })
      );
      shrine.position.y = 1.7;
      shrine.castShadow = true;
      g.add(shrine);

      // Cloud puff
      const cp = new THREE.Mesh(
        new THREE.SphereGeometry(r * 1.25, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 1 })
      );
      cp.scale.set(1.4, 0.45, 1.4);
      cp.position.y = -h * 0.8;
      g.add(cp);

      islGroup.add(g);
    });

    this.scene.add(islGroup);
    this._o.push(islGroup);
  }

  /* Billowing Cloud Sea */
  _cloudSea() {
    const dep = this.data.depth;
    const cMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.98,
      transparent: true,
      opacity: 0.88
    });

    const cCount = 18;
    for (let i = 0; i < cCount; i++) {
      const z = (i / cCount) * dep;
      const cg = new THREE.Group();
      const isLeft = i % 2 === 0;
      const x = isLeft ? rand(-26, -21) : rand(21, 26);
      const y = rand(-1.0, 3.5);
      cg.position.set(x, y, z);

      for (let j = 0; j < 4; j++) {
        const s = rand(3.5, 7.5);
        const cm = new THREE.Mesh(new THREE.SphereGeometry(s, 8, 6), cMat);
        cm.position.set(rand(-4, 4), rand(-1, 1.5), rand(-4, 4));
        cm.scale.set(1.4, 0.7, 1.2);
        cg.add(cm);
      }
      this.scene.add(cg);
      this._o.push(cg);
    }
  }

  /* Realistic Daylight Prairie Architecture, Trees & Wildflowers */
  _decos() {
    const id = this.data.id, dep = this.data.depth;
    const dummy = new THREE.Object3D();

    const sidePos = (n, minX, maxX) => Array.from({ length: n }, () => {
      const s = Math.random() > 0.5 ? 1 : -1;
      const x = s * (minX + Math.random() * (maxX - minX));
      const z = Math.random() * dep;
      return { x, z, y: gY(x, z, id) };
    });

    /* ── 1. WILDFLOWER BLOSSOMS (InstancedMesh) ── */
    const flowerCount = 280;
    const flowerPts = sidePos(flowerCount, 2.8, 18);
    const flowerGeo = new THREE.SphereGeometry(0.24, 6, 5);
    const flowerColors = [0xffdd33, 0xffffff, 0xffa0bb, 0x77ccff, 0xffbb22];
    const flowerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.65
    });
    const fInst = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);
    const fCol = new Float32Array(flowerCount * 3);

    flowerPts.forEach(({ x, y, z }, i) => {
      dummy.position.set(x, y + 0.14, z);
      dummy.scale.set(rand(0.8, 1.4), rand(0.5, 0.85), rand(0.8, 1.4));
      dummy.rotation.set((Math.random() - 0.5) * 0.3, rand(0, 6.28), (Math.random() - 0.5) * 0.3);
      dummy.updateMatrix();
      fInst.setMatrixAt(i, dummy.matrix);

      const c = new THREE.Color(flowerColors[i % flowerColors.length]);
      fCol[i * 3]     = c.r;
      fCol[i * 3 + 1] = c.g;
      fCol[i * 3 + 2] = c.b;
    });
    flowerGeo.setAttribute('color', new THREE.BufferAttribute(fCol, 3));
    flowerMat.vertexColors = true;
    fInst.instanceMatrix.needsUpdate = true;
    this.scene.add(fInst);
    this._o.push(fInst);

    /* ── 2. REALISTIC STYLIZED PRAIRIE TREES (Multi-Cluster Canopies & Bark) ── */
    const treeCount = 38;
    const treePts = sidePos(treeCount, 12.5, 25);
    const trunkMat = new THREE.MeshStandardMaterial({
      map: TEXTURES.barkTex,
      color: 0x8a6242,
      roughness: 0.92
    });
    const leafMat = new THREE.MeshStandardMaterial({
      map: TEXTURES.leafTex,
      color: 0x58ba25,
      roughness: 0.78
    });

    const trunkInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.3, 0.58, 1, 8), trunkMat, treeCount);
    trunkInst.castShadow = true; trunkInst.receiveShadow = true;

    // 3 overlapping foliage clusters per tree for realistic organic volume!
    const leafInst = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), leafMat, treeCount * 3);
    leafInst.castShadow = true; leafInst.receiveShadow = true;

    treePts.forEach(({ x, y, z }, i) => {
      const h = rand(6.5, 11.5);
      const r = rand(2.8, 4.4);

      // Trunk
      dummy.position.set(x, y + h / 2, z);
      dummy.scale.set(1, h, 1);
      dummy.rotation.set((Math.random() - 0.5) * 0.08, rand(0, 6.28), (Math.random() - 0.5) * 0.08);
      dummy.updateMatrix();
      trunkInst.setMatrixAt(i, dummy.matrix);

      // Central canopy
      dummy.position.set(x, y + h + r * 0.35, z);
      dummy.scale.set(r, r * 0.82, r);
      dummy.rotation.y = rand(0, 6.28);
      dummy.updateMatrix();
      leafInst.setMatrixAt(i * 3, dummy.matrix);

      // Left cluster
      dummy.position.set(x + r * 0.35, y + h + r * 0.15, z + r * 0.2);
      dummy.scale.set(r * 0.75, r * 0.68, r * 0.75);
      dummy.updateMatrix();
      leafInst.setMatrixAt(i * 3 + 1, dummy.matrix);

      // Right cluster
      dummy.position.set(x - r * 0.35, y + h + r * 0.22, z - r * 0.2);
      dummy.scale.set(r * 0.78, r * 0.72, r * 0.78);
      dummy.updateMatrix();
      leafInst.setMatrixAt(i * 3 + 2, dummy.matrix);
    });

    trunkInst.instanceMatrix.needsUpdate = true;
    leafInst.instanceMatrix.needsUpdate = true;
    this.scene.add(trunkInst, leafInst);
    this._o.push(trunkInst, leafInst);

    /* ── 3. ANCIENT WHITE STONE CURVED ARCHWAYS ── */
    const archMat = new THREE.MeshStandardMaterial({
      map: TEXTURES.stoneTex,
      color: 0xf7f4eb,
      roughness: 0.8
    });
    const archZPositions = [28, 68, 108];
    archZPositions.forEach(az => {
      if (az < dep - 10) {
        const ag = new THREE.Group();
        const ay = gY(0, az, id);
        ag.position.set(0, ay, az);

        const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 5.6, 10), archMat);
        pillarL.position.set(-5.6, 2.8, 0);
        pillarL.castShadow = true; pillarL.receiveShadow = true;

        const pillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 5.6, 10), archMat);
        pillarR.position.set(5.6, 2.8, 0);
        pillarR.castShadow = true; pillarR.receiveShadow = true;

        const curvedArch = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.38, 8, 28, Math.PI), archMat);
        curvedArch.position.y = 2.8;
        curvedArch.castShadow = true; curvedArch.receiveShadow = true;
        ag.add(pillarL, pillarR, curvedArch);

        // Polished Metallic Golden Bell
        const bell = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.44, 0.75, 10),
          new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0x996500,
            emissiveIntensity: 0.35,
            metalness: 0.88,
            roughness: 0.22
          })
        );
        bell.position.set(0, 4.9, 0);
        bell.castShadow = true;
        ag.add(bell);

        this.scene.add(ag);
        this._o.push(ag);
      }
    });

    /* ── 4. SIGNATURE WHITE STONE BELL TOWERS ── */
    const towerPositions = [
      { x: -14, z: 38 },
      { x: 15, z: 75 },
      { x: -15, z: 112 }
    ];

    towerPositions.forEach(({ x, z }) => {
      if (z < dep) {
        const ty = gY(x, z, id);
        const tg = new THREE.Group();
        tg.position.set(x, ty, z);

        // Tower stone base
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 8.0, 12), archMat);
        base.position.y = 4.0;
        base.castShadow = true; base.receiveShadow = true;
        tg.add(base);

        // Open belfry with pillars
        for (let p = 0; p < 4; p++) {
          const pang = (p / 4) * Math.PI * 2;
          const px = Math.cos(pang) * 1.6;
          const pz = Math.sin(pang) * 1.6;
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 3.8, 8), archMat);
          col.position.set(px, 9.8, pz);
          col.castShadow = true;
          tg.add(col);
        }

        // Metallic Golden Bell
        const bigBell = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.78, 1.25, 12),
          new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0x996500,
            emissiveIntensity: 0.35,
            metalness: 0.88,
            roughness: 0.22
          })
        );
        bigBell.position.y = 9.8;
        bigBell.castShadow = true;
        tg.add(bigBell);

        // Bell glow
        const bellGlow = mkGlow('#ffe880', 6.5, 0.55);
        bellGlow.position.y = 9.8;
        tg.add(bellGlow);

        // Pagoda / Domed roof
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(2.8, 3.2, 12),
          new THREE.MeshStandardMaterial({ map: TEXTURES.stoneTex, color: 0xede0cc, roughness: 0.75 })
        );
        roof.position.y = 13.2;
        roof.castShadow = true;
        tg.add(roof);

        // Golden spire
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.18, 2.5, 6),
          new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.25 })
        );
        spire.position.y = 15.6;
        spire.castShadow = true;
        tg.add(spire);

        this.scene.add(tg);
        this._o.push(tg);
      }
    });

    /* ── 5. FLUFFY DRIFTING CUMULUS CLOUDS ── */
    const cMatSky = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.98,
      transparent: true,
      opacity: 0.85
    });

    for (let i = 0; i < 9; i++) {
      const cx = rand(-22, 22), cy = rand(24, 38), cz = rand(10, dep);
      const cg = new THREE.Group();
      cg.position.set(cx, cy, cz);
      for (let j = 0; j < 5; j++) {
        const cs = rand(4.0, 9.5);
        const cm = new THREE.Mesh(new THREE.SphereGeometry(cs, 8, 6), cMatSky);
        cm.position.set(rand(-7, 7), rand(-2, 2), rand(-4, 4));
        cm.scale.set(1.3, 0.8, 1.2);
        cg.add(cm);
      }
      this.scene.add(cg);
      this._o.push(cg);
    }
  }

  update(t, player, onCollect, onPortal) {
    this.candles.forEach(c => {
      if (!c.done && c.update(t, player.position)) {
        this.collected++;
        player.collectFx(c.g.position, this.scene, '#ffc838');
        onCollect(c.data);
      }
    });

    if (this.portal && this.portal.update(t, player.position, this.collected, this.total)) {
      onPortal(this.portal.next);
    }

    this.butterflies.update(t, player.position);
    this.amb.update();
  }

  dispose() {
    this._o.forEach(o => {
      this.scene.remove(o);
      o.geometry?.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.());
        else o.material.dispose?.();
      }
    });
    this.candles.forEach(c => {
      if (!c.done) c._kill?.();
    });
    this.portal?.dispose?.();
    this.butterflies.dispose();
    this.amb.dispose();
  }
}

/* ══════════════════════════════════════════════════════════
   UI MANAGER
   ══════════════════════════════════════════════════════════ */
class UI {
  constructor(g) {
    this.g = g;
    this.$ = i => document.getElementById(i);
    this._to = null;
    this._init();
  }

  _init() {
    this.$('start-btn').addEventListener('click', () => this._start());
    this.$('dialog-close').addEventListener('click', () => this.g.closeDialog());
    this.$('rsvp-cancel').addEventListener('click', () => this.g.closeRSVP());
    this.$('rsvp-form').addEventListener('submit', e => {
      e.preventDefault();
      this._rsvp();
    });
    this.$('audio-btn').addEventListener('click', () => {
      const m = audioManager?.toggle?.();
      this.$('audio-btn').textContent = m ? '🔇' : '🎵';
    });
    this.$('share-btn').addEventListener('click', () => this._share());
    this.$('replay-btn').addEventListener('click', () => location.reload());

    window.addEventListener('keydown', e => {
      if ((e.code === 'Space' || e.code === 'Enter') && this.g.state === 'dialog') {
        this.g.closeDialog();
        e.preventDefault();
      }
    });

    this._mobile();
    setInterval(() => this._hud(), 100);
  }

  _start() {
    this.$('title-screen').classList.add('hidden');
    this.$('hud').classList.remove('hidden');
    audioManager?.init?.();
    audioManager?.startAmbient?.(0);
    this.g.setState('playing');
    setTimeout(() => this.realmTitle(REALMS[0].name, REALMS[0].sub), 500);
  }

  realmTitle(name, sub) {
    const el = this.$('realm-title-display');
    el.querySelector('.realm-title-name').textContent = name;
    el.querySelector('.realm-title-sub').textContent = sub;
    el.classList.remove('hidden', 'realm-anim');
    void el.offsetWidth;
    el.classList.add('realm-anim');
    clearTimeout(this._to);
    this._to = setTimeout(() => el.classList.add('hidden'), 3600);
  }

  showDialog(t, h) {
    this.$('dialog-title').textContent = t;
    this.$('dialog-body').innerHTML = h;
    this.$('dialog-box').classList.remove('hidden');
  }

  hideDialog() {
    this.$('dialog-box').classList.add('hidden');
  }

  showRSVP() {
    this.$('rsvp-modal').classList.remove('hidden');
  }

  hideRSVP() {
    this.$('rsvp-modal').classList.add('hidden');
  }

  showEnding() {
    const W = window.WEDDING || { groom: { name: '' }, bride: { name: '' }, akad: { date: '' } };
    this.$('end-names').textContent = `${W.groom.name} & ${W.bride.name}`;
    this.$('end-date').textContent = W.akad.date;
    this.$('end-screen').classList.remove('hidden');
    this.$('hud').classList.add('hidden');
    const mc = this.$('mobile-controls');
    if (mc) mc.style.display = 'none';
  }

  buildDialog(data) {
    const W = window.WEDDING || {
      groom: { name: 'Mempelai Pria', parents: '' },
      bride: { name: 'Mempelai Wanita', parents: '' },
      story: { quote: '', howWeMet: '', journey: '', proposal: '' },
      akad: { date: '', time: '', location: '', address: '', mapsUrl: '' },
      reception: { date: '', time: '', location: '', address: '', mapsUrl: '' }
    };
    switch (data.type) {
      case 'intro':
        return {
          t: '🌟 Bismillahirrahmanirrahim',
          h: `<p style="text-align:center;line-height:1.9">Dengan penuh rasa syukur kepada Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu dalam pernikahan kami. 💛</p>`
        };
      case 'groom':
        return {
          t: '✨ Mempelai Pria',
          h: `<div class="dialog-names-card"><h2>${W.groom.name}</h2><p class="parents">${W.groom.parents}</p></div>`
        };
      case 'bride':
        return {
          t: '🌸 Mempelai Wanita',
          h: `<div class="dialog-names-card"><h2>${W.bride.name}</h2><p class="parents">${W.bride.parents}</p></div>`
        };
      case 'quote':
        return {
          t: '💫 Dua Cahaya di Prairie',
          h: `<blockquote class="dialog-quote">${W.story.quote}</blockquote>`
        };
      case 'story1':
        return { t: '💛 Awal Perjumpaan', h: `<p>${W.story.howWeMet}</p>` };
      case 'story2':
        return { t: '💑 Perjalanan Kami', h: `<p>${W.story.journey}</p>` };
      case 'story3':
        return { t: '💍 Lamaran Indah', h: `<p>${W.story.proposal}</p>` };
      case 'akad_time':
        return {
          t: '💍 Akad Nikah',
          h: `<div class="dialog-event"><div class="event-label">📅 ${W.akad.date}</div><div class="event-label">🕐 ${W.akad.time}</div></div>`
        };
      case 'akad_place':
        return {
          t: '📍 Lokasi Akad',
          h: `<div class="dialog-event"><div class="event-label">${W.akad.location}</div><div class="event-addr">${W.akad.address}</div>${W.akad.mapsUrl ? `<a href="${W.akad.mapsUrl}" target="_blank" class="btn-maps">🗺️ Lihat Peta</a>` : ''}</div>`
        };
      case 'resepsi_time':
        return {
          t: '🎉 Resepsi Pernikahan',
          h: `<div class="dialog-event"><div class="event-label">📅 ${W.reception.date}</div><div class="event-label">🕐 ${W.reception.time}</div></div>`
        };
      case 'resepsi_place':
        return {
          t: '📍 Lokasi Resepsi',
          h: `<div class="dialog-event"><div class="event-label">${W.reception.location}</div><div class="event-addr">${W.reception.address}</div>${W.reception.mapsUrl ? `<a href="${W.reception.mapsUrl}" target="_blank" class="btn-maps">🗺️ Lihat Peta</a>` : ''}</div>`
        };
      case 'thankyou':
        return {
          t: '🌟 Terima Kasih',
          h: `<div style="text-align:center;line-height:1.9"><p>Kehadiran dan doa restu Bapak/Ibu/Saudara/i adalah anugerah dan cahaya terindah bagi kami berdua.</p><br><p style="color:var(--gold);font-style:italic">— ${W.groom.name} &amp; ${W.bride.name}</p></div>`
        };
      default:
        return { t: '✦', h: '<p>...</p>' };
    }
  }

  _rsvp() {
    const W = window.WEDDING || { contact: { phone: '6281234567890' } };
    const name = this.$('rsvp-name').value.trim();
    const phone = this.$('rsvp-phone').value.trim();
    const attend = this.$('rsvp-attend').value;
    const guests = this.$('rsvp-guests').value;
    const msg = this.$('rsvp-message').value.trim();
    const all = JSON.parse(localStorage.getItem('wedding_rsvp') || '[]');
    all.push({ name, phone, attend, guests, msg, ts: new Date().toISOString() });
    localStorage.setItem('wedding_rsvp', JSON.stringify(all));

    const aL = { hadir: '✅ Insya Allah Hadir', tidak: '❌ Tidak Bisa Hadir', mungkin: '🤔 Belum Pasti' }[attend] || attend;
    const txt = encodeURIComponent(`✨ *Konfirmasi Kehadiran Pernikahan*\n\n👤 ${name}\n📱 ${phone || '-'}\n🎉 ${aL}\n👥 ${guests} orang\n💌 ${msg || '-'}\n\n— Undangan Daylight Prairie 🌟`);
    window.open(`https://wa.me/${W.contact?.phone || '6281234567890'}?text=${txt}`, '_blank');
    this.$('rsvp-form').innerHTML = `
      <div class="rsvp-success">
        <span class="rsvp-success-icon">✨</span>
        <h3>Terima Kasih, ${name}!</h3>
        <p>${attend === 'hadir' ? 'Kehadiranmu sangat kami nantikan di padang bahagia ini 🌟' : 'Doa dan perhatianmu sangat berarti bagi kami 💛'}</p>
        <button onclick="window.__g3?.closeRSVP()" class="btn-primary">✦ Lanjutkan Perjalanan ✦</button>
      </div>`;
  }

  _share() {
    const W = window.WEDDING || { groom: { name: '' }, bride: { name: '' }, akad: { date: '' } };
    const txt = encodeURIComponent(`✨ Undangan Pernikahan 3D Daylight Prairie ✨\n\n${W.groom.name} & ${W.bride.name}\n📅 ${W.akad.date}\n\n${location.href}\n\n🌟 Mainkan game 3D bertema Sky: Children of the Light!`);
    window.open(`https://wa.me?text=${txt}`, '_blank');
  }

  _hud() {
    const g = this.g;
    if (!g.realm || !g.player) return;
    this.$('candle-count').textContent = g.realm.collected;
    this.$('candle-total').textContent = g.realm.total;
    this.$('realm-name').textContent = g.realm.data.name;
    const wb = this.$('wing-bar');
    if (wb) wb.style.width = g.player.wingEnergy + '%';
    const cd = this.$('countdown-display'), W = window.WEDDING;
    if (cd && W?.targetDate) {
      const diff = W.targetDate - Date.now();
      cd.textContent = diff > 0 ? `${Math.floor(diff / 864e5)} hari lagi 💒` : 'Hari Bahagia 🎊';
    }
  }

  _mobile() {
    const mob = ('ontouchstart' in window) || innerWidth < 800;
    const mc = this.$('mobile-controls');
    if (!mob) {
      mc.style.display = 'none';
      return;
    }
    mc.style.display = 'flex';
    const base = this.$('joystick-base'), handle = this.$('joystick-handle'), fly = this.$('fly-btn');
    const R = 40;
    let on = false, cx = 0, cy = 0;

    const gc = () => {
      const r = base.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
    };

    base.addEventListener('touchstart', e => {
      e.preventDefault();
      on = true;
      gc();
    }, { passive: false });

    window.addEventListener('touchmove', e => {
      if (!on) return;
      e.preventDefault();
      const t = e.touches[0], dx = t.clientX - cx, dy = t.clientY - cy;
      const d = Math.hypot(dx, dy), cd = Math.min(d, R), a = Math.atan2(dy, dx);
      handle.style.transform = `translate(calc(-50% + ${Math.cos(a) * cd}px), calc(-50% + ${Math.sin(a) * cd}px))`;
      this.g.input.joystick = { x: (cd / R) * Math.cos(a), y: (cd / R) * Math.sin(a) };
    }, { passive: false });

    window.addEventListener('touchend', () => {
      if (!on) return;
      on = false;
      handle.style.transform = 'translate(-50%, -50%)';
      this.g.input.joystick = null;
    });

    fly.addEventListener('touchstart', e => {
      e.preventDefault();
      this.g.input.flyHeld = true;
      this.g.input.jumpPressed = true;
      fly.classList.add('active');
    }, { passive: false });

    fly.addEventListener('touchend', e => {
      e.preventDefault();
      this.g.input.flyHeld = false;
      fly.classList.remove('active');
    }, { passive: false });
  }
}

/* ══════════════════════════════════════════════════════════
   GAME 3D ENGINE (Soft Shadows & Enhanced Lighting)
   ══════════════════════════════════════════════════════════ */
class Game3D {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.clock = new THREE.Clock();
    this.state = 'title';
    this.player = null;
    this.realm = null;
    this.realmIdx = 0;
    this.fog = null;
    this.camPos = new THREE.Vector3();
    this.camLook = new THREE.Vector3();
    this.input = {
      left: false,
      right: false,
      forward: false,
      back: false,
      jump: false,
      jumpPressed: false,
      flyHeld: false,
      joystick: null
    };
    this.ui = new UI(this);
    window.__g3 = this;
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    // Real-time Soft Shadow Map for Realistic Graphics!
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.fog = new THREE.FogExp2(0xbfe6fd, 0.004);
    this.scene.fog = this.fog;

    this.camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.3, 500);

    this._initInput();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    this.renderer.setSize(innerWidth, innerHeight);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  _initInput() {
    const held = new Set();
    window.addEventListener('keydown', e => {
      if (held.has(e.code)) return;
      held.add(e.code);
      if (['KeyA', 'ArrowLeft'].includes(e.code))  this.input.left = true;
      if (['KeyD', 'ArrowRight'].includes(e.code)) this.input.right = true;
      if (['KeyW', 'ArrowUp'].includes(e.code))    this.input.forward = true;
      if (['KeyS', 'ArrowDown'].includes(e.code))  this.input.back = true;
      if (e.code === 'Space') {
        this.input.jump = true;
        this.input.jumpPressed = true;
        this.input.flyHeld = true;
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      held.delete(e.code);
      if (['KeyA', 'ArrowLeft'].includes(e.code))  this.input.left = false;
      if (['KeyD', 'ArrowRight'].includes(e.code)) this.input.right = false;
      if (['KeyW', 'ArrowUp'].includes(e.code))    this.input.forward = false;
      if (['KeyS', 'ArrowDown'].includes(e.code))  this.input.back = false;
      if (e.code === 'Space') {
        this.input.jump = false;
        this.input.flyHeld = false;
      }
    });
  }

  _loadRealm(idx) {
    if (this.realm) {
      this.realm.dispose();
      this.realm = null;
    }
    const data = REALMS[idx];
    this.realmIdx = idx;
    this.fog.color.setHex(data.fog.c);
    this.fog.density = data.fog.d;
    this.realm = new Realm3D(this.scene, data);
    audioManager?.changeRealm?.(idx);

    const sx = 0, sz = 5, sy = gY(sx, sz, data.id) + 1.15;
    if (!this.player) this.player = new Character(this.scene);
    this.player.position.set(sx, sy, sz);
    this.player.velocity.set(0, 0, 0);
    this.player.onGround = true;
    this.player.lastSafe.copy(this.player.position);

    this.camPos.set(sx, sy + 7.5, sz - 14);
    this.camLook.set(sx, sy + 1.8, sz + 3.5);
    this.camera.position.copy(this.camPos);
  }

  setState(st) {
    this.state = st;
  }

  _collect(data) {
    audioManager?.playCollect?.();
    if (data.type === 'rsvp') {
      this.setState('rsvp');
      this.ui.showRSVP();
    } else if (data.type === 'ending') {
      this.setState('ending');
      audioManager?.playEnding?.();
      this.ui.showEnding();
    } else {
      this.setState('dialog');
      const b = this.ui.buildDialog(data);
      this.ui.showDialog(b.t, b.h);
    }
  }

  _portal(next) {
    if (!next) return;
    audioManager?.playPortal?.();
    this._loadRealm(next - 1);
    this.ui.realmTitle(REALMS[next - 1].name, REALMS[next - 1].sub);
  }

  closeDialog() {
    this.ui.hideDialog();
    this.setState('playing');
  }

  closeRSVP() {
    this.ui.hideRSVP();
    this.setState('playing');
  }

  update(dt) {
    if (this.state === 'title') {
      const t = this.clock.elapsedTime * 0.15;
      this.camera.position.set(Math.sin(t) * 9, 8.5, Math.cos(t) * 9 + 8);
      this.camera.lookAt(0, 2.5, 8);
      return;
    }

    if (this.state === 'dialog' || this.state === 'rsvp' || this.state === 'ending') {
      if (this.player) this.player.velocity.set(0, 0, 0);
      this.input.jumpPressed = false;
      return;
    }

    /* ── Playing ── */
    this.player.update(this.input, this.realmIdx + 1);
    this.input.jumpPressed = false;
    this.realm.update(this.clock.elapsedTime, this.player, d => this._collect(d), n => this._portal(n));

    /* Camera smooth follow */
    const pp = this.player.position;
    const tp = new THREE.Vector3(pp.x, pp.y + 7.5, pp.z - 14);
    this.camPos.lerp(tp, 0.085);
    this.camera.position.copy(this.camPos);
    const tl = new THREE.Vector3(pp.x, pp.y + 1.8, pp.z + 3.5);
    this.camLook.lerp(tl, 0.095);
    this.camera.lookAt(this.camLook);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  loop() {
    requestAnimationFrame(() => this.loop());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.update(dt);
    this.render();
  }
}

/* ══════════════════════════════════════════════════════════
   BOOT
   ══════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  const g = new Game3D();
  g.init();
  g._loadRealm(0);
  document.getElementById('start-btn').onclick = () => {
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    audioManager?.init?.();
    audioManager?.startAmbient?.(0);
    g.setState('playing');
    setTimeout(() => g.ui.realmTitle(REALMS[0].name, REALMS[0].sub), 500);
  };
  g.loop();
});
