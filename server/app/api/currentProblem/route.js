import { NextResponse } from 'next/server';
import { prismaService } from "@/app/util/db.js";

// called by the front end to set or update the current problem ID
export async function POST(request) {
  try {
    const { problemID } = await request.json();
    const globalState = await prismaService.setCurrentProblemID(problemID);
    return NextResponse.json({ globalState }, { status: 200 });
  } catch (error) {
    console.error('Cannot set currentProblemID:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// find the current problem ID
export async function GET(request) {
  try {
    const problemID = await prismaService.findCurrentProblemID();
    return NextResponse.json({ problemID }, { status: 200 });
  } catch (error) {
    console.error('Cannot find currentProblemID:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}