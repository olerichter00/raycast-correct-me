import { diffWordsWithSpace } from "diff";

export const markdownDiff = (originalText: string, newText: string) => {
  const myDiff = diffWordsWithSpace(originalText.trim(), newText.trim());

  const originalMarkdown = myDiff
    .map((part: any) => {
      if (part.removed) return `\`${part.value}\``;
      if (part.added) return "";
      return part.value;
    })
    .join("");

  const correctedMarkdown = myDiff
    .map((part: any) => {
      if (part.removed) return "";
      if (part.added) return `\`${part.value}\``;
      return part.value;
    })
    .join("");

  return `${originalMarkdown}\n\n\n----\n\n${correctedMarkdown}`;
};
