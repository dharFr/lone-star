const COLOR_MODE_VARIATIONS = "variations";
const COLOR_MODE_LINE_COLOR = "lineColor";
const COLOR_MODE_RANDOM = "random";

// Parameters are sent to createControlPanel
// to generate the UI at runtime.
const parameters = {
  seed: {
    min: 0,
    max: 100,
    value: 50,
  },
  numberOfLines: {
    min: 1,
    max: 300,
    value: 50,
  },
  maxLineWeight: {
    min: 1,
    max: 12,
    value: 5,
  },
  colorMode: {
    options: [
      COLOR_MODE_VARIATIONS, // Variations based on lineColor
      COLOR_MODE_LINE_COLOR, // lineColor with variations on alpha channel
      COLOR_MODE_RANDOM, // Random colors (lineColor is ignored)
    ],
    value: 0,
  },
  lineColor: {
    value: "#942192",
  },
};

const links = {
  author: {
    name: "O. Audard",
    link: "https://olivier.audard.net/",
  },
  source: {
    name: "Github",
    link: "https://github.com/dharFr/lone-star",
  },
};

function getRandomPointOnCircle(x, y, r) {
  const angle = random(TWO_PI);
  return {
    x: x + cos(angle) * r,
    y: y + sin(angle) * r,
  };
}

function getRandomPointInCircle(x, y, r) {
  const angle = random(TWO_PI);
  const radius = random(r);
  return {
    x: x + cos(angle) * radius,
    y: y + sin(angle) * radius,
  };
}

function getRandomColor() {
  return color(
    ceil(random(255)),
    ceil(random(255)),
    ceil(random(255)),
    ceil(random(255))
  );
}

function getRandomVariationFromColor(c, alphaOnly = false) {
  // console.log('in color:', c.toString())
  const VARIATION_AMPLITUDE = 80;

  const CHOICE_RED = 0;
  const CHOICE_GREEN = 1;
  const CHOICE_BLUE = 2;
  const CHOICE_ALPHA = 3;

  const variation = ceil(random(VARIATION_AMPLITUDE) - VARIATION_AMPLITUDE / 2);
  const choice = alphaOnly ? CHOICE_ALPHA : ceil(random(4));

  switch (choice) {
    case CHOICE_RED:
      // console.log('variation:', variation, 'on red')
      c.setRed(capValue(0, 255, red(c) + variation));
      break;
    case CHOICE_GREEN:
      // console.log('variation:', variation, 'on green')
      c.setGreen(capValue(0, 255, green(c) + variation));
      break;
    case CHOICE_BLUE:
      // console.log('variation:', variation, 'on blue')
      c.setBlue(capValue(0, 255, blue(c) + variation));
      break;
    default:
      // console.log('variation:', variation, 'on alpha')
      c.setAlpha(capValue(85, 255, alpha(c) + variation));
      break;
  }

  // console.log('out color:', c.toString())
  // console.log('=========')
  return c;
}

// val = 260, max = 255, min = 0
// 260 > 255 --> ret = 0 + (260 - 255) = 5
//
// val = 10, max = 255, min = 20
// 10 < 20 --> ret = 255 - (20 - 10)
//
// val = 152, max: 255, min: 0
//
function capValue(min, max, val) {
  if (val < min) {
    return max - (min - val);
  }
  if (val > max) {
    return min + (val - max);
  }
  return val;
}

let previousAnchorPoint, nextAnchorPoint;
let previousControlPoint, nextControlPoint;

let currentColor;
let currentLineWidth;

let CANVAS_SIZE, _RADIUS, X_ORIGIN, Y_ORIGIN;

// Constant Values actually depend on viewport size
// We'll compute them once during setup, and then everytime
// the window is resized.
function computeConstants() {
  // CANVAS_SIZE = 400;
  CANVAS_SIZE = Math.min(window.innerWidth, window.innerHeight);
  _RADIUS = (CANVAS_SIZE * 3) / 8;
  X_ORIGIN = CANVAS_SIZE / 2;
  Y_ORIGIN = CANVAS_SIZE / 2;
}

function watermark(serial, url) {
  textSize(max(9, CANVAS_SIZE * 0.02)); // 700 * 0.02 = 14
  textAlign(RIGHT);
  stroke(127);
  strokeWeight(1);
  fill(parameters.lineColor.value);

  text(
    `Lone Star [${serial}]
    by ${links.author.name}
    ${url}`,
    CANVAS_SIZE - 20,
    CANVAS_SIZE - 60
  );
}

function setup() {
  computeConstants();
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);

  createControlPanel(
    parameters,
    links,
    () => {
      loop();
    },
    watermark
  );
}

function windowResized() {
  computeConstants();
  resizeCanvas(CANVAS_SIZE, CANVAS_SIZE);
  loop();
}

function draw() {
  noLoop();
  randomSeed(parameters.seed.value);
  background(0);

  // this.watermark();
  currentColor = color(parameters.lineColor.value);
  stroke(currentColor);
  noFill();
  // circle(X_ORIGIN, Y_ORIGIN, _RADIUS*2)

  const colorMode = parameters.colorMode.options[parameters.colorMode.value];

  for (let i = 0; i < parameters.numberOfLines.value; i++) {
    // Previous anchor point won't be defined on the 1st iteration
    if (previousAnchorPoint === undefined) {
      previousAnchorPoint = getRandomPointOnCircle(X_ORIGIN, Y_ORIGIN, _RADIUS);
    }

    // Previous control point won't be defined on the 1st iteration
    if (previousControlPoint === undefined) {
      previousControlPoint = getRandomPointInCircle(
        X_ORIGIN,
        Y_ORIGIN,
        _RADIUS
      );
    }

    nextAnchorPoint = getRandomPointOnCircle(X_ORIGIN, Y_ORIGIN, _RADIUS);
    nextControlPoint = getRandomPointInCircle(X_ORIGIN, Y_ORIGIN, _RADIUS);

    switch (colorMode) {
      case COLOR_MODE_RANDOM:
        currentColor = getRandomColor();
        break;
      case COLOR_MODE_VARIATIONS:
        currentColor = getRandomVariationFromColor(currentColor);
        break;
      default:
        currentColor = getRandomVariationFromColor(currentColor, true);
        break;
    }

    stroke(currentColor);
    strokeWeight(random(parameters.maxLineWeight.value));

    bezier(
      previousAnchorPoint.x,
      previousAnchorPoint.y,
      previousControlPoint.x,
      previousControlPoint.y,
      nextControlPoint.x,
      nextControlPoint.y,
      nextAnchorPoint.x,
      nextAnchorPoint.y
    );
    previousAnchorPoint = nextAnchorPoint;
    previousControlPoint = nextControlPoint;
  }
  previousAnchorPoint = undefined;
  previousControlPoint = undefined;
}
