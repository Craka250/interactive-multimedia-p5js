let music, video, fft;
let particles=[];
let volume=0.7, speed=1;
let videoPlaying=false;

function showToast(msg){
  const t=document.getElementById("toast");
  t.innerText=msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1800);
}

function getCanvasSize(){
  return {
    w: Math.min(window.innerWidth - 20, 1100),
    h: window.innerHeight * 0.42
  };
}

function setup(){
  let s=getCanvasSize();
  let canvas=createCanvas(s.w,s.h);
  canvas.parent("canvas-holder");

  fft=new p5.FFT();

  for(let i=0;i<180;i++) particles.push(new Particle());

  setupControls();

  document.body.addEventListener("touchstart", unlockAudio, { once:true });
  document.body.addEventListener("click", unlockAudio, { once:true });

  function unlockAudio(){
    getAudioContext().resume();
    showToast("🔓 Audio unlocked — ready!");
  }
}

function windowResized(){
  let s=getCanvasSize();
  resizeCanvas(s.w,s.h);
}

function setupControls(){
  const musicInput=document.getElementById("musicInput");
  const videoInput=document.getElementById("videoInput");

  musicInput.onchange = e => {
    showToast("📂 Selecting audio...");

    setTimeout(() => {
      const file = e.target.files[0];

      if (!file) {
        showToast("⚠ No audio selected");
        return;
      }

      if (music) music.stop();

      music = loadSound(URL.createObjectURL(file), () => {
        music.setVolume(volume);
        music.rate(speed);
        showToast("🎵 Audio Loaded");
      });

    }, 300);
  };

  videoInput.onchange = e => {
    showToast("📂 Selecting video...");

    setTimeout(() => {
      const file = e.target.files[0];

      if (!file) {
        showToast("⚠ No video selected");
        return;
      }

      if (video) video.remove();

      video = createVideo(URL.createObjectURL(file), () => {
        showToast("🎬 Video Loaded");
      });

      video.hide();

    }, 300);
  };

  volumeSlider.oninput=e=>{
    volume=parseFloat(e.target.value);
    if(music) music.setVolume(volume);
  };

  speedSlider.oninput=e=>{
    speed=parseFloat(e.target.value);
    if(music) music.rate(speed);
    if(video) video.speed(speed);
  };

  playMusic.onclick=()=>{
    if(!music) return showToast("⚠ Select Audio First");
    music.play();
    showToast("▶ Music Playing");
  };

  pauseMusic.onclick=()=>{
    if(!music) return showToast("⚠ No Audio Loaded");
    music.pause();
  };

  loopMusic.onclick=()=>{
    if(!music) return showToast("⚠ No Audio Loaded");
    music.setLoop(!music.isLooping());
    showToast("🔁 Loop Toggled");
  };

  playVideo.onclick=()=>{
    if(!video) return showToast("⚠ Select Video First");
    video.loop();
    video.speed(speed);
    videoPlaying=true;
  };

  pauseVideo.onclick=()=>{
    if(video){ video.pause(); videoPlaying=false; }
  };

  fullscreenBtn.onclick=()=> fullscreen(!fullscreen());

  document.querySelectorAll("[data-tip]").forEach(el => {
    el.addEventListener("click", () => {
      showToast(el.getAttribute("data-tip"));
    });
  });
}

function draw(){
  background(5,15,30);

  if(videoPlaying && video) image(video,0,0,width,height);

  drawVisualizer();
  particles.forEach(p=>p.update());
}

function drawVisualizer(){
  if(!music || !music.isPlaying()) return;

  let spectrum = fft.analyze();
  noStroke();

  for (let i=0;i<spectrum.length;i+=10){
    let h = map(spectrum[i],0,255,0,height*0.6);
    fill(255,140,0,160);
    rect(i*2,height-h,8,h,6);
  }
}

class Particle{
  constructor(){
    this.x=random(width);
    this.y=random(height);
    this.s=random(2,5);
    this.sp=random(.6,1.4);
  }
  update(){
    this.y-=this.sp*(music&&music.isPlaying()?2:1);
    if(this.y<0)this.y=height;
    fill(120,255,200,160);
    circle(this.x,this.y,this.s);
  }
}
