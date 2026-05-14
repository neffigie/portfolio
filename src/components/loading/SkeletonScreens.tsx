import type { CSSProperties } from "react";

const containerStyle: CSSProperties = {
    marginInline: "auto",
    maxWidth: "1280px",
    paddingInline: "clamp(24px, 5vw, 64px)",
    width: "100%",
};

const elevatedSurfaceStyle: CSSProperties = {
    background: "linear-gradient(135deg, rgba(255,249,246,0.86), rgba(243,228,232,0.48))",
    border: "1px solid var(--chakra-colors-surface-border)",
    borderRadius: "12px",
    boxSizing: "border-box",
};

function Skeleton({
    block = false,
    radius = "999px",
    style,
}: {
    block?: boolean;
    radius?: CSSProperties["borderRadius"];
    style?: CSSProperties;
}) {
    return (
        <span
            aria-hidden="true"
            className="content-skeleton"
            style={{
                borderRadius: radius,
                display: block ? "block" : "inline-block",
                height: block ? undefined : "1em",
                lineHeight: 1,
                ...style,
            }}
        />
    );
}

function TagSkeletons({ count = 3 }: { count?: number }) {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {Array.from({ length: count }).map((_, index) => (
                <Skeleton key={index} style={{ height: "21px", width: `${52 + index * 12}px` }} />
            ))}
        </div>
    );
}

export function PostSkeleton() {
    return (
        <section style={{ paddingBlock: "clamp(48px, 8vw, 80px)" }}>
            <div style={containerStyle}>
                <article style={{ ...elevatedSurfaceStyle, marginInline: "auto", padding: "clamp(24px, 5vw, 40px)" }}>
                    <header style={{ marginBottom: "32px" }}>
                        <Skeleton style={{ height: "10px", width: "116px" }} />
                        <div style={{ fontFamily: "var(--chakra-fonts-heading)", fontSize: "clamp(36px, 5vw, 48px)", fontStyle: "italic", lineHeight: 1.05, marginTop: "24px", maxWidth: "24ch" }}>
                            <Skeleton style={{ width: "100%" }} />
                            <br />
                            <Skeleton style={{ width: "72%" }} />
                        </div>
                        <div style={{ fontSize: "16px", lineHeight: 1.7, marginTop: "20px", maxWidth: "78ch" }}>
                            <Skeleton style={{ width: "92%" }} />
                            <br />
                            <Skeleton style={{ width: "68%" }} />
                        </div>
                        <div style={{ marginTop: "18px" }}>
                            <TagSkeletons count={2} />
                        </div>
                    </header>
                    <Skeleton block radius="4px" style={{ aspectRatio: "16 / 9", marginBottom: "32px", width: "100%" }} />
                    <div style={{ fontSize: "16px", lineHeight: 1.8 }}>
                        {["96%", "88%", "94%", "72%", "90%", "84%"].map((width) => (
                            <div key={width} style={{ marginBottom: "12px" }}>
                                <Skeleton style={{ width }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ borderTop: "1px solid var(--chakra-colors-surface-border)", marginTop: "64px", paddingTop: "48px" }}>
                        <Skeleton style={{ height: "10px", width: "92px" }} />
                    </div>
                </article>
            </div>
        </section>
    );
}
