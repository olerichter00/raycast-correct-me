import { getPreferenceValues } from "@raycast/api";
import translate, { DeeplLanguages } from "deepl";
import { Preferences } from "./preferences";

import { diffWordsWithSpace } from "diff";

export const createMarkdownDiff = (originalText: string, newText: string) => {
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

const translateTo = async (text: string, targetLanguage: DeeplLanguages) => {
  const { deeplAuthKey, pro } = await getPreferenceValues<Preferences>();

  const { data } = await translate({
    free_api: !pro,
    text,
    target_lang: targetLanguage,
    auth_key: deeplAuthKey,
  });

  return data.translations[0];
};

export const correctText = async (originalText: string) => {
  const { translationLanguages, fallbackTranslationLanguages } = await getPreferenceValues<Preferences>();

  let { detected_source_language, text: translatedText } = await translateTo(
    originalText,
    translationLanguages as DeeplLanguages
  );

  // Use alternative language to translate
  if (translationLanguages === detected_source_language) {
    const result = await translateTo(originalText, fallbackTranslationLanguages as DeeplLanguages);

    detected_source_language = result.detected_source_language;
    translatedText = result.text;
  }

  const { text: correctText } = await translateTo(translatedText, detected_source_language as DeeplLanguages);

  return [correctText, detected_source_language];
};
