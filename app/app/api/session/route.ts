import { NextResponse } from "next/server";
import getServerSession from "@/utils/getServerSession";

export async function GET() {
  const session = await getServerSession();
  return NextResponse.json(session);
}