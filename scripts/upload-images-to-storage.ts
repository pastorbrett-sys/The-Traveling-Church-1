import { objectStorageClient } from "../server/objectStorage";
import * as fs from "fs";
import * as path from "path";

const BUCKET_NAME = "replit-objstore-6182a29a-cb59-40ea-ab48-48f4335a5691";
const PUBLIC_DIR = "public";

async function uploadImagesToStorage() {
  console.log("Starting image upload to object storage...\n");

  const attachedAssetsDir = path.join(process.cwd(), "attached_assets");
  const files = fs.readdirSync(attachedAssetsDir);

  const bucket = objectStorageClient.bucket(BUCKET_NAME);

  for (const file of files) {
    const filePath = path.join(attachedAssetsDir, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      const objectName = `${PUBLIC_DIR}/${file}`;

      console.log(`Uploading ${file}...`);

      await bucket.upload(filePath, {
        destination: objectName,
        metadata: {
          cacheControl: "public, max-age=31536000",
        },
      });

      console.log(`✓ Uploaded: ${file} -> /${BUCKET_NAME}/${objectName}`);
      console.log(`  Access via: /public-objects/${file}\n`);
    }
  }

  console.log("✅ All images uploaded successfully!");
  console.log("\nImages are now accessible via:");
  console.log("- Dev: http://localhost:5000/public-objects/{filename}");
  console.log("- Production: https://www.thetravelingchurch.com/public-objects/{filename}");
}

uploadImagesToStorage().catch(console.error);
