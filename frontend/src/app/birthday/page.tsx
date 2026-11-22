import type { Metadata } from "next";
import BirthdayGate from "./birthday-gate";

export const metadata: Metadata = {
  title: "Birthday Party",
  description: "RSVP for Clara's birthday party.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function BirthdayPage() {
  const siteKey = (process.env.TURNSTILE_SITE_KEY ?? "").trim();
  return <BirthdayGate siteKey={siteKey} />;
}
