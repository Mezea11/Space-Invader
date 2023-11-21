// CANVAS
let canvas = document.getElementById("board");

let ctx = canvas.getContext("2d");

//Board columns and rows
let tileSize = 32;
let rows = 20;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

let lastTime;
let spawnTimer;

let mySound;
let laser;
let laserArray = [];

// SHIP/PLAYER
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = (tileSize * columns) / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  height: shipHeight,
};

//Ship IMAGE
let shipImg;
let shipVelocityX = tileSize; // Ship moving speed = One tile
let shipVelocityY = tileSize;

//Aliens IMAGE
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2; // Rows of aliens
let alienColumns = 3; // Columns full of aliens
let alienCount = 0; //Number of aliens to defeat
let alienVelocityX = 2; // Alien movement speed

//BULLETS
let bulletArray = [];
let bulletVelocityY = -10; // Bullet movement speed
let laserVelocityY = -5;

// Alien Bullets
let alienBulletArray = [];
let alienBulletVelocityY = 5; // Alien bullet movement speed

//SCORE & LVLCOUNTER
let score = 0; // Score counter when aliens are shot
let gameOver = false; //Gameover default false
let lvlCounter = 1; // Lvlcounter starts from lvl 1

let animationFrame;

///////////////////////////////////////////////////////////////////

// EVENT LISTENER FOR RESTART BUTTON
const restartButton = document.querySelector(".restart-button");
restartButton.addEventListener("click", restartGame);

// Add event listener to prevent space bar press
document.addEventListener("keydown", function (e) {
  if (e.code === "Space" && e.target === document.body) {
    e.preventDefault();
  }
});

function restartGame() {
  // Remove existing event listener to avoid multiple executions
  restartButton.removeEventListener("click", restartGame);

  // Reset game variables
  score = 0;
  gameOver = false;
  lvlCounter = 1;
  alienColumns = 3;
  alienRows = 2;
  alienVelocityX = 2;

  // Clear arrays
  bulletArray = [];
  alienBulletArray = [];
  alienArray = [];

  // Recreate aliens
  createAliens();

  // Clear existing animation frames to prevent acceleration
  cancelAnimationFrame(animationFrame);
  // Recreate aliens

  // Start a new game
  gameOver = false;
  requestAnimationFrame(update);

  // Add the event listener back after the restart
  setTimeout(() => {
    restarting = false; // Reset the flag after a short delay
    restartButton.addEventListener("click", restartGame);
  }, 100);
}

// GAME FUNCTION
window.onload = function () {
  board = document.getElementById("board"); // Access to canvas tag in HTML
  board.width = boardWidth; // Sets width
  board.height = boardHeight; // Sets height
  context = board.getContext("2d"); // Used to draw on the board

  // Draw ship on canvas
  shipImg = new Image();
  shipImg.src = "Assets/ship.png";
  shipImg.onload = function () {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  };

  // Draw alien on canvas
  alienImg = new Image();
  alienImg.src = "Assets/alien.png";
  createAliens();

  requestAnimationFrame(update);

  //Moves ship
  document.addEventListener("keydown", moveShip);
  //Shoots bullets
  document.addEventListener("keyup", shoot);

  restartButton.addEventListener("click", restartGame);
  lastTime = Date.now();
  spawnTimer = 1;


};

//let lastTime = Date.now();
//let spawnTimer = 2;

// DRAWS FRAMES AND UPDATES
function update() {
  let now = Date.now();
  let deltaTime = (now - lastTime) / 1000;
  lastTime = now;function shoot(e) {
    if (gameOver) {
        return;
    }
    if (e.code == "Space") {
        //Shoots
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

  if (gameOver) {
    context.fillStyle = "Red";
    context.font = "bold 30px Helvetica";
    let gameOverText = "GAME OVER";
    let textWidth = context.measureText(gameOverText).width;
    let textX = (boardWidth - textWidth) / 2;
    let textY = boardHeight / 3;
    context.fillText(gameOverText, textX, textY);
    context.fillText("Level: " + lvlCounter, textX + 35, textY + 50);
    lvlCounter = 1;
    return;
  }

  //This draws the ship over and over
  requestAnimationFrame(update);

  context.clearRect(0, 0, boardWidth, boardHeight);
  //Ship
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

  //Aliens
  for (let i = 0; i < alienArray.length; i++) {
    let alien = alienArray[i];
    if (alien.alive) {
      alien.x += alienVelocityX;

      //IF alien touches the borders
      if (alien.x + alien.width >= board.width || alien.x <= 0) {
        alienVelocityX *= -1;
        alien.x += alienVelocityX * 2;

        //Move all aliens up by one row
        for (let j = 0; j < alienArray.length; j++) {
          alienArray[j].y += alienHeight;
        }
      }
      context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

      if (alien.y >= ship.y) {
        gameOver = true;
      }
    }
  }
  //timer för laserskott
  if (lvlCounter >= 2) {
    spawnTimer -= deltaTime;

    if (spawnTimer <= 0) {
      laserShoot();

      spawnTimer = 1;
    }
  }
  if (lvlCounter >= 3) {
    spawnTimer -= deltaTime;

    if (spawnTimer <= 0) {
      laserVelocityY = -10;
      laserShoot();

      spawnTimer = 1;
    }
  }
  if (lvlCounter >= 4) {
    spawnTimer -= deltaTime * 2;

    if (spawnTimer <= 0) {
      laserVelocityY = -7;
      laserShoot();

      spawnTimer = 1;
    }
  }


  //laserskott
  for (let i = 0; i < laserArray.length; i++) {
    let laser = laserArray[i];
    laser.y -= laserVelocityY;
    context.fillStyle = "orange";
    context.fillRect(laser.x, laser.y, laser.width, laser.height);

    //clear laser from array when outside canvas
    if (laser.y - laser.height >= boardHeight) {
      laserArray.splice(i, 1);
      i--;
      continue;
    }

    //laserskott collision with player
    if (detectCollision(laser, ship)) {
      score -= 100;
      laserArray.splice(i, 1);
      i--;
      continue;
    }
  }

  //Bullets
  for (let i = 0; i < bulletArray.length; i++) {
    let bullet = bulletArray[i];
    bullet.y += bulletVelocityY;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    // Bullet collision with aliens
    for (let j = 0; j < alienArray.length; j++) {
      let alien = alienArray[j];
      if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
        bullet.used = true;
        alien.alive = false;
        alienCount--;
        score += 100;

        mySound.play();
        alienArray.splice(j, 1);
      }
    }
  }

  //CLEAR BULLETS
  while (
    bulletArray.length > 0 &&
    (bulletArray[0].used || bulletArray[0].y < 0)
  ) {
    bulletArray.shift(); // Removes the first element of the array
  }

  // NEXT LEVEL
  if (alienCount == 0) {
    //Increase number of aliens in columns and rows by 1
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2); // CAP AT 16/2 - 2 = 6
    alienRows = Math.min(alienRows + 1, rows - 4); // cap at 16-4 = 12
    alienVelocityX += 0.2; // Increases alien speed every level
    alienArray = [];
    bulletArray = [];
    createAliens();
    lvlCounter += 1;
  }

  //SCORE
  context.fillStyle = "white";
  context.font = "16px courier";
  context.fillText(score, 5, 20);

  //LVL
  context.fillStyle = "yellow";
  context.font = "16px courier";
  context.fillText("Level: " + lvlCounter, 420, 20);
}

// MOVEMENT FUNCTION
function moveShip(e) {
  if (gameOver) {
    return;
  }
  if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
    ship.x -= shipVelocityX; // Move left one tile
  } else if (
    e.code == "ArrowRight" &&
    ship.x + shipVelocityX + ship.width <= board.width
  ) {
    ship.x += shipVelocityX; // Move right one tile
  } else if (e.code == "ArrowUp" && ship.y - shipVelocityY >= 0) {
    ship.y -= shipVelocityY; // Move up one tile
  } else if (
    e.code == "ArrowDown" &&
    ship.y + shipVelocityY + ship.height <= board.height
  ) {
    ship.y += shipVelocityY; // Move down one tile
  }
}

// CREATE ALIENS FUNCTION
function createAliens() {
  //Properties for ALIENS
  for (let c = 0; c < alienColumns; c++) {
    for (let r = 0; r < alienRows; r++) {
      let alien = {
        img: alienImg,
        x: alienX + c * alienWidth,
        y: alienY + r * alienHeight,
        width: alienWidth,
        height: alienHeight,
        alive: true,
      };
      alienArray.push(alien);
    }
  }
  alienCount = alienArray.length;
}

function laserShoot() {
  var alien = alienArray[Math.floor(Math.random() * alienArray.length)];
  let laser = {
    x: alien.x + alien.width / 2,
    y: alien.y + alienHeight,
    width: 5,
    height: 15,
  };
  laserArray.push(laser);
}

// SHOOT FUNCTION
function shoot(e) {
  if (gameOver) {
    return;
  }

  if (e.code == "Space") {
    //Shoots
    let bullet = {
      x: ship.x + (shipWidth * 15) / 32,
      y: ship.y,
      width: tileSize / 8,
      height: tileSize / 2,
      used: false,
    };
    bulletArray.push(bullet);
  }
}

// COLLISION FUNCTION
function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && // a's top left corner doesnt reach b's top right corner
    a.x + a.width > b.x && // a's top right corner doesnt reach b's top left corner
    a.y < b.y + b.height && // a's top corner doesnt reach b's bottom left corner
    a.y + a.height > b.y
  ); // a's bottom left corner passes b's top left corner
}
