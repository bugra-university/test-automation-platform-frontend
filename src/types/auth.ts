export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    name?: string; // Added for compatibility with UI components
    avatarUrl?: string; // Added for profile images
    roles: string[];
    // keycloakId removed
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    error: string | null;
    token: string | null;
}
