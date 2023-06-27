# MongoDB Backup

This tool provides an easy way to backup MongoDB databases and save them to Google Drive. It is developed with TypeScript and relies on Google Cloud APIs to interact with Google Drive. The tool can also restore data from a saved backup on Google Drive to MongoDB.

## Installation

Install MongoDB Backup as a dependency in your project using npm:

```bash
npm install mongodb-bk
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
   - On the service account page, under "Keys" tab, add a new key and select JSON
   - The `credentials.json` file will be downloaded

2. Create a new `.env` file in the root directory of your project and fill the following details:
   ```dotenv
   GOOGLE_CREDENTIALS=<path to your credentials.json file>
   MONGODB_URI=<Your MongoDB URI>
   GOOGLE_FOLDER_ID=<Your Google Drive Folder ID>
   ```

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
const backup = new MongoDBBackup(googleCredentials, mongodbURI, googleFolderId);

// Backup your MongoDB database to Google Drive
backup.backup();

// Restore your MongoDB database from a backup in Google Drive
backup.restore("<backup-file-id>");
```

Please make sure to replace `<path-to-your-credentials.json-file>`, `<your-mongodb-uri>`, `<your-google-drive-folder-id>`, and `<backup-file-id>` with actual values.

**How to get the Google Drive folder ID?**
To get your Google Drive folder ID, navigate to the folder in your web browser. The URL will be something like this: `https://drive.google.com/drive/u/0/folders/1j-i25sHPM0wsKrjv2dUgsKl3STbq0qDp`. The Google Drive folder ID is the last part of the URL, after `/folders/`. In this example, the folder ID is `1j-i25sHPM0wsKrjv2dUgsKl3STbq0qDp`.

## Contribution

Contributions are welcome. Please create an issue or submit a PR if you want to contribute.

## License

This project is licensed under the terms of the [MIT License](LICENSE).
