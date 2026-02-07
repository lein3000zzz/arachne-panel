import mainPage from "../../public/index.html"
import {sendRun} from "./handlers";

const server = Bun.serve({
    port: 3003,
    routes: {
        "/": mainPage,

        "/api/health": () => {
            return new Response("OK", { status: 200 });
        },

        "/api/runs/send": async (req: Request) => sendRun(req),

        "/api/*": Response.json({ message: "Not found" }, { status: 404 }),
    }
});

export { server };