// adjust path if your app sits in src/app
import "../admin/bots/glass.css";

export default function DownlinesLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="g-shell">
      <div className="g-body">{children}</div>
    </section>
  );
}
