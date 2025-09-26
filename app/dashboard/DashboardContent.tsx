"use client";
import { useEffect, useState } from "react";
import StableTime from "@/app/components/StableTime";

type Log={name:string;projectName:string;packageName:string;date:string};
type Stats={
  totalProjects:number; totalPackages:number; totalDownlines:number;
  registrationsLast7Days:number; logs:Log[];
};

export default function DashboardContent({ initialStats }: { initialStats: Stats }) {
  const [stats,setStats]=useState<Stats>(initialStats);
  useEffect(()=>{
    const id=setInterval(async()=>{
      const res=await fetch("/api/dashboard/stats",{cache:"no-store"}).catch(()=>null);
      if(!res?.ok) return;
      const d=await res.json();
      setStats(s=>({...s,...d, logs:Array.isArray(d.logs)?d.logs:s.logs}));
    },10000);
    return ()=>clearInterval(id);
  },[]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:"Total Projects",value:stats.totalProjects},
          {label:"Total Packages",value:stats.totalPackages},
          {label:"Total Downlines",value:stats.totalDownlines},
          {label:"Last 7 days",value:stats.registrationsLast7Days},
        ].map((c,i)=>(
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/60">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
        {!stats.logs?.length ? (
          <p className="text-white/60 text-sm">No recent activity.</p>
        ) : (
          <ul className="space-y-2">
            {stats.logs.map((log,i)=>(
              <li key={i} className="text-sm">
                <span className="font-medium">{log.name}</span> →{" "}
                <span className="text-white/80">{log.packageName}</span>{" "}
                in <span className="text-white/80">{log.projectName}</span>{" "}
                on <StableTime iso={log.date}/>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
