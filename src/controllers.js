class PlayerController {
  constructor() { }

  update(entity) {
    let left = keys["left"]
    let right = keys["right"]
    if (left > 0 && right < 1) {
      entity.velocity[0] = -PLAYER_SPEED
    }
    if (right > 0 && left < 1) {
      entity.velocity[0] = PLAYER_SPEED
    }
    if (keys["jump"] > 0 && entity.onGround) {
      entity.velocity[1] = -14
    }
    if (keys["swapLeft"] == 1) {
      entity.inventory.selectLeft()
    }
    if (keys["swapRight"] == 1) {
      entity.inventory.selectRight()
    }
    if (keys["usePrimary"] == 1) {
      entity.inventory.usePrimary(entity)
    }
    if (keys["useSecondary"] == 1) {
      entity.inventory.useSecondary(entity)
    }
    if (keys["select1"] == 1) {
      entity.inventory.selected = 0
    }
    if (keys["select2"] == 1) {
      entity.inventory.selected = 1
    }
    if (keys["select3"] == 1) {
      entity.inventory.selected = 2
    }
    if (entity.position[1] > 480 || entity.health.current <= 0) {
      entity.remove = true
    }
  }
}

class AIController {
  constructor() {
    this.signal = 0
    this.direction = -1
  }

  update(entity) {
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
    this.signal -= 1
  }
}

class PortalController {
  constructor(budget) {
    this.frame = 0
    this.budget = budget
  }

  update(entity) {
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
    entities.push(spawn)

    this.frame = 0
    if (this.budget <= 0) entity.remove = true
    this.frame++
    if (frame % 35 != 0) return
  }
}

class AttackController {
  constructor(parent, dmg, recovery, ignore = [], maxHits = -1, effect = undefined, multihit = false) {
    this.parent = parent
    this.dmg = dmg
    this.recovery = recovery
    this.ignore = [...ignore]
    this.multihit = multihit
    this.maxHits = maxHits
    this.effect = effect
  }

  update(entity) {
    let hb = entity.physicalHitbox()
    for (let i in entities) {
      let other = entities[i]
      if (!other.unit || other == this || this.ignore.includes(other)) continue
      let otherHb = other.physicalHitbox()
      let hit = rectCollision(hb, otherHb)
      if (!hit) continue
      if (!this.multihit) this.ignore.push(other)
      this.maxHits--
      this.parent.inventory?.addRecovery(this.recovery)
      if (this.maxHits == 0) entity.remove = true
      if (other.health.takeDmg(this.dmg)) {
        other.remove = true
      }
      if (this.effect) {
        this.effect.apply(other)
        other.effect.set(this.effect)
      }
    }
  }
}

class StunEffect {
  constructor(velocity, stunTimer = 1) {
    this.stunTimer = stunTimer
    this.velocity = [...velocity]
  }

  apply(entity) {
    entity.velocity = [...this.velocity]
  }

  update(entity) {
    return entity.onGround
      && Math.abs(entity.velocity[0]) < 0.3
      && this.stunTimer-- == 1
      || entity.position[1] < 500
  }
}

class WaitEffect {
  constructor(waitFor) {
    this.waitFor = waitFor
  }

  apply(entity) {
    
  }

  update(entity) {
    return this.waitFor.remove
  }
}
