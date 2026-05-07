import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

export async function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        message: err.message,
      },
      err.status as ContentfulStatusCode,
    );
  }

  console.error('Unhandled error:', err);
  return c.json(
    {
      success: false,
      message: '服务器内部错误',
    },
    500 as ContentfulStatusCode,
  );
}

export async function notFoundHandler(c: Context) {
  return c.json(
    {
      success: false,
      message: '请求的资源不存在',
    },
    404 as ContentfulStatusCode,
  );
}
