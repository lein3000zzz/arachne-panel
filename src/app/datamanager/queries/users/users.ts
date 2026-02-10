import { crawlerPg } from "../../db";
import { logger, ensureExists } from "../../../../lib";
import { type User } from "../../../types";

interface CreateUserParams {
    username: string;
    passwordRaw: string;
    hasAccess?: boolean;
}

async function createUser({ username, passwordRaw, hasAccess = false }: CreateUserParams): Promise<User> {
    const id = Bun.randomUUIDv7();
    const password_hash = await Bun.password.hash(passwordRaw);

    const [user] = await crawlerPg<User[]>`
        INSERT INTO users ${crawlerPg({ id, username, password_hash, has_access: hasAccess })}
        RETURNING id, username, has_access AS "hasAccess", created_at AS "createdAt", updated_at AS "updatedAt"
    `;

    logger.info(`User ${username} created successfully.`);

    return ensureExists(user, `Failed to create user ${username}.`);
}