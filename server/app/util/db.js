import { PrismaClient } from "@prisma/client"
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

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
  // 1) Get current problem ID
  const problemID = await this.findCurrentProblemID();

  // 2) Fetch problem records
  const problems = await prisma.problemRecord.findMany({
    where: { problemID: Number(problemID) },
  });

  // 3) Keep input as LIST OF LISTS (one inner array per student)
  const problemIssues = problems.map((r) =>
    Array.isArray(r.issues) ? r.issues : [r.issues]
  );

  // 4) Build prompt (stringify to preserve nested structure)
  const prompt = `You are given data as a **list of lists of strings**.
Each inner list contains the issues reported by a single student.

**Task**

* Normalize semantically similar issues into one canonical problem (e.g., “can’t login”, “unable to sign in” → “Cannot log in”).
* Count frequency **by students** (a student contributes at most 1 count to a problem, even if they mention it multiple times).
* Rank problems by number of affected students.
* Select problems that meet either threshold:
  * Appears in **≥ 5%** of students, **or**
  * Appears in **≥ 3** students,
    whichever is larger.
* If fewer than 5 problems meet thresholds, return the **top 5** by frequency anyway (or all if fewer than 5 exist).
* Limit to **max 10** problems.
* Use short, canonical phrasing (question-style not required; e.g., “Reset password instructions unclear”).
* **Do not** include counts, percentages, or any extra text.

**Output format (critical)**
* Output **exactly one string** A summary consisting solely of the top 3 most common problem statements,
start with "Students are confused about these topics: "
* **No quotes, no code fences, no labels, no JSON, no markdown**
* Example of correct format:
"Cannot log in; Reset password instructions unclear; Error submitting assignment"

**Input**

---
${JSON.stringify(problemIssues)}
---

**Return only the string per the format above.**`;

  // 5) Create the client.
  // Uses GEMINI_API_KEY from env by default. You can also pass { apiKey: process.env.GEMINI_API_KEY }.
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

  // 6) Generate
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  // In @google/genai, text is available as a property/getter.
  const text = (response.text ?? "").trim();

  return text;
}}

export const prismaService = new PrismaService();
