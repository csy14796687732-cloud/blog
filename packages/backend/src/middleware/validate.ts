import type { Context, Next } from 'hono';
import type { ZodSchema } from 'zod';
import { HTTPException } from 'hono/http-exception';

export function validate(schema: ZodSchema, source: 'json' | 'query' = 'json') {
  return async (c: Context, next: Next) => {
    const data = source === 'json' ? await c.req.json() : c.req.query();
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new HTTPException(400, {
        message: '数据验证失败',
      });
    }

    c.set('validated', result.data);
    await next();
  };
}
