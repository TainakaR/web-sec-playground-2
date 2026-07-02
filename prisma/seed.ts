// 実行は npx prisma db seed (prisma.config.ts にコマンド定義されている)
// 実行結果は npx prisma studio で確認可能
import { v4 as uuid } from "uuid";
import { prisma } from "@/libs/prisma";
import { Role } from "@/generated/prisma/enums";
import bcrypt from "bcryptjs";

type UserSeed = {
  name: string;
  password: string;
  email: string;
  role: Role;
  aboutSlug?: string | null;
  aboutContent?: string | null;
};

const main = async () => {
  console.log("Seeding database...");

  // テスト用のユーザ情報の「種」となる userSeeds を作成
  const userSeeds: UserSeed[] = [
    {
      name: "高負荷 耐子",
      password: "password1111",
      email: "admin01@example.com",
      role: Role.ADMIN,
    },
    {
      name: "不具合 直志",
      password: "password2222",
      email: "admin02@example.com",
      role: Role.ADMIN,
    },
    {
      name: "構文 誤次郎",
      password: "password1111",
      email: "user01@example.com",
      role: Role.USER,
      aboutSlug: "gojiro",
      aboutContent: "構文誤次郎です。<br>よろしくお願いします。",
    },
    {
      name: "仕様 曖昧子",
      password: "password2222",
      email: "user02@example.com",
      role: Role.USER,
      aboutSlug: "aimaiko",
      aboutContent: "仕様曖昧子と申します。仲良くしてください。",
    },
  ];

  // 各テーブルの全レコードを削除
  await prisma.user.deleteMany();
  await prisma.session.deleteMany();

  const hashedPasswords = await Promise.all(
    userSeeds.map((userSeed) => bcrypt.hash(userSeed.password, 10)),
  );

  // ユーザ（user）テーブルにテストデータを挿入
  await prisma.user.createMany({
    data: userSeeds.map((userSeed) => ({
      id: uuid(),
      name: userSeed.name,
      password: hashedPasswords[userSeeds.indexOf(userSeed)],
      role: userSeed.role,
      email: userSeed.email,
      aboutSlug: userSeed.aboutSlug || null,
      aboutContent: userSeed.aboutContent || "",
    })),
  });

  console.log("Seeding completed successfully.");
};

main()
  .catch((e) => console.error(e.message))
  .finally(async () => {
    await prisma.$disconnect();
  });
