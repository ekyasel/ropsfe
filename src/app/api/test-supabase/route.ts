import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.API_URL || "http://localhost:3002";
  try {
    const res = await fetch(`${apiUrl}/api/test-supabase`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Cannot reach API server" },
      { status: 503 },
    );
  }
}
