export const runtime = "nodejs";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8002";

const backendBase =
  process.env.CHATKIT_BACKEND_URL?.trim() || DEFAULT_BACKEND_URL;

export async function GET() {
  if (!backendBase) {
    return Response.json(
      {
        ok: false,
        status: "missing-backend",
        message: "CHATKIT_BACKEND_URL is not configured.",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(new URL("/health", backendBase), {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return Response.json(
        {
          ok: false,
          status: "unhealthy",
          message: `Backend responded with status ${response.status}`,
        },
        { status: 502 }
      );
    }

    const payload = await response.json().catch(() => ({}));

    return Response.json({
      ok: true,
      status: payload?.status ?? "healthy",
      message: "Backend reachable.",
    });
  } catch (error) {
    console.error("ChatKit health check failed", error);
    return Response.json(
      {
        ok: false,
        status: "unreachable",
        message: "Failed to reach ChatKit backend.",
      },
      { status: 502 }
    );
  }
}
