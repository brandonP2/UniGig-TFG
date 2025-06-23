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

// Create a review
router.post(
  '/',
  authenticateToken,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
    body('activityLogId').notEmpty().withMessage('Activity log ID is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { rating, comment, activityLogId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if the activity log exists and belongs to the user
      const activityLog = await prisma.activityLogs.findFirst({
        where: {
          id: activityLogId,
          userId,
        },
      });

      if (!activityLog) {
        return res.status(404).json({ message: 'Activity log not found or unauthorized' });
      }

      // Check if a review already exists for this activity log
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
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Error creating review' });
    }
  }
);

// Get reviews for a specific gig
router.get('/gig/:gigId', async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

export default router; 