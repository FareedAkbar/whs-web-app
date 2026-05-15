export interface MediaItem {
  id: string;
  displayName?: string;
  fieldname?: string;
  originalname?: string;
  encoding?: string;
  mimetype?: string;
  destination?: string;
  filename?: string;
  url?: string;
  path?: string;
  size?: string | number;
  createdByUserId?: string;
  createdDateTime?: string;
  status?: string;
}

export interface FileUrl {
  baseUrl: string;
  file: MediaItem;
}

export interface UploadMediaApiResponse {
  status?: string;
  message: string;
  fileUrls: FileUrl[];
}

export interface GetMediaResponse {
  status: boolean;
  message: string;
  data: MediaItem[];
}

export interface SelectedMedia {
  id: string;
  url: string;
  name?: string;
}

export function getUploadedMediaUrl(uploadedFile: FileUrl): string {
  if (uploadedFile.baseUrl && uploadedFile.file.path) {
    return `${uploadedFile.baseUrl.replace(/\/$/, "")}/${uploadedFile.file.path.replace(/^\//, "")}`;
  }

  return uploadedFile.file.url || uploadedFile.baseUrl;
}

export function getMediaUrl(media: MediaItem, fallbackBaseUrl = ""): string {
  if (media.url) return media.url;
  if (media.path && fallbackBaseUrl) {
    return `${fallbackBaseUrl.replace(/\/$/, "")}/${media.path.replace(/^\//, "")}`;
  }
  return media.path ?? "";
}
