import * as THREE from 'three';
import { getPlayers, addPlayer, setPlayerScore, dropPlayer } from './backend';

//prompt for name
let name = prompt("Please enter your name")
const id = await addPlayer(name);
console.log(id);


//grab score
const scoreText = document.getElementById("score");
let score = 0;
scoreText.innerHTML = score;

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Create the player (a green cube)
const playerGeometry = new THREE.BoxGeometry();
const playerMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
});
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, -4.5, 0);
player.castShadow = true;
scene.add(player);

// Optionally, add a ground plane for reference
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x999999,
    side: THREE.DoubleSide,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI / 2;
ground.position.y = -5;
ground.receiveShadow = true;
scene.add(ground);

//load background plane texture
const backgroundTexture = new THREE.TextureLoader().load("/textures/backgroundImage.jpg");
backgroundTexture.wrapS = THREE.RepeatWrapping;
backgroundTexture.wrapT = THREE.RepeatWrapping;
backgroundTexture.repeat.set(1, 1);



//add a background plane to make it easier to see what's going on 

const backgroundGeometry = new THREE.PlaneGeometry(10, 50);
const backgroundMaterial = new THREE.MeshStandardMaterial({
    map: backgroundTexture,
    side: THREE.DoubleSide,
});
const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
background.position.z = -4
background.position.y = -5;
background.receiveShadow = true;
scene.add(background)


//create light source
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 50, 5);
light.castShadow = true;
scene.add(light);

//set shadow settings for light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; //

// Array to hold obstacles
const obstacles = [];

//Array to hold bullets
const bullets = []

// Function to create a falling obstacle (a red cube)
function createObstacle() {
    const obsGeometry = new THREE.BoxGeometry(1, 1, 1);
    const obsMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const obstacle = new THREE.Mesh(obsGeometry, obsMaterial);
    obstacle.position.x = (Math.random() - 0.5) * 8;
    obstacle.position.y = 10;

    obstacle.castShadow = true;
    scene.add(obstacle);
    obstacles.push(obstacle);
}

function createBullet() {
    const bulletGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const bulletMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.x = player.position.x;
    bullet.position.y = player.position.y + 1;

    //push to bullet array
    scene.add(bullet);
    bullets.push(bullet);

}

// Set the camera position so we can see the scene
camera.position.z = 10;
camera.position.y = 0;

// Handle keyboard input for player movement
const keyState = {};
window.addEventListener("keydown", (event) => {
    keyState[event.code] = true;
});
window.addEventListener("keyup", (event) => {
    keyState[event.code] = false;
});

// Set up a clock for time-based animation
const clock = new THREE.Clock();
let obstacleTimer = 0;
const bulletCoolDown = 0.5;
let bulletCoolDownTimer = bulletCoolDown;


//add audio source and set to buffer
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);

const loader = new THREE.AudioLoader();

//function to load and play audio 
function playBlast(audioLoader) {
    audioLoader.load('sounds/blast.wav', function(buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        sound.play();
    }); 
    
}

// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    bulletCoolDownTimer += delta;

    // Move player left
    if (keyState["ArrowLeft"] || keyState["KeyA"]) {
        //check we are in bounds
        if (player.position.x >= -4.5) {
            player.position.x -= 5 * delta;
        }
    }

    // Move player right
    if (keyState["ArrowRight"] || keyState["KeyD"]) {
        //check we are in bounds
        if (player.position.x <= 4.5) {
            player.position.x += 5 * delta;
        }
    }

    if (keyState["Space"] && bulletCoolDownTimer >= bulletCoolDown) {
        createBullet();
        playBlast(loader);
        bulletCoolDownTimer = 0;
    }

    // Spawn a new obstacle roughly every second
    obstacleTimer += delta;
    if (obstacleTimer > 1) {
        createObstacle();
        obstacleTimer = 0;
    }

    // Update bullets: move upward and remove if off-screen
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].position.y += 10 * delta; // adjust speed as needed
        // Remove bullet if it goes off the top of the screen (adjust threshold as needed)
        if (bullets[i].position.y > 10) {
            scene.remove(bullets[i]);
            bullets.splice(i, 1);
        }
    }

    // Update obstacles (falling movement and simple collision detection)
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].position.y -= 3 * delta;
        // Remove obstacles that have fallen off the screen
        if (obstacles[i].position.y < -4.5) {
            scene.remove(obstacles[i]);
            obstacles.splice(i, 1);
            if (obstacles[i].position.distanceTo(player.position) > 1) {
                score++;
                scoreText.innerHTML = score;
            }
        }
        // Check collision with player (using simple distance check)
        if (obstacles[i].position.distanceTo(player.position) < 1) {
             setPlayerScore(id, parseInt(score,10));
            alert("Game Over! Your Score Was: " + score);
            window.location.reload(); // Restart game on collision
        }


    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            // Using a simple distance check for collision detection
            if (obstacles[i].position.distanceTo(bullets[j].position) < 0.5) {
                // Remove the collided obstacle and bullet
                scene.remove(obstacles[i]);
                obstacles.splice(i, 1);
                scene.remove(bullets[j]);
                bullets.splice(j, 1);
                // Increase score when an obstacle is shot
                score++;
                scoreText.innerHTML = score;
                break; // break out of the inner loop since obstacle[i] is gone
            }
        }
    }

    renderer.render(scene, camera);
}

animate();
console.log("test");
// Adjust camera and renderer when the window is resized
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


