/*
  Warnings:

  - A unique constraint covering the columns `[studentID,problemID]` on the table `ProblemRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProblemRecord_studentID_problemID_key" ON "ProblemRecord"("studentID", "problemID");
