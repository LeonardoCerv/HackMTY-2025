import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Backend exposes transactions under the /api namespace.
    // Proxy to FastAPI at /api/transactions (was incorrectly calling /transactions).
    const res = await fetch(`http://127.0.0.1:8000/api/transactions`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error desde FastAPI:", error);
    return NextResponse.json({ error: "No se pudo obtener las transacciones" }, { status: 500 });
  }
}
