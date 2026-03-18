-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "gender" TEXT;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL DEFAULT 'COMPANY',
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "inn" TEXT,
    "kpp" TEXT,
    "ogrn" TEXT,
    "address" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "bankName" TEXT,
    "bankBik" TEXT,
    "bankAccount" TEXT,
    "correspondentAccount" TEXT,
    "directorName" TEXT,
    "directorPosition" TEXT,
    "directorGender" TEXT,
    "basis" TEXT,
    "directorPositionGenitive" TEXT,
    "directorNameGenitive" TEXT,
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
    "companyId" TEXT,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "contractDate" DATETIME,
    "actDate" DATETIME,
    "invoiceDate" DATETIME,
    "pricePerDayRub" INTEGER NOT NULL DEFAULT 0,
    "priceRub" INTEGER NOT NULL,
    "tenantName" TEXT,
    "tenantPassport" TEXT,
    "tenantAddress" TEXT,
    "companyKind" TEXT,
    "companyName" TEXT,
    "companyShortName" TEXT,
    "companyInn" TEXT,
    "companyKpp" TEXT,
    "companyOgrn" TEXT,
    "companyAddress" TEXT,
    "companyEmail" TEXT,
    "companyPhone" TEXT,
    "companyBankName" TEXT,
    "companyBankBik" TEXT,
    "companyBankAccount" TEXT,
    "companyCorrespondentAccount" TEXT,
    "companyDirectorName" TEXT,
    "companyDirectorPosition" TEXT,
    "companyDirectorGender" TEXT,
    "companyBasis" TEXT,
    "companyDirectorPositionGenitive" TEXT,
    "companyDirectorNameGenitive" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_propertyCode_fkey" FOREIGN KEY ("propertyCode") REFERENCES "Property" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Contract_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Contract" ("checkIn", "checkOut", "createdAt", "id", "number", "pricePerDayRub", "priceRub", "propertyCode", "seq", "tenantAddress", "tenantId", "tenantName", "tenantPassport", "type", "updatedAt", "year") SELECT "checkIn", "checkOut", "createdAt", "id", "number", "pricePerDayRub", "priceRub", "propertyCode", "seq", "tenantAddress", "tenantId", "tenantName", "tenantPassport", "type", "updatedAt", "year" FROM "Contract";
DROP TABLE "Contract";
ALTER TABLE "new_Contract" RENAME TO "Contract";
CREATE UNIQUE INDEX "Contract_number_key" ON "Contract"("number");
CREATE INDEX "Contract_year_seq_idx" ON "Contract"("year", "seq");
CREATE INDEX "Contract_companyId_idx" ON "Contract"("companyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "Company"("name");
