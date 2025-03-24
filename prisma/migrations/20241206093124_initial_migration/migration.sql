-- CreateTable
CREATE TABLE "ParticipantOnboardingFrom" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "institutionType" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "vatID" TEXT NOT NULL,

    CONSTRAINT "ParticipantOnboardingFrom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantOnboardingRequest" (
    "id" TEXT NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "frApproved" BOOLEAN NOT NULL DEFAULT false,
    "vcsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "trustAnchorVc" TEXT,
    "participantVc" TEXT,
    "termsAndConditionsVc" TEXT,
    "registrationNumberVc" TEXT,
    "formId" TEXT NOT NULL,
    "csrPem" TEXT NOT NULL,

    CONSTRAINT "ParticipantOnboardingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Did" (
    "id" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "certificate" TEXT NOT NULL,

    CONSTRAINT "Did_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantOnboardingFrom_email_key" ON "ParticipantOnboardingFrom"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantOnboardingRequest_formId_key" ON "ParticipantOnboardingRequest"("formId");

-- AddForeignKey
ALTER TABLE "ParticipantOnboardingRequest" ADD CONSTRAINT "ParticipantOnboardingRequest_formId_fkey" FOREIGN KEY ("formId") REFERENCES "ParticipantOnboardingFrom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
