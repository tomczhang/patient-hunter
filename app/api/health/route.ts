import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "未知错误";
    return NextResponse.json({ status: "error", db: message }, { status: 500 });
  }
}
