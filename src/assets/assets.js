let assetTable = {
  "objects": {
    "dobrak": {
      "img": "dobrak",
      "unit": true,
      "arm": [47, 37], // x, y
      "hitbox": [13, 0, 47, 63], // left, top, right, bottom
      "physical": true,
    },
    "robot": {
      "img": "robot",
      "unit": true,
      "arm": [51, 16],
      "gun": [32, 32],
      "hitbox": [13, 0, 50, 63],
      "physical": true,
    },
    "robotek": {
      "img": "robotek",
      "unit": true,
      "arm": [25, 14],
      "hitbox": [6, 0, 25, 31],
      "physical": true,
    },
    "warcrime": {
      "img": "warcrime",
      "hitbox": [0, 3, 31, 28],
      "physical": true,
    },
    "portal": {
      "anim": "portal",
      "arm": [32, 32],
    },
    "fireball": {
      "anim": "fireball",
      "hitbox": [3, 3, 13, 13],
      "physical": true,
      "useAirRes": true,
    },
    "wideswoosh": {
      "anim": "wideswoosh",
      "hitbox": [0, 0, 128, 25],
    },
    "stab": {
      "anim": "stab",
      "hitbox": [10, 10, 80, 44],
    },
    "lahvicka": {
      "img": "lahvicka",
      "hitbox": [3, 3, 13, 13],
      "physical": true,
      "useAirRes": true,
    },
    "cloud": {
      "anim": "poison",
      "hitbox": [5, 5, 59, 59],
    },
  },
  "images": {
    "dobrak": {
      "flip": true,
      "res": [64, 64],
    },
    "robot": {
      "res": [64, 64],
    },
    "robotek": {
      "res": [32, 32],
    },
    "sekacek": {
      "flip": true,
      "img128": true,
      "res": [64, 64],
    },
    "vidlicka": {
      "img128": true,
      "res": [64, 64],
    },
    "warcrime": {
      "img128": true,
      "res": [32, 32],
    },
    "lahvicka": {
      "img128": true,
      "res": [16, 16],
    },
    "lahvicka32": {
      "res": [32, 32],
    },
    "tocky": {
      "res": [560, 400],
    },
    "confirm": {
      "res": [640, 480],
    },
    "token": {
      "res": [16, 16],
    },
    "tokenslot": {
      "res": [16, 16],
    },
  },
  "animations": {
    "portal": {
      "path": null,
      "res": [64, 64],
      "range": [0, 11],
      "fps": 5,
    },
    "fireball": {
      "path": null,
      "res": [16, 16],
      "range": [0, 11],
      "fps": 10,
    },
    "wideswoosh": {
      "path": null,
      "res": [128, 25],
      "range": [0, 5],
      "fps": 24,
    },
    "stab": {
      "path": null,
      "flip": true,
      "res": [100, 64],
      "range": [0, 7],
      "fps": 30,
    },
    "poison": {
      "path": null,
      "flip": false,
      "res": [64, 64],
      "range": [0, 10],
      "fps": 3,
    },
  },
}

// for preloading assets
let _offscreenCanvas = new OffscreenCanvas(640, 480)
let _offscreenCtx = _offscreenCanvas.getContext("2d")

class ImgDesc {
  constructor(resolution, name, flip) {
    this.resolution = resolution
    this.path = "assets/images/" + name + ".png"
    this.pathFlip = undefined
    this.img = new Image()
    this.imgFlip = undefined
    this.img.src = this.path
    // preload image
    _offscreenCtx.drawImage(this.img, 0, 0)
    if (flip) {
      this.pathFlip = "assets/images/flip/" + name + ".png"
      this.imgFlip = new Image()
      this.imgFlip.src = this.pathFlip
      _offscreenCtx.drawImage(this.imgFlip, 0, 0)
    }
  }
}

class AnimationDesc {
  constructor(resolution, name, range, fps, flip) {
    this.resolution = resolution
    this.path = "assets/animations/" + name + "/"
    this.pathFlip = undefined
    this.fps = fps
    this.frames = []
    this.flip = flip
    this.framesFlip = this.frames
    for (let i = range[0]; i <= range[1]; i++) {
      let frame = new Image()
      frame.src = this.path + i + ".png"
      _offscreenCtx.drawImage(frame, 0, 0)
      this.frames.push(frame)
    }
    if (flip) {
      this.framesFlip = []
      this.pathFlip = "assets/animations/flip/" + name + "/"
      for (let i = range[0]; i <= range[1]; i++) {
        let frame = new Image()
        frame.src = this.pathFlip + i + ".png"
        _offscreenCtx.drawImage(frame, 0, 0)
        this.framesFlip.push(frame)
      }
    }
  }
}

class AnimationInstance {
  constructor(name) {
    this.desc = assets["animations"][name]
    this.current = 0
    this.step = this.desc.fps / 60
    this.start = frame
  }

  getFrame(freeze, flip) {
    this.current = this.step * (frame - this.start)
    let currentFrame = (this.current>>0) % this.desc.frames.length
    return flip ? this.desc.framesFlip[currentFrame] : this.desc.frames[currentFrame]
  }
}

const _128x128 = [128, 128]
class ObjTable {
  constructor () {
    this.images = {}
    this.animations = {}
    for (let image in assetTable["images"]) {
      let {res, flip, img128} = assetTable["images"][image]
      this.images[image] = new ImgDesc(res, image, flip)
      if (img128) {
        let name = image + "128"
        this.images[name] = new ImgDesc(_128x128, name, false)
      }
    }
    for (let animation in assetTable["animations"]) {
      let {res, range, fps, flip} = assetTable["animations"][animation]
      this.animations[animation] = new AnimationDesc(res, animation, range, fps, flip)
    }
  }
}


let assets = new ObjTable()
