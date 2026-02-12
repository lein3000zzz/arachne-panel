import { crawlerPg } from "@/app/db";
import { logger, ensureExists } from "@utils";
import {type User, type UserWithExtra} from "@/app/types";
import {AlreadyExistsError, UnexpectedError} from "@errors";

interface CreateUserParams {
    username: string;
    passwordRaw: string;
    hasAccess?: boolean;
}

export async function register({ username, passwordRaw, hasAccess = false }: CreateUserParams): Promise<User> {
    const id = Bun.randomUUIDv7();
    const password_hash = await Bun.password.hash(passwordRaw);

    try {
        const [user] = await crawlerPg<User[]>`
            INSERT INTO users ${crawlerPg({
                id,
                username,
                password_hash,
                has_access: hasAccess
            })} RETURNING id, username, has_access AS "hasAccess", created_at AS "createdAt", updated_at AS "updatedAt"
        `;

        logger.info(`User ${username} created successfully.`);

        return ensureExists(user, `Failed to create user ${username}.`);
    } catch (error: any) {
        if (error.code === '23505') {
            logger.warn(`Registration failed for username ${username}: username already exists.`);
            throw new AlreadyExistsError("Username already taken.");
        }
        logger.error(`Error creating user ${username}: ${error}`);
        throw new UnexpectedError("An unexpected error occurred during registration.");
    }
}

export async function login(username: string, passwordRaw: string): Promise<User> {
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