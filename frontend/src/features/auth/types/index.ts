export interface User {
  id: string;
  name: string;
  email: string;
  storageUsed: number;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    token?: string;
  };
}
