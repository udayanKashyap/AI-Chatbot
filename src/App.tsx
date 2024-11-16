import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [session, setSession] = useState();

  useEffect(() => {
    const loadSession = async () => {
      //@ts-expect-error types not defined
      if (window.ai) {
        //@ts-expect-error types not defined
        const session = await window.ai.assistant.create();
        setSession(session);
      }
    };
    loadSession();
  }, [setSession, session]);

  const handlePromptStream = async () => {
    if (session) {
      //@ts-expect-error types not defined
      const results = await session.promptStreaming(prompt);
      setResponse("");
      const reader = results.getReader();
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          setResponse(value);
        }
      }
    } else {
      alert("session not loaded");
    }
  };

  return (
    <div className="dark bg-background text-foreground min-h-[100vh] p-4 grid place-items-center">
      <div className="w-full 2xl:w-[800px] space-y-4">
        <h1 className="text-xl">AI Prompt App 💻</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPrompt("");
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Enter your prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button onClick={handlePromptStream} type="submit" disabled={!prompt}>
            Search
          </Button>
        </form>
        <ScrollArea className="h-[300px] rounded-md bg-muted p-4">
          {response ? (
            <Markdown>
              {/* <pre className="text-sm text-wrap">{response}</pre> */}
              {response}
            </Markdown>
          ) : (
            <p className="text-sm text-muted-foreground">No response yet...</p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default App;
