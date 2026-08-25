-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CV` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'My CV',
    `template` VARCHAR(191) NOT NULL DEFAULT 'modern',
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `CV_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PersonalInfo` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `summary` VARCHAR(191) NULL,
    `jobTitle` VARCHAR(191) NULL,
    `profileImage` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `github` VARCHAR(191) NULL,
    `portfolio` VARCHAR(191) NULL,
    `cvId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `PersonalInfo_cvId_key`(`cvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Education` (
    `id` VARCHAR(191) NOT NULL,
    `degree` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `startDate` VARCHAR(191) NULL,
    `endDate` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `cvId` VARCHAR(191) NOT NULL,

    INDEX `Education_cvId_idx`(`cvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Experience` (
    `id` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `startDate` VARCHAR(191) NULL,
    `endDate` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `cvId` VARCHAR(191) NOT NULL,

    INDEX `Experience_cvId_idx`(`cvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skill` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NULL,
    `cvId` VARCHAR(191) NOT NULL,

    INDEX `Skill_cvId_idx`(`cvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `technologies` VARCHAR(191) NULL,
    `projectUrl` VARCHAR(191) NULL,
    `startDate` VARCHAR(191) NULL,
    `endDate` VARCHAR(191) NULL,
    `cvId` VARCHAR(191) NOT NULL,

    INDEX `Project_cvId_idx`(`cvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certification` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `organization` VARCHAR(191) NULL,
    `issueDate` VARCHAR(191) NULL,
    `expiryDate` VARCHAR(191) NULL,
    `credentialId` VARCHAR(191) NULL,
    `credentialUrl` VARCHAR(191) NULL,
    `cvId` VARCHAR(191) NOT NULL,

    INDEX `Certification_cvId_idx`(`cvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Language` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `proficiency` VARCHAR(191) NULL,
    `cvId` VARCHAR(191) NOT NULL,

    INDEX `Language_cvId_idx`(`cvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UploadedCV` (
    `id` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `filePath` VARCHAR(191) NULL,
    `extractedText` LONGTEXT NULL,
    `parsedData` JSON NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'uploaded',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `cvId` VARCHAR(191) NOT NULL,

    INDEX `UploadedCV_cvId_idx`(`cvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIContent` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `originalText` TEXT NULL,
    `generatedText` TEXT NULL,
    `model` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'generated',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cvId` VARCHAR(191) NOT NULL,

    INDEX `AIContent_cvId_idx`(`cvId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CV` ADD CONSTRAINT `CV_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PersonalInfo` ADD CONSTRAINT `PersonalInfo_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Education` ADD CONSTRAINT `Education_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Experience` ADD CONSTRAINT `Experience_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Skill` ADD CONSTRAINT `Skill_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certification` ADD CONSTRAINT `Certification_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Language` ADD CONSTRAINT `Language_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UploadedCV` ADD CONSTRAINT `UploadedCV_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AIContent` ADD CONSTRAINT `AIContent_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `CV`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
