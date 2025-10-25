import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

class PrismaService {
    constructor() {}

    async createStudent() {
    const student = await prisma.student.create({
        data: {}
    });
    return student;
    }

    async createProblem(instructions) {
    const problem = await prisma.problem.create({
        data: { instructions: instructions }
    });
    return problem;
    }

    async createProblemRecord({ studentID, problemID }) {
    const problemRecord = await prisma.problemRecord.create({
        data: {
            studentID: studentID,
            problemID: problemID
        }
    });
    return problemRecord;
    }

    async updateProblemRecordStatus(problemRecordID, completed) {
    const problemRecord = await prisma.problemrecord.update({
        where: { problemRecordID: problemRecordID },
        data: { completed: completed }
    });
    return problemRecord;
    }
}

export const prismaService = new PrismaService();
