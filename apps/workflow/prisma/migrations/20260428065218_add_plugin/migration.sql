-- CreateEnum
CREATE TYPE "PluginCategory" AS ENUM ('AI', 'INTEGRATION', 'DATA', 'MEDIA', 'UTILITY', 'COMMUNICATION');

-- CreateEnum
CREATE TYPE "PluginStatus" AS ENUM ('PENDING', 'PUBLISHED', 'SUSPENDED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "PluginVersionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "plugins" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "category" "PluginCategory" NOT NULL DEFAULT 'INTEGRATION',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "status" "PluginStatus" NOT NULL DEFAULT 'PENDING',
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT,
    "homepage" TEXT,
    "repository" TEXT,
    "latestVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_versions" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nodes" JSONB NOT NULL,
    "manifestUrl" TEXT NOT NULL,
    "executorUrl" TEXT NOT NULL,
    "componentsUrl" TEXT,
    "changelog" TEXT,
    "status" "PluginVersionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "pluginId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_installations" (
    "id" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "pluginId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_installations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plugins_pluginId_key" ON "plugins"("pluginId");

-- CreateIndex
CREATE INDEX "plugins_category_idx" ON "plugins"("category");

-- CreateIndex
CREATE INDEX "plugins_status_idx" ON "plugins"("status");

-- CreateIndex
CREATE INDEX "plugins_authorId_idx" ON "plugins"("authorId");

-- CreateIndex
CREATE INDEX "plugins_downloadCount_idx" ON "plugins"("downloadCount");

-- CreateIndex
CREATE INDEX "plugin_versions_pluginId_idx" ON "plugin_versions"("pluginId");

-- CreateIndex
CREATE INDEX "plugin_versions_status_idx" ON "plugin_versions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_versions_pluginId_version_key" ON "plugin_versions"("pluginId", "version");

-- CreateIndex
CREATE INDEX "plugin_installations_pluginId_idx" ON "plugin_installations"("pluginId");

-- CreateIndex
CREATE INDEX "plugin_installations_userId_idx" ON "plugin_installations"("userId");

-- CreateIndex
CREATE INDEX "plugin_installations_isEnabled_idx" ON "plugin_installations"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_installations_pluginId_userId_key" ON "plugin_installations"("pluginId", "userId");

-- AddForeignKey
ALTER TABLE "plugins" ADD CONSTRAINT "plugins_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_versions" ADD CONSTRAINT "plugin_versions_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_installations" ADD CONSTRAINT "plugin_installations_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_installations" ADD CONSTRAINT "plugin_installations_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "plugin_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin_installations" ADD CONSTRAINT "plugin_installations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
