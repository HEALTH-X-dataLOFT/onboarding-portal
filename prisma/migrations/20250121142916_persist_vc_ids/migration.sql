/*
  Warnings:

  - Added the required column `participantSubjectId` to the `ParticipantOnboardingFrom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participantVcId` to the `ParticipantOnboardingFrom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationNumberSubjectId` to the `ParticipantOnboardingFrom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationNumberVcId` to the `ParticipantOnboardingFrom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termsAndConditionsSubjectId` to the `ParticipantOnboardingFrom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termsAndConditionsVcId` to the `ParticipantOnboardingFrom` table without a default value. This is not possible if the table is not empty.

*/
DELETE FROM "ParticipantOnboardingFrom";
-- AlterTable
ALTER TABLE "ParticipantOnboardingFrom" ADD COLUMN     "participantSubjectId" TEXT NOT NULL,
ADD COLUMN     "participantVcId" TEXT NOT NULL,
ADD COLUMN     "registrationNumberSubjectId" TEXT NOT NULL,
ADD COLUMN     "registrationNumberVcId" TEXT NOT NULL,
ADD COLUMN     "termsAndConditionsSubjectId" TEXT NOT NULL,
ADD COLUMN     "termsAndConditionsVcId" TEXT NOT NULL;
