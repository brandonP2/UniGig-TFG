import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const router = Router();
const prisma = new PrismaClient();

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        student: {
          select: {
            university: true,
            major: true,
            graduationYear: true,
          },
        },
        client: {
          select: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, ...profileData } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    if (user.role === 'STUDENT') {
      await prisma.student.update({
        where: { userId },
        data: {
          university: profileData.university,
          major: profileData.major,
          graduationYear: parseInt(profileData.graduationYear),
        },
      });
    } else if (user.role === 'CLIENT') {
      await prisma.client.update({
        where: { userId },
        data: {
          company: profileData.company,
        },
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

export default router; 