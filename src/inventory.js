let items = {
  sekacek: {
    img: "sekacek",
    joint: [37, 57],
    cooldown: 250,
    primaryRecovery: 60,
    primary: function (game, entity, item) {
      let hb = entity.physicalHitbox();
      let attackHb = assetTable.animations.stab.res;
      let stabX =
        hb[0] + (entity.direction == 1 ? hb[2] : -attackHb[1] - hb[2]);
      let stabY = hb[1] + entity.aim * 30;

      let stab = new Entity([stabX, stabY], "stab");
      stab.direction = entity.direction;
      stab.lifespan = new TimerLifespan(15)
      stab.controller = new AttackControllerBuilder(entity, 3 - item.tier.ratio() * 2)
        .withRecovery(-2)
        .withRemote(new StunRemote([entity.direction * 12, -2.5]))
        .withEffects([new BleedEffect(entity, 1 + item.tier.ratio() * 2, 20, 90)])
        .build()
      let wait = new WaitRemote(stab)
      entity.remote.set(wait)
      game.entities.push(stab)
    },
    secondary: function (game, entity, item) {
      let timeout = new TimeoutRemote(20 - (item.tier.ratio() * 15)>>0, e => {
        let hb = entity.physicalHitbox();
        let attackHb = assetTable.animations.stab.res;
        let stabX =
          hb[0] + (entity.direction == 1 ? hb[2] : -attackHb[1] - hb[2]);
        let stabY = hb[1] + entity.aim * 30;

        let stab = new Entity([stabX, stabY], "stab");
        stab.direction = entity.direction;
        stab.lifespan = new TimerLifespan(15)
        stab.controller = new AttackControllerBuilder(entity, 5 - item.tier.ratio() * 5)
          .withRecovery(-2)
          .withRemote(new StunRemote([entity.direction * 12, -2.5]))
          .withEffects([new BleedEffect(entity, 1, 5, 70)])
          .build()
        let wait = new WaitRemote(stab)
        entity.remote.set(wait)
        game.entities.push(stab)
      })
      entity.remote.set(timeout)
    },
  },
  vidlicka: {
    img: "vidlicka",
    joint: [31, 53],
    cooldown: 750,
    secondaryRecovery: 20,
    secondary: function (game, entity, item) {
      let hb = entity.physicalHitbox();
      let itemHb = assetTable.objects.wideswoosh.hitbox;
      let swooshX = hb[0] + hb[2] / 2 - (itemHb[2] - itemHb[0]) / 2;
      let swooshY = hb[1] + hb[3] - itemHb[3];

      let swoosh = new Entity([swooshX, swooshY], "wideswoosh");
      swoosh.lifespan = new TimerLifespan(15);
      swoosh.controller = new AttackControllerBuilder(entity, 5 + item.tier.ratio() * 2)
        .withRecovery(-7)
        .withIgnore([entity])
        .withRemote(new StunRemote([entity.direction * 10, -2]))
        .withMultihit(6)
        .build();
      let wait = new WaitRemote(swoosh);
      entity.remote.set(wait);
      game.entities.push(swoosh);
      let numBalls = 17;
      let angleSpread = Math.PI;

      for (let i = 0; i < numBalls; i++) {
        let angle =
          (i / (numBalls - 1)) * angleSpread - angleSpread / 2 - Math.PI / 2;
        let speed = 8;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed - 3;

        let ball = new Entity(entity.position, "fireball");
        ball.controller = new AttackControllerBuilder(entity, 7)
          .withIgnore([entity])
          .withMaxHits(item.tier.current)
          .build();
        ball.velocity = [vx, vy];
        ball.effects.active.push(fragileEffect);
        game.entities.push(ball);
      }
    },
    primaryRecovery: 20,
    primary: function (game, entity, item) {
      let hb = entity.physicalHitbox();
      let attackHb = assetTable.animations.stab.res;
      let stabX =
        hb[0] + (entity.direction == 1 ? hb[2] : -attackHb[1] - hb[2]);
      let stabY = hb[1] + entity.aim * 30;

      let stab = new Entity([stabX, stabY], "stab");
      stab.direction = entity.direction;
      stab.lifespan = new TimerLifespan(15);
      stab.controller = new AttackControllerBuilder(entity, 9)
        .withRecovery(-10)
        .withIgnore([entity])
        .withRemote(new StunRemote([entity.direction * 15, -2], 2))
        .build();
      let wait = new WaitRemote(stab);
      entity.remote.set(wait);
      game.entities.push(stab);
    },
  },
  warcrime: {
    img: "warcrime",
    joint: [16, 0],
    primary: function (game, entity, item) {
      let hp = entity.health;
      hp.current = Math.min(hp.max, hp.current + 25);
      item.tier.dec()
      if (item.tier.current == 0) {
        item.remove = true
      }
    },
  },
  lahvicka: {
    img: "lahvicka",
    img32: "lahvicka32",

    joint: [16, 0],
    primaryRecovery: 60,
    primary: function (game, entity, item) {
      let bottle = new Entity(entity.physicalArm(), "lahvicka");
      bottle.effects.active.push(fragileEffect);
      bottle.velocity = [12 * entity.direction, -5 + entity.aim * 8];
      bottle.lifespan = new CBLifespan(function (game, entity) {
        let pos = [...entity.position];
        pos[1] -= 50;
        pos[0] -= 32;
        let cloud = new Entity(pos, "cloud");
        cloud.lifespan = new TimerLifespan(80);
        cloud.controller = new AttackControllerBuilder(entity, item.tier.ratio() * 2)
          .withMaxHits(80 + item.tier.current * 5)
          .withMultihit(true)
          .build();
        game.entities.push(cloud);
      });
      game.entities.push(bottle);
    },
    secondaryRecovery: 60,
    cooldown: 600,
    secondary: function (game, entity, item) {
      for (let i = 0; i < 3; i++) {
        let bottle = new Entity(entity.physicalArm(), "lahvicka");
        bottle.controller = new AttackControllerBuilder(entity, 0)
          .withMaxHits(1)
          .withEffects([new PoisonEffect(2 + item.tier.ratio() * 1.5, 10, 100)])
          .withDelay(60)
          .build();
        bottle.velocity = [(i - 1) * 1, -7];
        game.entities.push(bottle);
      }
    },
  },
};
let itemKeys = Object.keys(items);

class CheckedCounter {
  constructor(min, max, clamp = false) {
    this.min = min;
    this.max = max;
    this.clamp = clamp;
    this.current = min;
  }

  add(value) {
    let newValue = this.current + value;

    if (this.clamp) {
      // Clamp to min or max
      if (newValue < this.min) {
        this.current = this.min;
        return false;
      } else if (newValue > this.max) {
        this.current = this.max;
        return false;
      }
    } else {
      // Reject if out of bounds
      if (newValue < this.min || newValue > this.max) {
        return false;
      }
    }

    this.current = newValue;
    return true;
  }

  inc() {
    return this.add(1);
  }

  dec() {
    return this.add(-1);
  }

  ratio() {
    return (this.current - this.min) / (this.max - this.min)
  }
}

class WrapCounter {
  constructor(min, max) {
    this.min = min;
    this.max = max;
    this.range = max - min + 1;
    this.current = min;
  }

  add(value) {
    const offset = this.current - this.min;
    this.current =
      this.min + ((((offset + value) % this.range) + this.range) % this.range);
  }

  inc() {
    this.add(1);
  }

  dec() {
    this.add(-1);
  }
}

class Inventory {
  constructor() {
    ((this.slots = [undefined, undefined, undefined]),
      (this.selected = new WrapCounter(0, 2)));
    this.recovery = 0;
    this.recoveryRate = 1
  }

  usePrimary(game, entity) {
    if (this.recovery > 0) return;
    let item = this.getSelected();
    if (!item?.desc.primary) return;
    if (item.desc.primaryRecovery) this.addRecovery(item.desc.primaryRecovery);

    item.desc.primary(game, entity, item)

    if (item.remove) {
      this.slots[this.selected.current] = undefined
    }
  }

  useSecondary(game, entity) {
    if (this.recovery > 0) return;
    let item = this.getSelected();
    if (!item || !item.desc.secondary) return;
    if (item.desc.secondaryRecovery)
      this.addRecovery(item.desc.secondaryRecovery);

    let cd = item.cooldown;
    if (!cd || cd.useAll()) {
      item.desc.secondary(game, entity, item)
    }

    if (item.remove) {
      this.slots[this.selected.current] = undefined
    }
  }

  selectRight() {
    this.selected.inc();
  }

  selectLeft() {
    this.selected.dec();
  }

  getSelected() {
    return this.slots[this.selected.current];
  }

  addRecovery(value) {
    this.recovery = Math.max(0, this.recovery + value);
  }

  addItem(item) {
    for (let i in this.slots) {
      if (this.slots[i]) continue;
      this.slots[i] = item;
      return true;
    }
    return false;
  }

  tryPlaceItem(item, tier, place = undefined) {
    let i = place ? place : this.selected.current;
    let slot = this.slots[i];
    if (slot?.name == item) {
      return slot.tier.add(tier);
    }
    if (slot) return false;

    this.placeItem(item, tier, i);
    return true;
  }

  placeItem(item, tier, place = undefined) {
    let i = place ? place : this.selected.current;
    let placed = this.slots[i];
    if (placed?.name == item) {
      placed.tier.add(tier);
      return;
    }

    let newItem = new InventoryItem(item);
    newItem.tier.add(tier);
    this.slots[i] = newItem;
  }

  update() {
    for (let i in this.slots) {
      let item = this.slots[i];
      if (item?.cooldown) {
        let cd = item.cooldown;
        cd.current = Math.min(cd.max, cd.current + this.recoveryRate);
      }
    }
    this.recovery = Math.max(0, this.recovery - this.recoveryRate);
  }

  draw() {
    for (let i = 0; i < 3; i++) {
      let item = this.slots[i];
      c.fillStyle = this.selected.current == i ? "green" : "gray";
      c.fillRect(
        8 + 33 * i,
        436,
        32,
        32 * (item?.cooldown ? item.cooldown.current / item.cooldown.max : 1),
      );
      if (!item) continue;
      let img = item.img32 ? item.img32.img : item.img.img;
      c.drawImage(img, 8 + 33 * i, 436, 32, 32);
      c.fillStyle = "yellow"
      c.fillRect(8 + 33 * i, 460, 32 * item.tier.ratio(), 8)
    }
  }
}

class InventoryItem {
  constructor(name) {
    this.name = name;
    this.tier = new CheckedCounter(0, 9, true);
    this.desc = items[name];
    this.remove = false
    let img = this.desc.img;
    this.img = assets.images[img];
    let img32 = this.desc.img32;
    this.img32 = img32 ? assets.images[img32] : undefined;
    let cd = this.desc["cooldown"];
    this.cooldown = cd ? new Bar(cd) : undefined;
  }

  draw(parent, flip) {
    let [pos_x, pos_y] = parent.position;
    let [arm_x, arm_y] = parent.arm;
    let [joint_x, joint_y] = this.desc.joint;

    let x = pos_x + arm_x - joint_x;
    let y = pos_y + arm_y - joint_y;

    let img = this.img.img;
    if (flip && this.img.imgFlip) {
      img = this.img.imgFlip;
    }
    c.drawImage(img, x >> 0, y >> 0);
  }
}
