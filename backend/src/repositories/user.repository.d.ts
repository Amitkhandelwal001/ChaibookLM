import { Prisma } from '@prisma/client';
export declare const createUser: (data: Prisma.UserCreateInput) => Promise<{
    id: string;
    email: string;
    password: string;
    name: string;
    storageUsed: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const findUserByEmail: (email: string) => Promise<{
    id: string;
    email: string;
    password: string;
    name: string;
    storageUsed: number;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare const findUserById: (id: string) => Promise<{
    id: string;
    email: string;
    password: string;
    name: string;
    storageUsed: number;
    createdAt: Date;
    updatedAt: Date;
} | null>;
//# sourceMappingURL=user.repository.d.ts.map