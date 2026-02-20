(()=>{var t=typeof browser<"u"?browser:typeof chrome<"u"?chrome:null;if(!t)throw new Error("browser-polyfill: No extension API namespace found (neither browser nor chrome).");var r=typeof browser>"u"&&typeof chrome<"u";function s(e,i){return(...n)=>{try{let o=i.apply(e,n);if(o&&typeof o.then=="function")return o}catch{}return new Promise((o,c)=>{i.apply(e,[...n,(...u)=>{t.runtime&&t.runtime.lastError?c(new Error(t.runtime.lastError.message)):o(u.length<=1?u[0]:u)}])})}}var l={};l.runtime={sendMessage(...e){return r?s(t.runtime,t.runtime.sendMessage)(...e):t.runtime.sendMessage(...e)},onMessage:t.runtime.onMessage,getURL(e){return t.runtime.getURL(e)},openOptionsPage(){return r?s(t.runtime,t.runtime.openOptionsPage)():t.runtime.openOptionsPage()},get id(){return t.runtime.id}};l.storage={local:{get(...e){return r?s(t.storage.local,t.storage.local.get)(...e):t.storage.local.get(...e)},set(...e){return r?s(t.storage.local,t.storage.local.set)(...e):t.storage.local.set(...e)},clear(...e){return r?s(t.storage.local,t.storage.local.clear)(...e):t.storage.local.clear(...e)},remove(...e){return r?s(t.storage.local,t.storage.local.remove)(...e):t.storage.local.remove(...e)}}};l.tabs={create(...e){return r?s(t.tabs,t.tabs.create)(...e):t.tabs.create(...e)},query(...e){return r?s(t.tabs,t.tabs.query)(...e):t.tabs.query(...e)},remove(...e){return r?s(t.tabs,t.tabs.remove)(...e):t.tabs.remove(...e)},update(...e){return r?s(t.tabs,t.tabs.update)(...e):t.tabs.update(...e)},get(...e){return r?s(t.tabs,t.tabs.get)(...e):t.tabs.get(...e)},getCurrent(...e){return r?s(t.tabs,t.tabs.getCurrent)(...e):t.tabs.getCurrent(...e)}};var m=document.createElement("script");m.setAttribute("src",l.runtime.getURL("nostr.build.js"));document.body.appendChild(m);var a=null,p=null;function k(){if(a)return;let e=document.createElement("div");e.id="nostrkey-permission-sheet",e.innerHTML=`
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
            <div class="nk-title">Permission Request</div>
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
    `,document.body.appendChild(e),a=e,e.querySelector("#nk-allow").addEventListener("click",()=>{d(!0)}),e.querySelector("#nk-deny").addEventListener("click",()=>{d(!1)}),e.querySelector(".nk-backdrop").addEventListener("click",()=>{d(!1)})}function d(e){if(!p)return;let i=a.querySelector("#nk-remember").checked;a.classList.remove("active"),a.querySelector("#nk-remember").checked=!1,p({allowed:e,remember:i}),p=null}function b(e){switch(e){case"getPubKey":return"Read your public key";case"signEvent":return"Sign an event";case"getRelays":return"Read your relay list";case"nip04.encrypt":return"Encrypt a message (NIP-04)";case"nip04.decrypt":return"Decrypt a message (NIP-04)";case"nip44.encrypt":return"Encrypt a message (NIP-44)";case"nip44.decrypt":return"Decrypt a message (NIP-44)";default:return e}}function y(e,i){return k(),a.querySelector("#nk-host").textContent=e,a.querySelector("#nk-permission").textContent=b(i),a.classList.add("active"),new Promise(n=>{p=n})}l.runtime.onMessage.addListener((e,i,n)=>{if(e.kind==="showPermissionSheet")return y(e.host,e.permissionKind).then(o=>{n(o)}),!0});window.addEventListener("message",async e=>{if(e.source!==window)return;let i=["getPubKey","signEvent","getRelays","nip04.encrypt","nip04.decrypt","nip44.encrypt","nip44.decrypt","replaceURL"],{kind:n,reqId:o,payload:c}=e.data;i.includes(n)&&(c=await l.runtime.sendMessage({kind:n,payload:c,host:window.location.host}),n=`return_${n}`,window.postMessage({kind:n,reqId:o,payload:c},window.location.origin))});})();
