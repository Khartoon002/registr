import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "../admin/bots/glass.css";
import DashLoginForm from "./_login-form";

const SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE ?? "adminSession";

function safeNext(raw?: string) {
  const fallback = "/dashboard";
  if (!raw) return fallback;
  try { raw = decodeURIComponent(raw); } catch {}
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.startsWith("/login") || raw.startsWith("/admin/bots/login")) return fallback;
  return raw;
}

export default function Login({ searchParams }: { searchParams: { next?: string } }) {
  const val = cookies().get(SESSION_COOKIE)?.value;
  const isAuthed = val === "1"; // <-- must match what your API sets

  if (isAuthed) {
    redirect(safeNext(searchParams.next)); // only redirect if truly logged in
  }

  const nextTarget = safeNext(searchParams.next);
  return (
    <section className="g-shell">
      <div className="g-body">
        <div className="g-card" style={{ maxWidth: 480, margin: "40px auto" }}>
          <h1 className="g-title">Login</h1>
          <p className="g-sub">Use your normal credentials.</p>
          <DashLoginForm next={nextTarget} />
        </div>
      </div>
    </section>
  );
}