interface Employee {
    id: string;
    name: string;
    email: string;
    mediaId: string;
    imageUrl: string;
    token: string;
    role: string;
    incidents: IncidentData[];
}
interface EmployeesResponseData {
    status: boolean;
    message: string;
    data: User[];
}