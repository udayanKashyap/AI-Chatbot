import React, { useState } from "react";
import Markdown from "react-markdown";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handlePromptSubmit = async (e: any) => {
    e.preventDefault();

    if (!prompt) {
      alert("Please enter a prompt");
      return;
    }

    try {
      setResponse("Generating response...");
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

      const results = await model.generateContent(prompt);
      if (results && results.response) {
        setResponse(results.response.text());
      } else {
        setResponse("No response received from the model.");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setResponse("Error generating response. Please try again.");
    }
  };

  return (
    <div className="bg-[#0d2b1d] text-[#b0e4d1] min-h-[100vh] p-4 grid place-items-center">
      <div className="w-full 2xl:w-[800px] space-y-10">
        {" "}
        {/* Increased vertical gap */}
        {/* Bigger and more spaced title */}
        <h1 className="text-8xl font-bold text-center mb-10">CharaDex</h1>{" "}
        {/* Increased font size and margin bottom */}
        <form onSubmit={handlePromptSubmit} className="flex gap-2">
          <Input
            placeholder="Enter your prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-[#1a3d29] text-[#b0e4d1] border border-[#2a5d44] focus:outline-none focus:ring-2 focus:ring-[#3d7c61]"
          />
          <Button
            type="submit"
            disabled={!prompt}
            className="bg-[#3d7c61] text-[#ffffff] hover:bg-[#2a5d44] disabled:bg-[#708c78]"
          >
            Generate
          </Button>
        </form>
        <ScrollArea className="h-[300px] rounded-md bg-[#1a3d29] p-4">
          {response ? (
            <Markdown>{response}</Markdown>
          ) : (
            <p className="text-sm text-[#708c78]">No response yet...</p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default App;
