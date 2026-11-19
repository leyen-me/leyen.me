import SignaturePad from "./signature-pad";
import { SIGNATURE_CSS } from "./signature-css";

export default function Demo() {
  return (
    <div className="sig-demo w-full max-w-[340px]">
      <style>{SIGNATURE_CSS}</style>

      <div className="grid h-[212px] w-full place-items-center rounded-2xl border border-black/[0.04] bg-[#f7f7f6] dark:border-white/[0.06] dark:bg-[#0a0a0a]">
        <SignaturePad />
      </div>

      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
        走笔越快墨迹越细，停笔 1.5 秒自动签署。
      </p>
    </div>
  );
}
