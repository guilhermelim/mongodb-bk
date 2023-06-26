import { GoogleDrive } from "./google-drive";

const CREDENTIALS = require("./credentials.json");

// Cria a instância do Google Drive
const googleDrive = new GoogleDrive(CREDENTIALS);

export default googleDrive;
