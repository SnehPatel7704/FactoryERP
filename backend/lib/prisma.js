import { PrismaClient } from '@prisma/client';

// Create a single Prisma instance to avoid multiple connections
const prisma = new PrismaClient({});

export default prisma;
