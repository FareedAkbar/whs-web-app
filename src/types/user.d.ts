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