export function ensureExists<T>(item: T | undefined, message = "Record not found"): T {
    if (!item) throw new Error(message);
    return item;
}