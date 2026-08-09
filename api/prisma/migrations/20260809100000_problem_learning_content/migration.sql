-- Add optional source content for the active-recall workspace.
ALTER TABLE "Problem" ADD COLUMN "problemStatement" TEXT;
ALTER TABLE "Problem" ADD COLUMN "exampleInput" TEXT;
ALTER TABLE "Problem" ADD COLUMN "exampleOutput" TEXT;
ALTER TABLE "Problem" ADD COLUMN "constraints" TEXT;
ALTER TABLE "Problem" ADD COLUMN "solutionNotes" TEXT;

-- Keep revision-session work available for later recall context and analytics.
ALTER TABLE "RevisionLog" ADD COLUMN "assessment" TEXT;
ALTER TABLE "RevisionLog" ADD COLUMN "recallTime" INTEGER;
ALTER TABLE "RevisionLog" ADD COLUMN "thoughts" TEXT;
ALTER TABLE "RevisionLog" ADD COLUMN "code" TEXT;
ALTER TABLE "RevisionLog" ADD COLUMN "approach" TEXT;
ALTER TABLE "RevisionLog" ADD COLUMN "timeComplexity" TEXT;
ALTER TABLE "RevisionLog" ADD COLUMN "spaceComplexity" TEXT;
ALTER TABLE "RevisionLog" ADD COLUMN "complexityReason" TEXT;
