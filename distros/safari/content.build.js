(()=>{var t=typeof browser<"u"?browser:typeof chrome<"u"?chrome:null;if(!t)throw new Error("browser-polyfill: No extension API namespace found (neither browser nor chrome).");var n=typeof browser>"u"&&typeof chrome<"u";function o(e,r){return(...s)=>{try{let c=r.apply(e,s);if(c&&typeof c.then=="function")return c}catch{}return new Promise((c,u)=>{r.apply(e,[...s,(...d)=>{t.runtime&&t.runtime.lastError?u(new Error(t.runtime.lastError.message)):c(d.length<=1?d[0]:d)}])})}}var a={};a.runtime={sendMessage(...e){return n?o(t.runtime,t.runtime.sendMessage)(...e):t.runtime.sendMessage(...e)},onMessage:t.runtime.onMessage,getURL(e){return t.runtime.getURL(e)},openOptionsPage(){return n?o(t.runtime,t.runtime.openOptionsPage)():t.runtime.openOptionsPage()},get id(){return t.runtime.id}};a.storage={local:{get(...e){return n?o(t.storage.local,t.storage.local.get)(...e):t.storage.local.get(...e)},set(...e){return n?o(t.storage.local,t.storage.local.set)(...e):t.storage.local.set(...e)},clear(...e){return n?o(t.storage.local,t.storage.local.clear)(...e):t.storage.local.clear(...e)},remove(...e){return n?o(t.storage.local,t.storage.local.remove)(...e):t.storage.local.remove(...e)}},sync:t.storage?.sync?{get(...e){return n?o(t.storage.sync,t.storage.sync.get)(...e):t.storage.sync.get(...e)},set(...e){return n?o(t.storage.sync,t.storage.sync.set)(...e):t.storage.sync.set(...e)},remove(...e){return n?o(t.storage.sync,t.storage.sync.remove)(...e):t.storage.sync.remove(...e)},clear(...e){return n?o(t.storage.sync,t.storage.sync.clear)(...e):t.storage.sync.clear(...e)},getBytesInUse(...e){return t.storage.sync.getBytesInUse?n?o(t.storage.sync,t.storage.sync.getBytesInUse)(...e):t.storage.sync.getBytesInUse(...e):Promise.resolve(0)}}:null,onChanged:t.storage?.onChanged||null};a.tabs={create(...e){return n?o(t.tabs,t.tabs.create)(...e):t.tabs.create(...e)},query(...e){return n?o(t.tabs,t.tabs.query)(...e):t.tabs.query(...e)},remove(...e){return n?o(t.tabs,t.tabs.remove)(...e):t.tabs.remove(...e)},update(...e){return n?o(t.tabs,t.tabs.update)(...e):t.tabs.update(...e)},get(...e){return n?o(t.tabs,t.tabs.get)(...e):t.tabs.get(...e)},getCurrent(...e){return n?o(t.tabs,t.tabs.getCurrent)(...e):t.tabs.getCurrent(...e)},sendMessage(...e){return n?o(t.tabs,t.tabs.sendMessage)(...e):t.tabs.sendMessage(...e)}};a.alarms=t.alarms?{create(...e){let r=t.alarms.create(...e);return r&&typeof r.then=="function"?r:Promise.resolve()},clear(...e){return n?o(t.alarms,t.alarms.clear)(...e):t.alarms.clear(...e)},onAlarm:t.alarms.onAlarm}:null;async function m(){if(window===window.top)return!0;try{if(!(await a.storage.local.get({blockCrossOriginFrames:!0})).blockCrossOriginFrames)return!0}catch{return!1}try{return window.top.location.href,!0}catch{return!1}}var y=crypto.randomUUID();m().then(e=>{if(!e)return;let r=document.createElement("script");r.setAttribute("src",a.runtime.getURL("nostr.build.js")),r.dataset.nkToken=y,document.body.appendChild(r),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&a.runtime.sendMessage({kind:"resetAutoLock"}).catch(()=>{})})});var i=null,l=null;function f(e){if(i&&i.classList.contains("active")){l&&clearTimeout(l),l=setTimeout(p,5e3);return}i&&i.remove();let r=document.createElement("div");r.id="nostrkey-locked-sheet",r.innerHTML=`
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
                background: #3e3d32;
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
                background: #8f908a;
                border-radius: 2px;
                margin: 0 auto 16px;
            }
            #nostrkey-locked-sheet .nk-icon {
                font-size: 32px;
                text-align: center;
                margin-bottom: 12px;
            }
            #nostrkey-locked-sheet .nk-title {
                color: #e6db74;
                font-size: 18px;
                font-weight: 600;
                text-align: center;
                margin-bottom: 8px;
            }
            #nostrkey-locked-sheet .nk-text {
                color: #f8f8f2;
                font-size: 14px;
                text-align: center;
                line-height: 1.5;
                margin-bottom: 4px;
            }
            #nostrkey-locked-sheet .nk-muted {
                color: #8f908a;
                font-size: 13px;
                text-align: center;
            }
            #nostrkey-locked-sheet .nk-btn {
                display: block;
                width: 100%;
                padding: 14px;
                border-radius: 8px;
                border: 1px solid #a6e22e;
                background: rgba(166,226,46,0.1);
                color: #a6e22e;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                margin-top: 20px;
                transition: background 0.15s ease;
            }
            #nostrkey-locked-sheet .nk-btn:hover {
                background: rgba(166,226,46,0.2);
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
    `,document.body.appendChild(r),i=r,requestAnimationFrame(()=>r.classList.add("active")),r.querySelector(".nk-btn").addEventListener("click",p),r.querySelector(".nk-backdrop").addEventListener("click",p),l=setTimeout(p,5e3)}function p(){if(l&&(clearTimeout(l),l=null),!i)return;i.classList.remove("active");let e=i;i=null,setTimeout(()=>e.remove(),300)}a.runtime.onMessage.addListener((e,r,s)=>{if(e.kind==="showLockedSheet")return f(e.firstUnlock||!1),s(!0),!0});window.addEventListener("message",async e=>{if(e.source!==window)return;let r=["getPubKey","signEvent","getRelays","addRelay","nip04.encrypt","nip04.decrypt","nip44.encrypt","nip44.decrypt","replaceURL"],{kind:s,reqId:c,payload:u}=e.data;if(r.includes(s)){try{u=await a.runtime.sendMessage({kind:s,payload:u,host:window.location.origin})}catch(d){u={error:"connection_error",message:d.message||"Failed to reach extension background"}}s=`return_${s}`,window.postMessage({kind:s,reqId:c,payload:u,token:y},window.location.origin)}});})();
