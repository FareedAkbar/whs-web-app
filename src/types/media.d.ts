 interface MediaItem  {
    id: string;
    displayName: string;
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    url: string;
    path: string;
    size: string;
    createdByUserId: string;
    createdDateTime: string;
    status: string;
  };
  interface FileUrl {
    baseUrl: string;
    file: MediaItem;
  }
  interface UploadMediaApiResponse {
    status?: string;
    message: string;
    fileUrls: FileUrl[] // Use correct type here
  }
  interface  GetMediaResponse {
    status: boolean;
    message: string;
    data: MediaItem[];
  };