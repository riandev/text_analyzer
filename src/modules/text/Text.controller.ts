import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { JoiError } from "../../helpers/error.js";
import { toObjectId } from "../../helpers/toObjectId.js";
import { AuthRequest } from "../../middlewares/shared/jwt_helper.js";
import { analyzeText } from "../../services/analyzer.service.js";
import Text from "./Text.model.js";
import { textSchema } from "./Text.validation.js";
interface TextQuery {
  page?: string;
  limit?: string;
  search?: string;
}

interface AuthRequestWithId extends AuthRequest {
  params: {
    id: string;
  };
}

export const AddText = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  try {
    if (!req.payload) {
      throw createError.Unauthorized();
    }
    const user = req.payload.aud;
    const result = await textSchema.validateAsync({
      ...req.body,
      user,
    });
    const analysis = analyzeText(result.text);
    result.word_count = analysis.wordCount;
    result.character_count = analysis.characterCount;
    result.sentence_count = analysis.sentenceCount;
    result.paragraph_count = analysis.paragraphCount;
    result.longest_word = analysis.longestWord[0];
    const data = await Text.create(result);
    res.status(200).json(data);
  } catch (error: any) {
    if (error.isJoi === true) {
      const errorMessage = JoiError(error);
      return next(createError.BadRequest(errorMessage));
    }
    next(error);
  }
};

export const GetMyTextAnalysis = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = "1", limit = "10", search } = req.query as TextQuery;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let SearchRgx = { $regex: search, $options: "i" };
    let QuerySearch = { title: SearchRgx };

    if (!search) {
      let data = await Text.aggregate([
        {
          $facet: {
            metadata: [
              { $count: "total" },
              { $addFields: { page: parseInt(page) } },
            ],
            data: [
              { $skip: skip },
              { $limit: parseInt(limit) },
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
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$metadata",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            total: "$metadata.total",
            currentPage: "$metadata.page",
            data: "$data",
          },
        },
      ]);
      res.send(data);
    } else if (search) {
      let data = await Text.aggregate([
        {
          $match: QuerySearch,
        },
        {
          $facet: {
            metadata: [
              { $count: "total" },
              { $addFields: { page: parseInt(page) } },
            ],
            data: [
              { $skip: skip },
              { $limit: parseInt(limit) },
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
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$metadata",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            total: "$metadata.total",
            currentPage: "$metadata.page",
            data: "$data",
          },
        },
      ]);
      res.send(data);
    }
  } catch (e) {
    next(e);
  }
};

export const GetOneAnalysis = async (
  req: AuthRequestWithId,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    try {
      toObjectId(id);
    } catch (error) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
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
      res.status(404).json({ message: "Analysis not found" });
      return;
    }

    res.send(data[0]);
  } catch (e) {
    next(e);
  }
};

export const DeleteOneAnalysis = async (
  req: AuthRequestWithId,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    try {
      toObjectId(id);
    } catch (error) {
      res.status(400).json({ message: "Invalid ID format" });
      return;
    }

    let Query = { _id: toObjectId(id) };
    const result = await Text.deleteOne(Query).lean().exec();
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Analysis not found" });
      return;
    }

    res.send({ message: "Deleted Successfully" });
  } catch (e) {
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
): Promise<void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return next(createError.BadRequest("Text is required"));
    }

    const analysis = analyzeText(text);
    res.json({ wordCount: analysis.wordCount });
  } catch (e) {
    next(e);
  }
};
export const getCharacterCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return next(createError.BadRequest("Text is required"));
    }

    const analysis = analyzeText(text);
    res.json({ characterCount: analysis.characterCount });
  } catch (e) {
    next(e);
  }
};

export const getSentenceCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return next(createError.BadRequest("Text is required"));
    }

    const analysis = analyzeText(text);
    res.json({ sentenceCount: analysis.sentenceCount });
  } catch (e) {
    next(e);
  }
};

export const getParagraphCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return next(createError.BadRequest("Text is required"));
    }

    const analysis = analyzeText(text);
    res.json({ paragraphCount: analysis.paragraphCount });
  } catch (e) {
    next(e);
  }
};

export const getLongestWords = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return next(createError.BadRequest("Text is required"));
    }

    const analysis = analyzeText(text);
    res.json({ longestWord: analysis.longestWord[0] });
  } catch (e) {
    next(e);
  }
};

export const getCompleteAnalysis = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text } = req.body as TextRequestBody;
    if (!text) {
      return next(createError.BadRequest("Text is required"));
    }
    const analysis = analyzeText(text);
    res.json({
      analysis: {
        wordCount: analysis.wordCount,
        characterCount: analysis.characterCount,
        sentenceCount: analysis.sentenceCount,
        paragraphCount: analysis.paragraphCount,
        longestWord: analysis.longestWord[0],
      },
    });
  } catch (e) {
    next(e);
  }
};
