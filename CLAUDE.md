@AGENTS.md
# Agent Guidelines
- Your built-in tool "WebSearch" does not function on this local system.
- Whenever the user asks you to search the web, research, or lookup documentation, you MUST use the alternative tools provided by your connected `serper` MCP server (such as `google_search` or `google-search`). 
- Do not attempt to use any other web-search mechanism.
- 
## Important Rules for Local Model Operations

1. **Be Concise and Direct:** Do not include long conversational preambles or post-ambles. Output only the requested code or action.
2. **Strict Tool Usage:** When modifying files, always use your explicit Write/Edit tool. Do not just print file contents in standard chat blocks for the user to copy-paste.
3. **Limit Scratchpads:** Avoid generating unnecessary temporary files or Python scratchpads unless explicitly asked to run tests.
4. **Scope Limitations:** Do not attempt large-scale, multi-file refactoring at once. Focus on one file or a single isolated function at a time.
