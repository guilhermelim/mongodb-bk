import { Document } from "mongodb";
import googleDrive from "./drive";

// O restante do código

// Função para apagar todas as coleções no banco de dados
export async function deleteExistingCollections(db: any): Promise<boolean> {
  try {
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      await db.collection(collection.name).drop();
    }
    return true;
  } catch (error) {
    console.error("Erro ao apagar as coleções: ", error);
    return false;
  }
}

// Função para ler o arquivo de backup do Google Drive
export async function readBackupFile(
  fileId: string
): Promise<Record<string, Document[]>> {
  const fileStream = await googleDrive
    .read(fileId)
    .then((response) => response.data);

  let backupData = "";
  for await (const chunk of fileStream) {
    backupData += chunk;
  }

  return JSON.parse(backupData) as Record<string, Document[]>;
}

// Função para inserir dados de backup no banco de dados
export async function insertBackupDataToDB(
  db: any,
  data: Record<string, Document[]>
): Promise<boolean> {
  try {
    for (const collection in data) {
      await db.createCollection(collection);
      if (data[collection].length) {
        await db.collection(collection).insertMany(data[collection]);
      }
    }
    return true;
  } catch (error) {
    console.error("Erro ao inserir os dados de backup: ", error);
    return false;
  }
}

// Função para fazer backup de todas as coleções no banco de dados
export async function backupCollections(
  db: any
): Promise<Record<string, Document[]>> {
  const collections = await db.listCollections().toArray();
  const backupData: Record<string, Document[]> = {};

  for (const collection of collections) {
    backupData[collection.name] = await db
      .collection(collection.name)
      .find()
      .toArray();
  }

  return backupData;
}
