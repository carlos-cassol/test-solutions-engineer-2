-- CreateEnum
CREATE TYPE "ProcessType" AS ENUM ('MAINTENANCE', 'FINANCIAL', 'SUPPLY');

-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'OVERDUE', 'AT_RISK');

-- CreateEnum
CREATE TYPE "StageKey" AS ENUM ('R', 'I', 'D', 'E', 'C');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "AIInsightType" AS ENUM ('PREDICTION', 'ANOMALY', 'RECOMMENDATION');

-- CreateTable
CREATE TABLE "processes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ProcessType" NOT NULL,
    "vehicleId" TEXT,
    "currentStage" "StageKey" NOT NULL,
    "status" "ProcessStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "predictedCompletionTime" TIMESTAMP(3),
    "riskScore" DOUBLE PRECISION,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_stages" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "stageKey" "StageKey" NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "sla" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_events" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_insights" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "type" "AIInsightType" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "process_stages_processId_stageKey_key" ON "process_stages"("processId", "stageKey");

-- AddForeignKey
ALTER TABLE "process_stages" ADD CONSTRAINT "process_stages_processId_fkey" FOREIGN KEY ("processId") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_events" ADD CONSTRAINT "process_events_processId_fkey" FOREIGN KEY ("processId") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_processId_fkey" FOREIGN KEY ("processId") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
