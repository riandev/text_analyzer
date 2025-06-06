import { Router } from "express";
import passport from "passport";
import { signAccessToken } from "../middlewares/shared/jwt_helper.js";
import { renderLoginPage } from "../modules/frontend/Frontend.controller.js";
import { logger } from "../utils/logger.js";

const router = Router();

router.get("/login", (req, res) => {
  renderLoginPage(req, res);
});
router.get(
  "/auth/login",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=Authentication failed",
    failureMessage: true,
  }),
  async (req, res) => {
    try {
      logger.info(`User authenticated: ${req.user?.email}`);

      if (req.user) {
        const accessToken = await signAccessToken(
          req.user.id,
          req.user.role || "user"
        );

        res.cookie("access_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000,
        });

        logger.info(
          `Access token generated and set in cookie for user: ${req.user.email}`
        );
      }

      if (req.session) {
        req.session.messages = { success: "Login successful!" };
      }

      res.redirect("/");
    } catch (error) {
      logger.error(`Error generating access token: ${error}`);
      res.redirect("/login?error=Authentication failed");
    }
  }
);

router.get("/auth/failure", (req, res) => {
  logger.warn("Authentication failed");
  if (req.session) {
    req.session.messages = {
      error: "Authentication failed. Please try again.",
    };
  }
  res.redirect("/login");
});

router.get("/auth/logout", (req, res, next) => {
  logger.info(`User logging out: ${req.user?.email}`);
  req.logout((err) => {
    if (err) {
      logger.error(`Logout error: ${err}`);
      return next(err);
    }
    if (req.session) {
      req.session.messages = { success: "You have been logged out." };
    }
    res.redirect("/login");
  });
});

router.get("/auth/profile", async (req, res) => {
  if (req.isAuthenticated()) {
    const frontendController = await import(
      "../modules/frontend/Frontend.controller.js"
    );
    return frontendController.renderProfilePage(req, res);
  }

  return res.status(401).json({
    success: false,
    message: "Not authenticated",
  });
});

export default router;
