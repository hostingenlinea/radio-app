import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuración del cliente
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'radio-apps';

/**
 * Genera una URL firmada para subir archivos directamente desde el frontend
 * Esto evita sobrecargar tu servidor pasando los archivos por él.
 */
export async function getPresignedUploadUrl(fileName: string, fileType: string) {
  const uniqueId = crypto.randomUUID();
  const key = `uploads/${uniqueId}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  // La URL expira en 5 minutos (300 segundos)
  const signedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

  return {
    uploadUrl: signedUrl,
    fileUrl: `${process.env.R2_PUBLIC_URL}/${key}`, // URL pública final para guardar en DB
  };
}

export default r2;