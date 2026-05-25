import { NextResponse } from "next/server";
import { z } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function parseBody<T>(schema: z.ZodType<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      ),
      data: null as never,
    };
  }
  return { error: null, data: result.data };
}
