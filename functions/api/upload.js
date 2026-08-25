// functions/api/upload.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 定义一个统一添加 CORS 头的函数
function corsResponse(body, status = 200, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",   // 允许所有域名（或可改为你的具体域名）
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      ...extraHeaders,
    },
  });
}

export async function onRequest(context) {
  // 处理 OPTIONS 预检请求（CORS 必须）
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const url = new URL(context.request.url);
  const fileName = url.searchParams.get("fileName");
  const folder = url.searchParams.get("folder");

  // 参数校验：fileName 由前端注入 Cookie + LocalStorage 双重标识，不在此处加随机前缀，以实现同用户多次上传自动覆盖（同 Key 重写）
  if (!fileName || !folder) {
    return corsResponse(
      JSON.stringify({ error: "缺少 fileName 或 folder 参数" }),
      400,
      { "Content-Type": "application/json" }
    );
  }

  // 文件名安全过滤：禁止路径穿越字符，仅保留字母/数字/下划线/短横线/点
  const safeName = fileName.replace(/[^A-Za-z0-9._-]/g, '_');
  if (!safeName || safeName.length > 255) {
    return corsResponse(
      JSON.stringify({ error: "不合法的文件名" }),
      400,
      { "Content-Type": "application/json" }
    );
  }

  // 文件夹白名单（与前端 App.vue folderMap 一一对应）
  if (![
    "shiwen-320",
    "shiwen-64",
    "shiwen-poem64",
    "shiwen-word64",
    "shiwen-eat64",
    "shiwen-drink64",
    "shiwen-ersu64",
    "shiwen-figure64",
    "shiwen-figure256"
  ].includes(folder)) {
    return corsResponse(
      JSON.stringify({ error: "不允许的文件夹名称" }),
      403,
      { "Content-Type": "application/json" }
    );
  }

  // 同 Key 上传时，R2 PutObject 默认会直接覆盖前版本，因此每个用户同表格始终只保留最新一份
  const uniqueKey = `${folder}/${safeName}`;

  const R2 = new S3Client({
    region: "auto",
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
    return corsResponse(
      JSON.stringify({ signedUrl, fileKey: uniqueKey }),
      200,
      { "Content-Type": "application/json" }
    );
  } catch (error) {
    return corsResponse(
      JSON.stringify({ error: error.message }),
      500,
      { "Content-Type": "application/json" }
    );
  }
}