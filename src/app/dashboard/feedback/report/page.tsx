import { Suspense } from "react";
import { getReportData } from "@/features/dashboard/actions";
import { ReportView } from "./_components/report-view";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const data = await getReportData(params.dateFrom, params.dateTo);

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Report...</div>}>
      <ReportView 
        data={data} 
        dateFrom={params.dateFrom} 
        dateTo={params.dateTo} 
      />
    </Suspense>
  );
}
