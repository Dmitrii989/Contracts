-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fio" TEXT NOT NULL,
    "birthDate" DATETIME,
    "passportSeries" TEXT,
    "passportNumber" TEXT,
    "passportIssuedBy" TEXT,
    "passportCode" TEXT,
    "passportIssuedAt" DATETIME,
    "regAddress" TEXT,
    "signInitials" TEXT,
    "signSurname" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "seq" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "propertyCode" TEXT NOT NULL,
    "tenantId" TEXT,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "priceRub" INTEGER NOT NULL,
    "tenantName" TEXT,
    "tenantPassport" TEXT,
    "tenantAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_propertyCode_fkey" FOREIGN KEY ("propertyCode") REFERENCES "Property" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Contract" ("checkIn", "checkOut", "createdAt", "id", "number", "priceRub", "propertyCode", "seq", "tenantAddress", "tenantName", "tenantPassport", "type", "updatedAt", "year") SELECT "checkIn", "checkOut", "createdAt", "id", "number", "priceRub", "propertyCode", "seq", "tenantAddress", "tenantName", "tenantPassport", "type", "updatedAt", "year" FROM "Contract";
DROP TABLE "Contract";
ALTER TABLE "new_Contract" RENAME TO "Contract";
CREATE UNIQUE INDEX "Contract_number_key" ON "Contract"("number");
CREATE INDEX "Contract_year_seq_idx" ON "Contract"("year", "seq");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
