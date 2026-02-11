let music, video;
let fft;
let particles = [];

let videoPlaying = false;
let fade = 0;
let volume = 0.7;
let speed = 1;

function setup() {
  let canvas = createCanvas(windowWidth > 1100 ? 1000 : windowWidth - 40, 450);
  canvas.parent("canvas-holder");

  fft = new p5.FFT();

  for (let i = 0; i < 180; i++) particles.push(new Particle());

  setupControls();
}

function windowResized() {
  resizeCanvas(windowWidth > 1100 ? 1000 : windowWidth - 40, 450);
}

function setupControls() {
  const musicInput = document.getElementById("musicInput");
  const videoInput = document.getElementById("videoInput");

  const volSlider = document.getElementById("volumeSlider");
  const speedSlider = document.getElementById("speedSlider");

  const btns = document.querySelectorAll("button");

  function activate(btn) {
    btns.forEach(b => b.classList.remove("active","wave"));
    btn.classList.add("active","wave");
  }

  musicInput.onchange = e => {
    if (music) music.stop();
    music = loadSound(URL.createObjectURL(e.target.files[0]));
  };

  videoInput.onchange = e => {
    if (video) video.remove();
    video = createVideo(URL.createObjectURL(e.target.files[0]));
    video.hide();
  };

  volSlider.oninput = e => {
    volume = e.target.value;
    if (music) music.setVolume(volume);
  };

  speedSlider.oninput = e => {
    speed = e.target.value;
    if (music) music.rate(speed);
    if (video) video.speed(speed);
  };

  document.getElementById("playMusic").onclick = e => {
    if (music && !music.isPlaying()) {
      music.play();
      music.setVolume(volume);
      music.rate(speed);
      activate(e.target.closest("button"));
    }
  };

  document.getElementById("pauseMusic").onclick = e => {
    if (music && music.isPlaying()) {
      music.pause();
      activate(e.target.closest("button"));
    }
  };

  document.getElementById("loopMusic").onclick = e => {
    if (music) {
      music.setLoop(!music.isLooping());
      activate(e.target.closest("button"));
    }
  };

  document.getElementById("playVideo").onclick = e => {
    if (video) {
      video.loop();
      video.speed(speed);
      videoPlaying = true;
      fade = 0;
      activate(e.target.closest("button"));
    }
  };

  document.getElementById("pauseVideo").onclick = e => {
    if (video) {
      video.pause();
      videoPlaying = false;
      activate(e.target.closest("button"));
    }
  };
}

function draw() {
  background(5, 15, 30);

  if (videoPlaying && video) {
    if (fade < 255) fade += 6;
    tint(255, fade);
    image(video, 0, 0, width, height);
    noTint();
  }

  drawWaveVisualizer();

  particles.forEach(p => p.update());
}

function drawWaveVisualizer() {
  if (!music || !music.isPlaying()) return;

  let wave = fft.waveform();
  stroke(0, 255, 180, 180);
  noFill();
  beginShape();
  for (let i = 0; i < wave.length; i++) {
    let x = map(i, 0, wave.length, 0, width);
    let y = map(wave[i], -1, 1, height - 120, height - 20);
    vertex(x, y);
  }
  endShape();
}

class Particle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(2, 5);
    this.angle = random(TWO_PI);
    this.speed = random(0.5, 1.2);
  }

  update() {
    let waveBoost = music && music.isPlaying() ? 2 : 1;
    this.y -= this.speed * waveBoost;
    this.x += sin(this.angle) * 0.6;

    if (this.y < 0) this.y = height;

    fill(120, 255, 200, 160);
    circle(this.x, this.y, this.size);

    this.angle += 0.02;
  }
}
