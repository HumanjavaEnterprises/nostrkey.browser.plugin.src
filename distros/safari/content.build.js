(()=>{var t=typeof browser<"u"?browser:typeof chrome<"u"?chrome:null;if(!t)throw new Error("browser-polyfill: No extension API namespace found (neither browser nor chrome).");var s=typeof browser>"u"&&typeof chrome<"u";function i(e,r){return(...o)=>{try{let n=r.apply(e,o);if(n&&typeof n.then=="function")return n}catch{}return new Promise((n,l)=>{r.apply(e,[...o,(...a)=>{t.runtime&&t.runtime.lastError?l(new Error(t.runtime.lastError.message)):n(a.length<=1?a[0]:a)}])})}}var c={};c.runtime={sendMessage(...e){return s?i(t.runtime,t.runtime.sendMessage)(...e):t.runtime.sendMessage(...e)},onMessage:t.runtime.onMessage,getURL(e){return t.runtime.getURL(e)},openOptionsPage(){return s?i(t.runtime,t.runtime.openOptionsPage)():t.runtime.openOptionsPage()},get id(){return t.runtime.id}};c.storage={local:{get(...e){return s?i(t.storage.local,t.storage.local.get)(...e):t.storage.local.get(...e)},set(...e){return s?i(t.storage.local,t.storage.local.set)(...e):t.storage.local.set(...e)},clear(...e){return s?i(t.storage.local,t.storage.local.clear)(...e):t.storage.local.clear(...e)},remove(...e){return s?i(t.storage.local,t.storage.local.remove)(...e):t.storage.local.remove(...e)}},sync:t.storage?.sync?{get(...e){return s?i(t.storage.sync,t.storage.sync.get)(...e):t.storage.sync.get(...e)},set(...e){return s?i(t.storage.sync,t.storage.sync.set)(...e):t.storage.sync.set(...e)},remove(...e){return s?i(t.storage.sync,t.storage.sync.remove)(...e):t.storage.sync.remove(...e)},clear(...e){return s?i(t.storage.sync,t.storage.sync.clear)(...e):t.storage.sync.clear(...e)},getBytesInUse(...e){return t.storage.sync.getBytesInUse?s?i(t.storage.sync,t.storage.sync.getBytesInUse)(...e):t.storage.sync.getBytesInUse(...e):Promise.resolve(0)}}:null,session:t.storage?.session?{get(...e){return s?i(t.storage.session,t.storage.session.get)(...e):t.storage.session.get(...e)},set(...e){return s?i(t.storage.session,t.storage.session.set)(...e):t.storage.session.set(...e)},remove(...e){return s?i(t.storage.session,t.storage.session.remove)(...e):t.storage.session.remove(...e)},clear(...e){return s?i(t.storage.session,t.storage.session.clear)(...e):t.storage.session.clear(...e)},setAccessLevel(...e){return t.storage.session.setAccessLevel?s?i(t.storage.session,t.storage.session.setAccessLevel)(...e):t.storage.session.setAccessLevel(...e):Promise.resolve()}}:null,onChanged:t.storage?.onChanged||null};c.tabs={create(...e){return s?i(t.tabs,t.tabs.create)(...e):t.tabs.create(...e)},query(...e){return s?i(t.tabs,t.tabs.query)(...e):t.tabs.query(...e)},remove(...e){return s?i(t.tabs,t.tabs.remove)(...e):t.tabs.remove(...e)},update(...e){return s?i(t.tabs,t.tabs.update)(...e):t.tabs.update(...e)},get(...e){return s?i(t.tabs,t.tabs.get)(...e):t.tabs.get(...e)},getCurrent(...e){return s?i(t.tabs,t.tabs.getCurrent)(...e):t.tabs.getCurrent(...e)},sendMessage(...e){return s?i(t.tabs,t.tabs.sendMessage)(...e):t.tabs.sendMessage(...e)}};c.alarms=t.alarms?{create(...e){let r=t.alarms.create(...e);return r&&typeof r.then=="function"?r:Promise.resolve()},clear(...e){return s?i(t.alarms,t.alarms.clear)(...e):t.alarms.clear(...e)},onAlarm:t.alarms.onAlarm}:null;async function R(){if(window===window.top)return!0;try{if(!(await c.storage.local.get({blockCrossOriginFrames:!0})).blockCrossOriginFrames)return!0}catch{return!1}try{return window.top.location.href,!0}catch{return!1}}var I=crypto.randomUUID();R().then(e=>{if(!e)return;let r=document.createElement("script");r.setAttribute("src",c.runtime.getURL("nostr.build.js")),r.dataset.nkToken=I,document.body.appendChild(r)});var $={"instrument-dark":{base:"#0E0F13",panel:"#16181D",hair:"#2A2E37",text:"#E7E9EE",muted:"#8A90A0",signal:"#c084fc",signalDim:"rgba(192,132,252,0.16)"},"instrument-light":{base:"#F4F5F7",panel:"#FFFFFF",hair:"#DCDFE6",text:"#191B22",muted:"#626878",signal:"#7C3AED",signalDim:"rgba(124,58,237,0.12)"},"analog-dark":{base:"#141210",panel:"#1C1815",hair:"#352E25",text:"#EDE6DA",muted:"#A2937C",signal:"#fbbf24",signalDim:"rgba(251,191,36,0.14)"},"analog-light":{base:"#F4EAD6",panel:"#FCF6E8",hair:"#DBCAA4",text:"#33260F",muted:"#72613A",signal:"#984E09",signalDim:"rgba(152,78,9,0.12)"},"console-dark":{base:"#0B1220",panel:"#111A2B",hair:"#24314A",text:"#E6EDF6",muted:"#8391A8",signal:"#2dd4bf",signalDim:"rgba(45,212,191,0.15)"},"console-light":{base:"#F1F5F9",panel:"#FFFFFF",hair:"#D2DBE6",text:"#0F172A",muted:"#5B6879",signal:"#0A766C",signalDim:"rgba(10,118,108,0.12)"}},w=null;async function K(){let e=null;try{let n=await c.storage.sync.get("a11y_prefs");n&&n.a11y_prefs&&typeof n.a11y_prefs=="object"&&(e=n.a11y_prefs)}catch{}if(!e)try{let n=await c.storage.local.get("a11y_prefs");n&&n.a11y_prefs&&typeof n.a11y_prefs=="object"&&(e=n.a11y_prefs)}catch{}e=e||{};let r=["instrument","analog","console"].includes(e.theme)?e.theme:"console",o=["dark","light","system"].includes(e.mode)?e.mode:"dark";if(o==="system")try{o=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}catch{o="dark"}return{p:$[r+"-"+o]||$["console-dark"],reduceMotion:e.reduceMotion===!0}}function D(){return w||(w=K()),w}try{c.storage.onChanged.addListener((e,r)=>{(r==="sync"||r==="local")&&e.a11y_prefs&&(w=null)})}catch{}function A(){let e=document.createElement("div"),r=(n,l)=>e.style.setProperty(n,l,"important");r("all","initial"),r("position","fixed"),r("top","0"),r("left","0"),r("width","0"),r("height","0"),r("z-index","2147483647"),r("opacity","1"),r("visibility","visible"),r("display","block"),r("transform","none"),r("filter","none"),r("mix-blend-mode","normal"),r("pointer-events","auto");let o=e.attachShadow({mode:"closed"});return document.documentElement.appendChild(e),{host:e,root:o}}var g=null,k=null,p=null;async function G(e){if(k&&k.classList.contains("active")){p&&clearTimeout(p),p=setTimeout(x,5e3);return}let{p:r,reduceMotion:o}=await D();g&&g.remove();let{host:n,root:l}=A(),a=document.createElement("div");a.id="nostrkey-locked-sheet",a.innerHTML=`
        <style>
            #nostrkey-locked-sheet {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                pointer-events: auto;
            }
            #nostrkey-locked-sheet .nk-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            #nostrkey-locked-sheet.active .nk-backdrop {
                opacity: 1;
            }
            #nostrkey-locked-sheet .nk-sheet {
                position: relative;
                background: ${r.panel};
                border-top: 1px solid ${r.hair};
                border-radius: 16px 16px 0 0;
                padding: 24px;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            }
            #nostrkey-locked-sheet.active .nk-sheet {
                transform: translateY(0);
            }
            #nostrkey-locked-sheet .nk-handle {
                width: 40px;
                height: 4px;
                background: ${r.hair};
                border-radius: 2px;
                margin: 0 auto 16px;
            }
            #nostrkey-locked-sheet .nk-icon {
                font-size: 32px;
                text-align: center;
                margin-bottom: 12px;
            }
            #nostrkey-locked-sheet .nk-title {
                color: ${r.text};
                font-size: 18px;
                font-weight: 600;
                text-align: center;
                margin-bottom: 8px;
            }
            #nostrkey-locked-sheet .nk-text {
                color: ${r.text};
                font-size: 14px;
                text-align: center;
                line-height: 1.5;
                margin-bottom: 4px;
            }
            #nostrkey-locked-sheet .nk-muted {
                color: ${r.muted};
                font-size: 13px;
                text-align: center;
            }
            #nostrkey-locked-sheet .nk-btn {
                display: block;
                width: 100%;
                padding: 14px;
                border-radius: 8px;
                border: 1px solid ${r.signal};
                background: ${r.signalDim};
                color: ${r.signal};
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 20px;
                transition: background 0.15s ease;
            }
            #nostrkey-locked-sheet .nk-btn:hover {
                background: ${r.signalDim};
            }
            ${o?`#nostrkey-locked-sheet .nk-backdrop,
            #nostrkey-locked-sheet .nk-sheet { transition: none; }`:""}
            @media (prefers-reduced-motion: reduce) {
                #nostrkey-locked-sheet .nk-backdrop,
                #nostrkey-locked-sheet .nk-sheet { transition: none; }
            }
        </style>
        <div class="nk-backdrop"></div>
        <div class="nk-sheet">
            <div class="nk-handle"></div>
            <div class="nk-icon">&#x1F512;</div>
            <div class="nk-title">${e?"NostrKey Needs to Decrypt Your Keys":"NostrKey is Locked"}</div>
            <div class="nk-text">${e?"This site is requesting your Nostr identity. Enter your master password to decrypt your key vault for this session.":"This site needs your key to sign or encrypt."}</div>
            <div class="nk-muted">Click the NostrKey icon in your toolbar and enter your master password.</div>
            <button class="nk-btn">Got it</button>
        </div>
    `,l.appendChild(a),g=n,k=a,requestAnimationFrame(()=>a.classList.add("active")),a.querySelector(".nk-btn").addEventListener("click",x),a.querySelector(".nk-backdrop").addEventListener("click",x),p=setTimeout(x,5e3)}function x(){if(p&&(clearTimeout(p),p=null),!k)return;k.classList.remove("active");let e=g;k=null,g=null,setTimeout(()=>e&&e.remove(),300)}var u=null,y=null,E=null,f=null,d=null,b=0;async function B(e){clearTimeout(L),d=e;let r=++b,{p:o,reduceMotion:n}=await D();if(r!==b)return;O(),u&&u.remove();let{host:l,root:a}=A(),m=document.createElement("div");m.id="nostrkey-perm-sheet",m.innerHTML=`
        <style>
            #nostrkey-perm-sheet { position: fixed; inset: 0; z-index: 2147483647; }
            #nostrkey-perm-sheet .nk-backdrop {
                position: fixed; inset: 0; background: rgba(0,0,0,0.5);
                opacity: 0;${n?"":" transition: opacity .2s ease;"}
            }
            #nostrkey-perm-sheet.active .nk-backdrop { opacity: 1; }
            #nostrkey-perm-sheet .nk-frame-wrap {
                position: fixed; left: 0; right: 0; bottom: 0;
                max-width: 460px; margin: 0 auto;
                transform: translateY(100%);${n?"":" transition: transform .3s ease;"}
            }
            #nostrkey-perm-sheet.active .nk-frame-wrap { transform: translateY(0); }
            #nostrkey-perm-sheet iframe {
                display: block; width: 100%; height: 72vh; max-height: 640px;
                border: 0; border-radius: 16px 16px 0 0;
                box-shadow: 0 -6px 28px rgba(0,0,0,.45); background: ${o.base};
            }
            @media (max-height: 420px) {
                #nostrkey-perm-sheet iframe { height: 92vh; }
            }
            @media (prefers-reduced-motion: reduce) {
                #nostrkey-perm-sheet .nk-backdrop,
                #nostrkey-perm-sheet .nk-frame-wrap { transition: none; }
            }
        </style>
        <div class="nk-backdrop"></div>
        <div class="nk-frame-wrap"><iframe title="NostrKey permission request"></iframe></div>
    `,m.querySelector("iframe").src=e,a.appendChild(m),u=l,y=m,requestAnimationFrame(()=>m.classList.add("active")),m.querySelector(".nk-backdrop").addEventListener("click",U),Q()}function U(){u&&(_(),u.remove(),u=null,y=null,j())}async function j(){if(f||!d)return;let e=++b,{p:r,reduceMotion:o}=await D();if(e!==b||f||!d)return;let{host:n,root:l}=A(),a=document.createElement("div");a.id="nostrkey-perm-fab",a.innerHTML=`
        <style>
            #nostrkey-perm-fab { position: fixed; right: 16px; bottom: 16px; z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            #nostrkey-perm-fab .nk-fab {
                display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px;
                border-radius: 999px; cursor: pointer; border: 1px solid ${r.signal};
                background: ${r.panel}; color: ${r.text}; font-size: 14px; font-weight: 600;
                box-shadow: 0 4px 18px rgba(0,0,0,.4);${o?"":" animation: nk-fab-pulse 2s ease-in-out infinite;"}
            }
            #nostrkey-perm-fab .nk-dot { width: 8px; height: 8px; border-radius: 50%; background: ${r.signal}; }
            #nostrkey-perm-fab .nk-fab-cd { font-variant-numeric: tabular-nums; color: ${r.muted}; font-weight: 600; }
            @keyframes nk-fab-pulse { 0%,100%{ box-shadow: 0 4px 18px rgba(0,0,0,.4);} 50%{ box-shadow: 0 4px 24px ${r.signalDim};} }
            @media (prefers-reduced-motion: reduce) {
                #nostrkey-perm-fab .nk-fab { animation: none; }
            }
        </style>
        <button class="nk-fab" type="button"><span class="nk-dot"></span><span class="nk-fab-label">Review signing request</span><span class="nk-fab-cd"></span></button>
    `,l.appendChild(a),E=n,f=a,a.querySelector(".nk-fab").addEventListener("click",()=>{d?B(d):v()}),X(a.querySelector(".nk-fab-cd"))}var F=null,L=null,Y=2e4,V=1e4,C=0;function W(){Date.now()-C<V||(C=Date.now(),c.runtime.sendMessage({kind:"holdMinimizedPrompt"})?.catch?.(()=>{}))}function X(e){P(),C=0;let r=M();if(!r||!e)return;let o=()=>{let n=r-Date.now();if(n<=0){z();return}W(),e.textContent=`\xB7 ${Math.ceil(n/1e3)}s`};o(),F=setInterval(o,250)}function M(){try{return Number(new URL(d).searchParams.get("deadline"))||0}catch{return 0}}function z(){P(),d=null;let e=f.querySelector(".nk-fab");e.style.animation="none",e.querySelector(".nk-fab-label").textContent="Signing request expired",e.querySelector(".nk-fab-cd").textContent="",clearTimeout(L),L=setTimeout(v,Y)}function J(){if(f&&!d)return;f&&M()&&Date.now()>=M()-500?z():v()}function P(){F&&(clearInterval(F),F=null)}function O(){P(),clearTimeout(L),E&&(E.remove(),E=null),f=null}function v(){b++,_(),u&&(u.remove(),u=null,y=null),O(),d=null}var h=null,S=null;function T(e){return e?parseFloat(e.opacity)<.9||e.visibility!=="visible"||e.display==="none"||e.pointerEvents==="none"||e.filter!=="none"||e.transform!=="none"||e.mixBlendMode!=="normal"||e.clipPath!=="none"||e.perspective!=="none"||e.contentVisibility==="hidden"||e.mask&&e.mask!=="none"||e.webkitMask&&e.webkitMask!=="none"||e.backdropFilter&&e.backdropFilter!=="none":!0}function q(){let e=u;if(!e||!e.isConnected||e.parentNode!==document.documentElement)return!0;try{if(T(getComputedStyle(e))||T(getComputedStyle(document.documentElement)))return!0;let r=y&&y.querySelector("iframe");if(!r)return!0;let o=getComputedStyle(r);if(parseFloat(o.opacity)<.9||o.visibility!=="visible")return!0}catch{return!0}return!1}function N(){_(),v(),c.runtime.sendMessage({kind:"permissionSheetCompromised"}).catch(()=>{})}function Q(){_();try{h=new MutationObserver(()=>{q()&&N()}),h.observe(document.documentElement,{attributes:!0,attributeFilter:["style","class"],childList:!0,subtree:!0})}catch{}S=setInterval(()=>{q()&&N()},200)}function _(){h&&(h.disconnect(),h=null),S&&(clearInterval(S),S=null)}window.addEventListener("message",e=>{if(!y)return;let r=y.querySelector("iframe");!r||e.source!==r.contentWindow||(e.data&&e.data.__nostrkey_perm==="minimize"&&U(),e.data&&e.data.__nostrkey_perm==="close"&&v())});c.runtime.onMessage.addListener((e,r,o)=>{if(e.kind==="showLockedSheet")return G(e.firstUnlock||!1),o(!0),!0;if(e.kind==="showPermissionSheet")return B(e.url),o(!0),!0;if(e.kind==="closePermissionSheet")return J(),o(!0),!0});window.addEventListener("message",async e=>{if(e.source!==window)return;let r=["getPubKey","signEvent","getRelays","addRelay","nip04.encrypt","nip04.decrypt","nip44.encrypt","nip44.decrypt","replaceURL"],{kind:o,reqId:n,payload:l}=e.data;if(r.includes(o)){try{l=await c.runtime.sendMessage({kind:o,payload:l,host:window.location.origin})}catch{l={error:"connection_error"}}typeof l=="object"&&l!==null&&typeof l.error=="string"&&(l={error:l.error}),o=`return_${o}`,window.postMessage({kind:o,reqId:n,payload:l,token:I},window.location.origin)}});})();
