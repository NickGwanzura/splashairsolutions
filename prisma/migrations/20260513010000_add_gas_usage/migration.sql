-- CreateTable
CREATE TABLE "gas_stock" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "gasType" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "remaining" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "supplier" TEXT NOT NULL,
    "supplierRef" TEXT,
    "addedBy" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gas_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gas_usage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "gasType" TEXT NOT NULL,
    "quantityUsed" DECIMAL(10,2) NOT NULL,
    "usedById" TEXT,
    "customerName" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gas_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gas_stock_organizationId_idx" ON "gas_stock"("organizationId");

-- CreateIndex
CREATE INDEX "gas_stock_gasType_idx" ON "gas_stock"("gasType");

-- CreateIndex
CREATE INDEX "gas_usage_organizationId_idx" ON "gas_usage"("organizationId");

-- CreateIndex
CREATE INDEX "gas_usage_jobId_idx" ON "gas_usage"("jobId");

-- CreateIndex
CREATE INDEX "gas_usage_stockId_idx" ON "gas_usage"("stockId");

-- CreateIndex
CREATE INDEX "gas_usage_usedAt_idx" ON "gas_usage"("usedAt");

-- AddForeignKey
ALTER TABLE "gas_stock" ADD CONSTRAINT "gas_stock_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gas_usage" ADD CONSTRAINT "gas_usage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gas_usage" ADD CONSTRAINT "gas_usage_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "gas_stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gas_usage" ADD CONSTRAINT "gas_usage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
