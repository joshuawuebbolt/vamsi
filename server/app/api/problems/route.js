import { NextResponse } from 'next/server';
import { prismaService } from "@/app/util/db.js";

// create a problem
export async function POST(request) {
    const { problemID } = await request.json();

    const problem = await prismaService.createProblem(problemID);
    return NextResponse.json({ problem }, { status: 200 });
}