/*
  Warnings:

  - You are about to drop the column `instructions` on the `Problem` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "GlobalState" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Problem" (
    "problemID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Problem" ("createTime", "problemID", "summary") SELECT "createTime", "problemID", "summary" FROM "Problem";
DROP TABLE "Problem";
ALTER TABLE "new_Problem" RENAME TO "Problem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
