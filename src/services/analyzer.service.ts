export interface TextAnalysisResult {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  longestWord: string;
}
export const analyzeText = (text: string): TextAnalysisResult => {
  if (!text || text.trim() === "") {
    return {
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      longestWord: "",
    };
  }

  const words = text.trim().split(/\s+/);

  const characterCount = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphCount = paragraphs.length || 1;

  const cleanedText = text.toLowerCase().replace(/[^\w\s]/g, "");
  const cleanedWords = cleanedText.split(/\s+/).filter(Boolean);
  const longestWord = cleanedWords.reduce(
    (a, b) => (b.length > a.length ? b : a),
    ""
  );

  return {
    wordCount: words.length,
    characterCount,
    sentenceCount: sentences.length,
    paragraphCount,
    longestWord,
  };
};
