let fireworks = [];
let gravity;
let scanline;
let refreshPos, origRefreshPos;
let isFireworkLaunched = false;
let messageCreated = false;
let randomtext = ["hi","hello", "hello, world"];


class Particle {
  constructor(x, y, color, firework) {
    this.pos = createVector(x, y);
    this.color = color;
    this.firework = firework;
    this.lifespan = 255;
    this.text = random(randomtext); 

    if (firework) {
      this.vel = createVector(0, random(-12, -8));
    } else {
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(2, 10));
    }

    this.acc = createVector(0, 0);
  }
  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.firework) {
      this.vel.mult(0.9);
      this.lifespan -= 4;
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  done() {
    return this.lifespan < 0;
  }

  display() {
    textAlign(CENTER, CENTER);
    textSize(random(.2, 90)); // smiley face size
    if (!this.firework) {
      noStroke();
      fill(random(150, 255), random(50, 255), random(10, 255), this.lifespan); // smiley face colors
       push();
       translate(this.pos.x, this.pos.y);
       rotate(random(-.5,.5)); // rotation
       text('☻', 0, 0);
       pop();

    } else {
      noStroke();
      textSize(30);
      fill(255);
      push(); 
      translate(this.pos.x, this.pos.y); // move origin to particle position
      this.rotation = lerp(this.rotation, this.targetRotation, this.rotationSpeed); // use lerp to ease the rotation
      rotate(this.rotation);
      text(this.text, 0, 0);
      pop();
    }
  }
}





class Firework {
  constructor(x, y, color, launchHeight) {
    this.color = color;
    this.firework = new Particle(x, y, this.color, true);
    this.firework.pos.y = launchHeight;
    this.exploded = false;
    this.particles = [];
  }

  update() {
    if (!this.exploded) {
      this.firework.applyForce(gravity);
      this.firework.update();

      if (this.firework.vel.y >= 0) {
        this.explode();
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(gravity);
      this.particles[i].update();
      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }
  }

  explode() {
    let numParticles = 100;
    let angle = TWO_PI / numParticles;
    let shape = floor(random(1, 1));

    for (let i = 0; i < numParticles; i++) {
      let particleSize = random(.5, 12);
      let distance = random(1, 3) * particleSize;
      let x = this.firework.pos.x + cos(angle * i * shape) * distance;
      let y = this.firework.pos.y + sin(angle * i * shape) * distance;
      const p = new Particle(x, y, this.color, false);
      p.vel.mult(particleSize * 0.45);
      this.particles.push(p);
    }
    this.exploded = true;
  }
  done() {
    return this.exploded && this.particles.length === 0;
  }

  display() {
    if (!this.exploded) {
      this.firework.display();
    }
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].display();
    }
  }
}


function setup() {
createCanvas(500, 800);
pixelDensity(1); // retro feel
gravity = createVector(0, 0.2);
stroke(255);
strokeWeight(5);
background(0);


scanline = createGraphics(width, height);
scanline.stroke(10, 90, 20, 90);
for (let i = 0; i < height; i += 4) {
scanline.line(0, i, width, i);


refreshPos = createVector(width / 2, height / 2);
origRefreshPos = refreshPos.copy();
}
}

function draw() {
  colorMode(RGB);
  background(0, 0, 0, 65);
  const ease = 0.1;
  refreshPos = p5.Vector.lerp(refreshPos, origRefreshPos, ease);

  // Draw fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].display();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }

 
  
  // middle txt
  textAlign(CENTER, CENTER);
  textSize(30);
  fill(255);
  textFont('Times New Roman ');
  textStyle(NORMAL);
  text("refresh   ", refreshPos.x, refreshPos.y + 300);
  textAlign(CENTER, CENTER);
  textSize(16);
  noStroke();
  fill(240,255,240,200);
  textFont('Times New Roman');
  textStyle(ITALIC);
  text("                        (ed)", refreshPos.x, refreshPos.y - 5 +300);
  textStyle(NORMAL);
  noStroke();

  // scanlines
  image(scanline, 0, 0, width, height);
}


function mousePressed() {
  dragStart = createVector(mouseX, mouseY);
  wordCreated = false;
}


function mouseDragged() {
  if (dragStart != null) {
    dragEnd = createVector(mouseX, mouseY);
    const dragDistance = dist(dragStart.x, dragStart.y, dragEnd.x, dragEnd.y);
    const strokeWeightValue = map(dragDistance, 0, width, 5, 30); // map drag distance to stroke weight range
    strokeWeight(strokeWeightValue); // set stroke weight based on drag distance
    stroke(random(20,200),random(20,200),random(20,200), 150);
    strokeCap(SQUARE);
    line(dragStart.x, dragStart.y, dragEnd.x, dragEnd.y);
    refreshPos.y = height / 2 + dragDistance / 6; // refresh(ed) drag distance
    noStroke();
  }
}


function mouseReleased() {
  if (dragStart != null && dragEnd != null && !wordCreated) {
    const dragDistance = dist(dragStart.x, dragStart.y, dragEnd.x, dragEnd.y);
    const launchHeight = map(dragDistance, 0, width, height, 0);
    fireworks.push(new Firework(dragStart.x, height, color(0), launchHeight));
    wordCreated = true;
    
    dragStart = null;
    dragEnd = null;
  }
}

  origRefreshPos.y = refreshPos.y;