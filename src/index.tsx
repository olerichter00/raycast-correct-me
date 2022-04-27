import { Form, ActionPanel, Action, showToast, Detail, getPreferenceValues, Toast, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { Clipboard } from "@raycast/api";
import { createMarkdownDiff, correctText } from "./utils";
import { Preferences } from "./preferences";

interface TextDiffProps {
  originalText: string;
  correctedText: string;
}
function TextDiff({ originalText, correctedText }: TextDiffProps) {
  return <Detail markdown={createMarkdownDiff(originalText, correctedText)} />;
}

export default function Command() {
  const { push } = useNavigation();

  const [originalText, setOriginalText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCorrect = async (textToCorrect: string) => {
    setLoading(true);

    try {
      const { pasteAutomatically } = await getPreferenceValues<Preferences>();

      const [text, sourceLanguage] = await correctText(textToCorrect);

      if (pasteAutomatically) Clipboard.copy(text);

      showToast(Toast.Style.Success, "Copied to Clipboard", `Detected Language: ${sourceLanguage}`);

      push(<TextDiff originalText={textToCorrect} correctedText={text} />);
    } catch (error) {
      showToast(Toast.Style.Failure, "Something went wrong", JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const copyFromClipboard = async () => {
    const { translateAutomatically, copyAutomatically } = await getPreferenceValues<Preferences>();

    if (!copyAutomatically) return;

    const text = await Clipboard.readText();

    if (!text) return;

    setOriginalText(text);

    if (translateAutomatically) setTimeout(() => handleCorrect(text), 100);
  };

  useEffect(() => {
    copyFromClipboard();
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={() => handleCorrect(originalText)} />
        </ActionPanel>
      }
      isLoading={loading}
    >
      <Form.Description text="Enter the text you want to correct." />
      <Form.TextArea id="original" onChange={setOriginalText} value={originalText} placeholder="Enter text." />
    </Form>
  );
}
