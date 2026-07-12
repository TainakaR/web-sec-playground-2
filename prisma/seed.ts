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

  const userSeeds: UserSeed[] = [
    {
      name: "管理者 (Admin)",
      password: "password123",
      email: "admin@example.com",
      role: Role.ADMIN,
    },
    {
      name: "山田 太郎",
      password: "password123",
      email: "user01@example.com",
      role: Role.USER,
      aboutSlug: "taro-yamada",
      aboutContent:
        "初めまして。山田太郎のプロフィールページです。<br>Next.jsを学習中です。",
    },
    {
      name: "佐藤 花子",
      password: "password123",
      email: "user02@example.com",
      role: Role.USER,
      aboutSlug: "hanako-sato",
      aboutContent: "佐藤花子です。よろしくお願いします。",
    },
  ];

  await prisma.user.deleteMany();
  await prisma.session.deleteMany();

  const hashedPasswords = await Promise.all(
    userSeeds.map((userSeed) => bcrypt.hash(userSeed.password, 10)),
  );

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
