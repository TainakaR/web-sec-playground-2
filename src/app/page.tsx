import NextLink from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faIdCard } from "@fortawesome/free-solid-svg-icons";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

const links = [
  {
    href: "/login",
    label: "ログイン",
    info: "セキュアなログイン（セッションベース認証）",
  },
  {
    href: "/signup",
    label: "サインアップ",
    info: "新規ユーザー登録",
  },
  {
    href: "/member/about",
    label: "公開プロフィールの確認・編集",
    info: "ログインが必要なコンテンツ",
  },
];

const Page = async () => {
  const publicProfiles = await prisma.user.findMany({
    where: { aboutSlug: { not: null } },
    select: { name: true, aboutSlug: true },
    orderBy: { name: "asc" },
  });

  return (
    <main>
      <div className="text-2xl font-bold">ホーム</div>
      <div className="mt-4 ml-2 gap-y-2">
        {links.map(({ href, label, info }) => (
          <div key={href} className="mb-3 flex items-center">
            <FontAwesomeIcon icon={faCode} className="mr-1.5" />
            <NextLink
              href={href}
              className="mr-2 text-blue-600 hover:underline"
            >
              {label}
            </NextLink>
            <div className="text-xs text-slate-600">※ {info}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-lg font-bold">公開プロフィール</div>
      <div className="mt-3 ml-2 gap-y-2">
        {publicProfiles.length === 0 ? (
          <div className="text-sm text-slate-400">
            公開プロフィールはまだありません。ログインして /member/about
            でスラグを設定してください。
          </div>
        ) : (
          publicProfiles.map(({ name, aboutSlug }) => (
            <div key={aboutSlug} className="mb-2 flex items-center">
              <FontAwesomeIcon
                icon={faIdCard}
                className="mr-1.5 text-gray-700"
              />
              <NextLink
                href={`/about/${aboutSlug}`}
                className="text-blue-600 hover:underline"
              >
                {name} さんのプロフィール
              </NextLink>
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default Page;
