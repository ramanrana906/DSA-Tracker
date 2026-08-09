-- Add explicit lifecycle timestamps and hint analytics.
ALTER TABLE "Problem" ADD COLUMN "firstSolvedAt" DATETIME;
ALTER TABLE "Problem" ADD COLUMN "masteredAt" DATETIME;
ALTER TABLE "RevisionLog" ADD COLUMN "usedHint" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RevisionLog" ADD COLUMN "hintLevel" INTEGER;

-- Recover the active revision when the old failure flow reset a problem to stage 0.
UPDATE "Problem"
SET "stage" = MIN((
  SELECT "stageBefore"
  FROM "RevisionLog"
  WHERE "RevisionLog"."problemId" = "Problem"."id"
  ORDER BY "completedDate" DESC
  LIMIT 1
), 4)
WHERE "lastOutcome" = 'FORGOT'
  AND EXISTS (
    SELECT 1
    FROM "RevisionLog"
    WHERE "RevisionLog"."problemId" = "Problem"."id"
  );

UPDATE "Problem"
SET "firstSolvedAt" = COALESCE((
  SELECT MIN("date")
  FROM "Attempt"
  WHERE "Attempt"."problemId" = "Problem"."id"
    AND "Attempt"."outcome" = 'SOLVED'
), "lastRevisionDate", "createdAt")
WHERE EXISTS (
  SELECT 1
  FROM "Attempt"
  WHERE "Attempt"."problemId" = "Problem"."id"
    AND "Attempt"."outcome" = 'SOLVED'
);

UPDATE "Problem"
SET "stage" = 4,
    "status" = 'MASTERED',
    "masteredAt" = COALESCE("lastRevisionDate", "updatedAt"),
    "nextRevisionDate" = NULL
WHERE "stage" >= 4;

UPDATE "Problem"
SET "status" = CASE
  WHEN "firstSolvedAt" IS NULL THEN 'UNSOLVED'
  WHEN "nextRevisionDate" IS NOT NULL AND "nextRevisionDate" <= CURRENT_TIMESTAMP THEN 'DUE'
  ELSE 'IN_PROGRESS'
END
WHERE "stage" < 4;
