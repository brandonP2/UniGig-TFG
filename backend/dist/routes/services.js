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
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('categoryId').notEmpty().withMessage('Category is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, price, categoryId } = req.body;
        const userId = req.user.id;
        const student = await prisma.student.findUnique({
            where: { userId },
        });
        if (!student) {
            return res.status(403).json({ message: 'Only students can create services' });
        }
        const service = await prisma.service.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                studentId: student.id,
                categoryId,
            },
            include: {
                category: true,
                student: {
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
        res.status(201).json(service);
    }
    catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Error creating service' });
    }
});
router.get('/', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;
        const where = {};
        if (category) {
            where.categoryId = category;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseFloat(minPrice);
            if (maxPrice)
                where.price.lte = parseFloat(maxPrice);
        }
        const services = await prisma.service.findMany({
            where,
            include: {
                category: true,
                student: {
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
        res.json(services);
    }
    catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Error fetching services' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const service = await prisma.service.findUnique({
            where: { id },
            include: {
                category: true,
                student: {
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
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    }
    catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Error fetching service' });
    }
});
router.put('/:id', auth_1.authenticateToken, [
    (0, express_validator_1.body)('title').optional().notEmpty().withMessage('Title cannot be empty'),
    (0, express_validator_1.body)('description').optional().notEmpty().withMessage('Description cannot be empty'),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('categoryId').optional().notEmpty().withMessage('Category cannot be empty'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const userId = req.user.id;
        const existingService = await prisma.service.findFirst({
            where: {
                id,
                student: {
                    userId,
                },
            },
        });
        if (!existingService) {
            return res.status(404).json({ message: 'Service not found or unauthorized' });
        }
        const service = await prisma.service.update({
            where: { id },
            data: req.body,
            include: {
                category: true,
                student: {
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
        res.json(service);
    }
    catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Error updating service' });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const existingService = await prisma.service.findFirst({
            where: {
                id,
                student: {
                    userId,
                },
            },
        });
        if (!existingService) {
            return res.status(404).json({ message: 'Service not found or unauthorized' });
        }
        await prisma.service.delete({
            where: { id },
        });
        res.json({ message: 'Service deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Error deleting service' });
    }
});
exports.default = router;
//# sourceMappingURL=services.js.map