import { NextResponse } from "next/server";
import { getResumeURL } from "config";

export async function GET() {
    const url = await getResumeURL();
    return NextResponse.redirect(url);
}
