let music, video;
let fft;
let particles = [];

let videoPlaying = false;

function setup() {
  let canvas = createCanvas(windowWidth > 1100 ? 1000 : windowWidth - 40, 450);
  canvas.parent("canvas-holder");

  fft = new p5.FFT();

  for (let i = 0; i < 150; i++) particles.push(new Particle());

  setupControls();
}

function windowResized() {
  resizeCanvas(windowWidth > 1100 ? 1000 : windowWidth - 40, 450);
}

function setupControls() {
  const musicInput = document.getElementById("musicInput");
  const videoInput = document.getElementById("videoInput");

  musicInput.onchange = e => {
    if (music) music.stop();
    music = loadSound(URL.createObjectURL(e.target.files[0]));
  };

  videoInput.onchange = e => {
    if (video) video.remove();
    video = createVideo(URL.createObjectURL(e.target.files[0]));
    video.hide();
  };

  document.getElementById("playMusic").onclick = () => {
    if (music && !music.isPlaying()) music.play();
  };

  document.getElementById("pauseMusic").onclick = () => {
    if (music && music.isPlaying()) music.pause();
  };

  document.getElementById("loopMusic").onclick = () => {
    if (music) music.setLoop(!music.isLooping());
  };

  document.getElementById("playVideo").onclick = () => {
    if (video) {
      video.loop();
      videoPlaying = true;
    }
  };

  document.getElementById("pauseVideo").onclick = () => {
    if (video) {
      video.pause();
      videoPlaying = false;
    }
  };
}

function draw() {
  background(5, 15, 30);

  if (videoPlaying && video) {
    image(video, 0, 0, width, height);
  }

  drawVisualizer();
  particles.forEach(p => p.update());
}

function drawVisualizer() {
  if (!music) return;

  let spectrum = fft.analyze();
  noStroke();

  for (let i = 0; i < spectrum.length; i += 10) {
    let h = map(spectrum[i], 0, 255, 0, 120);
    fill(34, 197, 94, 160);
    rect(i * 2, height - h, 8, h, 4);
  }
}

class Particle {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(2, 5);
    this.speed = random(0.5, 1.2);
  }

  update() {
    let boost = music && music.isPlaying() ? 2 : 1;
    this.y -= this.speed * boost;

    if (this.y < 0) this.y = height;

    fill(120, 255, 200, 160);
    circle(this.x, this.y, this.size);
  }
}
