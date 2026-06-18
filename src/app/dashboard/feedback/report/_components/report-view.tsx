"use client";

import { useRef } from "react";
import * as XLSX from "xlsx";
import { Download, FileDown, Printer } from "lucide-react";
import { format } from "date-fns";

interface ReportBranch {
  branchName: string;
  averageRating: string;
  positiveComments: string[];
  negativeComments: string[];
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
      Positive: b.positiveComments.map((c, i) => `${i + 1}. ${c}`).join("\n\n"),
      Negative: b.negativeComments.map((c, i) => `${i + 1}. ${c}`).join("\n\n"),
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
      Positive: b.positiveComments.map((c, i) => `${i + 1}. ${c}`).join(" | "),
      Negative: b.negativeComments.map((c, i) => `${i + 1}. ${c}`).join(" | "),
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
      {/* Action Bar - Hidden when printing */}
      <div className="print:hidden sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center z-10 shadow-sm">
        <h1 className="font-bold text-gray-800">Report Generator</h1>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition">
            <FileDown size={16} /> CSV
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-[#217346] hover:bg-[#1e6b41] text-white rounded-lg text-sm font-semibold transition">
            <Download size={16} /> Excel
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
            <Printer size={16} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Printable Report Content */}
      <div className="p-8 max-w-[1200px] mx-auto print:p-0 print:m-0 w-full bg-white text-black">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guest Feedback Report</h1>
          <p className="text-lg text-gray-700 mt-2">{formatRange()}</p>
        </div>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="bg-[#4285F4] text-white font-bold p-4 text-left border border-gray-300 w-[20%]">Branch</th>
              <th className="bg-[#4285F4] text-white font-bold p-4 text-center border border-gray-300 w-[10%]">Rating</th>
              <th className="bg-[#4285F4] text-white font-bold p-4 text-left border border-gray-300 w-[35%]">Positive</th>
              <th className="bg-[#4285F4] text-white font-bold p-4 text-left border border-gray-300 w-[35%]">Negative</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 border border-gray-300">
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
                    {row.positiveComments.length > 0 ? (
                      <ul className="space-y-4">
                        {row.positiveComments.map((comment, i) => (
                          <li key={i} className="leading-relaxed">{i + 1}. {comment}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-4 border border-gray-300 text-gray-700">
                    {row.negativeComments.length > 0 ? (
                      <ul className="space-y-4">
                        {row.negativeComments.map((comment, i) => (
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
