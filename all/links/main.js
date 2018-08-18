const objects = document.querySelector('#elements'),
MOVE_SPEED = 0.5,
FRICTION = 0.9,
NEAR_PLANE = 10,
VIEW_FACTOR = 500,
OBJECT_SIZE = 200;

let camera = {x: 0, z: -700, rot: 0, xv: 0, zv: 0, rotVel: 0},
items = [],
keys = {};

function cameraFromHash() {
  if (window.location.hash)
    [camera.x, camera.z, camera.rot] = window.location.hash.slice(1).split(',').map(n => +n / 100);
  else
    [camera.x, camera.z, camera.rot] = [0, -700, 0];
}
window.addEventListener('hashchange', cameraFromHash, false);
cameraFromHash();


for (let i = objects.children.length; i--;) {
  let elem = objects.children[i];
  items.push({
    elem: elem,
    x: +elem.dataset.x,
    z: +elem.dataset.z,
    visible: true
  });
}

document.addEventListener("keydown", e => {
  keys[e.keyCode] = true;
}, false);
document.addEventListener("keyup", e => {
  keys[e.keyCode] = false;
}, false);

function transform(camera, x, z, sin, cos) {
  let relX = x - camera.x,
  relZ = z - camera.z;
  return {
    x: relX * cos - relZ * sin,
    z: relZ * cos + relX * sin
  };
}

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
    }
  }
  items = items.sort((a, b) => b.layer - a.layer);
  for (let i = items.length; i--;) items[i].elem.style.zIndex = i;

  camera.xv *= FRICTION;
  camera.zv *= FRICTION;
  camera.rotVel *= FRICTION;
  if (keys[87] || keys[38]) camera.xv += sin * MOVE_SPEED, camera.zv += cos * MOVE_SPEED;
  if (keys[83] || keys[40]) camera.xv -= sin * MOVE_SPEED, camera.zv -= cos * MOVE_SPEED;
  if (keys[65]) camera.xv -= cos * MOVE_SPEED, camera.zv += sin * MOVE_SPEED;
  if (keys[68]) camera.xv += cos * MOVE_SPEED, camera.zv -= sin * MOVE_SPEED;
  if (keys[37]) camera.rotVel -= 0.003;
  if (keys[39]) camera.rotVel += 0.003;

  camera.x += camera.xv;
  camera.z += camera.zv;
  camera.rot += camera.rotVel;

  window.location.hash = Object.values(camera).slice(0, 3).map(n => Math.round(n * 100)).join(',');

  window.requestAnimationFrame(draw);
}

draw();
