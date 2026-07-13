import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
  const { searchParams } = new URL(request.url);

  // Forward query params (startDate, endDate, branchId) to the backend
  const backendQuery = new URLSearchParams();
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const branchId = searchParams.get("branchId");
  if (startDate) backendQuery.set("startDate", startDate);
  if (endDate) backendQuery.set("endDate", endDate);
  if (branchId) backendQuery.set("branchId", branchId);

  const backendUrl = `${apiUrl}/api/v1/reports/export/excel?${backendQuery.toString()}`;

  try {
    const backendRes = await fetch(backendUrl, {
      headers: {
        Cookie: `accessToken=${token}`,
      },
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "Export failed on backend" },
        { status: 502 },
      );
    }

    const blob = await backendRes.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="feedbacks_export.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 503 },
    );
  }
}
