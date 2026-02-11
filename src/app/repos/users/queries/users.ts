import { crawlerPg } from "../db";
import { logger, ensureExists } from "@lib";
import {type User, type UserWithExtra} from "@/app/types";

interface CreateUserParams {
    username: string;
    passwordRaw: string;
    hasAccess?: boolean;
}

async function register({ username, passwordRaw, hasAccess = false }: CreateUserParams): Promise<User> {
    const id = Bun.randomUUIDv7();
    const password_hash = await Bun.password.hash(passwordRaw);

    const [user] = await crawlerPg<User[]>`
        INSERT INTO users ${crawlerPg({ id, username, password_hash, has_access: hasAccess })}
        RETURNING id, username, has_access AS "hasAccess", created_at AS "createdAt", updated_at AS "updatedAt"
    `;

    logger.info(`User ${username} created successfully.`);

    return ensureExists(user, `Failed to create user ${username}.`);
}

async function login(username: string, passwordRaw: string): Promise<User> {
    const [user] = await crawlerPg<UserWithExtra[]>`
        SELECT id, username, password_hash, has_access AS "hasAccess", created_at AS "createdAt", updated_at AS "updatedAt"
        FROM users
        WHERE username = ${username}
    `;

    if (!user) {
        logger.warn(`Login failed for username ${username}: user not found.`);
        throw new Error("Invalid username or password");
    }

    const isPasswordValid = await Bun.password.verify(passwordRaw, user.passwordHash);

    if (!isPasswordValid) {
        logger.warn(`Login failed for username ${username}: invalid password.`);
        throw new Error("Invalid username or password.");
    }

    logger.info(`User ${username} logged in successfully.`);

    return {
        id: user.id,
        username: user.username,
        hasAccess: user.hasAccess,
    };
}