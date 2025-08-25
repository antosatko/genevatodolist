let slotItems = {
  items: items,
  specials: {
    jackpot: {
      img: "jackpot",
      cb: function (game, tier) {
        game.spins.add(tier);
      },
    },
    recovery: {
      img: "cdup",
      cb: function (game, tier) {
        game.player.recoveryRate += 0.1 * tier
      }
    },
    health: {
      img: "healthup",
      cb: function (game, tier) {
        game.player.health.max += 10 * tier
      }
    }
  },
  images: {},
};
let slotItemKeys = [...Object.keys(slotItems.specials), ...itemKeys];
for (let name of slotItemKeys) {
  let img = slotItemImg(name);
  slotItems.images[name] = img;
}

class SlotMachineTape {
  constructor() {
    this.tape = [undefined, undefined];
    this.speed = 0;
    this.position = 0;
  }

  reset() {
    this.speed = Math.random() * 0.2 + 0.08;
    this.tape = [];
    for (let i = 0; i < 2; i++) {
      this.tape[i] = slotItemKeys[(Math.random() * slotItemKeys.length) >> 0];
    }
  }

  update() {
    this.speed *= 0.993;

    if (this.speed < 0.05 && this.position > 0.18 && this.position < 0.2) {
      this.speed = 0;
      this.position = 0.2;
    }

    this.position += this.speed;
    if (this.position > 1) {
      this.tape[1] = this.tape[0];
      this.tape[0] = slotItemKeys[(Math.random() * slotItemKeys.length) >> 0];
      this.position %= 1;
    }
  }

  draw(x, y, h) {
    let offset = h * this.position;
    for (let i = 0; i < 2; i++) {
      let name = this.tape[1 - i];
      let img = slotItems.images[name];
      c.drawImage(img, x >> 0, (y + offset - i * h) >> 0);
    }
  }
}

function slotItemImg(name) {
  let imgName = slotItemIsSpecial(name)
    ? slotItems.specials[name].img
    : slotItems.items[name].img;
  let img = assets.images[imgName + "128"].img;
  return img;
}

function slotItemIsSpecial(name) {
  return !itemKeys.includes(name);
}
