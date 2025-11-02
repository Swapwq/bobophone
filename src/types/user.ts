// User types for the application

export interface PublicUser {
  id: string;
  email: string;
  username: string | null;
}

export interface SearchUserResult {
  id: string;
  username: string | null;
  email: string;
}
