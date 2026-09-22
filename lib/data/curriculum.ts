// lib/data/curriculum.ts
import { Week, StarterSession, Project } from "@/lib/types";

export const STATIC_WEEKS: Week[] = [
  {
    id: 1,
    title: "Python for Agent Builders",
    goal: "Read, modify, and debug the Python used by agent examples.",
    mini_project:
      "Toolbox CLI: five functions (calculator, read_text_file, count_words, save_json, load_json) called from a menu-driven terminal program.",
    move_on_check:
      "Explain a dictionary, JSON-like object, function argument, exception, import, and file path without looking them up.",
    resources: [
      { label: "Python Tutorial", url: "https://docs.python.org/3/tutorial/" },
      { label: "CS50P", url: "https://cs50.harvard.edu/python/" },
      { label: "Exercism Python", url: "https://exercism.org/tracks/python" },
    ],
  },
  {
    id: 2,
    title: "HTTP, JSON, APIs, and Small Web Services",
    goal: "Understand how a Python program talks to the outside world.",
    mini_project:
      "Script that calls one public API, converts the response to a dict, saves clean JSON, prints a summary — then wrap it in a tiny FastAPI endpoint.",
    move_on_check:
      "Send a request, inspect the response, identify an error status, store a key in an env var, and explain JSON to a beginner.",
    resources: [
      {
        label: "MDN HTTP Overview",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
      },
      { label: "FastAPI Tutorial", url: "https://fastapi.tiangolo.com/tutorial/" },
      { label: "Pro Git", url: "https://git-scm.com/book/en/v2" },
    ],
  },
  {
    id: 3,
    title: "LLM Application Foundations",
    goal: 'Move from "I use ChatGPT" to "I can build an LLM-powered program."',
    mini_project:
      "Paper exercise: one user request designed three ways — plain prompt, single-API-call app, agentic workflow — with the differences written down.",
    move_on_check:
      "Explain the difference between a chatbot, an LLM application, a workflow, and an agent without buzzwords.",
    resources: [
      {
        label: "HF LLM Course",
        url: "https://huggingface.co/learn/llm-course/chapter0/1",
      },
      {
        label: "HF Agents Course Unit 0",
        url: "https://huggingface.co/learn/agents-course/unit0/introduction",
      },
      {
        label: "HF Agents Unit 1",
        url: "https://huggingface.co/learn/agents-course/unit1/introduction",
      },
      {
        label: "Anthropic: Building Effective Agents",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
      },
    ],
  },
  {
    id: 4,
    title: "Structured Outputs and Tool Calling",
    goal: "Teach a model to produce machine-usable decisions and tool calls.",
    mini_project:
      "Three tools: calculator, search-local-file, simple database lookup. Model/tool interaction only — no agent yet.",
    move_on_check:
      "Describe the 6-step tool-calling flow: schema → model → tool call → validate/execute → result back → next step or answer.",
    resources: [
      {
        label: "OpenAI Function Calling",
        url: "https://developers.openai.com/api/docs/guides/function-calling",
      },
      {
        label: "OpenAI Structured Outputs",
        url: "https://developers.openai.com/api/docs/guides/structured-outputs",
      },
      {
        label: "Gemini Function Calling",
        url: "https://ai.google.dev/gemini-api/docs/function-calling",
      },
      {
        label: "Pydantic Models",
        url: "https://docs.pydantic.dev/latest/concepts/models/",
      },
      {
        label: "Microsoft AI Agents for Beginners",
        url: "https://github.com/microsoft/ai-agents-for-beginners",
      },
    ],
  },
  {
    id: 5,
    title: "Build an Agent Loop From Scratch",
    goal: "Understand the core control loop without any framework.",
    mini_project:
      "Research Assistant v1: goal → tool calls → results → final answer over local files, with logging and a max-turn limit.",
    move_on_check:
      "Explain why the application, not the model, executes tools — and show your own working loop.",
    resources: [
      {
        label: "HF Agents Unit 1",
        url: "https://huggingface.co/learn/agents-course/unit1/introduction",
      },
      {
        label: "Gemini Function Calling",
        url: "https://ai.google.dev/gemini-api/docs/function-calling",
      },
      {
        label: "Microsoft AI Agents for Beginners",
        url: "https://github.com/microsoft/ai-agents-for-beginners",
      },
    ],
  },
  {
    id: 6,
    title: "State, Memory, Embeddings, and RAG",
    goal: "Give the agent access to information beyond the current turn.",
    mini_project:
      "Personal Knowledge Agent: index a folder of notes into a local Chroma store, retrieve top matches, answer with snippets attached.",
    move_on_check:
      "Draw the retrieval path: documents → chunk/index → query → embedding/search → retrieved context → model → answer.",
    resources: [
      {
        label: "LlamaIndex RAG",
        url: "https://docs.llamaindex.ai/en/stable/understanding/rag/",
      },
      {
        label: "Sentence Transformers semantic search",
        url: "https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html",
      },
      {
        label: "Chroma Getting Started",
        url: "https://docs.trychroma.com/docs/overview/getting-started",
      },
      {
        label: "LangChain Learn",
        url: "https://docs.langchain.com/oss/python/learn",
      },
    ],
  },
  {
    id: 7,
    title: "Planning, Workflows, and Agentic Patterns",
    goal: "Know when to use a deterministic workflow, a single agent, or a multi-step pattern.",
    mini_project:
      "Competitor research workflow diagram: every box marked deterministic, LLM decision, or tool execution.",
    move_on_check:
      'Answer "what is the smallest amount of autonomy needed?" for a given task and justify it.',
    resources: [
      {
        label: "Anthropic: Building Effective Agents",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
      },
      {
        label: "Microsoft Study Guide",
        url: "https://github.com/microsoft/ai-agents-for-beginners/blob/main/STUDY_GUIDE.md",
      },
    ],
  },
  {
    id: 8,
    title: "LangGraph — Framework After Fundamentals",
    goal: "Translate the manual agent ideas into an explicit stateful graph.",
    mini_project:
      "Research Agent v2: planner, research, evaluator, and finalizer nodes with explicit state.",
    move_on_check:
      "Point to every part of the graph and explain why it exists.",
    resources: [
      {
        label: "LangGraph Overview",
        url: "https://docs.langchain.com/oss/python/langgraph/overview",
      },
      {
        label: "LangChain Learn",
        url: "https://docs.langchain.com/oss/python/learn",
      },
    ],
  },
  {
    id: 9,
    title: "Multi-Agent Systems",
    goal: "Learn delegation without multi-agent hype.",
    mini_project:
      "Marketing Research Team: coordinator plus Researcher, Analyst, Reviewer specialists, each kept narrow.",
    move_on_check:
      "Explain manager/specialist, handoffs, agents-as-tools, and shared vs isolated context.",
    resources: [
      {
        label: "OpenAI Agents SDK",
        url: "https://openai.github.io/openai-agents-python/",
      },
      {
        label: "LangGraph Overview",
        url: "https://docs.langchain.com/oss/python/langgraph/overview",
      },
      {
        label: "HF Agents Course",
        url: "https://huggingface.co/learn/agents-course/unit0/introduction",
      },
    ],
  },
  {
    id: 10,
    title: "MCP — Model Context Protocol",
    goal: "Understand how tools/data are exposed through a standard protocol.",
    mini_project:
      "MCP Toolbox Server: expose list-files, read-file, and search-text; connect one compatible client.",
    move_on_check:
      "Explain the progression: function → tool → tool collection → external tool server → MCP client/server.",
    resources: [
      {
        label: "MCP Introduction",
        url: "https://modelcontextprotocol.io/introduction",
      },
      {
        label: "MCP Python SDK",
        url: "https://py.sdk.modelcontextprotocol.io/get-started/",
      },
    ],
  },
  {
    id: 11,
    title: "Reliability, Evaluation, Guardrails, and Testing",
    goal: "Make agents dependable systems, not impressive demos.",
    mini_project:
      "Evaluation set of 20 tasks for the Research Agent; record pass/fail and failure reasons; change the system once and rerun.",
    move_on_check:
      "Show repeatable tests covering failure paths, step limits, and guardrail checks.",
    resources: [
      {
        label: "OpenAI Agents SDK",
        url: "https://openai.github.io/openai-agents-python/",
      },
      {
        label: "Microsoft Study Guide",
        url: "https://github.com/microsoft/ai-agents-for-beginners/blob/main/STUDY_GUIDE.md",
      },
      {
        label: "Google ADK Quickstart",
        url: "https://adk.dev/get-started/quickstart/",
      },
      {
        label: "pytest",
        url: "https://docs.pytest.org/en/stable/getting-started.html",
      },
    ],
  },
  {
    id: 12,
    title: "Capstones + Freelance Transition",
    goal: "Turn the skills into portfolio pieces that solve business problems.",
    mini_project:
      "Capstone A: Marketing Research & Content Agent. Capstone B: narrow Repository Review Agent with tests and controlled writes.",
    move_on_check:
      "Ship one client-style system with README, demo, evaluation set, and stated limitations.",
    resources: [
      {
        label: "Anthropic: Building Effective Agents",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
      },
      {
        label: "Microsoft Study Guide",
        url: "https://github.com/microsoft/ai-agents-for-beginners/blob/main/STUDY_GUIDE.md",
      },
    ],
  },
];

export const STATIC_STARTER_SESSIONS: StarterSession[] = [
  { id: 1, focus: "Python: functions + dictionaries", resource: "Python official tutorial" },
  { id: 2, focus: "Python: files + exceptions", resource: "Python official tutorial" },
  { id: 3, focus: "Git basics", resource: "Pro Git, chapters 1–2 (selected)" },
  { id: 4, focus: "HTTP request/response", resource: "MDN HTTP overview" },
  { id: 5, focus: "JSON + API call", resource: "MDN + a simple public API" },
  { id: 6, focus: "LLM application mental model", resource: "HF LLM Course intro + HF Agents Unit 1 intro" },
  { id: 7, focus: "Agent definitions + use cases", resource: "HF Agents Unit 1" },
  { id: 8, focus: "Tools and tool schemas", resource: "OpenAI Function Calling + Google Function Calling" },
  { id: 9, focus: "Structured output", resource: "OpenAI Structured Outputs + Pydantic" },
  { id: 10, focus: "Build first tool call", resource: "Your own Python tool + a free model" },
  { id: 11, focus: "Tool result loop", resource: "Google function calling / HF Agents examples" },
  { id: 12, focus: "Manual agent loop", resource: "Your own implementation, no framework" },
  { id: 13, focus: "Failure handling + max steps", resource: "pytest + your logs" },
  { id: 14, focus: "Mini project demo + README", resource: "GitHub repository, screenshot, explanation" },
];

export const STATIC_PROJECTS: Project[] = [
  { id: 1, name: "Python Toolbox", week: 1, description: "Functions, JSON, files, exceptions. Goal: confidence." },
  { id: 2, name: "API Data Reporter", week: 2, description: "Call an API, normalize JSON, produce a report." },
  { id: 3, name: "Three-Tool LLM App", week: 4, description: "Model selects among calculator/file/database tools." },
  { id: 4, name: "Agent Loop from Scratch", week: 5, description: "Goal → tool calls → tool results → final output." },
  { id: 5, name: "Personal Knowledge Agent", week: 6, description: "Retrieval + context + answer." },
  { id: 6, name: "Research Workflow", week: 7, description: "Planner/evaluator pattern with explicit boundaries." },
  { id: 7, name: "LangGraph Research Agent", week: 8, description: "Explicit state graph with loops and evaluation." },
  { id: 8, name: "Marketing Agent Team", week: 9, description: "Researcher + analyst + reviewer." },
  { id: 9, name: "MCP Toolbox", week: 10, description: "Expose local tools through MCP." },
  { id: 10, name: "Marketing Capstone", week: 12, description: "Client-style competitor/content research automation." },
  { id: 11, name: "Coding Capstone", week: 12, description: "Narrow repository review agent with tests and controlled write operations." },
];
