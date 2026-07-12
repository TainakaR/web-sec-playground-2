"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupRequestSchema } from "@/app/_types/SignupRequest";
import type { SignupRequest } from "@/app/_types/SignupRequest";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  faSpinner,
  faPenNib,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signupServerAction } from "@/app/_actions/signup";

const Page: React.FC = () => {
  const c_Name = "name";
  const c_Email = "email";
  const c_Password = "password";

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSignUpCompleted, setIsSignUpCompleted] = useState(false);

  // 追加機能1: パスワード表示切替用のState
  const [showPassword, setShowPassword] = useState(false);

  const formMethods = useForm<SignupRequest>({
    mode: "onChange",
    resolver: zodResolver(signupRequestSchema),
  });
  const fieldErrors = formMethods.formState.errors;

  // 追加機能2: パスワードの入力をリアルタイムで監視
  const watchedPassword = useWatch({
    control: formMethods.control,
    name: c_Password,
  });

  // 追加機能2: パスワード強度を判定する関数
  const getPasswordStrength = (password: string) => {
    if (!password) return { label: "", color: "bg-gray-200", width: "w-0" };
    if (password.length < 8)
      return {
        label: "弱 (8文字以上にしてください)",
        color: "bg-red-500",
        width: "w-1/3",
      };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password))
      return {
        label: "中 (英大文字と数字を含めると強になります)",
        color: "bg-yellow-500",
        width: "w-2/3",
      };
    return {
      label: "強 (安全なパスワードです)",
      color: "bg-green-500",
      width: "w-full",
    };
  };

  const strength = getPasswordStrength(watchedPassword || "");

  const clearRootOnChange =
    <T extends unknown[]>(onChange: (...event: T) => void) =>
    (...args: T) => {
      formMethods.clearErrors("root");
      onChange(...args);
    };

  const nameRegister = formMethods.register(c_Name);
  const onNameChange = nameRegister.onChange;

  const emailRegister = formMethods.register(c_Email);
  const onEmailChange = emailRegister.onChange;

  const passwordRegister = formMethods.register(c_Password);
  const onPasswordChange = passwordRegister.onChange;

  const submitHandler = (data: SignupRequest) => {
    startTransition(async () => {
      try {
        const result = await signupServerAction(data);
        if (result.success) {
          setIsSignUpCompleted(true);
        } else {
          formMethods.setError("root", {
            type: "server",
            message: result.message || "サインアップに失敗しました。",
          });
        }
      } catch {
        formMethods.setError("root", {
          type: "server",
          message: "通信エラーが発生しました。",
        });
      }
    });
  };

  useEffect(() => {
    if (isSignUpCompleted) {
      const timer = setTimeout(() => {
        const email = formMethods.getValues(c_Email);
        router.push(`/login?${c_Email}=${encodeURIComponent(email)}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSignUpCompleted, router, formMethods]);

  return (
    <main className="mx-auto mt-10 max-w-md p-4">
      <div className="mb-6 flex items-center gap-x-2 text-2xl font-bold">
        <FontAwesomeIcon icon={faPenNib} />
        <h1>サインアップ</h1>
      </div>
      <form
        onSubmit={formMethods.handleSubmit(submitHandler)}
        className="flex flex-col gap-y-5"
      >
        <div>
          <label htmlFor={c_Name} className="mb-2 block font-bold">
            表示名
          </label>
          <TextInputField
            {...nameRegister}
            onChange={clearRootOnChange(onNameChange)}
            id={c_Name}
            placeholder="John Doe"
            type="text"
            disabled={isPending || isSignUpCompleted}
            error={!!fieldErrors.name}
            autoComplete="name"
          />
          <ErrorMsgField msg={fieldErrors.name?.message} />
        </div>

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
            disabled={isPending || isSignUpCompleted}
            error={!!fieldErrors.email}
            autoComplete="email"
          />
          <ErrorMsgField msg={fieldErrors.email?.message} />
        </div>

        <div>
          <label htmlFor={c_Password} className="mb-2 block font-bold">
            パスワード
          </label>
          {/* 追加機能1: 目のアイコンとパスワード表示切替 */}
          <div className="relative">
            <TextInputField
              {...passwordRegister}
              onChange={clearRootOnChange(onPasswordChange)}
              id={c_Password}
              placeholder="*****"
              type={showPassword ? "text" : "password"}
              disabled={isPending || isSignUpCompleted}
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

          {/* 追加機能2: 強度バーの表示 */}
          {watchedPassword && (
            <div className="mt-2">
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`}
                />
              </div>
              <div
                className={`mt-1 text-right text-xs font-bold ${strength.color.replace(
                  "bg-",
                  "text-",
                )}`}
              >
                {strength.label}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className="tracking-widest"
          isBusy={isPending}
          disabled={
            !formMethods.formState.isValid || isPending || isSignUpCompleted
          }
        >
          登録
        </Button>
      </form>

      {isSignUpCompleted && (
        <div className="mt-4">
          <div className="flex items-center gap-x-2">
            <FontAwesomeIcon icon={faSpinner} spin />
            <div>サインアップが完了しました。ログインページに移動します。</div>
          </div>
          <NextLink
            href={`/login?${c_Email}=${encodeURIComponent(
              formMethods.getValues(c_Email),
            )}`}
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
