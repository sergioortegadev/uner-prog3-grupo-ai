import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import * as authService from '../services/auth.service.ts';
import * as usuariosModel from '../database/usuarios.ts';
import { ERROR_CODES } from '../helpers/errors.helper.ts';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'contrasenia',
      session: false,
    },
    async (email, password, done) => {
      try {
        const result = await authService.login(email, password);
        return done(null, result);
      } catch (error) {
        if (
          error.code === ERROR_CODES.UNAUTHORIZED.code ||
          error.status === ERROR_CODES.UNAUTHORIZED.status
        ) {
          return done(null, false, { message: error.message || ERROR_CODES.UNAUTHORIZED.message });
        }
        return done(error);
      }
    },
  ),
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'secret',
    },
    async (jwt_payload, done) => {
      try {
        if (!jwt_payload || !jwt_payload.id) {
          return done(null, false);
        }

        // Validar que el usuario exista y esté activo
        const user = await usuariosModel.findById(jwt_payload.id);
        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

export default passport;
