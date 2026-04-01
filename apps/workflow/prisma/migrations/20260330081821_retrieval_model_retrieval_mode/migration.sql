/*
  Warnings:

  - You are about to drop the column `retrievalModel` on the `knowledge_bases` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "knowledge_bases" DROP COLUMN "retrievalModel",
ADD COLUMN     "retrievalMode" "RetrievalMode" NOT NULL DEFAULT 'VECTOR';
