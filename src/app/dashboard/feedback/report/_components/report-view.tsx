"use client";

import * as XLSX from "xlsx";
import { Download, FileDown, Printer } from "lucide-react";
import { format } from "date-fns";

interface ReportBranch {
  branchName: string;
  averageRating: string;
  comments: string[];
}

interface ReportViewProps {
  data: ReportBranch[];
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

  const handleExportExcel = () => {
    const rows = data.map((b) => ({
      Branch: b.branchName,
      Rating: b.averageRating !== "—" ? `${b.averageRating}/5.0` : "—",
      Feedback: b.comments.map((c, i) => `${i + 1}. ${c}`).join("\n\n"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback Report");
    XLSX.writeFile(workbook, `Feedback_Report_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const handleExportCSV = () => {
    const rows = data.map((b) => ({
      Branch: b.branchName,
      Rating: b.averageRating !== "—" ? `${b.averageRating}/5.0` : "—",
      Feedback: b.comments.map((c, i) => `${i + 1}. ${c}`).join(" | "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Feedback_Report_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden sticky top-0 glass-card rounded-none border-b border-ios-border-subtle p-4 flex justify-between items-center z-10 shadow-sm">
        <h1 className="text-label font-bold text-ios-foreground">Report Generator</h1>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-ios-border-subtle text-ios-foreground-subtle text-caption font-bold hover:bg-ios-border-subtle transition-colors">
            <FileDown size={14} /> CSV
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-caption font-bold hover:bg-emerald-500/20 transition-colors">
            <Download size={14} /> Excel
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ios-primary/10 text-ios-primary text-caption font-bold hover:bg-ios-primary/20 transition-colors">
            <Printer size={14} /> Print / PDF
          </button>
        </div>
      </div>

      <div className="p-8 max-w-[1200px] mx-auto print:p-0 print:m-0 w-full bg-white text-black">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guest Feedback Report</h1>
          <p className="text-lg text-gray-700 mt-2">{formatRange()}</p>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="bg-ios-primary text-white font-bold p-4 text-left border border-gray-300 w-[20%]">Branch</th>
              <th className="bg-ios-primary text-white font-bold p-4 text-center border border-gray-300 w-[10%]">Rating</th>
              <th className="bg-ios-primary text-white font-bold p-4 text-left border border-gray-300 w-[70%]">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500 border border-gray-300">
                  No feedback found for this period.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.branchName} className="align-top">
                  <td className="p-4 border border-gray-300 font-bold text-gray-800">
                    {row.branchName}
                  </td>
                  <td className="p-4 border border-gray-300 text-center text-gray-700">
                    {row.averageRating !== "—" ? `${row.averageRating}/5.0` : "—"}
                  </td>
                  <td className="p-4 border border-gray-300 text-gray-700">
                    {row.comments.length > 0 ? (
                      <ul className="space-y-4">
                        {row.comments.map((comment, i) => (
                          <li key={i} className="leading-relaxed">{i + 1}. {comment}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">—</span>
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
