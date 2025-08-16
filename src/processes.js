class ProcManager {
  constructor() {
    this.current = undefined;
    this.next = undefined;
    this.frame = 1;
    this.overlays = [];
  }

  open(proc) {
    // if (proc == this.current) return
    this.next = proc;
    this.frame = 1;
  }

  update() {
    if (this.next) {
      this.current?.close();
      this.current = this.next;
      this.next = undefined;
      this.current.open();
    }

    let overlays = this.overlays.length;
    if (!overlays) {
      this.current?.update(this.frame);
    } else {
      this.overlays[overlays - 1].update(this.frame);
      this.overlays = this.overlays.filter((o) => !o.remove);
    }
    updateInputs();
    this.frame++;
  }

  draw() {
    this.current?.draw();
    for (let i in this.overlays) {
      this.overlays[i].draw();
    }
  }
}

class GameProc {
  constructor() {
    this.overlayFg = new Image();
    this.overlayFg.src = "assets/images/overlay.png";
    this.overlayBg = new Image();
    this.overlayBg.src = "assets/images/overlay-bg.png";
    this.token = assets.images.token.img;
    this.tokenSlot = assets.images.tokenslot.img;
    this.open();
  }

  update(frame) {
    if (this.frame % 60 == 0) {
      this.player.health.add((1 - this.style.ratio()) * -5);
      this.style.add(-1);
    }
    for (let i in this.entities) {
      this.entities[i].update(this);
    }
    for (let i in this.entities) {
      let entity = this.entities[i];
      entity.remote.fix();
      if (entity.remove) {
        entity.onRemove(this);
      }
    }
    this.entities = this.entities.filter((e) => !e.remove);
    let cleared = !this.entities.some(e => e?.controller?.constructor.name == "AIController"
      || e?.controller?.constructor.name == "PortalController")

    if (cleared) {
      this.spins.inc()
      procs.overlays.push(new GambaProc(this))
      let budgetCap = this.stage * 5
      while (budgetCap > 0) {
        let budget = Math.ceil(Math.random() * budgetCap)
        budgetCap -= budget
        let portal = new Entity([Math.random() * 400 + 100, 70], "portal")
        portal.controller = new PortalController(budget)
        this.entities.push(portal)
      }
    }
    this.frame++;
  }

  draw() {
    map.draw();
    for (let i in this.entities) {
      this.entities[i].draw();
    }
    let healthRatio = this.player.health.ratio();
    let green = Math.floor(healthRatio * 255);
    let red = Math.floor(255 - healthRatio * 255);
    c.drawImage(this.overlayBg, 0, 0);
    c.fillStyle = `rgb(${red}, ${green}, 0)`;
    c.fillRect(290, 418 + (1 - healthRatio) * 44, 60, 44);
    c.fillStyle = "yellow";
    c.fillRect(530, 432, 105 * this.style.ratio(), 44);
    c.drawImage(this.overlayFg, 0, 0);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 5; j++) {
        445;
        let idx = i * 5 + j;
        let x = 143 + i * 242 + j * 24;
        let y = 445;
        c.drawImage(this.tokenSlot, x, y);
        if (idx < this.spins.current) {
          c.drawImage(this.token, x, y);
        }
      }
    }
    this.player.inventory.draw();
  }

  open() {
    this.gameOver = false;
    this.entities = [];
    this.style = new Bar(100);
    this.style.current = 50;
    this.spins = new CheckedCounter(0, 9, true);
    this.spins.add(2);
    this.frame = 0;
    this.stage = 1;

    this.player = new Entity([250, 200], "dobrak");
    this.player.controller = new PlayerController();
    this.player.health = new Bar(180);
    this.player.lifespan = new PlayerLifespan();
    this.player.inventory = new Inventory();
    this.entities.push(this.player);
  }

  close() {}
}

class GambaProc {
  constructor(game) {
    this.game = game;
    this.rolls = [
      itemKeys[(Math.random() * itemKeys.length) >> 0],
      itemKeys[(Math.random() * itemKeys.length) >> 0],
      itemKeys[(Math.random() * itemKeys.length) >> 0],
    ];
    this.remove = false;
    this.selected = new WrapCounter(0, 2);
    this.img = assets.images.tocky.img;
    this.loading = 0;
    this.tapes = [
      new SlotMachineTape(),
      new SlotMachineTape(),
      new SlotMachineTape(),
    ];
    this.state = "loading";
  }

  update(frame) {
    this.game.player.controller.updateInventory(this.game.player);
    switch (this.state) {
      case "loading":
        if (this.loading < 10) this.loading++;
        else this.state = "idle";
        break;
      case "idle":
        if (keys["usePrimary"] == 1) {
          if (this.game.spins.current > 0) {
            this.game.spins.dec();
            this.state = "spin";
            for (let i in this.tapes) {
              this.tapes[i].reset();
            }
          } else {
            this.remove = true;
          }
        }
        if (keys["useSecondary"] == 1) {
          let confirm = new ConfirmProc("Close?", [
            "Close slotmachine",
            "Tokens can be used later"
          ], connfirm => {
              if (confirm) {
                this.remove = true
              }
            })
          procs.overlays.push(confirm)
        }
        break;
      case "spin":
        let done = true;
        for (let i in this.tapes) {
          this.tapes[i].update();
          if (this.tapes[i].speed != 0) {
            done = false;
          }
        }
        if (done) {
          this.state = "select";
          for (let i in this.tapes) {
            this.rolls[i] = this.tapes[i].tape[1];
          }
        }
        break;
      case "select":
        if (keys["right"] == 1) {
          this.selected.inc();
        }
        if (keys["left"] == 1) {
          this.selected.dec();
        }
        if (keys["useSecondary"] == 1) {
          procs.overlays.push(
            new ConfirmProc(
              "Skip?",
              "Rewards will be discarded",
              confirm => {
                if (confirm) {
                  this.state = "idle"
                }
              }
            )
          )
        }
        if (keys["usePrimary"] == 1) {
          let selected = this.rolls[this.selected.current];
          let tier = 0;
          for (let i in this.rolls) {
            if (this.rolls[i] == selected) tier++;
          }
          let isSpecial = slotItemIsSpecial(selected);
          if (isSpecial) {
            slotItems.specials[selected].cb(this.game, tier);
            this.state = "idle";
          } else if (this.game.player.inventory.tryPlaceItem(selected, tier)) {
            this.state = "idle";
          } else {
            procs.overlays.push(
              new ConfirmProc(
                "Confirm?",
                "Replace an item in inventory?",
                (replace) => {
                  if (replace) {
                    this.game.player.inventory.placeItem(selected, tier);
                    this.state = "idle";
                  }
                },
              ),
            );
          }
        }
        break;
    }
  }

  draw() {
    let pos = 1 - this.loading / 10;
    c.drawImage(this.img, 40, -400 * pos);

    if (this.state == "idle" && frame % 60 < 30) {
      for (let i = 0; i < 3; i++) {
        c.fillStyle = "red";
        c.fillRect(155 + i * 112, 83, 107, 193);
      }
    }

    if (this.state == "spin") {
      let windowWidth = 145 + 112 * 2 + 83;
      let windowHeight = 193;
      c.save();
      c.beginPath();
      c.rect(145, 83, windowWidth, windowHeight);
      c.clip();
      for (let i = 0; i < 3; i++) {
        this.tapes[i].draw(145 + i * 112, 83, windowHeight);
      }
      c.restore();
    }

    if (this.state == "select") {
      c.fillStyle = "red";
      c.fillRect(155 + this.selected.current * 112, 83, 107, 193);

      let selected = this.rolls[this.selected.current];

      for (let i = 0; i < 3; i++) {
        let itemName = this.rolls[i];
        if (itemName == selected) {
          c.fillStyle = "rgba(255, 0, 0, 0.5)";
          c.fillRect(155 + i * 112, 83, 107, 193);
        }
        let img = slotItems.images[itemName];
        c.drawImage(img, 145 + i * 112, 112);
      }
    }
  }

  open() {}

  close() {}
}

class ConfirmProc {
  constructor(title, text, cb) {
    this.title = title;
    this.text = text;
    this.cb = cb;
    this.remove = false;
    this.img = assets.images.confirm.img;
  }

  update(frame) {
    if (keys["usePrimary"] == 1) {
      this.cb(true);
      this.remove = true;
    }
    if (keys["useSecondary"] == 1) {
      this.cb(false);
      this.remove = true;
    }
  }

  draw() {
    c.drawImage(this.img, 0, 0);
    c.fillStyle = "white";
    c.font = "30px default-ui";
    c.textAlign = "center";
    let x = 321;
    c.fillText(this.title, x, 190);
    c.font = "18px default-ui";
    if (typeof this.text == "string") {
      c.fillText(this.text, x, 255);
    } else {
      for (let i = 0; i < 3; i++) {
        if (!this.text[i]) continue
        c.fillText(this.text[i], x, 255 + i * 30);
      }
    }
  }

  open() {}

  close() {}
}
