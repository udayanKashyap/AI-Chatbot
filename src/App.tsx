import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ScrollArea } from "./components/ui/scroll-area";
import { GoogleGenerativeAI } from "@google/generative-ai";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [subheader, setSubheader] = useState(""); // State to hold the streaming subheader text
  const [chatHistory, setChatHistory] = useState({ history: [] });
  const [showHistory, setShowHistory] = useState(false); // State to toggle history display
  const scrollRef = useRef<HTMLDivElement>(null); // Ref for autoscrolling

  const subheaderText =
    "Inspired by the Pokédex, CharáDex is a chatbot for anime and movie characters."; // Full subheader text

  useEffect(() => {
    let letterIndex = 0;
    const intervalId = setInterval(() => {
      if (letterIndex < subheaderText.length) {
        setSubheader((prev) => prev + subheaderText[letterIndex]); // Add one letter at a time
        letterIndex++;
      } else {
        clearInterval(intervalId); // Stop the interval when all letters have been displayed
      }
    }, 35); // Adjust the speed of letter-by-letter display (in ms)

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const handlePromptSubmit = async (e: any) => {
    e.preventDefault();

    if (!prompt) {
      alert("Please enter a prompt");
      return;
    }

    try {
      setResponse("Generating response...");
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        systemInstruction:
          "You are CharaDex, Only provide responses on the context of movies and anime and TV series characters.",
      });

      const chat = model.startChat(chatHistory);

      const results = await chat.sendMessageStream(prompt);
      let responseText = "";
      if (results && results.response) {
        for await (const chunk of results.stream) {
          const chunkText = chunk.text();
          responseText += chunkText;
          setResponse(responseText);

          // Autoscroll to bottom
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }

        // Update chat history with user and model parts
        const userPart = {
          role: "user",
          parts: [{ text: prompt }],
        };
        const modelPart = {
          role: "model",
          parts: [{ text: responseText }],
        };

        setChatHistory((prev) => ({
          history: [...prev.history, userPart, modelPart],
        }));

        // Reset the prompt field after processing
        setPrompt("");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setResponse("Error generating response. Please try again.");
    }
  };

  return (
    <div className="bg-[#060d16] text-[#c7d9eb] min-h-[100vh] p-4 grid place-items-center">
      {" "}
      {/* Darker navy blue */}
      <div className="w-full 2xl:w-[800px] space-y-10">
        {/* Bigger and more spaced title */}
        <h1 className="text-8xl font-bold text-center mb-4">Char&aacute;Dex</h1>

        {/* Subheader with streaming text */}
        <h2 className="text-2xl text-center text-[#99aec4] mb-6">
          {subheader}
        </h2>

        <form onSubmit={handlePromptSubmit} className="flex gap-2">
          <Input
            placeholder="Enter your prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-[#14293f] text-[#c7d9eb] border border-[#1e3a57] focus:outline-none focus:ring-2 focus:ring-[#28557a]"
          />
          <Button
            type="submit"
            disabled={!prompt}
            className="bg-[#28557a] text-[#ffffff] hover:bg-[#1e3a57] disabled:bg-[#4e6987]"
          >
            Generate
          </Button>
        </form>

        <ScrollArea
          className="h-[400px] rounded-md bg-[#14293f] p-4 overflow-auto"
          ref={scrollRef}
        >
          {" "}
          {/* Larger response box */}
          {response ? (
            <Markdown>{response}</Markdown>
          ) : (
            <p className="text-sm text-[#99aec4]">No response yet...</p>
          )}
        </ScrollArea>

        {/* Button to toggle history display */}
        <Button
          onClick={() => setShowHistory((prev) => !prev)}
          className="bg-[#1e3a57] text-[#ffffff] hover:bg-[#28557a]"
        >
          {showHistory ? "Hide Chat History" : "Show Chat History"}
        </Button>

        {/* Chat history display */}
        {showHistory && (
          <div className="bg-[#14293f] rounded-md p-4 mt-4 overflow-auto max-h-[300px] border border-[#1e3a57]">
            {chatHistory.history.length > 0 ? (
              chatHistory.history.map((entry, index) => (
                <div
                  key={index}
                  className={`flex ${
                    entry.role === "user" ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      entry.role === "user"
                        ? "bg-[#28557a] text-[#ffffff] rounded-br-none"
                        : "bg-[#1e3a57] text-[#c7d9eb] rounded-bl-none"
                    }`}
                  >
                    <Markdown>{entry.parts[0].text}</Markdown>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#99aec4]">
                No conversation history yet...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
