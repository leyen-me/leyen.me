type RollingCountProps = {
  value: number;
};

/**
 * One digit column per character, each a strip from 0 to 9. Changing the
 * value slides every strip to its digit; no layout measurement is involved.
 *
 * The button around it carries the accessible name, so the visual count is
 * hidden from assistive technology and announced through the live region.
 */
export function RollingCount({ value }: RollingCountProps) {
  const text = String(Math.max(0, value));

  return (
    <span className="inline-flex tabular-nums" aria-hidden="true">
      {text.split("").map((digit, index) => (
        <span
          key={`${text.length}-${index}`}
          className="inline-block h-[1.4em] overflow-hidden leading-[1.4em]"
        >
          <span
            className="flex flex-col transition-transform duration-[220ms] ease-[cubic-bezier(0.24,1.34,0.38,1)]"
            style={{
              transform: `translateY(${(Number(digit) * -1.4).toFixed(1)}em)`,
            }}
          >
            {"0123456789".split("").map((tick) => (
              <span key={tick} className="block h-[1.4em] leading-[1.4em]">
                {tick}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
