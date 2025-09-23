import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function requireBotsAuth() {
  const token = cookies().get("bots_admin")?.value || "";
  if (!process.env.BOTS_ADMIN_TOKEN || token !== process.env.BOTS_ADMIN_TOKEN) {
    redirect("/admin/bots/login");
  }
}
