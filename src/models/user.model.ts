export interface User {
    id?: number;
    email: string;
    password: string;
    role: RolesEnum;
}

export enum RolesEnum {
    USER = 'user',
    ADMIN = 'admin'
}

