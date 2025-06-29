import { PrismaClient } from '@prisma/client';
export declare const prisma: PrismaClient<import("@prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare const userService: {
    findOrCreateByWallet(walletAddress: string, data?: {
        email?: string;
        name?: string;
        company?: string;
    }): Promise<{
        profile: {
            id: string;
            walletAddress: string;
            email: string;
            name: string;
            company: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        } | null;
    } & {
        id: string;
        walletAddress: string;
        email: string | null;
        name: string | null;
        company: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getByWallet(walletAddress: string): Promise<({
        profile: {
            id: string;
            walletAddress: string;
            email: string;
            name: string;
            company: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        } | null;
    } & {
        id: string;
        walletAddress: string;
        email: string | null;
        name: string | null;
        company: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    update(walletAddress: string, data: {
        email?: string;
        name?: string;
        company?: string;
    }): Promise<{
        profile: {
            id: string;
            walletAddress: string;
            email: string;
            name: string;
            company: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        } | null;
    } & {
        id: string;
        walletAddress: string;
        email: string | null;
        name: string | null;
        company: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
export declare const profileService: {
    create(userId: string, data: {
        name: string;
        company?: string;
        email: string;
        walletAddress: string;
    }): Promise<{
        id: string;
        walletAddress: string;
        email: string;
        name: string;
        company: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    getByWallet(walletAddress: string): Promise<{
        id: string;
        walletAddress: string;
        email: string;
        name: string;
        company: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    } | null>;
    update(walletAddress: string, data: {
        name?: string;
        company?: string;
        email?: string;
    }): Promise<{
        id: string;
        walletAddress: string;
        email: string;
        name: string;
        company: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
};
export declare const submissionService: {
    create(userId: string, data: {
        deviceName: string;
        deviceType: string;
        serialNumber: string;
        manufacturer: string;
        model: string;
        yearOfManufacture: string;
        condition: string;
        specifications: string;
        purchasePrice: string;
        currentValue: string;
        expectedRevenue: string;
        operationalCosts: string;
        files?: Array<{
            filename: string;
            path: string;
            size: number;
            mimeType: string;
            documentType: string;
        }>;
    }): Promise<{
        user: {
            walletAddress: string;
            email: string | null;
            name: string | null;
        };
        files: {
            id: string;
            filename: string;
            path: string;
            size: number;
            mimeType: string;
            documentType: string;
            uploadedAt: Date;
            submissionId: string;
        }[];
    } & {
        model: string;
        id: string;
        updatedAt: Date;
        userId: string;
        deviceName: string;
        deviceType: string;
        serialNumber: string;
        manufacturer: string;
        yearOfManufacture: string;
        condition: string;
        specifications: string;
        purchasePrice: string;
        currentValue: string;
        expectedRevenue: string;
        operationalCosts: string;
        status: import("@prisma/client").$Enums.SubmissionStatus;
        submittedAt: Date;
    }>;
    getById(id: string): Promise<({
        user: {
            walletAddress: string;
            email: string | null;
            name: string | null;
        };
        adminReview: {
            id: string;
            notes: string | null;
            technicalScore: number | null;
            regulatoryScore: number | null;
            financialScore: number | null;
            environmentalScore: number | null;
            overallScore: number | null;
            decision: import("@prisma/client").$Enums.AdminDecision | null;
            decisionAt: Date | null;
            reviewedAt: Date;
            submissionId: string;
        } | null;
        certificate: {
            id: string;
            userId: string;
            status: import("@prisma/client").$Enums.CertificateStatus;
            submissionId: string;
            certificateHash: string;
            stellarTxHash: string | null;
            issuedAt: Date;
            expiresAt: Date | null;
        } | null;
        files: {
            id: string;
            filename: string;
            path: string;
            size: number;
            mimeType: string;
            documentType: string;
            uploadedAt: Date;
            submissionId: string;
        }[];
    } & {
        model: string;
        id: string;
        updatedAt: Date;
        userId: string;
        deviceName: string;
        deviceType: string;
        serialNumber: string;
        manufacturer: string;
        yearOfManufacture: string;
        condition: string;
        specifications: string;
        purchasePrice: string;
        currentValue: string;
        expectedRevenue: string;
        operationalCosts: string;
        status: import("@prisma/client").$Enums.SubmissionStatus;
        submittedAt: Date;
    }) | null>;
    getByUser(walletAddress: string, options?: {
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        submissions: ({
            adminReview: {
                id: string;
                notes: string | null;
                technicalScore: number | null;
                regulatoryScore: number | null;
                financialScore: number | null;
                environmentalScore: number | null;
                overallScore: number | null;
                decision: import("@prisma/client").$Enums.AdminDecision | null;
                decisionAt: Date | null;
                reviewedAt: Date;
                submissionId: string;
            } | null;
            certificate: {
                id: string;
                userId: string;
                status: import("@prisma/client").$Enums.CertificateStatus;
                submissionId: string;
                certificateHash: string;
                stellarTxHash: string | null;
                issuedAt: Date;
                expiresAt: Date | null;
            } | null;
            files: {
                id: string;
                filename: string;
                path: string;
                size: number;
                mimeType: string;
                documentType: string;
                uploadedAt: Date;
                submissionId: string;
            }[];
        } & {
            model: string;
            id: string;
            updatedAt: Date;
            userId: string;
            deviceName: string;
            deviceType: string;
            serialNumber: string;
            manufacturer: string;
            yearOfManufacture: string;
            condition: string;
            specifications: string;
            purchasePrice: string;
            currentValue: string;
            expectedRevenue: string;
            operationalCosts: string;
            status: import("@prisma/client").$Enums.SubmissionStatus;
            submittedAt: Date;
        })[];
        total: number;
        hasMore: boolean;
    }>;
    getAll(options?: {
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        submissions: ({
            user: {
                walletAddress: string;
                email: string | null;
                name: string | null;
            };
            adminReview: {
                id: string;
                notes: string | null;
                technicalScore: number | null;
                regulatoryScore: number | null;
                financialScore: number | null;
                environmentalScore: number | null;
                overallScore: number | null;
                decision: import("@prisma/client").$Enums.AdminDecision | null;
                decisionAt: Date | null;
                reviewedAt: Date;
                submissionId: string;
            } | null;
            certificate: {
                id: string;
                userId: string;
                status: import("@prisma/client").$Enums.CertificateStatus;
                submissionId: string;
                certificateHash: string;
                stellarTxHash: string | null;
                issuedAt: Date;
                expiresAt: Date | null;
            } | null;
            files: {
                id: string;
                filename: string;
                path: string;
                size: number;
                mimeType: string;
                documentType: string;
                uploadedAt: Date;
                submissionId: string;
            }[];
        } & {
            model: string;
            id: string;
            updatedAt: Date;
            userId: string;
            deviceName: string;
            deviceType: string;
            serialNumber: string;
            manufacturer: string;
            yearOfManufacture: string;
            condition: string;
            specifications: string;
            purchasePrice: string;
            currentValue: string;
            expectedRevenue: string;
            operationalCosts: string;
            status: import("@prisma/client").$Enums.SubmissionStatus;
            submittedAt: Date;
        })[];
        total: number;
        hasMore: boolean;
    }>;
    update(id: string, data: any): Promise<{
        user: {
            walletAddress: string;
            email: string | null;
            name: string | null;
        };
        adminReview: {
            id: string;
            notes: string | null;
            technicalScore: number | null;
            regulatoryScore: number | null;
            financialScore: number | null;
            environmentalScore: number | null;
            overallScore: number | null;
            decision: import("@prisma/client").$Enums.AdminDecision | null;
            decisionAt: Date | null;
            reviewedAt: Date;
            submissionId: string;
        } | null;
        certificate: {
            id: string;
            userId: string;
            status: import("@prisma/client").$Enums.CertificateStatus;
            submissionId: string;
            certificateHash: string;
            stellarTxHash: string | null;
            issuedAt: Date;
            expiresAt: Date | null;
        } | null;
        files: {
            id: string;
            filename: string;
            path: string;
            size: number;
            mimeType: string;
            documentType: string;
            uploadedAt: Date;
            submissionId: string;
        }[];
    } & {
        model: string;
        id: string;
        updatedAt: Date;
        userId: string;
        deviceName: string;
        deviceType: string;
        serialNumber: string;
        manufacturer: string;
        yearOfManufacture: string;
        condition: string;
        specifications: string;
        purchasePrice: string;
        currentValue: string;
        expectedRevenue: string;
        operationalCosts: string;
        status: import("@prisma/client").$Enums.SubmissionStatus;
        submittedAt: Date;
    }>;
    delete(id: string): Promise<{
        model: string;
        id: string;
        updatedAt: Date;
        userId: string;
        deviceName: string;
        deviceType: string;
        serialNumber: string;
        manufacturer: string;
        yearOfManufacture: string;
        condition: string;
        specifications: string;
        purchasePrice: string;
        currentValue: string;
        expectedRevenue: string;
        operationalCosts: string;
        status: import("@prisma/client").$Enums.SubmissionStatus;
        submittedAt: Date;
    }>;
};
export declare const draftService: {
    create(userId: string, data: {
        deviceName?: string;
        deviceType?: string;
        serialNumber?: string;
        manufacturer?: string;
        model?: string;
        yearOfManufacture?: string;
        condition?: string;
        specifications?: string;
        purchasePrice?: string;
        currentValue?: string;
        expectedRevenue?: string;
        operationalCosts?: string;
        files?: Array<{
            filename: string;
            path: string;
            size: number;
            mimeType: string;
            documentType: string;
        }>;
    }): Promise<{
        files: {
            id: string;
            filename: string;
            path: string;
            size: number;
            mimeType: string;
            documentType: string;
            uploadedAt: Date;
            draftId: string;
        }[];
    } & {
        model: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deviceName: string;
        deviceType: string;
        serialNumber: string;
        manufacturer: string;
        yearOfManufacture: string;
        condition: string;
        specifications: string;
        purchasePrice: string;
        currentValue: string;
        expectedRevenue: string;
        operationalCosts: string;
    }>;
    getById(id: string): Promise<({
        user: {
            walletAddress: string;
            email: string | null;
            name: string | null;
        };
        files: {
            id: string;
            filename: string;
            path: string;
            size: number;
            mimeType: string;
            documentType: string;
            uploadedAt: Date;
            draftId: string;
        }[];
    } & {
        model: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deviceName: string;
        deviceType: string;
        serialNumber: string;
        manufacturer: string;
        yearOfManufacture: string;
        condition: string;
        specifications: string;
        purchasePrice: string;
        currentValue: string;
        expectedRevenue: string;
        operationalCosts: string;
    }) | null>;
    getByUser(walletAddress: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<{
        drafts: ({
            files: {
                id: string;
                filename: string;
                path: string;
                size: number;
                mimeType: string;
                documentType: string;
                uploadedAt: Date;
                draftId: string;
            }[];
        } & {
            model: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            deviceName: string;
            deviceType: string;
            serialNumber: string;
            manufacturer: string;
            yearOfManufacture: string;
            condition: string;
            specifications: string;
            purchasePrice: string;
            currentValue: string;
            expectedRevenue: string;
            operationalCosts: string;
        })[];
        total: number;
        hasMore: boolean;
    }>;
    update(id: string, data: any): Promise<{
        files: {
            id: string;
            filename: string;
            path: string;
            size: number;
            mimeType: string;
            documentType: string;
            uploadedAt: Date;
            draftId: string;
        }[];
    } & {
        model: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deviceName: string;
        deviceType: string;
        serialNumber: string;
        manufacturer: string;
        yearOfManufacture: string;
        condition: string;
        specifications: string;
        purchasePrice: string;
        currentValue: string;
        expectedRevenue: string;
        operationalCosts: string;
    }>;
    delete(id: string): Promise<{
        model: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        deviceName: string;
        deviceType: string;
        serialNumber: string;
        manufacturer: string;
        yearOfManufacture: string;
        condition: string;
        specifications: string;
        purchasePrice: string;
        currentValue: string;
        expectedRevenue: string;
        operationalCosts: string;
    }>;
};
export declare const authService: {
    createChallenge(walletAddress: string, challenge: string, expiresAt: Date): Promise<{
        id: string;
        walletAddress: string;
        createdAt: Date;
        expiresAt: Date;
        challenge: string;
    }>;
    getChallenge(challenge: string): Promise<{
        id: string;
        walletAddress: string;
        createdAt: Date;
        expiresAt: Date;
        challenge: string;
    } | null>;
    deleteChallenge(challenge: string): Promise<{
        id: string;
        walletAddress: string;
        createdAt: Date;
        expiresAt: Date;
        challenge: string;
    }>;
    createSession(walletAddress: string, token: string, expiresAt: Date): Promise<{
        id: string;
        walletAddress: string;
        createdAt: Date;
        expiresAt: Date;
        token: string;
    }>;
    getSession(token: string): Promise<{
        id: string;
        walletAddress: string;
        createdAt: Date;
        expiresAt: Date;
        token: string;
    } | null>;
    deleteSession(token: string): Promise<{
        id: string;
        walletAddress: string;
        createdAt: Date;
        expiresAt: Date;
        token: string;
    }>;
    cleanupExpired(): Promise<void>;
};
export declare const certificateService: {
    create(submissionId: string, userId: string, data: {
        certificateHash: string;
        stellarTxHash?: string;
        expiresAt?: Date;
    }): Promise<{
        submission: {
            user: {
                walletAddress: string;
                email: string | null;
                name: string | null;
            };
        } & {
            model: string;
            id: string;
            updatedAt: Date;
            userId: string;
            deviceName: string;
            deviceType: string;
            serialNumber: string;
            manufacturer: string;
            yearOfManufacture: string;
            condition: string;
            specifications: string;
            purchasePrice: string;
            currentValue: string;
            expectedRevenue: string;
            operationalCosts: string;
            status: import("@prisma/client").$Enums.SubmissionStatus;
            submittedAt: Date;
        };
    } & {
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.CertificateStatus;
        submissionId: string;
        certificateHash: string;
        stellarTxHash: string | null;
        issuedAt: Date;
        expiresAt: Date | null;
    }>;
    getByHash(certificateHash: string): Promise<({
        submission: {
            user: {
                walletAddress: string;
                email: string | null;
                name: string | null;
            };
            files: {
                id: string;
                filename: string;
                path: string;
                size: number;
                mimeType: string;
                documentType: string;
                uploadedAt: Date;
                submissionId: string;
            }[];
        } & {
            model: string;
            id: string;
            updatedAt: Date;
            userId: string;
            deviceName: string;
            deviceType: string;
            serialNumber: string;
            manufacturer: string;
            yearOfManufacture: string;
            condition: string;
            specifications: string;
            purchasePrice: string;
            currentValue: string;
            expectedRevenue: string;
            operationalCosts: string;
            status: import("@prisma/client").$Enums.SubmissionStatus;
            submittedAt: Date;
        };
    } & {
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.CertificateStatus;
        submissionId: string;
        certificateHash: string;
        stellarTxHash: string | null;
        issuedAt: Date;
        expiresAt: Date | null;
    }) | null>;
    getByUser(walletAddress: string): Promise<({
        submission: {
            files: {
                id: string;
                filename: string;
                path: string;
                size: number;
                mimeType: string;
                documentType: string;
                uploadedAt: Date;
                submissionId: string;
            }[];
        } & {
            model: string;
            id: string;
            updatedAt: Date;
            userId: string;
            deviceName: string;
            deviceType: string;
            serialNumber: string;
            manufacturer: string;
            yearOfManufacture: string;
            condition: string;
            specifications: string;
            purchasePrice: string;
            currentValue: string;
            expectedRevenue: string;
            operationalCosts: string;
            status: import("@prisma/client").$Enums.SubmissionStatus;
            submittedAt: Date;
        };
    } & {
        id: string;
        userId: string;
        status: import("@prisma/client").$Enums.CertificateStatus;
        submissionId: string;
        certificateHash: string;
        stellarTxHash: string | null;
        issuedAt: Date;
        expiresAt: Date | null;
    })[]>;
};
export declare const adminReviewService: {
    upsert(submissionId: string, data: {
        notes?: string;
        technicalScore?: number;
        regulatoryScore?: number;
        financialScore?: number;
        environmentalScore?: number;
        overallScore?: number;
        decision?: "APPROVED" | "REJECTED";
        decisionAt?: Date;
    }): Promise<{
        id: string;
        notes: string | null;
        technicalScore: number | null;
        regulatoryScore: number | null;
        financialScore: number | null;
        environmentalScore: number | null;
        overallScore: number | null;
        decision: import("@prisma/client").$Enums.AdminDecision | null;
        decisionAt: Date | null;
        reviewedAt: Date;
        submissionId: string;
    }>;
    getBySubmission(submissionId: string): Promise<{
        id: string;
        notes: string | null;
        technicalScore: number | null;
        regulatoryScore: number | null;
        financialScore: number | null;
        environmentalScore: number | null;
        overallScore: number | null;
        decision: import("@prisma/client").$Enums.AdminDecision | null;
        decisionAt: Date | null;
        reviewedAt: Date;
        submissionId: string;
    } | null>;
};
//# sourceMappingURL=database.d.ts.map