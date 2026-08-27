CREATE TABLE "Duel" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "hostId" TEXT NOT NULL,
  "guestId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'WAITING',
  "questionIds" TEXT[] NOT NULL,
  "hostIndex" INTEGER NOT NULL DEFAULT 0,
  "guestIndex" INTEGER NOT NULL DEFAULT 0,
  "hostScore" INTEGER NOT NULL DEFAULT 0,
  "guestScore" INTEGER NOT NULL DEFAULT 0,
  "hostCorrect" INTEGER NOT NULL DEFAULT 0,
  "guestCorrect" INTEGER NOT NULL DEFAULT 0,
  "hostFinishedAt" TIMESTAMP(3),
  "guestFinishedAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Duel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Duel_code_key" ON "Duel"("code");
CREATE INDEX "Duel_hostId_idx" ON "Duel"("hostId");
CREATE INDEX "Duel_guestId_idx" ON "Duel"("guestId");
CREATE INDEX "Duel_expiresAt_idx" ON "Duel"("expiresAt");
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
