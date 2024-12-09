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
        this.isDragging = false; // Flag for dragging
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
        }, { x: 0, y: 0 });

        // Use F = m * a to get acceleration
        const ax = netForce.x / this.mass;
        const ay = netForce.y / this.mass;

        // Update velocity
        this.vx += ax;
        this.vy += ay;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Apply screen boundaries
        this.checkBorders();

        // Reset forces for the next frame
        this.forces = [];
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isDragging ? 'red' : 'blue'; // Change color when dragging
        ctx.fill();
        ctx.closePath();
    }

    // Check for collision with another particle
    checkCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius + other.radius) {
            // Simple elastic collision response
            const angle = Math.atan2(dy, dx);
            const targetX = this.x + Math.cos(angle) * (this.radius + other.radius);
            const targetY = this.y + Math.sin(angle) * (this.radius + other.radius);
            const ax = (targetX - other.x) * 0.05; // Apply some force towards the target
            const ay = (targetY - other.y) * 0.05;

            // Apply friction on collision
            const friction = 0.1; // Friction coefficient
            const relativeVelocityX = other.vx - this.vx;
            const relativeVelocityY = other.vy - this.vy;

            // Apply friction force based on relative velocity
            other.vx -= relativeVelocityX * friction;
            other.vy -= relativeVelocityY * friction;
            this.vx += relativeVelocityX * friction;
            this.vy += relativeVelocityY * friction;

            // Adjust positions to avoid sticking
            this.x -= ax;
            this.y -= ay;
            other.x += ax;
            other.y += ay;
        }
    }

    // Check if the mouse is over the particle
    isMouseOver(mx, my) {
        const dx = mx - this.x;
        const dy = my - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }

    // Start dragging
    startDragging() {
        this.isDragging = true;
    }

    // Stop dragging
    stopDragging() {
        this.isDragging = false;
    }

    // Check and apply screen boundaries
    checkBorders() {
        // Left and right boundaries
        if (this.x - this.radius < 0) {
            this.x = this.radius; // Reset to the left edge
            this.vx = 0; // Stop horizontal movement
        } else if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius; // Reset to the right edge
            this.vx = 0; // Stop horizontal movement
        }

        // Top and bottom boundaries
        if (this.y - this.radius < 0) {
            this.y = this.radius; // Reset to the top edge
            this.vy = 0; // Stop vertical movement
        } else if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius; // Reset to the bottom edge
            this.vy = 0; // Stop vertical movement
        }
    }

    // Apply air resistance
    applyAirResistance() {
        const dragCoefficient = 0.05; // Adjust this value for more or less drag
        const dragForce = {
            x: -this.vx * dragCoefficient,
            y: -this.vy * dragCoefficient
        };
        this.applyForce(dragForce);
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

// Apply gravity to particles
function applyForces() {
    const gravity = { x: 0, y: 0.1 }; // Simple constant gravity
    for (const particle of particles) {
        // Apply gravity
        particle.applyForce(gravity);
        
        // Apply air resistance
        particle.applyAirResistance();
    }
}

// Update the simulation
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check for collisions
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            particles[i].checkCollision(particles[j]);
        }
    }

    // Update and draw particles
    for (const particle of particles) {
        particle.update();
        particle.draw();
    }

    requestAnimationFrame(update);
}

// Mouse event listeners for drawing shapes
canvas.addEventListener('mousedown', (e) => {
    const mx = e.clientX;
    const my = e.clientY;
    const particle = particles.find(p => p.isMouseOver(mx, my));
    if (particle) {
        particle.startDragging();
    } else {
        isDrawing = true;
        currentShape.push({ x: mx, y: my });
    }
});

canvas.addEventListener('mousemove', (e) => {
    const mx = e.clientX;
    const my = e.clientY;
    // Dragging functionality
    for (const particle of particles) {
        if (particle.isDragging) {
            particle.x = mx;
            particle.y = my;
            particle.vx = 0; // Reset velocity while dragging
            particle.vy = 0;
        }
    }
    if (isDrawing) {
        currentShape.push({ x: mx, y: my });
    }
});

canvas.addEventListener('mouseup', () => {
    // Stop dragging for all particles
    for (const particle of particles) {
        particle.stopDragging();
    }
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
applyForces(); // Apply forces in the update loop
update();
