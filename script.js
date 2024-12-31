const playerImg = new Image();

playerImg.src = '/Doge/img/Doge.png';
const finishImg = new Image();
finishImg.src = '/Doge/img/present.png';
let CELL_SIZE;
const PLAYER_SIZE = 20;
const MAZE_WIDTH = 14;
const MAZE_HEIGHT = 14;
const INITIAL_MOVES = 46;
const MOVE_BONUS = 2;

let maze = [];
let playerPos = { x: 6, y: 0 };
let gameWon = false;
let trail = [];
let remainingMoves = INITIAL_MOVES;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const movesLeftSpan = document.getElementById('movesLeft');

const p1 = new Audio('/Doge/music/padoru1.mp3');
const p2 = new Audio('/Doge/music/padoru2.mp3');
const p3 = new Audio('/Doge/music/padoru3.mp3');
const p4 = new Audio('/Doge/music/padoru4.mp3');
const p5 = new Audio('/Doge/music/padoru5.mp3');
const p6 = new Audio('/Doge/music/padoru6.mp3');
const p7 = new Audio('/Doge/music/padoru7.mp3');
const p8 = new Audio('/Doge/music/padoru8.mp3');
const p9 = new Audio('/Doge/music/padoru9.mp3');
const p10 = new Audio('/Doge/music/padoru10.mp3');
const p11 = new Audio('/Doge/music/padoru11.mp3');
const p12 = new Audio('/Doge/music/padoru12.mp3');
const p13 = new Audio('/Doge/music/padoru13.mp3');
const p14 = new Audio('/Doge/music/padoru14.mp3');
const p15 = new Audio('/Doge/music/padoru15.mp3');
const p16 = new Audio('/Doge/music/padoru16.mp3');
const p17 = new Audio('/Doge/music/padoru17.mp3');
const p18 = new Audio('/Doge/music/padoru18.mp3');
const p19 = new Audio('/Doge/music/padoru19.mp3');
const p20 = new Audio('/Doge/music/padoru20.mp3');
const p21 = new Audio('/Doge/music/padoru21.mp3');
const p22 = new Audio('/Doge/music/padoru22.mp3');
const p23 = new Audio('/Doge/music/padoru23.mp3');



function playSoundBasedOnMoves() {
    const audioFiles = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23];
    
    // Calculate the index for the sound based on the remaining moves
    const soundIndex = 22-(remainingMoves % 23);  // Get a number between 0 and 22
    
    // Play the appropriate sound based on the remainder of remainingMoves divided by 23
    audioFiles[soundIndex].play();
}

function adjustCanvasSize() {
    const maxWidth = window.innerWidth * 0.8; // 80% of the screen width
    const maxHeight = window.innerHeight * 0.8; // 80% of the screen height

    // Calculate cell size to fit within the canvas
    CELL_SIZE = Math.min(maxWidth / MAZE_WIDTH, maxHeight / MAZE_HEIGHT);

    // Set canvas size based on calculated cell size
    canvas.width = CELL_SIZE * MAZE_WIDTH;
    canvas.height = CELL_SIZE * MAZE_HEIGHT;
}


function generateMaze(width, height) {
    const maze = [];
    for (let y = 0; y < height; y++) {
        maze[y] = [];
        for (let x = 0; x < width; x++) {
            maze[y][x] = { x, y, walls: [true, true, true, true], visited: false };
        }
    }

    function carve(x, y) {
        maze[y][x].visited = true;
        const directions = shuffle([0, 1, 2, 3]);
        for (const direction of directions) {
            const [nx, ny] = [
                x + [0, 1, 0, -1][direction],
                y + [-1, 0, 1, 0][direction],
            ];
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && !maze[ny][nx].visited) {
                maze[y][x].walls[direction] = false;
                maze[ny][nx].walls[(direction + 2) % 4] = false;
                carve(nx, ny);
            }
        }
    }

    carve(0, 0);
    return maze;
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function resetGame() {
    fetch('maze.json')
        .then(response => response.json())
        .then(data => {
            maze = data; // The maze data will be available here
            playerPos = { x: 6, y: 0 };
            gameWon = false;
            trail.push('6,0');
            remainingMoves = INITIAL_MOVES;
            updateMovesLeft();
            drawMaze(); // Now, draw the maze after the data has been loaded
        })
        .catch(error => console.error('Error loading the maze data:', error));
}

function handleButtonPress(dx, dy) {
    movePlayer(dx, dy); // Call the movePlayer function with the direction
}


function movePlayer(dx, dy) {
    if (gameWon == true) return;

    // When there are no remaining moves, allow only backward movement
    if (remainingMoves == 0) {
        console.log("Remaining moves: 0 - Checking if player can move back");

        // Get the last position in the trail (previous position)
        const lastPos = trail[trail.length - 2]; // Previous position (if any)
        if (lastPos) {
            const [lastX, lastY] = lastPos.split(',').map(Number);

            // Check if the player is trying to move back to the previous position
            console.log([lastX, lastY])
            if (playerPos.x + dx === lastX && playerPos.y + dy === lastY) {

                console.log("Moving back to previous position");
                playerPos = { x: lastX, y: lastY };
                trail.pop(); // Remove the last position from the trail
                remainingMoves++; // Allow the player to move back (gain 1 move)
                updateMovesLeft(); // Update the moves left display
                drawMaze(); // Redraw the maze after the move
                return; // Exit the function after the move back is completed
            } else {
                console.log("Player can only move back to the last position when no moves are left");
                return; // Prevent any movement other than going back
            }
        }
    }

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // Check boundaries and wall collision
    if (
        newX >= 0 &&
        newX < MAZE_WIDTH &&
        newY >= 0 &&
        newY < MAZE_HEIGHT &&
        !maze[playerPos.y][playerPos.x].walls[
        [1, 2, 3, 0][
        ([dx, dy].join(',') === '1,0' ? 0 :
            [dx, dy].join(',') === '0,1' ? 1 :
                [dx, dy].join(',') === '-1,0' ? 2 : 3)
        ]
        ]
    ) {
        const newPos = `${newX},${newY}`;
        playerPos = { x: newX, y: newY };

        if (trail.includes(newPos)) {
            // Remove the oldest instance of the position
            trail.pop(newPos);
            remainingMoves += 1; // Add bonus moves
        } else {
            trail.push(newPos);
            remainingMoves--; // Deduct one move
        }

        // Check win condition
        if (newX === MAZE_WIDTH - 7 && newY === MAZE_HEIGHT - 1) {
            onWin()
            gameWon = true;
        }

        updateMovesLeft();
        drawMaze();
    }
}


function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw maze
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (const row of maze) {
        for (const cell of row) {
            const x = cell.x * CELL_SIZE;
            const y = cell.y * CELL_SIZE;

            if (cell.walls[0]) drawLine(x, y, x + CELL_SIZE, y);
            if (cell.walls[1]) drawLine(x + CELL_SIZE, y, x + CELL_SIZE, y + CELL_SIZE);
            if (cell.walls[2]) drawLine(x, y + CELL_SIZE, x + CELL_SIZE, y + CELL_SIZE);
            if (cell.walls[3]) drawLine(x, y, x, y + CELL_SIZE);
        }
    }

    // Draw trail
    ctx.fillStyle = 'rgba(255, 165, 0, 0.5)';
    for (const pos of trail) {
        const [x, y] = pos.split(',').map(Number);
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    // Draw player
    ctx.drawImage(playerImg, playerPos.x * CELL_SIZE, playerPos.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // Draw finish point
    ctx.drawImage(finishImg, (MAZE_WIDTH - 7) * CELL_SIZE, (MAZE_HEIGHT - 1) * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // Update game info
    if (gameWon) {
        document.getElementById('gameInfo').textContent = 'ยินดัด้วย Doge เจอของขวัญแล้ว';
    } else if (remainingMoves === 0) {
        document.getElementById('gameInfo').textContent = 'Doge เดินต่อไม่ไหวแล้ว กลับทางเดิมและหาทางใหม่ให้ Doge';
    } else {
        document.getElementById('gameInfo').innerHTML = 'ใช้ปุ่มลูกศรในการนำทาง Doge ไปหาของขวัญ! จำนวนการเคลื่อนไหวที่เหลือ: <span id="movesLeft">' + remainingMoves + '</span>';
    }
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function updateMovesLeft() {
    movesLeftSpan.textContent = remainingMoves;
    playSoundBasedOnMoves();
}

function onWin() {
    gameWon = true;
    document.getElementById('gameInfo').textContent = 'ขอบคุณที่ช่วย Doge!';

    // Create a popup image container
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = '1000';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.textAlign = 'center';

    // Create the image
    const img = document.createElement('img');
    
    img.src = '/Doge/img/Doge.png'; // Path to your winning image
    img.alt = 'Happy New Year. Doge กำลังไปเอาของขวัญให้';
    img.style.maxWidth = '80%';
    img.style.maxHeight = '80%';

    // Create the text below the image
    const text = document.createElement('p');
    text.textContent = 'Happy New Year. แต่ Doge ไม่มีของขวัญให้แล้ว T_T';
    text.style.color = 'white';
    text.style.marginTop = '10px';
    text.style.fontSize = '18px';

    // Append the image and text to the popup
    popup.appendChild(img);
    popup.appendChild(text);
    document.body.appendChild(popup);

    // Wait 5 seconds and redirect
    setTimeout(() => {
        window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Redirect URL
    }, 5000);
}




document.addEventListener('keydown', (e) => {
    const directions = {
        'ArrowUp': [0, -1],
        'ArrowRight': [1, 0],
        'ArrowDown': [0, 1],
        'ArrowLeft': [-1, 0],
    };

    if (e.key in directions) {
        const [dx, dy] = directions[e.key];
        movePlayer(dx, dy);
    }
});
window.onload = function() {
    // Check the window width
    const isMobile = window.innerWidth > 768;
    console.log(isMobile)

    if (isMobile) {
        document.getElementById('controls').style.display = 'none'; // Hide controls for mobile
    } else {
        document.getElementById('controls').style.display = 'block'; // Show controls for desktop
    }
};

window.addEventListener('resize', () => {
    adjustCanvasSize();
    drawMaze();
});
// Initialize the game
adjustCanvasSize();
resetGame();
