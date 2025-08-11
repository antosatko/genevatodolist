let slotItems = {
  "items": items,
  "specials": {
    
  }
}
let slotItemKeys = [...Object.keys(slotItems.specials), ...itemKeys]


class SlotMachineTape {
  constructor() {
    this.tape = [undefined, undefined]
    this.speed = 0
    this.position = 0
  }

  reset() {
    this.speed = Math.random() * 0.3 + 0.1
    this.tape = []
    for (let i = 0; i < 2; i++) {
      this.tape[i] = itemKeys[(Math.random() * itemKeys.length)>>0]
    }
  }

  update() {
    this.speed *= 0.995

    if (this.speed < 0.02 && this.position > 0.18 && this.position < 0.2) {
      this.speed = 0
      this.position = 0.2
    }

    this.position += this.speed
    if (this.position > 1) {
      this.tape[1] = this.tape[0]
      this.tape[0] = itemKeys[(Math.random() * itemKeys.length)>>0]
      this.position %= 1
    }
  }

  draw(x, y, h) {
    let offset = h * this.position
    for (let i = 0; i < 2; i++) {
      let item = items[this.tape[1-i]]
      let img = assets.images[item.img + "128"].img
      c.drawImage(img, x>>0, (y + offset - i * h)>>0)
    }
  }
}
