import * as userRepo from "@/app/repos/users";
import type {User} from "@/app/types";
import {logger} from "@lib";

export async function registerUser(username: string, password: string): Promise<User> {
    const user = await userRepo.register({username, passwordRaw: password});
    logger.info("registerUser success", user);

    return user;
}

export async function loginUser(username: string, password: string): Promise<User> {
    const user = await userRepo.login(username, password);
    logger.info("loginUser success", user);

    return user;
}