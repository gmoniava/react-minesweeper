import React from "react";
import { useImmer } from "use-immer";
import { v4 as uuidv4 } from "uuid";

export const CELL_TYPES = {
  EMPTY: 0,
  MINE: 1,
  NUMBER: 2,
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

  let initializeGameBoard = (width, height) => {
    let createBoardWithEmptyCells = () => {
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

    let putNumbersAroundMines = (board, minesCoordinates) => {
      for (let [row, col] of minesCoordinates) {
        getCellNeighbors(row, col, board).forEach(([nrow, ncol]) => {
          if (board[nrow][ncol].type !== CELL_TYPES.MINE) {
            board[nrow][ncol].type = CELL_TYPES.NUMBER;
            board[nrow][ncol].value = (board[nrow][ncol].value || 0) + 1;
          }
        });
      }
    };

    let board = createBoardWithEmptyCells();
    let minesCoordinates = insertMinesOnBoard(board, initialNrOfMines);
    putNumbersAroundMines(board, minesCoordinates);
    return board;
  };

  let reveal = (row, col, board) => {
    board[row][col].revealed = true;
    getCellNeighbors(row, col, board).forEach(([nrow, ncol]) => {
      if (!board[nrow][ncol].revealed && !board[nrow][ncol].flag) {
        if (board[nrow][ncol].type === CELL_TYPES.EMPTY) {
          reveal(nrow, ncol, board);
        } else if (board[nrow][ncol].type === CELL_TYPES.NUMBER) {
          board[nrow][ncol].revealed = true;
        }
      }
    });
  };

  let [gameBoard, setGameBoard] = useImmer(() =>
    initializeGameBoard(initialBoardWidth, initialBoardHeight)
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
  let handleLeftClick = (row, col) => {
    let clickedItem = gameBoard[row][col];

    if (clickedItem.flag || clickedItem.revealed) return;

    if (clickedItem.type === CELL_TYPES.EMPTY) {
      setGameBoard((ps) => {
        reveal(row, col, ps);
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
