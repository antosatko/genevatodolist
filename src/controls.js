let keyMap = {
  KeyD: "right",
  KeyA: "left",
  KeyW: "up",
  KeyS: "down",
  ControlLeft: "sprint",
  KeyU: "usePrimary",
  KeyI: "useSecondary",
  KeyO: "parry",
  KeyJ: "swapLeft",
  KeyK: "swapRight",
  KeyE: "pick",
  KeyQ: "drop",
  Space: "jump",
  Digit1: "select1",
  Digit2: "select2",
  Digit3: "select3",
};

let keys = {
  right: 0,
  left: 0,
  up: 0,
  down: 0,
  sprint: 0,
  usePrimary: 0,
  useSecondary: 0,
  parry: 0,
  swapLeft: 0,
  swapRight: 0,
  pick: 0,
  drop: 0,
  jump: 0,
  select1: 0,
  select2: 0,
  select3: 0,
};

document.addEventListener("keydown", (e) => {
  let bind = keyMap[e.code];
  if (keys[bind] < 1) {
    keys[bind] = 1;
  }
});

document.addEventListener("keyup", (e) => {
  let bind = keyMap[e.code];
  if (keys[bind] > -1) {
    keys[bind] = -1;
  }
});

function updateInputs() {
  for (let key in keys) {
    if (keys[key] > 0) keys[key]++;
    else if (keys[key] < 0) keys[key]--;
  }
}
