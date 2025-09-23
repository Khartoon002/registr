import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "../glass.css";
import LoginForm from "./_login-form";

export default function BotsLogin({ searchParams }: { searchParams: { next?: string } }) {
  const tok = cookies().get("bots_admin")?.value || "";
  if (process.env.BOTS_ADMIN_TOKEN && tok === process.env.BOTS_ADMIN_TOKEN) {
    redirect(searchParams.next || "/admin/bots");
  }
  return (
    <section className="g-shell">
      <div className="g-body">
        <div className="g-card" style={{ maxWidth: 420, margin: "40px auto" }}>
          <h1 className="g-title">Bots Admin Login</h1>
          <p className="g-sub">Enter your panel password.</p>
          <LoginForm next={searchParams.next} />
        </div>
      </div>
    </section>
  );
}
