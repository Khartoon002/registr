"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="g-card" style={{ margin: 24 }}>
      <h2 className="g-title">Project failed to load</h2>
      <p className="g-sub" style={{ color: "#fca5a5" }}>{error.message}</p>
      <button className="g-btn" onClick={() => reset()}>Retry</button>
    </div>
  );
}
