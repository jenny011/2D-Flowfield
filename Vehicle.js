class Vehicle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.prevVel = this.vel;
    this.avoid = false;
    this.acc = createVector();
    this.angle = 0;
    this.maxSpeed = 1.5;
    this.maxSteerForce = 0.1;
    this.brakeRad = 30;
    this.avoidArea = 20;
  }
  update() {
    this.vel.add(this.acc);
    if(this.avoid == false){
      this.prevVel = this.vel;
    }
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.angle = this.vel.heading();
  }
  applyForce(f) {
    let force = f.copy();
    this.acc.add(force);
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

  display(color) {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    //fill(0, 30);
    let sinVal = sin(frameCount * 0.1);
    // let a = map(sinVal,-1,1,0,50);
    stroke(color);
    // stroke(150,200,255);
    // triangle(0, 0, -15, 5, -15, -5);
    point(0,0);
    // ellipse(0,0,2,2);
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
    // rectMode(CENTER);
    ellipse(0, 0, this.rad*2, this.rad*2);
    pop();
  }
}
