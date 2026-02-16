import { HttpInterceptorFn } from '@angular/common/http';

const API_BASE = 'https://tictactoe-backend-production-8a7e.up.railway.app';

/** Añade JWT en header Authorization para peticiones al backend (cross-origin cuando la cookie no se envía). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_BASE)) return next(req);
  const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('token') : null;
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
