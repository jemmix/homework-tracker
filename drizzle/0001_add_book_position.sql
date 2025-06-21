-- Add a position column to the books table for user-customizable ordering
ALTER TABLE books ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

-- Optional: Initialize position values based on current order (if needed)
-- UPDATE books SET position = id;
