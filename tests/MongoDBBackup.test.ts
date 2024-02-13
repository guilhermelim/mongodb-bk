require("dotenv").config();
import { MongoDBBackup } from "../src/index";

describe("Environment Check", () => {
  test("should have all required environment variables defined", () => {
    const googleCredentials = require("../credentials.json");
    const mongodbURI = process.env.MONGODB_URI;
    const googleFolderId = process.env.GOOGLE_FOLDER_ID;

    if (!googleCredentials) {
      throw new Error(
        "Missing required 'googleCredentials' environment variable."
      );
    }

    if (!mongodbURI) {
      throw new Error("Missing required 'MONGODB_URI' environment variable.");
    }

    if (!googleFolderId) {
      throw new Error(
        "Missing required 'GOOGLE_FOLDER_ID' environment variable."
      );
    }
  });
});

describe("End-to-End Test for MongoDBBackup", () => {
  let backup: MongoDBBackup;
  let backupId: string; // Variável para armazenar o ID do backup

  // Credentials to run the tests
  const googleCredentials = require("../credentials.json");
  const mongodbURI = process.env.MONGODB_URI;
  const googleFolderId = process.env.GOOGLE_FOLDER_ID;

  beforeAll(() => {
    backup = new MongoDBBackup(
      googleCredentials,
      mongodbURI as string,
      googleFolderId as string
    );
  });

  test("should instantiate the MongoDBBackup object", () => {
    expect(backup).toBeInstanceOf(MongoDBBackup);
  });

  test("should successfully initiate the backup process", async () => {
    const result = await backup.backup();
    if (result === null) {
      throw new Error("Backup retornou um valor nulo.");
    }
    backupId = result;
    expect(typeof backupId).toBe("string");
  }, 10000);

  test("should list existing backup files", async () => {
    // Get the list of backup files
    const listResult = await backup.list();

    // Verify if the list of files was returned
    expect(listResult).toBeDefined();

    // Check if the status is 200 (OK)
    expect(listResult.status).toBe(200);

    // Check if the list of files contains the backup file with the corresponding ID
    const backupFile = listResult.files.find((file) => file.id === backupId);
    expect(backupFile).toBeDefined();
    // console.log("Backup file found:", backupFile); // Optional: Logs the backup file found
    // console.log("Backup file name:", backupFile?.name); // Optional: Logs the backup file name
    // console.log("Backup file ID:", backupFile?.id); // Optional: Logs the backup file ID

    // Indicates whether the backup file was found in the list of files
    expect(backupFile).toBeDefined();
  }, 10000);

  test("should successfully initiate the restore process", async () => {
    // Checks if backupId is defined (if the backup was successfully performed)
    expect(backupId).toBeDefined();

    // Performs the restoration using the ID of the previous backup
    const restoreResult = await backup.restore(backupId, true);
    expect(restoreResult).toBe(true);
  }, 50000);

  test("should delete the last created backup file", async () => {
    // Checks if backupId is defined (if the backup was successfully performed)
    expect(backupId).toBeDefined();

    // Calls the function to delete the last created backup
    const deleteResult = await backup.delete(backupId);
    expect(deleteResult).toBe(true);
  });
});
