'use strict';
/* ═══════════════════════════════════════════════════════════════
   SKY WEDDING GAME — js/game.js
   Complete 2-D side-scroller game engine
   ═══════════════════════════════════════════════════════════════ */

// ─── UTILITIES ───────────────────────────────────────────────────
const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const dist  = (x1,y1,x2,y2) => Math.hypot(x2-x1, y2-y1);
const rand  = (lo, hi) => Math.random() * (hi - lo) + lo;

// ─── PHYSICS CONSTANTS ───────────────────────────────────────────
const PHY = {
  GRAVITY     : 0.38,
  JUMP_FORCE  : 12,
  FLY_FORCE   : 0.55,
  MAX_WING    : 100,
  WING_DRAIN  : 1.8,
  WING_REGEN  : 0.9,
  WALK_SPEED  : 4.8,
  ACCEL       : 0.42,
};

// ─── GAME STATES ─────────────────────────────────────────────────
const STATE = { TITLE:'title', PLAYING:'playing', DIALOG:'dialog',
                RSVP:'rsvp', TRANSITION:'transition', ENDING:'ending' };

// ─── REALM DATA ──────────────────────────────────────────────────
const REALMS = [
  {
    id:1, name:'Isle of Dawn', sub:'Perkenalan',
    sky:['#06021a','#1a0a42','#6b2f10','#c96820','#f5a030'],
    groundFill:'#2a4018', groundLine:'#5a8a30',
    hillAmp:0.048, hillFreq:0.0018, groundBase:0.73,
    starCount:220, ambientColor:'#f5a030',
    decoration:'floating-islands',
    collectibles:[
      { x:620,  data:{type:'intro'} },
      { x:1450, data:{type:'groom'} },
      { x:2350, data:{type:'bride'} },
      { x:3300, data:{type:'quote'} },
    ],
    portal:{ x:4500, next:2 },
    realmWidth:5000,
  },
  {
    id:2, name:'Daylight Prairie', sub:'Kisah Kita',
    sky:['#3a7fd4','#6db4e8','#b8daf5','#dff0ff'],
    groundFill:'#7a5a10', groundLine:'#c4a030',
    hillAmp:0.022, hillFreq:0.001, groundBase:0.76,
    starCount:20, ambientColor:'#87ceeb',
    decoration:'prairie',
    collectibles:[
      { x:750,  data:{type:'story1'} },
      { x:1900, data:{type:'story2'} },
      { x:3100, data:{type:'story3'} },
    ],
    portal:{ x:4500, next:3 },
    realmWidth:5000,
  },
  {
    id:3, name:'Hidden Forest', sub:'Undangan',
    sky:['#020810','#061830','#0a2a40','#0d2e22'],
    groundFill:'#0d1e0a', groundLine:'#2a5a20',
    hillAmp:0.07, hillFreq:0.0028, groundBase:0.72,
    starCount:180, ambientColor:'#4ade80',
    decoration:'forest',
    collectibles:[
      { x:700,  data:{type:'akad_time'} },
      { x:1600, data:{type:'akad_place'} },
      { x:2700, data:{type:'resepsi_time'} },
      { x:3800, data:{type:'resepsi_place'} },
    ],
    portal:{ x:5000, next:4 },
    realmWidth:5500,
  },
  {
    id:4, name:'Golden Wasteland', sub:'Konfirmasi',
    sky:['#140300','#4a1000','#902e00','#c85000'],
    groundFill:'#5a3c00', groundLine:'#9a7010',
    hillAmp:0.055, hillFreq:0.0014, groundBase:0.74,
    starCount:60, ambientColor:'#ff8c00',
    decoration:'ruins',
    collectibles:[
      { x:2000, data:{type:'rsvp'} },
    ],
    portal:{ x:4500, next:5 },
    realmWidth:5000,
  },
  {
    id:5, name:'Eye of Eden', sub:'Penutup',
    sky:['#d8eeff','#ffffff','#ffeedd'],
    groundFill:'#d0d8ff', groundLine:'#ffffff',
    hillAmp:0.018, hillFreq:0.001, groundBase:0.82,
    starCount:80, ambientColor:'#ffffff',
    decoration:'heaven',
    collectibles:[
      { x:1600, data:{type:'thankyou'} },
      { x:2800, data:{type:'ending'} },
    ],
    portal:null,
    realmWidth:4000,
  },
];

/* ═══════════════════════════════════════════════
   PARTICLE SYSTEM
   ═══════════════════════════════════════════════ */
class Particle {
  constructor (x, y, o = {}) {
    this.x  = x; this.y  = y;
    this.vx = o.vx ?? rand(-1.5, 1.5);
    this.vy = o.vy ?? rand(-2.5, -0.5);
    this.life   = o.life   ?? 1;
    this.decay  = o.decay  ?? rand(.012, .028);
    this.size   = o.size   ?? rand(1, 3.5);
    this.color  = o.color  ?? '#ffd700';
    this.glow   = o.glow   ?? 10;
    this.grav   = o.grav   ?? 0.025;
  }
  update () {
    this.x += this.vx; this.y += this.vy;
    this.vy += this.grav; this.vx *= 0.97;
    this.life -= this.decay; this.size *= 0.985;
  }
  draw (ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.shadowBlur  = this.glow;
    ctx.shadowColor = this.color;
    ctx.fillStyle   = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(.1, this.size), 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
  dead () { return this.life <= 0 || this.size < .1; }
}

class ParticleSystem {
  constructor (max = 600) { this.pool = []; this.max = max; }
  emit (x, y, n, o = {}) {
    const add = Math.min(n, this.max - this.pool.length);
    for (let i = 0; i < add; i++) this.pool.push(new Particle(x, y, o));
  }
  update () {
    for (let i = this.pool.length - 1; i >= 0; i--) {
      this.pool[i].update();
      if (this.pool[i].dead()) this.pool.splice(i, 1);
    }
  }
  draw (ctx) { this.pool.forEach(p => p.draw(ctx)); }
  clear () { this.pool = []; }
}

/* ═══════════════════════════════════════════════
   STAR FIELD
   ═══════════════════════════════════════════════ */
class StarField {
  constructor (count) {
    this.stars = Array.from({length:count}, () => ({
      nx: Math.random(), ny: Math.random() * 0.88,
      r:  rand(.25, 2.2),
      a:  rand(.3, 1),
      tp: rand(0, Math.PI*2),
      ts: rand(.008, .025),
      pl: rand(.04, .28),
    }));
  }
  draw (ctx, W, H, camX, alpha=1) {
    if (alpha <= 0) return;
    const t = Date.now() * .001;
    ctx.save();
    this.stars.forEach(s => {
      const tw = (Math.sin(t * s.ts * 60 + s.tp) + 1) * .5;
      const fa = s.a * (.45 + tw * .55) * alpha;
      let sx = (s.nx * W - camX * s.pl * .5) % W;
      if (sx < 0) sx += W;
      ctx.globalAlpha = Math.max(0, fa);
      ctx.shadowBlur  = s.r * 3;
      ctx.shadowColor = '#fff';
      ctx.fillStyle   = '#fff';
      ctx.beginPath();
      ctx.arc(sx, s.ny * H, s.r, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.restore();
  }
}

/* ═══════════════════════════════════════════════
   COLLECTIBLE (CANDLE)
   ═══════════════════════════════════════════════ */
class Collectible {
  constructor (wx, data) {
    this.wx   = wx;
    this.data = data;
    this.done = false;
    this.ph   = rand(0, Math.PI*2);
    this.glow = .5;
    this.radius = 22;
  }
  update (px, py) {
    if (this.done) return false;
    this.ph += 0.04;
    const d = dist(this.wx, this.wy||0, px, py);
    this.glow = d < 130 ? 1 : 0.5;
    if (d < this.radius + 10) { this.done = true; return true; }
    return false;
  }
  draw (ctx, camX, camY, W) {
    if (this.done) return;
    const sx = this.wx - camX;
    const sy = (this.wy || 0) - camY + Math.sin(this.ph) * 7;
    if (sx < -60 || sx > W + 60) return;

    ctx.save();

    // Outer aura
    const aura = ctx.createRadialGradient(sx, sy, 0, sx, sy, 42 * this.glow);
    aura.addColorStop(0, 'rgba(255,200,60,.45)');
    aura.addColorStop(1, 'rgba(255,200,60,0)');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(sx, sy, 42*this.glow, 0, Math.PI*2); ctx.fill();

    // Candle body
    ctx.shadowBlur  = 18 * this.glow;
    ctx.shadowColor = '#ffc040';
    ctx.fillStyle   = '#f5e8b0';
    ctx.fillRect(sx-5, sy+4, 10, 22);

    // Flame
    const ff = .8 + Math.sin(this.ph*4) * .2;
    const fh = 14 * ff;
    ctx.shadowBlur  = 12 * ff; ctx.shadowColor = '#ff6600';
    ctx.fillStyle   = '#ff3300';
    ctx.beginPath();
    ctx.moveTo(sx, sy - fh);
    ctx.quadraticCurveTo(sx+7,  sy,   sx,   sy+5);
    ctx.quadraticCurveTo(sx-7,  sy,   sx,   sy - fh);
    ctx.fill();
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(sx, sy - fh*.7);
    ctx.quadraticCurveTo(sx+4,  sy,   sx,   sy+3);
    ctx.quadraticCurveTo(sx-4,  sy,   sx,   sy - fh*.7);
    ctx.fill();

    ctx.restore();
  }
}

/* ═══════════════════════════════════════════════
   PORTAL
   ═══════════════════════════════════════════════ */
class Portal {
  constructor (wx, next) {
    this.wx = wx; this.next = next;
    this.wy = 0; this.ph = 0;
    this.height = 90; this.radius = 32;
    this.active = false;
  }
  update (px, py, collected, total) {
    this.ph += 0.03;
    this.active = (collected >= total);
    if (this.active) {
      if (dist(this.wx, this.wy - this.height/2, px, py) < this.radius) return true;
    }
    return false;
  }
  draw (ctx, camX, camY, W, collected, total) {
    const sx = this.wx - camX;
    const sy = this.wy - camY;
    if (sx < -120 || sx > W + 120) return;

    const prog  = total > 0 ? collected / total : 0;
    const alpha = 0.3 + prog * 0.7;

    ctx.save();
    ctx.shadowBlur  = 28 * alpha;
    ctx.shadowColor = '#a855f7';
    ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
    ctx.lineWidth   = 3.5;

    // Arch
    ctx.beginPath();
    ctx.moveTo(sx-32, sy);
    ctx.lineTo(sx-32, sy - this.height);
    ctx.arc(sx, sy - this.height, 32, Math.PI, 0);
    ctx.lineTo(sx+32, sy);
    ctx.stroke();

    if (this.active) {
      // Glowing core
      const grd = ctx.createRadialGradient(sx, sy-this.height/2, 0, sx, sy-this.height/2, 30);
      grd.addColorStop(0,'rgba(168,85,247,.65)');
      grd.addColorStop(.6,'rgba(99,102,241,.25)');
      grd.addColorStop(1,'rgba(168,85,247,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.ellipse(sx, sy-this.height/2, 30, 42, 0, 0, Math.PI*2);
      ctx.fill();

      // Swirl dots
      for (let i=0;i<10;i++){
        const ang = (i/10)*Math.PI*2 + this.ph;
        const pr  = 14 + Math.sin(this.ph*2)*6;
        const px2 = sx + Math.cos(ang)*pr;
        const py2 = sy - this.height/2 + Math.sin(ang)*pr*1.3;
        ctx.shadowBlur = 8; ctx.shadowColor='#c084fc';
        ctx.fillStyle  = '#c084fc';
        ctx.beginPath(); ctx.arc(px2,py2,2,0,Math.PI*2); ctx.fill();
      }

      ctx.globalAlpha = .6 + Math.sin(this.ph*2)*.3;
      ctx.shadowBlur  = 6; ctx.shadowColor = '#e9d5ff';
      ctx.fillStyle   = '#e9d5ff';
      ctx.font        = `600 12px 'Cinzel', serif`;
      ctx.textAlign   = 'center';
      ctx.fillText('✦ Lanjutkan ✦', sx, sy - this.height - 14);
    } else {
      ctx.globalAlpha = .38;
      ctx.fillStyle   = '#999';
      ctx.font        = '11px sans-serif';
      ctx.textAlign   = 'center';
      const rem = total - collected;
      ctx.fillText(`🕯️ ${rem} lagi`, sx, sy - this.height - 14);
    }
    ctx.restore();
  }
}

/* ═══════════════════════════════════════════════
   PLAYER
   ═══════════════════════════════════════════════ */
class Player {
  constructor (x, y) {
    this.wx = x; this.wy = y;
    this.vx = 0; this.vy = 0;
    this.onGround   = false;
    this.wingEnergy = PHY.MAX_WING;
    this.flying     = false;
    this.faceRight  = true;
    this.capePh     = 0;
    this.haloPh     = 0;
    this.stepPh     = 0;
    this.particles  = new ParticleSystem(300);
    this.hitFx      = new ParticleSystem(150);
    this._flySound  = 0;
  }

  update (inp, gndFn) {
    // ── Horizontal ──
    let targetVX = 0;
    if (inp.left)  { targetVX = -PHY.WALK_SPEED; this.faceRight = false; }
    if (inp.right) { targetVX =  PHY.WALK_SPEED; this.faceRight = true;  }
    if (inp.joystick) {
      targetVX = inp.joystick.x * PHY.WALK_SPEED;
      if (Math.abs(targetVX) > .3) this.faceRight = targetVX > 0;
    }
    this.vx = lerp(this.vx, targetVX, PHY.ACCEL);

    // ── Wing / fly ──
    const canFly = (inp.jump || (inp.joystick && inp.joystick.y < -0.5)) && this.wingEnergy > 0;
    if (canFly && !this.onGround) {
      this.vy -= PHY.FLY_FORCE;
      this.wingEnergy = Math.max(0, this.wingEnergy - PHY.WING_DRAIN);
      this.flying = true;
      if (rand(0,1) < .25) {
        this.particles.emit(this.wx, this.wy + 14, 1, {
          vx: -this.vx*.3 + rand(-.5,.5),
          vy: rand(-.3,.3),
          decay:.045, size:rand(.8,2), color:'#ffd070', glow:7, grav:-.01
        });
      }
      this._flySound++;
      if (this._flySound % 20 === 1) audioManager.playFly();
    } else {
      this.flying = false;
      this.wingEnergy = Math.min(PHY.MAX_WING, this.wingEnergy + PHY.WING_REGEN);
      this._flySound = 0;
    }

    // ── Jump ──
    if (inp.jumpPressed && this.onGround) {
      this.vy = -PHY.JUMP_FORCE;
      this.onGround = false;
      audioManager.playFly();
    }

    // ── Gravity ──
    if (!this.onGround) this.vy += PHY.GRAVITY;
    this.vy = clamp(this.vy, -16, 20);
    this.vx = clamp(this.vx, -PHY.WALK_SPEED*1.8, PHY.WALK_SPEED*1.8);

    this.wx += this.vx;
    this.wy += this.vy;
    if (this.wx < 80) { this.wx = 80; this.vx = 0; }

    // ── Ground ──
    const gy = gndFn(this.wx);
    if (this.wy >= gy) {
      if (!this.onGround && this.vy > 3) {
        this.hitFx.emit(this.wx, gy, 6, {
          vx:rand(-2,2), vy:-rand(.5,1.5), decay:.06,
          size:rand(.8,2), color:'rgba(255,255,255,.6)', glow:4, grav:.04
        });
      }
      this.wy = gy; this.vy = 0; this.onGround = true;
    } else {
      this.onGround = false;
    }

    if (this.onGround && Math.abs(this.vx) > .5) this.stepPh += .18;
    this.capePh += .06;
    this.haloPh += .04;

    this.particles.update();
    this.hitFx.update();
  }

  collectFx (x, y, color) {
    this.hitFx.emit(x, y, 22, {
      vx:rand(-3,3), vy:-rand(1,5), decay:.018,
      size:rand(2,5), color, glow:16, grav:.04
    });
  }

  draw (ctx, camX, camY) {
    // World-space particles
    const drawWP = (p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.shadowBlur = p.glow; ctx.shadowColor = p.color;
      ctx.fillStyle  = p.color;
      ctx.beginPath();
      ctx.arc(p.x - camX, p.y - camY, Math.max(.1,p.size), 0, Math.PI*2);
      ctx.fill(); ctx.restore();
    };
    this.particles.pool.forEach(drawWP);
    this.hitFx.pool.forEach(drawWP);

    const sx = this.wx - camX;
    const sy = this.wy - camY;

    ctx.save();
    ctx.translate(sx, sy);
    if (!this.faceRight) ctx.scale(-1, 1);

    // Halo glow
    const hr = 34 + Math.sin(this.haloPh) * 5;
    const hg = ctx.createRadialGradient(0,-18,0,0,-18,hr);
    hg.addColorStop(0,'rgba(255,215,80,.42)');
    hg.addColorStop(1,'rgba(255,190,40,0)');
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(0,-18,hr,0,Math.PI*2); ctx.fill();

    // Cape
    const csp  = this.flying ? 1.6 : 1.0;
    const cwav = Math.sin(this.capePh) * 5;
    ctx.shadowBlur  = this.flying ? 18 : 10;
    ctx.shadowColor = '#ffd070';
    ctx.fillStyle   = '#f5f0e0';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.quadraticCurveTo(-16*csp+cwav,  4, -22*csp+cwav*1.4, 22);
    ctx.quadraticCurveTo(-10*csp+cwav, 32, 0, 26);
    ctx.quadraticCurveTo( 8, 30, 5, 20);
    ctx.quadraticCurveTo( 9,  4, 0,-22);
    ctx.fill();

    if (this.flying || !this.onGround) {
      ctx.fillStyle = 'rgba(245,240,224,.55)';
      ctx.beginPath();
      ctx.moveTo(0,-16);
      ctx.quadraticCurveTo(-26*csp,-4+cwav,-32*csp,12);
      ctx.quadraticCurveTo(-20*csp, 18,-14*csp,22);
      ctx.quadraticCurveTo(-8, 6, 0,-16);
      ctx.fill();
    }

    // Body
    ctx.shadowBlur=10; ctx.shadowColor='#ffd070';
    ctx.fillStyle='#eeeada';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 13, 0, 0, Math.PI*2); ctx.fill();

    // Walking bob
    const bob = this.onGround ? Math.sin(this.stepPh)*2 : 0;

    // Head
    ctx.shadowBlur=14; ctx.shadowColor='#ffd070';
    ctx.fillStyle='#f8f5ec';
    ctx.beginPath(); ctx.arc(0,-22+bob, 9, 0,Math.PI*2); ctx.fill();

    // Hair / glow top
    ctx.shadowBlur=10; ctx.shadowColor='#ffe07a';
    ctx.fillStyle='#ffe07a';
    ctx.beginPath();
    ctx.arc(0,-28+bob, 5.5, 0, Math.PI); ctx.fill();

    ctx.restore();
  }
}

/* ═══════════════════════════════════════════════
   REALM RENDERER
   ═══════════════════════════════════════════════ */
class RealmRenderer {
  constructor (data) {
    this.data  = data;
    this.stars = new StarField(data.starCount);
    this.bgFx  = new ParticleSystem(350);
    this.bgTimer = 0;

    this.collectibles = data.collectibles.map(c => new Collectible(c.x, c.data));
    this.collected = 0;
    this.total     = this.collectibles.length;

    this.portal = data.portal
      ? new Portal(data.portal.x, data.portal.next)
      : null;
  }

  gndFrac (wx) {
    const d = this.data;
    return d.groundBase
      + Math.sin(wx * d.hillFreq) * d.hillAmp
      + Math.sin(wx * d.hillFreq * 2.4 + 1.2) * d.hillAmp * .45;
  }
  gndY (wx, H) { return this.gndFrac(wx) * H; }

  /* ── SKY ── */
  drawSky (ctx, W, H) {
    const cols = this.data.sky;
    const g    = ctx.createLinearGradient(0,0,0,H);
    cols.forEach((c,i)=>g.addColorStop(i/(cols.length-1),c));
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  }

  /* ── BACKGROUND LAYERS ── */
  drawBg (ctx, W, H, camX) {
    ctx.save();
    const px  = camX * .18;
    const px2 = camX * .38;
    const dec = this.data.decoration;

    if (dec === 'floating-islands') {
      this._mountains(ctx,W,H,px, '#120840',.5,5,.55,180);
      this._mountains(ctx,W,H,px2,'#28124a',.6,8,.68,100);
      this._floatingIslands(ctx,W,H,px);
    } else if (dec === 'prairie') {
      this._mountains(ctx,W,H,px,'#4a7a30',.5,7,.60,120);
      this._clouds(ctx,W,H,camX*.12);
    } else if (dec === 'forest') {
      this._mountains(ctx,W,H,px,'#020e18',.38,5,.50,220);
      this._treeLine(ctx,W,H,camX*.42, .62,'#041d10',60,100);
      this._treeLine(ctx,W,H,camX*.58, .68,'#071f14',40,70);
    } else if (dec === 'ruins') {
      this._mountains(ctx,W,H,px,'#280800',.42,5,.55,200);
      this._ruins(ctx,W,H,px);
    } else if (dec === 'heaven') {
      this._heavenBeams(ctx,W,H,camX);
    }
    ctx.restore();
  }

  _mountains (ctx,W,H,offsetX,color,alpha,count,hFrac,seed) {
    ctx.globalAlpha = alpha; ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-10,H);
    for (let i=0;i<=count+1;i++){
      const x = i/(count)*(W+200)-100-offsetX%(W+200);
      const pk = (Math.sin(i*2.3+seed)*.5+.5)*(H-hFrac*H)*.85;
      ctx.lineTo(x, hFrac*H - pk);
      ctx.lineTo(x+(W/count)*.5, hFrac*H);
    }
    ctx.lineTo(W+10,H); ctx.closePath(); ctx.fill();
    ctx.globalAlpha=1;
  }

  _floatingIslands (ctx,W,H,offsetX) {
    const islands = [{x:.25,y:.42,w:160,h:28},{x:.55,y:.35,w:100,h:20},{x:.8,y:.48,w:130,h:22}];
    islands.forEach(({x,y,w,h}) => {
      const sx = x*W - offsetX*.5;
      const sy = y*H;
      ctx.globalAlpha = .55;
      ctx.fillStyle   = '#1a0d40';
      ctx.beginPath();
      ctx.ellipse(sx, sy, w/2, h/2, 0, 0, Math.PI*2); ctx.fill();
      // Grass top
      ctx.fillStyle = '#3a6820';
      ctx.beginPath();
      ctx.ellipse(sx, sy-h*.3, w/2*.9, h*.2, 0, Math.PI, 0); ctx.fill();
      ctx.globalAlpha=1;
      // Glow underneath
      const ig = ctx.createRadialGradient(sx,sy,0,sx,sy,w/2);
      ig.addColorStop(0,'rgba(255,200,80,.08)'); ig.addColorStop(1,'rgba(255,200,80,0)');
      ctx.fillStyle=ig; ctx.globalAlpha=1;
      ctx.beginPath(); ctx.ellipse(sx,sy,w/2,h/2,0,0,Math.PI*2); ctx.fill();
    });
  }

  _treeLine (ctx,W,H,offsetX,hFrac,color,minH,maxH) {
    const sp = 55;
    ctx.fillStyle=color; ctx.globalAlpha=.85;
    for (let x = -(offsetX%sp); x < W+sp; x+=sp) {
      const th = minH + Math.sin(x*.05)*( maxH-minH);
      ctx.fillRect(x-3, hFrac*H-th, 6, th);
      ctx.beginPath(); ctx.arc(x, hFrac*H-th, th*.42, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  _clouds (ctx,W,H,offsetX) {
    const clouds=[{x:.15,y:.18,r:50},{x:.42,y:.12,r:65},{x:.72,y:.20,r:44},{x:.9,y:.15,r:55}];
    ctx.fillStyle='rgba(255,255,255,.72)'; ctx.globalAlpha=.7;
    clouds.forEach(({x,y,r})=>{
      const cx=(x*W - offsetX*.4)%W; const cy=y*H;
      for(let i=-2;i<=2;i++){
        ctx.beginPath();
        ctx.arc(cx+i*r*.55, cy+Math.abs(i)*9, r*(1-Math.abs(i)*.18),0,Math.PI*2);
        ctx.fill();
      }
    });
    ctx.globalAlpha=1;
  }

  _ruins (ctx,W,H,offsetX) {
    const xs=[350,680,1050,1480,1900];
    ctx.fillStyle='#180500'; ctx.globalAlpha=.65;
    xs.forEach(rx=>{
      const x=rx-offsetX*.6;
      const rh=70+Math.sin(rx*.03)*40;
      const rw=18+Math.sin(rx*.2)*8;
      ctx.fillRect(x-rw/2, H*.52-rh, rw, rh);
      ctx.save();
      ctx.translate(x, H*.52-rh);
      ctx.rotate(Math.sin(rx*.5)*.28);
      ctx.fillRect(-rw/2,-rw,rw,rw);
      ctx.restore();
    });
    ctx.globalAlpha=1;
  }

  _heavenBeams (ctx,W,H,camX) {
    for(let i=0;i<10;i++){
      const ang = (i/10)*Math.PI*2 + camX*.00008;
      const len = H*1.6;
      const grd = ctx.createLinearGradient(W/2,-80, W/2+Math.cos(ang)*len, -80+Math.sin(ang)*len);
      grd.addColorStop(0,'rgba(255,255,220,.18)');
      grd.addColorStop(1,'rgba(255,255,220,0)');
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      ctx.strokeStyle=grd;
      ctx.lineWidth=28+Math.sin(ang*3)*14;
      ctx.beginPath(); ctx.moveTo(W/2,-80);
      ctx.lineTo(W/2+Math.cos(ang)*len, -80+Math.sin(ang)*len);
      ctx.stroke(); ctx.restore();
    }
  }

  /* ── GROUND ── */
  drawGround (ctx, W, H, camX, camY) {
    const steps = 100;
    const pts   = [];
    for (let i=0;i<=steps;i++){
      const sx = (i/steps)*W;
      const wx = sx + camX;
      pts.push({x:sx, y:this.gndY(wx,H)-camY});
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-10, H+20);
    pts.forEach(p=>ctx.lineTo(p.x, p.y));
    ctx.lineTo(W+10,H+20);
    ctx.closePath();

    const gy = pts[Math.floor(steps/2)].y;
    const grd = ctx.createLinearGradient(0,gy,0,H+20);
    grd.addColorStop(0,  this.data.groundLine);
    grd.addColorStop(.12,this.data.groundFill);
    grd.addColorStop(1,  '#000');
    ctx.fillStyle = grd; ctx.fill();

    // Glowing edge
    ctx.shadowBlur=10; ctx.shadowColor=this.data.groundLine;
    ctx.strokeStyle=this.data.groundLine; ctx.lineWidth=2;
    ctx.globalAlpha=.45;
    ctx.beginPath();
    pts.forEach((p,i)=>(i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)));
    ctx.stroke();
    ctx.restore();
  }

  /* ── AMBIENT PARTICLES ── */
  drawBgFx (ctx, W, H, camX) {
    this.bgTimer++;
    const d = this.data;
    let opts = null, spawnRate = 0;

    switch(d.id) {
      case 1: spawnRate=.35; opts={vx:rand(-.4,.4),vy:-rand(.2,.7),decay:.004,size:rand(.6,2),color:'#ffc840',glow:8,grav:-.012}; break;
      case 2: spawnRate=.45; opts={vx:rand(.2,.8), vy:-rand(.1,.4),decay:.003,size:rand(.4,1.5),color:'#fffacd',glow:5,grav:.004}; break;
      case 3: spawnRate=.55; opts={vx:rand(-.5,.5),vy:-rand(.3,.8),decay:.004,size:rand(1,2.5),color:Math.random()>.5?'#4ade80':'#86efac',glow:14,grav:-.007}; break;
      case 4: spawnRate=.5; opts={vx:rand(.3,1.5), vy:-rand(.5,1.2),decay:.006,size:rand(.5,2),color:Math.random()>.5?'#ff4500':'#ffa500',glow:11,grav:-.014}; break;
      case 5: spawnRate=.7; opts={vx:rand(-.6,.6), vy:-rand(.4,1),decay:.003,size:rand(1,3.5),color:`hsl(${rand(0,360)},100%,85%)`,glow:16,grav:-.012}; break;
    }

    if (opts && Math.random() < spawnRate) {
      this.bgFx.emit(rand(0,W)+camX, rand(H*.3,H*.92), 1, opts);
    }
    this.bgFx.update();
    this.bgFx.pool.forEach(p=>{
      const px2=p.x-camX, py2=p.y;
      ctx.save();
      ctx.globalAlpha=Math.max(0,p.life);
      ctx.shadowBlur=p.glow; ctx.shadowColor=p.color;
      ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(px2,py2,Math.max(.1,p.size),0,Math.PI*2); ctx.fill();
      ctx.restore();
    });
  }

  /* ── UPDATE ── */
  update (player, H, onCollect, onPortal) {
    this.collectibles.forEach(c => {
      c.wy = this.gndY(c.wx, H) - 52;
      const hit = c.update(player.wx, player.wy);
      if (hit) { this.collected++; onCollect(c.data, c.wx, c.wy); }
    });
    if (this.portal) {
      this.portal.wy = this.gndY(this.portal.wx, H);
      const enter = this.portal.update(player.wx, player.wy, this.collected, this.total);
      if (enter) onPortal(this.portal.next);
    }
  }

  /* ── DRAW ── */
  draw (ctx, W, H, camX, camY) {
    this.drawSky(ctx, W, H);
    const starAlpha = this.data.id===2 ? .12 : 1;
    this.stars.draw(ctx, W, H, camX, starAlpha);
    this.drawBg(ctx, W, H, camX);
    this.drawGround(ctx, W, H, camX, camY);
    this.drawBgFx(ctx, W, H, camX);

    this.collectibles.forEach(c=>{
      c.wy = this.gndY(c.wx, H) - 52;
      c.draw(ctx, camX, camY, W);
    });
    if (this.portal) {
      this.portal.wy = this.gndY(this.portal.wx, H);
      this.portal.draw(ctx, camX, camY, W, this.collected, this.total);
    }
  }
}

/* ═══════════════════════════════════════════════
   CAMERA
   ═══════════════════════════════════════════════ */
class Camera {
  constructor () { this.x = 0; this.y = 0; }
  follow (player, W) {
    const tx = Math.max(0, player.wx - W * .32);
    this.x = lerp(this.x, tx, .085);
    this.y = 0;
  }
}

/* ═══════════════════════════════════════════════
   UI MANAGER
   ═══════════════════════════════════════════════ */
class UIManager {
  constructor (game) {
    this.game = game;
    this.$  = id => document.getElementById(id);
    this.realmTimeout = null;
    this._hudInterval = null;
    this.init();
  }

  init () {
    // Start button
    this.$('start-btn').addEventListener('click', () => this.onStart());

    // Dialog close
    this.$('dialog-close').addEventListener('click', () => this.game.closeDialog());
    window.addEventListener('keydown', e => {
      if (e.code==='Space'||e.code==='Enter') {
        if (this.game.state===STATE.DIALOG) {
          this.game.closeDialog(); e.preventDefault();
        }
      }
    });

    // RSVP
    this.$('rsvp-cancel').addEventListener('click', () => this.game.closeRSVP());
    this.$('rsvp-form').addEventListener('submit', e => { e.preventDefault(); this.submitRSVP(); });

    // Audio
    this.$('audio-btn').addEventListener('click', () => {
      const muted = audioManager.toggle();
      this.$('audio-btn').textContent = muted ? '🔇' : '🎵';
    });

    // Share + Replay
    this.$('share-btn').addEventListener('click', () => this.shareWhatsApp());
    this.$('replay-btn').addEventListener('click', () => location.reload());

    // Mobile
    this.setupMobile();

    // HUD updates
    this._hudInterval = setInterval(() => this.updateHUD(), 100);
  }

  onStart () {
    this.$('title-screen').classList.add('hidden');
    this.$('hud').classList.remove('hidden');
    audioManager.init();
    audioManager.startAmbient(0);
    this.game.setState(STATE.PLAYING);
    setTimeout(() => this.showRealmTitle(REALMS[0].name, REALMS[0].sub), 600);
  }

  /* ── REALM TITLE ── */
  showRealmTitle (name, sub) {
    const el = this.$('realm-title-display');
    el.querySelector('.realm-title-name').textContent = name;
    el.querySelector('.realm-title-sub').textContent  = sub;
    el.classList.remove('hidden','realm-anim');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('realm-anim');
    clearTimeout(this.realmTimeout);
    this.realmTimeout = setTimeout(()=>el.classList.add('hidden'), 3500);
  }

  /* ── DIALOG ── */
  showDialog (title, html) {
    this.$('dialog-title').textContent = title;
    this.$('dialog-body').innerHTML    = html;
    this.$('dialog-box').classList.remove('hidden');
  }
  hideDialog () { this.$('dialog-box').classList.add('hidden'); }

  /* ── RSVP ── */
  showRSVP () { this.$('rsvp-modal').classList.remove('hidden'); }
  hideRSVP () { this.$('rsvp-modal').classList.add('hidden'); }

  submitRSVP () {
    const name    = this.$('rsvp-name').value.trim();
    const phone   = this.$('rsvp-phone').value.trim();
    const attend  = this.$('rsvp-attend').value;
    const guests  = this.$('rsvp-guests').value;
    const message = this.$('rsvp-message').value.trim();

    // Save to localStorage
    const data = {name,phone,attend,guests,message,ts:new Date().toISOString()};
    const all  = JSON.parse(localStorage.getItem('wedding_rsvp')||'[]');
    all.push(data); localStorage.setItem('wedding_rsvp', JSON.stringify(all));

    // Open WhatsApp
    const attendLabel = {hadir:'✅ Insya Allah Hadir', tidak:'❌ Tidak Bisa Hadir', mungkin:'🤔 Belum Pasti'}[attend]||attend;
    const text = encodeURIComponent(
      `✨ *Konfirmasi Kehadiran Pernikahan*\n\n`+
      `👤 Nama: ${name}\n`+
      `📱 WA:   ${phone||'-'}\n`+
      `🎉 Hadir: ${attendLabel}\n`+
      `👥 Tamu: ${guests} orang\n`+
      `💌 Pesan: ${message||'-'}\n\n`+
      `— Terkirim dari Undangan Digital Sky 🌟`
    );
    const w = WEDDING?.contact?.phone || '6281234567890';
    window.open(`https://wa.me/${w}?text=${text}`, '_blank');

    // Success message
    this.$('rsvp-form').innerHTML = `
      <div class="rsvp-success">
        <span class="rsvp-success-icon">✨</span>
        <h3>Terima Kasih, ${name}!</h3>
        <p>${attend==='hadir'
          ? 'Kehadiranmu sangat kami nantikan 🌟'
          : 'Doa dan perhatianmu sangat berarti bagi kami 💛'}</p>
        <button onclick="game.closeRSVP()" class="btn-primary">
          ✦ Lanjutkan Perjalanan ✦
        </button>
      </div>`;
  }

  /* ── END SCREEN ── */
  showEnding () {
    const el = this.$('end-screen');
    const W  = WEDDING;
    this.$('end-names').textContent = `${W.groom.name} & ${W.bride.name}`;
    this.$('end-date').textContent  = W.akad.date;
    el.classList.remove('hidden');
    this.$('hud').classList.add('hidden');
    const mc = this.$('mobile-controls');
    if (mc) mc.style.display='none';
  }

  shareWhatsApp () {
    const W  = WEDDING;
    const url = location.href;
    const text = encodeURIComponent(
      `✨ Undangan Pernikahan ✨\n\n`+
      `${W.groom.name} & ${W.bride.name}\n`+
      `📅 ${W.akad.date}\n\n`+
      `Ikuti perjalanan kami di:\n${url}\n\n`+
      `🌟 Mainkan seperti game Sky: Children of the Light!`
    );
    window.open(`https://wa.me?text=${text}`, '_blank');
  }

  /* ── HUD ── */
  updateHUD () {
    const g = this.game;
    if (!g.realm || !g.player) return;
    this.$('candle-count').textContent = g.realm.collected;
    this.$('candle-total').textContent = g.realm.total;
    this.$('realm-name').textContent   = g.realm.data.name;

    const pct = (g.player.wingEnergy / PHY.MAX_WING)*100;
    const wb  = this.$('wing-bar');
    if (wb) wb.style.width = pct+'%';

    // Countdown
    const cd = this.$('countdown-display');
    if (cd && WEDDING?.targetDate) {
      const diff = WEDDING.targetDate - Date.now();
      if (diff > 0) {
        const days = Math.floor(diff/864e5);
        cd.textContent = days > 0 ? `${days} hari lagi 💒` : 'Hari ini! 🎊';
      } else {
        cd.textContent = 'Alhamdulillah 🎊';
      }
    }
  }

  /* ── MOBILE CONTROLS ── */
  setupMobile () {
    const isMobile = ('ontouchstart' in window) || window.innerWidth < 800;
    const mc = this.$('mobile-controls');
    if (!isMobile) { mc.style.display='none'; return; }
    mc.style.display='flex';

    const base   = this.$('joystick-base');
    const handle = this.$('joystick-handle');
    const flyBtn = this.$('fly-btn');
    const R      = 38;
    let active=false, center={x:0,y:0};

    const getCenter = () => {
      const r = base.getBoundingClientRect();
      return {x:r.left+r.width/2, y:r.top+r.height/2};
    };

    base.addEventListener('touchstart', e=>{
      e.preventDefault(); active=true; center=getCenter();
    }, {passive:false});
    window.addEventListener('touchmove', e=>{
      if (!active) return; e.preventDefault();
      const t  = e.touches[0];
      const dx = t.clientX-center.x, dy=t.clientY-center.y;
      const d  = Math.hypot(dx,dy);
      const cd = Math.min(d,R);
      const a  = Math.atan2(dy,dx);
      handle.style.transform=`translate(calc(-50% + ${Math.cos(a)*cd}px),calc(-50% + ${Math.sin(a)*cd}px))`;
      this.game.input.joystick={x:(cd/R)*Math.cos(a), y:(cd/R)*Math.sin(a)};
      if (dy < -R*.65) this.game.input.jumpPressed=true;
    },{passive:false});
    window.addEventListener('touchend', e=>{
      if (!active) return; active=false;
      handle.style.transform='translate(-50%,-50%)';
      this.game.input.joystick=null;
    });

    flyBtn.addEventListener('touchstart', e=>{
      e.preventDefault();
      this.game.input.jump=true;
      this.game.input.jumpPressed=true;
      flyBtn.classList.add('active');
    },{passive:false});
    flyBtn.addEventListener('touchend', e=>{
      e.preventDefault();
      this.game.input.jump=false;
      flyBtn.classList.remove('active');
    },{passive:false});
  }
}

/* ═══════════════════════════════════════════════
   MAIN GAME
   ═══════════════════════════════════════════════ */
class Game {
  constructor (canvas, ctx) {
    this.canvas  = canvas;
    this.ctx     = ctx;
    this.state   = STATE.TITLE;
    this.realmIdx= 0;
    this.realm   = null;
    this.player  = null;
    this.camera  = new Camera();
    this.endFx   = new ParticleSystem(600);
    this.endTimer= 0;
    this.transitAlpha = 0;
    this.transitDir   = 1;
    this.nextRealm    = null;
    this.transitLock  = false;
    this.titleStars   = null;

    this.input = { left:false,right:false,jump:false,jumpPressed:false,joystick:null };

    this._initInput();
    this._loadRealm(0);
    this.ui = new UIManager(this);
  }

  _initInput () {
    const down = new Set();
    window.addEventListener('keydown', e=>{
      if (down.has(e.code)) return;
      down.add(e.code);
      if (['ArrowLeft','KeyA'].includes(e.code))  this.input.left=true;
      if (['ArrowRight','KeyD'].includes(e.code)) this.input.right=true;
      if (['ArrowUp','KeyW','Space'].includes(e.code)){
        this.input.jump=true; this.input.jumpPressed=true;
        if(e.code==='Space') e.preventDefault();
      }
    });
    window.addEventListener('keyup', e=>{
      down.delete(e.code);
      if (['ArrowLeft','KeyA'].includes(e.code))  this.input.left=false;
      if (['ArrowRight','KeyD'].includes(e.code)) this.input.right=false;
      if (['ArrowUp','KeyW','Space'].includes(e.code)) this.input.jump=false;
    });
  }

  _loadRealm (idx) {
    const d  = REALMS[idx];
    this.realmIdx = idx;
    this.realm    = new RealmRenderer(d);

    const startX = 120;
    const startY = this.realm.gndY(startX, this.canvas.height) - 2;
    if (!this.player) {
      this.player = new Player(startX, startY);
    } else {
      this.player.wx=startX; this.player.wy=startY;
      this.player.vx=0; this.player.vy=0;
      this.player.particles.clear(); this.player.hitFx.clear();
    }
    this.camera.x=0; this.camera.y=0;
  }

  setState (s) { this.state = s; }

  closeDialog () {
    this.state = STATE.PLAYING;
    this.ui.hideDialog();
  }

  closeRSVP () {
    this.state = STATE.PLAYING;
    this.ui.hideRSVP();
  }

  /* ── COLLECT ── */
  _onCollect (data, wx, wy) {
    audioManager.playCollect();
    this.player.collectFx(wx - this.camera.x, wy - this.camera.y, this.realm.data.ambientColor);

    if (data.type==='rsvp') {
      this.state=STATE.RSVP; this.ui.showRSVP(); return;
    }
    if (data.type==='ending') {
      this._startEnding(); return;
    }
    const {title,html} = this._buildDialog(data);
    this.state=STATE.DIALOG;
    this.ui.showDialog(title, html);
  }

  /* ── BUILD DIALOG CONTENT ── */
  _buildDialog (data) {
    const W  = WEDDING;
    const t  = (s)=>s; // passthrough
    switch (data.type) {
      case 'intro': return { title:'🌟 Bismillahirrahmanirrahim',
        html:`<p style="text-align:center;line-height:1.9">Dengan penuh rasa syukur kepada Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu dalam pernikahan kami. 💛</p>` };
      case 'groom': return { title:'✨ Mempelai Pria',
        html:`<div class="dialog-names-card"><h2>${W.groom.name}</h2><p class="parents">${W.groom.parents}</p></div>` };
      case 'bride': return { title:'🌸 Mempelai Wanita',
        html:`<div class="dialog-names-card"><h2>${W.bride.name}</h2><p class="parents">${W.bride.parents}</p></div>` };
      case 'quote': return { title:'💫 Dua Cahaya',
        html:`<blockquote class="dialog-quote">${W.story.quote}</blockquote>` };
      case 'story1': return { title:'💛 Awal Perjumpaan',
        html:`<p>${W.story.howWeMet}</p>` };
      case 'story2': return { title:'💑 Perjalanan Kami',
        html:`<p>${W.story.journey}</p>` };
      case 'story3': return { title:'💍 Lamaran',
        html:`<p>${W.story.proposal}</p>` };
      case 'akad_time': return { title:'💍 Akad Nikah',
        html:`<div class="dialog-event"><div class="event-label">📅 ${W.akad.date}</div><div class="event-label">🕐 ${W.akad.time}</div></div>` };
      case 'akad_place': return { title:'📍 Lokasi Akad',
        html:`<div class="dialog-event"><div class="event-label">${W.akad.location}</div><div class="event-addr">${W.akad.address}</div>${W.akad.mapsUrl?`<a href="${W.akad.mapsUrl}" target="_blank" class="btn-maps">🗺️ Lihat Peta</a>`:''}</div>` };
      case 'resepsi_time': return { title:'🎉 Resepsi',
        html:`<div class="dialog-event"><div class="event-label">📅 ${W.reception.date}</div><div class="event-label">🕐 ${W.reception.time}</div></div>` };
      case 'resepsi_place': return { title:'📍 Lokasi Resepsi',
        html:`<div class="dialog-event"><div class="event-label">${W.reception.location}</div><div class="event-addr">${W.reception.address}</div>${W.reception.mapsUrl?`<a href="${W.reception.mapsUrl}" target="_blank" class="btn-maps">🗺️ Lihat Peta</a>`:''}</div>` };
      case 'thankyou': return { title:'🌟 Terima Kasih',
        html:`<div style="text-align:center;line-height:1.9"><p>Kehadiran dan doa restu Bapak/Ibu/Saudara/i adalah hadiah terindah bagi kami.</p><br><p style="color:var(--gold);font-style:italic">— ${W.groom.name} &amp; ${W.bride.name}</p></div>` };
      default: return { title:'✦', html:'<p>...</p>' };
    }
  }

  /* ── PORTAL ── */
  _onPortal (nextId) {
    if (this.transitLock) return;
    this.transitLock = true;
    this.state = STATE.TRANSITION;
    this.transitAlpha = 0; this.transitDir = 1;
    this.nextRealm = nextId;
    audioManager.playPortal();
    setTimeout(()=>{ this.transitLock=false; }, 4000);
  }

  /* ── ENDING ── */
  _startEnding () {
    this.state=STATE.ENDING; this.endTimer=0;
    this.ui.showEnding();
    audioManager.changeRealm(4);
    audioManager.playPortal();
  }

  /* ─────────────────────────────────────────────
     UPDATE
   ─────────────────────────────────────────────── */
  update () {
    const W = this.canvas.width, H = this.canvas.height;

    if (this.state===STATE.TITLE) return;

    if (this.state===STATE.TRANSITION) {
      this.transitAlpha = clamp(this.transitAlpha + .028*this.transitDir, 0, 1);
      if (this.transitAlpha>=1 && this.transitDir===1) {
        // Switch realm at peak black
        if (this.nextRealm !== null) {
          const ni = REALMS.findIndex(r=>r.id===this.nextRealm);
          if (ni>=0) {
            this._loadRealm(ni);
            audioManager.changeRealm(ni);
            this.ui.showRealmTitle(REALMS[ni].name, REALMS[ni].sub);
          }
          this.nextRealm=null;
        }
        this.transitDir=-1;
      }
      if (this.transitAlpha<=0 && this.transitDir===-1) {
        this.transitAlpha=0; this.transitDir=1;
        this.state=STATE.PLAYING;
      }
      this.realm.bgFx.update();
      return;
    }

    if (this.state===STATE.ENDING) {
      this.endTimer++;
      if (this.endTimer%2===0) {
        this.endFx.emit(W/2, H/2, 2, {
          vx:rand(-7,7), vy:-rand(2,8), decay:.007,
          size:rand(2,5), color:`hsl(${rand(0,360)},100%,80%)`,
          glow:18, grav:.06
        });
      }
      this.endFx.update();
      this.realm.bgFx.update();
      return;
    }

    if (this.state===STATE.DIALOG || this.state===STATE.RSVP) {
      this.player.particles.update();
      this.player.hitFx.update();
      this.realm.bgFx.update();
      this.input.jumpPressed=false;
      return;
    }

    // ── PLAYING ──
    const gndFn = wx => this.realm.gndY(wx, H);
    this.player.update(this.input, gndFn);
    this.input.jumpPressed=false;
    this.camera.follow(this.player, W);

    this.realm.update(
      this.player, H,
      (data,wx,wy)=>this._onCollect(data,wx,wy),
      nextId=>this._onPortal(nextId)
    );
  }

  /* ─────────────────────────────────────────────
     RENDER
   ─────────────────────────────────────────────── */
  render () {
    const ctx=this.ctx, W=this.canvas.width, H=this.canvas.height;
    ctx.clearRect(0,0,W,H);

    if (this.state===STATE.TITLE) {
      this._drawTitleCanvas(W,H); return;
    }

    this.realm.draw(ctx, W, H, this.camera.x, this.camera.y);
    this.player.draw(ctx, this.camera.x, this.camera.y);

    if (this.state===STATE.ENDING) {
      this.endFx.draw(ctx);
      // Radial white bloom
      const bloom = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.min(W,H)*.6);
      bloom.addColorStop(0,`rgba(255,255,255,${Math.min(.35,this.endTimer*.002)})`);
      bloom.addColorStop(1,'rgba(255,255,255,0)');
      ctx.save(); ctx.globalCompositeOperation='lighter';
      ctx.fillStyle=bloom; ctx.fillRect(0,0,W,H); ctx.restore();
    }

    // Transition overlay
    if (this.transitAlpha>0) {
      ctx.save();
      ctx.globalAlpha=this.transitAlpha;
      ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
      ctx.restore();
    }
  }

  _drawTitleCanvas (W, H) {
    const ctx=this.ctx;
    // Sky gradient (drawn under the bg image in the DOM)
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#020410'); g.addColorStop(.6,'#0d0830'); g.addColorStop(1,'#1e0f50');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

    // Stars
    if (!this.titleStars) this.titleStars=new StarField(350);
    this.titleStars.draw(ctx,W,H,0,1);

    // Silhouette hills
    ctx.fillStyle='#0b0720';
    ctx.beginPath(); ctx.moveTo(0,H);
    const pts=[0,.08,.18,.3,.4,.52,.62,.74,.84,.92,1];
    const hs =[.76,.62,.66,.57,.72,.60,.65,.61,.73,.66,.76];
    pts.forEach((px,i)=>ctx.lineTo(px*W, hs[i]*H));
    ctx.lineTo(W,H); ctx.fill();

    ctx.fillStyle='#060415';
    ctx.beginPath(); ctx.moveTo(0,H);
    const pts2=[0,.12,.26,.4,.55,.68,.82,.94,1];
    const hs2 =[.85,.79,.83,.81,.79,.84,.81,.82,.85];
    pts2.forEach((px,i)=>ctx.lineTo(px*W, hs2[i]*H));
    ctx.lineTo(W,H); ctx.fill();
  }

  /* ─────────────────────────────────────────────
     LOOP
   ─────────────────────────────────────────────── */
  loop () {
    this.update();
    this.render();
    requestAnimationFrame(()=>this.loop());
  }
}

/* ═══════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════ */
let game;

window.addEventListener('load', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx    = canvas.getContext('2d');

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  game = new Game(canvas, ctx);
  game.loop();
});
