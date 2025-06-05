export interface TextAnalysisResult {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  longestWord: string[];
}
export const analyzeText = (text: string): TextAnalysisResult => {
  if (!text || text.trim() === "") {
    return {
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      longestWord: [],
    };
  }

  const words = text.trim().split(/\s+/);

  const characterCount = text.length;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  const paragraphs = text.split(/\n/).filter((p) => p.trim().length > 0);
  const paragraphCount = paragraphs.length;

  const longestWords = paragraphs.map((paragraph) => {
    const cleanedParagraph = paragraph.toLowerCase().replace(/[^\w\s]/g, "");
    const paragraphWords = cleanedParagraph.split(/\s+/).filter(Boolean);
    return paragraphWords.reduce(
      (longest, current) =>
        current.length > longest.length ? current : longest,
      ""
    );
  });

  return {
    wordCount: words.length,
    characterCount,
    sentenceCount: sentences.length,
    paragraphCount,
    longestWord: longestWords,
  };
};
