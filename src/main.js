if (window.__TAURI__) {
  let {getCurrentWindow, LogicalSize} = window.__TAURI__.window
  getCurrentWindow().setSize(new LogicalSize(640, 480))
}


let canvas = document.getElementById("canvas")
let c = canvas.getContext("2d")

const G = 0.5
const AIR_RES = 0.97
const PLAYER_SPEED = 5
const FRICTION = 0.80
let debug = true
let procs = new ProcManager()
procs.open(new GameProc())
let lastFrameTime = Date.now()
let currentFrameTime = lastFrameTime

function redraw(ts) {
  c.clearRect(0, 0, 640, 480)
  procs.draw()
  requestAnimationFrame(redraw)
}


function update() {
  procs.update()
}

redraw(0)
setInterval(update, 1000/60)
