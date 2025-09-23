/*
  Warnings:

  - You are about to drop the column `contactName` on the `Bot` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `Bot` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "welcomeMessage" TEXT NOT NULL,
    "settings" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Bot" ("createdAt", "id", "isActive", "projectId", "settings", "slug", "title", "updatedAt", "welcomeMessage") SELECT "createdAt", "id", "isActive", "projectId", "settings", "slug", "title", "updatedAt", "welcomeMessage" FROM "Bot";
DROP TABLE "Bot";
ALTER TABLE "new_Bot" RENAME TO "Bot";
CREATE UNIQUE INDEX "Bot_slug_key" ON "Bot"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
