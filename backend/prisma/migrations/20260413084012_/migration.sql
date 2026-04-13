-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'operator',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `basePrice` DOUBLE NOT NULL DEFAULT 120.0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Item_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Color` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `hexCode` VARCHAR(191) NULL,

    UNIQUE INDEX `Color_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Size` (
    `id` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Size_value_key`(`value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quality` (
    `id` VARCHAR(191) NOT NULL,
    `grade` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Quality_grade_key`(`grade`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeightConfig` (
    `id` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'Standard',
    `isStandard` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `WeightConfig_value_type_key`(`value`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MeterConfig` (
    `id` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'Industrial',

    UNIQUE INDEX `MeterConfig_value_type_key`(`value`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `expectedDate` DATETIME(3) NULL,
    `internalNotes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SalesOrder_orderNumber_key`(`orderNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LineItem` (
    `id` VARCHAR(191) NOT NULL,
    `salesOrderId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `sizeId` VARCHAR(191) NOT NULL,
    `qualityId` VARCHAR(191) NOT NULL,
    `colorId` VARCHAR(191) NOT NULL,
    `secondaryColorId` VARCHAR(191) NULL,
    `weightId` DOUBLE NOT NULL,
    `lengthMeter` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductionEntry` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'entry',
    `status` VARCHAR(191) NOT NULL DEFAULT 'created',
    `shiftCode` VARCHAR(191) NULL,
    `machineCenter` VARCHAR(191) NULL,
    `operatorId` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NOT NULL,
    `bagsCount` INTEGER NOT NULL DEFAULT 0,
    `batchNumber` VARCHAR(191) NULL,
    `entryDate` DATETIME(3) NULL,
    `itemId` VARCHAR(191) NULL,
    `weightId` VARCHAR(191) NULL,
    `meterId` VARCHAR(191) NULL,
    `sizeId` VARCHAR(191) NULL,
    `qualityId` VARCHAR(191) NULL,
    `colorId` VARCHAR(191) NULL,
    `secondaryColorId` VARCHAR(191) NULL,
    `accentColorId` VARCHAR(191) NULL,
    `salesOrderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductionEntry_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DispatchChallan` (
    `id` VARCHAR(191) NOT NULL,
    `challanNumber` VARCHAR(191) NOT NULL,
    `vehicleNo` VARCHAR(191) NULL,
    `transporter` VARCHAR(191) NULL,
    `driverContact` VARCHAR(191) NULL,
    `destination` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'staged',
    `dispatchDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DispatchChallan_challanNumber_key`(`challanNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DispatchLine` (
    `id` VARCHAR(191) NOT NULL,
    `challanId` VARCHAR(191) NOT NULL,
    `productionId` VARCHAR(191) NULL,
    `batchweightId` DOUBLE NOT NULL DEFAULT 0,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ItemToSize` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ItemToSize_AB_unique`(`A`, `B`),
    INDEX `_ItemToSize_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ItemToQuality` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ItemToQuality_AB_unique`(`A`, `B`),
    INDEX `_ItemToQuality_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ColorToItem` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ColorToItem_AB_unique`(`A`, `B`),
    INDEX `_ColorToItem_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LineItem` ADD CONSTRAINT `LineItem_salesOrderId_fkey` FOREIGN KEY (`salesOrderId`) REFERENCES `SalesOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LineItem` ADD CONSTRAINT `LineItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LineItem` ADD CONSTRAINT `LineItem_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LineItem` ADD CONSTRAINT `LineItem_qualityId_fkey` FOREIGN KEY (`qualityId`) REFERENCES `Quality`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LineItem` ADD CONSTRAINT `LineItem_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_weightId_fkey` FOREIGN KEY (`weightId`) REFERENCES `WeightConfig`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_meterId_fkey` FOREIGN KEY (`meterId`) REFERENCES `MeterConfig`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_qualityId_fkey` FOREIGN KEY (`qualityId`) REFERENCES `Quality`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_secondaryColorId_fkey` FOREIGN KEY (`secondaryColorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_accentColorId_fkey` FOREIGN KEY (`accentColorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductionEntry` ADD CONSTRAINT `ProductionEntry_salesOrderId_fkey` FOREIGN KEY (`salesOrderId`) REFERENCES `SalesOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DispatchLine` ADD CONSTRAINT `DispatchLine_challanId_fkey` FOREIGN KEY (`challanId`) REFERENCES `DispatchChallan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToSize` ADD CONSTRAINT `_ItemToSize_A_fkey` FOREIGN KEY (`A`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToSize` ADD CONSTRAINT `_ItemToSize_B_fkey` FOREIGN KEY (`B`) REFERENCES `Size`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToQuality` ADD CONSTRAINT `_ItemToQuality_A_fkey` FOREIGN KEY (`A`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToQuality` ADD CONSTRAINT `_ItemToQuality_B_fkey` FOREIGN KEY (`B`) REFERENCES `Quality`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ColorToItem` ADD CONSTRAINT `_ColorToItem_A_fkey` FOREIGN KEY (`A`) REFERENCES `Color`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ColorToItem` ADD CONSTRAINT `_ColorToItem_B_fkey` FOREIGN KEY (`B`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
