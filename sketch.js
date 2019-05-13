"use strict";

let vehicles = [];
let rows, cols;
let RESOLUTION = 30;
let angles_avoid = [],angles_field=[],angles_changed = [];
let obstacle;
let pattern = 0;
let params = {
  showField:false,
  fluctSpeed: 0.5,
  randomness:0.015,
  interact:false,
}

let gui = new dat.GUI();
gui.add(params,'showField');
gui.add(params,'fluctSpeed',0.1,1).listen();
gui.add(params,'randomness',0.001,0.1).listen();
gui.add(params,'interact');

function setup() {
  createCanvas(window.innerWidth,window.innerHeight);
  background(0);

  rows = ceil(width / RESOLUTION);
  cols = ceil(height / RESOLUTION);

  obstacle = new Obstacle(width/2,height/2,30);
  for(let i=0;i<2000;i++){
    let x=random(width),y=random(height);
    while((x<=obstacle.pos.x+obstacle.rad*1.5)&&(x>=obstacle.pos.x-obstacle.rad*1.5)&&(y<=obstacle.pos.y+obstacle.rad*1.5)&&(y>=obstacle.pos.y-obstacle.rad*1.5)){
        x = random(width);
        y = random(height);
    }
    vehicles.push(new Vehicle(x, y));
  }
}


function draw() {
  background(0,10);
  // blendMode(ADD);
  vehicles.splice(0,10);
  for(let i=0;i<10;i++){
    let x=random(width),y=random(height);
    while((x<=obstacle.pos.x+obstacle.rad*2)&&(x>=obstacle.pos.x-obstacle.rad*2)&&(y<=obstacle.pos.y+obstacle.rad*2)&&(y>=obstacle.pos.y-obstacle.rad*2)){
      x = random(width);
      y = random(height);
    }
    vehicles.push(new Vehicle(x, y));
  }

//*************flowfiled*************
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      let index = r + c * rows;
      let x = r * RESOLUTION;
      let y = c * RESOLUTION;

      //<-------Pattern------->
      let freqX = (x+params.fluctSpeed*frameCount)*params.randomness;
      let freqY = (y+params.fluctSpeed*frameCount)*params.randomness;
      let noiseVal, angle;
      if(pattern == 0){
        noiseVal = sin(freqY);
        angle = map(noiseVal, -1, 1, 0, PI/4);
      }else if(pattern == 1){
        noiseVal = sin(freqY+freqX)+cos(freqX-freqY);
        angle = map(noiseVal, -1, 1, PI/4, PI/2);
      }else if(pattern == 2){
        noiseVal = sin(freqX)+cos(freqY);
        angle = map(noiseVal, -1, 1, 0,PI*2);
      }else if(pattern == 3){
        noiseVal = sin(Math.sqrt(freqX)+cos(Math.sqrt(freqY)));
        angle = map(noiseVal, -1, 1, 0,PI*2);
      }else if(pattern == 4){
        noiseVal = cos(freqX*freqY)+sin(Math.log(freqY));
        angle = map(noiseVal, -1, 1, PI/2,PI/4*3)*3;
      }else if(pattern == 5){
        noiseVal = cos(freqX/freqY)+cos(Math.pow(freqY,2));
        angle = map(noiseVal, -1, 1, 0,PI/2);
      }else if(pattern == 6){
        noiseVal = cos(Math.log(freqX))+cos(Math.log(freqY));
        angle = map(noiseVal, -1, 1, 0,PI/2)*3;
      }else {
        noiseVal = cos(freqX+freqY);
        angle = map(noiseVal, -1, 1, 0,PI*4);
      }

      let vecGrid = createVector(x,y);
      //<--------Mouse-------->
      if(params.interact){
        let vecMouse = createVector(mouseX,mouseY);
        let vecToMouse = p5.Vector.sub(vecMouse,vecGrid);
        let angleFromMouse = vecToMouse.heading();
        let angleTurn = angle + angleFromMouse - PI/2;
        angles_field[index] = angleTurn;
      }else{
        angles_field[index] = angle;
      }

      //<--------Obstacle-------->
      let vecPoint = createVector(obstacle.pos.x,obstacle.pos.y);
      let vecFromGrid = p5.Vector.sub(vecPoint,vecGrid);
      let angleFromPoint = vecFromGrid.heading();
      angles_avoid[index] = angle+angleFromPoint+PI/4;
      angles_changed[index] = PI+angles_avoid[index];

      //<------showField------>
      if(params.showField){
        showField(x,y,angles_field[index],angles_avoid[index],angles_changed[index],index);
      }
    }
  }


//**************vehicles*****************
  let c;
  for (let i = 0; i < vehicles.length; i++) {
    let v = vehicles[i];
    let r = floor(v.pos.x / RESOLUTION);
    let c = floor(v.pos.y / RESOLUTION);
    let angleIndex = r + c * rows;
    
    //<-----predict collision = angleBetween---->
    let distance = new p5.Vector.sub(obstacle.pos,v.pos);
    let angleVector = new p5.Vector.fromAngle(angles_field[angleIndex]);
    let approach = angleVector.angleBetween(distance);
    // let diff = Math.abs(angleVector.heading())-Math.abs(distance.heading());
    noStroke();
    fill(255);
    if(distance.mag()<obstacle.rad*2&&(approach>2.55||approach<1)){
      c = color(255,200,150);
      if(Math.abs(v.vel.x)>Math.abs(v.vel.y)){
        if(v.pos.y<obstacle.pos.y){
          v.flow(PI+angles_avoid[angleIndex]);
        }else{
          v.flow(angles_avoid[angleIndex]);
        }
      }else{
        if(v.pos.x>obstacle.pos.x){
          v.flow(PI+angles_avoid[angleIndex]);
        }else{
          v.flow(angles_avoid[angleIndex]);
        }
      }
    }else{
      c = color(255,255,255);
      v.flow(angles_field[angleIndex]);
    }

    //<---vehicle--->
    v.update();
    v.reappear();
    v.display(c);
  }

  obstacle.display();
}

//**********drawField************
function showField(x,y,angleA,angleF,angleC,index){
  // let vector = p5.Vector.fromAngle(angleA);
  // vector.mult(RESOLUTION/2);
  push();
  translate(x,y);
  noFill();
  stroke(200,10);
  rect(0, 0, RESOLUTION, RESOLUTION);
  pop();
  //<---FlowField(with/out mouse)--->
  push();
  translate(x,y);
  stroke(255,0,0,20);
  translate(RESOLUTION/2,RESOLUTION/2);
  rotate(angleA);
  line(0, 0, RESOLUTION/2, 0);
  pop();
  //<---AvoidField--->
  push();
  translate(x,y);
  stroke(255,255,0,20);
  translate(RESOLUTION/2,RESOLUTION/2);
  rotate(angleF);
  line(0, 0, RESOLUTION/2, 0);
  pop();
  //<---ChangedField--->
  push();
  translate(x,y);
  stroke(0,255,255,20);
  translate(RESOLUTION/2,RESOLUTION/2);
  rotate(angleC);
  line(0, 0, RESOLUTION/2, 0);
  pop();

  // text(index, x+10, y+20);
}

//********changePattern*********
function keyPressed(){
  if(pattern<7){
    pattern ++;
  }else{
    pattern = 0;
  }
}


//<-----------------------Backup Noise Field
// let fructSpeed = 0.001;
// let randomness = 0.01;
// let freqX = (x*frameCount*fructSpeed)*randomness;
// let freqY = (y*frameCount*fructSpeed)*randomness;
// let noiseVal = noise(freqX,freqY);
// let sinVal = sin(0.1);

// let mouseVal = map(mouseX,0,width,0,PI);
// let angle = map(noiseVal,0,1,0,2*PI);
