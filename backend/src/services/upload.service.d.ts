export declare const processFileUpload: (userId: string, file: Express.Multer.File) => Promise<{
    id: string;
    title: string;
    type: string;
    url: string;
    size: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const fetchUserDocuments: (userId: string) => Promise<{
    id: string;
    title: string;
    type: string;
    url: string;
    size: number;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}[]>;
//# sourceMappingURL=upload.service.d.ts.map