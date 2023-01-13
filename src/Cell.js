import React from "react";
import { FlagOutlined, AlertOutlined } from "@ant-design/icons";
import { CELL_TYPES } from "./useMinesweeper";

export default function Cell({
  cell,
  onContextMenu,
  onClick,
  userWon,
  gameOver,
}) {
  let cellContent;
  if (cell.flag) {
    cellContent = (
      <FlagOutlined
        style={{
          color:
            (gameOver || userWon) && cell.type === CELL_TYPES.MINE
              ? "green"
              : "black",
        }}
      />
    );
  } else if (cell.revealed) {
    if (cell.type === CELL_TYPES.NUMBER) {
      cellContent = cell.value;
    } else if (cell.type === CELL_TYPES.MINE) {
      cellContent = <AlertOutlined style={{ color: "red" }} />;
    }
  }

  return (
    <button
      style={{
        width: 32,
        height: 32,
        border: cell.revealed ? "none" : "",
        padding: 0,
      }}
      disabled={gameOver || userWon}
      onContextMenu={onContextMenu}
      onClick={onClick}
    >
      {cellContent}
    </button>
  );
}
