let items = {
  "sekacek": {
    "img": "sekacek",
    "joint": [37, 57],
    "cooldown": 250,
    "secondary": function (game, entity, item) {
      
    },
    "primaryRecovery": 60,
    "primary": function (game, entity, item) {
      
    }
  },
  "vidlicka": {
    "img": "vidlicka",
    "joint": [31, 53],
    "cooldown": 750,
    "secondaryRecovery": 20,
    "secondary": function(game, entity, item) {
      let hb = entity.physicalHitbox()
      let itemHb = assetTable.objects.wideswoosh.hitbox
      let swooshX = hb[0] + hb[2] / 2 - (itemHb[2] - itemHb[0]) / 2
      let swooshY = hb[1] + hb[3] - itemHb[3]
      
      let swoosh = new Entity([swooshX, swooshY], "wideswoosh")
      swoosh.lifespan = new TimerLifespan(15)
      swoosh.controller = new AttackController(entity, 5, -7, [entity], -1, new StunEffect([entity.direction * 10, -2], 6))
      let wait = new WaitEffect(swoosh)
      entity.effect.set(wait)
      game.entities.push(swoosh)
      let numBalls = 17
      let angleSpread = Math.PI

      for (let i = 0; i < numBalls; i++) {
        let angle = (i / (numBalls - 1)) * angleSpread - (angleSpread / 2) - Math.PI / 2
        let speed = 8
        let vx = Math.cos(angle) * speed
        let vy = Math.sin(angle) * speed - 3

        let ball = new Entity(entity.position, "fireball")
        ball.controller = new AttackController(entity, 7, 0, [entity], 1)
        ball.velocity = [vx, vy]
        game.entities.push(ball)
      }
    },
    "primaryRecovery": 20,
    "primary": function(game, entity, item) {
      let hb = entity.physicalHitbox()
      let attackHb = assetTable.animations.stab.res
      let stabX = hb[0] + ((entity.direction == 1) ? hb[2] : (-attackHb[1] - hb[2]))
      let stabY = hb[1]

      let stab = new Entity([stabX, stabY], "stab")
      stab.direction = entity.direction
      stab.lifespan = new TimerLifespan(15)
      stab.controller = new AttackController(entity, 9, -10, [entity], -1, new StunEffect([entity.direction * 15, -2], 2))
      let wait = new WaitEffect(stab)
      entity.effect.set(wait)
      game.entities.push(stab)
    }
  },
  "warcrime": {
    "img": "warcrime",
    "joint": [16, 16],
    "primary": function(entity) {
      let hp = entity.health
      hp.current = Math.min(hp.max, hp.current + 25)
      return true
    }
  },
}
let itemKeys = Object.keys(items)

class Inventory {
  constructor() {
    this.slots = [undefined, undefined, undefined],
    this.selected = 0
    this.recovery = 0
  }

  usePrimary(game, entity) {
    if (this.recovery > 0) return
    let item = this.getSelected()
    if (!item || !item.desc.primary) return
    if (item.desc.primaryRecovery) this.addRecovery(item.desc.primaryRecovery)
    
    if (item.desc.primary(game, entity, item)) {
      this.slots[this.selected] = undefined
    }
  }

  useSecondary(game, entity) {
    if (this.recovery > 0) return
    let item = this.getSelected()
    if (!item || !item.desc.secondary) return
    if (item.desc.secondaryRecovery) this.addRecovery(item.desc.secondaryRecovery) 

    let cd = item.cooldown
    if (!cd || cd.useAll()) {
      if (item.desc.secondary(game, entity, item)) {
        this.slots[this.selected] = undefined
      }
    }
  }

  selectRight() {
    this.selected = (this.selected + 1) % 3
  }

  selectLeft() {
    this.selected--
    if (this.selected == -1) this.selected = 2
  }

  getSelected() {
    return this.slots[this.selected]
  }

  addRecovery(value) {
    this.recovery = Math.max(0, this.recovery + value)
  }

  addItem(item) {
    for (let i in this.slots) {
      if (this.slots[i]) continue
      this.slots[i] = item
      return true
    }
    return false
  }

  update() {
    for (let i in this.slots) {
      let item = this.slots[i]
      if (item?.cooldown) {
        let cd = item.cooldown
        cd.current = Math.min(cd.max, cd.current + 1)
      }
    }
    this.recovery = Math.max(0, this.recovery - 1)
  }

  draw() {
    for (let i in this.slots) {
      let item = this.slots[i]
      c.fillStyle = this.selected == i ? "green" : "gray"
      i = +i
      c.fillRect(8 + 33 * i, 436, 32, 32 * ((item?.cooldown) ? (item.cooldown.current / item.cooldown.max) : 1))
      if (!item) continue
      c.drawImage(this.slots[i].img.img, 8 + 33 * i, 436, 32, 32)
    }
  }
}

class InventoryItem {
  constructor(name) {
    this.name = name
    this.desc = items[name]
    let img = this.desc.img
    this.img = assets.images[img]
    let cd = this.desc["cooldown"]
    this.cooldown = cd ? new Bar(cd) : undefined
  }

  draw(parent, flip) {
    let [arm_x, arm_y] = parent.arm
    let [pos_x, pos_y] = parent.position
    let [joint_x, joint_y] = this.desc.joint

    let x = pos_x + arm_x - joint_x
    let y = pos_y + arm_y - joint_y

    let img = this.img.img
    if (flip && this.img.imgFlip) {
      img = this.img.imgFlip
    }
    c.drawImage(img, x>>0, y>>0)
  }
}
