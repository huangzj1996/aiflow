/*
  Warnings:

  - You are about to drop the column `publishedWorkflowId` on the `apps` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `workflows` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `workflows` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "apps" DROP CONSTRAINT "apps_publishedWorkflowId_fkey";

-- AlterTable
ALTER TABLE "apps" DROP COLUMN "publishedWorkflowId",
ADD COLUMN     "activePublishedId" TEXT;

-- AlterTable
ALTER TABLE "workflows" DROP COLUMN "isPublished",
DROP COLUMN "publishedAt";

-- CreateTable
CREATE TABLE "published_apps" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "nodes" JSONB NOT NULL,
    "edges" JSONB NOT NULL,
    "appId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedBy" TEXT,

    CONSTRAINT "published_apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_executions" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "inputs" JSONB,
    "outputs" JSONB,
    "error" TEXT,
    "duration" INTEGER,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "nodeTraces" JSONB,
    "publishedAppId" TEXT NOT NULL,
    "apiKeyId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "app_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "published_apps_appId_idx" ON "published_apps"("appId");

-- CreateIndex
CREATE INDEX "published_apps_version_idx" ON "published_apps"("version");

-- CreateIndex
CREATE UNIQUE INDEX "published_apps_appId_version_key" ON "published_apps"("appId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "app_executions_executionId_key" ON "app_executions"("executionId");

-- CreateIndex
CREATE INDEX "app_executions_publishedAppId_idx" ON "app_executions"("publishedAppId");

-- CreateIndex
CREATE INDEX "app_executions_apiKeyId_idx" ON "app_executions"("apiKeyId");

-- CreateIndex
CREATE INDEX "app_executions_status_idx" ON "app_executions"("status");

-- CreateIndex
CREATE INDEX "app_executions_startedAt_idx" ON "app_executions"("startedAt");

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_activePublishedId_fkey" FOREIGN KEY ("activePublishedId") REFERENCES "published_apps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "published_apps" ADD CONSTRAINT "published_apps_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_executions" ADD CONSTRAINT "app_executions_publishedAppId_fkey" FOREIGN KEY ("publishedAppId") REFERENCES "published_apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_executions" ADD CONSTRAINT "app_executions_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;
