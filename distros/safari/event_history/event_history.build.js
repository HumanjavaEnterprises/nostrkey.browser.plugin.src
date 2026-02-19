(() => {
  // node_modules/@alpinejs/csp/dist/module.esm.js
  var flushPending = false;
  var flushing = false;
  var queue = [];
  var lastFlushedIndex = -1;
  var transactionActive = false;
  function scheduler(callback) {
    queueJob(callback);
  }
  function startTransaction() {
    transactionActive = true;
  }
  function commitTransaction() {
    transactionActive = false;
    queueFlush();
  }
  function queueJob(job) {
    if (!queue.includes(job))
      queue.push(job);
    queueFlush();
  }
  function dequeueJob(job) {
    let index = queue.indexOf(job);
    if (index !== -1 && index > lastFlushedIndex)
      queue.splice(index, 1);
  }
  function queueFlush() {
    if (!flushing && !flushPending) {
      if (transactionActive)
        return;
      flushPending = true;
      queueMicrotask(flushJobs);
    }
  }
  function flushJobs() {
    flushPending = false;
    flushing = true;
    for (let i = 0; i < queue.length; i++) {
      queue[i]();
      lastFlushedIndex = i;
    }
    queue.length = 0;
    lastFlushedIndex = -1;
    flushing = false;
  }
  var reactive;
  var effect;
  var release;
  var raw;
  var shouldSchedule = true;
  function disableEffectScheduling(callback) {
    shouldSchedule = false;
    callback();
    shouldSchedule = true;
  }
  function setReactivityEngine(engine) {
    reactive = engine.reactive;
    release = engine.release;
    effect = (callback) => engine.effect(callback, { scheduler: (task) => {
      if (shouldSchedule) {
        scheduler(task);
      } else {
        task();
      }
    } });
    raw = engine.raw;
  }
  function overrideEffect(override) {
    effect = override;
  }
  function elementBoundEffect(el) {
    let cleanup2 = () => {
    };
    let wrappedEffect = (callback) => {
      let effectReference = effect(callback);
      if (!el._x_effects) {
        el._x_effects = /* @__PURE__ */ new Set();
        el._x_runEffects = () => {
          el._x_effects.forEach((i) => i());
        };
      }
      el._x_effects.add(effectReference);
      cleanup2 = () => {
        if (effectReference === void 0)
          return;
        el._x_effects.delete(effectReference);
        release(effectReference);
      };
      return effectReference;
    };
    return [wrappedEffect, () => {
      cleanup2();
    }];
  }
  function watch(getter, callback) {
    let firstTime = true;
    let oldValue;
    let effectReference = effect(() => {
      let value = getter();
      JSON.stringify(value);
      if (!firstTime) {
        if (typeof value === "object" || value !== oldValue) {
          let previousValue = oldValue;
          queueMicrotask(() => {
            callback(value, previousValue);
          });
        }
      }
      oldValue = value;
      firstTime = false;
    });
    return () => release(effectReference);
  }
  async function transaction(callback) {
    startTransaction();
    try {
      await callback();
      await Promise.resolve();
    } finally {
      commitTransaction();
    }
  }
  var onAttributeAddeds = [];
  var onElRemoveds = [];
  var onElAddeds = [];
  function onElAdded(callback) {
    onElAddeds.push(callback);
  }
  function onElRemoved(el, callback) {
    if (typeof callback === "function") {
      if (!el._x_cleanups)
        el._x_cleanups = [];
      el._x_cleanups.push(callback);
    } else {
      callback = el;
      onElRemoveds.push(callback);
    }
  }
  function onAttributesAdded(callback) {
    onAttributeAddeds.push(callback);
  }
  function onAttributeRemoved(el, name, callback) {
    if (!el._x_attributeCleanups)
      el._x_attributeCleanups = {};
    if (!el._x_attributeCleanups[name])
      el._x_attributeCleanups[name] = [];
    el._x_attributeCleanups[name].push(callback);
  }
  function cleanupAttributes(el, names) {
    if (!el._x_attributeCleanups)
      return;
    Object.entries(el._x_attributeCleanups).forEach(([name, value]) => {
      if (names === void 0 || names.includes(name)) {
        value.forEach((i) => i());
        delete el._x_attributeCleanups[name];
      }
    });
  }
  function cleanupElement(el) {
    el._x_effects?.forEach(dequeueJob);
    while (el._x_cleanups?.length)
      el._x_cleanups.pop()();
  }
  var observer = new MutationObserver(onMutate);
  var currentlyObserving = false;
  function startObservingMutations() {
    observer.observe(document, { subtree: true, childList: true, attributes: true, attributeOldValue: true });
    currentlyObserving = true;
  }
  function stopObservingMutations() {
    flushObserver();
    observer.disconnect();
    currentlyObserving = false;
  }
  var queuedMutations = [];
  function flushObserver() {
    let records = observer.takeRecords();
    queuedMutations.push(() => records.length > 0 && onMutate(records));
    let queueLengthWhenTriggered = queuedMutations.length;
    queueMicrotask(() => {
      if (queuedMutations.length === queueLengthWhenTriggered) {
        while (queuedMutations.length > 0)
          queuedMutations.shift()();
      }
    });
  }
  function mutateDom(callback) {
    if (!currentlyObserving)
      return callback();
    stopObservingMutations();
    let result = callback();
    startObservingMutations();
    return result;
  }
  var isCollecting = false;
  var deferredMutations = [];
  function deferMutations() {
    isCollecting = true;
  }
  function flushAndStopDeferringMutations() {
    isCollecting = false;
    onMutate(deferredMutations);
    deferredMutations = [];
  }
  function onMutate(mutations) {
    if (isCollecting) {
      deferredMutations = deferredMutations.concat(mutations);
      return;
    }
    let addedNodes = [];
    let removedNodes = /* @__PURE__ */ new Set();
    let addedAttributes = /* @__PURE__ */ new Map();
    let removedAttributes = /* @__PURE__ */ new Map();
    for (let i = 0; i < mutations.length; i++) {
      if (mutations[i].target._x_ignoreMutationObserver)
        continue;
      if (mutations[i].type === "childList") {
        mutations[i].removedNodes.forEach((node) => {
          if (node.nodeType !== 1)
            return;
          if (!node._x_marker)
            return;
          removedNodes.add(node);
        });
        mutations[i].addedNodes.forEach((node) => {
          if (node.nodeType !== 1)
            return;
          if (removedNodes.has(node)) {
            removedNodes.delete(node);
            return;
          }
          if (node._x_marker)
            return;
          addedNodes.push(node);
        });
      }
      if (mutations[i].type === "attributes") {
        let el = mutations[i].target;
        let name = mutations[i].attributeName;
        let oldValue = mutations[i].oldValue;
        let add2 = () => {
          if (!addedAttributes.has(el))
            addedAttributes.set(el, []);
          addedAttributes.get(el).push({ name, value: el.getAttribute(name) });
        };
        let remove = () => {
          if (!removedAttributes.has(el))
            removedAttributes.set(el, []);
          removedAttributes.get(el).push(name);
        };
        if (el.hasAttribute(name) && oldValue === null) {
          add2();
        } else if (el.hasAttribute(name)) {
          remove();
          add2();
        } else {
          remove();
        }
      }
    }
    removedAttributes.forEach((attrs, el) => {
      cleanupAttributes(el, attrs);
    });
    addedAttributes.forEach((attrs, el) => {
      onAttributeAddeds.forEach((i) => i(el, attrs));
    });
    for (let node of removedNodes) {
      if (addedNodes.some((i) => i.contains(node)))
        continue;
      onElRemoveds.forEach((i) => i(node));
    }
    for (let node of addedNodes) {
      if (!node.isConnected)
        continue;
      onElAddeds.forEach((i) => i(node));
    }
    addedNodes = null;
    removedNodes = null;
    addedAttributes = null;
    removedAttributes = null;
  }
  function scope(node) {
    return mergeProxies(closestDataStack(node));
  }
  function addScopeToNode(node, data2, referenceNode) {
    node._x_dataStack = [data2, ...closestDataStack(referenceNode || node)];
    return () => {
      node._x_dataStack = node._x_dataStack.filter((i) => i !== data2);
    };
  }
  function closestDataStack(node) {
    if (node._x_dataStack)
      return node._x_dataStack;
    if (typeof ShadowRoot === "function" && node instanceof ShadowRoot) {
      return closestDataStack(node.host);
    }
    if (!node.parentNode) {
      return [];
    }
    return closestDataStack(node.parentNode);
  }
  function mergeProxies(objects) {
    return new Proxy({ objects }, mergeProxyTrap);
  }
  var mergeProxyTrap = {
    ownKeys({ objects }) {
      return Array.from(
        new Set(objects.flatMap((i) => Object.keys(i)))
      );
    },
    has({ objects }, name) {
      if (name == Symbol.unscopables)
        return false;
      return objects.some(
        (obj) => Object.prototype.hasOwnProperty.call(obj, name) || Reflect.has(obj, name)
      );
    },
    get({ objects }, name, thisProxy) {
      if (name == "toJSON")
        return collapseProxies;
      return Reflect.get(
        objects.find(
          (obj) => Reflect.has(obj, name)
        ) || {},
        name,
        thisProxy
      );
    },
    set({ objects }, name, value, thisProxy) {
      const target = objects.find(
        (obj) => Object.prototype.hasOwnProperty.call(obj, name)
      ) || objects[objects.length - 1];
      const descriptor = Object.getOwnPropertyDescriptor(target, name);
      if (descriptor?.set && descriptor?.get)
        return descriptor.set.call(thisProxy, value) || true;
      return Reflect.set(target, name, value);
    }
  };
  function collapseProxies() {
    let keys = Reflect.ownKeys(this);
    return keys.reduce((acc, key) => {
      acc[key] = Reflect.get(this, key);
      return acc;
    }, {});
  }
  function initInterceptors(data2) {
    let isObject2 = (val) => typeof val === "object" && !Array.isArray(val) && val !== null;
    let recurse = (obj, basePath = "") => {
      Object.entries(Object.getOwnPropertyDescriptors(obj)).forEach(([key, { value, enumerable }]) => {
        if (enumerable === false || value === void 0)
          return;
        if (typeof value === "object" && value !== null && value.__v_skip)
          return;
        let path = basePath === "" ? key : `${basePath}.${key}`;
        if (typeof value === "object" && value !== null && value._x_interceptor) {
          obj[key] = value.initialize(data2, path, key);
        } else {
          if (isObject2(value) && value !== obj && !(value instanceof Element)) {
            recurse(value, path);
          }
        }
      });
    };
    return recurse(data2);
  }
  function interceptor(callback, mutateObj = () => {
  }) {
    let obj = {
      initialValue: void 0,
      _x_interceptor: true,
      initialize(data2, path, key) {
        return callback(this.initialValue, () => get(data2, path), (value) => set(data2, path, value), path, key);
      }
    };
    mutateObj(obj);
    return (initialValue) => {
      if (typeof initialValue === "object" && initialValue !== null && initialValue._x_interceptor) {
        let initialize = obj.initialize.bind(obj);
        obj.initialize = (data2, path, key) => {
          let innerValue = initialValue.initialize(data2, path, key);
          obj.initialValue = innerValue;
          return initialize(data2, path, key);
        };
      } else {
        obj.initialValue = initialValue;
      }
      return obj;
    };
  }
  function get(obj, path) {
    return path.split(".").reduce((carry, segment) => carry[segment], obj);
  }
  function set(obj, path, value) {
    if (typeof path === "string")
      path = path.split(".");
    if (path.length === 1)
      obj[path[0]] = value;
    else if (path.length === 0)
      throw error;
    else {
      if (obj[path[0]])
        return set(obj[path[0]], path.slice(1), value);
      else {
        obj[path[0]] = {};
        return set(obj[path[0]], path.slice(1), value);
      }
    }
  }
  var magics = {};
  function magic(name, callback) {
    magics[name] = callback;
  }
  function injectMagics(obj, el) {
    let memoizedUtilities = getUtilities(el);
    Object.entries(magics).forEach(([name, callback]) => {
      Object.defineProperty(obj, `$${name}`, {
        get() {
          return callback(el, memoizedUtilities);
        },
        enumerable: false
      });
    });
    return obj;
  }
  function getUtilities(el) {
    let [utilities, cleanup2] = getElementBoundUtilities(el);
    let utils = { interceptor, ...utilities };
    onElRemoved(el, cleanup2);
    return utils;
  }
  function tryCatch(el, expression, callback, ...args) {
    try {
      return callback(...args);
    } catch (e) {
      handleError(e, el, expression);
    }
  }
  function handleError(...args) {
    return errorHandler(...args);
  }
  var errorHandler = normalErrorHandler;
  function setErrorHandler(handler4) {
    errorHandler = handler4;
  }
  function normalErrorHandler(error2, el, expression = void 0) {
    error2 = Object.assign(
      error2 ?? { message: "No error message given." },
      { el, expression }
    );
    console.warn(`Alpine Expression Error: ${error2.message}

${expression ? 'Expression: "' + expression + '"\n\n' : ""}`, el);
    setTimeout(() => {
      throw error2;
    }, 0);
  }
  var shouldAutoEvaluateFunctions = true;
  function dontAutoEvaluateFunctions(callback) {
    let cache = shouldAutoEvaluateFunctions;
    shouldAutoEvaluateFunctions = false;
    let result = callback();
    shouldAutoEvaluateFunctions = cache;
    return result;
  }
  function evaluate(el, expression, extras = {}) {
    let result;
    evaluateLater(el, expression)((value) => result = value, extras);
    return result;
  }
  function evaluateLater(...args) {
    return theEvaluatorFunction(...args);
  }
  var theEvaluatorFunction = normalEvaluator;
  function setEvaluator(newEvaluator) {
    theEvaluatorFunction = newEvaluator;
  }
  var theRawEvaluatorFunction;
  function setRawEvaluator(newEvaluator) {
    theRawEvaluatorFunction = newEvaluator;
  }
  function normalEvaluator(el, expression) {
    let overriddenMagics = {};
    injectMagics(overriddenMagics, el);
    let dataStack = [overriddenMagics, ...closestDataStack(el)];
    let evaluator = typeof expression === "function" ? generateEvaluatorFromFunction(dataStack, expression) : generateEvaluatorFromString(dataStack, expression, el);
    return tryCatch.bind(null, el, expression, evaluator);
  }
  function generateEvaluatorFromFunction(dataStack, func) {
    return (receiver = () => {
    }, { scope: scope2 = {}, params = [], context } = {}) => {
      if (!shouldAutoEvaluateFunctions) {
        runIfTypeOfFunction(receiver, func, mergeProxies([scope2, ...dataStack]), params);
        return;
      }
      let result = func.apply(mergeProxies([scope2, ...dataStack]), params);
      runIfTypeOfFunction(receiver, result);
    };
  }
  var evaluatorMemo = {};
  function generateFunctionFromString(expression, el) {
    if (evaluatorMemo[expression]) {
      return evaluatorMemo[expression];
    }
    let AsyncFunction = Object.getPrototypeOf(async function() {
    }).constructor;
    let rightSideSafeExpression = /^[\n\s]*if.*\(.*\)/.test(expression.trim()) || /^(let|const)\s/.test(expression.trim()) ? `(async()=>{ ${expression} })()` : expression;
    const safeAsyncFunction = () => {
      try {
        let func2 = new AsyncFunction(
          ["__self", "scope"],
          `with (scope) { __self.result = ${rightSideSafeExpression} }; __self.finished = true; return __self.result;`
        );
        Object.defineProperty(func2, "name", {
          value: `[Alpine] ${expression}`
        });
        return func2;
      } catch (error2) {
        handleError(error2, el, expression);
        return Promise.resolve();
      }
    };
    let func = safeAsyncFunction();
    evaluatorMemo[expression] = func;
    return func;
  }
  function generateEvaluatorFromString(dataStack, expression, el) {
    let func = generateFunctionFromString(expression, el);
    return (receiver = () => {
    }, { scope: scope2 = {}, params = [], context } = {}) => {
      func.result = void 0;
      func.finished = false;
      let completeScope = mergeProxies([scope2, ...dataStack]);
      if (typeof func === "function") {
        let promise = func.call(context, func, completeScope).catch((error2) => handleError(error2, el, expression));
        if (func.finished) {
          runIfTypeOfFunction(receiver, func.result, completeScope, params, el);
          func.result = void 0;
        } else {
          promise.then((result) => {
            runIfTypeOfFunction(receiver, result, completeScope, params, el);
          }).catch((error2) => handleError(error2, el, expression)).finally(() => func.result = void 0);
        }
      }
    };
  }
  function runIfTypeOfFunction(receiver, value, scope2, params, el) {
    if (shouldAutoEvaluateFunctions && typeof value === "function") {
      let result = value.apply(scope2, params);
      if (result instanceof Promise) {
        result.then((i) => runIfTypeOfFunction(receiver, i, scope2, params)).catch((error2) => handleError(error2, el, value));
      } else {
        receiver(result);
      }
    } else if (typeof value === "object" && value instanceof Promise) {
      value.then((i) => receiver(i));
    } else {
      receiver(value);
    }
  }
  function evaluateRaw(...args) {
    return theRawEvaluatorFunction(...args);
  }
  var prefixAsString = "x-";
  function prefix(subject = "") {
    return prefixAsString + subject;
  }
  function setPrefix(newPrefix) {
    prefixAsString = newPrefix;
  }
  var directiveHandlers = {};
  function directive(name, callback) {
    directiveHandlers[name] = callback;
    return {
      before(directive2) {
        if (!directiveHandlers[directive2]) {
          console.warn(String.raw`Cannot find directive \`${directive2}\`. \`${name}\` will use the default order of execution`);
          return;
        }
        const pos = directiveOrder.indexOf(directive2);
        directiveOrder.splice(pos >= 0 ? pos : directiveOrder.indexOf("DEFAULT"), 0, name);
      }
    };
  }
  function directiveExists(name) {
    return Object.keys(directiveHandlers).includes(name);
  }
  function directives(el, attributes, originalAttributeOverride) {
    attributes = Array.from(attributes);
    if (el._x_virtualDirectives) {
      let vAttributes = Object.entries(el._x_virtualDirectives).map(([name, value]) => ({ name, value }));
      let staticAttributes = attributesOnly(vAttributes);
      vAttributes = vAttributes.map((attribute) => {
        if (staticAttributes.find((attr) => attr.name === attribute.name)) {
          return {
            name: `x-bind:${attribute.name}`,
            value: `"${attribute.value}"`
          };
        }
        return attribute;
      });
      attributes = attributes.concat(vAttributes);
    }
    let transformedAttributeMap = {};
    let directives2 = attributes.map(toTransformedAttributes((newName, oldName) => transformedAttributeMap[newName] = oldName)).filter(outNonAlpineAttributes).map(toParsedDirectives(transformedAttributeMap, originalAttributeOverride)).sort(byPriority);
    return directives2.map((directive2) => {
      return getDirectiveHandler(el, directive2);
    });
  }
  function attributesOnly(attributes) {
    return Array.from(attributes).map(toTransformedAttributes()).filter((attr) => !outNonAlpineAttributes(attr));
  }
  var isDeferringHandlers = false;
  var directiveHandlerStacks = /* @__PURE__ */ new Map();
  var currentHandlerStackKey = /* @__PURE__ */ Symbol();
  function deferHandlingDirectives(callback) {
    isDeferringHandlers = true;
    let key = /* @__PURE__ */ Symbol();
    currentHandlerStackKey = key;
    directiveHandlerStacks.set(key, []);
    let flushHandlers = () => {
      while (directiveHandlerStacks.get(key).length)
        directiveHandlerStacks.get(key).shift()();
      directiveHandlerStacks.delete(key);
    };
    let stopDeferring = () => {
      isDeferringHandlers = false;
      flushHandlers();
    };
    callback(flushHandlers);
    stopDeferring();
  }
  function getElementBoundUtilities(el) {
    let cleanups = [];
    let cleanup2 = (callback) => cleanups.push(callback);
    let [effect3, cleanupEffect] = elementBoundEffect(el);
    cleanups.push(cleanupEffect);
    let utilities = {
      Alpine: alpine_default,
      effect: effect3,
      cleanup: cleanup2,
      evaluateLater: evaluateLater.bind(evaluateLater, el),
      evaluate: evaluate.bind(evaluate, el)
    };
    let doCleanup = () => cleanups.forEach((i) => i());
    return [utilities, doCleanup];
  }
  function getDirectiveHandler(el, directive2) {
    let noop = () => {
    };
    let handler4 = directiveHandlers[directive2.type] || noop;
    let [utilities, cleanup2] = getElementBoundUtilities(el);
    onAttributeRemoved(el, directive2.original, cleanup2);
    let fullHandler = () => {
      if (el._x_ignore || el._x_ignoreSelf)
        return;
      handler4.inline && handler4.inline(el, directive2, utilities);
      handler4 = handler4.bind(handler4, el, directive2, utilities);
      isDeferringHandlers ? directiveHandlerStacks.get(currentHandlerStackKey).push(handler4) : handler4();
    };
    fullHandler.runCleanups = cleanup2;
    return fullHandler;
  }
  var startingWith = (subject, replacement) => ({ name, value }) => {
    if (name.startsWith(subject))
      name = name.replace(subject, replacement);
    return { name, value };
  };
  var into = (i) => i;
  function toTransformedAttributes(callback = () => {
  }) {
    return ({ name, value }) => {
      let { name: newName, value: newValue } = attributeTransformers.reduce((carry, transform) => {
        return transform(carry);
      }, { name, value });
      if (newName !== name)
        callback(newName, name);
      return { name: newName, value: newValue };
    };
  }
  var attributeTransformers = [];
  function mapAttributes(callback) {
    attributeTransformers.push(callback);
  }
  function outNonAlpineAttributes({ name }) {
    return alpineAttributeRegex().test(name);
  }
  var alpineAttributeRegex = () => new RegExp(`^${prefixAsString}([^:^.]+)\\b`);
  function toParsedDirectives(transformedAttributeMap, originalAttributeOverride) {
    return ({ name, value }) => {
      if (name === value)
        value = "";
      let typeMatch = name.match(alpineAttributeRegex());
      let valueMatch = name.match(/:([a-zA-Z0-9\-_:]+)/);
      let modifiers = name.match(/\.[^.\]]+(?=[^\]]*$)/g) || [];
      let original = originalAttributeOverride || transformedAttributeMap[name] || name;
      return {
        type: typeMatch ? typeMatch[1] : null,
        value: valueMatch ? valueMatch[1] : null,
        modifiers: modifiers.map((i) => i.replace(".", "")),
        expression: value,
        original
      };
    };
  }
  var DEFAULT = "DEFAULT";
  var directiveOrder = [
    "ignore",
    "ref",
    "data",
    "id",
    "anchor",
    "bind",
    "init",
    "for",
    "model",
    "modelable",
    "transition",
    "show",
    "if",
    DEFAULT,
    "teleport"
  ];
  function byPriority(a, b) {
    let typeA = directiveOrder.indexOf(a.type) === -1 ? DEFAULT : a.type;
    let typeB = directiveOrder.indexOf(b.type) === -1 ? DEFAULT : b.type;
    return directiveOrder.indexOf(typeA) - directiveOrder.indexOf(typeB);
  }
  function dispatch(el, name, detail = {}) {
    el.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        // Allows events to pass the shadow DOM barrier.
        composed: true,
        cancelable: true
      })
    );
  }
  function walk(el, callback) {
    if (typeof ShadowRoot === "function" && el instanceof ShadowRoot) {
      Array.from(el.children).forEach((el2) => walk(el2, callback));
      return;
    }
    let skip = false;
    callback(el, () => skip = true);
    if (skip)
      return;
    let node = el.firstElementChild;
    while (node) {
      walk(node, callback, false);
      node = node.nextElementSibling;
    }
  }
  function warn(message, ...args) {
    console.warn(`Alpine Warning: ${message}`, ...args);
  }
  var started = false;
  function start() {
    if (started)
      warn("Alpine has already been initialized on this page. Calling Alpine.start() more than once can cause problems.");
    started = true;
    if (!document.body)
      warn("Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?");
    dispatch(document, "alpine:init");
    dispatch(document, "alpine:initializing");
    startObservingMutations();
    onElAdded((el) => initTree(el, walk));
    onElRemoved((el) => destroyTree(el));
    onAttributesAdded((el, attrs) => {
      directives(el, attrs).forEach((handle) => handle());
    });
    let outNestedComponents = (el) => !closestRoot(el.parentElement, true);
    Array.from(document.querySelectorAll(allSelectors().join(","))).filter(outNestedComponents).forEach((el) => {
      initTree(el);
    });
    dispatch(document, "alpine:initialized");
    setTimeout(() => {
      warnAboutMissingPlugins();
    });
  }
  var rootSelectorCallbacks = [];
  var initSelectorCallbacks = [];
  function rootSelectors() {
    return rootSelectorCallbacks.map((fn) => fn());
  }
  function allSelectors() {
    return rootSelectorCallbacks.concat(initSelectorCallbacks).map((fn) => fn());
  }
  function addRootSelector(selectorCallback) {
    rootSelectorCallbacks.push(selectorCallback);
  }
  function addInitSelector(selectorCallback) {
    initSelectorCallbacks.push(selectorCallback);
  }
  function closestRoot(el, includeInitSelectors = false) {
    return findClosest(el, (element) => {
      const selectors = includeInitSelectors ? allSelectors() : rootSelectors();
      if (selectors.some((selector) => element.matches(selector)))
        return true;
    });
  }
  function findClosest(el, callback) {
    if (!el)
      return;
    if (callback(el))
      return el;
    if (el._x_teleportBack)
      el = el._x_teleportBack;
    if (el.parentNode instanceof ShadowRoot) {
      return findClosest(el.parentNode.host, callback);
    }
    if (!el.parentElement)
      return;
    return findClosest(el.parentElement, callback);
  }
  function isRoot(el) {
    return rootSelectors().some((selector) => el.matches(selector));
  }
  var initInterceptors2 = [];
  function interceptInit(callback) {
    initInterceptors2.push(callback);
  }
  var markerDispenser = 1;
  function initTree(el, walker = walk, intercept = () => {
  }) {
    if (findClosest(el, (i) => i._x_ignore))
      return;
    deferHandlingDirectives(() => {
      walker(el, (el2, skip) => {
        if (el2._x_marker)
          return;
        intercept(el2, skip);
        initInterceptors2.forEach((i) => i(el2, skip));
        directives(el2, el2.attributes).forEach((handle) => handle());
        if (!el2._x_ignore)
          el2._x_marker = markerDispenser++;
        el2._x_ignore && skip();
      });
    });
  }
  function destroyTree(root, walker = walk) {
    walker(root, (el) => {
      cleanupElement(el);
      cleanupAttributes(el);
      delete el._x_marker;
    });
  }
  function warnAboutMissingPlugins() {
    let pluginDirectives = [
      ["ui", "dialog", ["[x-dialog], [x-popover]"]],
      ["anchor", "anchor", ["[x-anchor]"]],
      ["sort", "sort", ["[x-sort]"]]
    ];
    pluginDirectives.forEach(([plugin2, directive2, selectors]) => {
      if (directiveExists(directive2))
        return;
      selectors.some((selector) => {
        if (document.querySelector(selector)) {
          warn(`found "${selector}", but missing ${plugin2} plugin`);
          return true;
        }
      });
    });
  }
  var tickStack = [];
  var isHolding = false;
  function nextTick(callback = () => {
  }) {
    queueMicrotask(() => {
      isHolding || setTimeout(() => {
        releaseNextTicks();
      });
    });
    return new Promise((res) => {
      tickStack.push(() => {
        callback();
        res();
      });
    });
  }
  function releaseNextTicks() {
    isHolding = false;
    while (tickStack.length)
      tickStack.shift()();
  }
  function holdNextTicks() {
    isHolding = true;
  }
  function setClasses(el, value) {
    if (Array.isArray(value)) {
      return setClassesFromString(el, value.join(" "));
    } else if (typeof value === "object" && value !== null) {
      return setClassesFromObject(el, value);
    } else if (typeof value === "function") {
      return setClasses(el, value());
    }
    return setClassesFromString(el, value);
  }
  function setClassesFromString(el, classString) {
    let split = (classString2) => classString2.split(" ").filter(Boolean);
    let missingClasses = (classString2) => classString2.split(" ").filter((i) => !el.classList.contains(i)).filter(Boolean);
    let addClassesAndReturnUndo = (classes) => {
      el.classList.add(...classes);
      return () => {
        el.classList.remove(...classes);
      };
    };
    classString = classString === true ? classString = "" : classString || "";
    return addClassesAndReturnUndo(missingClasses(classString));
  }
  function setClassesFromObject(el, classObject) {
    let split = (classString) => classString.split(" ").filter(Boolean);
    let forAdd = Object.entries(classObject).flatMap(([classString, bool]) => bool ? split(classString) : false).filter(Boolean);
    let forRemove = Object.entries(classObject).flatMap(([classString, bool]) => !bool ? split(classString) : false).filter(Boolean);
    let added = [];
    let removed = [];
    forRemove.forEach((i) => {
      if (el.classList.contains(i)) {
        el.classList.remove(i);
        removed.push(i);
      }
    });
    forAdd.forEach((i) => {
      if (!el.classList.contains(i)) {
        el.classList.add(i);
        added.push(i);
      }
    });
    return () => {
      removed.forEach((i) => el.classList.add(i));
      added.forEach((i) => el.classList.remove(i));
    };
  }
  function setStyles(el, value) {
    if (typeof value === "object" && value !== null) {
      return setStylesFromObject(el, value);
    }
    return setStylesFromString(el, value);
  }
  function setStylesFromObject(el, value) {
    let previousStyles = {};
    Object.entries(value).forEach(([key, value2]) => {
      previousStyles[key] = el.style[key];
      if (!key.startsWith("--")) {
        key = kebabCase(key);
      }
      el.style.setProperty(key, value2);
    });
    setTimeout(() => {
      if (el.style.length === 0) {
        el.removeAttribute("style");
      }
    });
    return () => {
      setStyles(el, previousStyles);
    };
  }
  function setStylesFromString(el, value) {
    let cache = el.getAttribute("style", value);
    el.setAttribute("style", value);
    return () => {
      el.setAttribute("style", cache || "");
    };
  }
  function kebabCase(subject) {
    return subject.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }
  function once(callback, fallback = () => {
  }) {
    let called = false;
    return function() {
      if (!called) {
        called = true;
        callback.apply(this, arguments);
      } else {
        fallback.apply(this, arguments);
      }
    };
  }
  directive("transition", (el, { value, modifiers, expression }, { evaluate: evaluate2 }) => {
    if (typeof expression === "function")
      expression = evaluate2(expression);
    if (expression === false)
      return;
    if (!expression || typeof expression === "boolean") {
      registerTransitionsFromHelper(el, modifiers, value);
    } else {
      registerTransitionsFromClassString(el, expression, value);
    }
  });
  function registerTransitionsFromClassString(el, classString, stage) {
    registerTransitionObject(el, setClasses, "");
    let directiveStorageMap = {
      "enter": (classes) => {
        el._x_transition.enter.during = classes;
      },
      "enter-start": (classes) => {
        el._x_transition.enter.start = classes;
      },
      "enter-end": (classes) => {
        el._x_transition.enter.end = classes;
      },
      "leave": (classes) => {
        el._x_transition.leave.during = classes;
      },
      "leave-start": (classes) => {
        el._x_transition.leave.start = classes;
      },
      "leave-end": (classes) => {
        el._x_transition.leave.end = classes;
      }
    };
    directiveStorageMap[stage](classString);
  }
  function registerTransitionsFromHelper(el, modifiers, stage) {
    registerTransitionObject(el, setStyles);
    let doesntSpecify = !modifiers.includes("in") && !modifiers.includes("out") && !stage;
    let transitioningIn = doesntSpecify || modifiers.includes("in") || ["enter"].includes(stage);
    let transitioningOut = doesntSpecify || modifiers.includes("out") || ["leave"].includes(stage);
    if (modifiers.includes("in") && !doesntSpecify) {
      modifiers = modifiers.filter((i, index) => index < modifiers.indexOf("out"));
    }
    if (modifiers.includes("out") && !doesntSpecify) {
      modifiers = modifiers.filter((i, index) => index > modifiers.indexOf("out"));
    }
    let wantsAll = !modifiers.includes("opacity") && !modifiers.includes("scale");
    let wantsOpacity = wantsAll || modifiers.includes("opacity");
    let wantsScale = wantsAll || modifiers.includes("scale");
    let opacityValue = wantsOpacity ? 0 : 1;
    let scaleValue = wantsScale ? modifierValue(modifiers, "scale", 95) / 100 : 1;
    let delay = modifierValue(modifiers, "delay", 0) / 1e3;
    let origin = modifierValue(modifiers, "origin", "center");
    let property = "opacity, transform";
    let durationIn = modifierValue(modifiers, "duration", 150) / 1e3;
    let durationOut = modifierValue(modifiers, "duration", 75) / 1e3;
    let easing = `cubic-bezier(0.4, 0.0, 0.2, 1)`;
    if (transitioningIn) {
      el._x_transition.enter.during = {
        transformOrigin: origin,
        transitionDelay: `${delay}s`,
        transitionProperty: property,
        transitionDuration: `${durationIn}s`,
        transitionTimingFunction: easing
      };
      el._x_transition.enter.start = {
        opacity: opacityValue,
        transform: `scale(${scaleValue})`
      };
      el._x_transition.enter.end = {
        opacity: 1,
        transform: `scale(1)`
      };
    }
    if (transitioningOut) {
      el._x_transition.leave.during = {
        transformOrigin: origin,
        transitionDelay: `${delay}s`,
        transitionProperty: property,
        transitionDuration: `${durationOut}s`,
        transitionTimingFunction: easing
      };
      el._x_transition.leave.start = {
        opacity: 1,
        transform: `scale(1)`
      };
      el._x_transition.leave.end = {
        opacity: opacityValue,
        transform: `scale(${scaleValue})`
      };
    }
  }
  function registerTransitionObject(el, setFunction, defaultValue = {}) {
    if (!el._x_transition)
      el._x_transition = {
        enter: { during: defaultValue, start: defaultValue, end: defaultValue },
        leave: { during: defaultValue, start: defaultValue, end: defaultValue },
        in(before = () => {
        }, after = () => {
        }) {
          transition(el, setFunction, {
            during: this.enter.during,
            start: this.enter.start,
            end: this.enter.end
          }, before, after);
        },
        out(before = () => {
        }, after = () => {
        }) {
          transition(el, setFunction, {
            during: this.leave.during,
            start: this.leave.start,
            end: this.leave.end
          }, before, after);
        }
      };
  }
  window.Element.prototype._x_toggleAndCascadeWithTransitions = function(el, value, show, hide) {
    const nextTick2 = document.visibilityState === "visible" ? requestAnimationFrame : setTimeout;
    let clickAwayCompatibleShow = () => nextTick2(show);
    if (value) {
      if (el._x_transition && (el._x_transition.enter || el._x_transition.leave)) {
        el._x_transition.enter && (Object.entries(el._x_transition.enter.during).length || Object.entries(el._x_transition.enter.start).length || Object.entries(el._x_transition.enter.end).length) ? el._x_transition.in(show) : clickAwayCompatibleShow();
      } else {
        el._x_transition ? el._x_transition.in(show) : clickAwayCompatibleShow();
      }
      return;
    }
    el._x_hidePromise = el._x_transition ? new Promise((resolve, reject) => {
      el._x_transition.out(() => {
      }, () => resolve(hide));
      el._x_transitioning && el._x_transitioning.beforeCancel(() => reject({ isFromCancelledTransition: true }));
    }) : Promise.resolve(hide);
    queueMicrotask(() => {
      let closest = closestHide(el);
      if (closest) {
        if (!closest._x_hideChildren)
          closest._x_hideChildren = [];
        closest._x_hideChildren.push(el);
      } else {
        nextTick2(() => {
          let hideAfterChildren = (el2) => {
            let carry = Promise.all([
              el2._x_hidePromise,
              ...(el2._x_hideChildren || []).map(hideAfterChildren)
            ]).then(([i]) => i?.());
            delete el2._x_hidePromise;
            delete el2._x_hideChildren;
            return carry;
          };
          hideAfterChildren(el).catch((e) => {
            if (!e.isFromCancelledTransition)
              throw e;
          });
        });
      }
    });
  };
  function closestHide(el) {
    let parent = el.parentNode;
    if (!parent)
      return;
    return parent._x_hidePromise ? parent : closestHide(parent);
  }
  function transition(el, setFunction, { during, start: start2, end } = {}, before = () => {
  }, after = () => {
  }) {
    if (el._x_transitioning)
      el._x_transitioning.cancel();
    if (Object.keys(during).length === 0 && Object.keys(start2).length === 0 && Object.keys(end).length === 0) {
      before();
      after();
      return;
    }
    let undoStart, undoDuring, undoEnd;
    performTransition(el, {
      start() {
        undoStart = setFunction(el, start2);
      },
      during() {
        undoDuring = setFunction(el, during);
      },
      before,
      end() {
        undoStart();
        undoEnd = setFunction(el, end);
      },
      after,
      cleanup() {
        undoDuring();
        undoEnd();
      }
    });
  }
  function performTransition(el, stages) {
    let interrupted, reachedBefore, reachedEnd;
    let finish = once(() => {
      mutateDom(() => {
        interrupted = true;
        if (!reachedBefore)
          stages.before();
        if (!reachedEnd) {
          stages.end();
          releaseNextTicks();
        }
        stages.after();
        if (el.isConnected)
          stages.cleanup();
        delete el._x_transitioning;
      });
    });
    el._x_transitioning = {
      beforeCancels: [],
      beforeCancel(callback) {
        this.beforeCancels.push(callback);
      },
      cancel: once(function() {
        while (this.beforeCancels.length) {
          this.beforeCancels.shift()();
        }
        ;
        finish();
      }),
      finish
    };
    mutateDom(() => {
      stages.start();
      stages.during();
    });
    holdNextTicks();
    requestAnimationFrame(() => {
      if (interrupted)
        return;
      let duration = Number(getComputedStyle(el).transitionDuration.replace(/,.*/, "").replace("s", "")) * 1e3;
      let delay = Number(getComputedStyle(el).transitionDelay.replace(/,.*/, "").replace("s", "")) * 1e3;
      if (duration === 0)
        duration = Number(getComputedStyle(el).animationDuration.replace("s", "")) * 1e3;
      mutateDom(() => {
        stages.before();
      });
      reachedBefore = true;
      requestAnimationFrame(() => {
        if (interrupted)
          return;
        mutateDom(() => {
          stages.end();
        });
        releaseNextTicks();
        setTimeout(el._x_transitioning.finish, duration + delay);
        reachedEnd = true;
      });
    });
  }
  function modifierValue(modifiers, key, fallback) {
    if (modifiers.indexOf(key) === -1)
      return fallback;
    const rawValue = modifiers[modifiers.indexOf(key) + 1];
    if (!rawValue)
      return fallback;
    if (key === "scale") {
      if (isNaN(rawValue))
        return fallback;
    }
    if (key === "duration" || key === "delay") {
      let match = rawValue.match(/([0-9]+)ms/);
      if (match)
        return match[1];
    }
    if (key === "origin") {
      if (["top", "right", "left", "center", "bottom"].includes(modifiers[modifiers.indexOf(key) + 2])) {
        return [rawValue, modifiers[modifiers.indexOf(key) + 2]].join(" ");
      }
    }
    return rawValue;
  }
  var isCloning = false;
  function skipDuringClone(callback, fallback = () => {
  }) {
    return (...args) => isCloning ? fallback(...args) : callback(...args);
  }
  function onlyDuringClone(callback) {
    return (...args) => isCloning && callback(...args);
  }
  var interceptors = [];
  function interceptClone(callback) {
    interceptors.push(callback);
  }
  function cloneNode(from, to) {
    interceptors.forEach((i) => i(from, to));
    isCloning = true;
    dontRegisterReactiveSideEffects(() => {
      initTree(to, (el, callback) => {
        callback(el, () => {
        });
      });
    });
    isCloning = false;
  }
  var isCloningLegacy = false;
  function clone(oldEl, newEl) {
    if (!newEl._x_dataStack)
      newEl._x_dataStack = oldEl._x_dataStack;
    isCloning = true;
    isCloningLegacy = true;
    dontRegisterReactiveSideEffects(() => {
      cloneTree(newEl);
    });
    isCloning = false;
    isCloningLegacy = false;
  }
  function cloneTree(el) {
    let hasRunThroughFirstEl = false;
    let shallowWalker = (el2, callback) => {
      walk(el2, (el3, skip) => {
        if (hasRunThroughFirstEl && isRoot(el3))
          return skip();
        hasRunThroughFirstEl = true;
        callback(el3, skip);
      });
    };
    initTree(el, shallowWalker);
  }
  function dontRegisterReactiveSideEffects(callback) {
    let cache = effect;
    overrideEffect((callback2, el) => {
      let storedEffect = cache(callback2);
      release(storedEffect);
      return () => {
      };
    });
    callback();
    overrideEffect(cache);
  }
  function bind(el, name, value, modifiers = []) {
    if (!el._x_bindings)
      el._x_bindings = reactive({});
    el._x_bindings[name] = value;
    name = modifiers.includes("camel") ? camelCase(name) : name;
    switch (name) {
      case "value":
        bindInputValue(el, value);
        break;
      case "style":
        bindStyles(el, value);
        break;
      case "class":
        bindClasses(el, value);
        break;
      case "selected":
      case "checked":
        bindAttributeAndProperty(el, name, value);
        break;
      default:
        bindAttribute(el, name, value);
        break;
    }
  }
  function bindInputValue(el, value) {
    if (isRadio(el)) {
      if (el.attributes.value === void 0) {
        el.value = value;
      }
      if (window.fromModel) {
        if (typeof value === "boolean") {
          el.checked = safeParseBoolean(el.value) === value;
        } else {
          el.checked = checkedAttrLooseCompare(el.value, value);
        }
      }
    } else if (isCheckbox(el)) {
      if (Number.isInteger(value)) {
        el.value = value;
      } else if (!Array.isArray(value) && typeof value !== "boolean" && ![null, void 0].includes(value)) {
        el.value = String(value);
      } else {
        if (Array.isArray(value)) {
          el.checked = value.some((val) => checkedAttrLooseCompare(val, el.value));
        } else {
          el.checked = !!value;
        }
      }
    } else if (el.tagName === "SELECT") {
      updateSelect(el, value);
    } else {
      if (el.value === value)
        return;
      el.value = value === void 0 ? "" : value;
    }
  }
  function bindClasses(el, value) {
    if (el._x_undoAddedClasses)
      el._x_undoAddedClasses();
    el._x_undoAddedClasses = setClasses(el, value);
  }
  function bindStyles(el, value) {
    if (el._x_undoAddedStyles)
      el._x_undoAddedStyles();
    el._x_undoAddedStyles = setStyles(el, value);
  }
  function bindAttributeAndProperty(el, name, value) {
    bindAttribute(el, name, value);
    setPropertyIfChanged(el, name, value);
  }
  function bindAttribute(el, name, value) {
    if ([null, void 0, false].includes(value) && attributeShouldntBePreservedIfFalsy(name)) {
      el.removeAttribute(name);
    } else {
      if (isBooleanAttr(name))
        value = name;
      setIfChanged(el, name, value);
    }
  }
  function setIfChanged(el, attrName, value) {
    if (el.getAttribute(attrName) != value) {
      el.setAttribute(attrName, value);
    }
  }
  function setPropertyIfChanged(el, propName, value) {
    if (el[propName] !== value) {
      el[propName] = value;
    }
  }
  function updateSelect(el, value) {
    const arrayWrappedValue = [].concat(value).map((value2) => {
      return value2 + "";
    });
    Array.from(el.options).forEach((option) => {
      option.selected = arrayWrappedValue.includes(option.value);
    });
  }
  function camelCase(subject) {
    return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
  }
  function checkedAttrLooseCompare(valueA, valueB) {
    return valueA == valueB;
  }
  function safeParseBoolean(rawValue) {
    if ([1, "1", "true", "on", "yes", true].includes(rawValue)) {
      return true;
    }
    if ([0, "0", "false", "off", "no", false].includes(rawValue)) {
      return false;
    }
    return rawValue ? Boolean(rawValue) : null;
  }
  var booleanAttributes = /* @__PURE__ */ new Set([
    "allowfullscreen",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "inert",
    "ismap",
    "itemscope",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected",
    "shadowrootclonable",
    "shadowrootdelegatesfocus",
    "shadowrootserializable"
  ]);
  function isBooleanAttr(attrName) {
    return booleanAttributes.has(attrName);
  }
  function attributeShouldntBePreservedIfFalsy(name) {
    return !["aria-pressed", "aria-checked", "aria-expanded", "aria-selected"].includes(name);
  }
  function getBinding(el, name, fallback) {
    if (el._x_bindings && el._x_bindings[name] !== void 0)
      return el._x_bindings[name];
    return getAttributeBinding(el, name, fallback);
  }
  function extractProp(el, name, fallback, extract = true) {
    if (el._x_bindings && el._x_bindings[name] !== void 0)
      return el._x_bindings[name];
    if (el._x_inlineBindings && el._x_inlineBindings[name] !== void 0) {
      let binding = el._x_inlineBindings[name];
      binding.extract = extract;
      return dontAutoEvaluateFunctions(() => {
        return evaluate(el, binding.expression);
      });
    }
    return getAttributeBinding(el, name, fallback);
  }
  function getAttributeBinding(el, name, fallback) {
    let attr = el.getAttribute(name);
    if (attr === null)
      return typeof fallback === "function" ? fallback() : fallback;
    if (attr === "")
      return true;
    if (isBooleanAttr(name)) {
      return !![name, "true"].includes(attr);
    }
    return attr;
  }
  function isCheckbox(el) {
    return el.type === "checkbox" || el.localName === "ui-checkbox" || el.localName === "ui-switch";
  }
  function isRadio(el) {
    return el.type === "radio" || el.localName === "ui-radio";
  }
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      let context = this, args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  function entangle({ get: outerGet, set: outerSet }, { get: innerGet, set: innerSet }) {
    let firstRun = true;
    let outerHash;
    let innerHash;
    let reference = effect(() => {
      let outer = outerGet();
      let inner = innerGet();
      if (firstRun) {
        innerSet(cloneIfObject(outer));
        firstRun = false;
      } else {
        let outerHashLatest = JSON.stringify(outer);
        let innerHashLatest = JSON.stringify(inner);
        if (outerHashLatest !== outerHash) {
          innerSet(cloneIfObject(outer));
        } else if (outerHashLatest !== innerHashLatest) {
          outerSet(cloneIfObject(inner));
        } else {
        }
      }
      outerHash = JSON.stringify(outerGet());
      innerHash = JSON.stringify(innerGet());
    });
    return () => {
      release(reference);
    };
  }
  function cloneIfObject(value) {
    return typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
  }
  function plugin(callback) {
    let callbacks = Array.isArray(callback) ? callback : [callback];
    callbacks.forEach((i) => i(alpine_default));
  }
  var stores = {};
  var isReactive = false;
  function store(name, value) {
    if (!isReactive) {
      stores = reactive(stores);
      isReactive = true;
    }
    if (value === void 0) {
      return stores[name];
    }
    stores[name] = value;
    initInterceptors(stores[name]);
    if (typeof value === "object" && value !== null && value.hasOwnProperty("init") && typeof value.init === "function") {
      stores[name].init();
    }
  }
  function getStores() {
    return stores;
  }
  var binds = {};
  function bind2(name, bindings) {
    let getBindings = typeof bindings !== "function" ? () => bindings : bindings;
    if (name instanceof Element) {
      return applyBindingsObject(name, getBindings());
    } else {
      binds[name] = getBindings;
    }
    return () => {
    };
  }
  function injectBindingProviders(obj) {
    Object.entries(binds).forEach(([name, callback]) => {
      Object.defineProperty(obj, name, {
        get() {
          return (...args) => {
            return callback(...args);
          };
        }
      });
    });
    return obj;
  }
  function applyBindingsObject(el, obj, original) {
    let cleanupRunners = [];
    while (cleanupRunners.length)
      cleanupRunners.pop()();
    let attributes = Object.entries(obj).map(([name, value]) => ({ name, value }));
    let staticAttributes = attributesOnly(attributes);
    attributes = attributes.map((attribute) => {
      if (staticAttributes.find((attr) => attr.name === attribute.name)) {
        return {
          name: `x-bind:${attribute.name}`,
          value: `"${attribute.value}"`
        };
      }
      return attribute;
    });
    directives(el, attributes, original).map((handle) => {
      cleanupRunners.push(handle.runCleanups);
      handle();
    });
    return () => {
      while (cleanupRunners.length)
        cleanupRunners.pop()();
    };
  }
  var datas = {};
  function data(name, callback) {
    datas[name] = callback;
  }
  function injectDataProviders(obj, context) {
    Object.entries(datas).forEach(([name, callback]) => {
      Object.defineProperty(obj, name, {
        get() {
          return (...args) => {
            return callback.bind(context)(...args);
          };
        },
        enumerable: false
      });
    });
    return obj;
  }
  var Alpine = {
    get reactive() {
      return reactive;
    },
    get release() {
      return release;
    },
    get effect() {
      return effect;
    },
    get raw() {
      return raw;
    },
    get transaction() {
      return transaction;
    },
    version: "3.15.8",
    flushAndStopDeferringMutations,
    dontAutoEvaluateFunctions,
    disableEffectScheduling,
    startObservingMutations,
    stopObservingMutations,
    setReactivityEngine,
    onAttributeRemoved,
    onAttributesAdded,
    closestDataStack,
    skipDuringClone,
    onlyDuringClone,
    addRootSelector,
    addInitSelector,
    setErrorHandler,
    interceptClone,
    addScopeToNode,
    deferMutations,
    mapAttributes,
    evaluateLater,
    interceptInit,
    initInterceptors,
    injectMagics,
    setEvaluator,
    setRawEvaluator,
    mergeProxies,
    extractProp,
    findClosest,
    onElRemoved,
    closestRoot,
    destroyTree,
    interceptor,
    // INTERNAL: not public API and is subject to change without major release.
    transition,
    // INTERNAL
    setStyles,
    // INTERNAL
    mutateDom,
    directive,
    entangle,
    throttle,
    debounce,
    evaluate,
    evaluateRaw,
    initTree,
    nextTick,
    prefixed: prefix,
    prefix: setPrefix,
    plugin,
    magic,
    store,
    start,
    clone,
    // INTERNAL
    cloneNode,
    // INTERNAL
    bound: getBinding,
    $data: scope,
    watch,
    walk,
    data,
    bind: bind2
  };
  var alpine_default = Alpine;
  var safemap = /* @__PURE__ */ new WeakMap();
  var globals = /* @__PURE__ */ new Set();
  Object.getOwnPropertyNames(globalThis).forEach((key) => {
    if (key === "styleMedia")
      return;
    globals.add(globalThis[key]);
  });
  var Token = class {
    constructor(type, value, start2, end) {
      this.type = type;
      this.value = value;
      this.start = start2;
      this.end = end;
    }
  };
  var Tokenizer = class {
    constructor(input) {
      this.input = input;
      this.position = 0;
      this.tokens = [];
    }
    tokenize() {
      while (this.position < this.input.length) {
        this.skipWhitespace();
        if (this.position >= this.input.length)
          break;
        const char = this.input[this.position];
        if (this.isDigit(char)) {
          this.readNumber();
        } else if (this.isAlpha(char) || char === "_" || char === "$") {
          this.readIdentifierOrKeyword();
        } else if (char === '"' || char === "'") {
          this.readString();
        } else if (char === "/" && this.peek() === "/") {
          this.skipLineComment();
        } else {
          this.readOperatorOrPunctuation();
        }
      }
      this.tokens.push(new Token("EOF", null, this.position, this.position));
      return this.tokens;
    }
    skipWhitespace() {
      while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
        this.position++;
      }
    }
    skipLineComment() {
      while (this.position < this.input.length && this.input[this.position] !== "\n") {
        this.position++;
      }
    }
    isDigit(char) {
      return /[0-9]/.test(char);
    }
    isAlpha(char) {
      return /[a-zA-Z]/.test(char);
    }
    isAlphaNumeric(char) {
      return /[a-zA-Z0-9_$]/.test(char);
    }
    peek(offset = 1) {
      return this.input[this.position + offset] || "";
    }
    readNumber() {
      const start2 = this.position;
      let hasDecimal = false;
      while (this.position < this.input.length) {
        const char = this.input[this.position];
        if (this.isDigit(char)) {
          this.position++;
        } else if (char === "." && !hasDecimal) {
          hasDecimal = true;
          this.position++;
        } else {
          break;
        }
      }
      const value = this.input.slice(start2, this.position);
      this.tokens.push(new Token("NUMBER", parseFloat(value), start2, this.position));
    }
    readIdentifierOrKeyword() {
      const start2 = this.position;
      while (this.position < this.input.length && this.isAlphaNumeric(this.input[this.position])) {
        this.position++;
      }
      const value = this.input.slice(start2, this.position);
      const keywords = ["true", "false", "null", "undefined", "new", "typeof", "void", "delete", "in", "instanceof"];
      if (keywords.includes(value)) {
        if (value === "true" || value === "false") {
          this.tokens.push(new Token("BOOLEAN", value === "true", start2, this.position));
        } else if (value === "null") {
          this.tokens.push(new Token("NULL", null, start2, this.position));
        } else if (value === "undefined") {
          this.tokens.push(new Token("UNDEFINED", void 0, start2, this.position));
        } else {
          this.tokens.push(new Token("KEYWORD", value, start2, this.position));
        }
      } else {
        this.tokens.push(new Token("IDENTIFIER", value, start2, this.position));
      }
    }
    readString() {
      const start2 = this.position;
      const quote = this.input[this.position];
      this.position++;
      let value = "";
      let escaped = false;
      while (this.position < this.input.length) {
        const char = this.input[this.position];
        if (escaped) {
          switch (char) {
            case "n":
              value += "\n";
              break;
            case "t":
              value += "	";
              break;
            case "r":
              value += "\r";
              break;
            case "\\":
              value += "\\";
              break;
            case quote:
              value += quote;
              break;
            default:
              value += char;
          }
          escaped = false;
        } else if (char === "\\") {
          escaped = true;
        } else if (char === quote) {
          this.position++;
          this.tokens.push(new Token("STRING", value, start2, this.position));
          return;
        } else {
          value += char;
        }
        this.position++;
      }
      throw new Error(`Unterminated string starting at position ${start2}`);
    }
    readOperatorOrPunctuation() {
      const start2 = this.position;
      const char = this.input[this.position];
      const next = this.peek();
      const nextNext = this.peek(2);
      if (char === "=" && next === "=" && nextNext === "=") {
        this.position += 3;
        this.tokens.push(new Token("OPERATOR", "===", start2, this.position));
      } else if (char === "!" && next === "=" && nextNext === "=") {
        this.position += 3;
        this.tokens.push(new Token("OPERATOR", "!==", start2, this.position));
      } else if (char === "=" && next === "=") {
        this.position += 2;
        this.tokens.push(new Token("OPERATOR", "==", start2, this.position));
      } else if (char === "!" && next === "=") {
        this.position += 2;
        this.tokens.push(new Token("OPERATOR", "!=", start2, this.position));
      } else if (char === "<" && next === "=") {
        this.position += 2;
        this.tokens.push(new Token("OPERATOR", "<=", start2, this.position));
      } else if (char === ">" && next === "=") {
        this.position += 2;
        this.tokens.push(new Token("OPERATOR", ">=", start2, this.position));
      } else if (char === "&" && next === "&") {
        this.position += 2;
        this.tokens.push(new Token("OPERATOR", "&&", start2, this.position));
      } else if (char === "|" && next === "|") {
        this.position += 2;
        this.tokens.push(new Token("OPERATOR", "||", start2, this.position));
      } else if (char === "+" && next === "+") {
        this.position += 2;
        this.tokens.push(new Token("OPERATOR", "++", start2, this.position));
      } else if (char === "-" && next === "-") {
        this.position += 2;
        this.tokens.push(new Token("OPERATOR", "--", start2, this.position));
      } else {
        this.position++;
        const type = "()[]{},.;:?".includes(char) ? "PUNCTUATION" : "OPERATOR";
        this.tokens.push(new Token(type, char, start2, this.position));
      }
    }
  };
  var Parser = class {
    constructor(tokens) {
      this.tokens = tokens;
      this.position = 0;
    }
    parse() {
      if (this.isAtEnd()) {
        throw new Error("Empty expression");
      }
      const expr = this.parseExpression();
      this.match("PUNCTUATION", ";");
      if (!this.isAtEnd()) {
        throw new Error(`Unexpected token: ${this.current().value}`);
      }
      return expr;
    }
    parseExpression() {
      return this.parseAssignment();
    }
    parseAssignment() {
      const expr = this.parseTernary();
      if (this.match("OPERATOR", "=")) {
        const value = this.parseAssignment();
        if (expr.type === "Identifier" || expr.type === "MemberExpression") {
          return {
            type: "AssignmentExpression",
            left: expr,
            operator: "=",
            right: value
          };
        }
        throw new Error("Invalid assignment target");
      }
      return expr;
    }
    parseTernary() {
      const expr = this.parseLogicalOr();
      if (this.match("PUNCTUATION", "?")) {
        const consequent = this.parseExpression();
        this.consume("PUNCTUATION", ":");
        const alternate = this.parseExpression();
        return {
          type: "ConditionalExpression",
          test: expr,
          consequent,
          alternate
        };
      }
      return expr;
    }
    parseLogicalOr() {
      let expr = this.parseLogicalAnd();
      while (this.match("OPERATOR", "||")) {
        const operator = this.previous().value;
        const right = this.parseLogicalAnd();
        expr = {
          type: "BinaryExpression",
          operator,
          left: expr,
          right
        };
      }
      return expr;
    }
    parseLogicalAnd() {
      let expr = this.parseEquality();
      while (this.match("OPERATOR", "&&")) {
        const operator = this.previous().value;
        const right = this.parseEquality();
        expr = {
          type: "BinaryExpression",
          operator,
          left: expr,
          right
        };
      }
      return expr;
    }
    parseEquality() {
      let expr = this.parseRelational();
      while (this.match("OPERATOR", "==", "!=", "===", "!==")) {
        const operator = this.previous().value;
        const right = this.parseRelational();
        expr = {
          type: "BinaryExpression",
          operator,
          left: expr,
          right
        };
      }
      return expr;
    }
    parseRelational() {
      let expr = this.parseAdditive();
      while (this.match("OPERATOR", "<", ">", "<=", ">=")) {
        const operator = this.previous().value;
        const right = this.parseAdditive();
        expr = {
          type: "BinaryExpression",
          operator,
          left: expr,
          right
        };
      }
      return expr;
    }
    parseAdditive() {
      let expr = this.parseMultiplicative();
      while (this.match("OPERATOR", "+", "-")) {
        const operator = this.previous().value;
        const right = this.parseMultiplicative();
        expr = {
          type: "BinaryExpression",
          operator,
          left: expr,
          right
        };
      }
      return expr;
    }
    parseMultiplicative() {
      let expr = this.parseUnary();
      while (this.match("OPERATOR", "*", "/", "%")) {
        const operator = this.previous().value;
        const right = this.parseUnary();
        expr = {
          type: "BinaryExpression",
          operator,
          left: expr,
          right
        };
      }
      return expr;
    }
    parseUnary() {
      if (this.match("OPERATOR", "++", "--")) {
        const operator = this.previous().value;
        const argument = this.parseUnary();
        return {
          type: "UpdateExpression",
          operator,
          argument,
          prefix: true
        };
      }
      if (this.match("OPERATOR", "!", "-", "+")) {
        const operator = this.previous().value;
        const argument = this.parseUnary();
        return {
          type: "UnaryExpression",
          operator,
          argument,
          prefix: true
        };
      }
      return this.parsePostfix();
    }
    parsePostfix() {
      let expr = this.parseMember();
      if (this.match("OPERATOR", "++", "--")) {
        const operator = this.previous().value;
        return {
          type: "UpdateExpression",
          operator,
          argument: expr,
          prefix: false
        };
      }
      return expr;
    }
    parseMember() {
      let expr = this.parsePrimary();
      while (true) {
        if (this.match("PUNCTUATION", ".")) {
          const property = this.consume("IDENTIFIER");
          expr = {
            type: "MemberExpression",
            object: expr,
            property: { type: "Identifier", name: property.value },
            computed: false
          };
        } else if (this.match("PUNCTUATION", "[")) {
          const property = this.parseExpression();
          this.consume("PUNCTUATION", "]");
          expr = {
            type: "MemberExpression",
            object: expr,
            property,
            computed: true
          };
        } else if (this.match("PUNCTUATION", "(")) {
          const args = this.parseArguments();
          expr = {
            type: "CallExpression",
            callee: expr,
            arguments: args
          };
        } else {
          break;
        }
      }
      return expr;
    }
    parseArguments() {
      const args = [];
      if (!this.check("PUNCTUATION", ")")) {
        do {
          args.push(this.parseExpression());
        } while (this.match("PUNCTUATION", ","));
      }
      this.consume("PUNCTUATION", ")");
      return args;
    }
    parsePrimary() {
      if (this.match("NUMBER")) {
        return { type: "Literal", value: this.previous().value };
      }
      if (this.match("STRING")) {
        return { type: "Literal", value: this.previous().value };
      }
      if (this.match("BOOLEAN")) {
        return { type: "Literal", value: this.previous().value };
      }
      if (this.match("NULL")) {
        return { type: "Literal", value: null };
      }
      if (this.match("UNDEFINED")) {
        return { type: "Literal", value: void 0 };
      }
      if (this.match("IDENTIFIER")) {
        return { type: "Identifier", name: this.previous().value };
      }
      if (this.match("PUNCTUATION", "(")) {
        const expr = this.parseExpression();
        this.consume("PUNCTUATION", ")");
        return expr;
      }
      if (this.match("PUNCTUATION", "[")) {
        return this.parseArrayLiteral();
      }
      if (this.match("PUNCTUATION", "{")) {
        return this.parseObjectLiteral();
      }
      throw new Error(`Unexpected token: ${this.current().type} "${this.current().value}"`);
    }
    parseArrayLiteral() {
      const elements = [];
      while (!this.check("PUNCTUATION", "]") && !this.isAtEnd()) {
        elements.push(this.parseExpression());
        if (this.match("PUNCTUATION", ",")) {
          if (this.check("PUNCTUATION", "]")) {
            break;
          }
        } else {
          break;
        }
      }
      this.consume("PUNCTUATION", "]");
      return {
        type: "ArrayExpression",
        elements
      };
    }
    parseObjectLiteral() {
      const properties = [];
      while (!this.check("PUNCTUATION", "}") && !this.isAtEnd()) {
        let key;
        let computed = false;
        if (this.match("STRING")) {
          key = { type: "Literal", value: this.previous().value };
        } else if (this.match("IDENTIFIER")) {
          const name = this.previous().value;
          key = { type: "Identifier", name };
        } else if (this.match("PUNCTUATION", "[")) {
          key = this.parseExpression();
          computed = true;
          this.consume("PUNCTUATION", "]");
        } else {
          throw new Error("Expected property key");
        }
        this.consume("PUNCTUATION", ":");
        const value = this.parseExpression();
        properties.push({
          type: "Property",
          key,
          value,
          computed,
          shorthand: false
        });
        if (this.match("PUNCTUATION", ",")) {
          if (this.check("PUNCTUATION", "}")) {
            break;
          }
        } else {
          break;
        }
      }
      this.consume("PUNCTUATION", "}");
      return {
        type: "ObjectExpression",
        properties
      };
    }
    match(...args) {
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (i === 0 && args.length > 1) {
          const type = arg;
          for (let j = 1; j < args.length; j++) {
            if (this.check(type, args[j])) {
              this.advance();
              return true;
            }
          }
          return false;
        } else if (args.length === 1) {
          if (this.checkType(arg)) {
            this.advance();
            return true;
          }
          return false;
        }
      }
      return false;
    }
    check(type, value) {
      if (this.isAtEnd())
        return false;
      if (value !== void 0) {
        return this.current().type === type && this.current().value === value;
      }
      return this.current().type === type;
    }
    checkType(type) {
      if (this.isAtEnd())
        return false;
      return this.current().type === type;
    }
    advance() {
      if (!this.isAtEnd())
        this.position++;
      return this.previous();
    }
    isAtEnd() {
      return this.current().type === "EOF";
    }
    current() {
      return this.tokens[this.position];
    }
    previous() {
      return this.tokens[this.position - 1];
    }
    consume(type, value) {
      if (value !== void 0) {
        if (this.check(type, value))
          return this.advance();
        throw new Error(`Expected ${type} "${value}" but got ${this.current().type} "${this.current().value}"`);
      }
      if (this.check(type))
        return this.advance();
      throw new Error(`Expected ${type} but got ${this.current().type} "${this.current().value}"`);
    }
  };
  var Evaluator = class {
    evaluate({ node, scope: scope2 = {}, context = null, forceBindingRootScopeToFunctions = true }) {
      switch (node.type) {
        case "Literal":
          return node.value;
        case "Identifier":
          if (node.name in scope2) {
            const value2 = scope2[node.name];
            this.checkForDangerousValues(value2);
            if (typeof value2 === "function") {
              return value2.bind(scope2);
            }
            return value2;
          }
          throw new Error(`Undefined variable: ${node.name}`);
        case "MemberExpression":
          const object = this.evaluate({ node: node.object, scope: scope2, context, forceBindingRootScopeToFunctions });
          if (object == null) {
            throw new Error("Cannot read property of null or undefined");
          }
          let property;
          if (node.computed) {
            property = this.evaluate({ node: node.property, scope: scope2, context, forceBindingRootScopeToFunctions });
          } else {
            property = node.property.name;
          }
          this.checkForDangerousKeywords(property);
          let memberValue = object[property];
          this.checkForDangerousValues(memberValue);
          if (typeof memberValue === "function") {
            if (forceBindingRootScopeToFunctions) {
              return memberValue.bind(scope2);
            } else {
              return memberValue.bind(object);
            }
          }
          return memberValue;
        case "CallExpression":
          const args = node.arguments.map((arg) => this.evaluate({ node: arg, scope: scope2, context, forceBindingRootScopeToFunctions }));
          let returnValue;
          if (node.callee.type === "MemberExpression") {
            const obj = this.evaluate({ node: node.callee.object, scope: scope2, context, forceBindingRootScopeToFunctions });
            let prop;
            if (node.callee.computed) {
              prop = this.evaluate({ node: node.callee.property, scope: scope2, context, forceBindingRootScopeToFunctions });
            } else {
              prop = node.callee.property.name;
            }
            this.checkForDangerousKeywords(prop);
            let func = obj[prop];
            if (typeof func !== "function") {
              throw new Error("Value is not a function");
            }
            returnValue = func.apply(obj, args);
          } else {
            if (node.callee.type === "Identifier") {
              const name = node.callee.name;
              let func;
              if (name in scope2) {
                func = scope2[name];
              } else {
                throw new Error(`Undefined variable: ${name}`);
              }
              if (typeof func !== "function") {
                throw new Error("Value is not a function");
              }
              const thisContext = context !== null ? context : scope2;
              returnValue = func.apply(thisContext, args);
            } else {
              const callee = this.evaluate({ node: node.callee, scope: scope2, context, forceBindingRootScopeToFunctions });
              if (typeof callee !== "function") {
                throw new Error("Value is not a function");
              }
              returnValue = callee.apply(context, args);
            }
          }
          this.checkForDangerousValues(returnValue);
          return returnValue;
        case "UnaryExpression":
          const argument = this.evaluate({ node: node.argument, scope: scope2, context, forceBindingRootScopeToFunctions });
          switch (node.operator) {
            case "!":
              return !argument;
            case "-":
              return -argument;
            case "+":
              return +argument;
            default:
              throw new Error(`Unknown unary operator: ${node.operator}`);
          }
        case "UpdateExpression":
          if (node.argument.type === "Identifier") {
            const name = node.argument.name;
            if (!(name in scope2)) {
              throw new Error(`Undefined variable: ${name}`);
            }
            const oldValue = scope2[name];
            if (node.operator === "++") {
              scope2[name] = oldValue + 1;
            } else if (node.operator === "--") {
              scope2[name] = oldValue - 1;
            }
            return node.prefix ? scope2[name] : oldValue;
          } else if (node.argument.type === "MemberExpression") {
            const obj = this.evaluate({ node: node.argument.object, scope: scope2, context, forceBindingRootScopeToFunctions });
            const prop = node.argument.computed ? this.evaluate({ node: node.argument.property, scope: scope2, context, forceBindingRootScopeToFunctions }) : node.argument.property.name;
            const oldValue = obj[prop];
            if (node.operator === "++") {
              obj[prop] = oldValue + 1;
            } else if (node.operator === "--") {
              obj[prop] = oldValue - 1;
            }
            return node.prefix ? obj[prop] : oldValue;
          }
          throw new Error("Invalid update expression target");
        case "BinaryExpression":
          const left = this.evaluate({ node: node.left, scope: scope2, context, forceBindingRootScopeToFunctions });
          const right = this.evaluate({ node: node.right, scope: scope2, context, forceBindingRootScopeToFunctions });
          switch (node.operator) {
            case "+":
              return left + right;
            case "-":
              return left - right;
            case "*":
              return left * right;
            case "/":
              return left / right;
            case "%":
              return left % right;
            case "==":
              return left == right;
            case "!=":
              return left != right;
            case "===":
              return left === right;
            case "!==":
              return left !== right;
            case "<":
              return left < right;
            case ">":
              return left > right;
            case "<=":
              return left <= right;
            case ">=":
              return left >= right;
            case "&&":
              return left && right;
            case "||":
              return left || right;
            default:
              throw new Error(`Unknown binary operator: ${node.operator}`);
          }
        case "ConditionalExpression":
          const test = this.evaluate({ node: node.test, scope: scope2, context, forceBindingRootScopeToFunctions });
          return test ? this.evaluate({ node: node.consequent, scope: scope2, context, forceBindingRootScopeToFunctions }) : this.evaluate({ node: node.alternate, scope: scope2, context, forceBindingRootScopeToFunctions });
        case "AssignmentExpression":
          const value = this.evaluate({ node: node.right, scope: scope2, context, forceBindingRootScopeToFunctions });
          if (node.left.type === "Identifier") {
            scope2[node.left.name] = value;
            return value;
          } else if (node.left.type === "MemberExpression") {
            throw new Error("Property assignments are prohibited in the CSP build");
          }
          throw new Error("Invalid assignment target");
        case "ArrayExpression":
          return node.elements.map((el) => this.evaluate({ node: el, scope: scope2, context, forceBindingRootScopeToFunctions }));
        case "ObjectExpression":
          const result = {};
          for (const prop of node.properties) {
            const key = prop.computed ? this.evaluate({ node: prop.key, scope: scope2, context, forceBindingRootScopeToFunctions }) : prop.key.type === "Identifier" ? prop.key.name : this.evaluate({ node: prop.key, scope: scope2, context, forceBindingRootScopeToFunctions });
            const value2 = this.evaluate({ node: prop.value, scope: scope2, context, forceBindingRootScopeToFunctions });
            result[key] = value2;
          }
          return result;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }
    }
    checkForDangerousKeywords(keyword) {
      let blacklist = [
        "constructor",
        "prototype",
        "__proto__",
        "__defineGetter__",
        "__defineSetter__",
        "insertAdjacentHTML"
      ];
      if (blacklist.includes(keyword)) {
        throw new Error(`Accessing "${keyword}" is prohibited in the CSP build`);
      }
    }
    checkForDangerousValues(prop) {
      if (prop === null) {
        return;
      }
      if (typeof prop !== "object" && typeof prop !== "function") {
        return;
      }
      if (safemap.has(prop)) {
        return;
      }
      if (prop instanceof HTMLIFrameElement || prop instanceof HTMLScriptElement) {
        throw new Error("Accessing iframes and scripts is prohibited in the CSP build");
      }
      if (globals.has(prop)) {
        throw new Error("Accessing global variables is prohibited in the CSP build");
      }
      safemap.set(prop, true);
      return true;
    }
  };
  function generateRuntimeFunction(expression) {
    try {
      const tokenizer = new Tokenizer(expression);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const evaluator = new Evaluator();
      return function(options = {}) {
        const { scope: scope2 = {}, context = null, forceBindingRootScopeToFunctions = false } = options;
        return evaluator.evaluate({ node: ast, scope: scope2, context, forceBindingRootScopeToFunctions });
      };
    } catch (error2) {
      throw new Error(`CSP Parser Error: ${error2.message}`);
    }
  }
  function cspRawEvaluator(el, expression, extras = {}) {
    let dataStack = generateDataStack(el);
    let scope2 = mergeProxies([extras.scope ?? {}, ...dataStack]);
    let params = extras.params ?? [];
    let evaluate2 = generateRuntimeFunction(expression);
    let result = evaluate2({
      scope: scope2,
      forceBindingRootScopeToFunctions: true
    });
    if (typeof result === "function" && shouldAutoEvaluateFunctions) {
      return result.apply(scope2, params);
    }
    return result;
  }
  function cspEvaluator(el, expression) {
    let dataStack = generateDataStack(el);
    if (typeof expression === "function") {
      return generateEvaluatorFromFunction(dataStack, expression);
    }
    let evaluator = generateEvaluator(el, expression, dataStack);
    return tryCatch.bind(null, el, expression, evaluator);
  }
  function generateDataStack(el) {
    let overriddenMagics = {};
    injectMagics(overriddenMagics, el);
    return [overriddenMagics, ...closestDataStack(el)];
  }
  function generateEvaluator(el, expression, dataStack) {
    if (el instanceof HTMLIFrameElement) {
      throw new Error("Evaluating expressions on an iframe is prohibited in the CSP build");
    }
    if (el instanceof HTMLScriptElement) {
      throw new Error("Evaluating expressions on a script is prohibited in the CSP build");
    }
    return (receiver = () => {
    }, { scope: scope2 = {}, params = [] } = {}) => {
      let completeScope = mergeProxies([scope2, ...dataStack]);
      let evaluate2 = generateRuntimeFunction(expression);
      let returnValue = evaluate2({
        scope: completeScope,
        forceBindingRootScopeToFunctions: true
      });
      if (shouldAutoEvaluateFunctions && typeof returnValue === "function") {
        let nextReturnValue = returnValue.apply(returnValue, params);
        if (nextReturnValue instanceof Promise) {
          nextReturnValue.then((i) => receiver(i));
        } else {
          receiver(nextReturnValue);
        }
      } else if (typeof returnValue === "object" && returnValue instanceof Promise) {
        returnValue.then((i) => receiver(i));
      } else {
        receiver(returnValue);
      }
    };
  }
  function makeMap(str, expectsLowerCase) {
    const map = /* @__PURE__ */ Object.create(null);
    const list = str.split(",");
    for (let i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
  }
  var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
  var isBooleanAttr2 = /* @__PURE__ */ makeMap(specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`);
  var EMPTY_OBJ = true ? Object.freeze({}) : {};
  var EMPTY_ARR = true ? Object.freeze([]) : [];
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (val, key) => hasOwnProperty.call(val, key);
  var isArray = Array.isArray;
  var isMap = (val) => toTypeString(val) === "[object Map]";
  var isString = (val) => typeof val === "string";
  var isSymbol = (val) => typeof val === "symbol";
  var isObject = (val) => val !== null && typeof val === "object";
  var objectToString = Object.prototype.toString;
  var toTypeString = (value) => objectToString.call(value);
  var toRawType = (value) => {
    return toTypeString(value).slice(8, -1);
  };
  var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
  var cacheStringFunction = (fn) => {
    const cache = /* @__PURE__ */ Object.create(null);
    return (str) => {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  };
  var camelizeRE = /-(\w)/g;
  var camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
  });
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
  var capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
  var toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
  var hasChanged = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);
  var targetMap = /* @__PURE__ */ new WeakMap();
  var effectStack = [];
  var activeEffect;
  var ITERATE_KEY = /* @__PURE__ */ Symbol(true ? "iterate" : "");
  var MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(true ? "Map key iterate" : "");
  function isEffect(fn) {
    return fn && fn._isEffect === true;
  }
  function effect2(fn, options = EMPTY_OBJ) {
    if (isEffect(fn)) {
      fn = fn.raw;
    }
    const effect3 = createReactiveEffect(fn, options);
    if (!options.lazy) {
      effect3();
    }
    return effect3;
  }
  function stop(effect3) {
    if (effect3.active) {
      cleanup(effect3);
      if (effect3.options.onStop) {
        effect3.options.onStop();
      }
      effect3.active = false;
    }
  }
  var uid = 0;
  function createReactiveEffect(fn, options) {
    const effect3 = function reactiveEffect() {
      if (!effect3.active) {
        return fn();
      }
      if (!effectStack.includes(effect3)) {
        cleanup(effect3);
        try {
          enableTracking();
          effectStack.push(effect3);
          activeEffect = effect3;
          return fn();
        } finally {
          effectStack.pop();
          resetTracking();
          activeEffect = effectStack[effectStack.length - 1];
        }
      }
    };
    effect3.id = uid++;
    effect3.allowRecurse = !!options.allowRecurse;
    effect3._isEffect = true;
    effect3.active = true;
    effect3.raw = fn;
    effect3.deps = [];
    effect3.options = options;
    return effect3;
  }
  function cleanup(effect3) {
    const { deps } = effect3;
    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect3);
      }
      deps.length = 0;
    }
  }
  var shouldTrack = true;
  var trackStack = [];
  function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
  }
  function enableTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = true;
  }
  function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === void 0 ? true : last;
  }
  function track(target, type, key) {
    if (!shouldTrack || activeEffect === void 0) {
      return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = /* @__PURE__ */ new Set());
    }
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
      if (activeEffect.options.onTrack) {
        activeEffect.options.onTrack({
          effect: activeEffect,
          target,
          type,
          key
        });
      }
    }
  }
  function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
      return;
    }
    const effects = /* @__PURE__ */ new Set();
    const add2 = (effectsToAdd) => {
      if (effectsToAdd) {
        effectsToAdd.forEach((effect3) => {
          if (effect3 !== activeEffect || effect3.allowRecurse) {
            effects.add(effect3);
          }
        });
      }
    };
    if (type === "clear") {
      depsMap.forEach(add2);
    } else if (key === "length" && isArray(target)) {
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 >= newValue) {
          add2(dep);
        }
      });
    } else {
      if (key !== void 0) {
        add2(depsMap.get(key));
      }
      switch (type) {
        case "add":
          if (!isArray(target)) {
            add2(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              add2(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isIntegerKey(key)) {
            add2(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!isArray(target)) {
            add2(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              add2(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            add2(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
    const run = (effect3) => {
      if (effect3.options.onTrigger) {
        effect3.options.onTrigger({
          effect: effect3,
          target,
          key,
          type,
          newValue,
          oldValue,
          oldTarget
        });
      }
      if (effect3.options.scheduler) {
        effect3.options.scheduler(effect3);
      } else {
        effect3();
      }
    };
    effects.forEach(run);
  }
  var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
  var builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).map((key) => Symbol[key]).filter(isSymbol));
  var get2 = /* @__PURE__ */ createGetter();
  var readonlyGet = /* @__PURE__ */ createGetter(true);
  var arrayInstrumentations = /* @__PURE__ */ createArrayInstrumentations();
  function createArrayInstrumentations() {
    const instrumentations = {};
    ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
      instrumentations[key] = function(...args) {
        const arr = toRaw(this);
        for (let i = 0, l = this.length; i < l; i++) {
          track(arr, "get", i + "");
        }
        const res = arr[key](...args);
        if (res === -1 || res === false) {
          return arr[key](...args.map(toRaw));
        } else {
          return res;
        }
      };
    });
    ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
      instrumentations[key] = function(...args) {
        pauseTracking();
        const res = toRaw(this)[key].apply(this, args);
        resetTracking();
        return res;
      };
    });
    return instrumentations;
  }
  function createGetter(isReadonly = false, shallow = false) {
    return function get3(target, key, receiver) {
      if (key === "__v_isReactive") {
        return !isReadonly;
      } else if (key === "__v_isReadonly") {
        return isReadonly;
      } else if (key === "__v_raw" && receiver === (isReadonly ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
        return target;
      }
      const targetIsArray = isArray(target);
      if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      const res = Reflect.get(target, key, receiver);
      if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
        return res;
      }
      if (!isReadonly) {
        track(target, "get", key);
      }
      if (shallow) {
        return res;
      }
      if (isRef(res)) {
        const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
        return shouldUnwrap ? res.value : res;
      }
      if (isObject(res)) {
        return isReadonly ? readonly(res) : reactive2(res);
      }
      return res;
    };
  }
  var set2 = /* @__PURE__ */ createSetter();
  function createSetter(shallow = false) {
    return function set3(target, key, value, receiver) {
      let oldValue = target[key];
      if (!shallow) {
        value = toRaw(value);
        oldValue = toRaw(oldValue);
        if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
          oldValue.value = value;
          return true;
        }
      }
      const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
      const result = Reflect.set(target, key, value, receiver);
      if (target === toRaw(receiver)) {
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value, oldValue);
        }
      }
      return result;
    };
  }
  function deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  function has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  function ownKeys(target) {
    track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
    return Reflect.ownKeys(target);
  }
  var mutableHandlers = {
    get: get2,
    set: set2,
    deleteProperty,
    has,
    ownKeys
  };
  var readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
      if (true) {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
      }
      return true;
    },
    deleteProperty(target, key) {
      if (true) {
        console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
      }
      return true;
    }
  };
  var toReactive = (value) => isObject(value) ? reactive2(value) : value;
  var toReadonly = (value) => isObject(value) ? readonly(value) : value;
  var toShallow = (value) => value;
  var getProto = (v) => Reflect.getPrototypeOf(v);
  function get$1(target, key, isReadonly = false, isShallow = false) {
    target = target[
      "__v_raw"
      /* RAW */
    ];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
      !isReadonly && track(rawTarget, "get", key);
    }
    !isReadonly && track(rawTarget, "get", rawKey);
    const { has: has2 } = getProto(rawTarget);
    const wrap2 = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has2.call(rawTarget, key)) {
      return wrap2(target.get(key));
    } else if (has2.call(rawTarget, rawKey)) {
      return wrap2(target.get(rawKey));
    } else if (target !== rawTarget) {
      target.get(key);
    }
  }
  function has$1(key, isReadonly = false) {
    const target = this[
      "__v_raw"
      /* RAW */
    ];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
      !isReadonly && track(rawTarget, "has", key);
    }
    !isReadonly && track(rawTarget, "has", rawKey);
    return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
  }
  function size(target, isReadonly = false) {
    target = target[
      "__v_raw"
      /* RAW */
    ];
    !isReadonly && track(toRaw(target), "iterate", ITERATE_KEY);
    return Reflect.get(target, "size", target);
  }
  function add(value) {
    value = toRaw(value);
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
      target.add(value);
      trigger(target, "add", value, value);
    }
    return this;
  }
  function set$1(key, value) {
    value = toRaw(value);
    const target = toRaw(this);
    const { has: has2, get: get3 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get3.call(target, key);
    target.set(key, value);
    if (!hadKey) {
      trigger(target, "add", key, value);
    } else if (hasChanged(value, oldValue)) {
      trigger(target, "set", key, value, oldValue);
    }
    return this;
  }
  function deleteEntry(key) {
    const target = toRaw(this);
    const { has: has2, get: get3 } = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else if (true) {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get3 ? get3.call(target, key) : void 0;
    const result = target.delete(key);
    if (hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = true ? isMap(target) ? new Map(target) : new Set(target) : void 0;
    const result = target.clear();
    if (hadItems) {
      trigger(target, "clear", void 0, void 0, oldTarget);
    }
    return result;
  }
  function createForEach(isReadonly, isShallow) {
    return function forEach(callback, thisArg) {
      const observed = this;
      const target = observed[
        "__v_raw"
        /* RAW */
      ];
      const rawTarget = toRaw(target);
      const wrap2 = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
      !isReadonly && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap2(value), wrap2(key), observed);
      });
    };
  }
  function createIterableMethod(method, isReadonly, isShallow) {
    return function(...args) {
      const target = this[
        "__v_raw"
        /* RAW */
      ];
      const rawTarget = toRaw(target);
      const targetIsMap = isMap(rawTarget);
      const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
      const isKeyOnly = method === "keys" && targetIsMap;
      const innerIterator = target[method](...args);
      const wrap2 = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
      !isReadonly && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
      return {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap2(value[0]), wrap2(value[1])] : wrap2(value),
            done
          };
        },
        // iterable protocol
        [Symbol.iterator]() {
          return this;
        }
      };
    };
  }
  function createReadonlyMethod(type) {
    return function(...args) {
      if (true) {
        const key = args[0] ? `on key "${args[0]}" ` : ``;
        console.warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
      }
      return type === "delete" ? false : this;
    };
  }
  function createInstrumentations() {
    const mutableInstrumentations2 = {
      get(key) {
        return get$1(this, key);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, false)
    };
    const shallowInstrumentations2 = {
      get(key) {
        return get$1(this, key, false, true);
      },
      get size() {
        return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, true)
    };
    const readonlyInstrumentations2 = {
      get(key) {
        return get$1(this, key, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has$1.call(this, key, true);
      },
      add: createReadonlyMethod(
        "add"
        /* ADD */
      ),
      set: createReadonlyMethod(
        "set"
        /* SET */
      ),
      delete: createReadonlyMethod(
        "delete"
        /* DELETE */
      ),
      clear: createReadonlyMethod(
        "clear"
        /* CLEAR */
      ),
      forEach: createForEach(true, false)
    };
    const shallowReadonlyInstrumentations2 = {
      get(key) {
        return get$1(this, key, true, true);
      },
      get size() {
        return size(this, true);
      },
      has(key) {
        return has$1.call(this, key, true);
      },
      add: createReadonlyMethod(
        "add"
        /* ADD */
      ),
      set: createReadonlyMethod(
        "set"
        /* SET */
      ),
      delete: createReadonlyMethod(
        "delete"
        /* DELETE */
      ),
      clear: createReadonlyMethod(
        "clear"
        /* CLEAR */
      ),
      forEach: createForEach(true, true)
    };
    const iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
    iteratorMethods.forEach((method) => {
      mutableInstrumentations2[method] = createIterableMethod(method, false, false);
      readonlyInstrumentations2[method] = createIterableMethod(method, true, false);
      shallowInstrumentations2[method] = createIterableMethod(method, false, true);
      shallowReadonlyInstrumentations2[method] = createIterableMethod(method, true, true);
    });
    return [
      mutableInstrumentations2,
      readonlyInstrumentations2,
      shallowInstrumentations2,
      shallowReadonlyInstrumentations2
    ];
  }
  var [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* @__PURE__ */ createInstrumentations();
  function createInstrumentationGetter(isReadonly, shallow) {
    const instrumentations = shallow ? isReadonly ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly ? readonlyInstrumentations : mutableInstrumentations;
    return (target, key, receiver) => {
      if (key === "__v_isReactive") {
        return !isReadonly;
      } else if (key === "__v_isReadonly") {
        return isReadonly;
      } else if (key === "__v_raw") {
        return target;
      }
      return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
    };
  }
  var mutableCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(false, false)
  };
  var readonlyCollectionHandlers = {
    get: /* @__PURE__ */ createInstrumentationGetter(true, false)
  };
  function checkIdentityKeys(target, has2, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has2.call(target, rawKey)) {
      const type = toRawType(target);
      console.warn(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
    }
  }
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
  var readonlyMap = /* @__PURE__ */ new WeakMap();
  var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
  function targetTypeMap(rawType) {
    switch (rawType) {
      case "Object":
      case "Array":
        return 1;
      case "Map":
      case "Set":
      case "WeakMap":
      case "WeakSet":
        return 2;
      default:
        return 0;
    }
  }
  function getTargetType(value) {
    return value[
      "__v_skip"
      /* SKIP */
    ] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
  }
  function reactive2(target) {
    if (target && target[
      "__v_isReadonly"
      /* IS_READONLY */
    ]) {
      return target;
    }
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
  }
  function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
  }
  function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target)) {
      if (true) {
        console.warn(`value cannot be made reactive: ${String(target)}`);
      }
      return target;
    }
    if (target[
      "__v_raw"
      /* RAW */
    ] && !(isReadonly && target[
      "__v_isReactive"
      /* IS_REACTIVE */
    ])) {
      return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    const targetType = getTargetType(target);
    if (targetType === 0) {
      return target;
    }
    const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
  }
  function toRaw(observed) {
    return observed && toRaw(observed[
      "__v_raw"
      /* RAW */
    ]) || observed;
  }
  function isRef(r) {
    return Boolean(r && r.__v_isRef === true);
  }
  magic("nextTick", () => nextTick);
  magic("dispatch", (el) => dispatch.bind(dispatch, el));
  magic("watch", (el, { evaluateLater: evaluateLater2, cleanup: cleanup2 }) => (key, callback) => {
    let evaluate2 = evaluateLater2(key);
    let getter = () => {
      let value;
      evaluate2((i) => value = i);
      return value;
    };
    let unwatch = watch(getter, callback);
    cleanup2(unwatch);
  });
  magic("store", getStores);
  magic("data", (el) => scope(el));
  magic("root", (el) => closestRoot(el));
  magic("refs", (el) => {
    if (el._x_refs_proxy)
      return el._x_refs_proxy;
    el._x_refs_proxy = mergeProxies(getArrayOfRefObject(el));
    return el._x_refs_proxy;
  });
  function getArrayOfRefObject(el) {
    let refObjects = [];
    findClosest(el, (i) => {
      if (i._x_refs)
        refObjects.push(i._x_refs);
    });
    return refObjects;
  }
  var globalIdMemo = {};
  function findAndIncrementId(name) {
    if (!globalIdMemo[name])
      globalIdMemo[name] = 0;
    return ++globalIdMemo[name];
  }
  function closestIdRoot(el, name) {
    return findClosest(el, (element) => {
      if (element._x_ids && element._x_ids[name])
        return true;
    });
  }
  function setIdRoot(el, name) {
    if (!el._x_ids)
      el._x_ids = {};
    if (!el._x_ids[name])
      el._x_ids[name] = findAndIncrementId(name);
  }
  magic("id", (el, { cleanup: cleanup2 }) => (name, key = null) => {
    let cacheKey = `${name}${key ? `-${key}` : ""}`;
    return cacheIdByNameOnElement(el, cacheKey, cleanup2, () => {
      let root = closestIdRoot(el, name);
      let id = root ? root._x_ids[name] : findAndIncrementId(name);
      return key ? `${name}-${id}-${key}` : `${name}-${id}`;
    });
  });
  interceptClone((from, to) => {
    if (from._x_id) {
      to._x_id = from._x_id;
    }
  });
  function cacheIdByNameOnElement(el, cacheKey, cleanup2, callback) {
    if (!el._x_id)
      el._x_id = {};
    if (el._x_id[cacheKey])
      return el._x_id[cacheKey];
    let output = callback();
    el._x_id[cacheKey] = output;
    cleanup2(() => {
      delete el._x_id[cacheKey];
    });
    return output;
  }
  magic("el", (el) => el);
  warnMissingPluginMagic("Focus", "focus", "focus");
  warnMissingPluginMagic("Persist", "persist", "persist");
  function warnMissingPluginMagic(name, magicName, slug) {
    magic(magicName, (el) => warn(`You can't use [$${magicName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el));
  }
  directive("modelable", (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2, cleanup: cleanup2 }) => {
    let func = evaluateLater2(expression);
    let innerGet = () => {
      let result;
      func((i) => result = i);
      return result;
    };
    let evaluateInnerSet = evaluateLater2(`${expression} = __placeholder`);
    let innerSet = (val) => evaluateInnerSet(() => {
    }, { scope: { "__placeholder": val } });
    let initialValue = innerGet();
    innerSet(initialValue);
    queueMicrotask(() => {
      if (!el._x_model)
        return;
      el._x_removeModelListeners["default"]();
      let outerGet = el._x_model.get;
      let outerSet = el._x_model.set;
      let releaseEntanglement = entangle(
        {
          get() {
            return outerGet();
          },
          set(value) {
            outerSet(value);
          }
        },
        {
          get() {
            return innerGet();
          },
          set(value) {
            innerSet(value);
          }
        }
      );
      cleanup2(releaseEntanglement);
    });
  });
  directive("teleport", (el, { modifiers, expression }, { cleanup: cleanup2 }) => {
    if (el.tagName.toLowerCase() !== "template")
      warn("x-teleport can only be used on a <template> tag", el);
    let target = getTarget(expression);
    let clone2 = el.content.cloneNode(true).firstElementChild;
    el._x_teleport = clone2;
    clone2._x_teleportBack = el;
    el.setAttribute("data-teleport-template", true);
    clone2.setAttribute("data-teleport-target", true);
    if (el._x_forwardEvents) {
      el._x_forwardEvents.forEach((eventName) => {
        clone2.addEventListener(eventName, (e) => {
          e.stopPropagation();
          el.dispatchEvent(new e.constructor(e.type, e));
        });
      });
    }
    addScopeToNode(clone2, {}, el);
    let placeInDom = (clone3, target2, modifiers2) => {
      if (modifiers2.includes("prepend")) {
        target2.parentNode.insertBefore(clone3, target2);
      } else if (modifiers2.includes("append")) {
        target2.parentNode.insertBefore(clone3, target2.nextSibling);
      } else {
        target2.appendChild(clone3);
      }
    };
    mutateDom(() => {
      placeInDom(clone2, target, modifiers);
      skipDuringClone(() => {
        initTree(clone2);
      })();
    });
    el._x_teleportPutBack = () => {
      let target2 = getTarget(expression);
      mutateDom(() => {
        placeInDom(el._x_teleport, target2, modifiers);
      });
    };
    cleanup2(
      () => mutateDom(() => {
        clone2.remove();
        destroyTree(clone2);
      })
    );
  });
  var teleportContainerDuringClone = document.createElement("div");
  function getTarget(expression) {
    let target = skipDuringClone(() => {
      return document.querySelector(expression);
    }, () => {
      return teleportContainerDuringClone;
    })();
    if (!target)
      warn(`Cannot find x-teleport element for selector: "${expression}"`);
    return target;
  }
  var handler = () => {
  };
  handler.inline = (el, { modifiers }, { cleanup: cleanup2 }) => {
    modifiers.includes("self") ? el._x_ignoreSelf = true : el._x_ignore = true;
    cleanup2(() => {
      modifiers.includes("self") ? delete el._x_ignoreSelf : delete el._x_ignore;
    });
  };
  directive("ignore", handler);
  directive("effect", skipDuringClone((el, { expression }, { effect: effect3 }) => {
    effect3(evaluateLater(el, expression));
  }));
  function on(el, event, modifiers, callback) {
    let listenerTarget = el;
    let handler4 = (e) => callback(e);
    let options = {};
    let wrapHandler = (callback2, wrapper) => (e) => wrapper(callback2, e);
    if (modifiers.includes("dot"))
      event = dotSyntax(event);
    if (modifiers.includes("camel"))
      event = camelCase2(event);
    if (modifiers.includes("passive"))
      options.passive = true;
    if (modifiers.includes("capture"))
      options.capture = true;
    if (modifiers.includes("window"))
      listenerTarget = window;
    if (modifiers.includes("document"))
      listenerTarget = document;
    if (modifiers.includes("debounce")) {
      let nextModifier = modifiers[modifiers.indexOf("debounce") + 1] || "invalid-wait";
      let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
      handler4 = debounce(handler4, wait);
    }
    if (modifiers.includes("throttle")) {
      let nextModifier = modifiers[modifiers.indexOf("throttle") + 1] || "invalid-wait";
      let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
      handler4 = throttle(handler4, wait);
    }
    if (modifiers.includes("prevent"))
      handler4 = wrapHandler(handler4, (next, e) => {
        e.preventDefault();
        next(e);
      });
    if (modifiers.includes("stop"))
      handler4 = wrapHandler(handler4, (next, e) => {
        e.stopPropagation();
        next(e);
      });
    if (modifiers.includes("once")) {
      handler4 = wrapHandler(handler4, (next, e) => {
        next(e);
        listenerTarget.removeEventListener(event, handler4, options);
      });
    }
    if (modifiers.includes("away") || modifiers.includes("outside")) {
      listenerTarget = document;
      handler4 = wrapHandler(handler4, (next, e) => {
        if (el.contains(e.target))
          return;
        if (e.target.isConnected === false)
          return;
        if (el.offsetWidth < 1 && el.offsetHeight < 1)
          return;
        if (el._x_isShown === false)
          return;
        next(e);
      });
    }
    if (modifiers.includes("self"))
      handler4 = wrapHandler(handler4, (next, e) => {
        e.target === el && next(e);
      });
    if (event === "submit") {
      handler4 = wrapHandler(handler4, (next, e) => {
        if (e.target._x_pendingModelUpdates) {
          e.target._x_pendingModelUpdates.forEach((fn) => fn());
        }
        next(e);
      });
    }
    if (isKeyEvent(event) || isClickEvent(event)) {
      handler4 = wrapHandler(handler4, (next, e) => {
        if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers)) {
          return;
        }
        next(e);
      });
    }
    listenerTarget.addEventListener(event, handler4, options);
    return () => {
      listenerTarget.removeEventListener(event, handler4, options);
    };
  }
  function dotSyntax(subject) {
    return subject.replace(/-/g, ".");
  }
  function camelCase2(subject) {
    return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
  }
  function isNumeric(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function kebabCase2(subject) {
    if ([" ", "_"].includes(
      subject
    ))
      return subject;
    return subject.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]/, "-").toLowerCase();
  }
  function isKeyEvent(event) {
    return ["keydown", "keyup"].includes(event);
  }
  function isClickEvent(event) {
    return ["contextmenu", "click", "mouse"].some((i) => event.includes(i));
  }
  function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers) {
    let keyModifiers = modifiers.filter((i) => {
      return !["window", "document", "prevent", "stop", "once", "capture", "self", "away", "outside", "passive", "preserve-scroll", "blur", "change", "lazy"].includes(i);
    });
    if (keyModifiers.includes("debounce")) {
      let debounceIndex = keyModifiers.indexOf("debounce");
      keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
    }
    if (keyModifiers.includes("throttle")) {
      let debounceIndex = keyModifiers.indexOf("throttle");
      keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
    }
    if (keyModifiers.length === 0)
      return false;
    if (keyModifiers.length === 1 && keyToModifiers(e.key).includes(keyModifiers[0]))
      return false;
    const systemKeyModifiers = ["ctrl", "shift", "alt", "meta", "cmd", "super"];
    const selectedSystemKeyModifiers = systemKeyModifiers.filter((modifier) => keyModifiers.includes(modifier));
    keyModifiers = keyModifiers.filter((i) => !selectedSystemKeyModifiers.includes(i));
    if (selectedSystemKeyModifiers.length > 0) {
      const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter((modifier) => {
        if (modifier === "cmd" || modifier === "super")
          modifier = "meta";
        return e[`${modifier}Key`];
      });
      if (activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length) {
        if (isClickEvent(e.type))
          return false;
        if (keyToModifiers(e.key).includes(keyModifiers[0]))
          return false;
      }
    }
    return true;
  }
  function keyToModifiers(key) {
    if (!key)
      return [];
    key = kebabCase2(key);
    let modifierToKeyMap = {
      "ctrl": "control",
      "slash": "/",
      "space": " ",
      "spacebar": " ",
      "cmd": "meta",
      "esc": "escape",
      "up": "arrow-up",
      "down": "arrow-down",
      "left": "arrow-left",
      "right": "arrow-right",
      "period": ".",
      "comma": ",",
      "equal": "=",
      "minus": "-",
      "underscore": "_"
    };
    modifierToKeyMap[key] = key;
    return Object.keys(modifierToKeyMap).map((modifier) => {
      if (modifierToKeyMap[modifier] === key)
        return modifier;
    }).filter((modifier) => modifier);
  }
  directive("model", (el, { modifiers, expression }, { effect: effect3, cleanup: cleanup2 }) => {
    let scopeTarget = el;
    if (modifiers.includes("parent")) {
      scopeTarget = el.parentNode;
    }
    let evaluateGet = evaluateLater(scopeTarget, expression);
    let evaluateSet;
    if (typeof expression === "string") {
      evaluateSet = evaluateLater(scopeTarget, `${expression} = __placeholder`);
    } else if (typeof expression === "function" && typeof expression() === "string") {
      evaluateSet = evaluateLater(scopeTarget, `${expression()} = __placeholder`);
    } else {
      evaluateSet = () => {
      };
    }
    let getValue = () => {
      let result;
      evaluateGet((value) => result = value);
      return isGetterSetter(result) ? result.get() : result;
    };
    let setValue = (value) => {
      let result;
      evaluateGet((value2) => result = value2);
      if (isGetterSetter(result)) {
        result.set(value);
      } else {
        evaluateSet(() => {
        }, {
          scope: { "__placeholder": value }
        });
      }
    };
    if (typeof expression === "string" && el.type === "radio") {
      mutateDom(() => {
        if (!el.hasAttribute("name"))
          el.setAttribute("name", expression);
      });
    }
    let hasChangeModifier = modifiers.includes("change") || modifiers.includes("lazy");
    let hasBlurModifier = modifiers.includes("blur");
    let hasEnterModifier = modifiers.includes("enter");
    let hasExplicitEventModifiers = hasChangeModifier || hasBlurModifier || hasEnterModifier;
    let removeListener;
    if (isCloning) {
      removeListener = () => {
      };
    } else if (hasExplicitEventModifiers) {
      let listeners = [];
      let syncValue = (e) => setValue(getInputValue(el, modifiers, e, getValue()));
      if (hasChangeModifier) {
        listeners.push(on(el, "change", modifiers, syncValue));
      }
      if (hasBlurModifier) {
        listeners.push(on(el, "blur", modifiers, syncValue));
        if (el.form) {
          let syncCallback = () => syncValue({ target: el });
          if (!el.form._x_pendingModelUpdates)
            el.form._x_pendingModelUpdates = [];
          el.form._x_pendingModelUpdates.push(syncCallback);
          cleanup2(() => el.form._x_pendingModelUpdates.splice(el.form._x_pendingModelUpdates.indexOf(syncCallback), 1));
        }
      }
      if (hasEnterModifier) {
        listeners.push(on(el, "keydown", modifiers, (e) => {
          if (e.key === "Enter")
            syncValue(e);
        }));
      }
      removeListener = () => listeners.forEach((remove) => remove());
    } else {
      let event = el.tagName.toLowerCase() === "select" || ["checkbox", "radio"].includes(el.type) ? "change" : "input";
      removeListener = on(el, event, modifiers, (e) => {
        setValue(getInputValue(el, modifiers, e, getValue()));
      });
    }
    if (modifiers.includes("fill")) {
      if ([void 0, null, ""].includes(getValue()) || isCheckbox(el) && Array.isArray(getValue()) || el.tagName.toLowerCase() === "select" && el.multiple) {
        setValue(
          getInputValue(el, modifiers, { target: el }, getValue())
        );
      }
    }
    if (!el._x_removeModelListeners)
      el._x_removeModelListeners = {};
    el._x_removeModelListeners["default"] = removeListener;
    cleanup2(() => el._x_removeModelListeners["default"]());
    if (el.form) {
      let removeResetListener = on(el.form, "reset", [], (e) => {
        nextTick(() => el._x_model && el._x_model.set(getInputValue(el, modifiers, { target: el }, getValue())));
      });
      cleanup2(() => removeResetListener());
    }
    el._x_model = {
      get() {
        return getValue();
      },
      set(value) {
        setValue(value);
      }
    };
    el._x_forceModelUpdate = (value) => {
      if (value === void 0 && typeof expression === "string" && expression.match(/\./))
        value = "";
      window.fromModel = true;
      mutateDom(() => bind(el, "value", value));
      delete window.fromModel;
    };
    effect3(() => {
      let value = getValue();
      if (modifiers.includes("unintrusive") && document.activeElement.isSameNode(el))
        return;
      el._x_forceModelUpdate(value);
    });
  });
  function getInputValue(el, modifiers, event, currentValue) {
    return mutateDom(() => {
      if (event instanceof CustomEvent && event.detail !== void 0)
        return event.detail !== null && event.detail !== void 0 ? event.detail : event.target.value;
      else if (isCheckbox(el)) {
        if (Array.isArray(currentValue)) {
          let newValue = null;
          if (modifiers.includes("number")) {
            newValue = safeParseNumber(event.target.value);
          } else if (modifiers.includes("boolean")) {
            newValue = safeParseBoolean(event.target.value);
          } else {
            newValue = event.target.value;
          }
          return event.target.checked ? currentValue.includes(newValue) ? currentValue : currentValue.concat([newValue]) : currentValue.filter((el2) => !checkedAttrLooseCompare2(el2, newValue));
        } else {
          return event.target.checked;
        }
      } else if (el.tagName.toLowerCase() === "select" && el.multiple) {
        if (modifiers.includes("number")) {
          return Array.from(event.target.selectedOptions).map((option) => {
            let rawValue = option.value || option.text;
            return safeParseNumber(rawValue);
          });
        } else if (modifiers.includes("boolean")) {
          return Array.from(event.target.selectedOptions).map((option) => {
            let rawValue = option.value || option.text;
            return safeParseBoolean(rawValue);
          });
        }
        return Array.from(event.target.selectedOptions).map((option) => {
          return option.value || option.text;
        });
      } else {
        let newValue;
        if (isRadio(el)) {
          if (event.target.checked) {
            newValue = event.target.value;
          } else {
            newValue = currentValue;
          }
        } else {
          newValue = event.target.value;
        }
        if (modifiers.includes("number")) {
          return safeParseNumber(newValue);
        } else if (modifiers.includes("boolean")) {
          return safeParseBoolean(newValue);
        } else if (modifiers.includes("trim")) {
          return newValue.trim();
        } else {
          return newValue;
        }
      }
    });
  }
  function safeParseNumber(rawValue) {
    let number = rawValue ? parseFloat(rawValue) : null;
    return isNumeric2(number) ? number : rawValue;
  }
  function checkedAttrLooseCompare2(valueA, valueB) {
    return valueA == valueB;
  }
  function isNumeric2(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function isGetterSetter(value) {
    return value !== null && typeof value === "object" && typeof value.get === "function" && typeof value.set === "function";
  }
  directive("cloak", (el) => queueMicrotask(() => mutateDom(() => el.removeAttribute(prefix("cloak")))));
  addInitSelector(() => `[${prefix("init")}]`);
  directive("init", skipDuringClone((el, { expression }, { evaluate: evaluate2 }) => {
    if (typeof expression === "string") {
      return !!expression.trim() && evaluate2(expression, {}, false);
    }
    return evaluate2(expression, {}, false);
  }));
  directive("text", (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2 }) => {
    let evaluate2 = evaluateLater2(expression);
    effect3(() => {
      evaluate2((value) => {
        mutateDom(() => {
          el.textContent = value;
        });
      });
    });
  });
  directive("html", (el, { expression }, { effect: effect3, evaluateLater: evaluateLater2 }) => {
    let evaluate2 = evaluateLater2(expression);
    effect3(() => {
      evaluate2((value) => {
        mutateDom(() => {
          el.innerHTML = value;
          el._x_ignoreSelf = true;
          initTree(el);
          delete el._x_ignoreSelf;
        });
      });
    });
  });
  mapAttributes(startingWith(":", into(prefix("bind:"))));
  var handler2 = (el, { value, modifiers, expression, original }, { effect: effect3, cleanup: cleanup2 }) => {
    if (!value) {
      let bindingProviders = {};
      injectBindingProviders(bindingProviders);
      let getBindings = evaluateLater(el, expression);
      getBindings((bindings) => {
        applyBindingsObject(el, bindings, original);
      }, { scope: bindingProviders });
      return;
    }
    if (value === "key")
      return storeKeyForXFor(el, expression);
    if (el._x_inlineBindings && el._x_inlineBindings[value] && el._x_inlineBindings[value].extract) {
      return;
    }
    let evaluate2 = evaluateLater(el, expression);
    effect3(() => evaluate2((result) => {
      if (result === void 0 && typeof expression === "string" && expression.match(/\./)) {
        result = "";
      }
      mutateDom(() => bind(el, value, result, modifiers));
    }));
    cleanup2(() => {
      el._x_undoAddedClasses && el._x_undoAddedClasses();
      el._x_undoAddedStyles && el._x_undoAddedStyles();
    });
  };
  handler2.inline = (el, { value, modifiers, expression }) => {
    if (!value)
      return;
    if (!el._x_inlineBindings)
      el._x_inlineBindings = {};
    el._x_inlineBindings[value] = { expression, extract: false };
  };
  directive("bind", handler2);
  function storeKeyForXFor(el, expression) {
    el._x_keyExpression = expression;
  }
  addRootSelector(() => `[${prefix("data")}]`);
  directive("data", (el, { expression }, { cleanup: cleanup2 }) => {
    if (shouldSkipRegisteringDataDuringClone(el))
      return;
    expression = expression === "" ? "{}" : expression;
    let magicContext = {};
    injectMagics(magicContext, el);
    let dataProviderContext = {};
    injectDataProviders(dataProviderContext, magicContext);
    let data2 = evaluate(el, expression, { scope: dataProviderContext });
    if (data2 === void 0 || data2 === true)
      data2 = {};
    injectMagics(data2, el);
    let reactiveData = reactive(data2);
    initInterceptors(reactiveData);
    let undo = addScopeToNode(el, reactiveData);
    reactiveData["init"] && evaluate(el, reactiveData["init"]);
    cleanup2(() => {
      reactiveData["destroy"] && evaluate(el, reactiveData["destroy"]);
      undo();
    });
  });
  interceptClone((from, to) => {
    if (from._x_dataStack) {
      to._x_dataStack = from._x_dataStack;
      to.setAttribute("data-has-alpine-state", true);
    }
  });
  function shouldSkipRegisteringDataDuringClone(el) {
    if (!isCloning)
      return false;
    if (isCloningLegacy)
      return true;
    return el.hasAttribute("data-has-alpine-state");
  }
  directive("show", (el, { modifiers, expression }, { effect: effect3 }) => {
    let evaluate2 = evaluateLater(el, expression);
    if (!el._x_doHide)
      el._x_doHide = () => {
        mutateDom(() => {
          el.style.setProperty("display", "none", modifiers.includes("important") ? "important" : void 0);
        });
      };
    if (!el._x_doShow)
      el._x_doShow = () => {
        mutateDom(() => {
          if (el.style.length === 1 && el.style.display === "none") {
            el.removeAttribute("style");
          } else {
            el.style.removeProperty("display");
          }
        });
      };
    let hide = () => {
      el._x_doHide();
      el._x_isShown = false;
    };
    let show = () => {
      el._x_doShow();
      el._x_isShown = true;
    };
    let clickAwayCompatibleShow = () => setTimeout(show);
    let toggle = once(
      (value) => value ? show() : hide(),
      (value) => {
        if (typeof el._x_toggleAndCascadeWithTransitions === "function") {
          el._x_toggleAndCascadeWithTransitions(el, value, show, hide);
        } else {
          value ? clickAwayCompatibleShow() : hide();
        }
      }
    );
    let oldValue;
    let firstTime = true;
    effect3(() => evaluate2((value) => {
      if (!firstTime && value === oldValue)
        return;
      if (modifiers.includes("immediate"))
        value ? clickAwayCompatibleShow() : hide();
      toggle(value);
      oldValue = value;
      firstTime = false;
    }));
  });
  directive("for", (el, { expression }, { effect: effect3, cleanup: cleanup2 }) => {
    let iteratorNames = parseForExpression(expression);
    let evaluateItems = evaluateLater(el, iteratorNames.items);
    let evaluateKey = evaluateLater(
      el,
      // the x-bind:key expression is stored for our use instead of evaluated.
      el._x_keyExpression || "index"
    );
    el._x_prevKeys = [];
    el._x_lookup = {};
    effect3(() => loop(el, iteratorNames, evaluateItems, evaluateKey));
    cleanup2(() => {
      Object.values(el._x_lookup).forEach((el2) => mutateDom(
        () => {
          destroyTree(el2);
          el2.remove();
        }
      ));
      delete el._x_prevKeys;
      delete el._x_lookup;
    });
  });
  function loop(el, iteratorNames, evaluateItems, evaluateKey) {
    let isObject2 = (i) => typeof i === "object" && !Array.isArray(i);
    let templateEl = el;
    evaluateItems((items) => {
      if (isNumeric3(items) && items >= 0) {
        items = Array.from(Array(items).keys(), (i) => i + 1);
      }
      if (items === void 0)
        items = [];
      let lookup = el._x_lookup;
      let prevKeys = el._x_prevKeys;
      let scopes = [];
      let keys = [];
      if (isObject2(items)) {
        items = Object.entries(items).map(([key, value]) => {
          let scope2 = getIterationScopeVariables(iteratorNames, value, key, items);
          evaluateKey((value2) => {
            if (keys.includes(value2))
              warn("Duplicate key on x-for", el);
            keys.push(value2);
          }, { scope: { index: key, ...scope2 } });
          scopes.push(scope2);
        });
      } else {
        for (let i = 0; i < items.length; i++) {
          let scope2 = getIterationScopeVariables(iteratorNames, items[i], i, items);
          evaluateKey((value) => {
            if (keys.includes(value))
              warn("Duplicate key on x-for", el);
            keys.push(value);
          }, { scope: { index: i, ...scope2 } });
          scopes.push(scope2);
        }
      }
      let adds = [];
      let moves = [];
      let removes = [];
      let sames = [];
      for (let i = 0; i < prevKeys.length; i++) {
        let key = prevKeys[i];
        if (keys.indexOf(key) === -1)
          removes.push(key);
      }
      prevKeys = prevKeys.filter((key) => !removes.includes(key));
      let lastKey = "template";
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let prevIndex = prevKeys.indexOf(key);
        if (prevIndex === -1) {
          prevKeys.splice(i, 0, key);
          adds.push([lastKey, i]);
        } else if (prevIndex !== i) {
          let keyInSpot = prevKeys.splice(i, 1)[0];
          let keyForSpot = prevKeys.splice(prevIndex - 1, 1)[0];
          prevKeys.splice(i, 0, keyForSpot);
          prevKeys.splice(prevIndex, 0, keyInSpot);
          moves.push([keyInSpot, keyForSpot]);
        } else {
          sames.push(key);
        }
        lastKey = key;
      }
      for (let i = 0; i < removes.length; i++) {
        let key = removes[i];
        if (!(key in lookup))
          continue;
        mutateDom(() => {
          destroyTree(lookup[key]);
          lookup[key].remove();
        });
        delete lookup[key];
      }
      for (let i = 0; i < moves.length; i++) {
        let [keyInSpot, keyForSpot] = moves[i];
        let elInSpot = lookup[keyInSpot];
        let elForSpot = lookup[keyForSpot];
        let marker = document.createElement("div");
        mutateDom(() => {
          if (!elForSpot)
            warn(`x-for ":key" is undefined or invalid`, templateEl, keyForSpot, lookup);
          elForSpot.after(marker);
          elInSpot.after(elForSpot);
          elForSpot._x_currentIfEl && elForSpot.after(elForSpot._x_currentIfEl);
          marker.before(elInSpot);
          elInSpot._x_currentIfEl && elInSpot.after(elInSpot._x_currentIfEl);
          marker.remove();
        });
        elForSpot._x_refreshXForScope(scopes[keys.indexOf(keyForSpot)]);
      }
      for (let i = 0; i < adds.length; i++) {
        let [lastKey2, index] = adds[i];
        let lastEl = lastKey2 === "template" ? templateEl : lookup[lastKey2];
        if (lastEl._x_currentIfEl)
          lastEl = lastEl._x_currentIfEl;
        let scope2 = scopes[index];
        let key = keys[index];
        let clone2 = document.importNode(templateEl.content, true).firstElementChild;
        let reactiveScope = reactive(scope2);
        addScopeToNode(clone2, reactiveScope, templateEl);
        clone2._x_refreshXForScope = (newScope) => {
          Object.entries(newScope).forEach(([key2, value]) => {
            reactiveScope[key2] = value;
          });
        };
        mutateDom(() => {
          lastEl.after(clone2);
          skipDuringClone(() => initTree(clone2))();
        });
        if (typeof key === "object") {
          warn("x-for key cannot be an object, it must be a string or an integer", templateEl);
        }
        lookup[key] = clone2;
      }
      for (let i = 0; i < sames.length; i++) {
        lookup[sames[i]]._x_refreshXForScope(scopes[keys.indexOf(sames[i])]);
      }
      templateEl._x_prevKeys = keys;
    });
  }
  function parseForExpression(expression) {
    let forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
    let stripParensRE = /^\s*\(|\)\s*$/g;
    let forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
    let inMatch = expression.match(forAliasRE);
    if (!inMatch)
      return;
    let res = {};
    res.items = inMatch[2].trim();
    let item = inMatch[1].replace(stripParensRE, "").trim();
    let iteratorMatch = item.match(forIteratorRE);
    if (iteratorMatch) {
      res.item = item.replace(forIteratorRE, "").trim();
      res.index = iteratorMatch[1].trim();
      if (iteratorMatch[2]) {
        res.collection = iteratorMatch[2].trim();
      }
    } else {
      res.item = item;
    }
    return res;
  }
  function getIterationScopeVariables(iteratorNames, item, index, items) {
    let scopeVariables = {};
    if (/^\[.*\]$/.test(iteratorNames.item) && Array.isArray(item)) {
      let names = iteratorNames.item.replace("[", "").replace("]", "").split(",").map((i) => i.trim());
      names.forEach((name, i) => {
        scopeVariables[name] = item[i];
      });
    } else if (/^\{.*\}$/.test(iteratorNames.item) && !Array.isArray(item) && typeof item === "object") {
      let names = iteratorNames.item.replace("{", "").replace("}", "").split(",").map((i) => i.trim());
      names.forEach((name) => {
        scopeVariables[name] = item[name];
      });
    } else {
      scopeVariables[iteratorNames.item] = item;
    }
    if (iteratorNames.index)
      scopeVariables[iteratorNames.index] = index;
    if (iteratorNames.collection)
      scopeVariables[iteratorNames.collection] = items;
    return scopeVariables;
  }
  function isNumeric3(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function handler3() {
  }
  handler3.inline = (el, { expression }, { cleanup: cleanup2 }) => {
    let root = closestRoot(el);
    if (!root._x_refs)
      root._x_refs = {};
    root._x_refs[expression] = el;
    cleanup2(() => delete root._x_refs[expression]);
  };
  directive("ref", handler3);
  directive("if", (el, { expression }, { effect: effect3, cleanup: cleanup2 }) => {
    if (el.tagName.toLowerCase() !== "template")
      warn("x-if can only be used on a <template> tag", el);
    let evaluate2 = evaluateLater(el, expression);
    let show = () => {
      if (el._x_currentIfEl)
        return el._x_currentIfEl;
      let clone2 = el.content.cloneNode(true).firstElementChild;
      addScopeToNode(clone2, {}, el);
      mutateDom(() => {
        el.after(clone2);
        skipDuringClone(() => initTree(clone2))();
      });
      el._x_currentIfEl = clone2;
      el._x_undoIf = () => {
        mutateDom(() => {
          destroyTree(clone2);
          clone2.remove();
        });
        delete el._x_currentIfEl;
      };
      return clone2;
    };
    let hide = () => {
      if (!el._x_undoIf)
        return;
      el._x_undoIf();
      delete el._x_undoIf;
    };
    effect3(() => evaluate2((value) => {
      value ? show() : hide();
    }));
    cleanup2(() => el._x_undoIf && el._x_undoIf());
  });
  directive("id", (el, { expression }, { evaluate: evaluate2 }) => {
    let names = evaluate2(expression);
    names.forEach((name) => setIdRoot(el, name));
  });
  interceptClone((from, to) => {
    if (from._x_ids) {
      to._x_ids = from._x_ids;
    }
  });
  mapAttributes(startingWith("@", into(prefix("on:"))));
  directive("on", skipDuringClone((el, { value, modifiers, expression }, { cleanup: cleanup2 }) => {
    let evaluate2 = expression ? evaluateLater(el, expression) : () => {
    };
    if (el.tagName.toLowerCase() === "template") {
      if (!el._x_forwardEvents)
        el._x_forwardEvents = [];
      if (!el._x_forwardEvents.includes(value))
        el._x_forwardEvents.push(value);
    }
    let removeListener = on(el, value, modifiers, (e) => {
      evaluate2(() => {
      }, { scope: { "$event": e }, params: [e] });
    });
    cleanup2(() => removeListener());
  }));
  warnMissingPluginDirective("Collapse", "collapse", "collapse");
  warnMissingPluginDirective("Intersect", "intersect", "intersect");
  warnMissingPluginDirective("Focus", "trap", "focus");
  warnMissingPluginDirective("Mask", "mask", "mask");
  function warnMissingPluginDirective(name, directiveName, slug) {
    directive(directiveName, (el) => warn(`You can't use [x-${directiveName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el));
  }
  directive("html", (el, { expression }) => {
    handleError(new Error("Using the x-html directive is prohibited in the CSP build"), el);
  });
  alpine_default.setEvaluator(cspEvaluator);
  alpine_default.setRawEvaluator(cspRawEvaluator);
  alpine_default.setReactivityEngine({ reactive: reactive2, effect: effect2, release: stop, raw: toRaw });
  var src_default = alpine_default;
  var module_default = src_default;

  // node_modules/idb/build/index.js
  var instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
  var idbProxyableTypes;
  var cursorAdvanceMethods;
  function getIdbProxyableTypes() {
    return idbProxyableTypes || (idbProxyableTypes = [
      IDBDatabase,
      IDBObjectStore,
      IDBIndex,
      IDBCursor,
      IDBTransaction
    ]);
  }
  function getCursorAdvanceMethods() {
    return cursorAdvanceMethods || (cursorAdvanceMethods = [
      IDBCursor.prototype.advance,
      IDBCursor.prototype.continue,
      IDBCursor.prototype.continuePrimaryKey
    ]);
  }
  var transactionDoneMap = /* @__PURE__ */ new WeakMap();
  var transformCache = /* @__PURE__ */ new WeakMap();
  var reverseTransformCache = /* @__PURE__ */ new WeakMap();
  function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
      const unlisten = () => {
        request.removeEventListener("success", success);
        request.removeEventListener("error", error2);
      };
      const success = () => {
        resolve(wrap(request.result));
        unlisten();
      };
      const error2 = () => {
        reject(request.error);
        unlisten();
      };
      request.addEventListener("success", success);
      request.addEventListener("error", error2);
    });
    reverseTransformCache.set(promise, request);
    return promise;
  }
  function cacheDonePromiseForTransaction(tx) {
    if (transactionDoneMap.has(tx))
      return;
    const done = new Promise((resolve, reject) => {
      const unlisten = () => {
        tx.removeEventListener("complete", complete);
        tx.removeEventListener("error", error2);
        tx.removeEventListener("abort", error2);
      };
      const complete = () => {
        resolve();
        unlisten();
      };
      const error2 = () => {
        reject(tx.error || new DOMException("AbortError", "AbortError"));
        unlisten();
      };
      tx.addEventListener("complete", complete);
      tx.addEventListener("error", error2);
      tx.addEventListener("abort", error2);
    });
    transactionDoneMap.set(tx, done);
  }
  var idbProxyTraps = {
    get(target, prop, receiver) {
      if (target instanceof IDBTransaction) {
        if (prop === "done")
          return transactionDoneMap.get(target);
        if (prop === "store") {
          return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
        }
      }
      return wrap(target[prop]);
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
    has(target, prop) {
      if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
        return true;
      }
      return prop in target;
    }
  };
  function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
  }
  function wrapFunction(func) {
    if (getCursorAdvanceMethods().includes(func)) {
      return function(...args) {
        func.apply(unwrap(this), args);
        return wrap(this.request);
      };
    }
    return function(...args) {
      return wrap(func.apply(unwrap(this), args));
    };
  }
  function transformCachableValue(value) {
    if (typeof value === "function")
      return wrapFunction(value);
    if (value instanceof IDBTransaction)
      cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
      return new Proxy(value, idbProxyTraps);
    return value;
  }
  function wrap(value) {
    if (value instanceof IDBRequest)
      return promisifyRequest(value);
    if (transformCache.has(value))
      return transformCache.get(value);
    const newValue = transformCachableValue(value);
    if (newValue !== value) {
      transformCache.set(value, newValue);
      reverseTransformCache.set(newValue, value);
    }
    return newValue;
  }
  var unwrap = (value) => reverseTransformCache.get(value);
  function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = wrap(request);
    if (upgrade) {
      request.addEventListener("upgradeneeded", (event) => {
        upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
      });
    }
    if (blocked) {
      request.addEventListener("blocked", (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion,
        event.newVersion,
        event
      ));
    }
    openPromise.then((db) => {
      if (terminated)
        db.addEventListener("close", () => terminated());
      if (blocking) {
        db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
      }
    }).catch(() => {
    });
    return openPromise;
  }
  function deleteDB(name, { blocked } = {}) {
    const request = indexedDB.deleteDatabase(name);
    if (blocked) {
      request.addEventListener("blocked", (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion,
        event
      ));
    }
    return wrap(request).then(() => void 0);
  }
  var readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
  var writeMethods = ["put", "add", "delete", "clear"];
  var cachedMethods = /* @__PURE__ */ new Map();
  function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
      return;
    }
    if (cachedMethods.get(prop))
      return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, "");
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
      // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
      !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
    ) {
      return;
    }
    const method = async function(storeName, ...args) {
      const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
      let target2 = tx.store;
      if (useIndex)
        target2 = target2.index(args.shift());
      return (await Promise.all([
        target2[targetFuncName](...args),
        isWrite && tx.done
      ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
  }
  replaceTraps((oldTraps) => ({
    ...oldTraps,
    get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
    has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
  }));
  var advanceMethodProps = ["continue", "continuePrimaryKey", "advance"];
  var methodMap = {};
  var advanceResults = /* @__PURE__ */ new WeakMap();
  var ittrProxiedCursorToOriginalProxy = /* @__PURE__ */ new WeakMap();
  var cursorIteratorTraps = {
    get(target, prop) {
      if (!advanceMethodProps.includes(prop))
        return target[prop];
      let cachedFunc = methodMap[prop];
      if (!cachedFunc) {
        cachedFunc = methodMap[prop] = function(...args) {
          advanceResults.set(this, ittrProxiedCursorToOriginalProxy.get(this)[prop](...args));
        };
      }
      return cachedFunc;
    }
  };
  async function* iterate(...args) {
    let cursor = this;
    if (!(cursor instanceof IDBCursor)) {
      cursor = await cursor.openCursor(...args);
    }
    if (!cursor)
      return;
    cursor = cursor;
    const proxiedCursor = new Proxy(cursor, cursorIteratorTraps);
    ittrProxiedCursorToOriginalProxy.set(proxiedCursor, cursor);
    reverseTransformCache.set(proxiedCursor, unwrap(cursor));
    while (cursor) {
      yield proxiedCursor;
      cursor = await (advanceResults.get(proxiedCursor) || cursor.continue());
      advanceResults.delete(proxiedCursor);
    }
  }
  function isIteratorProp(target, prop) {
    return prop === Symbol.asyncIterator && instanceOfAny(target, [IDBIndex, IDBObjectStore, IDBCursor]) || prop === "iterate" && instanceOfAny(target, [IDBIndex, IDBObjectStore]);
  }
  replaceTraps((oldTraps) => ({
    ...oldTraps,
    get(target, prop, receiver) {
      if (isIteratorProp(target, prop))
        return iterate;
      return oldTraps.get(target, prop, receiver);
    },
    has(target, prop) {
      return isIteratorProp(target, prop) || oldTraps.has(target, prop);
    }
  }));

  // src/utilities/db.js
  async function openEventsDb() {
    return await openDB("events", 1, {
      upgrade(db) {
        const events = db.createObjectStore("events", {
          keyPath: "event.id"
        });
        events.createIndex("pubkey", "event.pubkey");
        events.createIndex("created_at", "event.created_at");
        events.createIndex("kind", "event.kind");
        events.createIndex("host", "metadata.host");
      }
    });
  }
  async function sortByIndex(index, query, asc, max) {
    let db = await openEventsDb();
    let events = [];
    let cursor = await db.transaction("events").store.index(index).openCursor(query, asc ? "next" : "prev");
    while (cursor) {
      events.push(cursor.value);
      if (events.length >= max) {
        break;
      }
      cursor = await cursor.continue();
    }
    return events;
  }
  async function getHosts() {
    let db = await openEventsDb();
    let hosts = /* @__PURE__ */ new Set();
    let cursor = await db.transaction("events").store.openCursor();
    while (cursor) {
      hosts.add(cursor.value.metadata.host);
      cursor = await cursor.continue();
    }
    return [...hosts];
  }
  async function downloadAllContents() {
    let db = await openEventsDb();
    let events = [];
    let cursor = await db.transaction("events").store.openCursor();
    while (cursor) {
      events.push(cursor.value.event);
      cursor = await cursor.continue();
    }
    events = events.map((e) => JSON.stringify(e));
    events = events.join("\n");
    console.log(events);
    const file = new File([events], "events.jsonl", {
      type: "application/octet-stream"
    });
    const blob = new Blob([events], { type: "plain/text" });
    return blob;
  }

  // src/utilities/browser-polyfill.js
  var _browser = typeof browser !== "undefined" ? browser : typeof chrome !== "undefined" ? chrome : null;
  if (!_browser) {
    throw new Error("browser-polyfill: No extension API namespace found (neither browser nor chrome).");
  }
  var isChrome = typeof browser === "undefined" && typeof chrome !== "undefined";
  function promisify(context, method) {
    return (...args) => {
      try {
        const result = method.apply(context, args);
        if (result && typeof result.then === "function") {
          return result;
        }
      } catch (_) {
      }
      return new Promise((resolve, reject) => {
        method.apply(context, [
          ...args,
          (...cbArgs) => {
            if (_browser.runtime && _browser.runtime.lastError) {
              reject(new Error(_browser.runtime.lastError.message));
            } else {
              resolve(cbArgs.length <= 1 ? cbArgs[0] : cbArgs);
            }
          }
        ]);
      });
    };
  }
  var api = {};
  api.runtime = {
    /**
     * sendMessage – always returns a Promise.
     */
    sendMessage(...args) {
      if (!isChrome) {
        return _browser.runtime.sendMessage(...args);
      }
      return promisify(_browser.runtime, _browser.runtime.sendMessage)(...args);
    },
    /**
     * onMessage – thin wrapper so callers use a consistent reference.
     * The listener signature is (message, sender, sendResponse).
     * On Chrome the listener can return `true` to keep the channel open,
     * or return a Promise (MV3).  Safari / Firefox expect a Promise return.
     */
    onMessage: _browser.runtime.onMessage,
    /**
     * getURL – synchronous on all browsers.
     */
    getURL(path) {
      return _browser.runtime.getURL(path);
    },
    /**
     * openOptionsPage
     */
    openOptionsPage() {
      if (!isChrome) {
        return _browser.runtime.openOptionsPage();
      }
      return promisify(_browser.runtime, _browser.runtime.openOptionsPage)();
    },
    /**
     * Expose the id for convenience.
     */
    get id() {
      return _browser.runtime.id;
    }
  };
  api.storage = {
    local: {
      get(...args) {
        if (!isChrome) {
          return _browser.storage.local.get(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.get)(...args);
      },
      set(...args) {
        if (!isChrome) {
          return _browser.storage.local.set(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.set)(...args);
      },
      clear(...args) {
        if (!isChrome) {
          return _browser.storage.local.clear(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.clear)(...args);
      },
      remove(...args) {
        if (!isChrome) {
          return _browser.storage.local.remove(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.remove)(...args);
      }
    }
  };
  api.tabs = {
    create(...args) {
      if (!isChrome) {
        return _browser.tabs.create(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.create)(...args);
    },
    query(...args) {
      if (!isChrome) {
        return _browser.tabs.query(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.query)(...args);
    },
    remove(...args) {
      if (!isChrome) {
        return _browser.tabs.remove(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.remove)(...args);
    },
    update(...args) {
      if (!isChrome) {
        return _browser.tabs.update(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.update)(...args);
    },
    get(...args) {
      if (!isChrome) {
        return _browser.tabs.get(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.get)(...args);
    },
    getCurrent(...args) {
      if (!isChrome) {
        return _browser.tabs.getCurrent(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.getCurrent)(...args);
    }
  };

  // src/utilities/utils.js
  var storage = api.storage.local;
  var RECOMMENDED_RELAYS = [
    new URL("wss://relay.damus.io"),
    new URL("wss://relay.primal.net"),
    new URL("wss://relay.snort.social"),
    new URL("wss://relay.getalby.com/v1"),
    new URL("wss://nos.lol"),
    new URL("wss://brb.io"),
    new URL("wss://nostr.orangepill.dev")
  ];
  var KINDS = [
    [0, "Metadata", "https://github.com/nostr-protocol/nips/blob/master/01.md"],
    [1, "Text", "https://github.com/nostr-protocol/nips/blob/master/01.md"],
    [2, "Recommend Relay", "https://github.com/nostr-protocol/nips/blob/master/01.md"],
    [3, "Contacts", "https://github.com/nostr-protocol/nips/blob/master/02.md"],
    [4, "Encrypted Direct Messages", "https://github.com/nostr-protocol/nips/blob/master/04.md"],
    [5, "Event Deletion", "https://github.com/nostr-protocol/nips/blob/master/09.md"],
    [6, "Repost", "https://github.com/nostr-protocol/nips/blob/master/18.md"],
    [7, "Reaction", "https://github.com/nostr-protocol/nips/blob/master/25.md"],
    [8, "Badge Award", "https://github.com/nostr-protocol/nips/blob/master/58.md"],
    [16, "Generic Repost", "https://github.com/nostr-protocol/nips/blob/master/18.md"],
    [40, "Channel Creation", "https://github.com/nostr-protocol/nips/blob/master/28.md"],
    [41, "Channel Metadata", "https://github.com/nostr-protocol/nips/blob/master/28.md"],
    [42, "Channel Message", "https://github.com/nostr-protocol/nips/blob/master/28.md"],
    [43, "Channel Hide Message", "https://github.com/nostr-protocol/nips/blob/master/28.md"],
    [44, "Channel Mute User", "https://github.com/nostr-protocol/nips/blob/master/28.md"],
    [1063, "File Metadata", "https://github.com/nostr-protocol/nips/blob/master/94.md"],
    [1311, "Live Chat Message", "https://github.com/nostr-protocol/nips/blob/master/53.md"],
    [1984, "Reporting", "https://github.com/nostr-protocol/nips/blob/master/56.md"],
    [1985, "Label", "https://github.com/nostr-protocol/nips/blob/master/32.md"],
    [4550, "Community Post Approval", "https://github.com/nostr-protocol/nips/blob/master/72.md"],
    [7e3, "Job Feedback", "https://github.com/nostr-protocol/nips/blob/master/90.md"],
    [9041, "Zap Goal", "https://github.com/nostr-protocol/nips/blob/master/75.md"],
    [9734, "Zap Request", "https://github.com/nostr-protocol/nips/blob/master/57.md"],
    [9735, "Zap", "https://github.com/nostr-protocol/nips/blob/master/57.md"],
    [1e4, "Mute List", "https://github.com/nostr-protocol/nips/blob/master/51.md"],
    [10001, "Pin List", "https://github.com/nostr-protocol/nips/blob/master/51.md"],
    [10002, "Relay List Metadata", "https://github.com/nostr-protocol/nips/blob/master/65.md"],
    [13194, "Wallet Info", "https://github.com/nostr-protocol/nips/blob/master/47.md"],
    [22242, "Client Authentication", "https://github.com/nostr-protocol/nips/blob/master/42.md"],
    [23194, "Wallet Request", "https://github.com/nostr-protocol/nips/blob/master/47.md"],
    [23195, "Wallet Response", "https://github.com/nostr-protocol/nips/blob/master/47.md"],
    [24133, "Nostr Connect", "https://github.com/nostr-protocol/nips/blob/master/46.md"],
    [27235, "HTTP Auth", "https://github.com/nostr-protocol/nips/blob/master/98.md"],
    [3e4, "Categorized People List", "https://github.com/nostr-protocol/nips/blob/master/51.md"],
    [30001, "Categorized Bookmark List", "https://github.com/nostr-protocol/nips/blob/master/51.md"],
    [30008, "Profile Badges", "https://github.com/nostr-protocol/nips/blob/master/58.md"],
    [30009, "Badge Definition", "https://github.com/nostr-protocol/nips/blob/master/58.md"],
    [30017, "Create or update a stall", "https://github.com/nostr-protocol/nips/blob/master/15.md"],
    [30018, "Create or update a product", "https://github.com/nostr-protocol/nips/blob/master/15.md"],
    [30023, "Long-Form Content", "https://github.com/nostr-protocol/nips/blob/master/23.md"],
    [30024, "Draft Long-form Content", "https://github.com/nostr-protocol/nips/blob/master/23.md"],
    [30078, "Application-specific Data", "https://github.com/nostr-protocol/nips/blob/master/78.md"],
    [30311, "Live Event", "https://github.com/nostr-protocol/nips/blob/master/53.md"],
    [30315, "User Statuses", "https://github.com/nostr-protocol/nips/blob/master/38.md"],
    [30402, "Classified Listing", "https://github.com/nostr-protocol/nips/blob/master/99.md"],
    [30403, "Draft Classified Listing", "https://github.com/nostr-protocol/nips/blob/master/99.md"],
    [31922, "Date-Based Calendar Event", "https://github.com/nostr-protocol/nips/blob/master/52.md"],
    [31923, "Time-Based Calendar Event", "https://github.com/nostr-protocol/nips/blob/master/52.md"],
    [31924, "Calendar", "https://github.com/nostr-protocol/nips/blob/master/52.md"],
    [31925, "Calendar Event RSVP", "https://github.com/nostr-protocol/nips/blob/master/52.md"],
    [31989, "Handler recommendation", "https://github.com/nostr-protocol/nips/blob/master/89.md"],
    [31990, "Handler information", "https://github.com/nostr-protocol/nips/blob/master/89.md"],
    [34550, "Community Definition", "https://github.com/nostr-protocol/nips/blob/master/72.md"]
  ];
  async function getProfiles() {
    let profiles = await storage.get({ profiles: [] });
    return profiles.profiles;
  }

  // src/event_history/event_history.js
  var TOMORROW = /* @__PURE__ */ new Date();
  TOMORROW.setDate(TOMORROW.getDate() + 1);
  module_default.data("eventLog", () => ({
    kinds: KINDS,
    events: [],
    view: "created_at",
    max: 100,
    sort: "asc",
    allHosts: [],
    host: "",
    allProfiles: [],
    profile: "",
    pubkey: "",
    selected: null,
    copied: false,
    // date view
    fromCreatedAt: "2008-10-31",
    toCreatedAt: TOMORROW.toISOString().split("T")[0],
    // kind view
    quickKind: "",
    fromKind: 0,
    toKind: 5e4,
    async init() {
      await this.reload();
    },
    async reload() {
      let events = await sortByIndex(
        this.view,
        this.keyRange,
        this.sort === "asc",
        this.max
      );
      this.events = events.map((e) => ({ ...e, copied: false }));
      getHosts().then((hosts) => this.allHosts = hosts);
      const profiles = await getProfiles();
      this.allProfiles = await Promise.all(
        profiles.map(async (profile, index) => ({
          name: profile.name,
          pubkey: await api.runtime.sendMessage({
            kind: "getNpub",
            payload: index
          })
        }))
      );
    },
    async saveAll() {
      const file = await downloadAllContents();
      api.tabs.create({
        url: URL.createObjectURL(file),
        active: true
      });
    },
    async deleteAll() {
      if (confirm("Are you sure you want to delete ALL events?")) {
        await deleteDB("events");
        await this.reload();
      }
    },
    quickKindSelect() {
      if (this.quickKind === "") return;
      const i = parseInt(this.quickKind);
      this.fromKind = i;
      this.toKind = i;
      this.reload();
    },
    pkFromProfile() {
      this.pubkey = this.allProfiles.find(
        ({ name }) => name === this.profile
      ).pubkey;
      this.reload();
    },
    highlight(event) {
      return JSON.stringify(event, null, 2);
    },
    formatDate(epochSeconds) {
      return new Date(epochSeconds * 1e3).toUTCString();
    },
    formatKind(kind) {
      const k = KINDS.find(([kNum, _]) => kNum === kind);
      return k ? `${k[1]} (${kind})` : `Unknown (${kind})`;
    },
    async copyEvent(index) {
      let event = JSON.stringify(this.events[index]);
      this.copied = true;
      setTimeout(() => this.copied = false, 1e3);
      await navigator.clipboard.writeText(event);
    },
    // Properties
    get fromTime() {
      let dt = new Date(this.fromCreatedAt);
      return Math.floor(dt.getTime() / 1e3);
    },
    get toTime() {
      let dt = new Date(this.toCreatedAt);
      return Math.floor(dt.getTime() / 1e3);
    },
    get profileNames() {
      return this.allProfiles.map((p) => p.name);
    },
    get keyRange() {
      switch (this.view) {
        case "created_at":
          return IDBKeyRange.bound(this.fromTime, this.toTime);
        case "kind":
          return IDBKeyRange.bound(this.fromKind, this.toKind);
        case "host":
          if (this.host.length === 0) return null;
          return IDBKeyRange.only(this.host);
        case "pubkey":
          if (this.pubkey.length === 0) return null;
          return IDBKeyRange.only(this.pubkey);
        default:
          return null;
      }
    }
  }));
  module_default.start();
  document.getElementById("close-btn")?.addEventListener("click", () => {
    window.close();
    chrome.tabs?.getCurrent?.((t) => chrome.tabs.remove(t.id));
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BhbHBpbmVqcy9jc3AvZGlzdC9tb2R1bGUuZXNtLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9kYi5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy91dGlscy5qcyIsICIuLi8uLi8uLi9zcmMvZXZlbnRfaGlzdG9yeS9ldmVudF9oaXN0b3J5LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvc2NoZWR1bGVyLmpzXG52YXIgZmx1c2hQZW5kaW5nID0gZmFsc2U7XG52YXIgZmx1c2hpbmcgPSBmYWxzZTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGxhc3RGbHVzaGVkSW5kZXggPSAtMTtcbnZhciB0cmFuc2FjdGlvbkFjdGl2ZSA9IGZhbHNlO1xuZnVuY3Rpb24gc2NoZWR1bGVyKGNhbGxiYWNrKSB7XG4gIHF1ZXVlSm9iKGNhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIHN0YXJ0VHJhbnNhY3Rpb24oKSB7XG4gIHRyYW5zYWN0aW9uQWN0aXZlID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGNvbW1pdFRyYW5zYWN0aW9uKCkge1xuICB0cmFuc2FjdGlvbkFjdGl2ZSA9IGZhbHNlO1xuICBxdWV1ZUZsdXNoKCk7XG59XG5mdW5jdGlvbiBxdWV1ZUpvYihqb2IpIHtcbiAgaWYgKCFxdWV1ZS5pbmNsdWRlcyhqb2IpKVxuICAgIHF1ZXVlLnB1c2goam9iKTtcbiAgcXVldWVGbHVzaCgpO1xufVxuZnVuY3Rpb24gZGVxdWV1ZUpvYihqb2IpIHtcbiAgbGV0IGluZGV4ID0gcXVldWUuaW5kZXhPZihqb2IpO1xuICBpZiAoaW5kZXggIT09IC0xICYmIGluZGV4ID4gbGFzdEZsdXNoZWRJbmRleClcbiAgICBxdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xufVxuZnVuY3Rpb24gcXVldWVGbHVzaCgpIHtcbiAgaWYgKCFmbHVzaGluZyAmJiAhZmx1c2hQZW5kaW5nKSB7XG4gICAgaWYgKHRyYW5zYWN0aW9uQWN0aXZlKVxuICAgICAgcmV0dXJuO1xuICAgIGZsdXNoUGVuZGluZyA9IHRydWU7XG4gICAgcXVldWVNaWNyb3Rhc2soZmx1c2hKb2JzKTtcbiAgfVxufVxuZnVuY3Rpb24gZmx1c2hKb2JzKCkge1xuICBmbHVzaFBlbmRpbmcgPSBmYWxzZTtcbiAgZmx1c2hpbmcgPSB0cnVlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgcXVldWVbaV0oKTtcbiAgICBsYXN0Rmx1c2hlZEluZGV4ID0gaTtcbiAgfVxuICBxdWV1ZS5sZW5ndGggPSAwO1xuICBsYXN0Rmx1c2hlZEluZGV4ID0gLTE7XG4gIGZsdXNoaW5nID0gZmFsc2U7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9yZWFjdGl2aXR5LmpzXG52YXIgcmVhY3RpdmU7XG52YXIgZWZmZWN0O1xudmFyIHJlbGVhc2U7XG52YXIgcmF3O1xudmFyIHNob3VsZFNjaGVkdWxlID0gdHJ1ZTtcbmZ1bmN0aW9uIGRpc2FibGVFZmZlY3RTY2hlZHVsaW5nKGNhbGxiYWNrKSB7XG4gIHNob3VsZFNjaGVkdWxlID0gZmFsc2U7XG4gIGNhbGxiYWNrKCk7XG4gIHNob3VsZFNjaGVkdWxlID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIHNldFJlYWN0aXZpdHlFbmdpbmUoZW5naW5lKSB7XG4gIHJlYWN0aXZlID0gZW5naW5lLnJlYWN0aXZlO1xuICByZWxlYXNlID0gZW5naW5lLnJlbGVhc2U7XG4gIGVmZmVjdCA9IChjYWxsYmFjaykgPT4gZW5naW5lLmVmZmVjdChjYWxsYmFjaywgeyBzY2hlZHVsZXI6ICh0YXNrKSA9PiB7XG4gICAgaWYgKHNob3VsZFNjaGVkdWxlKSB7XG4gICAgICBzY2hlZHVsZXIodGFzayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhc2soKTtcbiAgICB9XG4gIH0gfSk7XG4gIHJhdyA9IGVuZ2luZS5yYXc7XG59XG5mdW5jdGlvbiBvdmVycmlkZUVmZmVjdChvdmVycmlkZSkge1xuICBlZmZlY3QgPSBvdmVycmlkZTtcbn1cbmZ1bmN0aW9uIGVsZW1lbnRCb3VuZEVmZmVjdChlbCkge1xuICBsZXQgY2xlYW51cDIgPSAoKSA9PiB7XG4gIH07XG4gIGxldCB3cmFwcGVkRWZmZWN0ID0gKGNhbGxiYWNrKSA9PiB7XG4gICAgbGV0IGVmZmVjdFJlZmVyZW5jZSA9IGVmZmVjdChjYWxsYmFjayk7XG4gICAgaWYgKCFlbC5feF9lZmZlY3RzKSB7XG4gICAgICBlbC5feF9lZmZlY3RzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgICAgIGVsLl94X3J1bkVmZmVjdHMgPSAoKSA9PiB7XG4gICAgICAgIGVsLl94X2VmZmVjdHMuZm9yRWFjaCgoaSkgPT4gaSgpKTtcbiAgICAgIH07XG4gICAgfVxuICAgIGVsLl94X2VmZmVjdHMuYWRkKGVmZmVjdFJlZmVyZW5jZSk7XG4gICAgY2xlYW51cDIgPSAoKSA9PiB7XG4gICAgICBpZiAoZWZmZWN0UmVmZXJlbmNlID09PSB2b2lkIDApXG4gICAgICAgIHJldHVybjtcbiAgICAgIGVsLl94X2VmZmVjdHMuZGVsZXRlKGVmZmVjdFJlZmVyZW5jZSk7XG4gICAgICByZWxlYXNlKGVmZmVjdFJlZmVyZW5jZSk7XG4gICAgfTtcbiAgICByZXR1cm4gZWZmZWN0UmVmZXJlbmNlO1xuICB9O1xuICByZXR1cm4gW3dyYXBwZWRFZmZlY3QsICgpID0+IHtcbiAgICBjbGVhbnVwMigpO1xuICB9XTtcbn1cbmZ1bmN0aW9uIHdhdGNoKGdldHRlciwgY2FsbGJhY2spIHtcbiAgbGV0IGZpcnN0VGltZSA9IHRydWU7XG4gIGxldCBvbGRWYWx1ZTtcbiAgbGV0IGVmZmVjdFJlZmVyZW5jZSA9IGVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IHZhbHVlID0gZ2V0dGVyKCk7XG4gICAgSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIGlmICghZmlyc3RUaW1lKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiIHx8IHZhbHVlICE9PSBvbGRWYWx1ZSkge1xuICAgICAgICBsZXQgcHJldmlvdXNWYWx1ZSA9IG9sZFZhbHVlO1xuICAgICAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgICAgICAgY2FsbGJhY2sodmFsdWUsIHByZXZpb3VzVmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgb2xkVmFsdWUgPSB2YWx1ZTtcbiAgICBmaXJzdFRpbWUgPSBmYWxzZTtcbiAgfSk7XG4gIHJldHVybiAoKSA9PiByZWxlYXNlKGVmZmVjdFJlZmVyZW5jZSk7XG59XG5hc3luYyBmdW5jdGlvbiB0cmFuc2FjdGlvbihjYWxsYmFjaykge1xuICBzdGFydFRyYW5zYWN0aW9uKCk7XG4gIHRyeSB7XG4gICAgYXdhaXQgY2FsbGJhY2soKTtcbiAgICBhd2FpdCBQcm9taXNlLnJlc29sdmUoKTtcbiAgfSBmaW5hbGx5IHtcbiAgICBjb21taXRUcmFuc2FjdGlvbigpO1xuICB9XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tdXRhdGlvbi5qc1xudmFyIG9uQXR0cmlidXRlQWRkZWRzID0gW107XG52YXIgb25FbFJlbW92ZWRzID0gW107XG52YXIgb25FbEFkZGVkcyA9IFtdO1xuZnVuY3Rpb24gb25FbEFkZGVkKGNhbGxiYWNrKSB7XG4gIG9uRWxBZGRlZHMucHVzaChjYWxsYmFjayk7XG59XG5mdW5jdGlvbiBvbkVsUmVtb3ZlZChlbCwgY2FsbGJhY2spIHtcbiAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgaWYgKCFlbC5feF9jbGVhbnVwcylcbiAgICAgIGVsLl94X2NsZWFudXBzID0gW107XG4gICAgZWwuX3hfY2xlYW51cHMucHVzaChjYWxsYmFjayk7XG4gIH0gZWxzZSB7XG4gICAgY2FsbGJhY2sgPSBlbDtcbiAgICBvbkVsUmVtb3ZlZHMucHVzaChjYWxsYmFjayk7XG4gIH1cbn1cbmZ1bmN0aW9uIG9uQXR0cmlidXRlc0FkZGVkKGNhbGxiYWNrKSB7XG4gIG9uQXR0cmlidXRlQWRkZWRzLnB1c2goY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gb25BdHRyaWJ1dGVSZW1vdmVkKGVsLCBuYW1lLCBjYWxsYmFjaykge1xuICBpZiAoIWVsLl94X2F0dHJpYnV0ZUNsZWFudXBzKVxuICAgIGVsLl94X2F0dHJpYnV0ZUNsZWFudXBzID0ge307XG4gIGlmICghZWwuX3hfYXR0cmlidXRlQ2xlYW51cHNbbmFtZV0pXG4gICAgZWwuX3hfYXR0cmlidXRlQ2xlYW51cHNbbmFtZV0gPSBbXTtcbiAgZWwuX3hfYXR0cmlidXRlQ2xlYW51cHNbbmFtZV0ucHVzaChjYWxsYmFjayk7XG59XG5mdW5jdGlvbiBjbGVhbnVwQXR0cmlidXRlcyhlbCwgbmFtZXMpIHtcbiAgaWYgKCFlbC5feF9hdHRyaWJ1dGVDbGVhbnVwcylcbiAgICByZXR1cm47XG4gIE9iamVjdC5lbnRyaWVzKGVsLl94X2F0dHJpYnV0ZUNsZWFudXBzKS5mb3JFYWNoKChbbmFtZSwgdmFsdWVdKSA9PiB7XG4gICAgaWYgKG5hbWVzID09PSB2b2lkIDAgfHwgbmFtZXMuaW5jbHVkZXMobmFtZSkpIHtcbiAgICAgIHZhbHVlLmZvckVhY2goKGkpID0+IGkoKSk7XG4gICAgICBkZWxldGUgZWwuX3hfYXR0cmlidXRlQ2xlYW51cHNbbmFtZV07XG4gICAgfVxuICB9KTtcbn1cbmZ1bmN0aW9uIGNsZWFudXBFbGVtZW50KGVsKSB7XG4gIGVsLl94X2VmZmVjdHM/LmZvckVhY2goZGVxdWV1ZUpvYik7XG4gIHdoaWxlIChlbC5feF9jbGVhbnVwcz8ubGVuZ3RoKVxuICAgIGVsLl94X2NsZWFudXBzLnBvcCgpKCk7XG59XG52YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihvbk11dGF0ZSk7XG52YXIgY3VycmVudGx5T2JzZXJ2aW5nID0gZmFsc2U7XG5mdW5jdGlvbiBzdGFydE9ic2VydmluZ011dGF0aW9ucygpIHtcbiAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwgeyBzdWJ0cmVlOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGF0dHJpYnV0ZXM6IHRydWUsIGF0dHJpYnV0ZU9sZFZhbHVlOiB0cnVlIH0pO1xuICBjdXJyZW50bHlPYnNlcnZpbmcgPSB0cnVlO1xufVxuZnVuY3Rpb24gc3RvcE9ic2VydmluZ011dGF0aW9ucygpIHtcbiAgZmx1c2hPYnNlcnZlcigpO1xuICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gIGN1cnJlbnRseU9ic2VydmluZyA9IGZhbHNlO1xufVxudmFyIHF1ZXVlZE11dGF0aW9ucyA9IFtdO1xuZnVuY3Rpb24gZmx1c2hPYnNlcnZlcigpIHtcbiAgbGV0IHJlY29yZHMgPSBvYnNlcnZlci50YWtlUmVjb3JkcygpO1xuICBxdWV1ZWRNdXRhdGlvbnMucHVzaCgoKSA9PiByZWNvcmRzLmxlbmd0aCA+IDAgJiYgb25NdXRhdGUocmVjb3JkcykpO1xuICBsZXQgcXVldWVMZW5ndGhXaGVuVHJpZ2dlcmVkID0gcXVldWVkTXV0YXRpb25zLmxlbmd0aDtcbiAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgIGlmIChxdWV1ZWRNdXRhdGlvbnMubGVuZ3RoID09PSBxdWV1ZUxlbmd0aFdoZW5UcmlnZ2VyZWQpIHtcbiAgICAgIHdoaWxlIChxdWV1ZWRNdXRhdGlvbnMubGVuZ3RoID4gMClcbiAgICAgICAgcXVldWVkTXV0YXRpb25zLnNoaWZ0KCkoKTtcbiAgICB9XG4gIH0pO1xufVxuZnVuY3Rpb24gbXV0YXRlRG9tKGNhbGxiYWNrKSB7XG4gIGlmICghY3VycmVudGx5T2JzZXJ2aW5nKVxuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICBzdG9wT2JzZXJ2aW5nTXV0YXRpb25zKCk7XG4gIGxldCByZXN1bHQgPSBjYWxsYmFjaygpO1xuICBzdGFydE9ic2VydmluZ011dGF0aW9ucygpO1xuICByZXR1cm4gcmVzdWx0O1xufVxudmFyIGlzQ29sbGVjdGluZyA9IGZhbHNlO1xudmFyIGRlZmVycmVkTXV0YXRpb25zID0gW107XG5mdW5jdGlvbiBkZWZlck11dGF0aW9ucygpIHtcbiAgaXNDb2xsZWN0aW5nID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGZsdXNoQW5kU3RvcERlZmVycmluZ011dGF0aW9ucygpIHtcbiAgaXNDb2xsZWN0aW5nID0gZmFsc2U7XG4gIG9uTXV0YXRlKGRlZmVycmVkTXV0YXRpb25zKTtcbiAgZGVmZXJyZWRNdXRhdGlvbnMgPSBbXTtcbn1cbmZ1bmN0aW9uIG9uTXV0YXRlKG11dGF0aW9ucykge1xuICBpZiAoaXNDb2xsZWN0aW5nKSB7XG4gICAgZGVmZXJyZWRNdXRhdGlvbnMgPSBkZWZlcnJlZE11dGF0aW9ucy5jb25jYXQobXV0YXRpb25zKTtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGFkZGVkTm9kZXMgPSBbXTtcbiAgbGV0IHJlbW92ZWROb2RlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGxldCBhZGRlZEF0dHJpYnV0ZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBsZXQgcmVtb3ZlZEF0dHJpYnV0ZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG11dGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChtdXRhdGlvbnNbaV0udGFyZ2V0Ll94X2lnbm9yZU11dGF0aW9uT2JzZXJ2ZXIpXG4gICAgICBjb250aW51ZTtcbiAgICBpZiAobXV0YXRpb25zW2ldLnR5cGUgPT09IFwiY2hpbGRMaXN0XCIpIHtcbiAgICAgIG11dGF0aW9uc1tpXS5yZW1vdmVkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSAhPT0gMSlcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICghbm9kZS5feF9tYXJrZXIpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICByZW1vdmVkTm9kZXMuYWRkKG5vZGUpO1xuICAgICAgfSk7XG4gICAgICBtdXRhdGlvbnNbaV0uYWRkZWROb2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlICE9PSAxKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaWYgKHJlbW92ZWROb2Rlcy5oYXMobm9kZSkpIHtcbiAgICAgICAgICByZW1vdmVkTm9kZXMuZGVsZXRlKG5vZGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZS5feF9tYXJrZXIpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBhZGRlZE5vZGVzLnB1c2gobm9kZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKG11dGF0aW9uc1tpXS50eXBlID09PSBcImF0dHJpYnV0ZXNcIikge1xuICAgICAgbGV0IGVsID0gbXV0YXRpb25zW2ldLnRhcmdldDtcbiAgICAgIGxldCBuYW1lID0gbXV0YXRpb25zW2ldLmF0dHJpYnV0ZU5hbWU7XG4gICAgICBsZXQgb2xkVmFsdWUgPSBtdXRhdGlvbnNbaV0ub2xkVmFsdWU7XG4gICAgICBsZXQgYWRkMiA9ICgpID0+IHtcbiAgICAgICAgaWYgKCFhZGRlZEF0dHJpYnV0ZXMuaGFzKGVsKSlcbiAgICAgICAgICBhZGRlZEF0dHJpYnV0ZXMuc2V0KGVsLCBbXSk7XG4gICAgICAgIGFkZGVkQXR0cmlidXRlcy5nZXQoZWwpLnB1c2goeyBuYW1lLCB2YWx1ZTogZWwuZ2V0QXR0cmlidXRlKG5hbWUpIH0pO1xuICAgICAgfTtcbiAgICAgIGxldCByZW1vdmUgPSAoKSA9PiB7XG4gICAgICAgIGlmICghcmVtb3ZlZEF0dHJpYnV0ZXMuaGFzKGVsKSlcbiAgICAgICAgICByZW1vdmVkQXR0cmlidXRlcy5zZXQoZWwsIFtdKTtcbiAgICAgICAgcmVtb3ZlZEF0dHJpYnV0ZXMuZ2V0KGVsKS5wdXNoKG5hbWUpO1xuICAgICAgfTtcbiAgICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUobmFtZSkgJiYgb2xkVmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgYWRkMigpO1xuICAgICAgfSBlbHNlIGlmIChlbC5oYXNBdHRyaWJ1dGUobmFtZSkpIHtcbiAgICAgICAgcmVtb3ZlKCk7XG4gICAgICAgIGFkZDIoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlbW92ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZW1vdmVkQXR0cmlidXRlcy5mb3JFYWNoKChhdHRycywgZWwpID0+IHtcbiAgICBjbGVhbnVwQXR0cmlidXRlcyhlbCwgYXR0cnMpO1xuICB9KTtcbiAgYWRkZWRBdHRyaWJ1dGVzLmZvckVhY2goKGF0dHJzLCBlbCkgPT4ge1xuICAgIG9uQXR0cmlidXRlQWRkZWRzLmZvckVhY2goKGkpID0+IGkoZWwsIGF0dHJzKSk7XG4gIH0pO1xuICBmb3IgKGxldCBub2RlIG9mIHJlbW92ZWROb2Rlcykge1xuICAgIGlmIChhZGRlZE5vZGVzLnNvbWUoKGkpID0+IGkuY29udGFpbnMobm9kZSkpKVxuICAgICAgY29udGludWU7XG4gICAgb25FbFJlbW92ZWRzLmZvckVhY2goKGkpID0+IGkobm9kZSkpO1xuICB9XG4gIGZvciAobGV0IG5vZGUgb2YgYWRkZWROb2Rlcykge1xuICAgIGlmICghbm9kZS5pc0Nvbm5lY3RlZClcbiAgICAgIGNvbnRpbnVlO1xuICAgIG9uRWxBZGRlZHMuZm9yRWFjaCgoaSkgPT4gaShub2RlKSk7XG4gIH1cbiAgYWRkZWROb2RlcyA9IG51bGw7XG4gIHJlbW92ZWROb2RlcyA9IG51bGw7XG4gIGFkZGVkQXR0cmlidXRlcyA9IG51bGw7XG4gIHJlbW92ZWRBdHRyaWJ1dGVzID0gbnVsbDtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3Njb3BlLmpzXG5mdW5jdGlvbiBzY29wZShub2RlKSB7XG4gIHJldHVybiBtZXJnZVByb3hpZXMoY2xvc2VzdERhdGFTdGFjayhub2RlKSk7XG59XG5mdW5jdGlvbiBhZGRTY29wZVRvTm9kZShub2RlLCBkYXRhMiwgcmVmZXJlbmNlTm9kZSkge1xuICBub2RlLl94X2RhdGFTdGFjayA9IFtkYXRhMiwgLi4uY2xvc2VzdERhdGFTdGFjayhyZWZlcmVuY2VOb2RlIHx8IG5vZGUpXTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBub2RlLl94X2RhdGFTdGFjayA9IG5vZGUuX3hfZGF0YVN0YWNrLmZpbHRlcigoaSkgPT4gaSAhPT0gZGF0YTIpO1xuICB9O1xufVxuZnVuY3Rpb24gY2xvc2VzdERhdGFTdGFjayhub2RlKSB7XG4gIGlmIChub2RlLl94X2RhdGFTdGFjaylcbiAgICByZXR1cm4gbm9kZS5feF9kYXRhU3RhY2s7XG4gIGlmICh0eXBlb2YgU2hhZG93Um9vdCA9PT0gXCJmdW5jdGlvblwiICYmIG5vZGUgaW5zdGFuY2VvZiBTaGFkb3dSb290KSB7XG4gICAgcmV0dXJuIGNsb3Nlc3REYXRhU3RhY2sobm9kZS5ob3N0KTtcbiAgfVxuICBpZiAoIW5vZGUucGFyZW50Tm9kZSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICByZXR1cm4gY2xvc2VzdERhdGFTdGFjayhub2RlLnBhcmVudE5vZGUpO1xufVxuZnVuY3Rpb24gbWVyZ2VQcm94aWVzKG9iamVjdHMpIHtcbiAgcmV0dXJuIG5ldyBQcm94eSh7IG9iamVjdHMgfSwgbWVyZ2VQcm94eVRyYXApO1xufVxudmFyIG1lcmdlUHJveHlUcmFwID0ge1xuICBvd25LZXlzKHsgb2JqZWN0cyB9KSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oXG4gICAgICBuZXcgU2V0KG9iamVjdHMuZmxhdE1hcCgoaSkgPT4gT2JqZWN0LmtleXMoaSkpKVxuICAgICk7XG4gIH0sXG4gIGhhcyh7IG9iamVjdHMgfSwgbmFtZSkge1xuICAgIGlmIChuYW1lID09IFN5bWJvbC51bnNjb3BhYmxlcylcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gb2JqZWN0cy5zb21lKFxuICAgICAgKG9iaikgPT4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgbmFtZSkgfHwgUmVmbGVjdC5oYXMob2JqLCBuYW1lKVxuICAgICk7XG4gIH0sXG4gIGdldCh7IG9iamVjdHMgfSwgbmFtZSwgdGhpc1Byb3h5KSB7XG4gICAgaWYgKG5hbWUgPT0gXCJ0b0pTT05cIilcbiAgICAgIHJldHVybiBjb2xsYXBzZVByb3hpZXM7XG4gICAgcmV0dXJuIFJlZmxlY3QuZ2V0KFxuICAgICAgb2JqZWN0cy5maW5kKFxuICAgICAgICAob2JqKSA9PiBSZWZsZWN0LmhhcyhvYmosIG5hbWUpXG4gICAgICApIHx8IHt9LFxuICAgICAgbmFtZSxcbiAgICAgIHRoaXNQcm94eVxuICAgICk7XG4gIH0sXG4gIHNldCh7IG9iamVjdHMgfSwgbmFtZSwgdmFsdWUsIHRoaXNQcm94eSkge1xuICAgIGNvbnN0IHRhcmdldCA9IG9iamVjdHMuZmluZChcbiAgICAgIChvYmopID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIG5hbWUpXG4gICAgKSB8fCBvYmplY3RzW29iamVjdHMubGVuZ3RoIC0gMV07XG4gICAgY29uc3QgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBuYW1lKTtcbiAgICBpZiAoZGVzY3JpcHRvcj8uc2V0ICYmIGRlc2NyaXB0b3I/LmdldClcbiAgICAgIHJldHVybiBkZXNjcmlwdG9yLnNldC5jYWxsKHRoaXNQcm94eSwgdmFsdWUpIHx8IHRydWU7XG4gICAgcmV0dXJuIFJlZmxlY3Quc2V0KHRhcmdldCwgbmFtZSwgdmFsdWUpO1xuICB9XG59O1xuZnVuY3Rpb24gY29sbGFwc2VQcm94aWVzKCkge1xuICBsZXQga2V5cyA9IFJlZmxlY3Qub3duS2V5cyh0aGlzKTtcbiAgcmV0dXJuIGtleXMucmVkdWNlKChhY2MsIGtleSkgPT4ge1xuICAgIGFjY1trZXldID0gUmVmbGVjdC5nZXQodGhpcywga2V5KTtcbiAgICByZXR1cm4gYWNjO1xuICB9LCB7fSk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9pbnRlcmNlcHRvci5qc1xuZnVuY3Rpb24gaW5pdEludGVyY2VwdG9ycyhkYXRhMikge1xuICBsZXQgaXNPYmplY3QyID0gKHZhbCkgPT4gdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheSh2YWwpICYmIHZhbCAhPT0gbnVsbDtcbiAgbGV0IHJlY3Vyc2UgPSAob2JqLCBiYXNlUGF0aCA9IFwiXCIpID0+IHtcbiAgICBPYmplY3QuZW50cmllcyhPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhvYmopKS5mb3JFYWNoKChba2V5LCB7IHZhbHVlLCBlbnVtZXJhYmxlIH1dKSA9PiB7XG4gICAgICBpZiAoZW51bWVyYWJsZSA9PT0gZmFsc2UgfHwgdmFsdWUgPT09IHZvaWQgMClcbiAgICAgICAgcmV0dXJuO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5fX3Zfc2tpcClcbiAgICAgICAgcmV0dXJuO1xuICAgICAgbGV0IHBhdGggPSBiYXNlUGF0aCA9PT0gXCJcIiA/IGtleSA6IGAke2Jhc2VQYXRofS4ke2tleX1gO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5feF9pbnRlcmNlcHRvcikge1xuICAgICAgICBvYmpba2V5XSA9IHZhbHVlLmluaXRpYWxpemUoZGF0YTIsIHBhdGgsIGtleSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNPYmplY3QyKHZhbHVlKSAmJiB2YWx1ZSAhPT0gb2JqICYmICEodmFsdWUgaW5zdGFuY2VvZiBFbGVtZW50KSkge1xuICAgICAgICAgIHJlY3Vyc2UodmFsdWUsIHBhdGgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiByZWN1cnNlKGRhdGEyKTtcbn1cbmZ1bmN0aW9uIGludGVyY2VwdG9yKGNhbGxiYWNrLCBtdXRhdGVPYmogPSAoKSA9PiB7XG59KSB7XG4gIGxldCBvYmogPSB7XG4gICAgaW5pdGlhbFZhbHVlOiB2b2lkIDAsXG4gICAgX3hfaW50ZXJjZXB0b3I6IHRydWUsXG4gICAgaW5pdGlhbGl6ZShkYXRhMiwgcGF0aCwga2V5KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sodGhpcy5pbml0aWFsVmFsdWUsICgpID0+IGdldChkYXRhMiwgcGF0aCksICh2YWx1ZSkgPT4gc2V0KGRhdGEyLCBwYXRoLCB2YWx1ZSksIHBhdGgsIGtleSk7XG4gICAgfVxuICB9O1xuICBtdXRhdGVPYmoob2JqKTtcbiAgcmV0dXJuIChpbml0aWFsVmFsdWUpID0+IHtcbiAgICBpZiAodHlwZW9mIGluaXRpYWxWYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiBpbml0aWFsVmFsdWUgIT09IG51bGwgJiYgaW5pdGlhbFZhbHVlLl94X2ludGVyY2VwdG9yKSB7XG4gICAgICBsZXQgaW5pdGlhbGl6ZSA9IG9iai5pbml0aWFsaXplLmJpbmQob2JqKTtcbiAgICAgIG9iai5pbml0aWFsaXplID0gKGRhdGEyLCBwYXRoLCBrZXkpID0+IHtcbiAgICAgICAgbGV0IGlubmVyVmFsdWUgPSBpbml0aWFsVmFsdWUuaW5pdGlhbGl6ZShkYXRhMiwgcGF0aCwga2V5KTtcbiAgICAgICAgb2JqLmluaXRpYWxWYWx1ZSA9IGlubmVyVmFsdWU7XG4gICAgICAgIHJldHVybiBpbml0aWFsaXplKGRhdGEyLCBwYXRoLCBrZXkpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqLmluaXRpYWxWYWx1ZSA9IGluaXRpYWxWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcbn1cbmZ1bmN0aW9uIGdldChvYmosIHBhdGgpIHtcbiAgcmV0dXJuIHBhdGguc3BsaXQoXCIuXCIpLnJlZHVjZSgoY2FycnksIHNlZ21lbnQpID0+IGNhcnJ5W3NlZ21lbnRdLCBvYmopO1xufVxuZnVuY3Rpb24gc2V0KG9iaiwgcGF0aCwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBwYXRoID09PSBcInN0cmluZ1wiKVxuICAgIHBhdGggPSBwYXRoLnNwbGl0KFwiLlwiKTtcbiAgaWYgKHBhdGgubGVuZ3RoID09PSAxKVxuICAgIG9ialtwYXRoWzBdXSA9IHZhbHVlO1xuICBlbHNlIGlmIChwYXRoLmxlbmd0aCA9PT0gMClcbiAgICB0aHJvdyBlcnJvcjtcbiAgZWxzZSB7XG4gICAgaWYgKG9ialtwYXRoWzBdXSlcbiAgICAgIHJldHVybiBzZXQob2JqW3BhdGhbMF1dLCBwYXRoLnNsaWNlKDEpLCB2YWx1ZSk7XG4gICAgZWxzZSB7XG4gICAgICBvYmpbcGF0aFswXV0gPSB7fTtcbiAgICAgIHJldHVybiBzZXQob2JqW3BhdGhbMF1dLCBwYXRoLnNsaWNlKDEpLCB2YWx1ZSk7XG4gICAgfVxuICB9XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MuanNcbnZhciBtYWdpY3MgPSB7fTtcbmZ1bmN0aW9uIG1hZ2ljKG5hbWUsIGNhbGxiYWNrKSB7XG4gIG1hZ2ljc1tuYW1lXSA9IGNhbGxiYWNrO1xufVxuZnVuY3Rpb24gaW5qZWN0TWFnaWNzKG9iaiwgZWwpIHtcbiAgbGV0IG1lbW9pemVkVXRpbGl0aWVzID0gZ2V0VXRpbGl0aWVzKGVsKTtcbiAgT2JqZWN0LmVudHJpZXMobWFnaWNzKS5mb3JFYWNoKChbbmFtZSwgY2FsbGJhY2tdKSA9PiB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgYCQke25hbWV9YCwge1xuICAgICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZWwsIG1lbW9pemVkVXRpbGl0aWVzKTtcbiAgICAgIH0sXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cbmZ1bmN0aW9uIGdldFV0aWxpdGllcyhlbCkge1xuICBsZXQgW3V0aWxpdGllcywgY2xlYW51cDJdID0gZ2V0RWxlbWVudEJvdW5kVXRpbGl0aWVzKGVsKTtcbiAgbGV0IHV0aWxzID0geyBpbnRlcmNlcHRvciwgLi4udXRpbGl0aWVzIH07XG4gIG9uRWxSZW1vdmVkKGVsLCBjbGVhbnVwMik7XG4gIHJldHVybiB1dGlscztcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3V0aWxzL2Vycm9yLmpzXG5mdW5jdGlvbiB0cnlDYXRjaChlbCwgZXhwcmVzc2lvbiwgY2FsbGJhY2ssIC4uLmFyZ3MpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gY2FsbGJhY2soLi4uYXJncyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBoYW5kbGVFcnJvcihlLCBlbCwgZXhwcmVzc2lvbik7XG4gIH1cbn1cbmZ1bmN0aW9uIGhhbmRsZUVycm9yKC4uLmFyZ3MpIHtcbiAgcmV0dXJuIGVycm9ySGFuZGxlciguLi5hcmdzKTtcbn1cbnZhciBlcnJvckhhbmRsZXIgPSBub3JtYWxFcnJvckhhbmRsZXI7XG5mdW5jdGlvbiBzZXRFcnJvckhhbmRsZXIoaGFuZGxlcjQpIHtcbiAgZXJyb3JIYW5kbGVyID0gaGFuZGxlcjQ7XG59XG5mdW5jdGlvbiBub3JtYWxFcnJvckhhbmRsZXIoZXJyb3IyLCBlbCwgZXhwcmVzc2lvbiA9IHZvaWQgMCkge1xuICBlcnJvcjIgPSBPYmplY3QuYXNzaWduKFxuICAgIGVycm9yMiA/PyB7IG1lc3NhZ2U6IFwiTm8gZXJyb3IgbWVzc2FnZSBnaXZlbi5cIiB9LFxuICAgIHsgZWwsIGV4cHJlc3Npb24gfVxuICApO1xuICBjb25zb2xlLndhcm4oYEFscGluZSBFeHByZXNzaW9uIEVycm9yOiAke2Vycm9yMi5tZXNzYWdlfVxuXG4ke2V4cHJlc3Npb24gPyAnRXhwcmVzc2lvbjogXCInICsgZXhwcmVzc2lvbiArICdcIlxcblxcbicgOiBcIlwifWAsIGVsKTtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgdGhyb3cgZXJyb3IyO1xuICB9LCAwKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2V2YWx1YXRvci5qc1xudmFyIHNob3VsZEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucyA9IHRydWU7XG5mdW5jdGlvbiBkb250QXV0b0V2YWx1YXRlRnVuY3Rpb25zKGNhbGxiYWNrKSB7XG4gIGxldCBjYWNoZSA9IHNob3VsZEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucztcbiAgc2hvdWxkQXV0b0V2YWx1YXRlRnVuY3Rpb25zID0gZmFsc2U7XG4gIGxldCByZXN1bHQgPSBjYWxsYmFjaygpO1xuICBzaG91bGRBdXRvRXZhbHVhdGVGdW5jdGlvbnMgPSBjYWNoZTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGV2YWx1YXRlKGVsLCBleHByZXNzaW9uLCBleHRyYXMgPSB7fSkge1xuICBsZXQgcmVzdWx0O1xuICBldmFsdWF0ZUxhdGVyKGVsLCBleHByZXNzaW9uKSgodmFsdWUpID0+IHJlc3VsdCA9IHZhbHVlLCBleHRyYXMpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZXZhbHVhdGVMYXRlciguLi5hcmdzKSB7XG4gIHJldHVybiB0aGVFdmFsdWF0b3JGdW5jdGlvbiguLi5hcmdzKTtcbn1cbnZhciB0aGVFdmFsdWF0b3JGdW5jdGlvbiA9IG5vcm1hbEV2YWx1YXRvcjtcbmZ1bmN0aW9uIHNldEV2YWx1YXRvcihuZXdFdmFsdWF0b3IpIHtcbiAgdGhlRXZhbHVhdG9yRnVuY3Rpb24gPSBuZXdFdmFsdWF0b3I7XG59XG52YXIgdGhlUmF3RXZhbHVhdG9yRnVuY3Rpb247XG5mdW5jdGlvbiBzZXRSYXdFdmFsdWF0b3IobmV3RXZhbHVhdG9yKSB7XG4gIHRoZVJhd0V2YWx1YXRvckZ1bmN0aW9uID0gbmV3RXZhbHVhdG9yO1xufVxuZnVuY3Rpb24gbm9ybWFsRXZhbHVhdG9yKGVsLCBleHByZXNzaW9uKSB7XG4gIGxldCBvdmVycmlkZGVuTWFnaWNzID0ge307XG4gIGluamVjdE1hZ2ljcyhvdmVycmlkZGVuTWFnaWNzLCBlbCk7XG4gIGxldCBkYXRhU3RhY2sgPSBbb3ZlcnJpZGRlbk1hZ2ljcywgLi4uY2xvc2VzdERhdGFTdGFjayhlbCldO1xuICBsZXQgZXZhbHVhdG9yID0gdHlwZW9mIGV4cHJlc3Npb24gPT09IFwiZnVuY3Rpb25cIiA/IGdlbmVyYXRlRXZhbHVhdG9yRnJvbUZ1bmN0aW9uKGRhdGFTdGFjaywgZXhwcmVzc2lvbikgOiBnZW5lcmF0ZUV2YWx1YXRvckZyb21TdHJpbmcoZGF0YVN0YWNrLCBleHByZXNzaW9uLCBlbCk7XG4gIHJldHVybiB0cnlDYXRjaC5iaW5kKG51bGwsIGVsLCBleHByZXNzaW9uLCBldmFsdWF0b3IpO1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVFdmFsdWF0b3JGcm9tRnVuY3Rpb24oZGF0YVN0YWNrLCBmdW5jKSB7XG4gIHJldHVybiAocmVjZWl2ZXIgPSAoKSA9PiB7XG4gIH0sIHsgc2NvcGU6IHNjb3BlMiA9IHt9LCBwYXJhbXMgPSBbXSwgY29udGV4dCB9ID0ge30pID0+IHtcbiAgICBpZiAoIXNob3VsZEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucykge1xuICAgICAgcnVuSWZUeXBlT2ZGdW5jdGlvbihyZWNlaXZlciwgZnVuYywgbWVyZ2VQcm94aWVzKFtzY29wZTIsIC4uLmRhdGFTdGFja10pLCBwYXJhbXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0ID0gZnVuYy5hcHBseShtZXJnZVByb3hpZXMoW3Njb3BlMiwgLi4uZGF0YVN0YWNrXSksIHBhcmFtcyk7XG4gICAgcnVuSWZUeXBlT2ZGdW5jdGlvbihyZWNlaXZlciwgcmVzdWx0KTtcbiAgfTtcbn1cbnZhciBldmFsdWF0b3JNZW1vID0ge307XG5mdW5jdGlvbiBnZW5lcmF0ZUZ1bmN0aW9uRnJvbVN0cmluZyhleHByZXNzaW9uLCBlbCkge1xuICBpZiAoZXZhbHVhdG9yTWVtb1tleHByZXNzaW9uXSkge1xuICAgIHJldHVybiBldmFsdWF0b3JNZW1vW2V4cHJlc3Npb25dO1xuICB9XG4gIGxldCBBc3luY0Z1bmN0aW9uID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGFzeW5jIGZ1bmN0aW9uKCkge1xuICB9KS5jb25zdHJ1Y3RvcjtcbiAgbGV0IHJpZ2h0U2lkZVNhZmVFeHByZXNzaW9uID0gL15bXFxuXFxzXSppZi4qXFwoLipcXCkvLnRlc3QoZXhwcmVzc2lvbi50cmltKCkpIHx8IC9eKGxldHxjb25zdClcXHMvLnRlc3QoZXhwcmVzc2lvbi50cmltKCkpID8gYChhc3luYygpPT57ICR7ZXhwcmVzc2lvbn0gfSkoKWAgOiBleHByZXNzaW9uO1xuICBjb25zdCBzYWZlQXN5bmNGdW5jdGlvbiA9ICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgbGV0IGZ1bmMyID0gbmV3IEFzeW5jRnVuY3Rpb24oXG4gICAgICAgIFtcIl9fc2VsZlwiLCBcInNjb3BlXCJdLFxuICAgICAgICBgd2l0aCAoc2NvcGUpIHsgX19zZWxmLnJlc3VsdCA9ICR7cmlnaHRTaWRlU2FmZUV4cHJlc3Npb259IH07IF9fc2VsZi5maW5pc2hlZCA9IHRydWU7IHJldHVybiBfX3NlbGYucmVzdWx0O2BcbiAgICAgICk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZnVuYzIsIFwibmFtZVwiLCB7XG4gICAgICAgIHZhbHVlOiBgW0FscGluZV0gJHtleHByZXNzaW9ufWBcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGZ1bmMyO1xuICAgIH0gY2F0Y2ggKGVycm9yMikge1xuICAgICAgaGFuZGxlRXJyb3IoZXJyb3IyLCBlbCwgZXhwcmVzc2lvbik7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICB9O1xuICBsZXQgZnVuYyA9IHNhZmVBc3luY0Z1bmN0aW9uKCk7XG4gIGV2YWx1YXRvck1lbW9bZXhwcmVzc2lvbl0gPSBmdW5jO1xuICByZXR1cm4gZnVuYztcbn1cbmZ1bmN0aW9uIGdlbmVyYXRlRXZhbHVhdG9yRnJvbVN0cmluZyhkYXRhU3RhY2ssIGV4cHJlc3Npb24sIGVsKSB7XG4gIGxldCBmdW5jID0gZ2VuZXJhdGVGdW5jdGlvbkZyb21TdHJpbmcoZXhwcmVzc2lvbiwgZWwpO1xuICByZXR1cm4gKHJlY2VpdmVyID0gKCkgPT4ge1xuICB9LCB7IHNjb3BlOiBzY29wZTIgPSB7fSwgcGFyYW1zID0gW10sIGNvbnRleHQgfSA9IHt9KSA9PiB7XG4gICAgZnVuYy5yZXN1bHQgPSB2b2lkIDA7XG4gICAgZnVuYy5maW5pc2hlZCA9IGZhbHNlO1xuICAgIGxldCBjb21wbGV0ZVNjb3BlID0gbWVyZ2VQcm94aWVzKFtzY29wZTIsIC4uLmRhdGFTdGFja10pO1xuICAgIGlmICh0eXBlb2YgZnVuYyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBsZXQgcHJvbWlzZSA9IGZ1bmMuY2FsbChjb250ZXh0LCBmdW5jLCBjb21wbGV0ZVNjb3BlKS5jYXRjaCgoZXJyb3IyKSA9PiBoYW5kbGVFcnJvcihlcnJvcjIsIGVsLCBleHByZXNzaW9uKSk7XG4gICAgICBpZiAoZnVuYy5maW5pc2hlZCkge1xuICAgICAgICBydW5JZlR5cGVPZkZ1bmN0aW9uKHJlY2VpdmVyLCBmdW5jLnJlc3VsdCwgY29tcGxldGVTY29wZSwgcGFyYW1zLCBlbCk7XG4gICAgICAgIGZ1bmMucmVzdWx0ID0gdm9pZCAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICBydW5JZlR5cGVPZkZ1bmN0aW9uKHJlY2VpdmVyLCByZXN1bHQsIGNvbXBsZXRlU2NvcGUsIHBhcmFtcywgZWwpO1xuICAgICAgICB9KS5jYXRjaCgoZXJyb3IyKSA9PiBoYW5kbGVFcnJvcihlcnJvcjIsIGVsLCBleHByZXNzaW9uKSkuZmluYWxseSgoKSA9PiBmdW5jLnJlc3VsdCA9IHZvaWQgMCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gcnVuSWZUeXBlT2ZGdW5jdGlvbihyZWNlaXZlciwgdmFsdWUsIHNjb3BlMiwgcGFyYW1zLCBlbCkge1xuICBpZiAoc2hvdWxkQXV0b0V2YWx1YXRlRnVuY3Rpb25zICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgbGV0IHJlc3VsdCA9IHZhbHVlLmFwcGx5KHNjb3BlMiwgcGFyYW1zKTtcbiAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgcmVzdWx0LnRoZW4oKGkpID0+IHJ1bklmVHlwZU9mRnVuY3Rpb24ocmVjZWl2ZXIsIGksIHNjb3BlMiwgcGFyYW1zKSkuY2F0Y2goKGVycm9yMikgPT4gaGFuZGxlRXJyb3IoZXJyb3IyLCBlbCwgdmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVjZWl2ZXIocmVzdWx0KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgIHZhbHVlLnRoZW4oKGkpID0+IHJlY2VpdmVyKGkpKTtcbiAgfSBlbHNlIHtcbiAgICByZWNlaXZlcih2YWx1ZSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGV2YWx1YXRlUmF3KC4uLmFyZ3MpIHtcbiAgcmV0dXJuIHRoZVJhd0V2YWx1YXRvckZ1bmN0aW9uKC4uLmFyZ3MpO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy5qc1xudmFyIHByZWZpeEFzU3RyaW5nID0gXCJ4LVwiO1xuZnVuY3Rpb24gcHJlZml4KHN1YmplY3QgPSBcIlwiKSB7XG4gIHJldHVybiBwcmVmaXhBc1N0cmluZyArIHN1YmplY3Q7XG59XG5mdW5jdGlvbiBzZXRQcmVmaXgobmV3UHJlZml4KSB7XG4gIHByZWZpeEFzU3RyaW5nID0gbmV3UHJlZml4O1xufVxudmFyIGRpcmVjdGl2ZUhhbmRsZXJzID0ge307XG5mdW5jdGlvbiBkaXJlY3RpdmUobmFtZSwgY2FsbGJhY2spIHtcbiAgZGlyZWN0aXZlSGFuZGxlcnNbbmFtZV0gPSBjYWxsYmFjaztcbiAgcmV0dXJuIHtcbiAgICBiZWZvcmUoZGlyZWN0aXZlMikge1xuICAgICAgaWYgKCFkaXJlY3RpdmVIYW5kbGVyc1tkaXJlY3RpdmUyXSkge1xuICAgICAgICBjb25zb2xlLndhcm4oU3RyaW5nLnJhd2BDYW5ub3QgZmluZCBkaXJlY3RpdmUgXFxgJHtkaXJlY3RpdmUyfVxcYC4gXFxgJHtuYW1lfVxcYCB3aWxsIHVzZSB0aGUgZGVmYXVsdCBvcmRlciBvZiBleGVjdXRpb25gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgcG9zID0gZGlyZWN0aXZlT3JkZXIuaW5kZXhPZihkaXJlY3RpdmUyKTtcbiAgICAgIGRpcmVjdGl2ZU9yZGVyLnNwbGljZShwb3MgPj0gMCA/IHBvcyA6IGRpcmVjdGl2ZU9yZGVyLmluZGV4T2YoXCJERUZBVUxUXCIpLCAwLCBuYW1lKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBkaXJlY3RpdmVFeGlzdHMobmFtZSkge1xuICByZXR1cm4gT2JqZWN0LmtleXMoZGlyZWN0aXZlSGFuZGxlcnMpLmluY2x1ZGVzKG5hbWUpO1xufVxuZnVuY3Rpb24gZGlyZWN0aXZlcyhlbCwgYXR0cmlidXRlcywgb3JpZ2luYWxBdHRyaWJ1dGVPdmVycmlkZSkge1xuICBhdHRyaWJ1dGVzID0gQXJyYXkuZnJvbShhdHRyaWJ1dGVzKTtcbiAgaWYgKGVsLl94X3ZpcnR1YWxEaXJlY3RpdmVzKSB7XG4gICAgbGV0IHZBdHRyaWJ1dGVzID0gT2JqZWN0LmVudHJpZXMoZWwuX3hfdmlydHVhbERpcmVjdGl2ZXMpLm1hcCgoW25hbWUsIHZhbHVlXSkgPT4gKHsgbmFtZSwgdmFsdWUgfSkpO1xuICAgIGxldCBzdGF0aWNBdHRyaWJ1dGVzID0gYXR0cmlidXRlc09ubHkodkF0dHJpYnV0ZXMpO1xuICAgIHZBdHRyaWJ1dGVzID0gdkF0dHJpYnV0ZXMubWFwKChhdHRyaWJ1dGUpID0+IHtcbiAgICAgIGlmIChzdGF0aWNBdHRyaWJ1dGVzLmZpbmQoKGF0dHIpID0+IGF0dHIubmFtZSA9PT0gYXR0cmlidXRlLm5hbWUpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbmFtZTogYHgtYmluZDoke2F0dHJpYnV0ZS5uYW1lfWAsXG4gICAgICAgICAgdmFsdWU6IGBcIiR7YXR0cmlidXRlLnZhbHVlfVwiYFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgICB9KTtcbiAgICBhdHRyaWJ1dGVzID0gYXR0cmlidXRlcy5jb25jYXQodkF0dHJpYnV0ZXMpO1xuICB9XG4gIGxldCB0cmFuc2Zvcm1lZEF0dHJpYnV0ZU1hcCA9IHt9O1xuICBsZXQgZGlyZWN0aXZlczIgPSBhdHRyaWJ1dGVzLm1hcCh0b1RyYW5zZm9ybWVkQXR0cmlidXRlcygobmV3TmFtZSwgb2xkTmFtZSkgPT4gdHJhbnNmb3JtZWRBdHRyaWJ1dGVNYXBbbmV3TmFtZV0gPSBvbGROYW1lKSkuZmlsdGVyKG91dE5vbkFscGluZUF0dHJpYnV0ZXMpLm1hcCh0b1BhcnNlZERpcmVjdGl2ZXModHJhbnNmb3JtZWRBdHRyaWJ1dGVNYXAsIG9yaWdpbmFsQXR0cmlidXRlT3ZlcnJpZGUpKS5zb3J0KGJ5UHJpb3JpdHkpO1xuICByZXR1cm4gZGlyZWN0aXZlczIubWFwKChkaXJlY3RpdmUyKSA9PiB7XG4gICAgcmV0dXJuIGdldERpcmVjdGl2ZUhhbmRsZXIoZWwsIGRpcmVjdGl2ZTIpO1xuICB9KTtcbn1cbmZ1bmN0aW9uIGF0dHJpYnV0ZXNPbmx5KGF0dHJpYnV0ZXMpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20oYXR0cmlidXRlcykubWFwKHRvVHJhbnNmb3JtZWRBdHRyaWJ1dGVzKCkpLmZpbHRlcigoYXR0cikgPT4gIW91dE5vbkFscGluZUF0dHJpYnV0ZXMoYXR0cikpO1xufVxudmFyIGlzRGVmZXJyaW5nSGFuZGxlcnMgPSBmYWxzZTtcbnZhciBkaXJlY3RpdmVIYW5kbGVyU3RhY2tzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBjdXJyZW50SGFuZGxlclN0YWNrS2V5ID0gU3ltYm9sKCk7XG5mdW5jdGlvbiBkZWZlckhhbmRsaW5nRGlyZWN0aXZlcyhjYWxsYmFjaykge1xuICBpc0RlZmVycmluZ0hhbmRsZXJzID0gdHJ1ZTtcbiAgbGV0IGtleSA9IFN5bWJvbCgpO1xuICBjdXJyZW50SGFuZGxlclN0YWNrS2V5ID0ga2V5O1xuICBkaXJlY3RpdmVIYW5kbGVyU3RhY2tzLnNldChrZXksIFtdKTtcbiAgbGV0IGZsdXNoSGFuZGxlcnMgPSAoKSA9PiB7XG4gICAgd2hpbGUgKGRpcmVjdGl2ZUhhbmRsZXJTdGFja3MuZ2V0KGtleSkubGVuZ3RoKVxuICAgICAgZGlyZWN0aXZlSGFuZGxlclN0YWNrcy5nZXQoa2V5KS5zaGlmdCgpKCk7XG4gICAgZGlyZWN0aXZlSGFuZGxlclN0YWNrcy5kZWxldGUoa2V5KTtcbiAgfTtcbiAgbGV0IHN0b3BEZWZlcnJpbmcgPSAoKSA9PiB7XG4gICAgaXNEZWZlcnJpbmdIYW5kbGVycyA9IGZhbHNlO1xuICAgIGZsdXNoSGFuZGxlcnMoKTtcbiAgfTtcbiAgY2FsbGJhY2soZmx1c2hIYW5kbGVycyk7XG4gIHN0b3BEZWZlcnJpbmcoKTtcbn1cbmZ1bmN0aW9uIGdldEVsZW1lbnRCb3VuZFV0aWxpdGllcyhlbCkge1xuICBsZXQgY2xlYW51cHMgPSBbXTtcbiAgbGV0IGNsZWFudXAyID0gKGNhbGxiYWNrKSA9PiBjbGVhbnVwcy5wdXNoKGNhbGxiYWNrKTtcbiAgbGV0IFtlZmZlY3QzLCBjbGVhbnVwRWZmZWN0XSA9IGVsZW1lbnRCb3VuZEVmZmVjdChlbCk7XG4gIGNsZWFudXBzLnB1c2goY2xlYW51cEVmZmVjdCk7XG4gIGxldCB1dGlsaXRpZXMgPSB7XG4gICAgQWxwaW5lOiBhbHBpbmVfZGVmYXVsdCxcbiAgICBlZmZlY3Q6IGVmZmVjdDMsXG4gICAgY2xlYW51cDogY2xlYW51cDIsXG4gICAgZXZhbHVhdGVMYXRlcjogZXZhbHVhdGVMYXRlci5iaW5kKGV2YWx1YXRlTGF0ZXIsIGVsKSxcbiAgICBldmFsdWF0ZTogZXZhbHVhdGUuYmluZChldmFsdWF0ZSwgZWwpXG4gIH07XG4gIGxldCBkb0NsZWFudXAgPSAoKSA9PiBjbGVhbnVwcy5mb3JFYWNoKChpKSA9PiBpKCkpO1xuICByZXR1cm4gW3V0aWxpdGllcywgZG9DbGVhbnVwXTtcbn1cbmZ1bmN0aW9uIGdldERpcmVjdGl2ZUhhbmRsZXIoZWwsIGRpcmVjdGl2ZTIpIHtcbiAgbGV0IG5vb3AgPSAoKSA9PiB7XG4gIH07XG4gIGxldCBoYW5kbGVyNCA9IGRpcmVjdGl2ZUhhbmRsZXJzW2RpcmVjdGl2ZTIudHlwZV0gfHwgbm9vcDtcbiAgbGV0IFt1dGlsaXRpZXMsIGNsZWFudXAyXSA9IGdldEVsZW1lbnRCb3VuZFV0aWxpdGllcyhlbCk7XG4gIG9uQXR0cmlidXRlUmVtb3ZlZChlbCwgZGlyZWN0aXZlMi5vcmlnaW5hbCwgY2xlYW51cDIpO1xuICBsZXQgZnVsbEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgaWYgKGVsLl94X2lnbm9yZSB8fCBlbC5feF9pZ25vcmVTZWxmKVxuICAgICAgcmV0dXJuO1xuICAgIGhhbmRsZXI0LmlubGluZSAmJiBoYW5kbGVyNC5pbmxpbmUoZWwsIGRpcmVjdGl2ZTIsIHV0aWxpdGllcyk7XG4gICAgaGFuZGxlcjQgPSBoYW5kbGVyNC5iaW5kKGhhbmRsZXI0LCBlbCwgZGlyZWN0aXZlMiwgdXRpbGl0aWVzKTtcbiAgICBpc0RlZmVycmluZ0hhbmRsZXJzID8gZGlyZWN0aXZlSGFuZGxlclN0YWNrcy5nZXQoY3VycmVudEhhbmRsZXJTdGFja0tleSkucHVzaChoYW5kbGVyNCkgOiBoYW5kbGVyNCgpO1xuICB9O1xuICBmdWxsSGFuZGxlci5ydW5DbGVhbnVwcyA9IGNsZWFudXAyO1xuICByZXR1cm4gZnVsbEhhbmRsZXI7XG59XG52YXIgc3RhcnRpbmdXaXRoID0gKHN1YmplY3QsIHJlcGxhY2VtZW50KSA9PiAoeyBuYW1lLCB2YWx1ZSB9KSA9PiB7XG4gIGlmIChuYW1lLnN0YXJ0c1dpdGgoc3ViamVjdCkpXG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZShzdWJqZWN0LCByZXBsYWNlbWVudCk7XG4gIHJldHVybiB7IG5hbWUsIHZhbHVlIH07XG59O1xudmFyIGludG8gPSAoaSkgPT4gaTtcbmZ1bmN0aW9uIHRvVHJhbnNmb3JtZWRBdHRyaWJ1dGVzKGNhbGxiYWNrID0gKCkgPT4ge1xufSkge1xuICByZXR1cm4gKHsgbmFtZSwgdmFsdWUgfSkgPT4ge1xuICAgIGxldCB7IG5hbWU6IG5ld05hbWUsIHZhbHVlOiBuZXdWYWx1ZSB9ID0gYXR0cmlidXRlVHJhbnNmb3JtZXJzLnJlZHVjZSgoY2FycnksIHRyYW5zZm9ybSkgPT4ge1xuICAgICAgcmV0dXJuIHRyYW5zZm9ybShjYXJyeSk7XG4gICAgfSwgeyBuYW1lLCB2YWx1ZSB9KTtcbiAgICBpZiAobmV3TmFtZSAhPT0gbmFtZSlcbiAgICAgIGNhbGxiYWNrKG5ld05hbWUsIG5hbWUpO1xuICAgIHJldHVybiB7IG5hbWU6IG5ld05hbWUsIHZhbHVlOiBuZXdWYWx1ZSB9O1xuICB9O1xufVxudmFyIGF0dHJpYnV0ZVRyYW5zZm9ybWVycyA9IFtdO1xuZnVuY3Rpb24gbWFwQXR0cmlidXRlcyhjYWxsYmFjaykge1xuICBhdHRyaWJ1dGVUcmFuc2Zvcm1lcnMucHVzaChjYWxsYmFjayk7XG59XG5mdW5jdGlvbiBvdXROb25BbHBpbmVBdHRyaWJ1dGVzKHsgbmFtZSB9KSB7XG4gIHJldHVybiBhbHBpbmVBdHRyaWJ1dGVSZWdleCgpLnRlc3QobmFtZSk7XG59XG52YXIgYWxwaW5lQXR0cmlidXRlUmVnZXggPSAoKSA9PiBuZXcgUmVnRXhwKGBeJHtwcmVmaXhBc1N0cmluZ30oW146Xi5dKylcXFxcYmApO1xuZnVuY3Rpb24gdG9QYXJzZWREaXJlY3RpdmVzKHRyYW5zZm9ybWVkQXR0cmlidXRlTWFwLCBvcmlnaW5hbEF0dHJpYnV0ZU92ZXJyaWRlKSB7XG4gIHJldHVybiAoeyBuYW1lLCB2YWx1ZSB9KSA9PiB7XG4gICAgaWYgKG5hbWUgPT09IHZhbHVlKVxuICAgICAgdmFsdWUgPSBcIlwiO1xuICAgIGxldCB0eXBlTWF0Y2ggPSBuYW1lLm1hdGNoKGFscGluZUF0dHJpYnV0ZVJlZ2V4KCkpO1xuICAgIGxldCB2YWx1ZU1hdGNoID0gbmFtZS5tYXRjaCgvOihbYS16QS1aMC05XFwtXzpdKykvKTtcbiAgICBsZXQgbW9kaWZpZXJzID0gbmFtZS5tYXRjaCgvXFwuW14uXFxdXSsoPz1bXlxcXV0qJCkvZykgfHwgW107XG4gICAgbGV0IG9yaWdpbmFsID0gb3JpZ2luYWxBdHRyaWJ1dGVPdmVycmlkZSB8fCB0cmFuc2Zvcm1lZEF0dHJpYnV0ZU1hcFtuYW1lXSB8fCBuYW1lO1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiB0eXBlTWF0Y2ggPyB0eXBlTWF0Y2hbMV0gOiBudWxsLFxuICAgICAgdmFsdWU6IHZhbHVlTWF0Y2ggPyB2YWx1ZU1hdGNoWzFdIDogbnVsbCxcbiAgICAgIG1vZGlmaWVyczogbW9kaWZpZXJzLm1hcCgoaSkgPT4gaS5yZXBsYWNlKFwiLlwiLCBcIlwiKSksXG4gICAgICBleHByZXNzaW9uOiB2YWx1ZSxcbiAgICAgIG9yaWdpbmFsXG4gICAgfTtcbiAgfTtcbn1cbnZhciBERUZBVUxUID0gXCJERUZBVUxUXCI7XG52YXIgZGlyZWN0aXZlT3JkZXIgPSBbXG4gIFwiaWdub3JlXCIsXG4gIFwicmVmXCIsXG4gIFwiZGF0YVwiLFxuICBcImlkXCIsXG4gIFwiYW5jaG9yXCIsXG4gIFwiYmluZFwiLFxuICBcImluaXRcIixcbiAgXCJmb3JcIixcbiAgXCJtb2RlbFwiLFxuICBcIm1vZGVsYWJsZVwiLFxuICBcInRyYW5zaXRpb25cIixcbiAgXCJzaG93XCIsXG4gIFwiaWZcIixcbiAgREVGQVVMVCxcbiAgXCJ0ZWxlcG9ydFwiXG5dO1xuZnVuY3Rpb24gYnlQcmlvcml0eShhLCBiKSB7XG4gIGxldCB0eXBlQSA9IGRpcmVjdGl2ZU9yZGVyLmluZGV4T2YoYS50eXBlKSA9PT0gLTEgPyBERUZBVUxUIDogYS50eXBlO1xuICBsZXQgdHlwZUIgPSBkaXJlY3RpdmVPcmRlci5pbmRleE9mKGIudHlwZSkgPT09IC0xID8gREVGQVVMVCA6IGIudHlwZTtcbiAgcmV0dXJuIGRpcmVjdGl2ZU9yZGVyLmluZGV4T2YodHlwZUEpIC0gZGlyZWN0aXZlT3JkZXIuaW5kZXhPZih0eXBlQik7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy9kaXNwYXRjaC5qc1xuZnVuY3Rpb24gZGlzcGF0Y2goZWwsIG5hbWUsIGRldGFpbCA9IHt9KSB7XG4gIGVsLmRpc3BhdGNoRXZlbnQoXG4gICAgbmV3IEN1c3RvbUV2ZW50KG5hbWUsIHtcbiAgICAgIGRldGFpbCxcbiAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAvLyBBbGxvd3MgZXZlbnRzIHRvIHBhc3MgdGhlIHNoYWRvdyBET00gYmFycmllci5cbiAgICAgIGNvbXBvc2VkOiB0cnVlLFxuICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgIH0pXG4gICk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy93YWxrLmpzXG5mdW5jdGlvbiB3YWxrKGVsLCBjYWxsYmFjaykge1xuICBpZiAodHlwZW9mIFNoYWRvd1Jvb3QgPT09IFwiZnVuY3Rpb25cIiAmJiBlbCBpbnN0YW5jZW9mIFNoYWRvd1Jvb3QpIHtcbiAgICBBcnJheS5mcm9tKGVsLmNoaWxkcmVuKS5mb3JFYWNoKChlbDIpID0+IHdhbGsoZWwyLCBjYWxsYmFjaykpO1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgc2tpcCA9IGZhbHNlO1xuICBjYWxsYmFjayhlbCwgKCkgPT4gc2tpcCA9IHRydWUpO1xuICBpZiAoc2tpcClcbiAgICByZXR1cm47XG4gIGxldCBub2RlID0gZWwuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gIHdoaWxlIChub2RlKSB7XG4gICAgd2Fsayhub2RlLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgIG5vZGUgPSBub2RlLm5leHRFbGVtZW50U2libGluZztcbiAgfVxufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvd2Fybi5qc1xuZnVuY3Rpb24gd2FybihtZXNzYWdlLCAuLi5hcmdzKSB7XG4gIGNvbnNvbGUud2FybihgQWxwaW5lIFdhcm5pbmc6ICR7bWVzc2FnZX1gLCAuLi5hcmdzKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2xpZmVjeWNsZS5qc1xudmFyIHN0YXJ0ZWQgPSBmYWxzZTtcbmZ1bmN0aW9uIHN0YXJ0KCkge1xuICBpZiAoc3RhcnRlZClcbiAgICB3YXJuKFwiQWxwaW5lIGhhcyBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWQgb24gdGhpcyBwYWdlLiBDYWxsaW5nIEFscGluZS5zdGFydCgpIG1vcmUgdGhhbiBvbmNlIGNhbiBjYXVzZSBwcm9ibGVtcy5cIik7XG4gIHN0YXJ0ZWQgPSB0cnVlO1xuICBpZiAoIWRvY3VtZW50LmJvZHkpXG4gICAgd2FybihcIlVuYWJsZSB0byBpbml0aWFsaXplLiBUcnlpbmcgdG8gbG9hZCBBbHBpbmUgYmVmb3JlIGA8Ym9keT5gIGlzIGF2YWlsYWJsZS4gRGlkIHlvdSBmb3JnZXQgdG8gYWRkIGBkZWZlcmAgaW4gQWxwaW5lJ3MgYDxzY3JpcHQ+YCB0YWc/XCIpO1xuICBkaXNwYXRjaChkb2N1bWVudCwgXCJhbHBpbmU6aW5pdFwiKTtcbiAgZGlzcGF0Y2goZG9jdW1lbnQsIFwiYWxwaW5lOmluaXRpYWxpemluZ1wiKTtcbiAgc3RhcnRPYnNlcnZpbmdNdXRhdGlvbnMoKTtcbiAgb25FbEFkZGVkKChlbCkgPT4gaW5pdFRyZWUoZWwsIHdhbGspKTtcbiAgb25FbFJlbW92ZWQoKGVsKSA9PiBkZXN0cm95VHJlZShlbCkpO1xuICBvbkF0dHJpYnV0ZXNBZGRlZCgoZWwsIGF0dHJzKSA9PiB7XG4gICAgZGlyZWN0aXZlcyhlbCwgYXR0cnMpLmZvckVhY2goKGhhbmRsZSkgPT4gaGFuZGxlKCkpO1xuICB9KTtcbiAgbGV0IG91dE5lc3RlZENvbXBvbmVudHMgPSAoZWwpID0+ICFjbG9zZXN0Um9vdChlbC5wYXJlbnRFbGVtZW50LCB0cnVlKTtcbiAgQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGFsbFNlbGVjdG9ycygpLmpvaW4oXCIsXCIpKSkuZmlsdGVyKG91dE5lc3RlZENvbXBvbmVudHMpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgaW5pdFRyZWUoZWwpO1xuICB9KTtcbiAgZGlzcGF0Y2goZG9jdW1lbnQsIFwiYWxwaW5lOmluaXRpYWxpemVkXCIpO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICB3YXJuQWJvdXRNaXNzaW5nUGx1Z2lucygpO1xuICB9KTtcbn1cbnZhciByb290U2VsZWN0b3JDYWxsYmFja3MgPSBbXTtcbnZhciBpbml0U2VsZWN0b3JDYWxsYmFja3MgPSBbXTtcbmZ1bmN0aW9uIHJvb3RTZWxlY3RvcnMoKSB7XG4gIHJldHVybiByb290U2VsZWN0b3JDYWxsYmFja3MubWFwKChmbikgPT4gZm4oKSk7XG59XG5mdW5jdGlvbiBhbGxTZWxlY3RvcnMoKSB7XG4gIHJldHVybiByb290U2VsZWN0b3JDYWxsYmFja3MuY29uY2F0KGluaXRTZWxlY3RvckNhbGxiYWNrcykubWFwKChmbikgPT4gZm4oKSk7XG59XG5mdW5jdGlvbiBhZGRSb290U2VsZWN0b3Ioc2VsZWN0b3JDYWxsYmFjaykge1xuICByb290U2VsZWN0b3JDYWxsYmFja3MucHVzaChzZWxlY3RvckNhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIGFkZEluaXRTZWxlY3RvcihzZWxlY3RvckNhbGxiYWNrKSB7XG4gIGluaXRTZWxlY3RvckNhbGxiYWNrcy5wdXNoKHNlbGVjdG9yQ2FsbGJhY2spO1xufVxuZnVuY3Rpb24gY2xvc2VzdFJvb3QoZWwsIGluY2x1ZGVJbml0U2VsZWN0b3JzID0gZmFsc2UpIHtcbiAgcmV0dXJuIGZpbmRDbG9zZXN0KGVsLCAoZWxlbWVudCkgPT4ge1xuICAgIGNvbnN0IHNlbGVjdG9ycyA9IGluY2x1ZGVJbml0U2VsZWN0b3JzID8gYWxsU2VsZWN0b3JzKCkgOiByb290U2VsZWN0b3JzKCk7XG4gICAgaWYgKHNlbGVjdG9ycy5zb21lKChzZWxlY3RvcikgPT4gZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKSkpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG5mdW5jdGlvbiBmaW5kQ2xvc2VzdChlbCwgY2FsbGJhY2spIHtcbiAgaWYgKCFlbClcbiAgICByZXR1cm47XG4gIGlmIChjYWxsYmFjayhlbCkpXG4gICAgcmV0dXJuIGVsO1xuICBpZiAoZWwuX3hfdGVsZXBvcnRCYWNrKVxuICAgIGVsID0gZWwuX3hfdGVsZXBvcnRCYWNrO1xuICBpZiAoZWwucGFyZW50Tm9kZSBpbnN0YW5jZW9mIFNoYWRvd1Jvb3QpIHtcbiAgICByZXR1cm4gZmluZENsb3Nlc3QoZWwucGFyZW50Tm9kZS5ob3N0LCBjYWxsYmFjayk7XG4gIH1cbiAgaWYgKCFlbC5wYXJlbnRFbGVtZW50KVxuICAgIHJldHVybjtcbiAgcmV0dXJuIGZpbmRDbG9zZXN0KGVsLnBhcmVudEVsZW1lbnQsIGNhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIGlzUm9vdChlbCkge1xuICByZXR1cm4gcm9vdFNlbGVjdG9ycygpLnNvbWUoKHNlbGVjdG9yKSA9PiBlbC5tYXRjaGVzKHNlbGVjdG9yKSk7XG59XG52YXIgaW5pdEludGVyY2VwdG9yczIgPSBbXTtcbmZ1bmN0aW9uIGludGVyY2VwdEluaXQoY2FsbGJhY2spIHtcbiAgaW5pdEludGVyY2VwdG9yczIucHVzaChjYWxsYmFjayk7XG59XG52YXIgbWFya2VyRGlzcGVuc2VyID0gMTtcbmZ1bmN0aW9uIGluaXRUcmVlKGVsLCB3YWxrZXIgPSB3YWxrLCBpbnRlcmNlcHQgPSAoKSA9PiB7XG59KSB7XG4gIGlmIChmaW5kQ2xvc2VzdChlbCwgKGkpID0+IGkuX3hfaWdub3JlKSlcbiAgICByZXR1cm47XG4gIGRlZmVySGFuZGxpbmdEaXJlY3RpdmVzKCgpID0+IHtcbiAgICB3YWxrZXIoZWwsIChlbDIsIHNraXApID0+IHtcbiAgICAgIGlmIChlbDIuX3hfbWFya2VyKVxuICAgICAgICByZXR1cm47XG4gICAgICBpbnRlcmNlcHQoZWwyLCBza2lwKTtcbiAgICAgIGluaXRJbnRlcmNlcHRvcnMyLmZvckVhY2goKGkpID0+IGkoZWwyLCBza2lwKSk7XG4gICAgICBkaXJlY3RpdmVzKGVsMiwgZWwyLmF0dHJpYnV0ZXMpLmZvckVhY2goKGhhbmRsZSkgPT4gaGFuZGxlKCkpO1xuICAgICAgaWYgKCFlbDIuX3hfaWdub3JlKVxuICAgICAgICBlbDIuX3hfbWFya2VyID0gbWFya2VyRGlzcGVuc2VyKys7XG4gICAgICBlbDIuX3hfaWdub3JlICYmIHNraXAoKTtcbiAgICB9KTtcbiAgfSk7XG59XG5mdW5jdGlvbiBkZXN0cm95VHJlZShyb290LCB3YWxrZXIgPSB3YWxrKSB7XG4gIHdhbGtlcihyb290LCAoZWwpID0+IHtcbiAgICBjbGVhbnVwRWxlbWVudChlbCk7XG4gICAgY2xlYW51cEF0dHJpYnV0ZXMoZWwpO1xuICAgIGRlbGV0ZSBlbC5feF9tYXJrZXI7XG4gIH0pO1xufVxuZnVuY3Rpb24gd2FybkFib3V0TWlzc2luZ1BsdWdpbnMoKSB7XG4gIGxldCBwbHVnaW5EaXJlY3RpdmVzID0gW1xuICAgIFtcInVpXCIsIFwiZGlhbG9nXCIsIFtcIlt4LWRpYWxvZ10sIFt4LXBvcG92ZXJdXCJdXSxcbiAgICBbXCJhbmNob3JcIiwgXCJhbmNob3JcIiwgW1wiW3gtYW5jaG9yXVwiXV0sXG4gICAgW1wic29ydFwiLCBcInNvcnRcIiwgW1wiW3gtc29ydF1cIl1dXG4gIF07XG4gIHBsdWdpbkRpcmVjdGl2ZXMuZm9yRWFjaCgoW3BsdWdpbjIsIGRpcmVjdGl2ZTIsIHNlbGVjdG9yc10pID0+IHtcbiAgICBpZiAoZGlyZWN0aXZlRXhpc3RzKGRpcmVjdGl2ZTIpKVxuICAgICAgcmV0dXJuO1xuICAgIHNlbGVjdG9ycy5zb21lKChzZWxlY3RvcikgPT4ge1xuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgICAgIHdhcm4oYGZvdW5kIFwiJHtzZWxlY3Rvcn1cIiwgYnV0IG1pc3NpbmcgJHtwbHVnaW4yfSBwbHVnaW5gKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvbmV4dFRpY2suanNcbnZhciB0aWNrU3RhY2sgPSBbXTtcbnZhciBpc0hvbGRpbmcgPSBmYWxzZTtcbmZ1bmN0aW9uIG5leHRUaWNrKGNhbGxiYWNrID0gKCkgPT4ge1xufSkge1xuICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgaXNIb2xkaW5nIHx8IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcmVsZWFzZU5leHRUaWNrcygpO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMpID0+IHtcbiAgICB0aWNrU3RhY2sucHVzaCgoKSA9PiB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgICAgcmVzKCk7XG4gICAgfSk7XG4gIH0pO1xufVxuZnVuY3Rpb24gcmVsZWFzZU5leHRUaWNrcygpIHtcbiAgaXNIb2xkaW5nID0gZmFsc2U7XG4gIHdoaWxlICh0aWNrU3RhY2subGVuZ3RoKVxuICAgIHRpY2tTdGFjay5zaGlmdCgpKCk7XG59XG5mdW5jdGlvbiBob2xkTmV4dFRpY2tzKCkge1xuICBpc0hvbGRpbmcgPSB0cnVlO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvY2xhc3Nlcy5qc1xuZnVuY3Rpb24gc2V0Q2xhc3NlcyhlbCwgdmFsdWUpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIHNldENsYXNzZXNGcm9tU3RyaW5nKGVsLCB2YWx1ZS5qb2luKFwiIFwiKSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIHNldENsYXNzZXNGcm9tT2JqZWN0KGVsLCB2YWx1ZSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXR1cm4gc2V0Q2xhc3NlcyhlbCwgdmFsdWUoKSk7XG4gIH1cbiAgcmV0dXJuIHNldENsYXNzZXNGcm9tU3RyaW5nKGVsLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBzZXRDbGFzc2VzRnJvbVN0cmluZyhlbCwgY2xhc3NTdHJpbmcpIHtcbiAgbGV0IHNwbGl0ID0gKGNsYXNzU3RyaW5nMikgPT4gY2xhc3NTdHJpbmcyLnNwbGl0KFwiIFwiKS5maWx0ZXIoQm9vbGVhbik7XG4gIGxldCBtaXNzaW5nQ2xhc3NlcyA9IChjbGFzc1N0cmluZzIpID0+IGNsYXNzU3RyaW5nMi5zcGxpdChcIiBcIikuZmlsdGVyKChpKSA9PiAhZWwuY2xhc3NMaXN0LmNvbnRhaW5zKGkpKS5maWx0ZXIoQm9vbGVhbik7XG4gIGxldCBhZGRDbGFzc2VzQW5kUmV0dXJuVW5kbyA9IChjbGFzc2VzKSA9PiB7XG4gICAgZWwuY2xhc3NMaXN0LmFkZCguLi5jbGFzc2VzKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSguLi5jbGFzc2VzKTtcbiAgICB9O1xuICB9O1xuICBjbGFzc1N0cmluZyA9IGNsYXNzU3RyaW5nID09PSB0cnVlID8gY2xhc3NTdHJpbmcgPSBcIlwiIDogY2xhc3NTdHJpbmcgfHwgXCJcIjtcbiAgcmV0dXJuIGFkZENsYXNzZXNBbmRSZXR1cm5VbmRvKG1pc3NpbmdDbGFzc2VzKGNsYXNzU3RyaW5nKSk7XG59XG5mdW5jdGlvbiBzZXRDbGFzc2VzRnJvbU9iamVjdChlbCwgY2xhc3NPYmplY3QpIHtcbiAgbGV0IHNwbGl0ID0gKGNsYXNzU3RyaW5nKSA9PiBjbGFzc1N0cmluZy5zcGxpdChcIiBcIikuZmlsdGVyKEJvb2xlYW4pO1xuICBsZXQgZm9yQWRkID0gT2JqZWN0LmVudHJpZXMoY2xhc3NPYmplY3QpLmZsYXRNYXAoKFtjbGFzc1N0cmluZywgYm9vbF0pID0+IGJvb2wgPyBzcGxpdChjbGFzc1N0cmluZykgOiBmYWxzZSkuZmlsdGVyKEJvb2xlYW4pO1xuICBsZXQgZm9yUmVtb3ZlID0gT2JqZWN0LmVudHJpZXMoY2xhc3NPYmplY3QpLmZsYXRNYXAoKFtjbGFzc1N0cmluZywgYm9vbF0pID0+ICFib29sID8gc3BsaXQoY2xhc3NTdHJpbmcpIDogZmFsc2UpLmZpbHRlcihCb29sZWFuKTtcbiAgbGV0IGFkZGVkID0gW107XG4gIGxldCByZW1vdmVkID0gW107XG4gIGZvclJlbW92ZS5mb3JFYWNoKChpKSA9PiB7XG4gICAgaWYgKGVsLmNsYXNzTGlzdC5jb250YWlucyhpKSkge1xuICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZShpKTtcbiAgICAgIHJlbW92ZWQucHVzaChpKTtcbiAgICB9XG4gIH0pO1xuICBmb3JBZGQuZm9yRWFjaCgoaSkgPT4ge1xuICAgIGlmICghZWwuY2xhc3NMaXN0LmNvbnRhaW5zKGkpKSB7XG4gICAgICBlbC5jbGFzc0xpc3QuYWRkKGkpO1xuICAgICAgYWRkZWQucHVzaChpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHJlbW92ZWQuZm9yRWFjaCgoaSkgPT4gZWwuY2xhc3NMaXN0LmFkZChpKSk7XG4gICAgYWRkZWQuZm9yRWFjaCgoaSkgPT4gZWwuY2xhc3NMaXN0LnJlbW92ZShpKSk7XG4gIH07XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy9zdHlsZXMuanNcbmZ1bmN0aW9uIHNldFN0eWxlcyhlbCwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgIHJldHVybiBzZXRTdHlsZXNGcm9tT2JqZWN0KGVsLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHNldFN0eWxlc0Zyb21TdHJpbmcoZWwsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIHNldFN0eWxlc0Zyb21PYmplY3QoZWwsIHZhbHVlKSB7XG4gIGxldCBwcmV2aW91c1N0eWxlcyA9IHt9O1xuICBPYmplY3QuZW50cmllcyh2YWx1ZSkuZm9yRWFjaCgoW2tleSwgdmFsdWUyXSkgPT4ge1xuICAgIHByZXZpb3VzU3R5bGVzW2tleV0gPSBlbC5zdHlsZVtrZXldO1xuICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoXCItLVwiKSkge1xuICAgICAga2V5ID0ga2ViYWJDYXNlKGtleSk7XG4gICAgfVxuICAgIGVsLnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUyKTtcbiAgfSk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGlmIChlbC5zdHlsZS5sZW5ndGggPT09IDApIHtcbiAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShcInN0eWxlXCIpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgc2V0U3R5bGVzKGVsLCBwcmV2aW91c1N0eWxlcyk7XG4gIH07XG59XG5mdW5jdGlvbiBzZXRTdHlsZXNGcm9tU3RyaW5nKGVsLCB2YWx1ZSkge1xuICBsZXQgY2FjaGUgPSBlbC5nZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCB2YWx1ZSk7XG4gIGVsLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIHZhbHVlKTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBlbC5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBjYWNoZSB8fCBcIlwiKTtcbiAgfTtcbn1cbmZ1bmN0aW9uIGtlYmFiQ2FzZShzdWJqZWN0KSB7XG4gIHJldHVybiBzdWJqZWN0LnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csIFwiJDEtJDJcIikudG9Mb3dlckNhc2UoKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3V0aWxzL29uY2UuanNcbmZ1bmN0aW9uIG9uY2UoY2FsbGJhY2ssIGZhbGxiYWNrID0gKCkgPT4ge1xufSkge1xuICBsZXQgY2FsbGVkID0gZmFsc2U7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9O1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LXRyYW5zaXRpb24uanNcbmRpcmVjdGl2ZShcInRyYW5zaXRpb25cIiwgKGVsLCB7IHZhbHVlLCBtb2RpZmllcnMsIGV4cHJlc3Npb24gfSwgeyBldmFsdWF0ZTogZXZhbHVhdGUyIH0pID0+IHtcbiAgaWYgKHR5cGVvZiBleHByZXNzaW9uID09PSBcImZ1bmN0aW9uXCIpXG4gICAgZXhwcmVzc2lvbiA9IGV2YWx1YXRlMihleHByZXNzaW9uKTtcbiAgaWYgKGV4cHJlc3Npb24gPT09IGZhbHNlKVxuICAgIHJldHVybjtcbiAgaWYgKCFleHByZXNzaW9uIHx8IHR5cGVvZiBleHByZXNzaW9uID09PSBcImJvb2xlYW5cIikge1xuICAgIHJlZ2lzdGVyVHJhbnNpdGlvbnNGcm9tSGVscGVyKGVsLCBtb2RpZmllcnMsIHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICByZWdpc3RlclRyYW5zaXRpb25zRnJvbUNsYXNzU3RyaW5nKGVsLCBleHByZXNzaW9uLCB2YWx1ZSk7XG4gIH1cbn0pO1xuZnVuY3Rpb24gcmVnaXN0ZXJUcmFuc2l0aW9uc0Zyb21DbGFzc1N0cmluZyhlbCwgY2xhc3NTdHJpbmcsIHN0YWdlKSB7XG4gIHJlZ2lzdGVyVHJhbnNpdGlvbk9iamVjdChlbCwgc2V0Q2xhc3NlcywgXCJcIik7XG4gIGxldCBkaXJlY3RpdmVTdG9yYWdlTWFwID0ge1xuICAgIFwiZW50ZXJcIjogKGNsYXNzZXMpID0+IHtcbiAgICAgIGVsLl94X3RyYW5zaXRpb24uZW50ZXIuZHVyaW5nID0gY2xhc3NlcztcbiAgICB9LFxuICAgIFwiZW50ZXItc3RhcnRcIjogKGNsYXNzZXMpID0+IHtcbiAgICAgIGVsLl94X3RyYW5zaXRpb24uZW50ZXIuc3RhcnQgPSBjbGFzc2VzO1xuICAgIH0sXG4gICAgXCJlbnRlci1lbmRcIjogKGNsYXNzZXMpID0+IHtcbiAgICAgIGVsLl94X3RyYW5zaXRpb24uZW50ZXIuZW5kID0gY2xhc3NlcztcbiAgICB9LFxuICAgIFwibGVhdmVcIjogKGNsYXNzZXMpID0+IHtcbiAgICAgIGVsLl94X3RyYW5zaXRpb24ubGVhdmUuZHVyaW5nID0gY2xhc3NlcztcbiAgICB9LFxuICAgIFwibGVhdmUtc3RhcnRcIjogKGNsYXNzZXMpID0+IHtcbiAgICAgIGVsLl94X3RyYW5zaXRpb24ubGVhdmUuc3RhcnQgPSBjbGFzc2VzO1xuICAgIH0sXG4gICAgXCJsZWF2ZS1lbmRcIjogKGNsYXNzZXMpID0+IHtcbiAgICAgIGVsLl94X3RyYW5zaXRpb24ubGVhdmUuZW5kID0gY2xhc3NlcztcbiAgICB9XG4gIH07XG4gIGRpcmVjdGl2ZVN0b3JhZ2VNYXBbc3RhZ2VdKGNsYXNzU3RyaW5nKTtcbn1cbmZ1bmN0aW9uIHJlZ2lzdGVyVHJhbnNpdGlvbnNGcm9tSGVscGVyKGVsLCBtb2RpZmllcnMsIHN0YWdlKSB7XG4gIHJlZ2lzdGVyVHJhbnNpdGlvbk9iamVjdChlbCwgc2V0U3R5bGVzKTtcbiAgbGV0IGRvZXNudFNwZWNpZnkgPSAhbW9kaWZpZXJzLmluY2x1ZGVzKFwiaW5cIikgJiYgIW1vZGlmaWVycy5pbmNsdWRlcyhcIm91dFwiKSAmJiAhc3RhZ2U7XG4gIGxldCB0cmFuc2l0aW9uaW5nSW4gPSBkb2VzbnRTcGVjaWZ5IHx8IG1vZGlmaWVycy5pbmNsdWRlcyhcImluXCIpIHx8IFtcImVudGVyXCJdLmluY2x1ZGVzKHN0YWdlKTtcbiAgbGV0IHRyYW5zaXRpb25pbmdPdXQgPSBkb2VzbnRTcGVjaWZ5IHx8IG1vZGlmaWVycy5pbmNsdWRlcyhcIm91dFwiKSB8fCBbXCJsZWF2ZVwiXS5pbmNsdWRlcyhzdGFnZSk7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJpblwiKSAmJiAhZG9lc250U3BlY2lmeSkge1xuICAgIG1vZGlmaWVycyA9IG1vZGlmaWVycy5maWx0ZXIoKGksIGluZGV4KSA9PiBpbmRleCA8IG1vZGlmaWVycy5pbmRleE9mKFwib3V0XCIpKTtcbiAgfVxuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwib3V0XCIpICYmICFkb2VzbnRTcGVjaWZ5KSB7XG4gICAgbW9kaWZpZXJzID0gbW9kaWZpZXJzLmZpbHRlcigoaSwgaW5kZXgpID0+IGluZGV4ID4gbW9kaWZpZXJzLmluZGV4T2YoXCJvdXRcIikpO1xuICB9XG4gIGxldCB3YW50c0FsbCA9ICFtb2RpZmllcnMuaW5jbHVkZXMoXCJvcGFjaXR5XCIpICYmICFtb2RpZmllcnMuaW5jbHVkZXMoXCJzY2FsZVwiKTtcbiAgbGV0IHdhbnRzT3BhY2l0eSA9IHdhbnRzQWxsIHx8IG1vZGlmaWVycy5pbmNsdWRlcyhcIm9wYWNpdHlcIik7XG4gIGxldCB3YW50c1NjYWxlID0gd2FudHNBbGwgfHwgbW9kaWZpZXJzLmluY2x1ZGVzKFwic2NhbGVcIik7XG4gIGxldCBvcGFjaXR5VmFsdWUgPSB3YW50c09wYWNpdHkgPyAwIDogMTtcbiAgbGV0IHNjYWxlVmFsdWUgPSB3YW50c1NjYWxlID8gbW9kaWZpZXJWYWx1ZShtb2RpZmllcnMsIFwic2NhbGVcIiwgOTUpIC8gMTAwIDogMTtcbiAgbGV0IGRlbGF5ID0gbW9kaWZpZXJWYWx1ZShtb2RpZmllcnMsIFwiZGVsYXlcIiwgMCkgLyAxZTM7XG4gIGxldCBvcmlnaW4gPSBtb2RpZmllclZhbHVlKG1vZGlmaWVycywgXCJvcmlnaW5cIiwgXCJjZW50ZXJcIik7XG4gIGxldCBwcm9wZXJ0eSA9IFwib3BhY2l0eSwgdHJhbnNmb3JtXCI7XG4gIGxldCBkdXJhdGlvbkluID0gbW9kaWZpZXJWYWx1ZShtb2RpZmllcnMsIFwiZHVyYXRpb25cIiwgMTUwKSAvIDFlMztcbiAgbGV0IGR1cmF0aW9uT3V0ID0gbW9kaWZpZXJWYWx1ZShtb2RpZmllcnMsIFwiZHVyYXRpb25cIiwgNzUpIC8gMWUzO1xuICBsZXQgZWFzaW5nID0gYGN1YmljLWJlemllcigwLjQsIDAuMCwgMC4yLCAxKWA7XG4gIGlmICh0cmFuc2l0aW9uaW5nSW4pIHtcbiAgICBlbC5feF90cmFuc2l0aW9uLmVudGVyLmR1cmluZyA9IHtcbiAgICAgIHRyYW5zZm9ybU9yaWdpbjogb3JpZ2luLFxuICAgICAgdHJhbnNpdGlvbkRlbGF5OiBgJHtkZWxheX1zYCxcbiAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0eTogcHJvcGVydHksXG4gICAgICB0cmFuc2l0aW9uRHVyYXRpb246IGAke2R1cmF0aW9uSW59c2AsXG4gICAgICB0cmFuc2l0aW9uVGltaW5nRnVuY3Rpb246IGVhc2luZ1xuICAgIH07XG4gICAgZWwuX3hfdHJhbnNpdGlvbi5lbnRlci5zdGFydCA9IHtcbiAgICAgIG9wYWNpdHk6IG9wYWNpdHlWYWx1ZSxcbiAgICAgIHRyYW5zZm9ybTogYHNjYWxlKCR7c2NhbGVWYWx1ZX0pYFxuICAgIH07XG4gICAgZWwuX3hfdHJhbnNpdGlvbi5lbnRlci5lbmQgPSB7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgdHJhbnNmb3JtOiBgc2NhbGUoMSlgXG4gICAgfTtcbiAgfVxuICBpZiAodHJhbnNpdGlvbmluZ091dCkge1xuICAgIGVsLl94X3RyYW5zaXRpb24ubGVhdmUuZHVyaW5nID0ge1xuICAgICAgdHJhbnNmb3JtT3JpZ2luOiBvcmlnaW4sXG4gICAgICB0cmFuc2l0aW9uRGVsYXk6IGAke2RlbGF5fXNgLFxuICAgICAgdHJhbnNpdGlvblByb3BlcnR5OiBwcm9wZXJ0eSxcbiAgICAgIHRyYW5zaXRpb25EdXJhdGlvbjogYCR7ZHVyYXRpb25PdXR9c2AsXG4gICAgICB0cmFuc2l0aW9uVGltaW5nRnVuY3Rpb246IGVhc2luZ1xuICAgIH07XG4gICAgZWwuX3hfdHJhbnNpdGlvbi5sZWF2ZS5zdGFydCA9IHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICB0cmFuc2Zvcm06IGBzY2FsZSgxKWBcbiAgICB9O1xuICAgIGVsLl94X3RyYW5zaXRpb24ubGVhdmUuZW5kID0ge1xuICAgICAgb3BhY2l0eTogb3BhY2l0eVZhbHVlLFxuICAgICAgdHJhbnNmb3JtOiBgc2NhbGUoJHtzY2FsZVZhbHVlfSlgXG4gICAgfTtcbiAgfVxufVxuZnVuY3Rpb24gcmVnaXN0ZXJUcmFuc2l0aW9uT2JqZWN0KGVsLCBzZXRGdW5jdGlvbiwgZGVmYXVsdFZhbHVlID0ge30pIHtcbiAgaWYgKCFlbC5feF90cmFuc2l0aW9uKVxuICAgIGVsLl94X3RyYW5zaXRpb24gPSB7XG4gICAgICBlbnRlcjogeyBkdXJpbmc6IGRlZmF1bHRWYWx1ZSwgc3RhcnQ6IGRlZmF1bHRWYWx1ZSwgZW5kOiBkZWZhdWx0VmFsdWUgfSxcbiAgICAgIGxlYXZlOiB7IGR1cmluZzogZGVmYXVsdFZhbHVlLCBzdGFydDogZGVmYXVsdFZhbHVlLCBlbmQ6IGRlZmF1bHRWYWx1ZSB9LFxuICAgICAgaW4oYmVmb3JlID0gKCkgPT4ge1xuICAgICAgfSwgYWZ0ZXIgPSAoKSA9PiB7XG4gICAgICB9KSB7XG4gICAgICAgIHRyYW5zaXRpb24oZWwsIHNldEZ1bmN0aW9uLCB7XG4gICAgICAgICAgZHVyaW5nOiB0aGlzLmVudGVyLmR1cmluZyxcbiAgICAgICAgICBzdGFydDogdGhpcy5lbnRlci5zdGFydCxcbiAgICAgICAgICBlbmQ6IHRoaXMuZW50ZXIuZW5kXG4gICAgICAgIH0sIGJlZm9yZSwgYWZ0ZXIpO1xuICAgICAgfSxcbiAgICAgIG91dChiZWZvcmUgPSAoKSA9PiB7XG4gICAgICB9LCBhZnRlciA9ICgpID0+IHtcbiAgICAgIH0pIHtcbiAgICAgICAgdHJhbnNpdGlvbihlbCwgc2V0RnVuY3Rpb24sIHtcbiAgICAgICAgICBkdXJpbmc6IHRoaXMubGVhdmUuZHVyaW5nLFxuICAgICAgICAgIHN0YXJ0OiB0aGlzLmxlYXZlLnN0YXJ0LFxuICAgICAgICAgIGVuZDogdGhpcy5sZWF2ZS5lbmRcbiAgICAgICAgfSwgYmVmb3JlLCBhZnRlcik7XG4gICAgICB9XG4gICAgfTtcbn1cbndpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5feF90b2dnbGVBbmRDYXNjYWRlV2l0aFRyYW5zaXRpb25zID0gZnVuY3Rpb24oZWwsIHZhbHVlLCBzaG93LCBoaWRlKSB7XG4gIGNvbnN0IG5leHRUaWNrMiA9IGRvY3VtZW50LnZpc2liaWxpdHlTdGF0ZSA9PT0gXCJ2aXNpYmxlXCIgPyByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgOiBzZXRUaW1lb3V0O1xuICBsZXQgY2xpY2tBd2F5Q29tcGF0aWJsZVNob3cgPSAoKSA9PiBuZXh0VGljazIoc2hvdyk7XG4gIGlmICh2YWx1ZSkge1xuICAgIGlmIChlbC5feF90cmFuc2l0aW9uICYmIChlbC5feF90cmFuc2l0aW9uLmVudGVyIHx8IGVsLl94X3RyYW5zaXRpb24ubGVhdmUpKSB7XG4gICAgICBlbC5feF90cmFuc2l0aW9uLmVudGVyICYmIChPYmplY3QuZW50cmllcyhlbC5feF90cmFuc2l0aW9uLmVudGVyLmR1cmluZykubGVuZ3RoIHx8IE9iamVjdC5lbnRyaWVzKGVsLl94X3RyYW5zaXRpb24uZW50ZXIuc3RhcnQpLmxlbmd0aCB8fCBPYmplY3QuZW50cmllcyhlbC5feF90cmFuc2l0aW9uLmVudGVyLmVuZCkubGVuZ3RoKSA/IGVsLl94X3RyYW5zaXRpb24uaW4oc2hvdykgOiBjbGlja0F3YXlDb21wYXRpYmxlU2hvdygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5feF90cmFuc2l0aW9uID8gZWwuX3hfdHJhbnNpdGlvbi5pbihzaG93KSA6IGNsaWNrQXdheUNvbXBhdGlibGVTaG93KCk7XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICBlbC5feF9oaWRlUHJvbWlzZSA9IGVsLl94X3RyYW5zaXRpb24gPyBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgZWwuX3hfdHJhbnNpdGlvbi5vdXQoKCkgPT4ge1xuICAgIH0sICgpID0+IHJlc29sdmUoaGlkZSkpO1xuICAgIGVsLl94X3RyYW5zaXRpb25pbmcgJiYgZWwuX3hfdHJhbnNpdGlvbmluZy5iZWZvcmVDYW5jZWwoKCkgPT4gcmVqZWN0KHsgaXNGcm9tQ2FuY2VsbGVkVHJhbnNpdGlvbjogdHJ1ZSB9KSk7XG4gIH0pIDogUHJvbWlzZS5yZXNvbHZlKGhpZGUpO1xuICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgbGV0IGNsb3Nlc3QgPSBjbG9zZXN0SGlkZShlbCk7XG4gICAgaWYgKGNsb3Nlc3QpIHtcbiAgICAgIGlmICghY2xvc2VzdC5feF9oaWRlQ2hpbGRyZW4pXG4gICAgICAgIGNsb3Nlc3QuX3hfaGlkZUNoaWxkcmVuID0gW107XG4gICAgICBjbG9zZXN0Ll94X2hpZGVDaGlsZHJlbi5wdXNoKGVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dFRpY2syKCgpID0+IHtcbiAgICAgICAgbGV0IGhpZGVBZnRlckNoaWxkcmVuID0gKGVsMikgPT4ge1xuICAgICAgICAgIGxldCBjYXJyeSA9IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgIGVsMi5feF9oaWRlUHJvbWlzZSxcbiAgICAgICAgICAgIC4uLihlbDIuX3hfaGlkZUNoaWxkcmVuIHx8IFtdKS5tYXAoaGlkZUFmdGVyQ2hpbGRyZW4pXG4gICAgICAgICAgXSkudGhlbigoW2ldKSA9PiBpPy4oKSk7XG4gICAgICAgICAgZGVsZXRlIGVsMi5feF9oaWRlUHJvbWlzZTtcbiAgICAgICAgICBkZWxldGUgZWwyLl94X2hpZGVDaGlsZHJlbjtcbiAgICAgICAgICByZXR1cm4gY2Fycnk7XG4gICAgICAgIH07XG4gICAgICAgIGhpZGVBZnRlckNoaWxkcmVuKGVsKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgIGlmICghZS5pc0Zyb21DYW5jZWxsZWRUcmFuc2l0aW9uKVxuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufTtcbmZ1bmN0aW9uIGNsb3Nlc3RIaWRlKGVsKSB7XG4gIGxldCBwYXJlbnQgPSBlbC5wYXJlbnROb2RlO1xuICBpZiAoIXBhcmVudClcbiAgICByZXR1cm47XG4gIHJldHVybiBwYXJlbnQuX3hfaGlkZVByb21pc2UgPyBwYXJlbnQgOiBjbG9zZXN0SGlkZShwYXJlbnQpO1xufVxuZnVuY3Rpb24gdHJhbnNpdGlvbihlbCwgc2V0RnVuY3Rpb24sIHsgZHVyaW5nLCBzdGFydDogc3RhcnQyLCBlbmQgfSA9IHt9LCBiZWZvcmUgPSAoKSA9PiB7XG59LCBhZnRlciA9ICgpID0+IHtcbn0pIHtcbiAgaWYgKGVsLl94X3RyYW5zaXRpb25pbmcpXG4gICAgZWwuX3hfdHJhbnNpdGlvbmluZy5jYW5jZWwoKTtcbiAgaWYgKE9iamVjdC5rZXlzKGR1cmluZykubGVuZ3RoID09PSAwICYmIE9iamVjdC5rZXlzKHN0YXJ0MikubGVuZ3RoID09PSAwICYmIE9iamVjdC5rZXlzKGVuZCkubGVuZ3RoID09PSAwKSB7XG4gICAgYmVmb3JlKCk7XG4gICAgYWZ0ZXIoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IHVuZG9TdGFydCwgdW5kb0R1cmluZywgdW5kb0VuZDtcbiAgcGVyZm9ybVRyYW5zaXRpb24oZWwsIHtcbiAgICBzdGFydCgpIHtcbiAgICAgIHVuZG9TdGFydCA9IHNldEZ1bmN0aW9uKGVsLCBzdGFydDIpO1xuICAgIH0sXG4gICAgZHVyaW5nKCkge1xuICAgICAgdW5kb0R1cmluZyA9IHNldEZ1bmN0aW9uKGVsLCBkdXJpbmcpO1xuICAgIH0sXG4gICAgYmVmb3JlLFxuICAgIGVuZCgpIHtcbiAgICAgIHVuZG9TdGFydCgpO1xuICAgICAgdW5kb0VuZCA9IHNldEZ1bmN0aW9uKGVsLCBlbmQpO1xuICAgIH0sXG4gICAgYWZ0ZXIsXG4gICAgY2xlYW51cCgpIHtcbiAgICAgIHVuZG9EdXJpbmcoKTtcbiAgICAgIHVuZG9FbmQoKTtcbiAgICB9XG4gIH0pO1xufVxuZnVuY3Rpb24gcGVyZm9ybVRyYW5zaXRpb24oZWwsIHN0YWdlcykge1xuICBsZXQgaW50ZXJydXB0ZWQsIHJlYWNoZWRCZWZvcmUsIHJlYWNoZWRFbmQ7XG4gIGxldCBmaW5pc2ggPSBvbmNlKCgpID0+IHtcbiAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgaW50ZXJydXB0ZWQgPSB0cnVlO1xuICAgICAgaWYgKCFyZWFjaGVkQmVmb3JlKVxuICAgICAgICBzdGFnZXMuYmVmb3JlKCk7XG4gICAgICBpZiAoIXJlYWNoZWRFbmQpIHtcbiAgICAgICAgc3RhZ2VzLmVuZCgpO1xuICAgICAgICByZWxlYXNlTmV4dFRpY2tzKCk7XG4gICAgICB9XG4gICAgICBzdGFnZXMuYWZ0ZXIoKTtcbiAgICAgIGlmIChlbC5pc0Nvbm5lY3RlZClcbiAgICAgICAgc3RhZ2VzLmNsZWFudXAoKTtcbiAgICAgIGRlbGV0ZSBlbC5feF90cmFuc2l0aW9uaW5nO1xuICAgIH0pO1xuICB9KTtcbiAgZWwuX3hfdHJhbnNpdGlvbmluZyA9IHtcbiAgICBiZWZvcmVDYW5jZWxzOiBbXSxcbiAgICBiZWZvcmVDYW5jZWwoY2FsbGJhY2spIHtcbiAgICAgIHRoaXMuYmVmb3JlQ2FuY2Vscy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9LFxuICAgIGNhbmNlbDogb25jZShmdW5jdGlvbigpIHtcbiAgICAgIHdoaWxlICh0aGlzLmJlZm9yZUNhbmNlbHMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuYmVmb3JlQ2FuY2Vscy5zaGlmdCgpKCk7XG4gICAgICB9XG4gICAgICA7XG4gICAgICBmaW5pc2goKTtcbiAgICB9KSxcbiAgICBmaW5pc2hcbiAgfTtcbiAgbXV0YXRlRG9tKCgpID0+IHtcbiAgICBzdGFnZXMuc3RhcnQoKTtcbiAgICBzdGFnZXMuZHVyaW5nKCk7XG4gIH0pO1xuICBob2xkTmV4dFRpY2tzKCk7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgaWYgKGludGVycnVwdGVkKVxuICAgICAgcmV0dXJuO1xuICAgIGxldCBkdXJhdGlvbiA9IE51bWJlcihnZXRDb21wdXRlZFN0eWxlKGVsKS50cmFuc2l0aW9uRHVyYXRpb24ucmVwbGFjZSgvLC4qLywgXCJcIikucmVwbGFjZShcInNcIiwgXCJcIikpICogMWUzO1xuICAgIGxldCBkZWxheSA9IE51bWJlcihnZXRDb21wdXRlZFN0eWxlKGVsKS50cmFuc2l0aW9uRGVsYXkucmVwbGFjZSgvLC4qLywgXCJcIikucmVwbGFjZShcInNcIiwgXCJcIikpICogMWUzO1xuICAgIGlmIChkdXJhdGlvbiA9PT0gMClcbiAgICAgIGR1cmF0aW9uID0gTnVtYmVyKGdldENvbXB1dGVkU3R5bGUoZWwpLmFuaW1hdGlvbkR1cmF0aW9uLnJlcGxhY2UoXCJzXCIsIFwiXCIpKSAqIDFlMztcbiAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgc3RhZ2VzLmJlZm9yZSgpO1xuICAgIH0pO1xuICAgIHJlYWNoZWRCZWZvcmUgPSB0cnVlO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBpZiAoaW50ZXJydXB0ZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICAgIHN0YWdlcy5lbmQoKTtcbiAgICAgIH0pO1xuICAgICAgcmVsZWFzZU5leHRUaWNrcygpO1xuICAgICAgc2V0VGltZW91dChlbC5feF90cmFuc2l0aW9uaW5nLmZpbmlzaCwgZHVyYXRpb24gKyBkZWxheSk7XG4gICAgICByZWFjaGVkRW5kID0gdHJ1ZTtcbiAgICB9KTtcbiAgfSk7XG59XG5mdW5jdGlvbiBtb2RpZmllclZhbHVlKG1vZGlmaWVycywga2V5LCBmYWxsYmFjaykge1xuICBpZiAobW9kaWZpZXJzLmluZGV4T2Yoa2V5KSA9PT0gLTEpXG4gICAgcmV0dXJuIGZhbGxiYWNrO1xuICBjb25zdCByYXdWYWx1ZSA9IG1vZGlmaWVyc1ttb2RpZmllcnMuaW5kZXhPZihrZXkpICsgMV07XG4gIGlmICghcmF3VmFsdWUpXG4gICAgcmV0dXJuIGZhbGxiYWNrO1xuICBpZiAoa2V5ID09PSBcInNjYWxlXCIpIHtcbiAgICBpZiAoaXNOYU4ocmF3VmFsdWUpKVxuICAgICAgcmV0dXJuIGZhbGxiYWNrO1xuICB9XG4gIGlmIChrZXkgPT09IFwiZHVyYXRpb25cIiB8fCBrZXkgPT09IFwiZGVsYXlcIikge1xuICAgIGxldCBtYXRjaCA9IHJhd1ZhbHVlLm1hdGNoKC8oWzAtOV0rKW1zLyk7XG4gICAgaWYgKG1hdGNoKVxuICAgICAgcmV0dXJuIG1hdGNoWzFdO1xuICB9XG4gIGlmIChrZXkgPT09IFwib3JpZ2luXCIpIHtcbiAgICBpZiAoW1widG9wXCIsIFwicmlnaHRcIiwgXCJsZWZ0XCIsIFwiY2VudGVyXCIsIFwiYm90dG9tXCJdLmluY2x1ZGVzKG1vZGlmaWVyc1ttb2RpZmllcnMuaW5kZXhPZihrZXkpICsgMl0pKSB7XG4gICAgICByZXR1cm4gW3Jhd1ZhbHVlLCBtb2RpZmllcnNbbW9kaWZpZXJzLmluZGV4T2Yoa2V5KSArIDJdXS5qb2luKFwiIFwiKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJhd1ZhbHVlO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvY2xvbmUuanNcbnZhciBpc0Nsb25pbmcgPSBmYWxzZTtcbmZ1bmN0aW9uIHNraXBEdXJpbmdDbG9uZShjYWxsYmFjaywgZmFsbGJhY2sgPSAoKSA9PiB7XG59KSB7XG4gIHJldHVybiAoLi4uYXJncykgPT4gaXNDbG9uaW5nID8gZmFsbGJhY2soLi4uYXJncykgOiBjYWxsYmFjayguLi5hcmdzKTtcbn1cbmZ1bmN0aW9uIG9ubHlEdXJpbmdDbG9uZShjYWxsYmFjaykge1xuICByZXR1cm4gKC4uLmFyZ3MpID0+IGlzQ2xvbmluZyAmJiBjYWxsYmFjayguLi5hcmdzKTtcbn1cbnZhciBpbnRlcmNlcHRvcnMgPSBbXTtcbmZ1bmN0aW9uIGludGVyY2VwdENsb25lKGNhbGxiYWNrKSB7XG4gIGludGVyY2VwdG9ycy5wdXNoKGNhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIGNsb25lTm9kZShmcm9tLCB0bykge1xuICBpbnRlcmNlcHRvcnMuZm9yRWFjaCgoaSkgPT4gaShmcm9tLCB0bykpO1xuICBpc0Nsb25pbmcgPSB0cnVlO1xuICBkb250UmVnaXN0ZXJSZWFjdGl2ZVNpZGVFZmZlY3RzKCgpID0+IHtcbiAgICBpbml0VHJlZSh0bywgKGVsLCBjYWxsYmFjaykgPT4ge1xuICAgICAgY2FsbGJhY2soZWwsICgpID0+IHtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbiAgaXNDbG9uaW5nID0gZmFsc2U7XG59XG52YXIgaXNDbG9uaW5nTGVnYWN5ID0gZmFsc2U7XG5mdW5jdGlvbiBjbG9uZShvbGRFbCwgbmV3RWwpIHtcbiAgaWYgKCFuZXdFbC5feF9kYXRhU3RhY2spXG4gICAgbmV3RWwuX3hfZGF0YVN0YWNrID0gb2xkRWwuX3hfZGF0YVN0YWNrO1xuICBpc0Nsb25pbmcgPSB0cnVlO1xuICBpc0Nsb25pbmdMZWdhY3kgPSB0cnVlO1xuICBkb250UmVnaXN0ZXJSZWFjdGl2ZVNpZGVFZmZlY3RzKCgpID0+IHtcbiAgICBjbG9uZVRyZWUobmV3RWwpO1xuICB9KTtcbiAgaXNDbG9uaW5nID0gZmFsc2U7XG4gIGlzQ2xvbmluZ0xlZ2FjeSA9IGZhbHNlO1xufVxuZnVuY3Rpb24gY2xvbmVUcmVlKGVsKSB7XG4gIGxldCBoYXNSdW5UaHJvdWdoRmlyc3RFbCA9IGZhbHNlO1xuICBsZXQgc2hhbGxvd1dhbGtlciA9IChlbDIsIGNhbGxiYWNrKSA9PiB7XG4gICAgd2FsayhlbDIsIChlbDMsIHNraXApID0+IHtcbiAgICAgIGlmIChoYXNSdW5UaHJvdWdoRmlyc3RFbCAmJiBpc1Jvb3QoZWwzKSlcbiAgICAgICAgcmV0dXJuIHNraXAoKTtcbiAgICAgIGhhc1J1blRocm91Z2hGaXJzdEVsID0gdHJ1ZTtcbiAgICAgIGNhbGxiYWNrKGVsMywgc2tpcCk7XG4gICAgfSk7XG4gIH07XG4gIGluaXRUcmVlKGVsLCBzaGFsbG93V2Fsa2VyKTtcbn1cbmZ1bmN0aW9uIGRvbnRSZWdpc3RlclJlYWN0aXZlU2lkZUVmZmVjdHMoY2FsbGJhY2spIHtcbiAgbGV0IGNhY2hlID0gZWZmZWN0O1xuICBvdmVycmlkZUVmZmVjdCgoY2FsbGJhY2syLCBlbCkgPT4ge1xuICAgIGxldCBzdG9yZWRFZmZlY3QgPSBjYWNoZShjYWxsYmFjazIpO1xuICAgIHJlbGVhc2Uoc3RvcmVkRWZmZWN0KTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgIH07XG4gIH0pO1xuICBjYWxsYmFjaygpO1xuICBvdmVycmlkZUVmZmVjdChjYWNoZSk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy9iaW5kLmpzXG5mdW5jdGlvbiBiaW5kKGVsLCBuYW1lLCB2YWx1ZSwgbW9kaWZpZXJzID0gW10pIHtcbiAgaWYgKCFlbC5feF9iaW5kaW5ncylcbiAgICBlbC5feF9iaW5kaW5ncyA9IHJlYWN0aXZlKHt9KTtcbiAgZWwuX3hfYmluZGluZ3NbbmFtZV0gPSB2YWx1ZTtcbiAgbmFtZSA9IG1vZGlmaWVycy5pbmNsdWRlcyhcImNhbWVsXCIpID8gY2FtZWxDYXNlKG5hbWUpIDogbmFtZTtcbiAgc3dpdGNoIChuYW1lKSB7XG4gICAgY2FzZSBcInZhbHVlXCI6XG4gICAgICBiaW5kSW5wdXRWYWx1ZShlbCwgdmFsdWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInN0eWxlXCI6XG4gICAgICBiaW5kU3R5bGVzKGVsLCB2YWx1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiY2xhc3NcIjpcbiAgICAgIGJpbmRDbGFzc2VzKGVsLCB2YWx1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwic2VsZWN0ZWRcIjpcbiAgICBjYXNlIFwiY2hlY2tlZFwiOlxuICAgICAgYmluZEF0dHJpYnV0ZUFuZFByb3BlcnR5KGVsLCBuYW1lLCB2YWx1ZSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYmluZEF0dHJpYnV0ZShlbCwgbmFtZSwgdmFsdWUpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cbmZ1bmN0aW9uIGJpbmRJbnB1dFZhbHVlKGVsLCB2YWx1ZSkge1xuICBpZiAoaXNSYWRpbyhlbCkpIHtcbiAgICBpZiAoZWwuYXR0cmlidXRlcy52YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICBlbC52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBpZiAod2luZG93LmZyb21Nb2RlbCkge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgZWwuY2hlY2tlZCA9IHNhZmVQYXJzZUJvb2xlYW4oZWwudmFsdWUpID09PSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSBjaGVja2VkQXR0ckxvb3NlQ29tcGFyZShlbC52YWx1ZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChpc0NoZWNrYm94KGVsKSkge1xuICAgIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSkge1xuICAgICAgZWwudmFsdWUgPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgIT09IFwiYm9vbGVhblwiICYmICFbbnVsbCwgdm9pZCAwXS5pbmNsdWRlcyh2YWx1ZSkpIHtcbiAgICAgIGVsLnZhbHVlID0gU3RyaW5nKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSB2YWx1ZS5zb21lKCh2YWwpID0+IGNoZWNrZWRBdHRyTG9vc2VDb21wYXJlKHZhbCwgZWwudmFsdWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSAhIXZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChlbC50YWdOYW1lID09PSBcIlNFTEVDVFwiKSB7XG4gICAgdXBkYXRlU2VsZWN0KGVsLCB2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGVsLnZhbHVlID09PSB2YWx1ZSlcbiAgICAgIHJldHVybjtcbiAgICBlbC52YWx1ZSA9IHZhbHVlID09PSB2b2lkIDAgPyBcIlwiIDogdmFsdWU7XG4gIH1cbn1cbmZ1bmN0aW9uIGJpbmRDbGFzc2VzKGVsLCB2YWx1ZSkge1xuICBpZiAoZWwuX3hfdW5kb0FkZGVkQ2xhc3NlcylcbiAgICBlbC5feF91bmRvQWRkZWRDbGFzc2VzKCk7XG4gIGVsLl94X3VuZG9BZGRlZENsYXNzZXMgPSBzZXRDbGFzc2VzKGVsLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBiaW5kU3R5bGVzKGVsLCB2YWx1ZSkge1xuICBpZiAoZWwuX3hfdW5kb0FkZGVkU3R5bGVzKVxuICAgIGVsLl94X3VuZG9BZGRlZFN0eWxlcygpO1xuICBlbC5feF91bmRvQWRkZWRTdHlsZXMgPSBzZXRTdHlsZXMoZWwsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIGJpbmRBdHRyaWJ1dGVBbmRQcm9wZXJ0eShlbCwgbmFtZSwgdmFsdWUpIHtcbiAgYmluZEF0dHJpYnV0ZShlbCwgbmFtZSwgdmFsdWUpO1xuICBzZXRQcm9wZXJ0eUlmQ2hhbmdlZChlbCwgbmFtZSwgdmFsdWUpO1xufVxuZnVuY3Rpb24gYmluZEF0dHJpYnV0ZShlbCwgbmFtZSwgdmFsdWUpIHtcbiAgaWYgKFtudWxsLCB2b2lkIDAsIGZhbHNlXS5pbmNsdWRlcyh2YWx1ZSkgJiYgYXR0cmlidXRlU2hvdWxkbnRCZVByZXNlcnZlZElmRmFsc3kobmFtZSkpIHtcbiAgICBlbC5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGlzQm9vbGVhbkF0dHIobmFtZSkpXG4gICAgICB2YWx1ZSA9IG5hbWU7XG4gICAgc2V0SWZDaGFuZ2VkKGVsLCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn1cbmZ1bmN0aW9uIHNldElmQ2hhbmdlZChlbCwgYXR0ck5hbWUsIHZhbHVlKSB7XG4gIGlmIChlbC5nZXRBdHRyaWJ1dGUoYXR0ck5hbWUpICE9IHZhbHVlKSB7XG4gICAgZWwuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCB2YWx1ZSk7XG4gIH1cbn1cbmZ1bmN0aW9uIHNldFByb3BlcnR5SWZDaGFuZ2VkKGVsLCBwcm9wTmFtZSwgdmFsdWUpIHtcbiAgaWYgKGVsW3Byb3BOYW1lXSAhPT0gdmFsdWUpIHtcbiAgICBlbFtwcm9wTmFtZV0gPSB2YWx1ZTtcbiAgfVxufVxuZnVuY3Rpb24gdXBkYXRlU2VsZWN0KGVsLCB2YWx1ZSkge1xuICBjb25zdCBhcnJheVdyYXBwZWRWYWx1ZSA9IFtdLmNvbmNhdCh2YWx1ZSkubWFwKCh2YWx1ZTIpID0+IHtcbiAgICByZXR1cm4gdmFsdWUyICsgXCJcIjtcbiAgfSk7XG4gIEFycmF5LmZyb20oZWwub3B0aW9ucykuZm9yRWFjaCgob3B0aW9uKSA9PiB7XG4gICAgb3B0aW9uLnNlbGVjdGVkID0gYXJyYXlXcmFwcGVkVmFsdWUuaW5jbHVkZXMob3B0aW9uLnZhbHVlKTtcbiAgfSk7XG59XG5mdW5jdGlvbiBjYW1lbENhc2Uoc3ViamVjdCkge1xuICByZXR1cm4gc3ViamVjdC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLy0oXFx3KS9nLCAobWF0Y2gsIGNoYXIpID0+IGNoYXIudG9VcHBlckNhc2UoKSk7XG59XG5mdW5jdGlvbiBjaGVja2VkQXR0ckxvb3NlQ29tcGFyZSh2YWx1ZUEsIHZhbHVlQikge1xuICByZXR1cm4gdmFsdWVBID09IHZhbHVlQjtcbn1cbmZ1bmN0aW9uIHNhZmVQYXJzZUJvb2xlYW4ocmF3VmFsdWUpIHtcbiAgaWYgKFsxLCBcIjFcIiwgXCJ0cnVlXCIsIFwib25cIiwgXCJ5ZXNcIiwgdHJ1ZV0uaW5jbHVkZXMocmF3VmFsdWUpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKFswLCBcIjBcIiwgXCJmYWxzZVwiLCBcIm9mZlwiLCBcIm5vXCIsIGZhbHNlXS5pbmNsdWRlcyhyYXdWYWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHJhd1ZhbHVlID8gQm9vbGVhbihyYXdWYWx1ZSkgOiBudWxsO1xufVxudmFyIGJvb2xlYW5BdHRyaWJ1dGVzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoW1xuICBcImFsbG93ZnVsbHNjcmVlblwiLFxuICBcImFzeW5jXCIsXG4gIFwiYXV0b2ZvY3VzXCIsXG4gIFwiYXV0b3BsYXlcIixcbiAgXCJjaGVja2VkXCIsXG4gIFwiY29udHJvbHNcIixcbiAgXCJkZWZhdWx0XCIsXG4gIFwiZGVmZXJcIixcbiAgXCJkaXNhYmxlZFwiLFxuICBcImZvcm1ub3ZhbGlkYXRlXCIsXG4gIFwiaW5lcnRcIixcbiAgXCJpc21hcFwiLFxuICBcIml0ZW1zY29wZVwiLFxuICBcImxvb3BcIixcbiAgXCJtdWx0aXBsZVwiLFxuICBcIm11dGVkXCIsXG4gIFwibm9tb2R1bGVcIixcbiAgXCJub3ZhbGlkYXRlXCIsXG4gIFwib3BlblwiLFxuICBcInBsYXlzaW5saW5lXCIsXG4gIFwicmVhZG9ubHlcIixcbiAgXCJyZXF1aXJlZFwiLFxuICBcInJldmVyc2VkXCIsXG4gIFwic2VsZWN0ZWRcIixcbiAgXCJzaGFkb3dyb290Y2xvbmFibGVcIixcbiAgXCJzaGFkb3dyb290ZGVsZWdhdGVzZm9jdXNcIixcbiAgXCJzaGFkb3dyb290c2VyaWFsaXphYmxlXCJcbl0pO1xuZnVuY3Rpb24gaXNCb29sZWFuQXR0cihhdHRyTmFtZSkge1xuICByZXR1cm4gYm9vbGVhbkF0dHJpYnV0ZXMuaGFzKGF0dHJOYW1lKTtcbn1cbmZ1bmN0aW9uIGF0dHJpYnV0ZVNob3VsZG50QmVQcmVzZXJ2ZWRJZkZhbHN5KG5hbWUpIHtcbiAgcmV0dXJuICFbXCJhcmlhLXByZXNzZWRcIiwgXCJhcmlhLWNoZWNrZWRcIiwgXCJhcmlhLWV4cGFuZGVkXCIsIFwiYXJpYS1zZWxlY3RlZFwiXS5pbmNsdWRlcyhuYW1lKTtcbn1cbmZ1bmN0aW9uIGdldEJpbmRpbmcoZWwsIG5hbWUsIGZhbGxiYWNrKSB7XG4gIGlmIChlbC5feF9iaW5kaW5ncyAmJiBlbC5feF9iaW5kaW5nc1tuYW1lXSAhPT0gdm9pZCAwKVxuICAgIHJldHVybiBlbC5feF9iaW5kaW5nc1tuYW1lXTtcbiAgcmV0dXJuIGdldEF0dHJpYnV0ZUJpbmRpbmcoZWwsIG5hbWUsIGZhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIGV4dHJhY3RQcm9wKGVsLCBuYW1lLCBmYWxsYmFjaywgZXh0cmFjdCA9IHRydWUpIHtcbiAgaWYgKGVsLl94X2JpbmRpbmdzICYmIGVsLl94X2JpbmRpbmdzW25hbWVdICE9PSB2b2lkIDApXG4gICAgcmV0dXJuIGVsLl94X2JpbmRpbmdzW25hbWVdO1xuICBpZiAoZWwuX3hfaW5saW5lQmluZGluZ3MgJiYgZWwuX3hfaW5saW5lQmluZGluZ3NbbmFtZV0gIT09IHZvaWQgMCkge1xuICAgIGxldCBiaW5kaW5nID0gZWwuX3hfaW5saW5lQmluZGluZ3NbbmFtZV07XG4gICAgYmluZGluZy5leHRyYWN0ID0gZXh0cmFjdDtcbiAgICByZXR1cm4gZG9udEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucygoKSA9PiB7XG4gICAgICByZXR1cm4gZXZhbHVhdGUoZWwsIGJpbmRpbmcuZXhwcmVzc2lvbik7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGdldEF0dHJpYnV0ZUJpbmRpbmcoZWwsIG5hbWUsIGZhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIGdldEF0dHJpYnV0ZUJpbmRpbmcoZWwsIG5hbWUsIGZhbGxiYWNrKSB7XG4gIGxldCBhdHRyID0gZWwuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICBpZiAoYXR0ciA9PT0gbnVsbClcbiAgICByZXR1cm4gdHlwZW9mIGZhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIgPyBmYWxsYmFjaygpIDogZmFsbGJhY2s7XG4gIGlmIChhdHRyID09PSBcIlwiKVxuICAgIHJldHVybiB0cnVlO1xuICBpZiAoaXNCb29sZWFuQXR0cihuYW1lKSkge1xuICAgIHJldHVybiAhIVtuYW1lLCBcInRydWVcIl0uaW5jbHVkZXMoYXR0cik7XG4gIH1cbiAgcmV0dXJuIGF0dHI7XG59XG5mdW5jdGlvbiBpc0NoZWNrYm94KGVsKSB7XG4gIHJldHVybiBlbC50eXBlID09PSBcImNoZWNrYm94XCIgfHwgZWwubG9jYWxOYW1lID09PSBcInVpLWNoZWNrYm94XCIgfHwgZWwubG9jYWxOYW1lID09PSBcInVpLXN3aXRjaFwiO1xufVxuZnVuY3Rpb24gaXNSYWRpbyhlbCkge1xuICByZXR1cm4gZWwudHlwZSA9PT0gXCJyYWRpb1wiIHx8IGVsLmxvY2FsTmFtZSA9PT0gXCJ1aS1yYWRpb1wiO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvZGVib3VuY2UuanNcbmZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHdhaXQpIHtcbiAgbGV0IHRpbWVvdXQ7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICBjb25zdCBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH07XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgfTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3V0aWxzL3Rocm90dGxlLmpzXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCBsaW1pdCkge1xuICBsZXQgaW5UaHJvdHRsZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGxldCBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcbiAgICBpZiAoIWluVGhyb3R0bGUpIHtcbiAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBpblRocm90dGxlID0gdHJ1ZTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gaW5UaHJvdHRsZSA9IGZhbHNlLCBsaW1pdCk7XG4gICAgfVxuICB9O1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZW50YW5nbGUuanNcbmZ1bmN0aW9uIGVudGFuZ2xlKHsgZ2V0OiBvdXRlckdldCwgc2V0OiBvdXRlclNldCB9LCB7IGdldDogaW5uZXJHZXQsIHNldDogaW5uZXJTZXQgfSkge1xuICBsZXQgZmlyc3RSdW4gPSB0cnVlO1xuICBsZXQgb3V0ZXJIYXNoO1xuICBsZXQgaW5uZXJIYXNoO1xuICBsZXQgcmVmZXJlbmNlID0gZWZmZWN0KCgpID0+IHtcbiAgICBsZXQgb3V0ZXIgPSBvdXRlckdldCgpO1xuICAgIGxldCBpbm5lciA9IGlubmVyR2V0KCk7XG4gICAgaWYgKGZpcnN0UnVuKSB7XG4gICAgICBpbm5lclNldChjbG9uZUlmT2JqZWN0KG91dGVyKSk7XG4gICAgICBmaXJzdFJ1biA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgb3V0ZXJIYXNoTGF0ZXN0ID0gSlNPTi5zdHJpbmdpZnkob3V0ZXIpO1xuICAgICAgbGV0IGlubmVySGFzaExhdGVzdCA9IEpTT04uc3RyaW5naWZ5KGlubmVyKTtcbiAgICAgIGlmIChvdXRlckhhc2hMYXRlc3QgIT09IG91dGVySGFzaCkge1xuICAgICAgICBpbm5lclNldChjbG9uZUlmT2JqZWN0KG91dGVyKSk7XG4gICAgICB9IGVsc2UgaWYgKG91dGVySGFzaExhdGVzdCAhPT0gaW5uZXJIYXNoTGF0ZXN0KSB7XG4gICAgICAgIG91dGVyU2V0KGNsb25lSWZPYmplY3QoaW5uZXIpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICB9XG4gICAgfVxuICAgIG91dGVySGFzaCA9IEpTT04uc3RyaW5naWZ5KG91dGVyR2V0KCkpO1xuICAgIGlubmVySGFzaCA9IEpTT04uc3RyaW5naWZ5KGlubmVyR2V0KCkpO1xuICB9KTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICByZWxlYXNlKHJlZmVyZW5jZSk7XG4gIH07XG59XG5mdW5jdGlvbiBjbG9uZUlmT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgPyBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSkgOiB2YWx1ZTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3BsdWdpbi5qc1xuZnVuY3Rpb24gcGx1Z2luKGNhbGxiYWNrKSB7XG4gIGxldCBjYWxsYmFja3MgPSBBcnJheS5pc0FycmF5KGNhbGxiYWNrKSA/IGNhbGxiYWNrIDogW2NhbGxiYWNrXTtcbiAgY2FsbGJhY2tzLmZvckVhY2goKGkpID0+IGkoYWxwaW5lX2RlZmF1bHQpKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3N0b3JlLmpzXG52YXIgc3RvcmVzID0ge307XG52YXIgaXNSZWFjdGl2ZSA9IGZhbHNlO1xuZnVuY3Rpb24gc3RvcmUobmFtZSwgdmFsdWUpIHtcbiAgaWYgKCFpc1JlYWN0aXZlKSB7XG4gICAgc3RvcmVzID0gcmVhY3RpdmUoc3RvcmVzKTtcbiAgICBpc1JlYWN0aXZlID0gdHJ1ZTtcbiAgfVxuICBpZiAodmFsdWUgPT09IHZvaWQgMCkge1xuICAgIHJldHVybiBzdG9yZXNbbmFtZV07XG4gIH1cbiAgc3RvcmVzW25hbWVdID0gdmFsdWU7XG4gIGluaXRJbnRlcmNlcHRvcnMoc3RvcmVzW25hbWVdKTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZS5oYXNPd25Qcm9wZXJ0eShcImluaXRcIikgJiYgdHlwZW9mIHZhbHVlLmluaXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHN0b3Jlc1tuYW1lXS5pbml0KCk7XG4gIH1cbn1cbmZ1bmN0aW9uIGdldFN0b3JlcygpIHtcbiAgcmV0dXJuIHN0b3Jlcztcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2JpbmRzLmpzXG52YXIgYmluZHMgPSB7fTtcbmZ1bmN0aW9uIGJpbmQyKG5hbWUsIGJpbmRpbmdzKSB7XG4gIGxldCBnZXRCaW5kaW5ncyA9IHR5cGVvZiBiaW5kaW5ncyAhPT0gXCJmdW5jdGlvblwiID8gKCkgPT4gYmluZGluZ3MgOiBiaW5kaW5ncztcbiAgaWYgKG5hbWUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgcmV0dXJuIGFwcGx5QmluZGluZ3NPYmplY3QobmFtZSwgZ2V0QmluZGluZ3MoKSk7XG4gIH0gZWxzZSB7XG4gICAgYmluZHNbbmFtZV0gPSBnZXRCaW5kaW5ncztcbiAgfVxuICByZXR1cm4gKCkgPT4ge1xuICB9O1xufVxuZnVuY3Rpb24gaW5qZWN0QmluZGluZ1Byb3ZpZGVycyhvYmopIHtcbiAgT2JqZWN0LmVudHJpZXMoYmluZHMpLmZvckVhY2goKFtuYW1lLCBjYWxsYmFja10pID0+IHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayguLi5hcmdzKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG5mdW5jdGlvbiBhcHBseUJpbmRpbmdzT2JqZWN0KGVsLCBvYmosIG9yaWdpbmFsKSB7XG4gIGxldCBjbGVhbnVwUnVubmVycyA9IFtdO1xuICB3aGlsZSAoY2xlYW51cFJ1bm5lcnMubGVuZ3RoKVxuICAgIGNsZWFudXBSdW5uZXJzLnBvcCgpKCk7XG4gIGxldCBhdHRyaWJ1dGVzID0gT2JqZWN0LmVudHJpZXMob2JqKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7IG5hbWUsIHZhbHVlIH0pKTtcbiAgbGV0IHN0YXRpY0F0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzT25seShhdHRyaWJ1dGVzKTtcbiAgYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMubWFwKChhdHRyaWJ1dGUpID0+IHtcbiAgICBpZiAoc3RhdGljQXR0cmlidXRlcy5maW5kKChhdHRyKSA9PiBhdHRyLm5hbWUgPT09IGF0dHJpYnV0ZS5uYW1lKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogYHgtYmluZDoke2F0dHJpYnV0ZS5uYW1lfWAsXG4gICAgICAgIHZhbHVlOiBgXCIke2F0dHJpYnV0ZS52YWx1ZX1cImBcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBhdHRyaWJ1dGU7XG4gIH0pO1xuICBkaXJlY3RpdmVzKGVsLCBhdHRyaWJ1dGVzLCBvcmlnaW5hbCkubWFwKChoYW5kbGUpID0+IHtcbiAgICBjbGVhbnVwUnVubmVycy5wdXNoKGhhbmRsZS5ydW5DbGVhbnVwcyk7XG4gICAgaGFuZGxlKCk7XG4gIH0pO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHdoaWxlIChjbGVhbnVwUnVubmVycy5sZW5ndGgpXG4gICAgICBjbGVhbnVwUnVubmVycy5wb3AoKSgpO1xuICB9O1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGF0YXMuanNcbnZhciBkYXRhcyA9IHt9O1xuZnVuY3Rpb24gZGF0YShuYW1lLCBjYWxsYmFjaykge1xuICBkYXRhc1tuYW1lXSA9IGNhbGxiYWNrO1xufVxuZnVuY3Rpb24gaW5qZWN0RGF0YVByb3ZpZGVycyhvYmosIGNvbnRleHQpIHtcbiAgT2JqZWN0LmVudHJpZXMoZGF0YXMpLmZvckVhY2goKFtuYW1lLCBjYWxsYmFja10pID0+IHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICBnZXQoKSB7XG4gICAgICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjay5iaW5kKGNvbnRleHQpKC4uLmFyZ3MpO1xuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvYWxwaW5lLmpzXG52YXIgQWxwaW5lID0ge1xuICBnZXQgcmVhY3RpdmUoKSB7XG4gICAgcmV0dXJuIHJlYWN0aXZlO1xuICB9LFxuICBnZXQgcmVsZWFzZSgpIHtcbiAgICByZXR1cm4gcmVsZWFzZTtcbiAgfSxcbiAgZ2V0IGVmZmVjdCgpIHtcbiAgICByZXR1cm4gZWZmZWN0O1xuICB9LFxuICBnZXQgcmF3KCkge1xuICAgIHJldHVybiByYXc7XG4gIH0sXG4gIGdldCB0cmFuc2FjdGlvbigpIHtcbiAgICByZXR1cm4gdHJhbnNhY3Rpb247XG4gIH0sXG4gIHZlcnNpb246IFwiMy4xNS44XCIsXG4gIGZsdXNoQW5kU3RvcERlZmVycmluZ011dGF0aW9ucyxcbiAgZG9udEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucyxcbiAgZGlzYWJsZUVmZmVjdFNjaGVkdWxpbmcsXG4gIHN0YXJ0T2JzZXJ2aW5nTXV0YXRpb25zLFxuICBzdG9wT2JzZXJ2aW5nTXV0YXRpb25zLFxuICBzZXRSZWFjdGl2aXR5RW5naW5lLFxuICBvbkF0dHJpYnV0ZVJlbW92ZWQsXG4gIG9uQXR0cmlidXRlc0FkZGVkLFxuICBjbG9zZXN0RGF0YVN0YWNrLFxuICBza2lwRHVyaW5nQ2xvbmUsXG4gIG9ubHlEdXJpbmdDbG9uZSxcbiAgYWRkUm9vdFNlbGVjdG9yLFxuICBhZGRJbml0U2VsZWN0b3IsXG4gIHNldEVycm9ySGFuZGxlcixcbiAgaW50ZXJjZXB0Q2xvbmUsXG4gIGFkZFNjb3BlVG9Ob2RlLFxuICBkZWZlck11dGF0aW9ucyxcbiAgbWFwQXR0cmlidXRlcyxcbiAgZXZhbHVhdGVMYXRlcixcbiAgaW50ZXJjZXB0SW5pdCxcbiAgaW5pdEludGVyY2VwdG9ycyxcbiAgaW5qZWN0TWFnaWNzLFxuICBzZXRFdmFsdWF0b3IsXG4gIHNldFJhd0V2YWx1YXRvcixcbiAgbWVyZ2VQcm94aWVzLFxuICBleHRyYWN0UHJvcCxcbiAgZmluZENsb3Nlc3QsXG4gIG9uRWxSZW1vdmVkLFxuICBjbG9zZXN0Um9vdCxcbiAgZGVzdHJveVRyZWUsXG4gIGludGVyY2VwdG9yLFxuICAvLyBJTlRFUk5BTDogbm90IHB1YmxpYyBBUEkgYW5kIGlzIHN1YmplY3QgdG8gY2hhbmdlIHdpdGhvdXQgbWFqb3IgcmVsZWFzZS5cbiAgdHJhbnNpdGlvbixcbiAgLy8gSU5URVJOQUxcbiAgc2V0U3R5bGVzLFxuICAvLyBJTlRFUk5BTFxuICBtdXRhdGVEb20sXG4gIGRpcmVjdGl2ZSxcbiAgZW50YW5nbGUsXG4gIHRocm90dGxlLFxuICBkZWJvdW5jZSxcbiAgZXZhbHVhdGUsXG4gIGV2YWx1YXRlUmF3LFxuICBpbml0VHJlZSxcbiAgbmV4dFRpY2ssXG4gIHByZWZpeGVkOiBwcmVmaXgsXG4gIHByZWZpeDogc2V0UHJlZml4LFxuICBwbHVnaW4sXG4gIG1hZ2ljLFxuICBzdG9yZSxcbiAgc3RhcnQsXG4gIGNsb25lLFxuICAvLyBJTlRFUk5BTFxuICBjbG9uZU5vZGUsXG4gIC8vIElOVEVSTkFMXG4gIGJvdW5kOiBnZXRCaW5kaW5nLFxuICAkZGF0YTogc2NvcGUsXG4gIHdhdGNoLFxuICB3YWxrLFxuICBkYXRhLFxuICBiaW5kOiBiaW5kMlxufTtcbnZhciBhbHBpbmVfZGVmYXVsdCA9IEFscGluZTtcblxuLy8gcGFja2FnZXMvY3NwL3NyYy9wYXJzZXIuanNcbnZhciBzYWZlbWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBXZWFrTWFwKCk7XG52YXIgZ2xvYmFscyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhnbG9iYWxUaGlzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgaWYgKGtleSA9PT0gXCJzdHlsZU1lZGlhXCIpXG4gICAgcmV0dXJuO1xuICBnbG9iYWxzLmFkZChnbG9iYWxUaGlzW2tleV0pO1xufSk7XG52YXIgVG9rZW4gPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKHR5cGUsIHZhbHVlLCBzdGFydDIsIGVuZCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuc3RhcnQgPSBzdGFydDI7XG4gICAgdGhpcy5lbmQgPSBlbmQ7XG4gIH1cbn07XG52YXIgVG9rZW5pemVyID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihpbnB1dCkge1xuICAgIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgICB0aGlzLnRva2VucyA9IFtdO1xuICB9XG4gIHRva2VuaXplKCkge1xuICAgIHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5pbnB1dC5sZW5ndGgpIHtcbiAgICAgIHRoaXMuc2tpcFdoaXRlc3BhY2UoKTtcbiAgICAgIGlmICh0aGlzLnBvc2l0aW9uID49IHRoaXMuaW5wdXQubGVuZ3RoKVxuICAgICAgICBicmVhaztcbiAgICAgIGNvbnN0IGNoYXIgPSB0aGlzLmlucHV0W3RoaXMucG9zaXRpb25dO1xuICAgICAgaWYgKHRoaXMuaXNEaWdpdChjaGFyKSkge1xuICAgICAgICB0aGlzLnJlYWROdW1iZXIoKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0FscGhhKGNoYXIpIHx8IGNoYXIgPT09IFwiX1wiIHx8IGNoYXIgPT09IFwiJFwiKSB7XG4gICAgICAgIHRoaXMucmVhZElkZW50aWZpZXJPcktleXdvcmQoKTtcbiAgICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gJ1wiJyB8fCBjaGFyID09PSBcIidcIikge1xuICAgICAgICB0aGlzLnJlYWRTdHJpbmcoKTtcbiAgICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCIvXCIgJiYgdGhpcy5wZWVrKCkgPT09IFwiL1wiKSB7XG4gICAgICAgIHRoaXMuc2tpcExpbmVDb21tZW50KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlYWRPcGVyYXRvck9yUHVuY3R1YXRpb24oKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJFT0ZcIiwgbnVsbCwgdGhpcy5wb3NpdGlvbiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIHJldHVybiB0aGlzLnRva2VucztcbiAgfVxuICBza2lwV2hpdGVzcGFjZSgpIHtcbiAgICB3aGlsZSAodGhpcy5wb3NpdGlvbiA8IHRoaXMuaW5wdXQubGVuZ3RoICYmIC9cXHMvLnRlc3QodGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uXSkpIHtcbiAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICB9XG4gIH1cbiAgc2tpcExpbmVDb21tZW50KCkge1xuICAgIHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5pbnB1dC5sZW5ndGggJiYgdGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uXSAhPT0gXCJcXG5cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbisrO1xuICAgIH1cbiAgfVxuICBpc0RpZ2l0KGNoYXIpIHtcbiAgICByZXR1cm4gL1swLTldLy50ZXN0KGNoYXIpO1xuICB9XG4gIGlzQWxwaGEoY2hhcikge1xuICAgIHJldHVybiAvW2EtekEtWl0vLnRlc3QoY2hhcik7XG4gIH1cbiAgaXNBbHBoYU51bWVyaWMoY2hhcikge1xuICAgIHJldHVybiAvW2EtekEtWjAtOV8kXS8udGVzdChjaGFyKTtcbiAgfVxuICBwZWVrKG9mZnNldCA9IDEpIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uICsgb2Zmc2V0XSB8fCBcIlwiO1xuICB9XG4gIHJlYWROdW1iZXIoKSB7XG4gICAgY29uc3Qgc3RhcnQyID0gdGhpcy5wb3NpdGlvbjtcbiAgICBsZXQgaGFzRGVjaW1hbCA9IGZhbHNlO1xuICAgIHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5pbnB1dC5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGNoYXIgPSB0aGlzLmlucHV0W3RoaXMucG9zaXRpb25dO1xuICAgICAgaWYgKHRoaXMuaXNEaWdpdChjaGFyKSkge1xuICAgICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiLlwiICYmICFoYXNEZWNpbWFsKSB7XG4gICAgICAgIGhhc0RlY2ltYWwgPSB0cnVlO1xuICAgICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmlucHV0LnNsaWNlKHN0YXJ0MiwgdGhpcy5wb3NpdGlvbik7XG4gICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJOVU1CRVJcIiwgcGFyc2VGbG9hdCh2YWx1ZSksIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICB9XG4gIHJlYWRJZGVudGlmaWVyT3JLZXl3b3JkKCkge1xuICAgIGNvbnN0IHN0YXJ0MiA9IHRoaXMucG9zaXRpb247XG4gICAgd2hpbGUgKHRoaXMucG9zaXRpb24gPCB0aGlzLmlucHV0Lmxlbmd0aCAmJiB0aGlzLmlzQWxwaGFOdW1lcmljKHRoaXMuaW5wdXRbdGhpcy5wb3NpdGlvbl0pKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5pbnB1dC5zbGljZShzdGFydDIsIHRoaXMucG9zaXRpb24pO1xuICAgIGNvbnN0IGtleXdvcmRzID0gW1widHJ1ZVwiLCBcImZhbHNlXCIsIFwibnVsbFwiLCBcInVuZGVmaW5lZFwiLCBcIm5ld1wiLCBcInR5cGVvZlwiLCBcInZvaWRcIiwgXCJkZWxldGVcIiwgXCJpblwiLCBcImluc3RhbmNlb2ZcIl07XG4gICAgaWYgKGtleXdvcmRzLmluY2x1ZGVzKHZhbHVlKSkge1xuICAgICAgaWYgKHZhbHVlID09PSBcInRydWVcIiB8fCB2YWx1ZSA9PT0gXCJmYWxzZVwiKSB7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiQk9PTEVBTlwiLCB2YWx1ZSA9PT0gXCJ0cnVlXCIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gXCJudWxsXCIpIHtcbiAgICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJOVUxMXCIsIG51bGwsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIlVOREVGSU5FRFwiLCB2b2lkIDAsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJLRVlXT1JEXCIsIHZhbHVlLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJJREVOVElGSUVSXCIsIHZhbHVlLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9XG4gIH1cbiAgcmVhZFN0cmluZygpIHtcbiAgICBjb25zdCBzdGFydDIgPSB0aGlzLnBvc2l0aW9uO1xuICAgIGNvbnN0IHF1b3RlID0gdGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uXTtcbiAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgbGV0IHZhbHVlID0gXCJcIjtcbiAgICBsZXQgZXNjYXBlZCA9IGZhbHNlO1xuICAgIHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5pbnB1dC5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGNoYXIgPSB0aGlzLmlucHV0W3RoaXMucG9zaXRpb25dO1xuICAgICAgaWYgKGVzY2FwZWQpIHtcbiAgICAgICAgc3dpdGNoIChjaGFyKSB7XG4gICAgICAgICAgY2FzZSBcIm5cIjpcbiAgICAgICAgICAgIHZhbHVlICs9IFwiXFxuXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwidFwiOlxuICAgICAgICAgICAgdmFsdWUgKz0gXCJcdFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcInJcIjpcbiAgICAgICAgICAgIHZhbHVlICs9IFwiXFxyXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwiXFxcXFwiOlxuICAgICAgICAgICAgdmFsdWUgKz0gXCJcXFxcXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIHF1b3RlOlxuICAgICAgICAgICAgdmFsdWUgKz0gcXVvdGU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdmFsdWUgKz0gY2hhcjtcbiAgICAgICAgfVxuICAgICAgICBlc2NhcGVkID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiXFxcXFwiKSB7XG4gICAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChjaGFyID09PSBxdW90ZSkge1xuICAgICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiU1RSSU5HXCIsIHZhbHVlLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgKz0gY2hhcjtcbiAgICAgIH1cbiAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbnRlcm1pbmF0ZWQgc3RyaW5nIHN0YXJ0aW5nIGF0IHBvc2l0aW9uICR7c3RhcnQyfWApO1xuICB9XG4gIHJlYWRPcGVyYXRvck9yUHVuY3R1YXRpb24oKSB7XG4gICAgY29uc3Qgc3RhcnQyID0gdGhpcy5wb3NpdGlvbjtcbiAgICBjb25zdCBjaGFyID0gdGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uXTtcbiAgICBjb25zdCBuZXh0ID0gdGhpcy5wZWVrKCk7XG4gICAgY29uc3QgbmV4dE5leHQgPSB0aGlzLnBlZWsoMik7XG4gICAgaWYgKGNoYXIgPT09IFwiPVwiICYmIG5leHQgPT09IFwiPVwiICYmIG5leHROZXh0ID09PSBcIj1cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAzO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIj09PVwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiIVwiICYmIG5leHQgPT09IFwiPVwiICYmIG5leHROZXh0ID09PSBcIj1cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAzO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIiE9PVwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiPVwiICYmIG5leHQgPT09IFwiPVwiKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIk9QRVJBVE9SXCIsIFwiPT1cIiwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBcIiFcIiAmJiBuZXh0ID09PSBcIj1cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIiE9XCIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCI8XCIgJiYgbmV4dCA9PT0gXCI9XCIpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiT1BFUkFUT1JcIiwgXCI8PVwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiPlwiICYmIG5leHQgPT09IFwiPVwiKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIk9QRVJBVE9SXCIsIFwiPj1cIiwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBcIiZcIiAmJiBuZXh0ID09PSBcIiZcIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIiYmXCIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCJ8XCIgJiYgbmV4dCA9PT0gXCJ8XCIpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiT1BFUkFUT1JcIiwgXCJ8fFwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiK1wiICYmIG5leHQgPT09IFwiK1wiKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIk9QRVJBVE9SXCIsIFwiKytcIiwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBcIi1cIiAmJiBuZXh0ID09PSBcIi1cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIi0tXCIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgICBjb25zdCB0eXBlID0gXCIoKVtde30sLjs6P1wiLmluY2x1ZGVzKGNoYXIpID8gXCJQVU5DVFVBVElPTlwiIDogXCJPUEVSQVRPUlwiO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4odHlwZSwgY2hhciwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfVxuICB9XG59O1xudmFyIFBhcnNlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IodG9rZW5zKSB7XG4gICAgdGhpcy50b2tlbnMgPSB0b2tlbnM7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cbiAgcGFyc2UoKSB7XG4gICAgaWYgKHRoaXMuaXNBdEVuZCgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFbXB0eSBleHByZXNzaW9uXCIpO1xuICAgIH1cbiAgICBjb25zdCBleHByID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICB0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCI7XCIpO1xuICAgIGlmICghdGhpcy5pc0F0RW5kKCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCB0b2tlbjogJHt0aGlzLmN1cnJlbnQoKS52YWx1ZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VFeHByZXNzaW9uKCkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlQXNzaWdubWVudCgpO1xuICB9XG4gIHBhcnNlQXNzaWdubWVudCgpIHtcbiAgICBjb25zdCBleHByID0gdGhpcy5wYXJzZVRlcm5hcnkoKTtcbiAgICBpZiAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwiPVwiKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnBhcnNlQXNzaWdubWVudCgpO1xuICAgICAgaWYgKGV4cHIudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgfHwgZXhwci50eXBlID09PSBcIk1lbWJlckV4cHJlc3Npb25cIikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6IFwiQXNzaWdubWVudEV4cHJlc3Npb25cIixcbiAgICAgICAgICBsZWZ0OiBleHByLFxuICAgICAgICAgIG9wZXJhdG9yOiBcIj1cIixcbiAgICAgICAgICByaWdodDogdmFsdWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgYXNzaWdubWVudCB0YXJnZXRcIik7XG4gICAgfVxuICAgIHJldHVybiBleHByO1xuICB9XG4gIHBhcnNlVGVybmFyeSgpIHtcbiAgICBjb25zdCBleHByID0gdGhpcy5wYXJzZUxvZ2ljYWxPcigpO1xuICAgIGlmICh0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCI/XCIpKSB7XG4gICAgICBjb25zdCBjb25zZXF1ZW50ID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICAgIHRoaXMuY29uc3VtZShcIlBVTkNUVUFUSU9OXCIsIFwiOlwiKTtcbiAgICAgIGNvbnN0IGFsdGVybmF0ZSA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiLFxuICAgICAgICB0ZXN0OiBleHByLFxuICAgICAgICBjb25zZXF1ZW50LFxuICAgICAgICBhbHRlcm5hdGVcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBleHByO1xuICB9XG4gIHBhcnNlTG9naWNhbE9yKCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZUxvZ2ljYWxBbmQoKTtcbiAgICB3aGlsZSAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwifHxcIikpIHtcbiAgICAgIGNvbnN0IG9wZXJhdG9yID0gdGhpcy5wcmV2aW91cygpLnZhbHVlO1xuICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlTG9naWNhbEFuZCgpO1xuICAgICAgZXhwciA9IHtcbiAgICAgICAgdHlwZTogXCJCaW5hcnlFeHByZXNzaW9uXCIsXG4gICAgICAgIG9wZXJhdG9yLFxuICAgICAgICBsZWZ0OiBleHByLFxuICAgICAgICByaWdodFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VMb2dpY2FsQW5kKCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZUVxdWFsaXR5KCk7XG4gICAgd2hpbGUgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcIiYmXCIpKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMucHJldmlvdXMoKS52YWx1ZTtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZUVxdWFsaXR5KCk7XG4gICAgICBleHByID0ge1xuICAgICAgICB0eXBlOiBcIkJpbmFyeUV4cHJlc3Npb25cIixcbiAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIGxlZnQ6IGV4cHIsXG4gICAgICAgIHJpZ2h0XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICBwYXJzZUVxdWFsaXR5KCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZVJlbGF0aW9uYWwoKTtcbiAgICB3aGlsZSAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwiPT1cIiwgXCIhPVwiLCBcIj09PVwiLCBcIiE9PVwiKSkge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VSZWxhdGlvbmFsKCk7XG4gICAgICBleHByID0ge1xuICAgICAgICB0eXBlOiBcIkJpbmFyeUV4cHJlc3Npb25cIixcbiAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIGxlZnQ6IGV4cHIsXG4gICAgICAgIHJpZ2h0XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICBwYXJzZVJlbGF0aW9uYWwoKSB7XG4gICAgbGV0IGV4cHIgPSB0aGlzLnBhcnNlQWRkaXRpdmUoKTtcbiAgICB3aGlsZSAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwiPFwiLCBcIj5cIiwgXCI8PVwiLCBcIj49XCIpKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMucHJldmlvdXMoKS52YWx1ZTtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZUFkZGl0aXZlKCk7XG4gICAgICBleHByID0ge1xuICAgICAgICB0eXBlOiBcIkJpbmFyeUV4cHJlc3Npb25cIixcbiAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIGxlZnQ6IGV4cHIsXG4gICAgICAgIHJpZ2h0XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICBwYXJzZUFkZGl0aXZlKCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZU11bHRpcGxpY2F0aXZlKCk7XG4gICAgd2hpbGUgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcIitcIiwgXCItXCIpKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMucHJldmlvdXMoKS52YWx1ZTtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZU11bHRpcGxpY2F0aXZlKCk7XG4gICAgICBleHByID0ge1xuICAgICAgICB0eXBlOiBcIkJpbmFyeUV4cHJlc3Npb25cIixcbiAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIGxlZnQ6IGV4cHIsXG4gICAgICAgIHJpZ2h0XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICBwYXJzZU11bHRpcGxpY2F0aXZlKCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZVVuYXJ5KCk7XG4gICAgd2hpbGUgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcIipcIiwgXCIvXCIsIFwiJVwiKSkge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VVbmFyeSgpO1xuICAgICAgZXhwciA9IHtcbiAgICAgICAgdHlwZTogXCJCaW5hcnlFeHByZXNzaW9uXCIsXG4gICAgICAgIG9wZXJhdG9yLFxuICAgICAgICBsZWZ0OiBleHByLFxuICAgICAgICByaWdodFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VVbmFyeSgpIHtcbiAgICBpZiAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwiKytcIiwgXCItLVwiKSkge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICBjb25zdCBhcmd1bWVudCA9IHRoaXMucGFyc2VVbmFyeSgpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogXCJVcGRhdGVFeHByZXNzaW9uXCIsXG4gICAgICAgIG9wZXJhdG9yLFxuICAgICAgICBhcmd1bWVudCxcbiAgICAgICAgcHJlZml4OiB0cnVlXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwiIVwiLCBcIi1cIiwgXCIrXCIpKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMucHJldmlvdXMoKS52YWx1ZTtcbiAgICAgIGNvbnN0IGFyZ3VtZW50ID0gdGhpcy5wYXJzZVVuYXJ5KCk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIlVuYXJ5RXhwcmVzc2lvblwiLFxuICAgICAgICBvcGVyYXRvcixcbiAgICAgICAgYXJndW1lbnQsXG4gICAgICAgIHByZWZpeDogdHJ1ZVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucGFyc2VQb3N0Zml4KCk7XG4gIH1cbiAgcGFyc2VQb3N0Zml4KCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZU1lbWJlcigpO1xuICAgIGlmICh0aGlzLm1hdGNoKFwiT1BFUkFUT1JcIiwgXCIrK1wiLCBcIi0tXCIpKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMucHJldmlvdXMoKS52YWx1ZTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiVXBkYXRlRXhwcmVzc2lvblwiLFxuICAgICAgICBvcGVyYXRvcixcbiAgICAgICAgYXJndW1lbnQ6IGV4cHIsXG4gICAgICAgIHByZWZpeDogZmFsc2VcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBleHByO1xuICB9XG4gIHBhcnNlTWVtYmVyKCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZVByaW1hcnkoKTtcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKHRoaXMubWF0Y2goXCJQVU5DVFVBVElPTlwiLCBcIi5cIikpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLmNvbnN1bWUoXCJJREVOVElGSUVSXCIpO1xuICAgICAgICBleHByID0ge1xuICAgICAgICAgIHR5cGU6IFwiTWVtYmVyRXhwcmVzc2lvblwiLFxuICAgICAgICAgIG9iamVjdDogZXhwcixcbiAgICAgICAgICBwcm9wZXJ0eTogeyB0eXBlOiBcIklkZW50aWZpZXJcIiwgbmFtZTogcHJvcGVydHkudmFsdWUgfSxcbiAgICAgICAgICBjb21wdXRlZDogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiW1wiKSkge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgICAgIHRoaXMuY29uc3VtZShcIlBVTkNUVUFUSU9OXCIsIFwiXVwiKTtcbiAgICAgICAgZXhwciA9IHtcbiAgICAgICAgICB0eXBlOiBcIk1lbWJlckV4cHJlc3Npb25cIixcbiAgICAgICAgICBvYmplY3Q6IGV4cHIsXG4gICAgICAgICAgcHJvcGVydHksXG4gICAgICAgICAgY29tcHV0ZWQ6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiKFwiKSkge1xuICAgICAgICBjb25zdCBhcmdzID0gdGhpcy5wYXJzZUFyZ3VtZW50cygpO1xuICAgICAgICBleHByID0ge1xuICAgICAgICAgIHR5cGU6IFwiQ2FsbEV4cHJlc3Npb25cIixcbiAgICAgICAgICBjYWxsZWU6IGV4cHIsXG4gICAgICAgICAgYXJndW1lbnRzOiBhcmdzXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VBcmd1bWVudHMoKSB7XG4gICAgY29uc3QgYXJncyA9IFtdO1xuICAgIGlmICghdGhpcy5jaGVjayhcIlBVTkNUVUFUSU9OXCIsIFwiKVwiKSkge1xuICAgICAgZG8ge1xuICAgICAgICBhcmdzLnB1c2godGhpcy5wYXJzZUV4cHJlc3Npb24oKSk7XG4gICAgICB9IHdoaWxlICh0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCIsXCIpKTtcbiAgICB9XG4gICAgdGhpcy5jb25zdW1lKFwiUFVOQ1RVQVRJT05cIiwgXCIpXCIpO1xuICAgIHJldHVybiBhcmdzO1xuICB9XG4gIHBhcnNlUHJpbWFyeSgpIHtcbiAgICBpZiAodGhpcy5tYXRjaChcIk5VTUJFUlwiKSkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJMaXRlcmFsXCIsIHZhbHVlOiB0aGlzLnByZXZpb3VzKCkudmFsdWUgfTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJTVFJJTkdcIikpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiTGl0ZXJhbFwiLCB2YWx1ZTogdGhpcy5wcmV2aW91cygpLnZhbHVlIH07XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwiQk9PTEVBTlwiKSkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJMaXRlcmFsXCIsIHZhbHVlOiB0aGlzLnByZXZpb3VzKCkudmFsdWUgfTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJOVUxMXCIpKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIkxpdGVyYWxcIiwgdmFsdWU6IG51bGwgfTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJVTkRFRklORURcIikpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiTGl0ZXJhbFwiLCB2YWx1ZTogdm9pZCAwIH07XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwiSURFTlRJRklFUlwiKSkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJJZGVudGlmaWVyXCIsIG5hbWU6IHRoaXMucHJldmlvdXMoKS52YWx1ZSB9O1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiKFwiKSkge1xuICAgICAgY29uc3QgZXhwciA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgICB0aGlzLmNvbnN1bWUoXCJQVU5DVFVBVElPTlwiLCBcIilcIik7XG4gICAgICByZXR1cm4gZXhwcjtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJQVU5DVFVBVElPTlwiLCBcIltcIikpIHtcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlQXJyYXlMaXRlcmFsKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCJ7XCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZU9iamVjdExpdGVyYWwoKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIHRva2VuOiAke3RoaXMuY3VycmVudCgpLnR5cGV9IFwiJHt0aGlzLmN1cnJlbnQoKS52YWx1ZX1cImApO1xuICB9XG4gIHBhcnNlQXJyYXlMaXRlcmFsKCkge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gW107XG4gICAgd2hpbGUgKCF0aGlzLmNoZWNrKFwiUFVOQ1RVQVRJT05cIiwgXCJdXCIpICYmICF0aGlzLmlzQXRFbmQoKSkge1xuICAgICAgZWxlbWVudHMucHVzaCh0aGlzLnBhcnNlRXhwcmVzc2lvbigpKTtcbiAgICAgIGlmICh0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCIsXCIpKSB7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrKFwiUFVOQ1RVQVRJT05cIiwgXCJdXCIpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnN1bWUoXCJQVU5DVFVBVElPTlwiLCBcIl1cIik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwiQXJyYXlFeHByZXNzaW9uXCIsXG4gICAgICBlbGVtZW50c1xuICAgIH07XG4gIH1cbiAgcGFyc2VPYmplY3RMaXRlcmFsKCkge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBbXTtcbiAgICB3aGlsZSAoIXRoaXMuY2hlY2soXCJQVU5DVFVBVElPTlwiLCBcIn1cIikgJiYgIXRoaXMuaXNBdEVuZCgpKSB7XG4gICAgICBsZXQga2V5O1xuICAgICAgbGV0IGNvbXB1dGVkID0gZmFsc2U7XG4gICAgICBpZiAodGhpcy5tYXRjaChcIlNUUklOR1wiKSkge1xuICAgICAgICBrZXkgPSB7IHR5cGU6IFwiTGl0ZXJhbFwiLCB2YWx1ZTogdGhpcy5wcmV2aW91cygpLnZhbHVlIH07XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubWF0Y2goXCJJREVOVElGSUVSXCIpKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICAgIGtleSA9IHsgdHlwZTogXCJJZGVudGlmaWVyXCIsIG5hbWUgfTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiW1wiKSkge1xuICAgICAgICBrZXkgPSB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xuICAgICAgICBjb21wdXRlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuY29uc3VtZShcIlBVTkNUVUFUSU9OXCIsIFwiXVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIHByb3BlcnR5IGtleVwiKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29uc3VtZShcIlBVTkNUVUFUSU9OXCIsIFwiOlwiKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICAgIHR5cGU6IFwiUHJvcGVydHlcIixcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgY29tcHV0ZWQsXG4gICAgICAgIHNob3J0aGFuZDogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgaWYgKHRoaXMubWF0Y2goXCJQVU5DVFVBVElPTlwiLCBcIixcIikpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2soXCJQVU5DVFVBVElPTlwiLCBcIn1cIikpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZShcIlBVTkNUVUFUSU9OXCIsIFwifVwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogXCJPYmplY3RFeHByZXNzaW9uXCIsXG4gICAgICBwcm9wZXJ0aWVzXG4gICAgfTtcbiAgfVxuICBtYXRjaCguLi5hcmdzKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhcmcgPSBhcmdzW2ldO1xuICAgICAgaWYgKGkgPT09IDAgJiYgYXJncy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBhcmc7XG4gICAgICAgIGZvciAobGV0IGogPSAxOyBqIDwgYXJncy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmICh0aGlzLmNoZWNrKHR5cGUsIGFyZ3Nbal0pKSB7XG4gICAgICAgICAgICB0aGlzLmFkdmFuY2UoKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrVHlwZShhcmcpKSB7XG4gICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY2hlY2sodHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodGhpcy5pc0F0RW5kKCkpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHZhbHVlICE9PSB2b2lkIDApIHtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQoKS50eXBlID09PSB0eXBlICYmIHRoaXMuY3VycmVudCgpLnZhbHVlID09PSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudCgpLnR5cGUgPT09IHR5cGU7XG4gIH1cbiAgY2hlY2tUeXBlKHR5cGUpIHtcbiAgICBpZiAodGhpcy5pc0F0RW5kKCkpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudCgpLnR5cGUgPT09IHR5cGU7XG4gIH1cbiAgYWR2YW5jZSgpIHtcbiAgICBpZiAoIXRoaXMuaXNBdEVuZCgpKVxuICAgICAgdGhpcy5wb3NpdGlvbisrO1xuICAgIHJldHVybiB0aGlzLnByZXZpb3VzKCk7XG4gIH1cbiAgaXNBdEVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50KCkudHlwZSA9PT0gXCJFT0ZcIjtcbiAgfVxuICBjdXJyZW50KCkge1xuICAgIHJldHVybiB0aGlzLnRva2Vuc1t0aGlzLnBvc2l0aW9uXTtcbiAgfVxuICBwcmV2aW91cygpIHtcbiAgICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy5wb3NpdGlvbiAtIDFdO1xuICB9XG4gIGNvbnN1bWUodHlwZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgIT09IHZvaWQgMCkge1xuICAgICAgaWYgKHRoaXMuY2hlY2sodHlwZSwgdmFsdWUpKVxuICAgICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICR7dHlwZX0gXCIke3ZhbHVlfVwiIGJ1dCBnb3QgJHt0aGlzLmN1cnJlbnQoKS50eXBlfSBcIiR7dGhpcy5jdXJyZW50KCkudmFsdWV9XCJgKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuY2hlY2sodHlwZSkpXG4gICAgICByZXR1cm4gdGhpcy5hZHZhbmNlKCk7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCAke3R5cGV9IGJ1dCBnb3QgJHt0aGlzLmN1cnJlbnQoKS50eXBlfSBcIiR7dGhpcy5jdXJyZW50KCkudmFsdWV9XCJgKTtcbiAgfVxufTtcbnZhciBFdmFsdWF0b3IgPSBjbGFzcyB7XG4gIGV2YWx1YXRlKHsgbm9kZSwgc2NvcGU6IHNjb3BlMiA9IHt9LCBjb250ZXh0ID0gbnVsbCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgPSB0cnVlIH0pIHtcbiAgICBzd2l0Y2ggKG5vZGUudHlwZSkge1xuICAgICAgY2FzZSBcIkxpdGVyYWxcIjpcbiAgICAgICAgcmV0dXJuIG5vZGUudmFsdWU7XG4gICAgICBjYXNlIFwiSWRlbnRpZmllclwiOlxuICAgICAgICBpZiAobm9kZS5uYW1lIGluIHNjb3BlMikge1xuICAgICAgICAgIGNvbnN0IHZhbHVlMiA9IHNjb3BlMltub2RlLm5hbWVdO1xuICAgICAgICAgIHRoaXMuY2hlY2tGb3JEYW5nZXJvdXNWYWx1ZXModmFsdWUyKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlMiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUyLmJpbmQoc2NvcGUyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHZhbHVlMjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCB2YXJpYWJsZTogJHtub2RlLm5hbWV9YCk7XG4gICAgICBjYXNlIFwiTWVtYmVyRXhwcmVzc2lvblwiOlxuICAgICAgICBjb25zdCBvYmplY3QgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5vYmplY3QsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgICBpZiAob2JqZWN0ID09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVhZCBwcm9wZXJ0eSBvZiBudWxsIG9yIHVuZGVmaW5lZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcHJvcGVydHk7XG4gICAgICAgIGlmIChub2RlLmNvbXB1dGVkKSB7XG4gICAgICAgICAgcHJvcGVydHkgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5wcm9wZXJ0eSwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvcGVydHkgPSBub2RlLnByb3BlcnR5Lm5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGVja0ZvckRhbmdlcm91c0tleXdvcmRzKHByb3BlcnR5KTtcbiAgICAgICAgbGV0IG1lbWJlclZhbHVlID0gb2JqZWN0W3Byb3BlcnR5XTtcbiAgICAgICAgdGhpcy5jaGVja0ZvckRhbmdlcm91c1ZhbHVlcyhtZW1iZXJWYWx1ZSk7XG4gICAgICAgIGlmICh0eXBlb2YgbWVtYmVyVmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGlmIChmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucykge1xuICAgICAgICAgICAgcmV0dXJuIG1lbWJlclZhbHVlLmJpbmQoc2NvcGUyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG1lbWJlclZhbHVlLmJpbmQob2JqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1lbWJlclZhbHVlO1xuICAgICAgY2FzZSBcIkNhbGxFeHByZXNzaW9uXCI6XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBub2RlLmFyZ3VtZW50cy5tYXAoKGFyZykgPT4gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IGFyZywgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSkpO1xuICAgICAgICBsZXQgcmV0dXJuVmFsdWU7XG4gICAgICAgIGlmIChub2RlLmNhbGxlZS50eXBlID09PSBcIk1lbWJlckV4cHJlc3Npb25cIikge1xuICAgICAgICAgIGNvbnN0IG9iaiA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmNhbGxlZS5vYmplY3QsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgICAgIGxldCBwcm9wO1xuICAgICAgICAgIGlmIChub2RlLmNhbGxlZS5jb21wdXRlZCkge1xuICAgICAgICAgICAgcHJvcCA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmNhbGxlZS5wcm9wZXJ0eSwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb3AgPSBub2RlLmNhbGxlZS5wcm9wZXJ0eS5uYW1lO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmNoZWNrRm9yRGFuZ2Vyb3VzS2V5d29yZHMocHJvcCk7XG4gICAgICAgICAgbGV0IGZ1bmMgPSBvYmpbcHJvcF07XG4gICAgICAgICAgaWYgKHR5cGVvZiBmdW5jICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlZhbHVlIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IGZ1bmMuYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAobm9kZS5jYWxsZWUudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBub2RlLmNhbGxlZS5uYW1lO1xuICAgICAgICAgICAgbGV0IGZ1bmM7XG4gICAgICAgICAgICBpZiAobmFtZSBpbiBzY29wZTIpIHtcbiAgICAgICAgICAgICAgZnVuYyA9IHNjb3BlMltuYW1lXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5kZWZpbmVkIHZhcmlhYmxlOiAke25hbWV9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIGZ1bmMgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYWx1ZSBpcyBub3QgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHRoaXNDb250ZXh0ID0gY29udGV4dCAhPT0gbnVsbCA/IGNvbnRleHQgOiBzY29wZTI7XG4gICAgICAgICAgICByZXR1cm5WYWx1ZSA9IGZ1bmMuYXBwbHkodGhpc0NvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsZWUgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5jYWxsZWUsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsZWUgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYWx1ZSBpcyBub3QgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVyblZhbHVlID0gY2FsbGVlLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNoZWNrRm9yRGFuZ2Vyb3VzVmFsdWVzKHJldHVyblZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgICAgY2FzZSBcIlVuYXJ5RXhwcmVzc2lvblwiOlxuICAgICAgICBjb25zdCBhcmd1bWVudCA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmFyZ3VtZW50LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgc3dpdGNoIChub2RlLm9wZXJhdG9yKSB7XG4gICAgICAgICAgY2FzZSBcIiFcIjpcbiAgICAgICAgICAgIHJldHVybiAhYXJndW1lbnQ7XG4gICAgICAgICAgY2FzZSBcIi1cIjpcbiAgICAgICAgICAgIHJldHVybiAtYXJndW1lbnQ7XG4gICAgICAgICAgY2FzZSBcIitcIjpcbiAgICAgICAgICAgIHJldHVybiArYXJndW1lbnQ7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB1bmFyeSBvcGVyYXRvcjogJHtub2RlLm9wZXJhdG9yfWApO1xuICAgICAgICB9XG4gICAgICBjYXNlIFwiVXBkYXRlRXhwcmVzc2lvblwiOlxuICAgICAgICBpZiAobm9kZS5hcmd1bWVudC50eXBlID09PSBcIklkZW50aWZpZXJcIikge1xuICAgICAgICAgIGNvbnN0IG5hbWUgPSBub2RlLmFyZ3VtZW50Lm5hbWU7XG4gICAgICAgICAgaWYgKCEobmFtZSBpbiBzY29wZTIpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCB2YXJpYWJsZTogJHtuYW1lfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHNjb3BlMltuYW1lXTtcbiAgICAgICAgICBpZiAobm9kZS5vcGVyYXRvciA9PT0gXCIrK1wiKSB7XG4gICAgICAgICAgICBzY29wZTJbbmFtZV0gPSBvbGRWYWx1ZSArIDE7XG4gICAgICAgICAgfSBlbHNlIGlmIChub2RlLm9wZXJhdG9yID09PSBcIi0tXCIpIHtcbiAgICAgICAgICAgIHNjb3BlMltuYW1lXSA9IG9sZFZhbHVlIC0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5vZGUucHJlZml4ID8gc2NvcGUyW25hbWVdIDogb2xkVmFsdWU7XG4gICAgICAgIH0gZWxzZSBpZiAobm9kZS5hcmd1bWVudC50eXBlID09PSBcIk1lbWJlckV4cHJlc3Npb25cIikge1xuICAgICAgICAgIGNvbnN0IG9iaiA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmFyZ3VtZW50Lm9iamVjdCwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgICAgY29uc3QgcHJvcCA9IG5vZGUuYXJndW1lbnQuY29tcHV0ZWQgPyB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5hcmd1bWVudC5wcm9wZXJ0eSwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSkgOiBub2RlLmFyZ3VtZW50LnByb3BlcnR5Lm5hbWU7XG4gICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBvYmpbcHJvcF07XG4gICAgICAgICAgaWYgKG5vZGUub3BlcmF0b3IgPT09IFwiKytcIikge1xuICAgICAgICAgICAgb2JqW3Byb3BdID0gb2xkVmFsdWUgKyAxO1xuICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5vcGVyYXRvciA9PT0gXCItLVwiKSB7XG4gICAgICAgICAgICBvYmpbcHJvcF0gPSBvbGRWYWx1ZSAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBub2RlLnByZWZpeCA/IG9ialtwcm9wXSA6IG9sZFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdXBkYXRlIGV4cHJlc3Npb24gdGFyZ2V0XCIpO1xuICAgICAgY2FzZSBcIkJpbmFyeUV4cHJlc3Npb25cIjpcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmxlZnQsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgICBjb25zdCByaWdodCA9IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLnJpZ2h0LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgc3dpdGNoIChub2RlLm9wZXJhdG9yKSB7XG4gICAgICAgICAgY2FzZSBcIitcIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ICsgcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIi1cIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0IC0gcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIipcIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ICogcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIi9cIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0IC8gcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIiVcIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ICUgcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIj09XCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA9PSByaWdodDtcbiAgICAgICAgICBjYXNlIFwiIT1cIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ICE9IHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCI9PT1cIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ID09PSByaWdodDtcbiAgICAgICAgICBjYXNlIFwiIT09XCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCAhPT0gcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIjxcIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0IDwgcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIj5cIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ID4gcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIjw9XCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA8PSByaWdodDtcbiAgICAgICAgICBjYXNlIFwiPj1cIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ID49IHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCImJlwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgJiYgcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcInx8XCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCB8fCByaWdodDtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGJpbmFyeSBvcGVyYXRvcjogJHtub2RlLm9wZXJhdG9yfWApO1xuICAgICAgICB9XG4gICAgICBjYXNlIFwiQ29uZGl0aW9uYWxFeHByZXNzaW9uXCI6XG4gICAgICAgIGNvbnN0IHRlc3QgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS50ZXN0LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgcmV0dXJuIHRlc3QgPyB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5jb25zZXF1ZW50LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KSA6IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBub2RlLmFsdGVybmF0ZSwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICBjYXNlIFwiQXNzaWdubWVudEV4cHJlc3Npb25cIjpcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5yaWdodCwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgIGlmIChub2RlLmxlZnQudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHtcbiAgICAgICAgICBzY29wZTJbbm9kZS5sZWZ0Lm5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUubGVmdC50eXBlID09PSBcIk1lbWJlckV4cHJlc3Npb25cIikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlByb3BlcnR5IGFzc2lnbm1lbnRzIGFyZSBwcm9oaWJpdGVkIGluIHRoZSBDU1AgYnVpbGRcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBhc3NpZ25tZW50IHRhcmdldFwiKTtcbiAgICAgIGNhc2UgXCJBcnJheUV4cHJlc3Npb25cIjpcbiAgICAgICAgcmV0dXJuIG5vZGUuZWxlbWVudHMubWFwKChlbCkgPT4gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IGVsLCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KSk7XG4gICAgICBjYXNlIFwiT2JqZWN0RXhwcmVzc2lvblwiOlxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBwcm9wIG9mIG5vZGUucHJvcGVydGllcykge1xuICAgICAgICAgIGNvbnN0IGtleSA9IHByb3AuY29tcHV0ZWQgPyB0aGlzLmV2YWx1YXRlKHsgbm9kZTogcHJvcC5rZXksIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pIDogcHJvcC5rZXkudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgPyBwcm9wLmtleS5uYW1lIDogdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IHByb3Aua2V5LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgICBjb25zdCB2YWx1ZTIgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogcHJvcC52YWx1ZSwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBub2RlIHR5cGU6ICR7bm9kZS50eXBlfWApO1xuICAgIH1cbiAgfVxuICBjaGVja0ZvckRhbmdlcm91c0tleXdvcmRzKGtleXdvcmQpIHtcbiAgICBsZXQgYmxhY2tsaXN0ID0gW1xuICAgICAgXCJjb25zdHJ1Y3RvclwiLFxuICAgICAgXCJwcm90b3R5cGVcIixcbiAgICAgIFwiX19wcm90b19fXCIsXG4gICAgICBcIl9fZGVmaW5lR2V0dGVyX19cIixcbiAgICAgIFwiX19kZWZpbmVTZXR0ZXJfX1wiLFxuICAgICAgXCJpbnNlcnRBZGphY2VudEhUTUxcIlxuICAgIF07XG4gICAgaWYgKGJsYWNrbGlzdC5pbmNsdWRlcyhrZXl3b3JkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBBY2Nlc3NpbmcgXCIke2tleXdvcmR9XCIgaXMgcHJvaGliaXRlZCBpbiB0aGUgQ1NQIGJ1aWxkYCk7XG4gICAgfVxuICB9XG4gIGNoZWNrRm9yRGFuZ2Vyb3VzVmFsdWVzKHByb3ApIHtcbiAgICBpZiAocHJvcCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb3AgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHByb3AgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2FmZW1hcC5oYXMocHJvcCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHByb3AgaW5zdGFuY2VvZiBIVE1MSUZyYW1lRWxlbWVudCB8fCBwcm9wIGluc3RhbmNlb2YgSFRNTFNjcmlwdEVsZW1lbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkFjY2Vzc2luZyBpZnJhbWVzIGFuZCBzY3JpcHRzIGlzIHByb2hpYml0ZWQgaW4gdGhlIENTUCBidWlsZFwiKTtcbiAgICB9XG4gICAgaWYgKGdsb2JhbHMuaGFzKHByb3ApKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBY2Nlc3NpbmcgZ2xvYmFsIHZhcmlhYmxlcyBpcyBwcm9oaWJpdGVkIGluIHRoZSBDU1AgYnVpbGRcIik7XG4gICAgfVxuICAgIHNhZmVtYXAuc2V0KHByb3AsIHRydWUpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuZnVuY3Rpb24gZ2VuZXJhdGVSdW50aW1lRnVuY3Rpb24oZXhwcmVzc2lvbikge1xuICB0cnkge1xuICAgIGNvbnN0IHRva2VuaXplciA9IG5ldyBUb2tlbml6ZXIoZXhwcmVzc2lvbik7XG4gICAgY29uc3QgdG9rZW5zID0gdG9rZW5pemVyLnRva2VuaXplKCk7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcih0b2tlbnMpO1xuICAgIGNvbnN0IGFzdCA9IHBhcnNlci5wYXJzZSgpO1xuICAgIGNvbnN0IGV2YWx1YXRvciA9IG5ldyBFdmFsdWF0b3IoKTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob3B0aW9ucyA9IHt9KSB7XG4gICAgICBjb25zdCB7IHNjb3BlOiBzY29wZTIgPSB7fSwgY29udGV4dCA9IG51bGwsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zID0gZmFsc2UgfSA9IG9wdGlvbnM7XG4gICAgICByZXR1cm4gZXZhbHVhdG9yLmV2YWx1YXRlKHsgbm9kZTogYXN0LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcjIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENTUCBQYXJzZXIgRXJyb3I6ICR7ZXJyb3IyLm1lc3NhZ2V9YCk7XG4gIH1cbn1cblxuLy8gcGFja2FnZXMvY3NwL3NyYy9ldmFsdWF0b3IuanNcbmZ1bmN0aW9uIGNzcFJhd0V2YWx1YXRvcihlbCwgZXhwcmVzc2lvbiwgZXh0cmFzID0ge30pIHtcbiAgbGV0IGRhdGFTdGFjayA9IGdlbmVyYXRlRGF0YVN0YWNrKGVsKTtcbiAgbGV0IHNjb3BlMiA9IG1lcmdlUHJveGllcyhbZXh0cmFzLnNjb3BlID8/IHt9LCAuLi5kYXRhU3RhY2tdKTtcbiAgbGV0IHBhcmFtcyA9IGV4dHJhcy5wYXJhbXMgPz8gW107XG4gIGxldCBldmFsdWF0ZTIgPSBnZW5lcmF0ZVJ1bnRpbWVGdW5jdGlvbihleHByZXNzaW9uKTtcbiAgbGV0IHJlc3VsdCA9IGV2YWx1YXRlMih7XG4gICAgc2NvcGU6IHNjb3BlMixcbiAgICBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9uczogdHJ1ZVxuICB9KTtcbiAgaWYgKHR5cGVvZiByZXN1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiBzaG91bGRBdXRvRXZhbHVhdGVGdW5jdGlvbnMpIHtcbiAgICByZXR1cm4gcmVzdWx0LmFwcGx5KHNjb3BlMiwgcGFyYW1zKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gY3NwRXZhbHVhdG9yKGVsLCBleHByZXNzaW9uKSB7XG4gIGxldCBkYXRhU3RhY2sgPSBnZW5lcmF0ZURhdGFTdGFjayhlbCk7XG4gIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlRXZhbHVhdG9yRnJvbUZ1bmN0aW9uKGRhdGFTdGFjaywgZXhwcmVzc2lvbik7XG4gIH1cbiAgbGV0IGV2YWx1YXRvciA9IGdlbmVyYXRlRXZhbHVhdG9yKGVsLCBleHByZXNzaW9uLCBkYXRhU3RhY2spO1xuICByZXR1cm4gdHJ5Q2F0Y2guYmluZChudWxsLCBlbCwgZXhwcmVzc2lvbiwgZXZhbHVhdG9yKTtcbn1cbmZ1bmN0aW9uIGdlbmVyYXRlRGF0YVN0YWNrKGVsKSB7XG4gIGxldCBvdmVycmlkZGVuTWFnaWNzID0ge307XG4gIGluamVjdE1hZ2ljcyhvdmVycmlkZGVuTWFnaWNzLCBlbCk7XG4gIHJldHVybiBbb3ZlcnJpZGRlbk1hZ2ljcywgLi4uY2xvc2VzdERhdGFTdGFjayhlbCldO1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVFdmFsdWF0b3IoZWwsIGV4cHJlc3Npb24sIGRhdGFTdGFjaykge1xuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MSUZyYW1lRWxlbWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkV2YWx1YXRpbmcgZXhwcmVzc2lvbnMgb24gYW4gaWZyYW1lIGlzIHByb2hpYml0ZWQgaW4gdGhlIENTUCBidWlsZFwiKTtcbiAgfVxuICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MU2NyaXB0RWxlbWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkV2YWx1YXRpbmcgZXhwcmVzc2lvbnMgb24gYSBzY3JpcHQgaXMgcHJvaGliaXRlZCBpbiB0aGUgQ1NQIGJ1aWxkXCIpO1xuICB9XG4gIHJldHVybiAocmVjZWl2ZXIgPSAoKSA9PiB7XG4gIH0sIHsgc2NvcGU6IHNjb3BlMiA9IHt9LCBwYXJhbXMgPSBbXSB9ID0ge30pID0+IHtcbiAgICBsZXQgY29tcGxldGVTY29wZSA9IG1lcmdlUHJveGllcyhbc2NvcGUyLCAuLi5kYXRhU3RhY2tdKTtcbiAgICBsZXQgZXZhbHVhdGUyID0gZ2VuZXJhdGVSdW50aW1lRnVuY3Rpb24oZXhwcmVzc2lvbik7XG4gICAgbGV0IHJldHVyblZhbHVlID0gZXZhbHVhdGUyKHtcbiAgICAgIHNjb3BlOiBjb21wbGV0ZVNjb3BlLFxuICAgICAgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnM6IHRydWVcbiAgICB9KTtcbiAgICBpZiAoc2hvdWxkQXV0b0V2YWx1YXRlRnVuY3Rpb25zICYmIHR5cGVvZiByZXR1cm5WYWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBsZXQgbmV4dFJldHVyblZhbHVlID0gcmV0dXJuVmFsdWUuYXBwbHkocmV0dXJuVmFsdWUsIHBhcmFtcyk7XG4gICAgICBpZiAobmV4dFJldHVyblZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICBuZXh0UmV0dXJuVmFsdWUudGhlbigoaSkgPT4gcmVjZWl2ZXIoaSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVjZWl2ZXIobmV4dFJldHVyblZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXR1cm5WYWx1ZSA9PT0gXCJvYmplY3RcIiAmJiByZXR1cm5WYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIHJldHVyblZhbHVlLnRoZW4oKGkpID0+IHJlY2VpdmVyKGkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVjZWl2ZXIocmV0dXJuVmFsdWUpO1xuICAgIH1cbiAgfTtcbn1cblxuLy8gbm9kZV9tb2R1bGVzL0B2dWUvc2hhcmVkL2Rpc3Qvc2hhcmVkLmVzbS1idW5kbGVyLmpzXG5mdW5jdGlvbiBtYWtlTWFwKHN0ciwgZXhwZWN0c0xvd2VyQ2FzZSkge1xuICBjb25zdCBtYXAgPSAvKiBAX19QVVJFX18gKi8gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgY29uc3QgbGlzdCA9IHN0ci5zcGxpdChcIixcIik7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIG1hcFtsaXN0W2ldXSA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIGV4cGVjdHNMb3dlckNhc2UgPyAodmFsKSA9PiAhIW1hcFt2YWwudG9Mb3dlckNhc2UoKV0gOiAodmFsKSA9PiAhIW1hcFt2YWxdO1xufVxudmFyIHNwZWNpYWxCb29sZWFuQXR0cnMgPSBgaXRlbXNjb3BlLGFsbG93ZnVsbHNjcmVlbixmb3Jtbm92YWxpZGF0ZSxpc21hcCxub21vZHVsZSxub3ZhbGlkYXRlLHJlYWRvbmx5YDtcbnZhciBpc0Jvb2xlYW5BdHRyMiA9IC8qIEBfX1BVUkVfXyAqLyBtYWtlTWFwKHNwZWNpYWxCb29sZWFuQXR0cnMgKyBgLGFzeW5jLGF1dG9mb2N1cyxhdXRvcGxheSxjb250cm9scyxkZWZhdWx0LGRlZmVyLGRpc2FibGVkLGhpZGRlbixsb29wLG9wZW4scmVxdWlyZWQscmV2ZXJzZWQsc2NvcGVkLHNlYW1sZXNzLGNoZWNrZWQsbXV0ZWQsbXVsdGlwbGUsc2VsZWN0ZWRgKTtcbnZhciBFTVBUWV9PQkogPSB0cnVlID8gT2JqZWN0LmZyZWV6ZSh7fSkgOiB7fTtcbnZhciBFTVBUWV9BUlIgPSB0cnVlID8gT2JqZWN0LmZyZWV6ZShbXSkgOiBbXTtcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgaGFzT3duID0gKHZhbCwga2V5KSA9PiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbCwga2V5KTtcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbnZhciBpc01hcCA9ICh2YWwpID0+IHRvVHlwZVN0cmluZyh2YWwpID09PSBcIltvYmplY3QgTWFwXVwiO1xudmFyIGlzU3RyaW5nID0gKHZhbCkgPT4gdHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIjtcbnZhciBpc1N5bWJvbCA9ICh2YWwpID0+IHR5cGVvZiB2YWwgPT09IFwic3ltYm9sXCI7XG52YXIgaXNPYmplY3QgPSAodmFsKSA9PiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIjtcbnZhciBvYmplY3RUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgdG9UeXBlU3RyaW5nID0gKHZhbHVlKSA9PiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbnZhciB0b1Jhd1R5cGUgPSAodmFsdWUpID0+IHtcbiAgcmV0dXJuIHRvVHlwZVN0cmluZyh2YWx1ZSkuc2xpY2UoOCwgLTEpO1xufTtcbnZhciBpc0ludGVnZXJLZXkgPSAoa2V5KSA9PiBpc1N0cmluZyhrZXkpICYmIGtleSAhPT0gXCJOYU5cIiAmJiBrZXlbMF0gIT09IFwiLVwiICYmIFwiXCIgKyBwYXJzZUludChrZXksIDEwKSA9PT0ga2V5O1xudmFyIGNhY2hlU3RyaW5nRnVuY3Rpb24gPSAoZm4pID0+IHtcbiAgY29uc3QgY2FjaGUgPSAvKiBAX19QVVJFX18gKi8gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgcmV0dXJuIChzdHIpID0+IHtcbiAgICBjb25zdCBoaXQgPSBjYWNoZVtzdHJdO1xuICAgIHJldHVybiBoaXQgfHwgKGNhY2hlW3N0cl0gPSBmbihzdHIpKTtcbiAgfTtcbn07XG52YXIgY2FtZWxpemVSRSA9IC8tKFxcdykvZztcbnZhciBjYW1lbGl6ZSA9IGNhY2hlU3RyaW5nRnVuY3Rpb24oKHN0cikgPT4ge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoY2FtZWxpemVSRSwgKF8sIGMpID0+IGMgPyBjLnRvVXBwZXJDYXNlKCkgOiBcIlwiKTtcbn0pO1xudmFyIGh5cGhlbmF0ZVJFID0gL1xcQihbQS1aXSkvZztcbnZhciBoeXBoZW5hdGUgPSBjYWNoZVN0cmluZ0Z1bmN0aW9uKChzdHIpID0+IHN0ci5yZXBsYWNlKGh5cGhlbmF0ZVJFLCBcIi0kMVwiKS50b0xvd2VyQ2FzZSgpKTtcbnZhciBjYXBpdGFsaXplID0gY2FjaGVTdHJpbmdGdW5jdGlvbigoc3RyKSA9PiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSkpO1xudmFyIHRvSGFuZGxlcktleSA9IGNhY2hlU3RyaW5nRnVuY3Rpb24oKHN0cikgPT4gc3RyID8gYG9uJHtjYXBpdGFsaXplKHN0cil9YCA6IGBgKTtcbnZhciBoYXNDaGFuZ2VkID0gKHZhbHVlLCBvbGRWYWx1ZSkgPT4gdmFsdWUgIT09IG9sZFZhbHVlICYmICh2YWx1ZSA9PT0gdmFsdWUgfHwgb2xkVmFsdWUgPT09IG9sZFZhbHVlKTtcblxuLy8gbm9kZV9tb2R1bGVzL0B2dWUvcmVhY3Rpdml0eS9kaXN0L3JlYWN0aXZpdHkuZXNtLWJ1bmRsZXIuanNcbnZhciB0YXJnZXRNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTtcbnZhciBlZmZlY3RTdGFjayA9IFtdO1xudmFyIGFjdGl2ZUVmZmVjdDtcbnZhciBJVEVSQVRFX0tFWSA9IFN5bWJvbCh0cnVlID8gXCJpdGVyYXRlXCIgOiBcIlwiKTtcbnZhciBNQVBfS0VZX0lURVJBVEVfS0VZID0gU3ltYm9sKHRydWUgPyBcIk1hcCBrZXkgaXRlcmF0ZVwiIDogXCJcIik7XG5mdW5jdGlvbiBpc0VmZmVjdChmbikge1xuICByZXR1cm4gZm4gJiYgZm4uX2lzRWZmZWN0ID09PSB0cnVlO1xufVxuZnVuY3Rpb24gZWZmZWN0Mihmbiwgb3B0aW9ucyA9IEVNUFRZX09CSikge1xuICBpZiAoaXNFZmZlY3QoZm4pKSB7XG4gICAgZm4gPSBmbi5yYXc7XG4gIH1cbiAgY29uc3QgZWZmZWN0MyA9IGNyZWF0ZVJlYWN0aXZlRWZmZWN0KGZuLCBvcHRpb25zKTtcbiAgaWYgKCFvcHRpb25zLmxhenkpIHtcbiAgICBlZmZlY3QzKCk7XG4gIH1cbiAgcmV0dXJuIGVmZmVjdDM7XG59XG5mdW5jdGlvbiBzdG9wKGVmZmVjdDMpIHtcbiAgaWYgKGVmZmVjdDMuYWN0aXZlKSB7XG4gICAgY2xlYW51cChlZmZlY3QzKTtcbiAgICBpZiAoZWZmZWN0My5vcHRpb25zLm9uU3RvcCkge1xuICAgICAgZWZmZWN0My5vcHRpb25zLm9uU3RvcCgpO1xuICAgIH1cbiAgICBlZmZlY3QzLmFjdGl2ZSA9IGZhbHNlO1xuICB9XG59XG52YXIgdWlkID0gMDtcbmZ1bmN0aW9uIGNyZWF0ZVJlYWN0aXZlRWZmZWN0KGZuLCBvcHRpb25zKSB7XG4gIGNvbnN0IGVmZmVjdDMgPSBmdW5jdGlvbiByZWFjdGl2ZUVmZmVjdCgpIHtcbiAgICBpZiAoIWVmZmVjdDMuYWN0aXZlKSB7XG4gICAgICByZXR1cm4gZm4oKTtcbiAgICB9XG4gICAgaWYgKCFlZmZlY3RTdGFjay5pbmNsdWRlcyhlZmZlY3QzKSkge1xuICAgICAgY2xlYW51cChlZmZlY3QzKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGVuYWJsZVRyYWNraW5nKCk7XG4gICAgICAgIGVmZmVjdFN0YWNrLnB1c2goZWZmZWN0Myk7XG4gICAgICAgIGFjdGl2ZUVmZmVjdCA9IGVmZmVjdDM7XG4gICAgICAgIHJldHVybiBmbigpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZWZmZWN0U3RhY2sucG9wKCk7XG4gICAgICAgIHJlc2V0VHJhY2tpbmcoKTtcbiAgICAgICAgYWN0aXZlRWZmZWN0ID0gZWZmZWN0U3RhY2tbZWZmZWN0U3RhY2subGVuZ3RoIC0gMV07XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBlZmZlY3QzLmlkID0gdWlkKys7XG4gIGVmZmVjdDMuYWxsb3dSZWN1cnNlID0gISFvcHRpb25zLmFsbG93UmVjdXJzZTtcbiAgZWZmZWN0My5faXNFZmZlY3QgPSB0cnVlO1xuICBlZmZlY3QzLmFjdGl2ZSA9IHRydWU7XG4gIGVmZmVjdDMucmF3ID0gZm47XG4gIGVmZmVjdDMuZGVwcyA9IFtdO1xuICBlZmZlY3QzLm9wdGlvbnMgPSBvcHRpb25zO1xuICByZXR1cm4gZWZmZWN0Mztcbn1cbmZ1bmN0aW9uIGNsZWFudXAoZWZmZWN0Mykge1xuICBjb25zdCB7IGRlcHMgfSA9IGVmZmVjdDM7XG4gIGlmIChkZXBzLmxlbmd0aCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGVwcy5sZW5ndGg7IGkrKykge1xuICAgICAgZGVwc1tpXS5kZWxldGUoZWZmZWN0Myk7XG4gICAgfVxuICAgIGRlcHMubGVuZ3RoID0gMDtcbiAgfVxufVxudmFyIHNob3VsZFRyYWNrID0gdHJ1ZTtcbnZhciB0cmFja1N0YWNrID0gW107XG5mdW5jdGlvbiBwYXVzZVRyYWNraW5nKCkge1xuICB0cmFja1N0YWNrLnB1c2goc2hvdWxkVHJhY2spO1xuICBzaG91bGRUcmFjayA9IGZhbHNlO1xufVxuZnVuY3Rpb24gZW5hYmxlVHJhY2tpbmcoKSB7XG4gIHRyYWNrU3RhY2sucHVzaChzaG91bGRUcmFjayk7XG4gIHNob3VsZFRyYWNrID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIHJlc2V0VHJhY2tpbmcoKSB7XG4gIGNvbnN0IGxhc3QgPSB0cmFja1N0YWNrLnBvcCgpO1xuICBzaG91bGRUcmFjayA9IGxhc3QgPT09IHZvaWQgMCA/IHRydWUgOiBsYXN0O1xufVxuZnVuY3Rpb24gdHJhY2sodGFyZ2V0LCB0eXBlLCBrZXkpIHtcbiAgaWYgKCFzaG91bGRUcmFjayB8fCBhY3RpdmVFZmZlY3QgPT09IHZvaWQgMCkge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgZGVwc01hcCA9IHRhcmdldE1hcC5nZXQodGFyZ2V0KTtcbiAgaWYgKCFkZXBzTWFwKSB7XG4gICAgdGFyZ2V0TWFwLnNldCh0YXJnZXQsIGRlcHNNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpKTtcbiAgfVxuICBsZXQgZGVwID0gZGVwc01hcC5nZXQoa2V5KTtcbiAgaWYgKCFkZXApIHtcbiAgICBkZXBzTWFwLnNldChrZXksIGRlcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCkpO1xuICB9XG4gIGlmICghZGVwLmhhcyhhY3RpdmVFZmZlY3QpKSB7XG4gICAgZGVwLmFkZChhY3RpdmVFZmZlY3QpO1xuICAgIGFjdGl2ZUVmZmVjdC5kZXBzLnB1c2goZGVwKTtcbiAgICBpZiAoYWN0aXZlRWZmZWN0Lm9wdGlvbnMub25UcmFjaykge1xuICAgICAgYWN0aXZlRWZmZWN0Lm9wdGlvbnMub25UcmFjayh7XG4gICAgICAgIGVmZmVjdDogYWN0aXZlRWZmZWN0LFxuICAgICAgICB0YXJnZXQsXG4gICAgICAgIHR5cGUsXG4gICAgICAgIGtleVxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5mdW5jdGlvbiB0cmlnZ2VyKHRhcmdldCwgdHlwZSwga2V5LCBuZXdWYWx1ZSwgb2xkVmFsdWUsIG9sZFRhcmdldCkge1xuICBjb25zdCBkZXBzTWFwID0gdGFyZ2V0TWFwLmdldCh0YXJnZXQpO1xuICBpZiAoIWRlcHNNYXApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgZWZmZWN0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGNvbnN0IGFkZDIgPSAoZWZmZWN0c1RvQWRkKSA9PiB7XG4gICAgaWYgKGVmZmVjdHNUb0FkZCkge1xuICAgICAgZWZmZWN0c1RvQWRkLmZvckVhY2goKGVmZmVjdDMpID0+IHtcbiAgICAgICAgaWYgKGVmZmVjdDMgIT09IGFjdGl2ZUVmZmVjdCB8fCBlZmZlY3QzLmFsbG93UmVjdXJzZSkge1xuICAgICAgICAgIGVmZmVjdHMuYWRkKGVmZmVjdDMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIGlmICh0eXBlID09PSBcImNsZWFyXCIpIHtcbiAgICBkZXBzTWFwLmZvckVhY2goYWRkMik7XG4gIH0gZWxzZSBpZiAoa2V5ID09PSBcImxlbmd0aFwiICYmIGlzQXJyYXkodGFyZ2V0KSkge1xuICAgIGRlcHNNYXAuZm9yRWFjaCgoZGVwLCBrZXkyKSA9PiB7XG4gICAgICBpZiAoa2V5MiA9PT0gXCJsZW5ndGhcIiB8fCBrZXkyID49IG5ld1ZhbHVlKSB7XG4gICAgICAgIGFkZDIoZGVwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoa2V5ICE9PSB2b2lkIDApIHtcbiAgICAgIGFkZDIoZGVwc01hcC5nZXQoa2V5KSk7XG4gICAgfVxuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSBcImFkZFwiOlxuICAgICAgICBpZiAoIWlzQXJyYXkodGFyZ2V0KSkge1xuICAgICAgICAgIGFkZDIoZGVwc01hcC5nZXQoSVRFUkFURV9LRVkpKTtcbiAgICAgICAgICBpZiAoaXNNYXAodGFyZ2V0KSkge1xuICAgICAgICAgICAgYWRkMihkZXBzTWFwLmdldChNQVBfS0VZX0lURVJBVEVfS0VZKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGlzSW50ZWdlcktleShrZXkpKSB7XG4gICAgICAgICAgYWRkMihkZXBzTWFwLmdldChcImxlbmd0aFwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiZGVsZXRlXCI6XG4gICAgICAgIGlmICghaXNBcnJheSh0YXJnZXQpKSB7XG4gICAgICAgICAgYWRkMihkZXBzTWFwLmdldChJVEVSQVRFX0tFWSkpO1xuICAgICAgICAgIGlmIChpc01hcCh0YXJnZXQpKSB7XG4gICAgICAgICAgICBhZGQyKGRlcHNNYXAuZ2V0KE1BUF9LRVlfSVRFUkFURV9LRVkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwic2V0XCI6XG4gICAgICAgIGlmIChpc01hcCh0YXJnZXQpKSB7XG4gICAgICAgICAgYWRkMihkZXBzTWFwLmdldChJVEVSQVRFX0tFWSkpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBjb25zdCBydW4gPSAoZWZmZWN0MykgPT4ge1xuICAgIGlmIChlZmZlY3QzLm9wdGlvbnMub25UcmlnZ2VyKSB7XG4gICAgICBlZmZlY3QzLm9wdGlvbnMub25UcmlnZ2VyKHtcbiAgICAgICAgZWZmZWN0OiBlZmZlY3QzLFxuICAgICAgICB0YXJnZXQsXG4gICAgICAgIGtleSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgbmV3VmFsdWUsXG4gICAgICAgIG9sZFZhbHVlLFxuICAgICAgICBvbGRUYXJnZXRcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoZWZmZWN0My5vcHRpb25zLnNjaGVkdWxlcikge1xuICAgICAgZWZmZWN0My5vcHRpb25zLnNjaGVkdWxlcihlZmZlY3QzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWZmZWN0MygpO1xuICAgIH1cbiAgfTtcbiAgZWZmZWN0cy5mb3JFYWNoKHJ1bik7XG59XG52YXIgaXNOb25UcmFja2FibGVLZXlzID0gLyogQF9fUFVSRV9fICovIG1ha2VNYXAoYF9fcHJvdG9fXyxfX3ZfaXNSZWYsX19pc1Z1ZWApO1xudmFyIGJ1aWx0SW5TeW1ib2xzID0gbmV3IFNldChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhTeW1ib2wpLm1hcCgoa2V5KSA9PiBTeW1ib2xba2V5XSkuZmlsdGVyKGlzU3ltYm9sKSk7XG52YXIgZ2V0MiA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVHZXR0ZXIoKTtcbnZhciByZWFkb25seUdldCA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVHZXR0ZXIodHJ1ZSk7XG52YXIgYXJyYXlJbnN0cnVtZW50YXRpb25zID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUFycmF5SW5zdHJ1bWVudGF0aW9ucygpO1xuZnVuY3Rpb24gY3JlYXRlQXJyYXlJbnN0cnVtZW50YXRpb25zKCkge1xuICBjb25zdCBpbnN0cnVtZW50YXRpb25zID0ge307XG4gIFtcImluY2x1ZGVzXCIsIFwiaW5kZXhPZlwiLCBcImxhc3RJbmRleE9mXCJdLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGluc3RydW1lbnRhdGlvbnNba2V5XSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgIGNvbnN0IGFyciA9IHRvUmF3KHRoaXMpO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0cmFjayhhcnIsIFwiZ2V0XCIsIGkgKyBcIlwiKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlcyA9IGFycltrZXldKC4uLmFyZ3MpO1xuICAgICAgaWYgKHJlcyA9PT0gLTEgfHwgcmVzID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gYXJyW2tleV0oLi4uYXJncy5tYXAodG9SYXcpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG4gIFtcInB1c2hcIiwgXCJwb3BcIiwgXCJzaGlmdFwiLCBcInVuc2hpZnRcIiwgXCJzcGxpY2VcIl0uZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgaW5zdHJ1bWVudGF0aW9uc1trZXldID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgcGF1c2VUcmFja2luZygpO1xuICAgICAgY29uc3QgcmVzID0gdG9SYXcodGhpcylba2V5XS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIHJlc2V0VHJhY2tpbmcoKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgfSk7XG4gIHJldHVybiBpbnN0cnVtZW50YXRpb25zO1xufVxuZnVuY3Rpb24gY3JlYXRlR2V0dGVyKGlzUmVhZG9ubHkgPSBmYWxzZSwgc2hhbGxvdyA9IGZhbHNlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBnZXQzKHRhcmdldCwga2V5LCByZWNlaXZlcikge1xuICAgIGlmIChrZXkgPT09IFwiX192X2lzUmVhY3RpdmVcIikge1xuICAgICAgcmV0dXJuICFpc1JlYWRvbmx5O1xuICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcIl9fdl9pc1JlYWRvbmx5XCIpIHtcbiAgICAgIHJldHVybiBpc1JlYWRvbmx5O1xuICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcIl9fdl9yYXdcIiAmJiByZWNlaXZlciA9PT0gKGlzUmVhZG9ubHkgPyBzaGFsbG93ID8gc2hhbGxvd1JlYWRvbmx5TWFwIDogcmVhZG9ubHlNYXAgOiBzaGFsbG93ID8gc2hhbGxvd1JlYWN0aXZlTWFwIDogcmVhY3RpdmVNYXApLmdldCh0YXJnZXQpKSB7XG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICBjb25zdCB0YXJnZXRJc0FycmF5ID0gaXNBcnJheSh0YXJnZXQpO1xuICAgIGlmICghaXNSZWFkb25seSAmJiB0YXJnZXRJc0FycmF5ICYmIGhhc093bihhcnJheUluc3RydW1lbnRhdGlvbnMsIGtleSkpIHtcbiAgICAgIHJldHVybiBSZWZsZWN0LmdldChhcnJheUluc3RydW1lbnRhdGlvbnMsIGtleSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgICBjb25zdCByZXMgPSBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICAgIGlmIChpc1N5bWJvbChrZXkpID8gYnVpbHRJblN5bWJvbHMuaGFzKGtleSkgOiBpc05vblRyYWNrYWJsZUtleXMoa2V5KSkge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaWYgKCFpc1JlYWRvbmx5KSB7XG4gICAgICB0cmFjayh0YXJnZXQsIFwiZ2V0XCIsIGtleSk7XG4gICAgfVxuICAgIGlmIChzaGFsbG93KSB7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgICBpZiAoaXNSZWYocmVzKSkge1xuICAgICAgY29uc3Qgc2hvdWxkVW53cmFwID0gIXRhcmdldElzQXJyYXkgfHwgIWlzSW50ZWdlcktleShrZXkpO1xuICAgICAgcmV0dXJuIHNob3VsZFVud3JhcCA/IHJlcy52YWx1ZSA6IHJlcztcbiAgICB9XG4gICAgaWYgKGlzT2JqZWN0KHJlcykpIHtcbiAgICAgIHJldHVybiBpc1JlYWRvbmx5ID8gcmVhZG9ubHkocmVzKSA6IHJlYWN0aXZlMihyZXMpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xuICB9O1xufVxudmFyIHNldDIgPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlU2V0dGVyKCk7XG5mdW5jdGlvbiBjcmVhdGVTZXR0ZXIoc2hhbGxvdyA9IGZhbHNlKSB7XG4gIHJldHVybiBmdW5jdGlvbiBzZXQzKHRhcmdldCwga2V5LCB2YWx1ZSwgcmVjZWl2ZXIpIHtcbiAgICBsZXQgb2xkVmFsdWUgPSB0YXJnZXRba2V5XTtcbiAgICBpZiAoIXNoYWxsb3cpIHtcbiAgICAgIHZhbHVlID0gdG9SYXcodmFsdWUpO1xuICAgICAgb2xkVmFsdWUgPSB0b1JhdyhvbGRWYWx1ZSk7XG4gICAgICBpZiAoIWlzQXJyYXkodGFyZ2V0KSAmJiBpc1JlZihvbGRWYWx1ZSkgJiYgIWlzUmVmKHZhbHVlKSkge1xuICAgICAgICBvbGRWYWx1ZS52YWx1ZSA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgaGFkS2V5ID0gaXNBcnJheSh0YXJnZXQpICYmIGlzSW50ZWdlcktleShrZXkpID8gTnVtYmVyKGtleSkgPCB0YXJnZXQubGVuZ3RoIDogaGFzT3duKHRhcmdldCwga2V5KTtcbiAgICBjb25zdCByZXN1bHQgPSBSZWZsZWN0LnNldCh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKTtcbiAgICBpZiAodGFyZ2V0ID09PSB0b1JhdyhyZWNlaXZlcikpIHtcbiAgICAgIGlmICghaGFkS2V5KSB7XG4gICAgICAgIHRyaWdnZXIodGFyZ2V0LCBcImFkZFwiLCBrZXksIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaGFzQ2hhbmdlZCh2YWx1ZSwgb2xkVmFsdWUpKSB7XG4gICAgICAgIHRyaWdnZXIodGFyZ2V0LCBcInNldFwiLCBrZXksIHZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5mdW5jdGlvbiBkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSkge1xuICBjb25zdCBoYWRLZXkgPSBoYXNPd24odGFyZ2V0LCBrZXkpO1xuICBjb25zdCBvbGRWYWx1ZSA9IHRhcmdldFtrZXldO1xuICBjb25zdCByZXN1bHQgPSBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwga2V5KTtcbiAgaWYgKHJlc3VsdCAmJiBoYWRLZXkpIHtcbiAgICB0cmlnZ2VyKHRhcmdldCwgXCJkZWxldGVcIiwga2V5LCB2b2lkIDAsIG9sZFZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gaGFzKHRhcmdldCwga2V5KSB7XG4gIGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuaGFzKHRhcmdldCwga2V5KTtcbiAgaWYgKCFpc1N5bWJvbChrZXkpIHx8ICFidWlsdEluU3ltYm9scy5oYXMoa2V5KSkge1xuICAgIHRyYWNrKHRhcmdldCwgXCJoYXNcIiwga2V5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gb3duS2V5cyh0YXJnZXQpIHtcbiAgdHJhY2sodGFyZ2V0LCBcIml0ZXJhdGVcIiwgaXNBcnJheSh0YXJnZXQpID8gXCJsZW5ndGhcIiA6IElURVJBVEVfS0VZKTtcbiAgcmV0dXJuIFJlZmxlY3Qub3duS2V5cyh0YXJnZXQpO1xufVxudmFyIG11dGFibGVIYW5kbGVycyA9IHtcbiAgZ2V0OiBnZXQyLFxuICBzZXQ6IHNldDIsXG4gIGRlbGV0ZVByb3BlcnR5LFxuICBoYXMsXG4gIG93bktleXNcbn07XG52YXIgcmVhZG9ubHlIYW5kbGVycyA9IHtcbiAgZ2V0OiByZWFkb25seUdldCxcbiAgc2V0KHRhcmdldCwga2V5KSB7XG4gICAgaWYgKHRydWUpIHtcbiAgICAgIGNvbnNvbGUud2FybihgU2V0IG9wZXJhdGlvbiBvbiBrZXkgXCIke1N0cmluZyhrZXkpfVwiIGZhaWxlZDogdGFyZ2V0IGlzIHJlYWRvbmx5LmAsIHRhcmdldCk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSkge1xuICAgIGlmICh0cnVlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYERlbGV0ZSBvcGVyYXRpb24gb24ga2V5IFwiJHtTdHJpbmcoa2V5KX1cIiBmYWlsZWQ6IHRhcmdldCBpcyByZWFkb25seS5gLCB0YXJnZXQpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcbnZhciB0b1JlYWN0aXZlID0gKHZhbHVlKSA9PiBpc09iamVjdCh2YWx1ZSkgPyByZWFjdGl2ZTIodmFsdWUpIDogdmFsdWU7XG52YXIgdG9SZWFkb25seSA9ICh2YWx1ZSkgPT4gaXNPYmplY3QodmFsdWUpID8gcmVhZG9ubHkodmFsdWUpIDogdmFsdWU7XG52YXIgdG9TaGFsbG93ID0gKHZhbHVlKSA9PiB2YWx1ZTtcbnZhciBnZXRQcm90byA9ICh2KSA9PiBSZWZsZWN0LmdldFByb3RvdHlwZU9mKHYpO1xuZnVuY3Rpb24gZ2V0JDEodGFyZ2V0LCBrZXksIGlzUmVhZG9ubHkgPSBmYWxzZSwgaXNTaGFsbG93ID0gZmFsc2UpIHtcbiAgdGFyZ2V0ID0gdGFyZ2V0W1xuICAgIFwiX192X3Jhd1wiXG4gICAgLyogUkFXICovXG4gIF07XG4gIGNvbnN0IHJhd1RhcmdldCA9IHRvUmF3KHRhcmdldCk7XG4gIGNvbnN0IHJhd0tleSA9IHRvUmF3KGtleSk7XG4gIGlmIChrZXkgIT09IHJhd0tleSkge1xuICAgICFpc1JlYWRvbmx5ICYmIHRyYWNrKHJhd1RhcmdldCwgXCJnZXRcIiwga2V5KTtcbiAgfVxuICAhaXNSZWFkb25seSAmJiB0cmFjayhyYXdUYXJnZXQsIFwiZ2V0XCIsIHJhd0tleSk7XG4gIGNvbnN0IHsgaGFzOiBoYXMyIH0gPSBnZXRQcm90byhyYXdUYXJnZXQpO1xuICBjb25zdCB3cmFwID0gaXNTaGFsbG93ID8gdG9TaGFsbG93IDogaXNSZWFkb25seSA/IHRvUmVhZG9ubHkgOiB0b1JlYWN0aXZlO1xuICBpZiAoaGFzMi5jYWxsKHJhd1RhcmdldCwga2V5KSkge1xuICAgIHJldHVybiB3cmFwKHRhcmdldC5nZXQoa2V5KSk7XG4gIH0gZWxzZSBpZiAoaGFzMi5jYWxsKHJhd1RhcmdldCwgcmF3S2V5KSkge1xuICAgIHJldHVybiB3cmFwKHRhcmdldC5nZXQocmF3S2V5KSk7XG4gIH0gZWxzZSBpZiAodGFyZ2V0ICE9PSByYXdUYXJnZXQpIHtcbiAgICB0YXJnZXQuZ2V0KGtleSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGhhcyQxKGtleSwgaXNSZWFkb25seSA9IGZhbHNlKSB7XG4gIGNvbnN0IHRhcmdldCA9IHRoaXNbXG4gICAgXCJfX3ZfcmF3XCJcbiAgICAvKiBSQVcgKi9cbiAgXTtcbiAgY29uc3QgcmF3VGFyZ2V0ID0gdG9SYXcodGFyZ2V0KTtcbiAgY29uc3QgcmF3S2V5ID0gdG9SYXcoa2V5KTtcbiAgaWYgKGtleSAhPT0gcmF3S2V5KSB7XG4gICAgIWlzUmVhZG9ubHkgJiYgdHJhY2socmF3VGFyZ2V0LCBcImhhc1wiLCBrZXkpO1xuICB9XG4gICFpc1JlYWRvbmx5ICYmIHRyYWNrKHJhd1RhcmdldCwgXCJoYXNcIiwgcmF3S2V5KTtcbiAgcmV0dXJuIGtleSA9PT0gcmF3S2V5ID8gdGFyZ2V0LmhhcyhrZXkpIDogdGFyZ2V0LmhhcyhrZXkpIHx8IHRhcmdldC5oYXMocmF3S2V5KTtcbn1cbmZ1bmN0aW9uIHNpemUodGFyZ2V0LCBpc1JlYWRvbmx5ID0gZmFsc2UpIHtcbiAgdGFyZ2V0ID0gdGFyZ2V0W1xuICAgIFwiX192X3Jhd1wiXG4gICAgLyogUkFXICovXG4gIF07XG4gICFpc1JlYWRvbmx5ICYmIHRyYWNrKHRvUmF3KHRhcmdldCksIFwiaXRlcmF0ZVwiLCBJVEVSQVRFX0tFWSk7XG4gIHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIFwic2l6ZVwiLCB0YXJnZXQpO1xufVxuZnVuY3Rpb24gYWRkKHZhbHVlKSB7XG4gIHZhbHVlID0gdG9SYXcodmFsdWUpO1xuICBjb25zdCB0YXJnZXQgPSB0b1Jhdyh0aGlzKTtcbiAgY29uc3QgcHJvdG8gPSBnZXRQcm90byh0YXJnZXQpO1xuICBjb25zdCBoYWRLZXkgPSBwcm90by5oYXMuY2FsbCh0YXJnZXQsIHZhbHVlKTtcbiAgaWYgKCFoYWRLZXkpIHtcbiAgICB0YXJnZXQuYWRkKHZhbHVlKTtcbiAgICB0cmlnZ2VyKHRhcmdldCwgXCJhZGRcIiwgdmFsdWUsIHZhbHVlKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cbmZ1bmN0aW9uIHNldCQxKGtleSwgdmFsdWUpIHtcbiAgdmFsdWUgPSB0b1Jhdyh2YWx1ZSk7XG4gIGNvbnN0IHRhcmdldCA9IHRvUmF3KHRoaXMpO1xuICBjb25zdCB7IGhhczogaGFzMiwgZ2V0OiBnZXQzIH0gPSBnZXRQcm90byh0YXJnZXQpO1xuICBsZXQgaGFkS2V5ID0gaGFzMi5jYWxsKHRhcmdldCwga2V5KTtcbiAgaWYgKCFoYWRLZXkpIHtcbiAgICBrZXkgPSB0b1JhdyhrZXkpO1xuICAgIGhhZEtleSA9IGhhczIuY2FsbCh0YXJnZXQsIGtleSk7XG4gIH0gZWxzZSBpZiAodHJ1ZSkge1xuICAgIGNoZWNrSWRlbnRpdHlLZXlzKHRhcmdldCwgaGFzMiwga2V5KTtcbiAgfVxuICBjb25zdCBvbGRWYWx1ZSA9IGdldDMuY2FsbCh0YXJnZXQsIGtleSk7XG4gIHRhcmdldC5zZXQoa2V5LCB2YWx1ZSk7XG4gIGlmICghaGFkS2V5KSB7XG4gICAgdHJpZ2dlcih0YXJnZXQsIFwiYWRkXCIsIGtleSwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKGhhc0NoYW5nZWQodmFsdWUsIG9sZFZhbHVlKSkge1xuICAgIHRyaWdnZXIodGFyZ2V0LCBcInNldFwiLCBrZXksIHZhbHVlLCBvbGRWYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5mdW5jdGlvbiBkZWxldGVFbnRyeShrZXkpIHtcbiAgY29uc3QgdGFyZ2V0ID0gdG9SYXcodGhpcyk7XG4gIGNvbnN0IHsgaGFzOiBoYXMyLCBnZXQ6IGdldDMgfSA9IGdldFByb3RvKHRhcmdldCk7XG4gIGxldCBoYWRLZXkgPSBoYXMyLmNhbGwodGFyZ2V0LCBrZXkpO1xuICBpZiAoIWhhZEtleSkge1xuICAgIGtleSA9IHRvUmF3KGtleSk7XG4gICAgaGFkS2V5ID0gaGFzMi5jYWxsKHRhcmdldCwga2V5KTtcbiAgfSBlbHNlIGlmICh0cnVlKSB7XG4gICAgY2hlY2tJZGVudGl0eUtleXModGFyZ2V0LCBoYXMyLCBrZXkpO1xuICB9XG4gIGNvbnN0IG9sZFZhbHVlID0gZ2V0MyA/IGdldDMuY2FsbCh0YXJnZXQsIGtleSkgOiB2b2lkIDA7XG4gIGNvbnN0IHJlc3VsdCA9IHRhcmdldC5kZWxldGUoa2V5KTtcbiAgaWYgKGhhZEtleSkge1xuICAgIHRyaWdnZXIodGFyZ2V0LCBcImRlbGV0ZVwiLCBrZXksIHZvaWQgMCwgb2xkVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjbGVhcigpIHtcbiAgY29uc3QgdGFyZ2V0ID0gdG9SYXcodGhpcyk7XG4gIGNvbnN0IGhhZEl0ZW1zID0gdGFyZ2V0LnNpemUgIT09IDA7XG4gIGNvbnN0IG9sZFRhcmdldCA9IHRydWUgPyBpc01hcCh0YXJnZXQpID8gbmV3IE1hcCh0YXJnZXQpIDogbmV3IFNldCh0YXJnZXQpIDogdm9pZCAwO1xuICBjb25zdCByZXN1bHQgPSB0YXJnZXQuY2xlYXIoKTtcbiAgaWYgKGhhZEl0ZW1zKSB7XG4gICAgdHJpZ2dlcih0YXJnZXQsIFwiY2xlYXJcIiwgdm9pZCAwLCB2b2lkIDAsIG9sZFRhcmdldCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUZvckVhY2goaXNSZWFkb25seSwgaXNTaGFsbG93KSB7XG4gIHJldHVybiBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgY29uc3Qgb2JzZXJ2ZWQgPSB0aGlzO1xuICAgIGNvbnN0IHRhcmdldCA9IG9ic2VydmVkW1xuICAgICAgXCJfX3ZfcmF3XCJcbiAgICAgIC8qIFJBVyAqL1xuICAgIF07XG4gICAgY29uc3QgcmF3VGFyZ2V0ID0gdG9SYXcodGFyZ2V0KTtcbiAgICBjb25zdCB3cmFwID0gaXNTaGFsbG93ID8gdG9TaGFsbG93IDogaXNSZWFkb25seSA/IHRvUmVhZG9ubHkgOiB0b1JlYWN0aXZlO1xuICAgICFpc1JlYWRvbmx5ICYmIHRyYWNrKHJhd1RhcmdldCwgXCJpdGVyYXRlXCIsIElURVJBVEVfS0VZKTtcbiAgICByZXR1cm4gdGFyZ2V0LmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHdyYXAodmFsdWUpLCB3cmFwKGtleSksIG9ic2VydmVkKTtcbiAgICB9KTtcbiAgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUl0ZXJhYmxlTWV0aG9kKG1ldGhvZCwgaXNSZWFkb25seSwgaXNTaGFsbG93KSB7XG4gIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpc1tcbiAgICAgIFwiX192X3Jhd1wiXG4gICAgICAvKiBSQVcgKi9cbiAgICBdO1xuICAgIGNvbnN0IHJhd1RhcmdldCA9IHRvUmF3KHRhcmdldCk7XG4gICAgY29uc3QgdGFyZ2V0SXNNYXAgPSBpc01hcChyYXdUYXJnZXQpO1xuICAgIGNvbnN0IGlzUGFpciA9IG1ldGhvZCA9PT0gXCJlbnRyaWVzXCIgfHwgbWV0aG9kID09PSBTeW1ib2wuaXRlcmF0b3IgJiYgdGFyZ2V0SXNNYXA7XG4gICAgY29uc3QgaXNLZXlPbmx5ID0gbWV0aG9kID09PSBcImtleXNcIiAmJiB0YXJnZXRJc01hcDtcbiAgICBjb25zdCBpbm5lckl0ZXJhdG9yID0gdGFyZ2V0W21ldGhvZF0oLi4uYXJncyk7XG4gICAgY29uc3Qgd3JhcCA9IGlzU2hhbGxvdyA/IHRvU2hhbGxvdyA6IGlzUmVhZG9ubHkgPyB0b1JlYWRvbmx5IDogdG9SZWFjdGl2ZTtcbiAgICAhaXNSZWFkb25seSAmJiB0cmFjayhyYXdUYXJnZXQsIFwiaXRlcmF0ZVwiLCBpc0tleU9ubHkgPyBNQVBfS0VZX0lURVJBVEVfS0VZIDogSVRFUkFURV9LRVkpO1xuICAgIHJldHVybiB7XG4gICAgICAvLyBpdGVyYXRvciBwcm90b2NvbFxuICAgICAgbmV4dCgpIHtcbiAgICAgICAgY29uc3QgeyB2YWx1ZSwgZG9uZSB9ID0gaW5uZXJJdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIHJldHVybiBkb25lID8geyB2YWx1ZSwgZG9uZSB9IDoge1xuICAgICAgICAgIHZhbHVlOiBpc1BhaXIgPyBbd3JhcCh2YWx1ZVswXSksIHdyYXAodmFsdWVbMV0pXSA6IHdyYXAodmFsdWUpLFxuICAgICAgICAgIGRvbmVcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICAvLyBpdGVyYWJsZSBwcm90b2NvbFxuICAgICAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH07XG4gIH07XG59XG5mdW5jdGlvbiBjcmVhdGVSZWFkb25seU1ldGhvZCh0eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgaWYgKHRydWUpIHtcbiAgICAgIGNvbnN0IGtleSA9IGFyZ3NbMF0gPyBgb24ga2V5IFwiJHthcmdzWzBdfVwiIGAgOiBgYDtcbiAgICAgIGNvbnNvbGUud2FybihgJHtjYXBpdGFsaXplKHR5cGUpfSBvcGVyYXRpb24gJHtrZXl9ZmFpbGVkOiB0YXJnZXQgaXMgcmVhZG9ubHkuYCwgdG9SYXcodGhpcykpO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZSA9PT0gXCJkZWxldGVcIiA/IGZhbHNlIDogdGhpcztcbiAgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUluc3RydW1lbnRhdGlvbnMoKSB7XG4gIGNvbnN0IG11dGFibGVJbnN0cnVtZW50YXRpb25zMiA9IHtcbiAgICBnZXQoa2V5KSB7XG4gICAgICByZXR1cm4gZ2V0JDEodGhpcywga2V5KTtcbiAgICB9LFxuICAgIGdldCBzaXplKCkge1xuICAgICAgcmV0dXJuIHNpemUodGhpcyk7XG4gICAgfSxcbiAgICBoYXM6IGhhcyQxLFxuICAgIGFkZCxcbiAgICBzZXQ6IHNldCQxLFxuICAgIGRlbGV0ZTogZGVsZXRlRW50cnksXG4gICAgY2xlYXIsXG4gICAgZm9yRWFjaDogY3JlYXRlRm9yRWFjaChmYWxzZSwgZmFsc2UpXG4gIH07XG4gIGNvbnN0IHNoYWxsb3dJbnN0cnVtZW50YXRpb25zMiA9IHtcbiAgICBnZXQoa2V5KSB7XG4gICAgICByZXR1cm4gZ2V0JDEodGhpcywga2V5LCBmYWxzZSwgdHJ1ZSk7XG4gICAgfSxcbiAgICBnZXQgc2l6ZSgpIHtcbiAgICAgIHJldHVybiBzaXplKHRoaXMpO1xuICAgIH0sXG4gICAgaGFzOiBoYXMkMSxcbiAgICBhZGQsXG4gICAgc2V0OiBzZXQkMSxcbiAgICBkZWxldGU6IGRlbGV0ZUVudHJ5LFxuICAgIGNsZWFyLFxuICAgIGZvckVhY2g6IGNyZWF0ZUZvckVhY2goZmFsc2UsIHRydWUpXG4gIH07XG4gIGNvbnN0IHJlYWRvbmx5SW5zdHJ1bWVudGF0aW9uczIgPSB7XG4gICAgZ2V0KGtleSkge1xuICAgICAgcmV0dXJuIGdldCQxKHRoaXMsIGtleSwgdHJ1ZSk7XG4gICAgfSxcbiAgICBnZXQgc2l6ZSgpIHtcbiAgICAgIHJldHVybiBzaXplKHRoaXMsIHRydWUpO1xuICAgIH0sXG4gICAgaGFzKGtleSkge1xuICAgICAgcmV0dXJuIGhhcyQxLmNhbGwodGhpcywga2V5LCB0cnVlKTtcbiAgICB9LFxuICAgIGFkZDogY3JlYXRlUmVhZG9ubHlNZXRob2QoXG4gICAgICBcImFkZFwiXG4gICAgICAvKiBBREQgKi9cbiAgICApLFxuICAgIHNldDogY3JlYXRlUmVhZG9ubHlNZXRob2QoXG4gICAgICBcInNldFwiXG4gICAgICAvKiBTRVQgKi9cbiAgICApLFxuICAgIGRlbGV0ZTogY3JlYXRlUmVhZG9ubHlNZXRob2QoXG4gICAgICBcImRlbGV0ZVwiXG4gICAgICAvKiBERUxFVEUgKi9cbiAgICApLFxuICAgIGNsZWFyOiBjcmVhdGVSZWFkb25seU1ldGhvZChcbiAgICAgIFwiY2xlYXJcIlxuICAgICAgLyogQ0xFQVIgKi9cbiAgICApLFxuICAgIGZvckVhY2g6IGNyZWF0ZUZvckVhY2godHJ1ZSwgZmFsc2UpXG4gIH07XG4gIGNvbnN0IHNoYWxsb3dSZWFkb25seUluc3RydW1lbnRhdGlvbnMyID0ge1xuICAgIGdldChrZXkpIHtcbiAgICAgIHJldHVybiBnZXQkMSh0aGlzLCBrZXksIHRydWUsIHRydWUpO1xuICAgIH0sXG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICByZXR1cm4gc2l6ZSh0aGlzLCB0cnVlKTtcbiAgICB9LFxuICAgIGhhcyhrZXkpIHtcbiAgICAgIHJldHVybiBoYXMkMS5jYWxsKHRoaXMsIGtleSwgdHJ1ZSk7XG4gICAgfSxcbiAgICBhZGQ6IGNyZWF0ZVJlYWRvbmx5TWV0aG9kKFxuICAgICAgXCJhZGRcIlxuICAgICAgLyogQUREICovXG4gICAgKSxcbiAgICBzZXQ6IGNyZWF0ZVJlYWRvbmx5TWV0aG9kKFxuICAgICAgXCJzZXRcIlxuICAgICAgLyogU0VUICovXG4gICAgKSxcbiAgICBkZWxldGU6IGNyZWF0ZVJlYWRvbmx5TWV0aG9kKFxuICAgICAgXCJkZWxldGVcIlxuICAgICAgLyogREVMRVRFICovXG4gICAgKSxcbiAgICBjbGVhcjogY3JlYXRlUmVhZG9ubHlNZXRob2QoXG4gICAgICBcImNsZWFyXCJcbiAgICAgIC8qIENMRUFSICovXG4gICAgKSxcbiAgICBmb3JFYWNoOiBjcmVhdGVGb3JFYWNoKHRydWUsIHRydWUpXG4gIH07XG4gIGNvbnN0IGl0ZXJhdG9yTWV0aG9kcyA9IFtcImtleXNcIiwgXCJ2YWx1ZXNcIiwgXCJlbnRyaWVzXCIsIFN5bWJvbC5pdGVyYXRvcl07XG4gIGl0ZXJhdG9yTWV0aG9kcy5mb3JFYWNoKChtZXRob2QpID0+IHtcbiAgICBtdXRhYmxlSW5zdHJ1bWVudGF0aW9uczJbbWV0aG9kXSA9IGNyZWF0ZUl0ZXJhYmxlTWV0aG9kKG1ldGhvZCwgZmFsc2UsIGZhbHNlKTtcbiAgICByZWFkb25seUluc3RydW1lbnRhdGlvbnMyW21ldGhvZF0gPSBjcmVhdGVJdGVyYWJsZU1ldGhvZChtZXRob2QsIHRydWUsIGZhbHNlKTtcbiAgICBzaGFsbG93SW5zdHJ1bWVudGF0aW9uczJbbWV0aG9kXSA9IGNyZWF0ZUl0ZXJhYmxlTWV0aG9kKG1ldGhvZCwgZmFsc2UsIHRydWUpO1xuICAgIHNoYWxsb3dSZWFkb25seUluc3RydW1lbnRhdGlvbnMyW21ldGhvZF0gPSBjcmVhdGVJdGVyYWJsZU1ldGhvZChtZXRob2QsIHRydWUsIHRydWUpO1xuICB9KTtcbiAgcmV0dXJuIFtcbiAgICBtdXRhYmxlSW5zdHJ1bWVudGF0aW9uczIsXG4gICAgcmVhZG9ubHlJbnN0cnVtZW50YXRpb25zMixcbiAgICBzaGFsbG93SW5zdHJ1bWVudGF0aW9uczIsXG4gICAgc2hhbGxvd1JlYWRvbmx5SW5zdHJ1bWVudGF0aW9uczJcbiAgXTtcbn1cbnZhciBbbXV0YWJsZUluc3RydW1lbnRhdGlvbnMsIHJlYWRvbmx5SW5zdHJ1bWVudGF0aW9ucywgc2hhbGxvd0luc3RydW1lbnRhdGlvbnMsIHNoYWxsb3dSZWFkb25seUluc3RydW1lbnRhdGlvbnNdID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZUluc3RydW1lbnRhdGlvbnMoKTtcbmZ1bmN0aW9uIGNyZWF0ZUluc3RydW1lbnRhdGlvbkdldHRlcihpc1JlYWRvbmx5LCBzaGFsbG93KSB7XG4gIGNvbnN0IGluc3RydW1lbnRhdGlvbnMgPSBzaGFsbG93ID8gaXNSZWFkb25seSA/IHNoYWxsb3dSZWFkb25seUluc3RydW1lbnRhdGlvbnMgOiBzaGFsbG93SW5zdHJ1bWVudGF0aW9ucyA6IGlzUmVhZG9ubHkgPyByZWFkb25seUluc3RydW1lbnRhdGlvbnMgOiBtdXRhYmxlSW5zdHJ1bWVudGF0aW9ucztcbiAgcmV0dXJuICh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpID0+IHtcbiAgICBpZiAoa2V5ID09PSBcIl9fdl9pc1JlYWN0aXZlXCIpIHtcbiAgICAgIHJldHVybiAhaXNSZWFkb25seTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJfX3ZfaXNSZWFkb25seVwiKSB7XG4gICAgICByZXR1cm4gaXNSZWFkb25seTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJfX3ZfcmF3XCIpIHtcbiAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxuICAgIHJldHVybiBSZWZsZWN0LmdldChoYXNPd24oaW5zdHJ1bWVudGF0aW9ucywga2V5KSAmJiBrZXkgaW4gdGFyZ2V0ID8gaW5zdHJ1bWVudGF0aW9ucyA6IHRhcmdldCwga2V5LCByZWNlaXZlcik7XG4gIH07XG59XG52YXIgbXV0YWJsZUNvbGxlY3Rpb25IYW5kbGVycyA9IHtcbiAgZ2V0OiAvKiBAX19QVVJFX18gKi8gY3JlYXRlSW5zdHJ1bWVudGF0aW9uR2V0dGVyKGZhbHNlLCBmYWxzZSlcbn07XG52YXIgcmVhZG9ubHlDb2xsZWN0aW9uSGFuZGxlcnMgPSB7XG4gIGdldDogLyogQF9fUFVSRV9fICovIGNyZWF0ZUluc3RydW1lbnRhdGlvbkdldHRlcih0cnVlLCBmYWxzZSlcbn07XG5mdW5jdGlvbiBjaGVja0lkZW50aXR5S2V5cyh0YXJnZXQsIGhhczIsIGtleSkge1xuICBjb25zdCByYXdLZXkgPSB0b1JhdyhrZXkpO1xuICBpZiAocmF3S2V5ICE9PSBrZXkgJiYgaGFzMi5jYWxsKHRhcmdldCwgcmF3S2V5KSkge1xuICAgIGNvbnN0IHR5cGUgPSB0b1Jhd1R5cGUodGFyZ2V0KTtcbiAgICBjb25zb2xlLndhcm4oYFJlYWN0aXZlICR7dHlwZX0gY29udGFpbnMgYm90aCB0aGUgcmF3IGFuZCByZWFjdGl2ZSB2ZXJzaW9ucyBvZiB0aGUgc2FtZSBvYmplY3Qke3R5cGUgPT09IGBNYXBgID8gYCBhcyBrZXlzYCA6IGBgfSwgd2hpY2ggY2FuIGxlYWQgdG8gaW5jb25zaXN0ZW5jaWVzLiBBdm9pZCBkaWZmZXJlbnRpYXRpbmcgYmV0d2VlbiB0aGUgcmF3IGFuZCByZWFjdGl2ZSB2ZXJzaW9ucyBvZiBhbiBvYmplY3QgYW5kIG9ubHkgdXNlIHRoZSByZWFjdGl2ZSB2ZXJzaW9uIGlmIHBvc3NpYmxlLmApO1xuICB9XG59XG52YXIgcmVhY3RpdmVNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTtcbnZhciBzaGFsbG93UmVhY3RpdmVNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTtcbnZhciByZWFkb25seU1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgV2Vha01hcCgpO1xudmFyIHNoYWxsb3dSZWFkb25seU1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gdGFyZ2V0VHlwZU1hcChyYXdUeXBlKSB7XG4gIHN3aXRjaCAocmF3VHlwZSkge1xuICAgIGNhc2UgXCJPYmplY3RcIjpcbiAgICBjYXNlIFwiQXJyYXlcIjpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgXCJNYXBcIjpcbiAgICBjYXNlIFwiU2V0XCI6XG4gICAgY2FzZSBcIldlYWtNYXBcIjpcbiAgICBjYXNlIFwiV2Vha1NldFwiOlxuICAgICAgcmV0dXJuIDI7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAwO1xuICB9XG59XG5mdW5jdGlvbiBnZXRUYXJnZXRUeXBlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZVtcbiAgICBcIl9fdl9za2lwXCJcbiAgICAvKiBTS0lQICovXG4gIF0gfHwgIU9iamVjdC5pc0V4dGVuc2libGUodmFsdWUpID8gMCA6IHRhcmdldFR5cGVNYXAodG9SYXdUeXBlKHZhbHVlKSk7XG59XG5mdW5jdGlvbiByZWFjdGl2ZTIodGFyZ2V0KSB7XG4gIGlmICh0YXJnZXQgJiYgdGFyZ2V0W1xuICAgIFwiX192X2lzUmVhZG9ubHlcIlxuICAgIC8qIElTX1JFQURPTkxZICovXG4gIF0pIHtcbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG4gIHJldHVybiBjcmVhdGVSZWFjdGl2ZU9iamVjdCh0YXJnZXQsIGZhbHNlLCBtdXRhYmxlSGFuZGxlcnMsIG11dGFibGVDb2xsZWN0aW9uSGFuZGxlcnMsIHJlYWN0aXZlTWFwKTtcbn1cbmZ1bmN0aW9uIHJlYWRvbmx5KHRhcmdldCkge1xuICByZXR1cm4gY3JlYXRlUmVhY3RpdmVPYmplY3QodGFyZ2V0LCB0cnVlLCByZWFkb25seUhhbmRsZXJzLCByZWFkb25seUNvbGxlY3Rpb25IYW5kbGVycywgcmVhZG9ubHlNYXApO1xufVxuZnVuY3Rpb24gY3JlYXRlUmVhY3RpdmVPYmplY3QodGFyZ2V0LCBpc1JlYWRvbmx5LCBiYXNlSGFuZGxlcnMsIGNvbGxlY3Rpb25IYW5kbGVycywgcHJveHlNYXApIHtcbiAgaWYgKCFpc09iamVjdCh0YXJnZXQpKSB7XG4gICAgaWYgKHRydWUpIHtcbiAgICAgIGNvbnNvbGUud2FybihgdmFsdWUgY2Fubm90IGJlIG1hZGUgcmVhY3RpdmU6ICR7U3RyaW5nKHRhcmdldCl9YCk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cbiAgaWYgKHRhcmdldFtcbiAgICBcIl9fdl9yYXdcIlxuICAgIC8qIFJBVyAqL1xuICBdICYmICEoaXNSZWFkb25seSAmJiB0YXJnZXRbXG4gICAgXCJfX3ZfaXNSZWFjdGl2ZVwiXG4gICAgLyogSVNfUkVBQ1RJVkUgKi9cbiAgXSkpIHtcbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG4gIGNvbnN0IGV4aXN0aW5nUHJveHkgPSBwcm94eU1hcC5nZXQodGFyZ2V0KTtcbiAgaWYgKGV4aXN0aW5nUHJveHkpIHtcbiAgICByZXR1cm4gZXhpc3RpbmdQcm94eTtcbiAgfVxuICBjb25zdCB0YXJnZXRUeXBlID0gZ2V0VGFyZ2V0VHlwZSh0YXJnZXQpO1xuICBpZiAodGFyZ2V0VHlwZSA9PT0gMCkge1xuICAgIHJldHVybiB0YXJnZXQ7XG4gIH1cbiAgY29uc3QgcHJveHkgPSBuZXcgUHJveHkodGFyZ2V0LCB0YXJnZXRUeXBlID09PSAyID8gY29sbGVjdGlvbkhhbmRsZXJzIDogYmFzZUhhbmRsZXJzKTtcbiAgcHJveHlNYXAuc2V0KHRhcmdldCwgcHJveHkpO1xuICByZXR1cm4gcHJveHk7XG59XG5mdW5jdGlvbiB0b1JhdyhvYnNlcnZlZCkge1xuICByZXR1cm4gb2JzZXJ2ZWQgJiYgdG9SYXcob2JzZXJ2ZWRbXG4gICAgXCJfX3ZfcmF3XCJcbiAgICAvKiBSQVcgKi9cbiAgXSkgfHwgb2JzZXJ2ZWQ7XG59XG5mdW5jdGlvbiBpc1JlZihyKSB7XG4gIHJldHVybiBCb29sZWFuKHIgJiYgci5fX3ZfaXNSZWYgPT09IHRydWUpO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvbWFnaWNzLyRuZXh0VGljay5qc1xubWFnaWMoXCJuZXh0VGlja1wiLCAoKSA9PiBuZXh0VGljayk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJGRpc3BhdGNoLmpzXG5tYWdpYyhcImRpc3BhdGNoXCIsIChlbCkgPT4gZGlzcGF0Y2guYmluZChkaXNwYXRjaCwgZWwpKTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL21hZ2ljcy8kd2F0Y2guanNcbm1hZ2ljKFwid2F0Y2hcIiwgKGVsLCB7IGV2YWx1YXRlTGF0ZXI6IGV2YWx1YXRlTGF0ZXIyLCBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiAoa2V5LCBjYWxsYmFjaykgPT4ge1xuICBsZXQgZXZhbHVhdGUyID0gZXZhbHVhdGVMYXRlcjIoa2V5KTtcbiAgbGV0IGdldHRlciA9ICgpID0+IHtcbiAgICBsZXQgdmFsdWU7XG4gICAgZXZhbHVhdGUyKChpKSA9PiB2YWx1ZSA9IGkpO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbiAgbGV0IHVud2F0Y2ggPSB3YXRjaChnZXR0ZXIsIGNhbGxiYWNrKTtcbiAgY2xlYW51cDIodW53YXRjaCk7XG59KTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL21hZ2ljcy8kc3RvcmUuanNcbm1hZ2ljKFwic3RvcmVcIiwgZ2V0U3RvcmVzKTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL21hZ2ljcy8kZGF0YS5qc1xubWFnaWMoXCJkYXRhXCIsIChlbCkgPT4gc2NvcGUoZWwpKTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL21hZ2ljcy8kcm9vdC5qc1xubWFnaWMoXCJyb290XCIsIChlbCkgPT4gY2xvc2VzdFJvb3QoZWwpKTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL21hZ2ljcy8kcmVmcy5qc1xubWFnaWMoXCJyZWZzXCIsIChlbCkgPT4ge1xuICBpZiAoZWwuX3hfcmVmc19wcm94eSlcbiAgICByZXR1cm4gZWwuX3hfcmVmc19wcm94eTtcbiAgZWwuX3hfcmVmc19wcm94eSA9IG1lcmdlUHJveGllcyhnZXRBcnJheU9mUmVmT2JqZWN0KGVsKSk7XG4gIHJldHVybiBlbC5feF9yZWZzX3Byb3h5O1xufSk7XG5mdW5jdGlvbiBnZXRBcnJheU9mUmVmT2JqZWN0KGVsKSB7XG4gIGxldCByZWZPYmplY3RzID0gW107XG4gIGZpbmRDbG9zZXN0KGVsLCAoaSkgPT4ge1xuICAgIGlmIChpLl94X3JlZnMpXG4gICAgICByZWZPYmplY3RzLnB1c2goaS5feF9yZWZzKTtcbiAgfSk7XG4gIHJldHVybiByZWZPYmplY3RzO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvaWRzLmpzXG52YXIgZ2xvYmFsSWRNZW1vID0ge307XG5mdW5jdGlvbiBmaW5kQW5kSW5jcmVtZW50SWQobmFtZSkge1xuICBpZiAoIWdsb2JhbElkTWVtb1tuYW1lXSlcbiAgICBnbG9iYWxJZE1lbW9bbmFtZV0gPSAwO1xuICByZXR1cm4gKytnbG9iYWxJZE1lbW9bbmFtZV07XG59XG5mdW5jdGlvbiBjbG9zZXN0SWRSb290KGVsLCBuYW1lKSB7XG4gIHJldHVybiBmaW5kQ2xvc2VzdChlbCwgKGVsZW1lbnQpID0+IHtcbiAgICBpZiAoZWxlbWVudC5feF9pZHMgJiYgZWxlbWVudC5feF9pZHNbbmFtZV0pXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG5mdW5jdGlvbiBzZXRJZFJvb3QoZWwsIG5hbWUpIHtcbiAgaWYgKCFlbC5feF9pZHMpXG4gICAgZWwuX3hfaWRzID0ge307XG4gIGlmICghZWwuX3hfaWRzW25hbWVdKVxuICAgIGVsLl94X2lkc1tuYW1lXSA9IGZpbmRBbmRJbmNyZW1lbnRJZChuYW1lKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL21hZ2ljcy8kaWQuanNcbm1hZ2ljKFwiaWRcIiwgKGVsLCB7IGNsZWFudXA6IGNsZWFudXAyIH0pID0+IChuYW1lLCBrZXkgPSBudWxsKSA9PiB7XG4gIGxldCBjYWNoZUtleSA9IGAke25hbWV9JHtrZXkgPyBgLSR7a2V5fWAgOiBcIlwifWA7XG4gIHJldHVybiBjYWNoZUlkQnlOYW1lT25FbGVtZW50KGVsLCBjYWNoZUtleSwgY2xlYW51cDIsICgpID0+IHtcbiAgICBsZXQgcm9vdCA9IGNsb3Nlc3RJZFJvb3QoZWwsIG5hbWUpO1xuICAgIGxldCBpZCA9IHJvb3QgPyByb290Ll94X2lkc1tuYW1lXSA6IGZpbmRBbmRJbmNyZW1lbnRJZChuYW1lKTtcbiAgICByZXR1cm4ga2V5ID8gYCR7bmFtZX0tJHtpZH0tJHtrZXl9YCA6IGAke25hbWV9LSR7aWR9YDtcbiAgfSk7XG59KTtcbmludGVyY2VwdENsb25lKChmcm9tLCB0bykgPT4ge1xuICBpZiAoZnJvbS5feF9pZCkge1xuICAgIHRvLl94X2lkID0gZnJvbS5feF9pZDtcbiAgfVxufSk7XG5mdW5jdGlvbiBjYWNoZUlkQnlOYW1lT25FbGVtZW50KGVsLCBjYWNoZUtleSwgY2xlYW51cDIsIGNhbGxiYWNrKSB7XG4gIGlmICghZWwuX3hfaWQpXG4gICAgZWwuX3hfaWQgPSB7fTtcbiAgaWYgKGVsLl94X2lkW2NhY2hlS2V5XSlcbiAgICByZXR1cm4gZWwuX3hfaWRbY2FjaGVLZXldO1xuICBsZXQgb3V0cHV0ID0gY2FsbGJhY2soKTtcbiAgZWwuX3hfaWRbY2FjaGVLZXldID0gb3V0cHV0O1xuICBjbGVhbnVwMigoKSA9PiB7XG4gICAgZGVsZXRlIGVsLl94X2lkW2NhY2hlS2V5XTtcbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJGVsLmpzXG5tYWdpYyhcImVsXCIsIChlbCkgPT4gZWwpO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvbWFnaWNzL2luZGV4LmpzXG53YXJuTWlzc2luZ1BsdWdpbk1hZ2ljKFwiRm9jdXNcIiwgXCJmb2N1c1wiLCBcImZvY3VzXCIpO1xud2Fybk1pc3NpbmdQbHVnaW5NYWdpYyhcIlBlcnNpc3RcIiwgXCJwZXJzaXN0XCIsIFwicGVyc2lzdFwiKTtcbmZ1bmN0aW9uIHdhcm5NaXNzaW5nUGx1Z2luTWFnaWMobmFtZSwgbWFnaWNOYW1lLCBzbHVnKSB7XG4gIG1hZ2ljKG1hZ2ljTmFtZSwgKGVsKSA9PiB3YXJuKGBZb3UgY2FuJ3QgdXNlIFskJHttYWdpY05hbWV9XSB3aXRob3V0IGZpcnN0IGluc3RhbGxpbmcgdGhlIFwiJHtuYW1lfVwiIHBsdWdpbiBoZXJlOiBodHRwczovL2FscGluZWpzLmRldi9wbHVnaW5zLyR7c2x1Z31gLCBlbCkpO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LW1vZGVsYWJsZS5qc1xuZGlyZWN0aXZlKFwibW9kZWxhYmxlXCIsIChlbCwgeyBleHByZXNzaW9uIH0sIHsgZWZmZWN0OiBlZmZlY3QzLCBldmFsdWF0ZUxhdGVyOiBldmFsdWF0ZUxhdGVyMiwgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBsZXQgZnVuYyA9IGV2YWx1YXRlTGF0ZXIyKGV4cHJlc3Npb24pO1xuICBsZXQgaW5uZXJHZXQgPSAoKSA9PiB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBmdW5jKChpKSA9PiByZXN1bHQgPSBpKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBsZXQgZXZhbHVhdGVJbm5lclNldCA9IGV2YWx1YXRlTGF0ZXIyKGAke2V4cHJlc3Npb259ID0gX19wbGFjZWhvbGRlcmApO1xuICBsZXQgaW5uZXJTZXQgPSAodmFsKSA9PiBldmFsdWF0ZUlubmVyU2V0KCgpID0+IHtcbiAgfSwgeyBzY29wZTogeyBcIl9fcGxhY2Vob2xkZXJcIjogdmFsIH0gfSk7XG4gIGxldCBpbml0aWFsVmFsdWUgPSBpbm5lckdldCgpO1xuICBpbm5lclNldChpbml0aWFsVmFsdWUpO1xuICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB7XG4gICAgaWYgKCFlbC5feF9tb2RlbClcbiAgICAgIHJldHVybjtcbiAgICBlbC5feF9yZW1vdmVNb2RlbExpc3RlbmVyc1tcImRlZmF1bHRcIl0oKTtcbiAgICBsZXQgb3V0ZXJHZXQgPSBlbC5feF9tb2RlbC5nZXQ7XG4gICAgbGV0IG91dGVyU2V0ID0gZWwuX3hfbW9kZWwuc2V0O1xuICAgIGxldCByZWxlYXNlRW50YW5nbGVtZW50ID0gZW50YW5nbGUoXG4gICAgICB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gb3V0ZXJHZXQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KHZhbHVlKSB7XG4gICAgICAgICAgb3V0ZXJTZXQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIGlubmVyR2V0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgIGlubmVyU2V0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gICAgY2xlYW51cDIocmVsZWFzZUVudGFuZ2xlbWVudCk7XG4gIH0pO1xufSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtdGVsZXBvcnQuanNcbmRpcmVjdGl2ZShcInRlbGVwb3J0XCIsIChlbCwgeyBtb2RpZmllcnMsIGV4cHJlc3Npb24gfSwgeyBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiB7XG4gIGlmIChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IFwidGVtcGxhdGVcIilcbiAgICB3YXJuKFwieC10ZWxlcG9ydCBjYW4gb25seSBiZSB1c2VkIG9uIGEgPHRlbXBsYXRlPiB0YWdcIiwgZWwpO1xuICBsZXQgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGV4cHJlc3Npb24pO1xuICBsZXQgY2xvbmUyID0gZWwuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gIGVsLl94X3RlbGVwb3J0ID0gY2xvbmUyO1xuICBjbG9uZTIuX3hfdGVsZXBvcnRCYWNrID0gZWw7XG4gIGVsLnNldEF0dHJpYnV0ZShcImRhdGEtdGVsZXBvcnQtdGVtcGxhdGVcIiwgdHJ1ZSk7XG4gIGNsb25lMi5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRlbGVwb3J0LXRhcmdldFwiLCB0cnVlKTtcbiAgaWYgKGVsLl94X2ZvcndhcmRFdmVudHMpIHtcbiAgICBlbC5feF9mb3J3YXJkRXZlbnRzLmZvckVhY2goKGV2ZW50TmFtZSkgPT4ge1xuICAgICAgY2xvbmUyLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBlLmNvbnN0cnVjdG9yKGUudHlwZSwgZSkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgYWRkU2NvcGVUb05vZGUoY2xvbmUyLCB7fSwgZWwpO1xuICBsZXQgcGxhY2VJbkRvbSA9IChjbG9uZTMsIHRhcmdldDIsIG1vZGlmaWVyczIpID0+IHtcbiAgICBpZiAobW9kaWZpZXJzMi5pbmNsdWRlcyhcInByZXBlbmRcIikpIHtcbiAgICAgIHRhcmdldDIucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY2xvbmUzLCB0YXJnZXQyKTtcbiAgICB9IGVsc2UgaWYgKG1vZGlmaWVyczIuaW5jbHVkZXMoXCJhcHBlbmRcIikpIHtcbiAgICAgIHRhcmdldDIucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY2xvbmUzLCB0YXJnZXQyLm5leHRTaWJsaW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0Mi5hcHBlbmRDaGlsZChjbG9uZTMpO1xuICAgIH1cbiAgfTtcbiAgbXV0YXRlRG9tKCgpID0+IHtcbiAgICBwbGFjZUluRG9tKGNsb25lMiwgdGFyZ2V0LCBtb2RpZmllcnMpO1xuICAgIHNraXBEdXJpbmdDbG9uZSgoKSA9PiB7XG4gICAgICBpbml0VHJlZShjbG9uZTIpO1xuICAgIH0pKCk7XG4gIH0pO1xuICBlbC5feF90ZWxlcG9ydFB1dEJhY2sgPSAoKSA9PiB7XG4gICAgbGV0IHRhcmdldDIgPSBnZXRUYXJnZXQoZXhwcmVzc2lvbik7XG4gICAgbXV0YXRlRG9tKCgpID0+IHtcbiAgICAgIHBsYWNlSW5Eb20oZWwuX3hfdGVsZXBvcnQsIHRhcmdldDIsIG1vZGlmaWVycyk7XG4gICAgfSk7XG4gIH07XG4gIGNsZWFudXAyKFxuICAgICgpID0+IG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICBjbG9uZTIucmVtb3ZlKCk7XG4gICAgICBkZXN0cm95VHJlZShjbG9uZTIpO1xuICAgIH0pXG4gICk7XG59KTtcbnZhciB0ZWxlcG9ydENvbnRhaW5lckR1cmluZ0Nsb25lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbmZ1bmN0aW9uIGdldFRhcmdldChleHByZXNzaW9uKSB7XG4gIGxldCB0YXJnZXQgPSBza2lwRHVyaW5nQ2xvbmUoKCkgPT4ge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGV4cHJlc3Npb24pO1xuICB9LCAoKSA9PiB7XG4gICAgcmV0dXJuIHRlbGVwb3J0Q29udGFpbmVyRHVyaW5nQ2xvbmU7XG4gIH0pKCk7XG4gIGlmICghdGFyZ2V0KVxuICAgIHdhcm4oYENhbm5vdCBmaW5kIHgtdGVsZXBvcnQgZWxlbWVudCBmb3Igc2VsZWN0b3I6IFwiJHtleHByZXNzaW9ufVwiYCk7XG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtaWdub3JlLmpzXG52YXIgaGFuZGxlciA9ICgpID0+IHtcbn07XG5oYW5kbGVyLmlubGluZSA9IChlbCwgeyBtb2RpZmllcnMgfSwgeyBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiB7XG4gIG1vZGlmaWVycy5pbmNsdWRlcyhcInNlbGZcIikgPyBlbC5feF9pZ25vcmVTZWxmID0gdHJ1ZSA6IGVsLl94X2lnbm9yZSA9IHRydWU7XG4gIGNsZWFudXAyKCgpID0+IHtcbiAgICBtb2RpZmllcnMuaW5jbHVkZXMoXCJzZWxmXCIpID8gZGVsZXRlIGVsLl94X2lnbm9yZVNlbGYgOiBkZWxldGUgZWwuX3hfaWdub3JlO1xuICB9KTtcbn07XG5kaXJlY3RpdmUoXCJpZ25vcmVcIiwgaGFuZGxlcik7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtZWZmZWN0LmpzXG5kaXJlY3RpdmUoXCJlZmZlY3RcIiwgc2tpcER1cmluZ0Nsb25lKChlbCwgeyBleHByZXNzaW9uIH0sIHsgZWZmZWN0OiBlZmZlY3QzIH0pID0+IHtcbiAgZWZmZWN0MyhldmFsdWF0ZUxhdGVyKGVsLCBleHByZXNzaW9uKSk7XG59KSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy9vbi5qc1xuZnVuY3Rpb24gb24oZWwsIGV2ZW50LCBtb2RpZmllcnMsIGNhbGxiYWNrKSB7XG4gIGxldCBsaXN0ZW5lclRhcmdldCA9IGVsO1xuICBsZXQgaGFuZGxlcjQgPSAoZSkgPT4gY2FsbGJhY2soZSk7XG4gIGxldCBvcHRpb25zID0ge307XG4gIGxldCB3cmFwSGFuZGxlciA9IChjYWxsYmFjazIsIHdyYXBwZXIpID0+IChlKSA9PiB3cmFwcGVyKGNhbGxiYWNrMiwgZSk7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJkb3RcIikpXG4gICAgZXZlbnQgPSBkb3RTeW50YXgoZXZlbnQpO1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiY2FtZWxcIikpXG4gICAgZXZlbnQgPSBjYW1lbENhc2UyKGV2ZW50KTtcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcInBhc3NpdmVcIikpXG4gICAgb3B0aW9ucy5wYXNzaXZlID0gdHJ1ZTtcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImNhcHR1cmVcIikpXG4gICAgb3B0aW9ucy5jYXB0dXJlID0gdHJ1ZTtcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcIndpbmRvd1wiKSlcbiAgICBsaXN0ZW5lclRhcmdldCA9IHdpbmRvdztcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImRvY3VtZW50XCIpKVxuICAgIGxpc3RlbmVyVGFyZ2V0ID0gZG9jdW1lbnQ7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJkZWJvdW5jZVwiKSkge1xuICAgIGxldCBuZXh0TW9kaWZpZXIgPSBtb2RpZmllcnNbbW9kaWZpZXJzLmluZGV4T2YoXCJkZWJvdW5jZVwiKSArIDFdIHx8IFwiaW52YWxpZC13YWl0XCI7XG4gICAgbGV0IHdhaXQgPSBpc051bWVyaWMobmV4dE1vZGlmaWVyLnNwbGl0KFwibXNcIilbMF0pID8gTnVtYmVyKG5leHRNb2RpZmllci5zcGxpdChcIm1zXCIpWzBdKSA6IDI1MDtcbiAgICBoYW5kbGVyNCA9IGRlYm91bmNlKGhhbmRsZXI0LCB3YWl0KTtcbiAgfVxuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwidGhyb3R0bGVcIikpIHtcbiAgICBsZXQgbmV4dE1vZGlmaWVyID0gbW9kaWZpZXJzW21vZGlmaWVycy5pbmRleE9mKFwidGhyb3R0bGVcIikgKyAxXSB8fCBcImludmFsaWQtd2FpdFwiO1xuICAgIGxldCB3YWl0ID0gaXNOdW1lcmljKG5leHRNb2RpZmllci5zcGxpdChcIm1zXCIpWzBdKSA/IE51bWJlcihuZXh0TW9kaWZpZXIuc3BsaXQoXCJtc1wiKVswXSkgOiAyNTA7XG4gICAgaGFuZGxlcjQgPSB0aHJvdHRsZShoYW5kbGVyNCwgd2FpdCk7XG4gIH1cbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcInByZXZlbnRcIikpXG4gICAgaGFuZGxlcjQgPSB3cmFwSGFuZGxlcihoYW5kbGVyNCwgKG5leHQsIGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIG5leHQoZSk7XG4gICAgfSk7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJzdG9wXCIpKVxuICAgIGhhbmRsZXI0ID0gd3JhcEhhbmRsZXIoaGFuZGxlcjQsIChuZXh0LCBlKSA9PiB7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgbmV4dChlKTtcbiAgICB9KTtcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcIm9uY2VcIikpIHtcbiAgICBoYW5kbGVyNCA9IHdyYXBIYW5kbGVyKGhhbmRsZXI0LCAobmV4dCwgZSkgPT4ge1xuICAgICAgbmV4dChlKTtcbiAgICAgIGxpc3RlbmVyVGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXI0LCBvcHRpb25zKTtcbiAgICB9KTtcbiAgfVxuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiYXdheVwiKSB8fCBtb2RpZmllcnMuaW5jbHVkZXMoXCJvdXRzaWRlXCIpKSB7XG4gICAgbGlzdGVuZXJUYXJnZXQgPSBkb2N1bWVudDtcbiAgICBoYW5kbGVyNCA9IHdyYXBIYW5kbGVyKGhhbmRsZXI0LCAobmV4dCwgZSkgPT4ge1xuICAgICAgaWYgKGVsLmNvbnRhaW5zKGUudGFyZ2V0KSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgaWYgKGUudGFyZ2V0LmlzQ29ubmVjdGVkID09PSBmYWxzZSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgaWYgKGVsLm9mZnNldFdpZHRoIDwgMSAmJiBlbC5vZmZzZXRIZWlnaHQgPCAxKVxuICAgICAgICByZXR1cm47XG4gICAgICBpZiAoZWwuX3hfaXNTaG93biA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybjtcbiAgICAgIG5leHQoZSk7XG4gICAgfSk7XG4gIH1cbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcInNlbGZcIikpXG4gICAgaGFuZGxlcjQgPSB3cmFwSGFuZGxlcihoYW5kbGVyNCwgKG5leHQsIGUpID0+IHtcbiAgICAgIGUudGFyZ2V0ID09PSBlbCAmJiBuZXh0KGUpO1xuICAgIH0pO1xuICBpZiAoZXZlbnQgPT09IFwic3VibWl0XCIpIHtcbiAgICBoYW5kbGVyNCA9IHdyYXBIYW5kbGVyKGhhbmRsZXI0LCAobmV4dCwgZSkgPT4ge1xuICAgICAgaWYgKGUudGFyZ2V0Ll94X3BlbmRpbmdNb2RlbFVwZGF0ZXMpIHtcbiAgICAgICAgZS50YXJnZXQuX3hfcGVuZGluZ01vZGVsVXBkYXRlcy5mb3JFYWNoKChmbikgPT4gZm4oKSk7XG4gICAgICB9XG4gICAgICBuZXh0KGUpO1xuICAgIH0pO1xuICB9XG4gIGlmIChpc0tleUV2ZW50KGV2ZW50KSB8fCBpc0NsaWNrRXZlbnQoZXZlbnQpKSB7XG4gICAgaGFuZGxlcjQgPSB3cmFwSGFuZGxlcihoYW5kbGVyNCwgKG5leHQsIGUpID0+IHtcbiAgICAgIGlmIChpc0xpc3RlbmluZ0ZvckFTcGVjaWZpY0tleVRoYXRIYXNudEJlZW5QcmVzc2VkKGUsIG1vZGlmaWVycykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgbmV4dChlKTtcbiAgICB9KTtcbiAgfVxuICBsaXN0ZW5lclRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyNCwgb3B0aW9ucyk7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgbGlzdGVuZXJUYXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcjQsIG9wdGlvbnMpO1xuICB9O1xufVxuZnVuY3Rpb24gZG90U3ludGF4KHN1YmplY3QpIHtcbiAgcmV0dXJuIHN1YmplY3QucmVwbGFjZSgvLS9nLCBcIi5cIik7XG59XG5mdW5jdGlvbiBjYW1lbENhc2UyKHN1YmplY3QpIHtcbiAgcmV0dXJuIHN1YmplY3QudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8tKFxcdykvZywgKG1hdGNoLCBjaGFyKSA9PiBjaGFyLnRvVXBwZXJDYXNlKCkpO1xufVxuZnVuY3Rpb24gaXNOdW1lcmljKHN1YmplY3QpIHtcbiAgcmV0dXJuICFBcnJheS5pc0FycmF5KHN1YmplY3QpICYmICFpc05hTihzdWJqZWN0KTtcbn1cbmZ1bmN0aW9uIGtlYmFiQ2FzZTIoc3ViamVjdCkge1xuICBpZiAoW1wiIFwiLCBcIl9cIl0uaW5jbHVkZXMoXG4gICAgc3ViamVjdFxuICApKVxuICAgIHJldHVybiBzdWJqZWN0O1xuICByZXR1cm4gc3ViamVjdC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCBcIiQxLSQyXCIpLnJlcGxhY2UoL1tfXFxzXS8sIFwiLVwiKS50b0xvd2VyQ2FzZSgpO1xufVxuZnVuY3Rpb24gaXNLZXlFdmVudChldmVudCkge1xuICByZXR1cm4gW1wia2V5ZG93blwiLCBcImtleXVwXCJdLmluY2x1ZGVzKGV2ZW50KTtcbn1cbmZ1bmN0aW9uIGlzQ2xpY2tFdmVudChldmVudCkge1xuICByZXR1cm4gW1wiY29udGV4dG1lbnVcIiwgXCJjbGlja1wiLCBcIm1vdXNlXCJdLnNvbWUoKGkpID0+IGV2ZW50LmluY2x1ZGVzKGkpKTtcbn1cbmZ1bmN0aW9uIGlzTGlzdGVuaW5nRm9yQVNwZWNpZmljS2V5VGhhdEhhc250QmVlblByZXNzZWQoZSwgbW9kaWZpZXJzKSB7XG4gIGxldCBrZXlNb2RpZmllcnMgPSBtb2RpZmllcnMuZmlsdGVyKChpKSA9PiB7XG4gICAgcmV0dXJuICFbXCJ3aW5kb3dcIiwgXCJkb2N1bWVudFwiLCBcInByZXZlbnRcIiwgXCJzdG9wXCIsIFwib25jZVwiLCBcImNhcHR1cmVcIiwgXCJzZWxmXCIsIFwiYXdheVwiLCBcIm91dHNpZGVcIiwgXCJwYXNzaXZlXCIsIFwicHJlc2VydmUtc2Nyb2xsXCIsIFwiYmx1clwiLCBcImNoYW5nZVwiLCBcImxhenlcIl0uaW5jbHVkZXMoaSk7XG4gIH0pO1xuICBpZiAoa2V5TW9kaWZpZXJzLmluY2x1ZGVzKFwiZGVib3VuY2VcIikpIHtcbiAgICBsZXQgZGVib3VuY2VJbmRleCA9IGtleU1vZGlmaWVycy5pbmRleE9mKFwiZGVib3VuY2VcIik7XG4gICAga2V5TW9kaWZpZXJzLnNwbGljZShkZWJvdW5jZUluZGV4LCBpc051bWVyaWMoKGtleU1vZGlmaWVyc1tkZWJvdW5jZUluZGV4ICsgMV0gfHwgXCJpbnZhbGlkLXdhaXRcIikuc3BsaXQoXCJtc1wiKVswXSkgPyAyIDogMSk7XG4gIH1cbiAgaWYgKGtleU1vZGlmaWVycy5pbmNsdWRlcyhcInRocm90dGxlXCIpKSB7XG4gICAgbGV0IGRlYm91bmNlSW5kZXggPSBrZXlNb2RpZmllcnMuaW5kZXhPZihcInRocm90dGxlXCIpO1xuICAgIGtleU1vZGlmaWVycy5zcGxpY2UoZGVib3VuY2VJbmRleCwgaXNOdW1lcmljKChrZXlNb2RpZmllcnNbZGVib3VuY2VJbmRleCArIDFdIHx8IFwiaW52YWxpZC13YWl0XCIpLnNwbGl0KFwibXNcIilbMF0pID8gMiA6IDEpO1xuICB9XG4gIGlmIChrZXlNb2RpZmllcnMubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiBmYWxzZTtcbiAgaWYgKGtleU1vZGlmaWVycy5sZW5ndGggPT09IDEgJiYga2V5VG9Nb2RpZmllcnMoZS5rZXkpLmluY2x1ZGVzKGtleU1vZGlmaWVyc1swXSkpXG4gICAgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBzeXN0ZW1LZXlNb2RpZmllcnMgPSBbXCJjdHJsXCIsIFwic2hpZnRcIiwgXCJhbHRcIiwgXCJtZXRhXCIsIFwiY21kXCIsIFwic3VwZXJcIl07XG4gIGNvbnN0IHNlbGVjdGVkU3lzdGVtS2V5TW9kaWZpZXJzID0gc3lzdGVtS2V5TW9kaWZpZXJzLmZpbHRlcigobW9kaWZpZXIpID0+IGtleU1vZGlmaWVycy5pbmNsdWRlcyhtb2RpZmllcikpO1xuICBrZXlNb2RpZmllcnMgPSBrZXlNb2RpZmllcnMuZmlsdGVyKChpKSA9PiAhc2VsZWN0ZWRTeXN0ZW1LZXlNb2RpZmllcnMuaW5jbHVkZXMoaSkpO1xuICBpZiAoc2VsZWN0ZWRTeXN0ZW1LZXlNb2RpZmllcnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGFjdGl2ZWx5UHJlc3NlZEtleU1vZGlmaWVycyA9IHNlbGVjdGVkU3lzdGVtS2V5TW9kaWZpZXJzLmZpbHRlcigobW9kaWZpZXIpID0+IHtcbiAgICAgIGlmIChtb2RpZmllciA9PT0gXCJjbWRcIiB8fCBtb2RpZmllciA9PT0gXCJzdXBlclwiKVxuICAgICAgICBtb2RpZmllciA9IFwibWV0YVwiO1xuICAgICAgcmV0dXJuIGVbYCR7bW9kaWZpZXJ9S2V5YF07XG4gICAgfSk7XG4gICAgaWYgKGFjdGl2ZWx5UHJlc3NlZEtleU1vZGlmaWVycy5sZW5ndGggPT09IHNlbGVjdGVkU3lzdGVtS2V5TW9kaWZpZXJzLmxlbmd0aCkge1xuICAgICAgaWYgKGlzQ2xpY2tFdmVudChlLnR5cGUpKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoa2V5VG9Nb2RpZmllcnMoZS5rZXkpLmluY2x1ZGVzKGtleU1vZGlmaWVyc1swXSkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBrZXlUb01vZGlmaWVycyhrZXkpIHtcbiAgaWYgKCFrZXkpXG4gICAgcmV0dXJuIFtdO1xuICBrZXkgPSBrZWJhYkNhc2UyKGtleSk7XG4gIGxldCBtb2RpZmllclRvS2V5TWFwID0ge1xuICAgIFwiY3RybFwiOiBcImNvbnRyb2xcIixcbiAgICBcInNsYXNoXCI6IFwiL1wiLFxuICAgIFwic3BhY2VcIjogXCIgXCIsXG4gICAgXCJzcGFjZWJhclwiOiBcIiBcIixcbiAgICBcImNtZFwiOiBcIm1ldGFcIixcbiAgICBcImVzY1wiOiBcImVzY2FwZVwiLFxuICAgIFwidXBcIjogXCJhcnJvdy11cFwiLFxuICAgIFwiZG93blwiOiBcImFycm93LWRvd25cIixcbiAgICBcImxlZnRcIjogXCJhcnJvdy1sZWZ0XCIsXG4gICAgXCJyaWdodFwiOiBcImFycm93LXJpZ2h0XCIsXG4gICAgXCJwZXJpb2RcIjogXCIuXCIsXG4gICAgXCJjb21tYVwiOiBcIixcIixcbiAgICBcImVxdWFsXCI6IFwiPVwiLFxuICAgIFwibWludXNcIjogXCItXCIsXG4gICAgXCJ1bmRlcnNjb3JlXCI6IFwiX1wiXG4gIH07XG4gIG1vZGlmaWVyVG9LZXlNYXBba2V5XSA9IGtleTtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG1vZGlmaWVyVG9LZXlNYXApLm1hcCgobW9kaWZpZXIpID0+IHtcbiAgICBpZiAobW9kaWZpZXJUb0tleU1hcFttb2RpZmllcl0gPT09IGtleSlcbiAgICAgIHJldHVybiBtb2RpZmllcjtcbiAgfSkuZmlsdGVyKChtb2RpZmllcikgPT4gbW9kaWZpZXIpO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LW1vZGVsLmpzXG5kaXJlY3RpdmUoXCJtb2RlbFwiLCAoZWwsIHsgbW9kaWZpZXJzLCBleHByZXNzaW9uIH0sIHsgZWZmZWN0OiBlZmZlY3QzLCBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiB7XG4gIGxldCBzY29wZVRhcmdldCA9IGVsO1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwicGFyZW50XCIpKSB7XG4gICAgc2NvcGVUYXJnZXQgPSBlbC5wYXJlbnROb2RlO1xuICB9XG4gIGxldCBldmFsdWF0ZUdldCA9IGV2YWx1YXRlTGF0ZXIoc2NvcGVUYXJnZXQsIGV4cHJlc3Npb24pO1xuICBsZXQgZXZhbHVhdGVTZXQ7XG4gIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJzdHJpbmdcIikge1xuICAgIGV2YWx1YXRlU2V0ID0gZXZhbHVhdGVMYXRlcihzY29wZVRhcmdldCwgYCR7ZXhwcmVzc2lvbn0gPSBfX3BsYWNlaG9sZGVyYCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cHJlc3Npb24gPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgZXhwcmVzc2lvbigpID09PSBcInN0cmluZ1wiKSB7XG4gICAgZXZhbHVhdGVTZXQgPSBldmFsdWF0ZUxhdGVyKHNjb3BlVGFyZ2V0LCBgJHtleHByZXNzaW9uKCl9ID0gX19wbGFjZWhvbGRlcmApO1xuICB9IGVsc2Uge1xuICAgIGV2YWx1YXRlU2V0ID0gKCkgPT4ge1xuICAgIH07XG4gIH1cbiAgbGV0IGdldFZhbHVlID0gKCkgPT4ge1xuICAgIGxldCByZXN1bHQ7XG4gICAgZXZhbHVhdGVHZXQoKHZhbHVlKSA9PiByZXN1bHQgPSB2YWx1ZSk7XG4gICAgcmV0dXJuIGlzR2V0dGVyU2V0dGVyKHJlc3VsdCkgPyByZXN1bHQuZ2V0KCkgOiByZXN1bHQ7XG4gIH07XG4gIGxldCBzZXRWYWx1ZSA9ICh2YWx1ZSkgPT4ge1xuICAgIGxldCByZXN1bHQ7XG4gICAgZXZhbHVhdGVHZXQoKHZhbHVlMikgPT4gcmVzdWx0ID0gdmFsdWUyKTtcbiAgICBpZiAoaXNHZXR0ZXJTZXR0ZXIocmVzdWx0KSkge1xuICAgICAgcmVzdWx0LnNldCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2YWx1YXRlU2V0KCgpID0+IHtcbiAgICAgIH0sIHtcbiAgICAgICAgc2NvcGU6IHsgXCJfX3BsYWNlaG9sZGVyXCI6IHZhbHVlIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgaWYgKHR5cGVvZiBleHByZXNzaW9uID09PSBcInN0cmluZ1wiICYmIGVsLnR5cGUgPT09IFwicmFkaW9cIikge1xuICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICBpZiAoIWVsLmhhc0F0dHJpYnV0ZShcIm5hbWVcIikpXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZShcIm5hbWVcIiwgZXhwcmVzc2lvbik7XG4gICAgfSk7XG4gIH1cbiAgbGV0IGhhc0NoYW5nZU1vZGlmaWVyID0gbW9kaWZpZXJzLmluY2x1ZGVzKFwiY2hhbmdlXCIpIHx8IG1vZGlmaWVycy5pbmNsdWRlcyhcImxhenlcIik7XG4gIGxldCBoYXNCbHVyTW9kaWZpZXIgPSBtb2RpZmllcnMuaW5jbHVkZXMoXCJibHVyXCIpO1xuICBsZXQgaGFzRW50ZXJNb2RpZmllciA9IG1vZGlmaWVycy5pbmNsdWRlcyhcImVudGVyXCIpO1xuICBsZXQgaGFzRXhwbGljaXRFdmVudE1vZGlmaWVycyA9IGhhc0NoYW5nZU1vZGlmaWVyIHx8IGhhc0JsdXJNb2RpZmllciB8fCBoYXNFbnRlck1vZGlmaWVyO1xuICBsZXQgcmVtb3ZlTGlzdGVuZXI7XG4gIGlmIChpc0Nsb25pbmcpIHtcbiAgICByZW1vdmVMaXN0ZW5lciA9ICgpID0+IHtcbiAgICB9O1xuICB9IGVsc2UgaWYgKGhhc0V4cGxpY2l0RXZlbnRNb2RpZmllcnMpIHtcbiAgICBsZXQgbGlzdGVuZXJzID0gW107XG4gICAgbGV0IHN5bmNWYWx1ZSA9IChlKSA9PiBzZXRWYWx1ZShnZXRJbnB1dFZhbHVlKGVsLCBtb2RpZmllcnMsIGUsIGdldFZhbHVlKCkpKTtcbiAgICBpZiAoaGFzQ2hhbmdlTW9kaWZpZXIpIHtcbiAgICAgIGxpc3RlbmVycy5wdXNoKG9uKGVsLCBcImNoYW5nZVwiLCBtb2RpZmllcnMsIHN5bmNWYWx1ZSkpO1xuICAgIH1cbiAgICBpZiAoaGFzQmx1ck1vZGlmaWVyKSB7XG4gICAgICBsaXN0ZW5lcnMucHVzaChvbihlbCwgXCJibHVyXCIsIG1vZGlmaWVycywgc3luY1ZhbHVlKSk7XG4gICAgICBpZiAoZWwuZm9ybSkge1xuICAgICAgICBsZXQgc3luY0NhbGxiYWNrID0gKCkgPT4gc3luY1ZhbHVlKHsgdGFyZ2V0OiBlbCB9KTtcbiAgICAgICAgaWYgKCFlbC5mb3JtLl94X3BlbmRpbmdNb2RlbFVwZGF0ZXMpXG4gICAgICAgICAgZWwuZm9ybS5feF9wZW5kaW5nTW9kZWxVcGRhdGVzID0gW107XG4gICAgICAgIGVsLmZvcm0uX3hfcGVuZGluZ01vZGVsVXBkYXRlcy5wdXNoKHN5bmNDYWxsYmFjayk7XG4gICAgICAgIGNsZWFudXAyKCgpID0+IGVsLmZvcm0uX3hfcGVuZGluZ01vZGVsVXBkYXRlcy5zcGxpY2UoZWwuZm9ybS5feF9wZW5kaW5nTW9kZWxVcGRhdGVzLmluZGV4T2Yoc3luY0NhbGxiYWNrKSwgMSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaGFzRW50ZXJNb2RpZmllcikge1xuICAgICAgbGlzdGVuZXJzLnB1c2gob24oZWwsIFwia2V5ZG93blwiLCBtb2RpZmllcnMsIChlKSA9PiB7XG4gICAgICAgIGlmIChlLmtleSA9PT0gXCJFbnRlclwiKVxuICAgICAgICAgIHN5bmNWYWx1ZShlKTtcbiAgICAgIH0pKTtcbiAgICB9XG4gICAgcmVtb3ZlTGlzdGVuZXIgPSAoKSA9PiBsaXN0ZW5lcnMuZm9yRWFjaCgocmVtb3ZlKSA9PiByZW1vdmUoKSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IGV2ZW50ID0gZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcInNlbGVjdFwiIHx8IFtcImNoZWNrYm94XCIsIFwicmFkaW9cIl0uaW5jbHVkZXMoZWwudHlwZSkgPyBcImNoYW5nZVwiIDogXCJpbnB1dFwiO1xuICAgIHJlbW92ZUxpc3RlbmVyID0gb24oZWwsIGV2ZW50LCBtb2RpZmllcnMsIChlKSA9PiB7XG4gICAgICBzZXRWYWx1ZShnZXRJbnB1dFZhbHVlKGVsLCBtb2RpZmllcnMsIGUsIGdldFZhbHVlKCkpKTtcbiAgICB9KTtcbiAgfVxuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiZmlsbFwiKSkge1xuICAgIGlmIChbdm9pZCAwLCBudWxsLCBcIlwiXS5pbmNsdWRlcyhnZXRWYWx1ZSgpKSB8fCBpc0NoZWNrYm94KGVsKSAmJiBBcnJheS5pc0FycmF5KGdldFZhbHVlKCkpIHx8IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJzZWxlY3RcIiAmJiBlbC5tdWx0aXBsZSkge1xuICAgICAgc2V0VmFsdWUoXG4gICAgICAgIGdldElucHV0VmFsdWUoZWwsIG1vZGlmaWVycywgeyB0YXJnZXQ6IGVsIH0sIGdldFZhbHVlKCkpXG4gICAgICApO1xuICAgIH1cbiAgfVxuICBpZiAoIWVsLl94X3JlbW92ZU1vZGVsTGlzdGVuZXJzKVxuICAgIGVsLl94X3JlbW92ZU1vZGVsTGlzdGVuZXJzID0ge307XG4gIGVsLl94X3JlbW92ZU1vZGVsTGlzdGVuZXJzW1wiZGVmYXVsdFwiXSA9IHJlbW92ZUxpc3RlbmVyO1xuICBjbGVhbnVwMigoKSA9PiBlbC5feF9yZW1vdmVNb2RlbExpc3RlbmVyc1tcImRlZmF1bHRcIl0oKSk7XG4gIGlmIChlbC5mb3JtKSB7XG4gICAgbGV0IHJlbW92ZVJlc2V0TGlzdGVuZXIgPSBvbihlbC5mb3JtLCBcInJlc2V0XCIsIFtdLCAoZSkgPT4ge1xuICAgICAgbmV4dFRpY2soKCkgPT4gZWwuX3hfbW9kZWwgJiYgZWwuX3hfbW9kZWwuc2V0KGdldElucHV0VmFsdWUoZWwsIG1vZGlmaWVycywgeyB0YXJnZXQ6IGVsIH0sIGdldFZhbHVlKCkpKSk7XG4gICAgfSk7XG4gICAgY2xlYW51cDIoKCkgPT4gcmVtb3ZlUmVzZXRMaXN0ZW5lcigpKTtcbiAgfVxuICBlbC5feF9tb2RlbCA9IHtcbiAgICBnZXQoKSB7XG4gICAgICByZXR1cm4gZ2V0VmFsdWUoKTtcbiAgICB9LFxuICAgIHNldCh2YWx1ZSkge1xuICAgICAgc2V0VmFsdWUodmFsdWUpO1xuICAgIH1cbiAgfTtcbiAgZWwuX3hfZm9yY2VNb2RlbFVwZGF0ZSA9ICh2YWx1ZSkgPT4ge1xuICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwICYmIHR5cGVvZiBleHByZXNzaW9uID09PSBcInN0cmluZ1wiICYmIGV4cHJlc3Npb24ubWF0Y2goL1xcLi8pKVxuICAgICAgdmFsdWUgPSBcIlwiO1xuICAgIHdpbmRvdy5mcm9tTW9kZWwgPSB0cnVlO1xuICAgIG11dGF0ZURvbSgoKSA9PiBiaW5kKGVsLCBcInZhbHVlXCIsIHZhbHVlKSk7XG4gICAgZGVsZXRlIHdpbmRvdy5mcm9tTW9kZWw7XG4gIH07XG4gIGVmZmVjdDMoKCkgPT4ge1xuICAgIGxldCB2YWx1ZSA9IGdldFZhbHVlKCk7XG4gICAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcInVuaW50cnVzaXZlXCIpICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuaXNTYW1lTm9kZShlbCkpXG4gICAgICByZXR1cm47XG4gICAgZWwuX3hfZm9yY2VNb2RlbFVwZGF0ZSh2YWx1ZSk7XG4gIH0pO1xufSk7XG5mdW5jdGlvbiBnZXRJbnB1dFZhbHVlKGVsLCBtb2RpZmllcnMsIGV2ZW50LCBjdXJyZW50VmFsdWUpIHtcbiAgcmV0dXJuIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgQ3VzdG9tRXZlbnQgJiYgZXZlbnQuZGV0YWlsICE9PSB2b2lkIDApXG4gICAgICByZXR1cm4gZXZlbnQuZGV0YWlsICE9PSBudWxsICYmIGV2ZW50LmRldGFpbCAhPT0gdm9pZCAwID8gZXZlbnQuZGV0YWlsIDogZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgIGVsc2UgaWYgKGlzQ2hlY2tib3goZWwpKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgIGxldCBuZXdWYWx1ZSA9IG51bGw7XG4gICAgICAgIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJudW1iZXJcIikpIHtcbiAgICAgICAgICBuZXdWYWx1ZSA9IHNhZmVQYXJzZU51bWJlcihldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImJvb2xlYW5cIikpIHtcbiAgICAgICAgICBuZXdWYWx1ZSA9IHNhZmVQYXJzZUJvb2xlYW4oZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXZlbnQudGFyZ2V0LmNoZWNrZWQgPyBjdXJyZW50VmFsdWUuaW5jbHVkZXMobmV3VmFsdWUpID8gY3VycmVudFZhbHVlIDogY3VycmVudFZhbHVlLmNvbmNhdChbbmV3VmFsdWVdKSA6IGN1cnJlbnRWYWx1ZS5maWx0ZXIoKGVsMikgPT4gIWNoZWNrZWRBdHRyTG9vc2VDb21wYXJlMihlbDIsIG5ld1ZhbHVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZXZlbnQudGFyZ2V0LmNoZWNrZWQ7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwic2VsZWN0XCIgJiYgZWwubXVsdGlwbGUpIHtcbiAgICAgIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJudW1iZXJcIikpIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oZXZlbnQudGFyZ2V0LnNlbGVjdGVkT3B0aW9ucykubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgICBsZXQgcmF3VmFsdWUgPSBvcHRpb24udmFsdWUgfHwgb3B0aW9uLnRleHQ7XG4gICAgICAgICAgcmV0dXJuIHNhZmVQYXJzZU51bWJlcihyYXdWYWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJib29sZWFuXCIpKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGV2ZW50LnRhcmdldC5zZWxlY3RlZE9wdGlvbnMpLm1hcCgob3B0aW9uKSA9PiB7XG4gICAgICAgICAgbGV0IHJhd1ZhbHVlID0gb3B0aW9uLnZhbHVlIHx8IG9wdGlvbi50ZXh0O1xuICAgICAgICAgIHJldHVybiBzYWZlUGFyc2VCb29sZWFuKHJhd1ZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gQXJyYXkuZnJvbShldmVudC50YXJnZXQuc2VsZWN0ZWRPcHRpb25zKS5tYXAoKG9wdGlvbikgPT4ge1xuICAgICAgICByZXR1cm4gb3B0aW9uLnZhbHVlIHx8IG9wdGlvbi50ZXh0O1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBuZXdWYWx1ZTtcbiAgICAgIGlmIChpc1JhZGlvKGVsKSkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNoZWNrZWQpIHtcbiAgICAgICAgICBuZXdWYWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdWYWx1ZSA9IGN1cnJlbnRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwibnVtYmVyXCIpKSB7XG4gICAgICAgIHJldHVybiBzYWZlUGFyc2VOdW1iZXIobmV3VmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJib29sZWFuXCIpKSB7XG4gICAgICAgIHJldHVybiBzYWZlUGFyc2VCb29sZWFuKG5ld1ZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwidHJpbVwiKSkge1xuICAgICAgICByZXR1cm4gbmV3VmFsdWUudHJpbSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ld1ZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5mdW5jdGlvbiBzYWZlUGFyc2VOdW1iZXIocmF3VmFsdWUpIHtcbiAgbGV0IG51bWJlciA9IHJhd1ZhbHVlID8gcGFyc2VGbG9hdChyYXdWYWx1ZSkgOiBudWxsO1xuICByZXR1cm4gaXNOdW1lcmljMihudW1iZXIpID8gbnVtYmVyIDogcmF3VmFsdWU7XG59XG5mdW5jdGlvbiBjaGVja2VkQXR0ckxvb3NlQ29tcGFyZTIodmFsdWVBLCB2YWx1ZUIpIHtcbiAgcmV0dXJuIHZhbHVlQSA9PSB2YWx1ZUI7XG59XG5mdW5jdGlvbiBpc051bWVyaWMyKHN1YmplY3QpIHtcbiAgcmV0dXJuICFBcnJheS5pc0FycmF5KHN1YmplY3QpICYmICFpc05hTihzdWJqZWN0KTtcbn1cbmZ1bmN0aW9uIGlzR2V0dGVyU2V0dGVyKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlLmdldCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiB2YWx1ZS5zZXQgPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC1jbG9hay5qc1xuZGlyZWN0aXZlKFwiY2xvYWtcIiwgKGVsKSA9PiBxdWV1ZU1pY3JvdGFzaygoKSA9PiBtdXRhdGVEb20oKCkgPT4gZWwucmVtb3ZlQXR0cmlidXRlKHByZWZpeChcImNsb2FrXCIpKSkpKTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC1pbml0LmpzXG5hZGRJbml0U2VsZWN0b3IoKCkgPT4gYFske3ByZWZpeChcImluaXRcIil9XWApO1xuZGlyZWN0aXZlKFwiaW5pdFwiLCBza2lwRHVyaW5nQ2xvbmUoKGVsLCB7IGV4cHJlc3Npb24gfSwgeyBldmFsdWF0ZTogZXZhbHVhdGUyIH0pID0+IHtcbiAgaWYgKHR5cGVvZiBleHByZXNzaW9uID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuICEhZXhwcmVzc2lvbi50cmltKCkgJiYgZXZhbHVhdGUyKGV4cHJlc3Npb24sIHt9LCBmYWxzZSk7XG4gIH1cbiAgcmV0dXJuIGV2YWx1YXRlMihleHByZXNzaW9uLCB7fSwgZmFsc2UpO1xufSkpO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LXRleHQuanNcbmRpcmVjdGl2ZShcInRleHRcIiwgKGVsLCB7IGV4cHJlc3Npb24gfSwgeyBlZmZlY3Q6IGVmZmVjdDMsIGV2YWx1YXRlTGF0ZXI6IGV2YWx1YXRlTGF0ZXIyIH0pID0+IHtcbiAgbGV0IGV2YWx1YXRlMiA9IGV2YWx1YXRlTGF0ZXIyKGV4cHJlc3Npb24pO1xuICBlZmZlY3QzKCgpID0+IHtcbiAgICBldmFsdWF0ZTIoKHZhbHVlKSA9PiB7XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBlbC50ZXh0Q29udGVudCA9IHZhbHVlO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtaHRtbC5qc1xuZGlyZWN0aXZlKFwiaHRtbFwiLCAoZWwsIHsgZXhwcmVzc2lvbiB9LCB7IGVmZmVjdDogZWZmZWN0MywgZXZhbHVhdGVMYXRlcjogZXZhbHVhdGVMYXRlcjIgfSkgPT4ge1xuICBsZXQgZXZhbHVhdGUyID0gZXZhbHVhdGVMYXRlcjIoZXhwcmVzc2lvbik7XG4gIGVmZmVjdDMoKCkgPT4ge1xuICAgIGV2YWx1YXRlMigodmFsdWUpID0+IHtcbiAgICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICAgIGVsLmlubmVySFRNTCA9IHZhbHVlO1xuICAgICAgICBlbC5feF9pZ25vcmVTZWxmID0gdHJ1ZTtcbiAgICAgICAgaW5pdFRyZWUoZWwpO1xuICAgICAgICBkZWxldGUgZWwuX3hfaWdub3JlU2VsZjtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LWJpbmQuanNcbm1hcEF0dHJpYnV0ZXMoc3RhcnRpbmdXaXRoKFwiOlwiLCBpbnRvKHByZWZpeChcImJpbmQ6XCIpKSkpO1xudmFyIGhhbmRsZXIyID0gKGVsLCB7IHZhbHVlLCBtb2RpZmllcnMsIGV4cHJlc3Npb24sIG9yaWdpbmFsIH0sIHsgZWZmZWN0OiBlZmZlY3QzLCBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiB7XG4gIGlmICghdmFsdWUpIHtcbiAgICBsZXQgYmluZGluZ1Byb3ZpZGVycyA9IHt9O1xuICAgIGluamVjdEJpbmRpbmdQcm92aWRlcnMoYmluZGluZ1Byb3ZpZGVycyk7XG4gICAgbGV0IGdldEJpbmRpbmdzID0gZXZhbHVhdGVMYXRlcihlbCwgZXhwcmVzc2lvbik7XG4gICAgZ2V0QmluZGluZ3MoKGJpbmRpbmdzKSA9PiB7XG4gICAgICBhcHBseUJpbmRpbmdzT2JqZWN0KGVsLCBiaW5kaW5ncywgb3JpZ2luYWwpO1xuICAgIH0sIHsgc2NvcGU6IGJpbmRpbmdQcm92aWRlcnMgfSk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gXCJrZXlcIilcbiAgICByZXR1cm4gc3RvcmVLZXlGb3JYRm9yKGVsLCBleHByZXNzaW9uKTtcbiAgaWYgKGVsLl94X2lubGluZUJpbmRpbmdzICYmIGVsLl94X2lubGluZUJpbmRpbmdzW3ZhbHVlXSAmJiBlbC5feF9pbmxpbmVCaW5kaW5nc1t2YWx1ZV0uZXh0cmFjdCkge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgZXZhbHVhdGUyID0gZXZhbHVhdGVMYXRlcihlbCwgZXhwcmVzc2lvbik7XG4gIGVmZmVjdDMoKCkgPT4gZXZhbHVhdGUyKChyZXN1bHQpID0+IHtcbiAgICBpZiAocmVzdWx0ID09PSB2b2lkIDAgJiYgdHlwZW9mIGV4cHJlc3Npb24gPT09IFwic3RyaW5nXCIgJiYgZXhwcmVzc2lvbi5tYXRjaCgvXFwuLykpIHtcbiAgICAgIHJlc3VsdCA9IFwiXCI7XG4gICAgfVxuICAgIG11dGF0ZURvbSgoKSA9PiBiaW5kKGVsLCB2YWx1ZSwgcmVzdWx0LCBtb2RpZmllcnMpKTtcbiAgfSkpO1xuICBjbGVhbnVwMigoKSA9PiB7XG4gICAgZWwuX3hfdW5kb0FkZGVkQ2xhc3NlcyAmJiBlbC5feF91bmRvQWRkZWRDbGFzc2VzKCk7XG4gICAgZWwuX3hfdW5kb0FkZGVkU3R5bGVzICYmIGVsLl94X3VuZG9BZGRlZFN0eWxlcygpO1xuICB9KTtcbn07XG5oYW5kbGVyMi5pbmxpbmUgPSAoZWwsIHsgdmFsdWUsIG1vZGlmaWVycywgZXhwcmVzc2lvbiB9KSA9PiB7XG4gIGlmICghdmFsdWUpXG4gICAgcmV0dXJuO1xuICBpZiAoIWVsLl94X2lubGluZUJpbmRpbmdzKVxuICAgIGVsLl94X2lubGluZUJpbmRpbmdzID0ge307XG4gIGVsLl94X2lubGluZUJpbmRpbmdzW3ZhbHVlXSA9IHsgZXhwcmVzc2lvbiwgZXh0cmFjdDogZmFsc2UgfTtcbn07XG5kaXJlY3RpdmUoXCJiaW5kXCIsIGhhbmRsZXIyKTtcbmZ1bmN0aW9uIHN0b3JlS2V5Rm9yWEZvcihlbCwgZXhwcmVzc2lvbikge1xuICBlbC5feF9rZXlFeHByZXNzaW9uID0gZXhwcmVzc2lvbjtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC1kYXRhLmpzXG5hZGRSb290U2VsZWN0b3IoKCkgPT4gYFske3ByZWZpeChcImRhdGFcIil9XWApO1xuZGlyZWN0aXZlKFwiZGF0YVwiLCAoZWwsIHsgZXhwcmVzc2lvbiB9LCB7IGNsZWFudXA6IGNsZWFudXAyIH0pID0+IHtcbiAgaWYgKHNob3VsZFNraXBSZWdpc3RlcmluZ0RhdGFEdXJpbmdDbG9uZShlbCkpXG4gICAgcmV0dXJuO1xuICBleHByZXNzaW9uID0gZXhwcmVzc2lvbiA9PT0gXCJcIiA/IFwie31cIiA6IGV4cHJlc3Npb247XG4gIGxldCBtYWdpY0NvbnRleHQgPSB7fTtcbiAgaW5qZWN0TWFnaWNzKG1hZ2ljQ29udGV4dCwgZWwpO1xuICBsZXQgZGF0YVByb3ZpZGVyQ29udGV4dCA9IHt9O1xuICBpbmplY3REYXRhUHJvdmlkZXJzKGRhdGFQcm92aWRlckNvbnRleHQsIG1hZ2ljQ29udGV4dCk7XG4gIGxldCBkYXRhMiA9IGV2YWx1YXRlKGVsLCBleHByZXNzaW9uLCB7IHNjb3BlOiBkYXRhUHJvdmlkZXJDb250ZXh0IH0pO1xuICBpZiAoZGF0YTIgPT09IHZvaWQgMCB8fCBkYXRhMiA9PT0gdHJ1ZSlcbiAgICBkYXRhMiA9IHt9O1xuICBpbmplY3RNYWdpY3MoZGF0YTIsIGVsKTtcbiAgbGV0IHJlYWN0aXZlRGF0YSA9IHJlYWN0aXZlKGRhdGEyKTtcbiAgaW5pdEludGVyY2VwdG9ycyhyZWFjdGl2ZURhdGEpO1xuICBsZXQgdW5kbyA9IGFkZFNjb3BlVG9Ob2RlKGVsLCByZWFjdGl2ZURhdGEpO1xuICByZWFjdGl2ZURhdGFbXCJpbml0XCJdICYmIGV2YWx1YXRlKGVsLCByZWFjdGl2ZURhdGFbXCJpbml0XCJdKTtcbiAgY2xlYW51cDIoKCkgPT4ge1xuICAgIHJlYWN0aXZlRGF0YVtcImRlc3Ryb3lcIl0gJiYgZXZhbHVhdGUoZWwsIHJlYWN0aXZlRGF0YVtcImRlc3Ryb3lcIl0pO1xuICAgIHVuZG8oKTtcbiAgfSk7XG59KTtcbmludGVyY2VwdENsb25lKChmcm9tLCB0bykgPT4ge1xuICBpZiAoZnJvbS5feF9kYXRhU3RhY2spIHtcbiAgICB0by5feF9kYXRhU3RhY2sgPSBmcm9tLl94X2RhdGFTdGFjaztcbiAgICB0by5zZXRBdHRyaWJ1dGUoXCJkYXRhLWhhcy1hbHBpbmUtc3RhdGVcIiwgdHJ1ZSk7XG4gIH1cbn0pO1xuZnVuY3Rpb24gc2hvdWxkU2tpcFJlZ2lzdGVyaW5nRGF0YUR1cmluZ0Nsb25lKGVsKSB7XG4gIGlmICghaXNDbG9uaW5nKVxuICAgIHJldHVybiBmYWxzZTtcbiAgaWYgKGlzQ2xvbmluZ0xlZ2FjeSlcbiAgICByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGVsLmhhc0F0dHJpYnV0ZShcImRhdGEtaGFzLWFscGluZS1zdGF0ZVwiKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC1zaG93LmpzXG5kaXJlY3RpdmUoXCJzaG93XCIsIChlbCwgeyBtb2RpZmllcnMsIGV4cHJlc3Npb24gfSwgeyBlZmZlY3Q6IGVmZmVjdDMgfSkgPT4ge1xuICBsZXQgZXZhbHVhdGUyID0gZXZhbHVhdGVMYXRlcihlbCwgZXhwcmVzc2lvbik7XG4gIGlmICghZWwuX3hfZG9IaWRlKVxuICAgIGVsLl94X2RvSGlkZSA9ICgpID0+IHtcbiAgICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICAgIGVsLnN0eWxlLnNldFByb3BlcnR5KFwiZGlzcGxheVwiLCBcIm5vbmVcIiwgbW9kaWZpZXJzLmluY2x1ZGVzKFwiaW1wb3J0YW50XCIpID8gXCJpbXBvcnRhbnRcIiA6IHZvaWQgMCk7XG4gICAgICB9KTtcbiAgICB9O1xuICBpZiAoIWVsLl94X2RvU2hvdylcbiAgICBlbC5feF9kb1Nob3cgPSAoKSA9PiB7XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBpZiAoZWwuc3R5bGUubGVuZ3RoID09PSAxICYmIGVsLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKSB7XG4gICAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKFwic3R5bGVcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwuc3R5bGUucmVtb3ZlUHJvcGVydHkoXCJkaXNwbGF5XCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICBsZXQgaGlkZSA9ICgpID0+IHtcbiAgICBlbC5feF9kb0hpZGUoKTtcbiAgICBlbC5feF9pc1Nob3duID0gZmFsc2U7XG4gIH07XG4gIGxldCBzaG93ID0gKCkgPT4ge1xuICAgIGVsLl94X2RvU2hvdygpO1xuICAgIGVsLl94X2lzU2hvd24gPSB0cnVlO1xuICB9O1xuICBsZXQgY2xpY2tBd2F5Q29tcGF0aWJsZVNob3cgPSAoKSA9PiBzZXRUaW1lb3V0KHNob3cpO1xuICBsZXQgdG9nZ2xlID0gb25jZShcbiAgICAodmFsdWUpID0+IHZhbHVlID8gc2hvdygpIDogaGlkZSgpLFxuICAgICh2YWx1ZSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBlbC5feF90b2dnbGVBbmRDYXNjYWRlV2l0aFRyYW5zaXRpb25zID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgZWwuX3hfdG9nZ2xlQW5kQ2FzY2FkZVdpdGhUcmFuc2l0aW9ucyhlbCwgdmFsdWUsIHNob3csIGhpZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPyBjbGlja0F3YXlDb21wYXRpYmxlU2hvdygpIDogaGlkZSgpO1xuICAgICAgfVxuICAgIH1cbiAgKTtcbiAgbGV0IG9sZFZhbHVlO1xuICBsZXQgZmlyc3RUaW1lID0gdHJ1ZTtcbiAgZWZmZWN0MygoKSA9PiBldmFsdWF0ZTIoKHZhbHVlKSA9PiB7XG4gICAgaWYgKCFmaXJzdFRpbWUgJiYgdmFsdWUgPT09IG9sZFZhbHVlKVxuICAgICAgcmV0dXJuO1xuICAgIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJpbW1lZGlhdGVcIikpXG4gICAgICB2YWx1ZSA/IGNsaWNrQXdheUNvbXBhdGlibGVTaG93KCkgOiBoaWRlKCk7XG4gICAgdG9nZ2xlKHZhbHVlKTtcbiAgICBvbGRWYWx1ZSA9IHZhbHVlO1xuICAgIGZpcnN0VGltZSA9IGZhbHNlO1xuICB9KSk7XG59KTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC1mb3IuanNcbmRpcmVjdGl2ZShcImZvclwiLCAoZWwsIHsgZXhwcmVzc2lvbiB9LCB7IGVmZmVjdDogZWZmZWN0MywgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBsZXQgaXRlcmF0b3JOYW1lcyA9IHBhcnNlRm9yRXhwcmVzc2lvbihleHByZXNzaW9uKTtcbiAgbGV0IGV2YWx1YXRlSXRlbXMgPSBldmFsdWF0ZUxhdGVyKGVsLCBpdGVyYXRvck5hbWVzLml0ZW1zKTtcbiAgbGV0IGV2YWx1YXRlS2V5ID0gZXZhbHVhdGVMYXRlcihcbiAgICBlbCxcbiAgICAvLyB0aGUgeC1iaW5kOmtleSBleHByZXNzaW9uIGlzIHN0b3JlZCBmb3Igb3VyIHVzZSBpbnN0ZWFkIG9mIGV2YWx1YXRlZC5cbiAgICBlbC5feF9rZXlFeHByZXNzaW9uIHx8IFwiaW5kZXhcIlxuICApO1xuICBlbC5feF9wcmV2S2V5cyA9IFtdO1xuICBlbC5feF9sb29rdXAgPSB7fTtcbiAgZWZmZWN0MygoKSA9PiBsb29wKGVsLCBpdGVyYXRvck5hbWVzLCBldmFsdWF0ZUl0ZW1zLCBldmFsdWF0ZUtleSkpO1xuICBjbGVhbnVwMigoKSA9PiB7XG4gICAgT2JqZWN0LnZhbHVlcyhlbC5feF9sb29rdXApLmZvckVhY2goKGVsMikgPT4gbXV0YXRlRG9tKFxuICAgICAgKCkgPT4ge1xuICAgICAgICBkZXN0cm95VHJlZShlbDIpO1xuICAgICAgICBlbDIucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgKSk7XG4gICAgZGVsZXRlIGVsLl94X3ByZXZLZXlzO1xuICAgIGRlbGV0ZSBlbC5feF9sb29rdXA7XG4gIH0pO1xufSk7XG5mdW5jdGlvbiBsb29wKGVsLCBpdGVyYXRvck5hbWVzLCBldmFsdWF0ZUl0ZW1zLCBldmFsdWF0ZUtleSkge1xuICBsZXQgaXNPYmplY3QyID0gKGkpID0+IHR5cGVvZiBpID09PSBcIm9iamVjdFwiICYmICFBcnJheS5pc0FycmF5KGkpO1xuICBsZXQgdGVtcGxhdGVFbCA9IGVsO1xuICBldmFsdWF0ZUl0ZW1zKChpdGVtcykgPT4ge1xuICAgIGlmIChpc051bWVyaWMzKGl0ZW1zKSAmJiBpdGVtcyA+PSAwKSB7XG4gICAgICBpdGVtcyA9IEFycmF5LmZyb20oQXJyYXkoaXRlbXMpLmtleXMoKSwgKGkpID0+IGkgKyAxKTtcbiAgICB9XG4gICAgaWYgKGl0ZW1zID09PSB2b2lkIDApXG4gICAgICBpdGVtcyA9IFtdO1xuICAgIGxldCBsb29rdXAgPSBlbC5feF9sb29rdXA7XG4gICAgbGV0IHByZXZLZXlzID0gZWwuX3hfcHJldktleXM7XG4gICAgbGV0IHNjb3BlcyA9IFtdO1xuICAgIGxldCBrZXlzID0gW107XG4gICAgaWYgKGlzT2JqZWN0MihpdGVtcykpIHtcbiAgICAgIGl0ZW1zID0gT2JqZWN0LmVudHJpZXMoaXRlbXMpLm1hcCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgIGxldCBzY29wZTIgPSBnZXRJdGVyYXRpb25TY29wZVZhcmlhYmxlcyhpdGVyYXRvck5hbWVzLCB2YWx1ZSwga2V5LCBpdGVtcyk7XG4gICAgICAgIGV2YWx1YXRlS2V5KCh2YWx1ZTIpID0+IHtcbiAgICAgICAgICBpZiAoa2V5cy5pbmNsdWRlcyh2YWx1ZTIpKVxuICAgICAgICAgICAgd2FybihcIkR1cGxpY2F0ZSBrZXkgb24geC1mb3JcIiwgZWwpO1xuICAgICAgICAgIGtleXMucHVzaCh2YWx1ZTIpO1xuICAgICAgICB9LCB7IHNjb3BlOiB7IGluZGV4OiBrZXksIC4uLnNjb3BlMiB9IH0pO1xuICAgICAgICBzY29wZXMucHVzaChzY29wZTIpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IHNjb3BlMiA9IGdldEl0ZXJhdGlvblNjb3BlVmFyaWFibGVzKGl0ZXJhdG9yTmFtZXMsIGl0ZW1zW2ldLCBpLCBpdGVtcyk7XG4gICAgICAgIGV2YWx1YXRlS2V5KCh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGlmIChrZXlzLmluY2x1ZGVzKHZhbHVlKSlcbiAgICAgICAgICAgIHdhcm4oXCJEdXBsaWNhdGUga2V5IG9uIHgtZm9yXCIsIGVsKTtcbiAgICAgICAgICBrZXlzLnB1c2godmFsdWUpO1xuICAgICAgICB9LCB7IHNjb3BlOiB7IGluZGV4OiBpLCAuLi5zY29wZTIgfSB9KTtcbiAgICAgICAgc2NvcGVzLnB1c2goc2NvcGUyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IGFkZHMgPSBbXTtcbiAgICBsZXQgbW92ZXMgPSBbXTtcbiAgICBsZXQgcmVtb3ZlcyA9IFtdO1xuICAgIGxldCBzYW1lcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJldktleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBrZXkgPSBwcmV2S2V5c1tpXTtcbiAgICAgIGlmIChrZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTEpXG4gICAgICAgIHJlbW92ZXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBwcmV2S2V5cyA9IHByZXZLZXlzLmZpbHRlcigoa2V5KSA9PiAhcmVtb3Zlcy5pbmNsdWRlcyhrZXkpKTtcbiAgICBsZXQgbGFzdEtleSA9IFwidGVtcGxhdGVcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBrZXkgPSBrZXlzW2ldO1xuICAgICAgbGV0IHByZXZJbmRleCA9IHByZXZLZXlzLmluZGV4T2Yoa2V5KTtcbiAgICAgIGlmIChwcmV2SW5kZXggPT09IC0xKSB7XG4gICAgICAgIHByZXZLZXlzLnNwbGljZShpLCAwLCBrZXkpO1xuICAgICAgICBhZGRzLnB1c2goW2xhc3RLZXksIGldKTtcbiAgICAgIH0gZWxzZSBpZiAocHJldkluZGV4ICE9PSBpKSB7XG4gICAgICAgIGxldCBrZXlJblNwb3QgPSBwcmV2S2V5cy5zcGxpY2UoaSwgMSlbMF07XG4gICAgICAgIGxldCBrZXlGb3JTcG90ID0gcHJldktleXMuc3BsaWNlKHByZXZJbmRleCAtIDEsIDEpWzBdO1xuICAgICAgICBwcmV2S2V5cy5zcGxpY2UoaSwgMCwga2V5Rm9yU3BvdCk7XG4gICAgICAgIHByZXZLZXlzLnNwbGljZShwcmV2SW5kZXgsIDAsIGtleUluU3BvdCk7XG4gICAgICAgIG1vdmVzLnB1c2goW2tleUluU3BvdCwga2V5Rm9yU3BvdF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2FtZXMucHVzaChrZXkpO1xuICAgICAgfVxuICAgICAgbGFzdEtleSA9IGtleTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW1vdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQga2V5ID0gcmVtb3Zlc1tpXTtcbiAgICAgIGlmICghKGtleSBpbiBsb29rdXApKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICAgIGRlc3Ryb3lUcmVlKGxvb2t1cFtrZXldKTtcbiAgICAgICAgbG9va3VwW2tleV0ucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgICAgIGRlbGV0ZSBsb29rdXBba2V5XTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtb3Zlcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IFtrZXlJblNwb3QsIGtleUZvclNwb3RdID0gbW92ZXNbaV07XG4gICAgICBsZXQgZWxJblNwb3QgPSBsb29rdXBba2V5SW5TcG90XTtcbiAgICAgIGxldCBlbEZvclNwb3QgPSBsb29rdXBba2V5Rm9yU3BvdF07XG4gICAgICBsZXQgbWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICAgIGlmICghZWxGb3JTcG90KVxuICAgICAgICAgIHdhcm4oYHgtZm9yIFwiOmtleVwiIGlzIHVuZGVmaW5lZCBvciBpbnZhbGlkYCwgdGVtcGxhdGVFbCwga2V5Rm9yU3BvdCwgbG9va3VwKTtcbiAgICAgICAgZWxGb3JTcG90LmFmdGVyKG1hcmtlcik7XG4gICAgICAgIGVsSW5TcG90LmFmdGVyKGVsRm9yU3BvdCk7XG4gICAgICAgIGVsRm9yU3BvdC5feF9jdXJyZW50SWZFbCAmJiBlbEZvclNwb3QuYWZ0ZXIoZWxGb3JTcG90Ll94X2N1cnJlbnRJZkVsKTtcbiAgICAgICAgbWFya2VyLmJlZm9yZShlbEluU3BvdCk7XG4gICAgICAgIGVsSW5TcG90Ll94X2N1cnJlbnRJZkVsICYmIGVsSW5TcG90LmFmdGVyKGVsSW5TcG90Ll94X2N1cnJlbnRJZkVsKTtcbiAgICAgICAgbWFya2VyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgICBlbEZvclNwb3QuX3hfcmVmcmVzaFhGb3JTY29wZShzY29wZXNba2V5cy5pbmRleE9mKGtleUZvclNwb3QpXSk7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWRkcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IFtsYXN0S2V5MiwgaW5kZXhdID0gYWRkc1tpXTtcbiAgICAgIGxldCBsYXN0RWwgPSBsYXN0S2V5MiA9PT0gXCJ0ZW1wbGF0ZVwiID8gdGVtcGxhdGVFbCA6IGxvb2t1cFtsYXN0S2V5Ml07XG4gICAgICBpZiAobGFzdEVsLl94X2N1cnJlbnRJZkVsKVxuICAgICAgICBsYXN0RWwgPSBsYXN0RWwuX3hfY3VycmVudElmRWw7XG4gICAgICBsZXQgc2NvcGUyID0gc2NvcGVzW2luZGV4XTtcbiAgICAgIGxldCBrZXkgPSBrZXlzW2luZGV4XTtcbiAgICAgIGxldCBjbG9uZTIgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRWwuY29udGVudCwgdHJ1ZSkuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICBsZXQgcmVhY3RpdmVTY29wZSA9IHJlYWN0aXZlKHNjb3BlMik7XG4gICAgICBhZGRTY29wZVRvTm9kZShjbG9uZTIsIHJlYWN0aXZlU2NvcGUsIHRlbXBsYXRlRWwpO1xuICAgICAgY2xvbmUyLl94X3JlZnJlc2hYRm9yU2NvcGUgPSAobmV3U2NvcGUpID0+IHtcbiAgICAgICAgT2JqZWN0LmVudHJpZXMobmV3U2NvcGUpLmZvckVhY2goKFtrZXkyLCB2YWx1ZV0pID0+IHtcbiAgICAgICAgICByZWFjdGl2ZVNjb3BlW2tleTJdID0gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICAgIGxhc3RFbC5hZnRlcihjbG9uZTIpO1xuICAgICAgICBza2lwRHVyaW5nQ2xvbmUoKCkgPT4gaW5pdFRyZWUoY2xvbmUyKSkoKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHR5cGVvZiBrZXkgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgd2FybihcIngtZm9yIGtleSBjYW5ub3QgYmUgYW4gb2JqZWN0LCBpdCBtdXN0IGJlIGEgc3RyaW5nIG9yIGFuIGludGVnZXJcIiwgdGVtcGxhdGVFbCk7XG4gICAgICB9XG4gICAgICBsb29rdXBba2V5XSA9IGNsb25lMjtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgbG9va3VwW3NhbWVzW2ldXS5feF9yZWZyZXNoWEZvclNjb3BlKHNjb3Blc1trZXlzLmluZGV4T2Yoc2FtZXNbaV0pXSk7XG4gICAgfVxuICAgIHRlbXBsYXRlRWwuX3hfcHJldktleXMgPSBrZXlzO1xuICB9KTtcbn1cbmZ1bmN0aW9uIHBhcnNlRm9yRXhwcmVzc2lvbihleHByZXNzaW9uKSB7XG4gIGxldCBmb3JJdGVyYXRvclJFID0gLywoW14sXFx9XFxdXSopKD86LChbXixcXH1cXF1dKikpPyQvO1xuICBsZXQgc3RyaXBQYXJlbnNSRSA9IC9eXFxzKlxcKHxcXClcXHMqJC9nO1xuICBsZXQgZm9yQWxpYXNSRSA9IC8oW1xcc1xcU10qPylcXHMrKD86aW58b2YpXFxzKyhbXFxzXFxTXSopLztcbiAgbGV0IGluTWF0Y2ggPSBleHByZXNzaW9uLm1hdGNoKGZvckFsaWFzUkUpO1xuICBpZiAoIWluTWF0Y2gpXG4gICAgcmV0dXJuO1xuICBsZXQgcmVzID0ge307XG4gIHJlcy5pdGVtcyA9IGluTWF0Y2hbMl0udHJpbSgpO1xuICBsZXQgaXRlbSA9IGluTWF0Y2hbMV0ucmVwbGFjZShzdHJpcFBhcmVuc1JFLCBcIlwiKS50cmltKCk7XG4gIGxldCBpdGVyYXRvck1hdGNoID0gaXRlbS5tYXRjaChmb3JJdGVyYXRvclJFKTtcbiAgaWYgKGl0ZXJhdG9yTWF0Y2gpIHtcbiAgICByZXMuaXRlbSA9IGl0ZW0ucmVwbGFjZShmb3JJdGVyYXRvclJFLCBcIlwiKS50cmltKCk7XG4gICAgcmVzLmluZGV4ID0gaXRlcmF0b3JNYXRjaFsxXS50cmltKCk7XG4gICAgaWYgKGl0ZXJhdG9yTWF0Y2hbMl0pIHtcbiAgICAgIHJlcy5jb2xsZWN0aW9uID0gaXRlcmF0b3JNYXRjaFsyXS50cmltKCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJlcy5pdGVtID0gaXRlbTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuZnVuY3Rpb24gZ2V0SXRlcmF0aW9uU2NvcGVWYXJpYWJsZXMoaXRlcmF0b3JOYW1lcywgaXRlbSwgaW5kZXgsIGl0ZW1zKSB7XG4gIGxldCBzY29wZVZhcmlhYmxlcyA9IHt9O1xuICBpZiAoL15cXFsuKlxcXSQvLnRlc3QoaXRlcmF0b3JOYW1lcy5pdGVtKSAmJiBBcnJheS5pc0FycmF5KGl0ZW0pKSB7XG4gICAgbGV0IG5hbWVzID0gaXRlcmF0b3JOYW1lcy5pdGVtLnJlcGxhY2UoXCJbXCIsIFwiXCIpLnJlcGxhY2UoXCJdXCIsIFwiXCIpLnNwbGl0KFwiLFwiKS5tYXAoKGkpID0+IGkudHJpbSgpKTtcbiAgICBuYW1lcy5mb3JFYWNoKChuYW1lLCBpKSA9PiB7XG4gICAgICBzY29wZVZhcmlhYmxlc1tuYW1lXSA9IGl0ZW1baV07XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoL15cXHsuKlxcfSQvLnRlc3QoaXRlcmF0b3JOYW1lcy5pdGVtKSAmJiAhQXJyYXkuaXNBcnJheShpdGVtKSAmJiB0eXBlb2YgaXRlbSA9PT0gXCJvYmplY3RcIikge1xuICAgIGxldCBuYW1lcyA9IGl0ZXJhdG9yTmFtZXMuaXRlbS5yZXBsYWNlKFwie1wiLCBcIlwiKS5yZXBsYWNlKFwifVwiLCBcIlwiKS5zcGxpdChcIixcIikubWFwKChpKSA9PiBpLnRyaW0oKSk7XG4gICAgbmFtZXMuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgc2NvcGVWYXJpYWJsZXNbbmFtZV0gPSBpdGVtW25hbWVdO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHNjb3BlVmFyaWFibGVzW2l0ZXJhdG9yTmFtZXMuaXRlbV0gPSBpdGVtO1xuICB9XG4gIGlmIChpdGVyYXRvck5hbWVzLmluZGV4KVxuICAgIHNjb3BlVmFyaWFibGVzW2l0ZXJhdG9yTmFtZXMuaW5kZXhdID0gaW5kZXg7XG4gIGlmIChpdGVyYXRvck5hbWVzLmNvbGxlY3Rpb24pXG4gICAgc2NvcGVWYXJpYWJsZXNbaXRlcmF0b3JOYW1lcy5jb2xsZWN0aW9uXSA9IGl0ZW1zO1xuICByZXR1cm4gc2NvcGVWYXJpYWJsZXM7XG59XG5mdW5jdGlvbiBpc051bWVyaWMzKHN1YmplY3QpIHtcbiAgcmV0dXJuICFBcnJheS5pc0FycmF5KHN1YmplY3QpICYmICFpc05hTihzdWJqZWN0KTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC1yZWYuanNcbmZ1bmN0aW9uIGhhbmRsZXIzKCkge1xufVxuaGFuZGxlcjMuaW5saW5lID0gKGVsLCB7IGV4cHJlc3Npb24gfSwgeyBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiB7XG4gIGxldCByb290ID0gY2xvc2VzdFJvb3QoZWwpO1xuICBpZiAoIXJvb3QuX3hfcmVmcylcbiAgICByb290Ll94X3JlZnMgPSB7fTtcbiAgcm9vdC5feF9yZWZzW2V4cHJlc3Npb25dID0gZWw7XG4gIGNsZWFudXAyKCgpID0+IGRlbGV0ZSByb290Ll94X3JlZnNbZXhwcmVzc2lvbl0pO1xufTtcbmRpcmVjdGl2ZShcInJlZlwiLCBoYW5kbGVyMyk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtaWYuanNcbmRpcmVjdGl2ZShcImlmXCIsIChlbCwgeyBleHByZXNzaW9uIH0sIHsgZWZmZWN0OiBlZmZlY3QzLCBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiB7XG4gIGlmIChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IFwidGVtcGxhdGVcIilcbiAgICB3YXJuKFwieC1pZiBjYW4gb25seSBiZSB1c2VkIG9uIGEgPHRlbXBsYXRlPiB0YWdcIiwgZWwpO1xuICBsZXQgZXZhbHVhdGUyID0gZXZhbHVhdGVMYXRlcihlbCwgZXhwcmVzc2lvbik7XG4gIGxldCBzaG93ID0gKCkgPT4ge1xuICAgIGlmIChlbC5feF9jdXJyZW50SWZFbClcbiAgICAgIHJldHVybiBlbC5feF9jdXJyZW50SWZFbDtcbiAgICBsZXQgY2xvbmUyID0gZWwuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgYWRkU2NvcGVUb05vZGUoY2xvbmUyLCB7fSwgZWwpO1xuICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICBlbC5hZnRlcihjbG9uZTIpO1xuICAgICAgc2tpcER1cmluZ0Nsb25lKCgpID0+IGluaXRUcmVlKGNsb25lMikpKCk7XG4gICAgfSk7XG4gICAgZWwuX3hfY3VycmVudElmRWwgPSBjbG9uZTI7XG4gICAgZWwuX3hfdW5kb0lmID0gKCkgPT4ge1xuICAgICAgbXV0YXRlRG9tKCgpID0+IHtcbiAgICAgICAgZGVzdHJveVRyZWUoY2xvbmUyKTtcbiAgICAgICAgY2xvbmUyLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgICBkZWxldGUgZWwuX3hfY3VycmVudElmRWw7XG4gICAgfTtcbiAgICByZXR1cm4gY2xvbmUyO1xuICB9O1xuICBsZXQgaGlkZSA9ICgpID0+IHtcbiAgICBpZiAoIWVsLl94X3VuZG9JZilcbiAgICAgIHJldHVybjtcbiAgICBlbC5feF91bmRvSWYoKTtcbiAgICBkZWxldGUgZWwuX3hfdW5kb0lmO1xuICB9O1xuICBlZmZlY3QzKCgpID0+IGV2YWx1YXRlMigodmFsdWUpID0+IHtcbiAgICB2YWx1ZSA/IHNob3coKSA6IGhpZGUoKTtcbiAgfSkpO1xuICBjbGVhbnVwMigoKSA9PiBlbC5feF91bmRvSWYgJiYgZWwuX3hfdW5kb0lmKCkpO1xufSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtaWQuanNcbmRpcmVjdGl2ZShcImlkXCIsIChlbCwgeyBleHByZXNzaW9uIH0sIHsgZXZhbHVhdGU6IGV2YWx1YXRlMiB9KSA9PiB7XG4gIGxldCBuYW1lcyA9IGV2YWx1YXRlMihleHByZXNzaW9uKTtcbiAgbmFtZXMuZm9yRWFjaCgobmFtZSkgPT4gc2V0SWRSb290KGVsLCBuYW1lKSk7XG59KTtcbmludGVyY2VwdENsb25lKChmcm9tLCB0bykgPT4ge1xuICBpZiAoZnJvbS5feF9pZHMpIHtcbiAgICB0by5feF9pZHMgPSBmcm9tLl94X2lkcztcbiAgfVxufSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtb24uanNcbm1hcEF0dHJpYnV0ZXMoc3RhcnRpbmdXaXRoKFwiQFwiLCBpbnRvKHByZWZpeChcIm9uOlwiKSkpKTtcbmRpcmVjdGl2ZShcIm9uXCIsIHNraXBEdXJpbmdDbG9uZSgoZWwsIHsgdmFsdWUsIG1vZGlmaWVycywgZXhwcmVzc2lvbiB9LCB7IGNsZWFudXA6IGNsZWFudXAyIH0pID0+IHtcbiAgbGV0IGV2YWx1YXRlMiA9IGV4cHJlc3Npb24gPyBldmFsdWF0ZUxhdGVyKGVsLCBleHByZXNzaW9uKSA6ICgpID0+IHtcbiAgfTtcbiAgaWYgKGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJ0ZW1wbGF0ZVwiKSB7XG4gICAgaWYgKCFlbC5feF9mb3J3YXJkRXZlbnRzKVxuICAgICAgZWwuX3hfZm9yd2FyZEV2ZW50cyA9IFtdO1xuICAgIGlmICghZWwuX3hfZm9yd2FyZEV2ZW50cy5pbmNsdWRlcyh2YWx1ZSkpXG4gICAgICBlbC5feF9mb3J3YXJkRXZlbnRzLnB1c2godmFsdWUpO1xuICB9XG4gIGxldCByZW1vdmVMaXN0ZW5lciA9IG9uKGVsLCB2YWx1ZSwgbW9kaWZpZXJzLCAoZSkgPT4ge1xuICAgIGV2YWx1YXRlMigoKSA9PiB7XG4gICAgfSwgeyBzY29wZTogeyBcIiRldmVudFwiOiBlIH0sIHBhcmFtczogW2VdIH0pO1xuICB9KTtcbiAgY2xlYW51cDIoKCkgPT4gcmVtb3ZlTGlzdGVuZXIoKSk7XG59KSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL2luZGV4LmpzXG53YXJuTWlzc2luZ1BsdWdpbkRpcmVjdGl2ZShcIkNvbGxhcHNlXCIsIFwiY29sbGFwc2VcIiwgXCJjb2xsYXBzZVwiKTtcbndhcm5NaXNzaW5nUGx1Z2luRGlyZWN0aXZlKFwiSW50ZXJzZWN0XCIsIFwiaW50ZXJzZWN0XCIsIFwiaW50ZXJzZWN0XCIpO1xud2Fybk1pc3NpbmdQbHVnaW5EaXJlY3RpdmUoXCJGb2N1c1wiLCBcInRyYXBcIiwgXCJmb2N1c1wiKTtcbndhcm5NaXNzaW5nUGx1Z2luRGlyZWN0aXZlKFwiTWFza1wiLCBcIm1hc2tcIiwgXCJtYXNrXCIpO1xuZnVuY3Rpb24gd2Fybk1pc3NpbmdQbHVnaW5EaXJlY3RpdmUobmFtZSwgZGlyZWN0aXZlTmFtZSwgc2x1Zykge1xuICBkaXJlY3RpdmUoZGlyZWN0aXZlTmFtZSwgKGVsKSA9PiB3YXJuKGBZb3UgY2FuJ3QgdXNlIFt4LSR7ZGlyZWN0aXZlTmFtZX1dIHdpdGhvdXQgZmlyc3QgaW5zdGFsbGluZyB0aGUgXCIke25hbWV9XCIgcGx1Z2luIGhlcmU6IGh0dHBzOi8vYWxwaW5lanMuZGV2L3BsdWdpbnMvJHtzbHVnfWAsIGVsKSk7XG59XG5cbi8vIHBhY2thZ2VzL2NzcC9zcmMvZGlyZWN0aXZlcy94LWh0bWwuanNcbmRpcmVjdGl2ZShcImh0bWxcIiwgKGVsLCB7IGV4cHJlc3Npb24gfSkgPT4ge1xuICBoYW5kbGVFcnJvcihuZXcgRXJyb3IoXCJVc2luZyB0aGUgeC1odG1sIGRpcmVjdGl2ZSBpcyBwcm9oaWJpdGVkIGluIHRoZSBDU1AgYnVpbGRcIiksIGVsKTtcbn0pO1xuXG4vLyBwYWNrYWdlcy9jc3Avc3JjL2luZGV4LmpzXG5hbHBpbmVfZGVmYXVsdC5zZXRFdmFsdWF0b3IoY3NwRXZhbHVhdG9yKTtcbmFscGluZV9kZWZhdWx0LnNldFJhd0V2YWx1YXRvcihjc3BSYXdFdmFsdWF0b3IpO1xuYWxwaW5lX2RlZmF1bHQuc2V0UmVhY3Rpdml0eUVuZ2luZSh7IHJlYWN0aXZlOiByZWFjdGl2ZTIsIGVmZmVjdDogZWZmZWN0MiwgcmVsZWFzZTogc3RvcCwgcmF3OiB0b1JhdyB9KTtcbnZhciBzcmNfZGVmYXVsdCA9IGFscGluZV9kZWZhdWx0O1xuXG4vLyBwYWNrYWdlcy9jc3AvYnVpbGRzL21vZHVsZS5qc1xudmFyIG1vZHVsZV9kZWZhdWx0ID0gc3JjX2RlZmF1bHQ7XG5leHBvcnQge1xuICBzcmNfZGVmYXVsdCBhcyBBbHBpbmUsXG4gIG1vZHVsZV9kZWZhdWx0IGFzIGRlZmF1bHRcbn07XG4iLCAiY29uc3QgaW5zdGFuY2VPZkFueSA9IChvYmplY3QsIGNvbnN0cnVjdG9ycykgPT4gY29uc3RydWN0b3JzLnNvbWUoKGMpID0+IG9iamVjdCBpbnN0YW5jZW9mIGMpO1xuXG5sZXQgaWRiUHJveHlhYmxlVHlwZXM7XG5sZXQgY3Vyc29yQWR2YW5jZU1ldGhvZHM7XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldElkYlByb3h5YWJsZVR5cGVzKCkge1xuICAgIHJldHVybiAoaWRiUHJveHlhYmxlVHlwZXMgfHxcbiAgICAgICAgKGlkYlByb3h5YWJsZVR5cGVzID0gW1xuICAgICAgICAgICAgSURCRGF0YWJhc2UsXG4gICAgICAgICAgICBJREJPYmplY3RTdG9yZSxcbiAgICAgICAgICAgIElEQkluZGV4LFxuICAgICAgICAgICAgSURCQ3Vyc29yLFxuICAgICAgICAgICAgSURCVHJhbnNhY3Rpb24sXG4gICAgICAgIF0pKTtcbn1cbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0byBwcmV2ZW50IGl0IHRocm93aW5nIHVwIGluIG5vZGUgZW52aXJvbm1lbnRzLlxuZnVuY3Rpb24gZ2V0Q3Vyc29yQWR2YW5jZU1ldGhvZHMoKSB7XG4gICAgcmV0dXJuIChjdXJzb3JBZHZhbmNlTWV0aG9kcyB8fFxuICAgICAgICAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgPSBbXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmFkdmFuY2UsXG4gICAgICAgICAgICBJREJDdXJzb3IucHJvdG90eXBlLmNvbnRpbnVlLFxuICAgICAgICAgICAgSURCQ3Vyc29yLnByb3RvdHlwZS5jb250aW51ZVByaW1hcnlLZXksXG4gICAgICAgIF0pKTtcbn1cbmNvbnN0IHRyYW5zYWN0aW9uRG9uZU1hcCA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCB0cmFuc2Zvcm1DYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCByZXZlcnNlVHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gcHJvbWlzaWZ5UmVxdWVzdChyZXF1ZXN0KSB7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgdW5saXN0ZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3N1Y2Nlc3MnLCBzdWNjZXNzKTtcbiAgICAgICAgICAgIHJlcXVlc3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHdyYXAocmVxdWVzdC5yZXN1bHQpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHJlcXVlc3QuZXJyb3IpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gVGhpcyBtYXBwaW5nIGV4aXN0cyBpbiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUgYnV0IGRvZXNuJ3QgZXhpc3QgaW4gdHJhbnNmb3JtQ2FjaGUuIFRoaXNcbiAgICAvLyBpcyBiZWNhdXNlIHdlIGNyZWF0ZSBtYW55IHByb21pc2VzIGZyb20gYSBzaW5nbGUgSURCUmVxdWVzdC5cbiAgICByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuc2V0KHByb21pc2UsIHJlcXVlc3QpO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuZnVuY3Rpb24gY2FjaGVEb25lUHJvbWlzZUZvclRyYW5zYWN0aW9uKHR4KSB7XG4gICAgLy8gRWFybHkgYmFpbCBpZiB3ZSd2ZSBhbHJlYWR5IGNyZWF0ZWQgYSBkb25lIHByb21pc2UgZm9yIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAgaWYgKHRyYW5zYWN0aW9uRG9uZU1hcC5oYXModHgpKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgZG9uZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgdW5saXN0ZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb21wbGV0ZScsIGNvbXBsZXRlKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QodHguZXJyb3IgfHwgbmV3IERPTUV4Y2VwdGlvbignQWJvcnRFcnJvcicsICdBYm9ydEVycm9yJykpO1xuICAgICAgICAgICAgdW5saXN0ZW4oKTtcbiAgICAgICAgfTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvLyBDYWNoZSBpdCBmb3IgbGF0ZXIgcmV0cmlldmFsLlxuICAgIHRyYW5zYWN0aW9uRG9uZU1hcC5zZXQodHgsIGRvbmUpO1xufVxubGV0IGlkYlByb3h5VHJhcHMgPSB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIElEQlRyYW5zYWN0aW9uKSB7XG4gICAgICAgICAgICAvLyBTcGVjaWFsIGhhbmRsaW5nIGZvciB0cmFuc2FjdGlvbi5kb25lLlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdkb25lJylcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNhY3Rpb25Eb25lTWFwLmdldCh0YXJnZXQpO1xuICAgICAgICAgICAgLy8gTWFrZSB0eC5zdG9yZSByZXR1cm4gdGhlIG9ubHkgc3RvcmUgaW4gdGhlIHRyYW5zYWN0aW9uLCBvciB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG1hbnkuXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ3N0b3JlJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWNlaXZlci5vYmplY3RTdG9yZU5hbWVzWzFdXG4gICAgICAgICAgICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgIDogcmVjZWl2ZXIub2JqZWN0U3RvcmUocmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gRWxzZSB0cmFuc2Zvcm0gd2hhdGV2ZXIgd2UgZ2V0IGJhY2suXG4gICAgICAgIHJldHVybiB3cmFwKHRhcmdldFtwcm9wXSk7XG4gICAgfSxcbiAgICBzZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSkge1xuICAgICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICBoYXModGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbiAmJlxuICAgICAgICAgICAgKHByb3AgPT09ICdkb25lJyB8fCBwcm9wID09PSAnc3RvcmUnKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb3AgaW4gdGFyZ2V0O1xuICAgIH0sXG59O1xuZnVuY3Rpb24gcmVwbGFjZVRyYXBzKGNhbGxiYWNrKSB7XG4gICAgaWRiUHJveHlUcmFwcyA9IGNhbGxiYWNrKGlkYlByb3h5VHJhcHMpO1xufVxuZnVuY3Rpb24gd3JhcEZ1bmN0aW9uKGZ1bmMpIHtcbiAgICAvLyBEdWUgdG8gZXhwZWN0ZWQgb2JqZWN0IGVxdWFsaXR5ICh3aGljaCBpcyBlbmZvcmNlZCBieSB0aGUgY2FjaGluZyBpbiBgd3JhcGApLCB3ZVxuICAgIC8vIG9ubHkgY3JlYXRlIG9uZSBuZXcgZnVuYyBwZXIgZnVuYy5cbiAgICAvLyBDdXJzb3IgbWV0aG9kcyBhcmUgc3BlY2lhbCwgYXMgdGhlIGJlaGF2aW91ciBpcyBhIGxpdHRsZSBtb3JlIGRpZmZlcmVudCB0byBzdGFuZGFyZCBJREIuIEluXG4gICAgLy8gSURCLCB5b3UgYWR2YW5jZSB0aGUgY3Vyc29yIGFuZCB3YWl0IGZvciBhIG5ldyAnc3VjY2Vzcycgb24gdGhlIElEQlJlcXVlc3QgdGhhdCBnYXZlIHlvdSB0aGVcbiAgICAvLyBjdXJzb3IuIEl0J3Mga2luZGEgbGlrZSBhIHByb21pc2UgdGhhdCBjYW4gcmVzb2x2ZSB3aXRoIG1hbnkgdmFsdWVzLiBUaGF0IGRvZXNuJ3QgbWFrZSBzZW5zZVxuICAgIC8vIHdpdGggcmVhbCBwcm9taXNlcywgc28gZWFjaCBhZHZhbmNlIG1ldGhvZHMgcmV0dXJucyBhIG5ldyBwcm9taXNlIGZvciB0aGUgY3Vyc29yIG9iamVjdCwgb3JcbiAgICAvLyB1bmRlZmluZWQgaWYgdGhlIGVuZCBvZiB0aGUgY3Vyc29yIGhhcyBiZWVuIHJlYWNoZWQuXG4gICAgaWYgKGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkuaW5jbHVkZXMoZnVuYykpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgICAgICAvLyB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICAgICAgZnVuYy5hcHBseSh1bndyYXAodGhpcyksIGFyZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIHdyYXAodGhpcy5yZXF1ZXN0KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIC8vIENhbGxpbmcgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3h5IGFzICd0aGlzJyBjYXVzZXMgSUxMRUdBTCBJTlZPQ0FUSU9OLCBzbyB3ZSB1c2VcbiAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgcmV0dXJuIHdyYXAoZnVuYy5hcHBseSh1bndyYXAodGhpcyksIGFyZ3MpKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdHJhbnNmb3JtQ2FjaGFibGVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpXG4gICAgICAgIHJldHVybiB3cmFwRnVuY3Rpb24odmFsdWUpO1xuICAgIC8vIFRoaXMgZG9lc24ndCByZXR1cm4sIGl0IGp1c3QgY3JlYXRlcyBhICdkb25lJyBwcm9taXNlIGZvciB0aGUgdHJhbnNhY3Rpb24sXG4gICAgLy8gd2hpY2ggaXMgbGF0ZXIgcmV0dXJuZWQgZm9yIHRyYW5zYWN0aW9uLmRvbmUgKHNlZSBpZGJPYmplY3RIYW5kbGVyKS5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbilcbiAgICAgICAgY2FjaGVEb25lUHJvbWlzZUZvclRyYW5zYWN0aW9uKHZhbHVlKTtcbiAgICBpZiAoaW5zdGFuY2VPZkFueSh2YWx1ZSwgZ2V0SWRiUHJveHlhYmxlVHlwZXMoKSkpXG4gICAgICAgIHJldHVybiBuZXcgUHJveHkodmFsdWUsIGlkYlByb3h5VHJhcHMpO1xuICAgIC8vIFJldHVybiB0aGUgc2FtZSB2YWx1ZSBiYWNrIGlmIHdlJ3JlIG5vdCBnb2luZyB0byB0cmFuc2Zvcm0gaXQuXG4gICAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gd3JhcCh2YWx1ZSkge1xuICAgIC8vIFdlIHNvbWV0aW1lcyBnZW5lcmF0ZSBtdWx0aXBsZSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QgKGVnIHdoZW4gY3Vyc29yaW5nKSwgYmVjYXVzZVxuICAgIC8vIElEQiBpcyB3ZWlyZCBhbmQgYSBzaW5nbGUgSURCUmVxdWVzdCBjYW4geWllbGQgbWFueSByZXNwb25zZXMsIHNvIHRoZXNlIGNhbid0IGJlIGNhY2hlZC5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJREJSZXF1ZXN0KVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5UmVxdWVzdCh2YWx1ZSk7XG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSB0cmFuc2Zvcm1lZCB0aGlzIHZhbHVlIGJlZm9yZSwgcmV1c2UgdGhlIHRyYW5zZm9ybWVkIHZhbHVlLlxuICAgIC8vIFRoaXMgaXMgZmFzdGVyLCBidXQgaXQgYWxzbyBwcm92aWRlcyBvYmplY3QgZXF1YWxpdHkuXG4gICAgaWYgKHRyYW5zZm9ybUNhY2hlLmhhcyh2YWx1ZSkpXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1DYWNoZS5nZXQodmFsdWUpO1xuICAgIGNvbnN0IG5ld1ZhbHVlID0gdHJhbnNmb3JtQ2FjaGFibGVWYWx1ZSh2YWx1ZSk7XG4gICAgLy8gTm90IGFsbCB0eXBlcyBhcmUgdHJhbnNmb3JtZWQuXG4gICAgLy8gVGhlc2UgbWF5IGJlIHByaW1pdGl2ZSB0eXBlcywgc28gdGhleSBjYW4ndCBiZSBXZWFrTWFwIGtleXMuXG4gICAgaWYgKG5ld1ZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICB0cmFuc2Zvcm1DYWNoZS5zZXQodmFsdWUsIG5ld1ZhbHVlKTtcbiAgICAgICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChuZXdWYWx1ZSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3VmFsdWU7XG59XG5jb25zdCB1bndyYXAgPSAodmFsdWUpID0+IHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5nZXQodmFsdWUpO1xuXG4vKipcbiAqIE9wZW4gYSBkYXRhYmFzZS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBOYW1lIG9mIHRoZSBkYXRhYmFzZS5cbiAqIEBwYXJhbSB2ZXJzaW9uIFNjaGVtYSB2ZXJzaW9uLlxuICogQHBhcmFtIGNhbGxiYWNrcyBBZGRpdGlvbmFsIGNhbGxiYWNrcy5cbiAqL1xuZnVuY3Rpb24gb3BlbkRCKG5hbWUsIHZlcnNpb24sIHsgYmxvY2tlZCwgdXBncmFkZSwgYmxvY2tpbmcsIHRlcm1pbmF0ZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5vcGVuKG5hbWUsIHZlcnNpb24pO1xuICAgIGNvbnN0IG9wZW5Qcm9taXNlID0gd3JhcChyZXF1ZXN0KTtcbiAgICBpZiAodXBncmFkZSkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ3VwZ3JhZGVuZWVkZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHVwZ3JhZGUod3JhcChyZXF1ZXN0LnJlc3VsdCksIGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIHdyYXAocmVxdWVzdC50cmFuc2FjdGlvbiksIGV2ZW50KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChibG9ja2VkKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignYmxvY2tlZCcsIChldmVudCkgPT4gYmxvY2tlZChcbiAgICAgICAgLy8gQ2FzdGluZyBkdWUgdG8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0LURPTS1saWItZ2VuZXJhdG9yL3B1bGwvMTQwNVxuICAgICAgICBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCBldmVudCkpO1xuICAgIH1cbiAgICBvcGVuUHJvbWlzZVxuICAgICAgICAudGhlbigoZGIpID0+IHtcbiAgICAgICAgaWYgKHRlcm1pbmF0ZWQpXG4gICAgICAgICAgICBkYi5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsICgpID0+IHRlcm1pbmF0ZWQoKSk7XG4gICAgICAgIGlmIChibG9ja2luZykge1xuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcigndmVyc2lvbmNoYW5nZScsIChldmVudCkgPT4gYmxvY2tpbmcoZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICAgICAgfVxuICAgIH0pXG4gICAgICAgIC5jYXRjaCgoKSA9PiB7IH0pO1xuICAgIHJldHVybiBvcGVuUHJvbWlzZTtcbn1cbi8qKlxuICogRGVsZXRlIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKi9cbmZ1bmN0aW9uIGRlbGV0ZURCKG5hbWUsIHsgYmxvY2tlZCB9ID0ge30pIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gaW5kZXhlZERCLmRlbGV0ZURhdGFiYXNlKG5hbWUpO1xuICAgIGlmIChibG9ja2VkKSB7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignYmxvY2tlZCcsIChldmVudCkgPT4gYmxvY2tlZChcbiAgICAgICAgLy8gQ2FzdGluZyBkdWUgdG8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0LURPTS1saWItZ2VuZXJhdG9yL3B1bGwvMTQwNVxuICAgICAgICBldmVudC5vbGRWZXJzaW9uLCBldmVudCkpO1xuICAgIH1cbiAgICByZXR1cm4gd3JhcChyZXF1ZXN0KS50aGVuKCgpID0+IHVuZGVmaW5lZCk7XG59XG5cbmNvbnN0IHJlYWRNZXRob2RzID0gWydnZXQnLCAnZ2V0S2V5JywgJ2dldEFsbCcsICdnZXRBbGxLZXlzJywgJ2NvdW50J107XG5jb25zdCB3cml0ZU1ldGhvZHMgPSBbJ3B1dCcsICdhZGQnLCAnZGVsZXRlJywgJ2NsZWFyJ107XG5jb25zdCBjYWNoZWRNZXRob2RzID0gbmV3IE1hcCgpO1xuZnVuY3Rpb24gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkge1xuICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIElEQkRhdGFiYXNlICYmXG4gICAgICAgICEocHJvcCBpbiB0YXJnZXQpICYmXG4gICAgICAgIHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoY2FjaGVkTWV0aG9kcy5nZXQocHJvcCkpXG4gICAgICAgIHJldHVybiBjYWNoZWRNZXRob2RzLmdldChwcm9wKTtcbiAgICBjb25zdCB0YXJnZXRGdW5jTmFtZSA9IHByb3AucmVwbGFjZSgvRnJvbUluZGV4JC8sICcnKTtcbiAgICBjb25zdCB1c2VJbmRleCA9IHByb3AgIT09IHRhcmdldEZ1bmNOYW1lO1xuICAgIGNvbnN0IGlzV3JpdGUgPSB3cml0ZU1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpO1xuICAgIGlmIChcbiAgICAvLyBCYWlsIGlmIHRoZSB0YXJnZXQgZG9lc24ndCBleGlzdCBvbiB0aGUgdGFyZ2V0LiBFZywgZ2V0QWxsIGlzbid0IGluIEVkZ2UuXG4gICAgISh0YXJnZXRGdW5jTmFtZSBpbiAodXNlSW5kZXggPyBJREJJbmRleCA6IElEQk9iamVjdFN0b3JlKS5wcm90b3R5cGUpIHx8XG4gICAgICAgICEoaXNXcml0ZSB8fCByZWFkTWV0aG9kcy5pbmNsdWRlcyh0YXJnZXRGdW5jTmFtZSkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbWV0aG9kID0gYXN5bmMgZnVuY3Rpb24gKHN0b3JlTmFtZSwgLi4uYXJncykge1xuICAgICAgICAvLyBpc1dyaXRlID8gJ3JlYWR3cml0ZScgOiB1bmRlZmluZWQgZ3ppcHBzIGJldHRlciwgYnV0IGZhaWxzIGluIEVkZ2UgOihcbiAgICAgICAgY29uc3QgdHggPSB0aGlzLnRyYW5zYWN0aW9uKHN0b3JlTmFtZSwgaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogJ3JlYWRvbmx5Jyk7XG4gICAgICAgIGxldCB0YXJnZXQgPSB0eC5zdG9yZTtcbiAgICAgICAgaWYgKHVzZUluZGV4KVxuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LmluZGV4KGFyZ3Muc2hpZnQoKSk7XG4gICAgICAgIC8vIE11c3QgcmVqZWN0IGlmIG9wIHJlamVjdHMuXG4gICAgICAgIC8vIElmIGl0J3MgYSB3cml0ZSBvcGVyYXRpb24sIG11c3QgcmVqZWN0IGlmIHR4LmRvbmUgcmVqZWN0cy5cbiAgICAgICAgLy8gTXVzdCByZWplY3Qgd2l0aCBvcCByZWplY3Rpb24gZmlyc3QuXG4gICAgICAgIC8vIE11c3QgcmVzb2x2ZSB3aXRoIG9wIHZhbHVlLlxuICAgICAgICAvLyBNdXN0IGhhbmRsZSBib3RoIHByb21pc2VzIChubyB1bmhhbmRsZWQgcmVqZWN0aW9ucylcbiAgICAgICAgcmV0dXJuIChhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICB0YXJnZXRbdGFyZ2V0RnVuY05hbWVdKC4uLmFyZ3MpLFxuICAgICAgICAgICAgaXNXcml0ZSAmJiB0eC5kb25lLFxuICAgICAgICBdKSlbMF07XG4gICAgfTtcbiAgICBjYWNoZWRNZXRob2RzLnNldChwcm9wLCBtZXRob2QpO1xuICAgIHJldHVybiBtZXRob2Q7XG59XG5yZXBsYWNlVHJhcHMoKG9sZFRyYXBzKSA9PiAoe1xuICAgIC4uLm9sZFRyYXBzLFxuICAgIGdldDogKHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpID0+IGdldE1ldGhvZCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSxcbiAgICBoYXM6ICh0YXJnZXQsIHByb3ApID0+ICEhZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCksXG59KSk7XG5cbmNvbnN0IGFkdmFuY2VNZXRob2RQcm9wcyA9IFsnY29udGludWUnLCAnY29udGludWVQcmltYXJ5S2V5JywgJ2FkdmFuY2UnXTtcbmNvbnN0IG1ldGhvZE1hcCA9IHt9O1xuY29uc3QgYWR2YW5jZVJlc3VsdHMgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgY3Vyc29ySXRlcmF0b3JUcmFwcyA9IHtcbiAgICBnZXQodGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIGlmICghYWR2YW5jZU1ldGhvZFByb3BzLmluY2x1ZGVzKHByb3ApKVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgICAgbGV0IGNhY2hlZEZ1bmMgPSBtZXRob2RNYXBbcHJvcF07XG4gICAgICAgIGlmICghY2FjaGVkRnVuYykge1xuICAgICAgICAgICAgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgICAgICAgICAgYWR2YW5jZVJlc3VsdHMuc2V0KHRoaXMsIGl0dHJQcm94aWVkQ3Vyc29yVG9PcmlnaW5hbFByb3h5LmdldCh0aGlzKVtwcm9wXSguLi5hcmdzKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYWNoZWRGdW5jO1xuICAgIH0sXG59O1xuYXN5bmMgZnVuY3Rpb24qIGl0ZXJhdGUoLi4uYXJncykge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby10aGlzLWFzc2lnbm1lbnRcbiAgICBsZXQgY3Vyc29yID0gdGhpcztcbiAgICBpZiAoIShjdXJzb3IgaW5zdGFuY2VvZiBJREJDdXJzb3IpKSB7XG4gICAgICAgIGN1cnNvciA9IGF3YWl0IGN1cnNvci5vcGVuQ3Vyc29yKC4uLmFyZ3MpO1xuICAgIH1cbiAgICBpZiAoIWN1cnNvcilcbiAgICAgICAgcmV0dXJuO1xuICAgIGN1cnNvciA9IGN1cnNvcjtcbiAgICBjb25zdCBwcm94aWVkQ3Vyc29yID0gbmV3IFByb3h5KGN1cnNvciwgY3Vyc29ySXRlcmF0b3JUcmFwcyk7XG4gICAgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuc2V0KHByb3hpZWRDdXJzb3IsIGN1cnNvcik7XG4gICAgLy8gTWFwIHRoaXMgZG91YmxlLXByb3h5IGJhY2sgdG8gdGhlIG9yaWdpbmFsLCBzbyBvdGhlciBjdXJzb3IgbWV0aG9kcyB3b3JrLlxuICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQocHJveGllZEN1cnNvciwgdW53cmFwKGN1cnNvcikpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgeWllbGQgcHJveGllZEN1cnNvcjtcbiAgICAgICAgLy8gSWYgb25lIG9mIHRoZSBhZHZhbmNpbmcgbWV0aG9kcyB3YXMgbm90IGNhbGxlZCwgY2FsbCBjb250aW51ZSgpLlxuICAgICAgICBjdXJzb3IgPSBhd2FpdCAoYWR2YW5jZVJlc3VsdHMuZ2V0KHByb3hpZWRDdXJzb3IpIHx8IGN1cnNvci5jb250aW51ZSgpKTtcbiAgICAgICAgYWR2YW5jZVJlc3VsdHMuZGVsZXRlKHByb3hpZWRDdXJzb3IpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkge1xuICAgIHJldHVybiAoKHByb3AgPT09IFN5bWJvbC5hc3luY0l0ZXJhdG9yICYmXG4gICAgICAgIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlLCBJREJDdXJzb3JdKSkgfHxcbiAgICAgICAgKHByb3AgPT09ICdpdGVyYXRlJyAmJiBpbnN0YW5jZU9mQW55KHRhcmdldCwgW0lEQkluZGV4LCBJREJPYmplY3RTdG9yZV0pKSk7XG59XG5yZXBsYWNlVHJhcHMoKG9sZFRyYXBzKSA9PiAoe1xuICAgIC4uLm9sZFRyYXBzLFxuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmIChpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApKVxuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdGU7XG4gICAgICAgIHJldHVybiBvbGRUcmFwcy5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcik7XG4gICAgfSxcbiAgICBoYXModGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIHJldHVybiBpc0l0ZXJhdG9yUHJvcCh0YXJnZXQsIHByb3ApIHx8IG9sZFRyYXBzLmhhcyh0YXJnZXQsIHByb3ApO1xuICAgIH0sXG59KSk7XG5cbmV4cG9ydCB7IGRlbGV0ZURCLCBvcGVuREIsIHVud3JhcCwgd3JhcCB9O1xuIiwgImltcG9ydCB7IG9wZW5EQiB9IGZyb20gJ2lkYic7XG5cbmFzeW5jIGZ1bmN0aW9uIG9wZW5FdmVudHNEYigpIHtcbiAgICByZXR1cm4gYXdhaXQgb3BlbkRCKCdldmVudHMnLCAxLCB7XG4gICAgICAgIHVwZ3JhZGUoZGIpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50cyA9IGRiLmNyZWF0ZU9iamVjdFN0b3JlKCdldmVudHMnLCB7XG4gICAgICAgICAgICAgICAga2V5UGF0aDogJ2V2ZW50LmlkJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZXZlbnRzLmNyZWF0ZUluZGV4KCdwdWJrZXknLCAnZXZlbnQucHVia2V5Jyk7XG4gICAgICAgICAgICBldmVudHMuY3JlYXRlSW5kZXgoJ2NyZWF0ZWRfYXQnLCAnZXZlbnQuY3JlYXRlZF9hdCcpO1xuICAgICAgICAgICAgZXZlbnRzLmNyZWF0ZUluZGV4KCdraW5kJywgJ2V2ZW50LmtpbmQnKTtcbiAgICAgICAgICAgIGV2ZW50cy5jcmVhdGVJbmRleCgnaG9zdCcsICdtZXRhZGF0YS5ob3N0Jyk7XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlRXZlbnQoZXZlbnQpIHtcbiAgICBsZXQgZGIgPSBhd2FpdCBvcGVuRXZlbnRzRGIoKTtcbiAgICByZXR1cm4gZGIucHV0KCdldmVudHMnLCBldmVudCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzb3J0QnlJbmRleChpbmRleCwgcXVlcnksIGFzYywgbWF4KSB7XG4gICAgbGV0IGRiID0gYXdhaXQgb3BlbkV2ZW50c0RiKCk7XG4gICAgbGV0IGV2ZW50cyA9IFtdO1xuICAgIGxldCBjdXJzb3IgPSBhd2FpdCBkYlxuICAgICAgICAudHJhbnNhY3Rpb24oJ2V2ZW50cycpXG4gICAgICAgIC5zdG9yZS5pbmRleChpbmRleClcbiAgICAgICAgLm9wZW5DdXJzb3IocXVlcnksIGFzYyA/ICduZXh0JyA6ICdwcmV2Jyk7XG4gICAgd2hpbGUgKGN1cnNvcikge1xuICAgICAgICBldmVudHMucHVzaChjdXJzb3IudmFsdWUpO1xuICAgICAgICBpZiAoZXZlbnRzLmxlbmd0aCA+PSBtYXgpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGN1cnNvciA9IGF3YWl0IGN1cnNvci5jb250aW51ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gZXZlbnRzO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SG9zdHMoKSB7XG4gICAgbGV0IGRiID0gYXdhaXQgb3BlbkV2ZW50c0RiKCk7XG4gICAgbGV0IGhvc3RzID0gbmV3IFNldCgpO1xuICAgIGxldCBjdXJzb3IgPSBhd2FpdCBkYi50cmFuc2FjdGlvbignZXZlbnRzJykuc3RvcmUub3BlbkN1cnNvcigpO1xuICAgIHdoaWxlIChjdXJzb3IpIHtcbiAgICAgICAgaG9zdHMuYWRkKGN1cnNvci52YWx1ZS5tZXRhZGF0YS5ob3N0KTtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgfVxuICAgIHJldHVybiBbLi4uaG9zdHNdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRBbGxDb250ZW50cygpIHtcbiAgICBsZXQgZGIgPSBhd2FpdCBvcGVuRXZlbnRzRGIoKTtcbiAgICBsZXQgZXZlbnRzID0gW107XG4gICAgbGV0IGN1cnNvciA9IGF3YWl0IGRiLnRyYW5zYWN0aW9uKCdldmVudHMnKS5zdG9yZS5vcGVuQ3Vyc29yKCk7XG4gICAgd2hpbGUgKGN1cnNvcikge1xuICAgICAgICBldmVudHMucHVzaChjdXJzb3IudmFsdWUuZXZlbnQpO1xuICAgICAgICBjdXJzb3IgPSBhd2FpdCBjdXJzb3IuY29udGludWUoKTtcbiAgICB9XG4gICAgZXZlbnRzID0gZXZlbnRzLm1hcChlID0+IEpTT04uc3RyaW5naWZ5KGUpKTtcbiAgICBldmVudHMgPSBldmVudHMuam9pbignXFxuJyk7XG4gICAgY29uc29sZS5sb2coZXZlbnRzKTtcblxuICAgIGNvbnN0IGZpbGUgPSBuZXcgRmlsZShbZXZlbnRzXSwgJ2V2ZW50cy5qc29ubCcsIHtcbiAgICAgICAgdHlwZTogJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbScsXG4gICAgfSk7XG5cbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2V2ZW50c10sIHsgdHlwZTogJ3BsYWluL3RleHQnIH0pO1xuXG4gICAgcmV0dXJuIGJsb2I7XG59XG4iLCAiLyoqXG4gKiBCcm93c2VyIEFQSSBjb21wYXRpYmlsaXR5IGxheWVyIGZvciBDaHJvbWUgLyBTYWZhcmkgLyBGaXJlZm94LlxuICpcbiAqIFNhZmFyaSBhbmQgRmlyZWZveCBleHBvc2UgYGJyb3dzZXIuKmAgKFByb21pc2UtYmFzZWQsIFdlYkV4dGVuc2lvbiBzdGFuZGFyZCkuXG4gKiBDaHJvbWUgZXhwb3NlcyBgY2hyb21lLipgIChjYWxsYmFjay1iYXNlZCBoaXN0b3JpY2FsbHksIGJ1dCBNVjMgc3VwcG9ydHNcbiAqIHByb21pc2VzIG9uIG1vc3QgQVBJcykuIEluIGEgc2VydmljZS13b3JrZXIgY29udGV4dCBgYnJvd3NlcmAgaXMgdW5kZWZpbmVkXG4gKiBvbiBDaHJvbWUsIHNvIHdlIG5vcm1hbGlzZSBldmVyeXRoaW5nIGhlcmUuXG4gKlxuICogVXNhZ2U6ICBpbXBvcnQgeyBhcGkgfSBmcm9tICcuL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbiAqICAgICAgICAgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uKVxuICpcbiAqIFRoZSBleHBvcnRlZCBgYXBpYCBvYmplY3QgbWlycm9ycyB0aGUgc3Vic2V0IG9mIHRoZSBXZWJFeHRlbnNpb24gQVBJIHRoYXRcbiAqIE5vc3RyS2V5IGFjdHVhbGx5IHVzZXMsIHdpdGggZXZlcnkgbWV0aG9kIHJldHVybmluZyBhIFByb21pc2UuXG4gKi9cblxuLy8gRGV0ZWN0IHdoaWNoIGdsb2JhbCBuYW1lc3BhY2UgaXMgYXZhaWxhYmxlLlxuY29uc3QgX2Jyb3dzZXIgPVxuICAgIHR5cGVvZiBicm93c2VyICE9PSAndW5kZWZpbmVkJyA/IGJyb3dzZXIgOlxuICAgIHR5cGVvZiBjaHJvbWUgICE9PSAndW5kZWZpbmVkJyA/IGNocm9tZSAgOlxuICAgIG51bGw7XG5cbmlmICghX2Jyb3dzZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2Jyb3dzZXItcG9seWZpbGw6IE5vIGV4dGVuc2lvbiBBUEkgbmFtZXNwYWNlIGZvdW5kIChuZWl0aGVyIGJyb3dzZXIgbm9yIGNocm9tZSkuJyk7XG59XG5cbi8qKlxuICogVHJ1ZSB3aGVuIHJ1bm5pbmcgb24gQ2hyb21lIChvciBhbnkgQ2hyb21pdW0tYmFzZWQgYnJvd3NlciB0aGF0IG9ubHlcbiAqIGV4cG9zZXMgdGhlIGBjaHJvbWVgIG5hbWVzcGFjZSkuXG4gKi9cbmNvbnN0IGlzQ2hyb21lID0gdHlwZW9mIGJyb3dzZXIgPT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnO1xuXG4vKipcbiAqIFdyYXAgYSBDaHJvbWUgY2FsbGJhY2stc3R5bGUgbWV0aG9kIHNvIGl0IHJldHVybnMgYSBQcm9taXNlLlxuICogSWYgdGhlIG1ldGhvZCBhbHJlYWR5IHJldHVybnMgYSBwcm9taXNlIChNVjMpIHdlIGp1c3QgcGFzcyB0aHJvdWdoLlxuICovXG5mdW5jdGlvbiBwcm9taXNpZnkoY29udGV4dCwgbWV0aG9kKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIE1WMyBDaHJvbWUgQVBJcyByZXR1cm4gcHJvbWlzZXMgd2hlbiBubyBjYWxsYmFjayBpcyBzdXBwbGllZC5cbiAgICAgICAgLy8gV2UgdHJ5IHRoZSBwcm9taXNlIHBhdGggZmlyc3Q7IGlmIHRoZSBydW50aW1lIHNpZ25hbHMgYW4gZXJyb3JcbiAgICAgICAgLy8gdmlhIGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciBpbnNpZGUgYSBjYWxsYmFjayB3ZSBjYXRjaCB0aGF0IHRvby5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgICAgLy8gZmFsbCB0aHJvdWdoIHRvIGNhbGxiYWNrIHdyYXBwaW5nXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbWV0aG9kLmFwcGx5KGNvbnRleHQsIFtcbiAgICAgICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICAgICAgICAgICguLi5jYkFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9icm93c2VyLnJ1bnRpbWUgJiYgX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoX2Jyb3dzZXIucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShjYkFyZ3MubGVuZ3RoIDw9IDEgPyBjYkFyZ3NbMF0gOiBjYkFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICB9O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHRoZSB1bmlmaWVkIGBhcGlgIG9iamVjdFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IGFwaSA9IHt9O1xuXG4vLyAtLS0gcnVudGltZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5ydW50aW1lID0ge1xuICAgIC8qKlxuICAgICAqIHNlbmRNZXNzYWdlIFx1MjAxMyBhbHdheXMgcmV0dXJucyBhIFByb21pc2UuXG4gICAgICovXG4gICAgc2VuZE1lc3NhZ2UoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UpKC4uLmFyZ3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvbk1lc3NhZ2UgXHUyMDEzIHRoaW4gd3JhcHBlciBzbyBjYWxsZXJzIHVzZSBhIGNvbnNpc3RlbnQgcmVmZXJlbmNlLlxuICAgICAqIFRoZSBsaXN0ZW5lciBzaWduYXR1cmUgaXMgKG1lc3NhZ2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKS5cbiAgICAgKiBPbiBDaHJvbWUgdGhlIGxpc3RlbmVyIGNhbiByZXR1cm4gYHRydWVgIHRvIGtlZXAgdGhlIGNoYW5uZWwgb3BlbixcbiAgICAgKiBvciByZXR1cm4gYSBQcm9taXNlIChNVjMpLiAgU2FmYXJpIC8gRmlyZWZveCBleHBlY3QgYSBQcm9taXNlIHJldHVybi5cbiAgICAgKi9cbiAgICBvbk1lc3NhZ2U6IF9icm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLFxuXG4gICAgLyoqXG4gICAgICogZ2V0VVJMIFx1MjAxMyBzeW5jaHJvbm91cyBvbiBhbGwgYnJvd3NlcnMuXG4gICAgICovXG4gICAgZ2V0VVJMKHBhdGgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuZ2V0VVJMKHBhdGgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBvcGVuT3B0aW9uc1BhZ2VcbiAgICAgKi9cbiAgICBvcGVuT3B0aW9uc1BhZ2UoKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UpKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSB0aGUgaWQgZm9yIGNvbnZlbmllbmNlLlxuICAgICAqL1xuICAgIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuaWQ7XG4gICAgfSxcbn07XG5cbi8vIC0tLSBzdG9yYWdlLmxvY2FsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnN0b3JhZ2UgPSB7XG4gICAgbG9jYWw6IHtcbiAgICAgICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmNsZWFyKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9LFxufTtcblxuLy8gLS0tIHRhYnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkudGFicyA9IHtcbiAgICBjcmVhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5jcmVhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmNyZWF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBxdWVyeSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnF1ZXJ5KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5xdWVyeSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICB1cGRhdGUoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy51cGRhdGUoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnVwZGF0ZSkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldCkoLi4uYXJncyk7XG4gICAgfSxcbiAgICBnZXRDdXJyZW50KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0Q3VycmVudCkoLi4uYXJncyk7XG4gICAgfSxcbn07XG5cbmV4cG9ydCB7IGFwaSwgaXNDaHJvbWUgfTtcbiIsICJpbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgZW5jcnlwdCwgZGVjcnlwdCwgaGFzaFBhc3N3b3JkLCB2ZXJpZnlQYXNzd29yZCB9IGZyb20gJy4vY3J5cHRvJztcblxuY29uc3QgREJfVkVSU0lPTiA9IDU7XG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5leHBvcnQgY29uc3QgUkVDT01NRU5ERURfUkVMQVlTID0gW1xuICAgIG5ldyBVUkwoJ3dzczovL3JlbGF5LmRhbXVzLmlvJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vcmVsYXkucHJpbWFsLm5ldCcpLFxuICAgIG5ldyBVUkwoJ3dzczovL3JlbGF5LnNub3J0LnNvY2lhbCcpLFxuICAgIG5ldyBVUkwoJ3dzczovL3JlbGF5LmdldGFsYnkuY29tL3YxJyksXG4gICAgbmV3IFVSTCgnd3NzOi8vbm9zLmxvbCcpLFxuICAgIG5ldyBVUkwoJ3dzczovL2JyYi5pbycpLFxuICAgIG5ldyBVUkwoJ3dzczovL25vc3RyLm9yYW5nZXBpbGwuZGV2JyksXG5dO1xuLy8gcHJldHRpZXItaWdub3JlXG5leHBvcnQgY29uc3QgS0lORFMgPSBbXG4gICAgWzAsICdNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsxLCAnVGV4dCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMS5tZCddLFxuICAgIFsyLCAnUmVjb21tZW5kIFJlbGF5JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzAxLm1kJ10sXG4gICAgWzMsICdDb250YWN0cycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wMi5tZCddLFxuICAgIFs0LCAnRW5jcnlwdGVkIERpcmVjdCBNZXNzYWdlcycsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8wNC5tZCddLFxuICAgIFs1LCAnRXZlbnQgRGVsZXRpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMDkubWQnXSxcbiAgICBbNiwgJ1JlcG9zdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8xOC5tZCddLFxuICAgIFs3LCAnUmVhY3Rpb24nLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjUubWQnXSxcbiAgICBbOCwgJ0JhZGdlIEF3YXJkJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzE2LCAnR2VuZXJpYyBSZXBvc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTgubWQnXSxcbiAgICBbNDAsICdDaGFubmVsIENyZWF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQxLCAnQ2hhbm5lbCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MiwgJ0NoYW5uZWwgTWVzc2FnZScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yOC5tZCddLFxuICAgIFs0MywgJ0NoYW5uZWwgSGlkZSBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzI4Lm1kJ10sXG4gICAgWzQ0LCAnQ2hhbm5lbCBNdXRlIFVzZXInLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMjgubWQnXSxcbiAgICBbMTA2MywgJ0ZpbGUgTWV0YWRhdGEnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvOTQubWQnXSxcbiAgICBbMTMxMSwgJ0xpdmUgQ2hhdCBNZXNzYWdlJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUzLm1kJ10sXG4gICAgWzE5ODQsICdSZXBvcnRpbmcnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTYubWQnXSxcbiAgICBbMTk4NSwgJ0xhYmVsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzMyLm1kJ10sXG4gICAgWzQ1NTAsICdDb21tdW5pdHkgUG9zdCBBcHByb3ZhbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83Mi5tZCddLFxuICAgIFs3MDAwLCAnSm9iIEZlZWRiYWNrJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzkwLm1kJ10sXG4gICAgWzkwNDEsICdaYXAgR29hbCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83NS5tZCddLFxuICAgIFs5NzM0LCAnWmFwIFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTcubWQnXSxcbiAgICBbOTczNSwgJ1phcCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Ny5tZCddLFxuICAgIFsxMDAwMCwgJ011dGUgTGlzdCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81MS5tZCddLFxuICAgIFsxMDAwMSwgJ1BpbiBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzEwMDAyLCAnUmVsYXkgTGlzdCBNZXRhZGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci82NS5tZCddLFxuICAgIFsxMzE5NCwgJ1dhbGxldCBJbmZvJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ3Lm1kJ10sXG4gICAgWzIyMjQyLCAnQ2xpZW50IEF1dGhlbnRpY2F0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQyLm1kJ10sXG4gICAgWzIzMTk0LCAnV2FsbGV0IFJlcXVlc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjMxOTUsICdXYWxsZXQgUmVzcG9uc2UnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNDcubWQnXSxcbiAgICBbMjQxMzMsICdOb3N0ciBDb25uZWN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzQ2Lm1kJ10sXG4gICAgWzI3MjM1LCAnSFRUUCBBdXRoJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk4Lm1kJ10sXG4gICAgWzMwMDAwLCAnQ2F0ZWdvcml6ZWQgUGVvcGxlIExpc3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTEubWQnXSxcbiAgICBbMzAwMDEsICdDYXRlZ29yaXplZCBCb29rbWFyayBMaXN0JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzUxLm1kJ10sXG4gICAgWzMwMDA4LCAnUHJvZmlsZSBCYWRnZXMnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTgubWQnXSxcbiAgICBbMzAwMDksICdCYWRnZSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzU4Lm1kJ10sXG4gICAgWzMwMDE3LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHN0YWxsJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzE1Lm1kJ10sXG4gICAgWzMwMDE4LCAnQ3JlYXRlIG9yIHVwZGF0ZSBhIHByb2R1Y3QnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvMTUubWQnXSxcbiAgICBbMzAwMjMsICdMb25nLUZvcm0gQ29udGVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci8yMy5tZCddLFxuICAgIFszMDAyNCwgJ0RyYWZ0IExvbmctZm9ybSBDb250ZW50JywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzIzLm1kJ10sXG4gICAgWzMwMDc4LCAnQXBwbGljYXRpb24tc3BlY2lmaWMgRGF0YScsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci83OC5tZCddLFxuICAgIFszMDMxMSwgJ0xpdmUgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTMubWQnXSxcbiAgICBbMzAzMTUsICdVc2VyIFN0YXR1c2VzJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzM4Lm1kJ10sXG4gICAgWzMwNDAyLCAnQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMwNDAzLCAnRHJhZnQgQ2xhc3NpZmllZCBMaXN0aW5nJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzk5Lm1kJ10sXG4gICAgWzMxOTIyLCAnRGF0ZS1CYXNlZCBDYWxlbmRhciBFdmVudCcsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyMywgJ1RpbWUtQmFzZWQgQ2FsZW5kYXIgRXZlbnQnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5MjQsICdDYWxlbmRhcicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci81Mi5tZCddLFxuICAgIFszMTkyNSwgJ0NhbGVuZGFyIEV2ZW50IFJTVlAnLCAnaHR0cHM6Ly9naXRodWIuY29tL25vc3RyLXByb3RvY29sL25pcHMvYmxvYi9tYXN0ZXIvNTIubWQnXSxcbiAgICBbMzE5ODksICdIYW5kbGVyIHJlY29tbWVuZGF0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzg5Lm1kJ10sXG4gICAgWzMxOTkwLCAnSGFuZGxlciBpbmZvcm1hdGlvbicsICdodHRwczovL2dpdGh1Yi5jb20vbm9zdHItcHJvdG9jb2wvbmlwcy9ibG9iL21hc3Rlci84OS5tZCddLFxuICAgIFszNDU1MCwgJ0NvbW11bml0eSBEZWZpbml0aW9uJywgJ2h0dHBzOi8vZ2l0aHViLmNvbS9ub3N0ci1wcm90b2NvbC9uaXBzL2Jsb2IvbWFzdGVyLzcyLm1kJ10sXG5dO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICBhd2FpdCBnZXRPclNldERlZmF1bHQoJ3Byb2ZpbGVJbmRleCcsIDApO1xuICAgIGF3YWl0IGdldE9yU2V0RGVmYXVsdCgncHJvZmlsZXMnLCBbYXdhaXQgZ2VuZXJhdGVQcm9maWxlKCldKTtcbiAgICBsZXQgdmVyc2lvbiA9IChhd2FpdCBzdG9yYWdlLmdldCh7IHZlcnNpb246IDAgfSkpLnZlcnNpb247XG4gICAgY29uc29sZS5sb2coJ0RCIHZlcnNpb246ICcsIHZlcnNpb24pO1xuICAgIHdoaWxlICh2ZXJzaW9uIDwgREJfVkVSU0lPTikge1xuICAgICAgICB2ZXJzaW9uID0gYXdhaXQgbWlncmF0ZSh2ZXJzaW9uLCBEQl9WRVJTSU9OKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyB2ZXJzaW9uIH0pO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWlncmF0ZSh2ZXJzaW9uLCBnb2FsKSB7XG4gICAgaWYgKHZlcnNpb24gPT09IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coJ01pZ3JhdGluZyB0byB2ZXJzaW9uIDEuJyk7XG4gICAgICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2gocHJvZmlsZSA9PiAocHJvZmlsZS5ob3N0cyA9IHt9KSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnbWlncmF0aW5nIHRvIHZlcnNpb24gMi4nKTtcbiAgICAgICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiAzLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4gKHByb2ZpbGUucmVsYXlSZW1pbmRlciA9IHRydWUpKTtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA0IChlbmNyeXB0aW9uIHN1cHBvcnQpLicpO1xuICAgICAgICAvLyBObyBkYXRhIHRyYW5zZm9ybWF0aW9uIG5lZWRlZCBcdTIwMTQgZXhpc3RpbmcgcGxhaW50ZXh0IGtleXMgc3RheSBhcy1pcy5cbiAgICAgICAgLy8gRW5jcnlwdGlvbiBvbmx5IGFjdGl2YXRlcyB3aGVuIHRoZSB1c2VyIHNldHMgYSBtYXN0ZXIgcGFzc3dvcmQuXG4gICAgICAgIC8vIFdlIGp1c3QgZW5zdXJlIHRoZSBpc0VuY3J5cHRlZCBmbGFnIGV4aXN0cyBhbmQgZGVmYXVsdHMgdG8gZmFsc2UuXG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIGlmICghZGF0YS5pc0VuY3J5cHRlZCkge1xuICAgICAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZlcnNpb24gKyAxO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSA0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdNaWdyYXRpbmcgdG8gdmVyc2lvbiA1IChOSVAtNDYgYnVua2VyIHN1cHBvcnQpLicpO1xuICAgICAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICBwcm9maWxlcy5mb3JFYWNoKHByb2ZpbGUgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcm9maWxlLnR5cGUpIHByb2ZpbGUudHlwZSA9ICdsb2NhbCc7XG4gICAgICAgICAgICBpZiAocHJvZmlsZS5idW5rZXJVcmwgPT09IHVuZGVmaW5lZCkgcHJvZmlsZS5idW5rZXJVcmwgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHByb2ZpbGUucmVtb3RlUHVia2V5ID09PSB1bmRlZmluZWQpIHByb2ZpbGUucmVtb3RlUHVia2V5ID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uICsgMTtcbiAgICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcm9maWxlcygpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBzdG9yYWdlLmdldCh7IHByb2ZpbGVzOiBbXSB9KTtcbiAgICByZXR1cm4gcHJvZmlsZXMucHJvZmlsZXM7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcm9maWxlKGluZGV4KSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICByZXR1cm4gcHJvZmlsZXNbaW5kZXhdO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZmlsZU5hbWVzKCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgcmV0dXJuIHByb2ZpbGVzLm1hcChwID0+IHAubmFtZSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcm9maWxlSW5kZXgoKSB7XG4gICAgY29uc3QgaW5kZXggPSBhd2FpdCBzdG9yYWdlLmdldCh7IHByb2ZpbGVJbmRleDogMCB9KTtcbiAgICByZXR1cm4gaW5kZXgucHJvZmlsZUluZGV4O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UHJvZmlsZUluZGV4KHByb2ZpbGVJbmRleCkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZUluZGV4IH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlUHJvZmlsZShpbmRleCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgbGV0IHByb2ZpbGVJbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIHByb2ZpbGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgaWYgKHByb2ZpbGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGF3YWl0IGNsZWFyRGF0YSgpOyAvLyBJZiB3ZSBoYXZlIGRlbGV0ZWQgYWxsIG9mIHRoZSBwcm9maWxlcywgbGV0J3MganVzdCBzdGFydCBmcmVzaCB3aXRoIGFsbCBuZXcgZGF0YVxuICAgICAgICBhd2FpdCBpbml0aWFsaXplKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWYgdGhlIGluZGV4IGRlbGV0ZWQgd2FzIHRoZSBhY3RpdmUgcHJvZmlsZSwgY2hhbmdlIHRoZSBhY3RpdmUgcHJvZmlsZSB0byB0aGUgbmV4dCBvbmVcbiAgICAgICAgbGV0IG5ld0luZGV4ID1cbiAgICAgICAgICAgIHByb2ZpbGVJbmRleCA9PT0gaW5kZXggPyBNYXRoLm1heChpbmRleCAtIDEsIDApIDogcHJvZmlsZUluZGV4O1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzLCBwcm9maWxlSW5kZXg6IG5ld0luZGV4IH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyRGF0YSgpIHtcbiAgICBsZXQgaWdub3JlSW5zdGFsbEhvb2sgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlnbm9yZUluc3RhbGxIb29rOiBmYWxzZSB9KTtcbiAgICBhd2FpdCBzdG9yYWdlLmNsZWFyKCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoaWdub3JlSW5zdGFsbEhvb2spO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVByaXZhdGVLZXkoKSB7XG4gICAgcmV0dXJuIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2dlbmVyYXRlUHJpdmF0ZUtleScgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZW5lcmF0ZVByb2ZpbGUobmFtZSA9ICdEZWZhdWx0IE5vc3RyIFByb2ZpbGUnLCB0eXBlID0gJ2xvY2FsJykge1xuICAgIHJldHVybiB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHByaXZLZXk6IHR5cGUgPT09ICdsb2NhbCcgPyBhd2FpdCBnZW5lcmF0ZVByaXZhdGVLZXkoKSA6ICcnLFxuICAgICAgICBob3N0czoge30sXG4gICAgICAgIHJlbGF5czogUkVDT01NRU5ERURfUkVMQVlTLm1hcChyID0+ICh7IHVybDogci5ocmVmLCByZWFkOiB0cnVlLCB3cml0ZTogdHJ1ZSB9KSksXG4gICAgICAgIHJlbGF5UmVtaW5kZXI6IGZhbHNlLFxuICAgICAgICB0eXBlLFxuICAgICAgICBidW5rZXJVcmw6IG51bGwsXG4gICAgICAgIHJlbW90ZVB1YmtleTogbnVsbCxcbiAgICB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRPclNldERlZmF1bHQoa2V5LCBkZWYpIHtcbiAgICBsZXQgdmFsID0gKGF3YWl0IHN0b3JhZ2UuZ2V0KGtleSkpW2tleV07XG4gICAgaWYgKHZhbCA9PSBudWxsIHx8IHZhbCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBba2V5XTogZGVmIH0pO1xuICAgICAgICByZXR1cm4gZGVmO1xuICAgIH1cblxuICAgIHJldHVybiB2YWw7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUHJvZmlsZU5hbWUoaW5kZXgsIHByb2ZpbGVOYW1lKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBwcm9maWxlc1tpbmRleF0ubmFtZSA9IHByb2ZpbGVOYW1lO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlUHJpdmF0ZUtleShpbmRleCwgcHJpdmF0ZUtleSkge1xuICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ3NhdmVQcml2YXRlS2V5JyxcbiAgICAgICAgcGF5bG9hZDogW2luZGV4LCBwcml2YXRlS2V5XSxcbiAgICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5ld1Byb2ZpbGUoKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBjb25zdCBuZXdQcm9maWxlID0gYXdhaXQgZ2VuZXJhdGVQcm9maWxlKCdOZXcgUHJvZmlsZScpO1xuICAgIHByb2ZpbGVzLnB1c2gobmV3UHJvZmlsZSk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbiAgICByZXR1cm4gcHJvZmlsZXMubGVuZ3RoIC0gMTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5ld0J1bmtlclByb2ZpbGUobmFtZSA9ICdOZXcgQnVua2VyJywgYnVua2VyVXJsID0gbnVsbCkge1xuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgY29uc3QgcHJvZmlsZSA9IGF3YWl0IGdlbmVyYXRlUHJvZmlsZShuYW1lLCAnYnVua2VyJyk7XG4gICAgcHJvZmlsZS5idW5rZXJVcmwgPSBidW5rZXJVcmw7XG4gICAgcHJvZmlsZXMucHVzaChwcm9maWxlKTtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xuICAgIHJldHVybiBwcm9maWxlcy5sZW5ndGggLSAxO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UmVsYXlzKHByb2ZpbGVJbmRleCkge1xuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZ2V0UHJvZmlsZShwcm9maWxlSW5kZXgpO1xuICAgIHJldHVybiBwcm9maWxlLnJlbGF5cyB8fCBbXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVSZWxheXMocHJvZmlsZUluZGV4LCByZWxheXMpIHtcbiAgICAvLyBIYXZpbmcgYW4gQWxwaW5lIHByb3h5IG9iamVjdCBhcyBhIHN1Yi1vYmplY3QgZG9lcyBub3Qgc2VyaWFsaXplIGNvcnJlY3RseSBpbiBzdG9yYWdlLFxuICAgIC8vIHNvIHdlIGFyZSBwcmUtc2VyaWFsaXppbmcgaGVyZSBiZWZvcmUgYXNzaWduaW5nIGl0IHRvIHRoZSBwcm9maWxlLCBzbyB0aGUgcHJveHlcbiAgICAvLyBvYmogZG9lc24ndCBidWcgb3V0LlxuICAgIGxldCBmaXhlZFJlbGF5cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocmVsYXlzKSk7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBsZXQgcHJvZmlsZSA9IHByb2ZpbGVzW3Byb2ZpbGVJbmRleF07XG4gICAgcHJvZmlsZS5yZWxheXMgPSBmaXhlZFJlbGF5cztcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IHByb2ZpbGVzIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0KGl0ZW0pIHtcbiAgICByZXR1cm4gKGF3YWl0IHN0b3JhZ2UuZ2V0KGl0ZW0pKVtpdGVtXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBlcm1pc3Npb25zKGluZGV4ID0gbnVsbCkge1xuICAgIGlmIChpbmRleCA9PSBudWxsKSB7XG4gICAgICAgIGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgfVxuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZ2V0UHJvZmlsZShpbmRleCk7XG4gICAgbGV0IGhvc3RzID0gYXdhaXQgcHJvZmlsZS5ob3N0cztcbiAgICByZXR1cm4gaG9zdHM7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQZXJtaXNzaW9uKGhvc3QsIGFjdGlvbikge1xuICAgIGxldCBpbmRleCA9IGF3YWl0IGdldFByb2ZpbGVJbmRleCgpO1xuICAgIGxldCBwcm9maWxlID0gYXdhaXQgZ2V0UHJvZmlsZShpbmRleCk7XG4gICAgcmV0dXJuIHByb2ZpbGUuaG9zdHM/Lltob3N0XT8uW2FjdGlvbl0gfHwgJ2Fzayc7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRQZXJtaXNzaW9uKGhvc3QsIGFjdGlvbiwgcGVybSwgaW5kZXggPSBudWxsKSB7XG4gICAgbGV0IHByb2ZpbGVzID0gYXdhaXQgZ2V0UHJvZmlsZXMoKTtcbiAgICBpZiAoIWluZGV4KSB7XG4gICAgICAgIGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgfVxuICAgIGxldCBwcm9maWxlID0gcHJvZmlsZXNbaW5kZXhdO1xuICAgIGxldCBuZXdQZXJtcyA9IHByb2ZpbGUuaG9zdHNbaG9zdF0gfHwge307XG4gICAgbmV3UGVybXMgPSB7IC4uLm5ld1Blcm1zLCBbYWN0aW9uXTogcGVybSB9O1xuICAgIHByb2ZpbGUuaG9zdHNbaG9zdF0gPSBuZXdQZXJtcztcbiAgICBwcm9maWxlc1tpbmRleF0gPSBwcm9maWxlO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodW1hblBlcm1pc3Npb24ocCkge1xuICAgIC8vIEhhbmRsZSBzcGVjaWFsIGNhc2Ugd2hlcmUgZXZlbnQgc2lnbmluZyBpbmNsdWRlcyBhIGtpbmQgbnVtYmVyXG4gICAgaWYgKHAuc3RhcnRzV2l0aCgnc2lnbkV2ZW50OicpKSB7XG4gICAgICAgIGxldCBbZSwgbl0gPSBwLnNwbGl0KCc6Jyk7XG4gICAgICAgIG4gPSBwYXJzZUludChuKTtcbiAgICAgICAgbGV0IG5uYW1lID0gS0lORFMuZmluZChrID0+IGtbMF0gPT09IG4pPy5bMV0gfHwgYFVua25vd24gKEtpbmQgJHtufSlgO1xuICAgICAgICByZXR1cm4gYFNpZ24gZXZlbnQ6ICR7bm5hbWV9YDtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHApIHtcbiAgICAgICAgY2FzZSAnZ2V0UHViS2V5JzpcbiAgICAgICAgICAgIHJldHVybiAnUmVhZCBwdWJsaWMga2V5JztcbiAgICAgICAgY2FzZSAnc2lnbkV2ZW50JzpcbiAgICAgICAgICAgIHJldHVybiAnU2lnbiBldmVudCc7XG4gICAgICAgIGNhc2UgJ2dldFJlbGF5cyc6XG4gICAgICAgICAgICByZXR1cm4gJ1JlYWQgcmVsYXkgbGlzdCc7XG4gICAgICAgIGNhc2UgJ25pcDA0LmVuY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdFbmNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTA0KSc7XG4gICAgICAgIGNhc2UgJ25pcDA0LmRlY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdEZWNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTA0KSc7XG4gICAgICAgIGNhc2UgJ25pcDQ0LmVuY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdFbmNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTQ0KSc7XG4gICAgICAgIGNhc2UgJ25pcDQ0LmRlY3J5cHQnOlxuICAgICAgICAgICAgcmV0dXJuICdEZWNyeXB0IHByaXZhdGUgbWVzc2FnZSAoTklQLTQ0KSc7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJ1Vua25vd24nO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlS2V5KGtleSkge1xuICAgIGNvbnN0IGhleE1hdGNoID0gL15bXFxkYS1mXXs2NH0kL2kudGVzdChrZXkpO1xuICAgIGNvbnN0IGIzMk1hdGNoID0gL15uc2VjMVtxcHpyeTl4OGdmMnR2ZHcwczNqbjU0a2hjZTZtdWE3bF17NTh9JC8udGVzdChrZXkpO1xuXG4gICAgcmV0dXJuIGhleE1hdGNoIHx8IGIzMk1hdGNoIHx8IGlzTmNyeXB0c2VjKGtleSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05jcnlwdHNlYyhrZXkpIHtcbiAgICByZXR1cm4gL15uY3J5cHRzZWMxW3FwenJ5OXg4Z2YydHZkdzBzM2puNTRraGNlNm11YTdsXSskLy50ZXN0KGtleSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZWF0dXJlKG5hbWUpIHtcbiAgICBsZXQgZm5hbWUgPSBgZmVhdHVyZToke25hbWV9YDtcbiAgICBsZXQgZiA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IFtmbmFtZV06IGZhbHNlIH0pO1xuICAgIHJldHVybiBmW2ZuYW1lXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbGF5UmVtaW5kZXIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgbGV0IHByb2ZpbGUgPSBhd2FpdCBnZXRQcm9maWxlKGluZGV4KTtcbiAgICByZXR1cm4gcHJvZmlsZS5yZWxheVJlbWluZGVyO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdG9nZ2xlUmVsYXlSZW1pbmRlcigpIHtcbiAgICBsZXQgaW5kZXggPSBhd2FpdCBnZXRQcm9maWxlSW5kZXgoKTtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIHByb2ZpbGVzW2luZGV4XS5yZWxheVJlbWluZGVyID0gZmFsc2U7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBwcm9maWxlcyB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE5wdWIoKSB7XG4gICAgbGV0IGluZGV4ID0gYXdhaXQgZ2V0UHJvZmlsZUluZGV4KCk7XG4gICAgcmV0dXJuIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAga2luZDogJ2dldE5wdWInLFxuICAgICAgICBwYXlsb2FkOiBpbmRleCxcbiAgICB9KTtcbn1cblxuLy8gLS0tIE1hc3RlciBwYXNzd29yZCBlbmNyeXB0aW9uIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgbWFzdGVyIHBhc3N3b3JkIGVuY3J5cHRpb24gaXMgYWN0aXZlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNFbmNyeXB0ZWQoKSB7XG4gICAgbGV0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSB9KTtcbiAgICByZXR1cm4gZGF0YS5pc0VuY3J5cHRlZDtcbn1cblxuLyoqXG4gKiBTdG9yZSB0aGUgcGFzc3dvcmQgdmVyaWZpY2F0aW9uIGhhc2ggKG5ldmVyIHRoZSBwYXNzd29yZCBpdHNlbGYpLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UGFzc3dvcmRIYXNoKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgeyBoYXNoLCBzYWx0IH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcGFzc3dvcmRIYXNoOiBoYXNoLFxuICAgICAgICBwYXNzd29yZFNhbHQ6IHNhbHQsXG4gICAgICAgIGlzRW5jcnlwdGVkOiB0cnVlLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmeSBhIHBhc3N3b3JkIGFnYWluc3QgdGhlIHN0b3JlZCBoYXNoLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tQYXNzd29yZChwYXNzd29yZCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7XG4gICAgICAgIHBhc3N3b3JkSGFzaDogbnVsbCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBudWxsLFxuICAgIH0pO1xuICAgIGlmICghZGF0YS5wYXNzd29yZEhhc2ggfHwgIWRhdGEucGFzc3dvcmRTYWx0KSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHZlcmlmeVBhc3N3b3JkKHBhc3N3b3JkLCBkYXRhLnBhc3N3b3JkSGFzaCwgZGF0YS5wYXNzd29yZFNhbHQpO1xufVxuXG4vKipcbiAqIFJlbW92ZSBtYXN0ZXIgcGFzc3dvcmQgcHJvdGVjdGlvbiBcdTIwMTQgY2xlYXJzIGhhc2ggYW5kIGRlY3J5cHRzIGFsbCBrZXlzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlUGFzc3dvcmRQcm90ZWN0aW9uKHBhc3N3b3JkKSB7XG4gICAgY29uc3QgdmFsaWQgPSBhd2FpdCBjaGVja1Bhc3N3b3JkKHBhc3N3b3JkKTtcbiAgICBpZiAoIXZhbGlkKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcGFzc3dvcmQnKTtcblxuICAgIGxldCBwcm9maWxlcyA9IGF3YWl0IGdldFByb2ZpbGVzKCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9maWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJvZmlsZXNbaV0udHlwZSA9PT0gJ2J1bmtlcicpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoaXNFbmNyeXB0ZWRCbG9iKHByb2ZpbGVzW2ldLnByaXZLZXkpKSB7XG4gICAgICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZGVjcnlwdChwcm9maWxlc1tpXS5wcml2S2V5LCBwYXNzd29yZCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoe1xuICAgICAgICBwcm9maWxlcyxcbiAgICAgICAgaXNFbmNyeXB0ZWQ6IGZhbHNlLFxuICAgICAgICBwYXNzd29yZEhhc2g6IG51bGwsXG4gICAgICAgIHBhc3N3b3JkU2FsdDogbnVsbCxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBFbmNyeXB0IGFsbCBwcm9maWxlIHByaXZhdGUga2V5cyB3aXRoIGEgbWFzdGVyIHBhc3N3b3JkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdEFsbEtleXMocGFzc3dvcmQpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFpc0VuY3J5cHRlZEJsb2IocHJvZmlsZXNbaV0ucHJpdktleSkpIHtcbiAgICAgICAgICAgIHByb2ZpbGVzW2ldLnByaXZLZXkgPSBhd2FpdCBlbmNyeXB0KHByb2ZpbGVzW2ldLnByaXZLZXksIHBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBzZXRQYXNzd29yZEhhc2gocGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgcHJvZmlsZXMgfSk7XG59XG5cbi8qKlxuICogUmUtZW5jcnlwdCBhbGwga2V5cyB3aXRoIGEgbmV3IHBhc3N3b3JkIChyZXF1aXJlcyB0aGUgb2xkIHBhc3N3b3JkKS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoYW5nZVBhc3N3b3JkRm9yS2V5cyhvbGRQYXNzd29yZCwgbmV3UGFzc3dvcmQpIHtcbiAgICBsZXQgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByb2ZpbGVzW2ldLnR5cGUgPT09ICdidW5rZXInKSBjb250aW51ZTtcbiAgICAgICAgbGV0IGhleCA9IHByb2ZpbGVzW2ldLnByaXZLZXk7XG4gICAgICAgIGlmIChpc0VuY3J5cHRlZEJsb2IoaGV4KSkge1xuICAgICAgICAgICAgaGV4ID0gYXdhaXQgZGVjcnlwdChoZXgsIG9sZFBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgICAgICBwcm9maWxlc1tpXS5wcml2S2V5ID0gYXdhaXQgZW5jcnlwdChoZXgsIG5ld1Bhc3N3b3JkKTtcbiAgICB9XG4gICAgY29uc3QgeyBoYXNoLCBzYWx0IH0gPSBhd2FpdCBoYXNoUGFzc3dvcmQobmV3UGFzc3dvcmQpO1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHtcbiAgICAgICAgcHJvZmlsZXMsXG4gICAgICAgIHBhc3N3b3JkSGFzaDogaGFzaCxcbiAgICAgICAgcGFzc3dvcmRTYWx0OiBzYWx0LFxuICAgICAgICBpc0VuY3J5cHRlZDogdHJ1ZSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgc2luZ2xlIHByb2ZpbGUncyBwcml2YXRlIGtleSwgcmV0dXJuaW5nIHRoZSBoZXggc3RyaW5nLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0RGVjcnlwdGVkUHJpdktleShwcm9maWxlLCBwYXNzd29yZCkge1xuICAgIGlmIChwcm9maWxlLnR5cGUgPT09ICdidW5rZXInKSByZXR1cm4gJyc7XG4gICAgaWYgKGlzRW5jcnlwdGVkQmxvYihwcm9maWxlLnByaXZLZXkpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0KHByb2ZpbGUucHJpdktleSwgcGFzc3dvcmQpO1xuICAgIH1cbiAgICByZXR1cm4gcHJvZmlsZS5wcml2S2V5O1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYSBzdG9yZWQgdmFsdWUgbG9va3MgbGlrZSBhbiBlbmNyeXB0ZWQgYmxvYi5cbiAqIEVuY3J5cHRlZCBibG9icyBhcmUgSlNPTiBzdHJpbmdzIGNvbnRhaW5pbmcge3NhbHQsIGl2LCBjaXBoZXJ0ZXh0fS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRW5jcnlwdGVkQmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgIHJldHVybiAhIShwYXJzZWQuc2FsdCAmJiBwYXJzZWQuaXYgJiYgcGFyc2VkLmNpcGhlcnRleHQpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIiwgImltcG9ydCBBbHBpbmUgZnJvbSAnQGFscGluZWpzL2NzcCc7XG5pbXBvcnQgeyBkZWxldGVEQiB9IGZyb20gJ2lkYic7XG5pbXBvcnQgeyBkb3dubG9hZEFsbENvbnRlbnRzLCBnZXRIb3N0cywgc29ydEJ5SW5kZXggfSBmcm9tICcuLi91dGlsaXRpZXMvZGInO1xuaW1wb3J0IHsgZ2V0UHJvZmlsZXMsIEtJTkRTIH0gZnJvbSAnLi4vdXRpbGl0aWVzL3V0aWxzJztcbmltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3QgVE9NT1JST1cgPSBuZXcgRGF0ZSgpO1xuVE9NT1JST1cuc2V0RGF0ZShUT01PUlJPVy5nZXREYXRlKCkgKyAxKTtcblxuQWxwaW5lLmRhdGEoJ2V2ZW50TG9nJywgKCkgPT4gKHtcbiAgICBraW5kczogS0lORFMsXG4gICAgZXZlbnRzOiBbXSxcbiAgICB2aWV3OiAnY3JlYXRlZF9hdCcsXG4gICAgbWF4OiAxMDAsXG4gICAgc29ydDogJ2FzYycsXG4gICAgYWxsSG9zdHM6IFtdLFxuICAgIGhvc3Q6ICcnLFxuICAgIGFsbFByb2ZpbGVzOiBbXSxcbiAgICBwcm9maWxlOiAnJyxcbiAgICBwdWJrZXk6ICcnLFxuICAgIHNlbGVjdGVkOiBudWxsLFxuICAgIGNvcGllZDogZmFsc2UsXG5cbiAgICAvLyBkYXRlIHZpZXdcbiAgICBmcm9tQ3JlYXRlZEF0OiAnMjAwOC0xMC0zMScsXG4gICAgdG9DcmVhdGVkQXQ6IFRPTU9SUk9XLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSxcblxuICAgIC8vIGtpbmQgdmlld1xuICAgIHF1aWNrS2luZDogJycsXG4gICAgZnJvbUtpbmQ6IDAsXG4gICAgdG9LaW5kOiA1MDAwMCxcblxuICAgIGFzeW5jIGluaXQoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMucmVsb2FkKCk7XG4gICAgfSxcblxuICAgIGFzeW5jIHJlbG9hZCgpIHtcbiAgICAgICAgbGV0IGV2ZW50cyA9IGF3YWl0IHNvcnRCeUluZGV4KFxuICAgICAgICAgICAgdGhpcy52aWV3LFxuICAgICAgICAgICAgdGhpcy5rZXlSYW5nZSxcbiAgICAgICAgICAgIHRoaXMuc29ydCA9PT0gJ2FzYycsXG4gICAgICAgICAgICB0aGlzLm1heFxuICAgICAgICApO1xuICAgICAgICB0aGlzLmV2ZW50cyA9IGV2ZW50cy5tYXAoZSA9PiAoeyAuLi5lLCBjb3BpZWQ6IGZhbHNlIH0pKTtcbiAgICAgICAgZ2V0SG9zdHMoKS50aGVuKGhvc3RzID0+ICh0aGlzLmFsbEhvc3RzID0gaG9zdHMpKTtcbiAgICAgICAgY29uc3QgcHJvZmlsZXMgPSBhd2FpdCBnZXRQcm9maWxlcygpO1xuICAgICAgICB0aGlzLmFsbFByb2ZpbGVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICBwcm9maWxlcy5tYXAoYXN5bmMgKHByb2ZpbGUsIGluZGV4KSA9PiAoe1xuICAgICAgICAgICAgICAgIG5hbWU6IHByb2ZpbGUubmFtZSxcbiAgICAgICAgICAgICAgICBwdWJrZXk6IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAga2luZDogJ2dldE5wdWInLFxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkOiBpbmRleCxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIH0pKVxuICAgICAgICApO1xuICAgIH0sXG5cbiAgICBhc3luYyBzYXZlQWxsKCkge1xuICAgICAgICBjb25zdCBmaWxlID0gYXdhaXQgZG93bmxvYWRBbGxDb250ZW50cygpO1xuICAgICAgICBhcGkudGFicy5jcmVhdGUoe1xuICAgICAgICAgICAgdXJsOiBVUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpLFxuICAgICAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZGVsZXRlQWxsKCkge1xuICAgICAgICBpZiAoY29uZmlybSgnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSBBTEwgZXZlbnRzPycpKSB7XG4gICAgICAgICAgICBhd2FpdCBkZWxldGVEQignZXZlbnRzJyk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJlbG9hZCgpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHF1aWNrS2luZFNlbGVjdCgpIHtcbiAgICAgICAgaWYgKHRoaXMucXVpY2tLaW5kID09PSAnJykgcmV0dXJuO1xuICAgICAgICBjb25zdCBpID0gcGFyc2VJbnQodGhpcy5xdWlja0tpbmQpO1xuICAgICAgICB0aGlzLmZyb21LaW5kID0gaTtcbiAgICAgICAgdGhpcy50b0tpbmQgPSBpO1xuICAgICAgICB0aGlzLnJlbG9hZCgpO1xuICAgIH0sXG5cbiAgICBwa0Zyb21Qcm9maWxlKCkge1xuICAgICAgICB0aGlzLnB1YmtleSA9IHRoaXMuYWxsUHJvZmlsZXMuZmluZChcbiAgICAgICAgICAgICh7IG5hbWUgfSkgPT4gbmFtZSA9PT0gdGhpcy5wcm9maWxlXG4gICAgICAgICkucHVia2V5O1xuICAgICAgICB0aGlzLnJlbG9hZCgpO1xuICAgIH0sXG5cbiAgICBoaWdobGlnaHQoZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGV2ZW50LCBudWxsLCAyKTtcbiAgICB9LFxuXG4gICAgZm9ybWF0RGF0ZShlcG9jaFNlY29uZHMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGVwb2NoU2Vjb25kcyAqIDEwMDApLnRvVVRDU3RyaW5nKCk7XG4gICAgfSxcblxuICAgIGZvcm1hdEtpbmQoa2luZCkge1xuICAgICAgICBjb25zdCBrID0gS0lORFMuZmluZCgoW2tOdW0sIF9dKSA9PiBrTnVtID09PSBraW5kKTtcbiAgICAgICAgcmV0dXJuIGsgPyBgJHtrWzFdfSAoJHtraW5kfSlgIDogYFVua25vd24gKCR7a2luZH0pYDtcbiAgICB9LFxuXG4gICAgYXN5bmMgY29weUV2ZW50KGluZGV4KSB7XG4gICAgICAgIGxldCBldmVudCA9IEpTT04uc3RyaW5naWZ5KHRoaXMuZXZlbnRzW2luZGV4XSk7XG4gICAgICAgIHRoaXMuY29waWVkID0gdHJ1ZTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiAodGhpcy5jb3BpZWQgPSBmYWxzZSksIDEwMDApO1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChldmVudCk7XG4gICAgfSxcblxuICAgIC8vIFByb3BlcnRpZXNcblxuICAgIGdldCBmcm9tVGltZSgpIHtcbiAgICAgICAgbGV0IGR0ID0gbmV3IERhdGUodGhpcy5mcm9tQ3JlYXRlZEF0KTtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoZHQuZ2V0VGltZSgpIC8gMTAwMCk7XG4gICAgfSxcblxuICAgIGdldCB0b1RpbWUoKSB7XG4gICAgICAgIGxldCBkdCA9IG5ldyBEYXRlKHRoaXMudG9DcmVhdGVkQXQpO1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihkdC5nZXRUaW1lKCkgLyAxMDAwKTtcbiAgICB9LFxuXG4gICAgZ2V0IHByb2ZpbGVOYW1lcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsUHJvZmlsZXMubWFwKHAgPT4gcC5uYW1lKTtcbiAgICB9LFxuXG4gICAgZ2V0IGtleVJhbmdlKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMudmlldykge1xuICAgICAgICAgICAgY2FzZSAnY3JlYXRlZF9hdCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIElEQktleVJhbmdlLmJvdW5kKHRoaXMuZnJvbVRpbWUsIHRoaXMudG9UaW1lKTtcblxuICAgICAgICAgICAgY2FzZSAna2luZCc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIElEQktleVJhbmdlLmJvdW5kKHRoaXMuZnJvbUtpbmQsIHRoaXMudG9LaW5kKTtcblxuICAgICAgICAgICAgY2FzZSAnaG9zdCc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaG9zdC5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiBJREJLZXlSYW5nZS5vbmx5KHRoaXMuaG9zdCk7XG5cbiAgICAgICAgICAgIGNhc2UgJ3B1YmtleSc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHVia2V5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIElEQktleVJhbmdlLm9ubHkodGhpcy5wdWJrZXkpO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSxcbn0pKTtcblxuQWxwaW5lLnN0YXJ0KCk7XG5cbi8vIENsb3NlIGJ1dHRvbiBoYW5kbGVyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIHdpbmRvdy5jbG9zZSgpO1xuICAgIGNocm9tZS50YWJzPy5nZXRDdXJyZW50Py4odCA9PiBjaHJvbWUudGFicy5yZW1vdmUodC5pZCkpO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQUNBLE1BQUksZUFBZTtBQUNuQixNQUFJLFdBQVc7QUFDZixNQUFJLFFBQVEsQ0FBQztBQUNiLE1BQUksbUJBQW1CO0FBQ3ZCLE1BQUksb0JBQW9CO0FBQ3hCLFdBQVMsVUFBVSxVQUFVO0FBQzNCLGFBQVMsUUFBUTtBQUFBLEVBQ25CO0FBQ0EsV0FBUyxtQkFBbUI7QUFDMUIsd0JBQW9CO0FBQUEsRUFDdEI7QUFDQSxXQUFTLG9CQUFvQjtBQUMzQix3QkFBb0I7QUFDcEIsZUFBVztBQUFBLEVBQ2I7QUFDQSxXQUFTLFNBQVMsS0FBSztBQUNyQixRQUFJLENBQUMsTUFBTSxTQUFTLEdBQUc7QUFDckIsWUFBTSxLQUFLLEdBQUc7QUFDaEIsZUFBVztBQUFBLEVBQ2I7QUFDQSxXQUFTLFdBQVcsS0FBSztBQUN2QixRQUFJLFFBQVEsTUFBTSxRQUFRLEdBQUc7QUFDN0IsUUFBSSxVQUFVLE1BQU0sUUFBUTtBQUMxQixZQUFNLE9BQU8sT0FBTyxDQUFDO0FBQUEsRUFDekI7QUFDQSxXQUFTLGFBQWE7QUFDcEIsUUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjO0FBQzlCLFVBQUk7QUFDRjtBQUNGLHFCQUFlO0FBQ2YscUJBQWUsU0FBUztBQUFBLElBQzFCO0FBQUEsRUFDRjtBQUNBLFdBQVMsWUFBWTtBQUNuQixtQkFBZTtBQUNmLGVBQVc7QUFDWCxhQUFTLElBQUksR0FBRyxJQUFJLE1B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
