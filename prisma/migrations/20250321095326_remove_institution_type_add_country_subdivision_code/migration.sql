/*
  Warnings:

  - To simplify migration we renamed the column instead of dropping/creating a new one

*/
-- AlterTable
ALTER TABLE "ParticipantOnboardingFrom" RENAME COLUMN "institutionType" to "countrySubdivisionCode"; 
