import React from "react";
import useMinesweeper from "./useMinesweeper";
import Cell from "./Cell";

// Minesweeper game

export default function App() {
  let {
    gameBoard,
    gameOver,
    remainingFlags,
    userWon,
    handleLeftClick,
    handleRightClick,
  } = useMinesweeper();
  return (
    <div style={{ padding: 10 }}>
      <h1>Welcome to minesweeper</h1>
      <div style={{ marginBottom: 10 }}>Remaining flags: {remainingFlags}</div>
      <div>
        {gameBoard.map((rowItems, row) => {
          return (
            <div key={row} style={{ display: "flex", alignItems: "center" }}>
              {rowItems.map((cell, col) => {
                return (
                  <Cell
                    key={cell.key}
                    cell={cell}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleRightClick(row, col);
                    }}
                    onClick={() => handleLeftClick(row, col)}
                    userWon={userWon}
                    gameOver={gameOver}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      {userWon && <div style={{ color: "green" }}> You won </div>}
      {gameOver && <h3 style={{ color: "red" }}> You lost </h3>}
    </div>
  );
}
