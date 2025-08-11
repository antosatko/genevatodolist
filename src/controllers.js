class PlayerController {
  constructor() { }

  update(game, entity) {
    let speed = (keys["sprint"] > 0) ? 5 : 3
    let left = keys["left"]
    let right = keys["right"]
    let aim = 0
    if (left > 0 && right < 1) {
      entity.velocity[0] = -speed
    }
    if (right > 0 && left < 1) {
      entity.velocity[0] = speed
    }
    if (keys["up"] > 0) {
      aim--
    }
    if (keys["down"] > 0) {
      aim++
    }
    entity.aim = aim
    if (keys["jump"] > 0 && entity.onGround) {
      entity.velocity[1] = -14
    }
    if (keys["usePrimary"] == 1) {
      entity.inventory.usePrimary(game, entity)
    }
    if (keys["useSecondary"] == 1) {
      entity.inventory.useSecondary(game, entity)
    }
    if (entity.position[1] > 480 || entity.health.current <= 0) {
      entity.remove = true
    }
    this.updateInventory(entity)
  }

  updateInventory(entity) {
    if (keys["swapLeft"] == 1) {
      entity.inventory.selectLeft()
    }
    if (keys["swapRight"] == 1) {
      entity.inventory.selectRight()
    }
    if (keys["select1"] == 1) {
      entity.inventory.selected.current = 0
    }
    if (keys["select2"] == 1) {
      entity.inventory.selected.current = 1
    }
    if (keys["select3"] == 1) {
      entity.inventory.selected.current = 2
    }
  }
}

class AIController {
  constructor() {
    this.signal = 0
    this.direction = -1
  }

  update(game, entity) {
    if (entity.onGround && Math.random() < 0.01) {
      entity.velocity[1] = -15
    }
    if (this.signal == -45) {
      this.signal = (Math.random() * 40 + 20)>>0
      this.direction = Math.random() * 3 - 1.5
    }
    if (this.signal > 0) {
      entity.velocity[0] = this.direction * 2
    }
    if (Math.random() < 0.01) {
      entity.inventory.usePrimary(game, entity)
    }
    if (Math.random() < 0.005) {
      entity.inventory.useSecondary(game, entity)
    }
    if (entity.position[1] > 480 || entity.health.current <= 0) {
      entity.remove = true
    }
    this.signal -= 1
  }
}

class PortalController {
  constructor(budget) {
    this.frame = 0
    this.budget = budget
  }

  update(game, entity) {
    if (frame % 35 != 0) return
    this.budget--
    let budgetMax = Math.min(this.budget, 3)
    let unitBudget = (Math.random() * budgetMax)>>0
    this.budget -= unitBudget

    let spawn = new Entity(entity.position, (Math.random() > 0.2) ? "robotek" : "robot")
    spawn.controller = new AIController()
    spawn.health = new Bar(20)
    spawn.inventory = new Inventory()
    for (let i = 0; i < unitBudget; i++) {
      let item = new InventoryItem(itemKeys[(Math.random() * itemKeys.length)>>0])
      spawn.inventory.addItem(item)
    }
    game.entities.push(spawn)

    this.frame = 0
    if (this.budget <= 0) entity.remove = true
    this.frame++
    if (frame % 35 != 0) return
  }
}

class AttackController {
  constructor(parent, dmg, recovery, ignore = [], maxHits = -1, remote = undefined, multihit = false, effects = [], freezeFrames = 0, delay = 0) {
    this.parent = parent
    this.dmg = dmg
    this.recovery = recovery
    this.ignore = [...ignore]
    this.multihit = multihit
    this.maxHits = maxHits
    this.remote = remote
    this.effects = [...effects]
    this.freezeFrames = freezeFrames
    this.delay = delay
    this.time = 0
  }

  update(game, entity) {
    this.time++
    if (this.delay > this.time) return
    let hb = entity.physicalHitbox()
    for (let i in game.entities) {
      let other = game.entities[i]
      if (!other.unit || other == this || this.ignore.includes(other)) continue
      let otherHb = other.physicalHitbox()
      let hit = rectCollision(hb, otherHb)
      if (!hit) continue
      if (!this.multihit) this.ignore.push(other)
      this.maxHits--
      freezeFrames = this.freezeFrames
      this.parent.inventory?.addRecovery(this.recovery)
      if (this.maxHits == 0) entity.remove = true
      if (other.health.takeDmg(this.dmg)) {
        other.remove = true
      }
      if (this.remote) {
        this.remote.apply(other)
        other.remote.set(this.effect)
      }
      for (let eff in this.effects) {
        other.effects.active.push(this.effects[eff].clone())
      }
    }
    if (entity.position[1] > 480) {
      entity.remove = true
    }
  }
}

class AttackControllerBuilder {
  constructor(parent, dmg) {
    this.parent = parent
    this.dmg = dmg
    this.recovery = 0
    this.ignore = [parent]
    this.maxHits = -1
    this.remote = undefined
    this.multihit = false
    this.effects = []
    this.freezeFrame = 0
    this.delay = 0
  }

  build() {
    return new AttackController(
      this.parent,
      this.dmg,
      this.recovery,
      this.ignore,
      this.maxHits,
      this.remote,
      this.multihit,
      this.effects,
      this.freezeFrames,
      this.delay
    )
  }

  withRecovery(v) {
    this.recovery = v
    return this
  }

  withDelay(v) {
    this.delay = v
    return this
  }

  withIgnore(v) {
    this.ignore = v
    return this
  }

  withMaxHits(v) {
    this.maxHits = v
    return this
  }

  withRemote(v) {
    this.remote = v
    return this
  }

  withMultihit(v) {
    this.multihit = v
    return this
  }

  withEffects(v) {
    this.effects = v
    return this
  }
  
  withFreezeFrames(v) {
    this.freezeFrames = v
    return this
  }
}

class StunRemote {
  constructor(velocity, stunTimer = 1) {
    this.stunTimer = stunTimer
    this.velocity = [...velocity]
  }

  apply(entity) {
    entity.velocity = [...this.velocity]
  }

  update(game, entity) {
    return entity.onGround
      && Math.abs(entity.velocity[0]) < 0.3
      && this.stunTimer-- == 1
      || entity.position[1] < 500
  }
}

class WaitRemote {
  constructor(waitFor) {
    this.waitFor = waitFor
  }

  apply(entity) {
    
  }

  update(game, entity) {
    return this.waitFor.remove
  }
}

class PoisonEffect {
  constructor(dmg, frequency, duration) {
    this.dmg = dmg
    this.frequency = frequency
    this.duration = duration
    this.start = frame
    this.remove = false
    this.anim = new AnimationInstance("poison")
  }

  update(game, entity) {
    if (frame % this.frequency == 0) {
      entity.health.add(-this.dmg)
    }
    if (this.duration-- < 0) {
      this.remove = true
    }
  }

  draw(entity) {
    c.drawImage(this.anim.getFrame(), entity.position[0], entity.position[1])
  }

  clone() {
    return new PoisonEffect(this.dmg, this.frequency, this.duration)
  }
}

class FragileEffect {
  constructor() {
    
  }

  update(game, entity) {
    entity.remove = entity.onGround
  }

  draw(entity) {
    
  }

  clone() {
    return this
  }
}
let fragileEffect = new FragileEffect()
