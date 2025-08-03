let {getCurrentWindow, LogicalSize} = window.__TAURI__.window
getCurrentWindow().setSize(new LogicalSize(640, 480))

let canvas = document.getElementById("canvas")
let c = canvas.getContext("2d")

const G = 0.5
const AIR_RES = 0.97
const PLAYER_SPEED = 5
const FRICTION = 0.80
let debug = true
let gameOver = false
let entities = []
let frame = 1
let overlay = new Image()
overlay.src = "assets/images/overlay.png"
let overlayBg = new Image()
overlayBg.src = "assets/images/overlay-bg.png"
let lastFrameTime = Date.now()
let currentFrameTime = lastFrameTime
let style = new Bar(100)
style.current = 50

function redraw(ts) {
  c.clearRect(0, 0, 640, 480)
  
  map.draw()
  for (let entity in entities) {
    entities[entity].draw()
  }
  
  let healthRatio = player.health.ratio()
  let red = Math.floor((1 - healthRatio) * 255)
  let green = Math.floor(healthRatio * 255)
  c.drawImage(overlayBg, 0, 0)
  c.fillStyle = `rgb(${red}, ${green}, 0)`
  c.fillRect(290, 418 + (1 - healthRatio) * 44, 60, 44)
  c.fillStyle = "yellow"
  c.fillRect(530, 432, 105 * style.ratio(), 44)
  c.drawImage(overlay, 0, 0)
  player.inventory.draw()
  if (!gameOver) {
    requestAnimationFrame(redraw)
  } else {
    gameOverScreen()
  }
}

let player = new Entity([250, 200], "dobrak")
player.controller = new PlayerController()
player.health = new Bar(180)
player.lifespan = new PlayerLifespan()
player.inventory = new Inventory()
entities.push(player)

function update() {
  currentFrameTime = Date.now()
  let dt = (currentFrameTime - lastFrameTime) 
  lastFrameTime = currentFrameTime
  if (frame % 60 == 0) {
    player.health.add((1 - style.ratio()) * -5)
    style.add(-1)
  }
  for (let entity in entities) {
    entities[entity].update()
  }
  for (let i in entities) {
    let entity = entities[i]
    entity.effect.fix()
    if (entity.remove) {
      entity.onRemove()
    }
  }
  entities = entities.filter(e => !e.remove)
  
  updateInputs()
  frame++
  let now = Date.now()
}

redraw(0)
setInterval(update, 1000/60)

function gameOverScreen() {
  c.fillStyle = "rgba(200, 200, 255, 0.01)"
  c.fillRect(0, 0, 640, 480)

  requestAnimationFrame(gameOverScreen)
}
