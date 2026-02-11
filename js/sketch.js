let lastWidth = window.innerWidth;
let music, video;
let fft;
let particles = [];

let videoPlaying = false;
let fade = 0;
let volume = 0.7;
let speed = 1;
let loopEnabled = false;

function getCanvasSize() {
  if (windowWidth < 500) {
    return { w: windowWidth - 20, h: 280 };
  } else if (windowWidth < 900) {
    return { w: windowWidth - 40, h: 350 };
  } else {
    return { w: 1000, h: 450 };
  }
}

function setup() {
  let size = getCanvasSize();
  let canvas = createCanvas(size.w, size.h);
  canvas.parent("canvas-holder");

  fft = new p5.FFT();

  for (let i = 0; i < 160; i++) particles.push(new Particle());

  setupControls();

  canvas.doubleClicked(() => fullscreen(!fullscreen()));
}

function windowResized() {
  if (Math.abs(window.innerWidth - lastWidth) > 80) {
    lastWidth = window.innerWidth;
    let size = getCanvasSize();
    resizeCanvas(size.w, size.h);
  }
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
    music = loadSound(URL.createObjectURL(e.target.files[0]), () => {
      music.setVolume(volume);
      music.rate(speed);
      music.setLoop(loopEnabled);
    });
  };

  videoInput.onchange = e => {
    if (video) video.remove();
    video = createVideo(URL.createObjectURL(e.target.files[0]));
    video.hide();
  };

  volSlider.oninput = e => {
    volume = parseFloat(e.target.value);
    if (music) music.setVolume(volume);
  };

  speedSlider.oninput = e => {
    speed = parseFloat(e.target.value);
    if (music) music.rate(speed);
    if (video) video.speed(speed);
  };

  document.getElementById("playMusic").onclick = e => {
    if (music) {
      if (!music.isPlaying()) music.play();
      music.setVolume(volume);
      music.rate(speed);
      music.setLoop(loopEnabled);
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
      loopEnabled = !loopEnabled;
      music.setLoop(loopEnabled);
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

  document.getElementById("fullscreenBtn").onclick = e => {
    fullscreen(!fullscreen());
    activate(e.target.closest("button"));
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

  drawVisualizer();

  particles.forEach(p => p.update());
}

function drawVisualizer() {
  if (!music || !music.isPlaying()) return;

  let spectrum = fft.analyze();
  noStroke();

  for (let i = 0; i < spectrum.length; i += 10) {
    let h = map(spectrum[i], 0, 255, 0, 140);
    fill(255, 140, 0, 160);
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
