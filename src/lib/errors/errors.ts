export class AlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AlreadyExistsError";
    }
}

export class UnexpectedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UnexpectedError";
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}

export class RateLimitExceededError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RateLimitExceededError";
    }
}