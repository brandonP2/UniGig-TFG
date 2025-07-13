"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('comment').optional().isString().withMessage('Comment must be a string'),
    (0, express_validator_1.body)('activityLogId').notEmpty().withMessage('Activity log ID is required'),
], async (req, res) => {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { rating, comment, activityLogId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const activityLog = await prisma.activityLogs.findFirst({
            where: {
                id: activityLogId,
                userId,
            },
        });
        if (!activityLog) {
            return res.status(404).json({ message: 'Activity log not found or unauthorized' });
        }
        const existingReview = await prisma.review.findUnique({
            where: { activityLogId },
        });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already exists for this activity' });
        }
        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                activityLogId,
            },
            include: {
                activityLog: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        res.status(201).json(review);
    }
    catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Error creating review' });
    }
});
router.get('/gig/:gigId', async (req, res) => {
    try {
        const { gigId } = req.params;
        const reviews = await prisma.review.findMany({
            where: {
                activityLog: {
                    gigId,
                },
            },
            include: {
                activityLog: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(reviews);
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
});
exports.default = router;
//# sourceMappingURL=reviews.js.map