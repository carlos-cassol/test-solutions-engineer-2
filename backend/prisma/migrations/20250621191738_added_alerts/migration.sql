-- CreateTable
CREATE TABLE "process_alerts" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "alertMessage" TEXT NOT NULL,
    "alertLevel" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_alerts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "process_alerts" ADD CONSTRAINT "process_alerts_processId_fkey" FOREIGN KEY ("processId") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
