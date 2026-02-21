import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

function getAuth() {
    const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!jsonStr) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON non configurato");
    }
    const credentials = JSON.parse(jsonStr);
    return new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: SCOPES
    });
}

const drive = google.drive({ version: "v3", auth: getAuth() });

export async function uploadToDrive(
    fileStream: Readable,
    filename: string,
    mimeType: string,
    folderId?: string
) {
    const response = await drive.files.create({
        requestBody: {
            name: filename,
            parents: folderId ? [folderId] : undefined,
        },
        media: {
            mimeType: mimeType,
            body: fileStream,
        },
        fields: "id, name, webContentLink, thumbnailLink, mimeType, modifiedTime",
    });

    // Rendi il file leggibile a chiunque abbia il link (opzionale, dipende dalla privacy voluta)
    await drive.permissions.create({
        fileId: response.data.id!,
        requestBody: {
            role: "reader",
            type: "anyone",
        },
    });

    return response.data;
}

export async function getFileMetadata(fileId: string) {
    const response = await drive.files.get({
        fileId,
        fields: "id, name, webContentLink, thumbnailLink, mimeType, modifiedTime",
    });
    return response.data;
}

export async function listFilesInFolder(folderId: string) {
    const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`,
        fields: "files(id, name, webContentLink, thumbnailLink, mimeType, modifiedTime)",
        pageSize: 1000,
    });
    return response.data.files || [];
}
