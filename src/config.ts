/**
 * Config class serves as a configuration holder for MongoDBBackup.
 */
export class Config {
  static googleCredentials: object;
  static mongodbURI: string;
  static googleFolderId: string;

  /**
   * Initializes the Config class with specified parameters.
   *
   * @param googleCredentials - Google credentials required for authentication with Google Drive.
   * @param mongodbURI - MongoDB connection string.
   * @param googleFolderId - ID of the Google Drive folder to save backups.
   */
  static init(
    googleCredentials: object,
    mongodbURI: string,
    googleFolderId: string
  ): void {
    this.googleCredentials = googleCredentials;
    this.mongodbURI = mongodbURI;
    this.googleFolderId = googleFolderId;
  }
}
