import Image from "next/image";
import background from "./background.webp";
import { LiquidGlassLens } from "./LiquidGlassLens";

/**
 * 48 条短横线按 12 列排布，对应原示范例文字下方由 CSS 绘制的四行白色短条。
 * 背景照片使用 Aceternity 原始素材的本地副本，运行时不发起任何外部请求。
 */
const BARS = 48;

export default function Demo() {
  return (
    <section className="relative h-full min-h-[36rem] w-full overflow-hidden bg-neutral-900">
      <Image
        src={background}
        alt=""
        aria-hidden="true"
        fill
        priority
        unoptimized
        sizes="100vw"
        draggable={false}
        className="object-cover"
      />

      <div className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center p-8 text-center">
        <p className="text-6xl font-bold leading-[0.95] tracking-tighter text-white md:text-8xl">
          Bend the
          <br />
          light.
        </p>
        <div
          aria-hidden="true"
          className="mt-8 grid w-full max-w-md grid-cols-12 gap-1.5"
        >
          {Array.from({ length: BARS }, (_, index) => (
            <span key={index} className="h-1.5 rounded-full bg-white/80" />
          ))}
        </div>
      </div>

      <LiquidGlassLens />
    </section>
  );
}
