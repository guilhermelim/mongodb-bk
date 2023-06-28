import { GoogleDrive, ListResponse } from "./modules/googleDrive";
import { MongoDBClient } from "./modules/mongodb";
import { Config } from "./config";

/**
 * MongoDBBackup class provides methods for backing up and restoring MongoDB to Google Drive.
 */
export class MongoDBBackup {
  private googleDrive: GoogleDrive;
  private mongoDBClient: MongoDBClient;

  /**
   * Constructs a new instance of MongoDBBackup.
   *
   * @param googleCredentials - Google credentials required for authentication with Google Drive.
   * @param mongodbURI - MongoDB connection string.
   * @param googleFolderId - ID of the Google Drive folder to save backups.
   */
  constructor(
    googleCredentials: object,
    mongodbURI: string,
    googleFolderId: string
  ) {
    Config.init(googleCredentials, mongodbURI, googleFolderId);
    this.googleDrive = new GoogleDrive(Config.googleCredentials);
    this.mongoDBClient = new MongoDBClient(Config.mongodbURI);
  }

  /**
   * Creates a backup of the MongoDB and saves it on Google Drive.
   *
   * @param fileName - The name of the backup file. If not provided, a default name will be used.
   * @returns A promise that resolves to the ID of the backup file on Google Drive.
   */
  public async backup(fileName?: string): Promise<string | null> {
    const backupData = await this.mongoDBClient.getBackupData();

    const defaultFileName = `${new Date().toISOString()}-backup.json`;
    let backupFileName = fileName || defaultFileName;

    // Check if the backupFileName has a valid file extension
    if (!/\.\w+$/.test(backupFileName)) {
      backupFileName += ".json"; // Add the ".json" extension if not present
    }

    const driveResponse = await this.googleDrive.create(
      backupFileName,
      backupData,
      Config.googleFolderId
    );
    return driveResponse.id;
  }

  /**
   * Restores MongoDB from a backup on Google Drive.
   *
   * @param fileId - ID of the backup file on Google Drive.
   * @param deleteBeforeRestore - If true, deletes all data in MongoDB before restoring. Default is false.
   * @returns A promise that resolves to a boolean indicating whether the restore operation was successful.
   */
  public async restore(
    fileId: string,
    deleteBeforeRestore?: boolean
  ): Promise<boolean> {
    const readStreamResponse = await this.googleDrive.read(fileId);
    const data = await new Promise((resolve, reject) => {
      const chunks: any[] = [];
      readStreamResponse.data
        .on("data", (chunk: any) => chunks.push(chunk))
        .on("error", reject)
        .on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });

    if (typeof data === "string") {
      const backupData = JSON.parse(data);
      const restoreResult = await this.mongoDBClient.restore(
        backupData,
        deleteBeforeRestore
      );
      return restoreResult;
    } else {
      throw new Error("Failed to parse data from stream");
    }
  }

  /**
   * Lists all files in the Google Drive folder specified during the object creation.
   *
   * @param {boolean} [includeFolders] - Optional parameter to specify whether to include folders in the list (default: false).
   * @returns A promise that resolves to a ListResponse object containing information about all files.
   */
  public async list(includeFolders?: boolean): Promise<ListResponse> {
    return this.googleDrive.list(includeFolders);
  }

  /**
   * Deletes a file or folder from Google Drive.
   *
   * @param fileOrFolderId - ID of the file or folder to delete.
   * @returns A promise that resolves to a boolean indicating whether the delete operation was successful.
   */
  public async delete(fileOrFolderId: string): Promise<boolean> {
    return this.googleDrive.delete(fileOrFolderId);
  }

  /**
   * Deletes all files and optionally folders from Google Drive.
   *
   * @param {boolean} [deleteFolders] - Optional parameter to specify whether to delete folders as well (default: false).
   * @returns {Promise<boolean>} - A promise that resolves to `true` if all files and folders were deleted successfully, and `false` otherwise.
   */
  public async deleteAll(deleteFolders?: boolean): Promise<boolean> {
    return this.googleDrive.deleteAll(deleteFolders);
  }

  /**
   * Empties the trash in Google Drive, permanently deleting all files and folders.
   *
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the trash was emptied successfully.
   */
  public async emptyTrash(): Promise<boolean> {
    return this.googleDrive.emptyTrash();
  }
}
