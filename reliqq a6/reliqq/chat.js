import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

env.allowRemoteModels = true;
env.allowLocalModels = false;

const MODEL = "onnx-community/Qwen2.5-0.5B-Instruct";
const SYSTEM = {
    role: "system",
    content:
        "Você é a assistente virtual do RELIQQ, uma marca de moda criada na Fatec de Carapicuíba pelo encontro do ABC paulista com a zona oeste de São Paulo. " +
        "A marca tem duas coleções: roupas antigas (garimpos dos anos 2000, com cintura baixa, estrelas e borboletas) e roupas customizadas (peças únicas com patches, correntes e bordados feitos à mão). " +
        "Responda sempre em português do Brasil, de forma curta, simpática e clara. Se não souber algo sobre a loja, diga que não tem essa informação e não invente preços, prazos ou estoque."
};

/* ----- monta o HTML do chat (só precisa de 2 tags em cada página) ----- */
document.body.insertAdjacentHTML("beforeend", `
<button class="chat-fab" id="chat-fab" aria-label="Abrir chat com a IA">💬 Chat IA</button>
<section class="chat-painel" id="chat-painel" aria-label="Chat com assistente RELIQQ" hidden>
  <div class="chat-topo">
    <strong>RELIQQ IA</strong>
    <div>
      <button type="button" id="chat-clear">Limpar</button>
      <button type="button" id="chat-close" aria-label="Fechar chat">✕</button>
    </div>
  </div>
  <div id="chat-status">Aguardando...</div>
  <div id="chat-msgs" aria-live="polite">
    <p class="chat-boasvindas" id="chat-welcome">Oi! Sou a assistente do RELIQQ. Pergunte sobre as coleções, peças ou dicas de estilo.</p>
  </div>
  <div id="chat-typing" hidden>IA está digitando...</div>
  <form id="chat-form">
    <textarea id="chat-input" rows="1" placeholder="Digite sua mensagem..." disabled></textarea>
    <button id="chat-send" type="submit" disabled>Enviar</button>
  </form>
</section>`);

const $ = (id) => document.getElementById(id);
const fab = $("chat-fab"), painel = $("chat-painel"), statusEl = $("chat-status");
const msgsEl = $("chat-msgs"), welcome = $("chat-welcome"), typing = $("chat-typing");
const form = $("chat-form"), input = $("chat-input"), sendBtn = $("chat-send");

let generator = null;
let loading = false;
let busy = false;
let messages = [SYSTEM];

/* ----- histórico guardado na aba, para sobreviver à troca de página ----- */
function salvar() {
    try { sessionStorage.setItem("reliqq-chat", JSON.stringify(messages.slice(1))); } catch {}
}
function restaurar() {
    try {
        const salvo = JSON.parse(sessionStorage.getItem("reliqq-chat") || "[]");
        salvo.forEach((m) => { messages.push(m); addMessage(m.role, m.content); });
    } catch {}
}

function setStatus(texto, tipo = "") {
    statusEl.textContent = texto;
    statusEl.className = tipo;
    statusEl.id = "chat-status";
}

function addMessage(role, texto) {
    welcome.hidden = true;
    const el = document.createElement("div");
    el.className = "chat-msg " + role;
    el.textContent = texto;
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
}

async function hasWorkingWebGPU() {
    try {
        if (!navigator.gpu) return false;
        return !!(await navigator.gpu.requestAdapter());
    } catch { return false; }
}

function onProgress(p) {
    if (p.status === "progress" && typeof p.progress === "number") {
        setStatus(`Baixando modelo: ${Math.round(p.progress)}%`);
    }
}

function onReady(label) {
    setStatus(`Pronto (${label})`, "ready");
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
}

async function loadModel() {
    if (generator || loading) return;
    loading = true;
    setStatus("Carregando modelo... (a 1ª vez baixa ~500 a 800 MB)");
    try {
        if (await hasWorkingWebGPU()) {
            try {
                generator = await pipeline("text-generation", MODEL, {
                    device: "webgpu", dtype: "q4", progress_callback: onProgress
                });
                return onReady("WebGPU");
            } catch (e) { console.warn("WebGPU falhou, tentando WASM", e); }
        }
        generator = await pipeline("text-generation", MODEL, {
            device: "wasm", dtype: "int8", progress_callback: onProgress
        });
        onReady("WASM, mais lento");
    } catch (e) {
        console.error(e);
        setStatus("Erro: " + (e?.message || e) + ". Tente no Chrome ou Edge.", "error");
    } finally {
        loading = false;
    }
}

async function generate(userText) {
    messages.push({ role: "user", content: userText });
    busy = true;
    input.disabled = sendBtn.disabled = true;
    typing.hidden = false;
    try {
        const output = await generator(messages, {
            max_new_tokens: 256,
            repetition_penalty: 1.1,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true
        });
        const reply = output[0].generated_text.at(-1).content.trim();
        messages.push({ role: "assistant", content: reply });
        addMessage("assistant", reply);
        salvar();
    } catch (e) {
        console.error(e);
        messages.pop();
        setStatus("Erro ao gerar resposta: " + (e?.message || e), "error");
    } finally {
        busy = false;
        typing.hidden = true;
        input.disabled = sendBtn.disabled = false;
        input.focus();
    }
}

/* ----- eventos ----- */
function abrir() {
    painel.hidden = false;
    fab.hidden = true;
    loadModel();                // só baixa o modelo quando a pessoa abre o chat
    input.focus();
}
function fechar() { painel.hidden = true; fab.hidden = false; }

fab.addEventListener("click", abrir);
$("chat-close").addEventListener("click", fechar);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !painel.hidden) fechar(); });

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto || !generator || busy) return;
    addMessage("user", texto);
    input.value = "";
    input.style.height = "auto";
    generate(texto);
});

input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
});
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
});

$("chat-clear").addEventListener("click", () => {
    if (busy) return;
    messages = [SYSTEM];
    msgsEl.querySelectorAll(".chat-msg").forEach((m) => m.remove());
    welcome.hidden = false;
    salvar();
});

restaurar();
