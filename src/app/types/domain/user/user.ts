export type User = {
    id: string;
    username: string;
    hasAccess: boolean;
};

export type UserWithExtra = User & {
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
};