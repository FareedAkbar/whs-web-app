interface User {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    password: string;
    mediaId: string;
    isVerified: boolean;
    salt: string;
    code: string;
    createdAt: string;
    updatedAt: string;
    teamId: string;
    isCaptain: boolean;
    isApprovedAsTeamMember: boolean;
    isPasswordChanged: boolean;
    username: string;
    emailConfirmed: boolean;
    passwordHash: string | null;
    securityStamp: string | null;
    phoneNumber: string | null;
    phoneNumberConfirmed: boolean;
    twoFactorEnabled: boolean;
    lockoutEnd: string | null;
    lockoutEnabled: boolean;
    accessFailedCount: number;
    teamName: string;
}

// Type for the login response
interface LoginResponseData {
    status: boolean;
    message: string;
    user: User;
    token: string;
}
