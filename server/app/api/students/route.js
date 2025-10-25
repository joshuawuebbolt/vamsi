import { NextResponse } from 'next/server';
import { prismaService } from "@/app/util/db.js";

// create a student
export async function POST(request) {
  try {
    const student = await prismaService.createStudent();
    return NextResponse.json({ student }, { status: 200 });
  } catch (error) {
    console.error('POST /students error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// update student status (whether they have completed the problem)
export async function PUT(request) {
  try {
    const { id, completed } = await request.json();
    const student = await prismaService.updateStudentStatus(id, completed);
    return NextResponse.json({ student }, { status: 200 });
  } catch (error) {
    console.error('PUT /students error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ student }, { status: 200 });
}