export interface ExtraTaskFlags {
    should_screenshot: boolean;
    parse_rendered_html: boolean;
}

export interface Run {
    id: string;
    start_url: string;
    max_depth: number;
    max_links: number;
    use_cache_flag: boolean;
    extra_flags?: ExtraTaskFlags;
}