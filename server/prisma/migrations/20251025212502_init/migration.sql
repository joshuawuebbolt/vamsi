-- CreateTable
CREATE TABLE "Student" (
    "studentID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Problem" (
    "problemID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Instruction" TEXT NOT NULL,
    "createTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ProblemRecord" (
    "problemRecordID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentID" INTEGER NOT NULL,
    "problemID" INTEGER NOT NULL,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ProblemRecord_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "Student" ("studentID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProblemRecord_problemID_fkey" FOREIGN KEY ("problemID") REFERENCES "Problem" ("problemID") ON DELETE RESTRICT ON UPDATE CASCADE
);
