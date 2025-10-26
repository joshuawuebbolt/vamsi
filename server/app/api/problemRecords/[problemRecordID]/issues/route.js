import { NextResponse } from 'next/server';
import { prismaService } from "@/app/util/db.js";

export async function PATCH(request, { params }) {
    const { issues } = await request.json();
    const { problemRecordID } = await params;

    const problemRecord = await prismaService.updateProblemRecordIssues(problemRecordID, issues);
    return NextResponse.json({ problemRecord }, { status: 200 });
}