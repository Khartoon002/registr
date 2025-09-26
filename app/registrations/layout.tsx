// Wraps only the /registrations subtree — no Nav here.
import "../globals.css";

export default function RegistrationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b1220] text-gray-100 antialiased">
      <main className="mx-auto w-full max-w-screen-md px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
