import SignaturePad from "./signature-pad";
import { SIGNATURE_CSS } from "./signature-css";

export default function Demo() {
  return (
    <div className="sig-demo w-full max-w-[340px]">
      <style>{SIGNATURE_CSS}</style>

      <div className="grid h-[212px] w-full place-items-center">
        <SignaturePad />
      </div>
    </div>
  );
}
