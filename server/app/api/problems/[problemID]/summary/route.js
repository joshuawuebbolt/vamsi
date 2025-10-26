import { NextResponse } from 'next/server';
import { prismaService } from "@/app/util/db.js";

export async function PATCH(request, { params }) {
    const { summary } = await request.json();
    const { problemID } = await params;

    const problem = await prismaService.updateProblemSummary(problemID, summary);
    return NextResponse.json({ problem }, { status: 200 });
}