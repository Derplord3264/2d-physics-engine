const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor(x, y, radius, mass) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.mass = mass;
        this.vx = 0; // Velocity in x
        this.vy = 0; // Velocity in y
        this.forces = []; // Array to hold forces acting on the particle
    }

    applyForce(force) {
        this.forces.push(force);
    }

    update() {
        // Calculate net force
        const netForce = this.forces.reduce((acc, force) => {
            acc.x += force.x;
            acc.y += force.y;
            return acc;
        }, {x: 0, y: 0});

        // Use F = m * a to get acceleration
        const ax = netForce.x / this.mass;
        const ay = netForce.y / this.mass;

        // Update velocity
        this.vx += ax;
        this.vy += ay;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Reset forces for the next frame
        this.forces = [];
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();
    }
}

const particles = [];
let isDrawing = false;
let currentShape = [];

// Initialize the simulation
function init() {
    // Create an example particle
    const particle = new Particle(100, 100, 20, 1);
    particles.push(particle);
}

// Apply friction to particles when they touch the ground
function applyFriction(particle) {
    if (particle.y + particle.radius >= canvas.height) { // Simple ground check
        const friction = -0.1 * particle.vx; // Friction proportional to velocity
        particle.applyForce({ x: friction, y: 0 });
        particle.y = canvas.height - particle.radius; // Ensure the particle stays on the ground
        particle.vy = 0; // Stop vertical movement
    }
}

// Update the simulation
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gravity force
    const gravity = { x: 0, y: 0.1 }; // Simple constant gravity
    for (const particle of particles) {
        applyFriction(particle); // Apply friction
        particle.applyForce(gravity);
        particle.update();
        particle.draw();
    }

    requestAnimationFrame(update);
}

// Mouse event listeners for drawing shapes
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    currentShape.push({ x: e.clientX, y: e.clientY });
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        currentShape.push({ x: e.clientX, y: e.clientY });
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    // Create a particle for the last point of the shape
    if (currentShape.length > 0) {
        const particle = new Particle(currentShape[0].x, currentShape[0].y, 5, 1);
        particles.push(particle);
        currentShape = []; // Reset the current shape
    }
});

// Start the simulation
init();
update();
