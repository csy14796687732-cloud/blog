import type { Context } from 'hono';

export function successResponse(c: Context, data?: unknown, message = '操作成功', status = 200) {
  return c.json(
    {
      success: true,
      message,
      data,
    },
    status,
  );
}

export function errorResponse(c: Context, message: string, status = 400) {
  return c.json(
    {
      success: false,
      message,
    },
    status,
  );
}
