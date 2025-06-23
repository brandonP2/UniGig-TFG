import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

const router = Router();
const prisma = new PrismaClient();

// Create a new service
router.post(
  '/',
  authenticateToken,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('categoryId').notEmpty().withMessage('Category is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, price, categoryId } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;

      // Get student profile
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
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({ message: 'Error creating service' });
    }
  }
);

// Get all services with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;

    const where: any = {};

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
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
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services' });
  }
});

// Get a specific service
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
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Error fetching service' });
  }
});

// Update a service
router.put(
  '/:id',
  authenticateToken,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('categoryId').optional().notEmpty().withMessage('Category cannot be empty'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;

      // Check if service exists and belongs to the user
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
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({ message: 'Error updating service' });
    }
  }
);

// Delete a service
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;

    // Check if service exists and belongs to the user
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
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Error deleting service' });
  }
});

export default router; 