"use strict";

function setup() {
  createCanvas(window.innerWidth,window.innerHeight);
  background(0);
}


function draw() {
  background(0);
  // blendMode(ADD);
  let mouse = createVector(mouseX,mouseY);
  let center = createVector(width/2,height/2);
  let mouseToCenter = new p5.Vector.sub(mouse, center);
  stroke(255);
  line(mouseX,mouseY,center.x,center.y);
  text(mouseToCenter.heading(),mouseX,mouseY);
}
