
import Nav from '../nav'
import { Card } from '@/components/ui'

export default function Dashboard() {
  return (
    <main>
      <Nav />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Administrator Dashboard</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><div className="text-sm opacity-80">Total Projects</div><div className="text-3xl font-semibold mt-2">—</div></Card>
          <Card><div className="text-sm opacity-80">Total Packages</div><div className="text-3xl font-semibold mt-2">—</div></Card>
          <Card><div className="text-sm opacity-80">Total Downlines</div><div className="text-3xl font-semibold mt-2">—</div></Card>
          <Card><div className="text-sm opacity-80">Last 7 days</div><div className="text-3xl font-semibold mt-2">—</div></Card>
        </div>
        <Card>
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <div className="opacity-70">Audit log list goes here…</div>
        </Card>
      </div>
    </main>
  )
}
