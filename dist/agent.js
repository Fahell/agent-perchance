var h="";function f(e){h=e}function E(){return h}async function x(e){try{return(await fetch("https://s.jina.ai/",{method:"POST",headers:{Authorization:`Bearer ${e}`,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({q:"test"})})).ok}catch{return!1}}function I(e){return{Authorization:`Bearer ${h}`,"Content-Type":"application/json",Accept:"application/json",...e}}async function R(e,t=5){let n=await fetch("https://s.jina.ai/",{method:"POST",headers:I({"X-Return-Format":"json"}),body:JSON.stringify({q:e,num:t})});if(!n.ok)throw new Error(`Jina search failed: ${n.status} ${n.statusText}`);let o=await n.json(),r=(o.data||o||[]).slice(0,t).map(i=>({title:i.title||"",url:i.url||"",description:i.description||"",content:i.content||""})),a=r.map((i,l)=>`[${l+1}] ${i.title}
    ${i.url}
    ${i.description}`).join(`

`);return{query:e,results:r,raw:a}}async function P(e,t=5e3){let n=await fetch("https://r.jina.ai/",{method:"POST",headers:I({Accept:"text/markdown"}),body:JSON.stringify({url:e})});if(!n.ok)throw new Error(`Jina scrape failed: ${n.status} ${n.statusText}`);let o=await n.text(),r=o.match(/^#\s+(.+)/m),a=r?r[1]:new URL(e).hostname,i=o.length>t?o.slice(0,t)+`

[...truncated]`:o;return{url:e,title:a,content:i}}var v={web_search:{name:"web_search",description:"Search the web for REAL-TIME or CURRENT information. USE this for: prices, exchange rates, sports results, news, weather, events, recent facts, or anything you are not 100% sure about. Returns up to 5 results with titles, URLs, and descriptions.",parameters:{query:"The search query string. Be specific \u2014 include topic, year, or context when relevant."},execute:async e=>(await R(e.query,5)).raw||"No results found."},scrape_url:{name:"scrape_url",description:"Fetch and extract the full text content from a specific URL as markdown. USE this when you have a URL and need to read its content.",parameters:{url:"The full URL to scrape (must start with http:// or https://)"},execute:async e=>{let t=await P(e.url,5e3);return`# ${t.title}

${t.content}`}}};function $(e){return v[e]}function C(){return Object.values(v).map(e=>`- ${e.name}: ${e.description}
  Parameters: ${JSON.stringify(e.parameters)}`).join(`
`)}function M(e){return e in v}var D=5;var b=/<tool_call\s+name="(\w+)">\s*(\{.*?\})\s*<\/tool_call>/gs;function H(){return`You are a helpful assistant with access to web search.

Available tools:
${C()}

IMPORTANT RULES:
- ALWAYS use web_search when the user asks about real-time data (prices, scores, news, weather, dates, events).
- For general knowledge you are confident about, answer directly.
- When unsure, search first \u2014 it's better to search than to guess.

To use a tool, output EXACTLY this format on its own line:
<tool_call name="tool_name">{"param":"value"}</tool_call>

You may output ONE tool_call per response, followed by a brief note.
After receiving tool results, give your FINAL answer \u2014 do NOT output more tool_calls.
Never make up data \u2014 if the search fails, tell the user.`}function F(e){let t=[],n;for(b.lastIndex=0;(n=b.exec(e))!==null;){let[,o,r]=n;try{let a=JSON.parse(r);M(o)&&t.push({name:o,args:a})}catch{console.warn(`[Agent] Failed to parse tool_call args: ${r}`)}}return t}function J(e){return e.replace(b,"").trim()}async function O(e,t,n=[],o,r){let i=H()+`

`;if(n.length>0){i+=`Recent conversation:
`;for(let m of n){let p=m.role==="user"?"User":"Assistant";i+=`${p}: ${m.content}
`}i+=`
`}i+=`User message: ${t}`;let l=0;for(;l<D;){l++,o?.(`Thinking... (step ${l})`);let p=(await e.generateText({instruction:i})).toString(),k=F(p);if(k.length===0)return J(p);for(let c of k){let _=$(c.name);if(_){o?.(`Using ${c.name}...`);try{let d=await _.execute(c.args);r?.(c.name,c.args,d);let g=`

[Tool Result - ${c.name}]:
${d}

Now respond to the user based on this information. Do NOT use any more tools \u2014 give your final answer.`;i+=g}catch(d){let g=d instanceof Error?d.message:String(d);console.error(`[Agent] Tool ${c.name} failed:`,g),i+=`

[Tool Error - ${c.name}]: ${g}

The tool failed. Respond to the user explaining the issue.`}}}}return"I apologize, but I wasn't able to complete that task after multiple attempts."}function A(e){return new Promise((t,n)=>{e.oncomplete=e.onsuccess=()=>t(e.result),e.onabort=e.onerror=()=>n(e.error)})}function u(e,t){let n,o=()=>{if(n)return n;let r=indexedDB.open(e);return r.onupgradeneeded=()=>r.result.createObjectStore(t),n=A(r),n.then(a=>{a.onclose=()=>n=void 0},()=>{}),n};return(r,a)=>o().then(i=>a(i.transaction(t,r).objectStore(t)))}var w;function z(){return w||(w=u("keyval-store","keyval")),w}function L(e,t=z()){return t("readonly",n=>A(n.get(e)))}function N(e,t,n=z()){return n("readwrite",o=>(o.put(t,e),A(o.transaction)))}var V=u("agent-config","config"),G=u("agent-history","messages"),W=u("agent-state","runtime");function B(e){switch(e){case"config":return V;case"history":return G;case"state":return W}}async function j(e,t="config"){try{return await L(e,B(t))}catch(n){console.warn(`[Storage] get("${e}") failed:`,n);return}}async function K(e,t,n="config"){try{await N(e,t,B(n))}catch(o){console.warn(`[Storage] set("${e}") failed:`,o)}}var s=window.oc,y=!1,q=10;function X(){console.log("\u{1F916} Agent v0.1.0+dev"),console.log("   Build: 2026-06-27 21:29:12"),console.log("   https://github.com/Fahell/agent-perchance")}async function Y(){try{return await j("jina_key")??null}catch{return null}}async function U(e){await K("jina_key",e)}function Q(){return s?s.thread?typeof s.generateText!="function"?(console.error("\u274C [Agent] oc.generateText not available"),!1):!0:(console.error("\u274C [Agent] oc.thread not available"),!1):(console.error("\u274C [Agent] window.oc not found \u2014 are you running inside Perchance?"),!1)}function Z(){document.body.innerHTML=`
    <div style="font-family: system-ui; padding: 24px; background: #1a1a2e; color: #eee; height: 100vh; margin: 0; display: flex; align-items: center; justify-content: center;">
      <div style="max-width: 480px; width: 100%;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; margin-bottom: 8px;">\u{1F916}</div>
          <h2 style="margin: 0; color: #00d4ff; font-size: 20px;">Agent for Perchance</h2>
          <span style="font-size: 11px; color: #666;">v0.1.0+dev</span>
        </div>
        <div style="background: #16213e; border-radius: 12px; padding: 20px; border: 1px solid #2a3a5e;">
          <h3 style="margin: 0 0 12px 0; color: #eee; font-size: 15px;">\u26A1 Setup \u2014 Chave de API da Jina</h3>
          <p style="color: #aaa; font-size: 13px; margin: 0 0 12px 0; line-height: 1.5;">
            Para usar busca na web, voc\xEA precisa de uma chave de API <strong style="color: #4ade80;">gratuita</strong> da Jina AI.
          </p>
          <ol style="color: #aaa; font-size: 13px; margin: 0 0 16px 0; padding-left: 20px; line-height: 1.8;">
            <li>Acesse <a href="https://jina.ai/?sui=apikey" target="_blank" style="color: #00d4ff; text-decoration: none;">jina.ai/?sui=apikey</a></li>
            <li>Crie uma conta gratuita (ou fa\xE7a login)</li>
            <li>Copie sua chave de API</li>
            <li>Cole no campo abaixo</li>
          </ol>
          <div style="margin-bottom: 12px;">
            <input id="api-key-input" type="password" placeholder="jina_xxxxxxxxxxxx..."
              style="width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #2a3a5e; background: #0f3460; color: #eee; font-size: 14px; font-family: monospace; box-sizing: border-box; outline: none;"
            />
          </div>
          <div id="api-key-error" style="display: none; color: #f87171; font-size: 12px; margin-bottom: 8px;"></div>
          <div id="api-key-success" style="display: none; color: #4ade80; font-size: 12px; margin-bottom: 8px;"></div>
          <button id="api-key-save" style="width: 100%; padding: 10px; border-radius: 8px; border: none; background: #00d4ff; color: #1a1a2e; font-size: 14px; font-weight: bold; cursor: pointer;">
            Salvar e Iniciar
          </button>
          <button id="api-key-skip" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #2a3a5e; background: transparent; color: #666; font-size: 12px; cursor: pointer; margin-top: 8px;">
            Pular (sem busca na web)
          </button>
        </div>
        <p style="color: #555; font-size: 11px; text-align: center; margin-top: 16px;">
          \u2139\uFE0F Sua chave \xE9 salva localmente neste navegador e nunca \xE9 compartilhada.
        </p>
      </div>
    </div>
  `;let e=document.getElementById("api-key-input"),t=document.getElementById("api-key-save"),n=document.getElementById("api-key-skip"),o=document.getElementById("api-key-error"),r=document.getElementById("api-key-success");async function a(){let i=e.value.trim();if(!i){o.textContent="Por favor, insira uma chave de API.",o.style.display="block",r.style.display="none";return}t.textContent="Validando...",t.disabled=!0,o.style.display="none",r.style.display="none",await x(i)?(await U(i),f(i),r.textContent="\u2705 Chave v\xE1lida! Iniciando...",r.style.display="block",console.log("\u{1F511} [Agent] API key saved to IndexedDB"),setTimeout(()=>T(),800)):(o.textContent="\u274C Chave inv\xE1lida. Verifique e tente novamente.",o.style.display="block",t.textContent="Salvar e Iniciar",t.disabled=!1)}t.addEventListener("click",a),e.addEventListener("keydown",i=>{i.key==="Enter"&&a()}),n.addEventListener("click",()=>{console.log("\u23ED\uFE0F [Agent] Setup skipped (no API key)"),T()}),s.window.show()}function ee(){document.body.innerHTML=`
    <div style="font-family: system-ui; padding: 16px; background: #1a1a2e; color: #eee; height: 100vh; margin: 0; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="margin: 0; color: #00d4ff; font-size: 16px;">\u{1F916} Agent Panel</h2>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; color: #666;">v0.1.0+dev</span>
          <button id="settings-btn" style="background: none; border: 1px solid #2a3a5e; color: #666; font-size: 11px; padding: 2px 8px; border-radius: 4px; cursor: pointer;">\u2699\uFE0F</button>
        </div>
      </div>
      <div id="agent-output" style="flex: 1; overflow-y: auto; font-size: 13px;"></div>
    </div>
  `,document.getElementById("settings-btn").addEventListener("click",te),s.window.show(),console.log("\u{1FA9F} [Agent] Window opened")}function te(){let e=E(),t=e?e.slice(0,8)+"..."+e.slice(-4):"Nenhuma",n=document.createElement("div");n.id="settings-overlay",n.style.cssText="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:center;justify-content:center;font-family:system-ui;",n.innerHTML=`
    <div style="background:#16213e;border-radius:12px;padding:20px;max-width:400px;width:90%;border:1px solid #2a3a5e;">
      <h3 style="margin:0 0 12px;color:#eee;font-size:15px;">\u2699\uFE0F Configura\xE7\xF5es</h3>
      <div style="margin-bottom:12px;">
        <label style="color:#aaa;font-size:12px;display:block;margin-bottom:4px;">Chave de API da Jina:</label>
        <div style="display:flex;gap:8px;">
          <input id="settings-key-input" type="password" value="${e}" placeholder="jina_xxx..."
            style="flex:1;padding:8px;border-radius:6px;border:1px solid #2a3a5e;background:#0f3460;color:#eee;font-size:13px;font-family:monospace;box-sizing:border-box;outline:none;" />
        </div>
        <div style="color:#666;font-size:11px;margin-top:4px;">Atual: ${t}</div>
      </div>
      <div id="settings-msg" style="display:none;font-size:12px;margin-bottom:8px;"></div>
      <div style="display:flex;gap:8px;">
        <button id="settings-save" style="flex:1;padding:8px;border-radius:6px;border:none;background:#00d4ff;color:#1a1a2e;font-size:13px;font-weight:bold;cursor:pointer;">Salvar</button>
        <button id="settings-close" style="flex:1;padding:8px;border-radius:6px;border:1px solid #2a3a5e;background:transparent;color:#aaa;font-size:13px;cursor:pointer;">Fechar</button>
      </div>
    </div>
  `,document.body.appendChild(n),document.getElementById("settings-close").addEventListener("click",()=>n.remove()),document.getElementById("settings-save").addEventListener("click",async()=>{let o=document.getElementById("settings-key-input").value.trim(),r=document.getElementById("settings-msg");if(!o){r.textContent="Insira uma chave.",r.style.color="#f87171",r.style.display="block";return}r.textContent="Validando...",r.style.color="#aaa",r.style.display="block",await x(o)?(await U(o),f(o),r.textContent="\u2705 Chave salva!",r.style.color="#4ade80",setTimeout(()=>n.remove(),1e3)):(r.textContent="\u274C Chave inv\xE1lida.",r.style.color="#f87171")})}function ne(e){return e.trim().startsWith("/agent")}function oe(e){let t=e.trim();t==="/agent open"?(s.window.show(),console.log("\u{1FA9F} [Agent] Window opened")):t==="/agent close"&&(s.window.hide(),console.log("\u{1FA9F} [Agent] Window closed"))}function S(e){let t=document.getElementById("agent-output");t&&(t.innerHTML+=e,t.scrollTop=t.scrollHeight)}async function re(e){console.log("\u{1F916} [Agent] Processing:",e.content.slice(0,80)),S(`<div style="margin: 8px 0; padding: 8px; background: #16213e; border-radius: 6px; border-left: 3px solid #00d4ff;">
    <div style="color: #00d4ff; font-weight: bold;">\u{1F4E8} ${e.content.slice(0,80)}</div>
  </div>`);let t=s.thread.messages.filter(o=>(o.author==="user"||o.author==="ai")&&o!==e).slice(-q).map(o=>({role:o.author==="user"?"user":"assistant",content:o.content})),n=await O(s,e.content,t,o=>{console.log("\u{1F916} [Agent]",o)},(o,r,a)=>{let i=r.query||r.url||"",l=a.slice(0,300).replace(/\n/g," ");S(`<div style="margin: 4px 0 4px 12px; padding: 6px; background: #0f3460; border-radius: 4px; border-left: 2px solid #4ade80;">
        <div style="color: #4ade80; font-size: 12px;">\u{1F527} ${o}: ${i}</div>
        <div style="color: #aaa; font-size: 11px; margin-top: 4px;">${l}...</div>
      </div>`)});console.log("\u{1F916} [Agent] Response:",n.slice(0,100)),y=!1,s.thread.messages.push({author:"ai",content:n}),S(`<div style="margin: 4px 0 8px 12px; padding: 6px; background: #1a1a2e; border-radius: 4px; border-left: 2px solid #00d4ff;">
    <div style="color: #00d4ff; font-size: 12px;">\u2705 Response sent to chat (${n.length} chars)</div>
  </div>`)}function T(){ee(),s.thread.on("MessageAdded",function({message:e}){if(e.author==="user"&&(e.expectsReply=!1,e.hiddenFrom||(e.hiddenFrom=[]),e.hiddenFrom.includes("ai")||e.hiddenFrom.push("ai"),console.log("\u{1F6E1}\uFE0F [Agent] Set expectsReply=false, hiddenFrom=[ai] on user message")),e.author==="ai"&&y){let t=s.thread.messages.indexOf(e);t!==-1&&(s.thread.messages.splice(t,1),console.log("\u{1F5D1}\uFE0F [Agent] Removed internal generator message"));return}if(e.author==="user"){if(ne(e.content)){oe(e.content),setTimeout(()=>{let t=s.thread.messages.indexOf(e);t!==-1&&s.thread.messages.splice(t,1)},100);return}console.log("\u{1F4E8} [Agent] Processing:",e.content.slice(0,80)),y=!0,re(e).catch(t=>{y=!1,console.error("\u274C [Agent] Error:",t),s.thread.messages.push({author:"ai",content:`Sorry, I encountered an error: ${t instanceof Error?t.message:String(t)}`})})}}),console.log("\u2705 [Agent] Ready!")}async function ie(){X(),console.log("\u{1F680} [Agent] Loading...");let e=await Y();e?(f(e),console.log("\u{1F511} [Agent] API key loaded from IndexedDB"),T()):(console.log("\u{1F511} [Agent] No API key found \u2014 showing setup screen"),Z())}Q()&&ie();
