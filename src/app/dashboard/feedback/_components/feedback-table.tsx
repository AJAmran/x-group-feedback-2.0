"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { MessageSquare, Eye } from "lucide-react";
import { getSentimentColor } from "@/lib/chart-theme";
import { Button } from "@/components/ui/Button";
import { Table, THead, THeadRow, TH, TD, TR, TableEmpty } from "@/components/dashboard/table";
import { Pagination } from "@/components/dashboard/pagination";
import { CardHeader } from "@/components/dashboard/card-header";
import { Avatar } from "@/components/dashboard/avatar";
import { RatingBadge } from "@/components/dashboard/rating-badge";

interface FeedbackItem {
  id: string;
  feedbackId: string;
  guestName: string;
  branchCode: string;
  branchName: string;
  overallRating: string | null;
  createdAt: string;
  sentimentLabel: string | null;
}

interface FeedbackListData {
  items: FeedbackItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface FeedbackTableProps {
  data: FeedbackListData;
}

function formatDate(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function FeedbackTable({ data }: FeedbackTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/dashboard/feedback?${params.toString()}`);
  };

  return (
    <div className="glass-card overflow-hidden">
      <CardHeader icon={MessageSquare} title="All Entries" count={data.total} />

      <Table>
        <THead>
          <THeadRow>
            <TH>Guest</TH>
            <TH>Branch</TH>
            <TH>Rating</TH>
            <TH>Sentiment</TH>
            <TH>Date</TH>
            <TH align="right">Actions</TH>
          </THeadRow>
        </THead>
        <tbody>
          {data.items.length === 0 ? (
            <TableEmpty
              colSpan={6}
              icon={MessageSquare}
              title="No feedback found"
              description="Try adjusting your filters"
            />
          ) : (
            data.items.map((item) => (
              <TR key={item.id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <Avatar name={item.guestName} size="sm" />
                    <span className="text-label font-semibold text-ios-foreground">{item.guestName}</span>
                  </div>
                </TD>
                <TD>
                  <span className="text-label text-ios-foreground-muted">{item.branchName}</span>
                </TD>
                <TD>
                  <RatingBadge rating={item.overallRating} />
                </TD>
                <TD>
                  {item.sentimentLabel ? (
                    <span
                      className="text-micro font-bold uppercase tracking-wider"
                      style={{
                        color:
                          item.sentimentLabel === "positive" || item.sentimentLabel === "negative"
                            ? getSentimentColor(item.sentimentLabel)
                            : "var(--color-ios-foreground-subtle)",
                      }}
                    >
                      {item.sentimentLabel}
                    </span>
                  ) : (
                    <span className="text-caption text-ios-foreground-faint">—</span>
                  )}
                </TD>
                <TD>
                  <span className="text-caption text-ios-foreground-subtle font-medium">
                    {formatDate(item.createdAt)}
                  </span>
                </TD>
                <TD align="right">
                  <Button
                    variant="icon"
                    onClick={() => router.push(`/dashboard/feedback/${item.id}`)}
                    aria-label="View feedback"
                    icon={Eye}
                  />
                </TD>
              </TR>
            ))
          )}
        </tbody>
      </Table>

      {data.totalPages > 1 && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          pageSize={data.pageSize}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}