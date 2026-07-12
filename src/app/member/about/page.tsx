"use client";

import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import type { About } from "@/app/_types/About";
import { aboutSchema } from "@/app/_types/About";
import { twMerge } from "tailwind-merge";
import { AboutView } from "@/app/_components/AboutView";
import NextLink from "next/link";

const Page: React.FC = () => {
  const c_AboutSlug = "aboutSlug";
  const c_AboutContent = "aboutContent";

  const ep = "/api/about-draft";

  const [isInitialized, setIsInitialized] = useState(false);

  const formMethods = useForm<About>({
    mode: "onChange",
    resolver: zodResolver(aboutSchema),
  });
  const fieldErrors = formMethods.formState.errors;

  const watchedSlug = useWatch({
    control: formMethods.control,
    name: c_AboutSlug,
  });

  const clearRootOnChange =
    <T extends unknown[]>(onChange: (...event: T) => void) =>
    (...args: T) => {
      formMethods.clearErrors("root");
      onChange(...args);
    };

  const slugRegister = formMethods.register(c_AboutSlug);
  const onSlugChange = slugRegister.onChange;

  const submitHandler = async (data: About) => {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: ApiResponse<About> = await res.json();

      if (!result.success) {
        formMethods.setError("root", {
          type: "server",
          message: result.message || "保存に失敗しました。",
        });
      } else {
        alert("設定を保存しました。");
      }
    } catch {
      formMethods.setError("root", {
        type: "server",
        message: "通信エラーが発生しました。",
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(ep, { cache: "no-store" });
        const result: ApiResponse<About> = await res.json();
        if (result.success && result.payload) {
          formMethods.reset(result.payload);
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, [formMethods]);

  if (!isInitialized) {
    return (
      <div className="flex items-center gap-x-2 p-4">
        <FontAwesomeIcon icon={faSpinner} spin />
        <div>読み込み中...</div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-4">
      <div className="mb-6 flex items-center gap-x-2 text-2xl font-bold">
        <FontAwesomeIcon icon={faIdCard} />
        <h1>プロフィール編集</h1>
      </div>

      <form
        onSubmit={formMethods.handleSubmit(submitHandler)}
        className="flex flex-col gap-y-5"
      >
        <div>
          <label htmlFor={c_AboutSlug} className="mb-1 block font-bold">
            公開パス (Slug)
          </label>
          <TextInputField
            {...slugRegister}
            onChange={clearRootOnChange(onSlugChange)}
            id={c_AboutSlug}
            placeholder="my-profile-url"
            type="text"
            disabled={formMethods.formState.isSubmitting}
            error={!!fieldErrors.aboutSlug}
            autoComplete="off"
          />
          {watchedSlug && (
            <div className="mt-1 text-xs text-gray-500">
              公開URL:{" "}
              <span className="rounded bg-gray-100 px-1 py-0.5 font-mono">
                /about/{watchedSlug}
              </span>
            </div>
          )}
          <ErrorMsgField msg={fieldErrors.aboutSlug?.message} />
          <ErrorMsgField msg={fieldErrors.root?.message} />
        </div>

        <div>
          <label htmlFor={c_AboutContent} className="mb-1 block font-bold">
            コンテンツ
          </label>
          <textarea
            {...formMethods.register(c_AboutContent)}
            id={c_AboutContent}
            className={twMerge(
              "w-full rounded-md border border-gray-300 px-3 py-2",
              "focus:ring-2 focus:ring-slate-700 focus:outline-none",
              fieldErrors.aboutContent
                ? "border-red-500 focus:ring-red-500"
                : "",
            )}
            rows={6}
            placeholder="本文を入力してください。HTMLタグ(b, i, font, br)が使用できます。"
            disabled={formMethods.formState.isSubmitting}
          />
          <ErrorMsgField msg={fieldErrors.aboutContent?.message} />
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className="tracking-widest"
          isBusy={formMethods.formState.isSubmitting}
          disabled={
            !formMethods.formState.isValid || formMethods.formState.isSubmitting
          }
        >
          更新
        </Button>
      </form>

      <div className="my-6 flex flex-col gap-y-1">
        <div className="text-lg font-bold text-indigo-400">Preview</div>
        <div className="rounded-md bg-indigo-50 p-4 shadow-inner">
          <AboutView about={formMethods.getValues()} />
        </div>
      </div>
    </main>
  );
};

export default Page;
