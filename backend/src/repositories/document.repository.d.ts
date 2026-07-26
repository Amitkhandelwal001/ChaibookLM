import { Prisma } from '@prisma/client';
export declare const createDocument: (data: Prisma.DocumentUncheckedCreateInput) => Promise<{
    id: string;
    title: string;
    type: string;
    url: string;
    size: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getDocumentsByUser: (userId: string) => Promise<{
    id: string;
    title: string;
    type: string;
    url: string;
    size: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare const getDocumentById: (id: string, userId: string) => Promise<{
    id: string;
    title: string;
    type: string;
    url: string;
    size: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare const deleteDocument: (id: string, userId: string) => Promise<Prisma.BatchPayload>;
//# sourceMappingURL=document.repository.d.ts.map