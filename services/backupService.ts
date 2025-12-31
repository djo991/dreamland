import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';
import { Dream } from '../components/DreamContext';

export const createBackupZip = async (dreams: Dream[]): Promise<string> => {
    const zip = new JSZip();

    // 1. Add Data
    zip.file("dreams.json", JSON.stringify(dreams, null, 2));

    // 2. Add Images
    const imgFolder = zip.folder("images");
    const processedImages = new Set<string>();

    for (const dream of dreams) {
        if (dream.images && dream.images.length > 0) {
            for (const imgUri of dream.images) {
                if (processedImages.has(imgUri)) continue;

                try {
                    // Check if it's a local file (ignore remote URLs if any)
                    if (imgUri.startsWith('file://') || imgUri.startsWith('/')) {
                        const fileName = imgUri.split('/').pop();
                        if (fileName) {
                            const fileContent = await FileSystem.readAsStringAsync(imgUri, {
                                encoding: FileSystem.EncodingType.Base64,
                            });
                            imgFolder?.file(fileName, fileContent, { base64: true });
                            processedImages.add(imgUri);
                        }
                    }
                } catch (e) {
                    console.warn(`Failed to backup image: ${imgUri}`, e);
                }
            }
        }
    }

    // 3. Generate ZIP string (base64)
    const zipBase64 = await zip.generateAsync({ type: "base64" });

    // 4. Write to File
    const fileName = `DreamJournal_Backup_${new Date().toISOString().split('T')[0]}.zip`;
    const uri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(uri, zipBase64, {
        encoding: FileSystem.EncodingType.Base64,
    });

    return uri;
};

export const parseBackupZip = async (zipUri: string): Promise<{ dreams: Dream[], images: Record<string, string> }> => {
    try {
        // 1. Read ZIP file
        const zipBase64 = await FileSystem.readAsStringAsync(zipUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const zip = await JSZip.loadAsync(zipBase64, { base64: true });

        // 2. Extract Data
        const dataFile = zip.file("dreams.json");
        if (!dataFile) throw new Error("Invalid Backup: Missing dreams.json");

        const dreamsJson = await dataFile.async("string");
        const dreams: Dream[] = JSON.parse(dreamsJson);

        // 3. Extract Images
        const images: Record<string, string> = {}; // Map: OldFileName -> NewLocalUri
        const imgFolder = zip.folder("images");

        if (imgFolder) {
            const imageFiles: string[] = [];
            imgFolder.forEach((relativePath, file) => {
                if (!file.dir) imageFiles.push(relativePath);
            });

            // Ensure local images directory exists
            const localImagesDir = `${FileSystem.documentDirectory}`; // Images stored in root or specific folder? 
            // Current app stores in root or cache. Let's stick to documentDirectory for persistence.

            for (const fileName of imageFiles) {
                const file = imgFolder.file(fileName);
                if (file) {
                    const b64 = await file.async("base64");
                    const newPath = `${localImagesDir}${fileName}`;
                    await FileSystem.writeAsStringAsync(newPath, b64, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    images[fileName] = newPath;
                }
            }
        }

        return { dreams, images };

    } catch (e) {
        console.error("Failed to parse backup zip", e);
        throw e;
    }
};
