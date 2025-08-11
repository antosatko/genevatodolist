if (window.__TAURI__) {
  let { getCurrentWindow, LogicalSize } = window.__TAURI__.window;
  getCurrentWindow().setSize(new LogicalSize(640, 480));
}

(async function loadFont() {
  let font = new FontFace(
    "default-ui",
    "url(assets/fonts/Tiny5/Tiny5-Regular.ttf)",
    {},
  );

  await font.load();
  document.fonts.add(font);
})();

let canvas = document.getElementById("canvas");
let c = canvas.getContext("2d");

const G = 0.5;
const AIR_RES = 0.97;
const FRICTION = 0.8;
let debug = true;
let frame = 0;
let freezeFrames = 0;
let procs = new ProcManager();
procs.open(new GameProc());
let lastFrameTime = Date.now();
let currentFrameTime = lastFrameTime;

function redraw(ts) {
  c.clearRect(0, 0, 640, 480);
  procs.draw();
  requestAnimationFrame(redraw);
}

function update() {
  if (freezeFrames-- > 0) return;
  procs.update();
  frame++;
}

redraw(0);
setInterval(update, 1000 / 60);
