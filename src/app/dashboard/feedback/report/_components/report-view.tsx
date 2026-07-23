"use client";

import { Download, FileDown, Printer, FileText } from "lucide-react";
import { format } from "date-fns";

interface BranchReportRow {
  branchName: string;
  averageRating: string;
  comments: string[];
}

interface ReportViewProps {
  data: BranchReportRow[];
  dateFrom?: string;
  dateTo?: string;
}

export function ReportView({ data, dateFrom, dateTo }: ReportViewProps) {
  const formatRange = () => {
    if (dateFrom && dateTo) {
      return `${format(new Date(dateFrom), "dd MMM")} - ${format(new Date(dateTo), "dd MMM, yyyy")}`;
    }
    if (dateFrom) return `Since ${format(new Date(dateFrom), "dd MMM, yyyy")}`;
    if (dateTo) return `Until ${format(new Date(dateTo), "dd MMM, yyyy")}`;
    return "All Time";
  };

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const rows = data.map((r) => ({
      Branch: r.branchName,
      "Avg Rating": r.averageRating,
      Comments: r.comments.map((c, i) => `${i + 1}. ${c}`).join("\n"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const colMaxWidth = rows.reduce(
      (max, r) => Math.max(max, r.Comments.length),
      0
    );
    ws["!cols"] = [{ wch: 25 }, { wch: 14 }, { wch: Math.min(colMaxWidth, 80) }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedback Report");
    XLSX.writeFile(wb, `Feedback_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const handleExportCSV = async () => {
    const XLSX = await import("xlsx");
    const rows = data.map((r) => ({
      Branch: r.branchName,
      "Avg Rating": r.averageRating,
      Comments: r.comments.join("; "),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Feedback_Report_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const handleExportPDF = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Guest Feedback Report - By Branch", 14, 15);
    doc.setFontSize(10);
    doc.text(formatRange(), 14, 22);

    const rows = data.map((r) => [
      r.branchName,
      r.averageRating,
                    r.comments.length ? r.comments.map((c, i) => `${i + 1}. ${c}`).join("\n") : "—",
    ]);

    autoTable(doc, {
      head: [["Branch", "Avg Rating", "Comments"]],
      body: rows,
      startY: 28,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 98, 255] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: "auto" },
      },
    });

    doc.save(`Feedback_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden sticky top-0 glass-card rounded-none border-b border-ios-border-subtle p-4 flex justify-between items-center z-10 shadow-sm">
        <div>
          <h1 className="text-label font-bold text-ios-foreground">Feedback Report</h1>
          <p className="text-caption text-ios-foreground-subtle">{data.length} branches • {formatRange()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-ios-border-subtle text-ios-foreground-subtle text-caption font-bold hover:bg-ios-border-subtle transition-colors">
            <FileDown size={14} /> CSV
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-caption font-bold hover:bg-emerald-500/20 transition-colors">
            <Download size={14} /> Excel
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-caption font-bold hover:bg-red-500/20 transition-colors">
            <FileText size={14} /> PDF
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ios-primary/10 text-ios-primary text-caption font-bold hover:bg-ios-primary/20 transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto print:p-0 print:m-0 w-full bg-white text-black">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guest Feedback Report</h1>
          <p className="text-lg text-gray-700 mt-2">
            {data.length} branches • {formatRange()}
          </p>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="bg-ios-primary text-white font-bold p-3 text-left border border-gray-300 text-sm w-[250px]">Branch</th>
              <th className="bg-ios-primary text-white font-bold p-3 text-center border border-gray-300 text-sm w-[120px]">Avg Rating</th>
              <th className="bg-ios-primary text-white font-bold p-3 text-left border border-gray-300 text-sm">Comments</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500 border border-gray-300">
                  No feedback found matching the current filters.
                </td>
              </tr>
            ) : (
              data.sort((a, b) => a.branchName.localeCompare(b.branchName)).map((row, i) => (
                <tr key={`${row.branchName}-${i}`} className="align-top">
                  <td className="p-3 border border-gray-300 font-bold text-gray-800">{row.branchName}</td>
                  <td className="p-3 border border-gray-300 text-center font-bold text-lg">{row.averageRating}</td>
                  <td className="p-3 border border-gray-300 text-gray-700 text-sm">
                    {row.comments.length === 0 ? (
                      <span className="text-gray-400 italic">— No comments —</span>
                    ) : (
                      <ol className="list-decimal list-inside space-y-0.5">
                        {row.comments.map((c, ci) => (
                          <li key={ci}>{c}</li>
                        ))}
                      </ol>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
