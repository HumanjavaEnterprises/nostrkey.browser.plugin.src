(()=>{var t=typeof browser<"u"?browser:typeof chrome<"u"?chrome:null;if(!t)throw new Error("browser-polyfill: No extension API namespace found (neither browser nor chrome).");var r=typeof browser>"u"&&typeof chrome<"u";function s(e,n){return(...o)=>{try{let i=n.apply(e,o);if(i&&typeof i.then=="function")return i}catch{}return new Promise((i,c)=>{n.apply(e,[...o,(...u)=>{t.runtime&&t.runtime.lastError?c(new Error(t.runtime.lastError.message)):i(u.length<=1?u[0]:u)}])})}}var a={};a.runtime={sendMessage(...e){return r?s(t.runtime,t.runtime.sendMessage)(...e):t.runtime.sendMessage(...e)},onMessage:t.runtime.onMessage,getURL(e){return t.runtime.getURL(e)},openOptionsPage(){return r?s(t.runtime,t.runtime.openOptionsPage)():t.runtime.openOptionsPage()},get id(){return t.runtime.id}};a.storage={local:{get(...e){return r?s(t.storage.local,t.storage.local.get)(...e):t.storage.local.get(...e)},set(...e){return r?s(t.storage.local,t.storage.local.set)(...e):t.storage.local.set(...e)},clear(...e){return r?s(t.storage.local,t.storage.local.clear)(...e):t.storage.local.clear(...e)},remove(...e){return r?s(t.storage.local,t.storage.local.remove)(...e):t.storage.local.remove(...e)}},sync:t.storage?.sync?{get(...e){return r?s(t.storage.sync,t.storage.sync.get)(...e):t.storage.sync.get(...e)},set(...e){return r?s(t.storage.sync,t.storage.sync.set)(...e):t.storage.sync.set(...e)},remove(...e){return r?s(t.storage.sync,t.storage.sync.remove)(...e):t.storage.sync.remove(...e)},clear(...e){return r?s(t.storage.sync,t.storage.sync.clear)(...e):t.storage.sync.clear(...e)},getBytesInUse(...e){return t.storage.sync.getBytesInUse?r?s(t.storage.sync,t.storage.sync.getBytesInUse)(...e):t.storage.sync.getBytesInUse(...e):Promise.resolve(0)}}:null,onChanged:t.storage?.onChanged||null};a.tabs={create(...e){return r?s(t.tabs,t.tabs.create)(...e):t.tabs.create(...e)},query(...e){return r?s(t.tabs,t.tabs.query)(...e):t.tabs.query(...e)},remove(...e){return r?s(t.tabs,t.tabs.remove)(...e):t.tabs.remove(...e)},update(...e){return r?s(t.tabs,t.tabs.update)(...e):t.tabs.update(...e)},get(...e){return r?s(t.tabs,t.tabs.get)(...e):t.tabs.get(...e)},getCurrent(...e){return r?s(t.tabs,t.tabs.getCurrent)(...e):t.tabs.getCurrent(...e)},sendMessage(...e){return r?s(t.tabs,t.tabs.sendMessage)(...e):t.tabs.sendMessage(...e)}};a.alarms=t.alarms?{create(...e){let n=t.alarms.create(...e);return n&&typeof n.then=="function"?n:Promise.resolve()},clear(...e){return r?s(t.alarms,t.alarms.clear)(...e):t.alarms.clear(...e)},onAlarm:t.alarms.onAlarm}:null;async function b(){if(window===window.top)return!0;try{if(!(await a.storage.local.get({blockCrossOriginFrames:!0})).blockCrossOriginFrames)return!0}catch{return!1}try{return window.top.location.href,!0}catch{return!1}}b().then(e=>{if(!e)return;let n=document.createElement("script");n.setAttribute("src",a.runtime.getURL("nostr.build.js")),document.body.appendChild(n),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&a.runtime.sendMessage({kind:"resetAutoLock"}).catch(()=>{})})});var d=null,m=null;function g(){if(d)return;let e=document.createElement("div");e.id="nostrkey-permission-sheet",e.innerHTML=`
        <style>
            #nostrkey-permission-sheet {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                pointer-events: none;
            }
            #nostrkey-permission-sheet.active {
                pointer-events: auto;
            }
            #nostrkey-permission-sheet .nk-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            #nostrkey-permission-sheet.active .nk-backdrop {
                opacity: 1;
            }
            #nostrkey-permission-sheet .nk-sheet {
                position: relative;
                background: #3e3d32;
                border-radius: 16px 16px 0 0;
                padding: 24px;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            }
            #nostrkey-permission-sheet.active .nk-sheet {
                transform: translateY(0);
            }
            #nostrkey-permission-sheet .nk-handle {
                width: 40px;
                height: 4px;
                background: #8f908a;
                border-radius: 2px;
                margin: 0 auto 16px;
            }
            #nostrkey-permission-sheet .nk-title {
                color: #a6e22e;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 12px;
                text-align: center;
            }
            #nostrkey-permission-sheet .nk-host {
                color: #66d9ef;
                font-weight: 600;
            }
            #nostrkey-permission-sheet .nk-permission {
                color: #a6e22e;
                font-weight: 600;
            }
            #nostrkey-permission-sheet .nk-text {
                color: #f8f8f2;
                font-size: 14px;
                text-align: center;
                margin-bottom: 8px;
                line-height: 1.5;
            }
            #nostrkey-permission-sheet .nk-buttons {
                display: flex;
                gap: 12px;
                margin-top: 20px;
            }
            #nostrkey-permission-sheet .nk-btn {
                flex: 1;
                padding: 14px;
                border-radius: 8px;
                border: 1px solid #a6e22e;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            #nostrkey-permission-sheet .nk-btn-allow {
                background: rgba(166,226,46,0.1);
                color: #a6e22e;
            }
            #nostrkey-permission-sheet .nk-btn-allow:hover {
                background: rgba(166,226,46,0.2);
            }
            #nostrkey-permission-sheet .nk-btn-deny {
                background: transparent;
                border-color: #f92672;
                color: #f92672;
            }
            #nostrkey-permission-sheet .nk-btn-deny:hover {
                background: rgba(249,38,114,0.1);
            }
            #nostrkey-permission-sheet .nk-remember {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-top: 16px;
                color: #8f908a;
                font-size: 13px;
            }
            #nostrkey-permission-sheet .nk-remember input {
                accent-color: #a6e22e;
            }
        </style>
        <div class="nk-backdrop"></div>
        <div class="nk-sheet">
            <div class="nk-handle"></div>
            <div class="nk-title">Permission Request <span id="nk-queue" style="color: #8f908a; font-size: 14px; font-weight: 400;"></span></div>
            <div class="nk-text">
                <span class="nk-host" id="nk-host"></span> wants to:
            </div>
            <div class="nk-text" style="font-size:16px;">
                <span class="nk-permission" id="nk-permission"></span>
            </div>
            <div class="nk-buttons">
                <button class="nk-btn nk-btn-allow" id="nk-allow">Allow</button>
                <button class="nk-btn nk-btn-deny" id="nk-deny">Deny</button>
            </div>
            <div class="nk-remember">
                <input type="checkbox" id="nk-remember">
                <label for="nk-remember">Remember this choice</label>
            </div>
        </div>
    `,document.body.appendChild(e),d=e,e.querySelector("#nk-allow").addEventListener("click",()=>{y(!0)}),e.querySelector("#nk-deny").addEventListener("click",()=>{y(!1)}),e.querySelector(".nk-backdrop").addEventListener("click",()=>{y(!1)})}function y(e){if(!m)return;let n=d.querySelector("#nk-remember").checked;d.classList.remove("active"),d.querySelector("#nk-remember").checked=!1,m({allowed:e,remember:n}),m=null}function h(e){switch(e){case"getPubKey":return"Read your public key";case"signEvent":return"Sign an event";case"getRelays":return"Read your relay list";case"nip04.encrypt":return"Encrypt a message (NIP-04)";case"nip04.decrypt":return"Decrypt a message (NIP-04)";case"nip44.encrypt":return"Encrypt a message (NIP-44)";case"nip44.decrypt":return"Decrypt a message (NIP-44)";default:return e}}function v(e,n,o,i){g(),d.querySelector("#nk-host").textContent=e,d.querySelector("#nk-permission").textContent=h(n);let c=d.querySelector("#nk-queue");return c&&(c.textContent=i>1?`(${o} of ${i})`:""),d.classList.add("active"),new Promise(u=>{m=u})}var l=null,p=null;function x(e){if(l&&l.classList.contains("active")){p&&clearTimeout(p),p=setTimeout(k,5e3);return}l&&l.remove();let n=document.createElement("div");n.id="nostrkey-locked-sheet",n.innerHTML=`
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
    `,document.body.appendChild(n),l=n,requestAnimationFrame(()=>n.classList.add("active")),n.querySelector(".nk-btn").addEventListener("click",k),n.querySelector(".nk-backdrop").addEventListener("click",k),p=setTimeout(k,5e3)}function k(){if(p&&(clearTimeout(p),p=null),!l)return;l.classList.remove("active");let e=l;l=null,setTimeout(()=>e.remove(),300)}a.runtime.onMessage.addListener((e,n,o)=>{if(e.kind==="showPermissionSheet")return v(e.host,e.permissionKind,e.queuePosition,e.queueTotal).then(i=>{o(i)}),!0;if(e.kind==="showLockedSheet")return x(e.firstUnlock||!1),o(!0),!0});window.addEventListener("message",async e=>{if(e.source!==window)return;let n=["getPubKey","signEvent","getRelays","addRelay","exportProfile","nip04.encrypt","nip04.decrypt","nip44.encrypt","nip44.decrypt","replaceURL","bunkerServer.start","bunkerServer.stop","bunkerServer.status"],{kind:o,reqId:i,payload:c}=e.data;if(n.includes(o)){try{c=await a.runtime.sendMessage({kind:o,payload:c,host:window.location.host})}catch(u){c={error:"connection_error",message:u.message||"Failed to reach extension background"}}o=`return_${o}`,window.postMessage({kind:o,reqId:i,payload:c},"*")}});})();
