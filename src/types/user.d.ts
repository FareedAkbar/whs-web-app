interface UsersResponseData {
    status: boolean;
    message: string;
    users: User[];
    token: string;
}
interface UpdateUserResponseData {
    status: boolean;
    message: string;
    user: User;

}
interface User {
    id: string;
    name: string;
    email: string;
    mediaId: string;
    imageUrl: string;
    providerImageUrl: string;
    token: string;
    role: "ADMIN" | "WORKER" | "EMPLOYEE" | "UNDEFINED"; // Add "UNDEFINED" if needed
    isVerifiedByAdmin?: boolean;
    phoneNumber?: string;
    isVerified?: boolean;
}