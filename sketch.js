const _RADIUS = 150;
const X_ORIGIN = 200;
const Y_ORIGIN = 200;

function getRandomPointOnCircle(x, y, r) {
  const angle = random(TWO_PI)
  return {
    x: x + cos(angle) * r,
    y: y + sin(angle) * r
  }
}

function getRandomPointInCircle(x, y, r) {
  const angle = random(TWO_PI)
  const radius = random(r)
  return {
    x: x + cos(angle) * radius,
    y: y + sin(angle) * radius
  }
}

let lineNumber = 0;
let NUMBER_OF_LINES;
let previousAnchorPoint, nextAnchorPoint;
let previousControlPoint, nextControlPoint;

function setup() {
  createCanvas(400, 400)
  randomSeed(15) 
  
  background(0)
  noFill()
  stroke(125, 125, 125)
  // circle(X_ORIGIN, Y_ORIGIN, _RADIUS*2)
  
  NUMBER_OF_LINES = random(20, 80)
}

function draw() {
  
    
  // Previous anchor point won't be defined on the 1st iteration
  if (previousAnchorPoint === undefined) {
    previousAnchorPoint = getRandomPointOnCircle(
      X_ORIGIN, 
      Y_ORIGIN, 
      _RADIUS
    )
  }

  // Previous control point won't be defined on the 1st iteration
  if (previousControlPoint === undefined) {
    previousControlPoint = getRandomPointInCircle(
      X_ORIGIN, 
      Y_ORIGIN, 
      _RADIUS
    )
  }

  nextAnchorPoint = getRandomPointOnCircle(
    X_ORIGIN, 
    Y_ORIGIN, 
    _RADIUS
  )
  nextControlPoint = getRandomPointInCircle(
    X_ORIGIN, 
    Y_ORIGIN, 
    _RADIUS
  )

  bezier(
    previousAnchorPoint.x, 
    previousAnchorPoint.y, 
    previousControlPoint.x, 
    previousControlPoint.y,
    nextControlPoint.x,
    nextControlPoint.y,
    nextAnchorPoint.x, 
    nextAnchorPoint.y
  )
  previousAnchorPoint = nextAnchorPoint
  previousControlPoint = nextControlPoint
  
  lineNumber += 1
  if (lineNumber >= NUMBER_OF_LINES) {
    noLoop()
  }

}