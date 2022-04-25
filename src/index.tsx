import { Form, ActionPanel, Action, showToast, Detail, getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { Clipboard } from "@raycast/api";
import { markdownDiff } from "./utils/diffHelper";
import { correctText } from "./utils/translationHelper";
import { Preferences } from "./preferences";

export default function Command() {
  const [originalText, setOriginalText] = useState("");
  const [correctedText, setCorrectedText] = useState("");

  const translate = async () => {
    const [text, sourceLanguage] = await correctText(originalText);

    setCorrectedText(text);
    Clipboard.copy(text);
    showToast({ title: "Copied to Clipboard", message: `Detected Language: ${sourceLanguage}` });
  };

  const copyFromClipboard = async () => {
    const { translateAutomatically } = await getPreferenceValues<Preferences>();

    const text = await Clipboard.readText();

    if (!text) return;

    setOriginalText(text);

    if (translateAutomatically) translate();
  };

  useEffect(() => {
    copyFromClipboard();
  }, []);

  if (correctedText) {
    return <Detail markdown={markdownDiff(originalText, correctedText)} />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={translate} />
        </ActionPanel>
      }
    >
      <Form.Description text="Enter the text you want to correct." />
      <Form.TextArea id="original" onChange={setOriginalText} value={originalText} placeholder="Enter text." />
    </Form>
  );
}
