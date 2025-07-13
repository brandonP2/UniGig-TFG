"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/conversations', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const formattedConversations = conversations.map((conv) => {
            var _a;
            return ({
                id: conv.id,
                user: conv.participants[0],
                lastMessage: ((_a = conv.messages[0]) === null || _a === void 0 ? void 0 : _a.content) || '',
                updatedAt: conv.updatedAt,
            });
        });
        res.json(formattedConversations);
    }
    catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
});
router.get('/:conversationId', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { conversationId } = req.params;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
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
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('content').notEmpty().withMessage('Message content is required'),
    (0, express_validator_1.body)('conversationId').notEmpty().withMessage('Conversation ID is required'),
], async (req, res) => {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { content, conversationId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
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
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});
router.post('/conversations', auth_1.authenticateToken, [(0, express_validator_1.body)('participantId').notEmpty().withMessage('Participant ID is required')], async (req, res) => {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { participantId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
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
    }
    catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ message: 'Error creating conversation' });
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map