import React, { useState } from "react";
import "./App.css";

/**
 * Color palette as CSS variables (light theme):
 * --primary: #1976d2
 * --accent: #e53935
 * --secondary: #424242
 */

// PUBLIC_INTERFACE
function App() {
  // Game state definitions
  const emptyBoard = Array(9).fill(null);

  // 'X' or 'O'
  const [userSymbol, setUserSymbol] = useState("X");
  // "pvp" or "ai"
  const [mode, setMode] = useState("pvp");
  // null - not started, true - started, false - finished
  const [gameStarted, setGameStarted] = useState(false);
  // array of 9 cells
  const [board, setBoard] = useState(emptyBoard);
  // 'X' or 'O', whose turn
  const [turn, setTurn] = useState("X");
  // null (ongoing) | { winner: 'X'|'O'|'draw' }
  const [result, setResult] = useState(null);

  // PUBLIC_INTERFACE
  function startGame() {
    setBoard(emptyBoard);
    setResult(null);
    setGameStarted(true);
    setTurn("X");
  }

  // PUBLIC_INTERFACE
  function restartGame() {
    startGame();
  }

  // PUBLIC_INTERFACE
  function chooseSymbol(symbol) {
    setUserSymbol(symbol);
    setTurn("X");
    setBoard(emptyBoard);
    setResult(null);
    setGameStarted(false);
  }

  // PUBLIC_INTERFACE
  function changeMode(selectedMode) {
    setMode(selectedMode);
    setBoard(emptyBoard);
    setResult(null);
    setTurn("X");
    setGameStarted(false);
  }

  // PUBLIC_INTERFACE
  function handleCellClick(index) {
    if (!gameStarted || board[index] || result) return;
    if (mode === "ai" && turn !== userSymbol) return; // Only allow user move in AI mode

    const newBoard = board.slice();
    newBoard[index] = turn;
    setBoard(newBoard);

    const res = checkGameResult(newBoard);
    if (res) {
      setResult(res);
      setGameStarted(false);
      return;
    }

    // Switch turns
    const nextTurn = turn === "X" ? "O" : "X";
    setTurn(nextTurn);
  }

  // Handle AI Move
  React.useEffect(() => {
    if (
      gameStarted &&
      mode === "ai" &&
      !result &&
      turn !== userSymbol
    ) {
      const aiMove = getBestMove(board, turn);
      if (aiMove !== -1) {
        setTimeout(() => {
          const newBoard = board.slice();
          newBoard[aiMove] = turn;
          setBoard(newBoard);
          const res = checkGameResult(newBoard);
          if (res) {
            setResult(res);
            setGameStarted(false);
            return;
          }
          setTurn(userSymbol); // Hand back to user
        }, 500);
      }
    }
    // eslint-disable-next-line
  }, [gameStarted, turn, board, mode, result]);

  // PUBLIC_INTERFACE
  function checkGameResult(bd) {
    // Returns { winner: 'X' }, { winner: 'O' }, or { winner: 'draw' } or null
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
        return { winner: bd[a] };
      }
    }
    if (bd.every((v) => v)) {
      return { winner: "draw" };
    }
    return null;
  }

  // Minimax-based AI for unbeatable Tic Tac Toe
  // PUBLIC_INTERFACE
  function getBestMove(bd, aiSymbol) {
    const opponent = aiSymbol === "X" ? "O" : "X";
    // If board is empty, play center or random
    if (bd.every((v) => v == null)) {
      return 4; // center
    }
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (!bd[i]) {
        bd[i] = aiSymbol;
        let score = minimax(bd, 0, false, aiSymbol, opponent);
        bd[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  // PUBLIC_INTERFACE
  function minimax(bd, depth, isMaximizing, aiSymbol, opponent) {
    const res = checkGameResult(bd);
    if (res) {
      if (res.winner === aiSymbol) return 10 - depth;
      else if (res.winner === opponent) return depth - 10;
      else return 0;
    }
    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!bd[i]) {
          bd[i] = aiSymbol;
          best = Math.max(
            best,
            minimax(bd, depth + 1, false, aiSymbol, opponent)
          );
          bd[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!bd[i]) {
          bd[i] = opponent;
          best = Math.min(
            best,
            minimax(bd, depth + 1, true, aiSymbol, opponent)
          );
          bd[i] = null;
        }
      }
      return best;
    }
  }

  // PUBLIC_INTERFACE
  function renderResult() {
    if (!result) return null;
    if (result.winner === "draw") {
      return (
        <div className="result-draw">It’s a draw! 😃</div>
      );
    } else {
      return (
        <div className="result-winner">
          <span
            className={`color-${result.winner}`}
            style={{ fontWeight: 700 }}
          >
            {result.winner}
          </span>{" "}
          wins!
        </div>
      );
    }
  }

  // PUBLIC_INTERFACE
  function renderCell(index) {
    return (
      <button
        className="ttt-cell"
        key={index}
        disabled={!gameStarted || !!board[index] || !!result}
        onClick={() => handleCellClick(index)}
        aria-label={
          board[index] ? `${board[index]} played` : `Play here`
        }
      >
        {board[index] && (
          <span className={`cell-symbol color-${board[index]}`}>
            {board[index]}
          </span>
        )}
      </button>
    );
  }

  // PUBLIC_INTERFACE
  function renderOptionsPanel() {
    return (
      <div className="options-panel">
        <form
          className="options-form"
          onSubmit={(e) => {
            e.preventDefault();
            startGame();
          }}
        >
          <div className="game-title">Tic Tac Toe</div>
          <div className="row">
            <div className="option-group">
              <label className="option-label">Mode:</label>
              <div className="option-buttons">
                <button
                  type="button"
                  className={`option-btn ${
                    mode === "pvp" ? "selected" : ""
                  }`}
                  onClick={() => changeMode("pvp")}
                >
                  Player vs Player
                </button>
                <button
                  type="button"
                  className={`option-btn ${
                    mode === "ai" ? "selected" : ""
                  }`}
                  onClick={() => changeMode("ai")}
                >
                  Player vs Computer
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="option-group">
              <label className="option-label">You play as:</label>
              <div className="option-buttons">
                <button
                  type="button"
                  className={`option-btn ${
                    userSymbol === "X" ? "selected" : ""
                  }`}
                  disabled={gameStarted}
                  onClick={() => chooseSymbol("X")}
                  tabIndex={gameStarted ? -1 : 0}
                >
                  X
                </button>
                <button
                  type="button"
                  className={`option-btn ${
                    userSymbol === "O" ? "selected" : ""
                  }`}
                  disabled={gameStarted}
                  onClick={() => chooseSymbol("O")}
                  tabIndex={gameStarted ? -1 : 0}
                >
                  O
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <button
              className="primary-btn start-btn"
              type="submit"
              disabled={gameStarted}
            >
              {gameStarted ? "Game in Progress" : "Start New Game"}
            </button>
            <button
              className="secondary-btn restart-btn"
              type="button"
              onClick={restartGame}
              disabled={!gameStarted && !result}
            >
              Restart
            </button>
          </div>
        </form>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function renderTurnDisplay() {
    if (result) return null;
    if (!gameStarted) return null;
    let role;
    if (mode === "ai") {
      role = turn === userSymbol ? "(Your Move)" : "(Computer’s Move)";
    } else {
      role = turn === userSymbol
        ? "(Your Move)"
        : "(Opponent's Move)";
    }
    return (
      <div className="turn-info">
        <span
          className={`color-${turn} turn-symbol`}
          style={{ fontWeight: 700 }}
        >
          {turn}
        </span>{" "}
        {role}
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="App game-root">
      <div className="game-container">
        {/* Options & Controls */}
        {renderOptionsPanel()}

        {/* Board + status */}
        <div className="ttt-board-container">
          {renderTurnDisplay()}
          <div className="ttt-board" aria-label="Tic Tac Toe Game Board">
            {[...Array(3)].map((_, row) => (
              <div className="ttt-row" key={row}>
                {[...Array(3)].map((_, col) =>
                  renderCell(row * 3 + col)
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Result display */}
        <div className="result-area">{renderResult()}</div>
      </div>
      <footer className="footer-note">
        Minimalistic modern Tic Tac Toe © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
