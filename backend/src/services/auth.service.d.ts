import { RegisterInput, LoginInput } from '../validations/auth.validation';
export declare const register: (data: RegisterInput) => Promise<{
    user: {
        id: string;
        name: string;
        email: string;
        storageUsed: number;
    };
    token: string;
}>;
export declare const login: (data: LoginInput) => Promise<{
    user: {
        id: string;
        name: string;
        email: string;
        storageUsed: number;
    };
    token: string;
}>;
export declare const getMe: (userId: string) => Promise<{
    id: string;
    name: string;
    email: string;
    storageUsed: number;
}>;
//# sourceMappingURL=auth.service.d.ts.map