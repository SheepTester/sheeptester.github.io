const objects = document.querySelector('#elements'),
joystick = document.getElementById('joystick'),
MOVE_SPEED = 0.5,
FRICTION = 0.9,
NEAR_PLANE = 10,
VIEW_FACTOR = 500,
OBJECT_SIZE = 200,
MIN_DRAG_DIST = 20,
DRAG_ROT_SCALE = 0.003;

let camera = {x: 0, z: -700, rot: 0, xv: 0, zv: 0, rotVel: 0},
items = [],
keys = {
  pan: null
};

function cameraFromHash() {
  if (window.location.hash)
    [camera.x, camera.z, camera.rot] = window.location.hash.slice(1).split(',').map(n => +n / 100);
  else
    [camera.x, camera.z, camera.rot] = [0, -700, 0];
}
window.addEventListener('hashchange', cameraFromHash, false);
cameraFromHash();

let row = 0, col = 0;
for (const elem of objects.children) {
  let {special} = elem.dataset;
  let x = 0, z = 0;
  switch (special) {
    case 'sheeptester':
      z = -1000;
      break;
    case 'oljayjay':
      // Gamepro5 is assumed to be right before by mere coincidence
      ({x, z} = items[items.length - 1]);
      z += 10;
      break;
    default:
      switch (col) {
        case 0:
          x = -200;
          break;
        case 1:
          x = 200;
          break;
        case 2:
          x = -600 - row * 200;
          break;
        case 3:
          x = 600 + row * 200;
          break;
      }
      z = row * 400 - 200;
      col++;
      if (col > 3) {
        col = 0;
        row++;
      }
  }
  items.push({
    elem: elem,
    x: x,
    z: z,
    visible: true
  });
}

document.addEventListener("keydown", e => {
  keys[e.keyCode] = true;
}, false);
document.addEventListener("keyup", e => {
  keys[e.keyCode] = false;
}, false);

document.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'mouse' && !keys.showingJoystick) {
    joystick.classList.add('show');
    keys.showingJoystick = true;
  }
  if (joystick.contains(e.target)) {
    if (!keys.joystick) {
      joystick.classList.add('moving');
      keys.joystick = {
        pointerId: e.pointerId,
        rect: joystick.getBoundingClientRect(),
        setFromMouse (x, y) {
          x = (x - keys.joystick.rect.left) / keys.joystick.rect.width * 2 - 1;
          y = (y - keys.joystick.rect.top) / keys.joystick.rect.height * 2 - 1;
          let length = Math.hypot(x, y);
          if (length > 1) x /= length, y /= length;
          keys.joystickMovement = [x, y];
          joystick.style.setProperty('--x', (x + 1) / 2 * 100 + '%');
          joystick.style.setProperty('--y', (y + 1) / 2 * 100 + '%');
        }
      };
      keys.joystick.setFromMouse(e.clientX, e.clientY);
    }
  } else {
    if (!keys.pan) {
      keys.pan = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startRot: camera.rot,
        rotating: false
      };
    }
  }
});
document.addEventListener('pointermove', e => {
  if (keys.joystick && keys.joystick.pointerId === e.pointerId) {
    keys.joystick.setFromMouse(e.clientX, e.clientY);
  } else if (keys.pan && keys.pan.pointerId === e.pointerId) {
    let diffX = e.clientX - keys.pan.startX;
    if (!keys.pan.rotating && Math.abs(diffX) > MIN_DRAG_DIST) {
      keys.pan.rotating = true;
    }
    if (keys.pan.rotating) {
      camera.rot = keys.pan.startRot - DRAG_ROT_SCALE * diffX;
    }
  }
});
function pointerend(e) {
  if (keys.joystick && keys.joystick.pointerId === e.pointerId) {
    joystick.classList.remove('moving');
    keys.joystick = null;
    keys.joystickMovement = null;
  } else if (keys.pan && keys.pan.pointerId === e.pointerId) {
    keys.pan = null;
  }
}
document.addEventListener('pointerup', pointerend);
document.addEventListener('pointercancel', pointerend);

function transform(camera, x, z, sin, cos) {
  let relX = x - camera.x,
  relZ = z - camera.z;
  return {
    x: relX * cos - relZ * sin,
    z: relZ * cos + relX * sin
  };
}

let frame = 0;
function draw() {
  let sin = Math.sin(camera.rot),
  cos = Math.cos(camera.rot);

  for (let i = items.length; i--;) {
    let obj = items[i],
    transformation = transform(camera, obj.x, obj.z, sin, cos);
    if (transformation.z >= NEAR_PLANE) {
      if (!obj.visible) {
        obj.visible = true;
        obj.elem.style.display = "block";
      }
      obj.elem.style.left = (transformation.x / transformation.z * VIEW_FACTOR) + "px";
      obj.layer = transformation.z;

      let visualWidth = (OBJECT_SIZE / transformation.z * VIEW_FACTOR) / OBJECT_SIZE;
      obj.elem.style.transform = `scale(${visualWidth})`;
    } else {
      if (obj.visible) {
        obj.visible = false;
        obj.elem.style.display = "none";
      }
      obj.layer = 0;
    }
  }
  items = items.sort((a, b) => b.layer - a.layer);
  for (let i = items.length; i--;) items[i].elem.style.zIndex = i;

  camera.xv *= FRICTION;
  camera.zv *= FRICTION;
  camera.rotVel *= FRICTION;
  let movementX = 0, movementZ = 0;
  if (keys.joystickMovement) {
    movementX += keys.joystickMovement[0];
    movementZ -= keys.joystickMovement[1];
  }
  if (keys[87] || keys[38]) movementZ += 1;
  if (keys[83] || keys[40]) movementZ -= 1;
  if (keys[65]) movementX -= 1;
  if (keys[68]) movementX += 1;
  let movement = Math.hypot(movementX, movementZ);
  if (movement > 0) {
    movementX *= MOVE_SPEED / movement;
    movementZ *= MOVE_SPEED / movement;
    camera.xv += movementX * cos + movementZ * sin;
    camera.zv += movementZ * cos - movementX * sin;
  }
  if (keys[37]) camera.rotVel -= 0.003;
  if (keys[39]) camera.rotVel += 0.003;

  camera.x += camera.xv;
  camera.z += camera.zv;
  camera.rot += camera.rotVel;

  if (frame % 30 === 0) {
    window.location.replace('#' + Object.values(camera).slice(0, 3).map(n => Math.round(n * 100)).join(','));
  }

  frame++;
  window.requestAnimationFrame(draw);
}

draw();

objects.classList.add('elements-3d');
for (let draggable of document.querySelectorAll('a[href], img')) {
  draggable.draggable = false;
  if (draggable.alt) {
    draggable.title = draggable.alt;
  }
}
