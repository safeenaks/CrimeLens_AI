import { useState } from "react";
import {
  Bot,
  Send,
  Languages,
  Database,
  ShieldCheck,
  User,
  Loader2,
} from "lucide-react";

import { askInvestigator } from "../services/api";


function Investigator() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Welcome to CrimeLens AI Investigator. Ask a question about Karnataka crime data.",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setError("");

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: trimmedQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await askInvestigator(
        trimmedQuestion,
        language
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: response.answer,
          evidence: response.evidence,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to contact the AI Investigator."
      );
    } finally {
      setLoading(false);
    }
  }


  function useSuggestion(text) {
    setQuestion(text);
  }


  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <div className="flex items-center gap-3">

          <div className="p-3 bg-cyan-500/10 rounded-xl">
            <Bot className="text-cyan-400" size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              AI Investigator
            </h1>

            <p className="text-slate-400 mt-1">
              Ask questions about Karnataka crime intelligence
              in English or Kannada.
            </p>
          </div>

        </div>
      </div>


      {/* Status Cards */}

      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Database className="text-cyan-400" size={20} />

            <div>
              <p className="text-sm text-slate-400">
                Intelligence Source
              </p>
              <p className="text-white font-medium">
                Karnataka Crime Dataset
              </p>
            </div>
          </div>
        </div>


        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Languages className="text-cyan-400" size={20} />

            <div>
              <p className="text-sm text-slate-400">
                Languages
              </p>
              <p className="text-white font-medium">
                English + ಕನ್ನಡ
              </p>
            </div>
          </div>
        </div>


        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-cyan-400" size={20} />

            <div>
              <p className="text-sm text-slate-400">
                Analysis
              </p>
              <p className="text-white font-medium">
                Evidence Grounded
              </p>
            </div>
          </div>
        </div>

      </div>


      {/* Main Investigator */}

      <div className="grid xl:grid-cols-[1fr_300px] gap-6">

        {/* Chat */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

          {/* Chat Header */}

          <div className="border-b border-slate-800 p-4 flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Bot className="text-cyan-400" size={22} />
              </div>

              <div>
                <p className="text-white font-semibold">
                  CrimeLens Investigator
                </p>

                <p className="text-xs text-emerald-400">
                  AI intelligence active
                </p>
              </div>

            </div>


            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
            >
              <option value="en">
                English
              </option>

              <option value="kn">
                ಕನ್ನಡ
              </option>
            </select>

          </div>


          {/* Messages */}

          <div className="h-[480px] overflow-y-auto p-5 space-y-5">

            {messages.map((message, index) => (

              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                {message.role === "assistant" && (
                  <div className="w-9 h-9 shrink-0 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Bot
                      className="text-cyan-400"
                      size={18}
                    />
                  </div>
                )}


                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-cyan-500 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.text}
                  </p>

                  {message.evidence && (
                    <p className="text-xs text-slate-500 mt-3">
                      Answer generated from verified CrimeLens data.
                    </p>
                  )}
                </div>


                {message.role === "user" && (
                  <div className="w-9 h-9 shrink-0 rounded-full bg-slate-800 flex items-center justify-center">
                    <User
                      className="text-slate-300"
                      size={18}
                    />
                  </div>
                )}

              </div>

            ))}


            {loading && (
              <div className="flex gap-3">

                <div className="w-9 h-9 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Bot
                    className="text-cyan-400"
                    size={18}
                  />
                </div>

                <div className="bg-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2 text-slate-400">
                  <Loader2
                    className="animate-spin"
                    size={17}
                  />
                  Analyzing CrimeLens data...
                </div>

              </div>
            )}

          </div>


          {/* Error */}

          {error && (
            <div className="mx-5 mb-3 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}


          {/* Input */}

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-800 p-4"
          >
            <div className="flex gap-3">

              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                rows="2"
                maxLength="500"
                placeholder={
                  language === "kn"
                    ? "ಕರ್ನಾಟಕದ ಅಪರಾಧ ದತ್ತಾಂಶದ ಬಗ್ಗೆ ಪ್ರಶ್ನಿಸಿ..."
                    : "Ask about Karnataka crime data..."
                }
                className="flex-1 resize-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="self-end h-12 w-12 flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition"
              >
                <Send size={20} />
              </button>

            </div>

            <p className="text-xs text-slate-500 mt-2">
              AI responses are generated from CrimeLens crime
              records and should support, not replace,
              investigator judgement.
            </p>

          </form>

        </div>


        {/* Suggested Questions */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit">

          <h2 className="text-white font-semibold text-lg">
            Suggested Questions
          </h2>

          <p className="text-sm text-slate-400 mt-1 mb-4">
            Try asking the investigator:
          </p>


          <div className="space-y-3">

            {[
              "Which district has the highest number of crimes?",
              "What are the top 5 crime types?",
              "Which police station has the most cases?",
              "How many high severity cases are there?",
            ].map((suggestion) => (

              <button
                key={suggestion}
                onClick={() =>
                  useSuggestion(suggestion)
                }
                className="w-full text-left text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-3 transition"
              >
                {suggestion}
              </button>

            ))}

          </div>


          <div className="mt-6 pt-5 border-t border-slate-800">

            <p className="text-xs text-slate-500 leading-relaxed">
              CrimeLens analyzes the Karnataka historical
              crime dataset and uses verified query results
              as evidence for its responses.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Investigator;