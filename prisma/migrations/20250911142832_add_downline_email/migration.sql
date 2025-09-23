/*
  Warnings:

  - You are about to drop the column `deleted` on the `Downline` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Downline` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Downline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "uniqueCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Downline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Downline_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Downline" ("createdAt", "fullName", "id", "packageId", "passwordHash", "phone", "projectId", "uniqueCode", "username") SELECT "createdAt", "fullName", "id", "packageId", "passwordHash", "phone", "projectId", "uniqueCode", "username" FROM "Downline";
DROP TABLE "Downline";
ALTER TABLE "new_Downline" RENAME TO "Downline";
CREATE UNIQUE INDEX "Downline_username_key" ON "Downline"("username");
CREATE UNIQUE INDEX "Downline_uniqueCode_key" ON "Downline"("uniqueCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
