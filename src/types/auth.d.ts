interface User {
    id: string;
    name: string;
    email: string;
    mediaId: string;
    imageUrl: string;
    token: string;
    role?: string;
    isVerifiedByAdmin: boolean;
}

// Type for the login response
interface LoginResponseData {
    status: boolean;
    message: string;
    user: User;
    token: string;
}
