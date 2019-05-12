"use strict";

let vehicles = [];
let rows, cols;
let RESOLUTION = 10;
let angles = [],angles1=[];
let obstacle;

function setup() {
  createCanvas(window.innerWidth,window.innerHeight);
  background(0);

  rows = ceil(width / RESOLUTION);
  cols = ceil(height / RESOLUTION);

  obstacle = new Obstacle(width/2-100,height/2+200,15);
  for(let i=0;i<1000;i++){
    vehicles.push(new Vehicle(random(width), random(height)));
  }
}


function draw() {
  background(0,10);
  // blendMode(ADD);
  vehicles.splice(0,10);
  for(let i=0;i<10;i++){
    let x=random(width),y=random(height);
    while((x<=obstacle.pos.x+obstacle.rad*2.5)&&(x>=obstacle.pos.x-obstacle.rad*2.5)&&(y<=obstacle.pos.y+obstacle.rad*2.5)&&(y>=obstacle.pos.y-obstacle.rad*2.5)){
      x = random(width);
      y = random(height);
    }
    vehicles.push(new Vehicle(x, y));
  }
  // flow field
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      let index = r + c * rows;
      let x = r * RESOLUTION;
      let y = c * RESOLUTION;


      //Patterns
      let fluctSpeed = 0.5;
      let randomness = 0.015;
      let freqX = (x+fluctSpeed*frameCount)*randomness;
      let freqY = (y+fluctSpeed*frameCount)*randomness;
      // let noiseVal = sin(freqY);
      // let angle = map(noiseVal, -1, 1, 0, PI/4);
      // let noiseVal = sin(freqY+freqX)+cos(freqX-freqY);
      // let angle = map(noiseVal, -1, 1, PI/4, PI/2);
      let noiseVal = sin(freqX)+cos(freqY);
      let angle = map(noiseVal, -1, 1, 0,PI*2);
      // let noiseVal = sin(Math.sqrt(freqX)+cos(Math.sqrt(freqY)));
      // let angle = map(noiseVal, -1, 1, 0,PI*2);
      // let noiseVal = cos(freqX*freqY)+cos(Math.log(freqY));
      // let angle = map(noiseVal, -1, 1, PI/2,PI/4*3)*3;
      // let noiseVal = sin(cos(freqX*freqY)+cos(Math.pow(freqY,2)));
      // let angle = map(noiseVal, -1, 1, 0,PI/2);
      // let noiseVal = cos(Math.log(freqX))+cos(Math.log(freqY));
      // let angle = map(noiseVal, -1, 1, 0,PI/2)*3;
      // let noiseVal = cos(freqX+freqY);
      // let angle = map(noiseVal, -1, 1, 0,PI/4);

      // fluctSpeed = 0.001;
      // randomness = 0.01;
      // noiseVal = noise(freqX,freqY);
      // let sinVal = sin(0.1);
      angles1[index] = angle;

      let vecMouse = createVector(mouseX,mouseY);
      let point = createVector(obstacle.pos.x,obstacle.pos.y);
      let vecGrid = createVector(x,y);
      // let point = createVector(100,100);
      let vecFromGrid = p5.Vector.sub(point,vecGrid);
      let angleFromMouse = -0.1*vecFromGrid.heading();
      // let angle = map(sinVal,-1,1,0,2*PI);


      angles[index] = angle+angleFromMouse+PI/2;
      // let fructSpeed = 0.001;
      // let randomness = 0.01;
      // let freqX = (x*frameCount*fructSpeed)*randomness;
      // let freqY = (y*frameCount*fructSpeed)*randomness;
      // let noiseVal = noise(freqX,freqY);
      // let sinVal = sin(0.1);
      //
      // let vecMouse = createVector(mouseX,mouseY);
      // let vecGrid = createVector(x,y);
      // let vecFromGrid = p5.Vector.sub(vecMouse,vecGrid);
      // let angleFromMouse = vecFromGrid.heading();
      // let angle = map(sinVal,-1,1,0,2*PI);
      // angle = angle + angleFromMouse - PI/2;

      // let mouseVal = map(mouseX,0,width,0,PI);
      // let angle = map(noiseVal,0,1,0,2*PI);
      // let vector = p5.Vector.fromAngle(angle);
      // vector.mult(RESOLUTION/2);
      // angles.push(angle);
      // push();
      // translate(x,y);
      // noFill();
      // stroke(200,10);
      // rect(0, 0, RESOLUTION, RESOLUTION);
      //
      // stroke(200,10);
      // translate(RESOLUTION/2,RESOLUTION/2);
      // rotate(angle);
      // line(0, 0, RESOLUTION/2, 0);
      //
      // pop();
      // text(index, x+10, y+20);
    }
  }


  // vehicles
  for (let i = 0; i < vehicles.length; i++) {
    let v = vehicles[i];

    let r = floor(v.pos.x / RESOLUTION);
    let c = floor(v.pos.y / RESOLUTION);
    let angleIndex = r + c * rows;
    let distance = new p5.Vector.sub(v.pos,obstacle.pos);
    let angleVector = new p5.Vector.fromAngle(angles1[angleIndex]);
    let approach = angleVector.angleBetween(distance);
    if(distance.mag()<obstacle.rad*2.5&&approach>2.5){
      v.flow(angles[angleIndex]); // direction
    }else{
      v.flow(angles1[angleIndex]);
    }

    //v.seek(target);
    v.avoidObstacle(obstacle);
    v.update();
    v.reappear();
    v.display();
  }

  obstacle.display();
}


class Vehicle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.acc = createVector();
    this.angle = 0;
    this.maxSpeed = 1.5;
    this.maxSteerForce = 0.1;
    this.brakeRad = 30;
    this.avoidArea = 20;
  }
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.angle = this.vel.heading();
  }
  applyForce(f) {
    let force = f.copy();
    this.acc.add(force);
  }

  seek(target) {
    // desiredVel
    let desiredVel = p5.Vector.sub(target, this.pos);
    desiredVel.setMag(this.maxSpeed);
    // steeringForce
    let steerForce = p5.Vector.sub(desiredVel, this.vel);
    steerForce.limit(this.maxSteerForce);
    // apply
    this.applyForce(steerForce);
  }

  avoidObstacle(obstacle){
    let desired = p5.Vector.sub(obstacle.pos, this.pos);
    let distance = desired.mag();
    if (distance < this.avoidArea + obstacle.rad) {
      desired.normalize();
      if (distance < this.brakeRad) {
        desired.normalize();
        // decrease
        let mappedSpeed = map(distance, 0, obstacle.brakeRad, 0, this.maxSpeed)
        desired.mult(-mappedSpeed);
      } else {
        desired.mult(-this.maxSpeed);
      }
      // steering force
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxSteerForce);
      // apply
      this.applyForce(steer);
    }
  }

  flow(angle) {
    // desiredVel
    let desiredVel = p5.Vector.fromAngle(angle);
    desiredVel.setMag(this.maxSpeed);
    // steeringForce
    let steerForce = p5.Vector.sub(desiredVel, this.vel);
    steerForce.limit(this.maxSteerForce);
    // apply
    this.applyForce(steerForce);
  }

  reappear() {
    if (this.pos.x < 0||this.pos.x > width||this.pos.y < 0||this.pos.y > height) {
      let x=random(width),y=random(height);
      while((x<=obstacle.pos.x+obstacle.rad*3)&&(x>=obstacle.pos.x-obstacle.rad*4)&&(y<=obstacle.pos.y+obstacle.rad*3)&&(y>=obstacle.pos.y-obstacle.rad*3)){
        x = random(width);
        y = random(height);
      }
      this.pos.x = x;
      this.pos.y = y;
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    //fill(0, 30);
    let sinVal = sin(frameCount * 0.1);
    // let a = map(sinVal,-1,1,0,50);
    // stroke(50,60,150,100);
    stroke(150,200,255);
    // triangle(0, 0, -15, 5, -15, -5);
    point(0,0);
    pop();
  }
}


class Obstacle{
  constructor(x,y,size){
    this.pos = createVector(x,y);
    this.rad = size;
    this.color = color(0,random(50,100),random(50,100));
    this.brakeRad = this.rad*10;
  }
  display(){
    push();
    translate(this.pos.x,this.pos.y);
    // noStroke();
    stroke(this.color);
    fill(red(this.color),green(this.color),blue(this.color),30);
    rectMode(CENTER);
    rect(0, 0, this.rad*2, this.rad*2);
    pop();
  }
}


//
//
// "use strict"
//
// var RESOLUTION = 5;
// var nPar = 80;
// var angles = [];
// var vehicles = [];
// var rows, cols;
// var x, y;
// var mousePositions = [];
// var dropRadius;
//
// var nVal; // noise value
// var nInt; // noise intensity
// var nAmp; // noise amplitude
//
// var params = {
//   Hue: 210,
//   dropRadius: 160,
//   inkRadius: 5,
//   flowField_direction: 1,
//   flowField_fluctuation: 1.09,
//   flowField_randomness: 0.04,
//   flowField_randomValue: 1,
//   black_background: false,
//   FLOWING_CANVAS: false,
//   SHOW_FLOWFIELD: false
// }
//
// var gui = new dat.gui.GUI();
// gui.add(params, 'Hue', 0, 360, 1);
// gui.add(params, 'dropRadius', 100, 200);
// gui.add(params, 'inkRadius', 3, 10);
// gui.add(params, 'flowField_direction', -1, 1, 1);
// gui.add(params, 'flowField_fluctuation', 0.75, 1.25);
// gui.add(params, 'flowField_randomness', 0.01, 0.10);
// gui.add(params, 'flowField_randomValue', -10, 10);
// gui.add(params, 'black_background');
// gui.add(params, 'FLOWING_CANVAS');
// gui.add(params, 'SHOW_FLOWFIELD');
//
//
// function setup() {
//   createCanvas(760, 600);
//   smooth();
//   // // if (params.black_background == true) {
//   //   blendMode(HARD_LIGHT);
//   //   background(5);
//   // }
//   colorMode(HSB);
//   background(220);
//
//   rows = ceil(width / RESOLUTION);
//   cols = ceil(height / RESOLUTION);
// }
//
// function draw() {
//   // background(220);
//   for (var c = 0; c < cols; c++) {
//     for (var r = 0; r < rows; r++) {
//       var x = r * RESOLUTION;
//       var y = c * RESOLUTION;
//
//       //noise
//       var freqX = (x + frameCount * params.flowField_fluctuation) * params.flowField_randomness;
//       var freqY = (y + frameCount * params.flowField_fluctuation) * params.flowField_randomness;
//       var noiseValue = random(0.2, 1) * (sin(freqX) + cos(freqY)) * params.flowField_randomValue;
//       var angleFromNoise = noiseValue * TWO_PI; // 0 - 360
//
//       var pos = createVector(x + RESOLUTION / 2 * noiseValue * 0.85, y + RESOLUTION / 2 * noiseValue * 0.85);
//       var angle = angleFromNoise;
//
//       for (var i = 0; i < mousePositions.length; i++) {
//         var mousePos = mousePositions[i];
//         var vector = p5.Vector.sub(mousePos, pos);
//         var range = vector.mag();
//         var damp = 0;
//
//         if (range < dropRadius / 2) {
//           if (params.FLOWING_CANVAS != true) {
//             var angleFromMouse = vector.heading() + params.flowField_direction * PI / 2 + random(-0.005, 0.005, 0.001) * map(range, 0, dropRadius / 2, -angleFromNoise, angleFromNoise);
//             angle = angleFromMouse + 0.02 * map(range, 0, dropRadius / 2, 0, angleFromNoise);
//           } else {
//             angle = angleFromNoise;
//           }
//         }
//       }
//       var index = r + c * rows; // x + y * width
//       angles[index] = angle;
//
//       if (params.SHOW_FLOWFIELD) {
//         push();
//         translate(x, y);
//
//         noFill();
//
//         push();
//         translate(RESOLUTION / 2, RESOLUTION / 2);
//         rotate(angle);
//         stroke(0, 100);
//         line(0, 0, RESOLUTION / 2, 0);
//         pop();
//
//         pop();
//       }
//     }
//   }
//
//   for (var i = 0; i < vehicles.length; i++) {
//     var v = vehicles[i];
//     var r = floor(v.pos.x / RESOLUTION);
//     var c = floor(v.pos.y / RESOLUTION);
//     var index = r + c * rows;
//
//     v.flow(angles[index]);
//     v.update();
//     // if (v.isDead()) {
//     //   vehicles.splice(i, 1);
//     // }
//     v.display();
//   }
// }
//
// function keyPressed() {
//   dropRadius = random(params.dropRadius - 20, params.dropRadius + 20, 5);;
//   mousePositions.push(createVector(mouseX, mouseY));
//   nInt = map(mouseX, 0, width, 0.11, 50); // map mouseX to noise intensity
//
//   push();
//   translate(mouseX, mouseY);
//   noFill();
//   pop();
//
//   push();
//   for (var a = 0; a <= TWO_PI; a += TWO_PI / nPar) {
//     nVal = map(noise(cos(a) * nInt + 1, sin(a) * nInt + 1, frameCount * 0.008), 0.0, 1.0, 0, 0.67); // map noise value to match the amplitude
//     var innerRadius = random(130, 140, 1);
//     x = abs(dropRadius - innerRadius) * cos(a) * nVal;
//     y = abs(dropRadius - innerRadius) * sin(a) * nVal;
//     var hsba_H = round(map(mouseX, 0, width, 170, 250));
//     var hsba_S = round(map(mouseX, 0, width, 40, 100));
//     var hsba_B = round(map(mouseY, 0, height, 40, 100));
//     var hsba_A = random(0.0, 0.15, 0.01);
//     var clr = color('hsba(' + round(random(abs(params.Hue - 15), params.Hue + 15, 1)) + ', ' + hsba_S + '%, ' + hsba_B + '%, ' + hsba_A + ')');
//     vehicles.push(new Vehicle(mouseX + x, mouseY + y, clr));
//   }
//   pop();
// }
//
//
// class Vehicle {
//   constructor(x, y, c) {
//     this.pos = createVector(x, y);
//     this.vel = createVector();
//     this.acc = createVector();
//     this.angle = 0;
//
//     this.maxDesiredVel = 3.25;
//     this.maxSteerForce = 2.34;
//     this.c = c;
//     this.lifespan = 400.0;
//   }
//
//   update() {
//     this.vel.add(this.acc);
//     this.pos.add(this.vel);
//     this.acc.mult(0);
//     this.angle = this.vel.heading();
//     this.lifespan -= 1;
//   }
//
//   applyForce(f) {
//     this.acc.add(f);
//   }
//
//   seek(target) {
//     var desiredVel = p5.Vector.sub(target, this.pos);
//     desiredVel.normalize();
//     desiredVel.mult(this.maxDesiredVel);
//
//     var steerForce = p5.Vector.sub(desiredVel, this.vel);
//     steerForce.limit(this.maxSteerForce);
//     this.applyForce(steerForce);
//   }
//
//   flow(angle) {
//     var desiredVel = p5.Vector.fromAngle(angle);
//     desiredVel.mult(this.maxDesiredVel * 0.58);
//
//     var steerForce = p5.Vector.sub(desiredVel, this.vel);
//     steerForce.limit(this.maxSteerForce * 1.89);
//     this.applyForce(steerForce);
//   }
//   checkEdges() {
//     // x axis
//     if (this.pos.x < 0) {
//       this.pos.x = width;
//     } else if (this.pos.x > width) {
//       this.pos.x = 0;
//     }
//     // y axis
//     if (this.pos.y < 0) {
//       this.pos.y = height;
//     } else if (this.pos.y > height) {
//       this.pos.y = 0;
//     }
//   }
//
//   isDead() {
//     if (this.lifespan < 0) {
//       return true;
//     } else {
//       return false;
//     }
//   }
//
//   display() {
//     push();
//     translate(this.pos.x, this.pos.y);
//     rotate(this.angle);
//     noStroke();
//     fill(this.c, 10);
//     var r = random(params.inkRadius - 2, params.inkRadius + 2, 0.5);
//     ellipse(0, 0, r, r);
//     pop();
//   }
// }
