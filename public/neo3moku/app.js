const PLAYER = "O";
const CPU = "X";
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const setup = document.querySelector("#setup");
const playArea = document.querySelector("#play-area");
const boardElement = document.querySelector("#board");
const statusElement = document.querySelector("#status");
const detailElement = document.querySelector("#detail");
const restartButton = document.querySelector("#restart");

let board = Array(9).fill(null);
let numbers = [];
let currentTurn = PLAYER;
let gameOver = false;
let cpuTimer = null;

document.querySelectorAll("[data-order]").forEach((button) => {
  button.addEventListener("click", () => startGame(button.dataset.order));
});

restartButton.addEventListener("click", showSetup);

function startGame(order) {
  clearTimeout(cpuTimer);
  board = Array(9).fill(null);
  numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  currentTurn = order === "first" ? PLAYER : CPU;
  gameOver = false;

  setup.hidden = true;
  playArea.hidden = false;
  createBoard();
  beginTurn(true);
}

function showSetup() {
  clearTimeout(cpuTimer);
  gameOver = true;
  playArea.hidden = true;
  setup.hidden = false;
}

function createBoard() {
  boardElement.replaceChildren();

  numbers.forEach((number, index) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.dataset.index = index;
    cell.setAttribute("aria-label", `${number}のマス`);
    cell.addEventListener("click", handlePlayerMove);

    const numberLabel = document.createElement("span");
    numberLabel.className = "number";
    numberLabel.textContent = number;

    const mark = document.createElement("span");
    mark.className = "mark";

    cell.append(numberLabel, mark);
    boardElement.append(cell);
  });
}

function beginTurn(isFirstTurn = false) {
  if (gameOver) {
    return;
  }

  if (!isFirstTurn) {
    board = moveAllMarks(board);
    renderBoard();

    const result = getResult(board);
    if (finishIfNeeded(result, "移動で")) {
      return;
    }
  }

  detailElement.textContent = isFirstTurn ? "ゲーム開始" : "すべてのコマが次の番号へ移動しました";

  if (currentTurn === PLAYER) {
    statusElement.textContent = "あなたの番です（○）";
    renderBoard();
  } else {
    statusElement.textContent = "CPUが考えています（×）";
    renderBoard();
    cpuTimer = setTimeout(playCpuTurn, 550);
  }
}

function handlePlayerMove(event) {
  const index = Number(event.currentTarget.dataset.index);

  if (gameOver || currentTurn !== PLAYER || board[index] !== null) {
    return;
  }

  placeMark(index, PLAYER);
}

function playCpuTurn() {
  if (gameOver || currentTurn !== CPU) {
    return;
  }

  const index = chooseCpuMove();
  if (index !== -1) {
    placeMark(index, CPU);
  }
}

function placeMark(index, mark) {
  board[index] = mark;
  renderBoard();

  const result = getResult(board);
  if (finishIfNeeded(result, "着手で")) {
    return;
  }

  currentTurn = mark === PLAYER ? CPU : PLAYER;
  beginTurn();
}

function moveAllMarks(sourceBoard) {
  const movedBoard = Array(9).fill(null);

  sourceBoard.forEach((mark, sourceIndex) => {
    if (mark === null) {
      return;
    }

    const nextNumber = numbers[sourceIndex] === 9 ? 1 : numbers[sourceIndex] + 1;
    const destinationIndex = numbers.indexOf(nextNumber);
    movedBoard[destinationIndex] = mark;
  });

  return movedBoard;
}

function getResult(targetBoard) {
  const playerWon = WIN_LINES.some((line) => line.every((index) => targetBoard[index] === PLAYER));
  const cpuWon = WIN_LINES.some((line) => line.every((index) => targetBoard[index] === CPU));

  if (playerWon && cpuWon) {
    return "draw";
  }
  if (playerWon) {
    return PLAYER;
  }
  if (cpuWon) {
    return CPU;
  }
  if (targetBoard.every((cell) => cell !== null)) {
    return "draw";
  }
  return null;
}

function finishIfNeeded(result, reason) {
  if (result === null) {
    return false;
  }

  gameOver = true;
  renderBoard();

  if (result === PLAYER) {
    statusElement.textContent = "あなたの勝ちです";
  } else if (result === CPU) {
    statusElement.textContent = "CPUの勝ちです";
  } else {
    statusElement.textContent = "引き分けです";
  }

  detailElement.textContent = result === "draw" ? "勝者なし" : `${reason}3つ揃いました`;
  return true;
}

function renderBoard() {
  boardElement.querySelectorAll(".cell").forEach((cell, index) => {
    const markElement = cell.querySelector(".mark");
    const mark = board[index];

    markElement.textContent = mark === PLAYER ? "○" : mark === CPU ? "×" : "";
    markElement.className = `mark ${mark === PLAYER ? "player" : mark === CPU ? "cpu" : ""}`;
    cell.disabled = gameOver || currentTurn !== PLAYER || mark !== null;
  });
}

function chooseCpuMove() {
  const memo = new Map();
  let bestScore = -Infinity;
  let bestMoves = [];

  getEmptyCells(board).forEach((index) => {
    const nextBoard = [...board];
    nextBoard[index] = CPU;
    const score = scoreAfterPlacement(nextBoard, PLAYER, 0, memo);

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [index];
    } else if (score === bestScore) {
      bestMoves.push(index);
    }
  });

  return bestMoves.length === 0
    ? -1
    : bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function minimax(turnBoard, turn, depth, memo) {
  const key = `${turnBoard.map((cell) => cell || "-").join("")}:${turn}`;
  if (memo.has(key)) {
    return memo.get(key);
  }

  const scores = getEmptyCells(turnBoard).map((index) => {
    const nextBoard = [...turnBoard];
    nextBoard[index] = turn;
    return scoreAfterPlacement(nextBoard, turn === CPU ? PLAYER : CPU, depth, memo);
  });

  const score = turn === CPU ? Math.max(...scores) : Math.min(...scores);
  memo.set(key, score);
  return score;
}

function scoreAfterPlacement(placedBoard, nextTurn, depth, memo) {
  const placedResult = getResult(placedBoard);
  if (placedResult !== null) {
    return scoreResult(placedResult, depth);
  }

  const movedBoard = moveAllMarks(placedBoard);
  const movedResult = getResult(movedBoard);
  if (movedResult !== null) {
    return scoreResult(movedResult, depth + 1);
  }

  return minimax(movedBoard, nextTurn, depth + 1, memo);
}

function scoreResult(result, depth) {
  if (result === CPU) {
    return 10 - depth;
  }
  if (result === PLAYER) {
    return depth - 10;
  }
  return 0;
}

function getEmptyCells(targetBoard) {
  return targetBoard
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);
}

function shuffle(values) {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}
