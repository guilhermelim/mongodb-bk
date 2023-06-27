import { google } from "googleapis";
import { Readable } from "stream";

/**
 * Response object from Google Drive API.
 */
export interface DriveResponse {
  status: number;
  statusText: string;
  id: string | null;
}

/**
 * Information about the file in Google Drive.
 */
export interface FileData {
  id: string;
  name: string;
  mimeType: string;
  parents: string[];
}

/**
 * Response object from the list files operation in Google Drive API.
 */
export interface ListResponse {
  status: number;
  statusText: string;
  files: FileData[] | null;
}

/**
 * Response object from the read operation in Google Drive API.
 */
export interface ReadStreamResponse {
  data: NodeJS.ReadableStream;
  status: number;
  statusText: string;
}

/**
 * GoogleDrive class to handle Google Drive operations.
 */
export class GoogleDrive {
  private auth: any;
  private drive: any;

  /**
   * Constructs a new instance of GoogleDrive.
   *
   * @param credentials - Google Drive API credentials.
   */
  constructor(credentials: any) {
    const scopes = ["https://www.googleapis.com/auth/drive"];
    this.auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      scopes
    );
    this.drive = google.drive({ version: "v3", auth: this.auth });
  }

  /**
   * Creates a file in Google Drive.
   *
   * @param fileName - The name of the file.
   * @param content - The content of the file.
   * @param folderId - The ID of the folder where the file will be created.
   *
   * @returns {Promise<DriveResponse>} - Returns the response from the Google Drive API.
   */
  async create(
    fileName: string,
    content: any,
    folderId?: string
  ): Promise<DriveResponse> {
    const fileMetadata: any = {
      name: fileName,
      mimeType: "application/json",
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType: "application/json",
      body: Readable.from(JSON.stringify(content)),
    };

    const res = await this.drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id",
    });

    if (res.status === 200) {
      return {
        status: res.status,
        statusText: res.statusText,
        id: res.data.id,
      };
    } else {
      return {
        status: res.status,
        statusText: res.statusText,
        id: null,
      };
    }
  }

  /**
   * Reads a file from Google Drive.
   *
   * @param fileId - The ID of the file.
   *
   * @returns {Promise<ReadStreamResponse>} - Returns the content of the file as a stream.
   */
  async read(fileId: string): Promise<ReadStreamResponse> {
    const res = await this.drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" }
    );
    return { data: res.data, status: res.status, statusText: res.statusText };
  }

  /**
   * Deletes a file or a folder from Google Drive.
   *
   * @param fileOrFolderId - The ID of the file or folder.
   *
   * @returns {Promise<boolean>} - Returns true if the operation was successful, false otherwise.
   */
  async delete(fileOrFolderId: string): Promise<boolean> {
    const res = await this.drive.files.delete({ fileId: fileOrFolderId });

    if (res.status === 204) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Lists all files and folders in Google Drive.
   *
   * @returns {Promise<ListResponse>} - Returns the list of all files and folders.
   */
  async listAll(): Promise<ListResponse> {
    const res = await this.drive.files.list({
      pageSize: 1000,
      fields: "nextPageToken, files(id, name, mimeType, parents)",
    });

    if (res.status === 200) {
      const filesAndFolders = res.data.files;
      return {
        status: res.status,
        statusText: res.statusText,
        files: filesAndFolders,
      };
    } else {
      return {
        status: res.status,
        statusText: res.statusText,
        files: null,
      };
    }
  }

  /**
   * Empties the trash in Google Drive.
   *
   * @returns {Promise<boolean>} - Returns true if the operation was successful, false otherwise.
   */
  async emptyTrash(): Promise<boolean> {
    const res = await this.drive.files.emptyTrash();

    if (res.status === 204) {
      return true;
    } else {
      return false;
    }
  }
}
