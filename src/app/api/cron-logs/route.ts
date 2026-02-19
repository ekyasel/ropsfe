import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const UPSTREAM = process.env.API_URL
  ? `${process.env.API_URL}/api/cron-logs`
  : "http://localhost:3002/api/cron-logs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") ?? "";
  const page = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "20";

  // Read session token from cookie (server-side — no CORS issue)
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const url = `${UPSTREAM}?page=${page}&pageSize=${pageSize}&date=${date}`;

  try {
    const upstream = await fetch(url, {
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      {
        error:
          "Gagal terhubung ke API server. Pastikan server berjalan di port 3002.",
      },
      { status: 502 },
    );
  }
}
