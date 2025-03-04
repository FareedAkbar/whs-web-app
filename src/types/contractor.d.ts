interface Contractor {
    id: string;
    name: string;
    email: string;
    phone: string;
    services: string[];
    status:string;
}
interface ContractorApiResponse {
    status: string;
    message: string;
    data: Contractor[];
  }