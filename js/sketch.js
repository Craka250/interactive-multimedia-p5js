let music, video1, video2;
let fft;
let leaves = [];
let birds = [];
let particles = [];
let leafImg, birdImg;

let videoPlaying = false;
let fade = 0;

function preload() {
  music = loadSound("assets/playlistsons-the-magic-forest-340326.mp3");
  video1 = createVideo(["assets/305657_small.mp4"]);
  video2 = createVideo(["assets/174860-852215326_small.mp4"]);

  leafImg = loadImage("assets/kriemer-fall-7562668_1280.jpg");
  birdImg = loadImage("assets/phgvu307-autumn-7493439_1280.jpg");
}

function setup() {
  let canvas = createCanvas(1000, 500);
  canvas.parent("canvas-holder");

  video1.hide();
  video2.hide();

  fft = new p5.FFT();

  for (let i = 0; i < 25; i++) leaves.push(new Leaf());
  for (let i = 0; i < 6; i++) birds.push(new Bird());
  for (let i = 0; i < 120; i++) particles.push(new Particle());

  setupControls();
}

function setupControls() {
  const btns = document.querySelectorAll("button");

  function activate(btn) {
    btns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  }

  document.getElementById("playMusic").onclick = e => {
    music.loop();
    activate(e.target);
  };

  document.getElementById("pauseMusic").onclick = e => {
    music.pause();
    activate(e.target);
  };

  document.getElementById("loopMusic").onclick = e => {
    music.loop();
    activate(e.target);
  };

  document.getElementById("playVideo").onclick = e => {
    video1.loop();
    video2.loop();
    videoPlaying = true;
    fade = 0;
    activate(e.target);
  };

  document.getElementById("pauseVideo").onclick = e => {
    video1.pause();
    video2.pause();
    videoPlaying = false;
    activate(e.target);
  };
}

function draw() {
  background(8, 16, 32);

  drawVideos();
  drawVisualizer();
  drawRipples();

  particles.forEach(p => p.update());
  leaves.forEach(l => l.update());
  birds.forEach(b => b.update());
}

function drawVideos() {
  if (videoPlaying && fade < 255) fade += 5;

  if (videoPlaying) {
    tint(255, fade);
    image(video1, 20, 20, 420, 230);
    image(video2, width - 440, 20, 420, 230);
    noTint();
  }
}

function drawVisualizer() {
  let spectrum = fft.analyze();
  noStroke();

  for (let i = 0; i < spectrum.length; i += 10) {
    let h = map(spectrum[i], 0, 255, 0, 120);
    fill(0, 255, 150, 150);
    rect(i * 2, height - h, 8, h, 4);
  }
}

function drawRipples() {
  stroke(0, 255, 200, 120);
  noFill();
  for (let i = 0; i < 6; i++) {
    ellipse(width / 2, height / 2 + 100, frameCount % 200 + i * 40);
  }
}

/* ============ OBJECT CLASSES ============ */

class Particle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(2, 6);
    this.speed = random(0.5, 1.5);
  }
  update() {
    let boost = music.isPlaying() ? 2 : 1;
    this.y -= this.speed * boost;
    if (this.y < 0) this.y = height;
    fill(34, 197, 94, 180);
    circle(this.x, this.y, this.size);
  }
}

class Leaf {
  constructor() {
    this.x = random(width);
    this.y = random(-height, 0);
    this.speed = random(0.5, 2);
    this.size = random(20, 40);
  }
  update() {
    this.y += this.speed;
    this.x += sin(frameCount * 0.01) * 1.5;
    image(leafImg, this.x, this.y, this.size, this.size);
    if (this.y > height) this.y = random(-200, 0);
  }
}

class Bird {
  constructor() {
    this.x = random(-200, 0);
    this.y = random(100, 250);
    this.speed = random(1.5, 3);
  }
  update() {
    this.x += this.speed;
    image(birdImg, this.x, this.y, 60, 40);
    if (this.x > width + 100) this.x = random(-300, 0);
  }
}
