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
            studentID: parseInt(studentID),
            problemID: parseInt(problemID)
        }
    });
    return problemRecord;
    }

    async updateProblemRecordStatus(problemRecordID, finished) {
    const problemRecord = await prisma.problemRecord.update({
        where: { problemRecordID: parseInt(problemRecordID) },
        data: { finished: finished }
    });
    return problemRecord;
    }

    async updateProblemRecordIssues(problemRecordID, issues) {
    const problemRecord = await prisma.problemRecord.update({
        where: { problemRecordID: parseInt(problemRecordID) },
        data: { issues: issues }
    });
    return problemRecord;
    }

    async updateProblemSummary(problemID, summary) {
    const problem = await prisma.problem.update({
        where: { problemID: parseInt(problemID) },
        data: { summary: summary }
    });
    return problem;
    }
}

export const prismaService = new PrismaService();
