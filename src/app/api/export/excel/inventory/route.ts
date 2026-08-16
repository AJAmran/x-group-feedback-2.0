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

  const backendQuery = new URLSearchParams();
  const statementMonth = searchParams.get("statementMonth");
  const branchId = searchParams.get("branchId");
  if (statementMonth) backendQuery.set("statementMonth", statementMonth);
  if (branchId) backendQuery.set("branchId", branchId);

  const backendUrl = `${apiUrl}/api/v1/reports/export/excel/inventory?${backendQuery.toString()}`;

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
        "Content-Disposition": `attachment; filename="inventory_report_${statementMonth ?? "all"}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 503 },
    );
  }
}
