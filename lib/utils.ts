
export function encodeWhatsAppMessage(parts: Record<string, string>) {
  const raw = `[MAGNUS] REG_OK\n` +
    `PROJ:${parts.project}\n` +
    `PKG:${parts.package}\n` +
    `ID:${parts.id}\n` +
    `NAME:${parts.name}\n` +
    `PHONE:${parts.phone}\n` +
    `TAG:${parts.tag || ''}`
  return encodeURIComponent(raw)
}
