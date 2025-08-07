class ProcManager {
  constructor() {
    this.current = undefined
    this.next = undefined
    this.frame = 1
  }

  open(proc) {
    // if (proc == this.current) return
    this.next = proc
    this.frame = 1
  }

  update() {
    if (this.next) {
      this.current?.close()
      this.current = this.next
      this.next = undefined
      this.current.open()
    }

    this.current?.update(this.frame)
    updateInputs()
    this.frame++
  }

  draw() {
    this.current?.draw()
  }
}

class GameProc {
  constructor() {
    this.open()
  }

  update(frame) {
    if (frame % 60 == 0) {
      this.player.health.add((1 - this.style.ratio()) * -5)
      this.style.add(-1)
    }
    for (let i in this.entities) {
      this.entities[i].update(this)
    }
    for (let i in this.entities) {
      let entity = this.entities[i]
      entity.effect.fix()
      if (entity.remove) {
        entity.onRemove(this)
      }
    }
    this.entities = this.entities.filter(e => !e.remove)
  
  }

  draw() {
    map.draw()
    for (let i in this.entities) {
      this.entities[i].draw()
    }
    let healthRatio = this.player.health.ratio()
    let green = Math.floor(healthRatio * 255)
    let red = Math.floor(255 - healthRatio * 255)
    c.drawImage(this.overlayBg, 0, 0)
    c.fillStyle = `rgb(${red}, ${green}, 0)`
    c.fillRect(290, 418 + (1 - healthRatio) * 44, 60, 44)
    c.fillStyle = "yellow"
    c.fillRect(530, 432, 105 * this.style.ratio(), 44)
    c.drawImage(this.overlayFg, 0, 0)
    this.player.inventory.draw()
  }

  open() {
    this.gameOver = false
    this.entities = []
    this.style = new Bar(100)
    this.style.current = 50
  
    this.player = new Entity([250, 200], "dobrak")
    this.player.controller = new PlayerController()
    this.player.health = new Bar(180)
    this.player.lifespan = new PlayerLifespan()
    this.player.inventory = new Inventory()
    this.entities.push(this.player)
    
    this.overlayFg = new Image()
    this.overlayFg.src = "assets/images/overlay.png"
    this.overlayBg = new Image()
    this.overlayBg.src = "assets/images/overlay-bg.png"
  }

  close() {
    
  }
}
