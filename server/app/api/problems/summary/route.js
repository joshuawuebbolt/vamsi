import { NextResponse } from 'next/server';
import { prismaService } from "@/app/util/db.js";

export async function GET(request) {
    const problem = await prismaService.getSummary();
    return NextResponse.json({ problem }, { status: 200 });
}