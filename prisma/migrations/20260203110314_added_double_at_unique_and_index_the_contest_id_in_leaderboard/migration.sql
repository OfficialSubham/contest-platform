/*
  Warnings:

  - A unique constraint covering the columns `[contestId,userId]` on the table `Contest_leaderboard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Contest_leaderboard_contestId_idx" ON "Contest_leaderboard"("contestId");

-- CreateIndex
CREATE UNIQUE INDEX "Contest_leaderboard_contestId_userId_key" ON "Contest_leaderboard"("contestId", "userId");
