import React from "react";
import { useImmer } from "use-immer";
import { v4 as uuidv4 } from "uuid";

const CELL_TYPES = {
  EMPTY: 0,
  MINE: 1,
  NUMBER: 2,
};

export const RENDER_VALUES = {
  NOT_REVEALED: 1,
  FLAG: 2,
  MINE: 2,
  NUMBER: 3,
  EMPTY: 4,
};

let uniqueNumbers = (howMany, minInclusive, maxInclusive) => {
  let arr = [];

  if (
    minInclusive >= maxInclusive ||
    howMany > maxInclusive - minInclusive + 1
  ) {
    console.error("Bad input");
    return [];
  }

  while (arr.length < howMany) {
    var rand =
      Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) +
      minInclusive;

    if (arr.indexOf(rand) === -1) arr.push(rand);
  }

  return arr;
};

export default function useMinesweeper({
  initialBoardWidth = 10,
  initialBoardHeight = 10,
  initialNrOfFlags = 10,
  initialNrOfMines = 10,
} = {}) {
  // Just gets neighbors of some cell on a given board.
  let getCellNeighbors = (row, col, board) => {
    let neighborOffsets = [
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
      [-1, -1],
      [-1, 0],
      [-1, 1],
    ];
    let isCellWithinBounds = (row, col) => {
      return (
        row >= 0 && col >= 0 && row < board.length && col < board[row].length
      );
    };
    return neighborOffsets
      .map(([offsetY, offsetX]) => [row + offsetY, col + offsetX])
      .filter(([row, col]) => isCellWithinBounds(row, col));
  };

  // Sets up the game board, like randomly putting mines on the board,
  // assigning numbers to cells around mines, etc.
  let setupGameBoard = (width, height) => {
    let createEmptyBoard = () => {
      let board = [];
      for (let row = 0; row < height; row++) {
        board[row] = [];
        for (let col = 0; col < width; col++) {
          board[row][col] = {
            value: 0,
            revealed: false,
            flag: false,
            type: CELL_TYPES.EMPTY,
            key: uuidv4(),

            // Helper function to provide user with easier means to determine what to render as a given cell's content.
            // Without this function user would have to read different properties of the cell to determine what to render (similarly to this function).
            getRenderValue: function () {
              if (this.flag) return RENDER_VALUES.FLAG;
              if (!this.revealed) return RENDER_VALUES.NOT_REVEALED;
              if (this.type === CELL_TYPES.MINE) return RENDER_VALUES.MINE;
              if (this.type === CELL_TYPES.NUMBER) return RENDER_VALUES.NUMBER;
              if (this.type === CELL_TYPES.EMPTY) return RENDER_VALUES.EMPTY;
            },
          };
        }
      }
      return board;
    };

    let insertMinesOnBoard = (board, nrOfMines) => {
      let mineCoordinates = uniqueNumbers(nrOfMines, 0, height * width - 1).map(
        (number) => [Math.floor(number / width), number % width]
      );

      mineCoordinates.forEach(([row, col]) => {
        board[row][col].type = CELL_TYPES.MINE;
      });
      return mineCoordinates;
    };

    let insertNumbersAroundMines = (board, minesCoordinates) => {
      for (let [row, col] of minesCoordinates) {
        getCellNeighbors(row, col, board).forEach(([nrow, ncol]) => {
          if (board[nrow][ncol].type !== CELL_TYPES.MINE) {
            board[nrow][ncol].type = CELL_TYPES.NUMBER;
            board[nrow][ncol].value = (board[nrow][ncol].value || 0) + 1;
          }
        });
      }
    };

    let board = createEmptyBoard();
    let minesCoordinates = insertMinesOnBoard(board, initialNrOfMines);
    insertNumbersAroundMines(board, minesCoordinates);
    return board;
  };

  // Reveals empty cell. Recursively reveals neighbor empty cells too.
  let revealEmptyCell = (row, col, board) => {
    board[row][col].revealed = true;
    getCellNeighbors(row, col, board).forEach(([nrow, ncol]) => {
      if (!board[nrow][ncol].revealed && !board[nrow][ncol].flag) {
        if (board[nrow][ncol].type === CELL_TYPES.EMPTY) {
          revealEmptyCell(nrow, ncol, board);
        } else if (board[nrow][ncol].type === CELL_TYPES.NUMBER) {
          board[nrow][ncol].revealed = true;
        }
      }
    });
  };

  let [gameBoard, setGameBoard] = useImmer(() =>
    setupGameBoard(initialBoardWidth, initialBoardHeight)
  );

  let [userLost, setUserLost] = React.useState(false);

  let cellPropertyCount = (propName) => {
    let count = 0;
    for (let row of gameBoard)
      for (let box of row) {
        if (box[propName]) count++;
      }
    return count;
  };

  // Handles right click, basically for setting/removing the flags.
  let handleRightClick = (row, col) => {
    let clickedItem = gameBoard[row][col];

    if (
      clickedItem.revealed ||
      userLost ||
      userWon ||
      (!clickedItem.flag && cellPropertyCount("flag") === initialNrOfFlags)
    )
      return;

    setGameBoard((ps) => {
      ps[row][col].flag = !ps[row][col].flag;
    });
  };

  // Handles left click. Performs different operations depending on what kind
  // of cell use clicked, e.g. if user clicked mine game over.
  let handleLeftClick = (row, col) => {
    let clickedItem = gameBoard[row][col];

    if (clickedItem.flag || clickedItem.revealed) return;

    if (clickedItem.type === CELL_TYPES.EMPTY) {
      setGameBoard((ps) => {
        revealEmptyCell(row, col, ps);
      });
    } else if (clickedItem.type === CELL_TYPES.MINE) {
      setGameBoard((ps) => {
        ps[row][col].revealed = true;
      });
      setUserLost(true);
    } else if (clickedItem.type === CELL_TYPES.NUMBER) {
      setGameBoard((ps) => {
        ps[row][col].revealed = true;
      });
    }
  };

  let userWon = false;
  let countRevealed = cellPropertyCount("revealed");
  if (
    !userLost &&
    countRevealed !== 0 &&
    countRevealed === initialBoardHeight * initialBoardWidth - initialNrOfMines
  ) {
    userWon = true;
  }

  return {
    gameBoard,
    userLost,
    remainingFlags: initialNrOfFlags - cellPropertyCount("flag"),
    userWon,
    handleLeftClick,
    handleRightClick,
  };
}
