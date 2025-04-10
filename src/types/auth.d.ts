interface UserInterface {
    id: string;
    name: string;
    email: string;
    mediaId: string;
    imageUrl: string;
    token: string;
    role: string;
    isVerifiedByAdmin?: boolean;
    phoneNumber?: string;
    isVerified?: boolean;
}


// Type for the login response
interface LoginResponseData {
    status: boolean;
    message: string;
    user: UserInterface;
    token: string;
}
