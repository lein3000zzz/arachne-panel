import * as sessionService from "@/app/services/sessions"
import {NotFoundError} from "@errors";
import type {Handler, Mdlwr} from "@utils";

export function rateLimiter(req: Request, server: Bun.Server<any>, handle: Handler | Mdlwr): Response | Promise<Response> {
    const sockAddr = server.requestIP(req)

    if (!sockAddr?.address) {

    }

    const flag = sessionService.checkRateLim(ip)

    if (!flag) {

    }

    return handle(req)
}