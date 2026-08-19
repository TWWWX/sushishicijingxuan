// functions/api/upload.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const fileName = url.searchParams.get('fileName');
    const folder = url.searchParams.get('folder');

    // 1. 参数校验
    if (!fileName || !folder) {
        return new Response('缺少 fileName 或 folder 参数', { status: 400 });
    }

    // 2. 只允许传到指定的两个文件夹（安全白名单）
    if (!['shiwen-288', 'shiwen-64'].includes(folder)) {
        return new Response('不允许的文件夹名称', { status: 403 });
    }

    // 3. 生成唯一文件名（防止重名覆盖）
    const uniqueKey = `${folder}/${Date.now()}-${fileName}`;

    // 4. 初始化 R2 客户端（使用环境变量）
    const R2 = new S3Client({
        region: 'auto',
        endpoint: `https://${context.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: context.env.R2_ACCESS_KEY_ID,
            secretAccessKey: context.env.R2_SECRET_ACCESS_KEY,
        },
    });

    const command = new PutObjectCommand({
        Bucket: context.env.R2_BUCKET_NAME,
        Key: uniqueKey,
    });

    try {
        const signedUrl = await getSignedUrl(R2, command, { expiresIn: 3600 });
        return new Response(JSON.stringify({
            signedUrl: signedUrl,
            fileKey: uniqueKey
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}