import { requireBotsAuth } from "../_guard";
import "../glass.css";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  requireBotsAuth();
  return (
    <section className="g-shell">
      <nav className="g-nav">
        <a href="/admin/bots">Bots</a>
        <a href="/admin/bots/new">New Bot</a>
        <a href="/admin/bots/logout">Logout</a>
      </nav>
      <div className="g-body">{children}</div>
    </section>
  );
}
