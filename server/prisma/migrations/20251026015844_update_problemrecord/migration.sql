-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Problem" (
    "problemID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instructions" TEXT NOT NULL,
    "createTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Problem" ("createTime", "instructions", "problemID") SELECT "createTime", "instructions", "problemID" FROM "Problem";
DROP TABLE "Problem";
ALTER TABLE "new_Problem" RENAME TO "Problem";
CREATE TABLE "new_ProblemRecord" (
    "problemRecordID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentID" INTEGER NOT NULL,
    "problemID" INTEGER NOT NULL,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "issues" JSONB NOT NULL DEFAULT [],
    CONSTRAINT "ProblemRecord_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "Student" ("studentID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProblemRecord_problemID_fkey" FOREIGN KEY ("problemID") REFERENCES "Problem" ("problemID") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProblemRecord" ("finished", "problemID", "problemRecordID", "studentID") SELECT "finished", "problemID", "problemRecordID", "studentID" FROM "ProblemRecord";
DROP TABLE "ProblemRecord";
ALTER TABLE "new_ProblemRecord" RENAME TO "ProblemRecord";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
