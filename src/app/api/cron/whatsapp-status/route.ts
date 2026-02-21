import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const UPSTREAM = process.env.API_URL
  ? `${process.env.API_URL}/api/cron/whatsapp-status`
  : "http://localhost:3002/api/cron/whatsapp-status";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const executionDate = searchParams.get("executionDate") ?? "";

  if (!executionDate) {
    return NextResponse.json(
      { error: "executionDate is required." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  const url = `${UPSTREAM}?executionDate=${executionDate}`;

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
  } catch (error) {
    console.error("Error fetching whatsapp status:", error);
    return NextResponse.json(
      { error: "Gagal terhubung ke API server." },
      { status: 502 },
    );
  }
}
