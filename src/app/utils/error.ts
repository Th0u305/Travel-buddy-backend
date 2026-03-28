import { HTTPException } from 'hono/http-exception';

// 404 Not Found
export class NotFoundError extends HTTPException {
    constructor(message: string = 'The requested resource was not found.') {
        super(404, { message });
    }
}

// 400 Bad Request
export class BadRequestError extends HTTPException {
    constructor(message: string = 'Invalid request data provided.') {
        super(400, { message });
    }
}

// 401 Unauthorized
export class UnauthorizedError extends HTTPException {
    constructor(message: string = 'You must be logged in to access this.') {
        super(401, { message });
    }
}