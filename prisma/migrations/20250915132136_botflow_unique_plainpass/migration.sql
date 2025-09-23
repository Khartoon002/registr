-- AlterTable
ALTER TABLE "Downline" ADD COLUMN "passwordPlain" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "welcomeMessage" TEXT NOT NULL,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Bot" ("createdAt", "id", "isActive", "projectId", "settings", "slug", "title", "updatedAt", "welcomeMessage") SELECT "createdAt", "id", "isActive", "projectId", coalesce("settings", '{}') AS "settings", "slug", "title", "updatedAt", "welcomeMessage" FROM "Bot";
DROP TABLE "Bot";
ALTER TABLE "new_Bot" RENAME TO "Bot";
CREATE UNIQUE INDEX "Bot_slug_key" ON "Bot"("slug");
CREATE TABLE "new_BotFlow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "botId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "steps" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BotFlow_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BotFlow" ("botId", "createdAt", "id", "steps", "version") SELECT "botId", "createdAt", "id", "steps", "version" FROM "BotFlow";
DROP TABLE "BotFlow";
ALTER TABLE "new_BotFlow" RENAME TO "BotFlow";
CREATE UNIQUE INDEX "BotFlow_botId_version_key" ON "BotFlow"("botId", "version");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
