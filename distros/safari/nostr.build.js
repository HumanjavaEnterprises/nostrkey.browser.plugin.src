(() => {
  // src/nostr.js
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
        window.postMessage({ kind, reqId, payload }, "*");
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
    const validEvents = [
      "getPubKey",
      "signEvent",
      "getRelays",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vc3JjL25vc3RyLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJ3aW5kb3cubm9zdHIgPSB7XG4gICAgcmVxdWVzdHM6IHt9LFxuXG4gICAgYXN5bmMgZ2V0UHVibGljS2V5KCkge1xuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5icm9hZGNhc3QoJ2dldFB1YktleScpO1xuICAgIH0sXG5cbiAgICBhc3luYyBzaWduRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYnJvYWRjYXN0KCdzaWduRXZlbnQnLCBldmVudCk7XG4gICAgfSxcblxuICAgIGFzeW5jIGdldFJlbGF5cygpIHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYnJvYWRjYXN0KCdnZXRSZWxheXMnKTtcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBpcyBoZXJlIGZvciBBbGJ5IGNvbWF0aWJpbGl0eS4gVGhpcyBpcyBub3QgcGFydCBvZiB0aGUgTklQLTA3IHN0YW5kYXJkLlxuICAgIC8vIEkgaGF2ZSBmb3VuZCBhdCBsZWFzdCBvbmUgc2l0ZSwgbm9zdHIuYmFuZCwgd2hpY2ggZXhwZWN0cyBpdCB0byBiZSBwcmVzZW50LlxuICAgIGFzeW5jIGVuYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHsgZW5hYmxlZDogdHJ1ZSB9O1xuICAgIH0sXG5cbiAgICBicm9hZGNhc3Qoa2luZCwgcGF5bG9hZCkge1xuICAgICAgICBsZXQgcmVxSWQgPSBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnJlcXVlc3RzW3JlcUlkXTtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdOb3N0cktleTogcmVxdWVzdCB0aW1lZCBvdXQnKSk7XG4gICAgICAgICAgICB9LCAzMDAwMCk7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RzW3JlcUlkXSA9IChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7IGtpbmQsIHJlcUlkLCBwYXlsb2FkIH0sICcqJyk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBuaXAwNDoge1xuICAgICAgICBhc3luYyBlbmNyeXB0KHB1YktleSwgcGxhaW5UZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgd2luZG93Lm5vc3RyLmJyb2FkY2FzdCgnbmlwMDQuZW5jcnlwdCcsIHtcbiAgICAgICAgICAgICAgICBwdWJLZXksXG4gICAgICAgICAgICAgICAgcGxhaW5UZXh0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXN5bmMgZGVjcnlwdChwdWJLZXksIGNpcGhlclRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB3aW5kb3cubm9zdHIuYnJvYWRjYXN0KCduaXAwNC5kZWNyeXB0Jywge1xuICAgICAgICAgICAgICAgIHB1YktleSxcbiAgICAgICAgICAgICAgICBjaXBoZXJUZXh0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIG5pcDQ0OiB7XG4gICAgICAgIGFzeW5jIGVuY3J5cHQocHViS2V5LCBwbGFpblRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCB3aW5kb3cubm9zdHIuYnJvYWRjYXN0KCduaXA0NC5lbmNyeXB0Jywge1xuICAgICAgICAgICAgICAgIHB1YktleSxcbiAgICAgICAgICAgICAgICBwbGFpblRleHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhc3luYyBkZWNyeXB0KHB1YktleSwgY2lwaGVyVGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHdpbmRvdy5ub3N0ci5icm9hZGNhc3QoJ25pcDQ0LmRlY3J5cHQnLCB7XG4gICAgICAgICAgICAgICAgcHViS2V5LFxuICAgICAgICAgICAgICAgIGNpcGhlclRleHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICB9LFxufTtcblxuLy8gbm9zdHI6IHByb3RvY29sIGxpbmsgaGFuZGxlciBcdTIwMTQgcmVwbGFjZXMgbm9zdHI6bnB1YjEuLi4vbm90ZTEuLi4gaHJlZnNcbi8vIHdpdGggYSBjb25maWd1cmFibGUgd2ViIFVSTCAoZGVmYXVsdDogbmp1bXAubWUpIG9uIG1vdXNlZG93biwgYmVmb3JlXG4vLyB0aGUgYnJvd3NlciBuYXZpZ2F0ZXMuXG5sZXQgX25vc3RyTGlua0Rpc2FibGVkID0gbnVsbDtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGFzeW5jIGUgPT4ge1xuICAgIGlmIChlLnRhcmdldC50YWdOYW1lICE9PSAnQScgfHwgIWUudGFyZ2V0LmhyZWYuc3RhcnRzV2l0aCgnbm9zdHI6JykpIHJldHVybjtcbiAgICBpZiAoX25vc3RyTGlua0Rpc2FibGVkID09PSBmYWxzZSkgcmV0dXJuO1xuXG4gICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgd2luZG93Lm5vc3RyLmJyb2FkY2FzdCgncmVwbGFjZVVSTCcsIHtcbiAgICAgICAgdXJsOiBlLnRhcmdldC5ocmVmLFxuICAgIH0pO1xuICAgIGlmIChyZXNwb25zZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgX25vc3RyTGlua0Rpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZS50YXJnZXQuaHJlZiA9IHJlc3BvbnNlO1xufSk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbWVzc2FnZSA9PiB7XG4gICAgY29uc3QgdmFsaWRFdmVudHMgPSBbXG4gICAgICAgICdnZXRQdWJLZXknLFxuICAgICAgICAnc2lnbkV2ZW50JyxcbiAgICAgICAgJ2dldFJlbGF5cycsXG4gICAgICAgICduaXAwNC5lbmNyeXB0JyxcbiAgICAgICAgJ25pcDA0LmRlY3J5cHQnLFxuICAgICAgICAnbmlwNDQuZW5jcnlwdCcsXG4gICAgICAgICduaXA0NC5kZWNyeXB0JyxcbiAgICBdLm1hcChlID0+IGByZXR1cm5fJHtlfWApO1xuICAgIGxldCB7IGtpbmQsIHJlcUlkLCBwYXlsb2FkIH0gPSBtZXNzYWdlLmRhdGE7XG5cbiAgICBpZiAoIXZhbGlkRXZlbnRzLmluY2x1ZGVzKGtpbmQpKSByZXR1cm47XG5cbiAgICB3aW5kb3cubm9zdHIucmVxdWVzdHNbcmVxSWRdPy4ocGF5bG9hZCk7XG4gICAgZGVsZXRlIHdpbmRvdy5ub3N0ci5yZXF1ZXN0c1tyZXFJZF07XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBQUEsU0FBTyxRQUFRO0FBQUEsSUFDWCxVQUFVLENBQUM7QUFBQSxJQUVYLE1BQU0sZUFBZTtBQUNqQixhQUFPLE1BQU0sS0FBSyxVQUFVLFdBQVc7QUFBQSxJQUMzQztBQUFBLElBRUEsTUFBTSxVQUFVLE9BQU87QUFDbkIsYUFBTyxNQUFNLEtBQUssVUFBVSxhQUFhLEtBQUs7QUFBQSxJQUNsRDtBQUFBLElBRUEsTUFBTSxZQUFZO0FBQ2QsYUFBTyxNQUFNLEtBQUssVUFBVSxXQUFXO0FBQUEsSUFDM0M7QUFBQTtBQUFBO0FBQUEsSUFJQSxNQUFNLFNBQVM7QUFDWCxhQUFPLEVBQUUsU0FBUyxLQUFLO0FBQUEsSUFDM0I7QUFBQSxJQUVBLFVBQVUsTUFBTSxTQUFTO0FBQ3JCLFVBQUksUUFBUSxPQUFPLFdBQVc7QUFDOUIsYUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDcEMsY0FBTSxVQUFVLFdBQVcsTUFBTTtBQUM3QixpQkFBTyxLQUFLLFNBQVMsS0FBSztBQUMxQixpQkFBTyxJQUFJLE1BQU0sNkJBQTZCLENBQUM7QUFBQSxRQUNuRCxHQUFHLEdBQUs7QUFDUixhQUFLLFNBQVMsS0FBSyxJQUFJLENBQUMsV0FBVztBQUMvQix1QkFBYSxPQUFPO0FBQ3BCLGtCQUFRLE1BQU07QUFBQSxRQUNsQjtBQUNBLGVBQU8sWUFBWSxFQUFFLE1BQU0sT0FBTyxRQUFRLEdBQUcsR0FBRztBQUFBLE1BQ3BELENBQUM7QUFBQSxJQUNMO0FBQUEsSUFFQSxPQUFPO0FBQUEsTUFDSCxNQUFNLFFBQVEsUUFBUSxXQUFXO0FBQzdCLGVBQU8sTUFBTSxPQUFPLE1BQU0sVUFBVSxpQkFBaUI7QUFBQSxVQUNqRDtBQUFBLFVBQ0E7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBQUEsTUFFQSxNQUFNLFFBQVEsUUFBUSxZQUFZO0FBQzlCLGVBQU8sTUFBTSxPQUFPLE1BQU0sVUFBVSxpQkFBaUI7QUFBQSxVQUNqRDtBQUFBLFVBQ0E7QUFBQSxRQUNKLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUFBLElBRUEsT0FBTztBQUFBLE1BQ0gsTUFBTSxRQUFRLFFBQVEsV0FBVztBQUM3QixlQUFPLE1BQU0sT0FBTyxNQUFNLFVBQVUsaUJBQWlCO0FBQUEsVUFDakQ7QUFBQSxVQUNBO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTDtBQUFBLE1BRUEsTUFBTSxRQUFRLFFBQVEsWUFBWTtBQUM5QixlQUFPLE1BQU0sT0FBTyxNQUFNLFVBQVUsaUJBQWlCO0FBQUEsVUFDakQ7QUFBQSxVQUNBO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTDtBQUFBLElBQ0o7QUFBQSxFQUNKO0FBS0EsTUFBSSxxQkFBcUI7QUFDekIsV0FBUyxpQkFBaUIsYUFBYSxPQUFNLE1BQUs7QUFDOUMsUUFBSSxFQUFFLE9BQU8sWUFBWSxPQUFPLENBQUMsRUFBRSxPQUFPLEtBQUssV0FBVyxRQUFRLEVBQUc7QUFDckUsUUFBSSx1QkFBdUIsTUFBTztBQUVsQyxRQUFJLFdBQVcsTUFBTSxPQUFPLE1BQU0sVUFBVSxjQUFjO0FBQUEsTUFDdEQsS0FBSyxFQUFFLE9BQU87QUFBQSxJQUNsQixDQUFDO0FBQ0QsUUFBSSxhQUFhLE9BQU87QUFDcEIsMkJBQXFCO0FBQ3JCO0FBQUEsSUFDSjtBQUNBLE1BQUUsT0FBTyxPQUFPO0FBQUEsRUFDcEIsQ0FBQztBQUVELFNBQU8saUJBQWlCLFdBQVcsYUFBVztBQUMxQyxVQUFNLGNBQWM7QUFBQSxNQUNoQjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0osRUFBRSxJQUFJLE9BQUssVUFBVSxDQUFDLEVBQUU7QUFDeEIsUUFBSSxFQUFFLE1BQU0sT0FBTyxRQUFRLElBQUksUUFBUTtBQUV2QyxRQUFJLENBQUMsWUFBWSxTQUFTLElBQUksRUFBRztBQUVqQyxXQUFPLE1BQU0sU0FBUyxLQUFLLElBQUksT0FBTztBQUN0QyxXQUFPLE9BQU8sTUFBTSxTQUFTLEtBQUs7QUFBQSxFQUN0QyxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
