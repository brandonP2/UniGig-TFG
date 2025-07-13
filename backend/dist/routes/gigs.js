"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('budget').isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
    (0, express_validator_1.body)('categoryId').notEmpty().withMessage('Category is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, budget, categoryId } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.id;
        const client = await prisma.client.findUnique({
            where: { userId },
        });
        if (!client) {
            return res.status(403).json({ message: 'Only clients can create gigs' });
        }
        const gig = await prisma.gig.create({
            data: {
                title,
                description,
                budget: parseFloat(budget),
                status: 'OPEN',
                clientId: client.id,
                categoryId,
            },
            include: {
                client: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                category: true,
            },
        });
        await prisma.activityLogs.create({
            data: {
                action: 'GIG_CREATED',
                userId: req.user.id,
                gigId: gig.id,
            },
        });
        res.status(201).json(gig);
    }
    catch (error) {
        console.error('Error creating gig:', error);
        res.status(500).json({ message: 'Error creating gig' });
    }
});
router.get('/', async (req, res) => {
    try {
        const { status, search, minBudget, maxBudget } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (minBudget || maxBudget) {
            where.budget = {};
            if (minBudget)
                where.budget.gte = parseFloat(minBudget);
            if (maxBudget)
                where.budget.lte = parseFloat(maxBudget);
        }
        const gigs = await prisma.gig.findMany({
            where,
            include: {
                client: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.json(gigs);
    }
    catch (error) {
        console.error('Error fetching gigs:', error);
        res.status(500).json({ message: 'Error fetching gigs' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const gig = await prisma.gig.findUnique({
            where: { id },
            include: {
                client: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                category: true,
                activityLogs: {
                    include: {
                        review: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        if (!gig) {
            return res.status(404).json({ message: 'Gig not found' });
        }
        res.json(gig);
    }
    catch (error) {
        console.error('Error fetching gig:', error);
        res.status(500).json({ message: 'Error fetching gig' });
    }
});
router.patch('/:id/status', auth_1.authenticateToken, [(0, express_validator_1.body)('status').isIn(['IN_PROGRESS', 'COMPLETED', 'CANCELLED'])], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { status } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.id;
        const gig = await prisma.gig.findFirst({
            where: {
                id,
                OR: [
                    {
                        client: {
                            userId,
                        },
                    },
                    {
                        category: {
                            students: {
                                some: {
                                    userId,
                                },
                            },
                        },
                    },
                ],
            },
        });
        if (!gig) {
            return res.status(404).json({ message: 'Gig not found or unauthorized' });
        }
        const updatedGig = await prisma.gig.update({
            where: { id },
            data: { status },
            include: {
                client: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                category: true,
            },
        });
        await prisma.activityLogs.create({
            data: {
                action: `GIG_STATUS_CHANGED_TO_${status}`,
                userId: req.user.id,
                gigId: gig.id,
            },
        });
        res.json(updatedGig);
    }
    catch (error) {
        console.error('Error updating gig status:', error);
        res.status(500).json({ message: 'Error updating gig status' });
    }
});
router.post('/:id/apply', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.id;
        const student = await prisma.student.findUnique({
            where: { userId },
        });
        if (!student) {
            return res.status(403).json({ message: 'Only students can apply for gigs' });
        }
        const gig = await prisma.gig.findFirst({
            where: {
                id,
                status: 'OPEN',
            },
            include: {
                client: {
                    include: {
                        user: true
                    }
                }
            }
        });
        if (!gig) {
            return res.status(404).json({ message: 'Gig not found or not open for applications' });
        }
        await prisma.activityLogs.create({
            data: {
                action: 'STUDENT_APPLIED',
                userId: req.user.id,
                gigId: gig.id,
            },
        });
        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    connect: [
                        { id: userId },
                        { id: gig.client.user.id },
                    ],
                },
                messages: {
                    create: {
                        content: `I would like to apply for your gig: ${gig.title}`,
                        senderId: userId,
                    },
                },
            },
        });
        res.status(200).json({ message: 'Application submitted successfully' });
    }
    catch (error) {
        console.error('Error applying for gig:', error);
        res.status(500).json({ message: 'Error applying for gig' });
    }
});
router.put('/:id', auth_1.authenticateToken, [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('budget').isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
    (0, express_validator_1.body)('categoryId').notEmpty().withMessage('Category is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { title, description, budget, categoryId } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.id;
        const existingGig = await prisma.gig.findFirst({
            where: {
                id,
                client: {
                    userId,
                },
            },
        });
        if (!existingGig) {
            return res.status(404).json({ message: 'Gig not found or unauthorized' });
        }
        const updatedGig = await prisma.gig.update({
            where: { id },
            data: {
                title,
                description,
                budget: parseFloat(budget),
                categoryId,
            },
            include: {
                client: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                category: true,
            },
        });
        await prisma.activityLogs.create({
            data: {
                action: 'GIG_UPDATED',
                userId: req.user.id,
                gigId: id,
            },
        });
        res.json(updatedGig);
    }
    catch (error) {
        console.error('Error updating gig:', error);
        res.status(500).json({ message: 'Error updating gig' });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.id;
        const existingGig = await prisma.gig.findFirst({
            where: {
                id,
                client: {
                    userId,
                },
            },
        });
        if (!existingGig) {
            return res.status(404).json({ message: 'Gig not found or unauthorized' });
        }
        await prisma.activityLogs.deleteMany({
            where: {
                gigId: id,
            },
        });
        await prisma.gig.delete({
            where: { id },
        });
        res.json({ message: 'Gig deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting gig:', error);
        res.status(500).json({ message: 'Error deleting gig' });
    }
});
exports.default = router;
//# sourceMappingURL=gigs.js.map