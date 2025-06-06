import { Request, Response } from "express";
import "express-session";
import mongoose from "mongoose";
import { analyzeText } from "../../services/analyzer.service.js";
import { logger } from "../../utils/logger.js";
import Text from "../text/Text.model.js";

declare module "express-session" {
  interface SessionData {
    messages?: Record<string, string>;
  }
}

export const renderHomePage = (req: Request, res: Response): void => {
  logger.info("Rendering home page");
  res.render("home", {
    title: "Home",
    active: "home",
    user: req.user || null,
    messages: req.session?.messages || {},
  });
};

export const renderAnalyzerPage = (req: Request, res: Response): void => {
  logger.info("Rendering analyzer page");
  res.render("analyzer", {
    title: "Text Analyzer",
    active: "analyzer",
    user: req.user || null,
    messages: req.session?.messages || {},
  });
};

export const renderHistoryPage = async (
  req: Request,
  res: Response
): Promise<void> => {
  logger.info("Rendering history page");

  try {
    let texts: any[] = [];
    if (req.isAuthenticated() && req.user) {
      texts = await Text.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(20);
      texts = texts.map((text) => {
        const textObj = text.toObject();
        return {
          ...textObj,
          analysis: {
            word_count: textObj.word_count,
            character_count: textObj.character_count,
            sentence_count: textObj.sentence_count,
            paragraph_count: textObj.paragraph_count,
            longest_word: textObj.longest_word,
          },
        };
      });
    }

    res.render("history", {
      title: "Analysis History",
      active: "history",
      user: req.user || null,
      texts,
      messages: req.session?.messages || {},
    });
  } catch (error) {
    logger.error(`Error fetching history: ${error}`);
    res.render("history", {
      title: "Analysis History",
      active: "history",
      user: req.user || null,
      texts: [],
      messages: { error: "Failed to load history" },
    });
  }
};

export const renderLoginPage = (req: Request, res: Response): void => {
  logger.info("Rendering login page");

  if (req.session) {
    const messages = req.session.messages || {};
    res.render("login", {
      title: "Login",
      active: "login",
      user: null,
      messages,
    });
  }
};

export const renderProfilePage = async (
  req: Request,
  res: Response
): Promise<void> => {
  logger.info("Rendering profile page");

  if (!req.isAuthenticated() || !req.user) {
    if (req.session) {
      req.session.messages = {
        error: "You must be logged in to view your profile",
      };
    }
    return res.redirect("/login");
  }

  try {
    const userId = req.user.id;
    const analysisCount = await Text.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
    });
    const lastText = await Text.findOne({
      user: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });
    const lastActivity = lastText ? lastText.get("createdAt") : null;

    res.render("profile", {
      title: "User Profile",
      active: "profile",
      user: req.user,
      analysisCount: analysisCount || 0,
      lastActivity: lastActivity ? lastActivity.createdAt : null,
      messages: req.session?.messages || {},
    });

    if (req.session && req.session.messages) {
      req.session.messages = {};
    }
  } catch (error) {
    logger.error(`Error fetching profile data: ${error}`);
    if (req.session) {
      req.session.messages = { error: "Failed to load profile data" };
    }
    res.render("profile", {
      title: "User Profile",
      active: "profile",
      user: req.user,
      analysisCount: 0,
      lastActivity: null,
      messages: req.session?.messages || {
        error: "Failed to load profile data",
      },
    });
  }
};

export const processTextAnalysis = (req: Request, res: Response): Response => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    const analysis = analyzeText(text);

    if (analysis.error) {
      return res.status(400).json({
        success: false,
        message: analysis.error,
      });
    }

    return res.json({
      success: true,
      data: {
        word_count: analysis.wordCount,
        character_count: analysis.characterCount,
        sentence_count: analysis.sentenceCount,
        paragraph_count: analysis.paragraphCount,
        longest_word: analysis.longestWord[0],
      },
    });
  } catch (error) {
    logger.error(`Error in processTextAnalysis: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error processing text analysis",
    });
  }
};
