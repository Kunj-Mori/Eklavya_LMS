-- AlterTable
ALTER TABLE `Assessment` ADD COLUMN `aiContent` JSON NULL,
    ADD COLUMN `isAIGenerated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `resultsPublished` BOOLEAN NOT NULL DEFAULT false;
