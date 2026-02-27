import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const UPSTREAM = process.env.API_URL
  ? `${process.env.API_URL}/api/parameters`
  : "http://localhost:3002/api/parameters";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  try {
    const upstream = await fetch(UPSTREAM, {
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
    });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("Error in GET /api/parameters:", error);
    return NextResponse.json(
      { error: "Gagal terhubung ke API server." },
      { status: 502 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID parameter diperlukan." },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    const upstream = await fetch(`${UPSTREAM}/${id}`, {
      method: "PUT",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    console.error("Error in PUT /api/parameters:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
