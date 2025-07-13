"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const services_1 = __importDefault(require("./routes/services"));
const gigs_1 = __importDefault(require("./routes/gigs"));
const messages_1 = __importDefault(require("./routes/messages"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const categories_1 = __importDefault(require("./routes/categories"));
dotenv_1.default.config();
console.log('Environment variables check:', {
    hasDatabase: !!process.env.DATABASE_URL,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    hasJwtSecret: !!process.env.JWT_SECRET,
    port: process.env.PORT
});
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/services', services_1.default);
app.use('/api/gigs', gigs_1.default);
app.use('/api/messages', messages_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/categories', categories_1.default);
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
const start = async () => {
    try {
        await prisma.$connect();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        console.error('Unable to start the server:', error);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map