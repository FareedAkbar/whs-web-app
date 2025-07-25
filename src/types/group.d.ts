interface Group {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  manager?: User;
  staff?: User[];
}
interface NewGroup {
  name: string;
  description: string;
  managerId?: string;
  staff_count?: number;
  manager?: User;
}
interface GroupApiResponse {
  status: boolean;
  data: Group[];
}
interface CreateGroupResponse {
  status: boolean;
  data: Group;
}
