import { z } from "zod";
import {
  userNameSchema,
  emailSchema,
  passwordSchema,
} from "@/app/_types/CommonSchemas";

export const signupRequestSchema = z.object({
  name: z.string().min(1, { message: "表示名を入力してください。" }),
  email: z
    .string()
    .email({ message: "正しいメールアドレスの形式で入力してください。" }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上にしてください。" }),
});

export type SignupRequest = z.infer<typeof signupRequestSchema>;
