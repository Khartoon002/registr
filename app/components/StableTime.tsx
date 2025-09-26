"use client";
import { useMemo } from "react";
const LOCALE = "en-GB"; const TIMEZONE = "Africa/Lagos";
export default function StableTime({ iso }: { iso: string }) {
  const fmt = useMemo(()=>new Intl.DateTimeFormat(LOCALE,{
    year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",second:"2-digit",
    hour12:false,timeZone:TIMEZONE
  }),[]);
  return <time dateTime={iso} suppressHydrationWarning>{fmt.format(new Date(iso))}</time>;
}
