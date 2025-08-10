import passport from "passport";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as InstagramStrategy } from "passport-instagram-graph";
import { Strategy as SnapchatStrategy } from "passport-snapchat";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupSocialAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Twitter OAuth Strategy
  if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
    passport.use(new TwitterStrategy({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: "/api/auth/twitter/callback"
    }, async (token, tokenSecret, profile, done) => {
      try {
        let user = await storage.getUserBySocialId('twitter', profile.id);
        
        if (!user) {
          user = await storage.createSocialUser({
            twitterId: profile.id,
            twitterUsername: profile.username,
            username: profile.displayName || profile.username,
            profileImageUrl: profile.photos?.[0]?.value,
            email: profile.emails?.[0]?.value,
          });
        } else {
          await storage.updateUserLastLogin(user.id);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // Instagram OAuth Strategy
  if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
    passport.use(new InstagramStrategy({
      clientID: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      callbackURL: "/api/auth/instagram/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserBySocialId('instagram', profile.id);
        
        if (!user) {
          user = await storage.createSocialUser({
            instagramId: profile.id,
            instagramUsername: profile.username,
            username: profile.displayName || profile.username,
            profileImageUrl: profile.photos?.[0]?.value,
          });
        } else {
          await storage.updateUserLastLogin(user.id);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // Snapchat OAuth Strategy
  if (process.env.SNAPCHAT_CLIENT_ID && process.env.SNAPCHAT_CLIENT_SECRET) {
    passport.use(new SnapchatStrategy({
      clientID: process.env.SNAPCHAT_CLIENT_ID,
      clientSecret: process.env.SNAPCHAT_CLIENT_SECRET,
      callbackURL: "/api/auth/snapchat/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserBySocialId('snapchat', profile.id);
        
        if (!user) {
          user = await storage.createSocialUser({
            snapchatId: profile.id,
            snapchatUsername: profile.username,
            username: profile.displayName || profile.username,
            profileImageUrl: profile.photos?.[0]?.value,
          });
        } else {
          await storage.updateUserLastLogin(user.id);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });

  // Social login routes
  app.get('/api/auth/twitter', passport.authenticate('twitter'));
  app.get('/api/auth/twitter/callback', 
    passport.authenticate('twitter', { failureRedirect: '/auth?error=twitter' }),
    (req, res) => {
      res.redirect('/?social=twitter');
    }
  );

  app.get('/api/auth/instagram', passport.authenticate('instagram'));
  app.get('/api/auth/instagram/callback',
    passport.authenticate('instagram', { failureRedirect: '/auth?error=instagram' }),
    (req, res) => {
      res.redirect('/?social=instagram');
    }
  );

  app.get('/api/auth/snapchat', passport.authenticate('snapchat'));
  app.get('/api/auth/snapchat/callback',
    passport.authenticate('snapchat', { failureRedirect: '/auth?error=snapchat' }),
    (req, res) => {
      res.redirect('/?social=snapchat');
    }
  );

  // Combined auth endpoint that works with existing wallet auth
  app.post("/api/social-auth", async (req, res) => {
    const { provider, socialId, username, profileImage, email } = req.body;
    
    if (!provider || !socialId) {
      return res.status(400).json({ message: "Provider and social ID are required" });
    }

    try {
      let user = await storage.getUserBySocialId(provider, socialId);
      
      if (!user) {
        const userData: any = { username, profileImageUrl: profileImage, email };
        userData[`${provider}Id`] = socialId;
        userData[`${provider}Username`] = username;
        
        user = await storage.createSocialUser(userData);
      } else {
        await storage.updateUserLastLogin(user.id);
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        res.json(user);
      });
    } catch (error) {
      res.status(500).json({ message: "Authentication error" });
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });
}