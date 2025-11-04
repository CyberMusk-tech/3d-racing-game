// ----- Basic Setup -----
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ----- Lights -----
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// ----- Track -----
const trackRadius = 10;
const trackHeight = 1;
const wallHeight = 2;
const wallThickness = 0.5;
let walls = [];

for(let i=0; i<360; i+=10){
    const angle = THREE.MathUtils.degToRad(i);
    const x = trackRadius * Math.cos(angle);
    const z = trackRadius * Math.sin(angle);
    const wallGeom = new THREE.BoxGeometry(wallThickness, wallHeight, 2);
    const wallMat = new THREE.MeshStandardMaterial({color: 0x4444ff});
    const wall = new THREE.Mesh(wallGeom, wallMat);
    wall.position.set(x, wallHeight/2, z);
    wall.lookAt(0, wallHeight/2, 0);
    scene.add(wall);
    walls.push(wall);
}

// ----- Car -----
const carGeometry = new THREE.BoxGeometry(1, 1, 2);
const carMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
const car = new THREE.Mesh(carGeometry, carMaterial);
car.position.y = 0.5;
scene.add(car);

// ----- Checkpoints -----
const checkpointGeometry = new THREE.BoxGeometry(1, 1, 1);
const checkpointMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
let checkpoints = [];
for(let i=0; i<3; i++){
    const checkpoint = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
    const angle = i * 120 * Math.PI/180;
    checkpoint.position.set((trackRadius-2)*Math.cos(angle), 0.5, (trackRadius-2)*Math.sin(angle));
    scene.add(checkpoint);
    checkpoints.push(checkpoint);
}

let lap = 0;
let currentCheckpoint = 0;
const totalLaps = 3;
let startTime = Date.now();

// ----- Controls -----
let moveForward = false, moveBackward = false, turnLeft = false, turnRight = false;

document.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowUp') moveForward=true;
    if(e.key==='ArrowDown') moveBackward=true;
    if(e.key==='ArrowLeft') turnLeft=true;
    if(e.key==='ArrowRight') turnRight=true;
});
document.addEventListener('keyup', (e)=>{
    if(e.key==='ArrowUp') moveForward=false;
    if(e.key==='ArrowDown') moveBackward=false;
    if(e.key==='ArrowLeft') turnLeft=false;
    if(e.key==='ArrowRight') turnRight=false;
});

// ----- Animation -----
function animate(){
    requestAnimationFrame(animate);

    // Move car
    if(turnLeft) car.rotation.y += 0.05;
    if(turnRight) car.rotation.y -= 0.05;
    if(moveForward) car.position.x -= Math.sin(car.rotation.y)*0.2, car.position.z -= Math.cos(car.rotation.y)*0.2;
    if(moveBackward) car.position.x += Math.sin(car.rotation.y)*0.1, car.position.z += Math.cos(car.rotation.y)*0.1;

    // Collision with walls
    for(let wall of walls){
        const dx = car.position.x - wall.position.x;
        const dz = car.position.z - wall.position.z;
        if(Math.abs(dx)<1 && Math.abs(dz)<1){
            // Simple collision: push back
            car.position.x += Math.sin(car.rotation.y)*0.2;
            car.position.z += Math.cos(car.rotation.y)*0.2;
        }
    }

    // Checkpoints
    const cp = checkpoints[currentCheckpoint];
    const dx = car.position.x - cp.position.x;
    const dz = car.position.z - cp.position.z;
    if(Math.sqrt(dx*dx + dz*dz)<1){
        currentCheckpoint++;
        if(currentCheckpoint >= checkpoints.length){
            lap++;
            currentCheckpoint = 0;
        }
    }

    // Update UI
    document.getElementById('lap').innerText = lap + "/" + totalLaps;
    document.getElementById('time').innerText = ((Date.now()-startTime)/1000).toFixed(1);

    camera.position.x = car.position.x + 10*Math.sin(car.rotation.y);
    camera.position.z = car.position.z + 10*Math.cos(car.rotation.y);
    camera.position.y = car.position.y + 5;
    camera.lookAt(car.position);

    renderer.render(scene, camera);
}

animate();
