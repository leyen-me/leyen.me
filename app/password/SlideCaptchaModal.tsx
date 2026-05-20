"use client";

import { useCallback, useEffect, useRef } from "react";
import SliderCaptcha from "rc-slider-captcha";
import { createPuzzle } from "create-puzzle";
import { BiX } from "react-icons/bi";

const CAPTCHA_BG_SIZE = { width: 320, height: 160 };
const PUZZLE_WIDTH = 60;
const TOLERANCE = 5;

function randomImageUrl() {
  const seed = Math.random().toString(36).slice(2);
  return `https://picsum.photos/seed/${seed}/${CAPTCHA_BG_SIZE.width}/${CAPTCHA_BG_SIZE.height}`;
}

type SlideCaptchaModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function SlideCaptchaModal({
  open,
  onClose,
  onSuccess,
}: SlideCaptchaModalProps) {
  const puzzleXRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const request = useCallback(async () => {
    const res = await createPuzzle(randomImageUrl(), {
      bgWidth: CAPTCHA_BG_SIZE.width,
      bgHeight: CAPTCHA_BG_SIZE.height,
      width: PUZZLE_WIDTH,
    });
    puzzleXRef.current = res.x;
    return { bgUrl: res.bgUrl, puzzleUrl: res.puzzleUrl };
  }, []);

  const onVerify = useCallback(
    async (data: { x: number; duration: number; trail: [number, number][] }) => {
      const diff = Math.abs(data.x - puzzleXRef.current);
      const looksHuman =
        data.duration >= 300 &&
        data.trail.length >= 5 &&
        diff <= TOLERANCE;

      if (looksHuman) {
        onSuccess();
        return Promise.resolve();
      }
      return Promise.reject(new Error("验证失败"));
    },
    [onSuccess]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/70 dark:bg-black/85" aria-hidden />
      <div
        className="relative w-full max-w-[360px] dark:bg-zinc-900 bg-white rounded-xl shadow-xl border dark:border-zinc-700 border-zinc-200"
        style={
          {
            "--rcsc-primary": "#33E092",
            "--rcsc-primary-light": "rgba(51, 224, 146, 0.2)",
            "--rcsc-success": "#0CCE6B",
            "--rcsc-success-light": "rgba(12, 206, 107, 0.2)",
          } as React.CSSProperties
        }
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-zinc-700 border-zinc-200">
          <h2 className="font-incognito font-semibold text-lg">安全验证</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg dark:hover:bg-zinc-700 hover:bg-zinc-200 transition"
            aria-label="关闭"
          >
            <BiX className="text-xl" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm dark:text-zinc-400 text-zinc-600 mb-4">
            请拖动滑块，将拼图块对齐缺口以完成验证。
          </p>
          <SliderCaptcha
            request={request}
            onVerify={onVerify}
            mode="embed"
            bgSize={CAPTCHA_BG_SIZE}
            puzzleSize={{ width: PUZZLE_WIDTH }}
            autoRequest
            tipText={{
              default: "向右拖动滑块完成拼图",
              loading: "加载中...",
              moving: "拖动滑块对齐缺口",
              verifying: "验证中...",
              success: "验证成功",
              error: "验证失败，请重试",
              errors: "连续失败次数过多，请点击刷新",
              loadFailed: "加载失败，请点击刷新",
            }}
          />
        </div>
      </div>
    </div>
  );
}
