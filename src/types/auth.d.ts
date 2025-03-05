

// Type for the login response
interface LoginResponseData {
    status: boolean;
    message: string;
    user: User;
    token: string;
}
