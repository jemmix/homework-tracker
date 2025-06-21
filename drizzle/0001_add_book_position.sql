-- Add a position column to the books table for user-customizable ordering
ALTER TABLE "homework-tracker_book" ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

-- Optional: Initialize position values based on current order (if needed)
-- UPDATE "homework-tracker_book" SET position = id;
