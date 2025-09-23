"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewLink({ packageId }: { packageId: string }) {
  const [loading, setLoading] = useState(false);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const router = useRouter();

  async function createLink() {
    setLoading(true);
    try {
      const res = await fetch("/api/person-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create link");
      setLastUrl(data.url as string);
      router.refresh(); // refresh server page to show new link in the list
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="g-row" style={{ gap: 8 }}>
      <button className="g-btn g-btn-small" onClick={createLink} disabled={loading}>
        {loading ? "Creating…" : "Create Link"}
      </button>
      {lastUrl && (
        <>
          <a className="g-btn g-btn-small g-outline" href={lastUrl} target="_blank">
            Open
          </a>
          <button
            className="g-btn g-btn-small g-outline"
            onClick={() => navigator.clipboard.writeText(
              `${window.location.origin}${lastUrl}`
            )}
          >
            Copy
          </button>
        </>
      )}
    </div>
  );
}
