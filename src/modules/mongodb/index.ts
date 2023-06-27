import { MongoClient, Db, Document } from "mongodb";

/**
 * MongoDBClient class to handle MongoDB operations.
 */
export class MongoDBClient {
  private client: MongoClient;

  /**
   * Constructs a new instance of MongoDBClient.
   *
   * @param uri - MongoDB connection string.
   */
  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }

  /**
   * Connects to the MongoDB.
   *
   * @returns {Promise<boolean>} - Returns true if successful, false otherwise.
   */
  async connect(): Promise<boolean> {
    try {
      await this.client.connect();
      return true;
    } catch (error) {
      console.error("Failed to connect to MongoDB: " + error);
      return false;
    }
  }

  /**
   * Disconnects from the MongoDB.
   *
   * @returns {Promise<boolean>} - Returns true if successful.
   */
  async disconnect(): Promise<boolean> {
    try {
      await this.client.close();

      return true;
    } catch (error) {
      console.error("Failed to disconnect from MongoDB: " + error);
      return false;
    }
  }

  /**
   * Retrieves the database.
   *
   * @returns {Promise<Db>} - Returns the database.
   */
  async getDB(): Promise<Db> {
    try {
      return this.client.db();
    } catch (error) {
      throw new Error("Failed to get DB from MongoDB: " + error);
    }
  }

  /**
   * Retrieves backup data from the MongoDB.
   *
   * @returns {Promise<Record<string, Document[]>>} - Returns backup data.
   */
  async getBackupData(): Promise<Record<string, Document[]>> {
    try {
      await this.connect();
    } catch (error) {
      throw new Error("Failed to connect to MongoDB before backup: " + error);
    }

    const db = await this.getDB();

    try {
      const collections = await db.listCollections().toArray();
      let backupData: any = {};

      for (const collection of collections) {
        backupData[collection.name] = await db
          .collection(collection.name)
          .find()
          .toArray();
      }

      return backupData;
    } catch (error) {
      throw new Error("Failed to fetch backup data from MongoDB: " + error);
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Restores backup data to MongoDB.
   *
   * @param backupData - The backup data to restore.
   * @param deleteBeforeRestore - Delete existing collections before restoring.
   *
   * @returns {Promise<boolean>} - Returns true if successful.
   */
  async restore(
    backupData: any,
    deleteBeforeRestore?: boolean
  ): Promise<boolean> {
    try {
      await this.connect();

      const db = await this.getDB();

      if (deleteBeforeRestore) {
        await this.deleteExistingCollections(db);
      }

      await this.insertBackupDataToDB(db, backupData);

      return true;
    } catch (error) {
      console.error("Failed to restore data to MongoDB: ", error);
      return false;
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Deletes all existing collections in the MongoDB.
   *
   * @param db - The MongoDB database instance.
   *
   * @returns {Promise<boolean>} - Returns true if successful.
   */
  private async deleteExistingCollections(db: any): Promise<boolean> {
    try {
      const collections = await db.listCollections().toArray();
      for (const collection of collections) {
        await db.collection(collection.name).drop();
      }
      return true;
    } catch (error) {
      console.error("Failed to delete collections from MongoDB: " + error);
      return false;
    }
  }

  /**
   * Inserts backup data to MongoDB.
   *
   * @param db - The MongoDB database instance.
   * @param data - The backup data to insert.
   *
   * @returns {Promise<boolean>} - Returns true if successful.
   */
  private async insertBackupDataToDB(db: any, data: any): Promise<boolean> {
    try {
      for (const collection in data) {
        await db.createCollection(collection);
        if (data[collection].length) {
          await db.collection(collection).insertMany(data[collection]);
        }
      }
      return true;
    } catch (error) {
      console.log("Failed to insert backup data to MongoDB: " + error);
      return false;
    }
  }
}
