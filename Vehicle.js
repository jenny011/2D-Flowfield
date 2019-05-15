class Vehicle {
  constructor(x, y,color) {
    this.pos = createVector(x, y);
    this.vel = createVector();
    this.prevVel = this.vel;
    this.avoid = false;
    this.acc = createVector();
    this.angle = 0;
    this.maxSpeed = 2;
    this.maxSteerForce = 1.7;
    this.maxSteer = 1.7;
    this.avoidArea = 15;
    this.color = color;
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
      let s = map(distance, 0, this.avoidArea + obstacle.rad, -5, -2);
      desired.mult(s*100/distance);
      let steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxSteerForce);
      this.applyForce(steer);
      // desired.normalize();
      // // decrease
      // let mappedSpeed = map(distance, 0, obstacle.brakeRad,this.maxSpeed, 0)
      // desired.mult(-mappedSpeed);
      // // steering force
      // let steer = p5.Vector.sub(desired, this.vel);
      // steer.limit(this.maxSteerForce);
      // // apply
      // this.applyForce(steer);
    }
  }

  flow(angle) {
    // desiredVel
    let desiredVel = p5.Vector.fromAngle(angle);
    desiredVel.setMag(this.maxSpeed);
    // steeringForce
    let steerForce = p5.Vector.sub(desiredVel, this.vel);
    steerForce.limit(this.maxSteer);
    // apply
    this.applyForce(steerForce);
  }

  reappear() {
    if (this.pos.x < 0||this.pos.x > width||this.pos.y < 0||this.pos.y > height) {
      let x=random(width),y=random(height);
      for(let j=0;j<obstacles.length;j++){
        while((x<=obstacles[j].pos.x+obstacles[j].rad*1.5)&&(x>=obstacles[j].pos.x-obstacles[j].rad*1.5)&&(y<=obstacles[j].pos.y+obstacles[j].rad*1.5)&&(y>=obstacles[j].pos.y-obstacles[j].rad*1.5)){
            x = random(width);
            y = random(height);
        }
      }
      this.pos.x = x;
      this.pos.y = y;
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    let sinVal = sin(frameCount * 0.1);
    stroke(red(this.color)*1.5/this.vel.mag(),green(this.color)*1.5/this.vel.mag(),blue(this.color)*1.5/this.vel.mag());
    point(0,0);
    pop();
  }
}


class Obstacle{
  constructor(x,y,size){
    this.pos = createVector(x,y);
    this.rad = size;
    this.color = color(0,random(50,100),random(50,100));
  }
  display(){
    push();
    translate(this.pos.x,this.pos.y);
    fill(red(this.color),green(this.color),blue(this.color),20);
    ellipse(0, 0, this.rad*2, this.rad*2);
    fill(red(this.color),green(this.color),blue(this.color),40);
    ellipse(0, 0, this.rad*1.75, this.rad*1.75);
    fill(red(this.color),green(this.color),blue(this.color),50);
    ellipse(0, 0, this.rad*1.4, this.rad*1.4);
    fill(red(this.color),green(this.color),blue(this.color),255);
    ellipse(0, 0, this.rad, this.rad);
    pop();
  }
}
