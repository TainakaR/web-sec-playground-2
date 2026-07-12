import { cookies } from "next/headers";
import { prisma } from "@/libs/prisma";

/**
 * Cookie の sessionId から userId を取得（期限延長あり）
 * 無効な場合は DB の Session レコードも、Cookie も削除する
 */
export const verifySession = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("app_session")?.value;

  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  const now = new Date();
  if (!session || session.expiresAt <= now) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
    cookieStore.set("app_session", "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
    });
    return null;
  }

  const tokenMaxAgeSeconds = 60 * 60 * 3; // 3時間
  const newExpiry = new Date(now.getTime() + tokenMaxAgeSeconds * 1000);
  await prisma.session.update({
    where: { id: sessionId },
    data: { expiresAt: newExpiry },
  });

  cookieStore.set("app_session", sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: tokenMaxAgeSeconds,
    secure: process.env.NODE_ENV === "production",
  });

  return session.userId;
};
