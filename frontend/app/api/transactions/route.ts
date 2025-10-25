import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const account_id = searchParams.get("account_id");

  if (!account_id) {
    return NextResponse.json({ error: "Falta el parámetro account_id" }, { status: 400 });
  }

  try {
    const res = await fetch(`http://127.0.0.1:8000/transactions?account_id=${account_id}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error desde FastAPI:", error);
    return NextResponse.json({ error: "No se pudo obtener las transacciones" }, { status: 500 });
  }
}
