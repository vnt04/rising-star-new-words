export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  cards?: Card[];
}

export interface Card {
  id: string;
  front: string;
  back: string;
  example: string | null;
  deckId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface ApiError {
  status: number;
  message: string;
}
