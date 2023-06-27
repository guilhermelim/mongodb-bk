import { MongoDBBackup } from "../src/index";

describe("MongoDBBackup", () => {
  let backup: MongoDBBackup;
  const googleCredentials = require("<path to your credentials.json file>");
  const mongodbURI = "<Your MongoDB URI>"; //Example: mongodb+srv://user:password@mongodb.net/db_name
  const googleFolderId = "<Your Google Drive Folder ID>";

  beforeAll(() => {
    backup = new MongoDBBackup(googleCredentials, mongodbURI, googleFolderId);
  });

  test("MongoDBBackup instance should be created", () => {
    expect(backup).toBeInstanceOf(MongoDBBackup);
  });

  test("backup function should be defined", () => {
    expect(backup.backup).toBeDefined();
  });

  test("restore function should be defined", () => {
    expect(backup.restore).toBeDefined();
  });
});
