"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminReviewService = exports.certificateService = exports.authService = exports.draftService = exports.submissionService = exports.profileService = exports.userService = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
exports.userService = {
    async findOrCreateByWallet(walletAddress, data) {
        return exports.prisma.user.upsert({
            where: { walletAddress },
            update: data ? { ...data, updatedAt: new Date() } : { updatedAt: new Date() },
            create: {
                walletAddress,
                email: data?.email,
                name: data?.name,
                company: data?.company,
            },
            include: { profile: true }
        });
    },
    async getByWallet(walletAddress) {
        return exports.prisma.user.findUnique({
            where: { walletAddress },
            include: { profile: true }
        });
    },
    async update(walletAddress, data) {
        return exports.prisma.user.update({
            where: { walletAddress },
            data: { ...data, updatedAt: new Date() },
            include: { profile: true }
        });
    }
};
exports.profileService = {
    async create(userId, data) {
        return exports.prisma.profile.upsert({
            where: { userId },
            update: {
                ...data,
                updatedAt: new Date()
            },
            create: {
                userId,
                ...data
            }
        });
    },
    async getByWallet(walletAddress) {
        return exports.prisma.profile.findUnique({
            where: { walletAddress }
        });
    },
    async update(walletAddress, data) {
        return exports.prisma.profile.update({
            where: { walletAddress },
            data: { ...data, updatedAt: new Date() }
        });
    }
};
function mapStatusToPrismaEnum(status) {
    const statusMap = {
        'draft': 'DRAFT',
        'pending': 'PENDING',
        'under_review': 'UNDER_REVIEW',
        'under review': 'UNDER_REVIEW',
        'approved': 'APPROVED',
        'rejected': 'REJECTED'
    };
    return statusMap[status.toLowerCase()];
}
exports.submissionService = {
    async create(userId, data) {
        return exports.prisma.submission.create({
            data: {
                userId,
                ...data,
                files: data.files ? {
                    create: data.files
                } : undefined
            },
            include: {
                files: true,
                adminReview: true,
                certificate: true,
                user: {
                    select: {
                        walletAddress: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    },
    async getById(id) {
        return exports.prisma.submission.findUnique({
            where: { id },
            include: {
                files: true,
                adminReview: true,
                certificate: true,
                user: {
                    select: {
                        walletAddress: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    },
    async getByUser(walletAddress, options) {
        const where = {
            user: { walletAddress }
        };
        if (options?.status) {
            const mappedStatus = mapStatusToPrismaEnum(options.status);
            if (mappedStatus) {
                where.status = mappedStatus;
            }
        }
        const [submissions, total] = await Promise.all([
            exports.prisma.submission.findMany({
                where,
                include: {
                    files: true,
                    adminReview: true,
                    certificate: true,
                    user: {
                        select: {
                            walletAddress: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { submittedAt: 'desc' },
                take: options?.limit || 10,
                skip: options?.offset || 0
            }),
            exports.prisma.submission.count({ where })
        ]);
        return {
            submissions,
            total,
            hasMore: (options?.offset || 0) + (options?.limit || 10) < total
        };
    },
    async getAll(options) {
        const where = {};
        if (options?.status) {
            const mappedStatus = mapStatusToPrismaEnum(options.status);
            if (mappedStatus) {
                where.status = mappedStatus;
            }
        }
        const [submissions, total] = await Promise.all([
            exports.prisma.submission.findMany({
                where,
                include: {
                    files: true,
                    adminReview: true,
                    certificate: true,
                    user: {
                        select: {
                            walletAddress: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { submittedAt: 'desc' },
                take: options?.limit || 10,
                skip: options?.offset || 0
            }),
            exports.prisma.submission.count({ where })
        ]);
        return {
            submissions,
            total,
            hasMore: (options?.offset || 0) + (options?.limit || 10) < total
        };
    },
    async update(id, data) {
        const { adminNotes, status, ...submissionData } = data;
        if (status) {
            const mappedStatus = mapStatusToPrismaEnum(status);
            if (mappedStatus) {
                submissionData.status = mappedStatus;
            }
        }
        if (adminNotes !== undefined) {
            await exports.prisma.adminReview.upsert({
                where: { submissionId: id },
                update: { notes: adminNotes },
                create: {
                    submissionId: id,
                    notes: adminNotes
                }
            });
        }
        return exports.prisma.submission.update({
            where: { id },
            data: { ...submissionData, updatedAt: new Date() },
            include: {
                files: true,
                adminReview: true,
                certificate: true,
                user: {
                    select: {
                        walletAddress: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    },
    async delete(id) {
        return exports.prisma.submission.delete({
            where: { id }
        });
    }
};
exports.draftService = {
    async create(userId, data) {
        return exports.prisma.draft.create({
            data: {
                userId,
                ...data,
                files: data.files ? {
                    create: data.files
                } : undefined
            },
            include: {
                files: true
            }
        });
    },
    async getById(id) {
        return exports.prisma.draft.findUnique({
            where: { id },
            include: {
                files: true,
                user: {
                    select: {
                        walletAddress: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    },
    async getByUser(walletAddress, options) {
        const [drafts, total] = await Promise.all([
            exports.prisma.draft.findMany({
                where: {
                    user: { walletAddress }
                },
                include: {
                    files: true
                },
                orderBy: { updatedAt: 'desc' },
                take: options?.limit || 10,
                skip: options?.offset || 0
            }),
            exports.prisma.draft.count({
                where: {
                    user: { walletAddress }
                }
            })
        ]);
        return {
            drafts,
            total,
            hasMore: (options?.offset || 0) + (options?.limit || 10) < total
        };
    },
    async update(id, data) {
        return exports.prisma.draft.update({
            where: { id },
            data: { ...data, updatedAt: new Date() },
            include: {
                files: true
            }
        });
    },
    async delete(id) {
        return exports.prisma.draft.delete({
            where: { id }
        });
    }
};
exports.authService = {
    async createChallenge(walletAddress, challenge, expiresAt) {
        return exports.prisma.authChallenge.create({
            data: {
                walletAddress,
                challenge,
                expiresAt
            }
        });
    },
    async getChallenge(challenge) {
        return exports.prisma.authChallenge.findUnique({
            where: { challenge }
        });
    },
    async deleteChallenge(challenge) {
        return exports.prisma.authChallenge.delete({
            where: { challenge }
        });
    },
    async createSession(walletAddress, token, expiresAt) {
        return exports.prisma.authSession.create({
            data: {
                walletAddress,
                token,
                expiresAt
            }
        });
    },
    async getSession(token) {
        return exports.prisma.authSession.findUnique({
            where: { token }
        });
    },
    async deleteSession(token) {
        return exports.prisma.authSession.delete({
            where: { token }
        });
    },
    async cleanupExpired() {
        const now = new Date();
        await Promise.all([
            exports.prisma.authSession.deleteMany({
                where: { expiresAt: { lt: now } }
            }),
            exports.prisma.authChallenge.deleteMany({
                where: { expiresAt: { lt: now } }
            })
        ]);
    }
};
exports.certificateService = {
    async create(submissionId, userId, data) {
        return exports.prisma.certificate.create({
            data: {
                submissionId,
                userId,
                ...data
            },
            include: {
                submission: {
                    include: {
                        user: {
                            select: {
                                walletAddress: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
    },
    async getByHash(certificateHash) {
        return exports.prisma.certificate.findUnique({
            where: { certificateHash },
            include: {
                submission: {
                    include: {
                        user: {
                            select: {
                                walletAddress: true,
                                name: true,
                                email: true
                            }
                        },
                        files: true
                    }
                }
            }
        });
    },
    async getByUser(walletAddress) {
        return exports.prisma.certificate.findMany({
            where: {
                user: { walletAddress }
            },
            include: {
                submission: {
                    include: {
                        files: true
                    }
                }
            },
            orderBy: { issuedAt: 'desc' }
        });
    }
};
exports.adminReviewService = {
    async upsert(submissionId, data) {
        return exports.prisma.adminReview.upsert({
            where: { submissionId },
            update: {
                ...data,
                reviewedAt: new Date()
            },
            create: {
                submissionId,
                ...data,
                reviewedAt: new Date()
            }
        });
    },
    async getBySubmission(submissionId) {
        return exports.prisma.adminReview.findUnique({
            where: { submissionId }
        });
    }
};
//# sourceMappingURL=database.js.map