import Link from "next/link";
import { BrandHeader } from "@/components/funnel/BrandHeader";
import { SiteFooter } from "@/components/funnel/SiteFooter";
import { VslPlayer } from "@/components/funnel/VslPlayer";
import { UrgencyBar } from "@/components/funnel/UrgencyBar";
import { toQuery, type SearchParams } from "@/lib/search-params";

export default async function VSLPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const bookHref = `/book?${toQuery(sp)}`;

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* urgency bar */}
      <UrgencyBar>Please watch the full video below. Do not close this window.</UrgencyBar>

      <BrandHeader centered border={false} withName={false} />

      {/* BARE VSL — just the video */}
      <section style={{ flex: 1, padding: "12px 0 56px" }}>
        <div className="am-wrap" style={{ maxWidth: 820 }}>
          <VslPlayer bookHref={bookHref} />

          {/* single CTA appears below the video */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href={bookHref} className="am-btn" style={{ fontSize: 14, padding: "18px 44px" }}>Book My Free Body Assessment Call</Link>
            <p style={{ fontSize: 12.5, color: "var(--ink-mute)", marginTop: 14 }}>Takes 30 seconds · If we&apos;re a fit we&apos;ll map your plan · If not, free roadmap. Either way you win.</p>
          </div>
        </div>
      </section>

      <SiteFooter>
        <p style={{ fontSize: 11.5, color: "var(--on-dark-soft)", fontWeight: 400, lineHeight: 1.7, maxWidth: 640, margin: "0 auto" }}>
          Results vary. Testimonials are not a guarantee of results. Not medical advice. &copy; {new Date().getFullYear()} Jaden Levin
        </p>
      </SiteFooter>
    </main>
  );
}
