import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing file info" }, { status: 400 });
    }

    // Создаем уникальное имя файла
    const key = `avatars/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    // Генерируем ссылку на 60 секунд
    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 60 });

    // Публичный URL, по которому будет доступен файл
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ signedUrl, publicUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
