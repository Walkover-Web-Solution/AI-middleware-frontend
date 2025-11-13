export const runtime = "nodejs";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8002";

const backendBase =
  process.env.CHATKIT_BACKEND_URL?.trim() || DEFAULT_BACKEND_URL;

const CHATKIT_PATH = "/chatkit";

function buildBackendUrl(pathname) {
  return new URL(pathname, backendBase).toString();
}

function forwardHeaders(requestHeaders) {
  const headers = new Headers();
  requestHeaders.forEach((value, key) => {
    if (key === "host" || key === "content-length") {
      return;
    }
    headers.set(key, value);
  });
  return headers;
}

async function proxyChatKitRequest(request) {
  if (!backendBase) {
    return Response.json(
      {
        ok: false,
        error: "CHATKIT_BACKEND_URL is not configured.",
      },
      { status: 503 }
    );
  }

  const target = buildBackendUrl(CHATKIT_PATH);

  const backendResponse = await fetch(target, {
    method: "POST",
    headers: forwardHeaders(request.headers),
    body: request.body,
    cache: "no-store",
    duplex: "half",
  });

  const responseHeaders = new Headers(backendResponse.headers);
  responseHeaders.set("cache-control", "no-store");

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export async function POST(request) {
  try {
    return await proxyChatKitRequest(request);
  } catch (error) {
    console.error("ChatKit proxy error", error);
    return Response.json(
      { ok: false, error: "Failed to reach ChatKit backend." },
      { status: 502 }
    );
  }
}
