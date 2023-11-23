const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const EMPTY = 0;
const PIECE_COLORS = [
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#00FFFF",
  "#FF00FF",
  "#C0C0C0",
];

const shapes = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1, 1],
    [0, 1, 0],
  ], // T
  [
    [1, 1, 1],
    [1, 0, 0],
  ], // L
  [
    [1, 1, 1],
    [0, 0, 1],
  ], // J
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // S
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // Z
];

const board = [];
for (let r = 0; r < ROWS; r++) {
  board[r] = Array(COLS).fill(EMPTY);
}

let fallSpeed = 500; // Velocidad inicial de caída en milisegundos
let lastFallTime = 0; // Variable para almacenar el tiempo de la última caída
let moving = false; // Variable para controlar si una pieza está en movimiento

let currentPiece = newPiece();

function drawBlock(x, y, colorIndex) {
  context.fillStyle = PIECE_COLORS[colorIndex];
  context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  context.strokeStyle = "#000";
  context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawBoard() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== EMPTY) {
        drawBlock(c, r, board[r][c]);
      }
    }
  }
}

function drawPiece(row, col, shape) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        drawBlock(col + c, row + r, currentPiece.color);
      }
    }
  }
}

function rotate(shape) {
    const rows = shape.length;
    const cols = shape[0].length;
    const newShape = [];
  
    for (let c = 0; c < cols; c++) {
      const newRow = [];
      for (let r = rows - 1; r >= 0; r--) {
        newRow.push(shape[r][c]);
      }
      newShape.push(newRow);
    }
  
    return newShape.map(row => row.slice()); // Create a copy of the new shape
  }
  

function isValidMove(row, col, shape) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const newRow = row + r;
        const newCol = col + c;
        if (
          newRow < 0 ||
          newRow >= ROWS ||
          newCol < 0 ||
          newCol >= COLS ||
          board[newRow][newCol] !== EMPTY
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

function mergePiece() {
  for (let r = 0; r < currentPiece.shape.length; r++) {
    for (let c = 0; c < currentPiece.shape[r].length; c++) {
      if (currentPiece.shape[r][c]) {
        board[currentPiece.row + r][currentPiece.col + c] = currentPiece.color;
      }
    }
  }
}

function removeFullRows() {
  let linesToRemove = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every((cell) => cell !== EMPTY)) {
      linesToRemove++;
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(EMPTY));
      r++;
    }
  }
  return linesToRemove;
}

function gameOver() {
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] !== EMPTY) {
      return true;
    }
  }
  return false;
}

function newPiece() {
  const index = Math.floor(Math.random() * shapes.length);
  const shape = shapes[index];
  const color = index + 1; // Avoid using 0 as color (EMPTY)
  const piece = {
    row: 0,
    col: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
    shape,
    color,
  };
  if (!isValidMove(piece.row, piece.col, piece.shape)) {
    return null; // Game over if the piece can't be placed at the top
  }
  return piece;
}

document.addEventListener("keydown", (event) => {
  if (!moving) {
    if (event.keyCode === 37) {
      // Left arrow key
      movePieceSmoothly(-1, 0);
    } else if (event.keyCode === 39) {
      // Right arrow key
      movePieceSmoothly(1, 0);
    } else if (event.keyCode === 38) {
      // Up arrow key (Rotate)
      rotatePieceSmoothly();
    }
  }
});

function movePieceSmoothly(dx, dy) {
  if (
    isValidMove(currentPiece.row + dy, currentPiece.col + dx, currentPiece.shape)
  ) {
    moving = true; // Indicate that the piece is moving

    const start = performance.now();
    const duration = 200; // Duration of the animation in milliseconds
    const destRow = currentPiece.row + dy;
    const destCol = currentPiece.col + dx;

    function animate(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1); // Calculate progress

      const newRow = currentPiece.row + dy * progress;
      const newCol = currentPiece.col + dx * progress;

      context.clearRect(0, 0, canvas.width, canvas.height);
      drawBoard();
      drawPiece(newRow, newCol, currentPiece.shape);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        moving = false; // Indicate that the movement is complete
        currentPiece.row = destRow;
        currentPiece.col = destCol;
      }
    }

    requestAnimationFrame(animate);
  }
}

function rotatePieceSmoothly() {
    const rotatedShape = rotate(currentPiece.shape);
    if (isValidMove(currentPiece.row, currentPiece.col, rotatedShape)) {
      moving = true; // Indicate that the piece is moving
  
      const start = performance.now();
      const duration = 200; // Duration of the animation in milliseconds
  
      function animate(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1); // Calculate progress
  
        currentPiece.shape = interpolateRotation(
          currentPiece.shape,
          rotatedShape,
          progress
        );
  
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBoard();
        drawPiece(currentPiece.row, currentPiece.col, currentPiece.shape);
  
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          moving = false; // Indicate that the rotation is complete
        }
      }
  
      requestAnimationFrame(animate);
    }
  }

function interpolateRotation(startShape, endShape, progress) {
  const interpolatedShape = [];

  for (let r = 0; r < startShape.length; r++) {
    const newRow = [];
    for (let c = 0; c < startShape[r].length; c++) {
      const startValue = startShape[r][c];
      const endValue = endShape[r][c];
      const interpolatedValue = startValue + (endValue - startValue) * progress; // Interpolation
      newRow.push(interpolatedValue);
    }
    interpolatedShape.push(newRow);
  }

  return interpolatedShape;
}

function updateGame() {
  const currentTime = performance.now(); // Get the current time

  if (currentTime - lastFallTime > fallSpeed) {
    if (
      !isValidMove(currentPiece.row + 1, currentPiece.col, currentPiece.shape)
    ) {
      mergePiece();
      const linesCleared = removeFullRows();
      currentPiece = newPiece();

      if (currentPiece === null) {
        if (gameOver()) {
          alert("Game Over");
          return;
        }
      }
    } else {
      currentPiece.row++;
    }
    lastFallTime = currentTime; // Update the time of the last fall

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();

    // Draw piece with animation if it's moving
    if (moving) {
      drawPiece(currentPiece.row, currentPiece.col, currentPiece.shape);
    } else {
      draw();
    }
  }

  requestAnimationFrame(updateGame);
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawPiece(currentPiece.row, currentPiece.col, currentPiece.shape);
  updateGame();
}

draw();
