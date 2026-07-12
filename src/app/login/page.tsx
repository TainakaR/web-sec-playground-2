"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginRequestSchema } from "@/app/_types/LoginRequest";
import type { LoginRequest } from "@/app/_types/LoginRequest";
import type { UserProfile } from "@/app/_types/UserProfile";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { faSpinner, faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import NextLink from "next/link";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { mutate } from "swr";
import { useRouter } from "next/navigation";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Page: React.FC = () => {
  const c_Email = "email";
  const c_Password = "password";

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoginCompleted, setIsLoginCompleted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formMethods = useForm<LoginRequest>({
    mode: "onChange",
    resolver: zodResolver(loginRequestSchema),
  });
  const fieldErrors = formMethods.formState.errors;

  const clearRootOnChange =
    <T extends unknown[]>(onChange: (...event: T) => void) =>
    (...args: T) => {
      formMethods.clearErrors("root");
      onChange(...args);
    };

  const emailRegister = formMethods.register(c_Email);
  const onEmailChange = emailRegister.onChange;

  const passwordRegister = formMethods.register(c_Password);
  const onPasswordChange = passwordRegister.onChange;

  const submitHandler = async (data: LoginRequest) => {
    setIsPending(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<UserProfile> = await res.json();

      if (result.success && result.payload) {
        setUserProfile(result.payload);
        setIsLoginCompleted(true);
        mutate("/api/auth");
      } else {
        formMethods.setError("root", {
          type: "server",
          message: result.message || "ログインに失敗しました。",
        });
      }
    } catch (error) {
      formMethods.setError("root", {
        type: "server",
        message: "通信エラーが発生しました。時間をおいて再度お試しください。",
      });
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (isLoginCompleted) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoginCompleted, router]);

  return (
    <main className="mx-auto mt-10 max-w-md p-4">
      <div className="mb-6 flex items-center gap-x-2 text-2xl font-bold">
        <FontAwesomeIcon icon={faRightToBracket} />
        <h1>ログイン</h1>
      </div>
      <form
        onSubmit={formMethods.handleSubmit(submitHandler)}
        className="flex flex-col gap-y-5"
      >
        <div>
          <label htmlFor={c_Email} className="mb-2 block font-bold">
            メールアドレス
          </label>
          <TextInputField
            {...emailRegister}
            onChange={clearRootOnChange(onEmailChange)}
            id={c_Email}
            placeholder="example@example.com"
            type="email"
            disabled={isPending || isLoginCompleted}
            error={!!fieldErrors.email}
            autoComplete="email"
          />
          <ErrorMsgField msg={fieldErrors.email?.message} />
        </div>

        <div>
          <label htmlFor={c_Password} className="mb-2 block font-bold">
            パスワード
          </label>
          <div className="relative">
            <TextInputField
              {...passwordRegister}
              onChange={clearRootOnChange(onPasswordChange)}
              id={c_Password}
              placeholder="*****"
              type={showPassword ? "text" : "password"}
              disabled={isPending || isLoginCompleted}
              error={!!fieldErrors.password}
              autoComplete="off"
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          <ErrorMsgField msg={fieldErrors.password?.message} />
          <ErrorMsgField msg={fieldErrors.root?.message} />
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className={twMerge("tracking-widest")}
          isBusy={isPending}
          disabled={
            !formMethods.formState.isValid || isPending || isLoginCompleted
          }
        >
          ログイン
        </Button>
      </form>

      {isLoginCompleted && (
        <div className="mt-4">
          <div className="flex items-center gap-x-2">
            <FontAwesomeIcon icon={faSpinner} spin />
            <div>ようこそ、{userProfile?.name} さん。</div>
          </div>
          <NextLink
            href="/"
            className="mt-2 block text-sm text-blue-500 hover:underline"
          >
            自動的に画面が切り替わらないときはこちらをクリックしてください。
          </NextLink>
        </div>
      )}
    </main>
  );
};

export default Page;
