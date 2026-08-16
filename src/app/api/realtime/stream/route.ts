import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * SSE proxy for dashboard real-time updates.
 *
 * The browser's EventSource cannot send the `accessToken` HttpOnly cookie to the
 * Express backend directly, so this route reads the cookie server-side, opens an
 * authenticated upstream SSE connection to the backend `/api/v1/realtime/events`,
 * and pipes the event stream back to the browser with SSE headers.
 *
 * When the upstream connection is rejected (401/expired session), we relay the
 * status so the client can trigger a token refresh / re-login flow.
 */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
  const upstreamUrl = `${apiUrl}/api/v1/realtime/events`;

  // Abort the upstream fetch when the client disconnects.
  const controller = new AbortController();
  request.signal.addEventListener("abort", () => controller.abort());

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      headers: {
        Cookie: `accessToken=${token}`,
        Accept: "text/event-stream",
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    // Backend unreachable — treat as a transport failure; EventSource will retry.
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Realtime stream unavailable" },
      { status: upstream.status },
    );
  }

  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async pull(controllerStream) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controllerStream.close();
        } else {
          controllerStream.enqueue(value);
        }
      } catch (err) {
        controllerStream.error(err);
      }
    },
    cancel() {
      controller.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}