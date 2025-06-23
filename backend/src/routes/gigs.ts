import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const router = Router();
const prisma = new PrismaClient();

// Create a new gig
router.post(
  '/',
  authenticateToken,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('budget').isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
    body('categoryId').notEmpty().withMessage('Category is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, budget, categoryId } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const userId = req.user.id;

      // Get client profile
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

      // Create activity log
      await prisma.activityLogs.create({
        data: {
          action: 'GIG_CREATED',
          userId: req.user.id,
          gigId: gig.id,
        },
      });

      res.status(201).json(gig);
    } catch (error) {
      console.error('Error creating gig:', error);
      res.status(500).json({ message: 'Error creating gig' });
    }
  }
);

// Get all gigs with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search, minBudget, maxBudget } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (minBudget || maxBudget) {
      where.budget = {};
      if (minBudget) where.budget.gte = parseFloat(minBudget as string);
      if (maxBudget) where.budget.lte = parseFloat(maxBudget as string);
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
  } catch (error) {
    console.error('Error fetching gigs:', error);
    res.status(500).json({ message: 'Error fetching gigs' });
  }
});

// Get a specific gig
router.get('/:id', async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching gig:', error);
    res.status(500).json({ message: 'Error fetching gig' });
  }
});

// Update gig status
router.patch(
  '/:id/status',
  authenticateToken,
  [body('status').isIn(['IN_PROGRESS', 'COMPLETED', 'CANCELLED'])],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const userId = req.user.id;

      // Check if gig exists and user is authorized
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

      // Create activity log
      await prisma.activityLogs.create({
        data: {
          action: `GIG_STATUS_CHANGED_TO_${status}`,
          userId: req.user.id,
          gigId: gig.id,
        },
      });

      res.json(updatedGig);
    } catch (error) {
      console.error('Error updating gig status:', error);
      res.status(500).json({ message: 'Error updating gig status' });
    }
  }
);

// Apply for a gig
router.post(
  '/:id/apply',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const userId = req.user.id;

      // Check if user is a student
      const student = await prisma.student.findUnique({
        where: { userId },
      });

      if (!student) {
        return res.status(403).json({ message: 'Only students can apply for gigs' });
      }

      // Check if gig exists and is open
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

      // Create activity log for the application
      await prisma.activityLogs.create({
        data: {
          action: 'STUDENT_APPLIED',
          userId: req.user.id,
          gigId: gig.id,
        },
      });

      // Create a conversation between the student and client
      const conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [
              { id: userId },
              { id: gig.client.user.id }, // Connect with the client's user ID
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
    } catch (error) {
      console.error('Error applying for gig:', error);
      res.status(500).json({ message: 'Error applying for gig' });
    }
  }
);

// Update a gig
router.put(
  '/:id',
  authenticateToken,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('budget').isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
    body('categoryId').notEmpty().withMessage('Category is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, description, budget, categoryId } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const userId = req.user.id;

      // Check if gig exists and user is the owner
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

      // Create activity log
      await prisma.activityLogs.create({
        data: {
          action: 'GIG_UPDATED',
          userId: req.user.id,
          gigId: id,
        },
      });

      res.json(updatedGig);
    } catch (error) {
      console.error('Error updating gig:', error);
      res.status(500).json({ message: 'Error updating gig' });
    }
  }
);

// Delete a gig
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const userId = req.user.id;

      // Check if gig exists and user is the owner
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

      // Delete associated activity logs first
      await prisma.activityLogs.deleteMany({
        where: {
          gigId: id,
        },
      });

      // Delete the gig
      await prisma.gig.delete({
        where: { id },
      });

      res.json({ message: 'Gig deleted successfully' });
    } catch (error) {
      console.error('Error deleting gig:', error);
      res.status(500).json({ message: 'Error deleting gig' });
    }
  }
);

export default router;