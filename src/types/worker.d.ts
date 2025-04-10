interface Worker {
    id: string;
    name: string;
    email: string;
    phone: string;
    services: string[];
    status:string;
}
interface WorkerApiResponse {
    status: string;
    message: string;
    users: Worker[];
  }