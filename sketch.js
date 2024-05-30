let circleDiameter;
let circles = []; // Array for big circles
let redCircles = []; // Array for small red circles
let redCircleAmount = 400;
let animationTime = 0; // Global variable to track animation time

// arrays for the X and Y coordinates for the orange lines
let wavylineX = [2.8, 8.9, 14.9, 0.7, 6.8, 12.7, 19.2, -0.3, 5.8, 11.5, 17.4, 4.3, 10, 16];
let wavylineY = [2.7, 1, 0, 8.9, 7.7, 6.8, 4.2, 15.2, 13.5, 12.8, 10.5, 19.5, 18.5, 17];

// Predefined colors for the big circles
let circleColors = [
  [210, 266, 248],
  [250, 181, 37],
  [255, 231, 233],
  [237, 213, 148],
  [220, 255, 237],
  [252, 179, 138],
  [239, 174, 49],
  [197, 254, 254],
  [251, 222, 131],
  [255, 235, 245],
  [255, 249, 239],
  [255, 247, 248],
  [255, 208, 139],
  [253, 220, 62]
];

// function to create the lines in the background, adapted from https://editor.p5js.org/zygugi/sketches/BJHK3O_yM
function wavyLines(linesX, linesY, lineWeight, lineR, lineG, lineB) {
  noFill();
  stroke(lineR, lineG, lineB);
  strokeWeight(lineWeight);

  beginShape();
  var xoff = 0;
  var yoff = 0.0;
  let noiseY = 0.05;
  let radius = (windowHeight / 20) * 4.2;

  for (var a = 0; a < TWO_PI; a += 0.1) {
    var offset = map(noise(xoff, noiseY), 0, 1, -15, 5);
    var r = radius + offset;
    var x = (windowHeight/20)*linesX + 0.8*r * cos(a);
    var y = (windowHeight/20)*linesY + 0.8*r * sin(a);
    vertex(x, y);
    xoff += 0.5;
  }
  endShape();
}

// Class for small random red circles
class RedCirclePattern {
  constructor(xPos, yPos, radius) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.radius = radius;
    this.color = [230, 101, 18]; // Initial color
  }

  display() {
    fill(this.color);
    noStroke();
    circle(this.xPos, this.yPos, this.radius * 2);
  }

  updateColor() {
    // Change color over time
    this.color = this.color.map(c => (c + 1) % 256);
  }
}

// Class for the biggest Circle Pattern
class CirclePattern {
  constructor(xFactor, yFactor, color) {
    this.xFactor = xFactor;
    this.yFactor = yFactor;
    this.smallCircles = this.generateRandomSmallCircles();
    this.colour = color;
    // Generate random colors for nested circles
    this.r2Color = [random(0, 255), random(0, 255), random(0, 255)];
    this.r3Color = [random(0, 255), random(0, 255), random(0, 255)];
    this.r4Color = [random(0, 255), random(0, 255), random(0, 255)];

    // Generate random colors for additional rings
    this.additionalRingColors = []; // Array for storing colors
    for (let i = 0; i < 5; i++) {
      this.additionalRingColors.push([random(0, 255), random(0, 255), random(0, 255)]);
    }

    this.state = 'moveToCenter'; // Initial state
    this.stateStartTime = millis(); // Record the start time of the current state
  }

  display() {
    fill(this.colour);
    let x = this.xFactor * windowHeight / 20;
    let y = this.yFactor * windowHeight / 20;
    circle(x, y, circleDiameter);

    // draw random small circles
    this.drawRandomSmallCircles();

    // draw nested circles
    this.drawNestedCircles(x, y);
  }

  drawNestedCircles(x, y) {
    // second circle
    let r2 = windowHeight / 20 * 1.5;
    fill(this.r2Color);
    circle(x, y, r2 * 2);

    let r3 = windowHeight / 20 * 1.35;
    fill(this.r3Color);
    circle(x, y, r3 * 2);

    // Additional rings between r3 and r4
    let r4 = windowHeight / 20 * 0.5;
    let ringRadii = [ // Radius of each circle between first circle 3 and circle 4
      windowHeight / 20 * 1.2,
      windowHeight / 20 * 1.0,
      windowHeight / 20 * 0.8,
      windowHeight / 20 * 0.6,
      windowHeight / 20 * 0.4
    ];
    for (let i = 0; i < ringRadii.length; i++) {
      fill(this.additionalRingColors[i]); // Achieve different color fills by calling the data in the array
      circle(x, y, ringRadii[i] * 2);
    }
  }

  /*Creates small random circles inside the larger circle
  This code was adapted from https://editor.p5js.org/slow_izzm/sketches/HyqLs-7AX */
  generateRandomSmallCircles() {
    let smallCircles = [];
    let x = this.xFactor * windowHeight / 20;
    let y = this.yFactor * windowHeight / 20;
    let radius = circleDiameter / 2;
    let smallCircleDiameter = 10; // Smaller diameter
    let maxAttempts = 10000;
    let attempts = 0;

    // a loop that creates small circles until the amount of circles reaches the maximum
    while (smallCircles.length < 100 && attempts < maxAttempts) {
      let angle = random(TWO_PI);
      let distance = random(radius - smallCircleDiameter / 2);
      let randX = x + distance * cos(angle);
      let randY = y + distance * sin(angle);
      let randColor = color(random(255), random(255), random(255));
      let newCircle = { x: randX, y: randY, color: randColor };

      // checks if the circle position will overlap and creates a new circle if there is no overlap
      if (this.isValidPosition(newCircle, smallCircles, smallCircleDiameter)) {
        smallCircles.push(newCircle);
      }

      attempts++;
    }

    return smallCircles;
  }

  // the function that checks if the circles overlap by checking the distance between them
  isValidPosition(newCircle, smallCircles, diameter) {
    for (let circle of smallCircles) {
      let distance = dist(newCircle.x, newCircle.y, circle.x, circle.y);
      if (distance < diameter) {
        return false;
      }
    }
    return true;
  }

  // function that draws the random small circles
  drawRandomSmallCircles() {
    let smallCircleDiameter = 10; // Smaller size of small circles
    noStroke(); // Remove stroke
    for (let smallCircle of this.smallCircles) {
      fill(smallCircle.color);
      circle(smallCircle.x, smallCircle.y, smallCircleDiameter);
    }
  }

  // Function to update the positions of small circles based on the current state
  updateSmallCircles() {
    let x = this.xFactor * windowHeight / 20;
    let y = this.yFactor * windowHeight / 20;
    let radius = circleDiameter / 2;
    let smallCircleDiameter = 10; // Smaller diameter
    let elapsedTime = millis() - this.stateStartTime;

    switch (this.state) { //Source site on how to accomplish the clockwise rotation effect: https://stackoverflow.com/questions/26802817/clockwise-and-then-anticlockwise-rotation-in-javascript
      case 'moveToCenter':
        for (let smallCircle of this.smallCircles) {
          let angle = atan2(smallCircle.y - y, smallCircle.x - x);
          let distance = dist(smallCircle.x, smallCircle.y, x, y);
          let moveSpeed = radius / 2 / 60; // Move speed per frame (2 seconds to move to center)

          distance -= moveSpeed;
          smallCircle.x = x + distance * cos(angle);
          smallCircle.y = y + distance * sin(angle);
        }
        if (elapsedTime > 2000) {
          this.state = 'moveToEdge';
          this.stateStartTime = millis();
        }
        break;

      case 'moveToEdge':
        for (let smallCircle of this.smallCircles) {
          let angle = atan2(smallCircle.y - y, smallCircle.x - x);
          let distance = dist(smallCircle.x, smallCircle.y, x, y);
          let moveSpeed = radius / 60; // Move speed per frame (1 second to move to edge)

          distance += moveSpeed;
          smallCircle.x = x + distance * cos(angle);
          smallCircle.y = y + distance * sin(angle);
        }
        if (elapsedTime > 1000) {
          this.state = 'rotateOnEdge';
          this.stateStartTime = millis();
        }
        break;

      case 'rotateOnEdge':
        for (let smallCircle of this.smallCircles) {
          let angle = atan2(smallCircle.y - y, smallCircle.x - x);
          angle += PI / 90; // Rotate speed (3 seconds to complete a circle)
          smallCircle.x = x + radius * cos(angle);
          smallCircle.y = y + radius * sin(angle);
        }
        if (elapsedTime > 3000) {
          this.state = 'moveToCenterAgain';
          this.stateStartTime = millis();
        }
        break;

      case 'moveToCenterAgain': //https://www.youtube.com/watch?v=wiPwD5nO7Ig
        for (let smallCircle of this.smallCircles) {
          let angle = atan2(smallCircle.y - y, smallCircle.x - x);
          let distance = dist(smallCircle.x, smallCircle.y, x, y);
          let moveSpeed = radius / 60; // Move speed per frame (3 seconds to move to center)

          distance -= moveSpeed;
          smallCircle.x = x + distance * cos(angle);
          smallCircle.y = y + distance * sin(angle);
        }
        if (elapsedTime > 3000) {
          this.state = 'randomDistribution';
          this.stateStartTime = millis();
        }
        break;

      case 'randomDistribution':
        this.smallCircles = this.generateRandomSmallCircles();
        this.state = 'moveToCenter';
        this.stateStartTime = millis();
        break;
    }
  }

  // Function to update the colors of the additional rings
  updateRingColors() { //https://stackoverflow.com/questions/48187722/how-to-change-background-color-of-webpage-every-5-seconds-using-an-array-of-colo
    let colorChangeSpeed = 1; // Speed of color change
    for (let i = 0; i < this.additionalRingColors.length; i++) {
      this.additionalRingColors[i] = this.additionalRingColors[i].map(c => (c + colorChangeSpeed) % 256);
    }
  }

  getX() {
    return this.xFactor * windowHeight / 20;
  }

  getY() {
    return this.yFactor * windowHeight / 20;
  }
}

function setup() {
  createCanvas(windowHeight, windowHeight);
  background(5, 89, 127);
  circleDiameter = (windowHeight / 20) * 5.5;

  // Initialize circles with their respective positions and colors
  for (let i = 0; i < wavylineX.length; i++) {
    circles.push(new CirclePattern(wavylineX[i], wavylineY[i], circleColors[i]));
  }

  /* Create small red circles
  This code was adapted from https://www.youtube.com/watch?v=XATr_jdh-44&t=122s */
  for (let i = 0; i < redCircleAmount; i++) {
    let overlapping = true;
    let redCircle;
    while (overlapping) {
      overlapping = false;
      redCircle = new RedCirclePattern(random(width), random(height), random(0, 10));

      // Check for overlap with other small red circles
      for (let other of redCircles) {
        let d = dist(redCircle.xPos, redCircle.yPos, other.xPos, other.yPos);
        if (d < redCircle.radius + other.radius) {
          overlapping = true;
          break;
        }
      }

      // Check for overlap with big circles
      for (let bigCircle of circles) {
        let d = dist(redCircle.xPos, redCircle.yPos, bigCircle.getX(), bigCircle.getY());
        if (d < redCircle.radius + circleDiameter / 2 + 15) {
          overlapping = true;
          break;
        }
      }
    }
    redCircles.push(redCircle);
  }

  // Update animation time every frame
  setInterval(() => {
    animationTime += 1000 / 60; // Assuming 60 FPS
  }, 1000 / 60);
}

function draw() {
  background(5, 89, 127);

  // draw lines
  for (let t = 0; t < wavylineX.length; t++) {
    wavyLines(wavylineX[t], wavylineY[t], 5, 244, 198, 226);
  }

  // draw inner lines
  for (let t = 0; t < wavylineX.length; t++) {
    wavyLines(wavylineX[t], wavylineY[t], 2, 134, 198, 226);
  }

  // Update and draw all small red circles
  for (let redCircle of redCircles) {
    redCircle.updateColor(); // Update color
    redCircle.display();
  }

  // Update and draw all big circles
  for (let circle of circles) {
    circle.updateSmallCircles();
    circle.updateRingColors();
    circle.display();
  }
}

function windowResized() {
  resizeCanvas(windowHeight, windowHeight);
  circleDiameter = (windowHeight / 20) * 5.5; // Recalculate circleDiameter after resize
  draw(); // Redraw circles to reflect the new dimensions
}