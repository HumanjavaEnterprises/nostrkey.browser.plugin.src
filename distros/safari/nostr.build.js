(() => {
  // src/nostr.js
  var NK_CHANNEL_TOKEN = (() => {
    try {
      const el = document.currentScript;
      const t = el?.dataset?.nkToken || null;
      if (el) el.removeAttribute("data-nk-token");
      return t;
    } catch {
      return null;
    }
  })();
  window.nostr = {
    requests: {},
    async getPublicKey() {
      return await this.broadcast("getPubKey");
    },
    async signEvent(event) {
      return await this.broadcast("signEvent", event);
    },
    async getRelays() {
      return await this.broadcast("getRelays");
    },
    async addRelay(url) {
      return await this.broadcast("addRelay", { url });
    },
    // NOTE: exportProfile() and the nip46 bunker controls are intentionally NOT
    // exposed to web pages. Exporting the private key and starting/stopping a
    // NIP-46 bunker are privileged operations that must originate from the
    // extension's own UI (sidepanel/options), never from a page message.
    // Bunker creation and key export are extension-UI-only.
    // This is here for Alby comatibility. This is not part of the NIP-07 standard.
    // I have found at least one site, nostr.band, which expects it to be present.
    async enable() {
      return { enabled: true };
    },
    broadcast(kind, payload) {
      let reqId = crypto.randomUUID();
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          delete this.requests[reqId];
          reject(new Error("NostrKey: request timed out"));
        }, 3e4);
        this.requests[reqId] = (result) => {
          clearTimeout(timeout);
          resolve(result);
        };
        window.postMessage({ kind, reqId, payload }, window.location.origin);
      });
    },
    nip04: {
      async encrypt(pubKey, plainText) {
        return await window.nostr.broadcast("nip04.encrypt", {
          pubKey,
          plainText
        });
      },
      async decrypt(pubKey, cipherText) {
        return await window.nostr.broadcast("nip04.decrypt", {
          pubKey,
          cipherText
        });
      }
    },
    nip44: {
      async encrypt(pubKey, plainText) {
        return await window.nostr.broadcast("nip44.encrypt", {
          pubKey,
          plainText
        });
      },
      async decrypt(pubKey, cipherText) {
        return await window.nostr.broadcast("nip44.decrypt", {
          pubKey,
          cipherText
        });
      }
    }
  };
  var _nostrLinkDisabled = null;
  document.addEventListener("mousedown", async (e) => {
    if (e.target.tagName !== "A" || !e.target.href.startsWith("nostr:")) return;
    if (_nostrLinkDisabled === false) return;
    let response = await window.nostr.broadcast("replaceURL", {
      url: e.target.href
    });
    if (response === false) {
      _nostrLinkDisabled = false;
      return;
    }
    e.target.href = response;
  });
  window.addEventListener("message", (message) => {
    if (message.source !== window) return;
    if (!message.data || message.data.token !== NK_CHANNEL_TOKEN) return;
    const validEvents = [
      "getPubKey",
      "signEvent",
      "getRelays",
      "addRelay",
      "nip04.encrypt",
      "nip04.decrypt",
      "nip44.encrypt",
      "nip44.decrypt"
    ].map((e) => `return_${e}`);
    let { kind, reqId, payload } = message.data;
    if (!validEvents.includes(kind)) return;
    window.nostr.requests[reqId]?.(payload);
    delete window.nostr.requests[reqId];
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL25vc3RyLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBDaGFubmVsIHRva2VuIGhhbmRzaGFrZSAoTkstNSk6IHRoZSBjb250ZW50IHNjcmlwdCBzdGFtcHMgdGhlIGluamVjdGVkXG4vLyBzY3JpcHQgZWxlbWVudCB3aXRoIGEgcGVyLXBhZ2UtbG9hZCByYW5kb20gdG9rZW4gdmlhIGEgZGF0YSBhdHRyaWJ1dGUuXG4vLyBXZSByZWFkIGl0IHN5bmNocm9ub3VzbHkgYXQgbG9hZCBhbmQgaW1tZWRpYXRlbHkgc3RyaXAgaXQgZnJvbSB0aGUgRE9NLFxuLy8gdGhlbiByZXF1aXJlIGV2ZXJ5IGluYm91bmQgcmVzcG9uc2UgdG8gY2FycnkgdGhpcyB0b2tlbi4gQSBzYW1lLXBhZ2Vcbi8vIHNjcmlwdCB0aGF0IG9ubHkgb2JzZXJ2ZWQgdGhlIHJlcXVlc3QgYnJvYWRjYXN0IGRvZXMgbm90IGtub3cgdGhlIHRva2VuLFxuLy8gc28gaXQgY2Fubm90IGZvcmdlIGEgcmVzcG9uc2UuIChSZXNpZHVhbDogYSBzYW1lLW9yaWdpbiBzY3JpcHQgaXMgYWxyZWFkeVxuLy8gaW5zaWRlIHRoZSBwYWdlIHRydXN0IGJvdW5kYXJ5IGFuZCBjb3VsZCBjYWxsIHdpbmRvdy5ub3N0ciBpdHNlbGYuKVxuY29uc3QgTktfQ0hBTk5FTF9UT0tFTiA9ICgoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0O1xuICAgICAgICBjb25zdCB0ID0gZWw/LmRhdGFzZXQ/Lm5rVG9rZW4gfHwgbnVsbDtcbiAgICAgICAgaWYgKGVsKSBlbC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtbmstdG9rZW4nKTtcbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn0pKCk7XG5cbndpbmRvdy5ub3N0ciA9IHtcbiAgICByZXF1ZXN0czoge30sXG5cbiAgICBhc3luYyBnZXRQdWJsaWNLZXkoKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmJyb2FkY2FzdCgnZ2V0UHViS2V5Jyk7XG4gICAgfSxcblxuICAgIGFzeW5jIHNpZ25FdmVudChldmVudCkge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5icm9hZGNhc3QoJ3NpZ25FdmVudCcsIGV2ZW50KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZ2V0UmVsYXlzKCkge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5icm9hZGNhc3QoJ2dldFJlbGF5cycpO1xuICAgIH0sXG5cbiAgICBhc3luYyBhZGRSZWxheSh1cmwpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYnJvYWRjYXN0KCdhZGRSZWxheScsIHsgdXJsIH0pO1xuICAgIH0sXG5cbiAgICAvLyBOT1RFOiBleHBvcnRQcm9maWxlKCkgYW5kIHRoZSBuaXA0NiBidW5rZXIgY29udHJvbHMgYXJlIGludGVudGlvbmFsbHkgTk9UXG4gICAgLy8gZXhwb3NlZCB0byB3ZWIgcGFnZXMuIEV4cG9ydGluZyB0aGUgcHJpdmF0ZSBrZXkgYW5kIHN0YXJ0aW5nL3N0b3BwaW5nIGFcbiAgICAvLyBOSVAtNDYgYnVua2VyIGFyZSBwcml2aWxlZ2VkIG9wZXJhdGlvbnMgdGhhdCBtdXN0IG9yaWdpbmF0ZSBmcm9tIHRoZVxuICAgIC8vIGV4dGVuc2lvbidzIG93biBVSSAoc2lkZXBhbmVsL29wdGlvbnMpLCBuZXZlciBmcm9tIGEgcGFnZSBtZXNzYWdlLlxuICAgIC8vIEJ1bmtlciBjcmVhdGlvbiBhbmQga2V5IGV4cG9ydCBhcmUgZXh0ZW5zaW9uLVVJLW9ubHkuXG5cbiAgICAvLyBUaGlzIGlzIGhlcmUgZm9yIEFsYnkgY29tYXRpYmlsaXR5LiBUaGlzIGlzIG5vdCBwYXJ0IG9mIHRoZSBOSVAtMDcgc3RhbmRhcmQuXG4gICAgLy8gSSBoYXZlIGZvdW5kIGF0IGxlYXN0IG9uZSBzaXRlLCBub3N0ci5iYW5kLCB3aGljaCBleHBlY3RzIGl0IHRvIGJlIHByZXNlbnQuXG4gICAgYXN5bmMgZW5hYmxlKCkge1xuICAgICAgICByZXR1cm4geyBlbmFibGVkOiB0cnVlIH07XG4gICAgfSxcblxuICAgIGJyb2FkY2FzdChraW5kLCBwYXlsb2FkKSB7XG4gICAgICAgIGxldCByZXFJZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMucmVxdWVzdHNbcmVxSWRdO1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ05vc3RyS2V5OiByZXF1ZXN0IHRpbWVkIG91dCcpKTtcbiAgICAgICAgICAgIH0sIDMwMDAwKTtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdHNbcmVxSWRdID0gKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gTkstNjogdGFyZ2V0IHRoaXMgcGFnZSdzIG93biBvcmlnaW4gaW5zdGVhZCBvZiAnKicuXG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoeyBraW5kLCByZXFJZCwgcGF5bG9hZCB9LCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIG5pcDA0OiB7XG4gICAgICAgIGFzeW5jIGVuY3J5cHQocHViS2V5LCBwbGFpblRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB3aW5kb3cubm9zdHIuYnJvYWRjYXN0KCduaXAwNC5lbmNyeXB0Jywge1xuICAgICAgICAgICAgICAgIHB1YktleSxcbiAgICAgICAgICAgICAgICBwbGFpblRleHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhc3luYyBkZWNyeXB0KHB1YktleSwgY2lwaGVyVGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHdpbmRvdy5ub3N0ci5icm9hZGNhc3QoJ25pcDA0LmRlY3J5cHQnLCB7XG4gICAgICAgICAgICAgICAgcHViS2V5LFxuICAgICAgICAgICAgICAgIGNpcGhlclRleHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgbmlwNDQ6IHtcbiAgICAgICAgYXN5bmMgZW5jcnlwdChwdWJLZXksIHBsYWluVGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHdpbmRvdy5ub3N0ci5icm9hZGNhc3QoJ25pcDQ0LmVuY3J5cHQnLCB7XG4gICAgICAgICAgICAgICAgcHViS2V5LFxuICAgICAgICAgICAgICAgIHBsYWluVGV4dCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFzeW5jIGRlY3J5cHQocHViS2V5LCBjaXBoZXJUZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgd2luZG93Lm5vc3RyLmJyb2FkY2FzdCgnbmlwNDQuZGVjcnlwdCcsIHtcbiAgICAgICAgICAgICAgICBwdWJLZXksXG4gICAgICAgICAgICAgICAgY2lwaGVyVGV4dCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgIH0sXG59O1xuXG4vLyBub3N0cjogcHJvdG9jb2wgbGluayBoYW5kbGVyIFx1MjAxNCByZXBsYWNlcyBub3N0cjpucHViMS4uLi9ub3RlMS4uLiBocmVmc1xuLy8gd2l0aCBhIGNvbmZpZ3VyYWJsZSB3ZWIgVVJMIChkZWZhdWx0OiBuanVtcC5tZSkgb24gbW91c2Vkb3duLCBiZWZvcmVcbi8vIHRoZSBicm93c2VyIG5hdmlnYXRlcy5cbmxldCBfbm9zdHJMaW5rRGlzYWJsZWQgPSBudWxsO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgYXN5bmMgZSA9PiB7XG4gICAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgIT09ICdBJyB8fCAhZS50YXJnZXQuaHJlZi5zdGFydHNXaXRoKCdub3N0cjonKSkgcmV0dXJuO1xuICAgIGlmIChfbm9zdHJMaW5rRGlzYWJsZWQgPT09IGZhbHNlKSByZXR1cm47XG5cbiAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCB3aW5kb3cubm9zdHIuYnJvYWRjYXN0KCdyZXBsYWNlVVJMJywge1xuICAgICAgICB1cmw6IGUudGFyZ2V0LmhyZWYsXG4gICAgfSk7XG4gICAgaWYgKHJlc3BvbnNlID09PSBmYWxzZSkge1xuICAgICAgICBfbm9zdHJMaW5rRGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlLnRhcmdldC5ocmVmID0gcmVzcG9uc2U7XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBtZXNzYWdlID0+IHtcbiAgICAvLyBOSy01OiBvbmx5IGFjY2VwdCByZXNwb25zZXMgZnJvbSB0aGlzIHNhbWUgd2luZG93LCBjYXJyeWluZyB0aGUgcHJpdmF0ZVxuICAgIC8vIGNoYW5uZWwgdG9rZW4gdGhhdCB0aGUgY29udGVudCBzY3JpcHQgYW5kIHRoaXMgc2NyaXB0IHNoYXJlLlxuICAgIGlmIChtZXNzYWdlLnNvdXJjZSAhPT0gd2luZG93KSByZXR1cm47XG4gICAgaWYgKCFtZXNzYWdlLmRhdGEgfHwgbWVzc2FnZS5kYXRhLnRva2VuICE9PSBOS19DSEFOTkVMX1RPS0VOKSByZXR1cm47XG5cbiAgICBjb25zdCB2YWxpZEV2ZW50cyA9IFtcbiAgICAgICAgJ2dldFB1YktleScsXG4gICAgICAgICdzaWduRXZlbnQnLFxuICAgICAgICAnZ2V0UmVsYXlzJyxcbiAgICAgICAgJ2FkZFJlbGF5JyxcbiAgICAgICAgJ25pcDA0LmVuY3J5cHQnLFxuICAgICAgICAnbmlwMDQuZGVjcnlwdCcsXG4gICAgICAgICduaXA0NC5lbmNyeXB0JyxcbiAgICAgICAgJ25pcDQ0LmRlY3J5cHQnLFxuICAgIF0ubWFwKGUgPT4gYHJldHVybl8ke2V9YCk7XG4gICAgbGV0IHsga2luZCwgcmVxSWQsIHBheWxvYWQgfSA9IG1lc3NhZ2UuZGF0YTtcblxuICAgIGlmICghdmFsaWRFdmVudHMuaW5jbHVkZXMoa2luZCkpIHJldHVybjtcblxuICAgIHdpbmRvdy5ub3N0ci5yZXF1ZXN0c1tyZXFJZF0/LihwYXlsb2FkKTtcbiAgICBkZWxldGUgd2luZG93Lm5vc3RyLnJlcXVlc3RzW3JlcUlkXTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFPQSxNQUFNLG9CQUFvQixNQUFNO0FBQzVCLFFBQUk7QUFDQSxZQUFNLEtBQUssU0FBUztBQUNwQixZQUFNLElBQUksSUFBSSxTQUFTLFdBQVc7QUFDbEMsVUFBSSxHQUFJLElBQUcsZ0JBQWdCLGVBQWU7QUFDMUMsYUFBTztBQUFBLElBQ1gsUUFBUTtBQUNKLGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSixHQUFHO0FBRUgsU0FBTyxRQUFRO0FBQUEsSUFDWCxVQUFVLENBQUM7QUFBQSxJQUVYLE1BQU0sZUFBZTtBQUNqQixhQUFPLE1BQU0sS0FBSyxVQUFVLFdBQVc7QUFBQSxJQUMzQztBQUFBLElBRUEsTUFBTSxVQUFVLE9BQU87QUFDbkIsYUFBTyxNQUFNLEtBQUssVUFBVSxhQUFhLEtBQUs7QUFBQSxJQUNsRDtBQUFBLElBRUEsTUFBTSxZQUFZO0FBQ2QsYUFBTyxNQUFNLEtBQUssVUFBVSxXQUFXO0FBQUEsSUFDM0M7QUFBQSxJQUVBLE1BQU0sU0FBUyxLQUFLO0FBQ2hCLGFBQU8sTUFBTSxLQUFLLFVBQVUsWUFBWSxFQUFFLElBQUksQ0FBQztBQUFBLElBQ25EO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVVBLE1BQU0sU0FBUztBQUNYLGFBQU8sRUFBRSxTQUFTLEtBQUs7QUFBQSxJQUMzQjtBQUFBLElBRUEsVUFBVSxNQUFNLFNBQVM7QUFDckIsVUFBSSxRQUFRLE9BQU8sV0FBVztBQUM5Qixh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
