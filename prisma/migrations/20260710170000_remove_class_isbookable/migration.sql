-- Bookability is derived from time (bookingOpensAt) rather than stored,
-- so the manual toggle is removed. See rezervo mirage-feedback response.
ALTER TABLE "Class" DROP COLUMN "isBookable";
