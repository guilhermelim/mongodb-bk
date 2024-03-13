# MongoDB Backup

This tool provides an easy way to backup MongoDB databases and save them to Google Drive. It is developed with TypeScript and relies on Google Cloud APIs to interact with Google Drive. The tool can also restore data from a saved backup on Google Drive to MongoDB.

## Installation

You can install MongoDB Backup as a dependency in your project using either npm or Yarn.

If you're using npm:

```bash
npm install mongodb-bk
```

Or, if you prefer Yarn:

```bash
yarn add mongodb-bk
```

## Features

- Backup MongoDB database and save it to Google Drive.
- Restore MongoDB database from a backup file stored on Google Drive.
- Delete existing collections in the MongoDB database before restoring.
- List all backup files stored on Google Drive.
- Delete a backup file from Google Drive.

## Setup

After installation, you will need to setup your Google Cloud credentials and MongoDB connection.

1. You need to get a `credentials.json` file from Google Cloud:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - In the sidebar, go to APIs & Services > Library
   - Search for Google Drive API and enable it
   - Go to APIs & Services > Credentials
   - Click on "+ CREATE CREDENTIALS" and select "Service account"
   - Fill the required information and create the service account
   - Copy and save the email of your service account, which will be something like **`serviceaccountname@project-id-390507.iam.gserviceaccount.com`**
   - On the service account page, under "Keys" tab, add a new key and select JSON
   - The `credentials.json` file will be downloaded

2. Get the ID of the Google Drive folder where the backup files will be created

   - To get the ID of the Google Drive folder, go to https://drive.google.com/drive/my-drive
   - Create a folder where the backup files will be stored. For example, 'db-backups'.
   - Access the folder you created. The URL will be something like: `https://drive.google.com/drive/u/0/folders/1j-i25sHPM0wsKrjv2dUgsKl3STbq0qDp`.
   - Now, obtain the folder ID from the URL link. The Google Drive folder ID is the last part of the URL, after `/folders/`. In this example, the folder ID is `1j-i25sHPM0wsKrjv2dUgsKl3STbq0qDp`.

3. Share the folder with the service account email

   - Go to the folder you created for storing backups in [Google Drive](https://drive.google.com/drive/my-drive)
   - Click on the "Share" button
   - Enter the email address of the service account you created (e.g., `serviceaccountname@project-id-390507.iam.gserviceaccount.com`)
   - Set the role to "Editor" to grant full access to the folder
   - For security purposes, it's recommended to set the folder's sharing settings to "Restricted" with access only to specific emails authorized to access the folder.

4. Obtain the MongoDB connection link. It will be something like `mongodb://user:password@localhost:27017/dbname`.

## Usage

You can use this library programmatically by importing the `MongoDBBackup` class. This class provides methods to backup and restore your MongoDB database to Google Drive.

Here is a simple example of how to backup and restore a MongoDB database:

```typescript
import { MongoDBBackup } from "mongodb-bk";

// Load Google Credentials from your JSON file
const googleCredentials = require("<path-to-your-credentials.json-file>");

// Specify your MongoDB connection string
const mongodbURI = "<your-mongodb-uri>"; // For example: mongodb+srv://user:password@cluster.mongodb.net/db_name

// Specify the ID of the Google Drive folder where you want to save the backups
const googleFolderId = "<your-google-drive-folder-id>";

// Create an instance of MongoDBBackup
const mongodbBackup = new MongoDBBackup(
  googleCredentials,
  mongodbURI,
  googleFolderId
);

// Backup your MongoDB database to Google Drive
mongodbBackup.backup();

// Restore your MongoDB database from a backup in Google Drive
mongodbBackup.restore("<backup-file-id>", true);

// List all files and folders in the Google Drive folder
mongodbBackup.list();

// Delete a file or folder from Google Drive
mongodbBackup.delete("<file-or-folder-id>");

// Delete all files and optionally folders from Google Drive
mongodbBackup.deleteAll();

// Empty the trash in Google Drive
mongodbBackup.emptyTrash();
```

Please make sure to replace `<path-to-your-credentials.json-file>`, `<your-mongodb-uri>`, `<your-google-drive-folder-id>`, and `<backup-file-id>` with actual values.

## API

### `backup(fileName?: string): Promise<string | null>`

Creates a backup of the MongoDB and saves it on Google Drive.

- `fileName` (optional): The name of the backup file. If not provided, a default name will be used.

Returns a promise that resolves to the ID of the backup file on Google Drive.

### `restore(fileId: string, deleteBeforeRestore?: boolean): Promise<boolean>`

Restores MongoDB from a backup on Google Drive.

- `fileId`: ID of the backup file on Google Drive.
- `deleteBeforeRestore` (optional): If true, deletes all data in MongoDB before restoring. Default is false.

Returns a promise that resolves to a boolean indicating whether the restore operation was successful.

### `list(includeFolders?: boolean): Promise<ListResponse>`

Lists files and optionally folders in Google Drive.

- `includeFolders` (optional): Specifies whether to include folders in the list. Default is false.

Returns a promise that resolves to a `ListResponse` object containing information about the files and folders.

### `delete(fileOrFolderId: string): Promise<boolean>`

Deletes a file or folder from Google Drive.

- `fileOrFolderId`: ID of the file or folder to delete.

Returns a promise that resolves to a boolean indicating whether the delete operation was successful.

### `deleteAll(deleteFolders?: boolean): Promise<boolean>`

Deletes all files and optionally folders from Google Drive.

- `deleteFolders` (optional): Specifies whether to delete folders as well. Default is false.

Returns a promise that resolves to `true` if all files and folders were deleted successfully, and `false` otherwise.

### `emptyTrash(): Promise<boolean>`

Empties the trash in Google Drive, permanently deleting all files and folders.

Returns a promise that resolves to a boolean indicating whether the trash was emptied successfully.

## Contribution

Contributions are welcome. Please create an issue or submit a PR if you want to contribute.

## License

This project is licensed under the terms of the [MIT License](LICENSE).
