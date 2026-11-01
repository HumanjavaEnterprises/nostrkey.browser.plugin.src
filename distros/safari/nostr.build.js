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
  var PAGE_TIMEOUT_MS = 3e5;
  var FAILURES = /* @__PURE__ */ new Map([
    ["invalid_request", "NostrKey: this request is not valid"],
    ["request_too_large", "NostrKey: this request is too large"],
    ["rate_limited", "NostrKey: too many requests, please wait a moment"],
    ["locked", "NostrKey: locked, please unlock and try again"],
    ["request_failed", "NostrKey: this request could not be completed"],
    ["timed_out", "NostrKey: request timed out"],
    ["connection_error", "NostrKey: could not reach the extension"]
  ]);
  function failure(reply) {
    const code = FAILURES.has(reply.error) ? reply.error : "request_failed";
    return Object.assign(new Error(FAILURES.get(code)), { code });
  }
  var isFailure = (reply) => typeof reply === "object" && reply !== null && typeof reply.error === "string";
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
          reject(failure({ error: "timed_out" }));
        }, PAGE_TIMEOUT_MS);
        this.requests[reqId] = (result) => {
          clearTimeout(timeout);
          if (isFailure(result)) reject(failure(result));
          else resolve(result);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL25vc3RyLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBDaGFubmVsIHRva2VuIGhhbmRzaGFrZSAoTkstNSk6IHRoZSBjb250ZW50IHNjcmlwdCBzdGFtcHMgdGhlIGluamVjdGVkXG4vLyBzY3JpcHQgZWxlbWVudCB3aXRoIGEgcGVyLXBhZ2UtbG9hZCByYW5kb20gdG9rZW4gdmlhIGEgZGF0YSBhdHRyaWJ1dGUuXG4vLyBXZSByZWFkIGl0IHN5bmNocm9ub3VzbHkgYXQgbG9hZCBhbmQgaW1tZWRpYXRlbHkgc3RyaXAgaXQgZnJvbSB0aGUgRE9NLFxuLy8gdGhlbiByZXF1aXJlIGV2ZXJ5IGluYm91bmQgcmVzcG9uc2UgdG8gY2FycnkgdGhpcyB0b2tlbi4gQSBzYW1lLXBhZ2Vcbi8vIHNjcmlwdCB0aGF0IG9ubHkgb2JzZXJ2ZWQgdGhlIHJlcXVlc3QgYnJvYWRjYXN0IGRvZXMgbm90IGtub3cgdGhlIHRva2VuLFxuLy8gc28gaXQgY2Fubm90IGZvcmdlIGEgcmVzcG9uc2UuIChSZXNpZHVhbDogYSBzYW1lLW9yaWdpbiBzY3JpcHQgaXMgYWxyZWFkeVxuLy8gaW5zaWRlIHRoZSBwYWdlIHRydXN0IGJvdW5kYXJ5IGFuZCBjb3VsZCBjYWxsIHdpbmRvdy5ub3N0ciBpdHNlbGYuKVxuY29uc3QgTktfQ0hBTk5FTF9UT0tFTiA9ICgoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jdXJyZW50U2NyaXB0O1xuICAgICAgICBjb25zdCB0ID0gZWw/LmRhdGFzZXQ/Lm5rVG9rZW4gfHwgbnVsbDtcbiAgICAgICAgaWYgKGVsKSBlbC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtbmstdG9rZW4nKTtcbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn0pKCk7XG5cbi8vIEhvdyBsb25nIGEgcGFnZSB3YWl0cyBmb3IgYW4gYW5zd2VyLiBUaGUgZXh0ZW5zaW9uIGFsd2F5cyBhbnN3ZXJzLCBzbyB0aGlzIG9ubHlcbi8vIG1hdHRlcnMgaWYgaXQgY2Fubm90LiBJdCBjb3ZlcnMgdGhlIGxvbmdlc3QgYSByZXF1ZXN0IGNhbiB0YWtlOiBpdHMgdHVybiBpbiB0aGVcbi8vIHF1ZXVlLCBhIHByb21wdCBtb3ZlZCB0byBhIHRhYiwgYW5kIGEgcmVtb3RlIHNpZ25lciBzdGFydGluZyBhIHNlc3Npb24uIE5vIHByb21wdFxuLy8gY2FuIHN0aWxsIGJlIG9wZW4gb25jZSBpdCBwYXNzZXMsIHNlZSBQUk9NUFRfV0FJVF9NUyBpbiBiYWNrZ3JvdW5kLmpzLlxuY29uc3QgUEFHRV9USU1FT1VUX01TID0gMzAwXzAwMDtcblxuLy8gV2hhdCBhIHNpdGUgaXMgdG9sZCB3aGVuIGEgcmVxdWVzdCBmYWlscy4gQW55dGhpbmcgZWxzZSByZWFkcyBhcyByZXF1ZXN0X2ZhaWxlZC5cbmNvbnN0IEZBSUxVUkVTID0gbmV3IE1hcChbXG4gICAgWydpbnZhbGlkX3JlcXVlc3QnLCAnTm9zdHJLZXk6IHRoaXMgcmVxdWVzdCBpcyBub3QgdmFsaWQnXSxcbiAgICBbJ3JlcXVlc3RfdG9vX2xhcmdlJywgJ05vc3RyS2V5OiB0aGlzIHJlcXVlc3QgaXMgdG9vIGxhcmdlJ10sXG4gICAgWydyYXRlX2xpbWl0ZWQnLCAnTm9zdHJLZXk6IHRvbyBtYW55IHJlcXVlc3RzLCBwbGVhc2Ugd2FpdCBhIG1vbWVudCddLFxuICAgIFsnbG9ja2VkJywgJ05vc3RyS2V5OiBsb2NrZWQsIHBsZWFzZSB1bmxvY2sgYW5kIHRyeSBhZ2FpbiddLFxuICAgIFsncmVxdWVzdF9mYWlsZWQnLCAnTm9zdHJLZXk6IHRoaXMgcmVxdWVzdCBjb3VsZCBub3QgYmUgY29tcGxldGVkJ10sXG4gICAgWyd0aW1lZF9vdXQnLCAnTm9zdHJLZXk6IHJlcXVlc3QgdGltZWQgb3V0J10sXG4gICAgWydjb25uZWN0aW9uX2Vycm9yJywgJ05vc3RyS2V5OiBjb3VsZCBub3QgcmVhY2ggdGhlIGV4dGVuc2lvbiddLFxuXSk7XG5cbmZ1bmN0aW9uIGZhaWx1cmUocmVwbHkpIHtcbiAgICBjb25zdCBjb2RlID0gRkFJTFVSRVMuaGFzKHJlcGx5LmVycm9yKSA/IHJlcGx5LmVycm9yIDogJ3JlcXVlc3RfZmFpbGVkJztcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoRkFJTFVSRVMuZ2V0KGNvZGUpKSwgeyBjb2RlIH0pO1xufVxuXG5jb25zdCBpc0ZhaWx1cmUgPSAocmVwbHkpID0+IHR5cGVvZiByZXBseSA9PT0gJ29iamVjdCcgJiYgcmVwbHkgIT09IG51bGwgJiYgdHlwZW9mIHJlcGx5LmVycm9yID09PSAnc3RyaW5nJztcblxud2luZG93Lm5vc3RyID0ge1xuICAgIHJlcXVlc3RzOiB7fSxcblxuICAgIGFzeW5jIGdldFB1YmxpY0tleSgpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYnJvYWRjYXN0KCdnZXRQdWJLZXknKTtcbiAgICB9LFxuXG4gICAgYXN5bmMgc2lnbkV2ZW50KGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmJyb2FkY2FzdCgnc2lnbkV2ZW50JywgZXZlbnQpO1xuICAgIH0sXG5cbiAgICBhc3luYyBnZXRSZWxheXMoKSB7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLmJyb2FkY2FzdCgnZ2V0UmVsYXlzJyk7XG4gICAgfSxcblxuICAgIGFzeW5jIGFkZFJlbGF5KHVybCkge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5icm9hZGNhc3QoJ2FkZFJlbGF5JywgeyB1cmwgfSk7XG4gICAgfSxcblxuICAgIC8vIE5PVEU6IGV4cG9ydFByb2ZpbGUoKSBhbmQgdGhlIG5pcDQ2IGJ1bmtlciBjb250cm9scyBhcmUgaW50ZW50aW9uYWxseSBOT1RcbiAgICAvLyBleHBvc2VkIHRvIHdlYiBwYWdlcy4gRXhwb3J0aW5nIHRoZSBwcml2YXRlIGtleSBhbmQgc3RhcnRpbmcvc3RvcHBpbmcgYVxuICAgIC8vIE5JUC00NiBidW5rZXIgYXJlIHByaXZpbGVnZWQgb3BlcmF0aW9ucyB0aGF0IG11c3Qgb3JpZ2luYXRlIGZyb20gdGhlXG4gICAgLy8gZXh0ZW5zaW9uJ3Mgb3duIFVJIChzaWRlcGFuZWwvb3B0aW9ucyksIG5ldmVyIGZyb20gYSBwYWdlIG1lc3NhZ2UuXG4gICAgLy8gQnVua2VyIGNyZWF0aW9uIGFuZCBrZXkgZXhwb3J0IGFyZSBleHRlbnNpb24tVUktb25seS5cblxuICAgIC8vIFRoaXMgaXMgaGVyZSBmb3IgQWxieSBjb21hdGliaWxpdHkuIFRoaXMgaXMgbm90IHBhcnQgb2YgdGhlIE5JUC0wNyBzdGFuZGFyZC5cbiAgICAvLyBJIGhhdmUgZm91bmQgYXQgbGVhc3Qgb25lIHNpdGUsIG5vc3RyLmJhbmQsIHdoaWNoIGV4cGVjdHMgaXQgdG8gYmUgcHJlc2VudC5cbiAgICBhc3luYyBlbmFibGUoKSB7XG4gICAgICAgIHJldHVybiB7IGVuYWJsZWQ6IHRydWUgfTtcbiAgICB9LFxuXG4gICAgYnJvYWRjYXN0KGtpbmQsIHBheWxvYWQpIHtcbiAgICAgICAgbGV0IHJlcUlkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5yZXF1ZXN0c1tyZXFJZF07XG4gICAgICAgICAgICAgICAgcmVqZWN0KGZhaWx1cmUoeyBlcnJvcjogJ3RpbWVkX291dCcgfSkpO1xuICAgICAgICAgICAgfSwgUEFHRV9USU1FT1VUX01TKTtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdHNbcmVxSWRdID0gKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgICAgICBpZiAoaXNGYWlsdXJlKHJlc3VsdCkpIHJlamVjdChmYWlsdXJlKHJlc3VsdCkpO1xuICAgICAgICAgICAgICAgIGVsc2UgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIE5LLTY6IHRhcmdldCB0aGlzIHBhZ2UncyBvd24gb3JpZ2luIGluc3RlYWQgb2YgJyonLlxuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKHsga2luZCwgcmVxSWQsIHBheWxvYWQgfSwgd2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBuaXAwNDoge1xuICAgICAgICBhc3luYyBlbmNyeXB0KHB1YktleSwgcGxhaW5UZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgd2luZG93Lm5vc3RyLmJyb2FkY2FzdCgnbmlwMDQuZW5jcnlwdCcsIHtcbiAgICAgICAgICAgICAgICBwdWJLZXksXG4gICAgICAgICAgICAgICAgcGxhaW5UZXh0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXN5bmMgZGVjcnlwdChwdWJLZXksIGNpcGhlclRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB3aW5kb3cubm9zdHIuYnJvYWRjYXN0KCduaXAwNC5kZWNyeXB0Jywge1xuICAgICAgICAgICAgICAgIHB1YktleSxcbiAgICAgICAgICAgICAgICBjaXBoZXJUZXh0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIG5pcDQ0OiB7XG4gICAgICAgIGFzeW5jIGVuY3J5cHQocHViS2V5LCBwbGFpblRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB3aW5kb3cubm9zdHIuYnJvYWRjYXN0KCduaXA0NC5lbmNyeXB0Jywge1xuICAgICAgICAgICAgICAgIHB1YktleSxcbiAgICAgICAgICAgICAgICBwbGFpblRleHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhc3luYyBkZWNyeXB0KHB1YktleSwgY2lwaGVyVGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHdpbmRvdy5ub3N0ci5icm9hZGNhc3QoJ25pcDQ0LmRlY3J5cHQnLCB7XG4gICAgICAgICAgICAgICAgcHViS2V5LFxuICAgICAgICAgICAgICAgIGNpcGhlclRleHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICB9LFxufTtcblxuLy8gbm9zdHI6IHByb3RvY29sIGxpbmsgaGFuZGxlciBcdTIwMTQgcmVwbGFjZXMgbm9zdHI6bnB1YjEuLi4vbm90ZTEuLi4gaHJlZnNcbi8vIHdpdGggYSBjb25maWd1cmFibGUgd2ViIFVSTCAoZGVmYXVsdDogbmp1bXAubWUpIG9uIG1vdXNlZG93biwgYmVmb3JlXG4vLyB0aGUgYnJvd3NlciBuYXZpZ2F0ZXMuXG5sZXQgX25vc3RyTGlua0Rpc2FibGVkID0gbnVsbDtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGFzeW5jIGUgPT4ge1xuICAgIGlmIChlLnRhcmdldC50YWdOYW1lICE9PSAnQScgfHwgIWUudGFyZ2V0LmhyZWYuc3RhcnRzV2l0aCgnbm9zdHI6JykpIHJldHVybjtcbiAgICBpZiAoX25vc3RyTGlua0Rpc2FibGVkID09PSBmYWxzZSkgcmV0dXJuO1xuXG4gICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgd2luZG93Lm5vc3RyLmJyb2FkY2FzdCgncmVwbGFjZVVSTCcsIHtcbiAgICAgICAgdXJsOiBlLnRhcmdldC5ocmVmLFxuICAgIH0pO1xuICAgIGlmIChyZXNwb25zZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgX25vc3RyTGlua0Rpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZS50YXJnZXQuaHJlZiA9IHJlc3BvbnNlO1xufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbWVzc2FnZSA9PiB7XG4gICAgLy8gTkstNTogb25seSBhY2NlcHQgcmVzcG9uc2VzIGZyb20gdGhpcyBzYW1lIHdpbmRvdywgY2FycnlpbmcgdGhlIHByaXZhdGVcbiAgICAvLyBjaGFubmVsIHRva2VuIHRoYXQgdGhlIGNvbnRlbnQgc2NyaXB0IGFuZCB0aGlzIHNjcmlwdCBzaGFyZS5cbiAgICBpZiAobWVzc2FnZS5zb3VyY2UgIT09IHdpbmRvdykgcmV0dXJuO1xuICAgIGlmICghbWVzc2FnZS5kYXRhIHx8IG1lc3NhZ2UuZGF0YS50b2tlbiAhPT0gTktfQ0hBTk5FTF9UT0tFTikgcmV0dXJuO1xuXG4gICAgY29uc3QgdmFsaWRFdmVudHMgPSBbXG4gICAgICAgICdnZXRQdWJLZXknLFxuICAgICAgICAnc2lnbkV2ZW50JyxcbiAgICAgICAgJ2dldFJlbGF5cycsXG4gICAgICAgICdhZGRSZWxheScsXG4gICAgICAgICduaXAwNC5lbmNyeXB0JyxcbiAgICAgICAgJ25pcDA0LmRlY3J5cHQnLFxuICAgICAgICAnbmlwNDQuZW5jcnlwdCcsXG4gICAgICAgICduaXA0NC5kZWNyeXB0JyxcbiAgICBdLm1hcChlID0+IGByZXR1cm5fJHtlfWApO1xuICAgIGxldCB7IGtpbmQsIHJlcUlkLCBwYXlsb2FkIH0gPSBtZXNzYWdlLmRhdGE7XG5cbiAgICBpZiAoIXZhbGlkRXZlbnRzLmluY2x1ZGVzKGtpbmQpKSByZXR1cm47XG5cbiAgICB3aW5kb3cubm9zdHIucmVxdWVzdHNbcmVxSWRdPy4ocGF5bG9hZCk7XG4gICAgZGVsZXRlIHdpbmRvdy5ub3N0ci5yZXF1ZXN0c1tyZXFJZF07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBT0EsTUFBTSxvQkFBb0IsTUFBTTtBQUM1QixRQUFJO0FBQ0EsWUFBTSxLQUFLLFNBQVM7QUFDcEIsWUFBTSxJQUFJLElBQUksU0FBUyxXQUFXO0FBQ2xDLFVBQUksR0FBSSxJQUFHLGdCQUFnQixlQUFlO0FBQzFDLGFBQU87QUFBQSxJQUNYLFFBQVE7QUFDSixhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0osR0FBRztBQU1ILE1BQU0sa0JBQWtCO0FBR3hCLE1BQU0sV0FBVyxvQkFBSSxJQUFJO0FBQUEsSUFDckIsQ0FBQyxtQkFBbUIscUNBQXFDO0FBQUEsSUFDekQsQ0FBQyxxQkFBcUIscUNBQXFDO0FBQUEsSUFDM0QsQ0FBQyxnQkFBZ0IsbURBQW1EO0FBQUEsSUFDcEUsQ0FBQyxVQUFVLCtDQUErQztBQUFBLElBQzFELENBQUMsa0JBQWtCLCtDQUErQztBQUFBLElBQ2xFLENBQUMsYUFBYSw2QkFBNkI7QUFBQSxJQUMzQyxDQUFDLG9CQUFvQix5Q0FBeUM7QUFBQSxFQUNsRSxDQUFDO0FBRUQsV0FBUyxRQUFRLE9BQU87QUFDcEIsVUFBTSxPQUFPLFNBQVMsSUFBSSxNQUFNLEtBQUssSUFBSSxNQUFNLFFBQVE7QUFDdkQsV0FBTyxPQUFPLE9BQU8sSUFBSSxNQUFNLFNBQVMsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztBQUFBLEVBQ2hFO0FBRUEsTUFBTSxZQUFZLENBQUMsVUFBVSxPQUFPLFVBQVUsWUFBWSxVQUFVLFFBQVEsT0FBTyxNQUFNLFVBQVU7QUFFbkcsU0FBTyxRQUFRO0FBQUEsSUFDWCxVQUFVLENBQUM7QUFBQSxJQUVYLE1BQU0sZUFBZTtBQUNqQixhQUFPLE1BQU0sS0FBSyxVQUFVLFdBQVc7QUFBQSxJQUMzQztBQUFBLElBRUEsTUFBTSxVQUFVLE9BQU87QUFDbkIsYUFBTyxNQUFNLEtBQUssVUFBVSxhQUFhLEtBQUs7QUFBQSxJQUNsRDtBQUFBLElBRUEsTUFBTSxZQUFZO0FBQ2QsYUFBTyxNQUFNLEtBQUssVUFBVSxXQUFXO0FBQUEsSUFDM0M7QUFBQSxJQUVBLE1BQU0sU0FBUyxLQUFLO0FBQ2hCLGFBQU8sTUFBTSxLQUFLLFVBQVUsWUFBWSxFQUFFLElBQUksQ0FBQztBQUFBLElBQ25EO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVVBLE1BQU0sU0FBUztBQUNYLGFBQU8sRUFBRSxTQUFTLEtBQUs7QUFBQSxJQUMzQjtBQUFBLElBRUEsVUFBVSxNQUFNLFNBQVM7QUFDckIsVUFBSSxRQUFRLE9BQU8sV0FBVztBQUM5QixhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUNwQyxjQUFNLFVBQVUsV0FBVyxNQUFNO0FBQzdCLGlCQUFPLEtBQUssU0FBUyxLQUFLO0FBQzFCLGlCQUFPLFFBQVEsRUFBRSxPQUFPLFlBQVksQ0FBQyxDQUFDO0FBQUEsUUFDMUMsR0FBRyxlQUFlO0FBQ2xCLGFBQUssU0FBUyxLQUFLLElBQUksQ0FBQyxXQUFXO0FBQy9CLHVCQUFhLE9BQU87QUFDcEIsY0FBSSxVQUFVLE1BQU0sRUFBRyxRQUFPLFFBQVEsTUFBTSxDQUFDO0FBQUEsY0FDeEMsU0FBUSxNQUFNO0FBQUEsUUFDdkI7QUFFQSxlQUFPLFlBQVksRUFBRSxNQUFNLE9BQU8sUUFBUSxHQUFHLE9BQU8sU0FBUyxNQUFNO0FBQUEsTUFDdkUsQ0FBQztBQUFBLElBQ0w7QUFBQSxJQUVBLE9BQU87QUFBQSxNQUNILE1BQU0sUUFBUSxRQUFRLFdBQVc7QUFDN0IsZUFBTyxNQUFNLE9BQU8sTUFBTSxVQUFVLGlCQUFpQjtBQUFBLFVBQ2pEO0FBQUEsVUFDQTtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0w7QUFBQSxNQUVBLE1BQU0sUUFBUSxRQUFRLFlBQVk7QUFDOUIsZUFBTyxNQUFNLE9BQU8sTUFBTSxVQUFVLGlCQUFpQjtBQUFBLFVBQ2pEO0FBQUEsVUFDQTtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0w7QUFBQSxJQUNKO0FBQUEsSUFFQSxPQUFPO0FBQUEsTUFDSCxNQUFNLFFBQVEsUUFBUSxXQUFXO0FBQzdCLGVBQU8sTUFBTSxPQUFPLE1BQU0sVUFBVSxpQkFBaUI7QUFBQSxVQUNqRDtBQUFBLFVBQ0E7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBQUEsTUFFQSxNQUFNLFFBQVEsUUFBUSxZQUFZO0FBQzlCLGVBQU8sTUFBTSxPQUFPLE1BQU0sVUFBVSxpQkFBaUI7QUFBQSxVQUNqRDtBQUFBLFVBQ0E7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFLQSxNQUFJLHFCQUFxQjtBQUN6QixXQUFTLGlCQUFpQixhQUFhLE9BQU0sTUFBSztBQUM5QyxRQUFJLEVBQUUsT0FBTyxZQUFZLE9BQU8sQ0FBQyxFQUFFLE9BQU8sS0FBSyxXQUFXLFFBQVEsRUFBRztBQUNyRSxRQUFJLHVCQUF1QixNQUFPO0FBRWxDLFFBQUksV0FBVyxNQUFNLE9BQU8sTUFBTSxVQUFVLGNBQWM7QUFBQSxNQUN0RCxLQUFLLEVBQUUsT0FBTztBQUFBLElBQ2xCLENBQUM7QUFDRCxRQUFJLGFBQWEsT0FBTztBQUNwQiwyQkFBcUI7QUFDckI7QUFBQSxJQUNKO0FBQ0EsTUFBRSxPQUFPLE9BQU87QUFBQSxFQUNwQixDQUFDO0FBRUQsU0FBTyxpQkFBaUIsV0FBVyxhQUFXO0FBRzFDLFFBQUksUUFBUSxXQUFXLE9BQVE7QUFDL0IsUUFBSSxDQUFDLFFBQVEsUUFBUSxRQUFRLEtBQUssVUFBVSxpQkFBa0I7QUFFOUQsVUFBTSxjQUFjO0FBQUEsTUFDaEI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDSixFQUFFLElBQUksT0FBSyxVQUFVLENBQUMsRUFBRTtBQUN4QixRQUFJLEVBQUUsTUFBTSxPQUFPLFFBQVEsSUFBSSxRQUFRO0FBRXZDLFFBQUksQ0FBQyxZQUFZLFNBQVMsSUFBSSxFQUFHO0FBRWpDLFdBQU8sTUFBTSxTQUFTLEtBQUssSUFBSSxPQUFPO0FBQ3RDLFdBQU8sT0FBTyxNQUFNLFNBQVMsS0FBSztBQUFBLEVBQ3RDLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
