import { getResumeURL } from "config";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
    const resumeUrl = await getResumeURL();
    redirect(resumeUrl);
}
