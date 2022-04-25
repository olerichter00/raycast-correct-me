import { getPreferenceValues } from "@raycast/api";
import translate, { DeeplLanguages } from "deepl";
import { Preferences } from "../preferences";

const translateTo = async (text: string, targetLanguage: DeeplLanguages) => {
  const { deeplAuthKey } = await getPreferenceValues<Preferences>();

  const { data } = await translate({
    free_api: true,
    text,
    target_lang: targetLanguage,
    auth_key: deeplAuthKey,
  });

  return data.translations[0];
};

export const correctText = async (originalText: string) => {
  const { translationLanguages, fallbackTranslationLanguages } = await getPreferenceValues<Preferences>();

  let { detected_source_language, text: germanText } = await translateTo(
    originalText,
    translationLanguages as DeeplLanguages
  );

  // Use alternative language to translate
  if (translationLanguages === detected_source_language) {
    const result = await translateTo(originalText, fallbackTranslationLanguages as DeeplLanguages);

    detected_source_language = result.detected_source_language;
    germanText = result.text;
  }

  const { text } = await translateTo(germanText, detected_source_language as DeeplLanguages);

  return [text, detected_source_language];
};
