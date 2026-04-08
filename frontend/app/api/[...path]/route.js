const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:4000";

async function proxy(request, { params }) {
  const { path } = await params;
  const { search } = new URL(request.url);
  const url = `${BACKEND}/api/${path.join("/")}${search}`;

  const headers = new Headers();
  for (const [k, v] of request.headers.entries()) {
    if (k !== "host") headers.set(k, v);
  }

  let body;
  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.arrayBuffer();
  }

  let res;
  try {
    res = await fetch(url, { method: request.method, headers, body });
  } catch {
    return new Response(JSON.stringify({ error: "Backend unavailable" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }

  const resHeaders = new Headers();
  for (const [k, v] of res.headers.entries()) {
    // Skip content-encoding — Vercel may have already decompressed the body
    if (k !== "content-encoding") resHeaders.append(k, v);
  }

  return new Response(res.body, { status: res.status, headers: resHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
