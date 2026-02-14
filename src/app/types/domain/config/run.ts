export type ExtraTaskFlags = {
    should_screenshot: boolean;
    parse_rendered_html: boolean;
}

export type RunStatus = "queued" | "failed" | "ready";

export type Run = {
    id: string;
    status: RunStatus;
} & RunCfg;

export type RunCfg = {
    start_url: string;
    max_depth: number;
    max_links: number;
    use_cache_flag: boolean;
    extra_flags?: ExtraTaskFlags;
}