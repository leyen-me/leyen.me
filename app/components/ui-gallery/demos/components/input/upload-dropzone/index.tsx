"use client";

import {
  type CSSProperties,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { CheckIcon, CloseIcon, PageIcon, RetryIcon, UploadIcon } from "./icons";
import { UPLOAD_CSS } from "./upload-css";
import {
  BOUNCE,
  CORNER,
  MAX_BYTES,
  MAX_MB,
  REFUSALS,
  SAMPLES,
  SAMPLE_MIME,
  SPEED,
  describeFile,
  formatSize,
  type UploadFile,
} from "./upload-data";
import { RollingPercent, usePrefersReducedMotion } from "./upload-parts";

/*
 * Bencho's progress clock, unchanged:
 *
 *   seconds = (4 - speed / 100 * 3.2) * (0.7 + min(1, size / 5 MB) * 0.6)
 *   p += (dt / seconds) * (0.4 + random * 1.2)
 *
 * so a bigger file takes longer and the bar advances unevenly, never as a
 * metronome.
 */
const GULP_MS = 460;
const REFUSAL_MS = 1800;
const FORGET_MS = 8000;

type Phase = "idle" | "uploading" | "done" | "cancelled";

/**
 * A port of Bencho's "Upload dropzone" (Drag, `upload-dropzone`).
 *
 * The box is a dashed drop target. A file held over it scales up, the edge
 * turns signal blue and marches, and the arrow lifts. Dropping a file inside
 * the 5 MB cap gulps the box and turns the zone into the source's file row:
 * sheet icon, name, size, rolling percent and a 4 px bar. Anything larger is
 * refused in place, with the block's exact retort cycle.
 *
 * Gallery additions: the zone is a real button opening a hidden file input,
 * the tray sheets can also be clicked or dropped (native drag), and a cancelled
 * upload keeps its row so it can be retried or removed. Uploads are simulated
 * with requestAnimationFrame; no network, no real progress event.
 */
export default function Demo() {
  const reduced = usePrefersReducedMotion();
  const inputId = useId();

  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<UploadFile | null>(null);
  const [progress, setProgress] = useState(0);
  const [over, setOver] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [gulping, setGulping] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const frame = useRef(0);
  const gulpTimer = useRef<number | undefined>(undefined);
  const refusalTimer = useRef<number | undefined>(undefined);
  const forgetTimer = useRef<number | undefined>(undefined);
  const dragDepth = useRef(0);
  const refusals = useRef(0);
  const fileId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickRef = useRef<HTMLButtonElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const removeRef = useRef<HTMLButtonElement>(null);

  const busy = phase === "uploading";

  useEffect(() => {
    const clear = () => {
      dragDepth.current = 0;
      setOver(false);
    };
    window.addEventListener("dragend", clear);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("dragend", clear);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(gulpTimer.current);
      window.clearTimeout(refusalTimer.current);
      window.clearTimeout(forgetTimer.current);
    },
    [],
  );

  // Cancelling replaces the cancel button with Retry; hand keyboard focus to it
  // rather than dropping it on the document.
  useEffect(() => {
    if (phase === "cancelled") {
      retryRef.current?.focus({ preventScroll: true });
    } else if (phase === "done") {
      removeRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  function stopClock() {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
  }

  function refuse() {
    const seen = refusals.current;
    refusals.current += 1;

    const message =
      seen === 0
        ? `Too big — up to ${MAX_MB} MB`
        : REFUSALS[Math.min(seen - 1, REFUSALS.length - 1)];

    setRefusal(message);
    setShaking(true);
    setAnnouncement(`${message}. File not uploaded.`);

    window.clearTimeout(refusalTimer.current);
    refusalTimer.current = window.setTimeout(
      () => setRefusal(null),
      REFUSAL_MS,
    );

    window.clearTimeout(forgetTimer.current);
    forgetTimer.current = window.setTimeout(() => {
      refusals.current = 0;
    }, FORGET_MS);
  }

  function startUpload(next: UploadFile) {
    // Bencho only accepts a file while the box is idle; keep that rule so a
    // tray sheet cannot silently replace an upload already in flight.
    if (busy) return;

    if (next.size > MAX_BYTES) {
      refuse();
      return;
    }

    stopClock();
    window.clearTimeout(gulpTimer.current);

    setFile(next);
    setProgress(0);
    setPhase("uploading");
    setRefusal(null);
    setShaking(false);
    setGulping(true);
    setAnnouncement(`Uploading ${next.name}.`);

    gulpTimer.current = window.setTimeout(() => setGulping(false), GULP_MS);

    const seconds = reduced
      ? 0.9
      : (4 - (SPEED / 100) * 3.2) *
        (0.7 + Math.min(1, next.size / MAX_BYTES) * 0.6);

    let value = 0;
    let previous = 0;

    const step = (now: number) => {
      const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0;
      previous = now;
      value = Math.min(
        1,
        value + (dt / seconds) * (reduced ? 1.2 : 0.4 + Math.random() * 1.2),
      );

      if (value >= 1) {
        frame.current = 0;
        setProgress(1);
        setPhase("done");
        setAnnouncement(`${next.name} uploaded.`);
        return;
      }

      setProgress(value);
      frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
  }

  function acceptFile(candidate: File) {
    fileId.current += 1;
    startUpload(
      describeFile(
        candidate.name || "Untitled file",
        candidate.size,
        `file-${fileId.current}`,
      ),
    );

    // The picker button is replaced by the file row; keep keyboard focus in the
    // widget by handing it to the cancel action once the row is mounted.
    requestAnimationFrame(() =>
      cancelRef.current?.focus({ preventScroll: true }),
    );
  }

  function openPicker() {
    inputRef.current?.click();
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const candidate = event.target.files?.[0];
    // Reset first so re-picking the same file still fires a change event.
    event.target.value = "";
    if (candidate) acceptFile(candidate);
  }

  function cancelUpload() {
    stopClock();
    setPhase("cancelled");
    setAnnouncement(
      `Upload cancelled for ${file?.name ?? "file"}. Retry or remove it.`,
    );
  }

  function retryUpload() {
    if (!file) return;
    startUpload(file);
    requestAnimationFrame(() =>
      cancelRef.current?.focus({ preventScroll: true }),
    );
  }

  function removeFile() {
    stopClock();
    setFile(null);
    setProgress(0);
    setPhase("idle");
    setRefusal(null);
    setShaking(false);
    setAnnouncement("File removed.");
    requestAnimationFrame(() =>
      pickRef.current?.focus({ preventScroll: true }),
    );
  }

  function handleDragEnter(event: ReactDragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current += 1;
    if (!busy) setOver(true);
  }

  function handleDragOver(event: ReactDragEvent<HTMLDivElement>) {
    // Always cancel the browser's default navigation, even mid-upload.
    event.preventDefault();
    if (!busy) event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave() {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setOver(false);
  }

  function handleDrop(event: ReactDragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setOver(false);
    if (busy) return;

    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      acceptFile(dropped);
      return;
    }

    const sampleId = event.dataTransfer.getData(SAMPLE_MIME);
    const sample = SAMPLES.find((entry) => entry.id === sampleId);
    if (sample) startUpload(sample);
  }

  const percent =
    phase === "done" ? 100 : Math.round(Math.min(1, progress) * 100);
  const headline = refusal ?? (over ? "Drop to upload" : "Drag a file here");
  const shellStyle = {
    "--upl-r": `${CORNER}px`,
    "--upl-spring": `cubic-bezier(0.3, ${(1 + (BOUNCE / 100) * 0.9).toFixed(2)}, 0.4, 1)`,
  } as CSSProperties;

  return (
    <div className="flex w-full max-w-[340px] justify-center">
      <style>{UPLOAD_CSS}</style>

      <div className="w-full rounded-2xl bg-[#f7f7f6] p-5 dark:bg-[#0a0a0a]">
        <div className="upl-demo" style={shellStyle}>
          <div
            className="upl-zone"
            data-phase={phase}
            data-over={over || undefined}
            data-refuse={refusal || undefined}
            data-gulp={gulping || undefined}
            data-shake={shaking || undefined}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onAnimationEnd={(event) => {
              if (event.animationName === "upl-shake") setShaking(false);
            }}
          >
            <svg className="upl-dash" aria-hidden="true">
              <rect width="100%" height="100%" rx={CORNER - 0.5} />
            </svg>

            {file ? (
              <div className="upl-now">
                <PageIcon ext={file.ext} tint={file.tint} size={36} />

                <span className="upl-text">
                  <span className="upl-name" title={file.name}>
                    {file.name}
                  </span>
                  <span className="upl-meta">
                    <span>{formatSize(file.size)} ·</span>
                    {phase === "uploading" ? (
                      <RollingPercent value={percent} />
                    ) : (
                      <span>{phase === "done" ? "Uploaded" : "Cancelled"}</span>
                    )}
                  </span>
                  <span
                    className="upl-track"
                    role="progressbar"
                    aria-label={`Upload progress for ${file.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                  >
                    <span
                      className="upl-bar"
                      style={{ transform: `scaleX(${percent / 100})` }}
                    />
                  </span>
                </span>

                <span className="upl-end">
                  {phase === "done" ? (
                    <>
                      <span className="upl-tick">
                        <CheckIcon />
                      </span>
                      <button
                        ref={removeRef}
                        type="button"
                        className="upl-act"
                        aria-label={`Remove ${file.name}`}
                        onClick={removeFile}
                      >
                        <CloseIcon />
                      </button>
                    </>
                  ) : null}

                  {phase === "uploading" ? (
                    <button
                      ref={cancelRef}
                      type="button"
                      className="upl-act"
                      aria-label={`Cancel upload of ${file.name}`}
                      onClick={cancelUpload}
                    >
                      <CloseIcon />
                    </button>
                  ) : null}

                  {phase === "cancelled" ? (
                    <>
                      <button
                        ref={retryRef}
                        type="button"
                        className="upl-act"
                        aria-label={`Retry upload of ${file.name}`}
                        onClick={retryUpload}
                      >
                        <RetryIcon />
                      </button>
                      <button
                        type="button"
                        className="upl-act"
                        aria-label={`Remove ${file.name}`}
                        onClick={removeFile}
                      >
                        <CloseIcon />
                      </button>
                    </>
                  ) : null}
                </span>
              </div>
            ) : (
              <button
                ref={pickRef}
                type="button"
                className="upl-pick"
                aria-label={`Choose a file to upload, up to ${MAX_MB} MB`}
                onClick={openPicker}
              >
                <span className="upl-icon">
                  <UploadIcon />
                </span>
                <span className="upl-say">
                  <b>{headline}</b>
                  <span>Up to {MAX_MB} MB</span>
                </span>
              </button>
            )}
          </div>

          {refusal && file ? <p className="upl-error">{refusal}</p> : null}

          <div className="upl-tray" role="group" aria-label="Sample files">
            {SAMPLES.map((sample) => (
              <div
                className="upl-slot"
                key={sample.id}
                data-empty={file?.id === sample.id || undefined}
              >
                <button
                  type="button"
                  className="upl-file"
                  draggable
                  aria-label={`${sample.name}, ${formatSize(sample.size)}. Drag into the box to upload, or press Enter.`}
                  onClick={() => {
                    startUpload(sample);
                    requestAnimationFrame(() =>
                      cancelRef.current?.focus({ preventScroll: true }),
                    );
                  }}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(SAMPLE_MIME, sample.id);
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                  onDragEnd={() => {
                    dragDepth.current = 0;
                    setOver(false);
                  }}
                >
                  <PageIcon ext={sample.ext} tint={sample.tint} />
                  <span className="upl-label">{sample.name}</span>
                </button>
              </div>
            ))}
          </div>

          <label htmlFor={inputId} className="sr-only">
            Choose a file to upload
          </label>
          <input
            ref={inputRef}
            id={inputId}
            className="upl-input"
            type="file"
            tabIndex={-1}
            onChange={handleInputChange}
          />

          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {announcement}
          </p>
        </div>
      </div>
    </div>
  );
}
