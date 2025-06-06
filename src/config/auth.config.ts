// i put here static keys which not profession. i put there so that you can easily test the application
export default {
  oauth: {
    clientID:
      "221128330752-5rbsso7ajfe7d4lms78a4skgbtgomh0o.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3001/auth/callback",
    authorizationURL: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenURL: "https://oauth2.googleapis.com/token",
    scope: ["profile", "email"],
    state: true,
  },
  session: {
    secret: "text-analyzer-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
};
