let mapSpec = [
  ["wall", 0, 0, 0, 14],
  ["wall", 1, 5, 2, 5],
  ["wall", 2, 8, 6, 8],
  ["wall", 5, 11, 15, 11],
  ["wall", 14, 8, 17, 8],
  ["wall", 17, 5, 18, 5],
  ["wall", 19, 0, 19, 14],
];

class MapTile {
  constructor(flags = []) {
    this.wall = false;
    this.portal = false;
    this.addFlags(flags);
  }

  addFlags(flags) {
    for (let flag of flags) {
      this[flag] = true;
    }
  }
}

class GameMap {
  constructor() {
    this.image = new Image();
    this.image.src = "assets/images/map.png";
    this.tiles = [];
    for (let x = 0; x < 20; x++) {
      this.tiles.push([]);
      for (let y = 0; y < 15; y++) {
        this.tiles[x].push(new MapTile());
      }
    }
    for (let spec of mapSpec) {
      let [flag, left, top, right, bottom] = spec;
      for (let x = left; x <= right; x++) {
        for (let y = top; y <= bottom; y++) {
          this.tiles[x][y].addFlags([flag]);
        }
      }
    }
  }
  draw() {
    c.drawImage(this.image, 0, 0, 640, 480);
  }
}

let map = new GameMap();
