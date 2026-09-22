-- seed.sql
-- Seed data for curriculum tables (verbatim from Section 5 of planner.md)

-- 5.1 & 5.2 Weeks
insert into weeks (id, title, goal, mini_project, move_on_check, resources)
values
(
  1,
  'Python for Agent Builders',
  'Read, modify, and debug the Python used by agent examples.',
  'Toolbox CLI: five functions (calculator, read_text_file, count_words, save_json, load_json) called from a menu-driven terminal program.',
  'Explain a dictionary, JSON-like object, function argument, exception, import, and file path without looking them up.',
  '[
    {"label": "Python Tutorial", "url": "https://docs.python.org/3/tutorial/"},
    {"label": "CS50P", "url": "https://cs50.harvard.edu/python/"},
    {"label": "Exercism Python", "url": "https://exercism.org/tracks/python"}
  ]'::jsonb
),
(
  2,
  'HTTP, JSON, APIs, and Small Web Services',
  'Understand how a Python program talks to the outside world.',
  'Script that calls one public API, converts the response to a dict, saves clean JSON, prints a summary — then wrap it in a tiny FastAPI endpoint.',
  'Send a request, inspect the response, identify an error status, store a key in an env var, and explain JSON to a beginner.',
  '[
    {"label": "MDN HTTP Overview", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview"},
    {"label": "FastAPI Tutorial", "url": "https://fastapi.tiangolo.com/tutorial/"},
    {"label": "Pro Git", "url": "https://git-scm.com/book/en/v2"}
  ]'::jsonb
),
(
  3,
  'LLM Application Foundations',
  'Move from "I use ChatGPT" to "I can build an LLM-powered program."',
  'Paper exercise: one user request designed three ways — plain prompt, single-API-call app, agentic workflow — with the differences written down.',
  'Explain the difference between a chatbot, an LLM application, a workflow, and an agent without buzzwords.',
  '[
    {"label": "HF LLM Course", "url": "https://huggingface.co/learn/llm-course/chapter0/1"},
    {"label": "HF Agents Course Unit 0", "url": "https://huggingface.co/learn/agents-course/unit0/introduction"},
    {"label": "HF Agents Unit 1", "url": "https://huggingface.co/learn/agents-course/unit1/introduction"},
    {"label": "Anthropic: Building Effective Agents", "url": "https://www.anthropic.com/engineering/building-effective-agents"}
  ]'::jsonb
),
(
  4,
  'Structured Outputs and Tool Calling',
  'Teach a model to produce machine-usable decisions and tool calls.',
  'Three tools: calculator, search-local-file, simple database lookup. Model/tool interaction only — no agent yet.',
  'Describe the 6-step tool-calling flow: schema → model → tool call → validate/execute → result back → next step or answer.',
  '[
    {"label": "OpenAI Function Calling", "url": "https://developers.openai.com/api/docs/guides/function-calling"},
    {"label": "OpenAI Structured Outputs", "url": "https://developers.openai.com/api/docs/guides/structured-outputs"},
    {"label": "Gemini Function Calling", "url": "https://ai.google.dev/gemini-api/docs/function-calling"},
    {"label": "Pydantic Models", "url": "https://docs.pydantic.dev/latest/concepts/models/"},
    {"label": "Microsoft AI Agents for Beginners", "url": "https://github.com/microsoft/ai-agents-for-beginners"}
  ]'::jsonb
),
(
  5,
  'Build an Agent Loop From Scratch',
  'Understand the core control loop without any framework.',
  'Research Assistant v1: goal → tool calls → results → final answer over local files, with logging and a max-turn limit.',
  'Explain why the application, not the model, executes tools — and show your own working loop.',
  '[
    {"label": "HF Agents Unit 1", "url": "https://huggingface.co/learn/agents-course/unit1/introduction"},
    {"label": "Gemini Function Calling", "url": "https://ai.google.dev/gemini-api/docs/function-calling"},
    {"label": "Microsoft AI Agents for Beginners", "url": "https://github.com/microsoft/ai-agents-for-beginners"}
  ]'::jsonb
),
(
  6,
  'State, Memory, Embeddings, and RAG',
  'Give the agent access to information beyond the current turn.',
  'Personal Knowledge Agent: index a folder of notes into a local Chroma store, retrieve top matches, answer with snippets attached.',
  'Draw the retrieval path: documents → chunk/index → query → embedding/search → retrieved context → model → answer.',
  '[
    {"label": "LlamaIndex RAG", "url": "https://docs.llamaindex.ai/en/stable/understanding/rag/"},
    {"label": "Sentence Transformers semantic search", "url": "https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html"},
    {"label": "Chroma Getting Started", "url": "https://docs.trychroma.com/docs/overview/getting-started"},
    {"label": "LangChain Learn", "url": "https://docs.langchain.com/oss/python/learn"}
  ]'::jsonb
),
(
  7,
  'Planning, Workflows, and Agentic Patterns',
  'Know when to use a deterministic workflow, a single agent, or a multi-step pattern.',
  'Competitor research workflow diagram: every box marked deterministic, LLM decision, or tool execution.',
  'Answer "what is the smallest amount of autonomy needed?" for a given task and justify it.',
  '[
    {"label": "Anthropic: Building Effective Agents", "url": "https://www.anthropic.com/engineering/building-effective-agents"},
    {"label": "Microsoft Study Guide", "url": "https://github.com/microsoft/ai-agents-for-beginners/blob/main/STUDY_GUIDE.md"}
  ]'::jsonb
),
(
  8,
  'LangGraph — Framework After Fundamentals',
  'Translate the manual agent ideas into an explicit stateful graph.',
  'Research Agent v2: planner, research, evaluator, and finalizer nodes with explicit state.',
  'Point to every part of the graph and explain why it exists.',
  '[
    {"label": "LangGraph Overview", "url": "https://docs.langchain.com/oss/python/langgraph/overview"},
    {"label": "LangChain Learn", "url": "https://docs.langchain.com/oss/python/learn"}
  ]'::jsonb
),
(
  9,
  'Multi-Agent Systems',
  'Learn delegation without multi-agent hype.',
  'Marketing Research Team: coordinator plus Researcher, Analyst, Reviewer specialists, each kept narrow.',
  'Explain manager/specialist, handoffs, agents-as-tools, and shared vs isolated context.',
  '[
    {"label": "OpenAI Agents SDK", "url": "https://openai.github.io/openai-agents-python/"},
    {"label": "LangGraph Overview", "url": "https://docs.langchain.com/oss/python/langgraph/overview"},
    {"label": "HF Agents Course", "url": "https://huggingface.co/learn/agents-course/unit0/introduction"}
  ]'::jsonb
),
(
  10,
  'MCP — Model Context Protocol',
  'Understand how tools/data are exposed through a standard protocol.',
  'MCP Toolbox Server: expose list-files, read-file, and search-text; connect one compatible client.',
  'Explain the progression: function → tool → tool collection → external tool server → MCP client/server.',
  '[
    {"label": "MCP Introduction", "url": "https://modelcontextprotocol.io/introduction"},
    {"label": "MCP Python SDK", "url": "https://py.sdk.modelcontextprotocol.io/get-started/"}
  ]'::jsonb
),
(
  11,
  'Reliability, Evaluation, Guardrails, and Testing',
  'Make agents dependable systems, not impressive demos.',
  'Evaluation set of 20 tasks for the Research Agent; record pass/fail and failure reasons; change the system once and rerun.',
  'Show repeatable tests covering failure paths, step limits, and guardrail checks.',
  '[
    {"label": "OpenAI Agents SDK", "url": "https://openai.github.io/openai-agents-python/"},
    {"label": "Microsoft Study Guide", "url": "https://github.com/microsoft/ai-agents-for-beginners/blob/main/STUDY_GUIDE.md"},
    {"label": "Google ADK Quickstart", "url": "https://adk.dev/get-started/quickstart/"},
    {"label": "pytest", "url": "https://docs.pytest.org/en/stable/getting-started.html"}
  ]'::jsonb
),
(
  12,
  'Capstones + Freelance Transition',
  'Turn the skills into portfolio pieces that solve business problems.',
  'Capstone A: Marketing Research & Content Agent. Capstone B: narrow Repository Review Agent with tests and controlled writes.',
  'Ship one client-style system with README, demo, evaluation set, and stated limitations.',
  '[
    {"label": "Anthropic: Building Effective Agents", "url": "https://www.anthropic.com/engineering/building-effective-agents"},
    {"label": "Microsoft Study Guide", "url": "https://github.com/microsoft/ai-agents-for-beginners/blob/main/STUDY_GUIDE.md"}
  ]'::jsonb
)
on conflict (id) do update set
  title = excluded.title,
  goal = excluded.goal,
  mini_project = excluded.mini_project,
  move_on_check = excluded.move_on_check,
  resources = excluded.resources;

-- 5.3 Starter sessions
insert into starter_sessions (id, focus, resource)
values
(1, 'Python: functions + dictionaries', 'Python official tutorial'),
(2, 'Python: files + exceptions', 'Python official tutorial'),
(3, 'Git basics', 'Pro Git, chapters 1–2 (selected)'),
(4, 'HTTP request/response', 'MDN HTTP overview'),
(5, 'JSON + API call', 'MDN + a simple public API'),
(6, 'LLM application mental model', 'HF LLM Course intro + HF Agents Unit 1 intro'),
(7, 'Agent definitions + use cases', 'HF Agents Unit 1'),
(8, 'Tools and tool schemas', 'OpenAI Function Calling + Google Function Calling'),
(9, 'Structured output', 'OpenAI Structured Outputs + Pydantic'),
(10, 'Build first tool call', 'Your own Python tool + a free model'),
(11, 'Tool result loop', 'Google function calling / HF Agents examples'),
(12, 'Manual agent loop', 'Your own implementation, no framework'),
(13, 'Failure handling + max steps', 'pytest + your logs'),
(14, 'Mini project demo + README', 'GitHub repository, screenshot, explanation')
on conflict (id) do update set
  focus = excluded.focus,
  resource = excluded.resource;

-- 5.4 Projects
insert into projects (id, name, week, description)
values
(1, 'Python Toolbox', 1, 'Functions, JSON, files, exceptions. Goal: confidence.'),
(2, 'API Data Reporter', 2, 'Call an API, normalize JSON, produce a report.'),
(3, 'Three-Tool LLM App', 4, 'Model selects among calculator/file/database tools.'),
(4, 'Agent Loop from Scratch', 5, 'Goal → tool calls → tool results → final output.'),
(5, 'Personal Knowledge Agent', 6, 'Retrieval + context + answer.'),
(6, 'Research Workflow', 7, 'Planner/evaluator pattern with explicit boundaries.'),
(7, 'LangGraph Research Agent', 8, 'Explicit state graph with loops and evaluation.'),
(8, 'Marketing Agent Team', 9, 'Researcher + analyst + reviewer.'),
(9, 'MCP Toolbox', 10, 'Expose local tools through MCP.'),
(10, 'Marketing Capstone', 12, 'Client-style competitor/content research automation.'),
(11, 'Coding Capstone', 12, 'Narrow repository review agent with tests and controlled write operations.')
on conflict (id) do update set
  name = excluded.name,
  week = excluded.week,
  description = excluded.description;
