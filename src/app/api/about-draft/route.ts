import { prisma } from "@/libs/prisma";
import { aboutSchema } from "@/app/_types/About";
import type { About } from "@/app/_types/About";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { verifySession } from "@/app/api/_helper/verifySession";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const GET = async (req: NextRequest) => {
  try {
    const userId = await verifySession();
    if (!userId) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "認証情報が無効です。再度ログインしてください。",
      };
      return NextResponse.json(res);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        aboutSlug: true,
        aboutContent: true,
      },
    });

    if (!user) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "ユーザ情報の取得に失敗しました。",
      };
      return NextResponse.json(res);
    }

    const res: ApiResponse<About> = {
      success: true,
      payload: {
        userName: user.name,
        aboutSlug: user.aboutSlug,
        aboutContent: user.aboutContent,
      },
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "バックエンド処理に失敗しました。",
    };
    return NextResponse.json(res);
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const userId = await verifySession();
    if (!userId) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "認証情報が無効です。再度ログインしてください。",
      };
      return NextResponse.json(res);
    }

    const result = aboutSchema.safeParse(await req.json());
    if (!result.success) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "リクエストボディの形式が不正です。",
      };
      return NextResponse.json(res);
    }
    const about = result.data;

    if (about.aboutSlug) {
      const existingUser = await prisma.user.findFirst({
        where: {
          aboutSlug: about.aboutSlug,
          id: { not: userId },
        },
      });
      if (existingUser) {
        const res: ApiResponse<null> = {
          success: false,
          payload: null,
          message: "指定パスは他のユーザにより使用されています。",
        };
        return NextResponse.json(res);
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        aboutSlug: about.aboutSlug,
        aboutContent: about.aboutContent,
      },
      select: {
        name: true,
        aboutSlug: true,
        aboutContent: true,
      },
    });

    const res: ApiResponse<About> = {
      success: true,
      payload: {
        userName: user.name,
        aboutSlug: user.aboutSlug,
        aboutContent: user.aboutContent,
      },
      message: "",
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "設定の保存に失敗しました。",
    };
    return NextResponse.json(res);
  }
};
