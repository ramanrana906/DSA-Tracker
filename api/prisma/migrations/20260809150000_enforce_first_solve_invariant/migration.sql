-- Revisions created without a successful first solve came from the legacy
-- STRUGGLED-as-revision bug and cannot represent valid lifecycle progress.
DELETE FROM "RevisionLog"
WHERE NOT EXISTS (
  SELECT 1
  FROM "Attempt"
  WHERE "Attempt"."problemId" = "RevisionLog"."problemId"
    AND "Attempt"."outcome" = 'SOLVED'
);

UPDATE "Problem"
SET "status" = 'UNSOLVED',
    "stage" = 0,
    "firstSolvedAt" = NULL,
    "nextRevisionDate" = NULL,
    "lastRevisionDate" = NULL,
    "masteredAt" = NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM "Attempt"
  WHERE "Attempt"."problemId" = "Problem"."id"
    AND "Attempt"."outcome" = 'SOLVED'
);
