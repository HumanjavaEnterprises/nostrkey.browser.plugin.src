/**
 * Import a page script and run only that load's DOMContentLoaded handlers, so a
 * suite that opens several pages never reruns an earlier page's start-up on the
 * one shared jsdom document.
 */
export async function startPage(load) {
    const handlers = [];
    const realAdd = document.addEventListener;
    document.addEventListener = function add(type, fn, options) {
        if (type === 'DOMContentLoaded') handlers.push(fn);
        else realAdd.call(this, type, fn, options);
    };
    try {
        await load();
    } finally {
        document.addEventListener = realAdd;
    }
    window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
    await Promise.all(handlers.map(fn => fn(new Event('DOMContentLoaded'))));
}
