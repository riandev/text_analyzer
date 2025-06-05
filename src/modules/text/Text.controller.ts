import { NextFunction, Request, Response } from "express";
import { JoiError } from "../../helpers/error.js";
import { toObjectId } from "../../helpers/toObjectId.js";
import { clearCache } from "../../middlewares/shared/cache_middleware.js";
import { AuthRequest } from "../../middlewares/shared/jwt_helper.js";
import { analyzeText } from "../../services/analyzer.service.js";
import { ErrorUtils } from "../../utils/errorResponse.js";
import { logger } from "../../utils/logger.js";
import Text from "./Text.model.js";
import { textSchema } from "./Text.validation.js";

interface AuthRequestWithId extends AuthRequest {
  params: {
    id: string;
  };
}

export const AddText = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  if (!req.body) {
    return ErrorUtils.badRequest(res, "Content can not be empty!");
  }
  try {
    if (!req.payload) {
      return ErrorUtils.unauthorized(res);
    }
    const user = req.payload.aud;

    try {
      const result = await textSchema.validateAsync({
        ...req.body,
        user,
      });

      const analysis = analyzeText(result.text);
      if (analysis.error) {
        return ErrorUtils.badRequest(res, analysis.error);
      }

      result.word_count = analysis.wordCount;
      result.character_count = analysis.characterCount;
      result.sentence_count = analysis.sentenceCount;
      result.paragraph_count = analysis.paragraphCount;
      result.longest_word = analysis.longestWord[0];

      await clearCache(result.text);
      logger.info(`Cache cleared for new text analysis`);

      const data = await Text.create(result);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (validationError: any) {
      if (validationError.isJoi === true) {
        const errorMessage = JoiError(validationError);
        return ErrorUtils.validationError(res, errorMessage);
      }
      throw validationError;
    }
  } catch (error: any) {
    logger.error(`Error in AddText: ${error.message}`);
    next(error);
  }
};

export const GetMyTextAnalysis = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    if (!req.payload) {
      return ErrorUtils.unauthorized(res);
    }
    const user = req.payload.aud;
    console.log(user);
    const data = await Text.aggregate([
      {
        $match: { user: toObjectId(user) },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          word_count: 1,
          character_count: 1,
          sentence_count: 1,
          paragraph_count: 1,
          longest_word: 1,
          createdAt: 1,
          user: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (e: any) {
    logger.error(`Error in GetMyTextAnalysis: ${e.message}`);
    next(e);
  }
};

export const GetOneAnalysis = async (
  req: AuthRequestWithId,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    try {
      toObjectId(id);
    } catch (error) {
      return ErrorUtils.badRequest(res, "Invalid ID format");
    }

    let data = await Text.aggregate([
      {
        $match: {
          _id: toObjectId(id),
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          word_count: 1,
          character_count: 1,
          sentence_count: 1,
          paragraph_count: 1,
          longest_word: 1,
          createdAt: 1,
          user: 1,
        },
      },
    ]);
    if (!data || data.length === 0) {
      return ErrorUtils.notFound(res, "Analysis not found");
    }

    res.send(data[0]);
  } catch (e: any) {
    logger.error(`Error in GetOneAnalysis: ${e.message}`);
    next(e);
  }
};

export const DeleteOneAnalysis = async (
  req: AuthRequestWithId,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    try {
      toObjectId(id);
    } catch (error) {
      return ErrorUtils.badRequest(res, "Invalid ID format");
    }

    let Query = { _id: toObjectId(id) };
    const result = await Text.deleteOne(Query).lean().exec();
    if (result.deletedCount === 0) {
      return ErrorUtils.notFound(res, "Analysis not found");
    }

    return res.status(200).json({
      success: true,
      message: "Deleted Successfully",
    });
  } catch (e: any) {
    logger.error(`Error in DeleteOneAnalysis: ${e.message}`);
    next(e);
  }
};

interface TextRequestBody {
  text: string;
}
export const getWordCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return ErrorUtils.badRequest(res, "Text is required");
    }

    const analysis = analyzeText(text);
    if (analysis.error) {
      return ErrorUtils.badRequest(res, analysis.error);
    }

    return res.status(200).json({
      success: true,
      wordCount: analysis.wordCount,
    });
  } catch (e: any) {
    logger.error(`Error in getWordCount: ${e.message}`);
    next(e);
  }
};
export const getCharacterCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return ErrorUtils.badRequest(res, "Text is required");
    }

    const analysis = analyzeText(text);
    if (analysis.error) {
      return ErrorUtils.badRequest(res, analysis.error);
    }

    return res.status(200).json({
      success: true,
      characterCount: analysis.characterCount,
    });
  } catch (e: any) {
    logger.error(`Error in getCharacterCount: ${e.message}`);
    next(e);
  }
};

export const getSentenceCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return ErrorUtils.badRequest(res, "Text is required");
    }

    const analysis = analyzeText(text);
    if (analysis.error) {
      return ErrorUtils.badRequest(res, analysis.error);
    }

    return res.status(200).json({
      success: true,
      sentenceCount: analysis.sentenceCount,
    });
  } catch (e: any) {
    logger.error(`Error in getSentenceCount: ${e.message}`);
    next(e);
  }
};

export const getParagraphCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return ErrorUtils.badRequest(res, "Text is required");
    }

    const analysis = analyzeText(text);
    if (analysis.error) {
      return ErrorUtils.badRequest(res, analysis.error);
    }

    return res.status(200).json({
      success: true,
      paragraphCount: analysis.paragraphCount,
    });
  } catch (e: any) {
    logger.error(`Error in getParagraphCount: ${e.message}`);
    next(e);
  }
};

export const getLongestWords = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return ErrorUtils.badRequest(res, "Text is required");
    }

    const analysis = analyzeText(text);
    if (analysis.error) {
      return ErrorUtils.badRequest(res, analysis.error);
    }

    return res.status(200).json({
      success: true,
      longestWord: analysis.longestWord[0],
    });
  } catch (e: any) {
    logger.error(`Error in getLongestWords: ${e.message}`);
    next(e);
  }
};

export const getCompleteAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return ErrorUtils.badRequest(res, "Text is required");
    }

    const analysis = analyzeText(text);
    if (analysis.error) {
      return ErrorUtils.badRequest(res, analysis.error);
    }

    return res.status(200).json({
      success: true,
      analysis: {
        wordCount: analysis.wordCount,
        characterCount: analysis.characterCount,
        sentenceCount: analysis.sentenceCount,
        paragraphCount: analysis.paragraphCount,
        longestWord: analysis.longestWord[0],
      },
    });
  } catch (e: any) {
    logger.error(`Error in getCompleteAnalysis: ${e.message}`);
    next(e);
  }
};
