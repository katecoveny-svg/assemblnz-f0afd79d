import type { ToolErrorBody, ToolErrorCode } from './types';

export class ToolHttpError extends Error {
  readonly status: number;
  readonly code: ToolErrorCode;
  readonly fix: string;
  readonly details?: unknown;

  constructor(opts: {
    status: number;
    code: ToolErrorCode;
    message: string;
    fix: string;
    details?: unknown;
  }) {
    super(opts.message);
    this.name = 'ToolHttpError';
    this.status = opts.status;
    this.code = opts.code;
    this.fix = opts.fix;
    this.details = opts.details;
  }

  toJSON(): ToolErrorBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        fix: this.fix,
        ...(this.details !== undefined ? { details: this.details } : {}),
      },
    };
  }
}

export function toolErrorResponse(err: ToolHttpError): Response {
  return Response.json(err.toJSON(), {
    status: err.status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    },
  });
}
