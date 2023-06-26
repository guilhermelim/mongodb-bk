require("dotenv").config();
import { MongoClient } from "mongodb";
import googleDrive from "./drive";
import {
  deleteExistingCollections,
  readBackupFile,
  insertBackupDataToDB,
  backupCollections,
} from "./dbHelpers";

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME;
const FOLDER_ID = process.env.GOOGLE_FOLDER_ID || "";

async function backupDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const backupData = await backupCollections(db);

  try {
    const data = await googleDrive.create(
      `backup-${new Date().toISOString()}.json`,
      backupData,
      FOLDER_ID
    );
    console.log(`Backup completed. File ID: ${data.id}`);
  } catch (error) {
    console.error("Error while creating file:", error);
  } finally {
    await client.close();
  }
}

async function restoreDB(fileId: string, deleteBeforeRestore?: boolean) {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  if (deleteBeforeRestore) {
    await deleteExistingCollections(db);
  }

  const backupData = await readBackupFile(fileId);

  await insertBackupDataToDB(db, backupData);

  console.log(`Database restoration from backup completed.`);
  await client.close();
}

(async function run() {
  // Run backup
  await backupDB();
  // Run restore
  // await restoreDB("1518qV9wAjRFuWz3cA6HwKfDW8LMJJoSJ", true).catch(
  //   console.error
  // );
  // Cria backup
  // await backupDB().catch(console.error);
  // run delete
  // const deleteSuccess = await googleDrive.delete(
  //   "1LAlU5srKhEU9XU2z42EXGVkL697o0eoB"
  // );
  // deleteSuccess && console.log("Excluído com sucesso!");
  // run list files
  // await googleDrive.listAll().then((data) => {
  //   if (data.status == 200) {
  //     console.log(data.files);
  //   }
  // });
})();
