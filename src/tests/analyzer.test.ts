import { analyzeText } from "../services/analyzer.service.js";

describe("Text Analyzer Service", () => {
  const sampleText =
    "The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun.";

  it("should return correct word count", () => {
    const result = analyzeText(sampleText);
    expect(result.wordCount).toBe(16);
  });

  it("should return correct character count", () => {
    const result = analyzeText(sampleText);
    expect(result.characterCount).toBe(75);
  });

  it("should return correct sentence count", () => {
    const result = analyzeText(sampleText);
    expect(result.sentenceCount).toBe(2);
  });

  it("should return correct paragraph count", () => {
    const result = analyzeText(sampleText);
    expect(result.paragraphCount).toBe(1);
  });

  it("should return longest word", () => {
    const result = analyzeText(sampleText);
    expect(result.longestWord).toEqual(["quick"]);
  });
});
