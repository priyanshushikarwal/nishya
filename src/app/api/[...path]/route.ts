import { NextRequest, NextResponse } from "next/server";

// Fallback to the live Hostinger VPS Go Backend if GO_BACKEND_URL is not set in environment
const GO_BACKEND_URL =
  process.env.GO_BACKEND_URL || "http://72.61.245.231:8080";

export const dynamic = "force-dynamic";

async function handleProxy(
  req: NextRequest,
  context?: { params?: Promise<{ path?: string[] }> | { path?: string[] } }
) {
  try {
    const rawParams = context?.params;
    const resolvedParams =
      rawParams instanceof Promise ? await rawParams : rawParams;
    const pathSegments = resolvedParams?.path || [];
    const pathString = Array.isArray(pathSegments) ? pathSegments.join("/") : "";
    const targetUrl = `${GO_BACKEND_URL}/api/${pathString}${req.nextUrl.search}`;

    const headers = new Headers();
    req.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== "host" && lowerKey !== "content-length") {
        headers.set(key, value);
      }
    });

    const isBodyAllowed =
      req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS";
    const body = isBodyAllowed ? await req.arrayBuffer() : undefined;

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "follow",
    });

    const responseHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    // Ensure CORS headers for frontend calls
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    responseHeaders.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, X-Idempotency-Key"
    );

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error(`[API Proxy Error]:`, err);
    return NextResponse.json(
      {
        error: "Backend service unreachable",
        message: err?.message || "Failed to communicate with Go backend",
      },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
export const OPTIONS = handleProxy;
