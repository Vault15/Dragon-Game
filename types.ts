
export enum GameState {
  HOME = 'HOME',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface GameStats {
  score: number;
  missed: number;
  bestScore: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}
