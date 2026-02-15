let lizard;
let crickets = [];
let score = 0;
let misses = 0;
let gameOver = false;
let lizardImg;
let cricketImg;
let bgImg;
let defaultLizardColor;
let baseSpeed = 3;
let speed = baseSpeed;
let spawnRate = 60; // Frames per spawn
let customImage = null;

function preload() {
    lizardImg = loadImage('dragon.png');
    cricketImg = loadImage('cricket.png');
    bgImg = loadImage('simple_desert_bg.png');
}

function setup() {
    let canvas = createCanvas(400, 600);
    canvas.parent('game-container');
    defaultLizardColor = color(0, 255, 0); // Bright green

    // Clean up backgrounds programmatically
    lizardImg.loadPixels();
    removeBackground(lizardImg);
    lizardImg.updatePixels();

    cricketImg.loadPixels();
    removeBackground(cricketImg);
    cricketImg.updatePixels();

    lizard = new Lizard();

    // Handle file upload
    const fileInput = document.getElementById('dragon-upload');
    fileInput.addEventListener('change', handleFile);
}

function removeBackground(img) {
    // Loop through every pixel
    for (let i = 0; i < 4 * (img.width * img.height); i += 4) {
        let r = img.pixels[i];
        let g = img.pixels[i + 1];
        let b = img.pixels[i + 2];

        // Calculate distance from white
        let dist = Math.sqrt(
            Math.pow(255 - r, 2) +
            Math.pow(255 - g, 2) +
            Math.pow(255 - b, 2)
        );

        // Also check for light gray/off-white (low saturation, high brightness)
        let maxVal = Math.max(r, g, b);
        let minVal = Math.min(r, g, b);
        let saturation = (maxVal === 0) ? 0 : (maxVal - minVal) / maxVal;

        // If it's close to white (distance < 100)
        // OR if it's a gray pixel (low saturation) that is not too dark (brightness > 100)
        if (dist < 100 || (saturation < 0.1 && maxVal > 100)) {
            img.pixels[i + 3] = 0; // Transparent
        }
    }
}

function draw() {
    // Draw the background image
    image(bgImg, 0, 0, width, height);

    if (gameOver) {
        textAlign(CENTER, CENTER);
        textSize(32);
        fill(0);
        text('GAME OVER', width / 2, height / 2);
        textSize(16);
        text('Score: ' + score, width / 2, height / 2 + 40);
        text('Click to Restart', width / 2, height / 2 + 70);
        return;
    }

    // HUD
    fill(0);
    textSize(16);
    textAlign(LEFT, TOP);
    text('Score: ' + score, 10, 10);
    text('Misses: ' + misses + '/3', 10, 30);

    // Lizard Logic
    lizard.update();
    lizard.show();

    // Game Mechanics
    handleDifficulty();

    // Spawning
    if (frameCount % spawnRate === 0) {
        crickets.push(new Cricket(speed));
        if (score >= 100) {
            crickets.push(new Cricket(speed)); // Double spawn
        }
    }

    // Crickets Logic
    for (let i = crickets.length - 1; i >= 0; i--) {
        crickets[i].update();
        crickets[i].show();

        // Check catch
        if (crickets[i].hits(lizard)) {
            score++;
            crickets.splice(i, 1);
        }
        // Check miss
        else if (crickets[i].offScreen()) {
            misses++;
            crickets.splice(i, 1);
            if (misses >= 3) {
                gameOver = true;
            }
        }
    }
}

function mousePressed() {
    if (gameOver) {
        resetGame();
    }
}

function resetGame() {
    score = 0;
    misses = 0;
    gameOver = false;
    crickets = [];
    speed = baseSpeed;
    lizard.pos.x = width / 2;
}

function handleDifficulty() {
    // Increase speed by 5% every 10 crickets
    let level = Math.floor(score / 10);
    speed = baseSpeed * Math.pow(1.05, level);

    // Cap spawn rate so it doesn't get impossible
    // spawnRate = Math.max(20, 60 - level * 2); 
    // User req: "at 100 crickets start dropping 2 crickets", implies rate might stay same but quantity increases?
    // User req: "increase the fall rate of the crickets by 5%".
}

function handleFile(event) {
    const file = event.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        loadImage(url, img => {
            customImage = img;
        });
    }
}

function setGradient(x, y, w, h, c1, c2, axis) {
    noFill();
    if (axis === 1) { // Top to bottom gradient
        for (let i = y; i <= y + h; i++) {
            let inter = map(i, y, y + h, 0, 1);
            let c = lerpColor(c1, c2, inter);
            stroke(c);
            line(x, i, x + w, i);
        }
    }
}

class Lizard {
    constructor() {
        this.w = 70; // Slightly wider for image aspect ratio
        this.h = 70;
        this.pos = createVector(width / 2, height - this.h - 10);
        this.speed = 5;
    }

    update() {
        // Keyboard controls
        if (keyIsDown(LEFT_ARROW)) {
            this.pos.x -= this.speed;
        }
        if (keyIsDown(RIGHT_ARROW)) {
            this.pos.x += this.speed;
        }

        // Touch/Mouse controls (Mobile)
        // If screen is touched on the left half, move left. Right half, move right.
        if (mouseIsPressed && !gameOver) {
            if (mouseX < width / 2) {
                this.pos.x -= this.speed;
            } else {
                this.pos.x += this.speed;
            }
        }

        this.pos.x = constrain(this.pos.x, 0, width - this.w);
    }

    show() {
        if (customImage) {
            image(customImage, this.pos.x, this.pos.y, this.w, this.h);
        } else {
            image(lizardImg, this.pos.x, this.pos.y, this.w, this.h);
        }
    }
}

class Cricket {
    constructor(speed) {
        this.r = 15; // Radius logic kept for placement, but drawing image
        this.w = 30; // Image width
        this.h = 30; // Image height
        this.pos = createVector(random(this.w, width - this.w), -this.h);
        this.vel = createVector(0, speed);
    }

    update() {
        this.pos.add(this.vel);
    }

    show() {
        image(cricketImg, this.pos.x, this.pos.y, this.w, this.h);
    }

    offScreen() {
        return this.pos.y > height;
    }

    hits(lizard) {
        // Simple AABB collision detection
        return (
            this.pos.x + this.w > lizard.pos.x &&
            this.pos.x < lizard.pos.x + lizard.w &&
            this.pos.y + this.h > lizard.pos.y &&
            this.pos.y < lizard.pos.y + lizard.h
        );
    }
}
