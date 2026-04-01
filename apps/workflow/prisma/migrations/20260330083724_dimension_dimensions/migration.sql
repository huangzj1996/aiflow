/*
  Warnings:

  - You are about to drop the column `dimension` on the `knowledge_bases` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "knowledge_bases" DROP COLUMN "dimension",
ADD COLUMN     "dimensions" INTEGER NOT NULL DEFAULT 1024;
