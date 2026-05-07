import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../shared/validations/index.js';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
} from '../services/auth.service';
import { successResponse } from '../utils/response';

const router = new Hono();

router.post('/register', validate(registerSchema), async (c) => {
  const data = c.get('validated');
  const result = await registerUser(data);
  return successResponse(c, result, '注册成功', 201);
});

router.post('/login', validate(loginSchema), async (c) => {
  const data = c.get('validated');
  const result = await loginUser(data.email, data.password);
  return successResponse(c, result, '登录成功');
});

router.post('/logout', authMiddleware, async (c) => {
  return successResponse(c, null, '已退出登录');
});

router.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const user = await getCurrentUser(userId);
  return successResponse(c, user);
});

router.put('/profile', authMiddleware, validate(updateProfileSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.get('validated');
  const user = await updateProfile(userId, data);
  return successResponse(c, user, '资料已更新');
});

router.put('/password', authMiddleware, validate(changePasswordSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.get('validated');
  await changePassword(userId, data.current_password, data.new_password);
  return successResponse(c, null, '密码已修改');
});

export { router as authRouter };
