/*
  Warnings:

  - You are about to drop the column `Instruction` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `instructions` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Problem" (
    "problemID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instructions" TEXT NOT NULL,
    "createTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Problem" ("createTime", "problemID") SELECT "createTime", "problemID" FROM "Problem";
DROP TABLE "Problem";
ALTER TABLE "new_Problem" RENAME TO "Problem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
