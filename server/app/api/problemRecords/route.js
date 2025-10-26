import { NextResponse } from 'next/server';
import { prismaService } from "@/app/util/db.js";

// create a problem record
export async function POST(request) {
    const { studentID, problemID } = await request.json();

    const problemRecord = await prismaService.createProblemRecord({ studentID, problemID });
    return NextResponse.json({ problemRecord }, { status: 200 });
}