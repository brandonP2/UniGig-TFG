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

// Get all conversations for current user
router.get('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: {
          where: {
            NOT: {
              id: userId,
            },
          },
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            content: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      user: conv.participants[0],
      lastMessage: conv.messages[0]?.content || '',
      updatedAt: conv.updatedAt,
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// Get messages for a specific conversation
router.get('/:conversationId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Send a message
router.post(
  '/',
  authenticateToken,
  [
    body('content').notEmpty().withMessage('Message content is required'),
    body('conversationId').notEmpty().withMessage('Conversation ID is required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { content, conversationId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if user is part of the conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: {
            some: {
              id: userId,
            },
          },
        },
      });

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const message = await prisma.message.create({
        data: {
          content,
          senderId: userId,
          conversationId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update conversation updatedAt
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Error sending message' });
    }
  }
);

// Create a new conversation
router.post(
  '/conversations',
  authenticateToken,
  [body('participantId').notEmpty().withMessage('Participant ID is required')],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { participantId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if conversation already exists
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            {
              participants: {
                some: {
                  id: userId,
                },
              },
            },
            {
              participants: {
                some: {
                  id: participantId,
                },
              },
            },
          ],
        },
      });

      if (existingConversation) {
        return res.json(existingConversation);
      }

      // Create new conversation
      const conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: userId }, { id: participantId }],
          },
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(500).json({ message: 'Error creating conversation' });
    }
  }
);

export default router; 