/*
  Warnings:

  - You are about to drop the column `meterId` on the `ProductionEntry` table. All the data in the column will be lost.
  - You are about to alter the column `weightId` on the `ProductionEntry` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- DropForeignKey
ALTER TABLE `ProductionEntry` DROP FOREIGN KEY `ProductionEntry_meterId_fkey`;

-- DropForeignKey
ALTER TABLE `ProductionEntry` DROP FOREIGN KEY `ProductionEntry_weightId_fkey`;

-- AlterTable
ALTER TABLE `ProductionEntry` DROP COLUMN `meterId`,
    ADD COLUMN `lengthMeter` DOUBLE NULL,
    MODIFY `weightId` DOUBLE NULL;
