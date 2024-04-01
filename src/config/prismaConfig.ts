import { PrismaClient } from "@prisma/client";

// Instatntiate a global prisma client

const prismaClient = new PrismaClient();

export default prismaClient;
