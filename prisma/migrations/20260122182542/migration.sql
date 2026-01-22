-- CreateEnum
CREATE TYPE "Role" AS ENUM ('creator', 'contestee');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contests" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "creator_id" INTEGER NOT NULL,

    CONSTRAINT "Contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mcq_questions" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" TEXT[],
    "correct_option_index" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mcq_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dsa_problems" (
    "id" SERIAL NOT NULL,
    "contest_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "points" INTEGER NOT NULL DEFAULT 100,
    "time_limit" INTEGER NOT NULL DEFAULT 2000,
    "memory_limit" INTEGER NOT NULL DEFAULT 256,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dsa_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test_cases" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mcq_submission" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "selected_option_index" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mcq_submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dsa_submission" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "test_cases_passed" INTEGER NOT NULL DEFAULT 0,
    "total_test_cases" INTEGER NOT NULL DEFAULT 0,
    "execution_time" INTEGER NOT NULL,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dsa_submission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Contests" ADD CONSTRAINT "Contests_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mcq_questions" ADD CONSTRAINT "Mcq_questions_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dsa_problems" ADD CONSTRAINT "Dsa_problems_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "Contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test_cases" ADD CONSTRAINT "Test_cases_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Dsa_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mcq_submission" ADD CONSTRAINT "Mcq_submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mcq_submission" ADD CONSTRAINT "Mcq_submission_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Mcq_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dsa_submission" ADD CONSTRAINT "Dsa_submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dsa_submission" ADD CONSTRAINT "Dsa_submission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "Dsa_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
