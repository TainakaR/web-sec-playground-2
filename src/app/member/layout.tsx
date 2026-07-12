"use client";

import React from "react";
import { useAuth } from "@/app/_hooks/useAuth";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NextLink from "next/link";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <main className="mx-auto mt-10 max-w-md rounded-md border border-red-200 bg-red-50 p-4 text-center">
        <div className="mb-4 text-2xl font-bold text-red-600">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1.5" />
          ログインが必要なコンテンツ
        </div>
        <div className="text-sm text-gray-600">
          このコンテンツを利用するためには、
          <NextLink
            href="/login"
            className="mx-1 font-bold text-blue-500 hover:underline"
          >
            ログイン
          </NextLink>
          してください。
        </div>
      </main>
    );
  }

  return <>{children}</>;
};

export default Layout;
