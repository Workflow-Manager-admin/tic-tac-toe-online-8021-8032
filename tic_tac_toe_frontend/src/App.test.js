import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders tic tac toe main title', () => {
  render(<App />);
  expect(screen.getByText(/tic tac toe/i)).toBeInTheDocument();
});

test('can start a game and click a cell', () => {
  render(<App />);
  const startBtn = screen.getByText(/start new game/i);
  fireEvent.click(startBtn);
  // Click a cell
  const cells = screen.getAllByRole('button', { name: /play here/i });
  expect(cells.length).toBeGreaterThan(0);
  fireEvent.click(cells[0]);
  // Board should update (by showing X or O)
  const played = screen.getAllByText(/x|o/i, { selector: '.cell-symbol' });
  expect(played.length).toBe(1);
});
