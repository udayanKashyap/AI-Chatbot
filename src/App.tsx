import { useEffect, useState } from "react";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import { Button } from "./components/ui/button";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [session, setSession] = useState();

  useEffect(() => {
    const loadSession = async () => {
      if (window.ai) {
        const session = await window.ai.assistant.create();
        setSession(session);
      }
    };
    loadSession();
  }, [setSession]);

  const handlePrompt = async () => {
    if (session) {
      const results = await session.prompt(prompt);
      setResponse(results);
    } else {
      alert("session not loaded");
    }
  };

  return (
    <div className="bg-background text-foreground min-h-[100vh] p-4 grid place-items-center">
      <div className="w-full xl:w-[500px] space-y-4">
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
          <Button onClick={handlePrompt} type="submit" disabled={!prompt}>
            Search
          </Button>
        </form>
        <ScrollArea className="h-[300px] rounded-md bg-muted p-4 overflow-auto">
          {response ? (
            <p className="text-sm">{response}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No response yet...</p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default App;
