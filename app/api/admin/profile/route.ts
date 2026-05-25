import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth-guard";
import { parseBody } from "@/lib/admin/api-utils";
import { profileSchema } from "@/lib/admin/content-models";
import { buildFileField, buildImageField } from "@/lib/admin/sanity-helpers";
import { revalidateContentType } from "@/lib/admin/revalidate";
import { writeClient } from "@/lib/sanity.write";
import { adminProfileQuery } from "@/lib/admin/queries";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const profile = await writeClient.fetch(adminProfileQuery);
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const parsed = parseBody(profileSchema, await req.json());
  if (parsed.error) return parsed.error;
  const data = parsed.data;

  const existing = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "profile"][0]{ _id }`
  );

  const payload = {
    _type: "profile" as const,
    fullName: data.fullName,
    headline: data.headline,
    profileImage: buildImageField(data.profileImage),
    shortBio: data.shortBio,
    email: data.email,
    location: data.location,
    fullBio: data.fullBio ?? "",
    usage: data.usage ?? "",
    resumeURL: buildFileField(data.resumeAssetId),
  };

  if (existing?._id) {
    await writeClient.patch(existing._id).set(payload).commit();
  } else {
    await writeClient.create(payload);
  }

  revalidateContentType("profile");
  return NextResponse.json({ success: true });
}
