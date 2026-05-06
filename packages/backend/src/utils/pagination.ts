import type { Context } from 'hono';

export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
}

export function getPaginationParams(c: Context): PaginationParams {
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(c.req.query('pageSize') || '10', 10)));
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    success: true,
    message: '获取成功',
    data: {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
