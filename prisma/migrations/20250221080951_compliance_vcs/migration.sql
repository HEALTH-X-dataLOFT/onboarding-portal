-- AlterTable
ALTER TABLE "ParticipantOnboardingRequest" ADD COLUMN     "complianceUrl" TEXT,
ADD COLUMN     "complianceVc" TEXT;

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "complianceUrl" TEXT NOT NULL,
    "termsAndConditionsVc" TEXT NOT NULL,
    "legalRegistrationNumberVc" TEXT NOT NULL,
    "complianceVc" TEXT NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compliance" (
    "hash" TEXT NOT NULL,
    "complianceVc" TEXT NOT NULL,

    CONSTRAINT "Compliance_pkey" PRIMARY KEY ("hash")
);
