import { NextResponse } from 'next/server';
import { prismaService } from "@/app/util/db.js";

export async function PATCH(request, { params }) {
    const { issues } = await request.json();
    const { studentID } = await params;

    const problemRecord = await prismaService.updateProblemRecordIssues(studentID, issues);
    return NextResponse.json({ problemRecord }, { status: 200 });
}