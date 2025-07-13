"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const _b = req.body, { name } = _b, profileData = __rest(_b, ["name"]);
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
        }
        else if (user.role === 'CLIENT') {
            await prisma.client.update({
                where: { userId },
                data: {
                    company: profileData.company,
                },
            });
        }
        res.json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map