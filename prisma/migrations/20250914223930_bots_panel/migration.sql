-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BotFlow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "botId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
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
