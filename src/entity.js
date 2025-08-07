

class Entity {
  constructor(position, name) {
    this.position = [...position]
    this.velocity = [0, 0]
    this.physical = false
    this.onGround = false
    this.remove = false
    this.unit = false
    this.direction = 1
    this.effect = new Effect()
    this.useAirRes = undefined
    this.lifespan = undefined
    this.health = undefined
    this.controller = undefined
    this.image = undefined
    this.arm = undefined
    this.joint = undefined
    this.hitbox = undefined
    this.gun = undefined
    this.hold = undefined
    this.animation = undefined
    this.inventory = undefined
    let from = assetTable["objects"][name]
    for (let src in from) {
      if (["img", "anim"].includes(src)) continue
      this[src] = from[src]
    }
    if (from["img"]) {
      this.image = assets["images"][from["img"]]
    }
    if (from["anim"]) {
      this.animation = new AnimationInstance(from["anim"])
    }
  }

  physicalHitbox() {
    let [posX, posY] = this.position
    let [hbLeft, hbTop, hbRight, hbBot] = this.hitbox

    let hbX = posX + hbLeft
    let hbY = posY + hbTop
    let hbWidth = hbRight - hbLeft
    let hbHeight = hbBot - hbTop
    return [hbX, hbY, hbWidth, hbHeight]
  }

  draw() {
    let pos_x = this.position[0]>>0
    let pos_y = this.position[1]>>0
    let flip = this.direction < 0
    if (this.image) {
      let img = this.image.img
      if (flip && this.image.imgFlip) {
        img = this.image.imgFlip
      }
      c.drawImage(img, pos_x, pos_y)
      if (debug) {
        c.strokeStyle = "red"
        c.strokeRect(pos_x, pos_y, this.image.resolution[0], this.image.resolution[1])
      }
    }
    if (this.animation) {
      let frame = this.animation.getFrame(false, flip)
      c.drawImage(frame, pos_x, pos_y)
      if (debug) {
        c.strokeStyle = "red"
        c.strokeRect(pos_x, pos_y, this.animation.desc.resolution[0], this.animation.desc.resolution[1])
      }
    }
    if (this.hitbox && debug) {
      c.strokeStyle = "green"
      let pos = this.position
      let box = this.hitbox
      c.strokeRect(pos[0] + box[0], pos[1] + box[1], box[2] - box[0], box[3] - box[1])
    }
    if (this.inventory) {
      this.inventory.getSelected()?.draw(this, flip)
    }
  }

  update(game) {
    if (this.lifespan?.update(this)) {
      this.remove = true
      return
    }
    if (this.effect.current) {
      this.effect.update(game, this)
    } else {
      this.controller?.update(game, this)
    }
    this.inventory?.update(this)
    if (!this.physical) return

    this.velocity[1] += G

    let left = this.position[0] + this.hitbox[0]
    let leftNow = (left / 32) >> 0
    let leftNext = ((left + this.velocity[0]) / 32) >> 0
    let right = this.position[0] + this.hitbox[2]
    let rightNow = (right / 32) >> 0
    let rightNext = ((right + this.velocity[0]) / 32) >> 0

    let top = this.position[1] + this.hitbox[1]
    let topNow = (top / 32) >> 0
    let topNext = ((top + this.velocity[1]) / 32) >> 0
    let bot = this.position[1] + this.hitbox[3]
    let botNow = (bot / 32) >> 0
    let botNext = ((bot + this.velocity[1]) / 32) >> 0

    let positionFix = [...this.position]
    let inBounds = leftNext > -1 && rightNext < 20 && topNext > -1 && botNext < 15

    if (leftNow > leftNext && inBounds) {
      for (let y = topNow; y <= botNow; y++) {
        if (map.tyles[leftNext][y]?.wall) {
          this.velocity[0] = 0
          // positionFix[0] = leftNow * 32 - this.hitbox[0]
          break
        }
      }
    }
    
    if (rightNow < rightNext && inBounds) {
      for (let y = topNow; y <= botNow; y++) {
        if (map.tyles[rightNext][y]?.wall) {
          this.velocity[0] = 0
          // positionFix[0] = rightNext * 32 - this.hitbox[2]
          break
        }
      }
    }

    if (topNow > topNext && inBounds) {
      for (let x = leftNow; x <= rightNow; x++) {
        if (map.tyles[x][topNext]?.wall) {
          this.velocity[1] = 0
          // positionFix[1] = topNow * 32 - this.hitbox[1]
          break
        }
      }
    }

    this.onGround = false
    if (botNow < botNext && inBounds) {
      for (let x = leftNow; x <= rightNow; x++) {
        if (map.tyles[x][botNext]?.wall) {
          this.velocity[1] = 0
          // positionFix[1] = botNext * 32 - this.hitbox[3]
          this.onGround = true
          break
        }
      }
    }
    this.position[0] = positionFix[0]
    this.position[1] = positionFix[1]

    this.position[0] += this.velocity[0]
    this.position[1] += this.velocity[1]

    this.velocity[1] *= AIR_RES
    this.velocity[0] *= this.useAirRes ? AIR_RES : FRICTION 

    let v = this.velocity[0]
    if (Math.abs(v) > 0.3) {
      this.direction = Math.sign(v)
    }
  }

  onRemove(game) {
    this.lifespan?.remove(game, this)
  }
}

class Bar {
  constructor(value) {
    this.current = value
    this.max = value
  }

  ratio() {
    return this.current / this.max
  }

  add(value) {
    this.current = Math.max(0, Math.min(this.max, this.current + value))
  }

  useAll() {
    if (this.current == this.max) {
      this.current = 0
      return true
    }
    return false
  }

  takeDmg(value) {
    this.current = Math.max(0, this.current - value)
    return this.current == 0
  }
}

class TimerLifespan {
  constructor(time) {
    this.current = time
    this.max = time
  }

  update(entity) {
    this.current--
    return this.current == 0
  }

  remove(game, entity) {
    
  }
}

class PlayerLifespan {
  constructor() {
    
  }

  update(entity) {
    
  }

  remove(game, entity) {
    game.gameOver = true
  }
}

class Effect {
  constructor() {
    this.scheduled = undefined
    this.current = undefined
  }

  update(entity) {
    if (this.current?.update(entity)) {
      this.current = undefined
    }
  }

  fix() {
    if (this.scheduled) {
      this.current = this.scheduled
      this.scheduled = undefined
    }
  }

  set(effect) {
    this.scheduled = effect
  }

  get() {
    return this.scheduled
  }
}
