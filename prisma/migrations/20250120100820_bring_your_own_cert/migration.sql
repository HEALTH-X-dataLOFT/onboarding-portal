/*
  Warnings:

  - You are about to drop the column `csrPem` on the `ParticipantOnboardingRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ParticipantOnboardingRequest" DROP COLUMN "csrPem",
ADD COLUMN     "didId" TEXT;
