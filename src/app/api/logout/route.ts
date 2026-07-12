import { prisma } from "@/libs/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/app/_types/ApiResponse";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const DELETE = async () => {
  try {
    const cookieStore = await cookies();
    // 以前の修正に合わせ、Cookie名を "app_session" に変更
    const sessionId = cookieStore.get("app_session")?.value;

    if (sessionId) {
      await prisma.session.deleteMany({
        where: { id: sessionId },
      });

      cookieStore.set("app_session", "", {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        maxAge: 0,
        secure: process.env.NODE_ENV === "production",
      });
    }

    const res: ApiResponse<null> = {
      success: true,
      payload: null,
      message: "ログアウトしました。",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);

    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "ログアウト処理に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
