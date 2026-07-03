import { getResumeURL } from "config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const resumeUrl = await getResumeURL();
    return NextResponse.redirect(resumeUrl);
}
