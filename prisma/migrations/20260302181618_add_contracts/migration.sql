-- CreateTable
CREATE TABLE "ContractCounter" (
    "year" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "last" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "seq" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "propertyCode" TEXT NOT NULL,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "priceRub" INTEGER NOT NULL,
    "tenantName" TEXT,
    "tenantPassport" TEXT,
    "tenantAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contract_propertyCode_fkey" FOREIGN KEY ("propertyCode") REFERENCES "Property" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_number_key" ON "Contract"("number");

-- CreateIndex
CREATE INDEX "Contract_year_seq_idx" ON "Contract"("year", "seq");
