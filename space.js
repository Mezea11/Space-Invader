// CANVAS
let canvas = document.getElementById("board");

let ctx = canvas.getContext("2d");

//Board columns and rows
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;


// SHIP/PLAYER
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship =  {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight,
}

//Ship IMAGE
let shipImg;
let shipVelocityX = tileSize; // Ship moving speed = One tile

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

//SCORE
let score = 0;
let gameOver = false;

///////////////////////////////////////////////////////////////////
// GAME FUNCTION
window.onload = function() {
    board = document.getElementById("board"); // Access to canvas tag in HTML
    board.width = boardWidth; // Sets width
    board.height = boardHeight; // Sets height
    context = board.getContext("2d"); // Used to draw on the board

    // Draw ship on canvas
    shipImg = new Image();
    shipImg.src = "Assets/ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height)
    }

    // Draw alien on canvas
    alienImg = new Image();
    alienImg.src = "Assets/alien.png";
    createAliens();

    requestAnimationFrame(update);

    //Moves ship
    document.addEventListener("keydown", moveShip);
    //Shoots bullets
    document.addEventListener("keyup", shoot);
}

// DRAWS FRAMES AND UPDATES
function update() {

    if (gameOver) {
        context.fillStyle="Red";
        context.font="30px Helvetica"
        let gameOverText = "GAME OVER";
        let textWidth = context.measureText(gameOverText).width;
        let textY = (boardWidth - textWidth) / 2;
        let textX = boardHeight / 3.5;
        context.fillText(gameOverText, textX, textY);
        return;
    }

    //This draws the ship over and over
    requestAnimationFrame(update);

    context.clearRect(0, 0, boardWidth, boardHeight);
    //Ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height)

    //Aliens 
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;
            

            //IF alien touches the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0) {

                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;

                //Move all aliens up by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height)

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    //Bullets
    for(let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)

        // Bullet collision with aliens
        for(let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if(!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false; 
                alienCount--;
                score += 100;
            }
        }
    }




    //CLEAR BULLETS
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); // Removes the first element of the array
    }

    // NEXT LEVEL
    if (alienCount == 0) {
        //Increase number of aliens in columns and rows by 1
        alienColumns = Math.min(alienColumns + 1, columns/2 -2); // CAP AT 16/2 - 2 = 6
        alienRows = Math.min(alienRows + 1, rows-4); // cap at 16-4 = 12
        alienVelocityX += 0.2; // Increases alien speed every level
        alienArray = [];
        bulletArray = [];
        createAliens();
    }


    //SCORE
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText(score, 5, 20);

}



// MOVEMENT FUNCTION
function moveShip(e) {
    if (gameOver) {
        return;
    }
    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; // Move left one tile
    }
    else if (e.code == "ArrowRight"  && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; // Move right one tile
    }
}


// CREATE ALIENS FUNCTION
function createAliens() {

    //Properties for ALIENS
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienImg,
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

// SHOOT FUNCTION
function shoot(e) {
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

// COLLISION FUNCTION
function detectCollision(a, b) {
    return a.x < b.x + b.width &&   // a's top left corner doesnt reach b's top right corner
        a.x + a.width > b.x &&      // a's top right corner doesnt reach b's top left corner
        a.y < b.y + b.height &&     // a's top corner doesnt reach b's bottom left corner
        a.y + a.height > b.y;       // a's bottom left corner passes b's top left corner
}