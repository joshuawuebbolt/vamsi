import { NextResponse } from 'next/server';
import { prismaService } from "@/app/util/db.js";

export async function GET(request) {
    const summary = await prismaService.getSummary();
    if (summary == null) { 
        return NextResponse.json({ summary: "Everyone knows their stuff :D"}, {status: 200})
    }

    return NextResponse.json({ summary }, { status: 200 });
}