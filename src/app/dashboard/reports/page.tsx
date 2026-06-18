import { Suspense } from "react";
import { FileText, Download, FileSpreadsheet, FileDown } from "lucide-react";

const reports = [
  { title: "Daily Feedback Summary", description: "Complete summary of all feedback submitted today", type: "Daily", icon: FileText },
  { title: "Weekly Performance Report", description: "Weekly trends, ratings, and branch performance", type: "Weekly", icon: FileSpreadsheet },
  { title: "Monthly Analytics Report", description: "In-depth monthly analytics with charts and insights", type: "Monthly", icon: FileText },
  { title: "Quarterly Business Review", description: "Quarterly performance review and strategic insights", type: "Quarterly", icon: FileDown },
];

function ReportCard({ title, description, type, icon: Icon }: { title: string; description: string; type: string; icon: any }) {
  return (
    <div className="glass-card p-6 rounded-[1.5rem]">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-ios-primary/10 flex items-center justify-center">
          <Icon size={20} className="text-ios-primary" />
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-ios-primary/10 text-ios-primary text-micro font-bold uppercase tracking-wider">
          {type}
        </span>
      </div>
      <h3 className="text-label font-bold text-ios-foreground mb-1">{title}</h3>
      <p className="text-caption text-ios-foreground-muted mb-4">{description}</p>
      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ios-primary/10 text-ios-primary text-micro font-bold hover:bg-ios-primary/20 transition-colors">
          <Download size={14} />
          CSV
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ios-primary/10 text-ios-primary text-micro font-bold hover:bg-ios-primary/20 transition-colors">
          <Download size={14} />
          Excel
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ios-primary/10 text-ios-primary text-micro font-bold hover:bg-ios-primary/20 transition-colors">
          <Download size={14} />
          PDF
        </button>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="glass-card p-6 rounded-[1.5rem] animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-ios-border-subtle mb-4" />
      <div className="h-4 w-3/4 bg-ios-border-subtle rounded mb-2" />
      <div className="h-3 w-1/2 bg-ios-border-subtle rounded mb-4" />
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-ios-border-subtle rounded-xl" />
        <div className="h-8 w-16 bg-ios-border-subtle rounded-xl" />
        <div className="h-8 w-16 bg-ios-border-subtle rounded-xl" />
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-display font-extrabold text-ios-foreground tracking-tight">Reports</h1>
        <p className="text-subtitle text-ios-foreground-muted mt-1">Generate and export feedback reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reports.map((report) => (
          <ReportCard key={report.title} {...report} />
        ))}
      </div>
    </div>
  );
}
