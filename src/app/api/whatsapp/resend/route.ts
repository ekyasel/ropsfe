import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const UPSTREAM = process.env.API_URL
  ? `${process.env.API_URL}/api/whatsapp/resend`
  : "http://localhost:3002/api/whatsapp/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { room, targetDate } = body;

    if (!targetDate || !room) {
      return NextResponse.json(
        { error: "targetDate and room are required." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room, targetDate }),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("Error in POST /api/whatsapp/resend:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
