
/**
 * Swap this for proper NextAuth. For now, we mock a single admin session in dev.
 */
export function requireAdmin() {
  // TODO: add real auth (NextAuth / middleware).
  return { id: 'admin', email: 'admin@example.com', role: 'ADMIN' }
}
