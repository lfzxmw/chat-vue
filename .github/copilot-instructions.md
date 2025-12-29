# Copilot instructions for chat-vue

Short, focused guidance to help an AI coding agent be immediately productive in this repo.

## Project summary
- Single-page Vue 3 + Vite application (see `package.json` scripts: `dev`, `build`, `preview`).
- Client-only app that calls an external LLM-compatible API (DashScope) directly from the browser.
- State is managed with Pinia; UI is composed with Vue 3 `<script setup>` SFCs.

## Key files & responsibilities
- `src/main.js` — Vue app bootstrap; Pinia is registered here.
- `src/stores/chat.js` — Core logic for messaging: `messages`, `isLoading`, `currentModel`, `availableModels`, `sendMessage(content)`, `setModel(modelId)`.
  - This is the primary place to modify model/payload behavior, error handling, and call routing.
- `src/App.vue` — Main UI: model switcher, messages list, input handling, uses `storeToRefs` for reactive state.
- `src/components` — Reusable components (currently `HelloWorld.vue` in template form).
- `.env` — Vite environment variables are used here (notably `VITE_DASHSCOPE_API_KEY`).
- `dist/` — Build output. Be cautious: the build contains client-inlined values from `VITE_` env vars.

## Architecture & data flow (what to know)
- User types -> `App.vue` calls `chatStore.sendMessage(content)` -> `sendMessage` appends a user message to `messages`, sets `isLoading`, POSTs to DashScope compatible endpoint and appends assistant reply on success.
- Models are chosen from `availableModels` in the store; each `id` maps to a DashScope model name.
- All conversation state is stored client-side in `messages` (no server persistence by default).

## Important conventions & patterns
- Vue 3 SFCs using `<script setup>` and Composition API (`ref`, `watch`, `nextTick`). Follow existing patterns when adding components.
- Pinia store is defined with the setup-style `defineStore('chat', () => { ... })` and exposes reactive refs and actions.
- Use `storeToRefs` in components where necessary to maintain reactivity for destructured store state.
- `availableModels` is treated as a constant list (defined inside the store). Update it there when adding or removing models.
- Network calls use `fetch` and `async/await` with `try/catch` in `sendMessage`. Follow the same error reporting approach (console + add assistant message on error).

## Dev & debug workflows (explicit commands)
- Install: `npm install` (or `pnpm`/`yarn` per preference).
- Run dev server with HMR: `npm run dev` (default Vite port 5173 → open browser and watch console/network for API calls).
- Build for production: `npm run build`; preview build: `npm run preview`.
- To reproduce or mock API behavior locally: change `src/stores/chat.js` to return mocked assistant content before wiring real API calls.

## Environment & security notes (must-read)
- The API key is read from `import.meta.env.VITE_DASHSCOPE_API_KEY` (Vite env prefix required). Example file present: `.env`.
- Do NOT commit long-lived API keys to the repo. Prefer: (1) move API calls behind a server-side proxy, or (2) use short-lived keys and server-side injection.
- Add `.env` to `.gitignore` if keeping secrets locally. If keys were committed accidentally, rotate them immediately.

## Integration & extension hints
- To switch providers or endpoints: update `API_URL` and adapt request body in `sendMessage`. Keep payload shape compatible with existing UI expectations (expects `data.choices[0].message.content`).
- To implement streaming responses: set `stream: true` in the request (server must support it) and implement incremental updates to `messages` from chunks; update UI to reflect streaming state.
- To add richer prompts (system messages, tool calls): push initial system messages into `messages` (before user input) so they are included in subsequent `messages` payloads.

## Good-first issues for contributors
- Move API key usage to a secure server-side proxy and update `sendMessage` to call the proxy.
- Add unit tests around `sendMessage` logic (mock fetch) and store actions.
- Add input sanitization and rate-limiting to prevent accidental spam.

## Quick examples (copyable)
- To add a new model choice: edit `src/stores/chat.js`:
  const availableModels = [
    { id: 'qwen-turbo', name: 'Qwen Turbo (快速)' },
    { id: 'qwen-plus', name: 'Qwen Plus (均衡)' },
    { id: 'qwen-max', name: 'Qwen Max (最强)' },
    // Add new model here
  ]

- To change temperature for each model dynamically: add a `modelSettings` map in the store and use `modelSettings[currentModel.value].temperature` when building request body.

---

If any of the above sections are unclear or you'd like the instructions to be more prescriptive in certain areas (tests, CI, or security remediation steps), tell me which parts to expand and I will iterate. ✅