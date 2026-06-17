import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-[1600px] animate-pulse">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded-lg mb-2"></div>
          <div className="h-4 w-96 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded mt-4"></div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 h-[300px]">
        <div className="h-6 w-48 bg-slate-200 rounded mb-6"></div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-slate-50 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
