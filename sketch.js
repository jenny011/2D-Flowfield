"use strict";

let vehicles = [];
let rows, cols;
// let RESOLUTION = 30;
let angles_avoid = [],angles_field=[],angles_changed = [];
let obstacle;
let obstacles=[];
let pattern = 0;
let params = {
  showField:false,
  fluctSpeed: 0.7,
  randomness:0.015,
  interact:false,
  RESOLUTION: 10,
  color: "#FFCCEE",
  Ocolor:"#456789",
}

let gui = new dat.GUI();
gui.add(params,'showField',false,true);
gui.add(params,'fluctSpeed',0.1,1).listen();
gui.add(params,'randomness',0.001,0.1).listen();
gui.add(params,'RESOLUTION',20,60,10).listen();
gui.add(params,'interact',false,true);
gui.addColor(params, "color");
gui.addColor(params, "Ocolor");

function setup() {
  createCanvas(window.innerWidth,window.innerHeight);
  background(0);

  rows = ceil(width / params.RESOLUTION);
  cols = ceil(height / params.RESOLUTION);

  obstacles.push(new Obstacle(width/2,height/2,30 ));
  // obstacle = new Obstacle(width/2,height/2,30 );
  for(let i=0;i<2000;i++){
    let x=random(width),y=random(height);
      for(let j=0;j<obstacles.length;j++){
        while((x<=obstacles[j].pos.x+obstacles[j].rad*1.5)&&(x>=obstacles[j].pos.x-obstacles[j].rad*1.5)&&(y<=obstacles[j].pos.y+obstacles[j].rad*1.5)&&(y>=obstacles[j].pos.y-obstacles[j].rad*1.5)){
            x = random(width);
            y = random(height);
        }
      }
    vehicles.push(new Vehicle(x, y));
  }
}


function draw() {
  background(0,10);
  // blendMode(ADD);
  for(let i=0;i<obstacles.length;i++){
    obstacles[i].color = params.Ocolor;
  }
  vehicles.splice(0,10);
  for(let i=0;i<10;i++){
    let x=random(width),y=random(height);
    for(let j=0;j<obstacles.length;j++){
      while((x<=obstacles[j].pos.x+obstacles[j].rad*1.5)&&(x>=obstacles[j].pos.x-obstacles[j].rad*1.5)&&(y<=obstacles[j].pos.y+obstacles[j].rad*1.5)&&(y>=obstacles[j].pos.y-obstacles[j].rad*1.5)){
          x = random(width);
          y = random(height);
      }
    }
    vehicles.push(new Vehicle(x, y));
  }

//*************flowfiled*************
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      let index = r + c * rows;
      let x = r * params.RESOLUTION;
      let y = c * params.RESOLUTION;

      //<-------Pattern------->
      let freqX = (x+params.fluctSpeed*frameCount)*params.randomness;
      let freqY = (y+params.fluctSpeed*frameCount)*params.randomness;
      let value, angle;
      let noiseVal = noise(freqX,freqY);
      if(pattern == 0){
        value = sin(freqY);
        angle = map(value, -1, 1, 0, PI/4);
      }else if(pattern == 1){
        value = sin(freqY+freqX)+cos(freqX-freqY);
        angle = map(value, -1, 1, PI/4, PI/2);
      }else if(pattern == 2){
        value = sin(freqX)+cos(freqY);
        angle = map(value, -1, 1, 0,PI*2);
      }else if(pattern == 3){
        value = sin(Math.sqrt(freqX)+cos(Math.sqrt(freqY)));
        angle = map(value, -1, 1, 0,PI*2);
      }else if(pattern == 4){
        value = cos(freqX/freqY)+cos(Math.pow(freqY,2));
        angle = map(value, -1, 1, 0,PI/2);
      }else if(pattern == 5){
        value = cos(Math.log(freqX))+cos(Math.log(freqY));
        angle = map(value, -1, 1, 0,PI/2)*3;
      }else {
        value = cos(freqX+freqY)*noiseVal;
        angle = map(value, -1, 1, 0,PI*4);
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

      //<------showField------>
      if(params.showField){
        showField(x,y,angles_field[index],angles_avoid[index],angles_changed[index],index);
      }
    }
  }


//**************vehicles*****************
  for (let i = 0; i < vehicles.length; i++) {
    let v = vehicles[i];
    let r = floor(v.pos.x / params.RESOLUTION);
    let c = floor(v.pos.y / params.RESOLUTION);
    let angleIndex = r + c * rows;

    noStroke();
    fill(255);
    v.flow(angles_field[angleIndex]);

    //<---vehicle--->
    v.color = params.color;
    for(let i=0;i<obstacles.length;i++){
      v.avoidObstacle(obstacles[i]);
    }
    v.update();
    v.reappear();
    v.display();
  }

  for(let i=0;i<obstacles.length;i++){
    obstacles[i].display();
  }
}

//**********drawField************
function showField(x,y,angleA,angleF,angleC,index){
  push();
  translate(x,y);
  noFill();
  stroke(200,10);
  rect(0, 0, params.RESOLUTION, params.RESOLUTION);
  pop();
  //<---FlowField(with/out mouse)--->
  push();
  translate(x,y);
  stroke(255,0,0,20);
  translate(params.RESOLUTION/2,params.RESOLUTION/2);
  rotate(angleA);
  line(0, 0, params.RESOLUTION/2, 0);
  pop();
}

//********changePattern*********
function keyPressed(){
  if(pattern<6){
    pattern ++;
  }else{
    pattern = 0;
  }
  obstacles.splice(0,3);
}
function mousePressed(){
  if((mouseX>width*0.65&&mouseY<height*0.34)==false){
    if(obstacles.length<3){
      obstacles.push(new Obstacle(mouseX,mouseY,random(10,60)));
    }else{
      obstacles.splice(0,1);
      obstacles.push(new Obstacle(mouseX,mouseY,random(10,60)));
    }
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
