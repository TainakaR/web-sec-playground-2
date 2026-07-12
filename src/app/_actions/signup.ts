"use server";

import { prisma } from "@/libs/prisma";
import { signupRequestSchema } from "@/app/_types/SignupRequest";
import { userProfileSchema } from "@/app/_types/UserProfile";
import type { SignupRequest } from "@/app/_types/SignupRequest";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ServerActionResponse } from "@/app/_types/ServerActionResponse";
import bcrypt from "bcryptjs";

export const signupServerAction = async (
  signupRequest: SignupRequest,
): Promise<ServerActionResponse<UserProfile | null>> => {
  try {
    const payload = signupRequestSchema.parse(signupRequest);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) {
      return {
        success: false,
        payload: null,
        message: "サインアップに失敗しました。入力内容をご確認ください。",
      };
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        name: payload.name,
      },
    });

    const res: ServerActionResponse<UserProfile> = {
      success: true,
      payload: userProfileSchema.parse(user),
      message: "",
    };
    return res;
  } catch (e) {
    console.error(e instanceof Error ? e.message : "Internal Server Error");
    return {
      success: false,
      payload: null,
      message:
        "サインアップ処理に失敗しました。時間をおいて再度お試しください。",
    };
  }
};
