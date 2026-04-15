export interface Player {
  id: string;
  username: string;
  color: string;
  ready: boolean;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  minPlayers: number;
  maxPlayers: number;
}

export interface Room {
  id: string;
  players: Player[];
}
