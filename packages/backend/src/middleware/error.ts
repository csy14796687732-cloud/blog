import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export async function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status,
    );
  }

  console.error('Unhandled error:', err);
  return c.json(
    {
      success: false,
      message: '服务器内部错误',
    },
    500,
  );
}

export async function notFoundHandler(c: Context) {
  return c.json(
    {
      success: false,
      message: '请求的资源不存在',
    },
    404,
  );
}
