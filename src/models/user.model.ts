export interface User {
    email: string;
    password: string;
    role: RolesEnum;
}

export enum RolesEnum {
    USER = 'user',
    ADMIN = 'admin'
}

