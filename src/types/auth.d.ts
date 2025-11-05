// Type for the login response
interface LoginResponseData {
  status: boolean;
  message: string;
  user: User;
  token: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  mediaId: string;
  imageUrl: string;
  providerImageUrl: string;
  token: string;
  role: UserRole;
  isVerifiedByAdmin?: boolean;
  phoneNumber?: string;
  isVerified?: boolean;
}
