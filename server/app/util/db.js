import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
const [{ journal_mode }] = await prisma.$queryRawUnsafe(
  `PRAGMA journal_mode = WAL;`
)

class PrismaService {
    constructor() {}

    async createStudent() {
    const student = await prisma.student.create({
        data: {}
    });
    return student;
    }

    async createProblem(problemID) {
    const id = parseInt(problemID);

    const existing = await prisma.problem.findUnique({
        where: { problemID: id },
    });

    if (existing) {
        console.log(`Problem ${id} already exists.`);
        return existing;
    }

    const problem = await prisma.problem.create({
        data: { problemID: id },
    });

    return problem;
    }

    // set the current problem ID and create the problem if it doesn't exist
    async setCurrentProblemID(problemID) {
        const globalState = await prisma.globalState.upsert({
            where: { key: "currentProblemID" },
            update: { value: problemID },
            create: { key: "currentProblemID", value: problemID }
        });

        // check if the problem exists, if not, create a new problem
        let problem = await prisma.problem.findUnique({
            where: { problemID: parseInt(problemID) }
        });
        if (!problem) {
            problem = await this.createProblem(problemID);
        }
        return globalState;
    }

    async findCurrentProblemID() {
        const globalState = await prisma.globalState.findUnique({
            where: { key: "currentProblemID" }
        });
        return globalState.value;
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

    async updateProblemRecordStatus(studentID, finished) {
        // find current problem id
        const problemID = await this.findCurrentProblemID();

        // check if the problem record based on studentID and problemID exists, if not, create a new problem record
        let problemRecord = await prisma.problemRecord.findUnique({
            where: {
                studentID_problemID: {
                    studentID: parseInt(studentID),
                    problemID: parseInt(problemID)
                }
            }
        });
        if (!problemRecord) {
            problemRecord = await this.createProblemRecord({ studentID, problemID });
        }

        // update finished status
        problemRecord = await prisma.problemRecord.update({
            where: { problemRecordID: parseInt(problemRecord.problemRecordID) },
            data: { finished: finished }
        });
        return problemRecord;
    }

    async updateProblemRecordIssues(studentID, issues) {
        // find current problem id
        const problemID = await this.findCurrentProblemID();

        // check if the problem record based on studentID and problemID exists, if not, create a new problem record
        let problemRecord = await prisma.problemRecord.findUnique({
            where: {
                studentID_problemID: {
                    studentID: parseInt(studentID),
                    problemID: parseInt(problemID)
                }
            }
        });
        if (!problemRecord) {
            problemRecord = await this.createProblemRecord({ studentID, problemID });
        }

        const problemRecordID = problemRecord.problemRecordID;

        // 1️⃣ Get the existing issues array
        const existing = await prisma.problemRecord.findUnique({
            where: { problemRecordID: Number(problemRecordID) },
            select: { issues: true },
        });

        // 2️⃣ Concatenate and save back
        const updated = await prisma.problemRecord.update({
            where: { problemRecordID: Number(problemRecordID) },
            data: {
            issues: [...(existing?.issues ?? []), ...issues],
            },
        });

        return updated;
    }

    async updateProblemSummary(summary) {
    const problemID = await this.findCurrentProblemID();
    
    const problem = await prisma.problem.update({
        where: { problemID: parseInt(problemID) },
        data: { summary: summary }
    });
    return problem;
    }

    async getSummary() {
        // get current problem ID
        const problemID = await this.findCurrentProblemID();
        
        // find all records with this problem ID
        const problems = await prisma.problemRecord.findMany({
            where: { problemID: parseInt(problemID) }
        });
        const problemIssues = problems.flatMap(record => record.issues);
        return problem;
    }
}

export const prismaService = new PrismaService();
