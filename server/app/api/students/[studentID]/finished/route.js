import { NextResponse } from 'next/server';
import { prismaService } from "@/app/util/db.js";

export async function PATCH(request, { params }) {
    const { finished } = await request.json();
    const { studentID } = await params;

    const problemRecord = await prismaService.updateProblemRecordStatus(studentID, finished);
    return NextResponse.json({ problemRecord }, { status: 200 });
}