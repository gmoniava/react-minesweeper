import React from "react";
import useMinesweeper from "./useMinesweeper";
import { FlagOutlined, AlertOutlined } from "@ant-design/icons";
import { CELL_TYPES } from "./useMinesweeper";

// Minesweeper game

export default function App() {
  let {
    gameBoard,
    userLost,
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
                let cellContent = "";

                if (cell.flag) {
                  cellContent = <FlagOutlined />;
                } else if (cell.revealed) {
                  if (cell.type === CELL_TYPES.MINE) {
                    cellContent = <AlertOutlined style={{ color: "red" }} />;
                  } else if (cell.type === CELL_TYPES.NUMBER) {
                    cellContent = cell.value;
                  }
                }

                return (
                  <button
                    key={cell.key}
                    style={{
                      width: 32,
                      height: 32,
                      border: cell.revealed ? "none" : "",
                      padding: 0,
                    }}
                    disabled={userLost || userWon}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleRightClick(row, col);
                    }}
                    onClick={() => handleLeftClick(row, col)}
                  >
                    {cellContent}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      {userWon && <div style={{ color: "green" }}> You won </div>}
      {userLost && <h3 style={{ color: "red" }}> You lost </h3>}
    </div>
  );
}
