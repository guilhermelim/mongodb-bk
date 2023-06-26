import { google } from "googleapis";
import { Readable } from "stream";

interface DriveResponse {
  status: number;
  statusText: string;
  id: string | null;
}

interface FileData {
  id: string;
  name: string;
  mimeType: string;
  parents: string[];
}

interface ListResponse {
  status: number;
  statusText: string;
  files: FileData[] | null;
}

interface ReadStreamResponse {
  data: NodeJS.ReadableStream;
  status: number;
  statusText: string;
}

export class GoogleDrive {
  private auth: any;
  private drive: any;

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

  async delete(fileOrFolderId: string): Promise<boolean> {
    const res = await this.drive.files.delete({ fileId: fileOrFolderId });

    if (res.status === 204) {
      return true;
    } else {
      return false;
    }
  }

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
}
