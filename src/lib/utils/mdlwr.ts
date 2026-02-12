export type Handler = (req: Request) => Response | Promise<Response>;
export type Mdlwr = (req: Request, server: Bun.Server<any>) => Response | Promise<Response>;