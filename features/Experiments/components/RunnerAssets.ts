export interface GameAssets {
  kitsune: HTMLCanvasElement;
  torii: HTMLCanvasElement;
  tengu: HTMLCanvasElement;
  lantern: HTMLCanvasElement;
  fuji: HTMLCanvasElement;
  daruma: HTMLCanvasElement;
  cloud: HTMLCanvasElement;
  mountains: HTMLCanvasElement;
  oni: HTMLCanvasElement;
  kasaObake: HTMLCanvasElement;
  pagoda: HTMLCanvasElement;
  chochinObake: HTMLCanvasElement;
}

const createCanvas = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const generateAssets = (): GameAssets => {
  // 1. Kitsune (Player) - 60x60
  const kitsune = createCanvas(60, 60);
  const kCtx = kitsune.getContext('2d')!;

  // Body (White spiritual flame-like shape)
  // REMOVED: kCtx.shadowColor/Blur (No aura)
  kCtx.fillStyle = '#ffffff';

  kCtx.beginPath();
  kCtx.moveTo(15, 40);
  kCtx.bezierCurveTo(15, 20, 30, 10, 45, 25); // Head/Back
  kCtx.bezierCurveTo(55, 35, 55, 50, 40, 50); // Rear
  kCtx.quadraticCurveTo(30, 55, 15, 40); // Underbelly
  kCtx.fill();

  // Head
  kCtx.beginPath();
  kCtx.ellipse(45, 25, 12, 10, -0.2, 0, Math.PI * 2);
  kCtx.fill();

  // Ears
  kCtx.fillStyle = '#fff';
  kCtx.beginPath();
  kCtx.moveTo(40, 15);
  kCtx.lineTo(45, 5);
  kCtx.lineTo(50, 18);
  kCtx.fill();

  // Red Markings (Face)
  kCtx.fillStyle = '#ff0000';
  kCtx.beginPath();
  kCtx.moveTo(45, 18); // Forehead
  kCtx.lineTo(48, 22);
  kCtx.lineTo(42, 22);
  kCtx.fill();

  // Eye
  kCtx.fillStyle = '#000';
  kCtx.beginPath();
  kCtx.arc(48, 24, 1.5, 0, Math.PI * 2);
  kCtx.fill();

  // Tails (Multiple)
  kCtx.fillStyle = '#fff';
  // REMOVED: Shadow on tails
  for (let i = 0; i < 3; i++) {
    kCtx.beginPath();
    kCtx.moveTo(15, 35);
    kCtx.bezierCurveTo(5 - i * 5, 35 - i * 5, 0 - i * 5, 15 + i * 5, 15, 25);
    kCtx.fill();
  }

  // 2. Torii (Obstacle) - 100x120
  const torii = createCanvas(100, 120);
  const tCtx = torii.getContext('2d')!;

  // Colors
  const vermilion = '#e62e00';
  const black = '#1a1a1a';

  // Shadow
  tCtx.shadowColor = 'rgba(0,0,0,0.3)';
  tCtx.shadowBlur = 4;
  tCtx.shadowOffsetY = 2;

  // Posts (Hashira)
  tCtx.fillStyle = vermilion;
  const drawPost = (x: number) => {
    tCtx.beginPath();
    tCtx.moveTo(x, 120);
    tCtx.lineTo(x + 2, 20); // Slight taper
    tCtx.lineTo(x + 12, 20);
    tCtx.lineTo(x + 14, 120);
    tCtx.fill();
    // Black base
    tCtx.fillStyle = black;
    tCtx.fillRect(x - 2, 110, 18, 10);
    tCtx.fillStyle = vermilion;
  };
  drawPost(20);
  drawPost(66);

  // Nuki (Lower lintel)
  tCtx.fillRect(15, 45, 70, 8);

  // Shimaki (Upper lintel core)
  tCtx.beginPath();
  tCtx.moveTo(10, 25);
  tCtx.lineTo(90, 25);
  tCtx.lineTo(90, 15);
  tCtx.lineTo(10, 15);
  tCtx.fill();

  // Kasagi (Topmost lintel, curved)
  tCtx.fillStyle = black;
  tCtx.beginPath();
  tCtx.moveTo(0, 15);
  tCtx.quadraticCurveTo(50, 5, 100, 15); // Upward curve
  tCtx.lineTo(102, 5);
  tCtx.quadraticCurveTo(50, -5, -2, 5);
  tCtx.fill();

  // Gaku (Plaque)
  tCtx.fillStyle = black;
  tCtx.fillRect(45, 20, 10, 15);
  tCtx.fillStyle = '#bf9000'; // Gold text hint
  tCtx.fillRect(47, 23, 6, 9);

  // 3. Tengu (Obstacle) - 60x60
  const tengu = createCanvas(60, 60);
  const tgCtx = tengu.getContext('2d')!;

  // Face
  tgCtx.shadowColor = 'rgba(0,0,0,0.5)';
  tgCtx.shadowBlur = 5;
  tgCtx.fillStyle = '#cc0000'; // Red
  tgCtx.beginPath();
  tgCtx.arc(30, 30, 20, 0, Math.PI * 2);
  tgCtx.fill();

  // Nose (Long!)
  tgCtx.fillStyle = '#ff4d4d'; // Lighter red
  tgCtx.beginPath();
  tgCtx.moveTo(35, 30);
  tgCtx.lineTo(55, 35); // Long point
  tgCtx.lineTo(35, 40);
  tgCtx.fill();

  // Eyebrows (Angry)
  tgCtx.strokeStyle = '#000';
  tgCtx.lineWidth = 3;
  tgCtx.beginPath();
  tgCtx.moveTo(20, 25);
  tgCtx.lineTo(30, 28);
  tgCtx.moveTo(40, 25);
  tgCtx.lineTo(30, 28);
  tgCtx.stroke();

  // Eyes
  tgCtx.fillStyle = '#fff';
  tgCtx.beginPath();
  tgCtx.arc(22, 30, 4, 0, Math.PI * 2);
  tgCtx.arc(38, 30, 4, 0, Math.PI * 2);
  tgCtx.fill();
  tgCtx.fillStyle = '#000';
  tgCtx.beginPath();
  tgCtx.arc(22, 30, 1, 0, Math.PI * 2);
  tgCtx.arc(38, 30, 1, 0, Math.PI * 2);
  tgCtx.fill();

  // 4. Lantern (Decor) - Reference for style
  const lantern = createCanvas(40, 60);
  const lCtx = lantern.getContext('2d')!;
  lCtx.fillStyle = '#777';
  // Base
  lCtx.fillRect(10, 50, 20, 10);
  // Post
  lCtx.fillRect(15, 30, 10, 20);
  // Light box
  lCtx.fillStyle = '#999';
  lCtx.fillRect(5, 15, 30, 15);
  // Window (Glow)
  lCtx.fillStyle = '#ffaa00';
  lCtx.shadowColor = '#ffaa00';
  lCtx.shadowBlur = 10;
  lCtx.fillRect(12, 18, 16, 9);
  // Roof
  lCtx.shadowBlur = 0;
  lCtx.fillStyle = '#555';
  lCtx.beginPath();
  lCtx.moveTo(0, 15);
  lCtx.lineTo(20, 0);
  lCtx.lineTo(40, 15);
  lCtx.fill();

  // 5. Mt Fuji (Background) - 800x400 (Larger, more detail)
  const fuji = createCanvas(800, 400);
  const fCtx = fuji.getContext('2d')!;

  // Mountain Body - More realistic colors
  const fGradient = fCtx.createLinearGradient(0, 0, 0, 400);
  fGradient.addColorStop(0.2, '#ffffff'); // Snow
  fGradient.addColorStop(0.4, '#a5b4fc'); // Haze blue
  fGradient.addColorStop(1, '#6366f1'); // Deep Indigo

  fCtx.fillStyle = fGradient;
  fCtx.beginPath();
  // Classic Fuji Shape: Concave slopes
  fCtx.moveTo(400, 50); // Peak
  fCtx.bezierCurveTo(550, 150, 650, 350, 750, 400); // Right slope (concave)
  fCtx.lineTo(50, 400); // Base Left
  fCtx.bezierCurveTo(150, 350, 250, 150, 400, 50); // Left slope (concave)
  fCtx.fill();

  // Snow Cap (More distinct zigzag)
  fCtx.fillStyle = '#fff';
  fCtx.beginPath();
  fCtx.moveTo(400, 50); // Peak
  // Right side zigzag down
  const rX = 400;
  const rY = 50;
  // Approximating slope points for zigzags
  fCtx.lineTo(430, 100);
  fCtx.lineTo(410, 110);
  fCtx.lineTo(440, 130);
  fCtx.lineTo(420, 140);
  fCtx.lineTo(450, 160);
  // Cut across
  fCtx.lineTo(350, 160);
  // Left side zigzag up
  fCtx.lineTo(380, 140);
  fCtx.lineTo(360, 130);
  fCtx.lineTo(390, 110);
  fCtx.lineTo(370, 100);
  fCtx.closePath();
  fCtx.fill();

  // 6. Daruma (Obstacle)
  const daruma = createCanvas(40, 40);
  const dCtx = daruma.getContext('2d')!;
  dCtx.shadowColor = 'rgba(0,0,0,0.3)';
  dCtx.shadowBlur = 4;
  dCtx.fillStyle = '#cc0000';
  dCtx.beginPath();
  dCtx.arc(20, 22, 18, 0, Math.PI * 2);
  dCtx.fill();
  dCtx.shadowBlur = 0;
  dCtx.fillStyle = '#fff';
  dCtx.beginPath();
  dCtx.ellipse(20, 20, 12, 10, 0, 0, Math.PI * 2);
  dCtx.fill();
  dCtx.fillStyle = '#000';
  dCtx.beginPath();
  dCtx.arc(16, 18, 2, 0, Math.PI * 2);
  dCtx.arc(24, 18, 2, 0, Math.PI * 2);
  dCtx.fill();
  dCtx.strokeStyle = '#000';
  dCtx.lineWidth = 1;
  dCtx.beginPath();
  dCtx.moveTo(12, 22);
  dCtx.quadraticCurveTo(20, 28, 28, 22);
  dCtx.stroke();
  dCtx.strokeStyle = '#ffd700';
  dCtx.lineWidth = 2;
  dCtx.beginPath();
  dCtx.arc(20, 22, 14, 0, Math.PI * 2);
  dCtx.stroke();

  // 7. Cloud (Background)
  const cloud = createCanvas(120, 60);
  const cCtx = cloud.getContext('2d')!;
  cCtx.fillStyle = '#ffffff';
  cCtx.shadowColor = 'rgba(255,255,255,0.8)';
  cCtx.shadowBlur = 10;
  const drawPuff = (x: number, y: number, r: number) => {
    cCtx.beginPath();
    cCtx.arc(x, y, r, 0, Math.PI * 2);
    cCtx.fill();
  };
  drawPuff(30, 30, 20);
  drawPuff(60, 25, 25);
  drawPuff(90, 30, 20);
  drawPuff(60, 40, 15);

  // 8. Mountains (Seamless background)
  const mountains = createCanvas(1600, 200);
  const mCtx = mountains.getContext('2d')!;
  mCtx.fillStyle = '#cbd5e1';
  mCtx.beginPath();
  mCtx.moveTo(0, 200);
  for (let x = 0; x <= 1600; x += 50) {
    const angle = (x / 1600) * Math.PI * 2;
    const yStrc = Math.sin(angle * 3) * 30 + Math.cos(angle * 5) * 20;
    mCtx.lineTo(x, 200 - 60 - yStrc);
  }
  mCtx.lineTo(1600, 200);
  mCtx.fill();
  mCtx.fillStyle = '#94a3b8';
  mCtx.beginPath();
  mCtx.moveTo(0, 200);
  for (let x = 0; x <= 1600; x += 80) {
    const angle = (x / 1600) * Math.PI * 2;
    const yStrc = Math.abs(Math.sin(angle * 5)) * 50;
    mCtx.lineTo(x, 200 - 40 - yStrc);
  }
  mCtx.lineTo(1600, 200);
  mCtx.fill();

  // 9. Oni (Demon Mask) - 50x50
  const oni = createCanvas(50, 50);
  const oCtx = oni.getContext('2d')!;

  // Face
  oCtx.fillStyle = '#7f1d1d'; // Dark Red
  oCtx.beginPath();
  oCtx.moveTo(10, 10);
  oCtx.quadraticCurveTo(25, 50, 40, 10); // Jaw
  oCtx.quadraticCurveTo(25, -10, 10, 10); // Forehead
  oCtx.fill();

  // Horns
  oCtx.fillStyle = '#fcd34d'; // Gold/Bone
  oCtx.beginPath();
  oCtx.moveTo(12, 10);
  oCtx.lineTo(5, -5);
  oCtx.lineTo(18, 8); // Left
  oCtx.moveTo(38, 10);
  oCtx.lineTo(45, -5);
  oCtx.lineTo(32, 8); // Right
  oCtx.fill();

  // Eyes (Surprisngly glowy)
  oCtx.fillStyle = '#ffff00';
  oCtx.beginPath();
  oCtx.arc(18, 15, 3, 0, Math.PI * 2);
  oCtx.arc(32, 15, 3, 0, Math.PI * 2);
  oCtx.fill();

  // Teeth
  oCtx.fillStyle = '#fff';
  oCtx.beginPath();
  oCtx.moveTo(20, 30);
  oCtx.lineTo(22, 35);
  oCtx.lineTo(24, 30);
  oCtx.moveTo(26, 30);
  oCtx.lineTo(28, 35);
  oCtx.lineTo(30, 30);
  oCtx.fill();

  // 10. Kasa-Obake (Umbrella Ghost) - 40x70
  const kasaObake = createCanvas(50, 70);
  const kaCtx = kasaObake.getContext('2d')!;

  // Umbrella Body (Triangle)
  kaCtx.fillStyle = '#6d28d9'; // Purple
  kaCtx.beginPath();
  kaCtx.moveTo(25, 5);
  kaCtx.lineTo(5, 45);
  kaCtx.lineTo(45, 45);
  kaCtx.fill();

  // Ribs
  kaCtx.strokeStyle = '#ddd';
  kaCtx.lineWidth = 1;
  kaCtx.beginPath();
  kaCtx.moveTo(25, 5);
  kaCtx.lineTo(15, 45);
  kaCtx.moveTo(25, 5);
  kaCtx.lineTo(35, 45);
  kaCtx.stroke();

  // Single Eye
  kaCtx.fillStyle = '#fff';
  kaCtx.beginPath();
  kaCtx.arc(25, 25, 8, 0, Math.PI * 2);
  kaCtx.fill();
  kaCtx.fillStyle = '#000';
  kaCtx.beginPath();
  kaCtx.arc(25, 25, 3, 0, Math.PI * 2);
  kaCtx.fill();

  // Tongue
  kaCtx.fillStyle = '#ec4899';
  kaCtx.beginPath();
  kaCtx.moveTo(20, 35);
  kaCtx.quadraticCurveTo(25, 50, 35, 35);
  kaCtx.fill();

  // Leg
  kaCtx.strokeStyle = '#fbbf24';
  kaCtx.lineWidth = 3;
  kaCtx.beginPath();
  kaCtx.moveTo(25, 45);
  kaCtx.lineTo(25, 60);
  kaCtx.lineTo(30, 60); // Foot
  kaCtx.stroke();
  // Geta (Shoe)
  kaCtx.fillStyle = '#78350f';
  kaCtx.fillRect(25, 60, 10, 5);

  // 11. Pagoda (Background Element) - 100x200
  const pagoda = createCanvas(100, 200);
  const pCtx = pagoda.getContext('2d')!;

  pCtx.fillStyle = '#1e1b4b'; // Dark silhouette blue

  const drawRoof = (y: number, w: number) => {
    pCtx.beginPath();
    pCtx.moveTo(50 - w / 2, y);
    pCtx.quadraticCurveTo(50, y - 10, 50 + w / 2, y); // Curve up
    pCtx.lineTo(50 + w / 2 + 5, y + 5);
    pCtx.lineTo(50 - w / 2 - 5, y + 5);
    pCtx.fill();
  };

  // Spire
  pCtx.fillRect(48, 5, 4, 30);

  // Roofs (5 stories)
  for (let i = 0; i < 5; i++) {
    drawRoof(40 + i * 30, 30 + i * 10);
    // Body
    if (i < 4) pCtx.fillRect(40, 45 + i * 30, 20, 25);
  }

  // 12. Chochin Obake (Lantern Ghost) - 40x60
  const chochinObake = createCanvas(50, 70);
  const chCtx = chochinObake.getContext('2d')!;

  // Paper body
  chCtx.fillStyle = '#f59e0b'; // Amber paper
  chCtx.shadowColor = '#f59e0b';
  chCtx.shadowBlur = 10;
  chCtx.fillRect(10, 10, 30, 40);

  // Ribs
  chCtx.shadowBlur = 0;
  chCtx.strokeStyle = '#92400e';
  chCtx.beginPath();
  chCtx.moveTo(10, 20);
  chCtx.lineTo(40, 20);
  chCtx.moveTo(10, 30);
  chCtx.lineTo(40, 30);
  chCtx.moveTo(10, 40);
  chCtx.lineTo(40, 40);
  chCtx.stroke();

  // Eye (Single big eye)
  chCtx.fillStyle = '#fff';
  chCtx.beginPath();
  chCtx.arc(25, 25, 8, 0, Math.PI * 2);
  chCtx.fill();
  chCtx.fillStyle = '#000';
  chCtx.beginPath();
  chCtx.arc(25, 25, 3, 0, Math.PI * 2);
  chCtx.fill();

  // Tongue (Licking)
  chCtx.fillStyle = '#db2777';
  chCtx.beginPath();
  chCtx.moveTo(20, 45);
  chCtx.quadraticCurveTo(25, 60, 35, 45);
  chCtx.fill();

  // Top/Bottom caps
  chCtx.fillStyle = '#1f2937';
  chCtx.fillRect(8, 5, 34, 5); // Top
  chCtx.fillRect(8, 50, 34, 5); // Bottom

  return {
    kitsune,
    torii,
    tengu,
    lantern,
    fuji,
    daruma,
    cloud,
    mountains,
    oni,
    kasaObake,
    pagoda,
    chochinObake,
  };
};
