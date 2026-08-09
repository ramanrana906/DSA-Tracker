-- Preserve legacy revision progress when the old data has no explicit solved attempt.
UPDATE "Problem"
SET "firstSolvedAt" = COALESCE(
  "firstSolvedAt",
  (
    SELECT MIN(COALESCE("scheduledDate", "completedDate"))
    FROM "RevisionLog"
    WHERE "RevisionLog"."problemId" = "Problem"."id"
  ),
  "lastRevisionDate",
  "createdAt"
)
WHERE "firstSolvedAt" IS NULL
  AND (
    "stage" > 0
    OR EXISTS (
      SELECT 1
      FROM "RevisionLog"
      WHERE "RevisionLog"."problemId" = "Problem"."id"
    )
  );

UPDATE "Problem"
SET "status" = CASE
  WHEN "nextRevisionDate" IS NOT NULL AND "nextRevisionDate" <= CURRENT_TIMESTAMP THEN 'DUE'
  ELSE 'IN_PROGRESS'
END
WHERE "firstSolvedAt" IS NOT NULL
  AND "stage" < 4;

UPDATE "Problem"
SET "stage" = 0,
    "nextRevisionDate" = NULL,
    "status" = 'UNSOLVED'
WHERE "firstSolvedAt" IS NULL;
