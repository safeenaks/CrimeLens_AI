import { useState, useRef } from "react";
import {
  Bot,
  Send,
  Languages,
  Database,
  ShieldCheck,
  User,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  Download,
} from "lucide-react";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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

  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const pdfReportRef = useRef(null);

  // --------------------------------------------------
  // Speech Recognition
  // --------------------------------------------------

  function startListening() {
    setError("");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported by this browser. Please use Chrome or Edge."
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();

    recognition.lang =
      language === "kn"
        ? "kn-IN"
        : "en-IN";

    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setQuestion(transcript);
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (event.error === "not-allowed") {
        setError(
          "Microphone permission was denied. Allow microphone access and try again."
        );
      } else if (event.error === "no-speech") {
        setError(
          "No speech was detected. Please try again."
        );
      } else {
        setError(
          `Voice recognition failed: ${event.error}`
        );
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setListening(false);
  }

  // --------------------------------------------------
  // Text To Speech
  // --------------------------------------------------

  function speakAnswer(text) {
    if (!("speechSynthesis" in window)) {
      setError(
        "Text-to-speech is not supported by this browser."
      );
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/#/g, "");

    const utterance =
      new SpeechSynthesisUtterance(cleanText);

    utterance.lang =
      language === "kn"
        ? "kn-IN"
        : "en-IN";

    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(
      utterance
    );
  }

  // --------------------------------------------------
  // Submit Question
  // --------------------------------------------------

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuestion =
      question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setError("");

    // Capture previous conversation before adding
    // the current question. This allows contextual
    // follow-up questions to work.

    const conversationHistory = messages
      .slice(-10)
      .map((message) => ({
        role: message.role,
        content: message.text,
      }));

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
      const response =
        await askInvestigator(
          trimmedQuestion,
          language,
          conversationHistory
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

  // --------------------------------------------------
  // Export Conversation as PDF
  // --------------------------------------------------

async function exportConversationPDF() {
  const conversationMessages = messages.filter(
    (_, index) => index !== 0
  );

  if (conversationMessages.length === 0) {
    setError(
      "Ask the AI Investigator at least one question before exporting."
    );
    return;
  }

  if (!pdfReportRef.current) {
    setError("Unable to prepare the investigation report.");
    return;
  }

  setError("");

  try {
    await document.fonts.ready;

    const canvas = await html2canvas(
      pdfReportRef.current,
      {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 900,
      }
    );

    const imageData =
      canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 10;

    const printableWidth =
      pageWidth - margin * 2;

    const printableHeight =
      pageHeight - margin * 2;

    const imageHeight =
      (canvas.height * printableWidth) /
      canvas.width;

    let heightLeft = imageHeight;
    let position = margin;

    pdf.addImage(
      imageData,
      "PNG",
      margin,
      position,
      printableWidth,
      imageHeight
    );

    heightLeft -= printableHeight;

    while (heightLeft > 0) {
      pdf.addPage();

      position =
        margin -
        (imageHeight - heightLeft);

      pdf.addImage(
        imageData,
        "PNG",
        margin,
        position,
        printableWidth,
        imageHeight
      );

      heightLeft -= printableHeight;
    }

    const totalPages =
      pdf.getNumberOfPages();

    for (
      let page = 1;
      page <= totalPages;
      page += 1
    ) {
      pdf.setPage(page);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);

      pdf.text(
        `CrimeLens AI | Page ${page} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 4,
        {
          align: "center",
        }
      );
    }

    const timestamp =
      new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-");

    pdf.save(
      `CrimeLens_Investigation_${timestamp}.pdf`
    );
  } catch (exportError) {
    console.error(
      "PDF export failed:",
      exportError
    );

    setError(
      "Unable to export the conversation as PDF."
    );
  }
}
  // --------------------------------------------------
  // Suggested Questions
  // --------------------------------------------------

  function useSuggestion(text) {
    setQuestion(text);
  }

  const englishSuggestions = [
    "Which district has the highest number of crimes?",
    "What are the top 5 crime types?",
    "Which police station has the most cases?",
    "How many high severity cases are there?",
  ];

  const kannadaSuggestions = [
    "ಯಾವ ಜಿಲ್ಲೆಯಲ್ಲಿ ಅತಿ ಹೆಚ್ಚು ಅಪರಾಧ ಪ್ರಕರಣಗಳಿವೆ?",
    "ಅತಿ ಹೆಚ್ಚು ಕಂಡುಬರುವ 5 ಅಪರಾಧ ಪ್ರಕಾರಗಳು ಯಾವುವು?",
    "ಯಾವ ಪೊಲೀಸ್ ಠಾಣೆಯಲ್ಲಿ ಅತಿ ಹೆಚ್ಚು ಪ್ರಕರಣಗಳಿವೆ?",
    "ಹೆಚ್ಚಿನ ತೀವ್ರತೆಯ ಪ್ರಕರಣಗಳು ಎಷ್ಟು ಇವೆ?",
  ];

  const suggestions =
    language === "kn"
      ? kannadaSuggestions
      : englishSuggestions;

  return (
    <div className="space-y-6">
      <div
  style={{
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "800px",
    background: "#ffffff",
    color: "#111827",
    padding: "40px",
    fontFamily:
      '"Noto Sans Kannada", "Nirmala UI", "Arial Unicode MS", Arial, sans-serif',
  }}
>
  <div ref={pdfReportRef}>

    <h1
      style={{
        fontSize: "28px",
        fontWeight: "700",
        marginBottom: "4px",
      }}
    >
      CrimeLens AI
    </h1>

    <h2
      style={{
        fontSize: "20px",
        fontWeight: "600",
        marginTop: "0",
        marginBottom: "20px",
      }}
    >
      Investigator Conversation Report
    </h2>

    <div
      style={{
        borderTop: "1px solid #94a3b8",
        paddingTop: "14px",
        marginBottom: "28px",
        fontSize: "13px",
        lineHeight: "1.7",
      }}
    >
      <div>
        <strong>Generated:</strong>{" "}
        {new Date().toLocaleString()}
      </div>

      <div>
        <strong>Language:</strong>{" "}
        {language === "kn"
          ? "Kannada"
          : "English"}
      </div>

      <div>
        <strong>Data Source:</strong>{" "}
        Karnataka Crime Dataset
      </div>

      <div>
        <strong>Analysis:</strong>{" "}
        Evidence Grounded
      </div>
    </div>

    {messages
      .filter((_, index) => index !== 0)
      .map((message, index) => (
        <div
          key={`pdf-${index}`}
          style={{
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              marginBottom: "7px",
              color:
                message.role === "user"
                  ? "#0369a1"
                  : "#0f766e",
            }}
          >
            {message.role === "user"
              ? "INVESTIGATOR"
              : "CRIMELENS AI"}
          </div>

          <div
            style={{
              fontSize: "15px",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
            }}
          >
            {message.text
              .replace(/\*\*/g, "")
              .replace(/#/g, "")}
          </div>

          {message.role === "assistant" &&
            message.evidence && (
              <div
                style={{
                  fontSize: "11px",
                  marginTop: "8px",
                  color: "#64748b",
                }}
              >
                Answer generated from verified
                CrimeLens data.
              </div>
            )}
        </div>
      ))}

    <div
      style={{
        borderTop: "1px solid #94a3b8",
        marginTop: "30px",
        paddingTop: "16px",
      }}
    >
      <div
        style={{
          fontWeight: "700",
          fontSize: "13px",
        }}
      >
        Generated by CrimeLens AI
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#64748b",
          marginTop: "7px",
          lineHeight: "1.6",
        }}
      >
        AI responses are generated from verified
        CrimeLens crime records and should support,
        not replace, investigator judgement.
      </div>
    </div>

  </div>
</div>

      {/* Header */}

      <div>
        <div className="flex items-center gap-3">

          <div className="p-3 bg-cyan-500/10 rounded-xl">
            <Bot
              className="text-cyan-400"
              size={28}
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              AI Investigator
            </h1>

            <p className="text-slate-400 mt-1">
              Ask questions about Karnataka crime intelligence
              using text or voice in English or Kannada.
            </p>
          </div>

        </div>
      </div>

      {/* Status Cards */}

      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">

          <div className="flex items-center gap-3">

            <Database
              className="text-cyan-400"
              size={20}
            />

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

            <Languages
              className="text-cyan-400"
              size={20}
            />

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

            <ShieldCheck
              className="text-cyan-400"
              size={20}
            />

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

                <Bot
                  className="text-cyan-400"
                  size={22}
                />

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

            {/* Export + Language */}

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={
                  exportConversationPDF
                }
                title="Export conversation as PDF"
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 hover:text-cyan-400 hover:border-cyan-500 rounded-lg px-3 py-2 transition"
              >

                <Download size={18} />

                <span className="hidden sm:inline">
                  Export PDF
                </span>

              </button>

              <select
                value={language}
                onChange={(event) => {
                  setLanguage(
                    event.target.value
                  );

                  window.speechSynthesis?.cancel();
                }}
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

          </div>

          {/* Messages */}

          <div className="h-[480px] overflow-y-auto p-5 space-y-5">

            {messages.map(
              (message, index) => (

                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  {message.role ===
                    "assistant" && (

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

                    {message.role ===
                      "assistant" &&
                      index !== 0 && (

                        <div className="mt-3 flex items-center gap-3">

                          <button
                            type="button"
                            onClick={() =>
                              speakAnswer(
                                message.text
                              )
                            }
                            title="Read answer aloud"
                            className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition"
                          >

                            <Volume2 size={15} />

                            {language === "kn"
                              ? "ಕೇಳಿ"
                              : "Listen"}

                          </button>

                        </div>

                      )}

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

              )
            )}

            {/* Loading */}

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

                  {language === "kn"
                    ? "CrimeLens ದತ್ತಾಂಶವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..."
                    : "Analyzing CrimeLens data..."}

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
                  setQuestion(
                    event.target.value
                  )
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
                  listening
                    ? language === "kn"
                      ? "ಕೇಳಲಾಗುತ್ತಿದೆ..."
                      : "Listening..."
                    : language === "kn"
                    ? "ಕರ್ನಾಟಕದ ಅಪರಾಧ ದತ್ತಾಂಶದ ಬಗ್ಗೆ ಪ್ರಶ್ನಿಸಿ..."
                    : "Ask about Karnataka crime data..."
                }
                className="flex-1 resize-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
              />

              {/* Microphone */}

              <button
                type="button"
                onClick={
                  listening
                    ? stopListening
                    : startListening
                }
                title={
                  listening
                    ? "Stop listening"
                    : "Ask using voice"
                }
                className={`self-end h-12 w-12 flex items-center justify-center rounded-xl transition ${
                  listening
                    ? "bg-red-500 hover:bg-red-400 text-white"
                    : "bg-slate-800 border border-slate-700 text-cyan-400 hover:bg-slate-700"
                }`}
              >

                {listening ? (
                  <MicOff size={20} />
                ) : (
                  <Mic size={20} />
                )}

              </button>

              {/* Send */}

              <button
                type="submit"
                disabled={
                  loading ||
                  !question.trim()
                }
                className="self-end h-12 w-12 flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition"
              >

                <Send size={20} />

              </button>

            </div>

            <div className="flex items-center justify-between gap-4 mt-2">

              <p className="text-xs text-slate-500">
                AI responses are generated from verified
                CrimeLens records and should support,
                not replace, investigator judgement.
              </p>

              {listening && (

                <p className="text-xs text-red-400 flex items-center gap-1 shrink-0">

                  <Mic size={13} />

                  {language === "kn"
                    ? "ಕೇಳಲಾಗುತ್ತಿದೆ"
                    : "Listening"}

                </p>

              )}

            </div>

          </form>

        </div>

        {/* Suggested Questions */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit">

          <h2 className="text-white font-semibold text-lg">

            {language === "kn"
              ? "ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು"
              : "Suggested Questions"}

          </h2>

          <p className="text-sm text-slate-400 mt-1 mb-4">

            {language === "kn"
              ? "ತನಿಖಾಧಿಕಾರಿಯನ್ನು ಕೇಳಿ:"
              : "Try asking the investigator:"}

          </p>

          <div className="space-y-3">

            {suggestions.map(
              (suggestion) => (

                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    useSuggestion(
                      suggestion
                    )
                  }
                  className="w-full text-left text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-3 transition"
                >

                  {suggestion}

                </button>

              )
            )}

          </div>

          <div className="mt-6 pt-5 border-t border-slate-800">

            <p className="text-xs text-slate-500 leading-relaxed">

              {language === "kn"
                ? "CrimeLens ಕರ್ನಾಟಕದ ಐತಿಹಾಸಿಕ ಅಪರಾಧ ದತ್ತಾಂಶವನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಪರಿಶೀಲಿಸಿದ ಫಲಿತಾಂಶಗಳನ್ನು ಉತ್ತರಗಳಿಗೆ ಬಳಸುತ್ತದೆ."
                : "CrimeLens analyzes the Karnataka historical crime dataset and uses verified query results as evidence for its responses."}

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Investigator;