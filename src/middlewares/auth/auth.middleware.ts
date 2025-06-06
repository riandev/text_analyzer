import { NextFunction, Request, Response } from "express";
import passport from "passport";
import {
  Profile as GoogleProfile,
  Strategy as GoogleStrategy,
} from "passport-google-oauth20";
import authConfig from "../../config/auth.config.js";
import User from "../../modules/users/Users.model.js";
import { logger } from "../../utils/logger.js";

interface OAuthUser {
  id: string;
  displayName: string;
  email: string;
  provider: string;
  role?: string;
}

declare global {
  namespace Express {
    interface User extends OAuthUser {}
  }
}

passport.use(
  // @ts-ignore - GoogleStrategy doesn't fully implement Strategy interface but works with Passport
  new GoogleStrategy(
    {
      clientID: authConfig.oauth.clientID,
      clientSecret: authConfig.oauth.clientSecret,
      callbackURL: authConfig.oauth.callbackURL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        logger.info(`OAuth profile received: ${JSON.stringify(profile)}`);
        const email =
          profile.emails && profile.emails[0] && profile.emails[0].value;

        if (!email) {
          logger.error("No email found in OAuth profile");
          return done(new Error("No email found in OAuth profile"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          logger.info(`Creating new user for email: ${email}`);

          user = await User.create({
            email,
            name: profile._json.name || email.split("@")[0],
            role: "user",
            provider: "oauth2",
          });
        }

        const oauthUser: OAuthUser = {
          id: user._id ? user._id.toString() : user.id,
          displayName: user.name,
          email: user.email,
          provider: "oauth2",
          role: user.role,
        };

        logger.info(`User authenticated: ${oauthUser.email}`);
        return done(null, oauthUser);
      } catch (error) {
        logger.error(`Authentication error: ${error}`);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error("User not found"), null);
    }

    const oauthUser: OAuthUser = {
      id: user._id ? user._id.toString() : user.id,
      displayName: user.name,
      email: user.email,
      provider: "oauth2",
      role: user.role,
    };

    done(null, oauthUser);
  } catch (error) {
    done(error, null);
  }
});

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }

  if (req.path.startsWith("/api/")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  res.redirect("/login");
};

export const isDashboardAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Admin access required",
  });
};

export default passport;
