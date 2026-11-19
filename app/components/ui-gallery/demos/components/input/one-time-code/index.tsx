"use client";

import Otp from "./otp";

/**
 * Gallery shell for the OTP block. Bencho's default is a four-digit code with
 * the "Accept" answer; the parameter controls are intentionally omitted so the
 * component is shown on its own.
 */
export default function Demo() {
  return (
    <div className="flex w-full flex-col items-center">
      <Otp length={4} answer="Accept" corner={12} />
    </div>
  );
}
