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
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has2.call(rawTarget, key)) {
      return wrap(target.get(key));
    } else if (has2.call(rawTarget, rawKey)) {
      return wrap(target.get(rawKey));
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
      const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
      !isReadonly && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
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
      const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
      !isReadonly && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
      return {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
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

  // src/utilities/vault-store.js
  var storage = api.storage.local;
  var STORAGE_KEY = "vaultDocs";
  async function getDocs() {
    const data2 = await storage.get({ [STORAGE_KEY]: {} });
    return data2[STORAGE_KEY] || {};
  }
  async function setDocs(docs) {
    await storage.set({ [STORAGE_KEY]: docs });
  }
  async function getVaultIndex() {
    return getDocs();
  }
  async function getDocument(path) {
    const docs = await getDocs();
    return docs[path] || null;
  }
  async function saveDocumentLocal(path, content, syncStatus, eventId = null, relayCreatedAt = null) {
    const docs = await getDocs();
    docs[path] = {
      path,
      content,
      updatedAt: Math.floor(Date.now() / 1e3),
      syncStatus,
      eventId,
      relayCreatedAt
    };
    await setDocs(docs);
    return docs[path];
  }
  async function deleteDocumentLocal(path) {
    const docs = await getDocs();
    delete docs[path];
    await setDocs(docs);
  }
  async function listDocuments() {
    const docs = await getDocs();
    return Object.values(docs).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async function updateSyncStatus(path, status, eventId = null, relayCreatedAt = null) {
    const docs = await getDocs();
    if (!docs[path]) return null;
    docs[path].syncStatus = status;
    if (eventId !== null) docs[path].eventId = eventId;
    if (relayCreatedAt !== null) docs[path].relayCreatedAt = relayCreatedAt;
    await setDocs(docs);
    return docs[path];
  }

  // src/vault/vault.js
  module_default.data("vault", () => ({
    // State
    documents: [],
    searchQuery: "",
    selectedPath: null,
    editorTitle: "",
    editorContent: "",
    pristineTitle: "",
    pristineContent: "",
    globalSyncStatus: "idle",
    // idle | syncing | error
    syncError: "",
    saving: false,
    isNew: false,
    toast: "",
    relayInfo: { read: [], write: [] },
    async init() {
      const relays = await api.runtime.sendMessage({ kind: "vault.getRelays" });
      this.relayInfo = relays || { read: [], write: [] };
      this.documents = await listDocuments();
      if (this.hasRelays) {
        await this.syncAll();
      }
    },
    // --- CRUD ---
    newDocument() {
      this.isNew = true;
      this.selectedPath = null;
      this.editorTitle = "";
      this.editorContent = "";
      this.pristineTitle = "";
      this.pristineContent = "";
    },
    async selectDocument(path) {
      const doc = await getDocument(path);
      if (!doc) return;
      this.isNew = false;
      this.selectedPath = path;
      this.editorTitle = doc.path;
      this.editorContent = doc.content;
      this.pristineTitle = doc.path;
      this.pristineContent = doc.content;
    },
    async saveDocument() {
      const title = this.editorTitle.trim();
      if (!title) return;
      this.saving = true;
      try {
        const result = await api.runtime.sendMessage({
          kind: "vault.publish",
          payload: { path: title, content: this.editorContent }
        });
        if (result.success) {
          if (this.selectedPath && this.selectedPath !== title) {
            await deleteDocumentLocal(this.selectedPath);
          }
          await saveDocumentLocal(
            title,
            this.editorContent,
            "synced",
            result.eventId,
            result.createdAt
          );
          this.selectedPath = title;
          this.isNew = false;
          this.pristineTitle = title;
          this.pristineContent = this.editorContent;
          this.documents = await listDocuments();
          this.showToast("Saved");
        } else {
          await saveDocumentLocal(title, this.editorContent, "local-only");
          if (this.selectedPath && this.selectedPath !== title) {
            await deleteDocumentLocal(this.selectedPath);
          }
          this.selectedPath = title;
          this.isNew = false;
          this.pristineTitle = title;
          this.pristineContent = this.editorContent;
          this.documents = await listDocuments();
          this.showToast("Saved locally (relay error: " + (result.error || "unknown") + ")");
        }
      } catch (e) {
        await saveDocumentLocal(this.editorTitle.trim(), this.editorContent, "local-only");
        this.selectedPath = this.editorTitle.trim();
        this.isNew = false;
        this.pristineTitle = this.editorTitle;
        this.pristineContent = this.editorContent;
        this.documents = await listDocuments();
        this.showToast("Saved locally (offline)");
      }
      this.saving = false;
    },
    async deleteDocument() {
      if (!this.selectedPath) return;
      if (!confirm(`Delete "${this.selectedPath}"?`)) return;
      const doc = await getDocument(this.selectedPath);
      if (doc?.eventId) {
        try {
          await api.runtime.sendMessage({
            kind: "vault.delete",
            payload: { path: this.selectedPath, eventId: doc.eventId }
          });
        } catch (_) {
        }
      }
      await deleteDocumentLocal(this.selectedPath);
      this.selectedPath = null;
      this.isNew = false;
      this.editorTitle = "";
      this.editorContent = "";
      this.pristineTitle = "";
      this.pristineContent = "";
      this.documents = await listDocuments();
      this.showToast("Deleted");
    },
    // --- Sync ---
    async syncAll() {
      this.globalSyncStatus = "syncing";
      this.syncError = "";
      try {
        const result = await api.runtime.sendMessage({ kind: "vault.fetch" });
        if (!result.success) {
          this.globalSyncStatus = "error";
          this.syncError = result.error || "Sync failed";
          return;
        }
        const localDocs = await getVaultIndex();
        for (const remote of result.documents) {
          const local = localDocs[remote.path];
          if (!local) {
            await saveDocumentLocal(
              remote.path,
              remote.content,
              "synced",
              remote.eventId,
              remote.createdAt
            );
          } else if (local.syncStatus === "local-only") {
            if (local.content !== remote.content) {
              await updateSyncStatus(remote.path, "conflict", remote.eventId, remote.createdAt);
            }
          } else if (!local.relayCreatedAt || remote.createdAt > local.relayCreatedAt) {
            await saveDocumentLocal(
              remote.path,
              remote.content,
              "synced",
              remote.eventId,
              remote.createdAt
            );
            if (this.selectedPath === remote.path) {
              this.editorContent = remote.content;
              this.pristineContent = remote.content;
            }
          }
        }
        this.documents = await listDocuments();
        this.globalSyncStatus = "idle";
      } catch (e) {
        this.globalSyncStatus = "error";
        this.syncError = e.message || "Sync failed";
      }
    },
    // --- Computed ---
    get filteredDocuments() {
      if (!this.searchQuery) return this.documents;
      const q = this.searchQuery.toLowerCase();
      return this.documents.filter((d) => d.path.toLowerCase().includes(q));
    },
    get isDirty() {
      return this.editorContent !== this.pristineContent || this.editorTitle !== this.pristineTitle;
    },
    get hasRelays() {
      return this.relayInfo.read.length > 0 || this.relayInfo.write.length > 0;
    },
    // --- Helpers ---
    showToast(msg) {
      this.toast = msg;
      setTimeout(() => {
        this.toast = "";
      }, 2e3);
    }
  }));
  module_default.start();
  document.getElementById("close-btn")?.addEventListener("click", () => {
    window.close();
    chrome.tabs?.getCurrent?.((t) => chrome.tabs.remove(t.id));
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL0BhbHBpbmVqcy9jc3AvZGlzdC9tb2R1bGUuZXNtLmpzIiwgIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbC5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3ZhdWx0LXN0b3JlLmpzIiwgIi4uLy4uLy4uL3NyYy92YXVsdC92YXVsdC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3NjaGVkdWxlci5qc1xudmFyIGZsdXNoUGVuZGluZyA9IGZhbHNlO1xudmFyIGZsdXNoaW5nID0gZmFsc2U7XG52YXIgcXVldWUgPSBbXTtcbnZhciBsYXN0Rmx1c2hlZEluZGV4ID0gLTE7XG52YXIgdHJhbnNhY3Rpb25BY3RpdmUgPSBmYWxzZTtcbmZ1bmN0aW9uIHNjaGVkdWxlcihjYWxsYmFjaykge1xuICBxdWV1ZUpvYihjYWxsYmFjayk7XG59XG5mdW5jdGlvbiBzdGFydFRyYW5zYWN0aW9uKCkge1xuICB0cmFuc2FjdGlvbkFjdGl2ZSA9IHRydWU7XG59XG5mdW5jdGlvbiBjb21taXRUcmFuc2FjdGlvbigpIHtcbiAgdHJhbnNhY3Rpb25BY3RpdmUgPSBmYWxzZTtcbiAgcXVldWVGbHVzaCgpO1xufVxuZnVuY3Rpb24gcXVldWVKb2Ioam9iKSB7XG4gIGlmICghcXVldWUuaW5jbHVkZXMoam9iKSlcbiAgICBxdWV1ZS5wdXNoKGpvYik7XG4gIHF1ZXVlRmx1c2goKTtcbn1cbmZ1bmN0aW9uIGRlcXVldWVKb2Ioam9iKSB7XG4gIGxldCBpbmRleCA9IHF1ZXVlLmluZGV4T2Yoam9iKTtcbiAgaWYgKGluZGV4ICE9PSAtMSAmJiBpbmRleCA+IGxhc3RGbHVzaGVkSW5kZXgpXG4gICAgcXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbn1cbmZ1bmN0aW9uIHF1ZXVlRmx1c2goKSB7XG4gIGlmICghZmx1c2hpbmcgJiYgIWZsdXNoUGVuZGluZykge1xuICAgIGlmICh0cmFuc2FjdGlvbkFjdGl2ZSlcbiAgICAgIHJldHVybjtcbiAgICBmbHVzaFBlbmRpbmcgPSB0cnVlO1xuICAgIHF1ZXVlTWljcm90YXNrKGZsdXNoSm9icyk7XG4gIH1cbn1cbmZ1bmN0aW9uIGZsdXNoSm9icygpIHtcbiAgZmx1c2hQZW5kaW5nID0gZmFsc2U7XG4gIGZsdXNoaW5nID0gdHJ1ZTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgIHF1ZXVlW2ldKCk7XG4gICAgbGFzdEZsdXNoZWRJbmRleCA9IGk7XG4gIH1cbiAgcXVldWUubGVuZ3RoID0gMDtcbiAgbGFzdEZsdXNoZWRJbmRleCA9IC0xO1xuICBmbHVzaGluZyA9IGZhbHNlO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvcmVhY3Rpdml0eS5qc1xudmFyIHJlYWN0aXZlO1xudmFyIGVmZmVjdDtcbnZhciByZWxlYXNlO1xudmFyIHJhdztcbnZhciBzaG91bGRTY2hlZHVsZSA9IHRydWU7XG5mdW5jdGlvbiBkaXNhYmxlRWZmZWN0U2NoZWR1bGluZyhjYWxsYmFjaykge1xuICBzaG91bGRTY2hlZHVsZSA9IGZhbHNlO1xuICBjYWxsYmFjaygpO1xuICBzaG91bGRTY2hlZHVsZSA9IHRydWU7XG59XG5mdW5jdGlvbiBzZXRSZWFjdGl2aXR5RW5naW5lKGVuZ2luZSkge1xuICByZWFjdGl2ZSA9IGVuZ2luZS5yZWFjdGl2ZTtcbiAgcmVsZWFzZSA9IGVuZ2luZS5yZWxlYXNlO1xuICBlZmZlY3QgPSAoY2FsbGJhY2spID0+IGVuZ2luZS5lZmZlY3QoY2FsbGJhY2ssIHsgc2NoZWR1bGVyOiAodGFzaykgPT4ge1xuICAgIGlmIChzaG91bGRTY2hlZHVsZSkge1xuICAgICAgc2NoZWR1bGVyKHRhc2spO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXNrKCk7XG4gICAgfVxuICB9IH0pO1xuICByYXcgPSBlbmdpbmUucmF3O1xufVxuZnVuY3Rpb24gb3ZlcnJpZGVFZmZlY3Qob3ZlcnJpZGUpIHtcbiAgZWZmZWN0ID0gb3ZlcnJpZGU7XG59XG5mdW5jdGlvbiBlbGVtZW50Qm91bmRFZmZlY3QoZWwpIHtcbiAgbGV0IGNsZWFudXAyID0gKCkgPT4ge1xuICB9O1xuICBsZXQgd3JhcHBlZEVmZmVjdCA9IChjYWxsYmFjaykgPT4ge1xuICAgIGxldCBlZmZlY3RSZWZlcmVuY2UgPSBlZmZlY3QoY2FsbGJhY2spO1xuICAgIGlmICghZWwuX3hfZWZmZWN0cykge1xuICAgICAgZWwuX3hfZWZmZWN0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gICAgICBlbC5feF9ydW5FZmZlY3RzID0gKCkgPT4ge1xuICAgICAgICBlbC5feF9lZmZlY3RzLmZvckVhY2goKGkpID0+IGkoKSk7XG4gICAgICB9O1xuICAgIH1cbiAgICBlbC5feF9lZmZlY3RzLmFkZChlZmZlY3RSZWZlcmVuY2UpO1xuICAgIGNsZWFudXAyID0gKCkgPT4ge1xuICAgICAgaWYgKGVmZmVjdFJlZmVyZW5jZSA9PT0gdm9pZCAwKVxuICAgICAgICByZXR1cm47XG4gICAgICBlbC5feF9lZmZlY3RzLmRlbGV0ZShlZmZlY3RSZWZlcmVuY2UpO1xuICAgICAgcmVsZWFzZShlZmZlY3RSZWZlcmVuY2UpO1xuICAgIH07XG4gICAgcmV0dXJuIGVmZmVjdFJlZmVyZW5jZTtcbiAgfTtcbiAgcmV0dXJuIFt3cmFwcGVkRWZmZWN0LCAoKSA9PiB7XG4gICAgY2xlYW51cDIoKTtcbiAgfV07XG59XG5mdW5jdGlvbiB3YXRjaChnZXR0ZXIsIGNhbGxiYWNrKSB7XG4gIGxldCBmaXJzdFRpbWUgPSB0cnVlO1xuICBsZXQgb2xkVmFsdWU7XG4gIGxldCBlZmZlY3RSZWZlcmVuY2UgPSBlZmZlY3QoKCkgPT4ge1xuICAgIGxldCB2YWx1ZSA9IGdldHRlcigpO1xuICAgIEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcbiAgICBpZiAoIWZpcnN0VGltZSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiB8fCB2YWx1ZSAhPT0gb2xkVmFsdWUpIHtcbiAgICAgICAgbGV0IHByZXZpb3VzVmFsdWUgPSBvbGRWYWx1ZTtcbiAgICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICAgIGNhbGxiYWNrKHZhbHVlLCBwcmV2aW91c1ZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIG9sZFZhbHVlID0gdmFsdWU7XG4gICAgZmlyc3RUaW1lID0gZmFsc2U7XG4gIH0pO1xuICByZXR1cm4gKCkgPT4gcmVsZWFzZShlZmZlY3RSZWZlcmVuY2UpO1xufVxuYXN5bmMgZnVuY3Rpb24gdHJhbnNhY3Rpb24oY2FsbGJhY2spIHtcbiAgc3RhcnRUcmFuc2FjdGlvbigpO1xuICB0cnkge1xuICAgIGF3YWl0IGNhbGxiYWNrKCk7XG4gICAgYXdhaXQgUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH0gZmluYWxseSB7XG4gICAgY29tbWl0VHJhbnNhY3Rpb24oKTtcbiAgfVxufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvbXV0YXRpb24uanNcbnZhciBvbkF0dHJpYnV0ZUFkZGVkcyA9IFtdO1xudmFyIG9uRWxSZW1vdmVkcyA9IFtdO1xudmFyIG9uRWxBZGRlZHMgPSBbXTtcbmZ1bmN0aW9uIG9uRWxBZGRlZChjYWxsYmFjaykge1xuICBvbkVsQWRkZWRzLnB1c2goY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gb25FbFJlbW92ZWQoZWwsIGNhbGxiYWNrKSB7XG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGlmICghZWwuX3hfY2xlYW51cHMpXG4gICAgICBlbC5feF9jbGVhbnVwcyA9IFtdO1xuICAgIGVsLl94X2NsZWFudXBzLnB1c2goY2FsbGJhY2spO1xuICB9IGVsc2Uge1xuICAgIGNhbGxiYWNrID0gZWw7XG4gICAgb25FbFJlbW92ZWRzLnB1c2goY2FsbGJhY2spO1xuICB9XG59XG5mdW5jdGlvbiBvbkF0dHJpYnV0ZXNBZGRlZChjYWxsYmFjaykge1xuICBvbkF0dHJpYnV0ZUFkZGVkcy5wdXNoKGNhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIG9uQXR0cmlidXRlUmVtb3ZlZChlbCwgbmFtZSwgY2FsbGJhY2spIHtcbiAgaWYgKCFlbC5feF9hdHRyaWJ1dGVDbGVhbnVwcylcbiAgICBlbC5feF9hdHRyaWJ1dGVDbGVhbnVwcyA9IHt9O1xuICBpZiAoIWVsLl94X2F0dHJpYnV0ZUNsZWFudXBzW25hbWVdKVxuICAgIGVsLl94X2F0dHJpYnV0ZUNsZWFudXBzW25hbWVdID0gW107XG4gIGVsLl94X2F0dHJpYnV0ZUNsZWFudXBzW25hbWVdLnB1c2goY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gY2xlYW51cEF0dHJpYnV0ZXMoZWwsIG5hbWVzKSB7XG4gIGlmICghZWwuX3hfYXR0cmlidXRlQ2xlYW51cHMpXG4gICAgcmV0dXJuO1xuICBPYmplY3QuZW50cmllcyhlbC5feF9hdHRyaWJ1dGVDbGVhbnVwcykuZm9yRWFjaCgoW25hbWUsIHZhbHVlXSkgPT4ge1xuICAgIGlmIChuYW1lcyA9PT0gdm9pZCAwIHx8IG5hbWVzLmluY2x1ZGVzKG5hbWUpKSB7XG4gICAgICB2YWx1ZS5mb3JFYWNoKChpKSA9PiBpKCkpO1xuICAgICAgZGVsZXRlIGVsLl94X2F0dHJpYnV0ZUNsZWFudXBzW25hbWVdO1xuICAgIH1cbiAgfSk7XG59XG5mdW5jdGlvbiBjbGVhbnVwRWxlbWVudChlbCkge1xuICBlbC5feF9lZmZlY3RzPy5mb3JFYWNoKGRlcXVldWVKb2IpO1xuICB3aGlsZSAoZWwuX3hfY2xlYW51cHM/Lmxlbmd0aClcbiAgICBlbC5feF9jbGVhbnVwcy5wb3AoKSgpO1xufVxudmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIob25NdXRhdGUpO1xudmFyIGN1cnJlbnRseU9ic2VydmluZyA9IGZhbHNlO1xuZnVuY3Rpb24gc3RhcnRPYnNlcnZpbmdNdXRhdGlvbnMoKSB7XG4gIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQsIHsgc3VidHJlZTogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBhdHRyaWJ1dGVzOiB0cnVlLCBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSB9KTtcbiAgY3VycmVudGx5T2JzZXJ2aW5nID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIHN0b3BPYnNlcnZpbmdNdXRhdGlvbnMoKSB7XG4gIGZsdXNoT2JzZXJ2ZXIoKTtcbiAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICBjdXJyZW50bHlPYnNlcnZpbmcgPSBmYWxzZTtcbn1cbnZhciBxdWV1ZWRNdXRhdGlvbnMgPSBbXTtcbmZ1bmN0aW9uIGZsdXNoT2JzZXJ2ZXIoKSB7XG4gIGxldCByZWNvcmRzID0gb2JzZXJ2ZXIudGFrZVJlY29yZHMoKTtcbiAgcXVldWVkTXV0YXRpb25zLnB1c2goKCkgPT4gcmVjb3Jkcy5sZW5ndGggPiAwICYmIG9uTXV0YXRlKHJlY29yZHMpKTtcbiAgbGV0IHF1ZXVlTGVuZ3RoV2hlblRyaWdnZXJlZCA9IHF1ZXVlZE11dGF0aW9ucy5sZW5ndGg7XG4gIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICBpZiAocXVldWVkTXV0YXRpb25zLmxlbmd0aCA9PT0gcXVldWVMZW5ndGhXaGVuVHJpZ2dlcmVkKSB7XG4gICAgICB3aGlsZSAocXVldWVkTXV0YXRpb25zLmxlbmd0aCA+IDApXG4gICAgICAgIHF1ZXVlZE11dGF0aW9ucy5zaGlmdCgpKCk7XG4gICAgfVxuICB9KTtcbn1cbmZ1bmN0aW9uIG11dGF0ZURvbShjYWxsYmFjaykge1xuICBpZiAoIWN1cnJlbnRseU9ic2VydmluZylcbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgc3RvcE9ic2VydmluZ011dGF0aW9ucygpO1xuICBsZXQgcmVzdWx0ID0gY2FsbGJhY2soKTtcbiAgc3RhcnRPYnNlcnZpbmdNdXRhdGlvbnMoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbnZhciBpc0NvbGxlY3RpbmcgPSBmYWxzZTtcbnZhciBkZWZlcnJlZE11dGF0aW9ucyA9IFtdO1xuZnVuY3Rpb24gZGVmZXJNdXRhdGlvbnMoKSB7XG4gIGlzQ29sbGVjdGluZyA9IHRydWU7XG59XG5mdW5jdGlvbiBmbHVzaEFuZFN0b3BEZWZlcnJpbmdNdXRhdGlvbnMoKSB7XG4gIGlzQ29sbGVjdGluZyA9IGZhbHNlO1xuICBvbk11dGF0ZShkZWZlcnJlZE11dGF0aW9ucyk7XG4gIGRlZmVycmVkTXV0YXRpb25zID0gW107XG59XG5mdW5jdGlvbiBvbk11dGF0ZShtdXRhdGlvbnMpIHtcbiAgaWYgKGlzQ29sbGVjdGluZykge1xuICAgIGRlZmVycmVkTXV0YXRpb25zID0gZGVmZXJyZWRNdXRhdGlvbnMuY29uY2F0KG11dGF0aW9ucyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCBhZGRlZE5vZGVzID0gW107XG4gIGxldCByZW1vdmVkTm9kZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICBsZXQgYWRkZWRBdHRyaWJ1dGVzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgbGV0IHJlbW92ZWRBdHRyaWJ1dGVzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBtdXRhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAobXV0YXRpb25zW2ldLnRhcmdldC5feF9pZ25vcmVNdXRhdGlvbk9ic2VydmVyKVxuICAgICAgY29udGludWU7XG4gICAgaWYgKG11dGF0aW9uc1tpXS50eXBlID09PSBcImNoaWxkTGlzdFwiKSB7XG4gICAgICBtdXRhdGlvbnNbaV0ucmVtb3ZlZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgIT09IDEpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBpZiAoIW5vZGUuX3hfbWFya2VyKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgcmVtb3ZlZE5vZGVzLmFkZChub2RlKTtcbiAgICAgIH0pO1xuICAgICAgbXV0YXRpb25zW2ldLmFkZGVkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSAhPT0gMSlcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmIChyZW1vdmVkTm9kZXMuaGFzKG5vZGUpKSB7XG4gICAgICAgICAgcmVtb3ZlZE5vZGVzLmRlbGV0ZShub2RlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUuX3hfbWFya2VyKVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgYWRkZWROb2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChtdXRhdGlvbnNbaV0udHlwZSA9PT0gXCJhdHRyaWJ1dGVzXCIpIHtcbiAgICAgIGxldCBlbCA9IG11dGF0aW9uc1tpXS50YXJnZXQ7XG4gICAgICBsZXQgbmFtZSA9IG11dGF0aW9uc1tpXS5hdHRyaWJ1dGVOYW1lO1xuICAgICAgbGV0IG9sZFZhbHVlID0gbXV0YXRpb25zW2ldLm9sZFZhbHVlO1xuICAgICAgbGV0IGFkZDIgPSAoKSA9PiB7XG4gICAgICAgIGlmICghYWRkZWRBdHRyaWJ1dGVzLmhhcyhlbCkpXG4gICAgICAgICAgYWRkZWRBdHRyaWJ1dGVzLnNldChlbCwgW10pO1xuICAgICAgICBhZGRlZEF0dHJpYnV0ZXMuZ2V0KGVsKS5wdXNoKHsgbmFtZSwgdmFsdWU6IGVsLmdldEF0dHJpYnV0ZShuYW1lKSB9KTtcbiAgICAgIH07XG4gICAgICBsZXQgcmVtb3ZlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXJlbW92ZWRBdHRyaWJ1dGVzLmhhcyhlbCkpXG4gICAgICAgICAgcmVtb3ZlZEF0dHJpYnV0ZXMuc2V0KGVsLCBbXSk7XG4gICAgICAgIHJlbW92ZWRBdHRyaWJ1dGVzLmdldChlbCkucHVzaChuYW1lKTtcbiAgICAgIH07XG4gICAgICBpZiAoZWwuaGFzQXR0cmlidXRlKG5hbWUpICYmIG9sZFZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIGFkZDIoKTtcbiAgICAgIH0gZWxzZSBpZiAoZWwuaGFzQXR0cmlidXRlKG5hbWUpKSB7XG4gICAgICAgIHJlbW92ZSgpO1xuICAgICAgICBhZGQyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmVtb3ZlZEF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cnMsIGVsKSA9PiB7XG4gICAgY2xlYW51cEF0dHJpYnV0ZXMoZWwsIGF0dHJzKTtcbiAgfSk7XG4gIGFkZGVkQXR0cmlidXRlcy5mb3JFYWNoKChhdHRycywgZWwpID0+IHtcbiAgICBvbkF0dHJpYnV0ZUFkZGVkcy5mb3JFYWNoKChpKSA9PiBpKGVsLCBhdHRycykpO1xuICB9KTtcbiAgZm9yIChsZXQgbm9kZSBvZiByZW1vdmVkTm9kZXMpIHtcbiAgICBpZiAoYWRkZWROb2Rlcy5zb21lKChpKSA9PiBpLmNvbnRhaW5zKG5vZGUpKSlcbiAgICAgIGNvbnRpbnVlO1xuICAgIG9uRWxSZW1vdmVkcy5mb3JFYWNoKChpKSA9PiBpKG5vZGUpKTtcbiAgfVxuICBmb3IgKGxldCBub2RlIG9mIGFkZGVkTm9kZXMpIHtcbiAgICBpZiAoIW5vZGUuaXNDb25uZWN0ZWQpXG4gICAgICBjb250aW51ZTtcbiAgICBvbkVsQWRkZWRzLmZvckVhY2goKGkpID0+IGkobm9kZSkpO1xuICB9XG4gIGFkZGVkTm9kZXMgPSBudWxsO1xuICByZW1vdmVkTm9kZXMgPSBudWxsO1xuICBhZGRlZEF0dHJpYnV0ZXMgPSBudWxsO1xuICByZW1vdmVkQXR0cmlidXRlcyA9IG51bGw7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9zY29wZS5qc1xuZnVuY3Rpb24gc2NvcGUobm9kZSkge1xuICByZXR1cm4gbWVyZ2VQcm94aWVzKGNsb3Nlc3REYXRhU3RhY2sobm9kZSkpO1xufVxuZnVuY3Rpb24gYWRkU2NvcGVUb05vZGUobm9kZSwgZGF0YTIsIHJlZmVyZW5jZU5vZGUpIHtcbiAgbm9kZS5feF9kYXRhU3RhY2sgPSBbZGF0YTIsIC4uLmNsb3Nlc3REYXRhU3RhY2socmVmZXJlbmNlTm9kZSB8fCBub2RlKV07XG4gIHJldHVybiAoKSA9PiB7XG4gICAgbm9kZS5feF9kYXRhU3RhY2sgPSBub2RlLl94X2RhdGFTdGFjay5maWx0ZXIoKGkpID0+IGkgIT09IGRhdGEyKTtcbiAgfTtcbn1cbmZ1bmN0aW9uIGNsb3Nlc3REYXRhU3RhY2sobm9kZSkge1xuICBpZiAobm9kZS5feF9kYXRhU3RhY2spXG4gICAgcmV0dXJuIG5vZGUuX3hfZGF0YVN0YWNrO1xuICBpZiAodHlwZW9mIFNoYWRvd1Jvb3QgPT09IFwiZnVuY3Rpb25cIiAmJiBub2RlIGluc3RhbmNlb2YgU2hhZG93Um9vdCkge1xuICAgIHJldHVybiBjbG9zZXN0RGF0YVN0YWNrKG5vZGUuaG9zdCk7XG4gIH1cbiAgaWYgKCFub2RlLnBhcmVudE5vZGUpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIGNsb3Nlc3REYXRhU3RhY2sobm9kZS5wYXJlbnROb2RlKTtcbn1cbmZ1bmN0aW9uIG1lcmdlUHJveGllcyhvYmplY3RzKSB7XG4gIHJldHVybiBuZXcgUHJveHkoeyBvYmplY3RzIH0sIG1lcmdlUHJveHlUcmFwKTtcbn1cbnZhciBtZXJnZVByb3h5VHJhcCA9IHtcbiAgb3duS2V5cyh7IG9iamVjdHMgfSkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKFxuICAgICAgbmV3IFNldChvYmplY3RzLmZsYXRNYXAoKGkpID0+IE9iamVjdC5rZXlzKGkpKSlcbiAgICApO1xuICB9LFxuICBoYXMoeyBvYmplY3RzIH0sIG5hbWUpIHtcbiAgICBpZiAobmFtZSA9PSBTeW1ib2wudW5zY29wYWJsZXMpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIG9iamVjdHMuc29tZShcbiAgICAgIChvYmopID0+IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIG5hbWUpIHx8IFJlZmxlY3QuaGFzKG9iaiwgbmFtZSlcbiAgICApO1xuICB9LFxuICBnZXQoeyBvYmplY3RzIH0sIG5hbWUsIHRoaXNQcm94eSkge1xuICAgIGlmIChuYW1lID09IFwidG9KU09OXCIpXG4gICAgICByZXR1cm4gY29sbGFwc2VQcm94aWVzO1xuICAgIHJldHVybiBSZWZsZWN0LmdldChcbiAgICAgIG9iamVjdHMuZmluZChcbiAgICAgICAgKG9iaikgPT4gUmVmbGVjdC5oYXMob2JqLCBuYW1lKVxuICAgICAgKSB8fCB7fSxcbiAgICAgIG5hbWUsXG4gICAgICB0aGlzUHJveHlcbiAgICApO1xuICB9LFxuICBzZXQoeyBvYmplY3RzIH0sIG5hbWUsIHZhbHVlLCB0aGlzUHJveHkpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBvYmplY3RzLmZpbmQoXG4gICAgICAob2JqKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBuYW1lKVxuICAgICkgfHwgb2JqZWN0c1tvYmplY3RzLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgbmFtZSk7XG4gICAgaWYgKGRlc2NyaXB0b3I/LnNldCAmJiBkZXNjcmlwdG9yPy5nZXQpXG4gICAgICByZXR1cm4gZGVzY3JpcHRvci5zZXQuY2FsbCh0aGlzUHJveHksIHZhbHVlKSB8fCB0cnVlO1xuICAgIHJldHVybiBSZWZsZWN0LnNldCh0YXJnZXQsIG5hbWUsIHZhbHVlKTtcbiAgfVxufTtcbmZ1bmN0aW9uIGNvbGxhcHNlUHJveGllcygpIHtcbiAgbGV0IGtleXMgPSBSZWZsZWN0Lm93bktleXModGhpcyk7XG4gIHJldHVybiBrZXlzLnJlZHVjZSgoYWNjLCBrZXkpID0+IHtcbiAgICBhY2Nba2V5XSA9IFJlZmxlY3QuZ2V0KHRoaXMsIGtleSk7XG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvaW50ZXJjZXB0b3IuanNcbmZ1bmN0aW9uIGluaXRJbnRlcmNlcHRvcnMoZGF0YTIpIHtcbiAgbGV0IGlzT2JqZWN0MiA9ICh2YWwpID0+IHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgIUFycmF5LmlzQXJyYXkodmFsKSAmJiB2YWwgIT09IG51bGw7XG4gIGxldCByZWN1cnNlID0gKG9iaiwgYmFzZVBhdGggPSBcIlwiKSA9PiB7XG4gICAgT2JqZWN0LmVudHJpZXMoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMob2JqKSkuZm9yRWFjaCgoW2tleSwgeyB2YWx1ZSwgZW51bWVyYWJsZSB9XSkgPT4ge1xuICAgICAgaWYgKGVudW1lcmFibGUgPT09IGZhbHNlIHx8IHZhbHVlID09PSB2b2lkIDApXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUuX192X3NraXApXG4gICAgICAgIHJldHVybjtcbiAgICAgIGxldCBwYXRoID0gYmFzZVBhdGggPT09IFwiXCIgPyBrZXkgOiBgJHtiYXNlUGF0aH0uJHtrZXl9YDtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUuX3hfaW50ZXJjZXB0b3IpIHtcbiAgICAgICAgb2JqW2tleV0gPSB2YWx1ZS5pbml0aWFsaXplKGRhdGEyLCBwYXRoLCBrZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzT2JqZWN0Mih2YWx1ZSkgJiYgdmFsdWUgIT09IG9iaiAmJiAhKHZhbHVlIGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgICAgICByZWN1cnNlKHZhbHVlLCBwYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICByZXR1cm4gcmVjdXJzZShkYXRhMik7XG59XG5mdW5jdGlvbiBpbnRlcmNlcHRvcihjYWxsYmFjaywgbXV0YXRlT2JqID0gKCkgPT4ge1xufSkge1xuICBsZXQgb2JqID0ge1xuICAgIGluaXRpYWxWYWx1ZTogdm9pZCAwLFxuICAgIF94X2ludGVyY2VwdG9yOiB0cnVlLFxuICAgIGluaXRpYWxpemUoZGF0YTIsIHBhdGgsIGtleSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHRoaXMuaW5pdGlhbFZhbHVlLCAoKSA9PiBnZXQoZGF0YTIsIHBhdGgpLCAodmFsdWUpID0+IHNldChkYXRhMiwgcGF0aCwgdmFsdWUpLCBwYXRoLCBrZXkpO1xuICAgIH1cbiAgfTtcbiAgbXV0YXRlT2JqKG9iaik7XG4gIHJldHVybiAoaW5pdGlhbFZhbHVlKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBpbml0aWFsVmFsdWUgPT09IFwib2JqZWN0XCIgJiYgaW5pdGlhbFZhbHVlICE9PSBudWxsICYmIGluaXRpYWxWYWx1ZS5feF9pbnRlcmNlcHRvcikge1xuICAgICAgbGV0IGluaXRpYWxpemUgPSBvYmouaW5pdGlhbGl6ZS5iaW5kKG9iaik7XG4gICAgICBvYmouaW5pdGlhbGl6ZSA9IChkYXRhMiwgcGF0aCwga2V5KSA9PiB7XG4gICAgICAgIGxldCBpbm5lclZhbHVlID0gaW5pdGlhbFZhbHVlLmluaXRpYWxpemUoZGF0YTIsIHBhdGgsIGtleSk7XG4gICAgICAgIG9iai5pbml0aWFsVmFsdWUgPSBpbm5lclZhbHVlO1xuICAgICAgICByZXR1cm4gaW5pdGlhbGl6ZShkYXRhMiwgcGF0aCwga2V5KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIG9iai5pbml0aWFsVmFsdWUgPSBpbml0aWFsVmFsdWU7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG59XG5mdW5jdGlvbiBnZXQob2JqLCBwYXRoKSB7XG4gIHJldHVybiBwYXRoLnNwbGl0KFwiLlwiKS5yZWR1Y2UoKGNhcnJ5LCBzZWdtZW50KSA9PiBjYXJyeVtzZWdtZW50XSwgb2JqKTtcbn1cbmZ1bmN0aW9uIHNldChvYmosIHBhdGgsIHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgcGF0aCA9PT0gXCJzdHJpbmdcIilcbiAgICBwYXRoID0gcGF0aC5zcGxpdChcIi5cIik7XG4gIGlmIChwYXRoLmxlbmd0aCA9PT0gMSlcbiAgICBvYmpbcGF0aFswXV0gPSB2YWx1ZTtcbiAgZWxzZSBpZiAocGF0aC5sZW5ndGggPT09IDApXG4gICAgdGhyb3cgZXJyb3I7XG4gIGVsc2Uge1xuICAgIGlmIChvYmpbcGF0aFswXV0pXG4gICAgICByZXR1cm4gc2V0KG9ialtwYXRoWzBdXSwgcGF0aC5zbGljZSgxKSwgdmFsdWUpO1xuICAgIGVsc2Uge1xuICAgICAgb2JqW3BhdGhbMF1dID0ge307XG4gICAgICByZXR1cm4gc2V0KG9ialtwYXRoWzBdXSwgcGF0aC5zbGljZSgxKSwgdmFsdWUpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvbWFnaWNzLmpzXG52YXIgbWFnaWNzID0ge307XG5mdW5jdGlvbiBtYWdpYyhuYW1lLCBjYWxsYmFjaykge1xuICBtYWdpY3NbbmFtZV0gPSBjYWxsYmFjaztcbn1cbmZ1bmN0aW9uIGluamVjdE1hZ2ljcyhvYmosIGVsKSB7XG4gIGxldCBtZW1vaXplZFV0aWxpdGllcyA9IGdldFV0aWxpdGllcyhlbCk7XG4gIE9iamVjdC5lbnRyaWVzKG1hZ2ljcykuZm9yRWFjaCgoW25hbWUsIGNhbGxiYWNrXSkgPT4ge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGAkJHtuYW1lfWAsIHtcbiAgICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVsLCBtZW1vaXplZFV0aWxpdGllcyk7XG4gICAgICB9LFxuICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG5mdW5jdGlvbiBnZXRVdGlsaXRpZXMoZWwpIHtcbiAgbGV0IFt1dGlsaXRpZXMsIGNsZWFudXAyXSA9IGdldEVsZW1lbnRCb3VuZFV0aWxpdGllcyhlbCk7XG4gIGxldCB1dGlscyA9IHsgaW50ZXJjZXB0b3IsIC4uLnV0aWxpdGllcyB9O1xuICBvbkVsUmVtb3ZlZChlbCwgY2xlYW51cDIpO1xuICByZXR1cm4gdXRpbHM7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy9lcnJvci5qc1xuZnVuY3Rpb24gdHJ5Q2F0Y2goZWwsIGV4cHJlc3Npb24sIGNhbGxiYWNrLCAuLi5hcmdzKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaGFuZGxlRXJyb3IoZSwgZWwsIGV4cHJlc3Npb24pO1xuICB9XG59XG5mdW5jdGlvbiBoYW5kbGVFcnJvciguLi5hcmdzKSB7XG4gIHJldHVybiBlcnJvckhhbmRsZXIoLi4uYXJncyk7XG59XG52YXIgZXJyb3JIYW5kbGVyID0gbm9ybWFsRXJyb3JIYW5kbGVyO1xuZnVuY3Rpb24gc2V0RXJyb3JIYW5kbGVyKGhhbmRsZXI0KSB7XG4gIGVycm9ySGFuZGxlciA9IGhhbmRsZXI0O1xufVxuZnVuY3Rpb24gbm9ybWFsRXJyb3JIYW5kbGVyKGVycm9yMiwgZWwsIGV4cHJlc3Npb24gPSB2b2lkIDApIHtcbiAgZXJyb3IyID0gT2JqZWN0LmFzc2lnbihcbiAgICBlcnJvcjIgPz8geyBtZXNzYWdlOiBcIk5vIGVycm9yIG1lc3NhZ2UgZ2l2ZW4uXCIgfSxcbiAgICB7IGVsLCBleHByZXNzaW9uIH1cbiAgKTtcbiAgY29uc29sZS53YXJuKGBBbHBpbmUgRXhwcmVzc2lvbiBFcnJvcjogJHtlcnJvcjIubWVzc2FnZX1cblxuJHtleHByZXNzaW9uID8gJ0V4cHJlc3Npb246IFwiJyArIGV4cHJlc3Npb24gKyAnXCJcXG5cXG4nIDogXCJcIn1gLCBlbCk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHRocm93IGVycm9yMjtcbiAgfSwgMCk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9ldmFsdWF0b3IuanNcbnZhciBzaG91bGRBdXRvRXZhbHVhdGVGdW5jdGlvbnMgPSB0cnVlO1xuZnVuY3Rpb24gZG9udEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucyhjYWxsYmFjaykge1xuICBsZXQgY2FjaGUgPSBzaG91bGRBdXRvRXZhbHVhdGVGdW5jdGlvbnM7XG4gIHNob3VsZEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucyA9IGZhbHNlO1xuICBsZXQgcmVzdWx0ID0gY2FsbGJhY2soKTtcbiAgc2hvdWxkQXV0b0V2YWx1YXRlRnVuY3Rpb25zID0gY2FjaGU7XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBldmFsdWF0ZShlbCwgZXhwcmVzc2lvbiwgZXh0cmFzID0ge30pIHtcbiAgbGV0IHJlc3VsdDtcbiAgZXZhbHVhdGVMYXRlcihlbCwgZXhwcmVzc2lvbikoKHZhbHVlKSA9PiByZXN1bHQgPSB2YWx1ZSwgZXh0cmFzKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGV2YWx1YXRlTGF0ZXIoLi4uYXJncykge1xuICByZXR1cm4gdGhlRXZhbHVhdG9yRnVuY3Rpb24oLi4uYXJncyk7XG59XG52YXIgdGhlRXZhbHVhdG9yRnVuY3Rpb24gPSBub3JtYWxFdmFsdWF0b3I7XG5mdW5jdGlvbiBzZXRFdmFsdWF0b3IobmV3RXZhbHVhdG9yKSB7XG4gIHRoZUV2YWx1YXRvckZ1bmN0aW9uID0gbmV3RXZhbHVhdG9yO1xufVxudmFyIHRoZVJhd0V2YWx1YXRvckZ1bmN0aW9uO1xuZnVuY3Rpb24gc2V0UmF3RXZhbHVhdG9yKG5ld0V2YWx1YXRvcikge1xuICB0aGVSYXdFdmFsdWF0b3JGdW5jdGlvbiA9IG5ld0V2YWx1YXRvcjtcbn1cbmZ1bmN0aW9uIG5vcm1hbEV2YWx1YXRvcihlbCwgZXhwcmVzc2lvbikge1xuICBsZXQgb3ZlcnJpZGRlbk1hZ2ljcyA9IHt9O1xuICBpbmplY3RNYWdpY3Mob3ZlcnJpZGRlbk1hZ2ljcywgZWwpO1xuICBsZXQgZGF0YVN0YWNrID0gW292ZXJyaWRkZW5NYWdpY3MsIC4uLmNsb3Nlc3REYXRhU3RhY2soZWwpXTtcbiAgbGV0IGV2YWx1YXRvciA9IHR5cGVvZiBleHByZXNzaW9uID09PSBcImZ1bmN0aW9uXCIgPyBnZW5lcmF0ZUV2YWx1YXRvckZyb21GdW5jdGlvbihkYXRhU3RhY2ssIGV4cHJlc3Npb24pIDogZ2VuZXJhdGVFdmFsdWF0b3JGcm9tU3RyaW5nKGRhdGFTdGFjaywgZXhwcmVzc2lvbiwgZWwpO1xuICByZXR1cm4gdHJ5Q2F0Y2guYmluZChudWxsLCBlbCwgZXhwcmVzc2lvbiwgZXZhbHVhdG9yKTtcbn1cbmZ1bmN0aW9uIGdlbmVyYXRlRXZhbHVhdG9yRnJvbUZ1bmN0aW9uKGRhdGFTdGFjaywgZnVuYykge1xuICByZXR1cm4gKHJlY2VpdmVyID0gKCkgPT4ge1xuICB9LCB7IHNjb3BlOiBzY29wZTIgPSB7fSwgcGFyYW1zID0gW10sIGNvbnRleHQgfSA9IHt9KSA9PiB7XG4gICAgaWYgKCFzaG91bGRBdXRvRXZhbHVhdGVGdW5jdGlvbnMpIHtcbiAgICAgIHJ1bklmVHlwZU9mRnVuY3Rpb24ocmVjZWl2ZXIsIGZ1bmMsIG1lcmdlUHJveGllcyhbc2NvcGUyLCAuLi5kYXRhU3RhY2tdKSwgcGFyYW1zKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHJlc3VsdCA9IGZ1bmMuYXBwbHkobWVyZ2VQcm94aWVzKFtzY29wZTIsIC4uLmRhdGFTdGFja10pLCBwYXJhbXMpO1xuICAgIHJ1bklmVHlwZU9mRnVuY3Rpb24ocmVjZWl2ZXIsIHJlc3VsdCk7XG4gIH07XG59XG52YXIgZXZhbHVhdG9yTWVtbyA9IHt9O1xuZnVuY3Rpb24gZ2VuZXJhdGVGdW5jdGlvbkZyb21TdHJpbmcoZXhwcmVzc2lvbiwgZWwpIHtcbiAgaWYgKGV2YWx1YXRvck1lbW9bZXhwcmVzc2lvbl0pIHtcbiAgICByZXR1cm4gZXZhbHVhdG9yTWVtb1tleHByZXNzaW9uXTtcbiAgfVxuICBsZXQgQXN5bmNGdW5jdGlvbiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihhc3luYyBmdW5jdGlvbigpIHtcbiAgfSkuY29uc3RydWN0b3I7XG4gIGxldCByaWdodFNpZGVTYWZlRXhwcmVzc2lvbiA9IC9eW1xcblxcc10qaWYuKlxcKC4qXFwpLy50ZXN0KGV4cHJlc3Npb24udHJpbSgpKSB8fCAvXihsZXR8Y29uc3QpXFxzLy50ZXN0KGV4cHJlc3Npb24udHJpbSgpKSA/IGAoYXN5bmMoKT0+eyAke2V4cHJlc3Npb259IH0pKClgIDogZXhwcmVzc2lvbjtcbiAgY29uc3Qgc2FmZUFzeW5jRnVuY3Rpb24gPSAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBmdW5jMiA9IG5ldyBBc3luY0Z1bmN0aW9uKFxuICAgICAgICBbXCJfX3NlbGZcIiwgXCJzY29wZVwiXSxcbiAgICAgICAgYHdpdGggKHNjb3BlKSB7IF9fc2VsZi5yZXN1bHQgPSAke3JpZ2h0U2lkZVNhZmVFeHByZXNzaW9ufSB9OyBfX3NlbGYuZmluaXNoZWQgPSB0cnVlOyByZXR1cm4gX19zZWxmLnJlc3VsdDtgXG4gICAgICApO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGZ1bmMyLCBcIm5hbWVcIiwge1xuICAgICAgICB2YWx1ZTogYFtBbHBpbmVdICR7ZXhwcmVzc2lvbn1gXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmdW5jMjtcbiAgICB9IGNhdGNoIChlcnJvcjIpIHtcbiAgICAgIGhhbmRsZUVycm9yKGVycm9yMiwgZWwsIGV4cHJlc3Npb24pO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cbiAgfTtcbiAgbGV0IGZ1bmMgPSBzYWZlQXN5bmNGdW5jdGlvbigpO1xuICBldmFsdWF0b3JNZW1vW2V4cHJlc3Npb25dID0gZnVuYztcbiAgcmV0dXJuIGZ1bmM7XG59XG5mdW5jdGlvbiBnZW5lcmF0ZUV2YWx1YXRvckZyb21TdHJpbmcoZGF0YVN0YWNrLCBleHByZXNzaW9uLCBlbCkge1xuICBsZXQgZnVuYyA9IGdlbmVyYXRlRnVuY3Rpb25Gcm9tU3RyaW5nKGV4cHJlc3Npb24sIGVsKTtcbiAgcmV0dXJuIChyZWNlaXZlciA9ICgpID0+IHtcbiAgfSwgeyBzY29wZTogc2NvcGUyID0ge30sIHBhcmFtcyA9IFtdLCBjb250ZXh0IH0gPSB7fSkgPT4ge1xuICAgIGZ1bmMucmVzdWx0ID0gdm9pZCAwO1xuICAgIGZ1bmMuZmluaXNoZWQgPSBmYWxzZTtcbiAgICBsZXQgY29tcGxldGVTY29wZSA9IG1lcmdlUHJveGllcyhbc2NvcGUyLCAuLi5kYXRhU3RhY2tdKTtcbiAgICBpZiAodHlwZW9mIGZ1bmMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgbGV0IHByb21pc2UgPSBmdW5jLmNhbGwoY29udGV4dCwgZnVuYywgY29tcGxldGVTY29wZSkuY2F0Y2goKGVycm9yMikgPT4gaGFuZGxlRXJyb3IoZXJyb3IyLCBlbCwgZXhwcmVzc2lvbikpO1xuICAgICAgaWYgKGZ1bmMuZmluaXNoZWQpIHtcbiAgICAgICAgcnVuSWZUeXBlT2ZGdW5jdGlvbihyZWNlaXZlciwgZnVuYy5yZXN1bHQsIGNvbXBsZXRlU2NvcGUsIHBhcmFtcywgZWwpO1xuICAgICAgICBmdW5jLnJlc3VsdCA9IHZvaWQgMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb21pc2UudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgcnVuSWZUeXBlT2ZGdW5jdGlvbihyZWNlaXZlciwgcmVzdWx0LCBjb21wbGV0ZVNjb3BlLCBwYXJhbXMsIGVsKTtcbiAgICAgICAgfSkuY2F0Y2goKGVycm9yMikgPT4gaGFuZGxlRXJyb3IoZXJyb3IyLCBlbCwgZXhwcmVzc2lvbikpLmZpbmFsbHkoKCkgPT4gZnVuYy5yZXN1bHQgPSB2b2lkIDApO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIHJ1bklmVHlwZU9mRnVuY3Rpb24ocmVjZWl2ZXIsIHZhbHVlLCBzY29wZTIsIHBhcmFtcywgZWwpIHtcbiAgaWYgKHNob3VsZEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucyAmJiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGxldCByZXN1bHQgPSB2YWx1ZS5hcHBseShzY29wZTIsIHBhcmFtcyk7XG4gICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIHJlc3VsdC50aGVuKChpKSA9PiBydW5JZlR5cGVPZkZ1bmN0aW9uKHJlY2VpdmVyLCBpLCBzY29wZTIsIHBhcmFtcykpLmNhdGNoKChlcnJvcjIpID0+IGhhbmRsZUVycm9yKGVycm9yMiwgZWwsIHZhbHVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY2VpdmVyKHJlc3VsdCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICB2YWx1ZS50aGVuKChpKSA9PiByZWNlaXZlcihpKSk7XG4gIH0gZWxzZSB7XG4gICAgcmVjZWl2ZXIodmFsdWUpO1xuICB9XG59XG5mdW5jdGlvbiBldmFsdWF0ZVJhdyguLi5hcmdzKSB7XG4gIHJldHVybiB0aGVSYXdFdmFsdWF0b3JGdW5jdGlvbiguLi5hcmdzKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMuanNcbnZhciBwcmVmaXhBc1N0cmluZyA9IFwieC1cIjtcbmZ1bmN0aW9uIHByZWZpeChzdWJqZWN0ID0gXCJcIikge1xuICByZXR1cm4gcHJlZml4QXNTdHJpbmcgKyBzdWJqZWN0O1xufVxuZnVuY3Rpb24gc2V0UHJlZml4KG5ld1ByZWZpeCkge1xuICBwcmVmaXhBc1N0cmluZyA9IG5ld1ByZWZpeDtcbn1cbnZhciBkaXJlY3RpdmVIYW5kbGVycyA9IHt9O1xuZnVuY3Rpb24gZGlyZWN0aXZlKG5hbWUsIGNhbGxiYWNrKSB7XG4gIGRpcmVjdGl2ZUhhbmRsZXJzW25hbWVdID0gY2FsbGJhY2s7XG4gIHJldHVybiB7XG4gICAgYmVmb3JlKGRpcmVjdGl2ZTIpIHtcbiAgICAgIGlmICghZGlyZWN0aXZlSGFuZGxlcnNbZGlyZWN0aXZlMl0pIHtcbiAgICAgICAgY29uc29sZS53YXJuKFN0cmluZy5yYXdgQ2Fubm90IGZpbmQgZGlyZWN0aXZlIFxcYCR7ZGlyZWN0aXZlMn1cXGAuIFxcYCR7bmFtZX1cXGAgd2lsbCB1c2UgdGhlIGRlZmF1bHQgb3JkZXIgb2YgZXhlY3V0aW9uYCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBvcyA9IGRpcmVjdGl2ZU9yZGVyLmluZGV4T2YoZGlyZWN0aXZlMik7XG4gICAgICBkaXJlY3RpdmVPcmRlci5zcGxpY2UocG9zID49IDAgPyBwb3MgOiBkaXJlY3RpdmVPcmRlci5pbmRleE9mKFwiREVGQVVMVFwiKSwgMCwgbmFtZSk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gZGlyZWN0aXZlRXhpc3RzKG5hbWUpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGRpcmVjdGl2ZUhhbmRsZXJzKS5pbmNsdWRlcyhuYW1lKTtcbn1cbmZ1bmN0aW9uIGRpcmVjdGl2ZXMoZWwsIGF0dHJpYnV0ZXMsIG9yaWdpbmFsQXR0cmlidXRlT3ZlcnJpZGUpIHtcbiAgYXR0cmlidXRlcyA9IEFycmF5LmZyb20oYXR0cmlidXRlcyk7XG4gIGlmIChlbC5feF92aXJ0dWFsRGlyZWN0aXZlcykge1xuICAgIGxldCB2QXR0cmlidXRlcyA9IE9iamVjdC5lbnRyaWVzKGVsLl94X3ZpcnR1YWxEaXJlY3RpdmVzKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7IG5hbWUsIHZhbHVlIH0pKTtcbiAgICBsZXQgc3RhdGljQXR0cmlidXRlcyA9IGF0dHJpYnV0ZXNPbmx5KHZBdHRyaWJ1dGVzKTtcbiAgICB2QXR0cmlidXRlcyA9IHZBdHRyaWJ1dGVzLm1hcCgoYXR0cmlidXRlKSA9PiB7XG4gICAgICBpZiAoc3RhdGljQXR0cmlidXRlcy5maW5kKChhdHRyKSA9PiBhdHRyLm5hbWUgPT09IGF0dHJpYnV0ZS5uYW1lKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IGB4LWJpbmQ6JHthdHRyaWJ1dGUubmFtZX1gLFxuICAgICAgICAgIHZhbHVlOiBgXCIke2F0dHJpYnV0ZS52YWx1ZX1cImBcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhdHRyaWJ1dGU7XG4gICAgfSk7XG4gICAgYXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMuY29uY2F0KHZBdHRyaWJ1dGVzKTtcbiAgfVxuICBsZXQgdHJhbnNmb3JtZWRBdHRyaWJ1dGVNYXAgPSB7fTtcbiAgbGV0IGRpcmVjdGl2ZXMyID0gYXR0cmlidXRlcy5tYXAodG9UcmFuc2Zvcm1lZEF0dHJpYnV0ZXMoKG5ld05hbWUsIG9sZE5hbWUpID0+IHRyYW5zZm9ybWVkQXR0cmlidXRlTWFwW25ld05hbWVdID0gb2xkTmFtZSkpLmZpbHRlcihvdXROb25BbHBpbmVBdHRyaWJ1dGVzKS5tYXAodG9QYXJzZWREaXJlY3RpdmVzKHRyYW5zZm9ybWVkQXR0cmlidXRlTWFwLCBvcmlnaW5hbEF0dHJpYnV0ZU92ZXJyaWRlKSkuc29ydChieVByaW9yaXR5KTtcbiAgcmV0dXJuIGRpcmVjdGl2ZXMyLm1hcCgoZGlyZWN0aXZlMikgPT4ge1xuICAgIHJldHVybiBnZXREaXJlY3RpdmVIYW5kbGVyKGVsLCBkaXJlY3RpdmUyKTtcbiAgfSk7XG59XG5mdW5jdGlvbiBhdHRyaWJ1dGVzT25seShhdHRyaWJ1dGVzKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKGF0dHJpYnV0ZXMpLm1hcCh0b1RyYW5zZm9ybWVkQXR0cmlidXRlcygpKS5maWx0ZXIoKGF0dHIpID0+ICFvdXROb25BbHBpbmVBdHRyaWJ1dGVzKGF0dHIpKTtcbn1cbnZhciBpc0RlZmVycmluZ0hhbmRsZXJzID0gZmFsc2U7XG52YXIgZGlyZWN0aXZlSGFuZGxlclN0YWNrcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgY3VycmVudEhhbmRsZXJTdGFja0tleSA9IFN5bWJvbCgpO1xuZnVuY3Rpb24gZGVmZXJIYW5kbGluZ0RpcmVjdGl2ZXMoY2FsbGJhY2spIHtcbiAgaXNEZWZlcnJpbmdIYW5kbGVycyA9IHRydWU7XG4gIGxldCBrZXkgPSBTeW1ib2woKTtcbiAgY3VycmVudEhhbmRsZXJTdGFja0tleSA9IGtleTtcbiAgZGlyZWN0aXZlSGFuZGxlclN0YWNrcy5zZXQoa2V5LCBbXSk7XG4gIGxldCBmbHVzaEhhbmRsZXJzID0gKCkgPT4ge1xuICAgIHdoaWxlIChkaXJlY3RpdmVIYW5kbGVyU3RhY2tzLmdldChrZXkpLmxlbmd0aClcbiAgICAgIGRpcmVjdGl2ZUhhbmRsZXJTdGFja3MuZ2V0KGtleSkuc2hpZnQoKSgpO1xuICAgIGRpcmVjdGl2ZUhhbmRsZXJTdGFja3MuZGVsZXRlKGtleSk7XG4gIH07XG4gIGxldCBzdG9wRGVmZXJyaW5nID0gKCkgPT4ge1xuICAgIGlzRGVmZXJyaW5nSGFuZGxlcnMgPSBmYWxzZTtcbiAgICBmbHVzaEhhbmRsZXJzKCk7XG4gIH07XG4gIGNhbGxiYWNrKGZsdXNoSGFuZGxlcnMpO1xuICBzdG9wRGVmZXJyaW5nKCk7XG59XG5mdW5jdGlvbiBnZXRFbGVtZW50Qm91bmRVdGlsaXRpZXMoZWwpIHtcbiAgbGV0IGNsZWFudXBzID0gW107XG4gIGxldCBjbGVhbnVwMiA9IChjYWxsYmFjaykgPT4gY2xlYW51cHMucHVzaChjYWxsYmFjayk7XG4gIGxldCBbZWZmZWN0MywgY2xlYW51cEVmZmVjdF0gPSBlbGVtZW50Qm91bmRFZmZlY3QoZWwpO1xuICBjbGVhbnVwcy5wdXNoKGNsZWFudXBFZmZlY3QpO1xuICBsZXQgdXRpbGl0aWVzID0ge1xuICAgIEFscGluZTogYWxwaW5lX2RlZmF1bHQsXG4gICAgZWZmZWN0OiBlZmZlY3QzLFxuICAgIGNsZWFudXA6IGNsZWFudXAyLFxuICAgIGV2YWx1YXRlTGF0ZXI6IGV2YWx1YXRlTGF0ZXIuYmluZChldmFsdWF0ZUxhdGVyLCBlbCksXG4gICAgZXZhbHVhdGU6IGV2YWx1YXRlLmJpbmQoZXZhbHVhdGUsIGVsKVxuICB9O1xuICBsZXQgZG9DbGVhbnVwID0gKCkgPT4gY2xlYW51cHMuZm9yRWFjaCgoaSkgPT4gaSgpKTtcbiAgcmV0dXJuIFt1dGlsaXRpZXMsIGRvQ2xlYW51cF07XG59XG5mdW5jdGlvbiBnZXREaXJlY3RpdmVIYW5kbGVyKGVsLCBkaXJlY3RpdmUyKSB7XG4gIGxldCBub29wID0gKCkgPT4ge1xuICB9O1xuICBsZXQgaGFuZGxlcjQgPSBkaXJlY3RpdmVIYW5kbGVyc1tkaXJlY3RpdmUyLnR5cGVdIHx8IG5vb3A7XG4gIGxldCBbdXRpbGl0aWVzLCBjbGVhbnVwMl0gPSBnZXRFbGVtZW50Qm91bmRVdGlsaXRpZXMoZWwpO1xuICBvbkF0dHJpYnV0ZVJlbW92ZWQoZWwsIGRpcmVjdGl2ZTIub3JpZ2luYWwsIGNsZWFudXAyKTtcbiAgbGV0IGZ1bGxIYW5kbGVyID0gKCkgPT4ge1xuICAgIGlmIChlbC5feF9pZ25vcmUgfHwgZWwuX3hfaWdub3JlU2VsZilcbiAgICAgIHJldHVybjtcbiAgICBoYW5kbGVyNC5pbmxpbmUgJiYgaGFuZGxlcjQuaW5saW5lKGVsLCBkaXJlY3RpdmUyLCB1dGlsaXRpZXMpO1xuICAgIGhhbmRsZXI0ID0gaGFuZGxlcjQuYmluZChoYW5kbGVyNCwgZWwsIGRpcmVjdGl2ZTIsIHV0aWxpdGllcyk7XG4gICAgaXNEZWZlcnJpbmdIYW5kbGVycyA/IGRpcmVjdGl2ZUhhbmRsZXJTdGFja3MuZ2V0KGN1cnJlbnRIYW5kbGVyU3RhY2tLZXkpLnB1c2goaGFuZGxlcjQpIDogaGFuZGxlcjQoKTtcbiAgfTtcbiAgZnVsbEhhbmRsZXIucnVuQ2xlYW51cHMgPSBjbGVhbnVwMjtcbiAgcmV0dXJuIGZ1bGxIYW5kbGVyO1xufVxudmFyIHN0YXJ0aW5nV2l0aCA9IChzdWJqZWN0LCByZXBsYWNlbWVudCkgPT4gKHsgbmFtZSwgdmFsdWUgfSkgPT4ge1xuICBpZiAobmFtZS5zdGFydHNXaXRoKHN1YmplY3QpKVxuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2Uoc3ViamVjdCwgcmVwbGFjZW1lbnQpO1xuICByZXR1cm4geyBuYW1lLCB2YWx1ZSB9O1xufTtcbnZhciBpbnRvID0gKGkpID0+IGk7XG5mdW5jdGlvbiB0b1RyYW5zZm9ybWVkQXR0cmlidXRlcyhjYWxsYmFjayA9ICgpID0+IHtcbn0pIHtcbiAgcmV0dXJuICh7IG5hbWUsIHZhbHVlIH0pID0+IHtcbiAgICBsZXQgeyBuYW1lOiBuZXdOYW1lLCB2YWx1ZTogbmV3VmFsdWUgfSA9IGF0dHJpYnV0ZVRyYW5zZm9ybWVycy5yZWR1Y2UoKGNhcnJ5LCB0cmFuc2Zvcm0pID0+IHtcbiAgICAgIHJldHVybiB0cmFuc2Zvcm0oY2FycnkpO1xuICAgIH0sIHsgbmFtZSwgdmFsdWUgfSk7XG4gICAgaWYgKG5ld05hbWUgIT09IG5hbWUpXG4gICAgICBjYWxsYmFjayhuZXdOYW1lLCBuYW1lKTtcbiAgICByZXR1cm4geyBuYW1lOiBuZXdOYW1lLCB2YWx1ZTogbmV3VmFsdWUgfTtcbiAgfTtcbn1cbnZhciBhdHRyaWJ1dGVUcmFuc2Zvcm1lcnMgPSBbXTtcbmZ1bmN0aW9uIG1hcEF0dHJpYnV0ZXMoY2FsbGJhY2spIHtcbiAgYXR0cmlidXRlVHJhbnNmb3JtZXJzLnB1c2goY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gb3V0Tm9uQWxwaW5lQXR0cmlidXRlcyh7IG5hbWUgfSkge1xuICByZXR1cm4gYWxwaW5lQXR0cmlidXRlUmVnZXgoKS50ZXN0KG5hbWUpO1xufVxudmFyIGFscGluZUF0dHJpYnV0ZVJlZ2V4ID0gKCkgPT4gbmV3IFJlZ0V4cChgXiR7cHJlZml4QXNTdHJpbmd9KFteOl4uXSspXFxcXGJgKTtcbmZ1bmN0aW9uIHRvUGFyc2VkRGlyZWN0aXZlcyh0cmFuc2Zvcm1lZEF0dHJpYnV0ZU1hcCwgb3JpZ2luYWxBdHRyaWJ1dGVPdmVycmlkZSkge1xuICByZXR1cm4gKHsgbmFtZSwgdmFsdWUgfSkgPT4ge1xuICAgIGlmIChuYW1lID09PSB2YWx1ZSlcbiAgICAgIHZhbHVlID0gXCJcIjtcbiAgICBsZXQgdHlwZU1hdGNoID0gbmFtZS5tYXRjaChhbHBpbmVBdHRyaWJ1dGVSZWdleCgpKTtcbiAgICBsZXQgdmFsdWVNYXRjaCA9IG5hbWUubWF0Y2goLzooW2EtekEtWjAtOVxcLV86XSspLyk7XG4gICAgbGV0IG1vZGlmaWVycyA9IG5hbWUubWF0Y2goL1xcLlteLlxcXV0rKD89W15cXF1dKiQpL2cpIHx8IFtdO1xuICAgIGxldCBvcmlnaW5hbCA9IG9yaWdpbmFsQXR0cmlidXRlT3ZlcnJpZGUgfHwgdHJhbnNmb3JtZWRBdHRyaWJ1dGVNYXBbbmFtZV0gfHwgbmFtZTtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogdHlwZU1hdGNoID8gdHlwZU1hdGNoWzFdIDogbnVsbCxcbiAgICAgIHZhbHVlOiB2YWx1ZU1hdGNoID8gdmFsdWVNYXRjaFsxXSA6IG51bGwsXG4gICAgICBtb2RpZmllcnM6IG1vZGlmaWVycy5tYXAoKGkpID0+IGkucmVwbGFjZShcIi5cIiwgXCJcIikpLFxuICAgICAgZXhwcmVzc2lvbjogdmFsdWUsXG4gICAgICBvcmlnaW5hbFxuICAgIH07XG4gIH07XG59XG52YXIgREVGQVVMVCA9IFwiREVGQVVMVFwiO1xudmFyIGRpcmVjdGl2ZU9yZGVyID0gW1xuICBcImlnbm9yZVwiLFxuICBcInJlZlwiLFxuICBcImRhdGFcIixcbiAgXCJpZFwiLFxuICBcImFuY2hvclwiLFxuICBcImJpbmRcIixcbiAgXCJpbml0XCIsXG4gIFwiZm9yXCIsXG4gIFwibW9kZWxcIixcbiAgXCJtb2RlbGFibGVcIixcbiAgXCJ0cmFuc2l0aW9uXCIsXG4gIFwic2hvd1wiLFxuICBcImlmXCIsXG4gIERFRkFVTFQsXG4gIFwidGVsZXBvcnRcIlxuXTtcbmZ1bmN0aW9uIGJ5UHJpb3JpdHkoYSwgYikge1xuICBsZXQgdHlwZUEgPSBkaXJlY3RpdmVPcmRlci5pbmRleE9mKGEudHlwZSkgPT09IC0xID8gREVGQVVMVCA6IGEudHlwZTtcbiAgbGV0IHR5cGVCID0gZGlyZWN0aXZlT3JkZXIuaW5kZXhPZihiLnR5cGUpID09PSAtMSA/IERFRkFVTFQgOiBiLnR5cGU7XG4gIHJldHVybiBkaXJlY3RpdmVPcmRlci5pbmRleE9mKHR5cGVBKSAtIGRpcmVjdGl2ZU9yZGVyLmluZGV4T2YodHlwZUIpO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvZGlzcGF0Y2guanNcbmZ1bmN0aW9uIGRpc3BhdGNoKGVsLCBuYW1lLCBkZXRhaWwgPSB7fSkge1xuICBlbC5kaXNwYXRjaEV2ZW50KFxuICAgIG5ldyBDdXN0b21FdmVudChuYW1lLCB7XG4gICAgICBkZXRhaWwsXG4gICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgLy8gQWxsb3dzIGV2ZW50cyB0byBwYXNzIHRoZSBzaGFkb3cgRE9NIGJhcnJpZXIuXG4gICAgICBjb21wb3NlZDogdHJ1ZSxcbiAgICAgIGNhbmNlbGFibGU6IHRydWVcbiAgICB9KVxuICApO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvd2Fsay5qc1xuZnVuY3Rpb24gd2FsayhlbCwgY2FsbGJhY2spIHtcbiAgaWYgKHR5cGVvZiBTaGFkb3dSb290ID09PSBcImZ1bmN0aW9uXCIgJiYgZWwgaW5zdGFuY2VvZiBTaGFkb3dSb290KSB7XG4gICAgQXJyYXkuZnJvbShlbC5jaGlsZHJlbikuZm9yRWFjaCgoZWwyKSA9PiB3YWxrKGVsMiwgY2FsbGJhY2spKTtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IHNraXAgPSBmYWxzZTtcbiAgY2FsbGJhY2soZWwsICgpID0+IHNraXAgPSB0cnVlKTtcbiAgaWYgKHNraXApXG4gICAgcmV0dXJuO1xuICBsZXQgbm9kZSA9IGVsLmZpcnN0RWxlbWVudENoaWxkO1xuICB3aGlsZSAobm9kZSkge1xuICAgIHdhbGsobm9kZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICBub2RlID0gbm9kZS5uZXh0RWxlbWVudFNpYmxpbmc7XG4gIH1cbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3V0aWxzL3dhcm4uanNcbmZ1bmN0aW9uIHdhcm4obWVzc2FnZSwgLi4uYXJncykge1xuICBjb25zb2xlLndhcm4oYEFscGluZSBXYXJuaW5nOiAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9saWZlY3ljbGUuanNcbnZhciBzdGFydGVkID0gZmFsc2U7XG5mdW5jdGlvbiBzdGFydCgpIHtcbiAgaWYgKHN0YXJ0ZWQpXG4gICAgd2FybihcIkFscGluZSBoYXMgYWxyZWFkeSBiZWVuIGluaXRpYWxpemVkIG9uIHRoaXMgcGFnZS4gQ2FsbGluZyBBbHBpbmUuc3RhcnQoKSBtb3JlIHRoYW4gb25jZSBjYW4gY2F1c2UgcHJvYmxlbXMuXCIpO1xuICBzdGFydGVkID0gdHJ1ZTtcbiAgaWYgKCFkb2N1bWVudC5ib2R5KVxuICAgIHdhcm4oXCJVbmFibGUgdG8gaW5pdGlhbGl6ZS4gVHJ5aW5nIHRvIGxvYWQgQWxwaW5lIGJlZm9yZSBgPGJvZHk+YCBpcyBhdmFpbGFibGUuIERpZCB5b3UgZm9yZ2V0IHRvIGFkZCBgZGVmZXJgIGluIEFscGluZSdzIGA8c2NyaXB0PmAgdGFnP1wiKTtcbiAgZGlzcGF0Y2goZG9jdW1lbnQsIFwiYWxwaW5lOmluaXRcIik7XG4gIGRpc3BhdGNoKGRvY3VtZW50LCBcImFscGluZTppbml0aWFsaXppbmdcIik7XG4gIHN0YXJ0T2JzZXJ2aW5nTXV0YXRpb25zKCk7XG4gIG9uRWxBZGRlZCgoZWwpID0+IGluaXRUcmVlKGVsLCB3YWxrKSk7XG4gIG9uRWxSZW1vdmVkKChlbCkgPT4gZGVzdHJveVRyZWUoZWwpKTtcbiAgb25BdHRyaWJ1dGVzQWRkZWQoKGVsLCBhdHRycykgPT4ge1xuICAgIGRpcmVjdGl2ZXMoZWwsIGF0dHJzKS5mb3JFYWNoKChoYW5kbGUpID0+IGhhbmRsZSgpKTtcbiAgfSk7XG4gIGxldCBvdXROZXN0ZWRDb21wb25lbnRzID0gKGVsKSA9PiAhY2xvc2VzdFJvb3QoZWwucGFyZW50RWxlbWVudCwgdHJ1ZSk7XG4gIEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChhbGxTZWxlY3RvcnMoKS5qb2luKFwiLFwiKSkpLmZpbHRlcihvdXROZXN0ZWRDb21wb25lbnRzKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgIGluaXRUcmVlKGVsKTtcbiAgfSk7XG4gIGRpc3BhdGNoKGRvY3VtZW50LCBcImFscGluZTppbml0aWFsaXplZFwiKTtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgd2FybkFib3V0TWlzc2luZ1BsdWdpbnMoKTtcbiAgfSk7XG59XG52YXIgcm9vdFNlbGVjdG9yQ2FsbGJhY2tzID0gW107XG52YXIgaW5pdFNlbGVjdG9yQ2FsbGJhY2tzID0gW107XG5mdW5jdGlvbiByb290U2VsZWN0b3JzKCkge1xuICByZXR1cm4gcm9vdFNlbGVjdG9yQ2FsbGJhY2tzLm1hcCgoZm4pID0+IGZuKCkpO1xufVxuZnVuY3Rpb24gYWxsU2VsZWN0b3JzKCkge1xuICByZXR1cm4gcm9vdFNlbGVjdG9yQ2FsbGJhY2tzLmNvbmNhdChpbml0U2VsZWN0b3JDYWxsYmFja3MpLm1hcCgoZm4pID0+IGZuKCkpO1xufVxuZnVuY3Rpb24gYWRkUm9vdFNlbGVjdG9yKHNlbGVjdG9yQ2FsbGJhY2spIHtcbiAgcm9vdFNlbGVjdG9yQ2FsbGJhY2tzLnB1c2goc2VsZWN0b3JDYWxsYmFjayk7XG59XG5mdW5jdGlvbiBhZGRJbml0U2VsZWN0b3Ioc2VsZWN0b3JDYWxsYmFjaykge1xuICBpbml0U2VsZWN0b3JDYWxsYmFja3MucHVzaChzZWxlY3RvckNhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIGNsb3Nlc3RSb290KGVsLCBpbmNsdWRlSW5pdFNlbGVjdG9ycyA9IGZhbHNlKSB7XG4gIHJldHVybiBmaW5kQ2xvc2VzdChlbCwgKGVsZW1lbnQpID0+IHtcbiAgICBjb25zdCBzZWxlY3RvcnMgPSBpbmNsdWRlSW5pdFNlbGVjdG9ycyA/IGFsbFNlbGVjdG9ycygpIDogcm9vdFNlbGVjdG9ycygpO1xuICAgIGlmIChzZWxlY3RvcnMuc29tZSgoc2VsZWN0b3IpID0+IGVsZW1lbnQubWF0Y2hlcyhzZWxlY3RvcikpKVxuICAgICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuZnVuY3Rpb24gZmluZENsb3Nlc3QoZWwsIGNhbGxiYWNrKSB7XG4gIGlmICghZWwpXG4gICAgcmV0dXJuO1xuICBpZiAoY2FsbGJhY2soZWwpKVxuICAgIHJldHVybiBlbDtcbiAgaWYgKGVsLl94X3RlbGVwb3J0QmFjaylcbiAgICBlbCA9IGVsLl94X3RlbGVwb3J0QmFjaztcbiAgaWYgKGVsLnBhcmVudE5vZGUgaW5zdGFuY2VvZiBTaGFkb3dSb290KSB7XG4gICAgcmV0dXJuIGZpbmRDbG9zZXN0KGVsLnBhcmVudE5vZGUuaG9zdCwgY2FsbGJhY2spO1xuICB9XG4gIGlmICghZWwucGFyZW50RWxlbWVudClcbiAgICByZXR1cm47XG4gIHJldHVybiBmaW5kQ2xvc2VzdChlbC5wYXJlbnRFbGVtZW50LCBjYWxsYmFjayk7XG59XG5mdW5jdGlvbiBpc1Jvb3QoZWwpIHtcbiAgcmV0dXJuIHJvb3RTZWxlY3RvcnMoKS5zb21lKChzZWxlY3RvcikgPT4gZWwubWF0Y2hlcyhzZWxlY3RvcikpO1xufVxudmFyIGluaXRJbnRlcmNlcHRvcnMyID0gW107XG5mdW5jdGlvbiBpbnRlcmNlcHRJbml0KGNhbGxiYWNrKSB7XG4gIGluaXRJbnRlcmNlcHRvcnMyLnB1c2goY2FsbGJhY2spO1xufVxudmFyIG1hcmtlckRpc3BlbnNlciA9IDE7XG5mdW5jdGlvbiBpbml0VHJlZShlbCwgd2Fsa2VyID0gd2FsaywgaW50ZXJjZXB0ID0gKCkgPT4ge1xufSkge1xuICBpZiAoZmluZENsb3Nlc3QoZWwsIChpKSA9PiBpLl94X2lnbm9yZSkpXG4gICAgcmV0dXJuO1xuICBkZWZlckhhbmRsaW5nRGlyZWN0aXZlcygoKSA9PiB7XG4gICAgd2Fsa2VyKGVsLCAoZWwyLCBza2lwKSA9PiB7XG4gICAgICBpZiAoZWwyLl94X21hcmtlcilcbiAgICAgICAgcmV0dXJuO1xuICAgICAgaW50ZXJjZXB0KGVsMiwgc2tpcCk7XG4gICAgICBpbml0SW50ZXJjZXB0b3JzMi5mb3JFYWNoKChpKSA9PiBpKGVsMiwgc2tpcCkpO1xuICAgICAgZGlyZWN0aXZlcyhlbDIsIGVsMi5hdHRyaWJ1dGVzKS5mb3JFYWNoKChoYW5kbGUpID0+IGhhbmRsZSgpKTtcbiAgICAgIGlmICghZWwyLl94X2lnbm9yZSlcbiAgICAgICAgZWwyLl94X21hcmtlciA9IG1hcmtlckRpc3BlbnNlcisrO1xuICAgICAgZWwyLl94X2lnbm9yZSAmJiBza2lwKCk7XG4gICAgfSk7XG4gIH0pO1xufVxuZnVuY3Rpb24gZGVzdHJveVRyZWUocm9vdCwgd2Fsa2VyID0gd2Fsaykge1xuICB3YWxrZXIocm9vdCwgKGVsKSA9PiB7XG4gICAgY2xlYW51cEVsZW1lbnQoZWwpO1xuICAgIGNsZWFudXBBdHRyaWJ1dGVzKGVsKTtcbiAgICBkZWxldGUgZWwuX3hfbWFya2VyO1xuICB9KTtcbn1cbmZ1bmN0aW9uIHdhcm5BYm91dE1pc3NpbmdQbHVnaW5zKCkge1xuICBsZXQgcGx1Z2luRGlyZWN0aXZlcyA9IFtcbiAgICBbXCJ1aVwiLCBcImRpYWxvZ1wiLCBbXCJbeC1kaWFsb2ddLCBbeC1wb3BvdmVyXVwiXV0sXG4gICAgW1wiYW5jaG9yXCIsIFwiYW5jaG9yXCIsIFtcIlt4LWFuY2hvcl1cIl1dLFxuICAgIFtcInNvcnRcIiwgXCJzb3J0XCIsIFtcIlt4LXNvcnRdXCJdXVxuICBdO1xuICBwbHVnaW5EaXJlY3RpdmVzLmZvckVhY2goKFtwbHVnaW4yLCBkaXJlY3RpdmUyLCBzZWxlY3RvcnNdKSA9PiB7XG4gICAgaWYgKGRpcmVjdGl2ZUV4aXN0cyhkaXJlY3RpdmUyKSlcbiAgICAgIHJldHVybjtcbiAgICBzZWxlY3RvcnMuc29tZSgoc2VsZWN0b3IpID0+IHtcbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgICAgICB3YXJuKGBmb3VuZCBcIiR7c2VsZWN0b3J9XCIsIGJ1dCBtaXNzaW5nICR7cGx1Z2luMn0gcGx1Z2luYCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL25leHRUaWNrLmpzXG52YXIgdGlja1N0YWNrID0gW107XG52YXIgaXNIb2xkaW5nID0gZmFsc2U7XG5mdW5jdGlvbiBuZXh0VGljayhjYWxsYmFjayA9ICgpID0+IHtcbn0pIHtcbiAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgIGlzSG9sZGluZyB8fCBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlbGVhc2VOZXh0VGlja3MoKTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzKSA9PiB7XG4gICAgdGlja1N0YWNrLnB1c2goKCkgPT4ge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICAgIHJlcygpO1xuICAgIH0pO1xuICB9KTtcbn1cbmZ1bmN0aW9uIHJlbGVhc2VOZXh0VGlja3MoKSB7XG4gIGlzSG9sZGluZyA9IGZhbHNlO1xuICB3aGlsZSAodGlja1N0YWNrLmxlbmd0aClcbiAgICB0aWNrU3RhY2suc2hpZnQoKSgpO1xufVxuZnVuY3Rpb24gaG9sZE5leHRUaWNrcygpIHtcbiAgaXNIb2xkaW5nID0gdHJ1ZTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3V0aWxzL2NsYXNzZXMuanNcbmZ1bmN0aW9uIHNldENsYXNzZXMoZWwsIHZhbHVlKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiBzZXRDbGFzc2VzRnJvbVN0cmluZyhlbCwgdmFsdWUuam9pbihcIiBcIikpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgIHJldHVybiBzZXRDbGFzc2VzRnJvbU9iamVjdChlbCwgdmFsdWUpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcmV0dXJuIHNldENsYXNzZXMoZWwsIHZhbHVlKCkpO1xuICB9XG4gIHJldHVybiBzZXRDbGFzc2VzRnJvbVN0cmluZyhlbCwgdmFsdWUpO1xufVxuZnVuY3Rpb24gc2V0Q2xhc3Nlc0Zyb21TdHJpbmcoZWwsIGNsYXNzU3RyaW5nKSB7XG4gIGxldCBzcGxpdCA9IChjbGFzc1N0cmluZzIpID0+IGNsYXNzU3RyaW5nMi5zcGxpdChcIiBcIikuZmlsdGVyKEJvb2xlYW4pO1xuICBsZXQgbWlzc2luZ0NsYXNzZXMgPSAoY2xhc3NTdHJpbmcyKSA9PiBjbGFzc1N0cmluZzIuc3BsaXQoXCIgXCIpLmZpbHRlcigoaSkgPT4gIWVsLmNsYXNzTGlzdC5jb250YWlucyhpKSkuZmlsdGVyKEJvb2xlYW4pO1xuICBsZXQgYWRkQ2xhc3Nlc0FuZFJldHVyblVuZG8gPSAoY2xhc3NlcykgPT4ge1xuICAgIGVsLmNsYXNzTGlzdC5hZGQoLi4uY2xhc3Nlcyk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoLi4uY2xhc3Nlcyk7XG4gICAgfTtcbiAgfTtcbiAgY2xhc3NTdHJpbmcgPSBjbGFzc1N0cmluZyA9PT0gdHJ1ZSA/IGNsYXNzU3RyaW5nID0gXCJcIiA6IGNsYXNzU3RyaW5nIHx8IFwiXCI7XG4gIHJldHVybiBhZGRDbGFzc2VzQW5kUmV0dXJuVW5kbyhtaXNzaW5nQ2xhc3NlcyhjbGFzc1N0cmluZykpO1xufVxuZnVuY3Rpb24gc2V0Q2xhc3Nlc0Zyb21PYmplY3QoZWwsIGNsYXNzT2JqZWN0KSB7XG4gIGxldCBzcGxpdCA9IChjbGFzc1N0cmluZykgPT4gY2xhc3NTdHJpbmcuc3BsaXQoXCIgXCIpLmZpbHRlcihCb29sZWFuKTtcbiAgbGV0IGZvckFkZCA9IE9iamVjdC5lbnRyaWVzKGNsYXNzT2JqZWN0KS5mbGF0TWFwKChbY2xhc3NTdHJpbmcsIGJvb2xdKSA9PiBib29sID8gc3BsaXQoY2xhc3NTdHJpbmcpIDogZmFsc2UpLmZpbHRlcihCb29sZWFuKTtcbiAgbGV0IGZvclJlbW92ZSA9IE9iamVjdC5lbnRyaWVzKGNsYXNzT2JqZWN0KS5mbGF0TWFwKChbY2xhc3NTdHJpbmcsIGJvb2xdKSA9PiAhYm9vbCA/IHNwbGl0KGNsYXNzU3RyaW5nKSA6IGZhbHNlKS5maWx0ZXIoQm9vbGVhbik7XG4gIGxldCBhZGRlZCA9IFtdO1xuICBsZXQgcmVtb3ZlZCA9IFtdO1xuICBmb3JSZW1vdmUuZm9yRWFjaCgoaSkgPT4ge1xuICAgIGlmIChlbC5jbGFzc0xpc3QuY29udGFpbnMoaSkpIHtcbiAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoaSk7XG4gICAgICByZW1vdmVkLnB1c2goaSk7XG4gICAgfVxuICB9KTtcbiAgZm9yQWRkLmZvckVhY2goKGkpID0+IHtcbiAgICBpZiAoIWVsLmNsYXNzTGlzdC5jb250YWlucyhpKSkge1xuICAgICAgZWwuY2xhc3NMaXN0LmFkZChpKTtcbiAgICAgIGFkZGVkLnB1c2goaSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICByZW1vdmVkLmZvckVhY2goKGkpID0+IGVsLmNsYXNzTGlzdC5hZGQoaSkpO1xuICAgIGFkZGVkLmZvckVhY2goKGkpID0+IGVsLmNsYXNzTGlzdC5yZW1vdmUoaSkpO1xuICB9O1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvc3R5bGVzLmpzXG5mdW5jdGlvbiBzZXRTdHlsZXMoZWwsIHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICByZXR1cm4gc2V0U3R5bGVzRnJvbU9iamVjdChlbCwgdmFsdWUpO1xuICB9XG4gIHJldHVybiBzZXRTdHlsZXNGcm9tU3RyaW5nKGVsLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBzZXRTdHlsZXNGcm9tT2JqZWN0KGVsLCB2YWx1ZSkge1xuICBsZXQgcHJldmlvdXNTdHlsZXMgPSB7fTtcbiAgT2JqZWN0LmVudHJpZXModmFsdWUpLmZvckVhY2goKFtrZXksIHZhbHVlMl0pID0+IHtcbiAgICBwcmV2aW91c1N0eWxlc1trZXldID0gZWwuc3R5bGVba2V5XTtcbiAgICBpZiAoIWtleS5zdGFydHNXaXRoKFwiLS1cIikpIHtcbiAgICAgIGtleSA9IGtlYmFiQ2FzZShrZXkpO1xuICAgIH1cbiAgICBlbC5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlMik7XG4gIH0pO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBpZiAoZWwuc3R5bGUubGVuZ3RoID09PSAwKSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoXCJzdHlsZVwiKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHNldFN0eWxlcyhlbCwgcHJldmlvdXNTdHlsZXMpO1xuICB9O1xufVxuZnVuY3Rpb24gc2V0U3R5bGVzRnJvbVN0cmluZyhlbCwgdmFsdWUpIHtcbiAgbGV0IGNhY2hlID0gZWwuZ2V0QXR0cmlidXRlKFwic3R5bGVcIiwgdmFsdWUpO1xuICBlbC5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCB2YWx1ZSk7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgZWwuc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgY2FjaGUgfHwgXCJcIik7XG4gIH07XG59XG5mdW5jdGlvbiBrZWJhYkNhc2Uoc3ViamVjdCkge1xuICByZXR1cm4gc3ViamVjdC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCBcIiQxLSQyXCIpLnRvTG93ZXJDYXNlKCk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy9vbmNlLmpzXG5mdW5jdGlvbiBvbmNlKGNhbGxiYWNrLCBmYWxsYmFjayA9ICgpID0+IHtcbn0pIHtcbiAgbGV0IGNhbGxlZCA9IGZhbHNlO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC10cmFuc2l0aW9uLmpzXG5kaXJlY3RpdmUoXCJ0cmFuc2l0aW9uXCIsIChlbCwgeyB2YWx1ZSwgbW9kaWZpZXJzLCBleHByZXNzaW9uIH0sIHsgZXZhbHVhdGU6IGV2YWx1YXRlMiB9KSA9PiB7XG4gIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJmdW5jdGlvblwiKVxuICAgIGV4cHJlc3Npb24gPSBldmFsdWF0ZTIoZXhwcmVzc2lvbik7XG4gIGlmIChleHByZXNzaW9uID09PSBmYWxzZSlcbiAgICByZXR1cm47XG4gIGlmICghZXhwcmVzc2lvbiB8fCB0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJib29sZWFuXCIpIHtcbiAgICByZWdpc3RlclRyYW5zaXRpb25zRnJvbUhlbHBlcihlbCwgbW9kaWZpZXJzLCB2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVnaXN0ZXJUcmFuc2l0aW9uc0Zyb21DbGFzc1N0cmluZyhlbCwgZXhwcmVzc2lvbiwgdmFsdWUpO1xuICB9XG59KTtcbmZ1bmN0aW9uIHJlZ2lzdGVyVHJhbnNpdGlvbnNGcm9tQ2xhc3NTdHJpbmcoZWwsIGNsYXNzU3RyaW5nLCBzdGFnZSkge1xuICByZWdpc3RlclRyYW5zaXRpb25PYmplY3QoZWwsIHNldENsYXNzZXMsIFwiXCIpO1xuICBsZXQgZGlyZWN0aXZlU3RvcmFnZU1hcCA9IHtcbiAgICBcImVudGVyXCI6IChjbGFzc2VzKSA9PiB7XG4gICAgICBlbC5feF90cmFuc2l0aW9uLmVudGVyLmR1cmluZyA9IGNsYXNzZXM7XG4gICAgfSxcbiAgICBcImVudGVyLXN0YXJ0XCI6IChjbGFzc2VzKSA9PiB7XG4gICAgICBlbC5feF90cmFuc2l0aW9uLmVudGVyLnN0YXJ0ID0gY2xhc3NlcztcbiAgICB9LFxuICAgIFwiZW50ZXItZW5kXCI6IChjbGFzc2VzKSA9PiB7XG4gICAgICBlbC5feF90cmFuc2l0aW9uLmVudGVyLmVuZCA9IGNsYXNzZXM7XG4gICAgfSxcbiAgICBcImxlYXZlXCI6IChjbGFzc2VzKSA9PiB7XG4gICAgICBlbC5feF90cmFuc2l0aW9uLmxlYXZlLmR1cmluZyA9IGNsYXNzZXM7XG4gICAgfSxcbiAgICBcImxlYXZlLXN0YXJ0XCI6IChjbGFzc2VzKSA9PiB7XG4gICAgICBlbC5feF90cmFuc2l0aW9uLmxlYXZlLnN0YXJ0ID0gY2xhc3NlcztcbiAgICB9LFxuICAgIFwibGVhdmUtZW5kXCI6IChjbGFzc2VzKSA9PiB7XG4gICAgICBlbC5feF90cmFuc2l0aW9uLmxlYXZlLmVuZCA9IGNsYXNzZXM7XG4gICAgfVxuICB9O1xuICBkaXJlY3RpdmVTdG9yYWdlTWFwW3N0YWdlXShjbGFzc1N0cmluZyk7XG59XG5mdW5jdGlvbiByZWdpc3RlclRyYW5zaXRpb25zRnJvbUhlbHBlcihlbCwgbW9kaWZpZXJzLCBzdGFnZSkge1xuICByZWdpc3RlclRyYW5zaXRpb25PYmplY3QoZWwsIHNldFN0eWxlcyk7XG4gIGxldCBkb2VzbnRTcGVjaWZ5ID0gIW1vZGlmaWVycy5pbmNsdWRlcyhcImluXCIpICYmICFtb2RpZmllcnMuaW5jbHVkZXMoXCJvdXRcIikgJiYgIXN0YWdlO1xuICBsZXQgdHJhbnNpdGlvbmluZ0luID0gZG9lc250U3BlY2lmeSB8fCBtb2RpZmllcnMuaW5jbHVkZXMoXCJpblwiKSB8fCBbXCJlbnRlclwiXS5pbmNsdWRlcyhzdGFnZSk7XG4gIGxldCB0cmFuc2l0aW9uaW5nT3V0ID0gZG9lc250U3BlY2lmeSB8fCBtb2RpZmllcnMuaW5jbHVkZXMoXCJvdXRcIikgfHwgW1wibGVhdmVcIl0uaW5jbHVkZXMoc3RhZ2UpO1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiaW5cIikgJiYgIWRvZXNudFNwZWNpZnkpIHtcbiAgICBtb2RpZmllcnMgPSBtb2RpZmllcnMuZmlsdGVyKChpLCBpbmRleCkgPT4gaW5kZXggPCBtb2RpZmllcnMuaW5kZXhPZihcIm91dFwiKSk7XG4gIH1cbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcIm91dFwiKSAmJiAhZG9lc250U3BlY2lmeSkge1xuICAgIG1vZGlmaWVycyA9IG1vZGlmaWVycy5maWx0ZXIoKGksIGluZGV4KSA9PiBpbmRleCA+IG1vZGlmaWVycy5pbmRleE9mKFwib3V0XCIpKTtcbiAgfVxuICBsZXQgd2FudHNBbGwgPSAhbW9kaWZpZXJzLmluY2x1ZGVzKFwib3BhY2l0eVwiKSAmJiAhbW9kaWZpZXJzLmluY2x1ZGVzKFwic2NhbGVcIik7XG4gIGxldCB3YW50c09wYWNpdHkgPSB3YW50c0FsbCB8fCBtb2RpZmllcnMuaW5jbHVkZXMoXCJvcGFjaXR5XCIpO1xuICBsZXQgd2FudHNTY2FsZSA9IHdhbnRzQWxsIHx8IG1vZGlmaWVycy5pbmNsdWRlcyhcInNjYWxlXCIpO1xuICBsZXQgb3BhY2l0eVZhbHVlID0gd2FudHNPcGFjaXR5ID8gMCA6IDE7XG4gIGxldCBzY2FsZVZhbHVlID0gd2FudHNTY2FsZSA/IG1vZGlmaWVyVmFsdWUobW9kaWZpZXJzLCBcInNjYWxlXCIsIDk1KSAvIDEwMCA6IDE7XG4gIGxldCBkZWxheSA9IG1vZGlmaWVyVmFsdWUobW9kaWZpZXJzLCBcImRlbGF5XCIsIDApIC8gMWUzO1xuICBsZXQgb3JpZ2luID0gbW9kaWZpZXJWYWx1ZShtb2RpZmllcnMsIFwib3JpZ2luXCIsIFwiY2VudGVyXCIpO1xuICBsZXQgcHJvcGVydHkgPSBcIm9wYWNpdHksIHRyYW5zZm9ybVwiO1xuICBsZXQgZHVyYXRpb25JbiA9IG1vZGlmaWVyVmFsdWUobW9kaWZpZXJzLCBcImR1cmF0aW9uXCIsIDE1MCkgLyAxZTM7XG4gIGxldCBkdXJhdGlvbk91dCA9IG1vZGlmaWVyVmFsdWUobW9kaWZpZXJzLCBcImR1cmF0aW9uXCIsIDc1KSAvIDFlMztcbiAgbGV0IGVhc2luZyA9IGBjdWJpYy1iZXppZXIoMC40LCAwLjAsIDAuMiwgMSlgO1xuICBpZiAodHJhbnNpdGlvbmluZ0luKSB7XG4gICAgZWwuX3hfdHJhbnNpdGlvbi5lbnRlci5kdXJpbmcgPSB7XG4gICAgICB0cmFuc2Zvcm1PcmlnaW46IG9yaWdpbixcbiAgICAgIHRyYW5zaXRpb25EZWxheTogYCR7ZGVsYXl9c2AsXG4gICAgICB0cmFuc2l0aW9uUHJvcGVydHk6IHByb3BlcnR5LFxuICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uOiBgJHtkdXJhdGlvbklufXNgLFxuICAgICAgdHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uOiBlYXNpbmdcbiAgICB9O1xuICAgIGVsLl94X3RyYW5zaXRpb24uZW50ZXIuc3RhcnQgPSB7XG4gICAgICBvcGFjaXR5OiBvcGFjaXR5VmFsdWUsXG4gICAgICB0cmFuc2Zvcm06IGBzY2FsZSgke3NjYWxlVmFsdWV9KWBcbiAgICB9O1xuICAgIGVsLl94X3RyYW5zaXRpb24uZW50ZXIuZW5kID0ge1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIHRyYW5zZm9ybTogYHNjYWxlKDEpYFxuICAgIH07XG4gIH1cbiAgaWYgKHRyYW5zaXRpb25pbmdPdXQpIHtcbiAgICBlbC5feF90cmFuc2l0aW9uLmxlYXZlLmR1cmluZyA9IHtcbiAgICAgIHRyYW5zZm9ybU9yaWdpbjogb3JpZ2luLFxuICAgICAgdHJhbnNpdGlvbkRlbGF5OiBgJHtkZWxheX1zYCxcbiAgICAgIHRyYW5zaXRpb25Qcm9wZXJ0eTogcHJvcGVydHksXG4gICAgICB0cmFuc2l0aW9uRHVyYXRpb246IGAke2R1cmF0aW9uT3V0fXNgLFxuICAgICAgdHJhbnNpdGlvblRpbWluZ0Z1bmN0aW9uOiBlYXNpbmdcbiAgICB9O1xuICAgIGVsLl94X3RyYW5zaXRpb24ubGVhdmUuc3RhcnQgPSB7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgdHJhbnNmb3JtOiBgc2NhbGUoMSlgXG4gICAgfTtcbiAgICBlbC5feF90cmFuc2l0aW9uLmxlYXZlLmVuZCA9IHtcbiAgICAgIG9wYWNpdHk6IG9wYWNpdHlWYWx1ZSxcbiAgICAgIHRyYW5zZm9ybTogYHNjYWxlKCR7c2NhbGVWYWx1ZX0pYFxuICAgIH07XG4gIH1cbn1cbmZ1bmN0aW9uIHJlZ2lzdGVyVHJhbnNpdGlvbk9iamVjdChlbCwgc2V0RnVuY3Rpb24sIGRlZmF1bHRWYWx1ZSA9IHt9KSB7XG4gIGlmICghZWwuX3hfdHJhbnNpdGlvbilcbiAgICBlbC5feF90cmFuc2l0aW9uID0ge1xuICAgICAgZW50ZXI6IHsgZHVyaW5nOiBkZWZhdWx0VmFsdWUsIHN0YXJ0OiBkZWZhdWx0VmFsdWUsIGVuZDogZGVmYXVsdFZhbHVlIH0sXG4gICAgICBsZWF2ZTogeyBkdXJpbmc6IGRlZmF1bHRWYWx1ZSwgc3RhcnQ6IGRlZmF1bHRWYWx1ZSwgZW5kOiBkZWZhdWx0VmFsdWUgfSxcbiAgICAgIGluKGJlZm9yZSA9ICgpID0+IHtcbiAgICAgIH0sIGFmdGVyID0gKCkgPT4ge1xuICAgICAgfSkge1xuICAgICAgICB0cmFuc2l0aW9uKGVsLCBzZXRGdW5jdGlvbiwge1xuICAgICAgICAgIGR1cmluZzogdGhpcy5lbnRlci5kdXJpbmcsXG4gICAgICAgICAgc3RhcnQ6IHRoaXMuZW50ZXIuc3RhcnQsXG4gICAgICAgICAgZW5kOiB0aGlzLmVudGVyLmVuZFxuICAgICAgICB9LCBiZWZvcmUsIGFmdGVyKTtcbiAgICAgIH0sXG4gICAgICBvdXQoYmVmb3JlID0gKCkgPT4ge1xuICAgICAgfSwgYWZ0ZXIgPSAoKSA9PiB7XG4gICAgICB9KSB7XG4gICAgICAgIHRyYW5zaXRpb24oZWwsIHNldEZ1bmN0aW9uLCB7XG4gICAgICAgICAgZHVyaW5nOiB0aGlzLmxlYXZlLmR1cmluZyxcbiAgICAgICAgICBzdGFydDogdGhpcy5sZWF2ZS5zdGFydCxcbiAgICAgICAgICBlbmQ6IHRoaXMubGVhdmUuZW5kXG4gICAgICAgIH0sIGJlZm9yZSwgYWZ0ZXIpO1xuICAgICAgfVxuICAgIH07XG59XG53aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuX3hfdG9nZ2xlQW5kQ2FzY2FkZVdpdGhUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uKGVsLCB2YWx1ZSwgc2hvdywgaGlkZSkge1xuICBjb25zdCBuZXh0VGljazIgPSBkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgPT09IFwidmlzaWJsZVwiID8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIDogc2V0VGltZW91dDtcbiAgbGV0IGNsaWNrQXdheUNvbXBhdGlibGVTaG93ID0gKCkgPT4gbmV4dFRpY2syKHNob3cpO1xuICBpZiAodmFsdWUpIHtcbiAgICBpZiAoZWwuX3hfdHJhbnNpdGlvbiAmJiAoZWwuX3hfdHJhbnNpdGlvbi5lbnRlciB8fCBlbC5feF90cmFuc2l0aW9uLmxlYXZlKSkge1xuICAgICAgZWwuX3hfdHJhbnNpdGlvbi5lbnRlciAmJiAoT2JqZWN0LmVudHJpZXMoZWwuX3hfdHJhbnNpdGlvbi5lbnRlci5kdXJpbmcpLmxlbmd0aCB8fCBPYmplY3QuZW50cmllcyhlbC5feF90cmFuc2l0aW9uLmVudGVyLnN0YXJ0KS5sZW5ndGggfHwgT2JqZWN0LmVudHJpZXMoZWwuX3hfdHJhbnNpdGlvbi5lbnRlci5lbmQpLmxlbmd0aCkgPyBlbC5feF90cmFuc2l0aW9uLmluKHNob3cpIDogY2xpY2tBd2F5Q29tcGF0aWJsZVNob3coKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuX3hfdHJhbnNpdGlvbiA/IGVsLl94X3RyYW5zaXRpb24uaW4oc2hvdykgOiBjbGlja0F3YXlDb21wYXRpYmxlU2hvdygpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgZWwuX3hfaGlkZVByb21pc2UgPSBlbC5feF90cmFuc2l0aW9uID8gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGVsLl94X3RyYW5zaXRpb24ub3V0KCgpID0+IHtcbiAgICB9LCAoKSA9PiByZXNvbHZlKGhpZGUpKTtcbiAgICBlbC5feF90cmFuc2l0aW9uaW5nICYmIGVsLl94X3RyYW5zaXRpb25pbmcuYmVmb3JlQ2FuY2VsKCgpID0+IHJlamVjdCh7IGlzRnJvbUNhbmNlbGxlZFRyYW5zaXRpb246IHRydWUgfSkpO1xuICB9KSA6IFByb21pc2UucmVzb2x2ZShoaWRlKTtcbiAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgIGxldCBjbG9zZXN0ID0gY2xvc2VzdEhpZGUoZWwpO1xuICAgIGlmIChjbG9zZXN0KSB7XG4gICAgICBpZiAoIWNsb3Nlc3QuX3hfaGlkZUNoaWxkcmVuKVxuICAgICAgICBjbG9zZXN0Ll94X2hpZGVDaGlsZHJlbiA9IFtdO1xuICAgICAgY2xvc2VzdC5feF9oaWRlQ2hpbGRyZW4ucHVzaChlbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHRUaWNrMigoKSA9PiB7XG4gICAgICAgIGxldCBoaWRlQWZ0ZXJDaGlsZHJlbiA9IChlbDIpID0+IHtcbiAgICAgICAgICBsZXQgY2FycnkgPSBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICBlbDIuX3hfaGlkZVByb21pc2UsXG4gICAgICAgICAgICAuLi4oZWwyLl94X2hpZGVDaGlsZHJlbiB8fCBbXSkubWFwKGhpZGVBZnRlckNoaWxkcmVuKVxuICAgICAgICAgIF0pLnRoZW4oKFtpXSkgPT4gaT8uKCkpO1xuICAgICAgICAgIGRlbGV0ZSBlbDIuX3hfaGlkZVByb21pc2U7XG4gICAgICAgICAgZGVsZXRlIGVsMi5feF9oaWRlQ2hpbGRyZW47XG4gICAgICAgICAgcmV0dXJuIGNhcnJ5O1xuICAgICAgICB9O1xuICAgICAgICBoaWRlQWZ0ZXJDaGlsZHJlbihlbCkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICBpZiAoIWUuaXNGcm9tQ2FuY2VsbGVkVHJhbnNpdGlvbilcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn07XG5mdW5jdGlvbiBjbG9zZXN0SGlkZShlbCkge1xuICBsZXQgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgaWYgKCFwYXJlbnQpXG4gICAgcmV0dXJuO1xuICByZXR1cm4gcGFyZW50Ll94X2hpZGVQcm9taXNlID8gcGFyZW50IDogY2xvc2VzdEhpZGUocGFyZW50KTtcbn1cbmZ1bmN0aW9uIHRyYW5zaXRpb24oZWwsIHNldEZ1bmN0aW9uLCB7IGR1cmluZywgc3RhcnQ6IHN0YXJ0MiwgZW5kIH0gPSB7fSwgYmVmb3JlID0gKCkgPT4ge1xufSwgYWZ0ZXIgPSAoKSA9PiB7XG59KSB7XG4gIGlmIChlbC5feF90cmFuc2l0aW9uaW5nKVxuICAgIGVsLl94X3RyYW5zaXRpb25pbmcuY2FuY2VsKCk7XG4gIGlmIChPYmplY3Qua2V5cyhkdXJpbmcpLmxlbmd0aCA9PT0gMCAmJiBPYmplY3Qua2V5cyhzdGFydDIpLmxlbmd0aCA9PT0gMCAmJiBPYmplY3Qua2V5cyhlbmQpLmxlbmd0aCA9PT0gMCkge1xuICAgIGJlZm9yZSgpO1xuICAgIGFmdGVyKCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCB1bmRvU3RhcnQsIHVuZG9EdXJpbmcsIHVuZG9FbmQ7XG4gIHBlcmZvcm1UcmFuc2l0aW9uKGVsLCB7XG4gICAgc3RhcnQoKSB7XG4gICAgICB1bmRvU3RhcnQgPSBzZXRGdW5jdGlvbihlbCwgc3RhcnQyKTtcbiAgICB9LFxuICAgIGR1cmluZygpIHtcbiAgICAgIHVuZG9EdXJpbmcgPSBzZXRGdW5jdGlvbihlbCwgZHVyaW5nKTtcbiAgICB9LFxuICAgIGJlZm9yZSxcbiAgICBlbmQoKSB7XG4gICAgICB1bmRvU3RhcnQoKTtcbiAgICAgIHVuZG9FbmQgPSBzZXRGdW5jdGlvbihlbCwgZW5kKTtcbiAgICB9LFxuICAgIGFmdGVyLFxuICAgIGNsZWFudXAoKSB7XG4gICAgICB1bmRvRHVyaW5nKCk7XG4gICAgICB1bmRvRW5kKCk7XG4gICAgfVxuICB9KTtcbn1cbmZ1bmN0aW9uIHBlcmZvcm1UcmFuc2l0aW9uKGVsLCBzdGFnZXMpIHtcbiAgbGV0IGludGVycnVwdGVkLCByZWFjaGVkQmVmb3JlLCByZWFjaGVkRW5kO1xuICBsZXQgZmluaXNoID0gb25jZSgoKSA9PiB7XG4gICAgbXV0YXRlRG9tKCgpID0+IHtcbiAgICAgIGludGVycnVwdGVkID0gdHJ1ZTtcbiAgICAgIGlmICghcmVhY2hlZEJlZm9yZSlcbiAgICAgICAgc3RhZ2VzLmJlZm9yZSgpO1xuICAgICAgaWYgKCFyZWFjaGVkRW5kKSB7XG4gICAgICAgIHN0YWdlcy5lbmQoKTtcbiAgICAgICAgcmVsZWFzZU5leHRUaWNrcygpO1xuICAgICAgfVxuICAgICAgc3RhZ2VzLmFmdGVyKCk7XG4gICAgICBpZiAoZWwuaXNDb25uZWN0ZWQpXG4gICAgICAgIHN0YWdlcy5jbGVhbnVwKCk7XG4gICAgICBkZWxldGUgZWwuX3hfdHJhbnNpdGlvbmluZztcbiAgICB9KTtcbiAgfSk7XG4gIGVsLl94X3RyYW5zaXRpb25pbmcgPSB7XG4gICAgYmVmb3JlQ2FuY2VsczogW10sXG4gICAgYmVmb3JlQ2FuY2VsKGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmJlZm9yZUNhbmNlbHMucHVzaChjYWxsYmFjayk7XG4gICAgfSxcbiAgICBjYW5jZWw6IG9uY2UoZnVuY3Rpb24oKSB7XG4gICAgICB3aGlsZSAodGhpcy5iZWZvcmVDYW5jZWxzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmJlZm9yZUNhbmNlbHMuc2hpZnQoKSgpO1xuICAgICAgfVxuICAgICAgO1xuICAgICAgZmluaXNoKCk7XG4gICAgfSksXG4gICAgZmluaXNoXG4gIH07XG4gIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgc3RhZ2VzLnN0YXJ0KCk7XG4gICAgc3RhZ2VzLmR1cmluZygpO1xuICB9KTtcbiAgaG9sZE5leHRUaWNrcygpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGlmIChpbnRlcnJ1cHRlZClcbiAgICAgIHJldHVybjtcbiAgICBsZXQgZHVyYXRpb24gPSBOdW1iZXIoZ2V0Q29tcHV0ZWRTdHlsZShlbCkudHJhbnNpdGlvbkR1cmF0aW9uLnJlcGxhY2UoLywuKi8sIFwiXCIpLnJlcGxhY2UoXCJzXCIsIFwiXCIpKSAqIDFlMztcbiAgICBsZXQgZGVsYXkgPSBOdW1iZXIoZ2V0Q29tcHV0ZWRTdHlsZShlbCkudHJhbnNpdGlvbkRlbGF5LnJlcGxhY2UoLywuKi8sIFwiXCIpLnJlcGxhY2UoXCJzXCIsIFwiXCIpKSAqIDFlMztcbiAgICBpZiAoZHVyYXRpb24gPT09IDApXG4gICAgICBkdXJhdGlvbiA9IE51bWJlcihnZXRDb21wdXRlZFN0eWxlKGVsKS5hbmltYXRpb25EdXJhdGlvbi5yZXBsYWNlKFwic1wiLCBcIlwiKSkgKiAxZTM7XG4gICAgbXV0YXRlRG9tKCgpID0+IHtcbiAgICAgIHN0YWdlcy5iZWZvcmUoKTtcbiAgICB9KTtcbiAgICByZWFjaGVkQmVmb3JlID0gdHJ1ZTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgaWYgKGludGVycnVwdGVkKVxuICAgICAgICByZXR1cm47XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBzdGFnZXMuZW5kKCk7XG4gICAgICB9KTtcbiAgICAgIHJlbGVhc2VOZXh0VGlja3MoKTtcbiAgICAgIHNldFRpbWVvdXQoZWwuX3hfdHJhbnNpdGlvbmluZy5maW5pc2gsIGR1cmF0aW9uICsgZGVsYXkpO1xuICAgICAgcmVhY2hlZEVuZCA9IHRydWU7XG4gICAgfSk7XG4gIH0pO1xufVxuZnVuY3Rpb24gbW9kaWZpZXJWYWx1ZShtb2RpZmllcnMsIGtleSwgZmFsbGJhY2spIHtcbiAgaWYgKG1vZGlmaWVycy5pbmRleE9mKGtleSkgPT09IC0xKVxuICAgIHJldHVybiBmYWxsYmFjaztcbiAgY29uc3QgcmF3VmFsdWUgPSBtb2RpZmllcnNbbW9kaWZpZXJzLmluZGV4T2Yoa2V5KSArIDFdO1xuICBpZiAoIXJhd1ZhbHVlKVxuICAgIHJldHVybiBmYWxsYmFjaztcbiAgaWYgKGtleSA9PT0gXCJzY2FsZVwiKSB7XG4gICAgaWYgKGlzTmFOKHJhd1ZhbHVlKSlcbiAgICAgIHJldHVybiBmYWxsYmFjaztcbiAgfVxuICBpZiAoa2V5ID09PSBcImR1cmF0aW9uXCIgfHwga2V5ID09PSBcImRlbGF5XCIpIHtcbiAgICBsZXQgbWF0Y2ggPSByYXdWYWx1ZS5tYXRjaCgvKFswLTldKyltcy8pO1xuICAgIGlmIChtYXRjaClcbiAgICAgIHJldHVybiBtYXRjaFsxXTtcbiAgfVxuICBpZiAoa2V5ID09PSBcIm9yaWdpblwiKSB7XG4gICAgaWYgKFtcInRvcFwiLCBcInJpZ2h0XCIsIFwibGVmdFwiLCBcImNlbnRlclwiLCBcImJvdHRvbVwiXS5pbmNsdWRlcyhtb2RpZmllcnNbbW9kaWZpZXJzLmluZGV4T2Yoa2V5KSArIDJdKSkge1xuICAgICAgcmV0dXJuIFtyYXdWYWx1ZSwgbW9kaWZpZXJzW21vZGlmaWVycy5pbmRleE9mKGtleSkgKyAyXV0uam9pbihcIiBcIik7XG4gICAgfVxuICB9XG4gIHJldHVybiByYXdWYWx1ZTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2Nsb25lLmpzXG52YXIgaXNDbG9uaW5nID0gZmFsc2U7XG5mdW5jdGlvbiBza2lwRHVyaW5nQ2xvbmUoY2FsbGJhY2ssIGZhbGxiYWNrID0gKCkgPT4ge1xufSkge1xuICByZXR1cm4gKC4uLmFyZ3MpID0+IGlzQ2xvbmluZyA/IGZhbGxiYWNrKC4uLmFyZ3MpIDogY2FsbGJhY2soLi4uYXJncyk7XG59XG5mdW5jdGlvbiBvbmx5RHVyaW5nQ2xvbmUoY2FsbGJhY2spIHtcbiAgcmV0dXJuICguLi5hcmdzKSA9PiBpc0Nsb25pbmcgJiYgY2FsbGJhY2soLi4uYXJncyk7XG59XG52YXIgaW50ZXJjZXB0b3JzID0gW107XG5mdW5jdGlvbiBpbnRlcmNlcHRDbG9uZShjYWxsYmFjaykge1xuICBpbnRlcmNlcHRvcnMucHVzaChjYWxsYmFjayk7XG59XG5mdW5jdGlvbiBjbG9uZU5vZGUoZnJvbSwgdG8pIHtcbiAgaW50ZXJjZXB0b3JzLmZvckVhY2goKGkpID0+IGkoZnJvbSwgdG8pKTtcbiAgaXNDbG9uaW5nID0gdHJ1ZTtcbiAgZG9udFJlZ2lzdGVyUmVhY3RpdmVTaWRlRWZmZWN0cygoKSA9PiB7XG4gICAgaW5pdFRyZWUodG8sIChlbCwgY2FsbGJhY2spID0+IHtcbiAgICAgIGNhbGxiYWNrKGVsLCAoKSA9PiB7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG4gIGlzQ2xvbmluZyA9IGZhbHNlO1xufVxudmFyIGlzQ2xvbmluZ0xlZ2FjeSA9IGZhbHNlO1xuZnVuY3Rpb24gY2xvbmUob2xkRWwsIG5ld0VsKSB7XG4gIGlmICghbmV3RWwuX3hfZGF0YVN0YWNrKVxuICAgIG5ld0VsLl94X2RhdGFTdGFjayA9IG9sZEVsLl94X2RhdGFTdGFjaztcbiAgaXNDbG9uaW5nID0gdHJ1ZTtcbiAgaXNDbG9uaW5nTGVnYWN5ID0gdHJ1ZTtcbiAgZG9udFJlZ2lzdGVyUmVhY3RpdmVTaWRlRWZmZWN0cygoKSA9PiB7XG4gICAgY2xvbmVUcmVlKG5ld0VsKTtcbiAgfSk7XG4gIGlzQ2xvbmluZyA9IGZhbHNlO1xuICBpc0Nsb25pbmdMZWdhY3kgPSBmYWxzZTtcbn1cbmZ1bmN0aW9uIGNsb25lVHJlZShlbCkge1xuICBsZXQgaGFzUnVuVGhyb3VnaEZpcnN0RWwgPSBmYWxzZTtcbiAgbGV0IHNoYWxsb3dXYWxrZXIgPSAoZWwyLCBjYWxsYmFjaykgPT4ge1xuICAgIHdhbGsoZWwyLCAoZWwzLCBza2lwKSA9PiB7XG4gICAgICBpZiAoaGFzUnVuVGhyb3VnaEZpcnN0RWwgJiYgaXNSb290KGVsMykpXG4gICAgICAgIHJldHVybiBza2lwKCk7XG4gICAgICBoYXNSdW5UaHJvdWdoRmlyc3RFbCA9IHRydWU7XG4gICAgICBjYWxsYmFjayhlbDMsIHNraXApO1xuICAgIH0pO1xuICB9O1xuICBpbml0VHJlZShlbCwgc2hhbGxvd1dhbGtlcik7XG59XG5mdW5jdGlvbiBkb250UmVnaXN0ZXJSZWFjdGl2ZVNpZGVFZmZlY3RzKGNhbGxiYWNrKSB7XG4gIGxldCBjYWNoZSA9IGVmZmVjdDtcbiAgb3ZlcnJpZGVFZmZlY3QoKGNhbGxiYWNrMiwgZWwpID0+IHtcbiAgICBsZXQgc3RvcmVkRWZmZWN0ID0gY2FjaGUoY2FsbGJhY2syKTtcbiAgICByZWxlYXNlKHN0b3JlZEVmZmVjdCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICB9O1xuICB9KTtcbiAgY2FsbGJhY2soKTtcbiAgb3ZlcnJpZGVFZmZlY3QoY2FjaGUpO1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvYmluZC5qc1xuZnVuY3Rpb24gYmluZChlbCwgbmFtZSwgdmFsdWUsIG1vZGlmaWVycyA9IFtdKSB7XG4gIGlmICghZWwuX3hfYmluZGluZ3MpXG4gICAgZWwuX3hfYmluZGluZ3MgPSByZWFjdGl2ZSh7fSk7XG4gIGVsLl94X2JpbmRpbmdzW25hbWVdID0gdmFsdWU7XG4gIG5hbWUgPSBtb2RpZmllcnMuaW5jbHVkZXMoXCJjYW1lbFwiKSA/IGNhbWVsQ2FzZShuYW1lKSA6IG5hbWU7XG4gIHN3aXRjaCAobmFtZSkge1xuICAgIGNhc2UgXCJ2YWx1ZVwiOlxuICAgICAgYmluZElucHV0VmFsdWUoZWwsIHZhbHVlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJzdHlsZVwiOlxuICAgICAgYmluZFN0eWxlcyhlbCwgdmFsdWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImNsYXNzXCI6XG4gICAgICBiaW5kQ2xhc3NlcyhlbCwgdmFsdWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInNlbGVjdGVkXCI6XG4gICAgY2FzZSBcImNoZWNrZWRcIjpcbiAgICAgIGJpbmRBdHRyaWJ1dGVBbmRQcm9wZXJ0eShlbCwgbmFtZSwgdmFsdWUpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJpbmRBdHRyaWJ1dGUoZWwsIG5hbWUsIHZhbHVlKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5mdW5jdGlvbiBiaW5kSW5wdXRWYWx1ZShlbCwgdmFsdWUpIHtcbiAgaWYgKGlzUmFkaW8oZWwpKSB7XG4gICAgaWYgKGVsLmF0dHJpYnV0ZXMudmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgZWwudmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKHdpbmRvdy5mcm9tTW9kZWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgIGVsLmNoZWNrZWQgPSBzYWZlUGFyc2VCb29sZWFuKGVsLnZhbHVlKSA9PT0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jaGVja2VkID0gY2hlY2tlZEF0dHJMb29zZUNvbXBhcmUoZWwudmFsdWUsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNDaGVja2JveChlbCkpIHtcbiAgICBpZiAoTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkpIHtcbiAgICAgIGVsLnZhbHVlID0gdmFsdWU7XG4gICAgfSBlbHNlIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlICE9PSBcImJvb2xlYW5cIiAmJiAhW251bGwsIHZvaWQgMF0uaW5jbHVkZXModmFsdWUpKSB7XG4gICAgICBlbC52YWx1ZSA9IFN0cmluZyh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICBlbC5jaGVja2VkID0gdmFsdWUuc29tZSgodmFsKSA9PiBjaGVja2VkQXR0ckxvb3NlQ29tcGFyZSh2YWwsIGVsLnZhbHVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jaGVja2VkID0gISF2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoZWwudGFnTmFtZSA9PT0gXCJTRUxFQ1RcIikge1xuICAgIHVwZGF0ZVNlbGVjdChlbCwgdmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChlbC52YWx1ZSA9PT0gdmFsdWUpXG4gICAgICByZXR1cm47XG4gICAgZWwudmFsdWUgPSB2YWx1ZSA9PT0gdm9pZCAwID8gXCJcIiA6IHZhbHVlO1xuICB9XG59XG5mdW5jdGlvbiBiaW5kQ2xhc3NlcyhlbCwgdmFsdWUpIHtcbiAgaWYgKGVsLl94X3VuZG9BZGRlZENsYXNzZXMpXG4gICAgZWwuX3hfdW5kb0FkZGVkQ2xhc3NlcygpO1xuICBlbC5feF91bmRvQWRkZWRDbGFzc2VzID0gc2V0Q2xhc3NlcyhlbCwgdmFsdWUpO1xufVxuZnVuY3Rpb24gYmluZFN0eWxlcyhlbCwgdmFsdWUpIHtcbiAgaWYgKGVsLl94X3VuZG9BZGRlZFN0eWxlcylcbiAgICBlbC5feF91bmRvQWRkZWRTdHlsZXMoKTtcbiAgZWwuX3hfdW5kb0FkZGVkU3R5bGVzID0gc2V0U3R5bGVzKGVsLCB2YWx1ZSk7XG59XG5mdW5jdGlvbiBiaW5kQXR0cmlidXRlQW5kUHJvcGVydHkoZWwsIG5hbWUsIHZhbHVlKSB7XG4gIGJpbmRBdHRyaWJ1dGUoZWwsIG5hbWUsIHZhbHVlKTtcbiAgc2V0UHJvcGVydHlJZkNoYW5nZWQoZWwsIG5hbWUsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIGJpbmRBdHRyaWJ1dGUoZWwsIG5hbWUsIHZhbHVlKSB7XG4gIGlmIChbbnVsbCwgdm9pZCAwLCBmYWxzZV0uaW5jbHVkZXModmFsdWUpICYmIGF0dHJpYnV0ZVNob3VsZG50QmVQcmVzZXJ2ZWRJZkZhbHN5KG5hbWUpKSB7XG4gICAgZWwucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGlmIChpc0Jvb2xlYW5BdHRyKG5hbWUpKVxuICAgICAgdmFsdWUgPSBuYW1lO1xuICAgIHNldElmQ2hhbmdlZChlbCwgbmFtZSwgdmFsdWUpO1xuICB9XG59XG5mdW5jdGlvbiBzZXRJZkNoYW5nZWQoZWwsIGF0dHJOYW1lLCB2YWx1ZSkge1xuICBpZiAoZWwuZ2V0QXR0cmlidXRlKGF0dHJOYW1lKSAhPSB2YWx1ZSkge1xuICAgIGVsLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgdmFsdWUpO1xuICB9XG59XG5mdW5jdGlvbiBzZXRQcm9wZXJ0eUlmQ2hhbmdlZChlbCwgcHJvcE5hbWUsIHZhbHVlKSB7XG4gIGlmIChlbFtwcm9wTmFtZV0gIT09IHZhbHVlKSB7XG4gICAgZWxbcHJvcE5hbWVdID0gdmFsdWU7XG4gIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZVNlbGVjdChlbCwgdmFsdWUpIHtcbiAgY29uc3QgYXJyYXlXcmFwcGVkVmFsdWUgPSBbXS5jb25jYXQodmFsdWUpLm1hcCgodmFsdWUyKSA9PiB7XG4gICAgcmV0dXJuIHZhbHVlMiArIFwiXCI7XG4gIH0pO1xuICBBcnJheS5mcm9tKGVsLm9wdGlvbnMpLmZvckVhY2goKG9wdGlvbikgPT4ge1xuICAgIG9wdGlvbi5zZWxlY3RlZCA9IGFycmF5V3JhcHBlZFZhbHVlLmluY2x1ZGVzKG9wdGlvbi52YWx1ZSk7XG4gIH0pO1xufVxuZnVuY3Rpb24gY2FtZWxDYXNlKHN1YmplY3QpIHtcbiAgcmV0dXJuIHN1YmplY3QudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8tKFxcdykvZywgKG1hdGNoLCBjaGFyKSA9PiBjaGFyLnRvVXBwZXJDYXNlKCkpO1xufVxuZnVuY3Rpb24gY2hlY2tlZEF0dHJMb29zZUNvbXBhcmUodmFsdWVBLCB2YWx1ZUIpIHtcbiAgcmV0dXJuIHZhbHVlQSA9PSB2YWx1ZUI7XG59XG5mdW5jdGlvbiBzYWZlUGFyc2VCb29sZWFuKHJhd1ZhbHVlKSB7XG4gIGlmIChbMSwgXCIxXCIsIFwidHJ1ZVwiLCBcIm9uXCIsIFwieWVzXCIsIHRydWVdLmluY2x1ZGVzKHJhd1ZhbHVlKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChbMCwgXCIwXCIsIFwiZmFsc2VcIiwgXCJvZmZcIiwgXCJub1wiLCBmYWxzZV0uaW5jbHVkZXMocmF3VmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiByYXdWYWx1ZSA/IEJvb2xlYW4ocmF3VmFsdWUpIDogbnVsbDtcbn1cbnZhciBib29sZWFuQXR0cmlidXRlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KFtcbiAgXCJhbGxvd2Z1bGxzY3JlZW5cIixcbiAgXCJhc3luY1wiLFxuICBcImF1dG9mb2N1c1wiLFxuICBcImF1dG9wbGF5XCIsXG4gIFwiY2hlY2tlZFwiLFxuICBcImNvbnRyb2xzXCIsXG4gIFwiZGVmYXVsdFwiLFxuICBcImRlZmVyXCIsXG4gIFwiZGlzYWJsZWRcIixcbiAgXCJmb3Jtbm92YWxpZGF0ZVwiLFxuICBcImluZXJ0XCIsXG4gIFwiaXNtYXBcIixcbiAgXCJpdGVtc2NvcGVcIixcbiAgXCJsb29wXCIsXG4gIFwibXVsdGlwbGVcIixcbiAgXCJtdXRlZFwiLFxuICBcIm5vbW9kdWxlXCIsXG4gIFwibm92YWxpZGF0ZVwiLFxuICBcIm9wZW5cIixcbiAgXCJwbGF5c2lubGluZVwiLFxuICBcInJlYWRvbmx5XCIsXG4gIFwicmVxdWlyZWRcIixcbiAgXCJyZXZlcnNlZFwiLFxuICBcInNlbGVjdGVkXCIsXG4gIFwic2hhZG93cm9vdGNsb25hYmxlXCIsXG4gIFwic2hhZG93cm9vdGRlbGVnYXRlc2ZvY3VzXCIsXG4gIFwic2hhZG93cm9vdHNlcmlhbGl6YWJsZVwiXG5dKTtcbmZ1bmN0aW9uIGlzQm9vbGVhbkF0dHIoYXR0ck5hbWUpIHtcbiAgcmV0dXJuIGJvb2xlYW5BdHRyaWJ1dGVzLmhhcyhhdHRyTmFtZSk7XG59XG5mdW5jdGlvbiBhdHRyaWJ1dGVTaG91bGRudEJlUHJlc2VydmVkSWZGYWxzeShuYW1lKSB7XG4gIHJldHVybiAhW1wiYXJpYS1wcmVzc2VkXCIsIFwiYXJpYS1jaGVja2VkXCIsIFwiYXJpYS1leHBhbmRlZFwiLCBcImFyaWEtc2VsZWN0ZWRcIl0uaW5jbHVkZXMobmFtZSk7XG59XG5mdW5jdGlvbiBnZXRCaW5kaW5nKGVsLCBuYW1lLCBmYWxsYmFjaykge1xuICBpZiAoZWwuX3hfYmluZGluZ3MgJiYgZWwuX3hfYmluZGluZ3NbbmFtZV0gIT09IHZvaWQgMClcbiAgICByZXR1cm4gZWwuX3hfYmluZGluZ3NbbmFtZV07XG4gIHJldHVybiBnZXRBdHRyaWJ1dGVCaW5kaW5nKGVsLCBuYW1lLCBmYWxsYmFjayk7XG59XG5mdW5jdGlvbiBleHRyYWN0UHJvcChlbCwgbmFtZSwgZmFsbGJhY2ssIGV4dHJhY3QgPSB0cnVlKSB7XG4gIGlmIChlbC5feF9iaW5kaW5ncyAmJiBlbC5feF9iaW5kaW5nc1tuYW1lXSAhPT0gdm9pZCAwKVxuICAgIHJldHVybiBlbC5feF9iaW5kaW5nc1tuYW1lXTtcbiAgaWYgKGVsLl94X2lubGluZUJpbmRpbmdzICYmIGVsLl94X2lubGluZUJpbmRpbmdzW25hbWVdICE9PSB2b2lkIDApIHtcbiAgICBsZXQgYmluZGluZyA9IGVsLl94X2lubGluZUJpbmRpbmdzW25hbWVdO1xuICAgIGJpbmRpbmcuZXh0cmFjdCA9IGV4dHJhY3Q7XG4gICAgcmV0dXJuIGRvbnRBdXRvRXZhbHVhdGVGdW5jdGlvbnMoKCkgPT4ge1xuICAgICAgcmV0dXJuIGV2YWx1YXRlKGVsLCBiaW5kaW5nLmV4cHJlc3Npb24pO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBnZXRBdHRyaWJ1dGVCaW5kaW5nKGVsLCBuYW1lLCBmYWxsYmFjayk7XG59XG5mdW5jdGlvbiBnZXRBdHRyaWJ1dGVCaW5kaW5nKGVsLCBuYW1lLCBmYWxsYmFjaykge1xuICBsZXQgYXR0ciA9IGVsLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgaWYgKGF0dHIgPT09IG51bGwpXG4gICAgcmV0dXJuIHR5cGVvZiBmYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiID8gZmFsbGJhY2soKSA6IGZhbGxiYWNrO1xuICBpZiAoYXR0ciA9PT0gXCJcIilcbiAgICByZXR1cm4gdHJ1ZTtcbiAgaWYgKGlzQm9vbGVhbkF0dHIobmFtZSkpIHtcbiAgICByZXR1cm4gISFbbmFtZSwgXCJ0cnVlXCJdLmluY2x1ZGVzKGF0dHIpO1xuICB9XG4gIHJldHVybiBhdHRyO1xufVxuZnVuY3Rpb24gaXNDaGVja2JveChlbCkge1xuICByZXR1cm4gZWwudHlwZSA9PT0gXCJjaGVja2JveFwiIHx8IGVsLmxvY2FsTmFtZSA9PT0gXCJ1aS1jaGVja2JveFwiIHx8IGVsLmxvY2FsTmFtZSA9PT0gXCJ1aS1zd2l0Y2hcIjtcbn1cbmZ1bmN0aW9uIGlzUmFkaW8oZWwpIHtcbiAgcmV0dXJuIGVsLnR5cGUgPT09IFwicmFkaW9cIiB8fCBlbC5sb2NhbE5hbWUgPT09IFwidWktcmFkaW9cIjtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL3V0aWxzL2RlYm91bmNlLmpzXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0KSB7XG4gIGxldCB0aW1lb3V0O1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgY29uc3QgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB9O1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gIH07XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy91dGlscy90aHJvdHRsZS5qc1xuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgbGltaXQpIHtcbiAgbGV0IGluVGhyb3R0bGU7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBsZXQgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgaWYgKCFpblRocm90dGxlKSB7XG4gICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgaW5UaHJvdHRsZSA9IHRydWU7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IGluVGhyb3R0bGUgPSBmYWxzZSwgbGltaXQpO1xuICAgIH1cbiAgfTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2VudGFuZ2xlLmpzXG5mdW5jdGlvbiBlbnRhbmdsZSh7IGdldDogb3V0ZXJHZXQsIHNldDogb3V0ZXJTZXQgfSwgeyBnZXQ6IGlubmVyR2V0LCBzZXQ6IGlubmVyU2V0IH0pIHtcbiAgbGV0IGZpcnN0UnVuID0gdHJ1ZTtcbiAgbGV0IG91dGVySGFzaDtcbiAgbGV0IGlubmVySGFzaDtcbiAgbGV0IHJlZmVyZW5jZSA9IGVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IG91dGVyID0gb3V0ZXJHZXQoKTtcbiAgICBsZXQgaW5uZXIgPSBpbm5lckdldCgpO1xuICAgIGlmIChmaXJzdFJ1bikge1xuICAgICAgaW5uZXJTZXQoY2xvbmVJZk9iamVjdChvdXRlcikpO1xuICAgICAgZmlyc3RSdW4gPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG91dGVySGFzaExhdGVzdCA9IEpTT04uc3RyaW5naWZ5KG91dGVyKTtcbiAgICAgIGxldCBpbm5lckhhc2hMYXRlc3QgPSBKU09OLnN0cmluZ2lmeShpbm5lcik7XG4gICAgICBpZiAob3V0ZXJIYXNoTGF0ZXN0ICE9PSBvdXRlckhhc2gpIHtcbiAgICAgICAgaW5uZXJTZXQoY2xvbmVJZk9iamVjdChvdXRlcikpO1xuICAgICAgfSBlbHNlIGlmIChvdXRlckhhc2hMYXRlc3QgIT09IGlubmVySGFzaExhdGVzdCkge1xuICAgICAgICBvdXRlclNldChjbG9uZUlmT2JqZWN0KGlubmVyKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgfVxuICAgIH1cbiAgICBvdXRlckhhc2ggPSBKU09OLnN0cmluZ2lmeShvdXRlckdldCgpKTtcbiAgICBpbm5lckhhc2ggPSBKU09OLnN0cmluZ2lmeShpbm5lckdldCgpKTtcbiAgfSk7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgcmVsZWFzZShyZWZlcmVuY2UpO1xuICB9O1xufVxuZnVuY3Rpb24gY2xvbmVJZk9iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiID8gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpIDogdmFsdWU7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9wbHVnaW4uanNcbmZ1bmN0aW9uIHBsdWdpbihjYWxsYmFjaykge1xuICBsZXQgY2FsbGJhY2tzID0gQXJyYXkuaXNBcnJheShjYWxsYmFjaykgPyBjYWxsYmFjayA6IFtjYWxsYmFja107XG4gIGNhbGxiYWNrcy5mb3JFYWNoKChpKSA9PiBpKGFscGluZV9kZWZhdWx0KSk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9zdG9yZS5qc1xudmFyIHN0b3JlcyA9IHt9O1xudmFyIGlzUmVhY3RpdmUgPSBmYWxzZTtcbmZ1bmN0aW9uIHN0b3JlKG5hbWUsIHZhbHVlKSB7XG4gIGlmICghaXNSZWFjdGl2ZSkge1xuICAgIHN0b3JlcyA9IHJlYWN0aXZlKHN0b3Jlcyk7XG4gICAgaXNSZWFjdGl2ZSA9IHRydWU7XG4gIH1cbiAgaWYgKHZhbHVlID09PSB2b2lkIDApIHtcbiAgICByZXR1cm4gc3RvcmVzW25hbWVdO1xuICB9XG4gIHN0b3Jlc1tuYW1lXSA9IHZhbHVlO1xuICBpbml0SW50ZXJjZXB0b3JzKHN0b3Jlc1tuYW1lXSk7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUuaGFzT3duUHJvcGVydHkoXCJpbml0XCIpICYmIHR5cGVvZiB2YWx1ZS5pbml0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBzdG9yZXNbbmFtZV0uaW5pdCgpO1xuICB9XG59XG5mdW5jdGlvbiBnZXRTdG9yZXMoKSB7XG4gIHJldHVybiBzdG9yZXM7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9iaW5kcy5qc1xudmFyIGJpbmRzID0ge307XG5mdW5jdGlvbiBiaW5kMihuYW1lLCBiaW5kaW5ncykge1xuICBsZXQgZ2V0QmluZGluZ3MgPSB0eXBlb2YgYmluZGluZ3MgIT09IFwiZnVuY3Rpb25cIiA/ICgpID0+IGJpbmRpbmdzIDogYmluZGluZ3M7XG4gIGlmIChuYW1lIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgIHJldHVybiBhcHBseUJpbmRpbmdzT2JqZWN0KG5hbWUsIGdldEJpbmRpbmdzKCkpO1xuICB9IGVsc2Uge1xuICAgIGJpbmRzW25hbWVdID0gZ2V0QmluZGluZ3M7XG4gIH1cbiAgcmV0dXJuICgpID0+IHtcbiAgfTtcbn1cbmZ1bmN0aW9uIGluamVjdEJpbmRpbmdQcm92aWRlcnMob2JqKSB7XG4gIE9iamVjdC5lbnRyaWVzKGJpbmRzKS5mb3JFYWNoKChbbmFtZSwgY2FsbGJhY2tdKSA9PiB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufVxuZnVuY3Rpb24gYXBwbHlCaW5kaW5nc09iamVjdChlbCwgb2JqLCBvcmlnaW5hbCkge1xuICBsZXQgY2xlYW51cFJ1bm5lcnMgPSBbXTtcbiAgd2hpbGUgKGNsZWFudXBSdW5uZXJzLmxlbmd0aClcbiAgICBjbGVhbnVwUnVubmVycy5wb3AoKSgpO1xuICBsZXQgYXR0cmlidXRlcyA9IE9iamVjdC5lbnRyaWVzKG9iaikubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoeyBuYW1lLCB2YWx1ZSB9KSk7XG4gIGxldCBzdGF0aWNBdHRyaWJ1dGVzID0gYXR0cmlidXRlc09ubHkoYXR0cmlidXRlcyk7XG4gIGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzLm1hcCgoYXR0cmlidXRlKSA9PiB7XG4gICAgaWYgKHN0YXRpY0F0dHJpYnV0ZXMuZmluZCgoYXR0cikgPT4gYXR0ci5uYW1lID09PSBhdHRyaWJ1dGUubmFtZSkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IGB4LWJpbmQ6JHthdHRyaWJ1dGUubmFtZX1gLFxuICAgICAgICB2YWx1ZTogYFwiJHthdHRyaWJ1dGUudmFsdWV9XCJgXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gYXR0cmlidXRlO1xuICB9KTtcbiAgZGlyZWN0aXZlcyhlbCwgYXR0cmlidXRlcywgb3JpZ2luYWwpLm1hcCgoaGFuZGxlKSA9PiB7XG4gICAgY2xlYW51cFJ1bm5lcnMucHVzaChoYW5kbGUucnVuQ2xlYW51cHMpO1xuICAgIGhhbmRsZSgpO1xuICB9KTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICB3aGlsZSAoY2xlYW51cFJ1bm5lcnMubGVuZ3RoKVxuICAgICAgY2xlYW51cFJ1bm5lcnMucG9wKCkoKTtcbiAgfTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RhdGFzLmpzXG52YXIgZGF0YXMgPSB7fTtcbmZ1bmN0aW9uIGRhdGEobmFtZSwgY2FsbGJhY2spIHtcbiAgZGF0YXNbbmFtZV0gPSBjYWxsYmFjaztcbn1cbmZ1bmN0aW9uIGluamVjdERhdGFQcm92aWRlcnMob2JqLCBjb250ZXh0KSB7XG4gIE9iamVjdC5lbnRyaWVzKGRhdGFzKS5mb3JFYWNoKChbbmFtZSwgY2FsbGJhY2tdKSA9PiB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgbmFtZSwge1xuICAgICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2suYmluZChjb250ZXh0KSguLi5hcmdzKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2FscGluZS5qc1xudmFyIEFscGluZSA9IHtcbiAgZ2V0IHJlYWN0aXZlKCkge1xuICAgIHJldHVybiByZWFjdGl2ZTtcbiAgfSxcbiAgZ2V0IHJlbGVhc2UoKSB7XG4gICAgcmV0dXJuIHJlbGVhc2U7XG4gIH0sXG4gIGdldCBlZmZlY3QoKSB7XG4gICAgcmV0dXJuIGVmZmVjdDtcbiAgfSxcbiAgZ2V0IHJhdygpIHtcbiAgICByZXR1cm4gcmF3O1xuICB9LFxuICBnZXQgdHJhbnNhY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRyYW5zYWN0aW9uO1xuICB9LFxuICB2ZXJzaW9uOiBcIjMuMTUuOFwiLFxuICBmbHVzaEFuZFN0b3BEZWZlcnJpbmdNdXRhdGlvbnMsXG4gIGRvbnRBdXRvRXZhbHVhdGVGdW5jdGlvbnMsXG4gIGRpc2FibGVFZmZlY3RTY2hlZHVsaW5nLFxuICBzdGFydE9ic2VydmluZ011dGF0aW9ucyxcbiAgc3RvcE9ic2VydmluZ011dGF0aW9ucyxcbiAgc2V0UmVhY3Rpdml0eUVuZ2luZSxcbiAgb25BdHRyaWJ1dGVSZW1vdmVkLFxuICBvbkF0dHJpYnV0ZXNBZGRlZCxcbiAgY2xvc2VzdERhdGFTdGFjayxcbiAgc2tpcER1cmluZ0Nsb25lLFxuICBvbmx5RHVyaW5nQ2xvbmUsXG4gIGFkZFJvb3RTZWxlY3RvcixcbiAgYWRkSW5pdFNlbGVjdG9yLFxuICBzZXRFcnJvckhhbmRsZXIsXG4gIGludGVyY2VwdENsb25lLFxuICBhZGRTY29wZVRvTm9kZSxcbiAgZGVmZXJNdXRhdGlvbnMsXG4gIG1hcEF0dHJpYnV0ZXMsXG4gIGV2YWx1YXRlTGF0ZXIsXG4gIGludGVyY2VwdEluaXQsXG4gIGluaXRJbnRlcmNlcHRvcnMsXG4gIGluamVjdE1hZ2ljcyxcbiAgc2V0RXZhbHVhdG9yLFxuICBzZXRSYXdFdmFsdWF0b3IsXG4gIG1lcmdlUHJveGllcyxcbiAgZXh0cmFjdFByb3AsXG4gIGZpbmRDbG9zZXN0LFxuICBvbkVsUmVtb3ZlZCxcbiAgY2xvc2VzdFJvb3QsXG4gIGRlc3Ryb3lUcmVlLFxuICBpbnRlcmNlcHRvcixcbiAgLy8gSU5URVJOQUw6IG5vdCBwdWJsaWMgQVBJIGFuZCBpcyBzdWJqZWN0IHRvIGNoYW5nZSB3aXRob3V0IG1ham9yIHJlbGVhc2UuXG4gIHRyYW5zaXRpb24sXG4gIC8vIElOVEVSTkFMXG4gIHNldFN0eWxlcyxcbiAgLy8gSU5URVJOQUxcbiAgbXV0YXRlRG9tLFxuICBkaXJlY3RpdmUsXG4gIGVudGFuZ2xlLFxuICB0aHJvdHRsZSxcbiAgZGVib3VuY2UsXG4gIGV2YWx1YXRlLFxuICBldmFsdWF0ZVJhdyxcbiAgaW5pdFRyZWUsXG4gIG5leHRUaWNrLFxuICBwcmVmaXhlZDogcHJlZml4LFxuICBwcmVmaXg6IHNldFByZWZpeCxcbiAgcGx1Z2luLFxuICBtYWdpYyxcbiAgc3RvcmUsXG4gIHN0YXJ0LFxuICBjbG9uZSxcbiAgLy8gSU5URVJOQUxcbiAgY2xvbmVOb2RlLFxuICAvLyBJTlRFUk5BTFxuICBib3VuZDogZ2V0QmluZGluZyxcbiAgJGRhdGE6IHNjb3BlLFxuICB3YXRjaCxcbiAgd2FsayxcbiAgZGF0YSxcbiAgYmluZDogYmluZDJcbn07XG52YXIgYWxwaW5lX2RlZmF1bHQgPSBBbHBpbmU7XG5cbi8vIHBhY2thZ2VzL2NzcC9zcmMvcGFyc2VyLmpzXG52YXIgc2FmZW1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgV2Vha01hcCgpO1xudmFyIGdsb2JhbHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZ2xvYmFsVGhpcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gIGlmIChrZXkgPT09IFwic3R5bGVNZWRpYVwiKVxuICAgIHJldHVybjtcbiAgZ2xvYmFscy5hZGQoZ2xvYmFsVGhpc1trZXldKTtcbn0pO1xudmFyIFRva2VuID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0eXBlLCB2YWx1ZSwgc3RhcnQyLCBlbmQpIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnN0YXJ0ID0gc3RhcnQyO1xuICAgIHRoaXMuZW5kID0gZW5kO1xuICB9XG59O1xudmFyIFRva2VuaXplciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoaW5wdXQpIHtcbiAgICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy50b2tlbnMgPSBbXTtcbiAgfVxuICB0b2tlbml6ZSgpIHtcbiAgICB3aGlsZSAodGhpcy5wb3NpdGlvbiA8IHRoaXMuaW5wdXQubGVuZ3RoKSB7XG4gICAgICB0aGlzLnNraXBXaGl0ZXNwYWNlKCk7XG4gICAgICBpZiAodGhpcy5wb3NpdGlvbiA+PSB0aGlzLmlucHV0Lmxlbmd0aClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjb25zdCBjaGFyID0gdGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uXTtcbiAgICAgIGlmICh0aGlzLmlzRGlnaXQoY2hhcikpIHtcbiAgICAgICAgdGhpcy5yZWFkTnVtYmVyKCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNBbHBoYShjaGFyKSB8fCBjaGFyID09PSBcIl9cIiB8fCBjaGFyID09PSBcIiRcIikge1xuICAgICAgICB0aGlzLnJlYWRJZGVudGlmaWVyT3JLZXl3b3JkKCk7XG4gICAgICB9IGVsc2UgaWYgKGNoYXIgPT09ICdcIicgfHwgY2hhciA9PT0gXCInXCIpIHtcbiAgICAgICAgdGhpcy5yZWFkU3RyaW5nKCk7XG4gICAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiL1wiICYmIHRoaXMucGVlaygpID09PSBcIi9cIikge1xuICAgICAgICB0aGlzLnNraXBMaW5lQ29tbWVudCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFkT3BlcmF0b3JPclB1bmN0dWF0aW9uKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiRU9GXCIsIG51bGwsIHRoaXMucG9zaXRpb24sIHRoaXMucG9zaXRpb24pKTtcbiAgICByZXR1cm4gdGhpcy50b2tlbnM7XG4gIH1cbiAgc2tpcFdoaXRlc3BhY2UoKSB7XG4gICAgd2hpbGUgKHRoaXMucG9zaXRpb24gPCB0aGlzLmlucHV0Lmxlbmd0aCAmJiAvXFxzLy50ZXN0KHRoaXMuaW5wdXRbdGhpcy5wb3NpdGlvbl0pKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgfVxuICB9XG4gIHNraXBMaW5lQ29tbWVudCgpIHtcbiAgICB3aGlsZSAodGhpcy5wb3NpdGlvbiA8IHRoaXMuaW5wdXQubGVuZ3RoICYmIHRoaXMuaW5wdXRbdGhpcy5wb3NpdGlvbl0gIT09IFwiXFxuXCIpIHtcbiAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICB9XG4gIH1cbiAgaXNEaWdpdChjaGFyKSB7XG4gICAgcmV0dXJuIC9bMC05XS8udGVzdChjaGFyKTtcbiAgfVxuICBpc0FscGhhKGNoYXIpIHtcbiAgICByZXR1cm4gL1thLXpBLVpdLy50ZXN0KGNoYXIpO1xuICB9XG4gIGlzQWxwaGFOdW1lcmljKGNoYXIpIHtcbiAgICByZXR1cm4gL1thLXpBLVowLTlfJF0vLnRlc3QoY2hhcik7XG4gIH1cbiAgcGVlayhvZmZzZXQgPSAxKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXRbdGhpcy5wb3NpdGlvbiArIG9mZnNldF0gfHwgXCJcIjtcbiAgfVxuICByZWFkTnVtYmVyKCkge1xuICAgIGNvbnN0IHN0YXJ0MiA9IHRoaXMucG9zaXRpb247XG4gICAgbGV0IGhhc0RlY2ltYWwgPSBmYWxzZTtcbiAgICB3aGlsZSAodGhpcy5wb3NpdGlvbiA8IHRoaXMuaW5wdXQubGVuZ3RoKSB7XG4gICAgICBjb25zdCBjaGFyID0gdGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uXTtcbiAgICAgIGlmICh0aGlzLmlzRGlnaXQoY2hhcikpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbisrO1xuICAgICAgfSBlbHNlIGlmIChjaGFyID09PSBcIi5cIiAmJiAhaGFzRGVjaW1hbCkge1xuICAgICAgICBoYXNEZWNpbWFsID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wb3NpdGlvbisrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5pbnB1dC5zbGljZShzdGFydDIsIHRoaXMucG9zaXRpb24pO1xuICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiTlVNQkVSXCIsIHBhcnNlRmxvYXQodmFsdWUpLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgfVxuICByZWFkSWRlbnRpZmllck9yS2V5d29yZCgpIHtcbiAgICBjb25zdCBzdGFydDIgPSB0aGlzLnBvc2l0aW9uO1xuICAgIHdoaWxlICh0aGlzLnBvc2l0aW9uIDwgdGhpcy5pbnB1dC5sZW5ndGggJiYgdGhpcy5pc0FscGhhTnVtZXJpYyh0aGlzLmlucHV0W3RoaXMucG9zaXRpb25dKSkge1xuICAgICAgdGhpcy5wb3NpdGlvbisrO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuaW5wdXQuc2xpY2Uoc3RhcnQyLCB0aGlzLnBvc2l0aW9uKTtcbiAgICBjb25zdCBrZXl3b3JkcyA9IFtcInRydWVcIiwgXCJmYWxzZVwiLCBcIm51bGxcIiwgXCJ1bmRlZmluZWRcIiwgXCJuZXdcIiwgXCJ0eXBlb2ZcIiwgXCJ2b2lkXCIsIFwiZGVsZXRlXCIsIFwiaW5cIiwgXCJpbnN0YW5jZW9mXCJdO1xuICAgIGlmIChrZXl3b3Jkcy5pbmNsdWRlcyh2YWx1ZSkpIHtcbiAgICAgIGlmICh2YWx1ZSA9PT0gXCJ0cnVlXCIgfHwgdmFsdWUgPT09IFwiZmFsc2VcIikge1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIkJPT0xFQU5cIiwgdmFsdWUgPT09IFwidHJ1ZVwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IFwibnVsbFwiKSB7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiTlVMTFwiLCBudWxsLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJVTkRFRklORURcIiwgdm9pZCAwLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiS0VZV09SRFwiLCB2YWx1ZSwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiSURFTlRJRklFUlwiLCB2YWx1ZSwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfVxuICB9XG4gIHJlYWRTdHJpbmcoKSB7XG4gICAgY29uc3Qgc3RhcnQyID0gdGhpcy5wb3NpdGlvbjtcbiAgICBjb25zdCBxdW90ZSA9IHRoaXMuaW5wdXRbdGhpcy5wb3NpdGlvbl07XG4gICAgdGhpcy5wb3NpdGlvbisrO1xuICAgIGxldCB2YWx1ZSA9IFwiXCI7XG4gICAgbGV0IGVzY2FwZWQgPSBmYWxzZTtcbiAgICB3aGlsZSAodGhpcy5wb3NpdGlvbiA8IHRoaXMuaW5wdXQubGVuZ3RoKSB7XG4gICAgICBjb25zdCBjaGFyID0gdGhpcy5pbnB1dFt0aGlzLnBvc2l0aW9uXTtcbiAgICAgIGlmIChlc2NhcGVkKSB7XG4gICAgICAgIHN3aXRjaCAoY2hhcikge1xuICAgICAgICAgIGNhc2UgXCJuXCI6XG4gICAgICAgICAgICB2YWx1ZSArPSBcIlxcblwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcInRcIjpcbiAgICAgICAgICAgIHZhbHVlICs9IFwiXHRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJyXCI6XG4gICAgICAgICAgICB2YWx1ZSArPSBcIlxcclwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcIlxcXFxcIjpcbiAgICAgICAgICAgIHZhbHVlICs9IFwiXFxcXFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBxdW90ZTpcbiAgICAgICAgICAgIHZhbHVlICs9IHF1b3RlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHZhbHVlICs9IGNoYXI7XG4gICAgICAgIH1cbiAgICAgICAgZXNjYXBlZCA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmIChjaGFyID09PSBcIlxcXFxcIikge1xuICAgICAgICBlc2NhcGVkID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gcXVvdGUpIHtcbiAgICAgICAgdGhpcy5wb3NpdGlvbisrO1xuICAgICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIlNUUklOR1wiLCB2YWx1ZSwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlICs9IGNoYXI7XG4gICAgICB9XG4gICAgICB0aGlzLnBvc2l0aW9uKys7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgVW50ZXJtaW5hdGVkIHN0cmluZyBzdGFydGluZyBhdCBwb3NpdGlvbiAke3N0YXJ0Mn1gKTtcbiAgfVxuICByZWFkT3BlcmF0b3JPclB1bmN0dWF0aW9uKCkge1xuICAgIGNvbnN0IHN0YXJ0MiA9IHRoaXMucG9zaXRpb247XG4gICAgY29uc3QgY2hhciA9IHRoaXMuaW5wdXRbdGhpcy5wb3NpdGlvbl07XG4gICAgY29uc3QgbmV4dCA9IHRoaXMucGVlaygpO1xuICAgIGNvbnN0IG5leHROZXh0ID0gdGhpcy5wZWVrKDIpO1xuICAgIGlmIChjaGFyID09PSBcIj1cIiAmJiBuZXh0ID09PSBcIj1cIiAmJiBuZXh0TmV4dCA9PT0gXCI9XCIpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMztcbiAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiT1BFUkFUT1JcIiwgXCI9PT1cIiwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBcIiFcIiAmJiBuZXh0ID09PSBcIj1cIiAmJiBuZXh0TmV4dCA9PT0gXCI9XCIpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMztcbiAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiT1BFUkFUT1JcIiwgXCIhPT1cIiwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBcIj1cIiAmJiBuZXh0ID09PSBcIj1cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIj09XCIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCIhXCIgJiYgbmV4dCA9PT0gXCI9XCIpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiT1BFUkFUT1JcIiwgXCIhPVwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiPFwiICYmIG5leHQgPT09IFwiPVwiKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIk9QRVJBVE9SXCIsIFwiPD1cIiwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBcIj5cIiAmJiBuZXh0ID09PSBcIj1cIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIj49XCIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCImXCIgJiYgbmV4dCA9PT0gXCImXCIpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiT1BFUkFUT1JcIiwgXCImJlwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwifFwiICYmIG5leHQgPT09IFwifFwiKSB7XG4gICAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgICB0aGlzLnRva2Vucy5wdXNoKG5ldyBUb2tlbihcIk9QRVJBVE9SXCIsIFwifHxcIiwgc3RhcnQyLCB0aGlzLnBvc2l0aW9uKSk7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBcIitcIiAmJiBuZXh0ID09PSBcIitcIikge1xuICAgICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgICAgdGhpcy50b2tlbnMucHVzaChuZXcgVG9rZW4oXCJPUEVSQVRPUlwiLCBcIisrXCIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCItXCIgJiYgbmV4dCA9PT0gXCItXCIpIHtcbiAgICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKFwiT1BFUkFUT1JcIiwgXCItLVwiLCBzdGFydDIsIHRoaXMucG9zaXRpb24pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wb3NpdGlvbisrO1xuICAgICAgY29uc3QgdHlwZSA9IFwiKClbXXt9LC47Oj9cIi5pbmNsdWRlcyhjaGFyKSA/IFwiUFVOQ1RVQVRJT05cIiA6IFwiT1BFUkFUT1JcIjtcbiAgICAgIHRoaXMudG9rZW5zLnB1c2gobmV3IFRva2VuKHR5cGUsIGNoYXIsIHN0YXJ0MiwgdGhpcy5wb3NpdGlvbikpO1xuICAgIH1cbiAgfVxufTtcbnZhciBQYXJzZXIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKHRva2Vucykge1xuICAgIHRoaXMudG9rZW5zID0gdG9rZW5zO1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG4gIHBhcnNlKCkge1xuICAgIGlmICh0aGlzLmlzQXRFbmQoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRW1wdHkgZXhwcmVzc2lvblwiKTtcbiAgICB9XG4gICAgY29uc3QgZXhwciA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgdGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiO1wiKTtcbiAgICBpZiAoIXRoaXMuaXNBdEVuZCgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgdG9rZW46ICR7dGhpcy5jdXJyZW50KCkudmFsdWV9YCk7XG4gICAgfVxuICAgIHJldHVybiBleHByO1xuICB9XG4gIHBhcnNlRXhwcmVzc2lvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZUFzc2lnbm1lbnQoKTtcbiAgfVxuICBwYXJzZUFzc2lnbm1lbnQoKSB7XG4gICAgY29uc3QgZXhwciA9IHRoaXMucGFyc2VUZXJuYXJ5KCk7XG4gICAgaWYgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcIj1cIikpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5wYXJzZUFzc2lnbm1lbnQoKTtcbiAgICAgIGlmIChleHByLnR5cGUgPT09IFwiSWRlbnRpZmllclwiIHx8IGV4cHIudHlwZSA9PT0gXCJNZW1iZXJFeHByZXNzaW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiBcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCIsXG4gICAgICAgICAgbGVmdDogZXhwcixcbiAgICAgICAgICBvcGVyYXRvcjogXCI9XCIsXG4gICAgICAgICAgcmlnaHQ6IHZhbHVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGFzc2lnbm1lbnQgdGFyZ2V0XCIpO1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICBwYXJzZVRlcm5hcnkoKSB7XG4gICAgY29uc3QgZXhwciA9IHRoaXMucGFyc2VMb2dpY2FsT3IoKTtcbiAgICBpZiAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiP1wiKSkge1xuICAgICAgY29uc3QgY29uc2VxdWVudCA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgICB0aGlzLmNvbnN1bWUoXCJQVU5DVFVBVElPTlwiLCBcIjpcIik7XG4gICAgICBjb25zdCBhbHRlcm5hdGUgPSB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogXCJDb25kaXRpb25hbEV4cHJlc3Npb25cIixcbiAgICAgICAgdGVzdDogZXhwcixcbiAgICAgICAgY29uc2VxdWVudCxcbiAgICAgICAgYWx0ZXJuYXRlXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICBwYXJzZUxvZ2ljYWxPcigpIHtcbiAgICBsZXQgZXhwciA9IHRoaXMucGFyc2VMb2dpY2FsQW5kKCk7XG4gICAgd2hpbGUgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcInx8XCIpKSB7XG4gICAgICBjb25zdCBvcGVyYXRvciA9IHRoaXMucHJldmlvdXMoKS52YWx1ZTtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5wYXJzZUxvZ2ljYWxBbmQoKTtcbiAgICAgIGV4cHIgPSB7XG4gICAgICAgIHR5cGU6IFwiQmluYXJ5RXhwcmVzc2lvblwiLFxuICAgICAgICBvcGVyYXRvcixcbiAgICAgICAgbGVmdDogZXhwcixcbiAgICAgICAgcmlnaHRcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBleHByO1xuICB9XG4gIHBhcnNlTG9naWNhbEFuZCgpIHtcbiAgICBsZXQgZXhwciA9IHRoaXMucGFyc2VFcXVhbGl0eSgpO1xuICAgIHdoaWxlICh0aGlzLm1hdGNoKFwiT1BFUkFUT1JcIiwgXCImJlwiKSkge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VFcXVhbGl0eSgpO1xuICAgICAgZXhwciA9IHtcbiAgICAgICAgdHlwZTogXCJCaW5hcnlFeHByZXNzaW9uXCIsXG4gICAgICAgIG9wZXJhdG9yLFxuICAgICAgICBsZWZ0OiBleHByLFxuICAgICAgICByaWdodFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VFcXVhbGl0eSgpIHtcbiAgICBsZXQgZXhwciA9IHRoaXMucGFyc2VSZWxhdGlvbmFsKCk7XG4gICAgd2hpbGUgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcIj09XCIsIFwiIT1cIiwgXCI9PT1cIiwgXCIhPT1cIikpIHtcbiAgICAgIGNvbnN0IG9wZXJhdG9yID0gdGhpcy5wcmV2aW91cygpLnZhbHVlO1xuICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlUmVsYXRpb25hbCgpO1xuICAgICAgZXhwciA9IHtcbiAgICAgICAgdHlwZTogXCJCaW5hcnlFeHByZXNzaW9uXCIsXG4gICAgICAgIG9wZXJhdG9yLFxuICAgICAgICBsZWZ0OiBleHByLFxuICAgICAgICByaWdodFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VSZWxhdGlvbmFsKCkge1xuICAgIGxldCBleHByID0gdGhpcy5wYXJzZUFkZGl0aXZlKCk7XG4gICAgd2hpbGUgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcIjxcIiwgXCI+XCIsIFwiPD1cIiwgXCI+PVwiKSkge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VBZGRpdGl2ZSgpO1xuICAgICAgZXhwciA9IHtcbiAgICAgICAgdHlwZTogXCJCaW5hcnlFeHByZXNzaW9uXCIsXG4gICAgICAgIG9wZXJhdG9yLFxuICAgICAgICBsZWZ0OiBleHByLFxuICAgICAgICByaWdodFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VBZGRpdGl2ZSgpIHtcbiAgICBsZXQgZXhwciA9IHRoaXMucGFyc2VNdWx0aXBsaWNhdGl2ZSgpO1xuICAgIHdoaWxlICh0aGlzLm1hdGNoKFwiT1BFUkFUT1JcIiwgXCIrXCIsIFwiLVwiKSkge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICBjb25zdCByaWdodCA9IHRoaXMucGFyc2VNdWx0aXBsaWNhdGl2ZSgpO1xuICAgICAgZXhwciA9IHtcbiAgICAgICAgdHlwZTogXCJCaW5hcnlFeHByZXNzaW9uXCIsXG4gICAgICAgIG9wZXJhdG9yLFxuICAgICAgICBsZWZ0OiBleHByLFxuICAgICAgICByaWdodFxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbiAgcGFyc2VNdWx0aXBsaWNhdGl2ZSgpIHtcbiAgICBsZXQgZXhwciA9IHRoaXMucGFyc2VVbmFyeSgpO1xuICAgIHdoaWxlICh0aGlzLm1hdGNoKFwiT1BFUkFUT1JcIiwgXCIqXCIsIFwiL1wiLCBcIiVcIikpIHtcbiAgICAgIGNvbnN0IG9wZXJhdG9yID0gdGhpcy5wcmV2aW91cygpLnZhbHVlO1xuICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLnBhcnNlVW5hcnkoKTtcbiAgICAgIGV4cHIgPSB7XG4gICAgICAgIHR5cGU6IFwiQmluYXJ5RXhwcmVzc2lvblwiLFxuICAgICAgICBvcGVyYXRvcixcbiAgICAgICAgbGVmdDogZXhwcixcbiAgICAgICAgcmlnaHRcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBleHByO1xuICB9XG4gIHBhcnNlVW5hcnkoKSB7XG4gICAgaWYgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcIisrXCIsIFwiLS1cIikpIHtcbiAgICAgIGNvbnN0IG9wZXJhdG9yID0gdGhpcy5wcmV2aW91cygpLnZhbHVlO1xuICAgICAgY29uc3QgYXJndW1lbnQgPSB0aGlzLnBhcnNlVW5hcnkoKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiVXBkYXRlRXhwcmVzc2lvblwiLFxuICAgICAgICBvcGVyYXRvcixcbiAgICAgICAgYXJndW1lbnQsXG4gICAgICAgIHByZWZpeDogdHJ1ZVxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJPUEVSQVRPUlwiLCBcIiFcIiwgXCItXCIsIFwiK1wiKSkge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICBjb25zdCBhcmd1bWVudCA9IHRoaXMucGFyc2VVbmFyeSgpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogXCJVbmFyeUV4cHJlc3Npb25cIixcbiAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIGFyZ3VtZW50LFxuICAgICAgICBwcmVmaXg6IHRydWVcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnBhcnNlUG9zdGZpeCgpO1xuICB9XG4gIHBhcnNlUG9zdGZpeCgpIHtcbiAgICBsZXQgZXhwciA9IHRoaXMucGFyc2VNZW1iZXIoKTtcbiAgICBpZiAodGhpcy5tYXRjaChcIk9QRVJBVE9SXCIsIFwiKytcIiwgXCItLVwiKSkge1xuICAgICAgY29uc3Qgb3BlcmF0b3IgPSB0aGlzLnByZXZpb3VzKCkudmFsdWU7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiBcIlVwZGF0ZUV4cHJlc3Npb25cIixcbiAgICAgICAgb3BlcmF0b3IsXG4gICAgICAgIGFyZ3VtZW50OiBleHByLFxuICAgICAgICBwcmVmaXg6IGZhbHNlXG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZXhwcjtcbiAgfVxuICBwYXJzZU1lbWJlcigpIHtcbiAgICBsZXQgZXhwciA9IHRoaXMucGFyc2VQcmltYXJ5KCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCIuXCIpKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpcy5jb25zdW1lKFwiSURFTlRJRklFUlwiKTtcbiAgICAgICAgZXhwciA9IHtcbiAgICAgICAgICB0eXBlOiBcIk1lbWJlckV4cHJlc3Npb25cIixcbiAgICAgICAgICBvYmplY3Q6IGV4cHIsXG4gICAgICAgICAgcHJvcGVydHk6IHsgdHlwZTogXCJJZGVudGlmaWVyXCIsIG5hbWU6IHByb3BlcnR5LnZhbHVlIH0sXG4gICAgICAgICAgY29tcHV0ZWQ6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubWF0Y2goXCJQVU5DVFVBVElPTlwiLCBcIltcIikpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydHkgPSB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xuICAgICAgICB0aGlzLmNvbnN1bWUoXCJQVU5DVFVBVElPTlwiLCBcIl1cIik7XG4gICAgICAgIGV4cHIgPSB7XG4gICAgICAgICAgdHlwZTogXCJNZW1iZXJFeHByZXNzaW9uXCIsXG4gICAgICAgICAgb2JqZWN0OiBleHByLFxuICAgICAgICAgIHByb3BlcnR5LFxuICAgICAgICAgIGNvbXB1dGVkOiB0cnVlXG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubWF0Y2goXCJQVU5DVFVBVElPTlwiLCBcIihcIikpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IHRoaXMucGFyc2VBcmd1bWVudHMoKTtcbiAgICAgICAgZXhwciA9IHtcbiAgICAgICAgICB0eXBlOiBcIkNhbGxFeHByZXNzaW9uXCIsXG4gICAgICAgICAgY2FsbGVlOiBleHByLFxuICAgICAgICAgIGFyZ3VtZW50czogYXJnc1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBleHByO1xuICB9XG4gIHBhcnNlQXJndW1lbnRzKCkge1xuICAgIGNvbnN0IGFyZ3MgPSBbXTtcbiAgICBpZiAoIXRoaXMuY2hlY2soXCJQVU5DVFVBVElPTlwiLCBcIilcIikpIHtcbiAgICAgIGRvIHtcbiAgICAgICAgYXJncy5wdXNoKHRoaXMucGFyc2VFeHByZXNzaW9uKCkpO1xuICAgICAgfSB3aGlsZSAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiLFwiKSk7XG4gICAgfVxuICAgIHRoaXMuY29uc3VtZShcIlBVTkNUVUFUSU9OXCIsIFwiKVwiKTtcbiAgICByZXR1cm4gYXJncztcbiAgfVxuICBwYXJzZVByaW1hcnkoKSB7XG4gICAgaWYgKHRoaXMubWF0Y2goXCJOVU1CRVJcIikpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiTGl0ZXJhbFwiLCB2YWx1ZTogdGhpcy5wcmV2aW91cygpLnZhbHVlIH07XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwiU1RSSU5HXCIpKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIkxpdGVyYWxcIiwgdmFsdWU6IHRoaXMucHJldmlvdXMoKS52YWx1ZSB9O1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcIkJPT0xFQU5cIikpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiTGl0ZXJhbFwiLCB2YWx1ZTogdGhpcy5wcmV2aW91cygpLnZhbHVlIH07XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwiTlVMTFwiKSkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJMaXRlcmFsXCIsIHZhbHVlOiBudWxsIH07XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwiVU5ERUZJTkVEXCIpKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIkxpdGVyYWxcIiwgdmFsdWU6IHZvaWQgMCB9O1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcIklERU5USUZJRVJcIikpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwiSWRlbnRpZmllclwiLCBuYW1lOiB0aGlzLnByZXZpb3VzKCkudmFsdWUgfTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWF0Y2goXCJQVU5DVFVBVElPTlwiLCBcIihcIikpIHtcbiAgICAgIGNvbnN0IGV4cHIgPSB0aGlzLnBhcnNlRXhwcmVzc2lvbigpO1xuICAgICAgdGhpcy5jb25zdW1lKFwiUFVOQ1RVQVRJT05cIiwgXCIpXCIpO1xuICAgICAgcmV0dXJuIGV4cHI7XG4gICAgfVxuICAgIGlmICh0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCJbXCIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJzZUFycmF5TGl0ZXJhbCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwie1wiKSkge1xuICAgICAgcmV0dXJuIHRoaXMucGFyc2VPYmplY3RMaXRlcmFsKCk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCB0b2tlbjogJHt0aGlzLmN1cnJlbnQoKS50eXBlfSBcIiR7dGhpcy5jdXJyZW50KCkudmFsdWV9XCJgKTtcbiAgfVxuICBwYXJzZUFycmF5TGl0ZXJhbCgpIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IFtdO1xuICAgIHdoaWxlICghdGhpcy5jaGVjayhcIlBVTkNUVUFUSU9OXCIsIFwiXVwiKSAmJiAhdGhpcy5pc0F0RW5kKCkpIHtcbiAgICAgIGVsZW1lbnRzLnB1c2godGhpcy5wYXJzZUV4cHJlc3Npb24oKSk7XG4gICAgICBpZiAodGhpcy5tYXRjaChcIlBVTkNUVUFUSU9OXCIsIFwiLFwiKSkge1xuICAgICAgICBpZiAodGhpcy5jaGVjayhcIlBVTkNUVUFUSU9OXCIsIFwiXVwiKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb25zdW1lKFwiUFVOQ1RVQVRJT05cIiwgXCJdXCIpO1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBcIkFycmF5RXhwcmVzc2lvblwiLFxuICAgICAgZWxlbWVudHNcbiAgICB9O1xuICB9XG4gIHBhcnNlT2JqZWN0TGl0ZXJhbCgpIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gW107XG4gICAgd2hpbGUgKCF0aGlzLmNoZWNrKFwiUFVOQ1RVQVRJT05cIiwgXCJ9XCIpICYmICF0aGlzLmlzQXRFbmQoKSkge1xuICAgICAgbGV0IGtleTtcbiAgICAgIGxldCBjb21wdXRlZCA9IGZhbHNlO1xuICAgICAgaWYgKHRoaXMubWF0Y2goXCJTVFJJTkdcIikpIHtcbiAgICAgICAga2V5ID0geyB0eXBlOiBcIkxpdGVyYWxcIiwgdmFsdWU6IHRoaXMucHJldmlvdXMoKS52YWx1ZSB9O1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm1hdGNoKFwiSURFTlRJRklFUlwiKSkge1xuICAgICAgICBjb25zdCBuYW1lID0gdGhpcy5wcmV2aW91cygpLnZhbHVlO1xuICAgICAgICBrZXkgPSB7IHR5cGU6IFwiSWRlbnRpZmllclwiLCBuYW1lIH07XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubWF0Y2goXCJQVU5DVFVBVElPTlwiLCBcIltcIikpIHtcbiAgICAgICAga2V5ID0gdGhpcy5wYXJzZUV4cHJlc3Npb24oKTtcbiAgICAgICAgY29tcHV0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnN1bWUoXCJQVU5DVFVBVElPTlwiLCBcIl1cIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBwcm9wZXJ0eSBrZXlcIik7XG4gICAgICB9XG4gICAgICB0aGlzLmNvbnN1bWUoXCJQVU5DVFVBVElPTlwiLCBcIjpcIik7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGFyc2VFeHByZXNzaW9uKCk7XG4gICAgICBwcm9wZXJ0aWVzLnB1c2goe1xuICAgICAgICB0eXBlOiBcIlByb3BlcnR5XCIsXG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIGNvbXB1dGVkLFxuICAgICAgICBzaG9ydGhhbmQ6IGZhbHNlXG4gICAgICB9KTtcbiAgICAgIGlmICh0aGlzLm1hdGNoKFwiUFVOQ1RVQVRJT05cIiwgXCIsXCIpKSB7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrKFwiUFVOQ1RVQVRJT05cIiwgXCJ9XCIpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbnN1bWUoXCJQVU5DVFVBVElPTlwiLCBcIn1cIik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IFwiT2JqZWN0RXhwcmVzc2lvblwiLFxuICAgICAgcHJvcGVydGllc1xuICAgIH07XG4gIH1cbiAgbWF0Y2goLi4uYXJncykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYXJnID0gYXJnc1tpXTtcbiAgICAgIGlmIChpID09PSAwICYmIGFyZ3MubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zdCB0eXBlID0gYXJnO1xuICAgICAgICBmb3IgKGxldCBqID0gMTsgaiA8IGFyZ3MubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5jaGVjayh0eXBlLCBhcmdzW2pdKSkge1xuICAgICAgICAgICAgdGhpcy5hZHZhbmNlKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIGlmIChhcmdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAodGhpcy5jaGVja1R5cGUoYXJnKSkge1xuICAgICAgICAgIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNoZWNrKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuaXNBdEVuZCgpKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmICh2YWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50KCkudHlwZSA9PT0gdHlwZSAmJiB0aGlzLmN1cnJlbnQoKS52YWx1ZSA9PT0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmN1cnJlbnQoKS50eXBlID09PSB0eXBlO1xuICB9XG4gIGNoZWNrVHlwZSh0eXBlKSB7XG4gICAgaWYgKHRoaXMuaXNBdEVuZCgpKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnQoKS50eXBlID09PSB0eXBlO1xuICB9XG4gIGFkdmFuY2UoKSB7XG4gICAgaWYgKCF0aGlzLmlzQXRFbmQoKSlcbiAgICAgIHRoaXMucG9zaXRpb24rKztcbiAgICByZXR1cm4gdGhpcy5wcmV2aW91cygpO1xuICB9XG4gIGlzQXRFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudCgpLnR5cGUgPT09IFwiRU9GXCI7XG4gIH1cbiAgY3VycmVudCgpIHtcbiAgICByZXR1cm4gdGhpcy50b2tlbnNbdGhpcy5wb3NpdGlvbl07XG4gIH1cbiAgcHJldmlvdXMoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9rZW5zW3RoaXMucG9zaXRpb24gLSAxXTtcbiAgfVxuICBjb25zdW1lKHR5cGUsIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICE9PSB2b2lkIDApIHtcbiAgICAgIGlmICh0aGlzLmNoZWNrKHR5cGUsIHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCAke3R5cGV9IFwiJHt2YWx1ZX1cIiBidXQgZ290ICR7dGhpcy5jdXJyZW50KCkudHlwZX0gXCIke3RoaXMuY3VycmVudCgpLnZhbHVlfVwiYCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmNoZWNrKHR5cGUpKVxuICAgICAgcmV0dXJuIHRoaXMuYWR2YW5jZSgpO1xuICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgJHt0eXBlfSBidXQgZ290ICR7dGhpcy5jdXJyZW50KCkudHlwZX0gXCIke3RoaXMuY3VycmVudCgpLnZhbHVlfVwiYCk7XG4gIH1cbn07XG52YXIgRXZhbHVhdG9yID0gY2xhc3Mge1xuICBldmFsdWF0ZSh7IG5vZGUsIHNjb3BlOiBzY29wZTIgPSB7fSwgY29udGV4dCA9IG51bGwsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zID0gdHJ1ZSB9KSB7XG4gICAgc3dpdGNoIChub2RlLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJMaXRlcmFsXCI6XG4gICAgICAgIHJldHVybiBub2RlLnZhbHVlO1xuICAgICAgY2FzZSBcIklkZW50aWZpZXJcIjpcbiAgICAgICAgaWYgKG5vZGUubmFtZSBpbiBzY29wZTIpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZTIgPSBzY29wZTJbbm9kZS5uYW1lXTtcbiAgICAgICAgICB0aGlzLmNoZWNrRm9yRGFuZ2Vyb3VzVmFsdWVzKHZhbHVlMik7XG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZTIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlMi5iaW5kKHNjb3BlMik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB2YWx1ZTI7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmRlZmluZWQgdmFyaWFibGU6ICR7bm9kZS5uYW1lfWApO1xuICAgICAgY2FzZSBcIk1lbWJlckV4cHJlc3Npb25cIjpcbiAgICAgICAgY29uc3Qgb2JqZWN0ID0gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IG5vZGUub2JqZWN0LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlYWQgcHJvcGVydHkgb2YgbnVsbCBvciB1bmRlZmluZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHByb3BlcnR5O1xuICAgICAgICBpZiAobm9kZS5jb21wdXRlZCkge1xuICAgICAgICAgIHByb3BlcnR5ID0gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IG5vZGUucHJvcGVydHksIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb3BlcnR5ID0gbm9kZS5wcm9wZXJ0eS5uYW1lO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2hlY2tGb3JEYW5nZXJvdXNLZXl3b3Jkcyhwcm9wZXJ0eSk7XG4gICAgICAgIGxldCBtZW1iZXJWYWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgICAgIHRoaXMuY2hlY2tGb3JEYW5nZXJvdXNWYWx1ZXMobWVtYmVyVmFsdWUpO1xuICAgICAgICBpZiAodHlwZW9mIG1lbWJlclZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBpZiAoZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBtZW1iZXJWYWx1ZS5iaW5kKHNjb3BlMik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBtZW1iZXJWYWx1ZS5iaW5kKG9iamVjdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZW1iZXJWYWx1ZTtcbiAgICAgIGNhc2UgXCJDYWxsRXhwcmVzc2lvblwiOlxuICAgICAgICBjb25zdCBhcmdzID0gbm9kZS5hcmd1bWVudHMubWFwKChhcmcpID0+IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBhcmcsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pKTtcbiAgICAgICAgbGV0IHJldHVyblZhbHVlO1xuICAgICAgICBpZiAobm9kZS5jYWxsZWUudHlwZSA9PT0gXCJNZW1iZXJFeHByZXNzaW9uXCIpIHtcbiAgICAgICAgICBjb25zdCBvYmogPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5jYWxsZWUub2JqZWN0LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgICBsZXQgcHJvcDtcbiAgICAgICAgICBpZiAobm9kZS5jYWxsZWUuY29tcHV0ZWQpIHtcbiAgICAgICAgICAgIHByb3AgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5jYWxsZWUucHJvcGVydHksIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcm9wID0gbm9kZS5jYWxsZWUucHJvcGVydHkubmFtZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5jaGVja0ZvckRhbmdlcm91c0tleXdvcmRzKHByb3ApO1xuICAgICAgICAgIGxldCBmdW5jID0gb2JqW3Byb3BdO1xuICAgICAgICAgIGlmICh0eXBlb2YgZnVuYyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJWYWx1ZSBpcyBub3QgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuVmFsdWUgPSBmdW5jLmFwcGx5KG9iaiwgYXJncyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKG5vZGUuY2FsbGVlLnR5cGUgPT09IFwiSWRlbnRpZmllclwiKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gbm9kZS5jYWxsZWUubmFtZTtcbiAgICAgICAgICAgIGxldCBmdW5jO1xuICAgICAgICAgICAgaWYgKG5hbWUgaW4gc2NvcGUyKSB7XG4gICAgICAgICAgICAgIGZ1bmMgPSBzY29wZTJbbmFtZV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCB2YXJpYWJsZTogJHtuYW1lfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBmdW5jICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVmFsdWUgaXMgbm90IGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0aGlzQ29udGV4dCA9IGNvbnRleHQgIT09IG51bGwgPyBjb250ZXh0IDogc2NvcGUyO1xuICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBmdW5jLmFwcGx5KHRoaXNDb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgY2FsbGVlID0gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IG5vZGUuY2FsbGVlLCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGVlICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVmFsdWUgaXMgbm90IGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm5WYWx1ZSA9IGNhbGxlZS5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jaGVja0ZvckRhbmdlcm91c1ZhbHVlcyhyZXR1cm5WYWx1ZSk7XG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICAgIGNhc2UgXCJVbmFyeUV4cHJlc3Npb25cIjpcbiAgICAgICAgY29uc3QgYXJndW1lbnQgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5hcmd1bWVudCwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgIHN3aXRjaCAobm9kZS5vcGVyYXRvcikge1xuICAgICAgICAgIGNhc2UgXCIhXCI6XG4gICAgICAgICAgICByZXR1cm4gIWFyZ3VtZW50O1xuICAgICAgICAgIGNhc2UgXCItXCI6XG4gICAgICAgICAgICByZXR1cm4gLWFyZ3VtZW50O1xuICAgICAgICAgIGNhc2UgXCIrXCI6XG4gICAgICAgICAgICByZXR1cm4gK2FyZ3VtZW50O1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdW5hcnkgb3BlcmF0b3I6ICR7bm9kZS5vcGVyYXRvcn1gKTtcbiAgICAgICAgfVxuICAgICAgY2FzZSBcIlVwZGF0ZUV4cHJlc3Npb25cIjpcbiAgICAgICAgaWYgKG5vZGUuYXJndW1lbnQudHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gbm9kZS5hcmd1bWVudC5uYW1lO1xuICAgICAgICAgIGlmICghKG5hbWUgaW4gc2NvcGUyKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmRlZmluZWQgdmFyaWFibGU6ICR7bmFtZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgb2xkVmFsdWUgPSBzY29wZTJbbmFtZV07XG4gICAgICAgICAgaWYgKG5vZGUub3BlcmF0b3IgPT09IFwiKytcIikge1xuICAgICAgICAgICAgc2NvcGUyW25hbWVdID0gb2xkVmFsdWUgKyAxO1xuICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5vcGVyYXRvciA9PT0gXCItLVwiKSB7XG4gICAgICAgICAgICBzY29wZTJbbmFtZV0gPSBvbGRWYWx1ZSAtIDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBub2RlLnByZWZpeCA/IHNjb3BlMltuYW1lXSA6IG9sZFZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUuYXJndW1lbnQudHlwZSA9PT0gXCJNZW1iZXJFeHByZXNzaW9uXCIpIHtcbiAgICAgICAgICBjb25zdCBvYmogPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5hcmd1bWVudC5vYmplY3QsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgICAgIGNvbnN0IHByb3AgPSBub2RlLmFyZ3VtZW50LmNvbXB1dGVkID8gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IG5vZGUuYXJndW1lbnQucHJvcGVydHksIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pIDogbm9kZS5hcmd1bWVudC5wcm9wZXJ0eS5uYW1lO1xuICAgICAgICAgIGNvbnN0IG9sZFZhbHVlID0gb2JqW3Byb3BdO1xuICAgICAgICAgIGlmIChub2RlLm9wZXJhdG9yID09PSBcIisrXCIpIHtcbiAgICAgICAgICAgIG9ialtwcm9wXSA9IG9sZFZhbHVlICsgMTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUub3BlcmF0b3IgPT09IFwiLS1cIikge1xuICAgICAgICAgICAgb2JqW3Byb3BdID0gb2xkVmFsdWUgLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbm9kZS5wcmVmaXggPyBvYmpbcHJvcF0gOiBvbGRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHVwZGF0ZSBleHByZXNzaW9uIHRhcmdldFwiKTtcbiAgICAgIGNhc2UgXCJCaW5hcnlFeHByZXNzaW9uXCI6XG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5sZWZ0LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5yaWdodCwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgIHN3aXRjaCAobm9kZS5vcGVyYXRvcikge1xuICAgICAgICAgIGNhc2UgXCIrXCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCArIHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCItXCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCAtIHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCIqXCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCAqIHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCIvXCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCAvIHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCIlXCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCAlIHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCI9PVwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgPT0gcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIiE9XCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCAhPSByaWdodDtcbiAgICAgICAgICBjYXNlIFwiPT09XCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIiE9PVwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgIT09IHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCI8XCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA8IHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCI+XCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA+IHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCI8PVwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgPD0gcmlnaHQ7XG4gICAgICAgICAgY2FzZSBcIj49XCI6XG4gICAgICAgICAgICByZXR1cm4gbGVmdCA+PSByaWdodDtcbiAgICAgICAgICBjYXNlIFwiJiZcIjpcbiAgICAgICAgICAgIHJldHVybiBsZWZ0ICYmIHJpZ2h0O1xuICAgICAgICAgIGNhc2UgXCJ8fFwiOlxuICAgICAgICAgICAgcmV0dXJuIGxlZnQgfHwgcmlnaHQ7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBiaW5hcnkgb3BlcmF0b3I6ICR7bm9kZS5vcGVyYXRvcn1gKTtcbiAgICAgICAgfVxuICAgICAgY2FzZSBcIkNvbmRpdGlvbmFsRXhwcmVzc2lvblwiOlxuICAgICAgICBjb25zdCB0ZXN0ID0gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IG5vZGUudGVzdCwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgIHJldHVybiB0ZXN0ID8gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IG5vZGUuY29uc2VxdWVudCwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSkgOiB0aGlzLmV2YWx1YXRlKHsgbm9kZTogbm9kZS5hbHRlcm5hdGUsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgY2FzZSBcIkFzc2lnbm1lbnRFeHByZXNzaW9uXCI6XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IG5vZGUucmlnaHQsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgICBpZiAobm9kZS5sZWZ0LnR5cGUgPT09IFwiSWRlbnRpZmllclwiKSB7XG4gICAgICAgICAgc2NvcGUyW25vZGUubGVmdC5uYW1lXSA9IHZhbHVlO1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChub2RlLmxlZnQudHlwZSA9PT0gXCJNZW1iZXJFeHByZXNzaW9uXCIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQcm9wZXJ0eSBhc3NpZ25tZW50cyBhcmUgcHJvaGliaXRlZCBpbiB0aGUgQ1NQIGJ1aWxkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgYXNzaWdubWVudCB0YXJnZXRcIik7XG4gICAgICBjYXNlIFwiQXJyYXlFeHByZXNzaW9uXCI6XG4gICAgICAgIHJldHVybiBub2RlLmVsZW1lbnRzLm1hcCgoZWwpID0+IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBlbCwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSkpO1xuICAgICAgY2FzZSBcIk9iamVjdEV4cHJlc3Npb25cIjpcbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgcHJvcCBvZiBub2RlLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICBjb25zdCBrZXkgPSBwcm9wLmNvbXB1dGVkID8gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IHByb3Aua2V5LCBzY29wZTogc2NvcGUyLCBjb250ZXh0LCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyB9KSA6IHByb3Aua2V5LnR5cGUgPT09IFwiSWRlbnRpZmllclwiID8gcHJvcC5rZXkubmFtZSA6IHRoaXMuZXZhbHVhdGUoeyBub2RlOiBwcm9wLmtleSwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgICAgICAgY29uc3QgdmFsdWUyID0gdGhpcy5ldmFsdWF0ZSh7IG5vZGU6IHByb3AudmFsdWUsIHNjb3BlOiBzY29wZTIsIGNvbnRleHQsIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zIH0pO1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWUyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gbm9kZSB0eXBlOiAke25vZGUudHlwZX1gKTtcbiAgICB9XG4gIH1cbiAgY2hlY2tGb3JEYW5nZXJvdXNLZXl3b3JkcyhrZXl3b3JkKSB7XG4gICAgbGV0IGJsYWNrbGlzdCA9IFtcbiAgICAgIFwiY29uc3RydWN0b3JcIixcbiAgICAgIFwicHJvdG90eXBlXCIsXG4gICAgICBcIl9fcHJvdG9fX1wiLFxuICAgICAgXCJfX2RlZmluZUdldHRlcl9fXCIsXG4gICAgICBcIl9fZGVmaW5lU2V0dGVyX19cIixcbiAgICAgIFwiaW5zZXJ0QWRqYWNlbnRIVE1MXCJcbiAgICBdO1xuICAgIGlmIChibGFja2xpc3QuaW5jbHVkZXMoa2V5d29yZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQWNjZXNzaW5nIFwiJHtrZXl3b3JkfVwiIGlzIHByb2hpYml0ZWQgaW4gdGhlIENTUCBidWlsZGApO1xuICAgIH1cbiAgfVxuICBjaGVja0ZvckRhbmdlcm91c1ZhbHVlcyhwcm9wKSB7XG4gICAgaWYgKHByb3AgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9wICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiBwcm9wICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNhZmVtYXAuaGFzKHByb3ApKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChwcm9wIGluc3RhbmNlb2YgSFRNTElGcmFtZUVsZW1lbnQgfHwgcHJvcCBpbnN0YW5jZW9mIEhUTUxTY3JpcHRFbGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBY2Nlc3NpbmcgaWZyYW1lcyBhbmQgc2NyaXB0cyBpcyBwcm9oaWJpdGVkIGluIHRoZSBDU1AgYnVpbGRcIik7XG4gICAgfVxuICAgIGlmIChnbG9iYWxzLmhhcyhwcm9wKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWNjZXNzaW5nIGdsb2JhbCB2YXJpYWJsZXMgaXMgcHJvaGliaXRlZCBpbiB0aGUgQ1NQIGJ1aWxkXCIpO1xuICAgIH1cbiAgICBzYWZlbWFwLnNldChwcm9wLCB0cnVlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcbmZ1bmN0aW9uIGdlbmVyYXRlUnVudGltZUZ1bmN0aW9uKGV4cHJlc3Npb24pIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB0b2tlbml6ZXIgPSBuZXcgVG9rZW5pemVyKGV4cHJlc3Npb24pO1xuICAgIGNvbnN0IHRva2VucyA9IHRva2VuaXplci50b2tlbml6ZSgpO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIodG9rZW5zKTtcbiAgICBjb25zdCBhc3QgPSBwYXJzZXIucGFyc2UoKTtcbiAgICBjb25zdCBldmFsdWF0b3IgPSBuZXcgRXZhbHVhdG9yKCk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9wdGlvbnMgPSB7fSkge1xuICAgICAgY29uc3QgeyBzY29wZTogc2NvcGUyID0ge30sIGNvbnRleHQgPSBudWxsLCBmb3JjZUJpbmRpbmdSb290U2NvcGVUb0Z1bmN0aW9ucyA9IGZhbHNlIH0gPSBvcHRpb25zO1xuICAgICAgcmV0dXJuIGV2YWx1YXRvci5ldmFsdWF0ZSh7IG5vZGU6IGFzdCwgc2NvcGU6IHNjb3BlMiwgY29udGV4dCwgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnMgfSk7XG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDU1AgUGFyc2VyIEVycm9yOiAke2Vycm9yMi5tZXNzYWdlfWApO1xuICB9XG59XG5cbi8vIHBhY2thZ2VzL2NzcC9zcmMvZXZhbHVhdG9yLmpzXG5mdW5jdGlvbiBjc3BSYXdFdmFsdWF0b3IoZWwsIGV4cHJlc3Npb24sIGV4dHJhcyA9IHt9KSB7XG4gIGxldCBkYXRhU3RhY2sgPSBnZW5lcmF0ZURhdGFTdGFjayhlbCk7XG4gIGxldCBzY29wZTIgPSBtZXJnZVByb3hpZXMoW2V4dHJhcy5zY29wZSA/PyB7fSwgLi4uZGF0YVN0YWNrXSk7XG4gIGxldCBwYXJhbXMgPSBleHRyYXMucGFyYW1zID8/IFtdO1xuICBsZXQgZXZhbHVhdGUyID0gZ2VuZXJhdGVSdW50aW1lRnVuY3Rpb24oZXhwcmVzc2lvbik7XG4gIGxldCByZXN1bHQgPSBldmFsdWF0ZTIoe1xuICAgIHNjb3BlOiBzY29wZTIsXG4gICAgZm9yY2VCaW5kaW5nUm9vdFNjb3BlVG9GdW5jdGlvbnM6IHRydWVcbiAgfSk7XG4gIGlmICh0eXBlb2YgcmVzdWx0ID09PSBcImZ1bmN0aW9uXCIgJiYgc2hvdWxkQXV0b0V2YWx1YXRlRnVuY3Rpb25zKSB7XG4gICAgcmV0dXJuIHJlc3VsdC5hcHBseShzY29wZTIsIHBhcmFtcyk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGNzcEV2YWx1YXRvcihlbCwgZXhwcmVzc2lvbikge1xuICBsZXQgZGF0YVN0YWNrID0gZ2VuZXJhdGVEYXRhU3RhY2soZWwpO1xuICBpZiAodHlwZW9mIGV4cHJlc3Npb24gPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBnZW5lcmF0ZUV2YWx1YXRvckZyb21GdW5jdGlvbihkYXRhU3RhY2ssIGV4cHJlc3Npb24pO1xuICB9XG4gIGxldCBldmFsdWF0b3IgPSBnZW5lcmF0ZUV2YWx1YXRvcihlbCwgZXhwcmVzc2lvbiwgZGF0YVN0YWNrKTtcbiAgcmV0dXJuIHRyeUNhdGNoLmJpbmQobnVsbCwgZWwsIGV4cHJlc3Npb24sIGV2YWx1YXRvcik7XG59XG5mdW5jdGlvbiBnZW5lcmF0ZURhdGFTdGFjayhlbCkge1xuICBsZXQgb3ZlcnJpZGRlbk1hZ2ljcyA9IHt9O1xuICBpbmplY3RNYWdpY3Mob3ZlcnJpZGRlbk1hZ2ljcywgZWwpO1xuICByZXR1cm4gW292ZXJyaWRkZW5NYWdpY3MsIC4uLmNsb3Nlc3REYXRhU3RhY2soZWwpXTtcbn1cbmZ1bmN0aW9uIGdlbmVyYXRlRXZhbHVhdG9yKGVsLCBleHByZXNzaW9uLCBkYXRhU3RhY2spIHtcbiAgaWYgKGVsIGluc3RhbmNlb2YgSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmFsdWF0aW5nIGV4cHJlc3Npb25zIG9uIGFuIGlmcmFtZSBpcyBwcm9oaWJpdGVkIGluIHRoZSBDU1AgYnVpbGRcIik7XG4gIH1cbiAgaWYgKGVsIGluc3RhbmNlb2YgSFRNTFNjcmlwdEVsZW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmFsdWF0aW5nIGV4cHJlc3Npb25zIG9uIGEgc2NyaXB0IGlzIHByb2hpYml0ZWQgaW4gdGhlIENTUCBidWlsZFwiKTtcbiAgfVxuICByZXR1cm4gKHJlY2VpdmVyID0gKCkgPT4ge1xuICB9LCB7IHNjb3BlOiBzY29wZTIgPSB7fSwgcGFyYW1zID0gW10gfSA9IHt9KSA9PiB7XG4gICAgbGV0IGNvbXBsZXRlU2NvcGUgPSBtZXJnZVByb3hpZXMoW3Njb3BlMiwgLi4uZGF0YVN0YWNrXSk7XG4gICAgbGV0IGV2YWx1YXRlMiA9IGdlbmVyYXRlUnVudGltZUZ1bmN0aW9uKGV4cHJlc3Npb24pO1xuICAgIGxldCByZXR1cm5WYWx1ZSA9IGV2YWx1YXRlMih7XG4gICAgICBzY29wZTogY29tcGxldGVTY29wZSxcbiAgICAgIGZvcmNlQmluZGluZ1Jvb3RTY29wZVRvRnVuY3Rpb25zOiB0cnVlXG4gICAgfSk7XG4gICAgaWYgKHNob3VsZEF1dG9FdmFsdWF0ZUZ1bmN0aW9ucyAmJiB0eXBlb2YgcmV0dXJuVmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgbGV0IG5leHRSZXR1cm5WYWx1ZSA9IHJldHVyblZhbHVlLmFwcGx5KHJldHVyblZhbHVlLCBwYXJhbXMpO1xuICAgICAgaWYgKG5leHRSZXR1cm5WYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgbmV4dFJldHVyblZhbHVlLnRoZW4oKGkpID0+IHJlY2VpdmVyKGkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlY2VpdmVyKG5leHRSZXR1cm5WYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmV0dXJuVmFsdWUgPT09IFwib2JqZWN0XCIgJiYgcmV0dXJuVmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICByZXR1cm5WYWx1ZS50aGVuKChpKSA9PiByZWNlaXZlcihpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY2VpdmVyKHJldHVyblZhbHVlKTtcbiAgICB9XG4gIH07XG59XG5cbi8vIG5vZGVfbW9kdWxlcy9AdnVlL3NoYXJlZC9kaXN0L3NoYXJlZC5lc20tYnVuZGxlci5qc1xuZnVuY3Rpb24gbWFrZU1hcChzdHIsIGV4cGVjdHNMb3dlckNhc2UpIHtcbiAgY29uc3QgbWFwID0gLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGNvbnN0IGxpc3QgPSBzdHIuc3BsaXQoXCIsXCIpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBtYXBbbGlzdFtpXV0gPSB0cnVlO1xuICB9XG4gIHJldHVybiBleHBlY3RzTG93ZXJDYXNlID8gKHZhbCkgPT4gISFtYXBbdmFsLnRvTG93ZXJDYXNlKCldIDogKHZhbCkgPT4gISFtYXBbdmFsXTtcbn1cbnZhciBzcGVjaWFsQm9vbGVhbkF0dHJzID0gYGl0ZW1zY29wZSxhbGxvd2Z1bGxzY3JlZW4sZm9ybW5vdmFsaWRhdGUsaXNtYXAsbm9tb2R1bGUsbm92YWxpZGF0ZSxyZWFkb25seWA7XG52YXIgaXNCb29sZWFuQXR0cjIgPSAvKiBAX19QVVJFX18gKi8gbWFrZU1hcChzcGVjaWFsQm9vbGVhbkF0dHJzICsgYCxhc3luYyxhdXRvZm9jdXMsYXV0b3BsYXksY29udHJvbHMsZGVmYXVsdCxkZWZlcixkaXNhYmxlZCxoaWRkZW4sbG9vcCxvcGVuLHJlcXVpcmVkLHJldmVyc2VkLHNjb3BlZCxzZWFtbGVzcyxjaGVja2VkLG11dGVkLG11bHRpcGxlLHNlbGVjdGVkYCk7XG52YXIgRU1QVFlfT0JKID0gdHJ1ZSA/IE9iamVjdC5mcmVlemUoe30pIDoge307XG52YXIgRU1QVFlfQVJSID0gdHJ1ZSA/IE9iamVjdC5mcmVlemUoW10pIDogW107XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIGhhc093biA9ICh2YWwsIGtleSkgPT4gaGFzT3duUHJvcGVydHkuY2FsbCh2YWwsIGtleSk7XG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG52YXIgaXNNYXAgPSAodmFsKSA9PiB0b1R5cGVTdHJpbmcodmFsKSA9PT0gXCJbb2JqZWN0IE1hcF1cIjtcbnZhciBpc1N0cmluZyA9ICh2YWwpID0+IHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCI7XG52YXIgaXNTeW1ib2wgPSAodmFsKSA9PiB0eXBlb2YgdmFsID09PSBcInN5bWJvbFwiO1xudmFyIGlzT2JqZWN0ID0gKHZhbCkgPT4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCI7XG52YXIgb2JqZWN0VG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIHRvVHlwZVN0cmluZyA9ICh2YWx1ZSkgPT4gb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG52YXIgdG9SYXdUeXBlID0gKHZhbHVlKSA9PiB7XG4gIHJldHVybiB0b1R5cGVTdHJpbmcodmFsdWUpLnNsaWNlKDgsIC0xKTtcbn07XG52YXIgaXNJbnRlZ2VyS2V5ID0gKGtleSkgPT4gaXNTdHJpbmcoa2V5KSAmJiBrZXkgIT09IFwiTmFOXCIgJiYga2V5WzBdICE9PSBcIi1cIiAmJiBcIlwiICsgcGFyc2VJbnQoa2V5LCAxMCkgPT09IGtleTtcbnZhciBjYWNoZVN0cmluZ0Z1bmN0aW9uID0gKGZuKSA9PiB7XG4gIGNvbnN0IGNhY2hlID0gLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHJldHVybiAoc3RyKSA9PiB7XG4gICAgY29uc3QgaGl0ID0gY2FjaGVbc3RyXTtcbiAgICByZXR1cm4gaGl0IHx8IChjYWNoZVtzdHJdID0gZm4oc3RyKSk7XG4gIH07XG59O1xudmFyIGNhbWVsaXplUkUgPSAvLShcXHcpL2c7XG52YXIgY2FtZWxpemUgPSBjYWNoZVN0cmluZ0Z1bmN0aW9uKChzdHIpID0+IHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIChfLCBjKSA9PiBjID8gYy50b1VwcGVyQ2FzZSgpIDogXCJcIik7XG59KTtcbnZhciBoeXBoZW5hdGVSRSA9IC9cXEIoW0EtWl0pL2c7XG52YXIgaHlwaGVuYXRlID0gY2FjaGVTdHJpbmdGdW5jdGlvbigoc3RyKSA9PiBzdHIucmVwbGFjZShoeXBoZW5hdGVSRSwgXCItJDFcIikudG9Mb3dlckNhc2UoKSk7XG52YXIgY2FwaXRhbGl6ZSA9IGNhY2hlU3RyaW5nRnVuY3Rpb24oKHN0cikgPT4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpKTtcbnZhciB0b0hhbmRsZXJLZXkgPSBjYWNoZVN0cmluZ0Z1bmN0aW9uKChzdHIpID0+IHN0ciA/IGBvbiR7Y2FwaXRhbGl6ZShzdHIpfWAgOiBgYCk7XG52YXIgaGFzQ2hhbmdlZCA9ICh2YWx1ZSwgb2xkVmFsdWUpID0+IHZhbHVlICE9PSBvbGRWYWx1ZSAmJiAodmFsdWUgPT09IHZhbHVlIHx8IG9sZFZhbHVlID09PSBvbGRWYWx1ZSk7XG5cbi8vIG5vZGVfbW9kdWxlcy9AdnVlL3JlYWN0aXZpdHkvZGlzdC9yZWFjdGl2aXR5LmVzbS1idW5kbGVyLmpzXG52YXIgdGFyZ2V0TWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBXZWFrTWFwKCk7XG52YXIgZWZmZWN0U3RhY2sgPSBbXTtcbnZhciBhY3RpdmVFZmZlY3Q7XG52YXIgSVRFUkFURV9LRVkgPSBTeW1ib2wodHJ1ZSA/IFwiaXRlcmF0ZVwiIDogXCJcIik7XG52YXIgTUFQX0tFWV9JVEVSQVRFX0tFWSA9IFN5bWJvbCh0cnVlID8gXCJNYXAga2V5IGl0ZXJhdGVcIiA6IFwiXCIpO1xuZnVuY3Rpb24gaXNFZmZlY3QoZm4pIHtcbiAgcmV0dXJuIGZuICYmIGZuLl9pc0VmZmVjdCA9PT0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGVmZmVjdDIoZm4sIG9wdGlvbnMgPSBFTVBUWV9PQkopIHtcbiAgaWYgKGlzRWZmZWN0KGZuKSkge1xuICAgIGZuID0gZm4ucmF3O1xuICB9XG4gIGNvbnN0IGVmZmVjdDMgPSBjcmVhdGVSZWFjdGl2ZUVmZmVjdChmbiwgb3B0aW9ucyk7XG4gIGlmICghb3B0aW9ucy5sYXp5KSB7XG4gICAgZWZmZWN0MygpO1xuICB9XG4gIHJldHVybiBlZmZlY3QzO1xufVxuZnVuY3Rpb24gc3RvcChlZmZlY3QzKSB7XG4gIGlmIChlZmZlY3QzLmFjdGl2ZSkge1xuICAgIGNsZWFudXAoZWZmZWN0Myk7XG4gICAgaWYgKGVmZmVjdDMub3B0aW9ucy5vblN0b3ApIHtcbiAgICAgIGVmZmVjdDMub3B0aW9ucy5vblN0b3AoKTtcbiAgICB9XG4gICAgZWZmZWN0My5hY3RpdmUgPSBmYWxzZTtcbiAgfVxufVxudmFyIHVpZCA9IDA7XG5mdW5jdGlvbiBjcmVhdGVSZWFjdGl2ZUVmZmVjdChmbiwgb3B0aW9ucykge1xuICBjb25zdCBlZmZlY3QzID0gZnVuY3Rpb24gcmVhY3RpdmVFZmZlY3QoKSB7XG4gICAgaWYgKCFlZmZlY3QzLmFjdGl2ZSkge1xuICAgICAgcmV0dXJuIGZuKCk7XG4gICAgfVxuICAgIGlmICghZWZmZWN0U3RhY2suaW5jbHVkZXMoZWZmZWN0MykpIHtcbiAgICAgIGNsZWFudXAoZWZmZWN0Myk7XG4gICAgICB0cnkge1xuICAgICAgICBlbmFibGVUcmFja2luZygpO1xuICAgICAgICBlZmZlY3RTdGFjay5wdXNoKGVmZmVjdDMpO1xuICAgICAgICBhY3RpdmVFZmZlY3QgPSBlZmZlY3QzO1xuICAgICAgICByZXR1cm4gZm4oKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGVmZmVjdFN0YWNrLnBvcCgpO1xuICAgICAgICByZXNldFRyYWNraW5nKCk7XG4gICAgICAgIGFjdGl2ZUVmZmVjdCA9IGVmZmVjdFN0YWNrW2VmZmVjdFN0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgZWZmZWN0My5pZCA9IHVpZCsrO1xuICBlZmZlY3QzLmFsbG93UmVjdXJzZSA9ICEhb3B0aW9ucy5hbGxvd1JlY3Vyc2U7XG4gIGVmZmVjdDMuX2lzRWZmZWN0ID0gdHJ1ZTtcbiAgZWZmZWN0My5hY3RpdmUgPSB0cnVlO1xuICBlZmZlY3QzLnJhdyA9IGZuO1xuICBlZmZlY3QzLmRlcHMgPSBbXTtcbiAgZWZmZWN0My5vcHRpb25zID0gb3B0aW9ucztcbiAgcmV0dXJuIGVmZmVjdDM7XG59XG5mdW5jdGlvbiBjbGVhbnVwKGVmZmVjdDMpIHtcbiAgY29uc3QgeyBkZXBzIH0gPSBlZmZlY3QzO1xuICBpZiAoZGVwcy5sZW5ndGgpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRlcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGRlcHNbaV0uZGVsZXRlKGVmZmVjdDMpO1xuICAgIH1cbiAgICBkZXBzLmxlbmd0aCA9IDA7XG4gIH1cbn1cbnZhciBzaG91bGRUcmFjayA9IHRydWU7XG52YXIgdHJhY2tTdGFjayA9IFtdO1xuZnVuY3Rpb24gcGF1c2VUcmFja2luZygpIHtcbiAgdHJhY2tTdGFjay5wdXNoKHNob3VsZFRyYWNrKTtcbiAgc2hvdWxkVHJhY2sgPSBmYWxzZTtcbn1cbmZ1bmN0aW9uIGVuYWJsZVRyYWNraW5nKCkge1xuICB0cmFja1N0YWNrLnB1c2goc2hvdWxkVHJhY2spO1xuICBzaG91bGRUcmFjayA9IHRydWU7XG59XG5mdW5jdGlvbiByZXNldFRyYWNraW5nKCkge1xuICBjb25zdCBsYXN0ID0gdHJhY2tTdGFjay5wb3AoKTtcbiAgc2hvdWxkVHJhY2sgPSBsYXN0ID09PSB2b2lkIDAgPyB0cnVlIDogbGFzdDtcbn1cbmZ1bmN0aW9uIHRyYWNrKHRhcmdldCwgdHlwZSwga2V5KSB7XG4gIGlmICghc2hvdWxkVHJhY2sgfHwgYWN0aXZlRWZmZWN0ID09PSB2b2lkIDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGRlcHNNYXAgPSB0YXJnZXRNYXAuZ2V0KHRhcmdldCk7XG4gIGlmICghZGVwc01hcCkge1xuICAgIHRhcmdldE1hcC5zZXQodGFyZ2V0LCBkZXBzTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSk7XG4gIH1cbiAgbGV0IGRlcCA9IGRlcHNNYXAuZ2V0KGtleSk7XG4gIGlmICghZGVwKSB7XG4gICAgZGVwc01hcC5zZXQoa2V5LCBkZXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpKTtcbiAgfVxuICBpZiAoIWRlcC5oYXMoYWN0aXZlRWZmZWN0KSkge1xuICAgIGRlcC5hZGQoYWN0aXZlRWZmZWN0KTtcbiAgICBhY3RpdmVFZmZlY3QuZGVwcy5wdXNoKGRlcCk7XG4gICAgaWYgKGFjdGl2ZUVmZmVjdC5vcHRpb25zLm9uVHJhY2spIHtcbiAgICAgIGFjdGl2ZUVmZmVjdC5vcHRpb25zLm9uVHJhY2soe1xuICAgICAgICBlZmZlY3Q6IGFjdGl2ZUVmZmVjdCxcbiAgICAgICAgdGFyZ2V0LFxuICAgICAgICB0eXBlLFxuICAgICAgICBrZXlcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gdHJpZ2dlcih0YXJnZXQsIHR5cGUsIGtleSwgbmV3VmFsdWUsIG9sZFZhbHVlLCBvbGRUYXJnZXQpIHtcbiAgY29uc3QgZGVwc01hcCA9IHRhcmdldE1hcC5nZXQodGFyZ2V0KTtcbiAgaWYgKCFkZXBzTWFwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGVmZmVjdHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICBjb25zdCBhZGQyID0gKGVmZmVjdHNUb0FkZCkgPT4ge1xuICAgIGlmIChlZmZlY3RzVG9BZGQpIHtcbiAgICAgIGVmZmVjdHNUb0FkZC5mb3JFYWNoKChlZmZlY3QzKSA9PiB7XG4gICAgICAgIGlmIChlZmZlY3QzICE9PSBhY3RpdmVFZmZlY3QgfHwgZWZmZWN0My5hbGxvd1JlY3Vyc2UpIHtcbiAgICAgICAgICBlZmZlY3RzLmFkZChlZmZlY3QzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICBpZiAodHlwZSA9PT0gXCJjbGVhclwiKSB7XG4gICAgZGVwc01hcC5mb3JFYWNoKGFkZDIpO1xuICB9IGVsc2UgaWYgKGtleSA9PT0gXCJsZW5ndGhcIiAmJiBpc0FycmF5KHRhcmdldCkpIHtcbiAgICBkZXBzTWFwLmZvckVhY2goKGRlcCwga2V5MikgPT4ge1xuICAgICAgaWYgKGtleTIgPT09IFwibGVuZ3RoXCIgfHwga2V5MiA+PSBuZXdWYWx1ZSkge1xuICAgICAgICBhZGQyKGRlcCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGtleSAhPT0gdm9pZCAwKSB7XG4gICAgICBhZGQyKGRlcHNNYXAuZ2V0KGtleSkpO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJhZGRcIjpcbiAgICAgICAgaWYgKCFpc0FycmF5KHRhcmdldCkpIHtcbiAgICAgICAgICBhZGQyKGRlcHNNYXAuZ2V0KElURVJBVEVfS0VZKSk7XG4gICAgICAgICAgaWYgKGlzTWFwKHRhcmdldCkpIHtcbiAgICAgICAgICAgIGFkZDIoZGVwc01hcC5nZXQoTUFQX0tFWV9JVEVSQVRFX0tFWSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChpc0ludGVnZXJLZXkoa2V5KSkge1xuICAgICAgICAgIGFkZDIoZGVwc01hcC5nZXQoXCJsZW5ndGhcIikpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImRlbGV0ZVwiOlxuICAgICAgICBpZiAoIWlzQXJyYXkodGFyZ2V0KSkge1xuICAgICAgICAgIGFkZDIoZGVwc01hcC5nZXQoSVRFUkFURV9LRVkpKTtcbiAgICAgICAgICBpZiAoaXNNYXAodGFyZ2V0KSkge1xuICAgICAgICAgICAgYWRkMihkZXBzTWFwLmdldChNQVBfS0VZX0lURVJBVEVfS0VZKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInNldFwiOlxuICAgICAgICBpZiAoaXNNYXAodGFyZ2V0KSkge1xuICAgICAgICAgIGFkZDIoZGVwc01hcC5nZXQoSVRFUkFURV9LRVkpKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgY29uc3QgcnVuID0gKGVmZmVjdDMpID0+IHtcbiAgICBpZiAoZWZmZWN0My5vcHRpb25zLm9uVHJpZ2dlcikge1xuICAgICAgZWZmZWN0My5vcHRpb25zLm9uVHJpZ2dlcih7XG4gICAgICAgIGVmZmVjdDogZWZmZWN0MyxcbiAgICAgICAgdGFyZ2V0LFxuICAgICAgICBrZXksXG4gICAgICAgIHR5cGUsXG4gICAgICAgIG5ld1ZhbHVlLFxuICAgICAgICBvbGRWYWx1ZSxcbiAgICAgICAgb2xkVGFyZ2V0XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGVmZmVjdDMub3B0aW9ucy5zY2hlZHVsZXIpIHtcbiAgICAgIGVmZmVjdDMub3B0aW9ucy5zY2hlZHVsZXIoZWZmZWN0Myk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVmZmVjdDMoKTtcbiAgICB9XG4gIH07XG4gIGVmZmVjdHMuZm9yRWFjaChydW4pO1xufVxudmFyIGlzTm9uVHJhY2thYmxlS2V5cyA9IC8qIEBfX1BVUkVfXyAqLyBtYWtlTWFwKGBfX3Byb3RvX18sX192X2lzUmVmLF9faXNWdWVgKTtcbnZhciBidWlsdEluU3ltYm9scyA9IG5ldyBTZXQoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoU3ltYm9sKS5tYXAoKGtleSkgPT4gU3ltYm9sW2tleV0pLmZpbHRlcihpc1N5bWJvbCkpO1xudmFyIGdldDIgPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlR2V0dGVyKCk7XG52YXIgcmVhZG9ubHlHZXQgPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlR2V0dGVyKHRydWUpO1xudmFyIGFycmF5SW5zdHJ1bWVudGF0aW9ucyA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVBcnJheUluc3RydW1lbnRhdGlvbnMoKTtcbmZ1bmN0aW9uIGNyZWF0ZUFycmF5SW5zdHJ1bWVudGF0aW9ucygpIHtcbiAgY29uc3QgaW5zdHJ1bWVudGF0aW9ucyA9IHt9O1xuICBbXCJpbmNsdWRlc1wiLCBcImluZGV4T2ZcIiwgXCJsYXN0SW5kZXhPZlwiXS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpbnN0cnVtZW50YXRpb25zW2tleV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICBjb25zdCBhcnIgPSB0b1Jhdyh0aGlzKTtcbiAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdHJhY2soYXJyLCBcImdldFwiLCBpICsgXCJcIik7XG4gICAgICB9XG4gICAgICBjb25zdCByZXMgPSBhcnJba2V5XSguLi5hcmdzKTtcbiAgICAgIGlmIChyZXMgPT09IC0xIHx8IHJlcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGFycltrZXldKC4uLmFyZ3MubWFwKHRvUmF3KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuICBbXCJwdXNoXCIsIFwicG9wXCIsIFwic2hpZnRcIiwgXCJ1bnNoaWZ0XCIsIFwic3BsaWNlXCJdLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGluc3RydW1lbnRhdGlvbnNba2V5XSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgIHBhdXNlVHJhY2tpbmcoKTtcbiAgICAgIGNvbnN0IHJlcyA9IHRvUmF3KHRoaXMpW2tleV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICByZXNldFRyYWNraW5nKCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH07XG4gIH0pO1xuICByZXR1cm4gaW5zdHJ1bWVudGF0aW9ucztcbn1cbmZ1bmN0aW9uIGNyZWF0ZUdldHRlcihpc1JlYWRvbmx5ID0gZmFsc2UsIHNoYWxsb3cgPSBmYWxzZSkge1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0Myh0YXJnZXQsIGtleSwgcmVjZWl2ZXIpIHtcbiAgICBpZiAoa2V5ID09PSBcIl9fdl9pc1JlYWN0aXZlXCIpIHtcbiAgICAgIHJldHVybiAhaXNSZWFkb25seTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJfX3ZfaXNSZWFkb25seVwiKSB7XG4gICAgICByZXR1cm4gaXNSZWFkb25seTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJfX3ZfcmF3XCIgJiYgcmVjZWl2ZXIgPT09IChpc1JlYWRvbmx5ID8gc2hhbGxvdyA/IHNoYWxsb3dSZWFkb25seU1hcCA6IHJlYWRvbmx5TWFwIDogc2hhbGxvdyA/IHNoYWxsb3dSZWFjdGl2ZU1hcCA6IHJlYWN0aXZlTWFwKS5nZXQodGFyZ2V0KSkge1xuICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG4gICAgY29uc3QgdGFyZ2V0SXNBcnJheSA9IGlzQXJyYXkodGFyZ2V0KTtcbiAgICBpZiAoIWlzUmVhZG9ubHkgJiYgdGFyZ2V0SXNBcnJheSAmJiBoYXNPd24oYXJyYXlJbnN0cnVtZW50YXRpb25zLCBrZXkpKSB7XG4gICAgICByZXR1cm4gUmVmbGVjdC5nZXQoYXJyYXlJbnN0cnVtZW50YXRpb25zLCBrZXksIHJlY2VpdmVyKTtcbiAgICB9XG4gICAgY29uc3QgcmVzID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBrZXksIHJlY2VpdmVyKTtcbiAgICBpZiAoaXNTeW1ib2woa2V5KSA/IGJ1aWx0SW5TeW1ib2xzLmhhcyhrZXkpIDogaXNOb25UcmFja2FibGVLZXlzKGtleSkpIHtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuICAgIGlmICghaXNSZWFkb25seSkge1xuICAgICAgdHJhY2sodGFyZ2V0LCBcImdldFwiLCBrZXkpO1xuICAgIH1cbiAgICBpZiAoc2hhbGxvdykge1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgaWYgKGlzUmVmKHJlcykpIHtcbiAgICAgIGNvbnN0IHNob3VsZFVud3JhcCA9ICF0YXJnZXRJc0FycmF5IHx8ICFpc0ludGVnZXJLZXkoa2V5KTtcbiAgICAgIHJldHVybiBzaG91bGRVbndyYXAgPyByZXMudmFsdWUgOiByZXM7XG4gICAgfVxuICAgIGlmIChpc09iamVjdChyZXMpKSB7XG4gICAgICByZXR1cm4gaXNSZWFkb25seSA/IHJlYWRvbmx5KHJlcykgOiByZWFjdGl2ZTIocmVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbn1cbnZhciBzZXQyID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZVNldHRlcigpO1xuZnVuY3Rpb24gY3JlYXRlU2V0dGVyKHNoYWxsb3cgPSBmYWxzZSkge1xuICByZXR1cm4gZnVuY3Rpb24gc2V0Myh0YXJnZXQsIGtleSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgbGV0IG9sZFZhbHVlID0gdGFyZ2V0W2tleV07XG4gICAgaWYgKCFzaGFsbG93KSB7XG4gICAgICB2YWx1ZSA9IHRvUmF3KHZhbHVlKTtcbiAgICAgIG9sZFZhbHVlID0gdG9SYXcob2xkVmFsdWUpO1xuICAgICAgaWYgKCFpc0FycmF5KHRhcmdldCkgJiYgaXNSZWYob2xkVmFsdWUpICYmICFpc1JlZih2YWx1ZSkpIHtcbiAgICAgICAgb2xkVmFsdWUudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGhhZEtleSA9IGlzQXJyYXkodGFyZ2V0KSAmJiBpc0ludGVnZXJLZXkoa2V5KSA/IE51bWJlcihrZXkpIDwgdGFyZ2V0Lmxlbmd0aCA6IGhhc093bih0YXJnZXQsIGtleSk7XG4gICAgY29uc3QgcmVzdWx0ID0gUmVmbGVjdC5zZXQodGFyZ2V0LCBrZXksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgaWYgKHRhcmdldCA9PT0gdG9SYXcocmVjZWl2ZXIpKSB7XG4gICAgICBpZiAoIWhhZEtleSkge1xuICAgICAgICB0cmlnZ2VyKHRhcmdldCwgXCJhZGRcIiwga2V5LCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGhhc0NoYW5nZWQodmFsdWUsIG9sZFZhbHVlKSkge1xuICAgICAgICB0cmlnZ2VyKHRhcmdldCwgXCJzZXRcIiwga2V5LCB2YWx1ZSwgb2xkVmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuZnVuY3Rpb24gZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpIHtcbiAgY29uc3QgaGFkS2V5ID0gaGFzT3duKHRhcmdldCwga2V5KTtcbiAgY29uc3Qgb2xkVmFsdWUgPSB0YXJnZXRba2V5XTtcbiAgY29uc3QgcmVzdWx0ID0gUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSh0YXJnZXQsIGtleSk7XG4gIGlmIChyZXN1bHQgJiYgaGFkS2V5KSB7XG4gICAgdHJpZ2dlcih0YXJnZXQsIFwiZGVsZXRlXCIsIGtleSwgdm9pZCAwLCBvbGRWYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGhhcyh0YXJnZXQsIGtleSkge1xuICBjb25zdCByZXN1bHQgPSBSZWZsZWN0Lmhhcyh0YXJnZXQsIGtleSk7XG4gIGlmICghaXNTeW1ib2woa2V5KSB8fCAhYnVpbHRJblN5bWJvbHMuaGFzKGtleSkpIHtcbiAgICB0cmFjayh0YXJnZXQsIFwiaGFzXCIsIGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG93bktleXModGFyZ2V0KSB7XG4gIHRyYWNrKHRhcmdldCwgXCJpdGVyYXRlXCIsIGlzQXJyYXkodGFyZ2V0KSA/IFwibGVuZ3RoXCIgOiBJVEVSQVRFX0tFWSk7XG4gIHJldHVybiBSZWZsZWN0Lm93bktleXModGFyZ2V0KTtcbn1cbnZhciBtdXRhYmxlSGFuZGxlcnMgPSB7XG4gIGdldDogZ2V0MixcbiAgc2V0OiBzZXQyLFxuICBkZWxldGVQcm9wZXJ0eSxcbiAgaGFzLFxuICBvd25LZXlzXG59O1xudmFyIHJlYWRvbmx5SGFuZGxlcnMgPSB7XG4gIGdldDogcmVhZG9ubHlHZXQsXG4gIHNldCh0YXJnZXQsIGtleSkge1xuICAgIGlmICh0cnVlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYFNldCBvcGVyYXRpb24gb24ga2V5IFwiJHtTdHJpbmcoa2V5KX1cIiBmYWlsZWQ6IHRhcmdldCBpcyByZWFkb25seS5gLCB0YXJnZXQpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBrZXkpIHtcbiAgICBpZiAodHJ1ZSkge1xuICAgICAgY29uc29sZS53YXJuKGBEZWxldGUgb3BlcmF0aW9uIG9uIGtleSBcIiR7U3RyaW5nKGtleSl9XCIgZmFpbGVkOiB0YXJnZXQgaXMgcmVhZG9ubHkuYCwgdGFyZ2V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG52YXIgdG9SZWFjdGl2ZSA9ICh2YWx1ZSkgPT4gaXNPYmplY3QodmFsdWUpID8gcmVhY3RpdmUyKHZhbHVlKSA6IHZhbHVlO1xudmFyIHRvUmVhZG9ubHkgPSAodmFsdWUpID0+IGlzT2JqZWN0KHZhbHVlKSA/IHJlYWRvbmx5KHZhbHVlKSA6IHZhbHVlO1xudmFyIHRvU2hhbGxvdyA9ICh2YWx1ZSkgPT4gdmFsdWU7XG52YXIgZ2V0UHJvdG8gPSAodikgPT4gUmVmbGVjdC5nZXRQcm90b3R5cGVPZih2KTtcbmZ1bmN0aW9uIGdldCQxKHRhcmdldCwga2V5LCBpc1JlYWRvbmx5ID0gZmFsc2UsIGlzU2hhbGxvdyA9IGZhbHNlKSB7XG4gIHRhcmdldCA9IHRhcmdldFtcbiAgICBcIl9fdl9yYXdcIlxuICAgIC8qIFJBVyAqL1xuICBdO1xuICBjb25zdCByYXdUYXJnZXQgPSB0b1Jhdyh0YXJnZXQpO1xuICBjb25zdCByYXdLZXkgPSB0b1JhdyhrZXkpO1xuICBpZiAoa2V5ICE9PSByYXdLZXkpIHtcbiAgICAhaXNSZWFkb25seSAmJiB0cmFjayhyYXdUYXJnZXQsIFwiZ2V0XCIsIGtleSk7XG4gIH1cbiAgIWlzUmVhZG9ubHkgJiYgdHJhY2socmF3VGFyZ2V0LCBcImdldFwiLCByYXdLZXkpO1xuICBjb25zdCB7IGhhczogaGFzMiB9ID0gZ2V0UHJvdG8ocmF3VGFyZ2V0KTtcbiAgY29uc3Qgd3JhcCA9IGlzU2hhbGxvdyA/IHRvU2hhbGxvdyA6IGlzUmVhZG9ubHkgPyB0b1JlYWRvbmx5IDogdG9SZWFjdGl2ZTtcbiAgaWYgKGhhczIuY2FsbChyYXdUYXJnZXQsIGtleSkpIHtcbiAgICByZXR1cm4gd3JhcCh0YXJnZXQuZ2V0KGtleSkpO1xuICB9IGVsc2UgaWYgKGhhczIuY2FsbChyYXdUYXJnZXQsIHJhd0tleSkpIHtcbiAgICByZXR1cm4gd3JhcCh0YXJnZXQuZ2V0KHJhd0tleSkpO1xuICB9IGVsc2UgaWYgKHRhcmdldCAhPT0gcmF3VGFyZ2V0KSB7XG4gICAgdGFyZ2V0LmdldChrZXkpO1xuICB9XG59XG5mdW5jdGlvbiBoYXMkMShrZXksIGlzUmVhZG9ubHkgPSBmYWxzZSkge1xuICBjb25zdCB0YXJnZXQgPSB0aGlzW1xuICAgIFwiX192X3Jhd1wiXG4gICAgLyogUkFXICovXG4gIF07XG4gIGNvbnN0IHJhd1RhcmdldCA9IHRvUmF3KHRhcmdldCk7XG4gIGNvbnN0IHJhd0tleSA9IHRvUmF3KGtleSk7XG4gIGlmIChrZXkgIT09IHJhd0tleSkge1xuICAgICFpc1JlYWRvbmx5ICYmIHRyYWNrKHJhd1RhcmdldCwgXCJoYXNcIiwga2V5KTtcbiAgfVxuICAhaXNSZWFkb25seSAmJiB0cmFjayhyYXdUYXJnZXQsIFwiaGFzXCIsIHJhd0tleSk7XG4gIHJldHVybiBrZXkgPT09IHJhd0tleSA/IHRhcmdldC5oYXMoa2V5KSA6IHRhcmdldC5oYXMoa2V5KSB8fCB0YXJnZXQuaGFzKHJhd0tleSk7XG59XG5mdW5jdGlvbiBzaXplKHRhcmdldCwgaXNSZWFkb25seSA9IGZhbHNlKSB7XG4gIHRhcmdldCA9IHRhcmdldFtcbiAgICBcIl9fdl9yYXdcIlxuICAgIC8qIFJBVyAqL1xuICBdO1xuICAhaXNSZWFkb25seSAmJiB0cmFjayh0b1Jhdyh0YXJnZXQpLCBcIml0ZXJhdGVcIiwgSVRFUkFURV9LRVkpO1xuICByZXR1cm4gUmVmbGVjdC5nZXQodGFyZ2V0LCBcInNpemVcIiwgdGFyZ2V0KTtcbn1cbmZ1bmN0aW9uIGFkZCh2YWx1ZSkge1xuICB2YWx1ZSA9IHRvUmF3KHZhbHVlKTtcbiAgY29uc3QgdGFyZ2V0ID0gdG9SYXcodGhpcyk7XG4gIGNvbnN0IHByb3RvID0gZ2V0UHJvdG8odGFyZ2V0KTtcbiAgY29uc3QgaGFkS2V5ID0gcHJvdG8uaGFzLmNhbGwodGFyZ2V0LCB2YWx1ZSk7XG4gIGlmICghaGFkS2V5KSB7XG4gICAgdGFyZ2V0LmFkZCh2YWx1ZSk7XG4gICAgdHJpZ2dlcih0YXJnZXQsIFwiYWRkXCIsIHZhbHVlLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5mdW5jdGlvbiBzZXQkMShrZXksIHZhbHVlKSB7XG4gIHZhbHVlID0gdG9SYXcodmFsdWUpO1xuICBjb25zdCB0YXJnZXQgPSB0b1Jhdyh0aGlzKTtcbiAgY29uc3QgeyBoYXM6IGhhczIsIGdldDogZ2V0MyB9ID0gZ2V0UHJvdG8odGFyZ2V0KTtcbiAgbGV0IGhhZEtleSA9IGhhczIuY2FsbCh0YXJnZXQsIGtleSk7XG4gIGlmICghaGFkS2V5KSB7XG4gICAga2V5ID0gdG9SYXcoa2V5KTtcbiAgICBoYWRLZXkgPSBoYXMyLmNhbGwodGFyZ2V0LCBrZXkpO1xuICB9IGVsc2UgaWYgKHRydWUpIHtcbiAgICBjaGVja0lkZW50aXR5S2V5cyh0YXJnZXQsIGhhczIsIGtleSk7XG4gIH1cbiAgY29uc3Qgb2xkVmFsdWUgPSBnZXQzLmNhbGwodGFyZ2V0LCBrZXkpO1xuICB0YXJnZXQuc2V0KGtleSwgdmFsdWUpO1xuICBpZiAoIWhhZEtleSkge1xuICAgIHRyaWdnZXIodGFyZ2V0LCBcImFkZFwiLCBrZXksIHZhbHVlKTtcbiAgfSBlbHNlIGlmIChoYXNDaGFuZ2VkKHZhbHVlLCBvbGRWYWx1ZSkpIHtcbiAgICB0cmlnZ2VyKHRhcmdldCwgXCJzZXRcIiwga2V5LCB2YWx1ZSwgb2xkVmFsdWUpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuZnVuY3Rpb24gZGVsZXRlRW50cnkoa2V5KSB7XG4gIGNvbnN0IHRhcmdldCA9IHRvUmF3KHRoaXMpO1xuICBjb25zdCB7IGhhczogaGFzMiwgZ2V0OiBnZXQzIH0gPSBnZXRQcm90byh0YXJnZXQpO1xuICBsZXQgaGFkS2V5ID0gaGFzMi5jYWxsKHRhcmdldCwga2V5KTtcbiAgaWYgKCFoYWRLZXkpIHtcbiAgICBrZXkgPSB0b1JhdyhrZXkpO1xuICAgIGhhZEtleSA9IGhhczIuY2FsbCh0YXJnZXQsIGtleSk7XG4gIH0gZWxzZSBpZiAodHJ1ZSkge1xuICAgIGNoZWNrSWRlbnRpdHlLZXlzKHRhcmdldCwgaGFzMiwga2V5KTtcbiAgfVxuICBjb25zdCBvbGRWYWx1ZSA9IGdldDMgPyBnZXQzLmNhbGwodGFyZ2V0LCBrZXkpIDogdm9pZCAwO1xuICBjb25zdCByZXN1bHQgPSB0YXJnZXQuZGVsZXRlKGtleSk7XG4gIGlmIChoYWRLZXkpIHtcbiAgICB0cmlnZ2VyKHRhcmdldCwgXCJkZWxldGVcIiwga2V5LCB2b2lkIDAsIG9sZFZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gY2xlYXIoKSB7XG4gIGNvbnN0IHRhcmdldCA9IHRvUmF3KHRoaXMpO1xuICBjb25zdCBoYWRJdGVtcyA9IHRhcmdldC5zaXplICE9PSAwO1xuICBjb25zdCBvbGRUYXJnZXQgPSB0cnVlID8gaXNNYXAodGFyZ2V0KSA/IG5ldyBNYXAodGFyZ2V0KSA6IG5ldyBTZXQodGFyZ2V0KSA6IHZvaWQgMDtcbiAgY29uc3QgcmVzdWx0ID0gdGFyZ2V0LmNsZWFyKCk7XG4gIGlmIChoYWRJdGVtcykge1xuICAgIHRyaWdnZXIodGFyZ2V0LCBcImNsZWFyXCIsIHZvaWQgMCwgdm9pZCAwLCBvbGRUYXJnZXQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjcmVhdGVGb3JFYWNoKGlzUmVhZG9ubHksIGlzU2hhbGxvdykge1xuICByZXR1cm4gZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGNvbnN0IG9ic2VydmVkID0gdGhpcztcbiAgICBjb25zdCB0YXJnZXQgPSBvYnNlcnZlZFtcbiAgICAgIFwiX192X3Jhd1wiXG4gICAgICAvKiBSQVcgKi9cbiAgICBdO1xuICAgIGNvbnN0IHJhd1RhcmdldCA9IHRvUmF3KHRhcmdldCk7XG4gICAgY29uc3Qgd3JhcCA9IGlzU2hhbGxvdyA/IHRvU2hhbGxvdyA6IGlzUmVhZG9ubHkgPyB0b1JlYWRvbmx5IDogdG9SZWFjdGl2ZTtcbiAgICAhaXNSZWFkb25seSAmJiB0cmFjayhyYXdUYXJnZXQsIFwiaXRlcmF0ZVwiLCBJVEVSQVRFX0tFWSk7XG4gICAgcmV0dXJuIHRhcmdldC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICByZXR1cm4gY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB3cmFwKHZhbHVlKSwgd3JhcChrZXkpLCBvYnNlcnZlZCk7XG4gICAgfSk7XG4gIH07XG59XG5mdW5jdGlvbiBjcmVhdGVJdGVyYWJsZU1ldGhvZChtZXRob2QsIGlzUmVhZG9ubHksIGlzU2hhbGxvdykge1xuICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgIGNvbnN0IHRhcmdldCA9IHRoaXNbXG4gICAgICBcIl9fdl9yYXdcIlxuICAgICAgLyogUkFXICovXG4gICAgXTtcbiAgICBjb25zdCByYXdUYXJnZXQgPSB0b1Jhdyh0YXJnZXQpO1xuICAgIGNvbnN0IHRhcmdldElzTWFwID0gaXNNYXAocmF3VGFyZ2V0KTtcbiAgICBjb25zdCBpc1BhaXIgPSBtZXRob2QgPT09IFwiZW50cmllc1wiIHx8IG1ldGhvZCA9PT0gU3ltYm9sLml0ZXJhdG9yICYmIHRhcmdldElzTWFwO1xuICAgIGNvbnN0IGlzS2V5T25seSA9IG1ldGhvZCA9PT0gXCJrZXlzXCIgJiYgdGFyZ2V0SXNNYXA7XG4gICAgY29uc3QgaW5uZXJJdGVyYXRvciA9IHRhcmdldFttZXRob2RdKC4uLmFyZ3MpO1xuICAgIGNvbnN0IHdyYXAgPSBpc1NoYWxsb3cgPyB0b1NoYWxsb3cgOiBpc1JlYWRvbmx5ID8gdG9SZWFkb25seSA6IHRvUmVhY3RpdmU7XG4gICAgIWlzUmVhZG9ubHkgJiYgdHJhY2socmF3VGFyZ2V0LCBcIml0ZXJhdGVcIiwgaXNLZXlPbmx5ID8gTUFQX0tFWV9JVEVSQVRFX0tFWSA6IElURVJBVEVfS0VZKTtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gaXRlcmF0b3IgcHJvdG9jb2xcbiAgICAgIG5leHQoKSB7XG4gICAgICAgIGNvbnN0IHsgdmFsdWUsIGRvbmUgfSA9IGlubmVySXRlcmF0b3IubmV4dCgpO1xuICAgICAgICByZXR1cm4gZG9uZSA/IHsgdmFsdWUsIGRvbmUgfSA6IHtcbiAgICAgICAgICB2YWx1ZTogaXNQYWlyID8gW3dyYXAodmFsdWVbMF0pLCB3cmFwKHZhbHVlWzFdKV0gOiB3cmFwKHZhbHVlKSxcbiAgICAgICAgICBkb25lXG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgLy8gaXRlcmFibGUgcHJvdG9jb2xcbiAgICAgIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICB9O1xuICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlUmVhZG9ubHlNZXRob2QodHlwZSkge1xuICByZXR1cm4gZnVuY3Rpb24oLi4uYXJncykge1xuICAgIGlmICh0cnVlKSB7XG4gICAgICBjb25zdCBrZXkgPSBhcmdzWzBdID8gYG9uIGtleSBcIiR7YXJnc1swXX1cIiBgIDogYGA7XG4gICAgICBjb25zb2xlLndhcm4oYCR7Y2FwaXRhbGl6ZSh0eXBlKX0gb3BlcmF0aW9uICR7a2V5fWZhaWxlZDogdGFyZ2V0IGlzIHJlYWRvbmx5LmAsIHRvUmF3KHRoaXMpKTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGUgPT09IFwiZGVsZXRlXCIgPyBmYWxzZSA6IHRoaXM7XG4gIH07XG59XG5mdW5jdGlvbiBjcmVhdGVJbnN0cnVtZW50YXRpb25zKCkge1xuICBjb25zdCBtdXRhYmxlSW5zdHJ1bWVudGF0aW9uczIgPSB7XG4gICAgZ2V0KGtleSkge1xuICAgICAgcmV0dXJuIGdldCQxKHRoaXMsIGtleSk7XG4gICAgfSxcbiAgICBnZXQgc2l6ZSgpIHtcbiAgICAgIHJldHVybiBzaXplKHRoaXMpO1xuICAgIH0sXG4gICAgaGFzOiBoYXMkMSxcbiAgICBhZGQsXG4gICAgc2V0OiBzZXQkMSxcbiAgICBkZWxldGU6IGRlbGV0ZUVudHJ5LFxuICAgIGNsZWFyLFxuICAgIGZvckVhY2g6IGNyZWF0ZUZvckVhY2goZmFsc2UsIGZhbHNlKVxuICB9O1xuICBjb25zdCBzaGFsbG93SW5zdHJ1bWVudGF0aW9uczIgPSB7XG4gICAgZ2V0KGtleSkge1xuICAgICAgcmV0dXJuIGdldCQxKHRoaXMsIGtleSwgZmFsc2UsIHRydWUpO1xuICAgIH0sXG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICByZXR1cm4gc2l6ZSh0aGlzKTtcbiAgICB9LFxuICAgIGhhczogaGFzJDEsXG4gICAgYWRkLFxuICAgIHNldDogc2V0JDEsXG4gICAgZGVsZXRlOiBkZWxldGVFbnRyeSxcbiAgICBjbGVhcixcbiAgICBmb3JFYWNoOiBjcmVhdGVGb3JFYWNoKGZhbHNlLCB0cnVlKVxuICB9O1xuICBjb25zdCByZWFkb25seUluc3RydW1lbnRhdGlvbnMyID0ge1xuICAgIGdldChrZXkpIHtcbiAgICAgIHJldHVybiBnZXQkMSh0aGlzLCBrZXksIHRydWUpO1xuICAgIH0sXG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICByZXR1cm4gc2l6ZSh0aGlzLCB0cnVlKTtcbiAgICB9LFxuICAgIGhhcyhrZXkpIHtcbiAgICAgIHJldHVybiBoYXMkMS5jYWxsKHRoaXMsIGtleSwgdHJ1ZSk7XG4gICAgfSxcbiAgICBhZGQ6IGNyZWF0ZVJlYWRvbmx5TWV0aG9kKFxuICAgICAgXCJhZGRcIlxuICAgICAgLyogQUREICovXG4gICAgKSxcbiAgICBzZXQ6IGNyZWF0ZVJlYWRvbmx5TWV0aG9kKFxuICAgICAgXCJzZXRcIlxuICAgICAgLyogU0VUICovXG4gICAgKSxcbiAgICBkZWxldGU6IGNyZWF0ZVJlYWRvbmx5TWV0aG9kKFxuICAgICAgXCJkZWxldGVcIlxuICAgICAgLyogREVMRVRFICovXG4gICAgKSxcbiAgICBjbGVhcjogY3JlYXRlUmVhZG9ubHlNZXRob2QoXG4gICAgICBcImNsZWFyXCJcbiAgICAgIC8qIENMRUFSICovXG4gICAgKSxcbiAgICBmb3JFYWNoOiBjcmVhdGVGb3JFYWNoKHRydWUsIGZhbHNlKVxuICB9O1xuICBjb25zdCBzaGFsbG93UmVhZG9ubHlJbnN0cnVtZW50YXRpb25zMiA9IHtcbiAgICBnZXQoa2V5KSB7XG4gICAgICByZXR1cm4gZ2V0JDEodGhpcywga2V5LCB0cnVlLCB0cnVlKTtcbiAgICB9LFxuICAgIGdldCBzaXplKCkge1xuICAgICAgcmV0dXJuIHNpemUodGhpcywgdHJ1ZSk7XG4gICAgfSxcbiAgICBoYXMoa2V5KSB7XG4gICAgICByZXR1cm4gaGFzJDEuY2FsbCh0aGlzLCBrZXksIHRydWUpO1xuICAgIH0sXG4gICAgYWRkOiBjcmVhdGVSZWFkb25seU1ldGhvZChcbiAgICAgIFwiYWRkXCJcbiAgICAgIC8qIEFERCAqL1xuICAgICksXG4gICAgc2V0OiBjcmVhdGVSZWFkb25seU1ldGhvZChcbiAgICAgIFwic2V0XCJcbiAgICAgIC8qIFNFVCAqL1xuICAgICksXG4gICAgZGVsZXRlOiBjcmVhdGVSZWFkb25seU1ldGhvZChcbiAgICAgIFwiZGVsZXRlXCJcbiAgICAgIC8qIERFTEVURSAqL1xuICAgICksXG4gICAgY2xlYXI6IGNyZWF0ZVJlYWRvbmx5TWV0aG9kKFxuICAgICAgXCJjbGVhclwiXG4gICAgICAvKiBDTEVBUiAqL1xuICAgICksXG4gICAgZm9yRWFjaDogY3JlYXRlRm9yRWFjaCh0cnVlLCB0cnVlKVxuICB9O1xuICBjb25zdCBpdGVyYXRvck1ldGhvZHMgPSBbXCJrZXlzXCIsIFwidmFsdWVzXCIsIFwiZW50cmllc1wiLCBTeW1ib2wuaXRlcmF0b3JdO1xuICBpdGVyYXRvck1ldGhvZHMuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gICAgbXV0YWJsZUluc3RydW1lbnRhdGlvbnMyW21ldGhvZF0gPSBjcmVhdGVJdGVyYWJsZU1ldGhvZChtZXRob2QsIGZhbHNlLCBmYWxzZSk7XG4gICAgcmVhZG9ubHlJbnN0cnVtZW50YXRpb25zMlttZXRob2RdID0gY3JlYXRlSXRlcmFibGVNZXRob2QobWV0aG9kLCB0cnVlLCBmYWxzZSk7XG4gICAgc2hhbGxvd0luc3RydW1lbnRhdGlvbnMyW21ldGhvZF0gPSBjcmVhdGVJdGVyYWJsZU1ldGhvZChtZXRob2QsIGZhbHNlLCB0cnVlKTtcbiAgICBzaGFsbG93UmVhZG9ubHlJbnN0cnVtZW50YXRpb25zMlttZXRob2RdID0gY3JlYXRlSXRlcmFibGVNZXRob2QobWV0aG9kLCB0cnVlLCB0cnVlKTtcbiAgfSk7XG4gIHJldHVybiBbXG4gICAgbXV0YWJsZUluc3RydW1lbnRhdGlvbnMyLFxuICAgIHJlYWRvbmx5SW5zdHJ1bWVudGF0aW9uczIsXG4gICAgc2hhbGxvd0luc3RydW1lbnRhdGlvbnMyLFxuICAgIHNoYWxsb3dSZWFkb25seUluc3RydW1lbnRhdGlvbnMyXG4gIF07XG59XG52YXIgW211dGFibGVJbnN0cnVtZW50YXRpb25zLCByZWFkb25seUluc3RydW1lbnRhdGlvbnMsIHNoYWxsb3dJbnN0cnVtZW50YXRpb25zLCBzaGFsbG93UmVhZG9ubHlJbnN0cnVtZW50YXRpb25zXSA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVJbnN0cnVtZW50YXRpb25zKCk7XG5mdW5jdGlvbiBjcmVhdGVJbnN0cnVtZW50YXRpb25HZXR0ZXIoaXNSZWFkb25seSwgc2hhbGxvdykge1xuICBjb25zdCBpbnN0cnVtZW50YXRpb25zID0gc2hhbGxvdyA/IGlzUmVhZG9ubHkgPyBzaGFsbG93UmVhZG9ubHlJbnN0cnVtZW50YXRpb25zIDogc2hhbGxvd0luc3RydW1lbnRhdGlvbnMgOiBpc1JlYWRvbmx5ID8gcmVhZG9ubHlJbnN0cnVtZW50YXRpb25zIDogbXV0YWJsZUluc3RydW1lbnRhdGlvbnM7XG4gIHJldHVybiAodGFyZ2V0LCBrZXksIHJlY2VpdmVyKSA9PiB7XG4gICAgaWYgKGtleSA9PT0gXCJfX3ZfaXNSZWFjdGl2ZVwiKSB7XG4gICAgICByZXR1cm4gIWlzUmVhZG9ubHk7XG4gICAgfSBlbHNlIGlmIChrZXkgPT09IFwiX192X2lzUmVhZG9ubHlcIikge1xuICAgICAgcmV0dXJuIGlzUmVhZG9ubHk7XG4gICAgfSBlbHNlIGlmIChrZXkgPT09IFwiX192X3Jhd1wiKSB7XG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbiAgICByZXR1cm4gUmVmbGVjdC5nZXQoaGFzT3duKGluc3RydW1lbnRhdGlvbnMsIGtleSkgJiYga2V5IGluIHRhcmdldCA/IGluc3RydW1lbnRhdGlvbnMgOiB0YXJnZXQsIGtleSwgcmVjZWl2ZXIpO1xuICB9O1xufVxudmFyIG11dGFibGVDb2xsZWN0aW9uSGFuZGxlcnMgPSB7XG4gIGdldDogLyogQF9fUFVSRV9fICovIGNyZWF0ZUluc3RydW1lbnRhdGlvbkdldHRlcihmYWxzZSwgZmFsc2UpXG59O1xudmFyIHJlYWRvbmx5Q29sbGVjdGlvbkhhbmRsZXJzID0ge1xuICBnZXQ6IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVJbnN0cnVtZW50YXRpb25HZXR0ZXIodHJ1ZSwgZmFsc2UpXG59O1xuZnVuY3Rpb24gY2hlY2tJZGVudGl0eUtleXModGFyZ2V0LCBoYXMyLCBrZXkpIHtcbiAgY29uc3QgcmF3S2V5ID0gdG9SYXcoa2V5KTtcbiAgaWYgKHJhd0tleSAhPT0ga2V5ICYmIGhhczIuY2FsbCh0YXJnZXQsIHJhd0tleSkpIHtcbiAgICBjb25zdCB0eXBlID0gdG9SYXdUeXBlKHRhcmdldCk7XG4gICAgY29uc29sZS53YXJuKGBSZWFjdGl2ZSAke3R5cGV9IGNvbnRhaW5zIGJvdGggdGhlIHJhdyBhbmQgcmVhY3RpdmUgdmVyc2lvbnMgb2YgdGhlIHNhbWUgb2JqZWN0JHt0eXBlID09PSBgTWFwYCA/IGAgYXMga2V5c2AgOiBgYH0sIHdoaWNoIGNhbiBsZWFkIHRvIGluY29uc2lzdGVuY2llcy4gQXZvaWQgZGlmZmVyZW50aWF0aW5nIGJldHdlZW4gdGhlIHJhdyBhbmQgcmVhY3RpdmUgdmVyc2lvbnMgb2YgYW4gb2JqZWN0IGFuZCBvbmx5IHVzZSB0aGUgcmVhY3RpdmUgdmVyc2lvbiBpZiBwb3NzaWJsZS5gKTtcbiAgfVxufVxudmFyIHJlYWN0aXZlTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBXZWFrTWFwKCk7XG52YXIgc2hhbGxvd1JlYWN0aXZlTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBXZWFrTWFwKCk7XG52YXIgcmVhZG9ubHlNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTtcbnZhciBzaGFsbG93UmVhZG9ubHlNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHRhcmdldFR5cGVNYXAocmF3VHlwZSkge1xuICBzd2l0Y2ggKHJhd1R5cGUpIHtcbiAgICBjYXNlIFwiT2JqZWN0XCI6XG4gICAgY2FzZSBcIkFycmF5XCI6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlIFwiTWFwXCI6XG4gICAgY2FzZSBcIlNldFwiOlxuICAgIGNhc2UgXCJXZWFrTWFwXCI6XG4gICAgY2FzZSBcIldlYWtTZXRcIjpcbiAgICAgIHJldHVybiAyO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gMDtcbiAgfVxufVxuZnVuY3Rpb24gZ2V0VGFyZ2V0VHlwZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWVbXG4gICAgXCJfX3Zfc2tpcFwiXG4gICAgLyogU0tJUCAqL1xuICBdIHx8ICFPYmplY3QuaXNFeHRlbnNpYmxlKHZhbHVlKSA/IDAgOiB0YXJnZXRUeXBlTWFwKHRvUmF3VHlwZSh2YWx1ZSkpO1xufVxuZnVuY3Rpb24gcmVhY3RpdmUyKHRhcmdldCkge1xuICBpZiAodGFyZ2V0ICYmIHRhcmdldFtcbiAgICBcIl9fdl9pc1JlYWRvbmx5XCJcbiAgICAvKiBJU19SRUFET05MWSAqL1xuICBdKSB7XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuICByZXR1cm4gY3JlYXRlUmVhY3RpdmVPYmplY3QodGFyZ2V0LCBmYWxzZSwgbXV0YWJsZUhhbmRsZXJzLCBtdXRhYmxlQ29sbGVjdGlvbkhhbmRsZXJzLCByZWFjdGl2ZU1hcCk7XG59XG5mdW5jdGlvbiByZWFkb25seSh0YXJnZXQpIHtcbiAgcmV0dXJuIGNyZWF0ZVJlYWN0aXZlT2JqZWN0KHRhcmdldCwgdHJ1ZSwgcmVhZG9ubHlIYW5kbGVycywgcmVhZG9ubHlDb2xsZWN0aW9uSGFuZGxlcnMsIHJlYWRvbmx5TWFwKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVJlYWN0aXZlT2JqZWN0KHRhcmdldCwgaXNSZWFkb25seSwgYmFzZUhhbmRsZXJzLCBjb2xsZWN0aW9uSGFuZGxlcnMsIHByb3h5TWFwKSB7XG4gIGlmICghaXNPYmplY3QodGFyZ2V0KSkge1xuICAgIGlmICh0cnVlKSB7XG4gICAgICBjb25zb2xlLndhcm4oYHZhbHVlIGNhbm5vdCBiZSBtYWRlIHJlYWN0aXZlOiAke1N0cmluZyh0YXJnZXQpfWApO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG4gIGlmICh0YXJnZXRbXG4gICAgXCJfX3ZfcmF3XCJcbiAgICAvKiBSQVcgKi9cbiAgXSAmJiAhKGlzUmVhZG9ubHkgJiYgdGFyZ2V0W1xuICAgIFwiX192X2lzUmVhY3RpdmVcIlxuICAgIC8qIElTX1JFQUNUSVZFICovXG4gIF0pKSB7XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuICBjb25zdCBleGlzdGluZ1Byb3h5ID0gcHJveHlNYXAuZ2V0KHRhcmdldCk7XG4gIGlmIChleGlzdGluZ1Byb3h5KSB7XG4gICAgcmV0dXJuIGV4aXN0aW5nUHJveHk7XG4gIH1cbiAgY29uc3QgdGFyZ2V0VHlwZSA9IGdldFRhcmdldFR5cGUodGFyZ2V0KTtcbiAgaWYgKHRhcmdldFR5cGUgPT09IDApIHtcbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9XG4gIGNvbnN0IHByb3h5ID0gbmV3IFByb3h5KHRhcmdldCwgdGFyZ2V0VHlwZSA9PT0gMiA/IGNvbGxlY3Rpb25IYW5kbGVycyA6IGJhc2VIYW5kbGVycyk7XG4gIHByb3h5TWFwLnNldCh0YXJnZXQsIHByb3h5KTtcbiAgcmV0dXJuIHByb3h5O1xufVxuZnVuY3Rpb24gdG9SYXcob2JzZXJ2ZWQpIHtcbiAgcmV0dXJuIG9ic2VydmVkICYmIHRvUmF3KG9ic2VydmVkW1xuICAgIFwiX192X3Jhd1wiXG4gICAgLyogUkFXICovXG4gIF0pIHx8IG9ic2VydmVkO1xufVxuZnVuY3Rpb24gaXNSZWYocikge1xuICByZXR1cm4gQm9vbGVhbihyICYmIHIuX192X2lzUmVmID09PSB0cnVlKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL21hZ2ljcy8kbmV4dFRpY2suanNcbm1hZ2ljKFwibmV4dFRpY2tcIiwgKCkgPT4gbmV4dFRpY2spO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvbWFnaWNzLyRkaXNwYXRjaC5qc1xubWFnaWMoXCJkaXNwYXRjaFwiLCAoZWwpID0+IGRpc3BhdGNoLmJpbmQoZGlzcGF0Y2gsIGVsKSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJHdhdGNoLmpzXG5tYWdpYyhcIndhdGNoXCIsIChlbCwgeyBldmFsdWF0ZUxhdGVyOiBldmFsdWF0ZUxhdGVyMiwgY2xlYW51cDogY2xlYW51cDIgfSkgPT4gKGtleSwgY2FsbGJhY2spID0+IHtcbiAgbGV0IGV2YWx1YXRlMiA9IGV2YWx1YXRlTGF0ZXIyKGtleSk7XG4gIGxldCBnZXR0ZXIgPSAoKSA9PiB7XG4gICAgbGV0IHZhbHVlO1xuICAgIGV2YWx1YXRlMigoaSkgPT4gdmFsdWUgPSBpKTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG4gIGxldCB1bndhdGNoID0gd2F0Y2goZ2V0dGVyLCBjYWxsYmFjayk7XG4gIGNsZWFudXAyKHVud2F0Y2gpO1xufSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJHN0b3JlLmpzXG5tYWdpYyhcInN0b3JlXCIsIGdldFN0b3Jlcyk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJGRhdGEuanNcbm1hZ2ljKFwiZGF0YVwiLCAoZWwpID0+IHNjb3BlKGVsKSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJHJvb3QuanNcbm1hZ2ljKFwicm9vdFwiLCAoZWwpID0+IGNsb3Nlc3RSb290KGVsKSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJHJlZnMuanNcbm1hZ2ljKFwicmVmc1wiLCAoZWwpID0+IHtcbiAgaWYgKGVsLl94X3JlZnNfcHJveHkpXG4gICAgcmV0dXJuIGVsLl94X3JlZnNfcHJveHk7XG4gIGVsLl94X3JlZnNfcHJveHkgPSBtZXJnZVByb3hpZXMoZ2V0QXJyYXlPZlJlZk9iamVjdChlbCkpO1xuICByZXR1cm4gZWwuX3hfcmVmc19wcm94eTtcbn0pO1xuZnVuY3Rpb24gZ2V0QXJyYXlPZlJlZk9iamVjdChlbCkge1xuICBsZXQgcmVmT2JqZWN0cyA9IFtdO1xuICBmaW5kQ2xvc2VzdChlbCwgKGkpID0+IHtcbiAgICBpZiAoaS5feF9yZWZzKVxuICAgICAgcmVmT2JqZWN0cy5wdXNoKGkuX3hfcmVmcyk7XG4gIH0pO1xuICByZXR1cm4gcmVmT2JqZWN0cztcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2lkcy5qc1xudmFyIGdsb2JhbElkTWVtbyA9IHt9O1xuZnVuY3Rpb24gZmluZEFuZEluY3JlbWVudElkKG5hbWUpIHtcbiAgaWYgKCFnbG9iYWxJZE1lbW9bbmFtZV0pXG4gICAgZ2xvYmFsSWRNZW1vW25hbWVdID0gMDtcbiAgcmV0dXJuICsrZ2xvYmFsSWRNZW1vW25hbWVdO1xufVxuZnVuY3Rpb24gY2xvc2VzdElkUm9vdChlbCwgbmFtZSkge1xuICByZXR1cm4gZmluZENsb3Nlc3QoZWwsIChlbGVtZW50KSA9PiB7XG4gICAgaWYgKGVsZW1lbnQuX3hfaWRzICYmIGVsZW1lbnQuX3hfaWRzW25hbWVdKVxuICAgICAgcmV0dXJuIHRydWU7XG4gIH0pO1xufVxuZnVuY3Rpb24gc2V0SWRSb290KGVsLCBuYW1lKSB7XG4gIGlmICghZWwuX3hfaWRzKVxuICAgIGVsLl94X2lkcyA9IHt9O1xuICBpZiAoIWVsLl94X2lkc1tuYW1lXSlcbiAgICBlbC5feF9pZHNbbmFtZV0gPSBmaW5kQW5kSW5jcmVtZW50SWQobmFtZSk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9tYWdpY3MvJGlkLmpzXG5tYWdpYyhcImlkXCIsIChlbCwgeyBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiAobmFtZSwga2V5ID0gbnVsbCkgPT4ge1xuICBsZXQgY2FjaGVLZXkgPSBgJHtuYW1lfSR7a2V5ID8gYC0ke2tleX1gIDogXCJcIn1gO1xuICByZXR1cm4gY2FjaGVJZEJ5TmFtZU9uRWxlbWVudChlbCwgY2FjaGVLZXksIGNsZWFudXAyLCAoKSA9PiB7XG4gICAgbGV0IHJvb3QgPSBjbG9zZXN0SWRSb290KGVsLCBuYW1lKTtcbiAgICBsZXQgaWQgPSByb290ID8gcm9vdC5feF9pZHNbbmFtZV0gOiBmaW5kQW5kSW5jcmVtZW50SWQobmFtZSk7XG4gICAgcmV0dXJuIGtleSA/IGAke25hbWV9LSR7aWR9LSR7a2V5fWAgOiBgJHtuYW1lfS0ke2lkfWA7XG4gIH0pO1xufSk7XG5pbnRlcmNlcHRDbG9uZSgoZnJvbSwgdG8pID0+IHtcbiAgaWYgKGZyb20uX3hfaWQpIHtcbiAgICB0by5feF9pZCA9IGZyb20uX3hfaWQ7XG4gIH1cbn0pO1xuZnVuY3Rpb24gY2FjaGVJZEJ5TmFtZU9uRWxlbWVudChlbCwgY2FjaGVLZXksIGNsZWFudXAyLCBjYWxsYmFjaykge1xuICBpZiAoIWVsLl94X2lkKVxuICAgIGVsLl94X2lkID0ge307XG4gIGlmIChlbC5feF9pZFtjYWNoZUtleV0pXG4gICAgcmV0dXJuIGVsLl94X2lkW2NhY2hlS2V5XTtcbiAgbGV0IG91dHB1dCA9IGNhbGxiYWNrKCk7XG4gIGVsLl94X2lkW2NhY2hlS2V5XSA9IG91dHB1dDtcbiAgY2xlYW51cDIoKCkgPT4ge1xuICAgIGRlbGV0ZSBlbC5feF9pZFtjYWNoZUtleV07XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvbWFnaWNzLyRlbC5qc1xubWFnaWMoXCJlbFwiLCAoZWwpID0+IGVsKTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL21hZ2ljcy9pbmRleC5qc1xud2Fybk1pc3NpbmdQbHVnaW5NYWdpYyhcIkZvY3VzXCIsIFwiZm9jdXNcIiwgXCJmb2N1c1wiKTtcbndhcm5NaXNzaW5nUGx1Z2luTWFnaWMoXCJQZXJzaXN0XCIsIFwicGVyc2lzdFwiLCBcInBlcnNpc3RcIik7XG5mdW5jdGlvbiB3YXJuTWlzc2luZ1BsdWdpbk1hZ2ljKG5hbWUsIG1hZ2ljTmFtZSwgc2x1Zykge1xuICBtYWdpYyhtYWdpY05hbWUsIChlbCkgPT4gd2FybihgWW91IGNhbid0IHVzZSBbJCR7bWFnaWNOYW1lfV0gd2l0aG91dCBmaXJzdCBpbnN0YWxsaW5nIHRoZSBcIiR7bmFtZX1cIiBwbHVnaW4gaGVyZTogaHR0cHM6Ly9hbHBpbmVqcy5kZXYvcGx1Z2lucy8ke3NsdWd9YCwgZWwpKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC1tb2RlbGFibGUuanNcbmRpcmVjdGl2ZShcIm1vZGVsYWJsZVwiLCAoZWwsIHsgZXhwcmVzc2lvbiB9LCB7IGVmZmVjdDogZWZmZWN0MywgZXZhbHVhdGVMYXRlcjogZXZhbHVhdGVMYXRlcjIsIGNsZWFudXA6IGNsZWFudXAyIH0pID0+IHtcbiAgbGV0IGZ1bmMgPSBldmFsdWF0ZUxhdGVyMihleHByZXNzaW9uKTtcbiAgbGV0IGlubmVyR2V0ID0gKCkgPT4ge1xuICAgIGxldCByZXN1bHQ7XG4gICAgZnVuYygoaSkgPT4gcmVzdWx0ID0gaSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgbGV0IGV2YWx1YXRlSW5uZXJTZXQgPSBldmFsdWF0ZUxhdGVyMihgJHtleHByZXNzaW9ufSA9IF9fcGxhY2Vob2xkZXJgKTtcbiAgbGV0IGlubmVyU2V0ID0gKHZhbCkgPT4gZXZhbHVhdGVJbm5lclNldCgoKSA9PiB7XG4gIH0sIHsgc2NvcGU6IHsgXCJfX3BsYWNlaG9sZGVyXCI6IHZhbCB9IH0pO1xuICBsZXQgaW5pdGlhbFZhbHVlID0gaW5uZXJHZXQoKTtcbiAgaW5uZXJTZXQoaW5pdGlhbFZhbHVlKTtcbiAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgIGlmICghZWwuX3hfbW9kZWwpXG4gICAgICByZXR1cm47XG4gICAgZWwuX3hfcmVtb3ZlTW9kZWxMaXN0ZW5lcnNbXCJkZWZhdWx0XCJdKCk7XG4gICAgbGV0IG91dGVyR2V0ID0gZWwuX3hfbW9kZWwuZ2V0O1xuICAgIGxldCBvdXRlclNldCA9IGVsLl94X21vZGVsLnNldDtcbiAgICBsZXQgcmVsZWFzZUVudGFuZ2xlbWVudCA9IGVudGFuZ2xlKFxuICAgICAge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIG91dGVyR2V0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgIG91dGVyU2V0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiBpbm5lckdldCgpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQodmFsdWUpIHtcbiAgICAgICAgICBpbm5lclNldCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICAgIGNsZWFudXAyKHJlbGVhc2VFbnRhbmdsZW1lbnQpO1xuICB9KTtcbn0pO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LXRlbGVwb3J0LmpzXG5kaXJlY3RpdmUoXCJ0ZWxlcG9ydFwiLCAoZWwsIHsgbW9kaWZpZXJzLCBleHByZXNzaW9uIH0sIHsgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBpZiAoZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSBcInRlbXBsYXRlXCIpXG4gICAgd2FybihcIngtdGVsZXBvcnQgY2FuIG9ubHkgYmUgdXNlZCBvbiBhIDx0ZW1wbGF0ZT4gdGFnXCIsIGVsKTtcbiAgbGV0IHRhcmdldCA9IGdldFRhcmdldChleHByZXNzaW9uKTtcbiAgbGV0IGNsb25lMiA9IGVsLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpLmZpcnN0RWxlbWVudENoaWxkO1xuICBlbC5feF90ZWxlcG9ydCA9IGNsb25lMjtcbiAgY2xvbmUyLl94X3RlbGVwb3J0QmFjayA9IGVsO1xuICBlbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXRlbGVwb3J0LXRlbXBsYXRlXCIsIHRydWUpO1xuICBjbG9uZTIuc2V0QXR0cmlidXRlKFwiZGF0YS10ZWxlcG9ydC10YXJnZXRcIiwgdHJ1ZSk7XG4gIGlmIChlbC5feF9mb3J3YXJkRXZlbnRzKSB7XG4gICAgZWwuX3hfZm9yd2FyZEV2ZW50cy5mb3JFYWNoKChldmVudE5hbWUpID0+IHtcbiAgICAgIGNsb25lMi5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgZS5jb25zdHJ1Y3RvcihlLnR5cGUsIGUpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIGFkZFNjb3BlVG9Ob2RlKGNsb25lMiwge30sIGVsKTtcbiAgbGV0IHBsYWNlSW5Eb20gPSAoY2xvbmUzLCB0YXJnZXQyLCBtb2RpZmllcnMyKSA9PiB7XG4gICAgaWYgKG1vZGlmaWVyczIuaW5jbHVkZXMoXCJwcmVwZW5kXCIpKSB7XG4gICAgICB0YXJnZXQyLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGNsb25lMywgdGFyZ2V0Mik7XG4gICAgfSBlbHNlIGlmIChtb2RpZmllcnMyLmluY2x1ZGVzKFwiYXBwZW5kXCIpKSB7XG4gICAgICB0YXJnZXQyLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGNsb25lMywgdGFyZ2V0Mi5uZXh0U2libGluZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldDIuYXBwZW5kQ2hpbGQoY2xvbmUzKTtcbiAgICB9XG4gIH07XG4gIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgcGxhY2VJbkRvbShjbG9uZTIsIHRhcmdldCwgbW9kaWZpZXJzKTtcbiAgICBza2lwRHVyaW5nQ2xvbmUoKCkgPT4ge1xuICAgICAgaW5pdFRyZWUoY2xvbmUyKTtcbiAgICB9KSgpO1xuICB9KTtcbiAgZWwuX3hfdGVsZXBvcnRQdXRCYWNrID0gKCkgPT4ge1xuICAgIGxldCB0YXJnZXQyID0gZ2V0VGFyZ2V0KGV4cHJlc3Npb24pO1xuICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICBwbGFjZUluRG9tKGVsLl94X3RlbGVwb3J0LCB0YXJnZXQyLCBtb2RpZmllcnMpO1xuICAgIH0pO1xuICB9O1xuICBjbGVhbnVwMihcbiAgICAoKSA9PiBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgY2xvbmUyLnJlbW92ZSgpO1xuICAgICAgZGVzdHJveVRyZWUoY2xvbmUyKTtcbiAgICB9KVxuICApO1xufSk7XG52YXIgdGVsZXBvcnRDb250YWluZXJEdXJpbmdDbG9uZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5mdW5jdGlvbiBnZXRUYXJnZXQoZXhwcmVzc2lvbikge1xuICBsZXQgdGFyZ2V0ID0gc2tpcER1cmluZ0Nsb25lKCgpID0+IHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihleHByZXNzaW9uKTtcbiAgfSwgKCkgPT4ge1xuICAgIHJldHVybiB0ZWxlcG9ydENvbnRhaW5lckR1cmluZ0Nsb25lO1xuICB9KSgpO1xuICBpZiAoIXRhcmdldClcbiAgICB3YXJuKGBDYW5ub3QgZmluZCB4LXRlbGVwb3J0IGVsZW1lbnQgZm9yIHNlbGVjdG9yOiBcIiR7ZXhwcmVzc2lvbn1cImApO1xuICByZXR1cm4gdGFyZ2V0O1xufVxuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LWlnbm9yZS5qc1xudmFyIGhhbmRsZXIgPSAoKSA9PiB7XG59O1xuaGFuZGxlci5pbmxpbmUgPSAoZWwsIHsgbW9kaWZpZXJzIH0sIHsgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBtb2RpZmllcnMuaW5jbHVkZXMoXCJzZWxmXCIpID8gZWwuX3hfaWdub3JlU2VsZiA9IHRydWUgOiBlbC5feF9pZ25vcmUgPSB0cnVlO1xuICBjbGVhbnVwMigoKSA9PiB7XG4gICAgbW9kaWZpZXJzLmluY2x1ZGVzKFwic2VsZlwiKSA/IGRlbGV0ZSBlbC5feF9pZ25vcmVTZWxmIDogZGVsZXRlIGVsLl94X2lnbm9yZTtcbiAgfSk7XG59O1xuZGlyZWN0aXZlKFwiaWdub3JlXCIsIGhhbmRsZXIpO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LWVmZmVjdC5qc1xuZGlyZWN0aXZlKFwiZWZmZWN0XCIsIHNraXBEdXJpbmdDbG9uZSgoZWwsIHsgZXhwcmVzc2lvbiB9LCB7IGVmZmVjdDogZWZmZWN0MyB9KSA9PiB7XG4gIGVmZmVjdDMoZXZhbHVhdGVMYXRlcihlbCwgZXhwcmVzc2lvbikpO1xufSkpO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvdXRpbHMvb24uanNcbmZ1bmN0aW9uIG9uKGVsLCBldmVudCwgbW9kaWZpZXJzLCBjYWxsYmFjaykge1xuICBsZXQgbGlzdGVuZXJUYXJnZXQgPSBlbDtcbiAgbGV0IGhhbmRsZXI0ID0gKGUpID0+IGNhbGxiYWNrKGUpO1xuICBsZXQgb3B0aW9ucyA9IHt9O1xuICBsZXQgd3JhcEhhbmRsZXIgPSAoY2FsbGJhY2syLCB3cmFwcGVyKSA9PiAoZSkgPT4gd3JhcHBlcihjYWxsYmFjazIsIGUpO1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiZG90XCIpKVxuICAgIGV2ZW50ID0gZG90U3ludGF4KGV2ZW50KTtcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImNhbWVsXCIpKVxuICAgIGV2ZW50ID0gY2FtZWxDYXNlMihldmVudCk7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJwYXNzaXZlXCIpKVxuICAgIG9wdGlvbnMucGFzc2l2ZSA9IHRydWU7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJjYXB0dXJlXCIpKVxuICAgIG9wdGlvbnMuY2FwdHVyZSA9IHRydWU7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJ3aW5kb3dcIikpXG4gICAgbGlzdGVuZXJUYXJnZXQgPSB3aW5kb3c7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJkb2N1bWVudFwiKSlcbiAgICBsaXN0ZW5lclRhcmdldCA9IGRvY3VtZW50O1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiZGVib3VuY2VcIikpIHtcbiAgICBsZXQgbmV4dE1vZGlmaWVyID0gbW9kaWZpZXJzW21vZGlmaWVycy5pbmRleE9mKFwiZGVib3VuY2VcIikgKyAxXSB8fCBcImludmFsaWQtd2FpdFwiO1xuICAgIGxldCB3YWl0ID0gaXNOdW1lcmljKG5leHRNb2RpZmllci5zcGxpdChcIm1zXCIpWzBdKSA/IE51bWJlcihuZXh0TW9kaWZpZXIuc3BsaXQoXCJtc1wiKVswXSkgOiAyNTA7XG4gICAgaGFuZGxlcjQgPSBkZWJvdW5jZShoYW5kbGVyNCwgd2FpdCk7XG4gIH1cbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcInRocm90dGxlXCIpKSB7XG4gICAgbGV0IG5leHRNb2RpZmllciA9IG1vZGlmaWVyc1ttb2RpZmllcnMuaW5kZXhPZihcInRocm90dGxlXCIpICsgMV0gfHwgXCJpbnZhbGlkLXdhaXRcIjtcbiAgICBsZXQgd2FpdCA9IGlzTnVtZXJpYyhuZXh0TW9kaWZpZXIuc3BsaXQoXCJtc1wiKVswXSkgPyBOdW1iZXIobmV4dE1vZGlmaWVyLnNwbGl0KFwibXNcIilbMF0pIDogMjUwO1xuICAgIGhhbmRsZXI0ID0gdGhyb3R0bGUoaGFuZGxlcjQsIHdhaXQpO1xuICB9XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJwcmV2ZW50XCIpKVxuICAgIGhhbmRsZXI0ID0gd3JhcEhhbmRsZXIoaGFuZGxlcjQsIChuZXh0LCBlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBuZXh0KGUpO1xuICAgIH0pO1xuICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwic3RvcFwiKSlcbiAgICBoYW5kbGVyNCA9IHdyYXBIYW5kbGVyKGhhbmRsZXI0LCAobmV4dCwgZSkgPT4ge1xuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIG5leHQoZSk7XG4gICAgfSk7XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJvbmNlXCIpKSB7XG4gICAgaGFuZGxlcjQgPSB3cmFwSGFuZGxlcihoYW5kbGVyNCwgKG5leHQsIGUpID0+IHtcbiAgICAgIG5leHQoZSk7XG4gICAgICBsaXN0ZW5lclRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyNCwgb3B0aW9ucyk7XG4gICAgfSk7XG4gIH1cbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImF3YXlcIikgfHwgbW9kaWZpZXJzLmluY2x1ZGVzKFwib3V0c2lkZVwiKSkge1xuICAgIGxpc3RlbmVyVGFyZ2V0ID0gZG9jdW1lbnQ7XG4gICAgaGFuZGxlcjQgPSB3cmFwSGFuZGxlcihoYW5kbGVyNCwgKG5leHQsIGUpID0+IHtcbiAgICAgIGlmIChlbC5jb250YWlucyhlLnRhcmdldCkpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChlLnRhcmdldC5pc0Nvbm5lY3RlZCA9PT0gZmFsc2UpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGlmIChlbC5vZmZzZXRXaWR0aCA8IDEgJiYgZWwub2Zmc2V0SGVpZ2h0IDwgMSlcbiAgICAgICAgcmV0dXJuO1xuICAgICAgaWYgKGVsLl94X2lzU2hvd24gPT09IGZhbHNlKVxuICAgICAgICByZXR1cm47XG4gICAgICBuZXh0KGUpO1xuICAgIH0pO1xuICB9XG4gIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJzZWxmXCIpKVxuICAgIGhhbmRsZXI0ID0gd3JhcEhhbmRsZXIoaGFuZGxlcjQsIChuZXh0LCBlKSA9PiB7XG4gICAgICBlLnRhcmdldCA9PT0gZWwgJiYgbmV4dChlKTtcbiAgICB9KTtcbiAgaWYgKGV2ZW50ID09PSBcInN1Ym1pdFwiKSB7XG4gICAgaGFuZGxlcjQgPSB3cmFwSGFuZGxlcihoYW5kbGVyNCwgKG5leHQsIGUpID0+IHtcbiAgICAgIGlmIChlLnRhcmdldC5feF9wZW5kaW5nTW9kZWxVcGRhdGVzKSB7XG4gICAgICAgIGUudGFyZ2V0Ll94X3BlbmRpbmdNb2RlbFVwZGF0ZXMuZm9yRWFjaCgoZm4pID0+IGZuKCkpO1xuICAgICAgfVxuICAgICAgbmV4dChlKTtcbiAgICB9KTtcbiAgfVxuICBpZiAoaXNLZXlFdmVudChldmVudCkgfHwgaXNDbGlja0V2ZW50KGV2ZW50KSkge1xuICAgIGhhbmRsZXI0ID0gd3JhcEhhbmRsZXIoaGFuZGxlcjQsIChuZXh0LCBlKSA9PiB7XG4gICAgICBpZiAoaXNMaXN0ZW5pbmdGb3JBU3BlY2lmaWNLZXlUaGF0SGFzbnRCZWVuUHJlc3NlZChlLCBtb2RpZmllcnMpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG5leHQoZSk7XG4gICAgfSk7XG4gIH1cbiAgbGlzdGVuZXJUYXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgaGFuZGxlcjQsIG9wdGlvbnMpO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGxpc3RlbmVyVGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXI0LCBvcHRpb25zKTtcbiAgfTtcbn1cbmZ1bmN0aW9uIGRvdFN5bnRheChzdWJqZWN0KSB7XG4gIHJldHVybiBzdWJqZWN0LnJlcGxhY2UoLy0vZywgXCIuXCIpO1xufVxuZnVuY3Rpb24gY2FtZWxDYXNlMihzdWJqZWN0KSB7XG4gIHJldHVybiBzdWJqZWN0LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvLShcXHcpL2csIChtYXRjaCwgY2hhcikgPT4gY2hhci50b1VwcGVyQ2FzZSgpKTtcbn1cbmZ1bmN0aW9uIGlzTnVtZXJpYyhzdWJqZWN0KSB7XG4gIHJldHVybiAhQXJyYXkuaXNBcnJheShzdWJqZWN0KSAmJiAhaXNOYU4oc3ViamVjdCk7XG59XG5mdW5jdGlvbiBrZWJhYkNhc2UyKHN1YmplY3QpIHtcbiAgaWYgKFtcIiBcIiwgXCJfXCJdLmluY2x1ZGVzKFxuICAgIHN1YmplY3RcbiAgKSlcbiAgICByZXR1cm4gc3ViamVjdDtcbiAgcmV0dXJuIHN1YmplY3QucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgXCIkMS0kMlwiKS5yZXBsYWNlKC9bX1xcc10vLCBcIi1cIikudG9Mb3dlckNhc2UoKTtcbn1cbmZ1bmN0aW9uIGlzS2V5RXZlbnQoZXZlbnQpIHtcbiAgcmV0dXJuIFtcImtleWRvd25cIiwgXCJrZXl1cFwiXS5pbmNsdWRlcyhldmVudCk7XG59XG5mdW5jdGlvbiBpc0NsaWNrRXZlbnQoZXZlbnQpIHtcbiAgcmV0dXJuIFtcImNvbnRleHRtZW51XCIsIFwiY2xpY2tcIiwgXCJtb3VzZVwiXS5zb21lKChpKSA9PiBldmVudC5pbmNsdWRlcyhpKSk7XG59XG5mdW5jdGlvbiBpc0xpc3RlbmluZ0ZvckFTcGVjaWZpY0tleVRoYXRIYXNudEJlZW5QcmVzc2VkKGUsIG1vZGlmaWVycykge1xuICBsZXQga2V5TW9kaWZpZXJzID0gbW9kaWZpZXJzLmZpbHRlcigoaSkgPT4ge1xuICAgIHJldHVybiAhW1wid2luZG93XCIsIFwiZG9jdW1lbnRcIiwgXCJwcmV2ZW50XCIsIFwic3RvcFwiLCBcIm9uY2VcIiwgXCJjYXB0dXJlXCIsIFwic2VsZlwiLCBcImF3YXlcIiwgXCJvdXRzaWRlXCIsIFwicGFzc2l2ZVwiLCBcInByZXNlcnZlLXNjcm9sbFwiLCBcImJsdXJcIiwgXCJjaGFuZ2VcIiwgXCJsYXp5XCJdLmluY2x1ZGVzKGkpO1xuICB9KTtcbiAgaWYgKGtleU1vZGlmaWVycy5pbmNsdWRlcyhcImRlYm91bmNlXCIpKSB7XG4gICAgbGV0IGRlYm91bmNlSW5kZXggPSBrZXlNb2RpZmllcnMuaW5kZXhPZihcImRlYm91bmNlXCIpO1xuICAgIGtleU1vZGlmaWVycy5zcGxpY2UoZGVib3VuY2VJbmRleCwgaXNOdW1lcmljKChrZXlNb2RpZmllcnNbZGVib3VuY2VJbmRleCArIDFdIHx8IFwiaW52YWxpZC13YWl0XCIpLnNwbGl0KFwibXNcIilbMF0pID8gMiA6IDEpO1xuICB9XG4gIGlmIChrZXlNb2RpZmllcnMuaW5jbHVkZXMoXCJ0aHJvdHRsZVwiKSkge1xuICAgIGxldCBkZWJvdW5jZUluZGV4ID0ga2V5TW9kaWZpZXJzLmluZGV4T2YoXCJ0aHJvdHRsZVwiKTtcbiAgICBrZXlNb2RpZmllcnMuc3BsaWNlKGRlYm91bmNlSW5kZXgsIGlzTnVtZXJpYygoa2V5TW9kaWZpZXJzW2RlYm91bmNlSW5kZXggKyAxXSB8fCBcImludmFsaWQtd2FpdFwiKS5zcGxpdChcIm1zXCIpWzBdKSA/IDIgOiAxKTtcbiAgfVxuICBpZiAoa2V5TW9kaWZpZXJzLmxlbmd0aCA9PT0gMClcbiAgICByZXR1cm4gZmFsc2U7XG4gIGlmIChrZXlNb2RpZmllcnMubGVuZ3RoID09PSAxICYmIGtleVRvTW9kaWZpZXJzKGUua2V5KS5pbmNsdWRlcyhrZXlNb2RpZmllcnNbMF0pKVxuICAgIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgc3lzdGVtS2V5TW9kaWZpZXJzID0gW1wiY3RybFwiLCBcInNoaWZ0XCIsIFwiYWx0XCIsIFwibWV0YVwiLCBcImNtZFwiLCBcInN1cGVyXCJdO1xuICBjb25zdCBzZWxlY3RlZFN5c3RlbUtleU1vZGlmaWVycyA9IHN5c3RlbUtleU1vZGlmaWVycy5maWx0ZXIoKG1vZGlmaWVyKSA9PiBrZXlNb2RpZmllcnMuaW5jbHVkZXMobW9kaWZpZXIpKTtcbiAga2V5TW9kaWZpZXJzID0ga2V5TW9kaWZpZXJzLmZpbHRlcigoaSkgPT4gIXNlbGVjdGVkU3lzdGVtS2V5TW9kaWZpZXJzLmluY2x1ZGVzKGkpKTtcbiAgaWYgKHNlbGVjdGVkU3lzdGVtS2V5TW9kaWZpZXJzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBhY3RpdmVseVByZXNzZWRLZXlNb2RpZmllcnMgPSBzZWxlY3RlZFN5c3RlbUtleU1vZGlmaWVycy5maWx0ZXIoKG1vZGlmaWVyKSA9PiB7XG4gICAgICBpZiAobW9kaWZpZXIgPT09IFwiY21kXCIgfHwgbW9kaWZpZXIgPT09IFwic3VwZXJcIilcbiAgICAgICAgbW9kaWZpZXIgPSBcIm1ldGFcIjtcbiAgICAgIHJldHVybiBlW2Ake21vZGlmaWVyfUtleWBdO1xuICAgIH0pO1xuICAgIGlmIChhY3RpdmVseVByZXNzZWRLZXlNb2RpZmllcnMubGVuZ3RoID09PSBzZWxlY3RlZFN5c3RlbUtleU1vZGlmaWVycy5sZW5ndGgpIHtcbiAgICAgIGlmIChpc0NsaWNrRXZlbnQoZS50eXBlKSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKGtleVRvTW9kaWZpZXJzKGUua2V5KS5pbmNsdWRlcyhrZXlNb2RpZmllcnNbMF0pKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24ga2V5VG9Nb2RpZmllcnMoa2V5KSB7XG4gIGlmICgha2V5KVxuICAgIHJldHVybiBbXTtcbiAga2V5ID0ga2ViYWJDYXNlMihrZXkpO1xuICBsZXQgbW9kaWZpZXJUb0tleU1hcCA9IHtcbiAgICBcImN0cmxcIjogXCJjb250cm9sXCIsXG4gICAgXCJzbGFzaFwiOiBcIi9cIixcbiAgICBcInNwYWNlXCI6IFwiIFwiLFxuICAgIFwic3BhY2ViYXJcIjogXCIgXCIsXG4gICAgXCJjbWRcIjogXCJtZXRhXCIsXG4gICAgXCJlc2NcIjogXCJlc2NhcGVcIixcbiAgICBcInVwXCI6IFwiYXJyb3ctdXBcIixcbiAgICBcImRvd25cIjogXCJhcnJvdy1kb3duXCIsXG4gICAgXCJsZWZ0XCI6IFwiYXJyb3ctbGVmdFwiLFxuICAgIFwicmlnaHRcIjogXCJhcnJvdy1yaWdodFwiLFxuICAgIFwicGVyaW9kXCI6IFwiLlwiLFxuICAgIFwiY29tbWFcIjogXCIsXCIsXG4gICAgXCJlcXVhbFwiOiBcIj1cIixcbiAgICBcIm1pbnVzXCI6IFwiLVwiLFxuICAgIFwidW5kZXJzY29yZVwiOiBcIl9cIlxuICB9O1xuICBtb2RpZmllclRvS2V5TWFwW2tleV0gPSBrZXk7XG4gIHJldHVybiBPYmplY3Qua2V5cyhtb2RpZmllclRvS2V5TWFwKS5tYXAoKG1vZGlmaWVyKSA9PiB7XG4gICAgaWYgKG1vZGlmaWVyVG9LZXlNYXBbbW9kaWZpZXJdID09PSBrZXkpXG4gICAgICByZXR1cm4gbW9kaWZpZXI7XG4gIH0pLmZpbHRlcigobW9kaWZpZXIpID0+IG1vZGlmaWVyKTtcbn1cblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC1tb2RlbC5qc1xuZGlyZWN0aXZlKFwibW9kZWxcIiwgKGVsLCB7IG1vZGlmaWVycywgZXhwcmVzc2lvbiB9LCB7IGVmZmVjdDogZWZmZWN0MywgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBsZXQgc2NvcGVUYXJnZXQgPSBlbDtcbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcInBhcmVudFwiKSkge1xuICAgIHNjb3BlVGFyZ2V0ID0gZWwucGFyZW50Tm9kZTtcbiAgfVxuICBsZXQgZXZhbHVhdGVHZXQgPSBldmFsdWF0ZUxhdGVyKHNjb3BlVGFyZ2V0LCBleHByZXNzaW9uKTtcbiAgbGV0IGV2YWx1YXRlU2V0O1xuICBpZiAodHlwZW9mIGV4cHJlc3Npb24gPT09IFwic3RyaW5nXCIpIHtcbiAgICBldmFsdWF0ZVNldCA9IGV2YWx1YXRlTGF0ZXIoc2NvcGVUYXJnZXQsIGAke2V4cHJlc3Npb259ID0gX19wbGFjZWhvbGRlcmApO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHByZXNzaW9uID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGV4cHJlc3Npb24oKSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGV2YWx1YXRlU2V0ID0gZXZhbHVhdGVMYXRlcihzY29wZVRhcmdldCwgYCR7ZXhwcmVzc2lvbigpfSA9IF9fcGxhY2Vob2xkZXJgKTtcbiAgfSBlbHNlIHtcbiAgICBldmFsdWF0ZVNldCA9ICgpID0+IHtcbiAgICB9O1xuICB9XG4gIGxldCBnZXRWYWx1ZSA9ICgpID0+IHtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGV2YWx1YXRlR2V0KCh2YWx1ZSkgPT4gcmVzdWx0ID0gdmFsdWUpO1xuICAgIHJldHVybiBpc0dldHRlclNldHRlcihyZXN1bHQpID8gcmVzdWx0LmdldCgpIDogcmVzdWx0O1xuICB9O1xuICBsZXQgc2V0VmFsdWUgPSAodmFsdWUpID0+IHtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGV2YWx1YXRlR2V0KCh2YWx1ZTIpID0+IHJlc3VsdCA9IHZhbHVlMik7XG4gICAgaWYgKGlzR2V0dGVyU2V0dGVyKHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdC5zZXQodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmFsdWF0ZVNldCgoKSA9PiB7XG4gICAgICB9LCB7XG4gICAgICAgIHNjb3BlOiB7IFwiX19wbGFjZWhvbGRlclwiOiB2YWx1ZSB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJzdHJpbmdcIiAmJiBlbC50eXBlID09PSBcInJhZGlvXCIpIHtcbiAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgaWYgKCFlbC5oYXNBdHRyaWJ1dGUoXCJuYW1lXCIpKVxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsIGV4cHJlc3Npb24pO1xuICAgIH0pO1xuICB9XG4gIGxldCBoYXNDaGFuZ2VNb2RpZmllciA9IG1vZGlmaWVycy5pbmNsdWRlcyhcImNoYW5nZVwiKSB8fCBtb2RpZmllcnMuaW5jbHVkZXMoXCJsYXp5XCIpO1xuICBsZXQgaGFzQmx1ck1vZGlmaWVyID0gbW9kaWZpZXJzLmluY2x1ZGVzKFwiYmx1clwiKTtcbiAgbGV0IGhhc0VudGVyTW9kaWZpZXIgPSBtb2RpZmllcnMuaW5jbHVkZXMoXCJlbnRlclwiKTtcbiAgbGV0IGhhc0V4cGxpY2l0RXZlbnRNb2RpZmllcnMgPSBoYXNDaGFuZ2VNb2RpZmllciB8fCBoYXNCbHVyTW9kaWZpZXIgfHwgaGFzRW50ZXJNb2RpZmllcjtcbiAgbGV0IHJlbW92ZUxpc3RlbmVyO1xuICBpZiAoaXNDbG9uaW5nKSB7XG4gICAgcmVtb3ZlTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgfTtcbiAgfSBlbHNlIGlmIChoYXNFeHBsaWNpdEV2ZW50TW9kaWZpZXJzKSB7XG4gICAgbGV0IGxpc3RlbmVycyA9IFtdO1xuICAgIGxldCBzeW5jVmFsdWUgPSAoZSkgPT4gc2V0VmFsdWUoZ2V0SW5wdXRWYWx1ZShlbCwgbW9kaWZpZXJzLCBlLCBnZXRWYWx1ZSgpKSk7XG4gICAgaWYgKGhhc0NoYW5nZU1vZGlmaWVyKSB7XG4gICAgICBsaXN0ZW5lcnMucHVzaChvbihlbCwgXCJjaGFuZ2VcIiwgbW9kaWZpZXJzLCBzeW5jVmFsdWUpKTtcbiAgICB9XG4gICAgaWYgKGhhc0JsdXJNb2RpZmllcikge1xuICAgICAgbGlzdGVuZXJzLnB1c2gob24oZWwsIFwiYmx1clwiLCBtb2RpZmllcnMsIHN5bmNWYWx1ZSkpO1xuICAgICAgaWYgKGVsLmZvcm0pIHtcbiAgICAgICAgbGV0IHN5bmNDYWxsYmFjayA9ICgpID0+IHN5bmNWYWx1ZSh7IHRhcmdldDogZWwgfSk7XG4gICAgICAgIGlmICghZWwuZm9ybS5feF9wZW5kaW5nTW9kZWxVcGRhdGVzKVxuICAgICAgICAgIGVsLmZvcm0uX3hfcGVuZGluZ01vZGVsVXBkYXRlcyA9IFtdO1xuICAgICAgICBlbC5mb3JtLl94X3BlbmRpbmdNb2RlbFVwZGF0ZXMucHVzaChzeW5jQ2FsbGJhY2spO1xuICAgICAgICBjbGVhbnVwMigoKSA9PiBlbC5mb3JtLl94X3BlbmRpbmdNb2RlbFVwZGF0ZXMuc3BsaWNlKGVsLmZvcm0uX3hfcGVuZGluZ01vZGVsVXBkYXRlcy5pbmRleE9mKHN5bmNDYWxsYmFjayksIDEpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGhhc0VudGVyTW9kaWZpZXIpIHtcbiAgICAgIGxpc3RlbmVycy5wdXNoKG9uKGVsLCBcImtleWRvd25cIiwgbW9kaWZpZXJzLCAoZSkgPT4ge1xuICAgICAgICBpZiAoZS5rZXkgPT09IFwiRW50ZXJcIilcbiAgICAgICAgICBzeW5jVmFsdWUoZSk7XG4gICAgICB9KSk7XG4gICAgfVxuICAgIHJlbW92ZUxpc3RlbmVyID0gKCkgPT4gbGlzdGVuZXJzLmZvckVhY2goKHJlbW92ZSkgPT4gcmVtb3ZlKCkpO1xuICB9IGVsc2Uge1xuICAgIGxldCBldmVudCA9IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gXCJzZWxlY3RcIiB8fCBbXCJjaGVja2JveFwiLCBcInJhZGlvXCJdLmluY2x1ZGVzKGVsLnR5cGUpID8gXCJjaGFuZ2VcIiA6IFwiaW5wdXRcIjtcbiAgICByZW1vdmVMaXN0ZW5lciA9IG9uKGVsLCBldmVudCwgbW9kaWZpZXJzLCAoZSkgPT4ge1xuICAgICAgc2V0VmFsdWUoZ2V0SW5wdXRWYWx1ZShlbCwgbW9kaWZpZXJzLCBlLCBnZXRWYWx1ZSgpKSk7XG4gICAgfSk7XG4gIH1cbiAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcImZpbGxcIikpIHtcbiAgICBpZiAoW3ZvaWQgMCwgbnVsbCwgXCJcIl0uaW5jbHVkZXMoZ2V0VmFsdWUoKSkgfHwgaXNDaGVja2JveChlbCkgJiYgQXJyYXkuaXNBcnJheShnZXRWYWx1ZSgpKSB8fCBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwic2VsZWN0XCIgJiYgZWwubXVsdGlwbGUpIHtcbiAgICAgIHNldFZhbHVlKFxuICAgICAgICBnZXRJbnB1dFZhbHVlKGVsLCBtb2RpZmllcnMsIHsgdGFyZ2V0OiBlbCB9LCBnZXRWYWx1ZSgpKVxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFlbC5feF9yZW1vdmVNb2RlbExpc3RlbmVycylcbiAgICBlbC5feF9yZW1vdmVNb2RlbExpc3RlbmVycyA9IHt9O1xuICBlbC5feF9yZW1vdmVNb2RlbExpc3RlbmVyc1tcImRlZmF1bHRcIl0gPSByZW1vdmVMaXN0ZW5lcjtcbiAgY2xlYW51cDIoKCkgPT4gZWwuX3hfcmVtb3ZlTW9kZWxMaXN0ZW5lcnNbXCJkZWZhdWx0XCJdKCkpO1xuICBpZiAoZWwuZm9ybSkge1xuICAgIGxldCByZW1vdmVSZXNldExpc3RlbmVyID0gb24oZWwuZm9ybSwgXCJyZXNldFwiLCBbXSwgKGUpID0+IHtcbiAgICAgIG5leHRUaWNrKCgpID0+IGVsLl94X21vZGVsICYmIGVsLl94X21vZGVsLnNldChnZXRJbnB1dFZhbHVlKGVsLCBtb2RpZmllcnMsIHsgdGFyZ2V0OiBlbCB9LCBnZXRWYWx1ZSgpKSkpO1xuICAgIH0pO1xuICAgIGNsZWFudXAyKCgpID0+IHJlbW92ZVJlc2V0TGlzdGVuZXIoKSk7XG4gIH1cbiAgZWwuX3hfbW9kZWwgPSB7XG4gICAgZ2V0KCkge1xuICAgICAgcmV0dXJuIGdldFZhbHVlKCk7XG4gICAgfSxcbiAgICBzZXQodmFsdWUpIHtcbiAgICAgIHNldFZhbHVlKHZhbHVlKTtcbiAgICB9XG4gIH07XG4gIGVsLl94X2ZvcmNlTW9kZWxVcGRhdGUgPSAodmFsdWUpID0+IHtcbiAgICBpZiAodmFsdWUgPT09IHZvaWQgMCAmJiB0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJzdHJpbmdcIiAmJiBleHByZXNzaW9uLm1hdGNoKC9cXC4vKSlcbiAgICAgIHZhbHVlID0gXCJcIjtcbiAgICB3aW5kb3cuZnJvbU1vZGVsID0gdHJ1ZTtcbiAgICBtdXRhdGVEb20oKCkgPT4gYmluZChlbCwgXCJ2YWx1ZVwiLCB2YWx1ZSkpO1xuICAgIGRlbGV0ZSB3aW5kb3cuZnJvbU1vZGVsO1xuICB9O1xuICBlZmZlY3QzKCgpID0+IHtcbiAgICBsZXQgdmFsdWUgPSBnZXRWYWx1ZSgpO1xuICAgIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJ1bmludHJ1c2l2ZVwiKSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmlzU2FtZU5vZGUoZWwpKVxuICAgICAgcmV0dXJuO1xuICAgIGVsLl94X2ZvcmNlTW9kZWxVcGRhdGUodmFsdWUpO1xuICB9KTtcbn0pO1xuZnVuY3Rpb24gZ2V0SW5wdXRWYWx1ZShlbCwgbW9kaWZpZXJzLCBldmVudCwgY3VycmVudFZhbHVlKSB7XG4gIHJldHVybiBtdXRhdGVEb20oKCkgPT4ge1xuICAgIGlmIChldmVudCBpbnN0YW5jZW9mIEN1c3RvbUV2ZW50ICYmIGV2ZW50LmRldGFpbCAhPT0gdm9pZCAwKVxuICAgICAgcmV0dXJuIGV2ZW50LmRldGFpbCAhPT0gbnVsbCAmJiBldmVudC5kZXRhaWwgIT09IHZvaWQgMCA/IGV2ZW50LmRldGFpbCA6IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICBlbHNlIGlmIChpc0NoZWNrYm94KGVsKSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY3VycmVudFZhbHVlKSkge1xuICAgICAgICBsZXQgbmV3VmFsdWUgPSBudWxsO1xuICAgICAgICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwibnVtYmVyXCIpKSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBzYWZlUGFyc2VOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChtb2RpZmllcnMuaW5jbHVkZXMoXCJib29sZWFuXCIpKSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBzYWZlUGFyc2VCb29sZWFuKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50LnRhcmdldC5jaGVja2VkID8gY3VycmVudFZhbHVlLmluY2x1ZGVzKG5ld1ZhbHVlKSA/IGN1cnJlbnRWYWx1ZSA6IGN1cnJlbnRWYWx1ZS5jb25jYXQoW25ld1ZhbHVlXSkgOiBjdXJyZW50VmFsdWUuZmlsdGVyKChlbDIpID0+ICFjaGVja2VkQXR0ckxvb3NlQ29tcGFyZTIoZWwyLCBuZXdWYWx1ZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50LnRhcmdldC5jaGVja2VkO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSBcInNlbGVjdFwiICYmIGVsLm11bHRpcGxlKSB7XG4gICAgICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwibnVtYmVyXCIpKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGV2ZW50LnRhcmdldC5zZWxlY3RlZE9wdGlvbnMpLm1hcCgob3B0aW9uKSA9PiB7XG4gICAgICAgICAgbGV0IHJhd1ZhbHVlID0gb3B0aW9uLnZhbHVlIHx8IG9wdGlvbi50ZXh0O1xuICAgICAgICAgIHJldHVybiBzYWZlUGFyc2VOdW1iZXIocmF3VmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiYm9vbGVhblwiKSkge1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShldmVudC50YXJnZXQuc2VsZWN0ZWRPcHRpb25zKS5tYXAoKG9wdGlvbikgPT4ge1xuICAgICAgICAgIGxldCByYXdWYWx1ZSA9IG9wdGlvbi52YWx1ZSB8fCBvcHRpb24udGV4dDtcbiAgICAgICAgICByZXR1cm4gc2FmZVBhcnNlQm9vbGVhbihyYXdWYWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIEFycmF5LmZyb20oZXZlbnQudGFyZ2V0LnNlbGVjdGVkT3B0aW9ucykubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbi52YWx1ZSB8fCBvcHRpb24udGV4dDtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgbmV3VmFsdWU7XG4gICAgICBpZiAoaXNSYWRpbyhlbCkpIHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jaGVja2VkKSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3VmFsdWUgPSBjdXJyZW50VmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1ZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcIm51bWJlclwiKSkge1xuICAgICAgICByZXR1cm4gc2FmZVBhcnNlTnVtYmVyKG5ld1ZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiYm9vbGVhblwiKSkge1xuICAgICAgICByZXR1cm4gc2FmZVBhcnNlQm9vbGVhbihuZXdWYWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKG1vZGlmaWVycy5pbmNsdWRlcyhcInRyaW1cIikpIHtcbiAgICAgICAgcmV0dXJuIG5ld1ZhbHVlLnRyaW0oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufVxuZnVuY3Rpb24gc2FmZVBhcnNlTnVtYmVyKHJhd1ZhbHVlKSB7XG4gIGxldCBudW1iZXIgPSByYXdWYWx1ZSA/IHBhcnNlRmxvYXQocmF3VmFsdWUpIDogbnVsbDtcbiAgcmV0dXJuIGlzTnVtZXJpYzIobnVtYmVyKSA/IG51bWJlciA6IHJhd1ZhbHVlO1xufVxuZnVuY3Rpb24gY2hlY2tlZEF0dHJMb29zZUNvbXBhcmUyKHZhbHVlQSwgdmFsdWVCKSB7XG4gIHJldHVybiB2YWx1ZUEgPT0gdmFsdWVCO1xufVxuZnVuY3Rpb24gaXNOdW1lcmljMihzdWJqZWN0KSB7XG4gIHJldHVybiAhQXJyYXkuaXNBcnJheShzdWJqZWN0KSAmJiAhaXNOYU4oc3ViamVjdCk7XG59XG5mdW5jdGlvbiBpc0dldHRlclNldHRlcih2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZS5nZXQgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgdmFsdWUuc2V0ID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtY2xvYWsuanNcbmRpcmVjdGl2ZShcImNsb2FrXCIsIChlbCkgPT4gcXVldWVNaWNyb3Rhc2soKCkgPT4gbXV0YXRlRG9tKCgpID0+IGVsLnJlbW92ZUF0dHJpYnV0ZShwcmVmaXgoXCJjbG9ha1wiKSkpKSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtaW5pdC5qc1xuYWRkSW5pdFNlbGVjdG9yKCgpID0+IGBbJHtwcmVmaXgoXCJpbml0XCIpfV1gKTtcbmRpcmVjdGl2ZShcImluaXRcIiwgc2tpcER1cmluZ0Nsb25lKChlbCwgeyBleHByZXNzaW9uIH0sIHsgZXZhbHVhdGU6IGV2YWx1YXRlMiB9KSA9PiB7XG4gIGlmICh0eXBlb2YgZXhwcmVzc2lvbiA9PT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiAhIWV4cHJlc3Npb24udHJpbSgpICYmIGV2YWx1YXRlMihleHByZXNzaW9uLCB7fSwgZmFsc2UpO1xuICB9XG4gIHJldHVybiBldmFsdWF0ZTIoZXhwcmVzc2lvbiwge30sIGZhbHNlKTtcbn0pKTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC10ZXh0LmpzXG5kaXJlY3RpdmUoXCJ0ZXh0XCIsIChlbCwgeyBleHByZXNzaW9uIH0sIHsgZWZmZWN0OiBlZmZlY3QzLCBldmFsdWF0ZUxhdGVyOiBldmFsdWF0ZUxhdGVyMiB9KSA9PiB7XG4gIGxldCBldmFsdWF0ZTIgPSBldmFsdWF0ZUxhdGVyMihleHByZXNzaW9uKTtcbiAgZWZmZWN0MygoKSA9PiB7XG4gICAgZXZhbHVhdGUyKCh2YWx1ZSkgPT4ge1xuICAgICAgbXV0YXRlRG9tKCgpID0+IHtcbiAgICAgICAgZWwudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LWh0bWwuanNcbmRpcmVjdGl2ZShcImh0bWxcIiwgKGVsLCB7IGV4cHJlc3Npb24gfSwgeyBlZmZlY3Q6IGVmZmVjdDMsIGV2YWx1YXRlTGF0ZXI6IGV2YWx1YXRlTGF0ZXIyIH0pID0+IHtcbiAgbGV0IGV2YWx1YXRlMiA9IGV2YWx1YXRlTGF0ZXIyKGV4cHJlc3Npb24pO1xuICBlZmZlY3QzKCgpID0+IHtcbiAgICBldmFsdWF0ZTIoKHZhbHVlKSA9PiB7XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBlbC5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgICAgICAgZWwuX3hfaWdub3JlU2VsZiA9IHRydWU7XG4gICAgICAgIGluaXRUcmVlKGVsKTtcbiAgICAgICAgZGVsZXRlIGVsLl94X2lnbm9yZVNlbGY7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuLy8gcGFja2FnZXMvYWxwaW5lanMvc3JjL2RpcmVjdGl2ZXMveC1iaW5kLmpzXG5tYXBBdHRyaWJ1dGVzKHN0YXJ0aW5nV2l0aChcIjpcIiwgaW50byhwcmVmaXgoXCJiaW5kOlwiKSkpKTtcbnZhciBoYW5kbGVyMiA9IChlbCwgeyB2YWx1ZSwgbW9kaWZpZXJzLCBleHByZXNzaW9uLCBvcmlnaW5hbCB9LCB7IGVmZmVjdDogZWZmZWN0MywgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBpZiAoIXZhbHVlKSB7XG4gICAgbGV0IGJpbmRpbmdQcm92aWRlcnMgPSB7fTtcbiAgICBpbmplY3RCaW5kaW5nUHJvdmlkZXJzKGJpbmRpbmdQcm92aWRlcnMpO1xuICAgIGxldCBnZXRCaW5kaW5ncyA9IGV2YWx1YXRlTGF0ZXIoZWwsIGV4cHJlc3Npb24pO1xuICAgIGdldEJpbmRpbmdzKChiaW5kaW5ncykgPT4ge1xuICAgICAgYXBwbHlCaW5kaW5nc09iamVjdChlbCwgYmluZGluZ3MsIG9yaWdpbmFsKTtcbiAgICB9LCB7IHNjb3BlOiBiaW5kaW5nUHJvdmlkZXJzIH0pO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodmFsdWUgPT09IFwia2V5XCIpXG4gICAgcmV0dXJuIHN0b3JlS2V5Rm9yWEZvcihlbCwgZXhwcmVzc2lvbik7XG4gIGlmIChlbC5feF9pbmxpbmVCaW5kaW5ncyAmJiBlbC5feF9pbmxpbmVCaW5kaW5nc1t2YWx1ZV0gJiYgZWwuX3hfaW5saW5lQmluZGluZ3NbdmFsdWVdLmV4dHJhY3QpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGV2YWx1YXRlMiA9IGV2YWx1YXRlTGF0ZXIoZWwsIGV4cHJlc3Npb24pO1xuICBlZmZlY3QzKCgpID0+IGV2YWx1YXRlMigocmVzdWx0KSA9PiB7XG4gICAgaWYgKHJlc3VsdCA9PT0gdm9pZCAwICYmIHR5cGVvZiBleHByZXNzaW9uID09PSBcInN0cmluZ1wiICYmIGV4cHJlc3Npb24ubWF0Y2goL1xcLi8pKSB7XG4gICAgICByZXN1bHQgPSBcIlwiO1xuICAgIH1cbiAgICBtdXRhdGVEb20oKCkgPT4gYmluZChlbCwgdmFsdWUsIHJlc3VsdCwgbW9kaWZpZXJzKSk7XG4gIH0pKTtcbiAgY2xlYW51cDIoKCkgPT4ge1xuICAgIGVsLl94X3VuZG9BZGRlZENsYXNzZXMgJiYgZWwuX3hfdW5kb0FkZGVkQ2xhc3NlcygpO1xuICAgIGVsLl94X3VuZG9BZGRlZFN0eWxlcyAmJiBlbC5feF91bmRvQWRkZWRTdHlsZXMoKTtcbiAgfSk7XG59O1xuaGFuZGxlcjIuaW5saW5lID0gKGVsLCB7IHZhbHVlLCBtb2RpZmllcnMsIGV4cHJlc3Npb24gfSkgPT4ge1xuICBpZiAoIXZhbHVlKVxuICAgIHJldHVybjtcbiAgaWYgKCFlbC5feF9pbmxpbmVCaW5kaW5ncylcbiAgICBlbC5feF9pbmxpbmVCaW5kaW5ncyA9IHt9O1xuICBlbC5feF9pbmxpbmVCaW5kaW5nc1t2YWx1ZV0gPSB7IGV4cHJlc3Npb24sIGV4dHJhY3Q6IGZhbHNlIH07XG59O1xuZGlyZWN0aXZlKFwiYmluZFwiLCBoYW5kbGVyMik7XG5mdW5jdGlvbiBzdG9yZUtleUZvclhGb3IoZWwsIGV4cHJlc3Npb24pIHtcbiAgZWwuX3hfa2V5RXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtZGF0YS5qc1xuYWRkUm9vdFNlbGVjdG9yKCgpID0+IGBbJHtwcmVmaXgoXCJkYXRhXCIpfV1gKTtcbmRpcmVjdGl2ZShcImRhdGFcIiwgKGVsLCB7IGV4cHJlc3Npb24gfSwgeyBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiB7XG4gIGlmIChzaG91bGRTa2lwUmVnaXN0ZXJpbmdEYXRhRHVyaW5nQ2xvbmUoZWwpKVxuICAgIHJldHVybjtcbiAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24gPT09IFwiXCIgPyBcInt9XCIgOiBleHByZXNzaW9uO1xuICBsZXQgbWFnaWNDb250ZXh0ID0ge307XG4gIGluamVjdE1hZ2ljcyhtYWdpY0NvbnRleHQsIGVsKTtcbiAgbGV0IGRhdGFQcm92aWRlckNvbnRleHQgPSB7fTtcbiAgaW5qZWN0RGF0YVByb3ZpZGVycyhkYXRhUHJvdmlkZXJDb250ZXh0LCBtYWdpY0NvbnRleHQpO1xuICBsZXQgZGF0YTIgPSBldmFsdWF0ZShlbCwgZXhwcmVzc2lvbiwgeyBzY29wZTogZGF0YVByb3ZpZGVyQ29udGV4dCB9KTtcbiAgaWYgKGRhdGEyID09PSB2b2lkIDAgfHwgZGF0YTIgPT09IHRydWUpXG4gICAgZGF0YTIgPSB7fTtcbiAgaW5qZWN0TWFnaWNzKGRhdGEyLCBlbCk7XG4gIGxldCByZWFjdGl2ZURhdGEgPSByZWFjdGl2ZShkYXRhMik7XG4gIGluaXRJbnRlcmNlcHRvcnMocmVhY3RpdmVEYXRhKTtcbiAgbGV0IHVuZG8gPSBhZGRTY29wZVRvTm9kZShlbCwgcmVhY3RpdmVEYXRhKTtcbiAgcmVhY3RpdmVEYXRhW1wiaW5pdFwiXSAmJiBldmFsdWF0ZShlbCwgcmVhY3RpdmVEYXRhW1wiaW5pdFwiXSk7XG4gIGNsZWFudXAyKCgpID0+IHtcbiAgICByZWFjdGl2ZURhdGFbXCJkZXN0cm95XCJdICYmIGV2YWx1YXRlKGVsLCByZWFjdGl2ZURhdGFbXCJkZXN0cm95XCJdKTtcbiAgICB1bmRvKCk7XG4gIH0pO1xufSk7XG5pbnRlcmNlcHRDbG9uZSgoZnJvbSwgdG8pID0+IHtcbiAgaWYgKGZyb20uX3hfZGF0YVN0YWNrKSB7XG4gICAgdG8uX3hfZGF0YVN0YWNrID0gZnJvbS5feF9kYXRhU3RhY2s7XG4gICAgdG8uc2V0QXR0cmlidXRlKFwiZGF0YS1oYXMtYWxwaW5lLXN0YXRlXCIsIHRydWUpO1xuICB9XG59KTtcbmZ1bmN0aW9uIHNob3VsZFNraXBSZWdpc3RlcmluZ0RhdGFEdXJpbmdDbG9uZShlbCkge1xuICBpZiAoIWlzQ2xvbmluZylcbiAgICByZXR1cm4gZmFsc2U7XG4gIGlmIChpc0Nsb25pbmdMZWdhY3kpXG4gICAgcmV0dXJuIHRydWU7XG4gIHJldHVybiBlbC5oYXNBdHRyaWJ1dGUoXCJkYXRhLWhhcy1hbHBpbmUtc3RhdGVcIik7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtc2hvdy5qc1xuZGlyZWN0aXZlKFwic2hvd1wiLCAoZWwsIHsgbW9kaWZpZXJzLCBleHByZXNzaW9uIH0sIHsgZWZmZWN0OiBlZmZlY3QzIH0pID0+IHtcbiAgbGV0IGV2YWx1YXRlMiA9IGV2YWx1YXRlTGF0ZXIoZWwsIGV4cHJlc3Npb24pO1xuICBpZiAoIWVsLl94X2RvSGlkZSlcbiAgICBlbC5feF9kb0hpZGUgPSAoKSA9PiB7XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBlbC5zdHlsZS5zZXRQcm9wZXJ0eShcImRpc3BsYXlcIiwgXCJub25lXCIsIG1vZGlmaWVycy5pbmNsdWRlcyhcImltcG9ydGFudFwiKSA/IFwiaW1wb3J0YW50XCIgOiB2b2lkIDApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgaWYgKCFlbC5feF9kb1Nob3cpXG4gICAgZWwuX3hfZG9TaG93ID0gKCkgPT4ge1xuICAgICAgbXV0YXRlRG9tKCgpID0+IHtcbiAgICAgICAgaWYgKGVsLnN0eWxlLmxlbmd0aCA9PT0gMSAmJiBlbC5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIikge1xuICAgICAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZShcInN0eWxlXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsLnN0eWxlLnJlbW92ZVByb3BlcnR5KFwiZGlzcGxheVwiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgbGV0IGhpZGUgPSAoKSA9PiB7XG4gICAgZWwuX3hfZG9IaWRlKCk7XG4gICAgZWwuX3hfaXNTaG93biA9IGZhbHNlO1xuICB9O1xuICBsZXQgc2hvdyA9ICgpID0+IHtcbiAgICBlbC5feF9kb1Nob3coKTtcbiAgICBlbC5feF9pc1Nob3duID0gdHJ1ZTtcbiAgfTtcbiAgbGV0IGNsaWNrQXdheUNvbXBhdGlibGVTaG93ID0gKCkgPT4gc2V0VGltZW91dChzaG93KTtcbiAgbGV0IHRvZ2dsZSA9IG9uY2UoXG4gICAgKHZhbHVlKSA9PiB2YWx1ZSA/IHNob3coKSA6IGhpZGUoKSxcbiAgICAodmFsdWUpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgZWwuX3hfdG9nZ2xlQW5kQ2FzY2FkZVdpdGhUcmFuc2l0aW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGVsLl94X3RvZ2dsZUFuZENhc2NhZGVXaXRoVHJhbnNpdGlvbnMoZWwsIHZhbHVlLCBzaG93LCBoaWRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID8gY2xpY2tBd2F5Q29tcGF0aWJsZVNob3coKSA6IGhpZGUoKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG4gIGxldCBvbGRWYWx1ZTtcbiAgbGV0IGZpcnN0VGltZSA9IHRydWU7XG4gIGVmZmVjdDMoKCkgPT4gZXZhbHVhdGUyKCh2YWx1ZSkgPT4ge1xuICAgIGlmICghZmlyc3RUaW1lICYmIHZhbHVlID09PSBvbGRWYWx1ZSlcbiAgICAgIHJldHVybjtcbiAgICBpZiAobW9kaWZpZXJzLmluY2x1ZGVzKFwiaW1tZWRpYXRlXCIpKVxuICAgICAgdmFsdWUgPyBjbGlja0F3YXlDb21wYXRpYmxlU2hvdygpIDogaGlkZSgpO1xuICAgIHRvZ2dsZSh2YWx1ZSk7XG4gICAgb2xkVmFsdWUgPSB2YWx1ZTtcbiAgICBmaXJzdFRpbWUgPSBmYWxzZTtcbiAgfSkpO1xufSk7XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtZm9yLmpzXG5kaXJlY3RpdmUoXCJmb3JcIiwgKGVsLCB7IGV4cHJlc3Npb24gfSwgeyBlZmZlY3Q6IGVmZmVjdDMsIGNsZWFudXA6IGNsZWFudXAyIH0pID0+IHtcbiAgbGV0IGl0ZXJhdG9yTmFtZXMgPSBwYXJzZUZvckV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gIGxldCBldmFsdWF0ZUl0ZW1zID0gZXZhbHVhdGVMYXRlcihlbCwgaXRlcmF0b3JOYW1lcy5pdGVtcyk7XG4gIGxldCBldmFsdWF0ZUtleSA9IGV2YWx1YXRlTGF0ZXIoXG4gICAgZWwsXG4gICAgLy8gdGhlIHgtYmluZDprZXkgZXhwcmVzc2lvbiBpcyBzdG9yZWQgZm9yIG91ciB1c2UgaW5zdGVhZCBvZiBldmFsdWF0ZWQuXG4gICAgZWwuX3hfa2V5RXhwcmVzc2lvbiB8fCBcImluZGV4XCJcbiAgKTtcbiAgZWwuX3hfcHJldktleXMgPSBbXTtcbiAgZWwuX3hfbG9va3VwID0ge307XG4gIGVmZmVjdDMoKCkgPT4gbG9vcChlbCwgaXRlcmF0b3JOYW1lcywgZXZhbHVhdGVJdGVtcywgZXZhbHVhdGVLZXkpKTtcbiAgY2xlYW51cDIoKCkgPT4ge1xuICAgIE9iamVjdC52YWx1ZXMoZWwuX3hfbG9va3VwKS5mb3JFYWNoKChlbDIpID0+IG11dGF0ZURvbShcbiAgICAgICgpID0+IHtcbiAgICAgICAgZGVzdHJveVRyZWUoZWwyKTtcbiAgICAgICAgZWwyLnJlbW92ZSgpO1xuICAgICAgfVxuICAgICkpO1xuICAgIGRlbGV0ZSBlbC5feF9wcmV2S2V5cztcbiAgICBkZWxldGUgZWwuX3hfbG9va3VwO1xuICB9KTtcbn0pO1xuZnVuY3Rpb24gbG9vcChlbCwgaXRlcmF0b3JOYW1lcywgZXZhbHVhdGVJdGVtcywgZXZhbHVhdGVLZXkpIHtcbiAgbGV0IGlzT2JqZWN0MiA9IChpKSA9PiB0eXBlb2YgaSA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShpKTtcbiAgbGV0IHRlbXBsYXRlRWwgPSBlbDtcbiAgZXZhbHVhdGVJdGVtcygoaXRlbXMpID0+IHtcbiAgICBpZiAoaXNOdW1lcmljMyhpdGVtcykgJiYgaXRlbXMgPj0gMCkge1xuICAgICAgaXRlbXMgPSBBcnJheS5mcm9tKEFycmF5KGl0ZW1zKS5rZXlzKCksIChpKSA9PiBpICsgMSk7XG4gICAgfVxuICAgIGlmIChpdGVtcyA9PT0gdm9pZCAwKVxuICAgICAgaXRlbXMgPSBbXTtcbiAgICBsZXQgbG9va3VwID0gZWwuX3hfbG9va3VwO1xuICAgIGxldCBwcmV2S2V5cyA9IGVsLl94X3ByZXZLZXlzO1xuICAgIGxldCBzY29wZXMgPSBbXTtcbiAgICBsZXQga2V5cyA9IFtdO1xuICAgIGlmIChpc09iamVjdDIoaXRlbXMpKSB7XG4gICAgICBpdGVtcyA9IE9iamVjdC5lbnRyaWVzKGl0ZW1zKS5tYXAoKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICBsZXQgc2NvcGUyID0gZ2V0SXRlcmF0aW9uU2NvcGVWYXJpYWJsZXMoaXRlcmF0b3JOYW1lcywgdmFsdWUsIGtleSwgaXRlbXMpO1xuICAgICAgICBldmFsdWF0ZUtleSgodmFsdWUyKSA9PiB7XG4gICAgICAgICAgaWYgKGtleXMuaW5jbHVkZXModmFsdWUyKSlcbiAgICAgICAgICAgIHdhcm4oXCJEdXBsaWNhdGUga2V5IG9uIHgtZm9yXCIsIGVsKTtcbiAgICAgICAgICBrZXlzLnB1c2godmFsdWUyKTtcbiAgICAgICAgfSwgeyBzY29wZTogeyBpbmRleDoga2V5LCAuLi5zY29wZTIgfSB9KTtcbiAgICAgICAgc2NvcGVzLnB1c2goc2NvcGUyKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBzY29wZTIgPSBnZXRJdGVyYXRpb25TY29wZVZhcmlhYmxlcyhpdGVyYXRvck5hbWVzLCBpdGVtc1tpXSwgaSwgaXRlbXMpO1xuICAgICAgICBldmFsdWF0ZUtleSgodmFsdWUpID0+IHtcbiAgICAgICAgICBpZiAoa2V5cy5pbmNsdWRlcyh2YWx1ZSkpXG4gICAgICAgICAgICB3YXJuKFwiRHVwbGljYXRlIGtleSBvbiB4LWZvclwiLCBlbCk7XG4gICAgICAgICAga2V5cy5wdXNoKHZhbHVlKTtcbiAgICAgICAgfSwgeyBzY29wZTogeyBpbmRleDogaSwgLi4uc2NvcGUyIH0gfSk7XG4gICAgICAgIHNjb3Blcy5wdXNoKHNjb3BlMik7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBhZGRzID0gW107XG4gICAgbGV0IG1vdmVzID0gW107XG4gICAgbGV0IHJlbW92ZXMgPSBbXTtcbiAgICBsZXQgc2FtZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZXZLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQga2V5ID0gcHJldktleXNbaV07XG4gICAgICBpZiAoa2V5cy5pbmRleE9mKGtleSkgPT09IC0xKVxuICAgICAgICByZW1vdmVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcHJldktleXMgPSBwcmV2S2V5cy5maWx0ZXIoKGtleSkgPT4gIXJlbW92ZXMuaW5jbHVkZXMoa2V5KSk7XG4gICAgbGV0IGxhc3RLZXkgPSBcInRlbXBsYXRlXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQga2V5ID0ga2V5c1tpXTtcbiAgICAgIGxldCBwcmV2SW5kZXggPSBwcmV2S2V5cy5pbmRleE9mKGtleSk7XG4gICAgICBpZiAocHJldkluZGV4ID09PSAtMSkge1xuICAgICAgICBwcmV2S2V5cy5zcGxpY2UoaSwgMCwga2V5KTtcbiAgICAgICAgYWRkcy5wdXNoKFtsYXN0S2V5LCBpXSk7XG4gICAgICB9IGVsc2UgaWYgKHByZXZJbmRleCAhPT0gaSkge1xuICAgICAgICBsZXQga2V5SW5TcG90ID0gcHJldktleXMuc3BsaWNlKGksIDEpWzBdO1xuICAgICAgICBsZXQga2V5Rm9yU3BvdCA9IHByZXZLZXlzLnNwbGljZShwcmV2SW5kZXggLSAxLCAxKVswXTtcbiAgICAgICAgcHJldktleXMuc3BsaWNlKGksIDAsIGtleUZvclNwb3QpO1xuICAgICAgICBwcmV2S2V5cy5zcGxpY2UocHJldkluZGV4LCAwLCBrZXlJblNwb3QpO1xuICAgICAgICBtb3Zlcy5wdXNoKFtrZXlJblNwb3QsIGtleUZvclNwb3RdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNhbWVzLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICAgIGxhc3RLZXkgPSBrZXk7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVtb3Zlcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGtleSA9IHJlbW92ZXNbaV07XG4gICAgICBpZiAoIShrZXkgaW4gbG9va3VwKSlcbiAgICAgICAgY29udGludWU7XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBkZXN0cm95VHJlZShsb29rdXBba2V5XSk7XG4gICAgICAgIGxvb2t1cFtrZXldLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gICAgICBkZWxldGUgbG9va3VwW2tleV07XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbW92ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBba2V5SW5TcG90LCBrZXlGb3JTcG90XSA9IG1vdmVzW2ldO1xuICAgICAgbGV0IGVsSW5TcG90ID0gbG9va3VwW2tleUluU3BvdF07XG4gICAgICBsZXQgZWxGb3JTcG90ID0gbG9va3VwW2tleUZvclNwb3RdO1xuICAgICAgbGV0IG1hcmtlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBpZiAoIWVsRm9yU3BvdClcbiAgICAgICAgICB3YXJuKGB4LWZvciBcIjprZXlcIiBpcyB1bmRlZmluZWQgb3IgaW52YWxpZGAsIHRlbXBsYXRlRWwsIGtleUZvclNwb3QsIGxvb2t1cCk7XG4gICAgICAgIGVsRm9yU3BvdC5hZnRlcihtYXJrZXIpO1xuICAgICAgICBlbEluU3BvdC5hZnRlcihlbEZvclNwb3QpO1xuICAgICAgICBlbEZvclNwb3QuX3hfY3VycmVudElmRWwgJiYgZWxGb3JTcG90LmFmdGVyKGVsRm9yU3BvdC5feF9jdXJyZW50SWZFbCk7XG4gICAgICAgIG1hcmtlci5iZWZvcmUoZWxJblNwb3QpO1xuICAgICAgICBlbEluU3BvdC5feF9jdXJyZW50SWZFbCAmJiBlbEluU3BvdC5hZnRlcihlbEluU3BvdC5feF9jdXJyZW50SWZFbCk7XG4gICAgICAgIG1hcmtlci5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgICAgZWxGb3JTcG90Ll94X3JlZnJlc2hYRm9yU2NvcGUoc2NvcGVzW2tleXMuaW5kZXhPZihrZXlGb3JTcG90KV0pO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFkZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBbbGFzdEtleTIsIGluZGV4XSA9IGFkZHNbaV07XG4gICAgICBsZXQgbGFzdEVsID0gbGFzdEtleTIgPT09IFwidGVtcGxhdGVcIiA/IHRlbXBsYXRlRWwgOiBsb29rdXBbbGFzdEtleTJdO1xuICAgICAgaWYgKGxhc3RFbC5feF9jdXJyZW50SWZFbClcbiAgICAgICAgbGFzdEVsID0gbGFzdEVsLl94X2N1cnJlbnRJZkVsO1xuICAgICAgbGV0IHNjb3BlMiA9IHNjb3Blc1tpbmRleF07XG4gICAgICBsZXQga2V5ID0ga2V5c1tpbmRleF07XG4gICAgICBsZXQgY2xvbmUyID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZUVsLmNvbnRlbnQsIHRydWUpLmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgbGV0IHJlYWN0aXZlU2NvcGUgPSByZWFjdGl2ZShzY29wZTIpO1xuICAgICAgYWRkU2NvcGVUb05vZGUoY2xvbmUyLCByZWFjdGl2ZVNjb3BlLCB0ZW1wbGF0ZUVsKTtcbiAgICAgIGNsb25lMi5feF9yZWZyZXNoWEZvclNjb3BlID0gKG5ld1Njb3BlKSA9PiB7XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKG5ld1Njb3BlKS5mb3JFYWNoKChba2V5MiwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgcmVhY3RpdmVTY29wZVtrZXkyXSA9IHZhbHVlO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgICBsYXN0RWwuYWZ0ZXIoY2xvbmUyKTtcbiAgICAgICAgc2tpcER1cmluZ0Nsb25lKCgpID0+IGluaXRUcmVlKGNsb25lMikpKCk7XG4gICAgICB9KTtcbiAgICAgIGlmICh0eXBlb2Yga2V5ID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHdhcm4oXCJ4LWZvciBrZXkgY2Fubm90IGJlIGFuIG9iamVjdCwgaXQgbXVzdCBiZSBhIHN0cmluZyBvciBhbiBpbnRlZ2VyXCIsIHRlbXBsYXRlRWwpO1xuICAgICAgfVxuICAgICAgbG9va3VwW2tleV0gPSBjbG9uZTI7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2FtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxvb2t1cFtzYW1lc1tpXV0uX3hfcmVmcmVzaFhGb3JTY29wZShzY29wZXNba2V5cy5pbmRleE9mKHNhbWVzW2ldKV0pO1xuICAgIH1cbiAgICB0ZW1wbGF0ZUVsLl94X3ByZXZLZXlzID0ga2V5cztcbiAgfSk7XG59XG5mdW5jdGlvbiBwYXJzZUZvckV4cHJlc3Npb24oZXhwcmVzc2lvbikge1xuICBsZXQgZm9ySXRlcmF0b3JSRSA9IC8sKFteLFxcfVxcXV0qKSg/OiwoW14sXFx9XFxdXSopKT8kLztcbiAgbGV0IHN0cmlwUGFyZW5zUkUgPSAvXlxccypcXCh8XFwpXFxzKiQvZztcbiAgbGV0IGZvckFsaWFzUkUgPSAvKFtcXHNcXFNdKj8pXFxzKyg/OmlufG9mKVxccysoW1xcc1xcU10qKS87XG4gIGxldCBpbk1hdGNoID0gZXhwcmVzc2lvbi5tYXRjaChmb3JBbGlhc1JFKTtcbiAgaWYgKCFpbk1hdGNoKVxuICAgIHJldHVybjtcbiAgbGV0IHJlcyA9IHt9O1xuICByZXMuaXRlbXMgPSBpbk1hdGNoWzJdLnRyaW0oKTtcbiAgbGV0IGl0ZW0gPSBpbk1hdGNoWzFdLnJlcGxhY2Uoc3RyaXBQYXJlbnNSRSwgXCJcIikudHJpbSgpO1xuICBsZXQgaXRlcmF0b3JNYXRjaCA9IGl0ZW0ubWF0Y2goZm9ySXRlcmF0b3JSRSk7XG4gIGlmIChpdGVyYXRvck1hdGNoKSB7XG4gICAgcmVzLml0ZW0gPSBpdGVtLnJlcGxhY2UoZm9ySXRlcmF0b3JSRSwgXCJcIikudHJpbSgpO1xuICAgIHJlcy5pbmRleCA9IGl0ZXJhdG9yTWF0Y2hbMV0udHJpbSgpO1xuICAgIGlmIChpdGVyYXRvck1hdGNoWzJdKSB7XG4gICAgICByZXMuY29sbGVjdGlvbiA9IGl0ZXJhdG9yTWF0Y2hbMl0udHJpbSgpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXMuaXRlbSA9IGl0ZW07XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cbmZ1bmN0aW9uIGdldEl0ZXJhdGlvblNjb3BlVmFyaWFibGVzKGl0ZXJhdG9yTmFtZXMsIGl0ZW0sIGluZGV4LCBpdGVtcykge1xuICBsZXQgc2NvcGVWYXJpYWJsZXMgPSB7fTtcbiAgaWYgKC9eXFxbLipcXF0kLy50ZXN0KGl0ZXJhdG9yTmFtZXMuaXRlbSkgJiYgQXJyYXkuaXNBcnJheShpdGVtKSkge1xuICAgIGxldCBuYW1lcyA9IGl0ZXJhdG9yTmFtZXMuaXRlbS5yZXBsYWNlKFwiW1wiLCBcIlwiKS5yZXBsYWNlKFwiXVwiLCBcIlwiKS5zcGxpdChcIixcIikubWFwKChpKSA9PiBpLnRyaW0oKSk7XG4gICAgbmFtZXMuZm9yRWFjaCgobmFtZSwgaSkgPT4ge1xuICAgICAgc2NvcGVWYXJpYWJsZXNbbmFtZV0gPSBpdGVtW2ldO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKC9eXFx7LipcXH0kLy50ZXN0KGl0ZXJhdG9yTmFtZXMuaXRlbSkgJiYgIUFycmF5LmlzQXJyYXkoaXRlbSkgJiYgdHlwZW9mIGl0ZW0gPT09IFwib2JqZWN0XCIpIHtcbiAgICBsZXQgbmFtZXMgPSBpdGVyYXRvck5hbWVzLml0ZW0ucmVwbGFjZShcIntcIiwgXCJcIikucmVwbGFjZShcIn1cIiwgXCJcIikuc3BsaXQoXCIsXCIpLm1hcCgoaSkgPT4gaS50cmltKCkpO1xuICAgIG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgIHNjb3BlVmFyaWFibGVzW25hbWVdID0gaXRlbVtuYW1lXTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBzY29wZVZhcmlhYmxlc1tpdGVyYXRvck5hbWVzLml0ZW1dID0gaXRlbTtcbiAgfVxuICBpZiAoaXRlcmF0b3JOYW1lcy5pbmRleClcbiAgICBzY29wZVZhcmlhYmxlc1tpdGVyYXRvck5hbWVzLmluZGV4XSA9IGluZGV4O1xuICBpZiAoaXRlcmF0b3JOYW1lcy5jb2xsZWN0aW9uKVxuICAgIHNjb3BlVmFyaWFibGVzW2l0ZXJhdG9yTmFtZXMuY29sbGVjdGlvbl0gPSBpdGVtcztcbiAgcmV0dXJuIHNjb3BlVmFyaWFibGVzO1xufVxuZnVuY3Rpb24gaXNOdW1lcmljMyhzdWJqZWN0KSB7XG4gIHJldHVybiAhQXJyYXkuaXNBcnJheShzdWJqZWN0KSAmJiAhaXNOYU4oc3ViamVjdCk7XG59XG5cbi8vIHBhY2thZ2VzL2FscGluZWpzL3NyYy9kaXJlY3RpdmVzL3gtcmVmLmpzXG5mdW5jdGlvbiBoYW5kbGVyMygpIHtcbn1cbmhhbmRsZXIzLmlubGluZSA9IChlbCwgeyBleHByZXNzaW9uIH0sIHsgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBsZXQgcm9vdCA9IGNsb3Nlc3RSb290KGVsKTtcbiAgaWYgKCFyb290Ll94X3JlZnMpXG4gICAgcm9vdC5feF9yZWZzID0ge307XG4gIHJvb3QuX3hfcmVmc1tleHByZXNzaW9uXSA9IGVsO1xuICBjbGVhbnVwMigoKSA9PiBkZWxldGUgcm9vdC5feF9yZWZzW2V4cHJlc3Npb25dKTtcbn07XG5kaXJlY3RpdmUoXCJyZWZcIiwgaGFuZGxlcjMpO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LWlmLmpzXG5kaXJlY3RpdmUoXCJpZlwiLCAoZWwsIHsgZXhwcmVzc2lvbiB9LCB7IGVmZmVjdDogZWZmZWN0MywgY2xlYW51cDogY2xlYW51cDIgfSkgPT4ge1xuICBpZiAoZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSBcInRlbXBsYXRlXCIpXG4gICAgd2FybihcIngtaWYgY2FuIG9ubHkgYmUgdXNlZCBvbiBhIDx0ZW1wbGF0ZT4gdGFnXCIsIGVsKTtcbiAgbGV0IGV2YWx1YXRlMiA9IGV2YWx1YXRlTGF0ZXIoZWwsIGV4cHJlc3Npb24pO1xuICBsZXQgc2hvdyA9ICgpID0+IHtcbiAgICBpZiAoZWwuX3hfY3VycmVudElmRWwpXG4gICAgICByZXR1cm4gZWwuX3hfY3VycmVudElmRWw7XG4gICAgbGV0IGNsb25lMiA9IGVsLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpLmZpcnN0RWxlbWVudENoaWxkO1xuICAgIGFkZFNjb3BlVG9Ob2RlKGNsb25lMiwge30sIGVsKTtcbiAgICBtdXRhdGVEb20oKCkgPT4ge1xuICAgICAgZWwuYWZ0ZXIoY2xvbmUyKTtcbiAgICAgIHNraXBEdXJpbmdDbG9uZSgoKSA9PiBpbml0VHJlZShjbG9uZTIpKSgpO1xuICAgIH0pO1xuICAgIGVsLl94X2N1cnJlbnRJZkVsID0gY2xvbmUyO1xuICAgIGVsLl94X3VuZG9JZiA9ICgpID0+IHtcbiAgICAgIG11dGF0ZURvbSgoKSA9PiB7XG4gICAgICAgIGRlc3Ryb3lUcmVlKGNsb25lMik7XG4gICAgICAgIGNsb25lMi5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICAgICAgZGVsZXRlIGVsLl94X2N1cnJlbnRJZkVsO1xuICAgIH07XG4gICAgcmV0dXJuIGNsb25lMjtcbiAgfTtcbiAgbGV0IGhpZGUgPSAoKSA9PiB7XG4gICAgaWYgKCFlbC5feF91bmRvSWYpXG4gICAgICByZXR1cm47XG4gICAgZWwuX3hfdW5kb0lmKCk7XG4gICAgZGVsZXRlIGVsLl94X3VuZG9JZjtcbiAgfTtcbiAgZWZmZWN0MygoKSA9PiBldmFsdWF0ZTIoKHZhbHVlKSA9PiB7XG4gICAgdmFsdWUgPyBzaG93KCkgOiBoaWRlKCk7XG4gIH0pKTtcbiAgY2xlYW51cDIoKCkgPT4gZWwuX3hfdW5kb0lmICYmIGVsLl94X3VuZG9JZigpKTtcbn0pO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LWlkLmpzXG5kaXJlY3RpdmUoXCJpZFwiLCAoZWwsIHsgZXhwcmVzc2lvbiB9LCB7IGV2YWx1YXRlOiBldmFsdWF0ZTIgfSkgPT4ge1xuICBsZXQgbmFtZXMgPSBldmFsdWF0ZTIoZXhwcmVzc2lvbik7XG4gIG5hbWVzLmZvckVhY2goKG5hbWUpID0+IHNldElkUm9vdChlbCwgbmFtZSkpO1xufSk7XG5pbnRlcmNlcHRDbG9uZSgoZnJvbSwgdG8pID0+IHtcbiAgaWYgKGZyb20uX3hfaWRzKSB7XG4gICAgdG8uX3hfaWRzID0gZnJvbS5feF9pZHM7XG4gIH1cbn0pO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy94LW9uLmpzXG5tYXBBdHRyaWJ1dGVzKHN0YXJ0aW5nV2l0aChcIkBcIiwgaW50byhwcmVmaXgoXCJvbjpcIikpKSk7XG5kaXJlY3RpdmUoXCJvblwiLCBza2lwRHVyaW5nQ2xvbmUoKGVsLCB7IHZhbHVlLCBtb2RpZmllcnMsIGV4cHJlc3Npb24gfSwgeyBjbGVhbnVwOiBjbGVhbnVwMiB9KSA9PiB7XG4gIGxldCBldmFsdWF0ZTIgPSBleHByZXNzaW9uID8gZXZhbHVhdGVMYXRlcihlbCwgZXhwcmVzc2lvbikgOiAoKSA9PiB7XG4gIH07XG4gIGlmIChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09IFwidGVtcGxhdGVcIikge1xuICAgIGlmICghZWwuX3hfZm9yd2FyZEV2ZW50cylcbiAgICAgIGVsLl94X2ZvcndhcmRFdmVudHMgPSBbXTtcbiAgICBpZiAoIWVsLl94X2ZvcndhcmRFdmVudHMuaW5jbHVkZXModmFsdWUpKVxuICAgICAgZWwuX3hfZm9yd2FyZEV2ZW50cy5wdXNoKHZhbHVlKTtcbiAgfVxuICBsZXQgcmVtb3ZlTGlzdGVuZXIgPSBvbihlbCwgdmFsdWUsIG1vZGlmaWVycywgKGUpID0+IHtcbiAgICBldmFsdWF0ZTIoKCkgPT4ge1xuICAgIH0sIHsgc2NvcGU6IHsgXCIkZXZlbnRcIjogZSB9LCBwYXJhbXM6IFtlXSB9KTtcbiAgfSk7XG4gIGNsZWFudXAyKCgpID0+IHJlbW92ZUxpc3RlbmVyKCkpO1xufSkpO1xuXG4vLyBwYWNrYWdlcy9hbHBpbmVqcy9zcmMvZGlyZWN0aXZlcy9pbmRleC5qc1xud2Fybk1pc3NpbmdQbHVnaW5EaXJlY3RpdmUoXCJDb2xsYXBzZVwiLCBcImNvbGxhcHNlXCIsIFwiY29sbGFwc2VcIik7XG53YXJuTWlzc2luZ1BsdWdpbkRpcmVjdGl2ZShcIkludGVyc2VjdFwiLCBcImludGVyc2VjdFwiLCBcImludGVyc2VjdFwiKTtcbndhcm5NaXNzaW5nUGx1Z2luRGlyZWN0aXZlKFwiRm9jdXNcIiwgXCJ0cmFwXCIsIFwiZm9jdXNcIik7XG53YXJuTWlzc2luZ1BsdWdpbkRpcmVjdGl2ZShcIk1hc2tcIiwgXCJtYXNrXCIsIFwibWFza1wiKTtcbmZ1bmN0aW9uIHdhcm5NaXNzaW5nUGx1Z2luRGlyZWN0aXZlKG5hbWUsIGRpcmVjdGl2ZU5hbWUsIHNsdWcpIHtcbiAgZGlyZWN0aXZlKGRpcmVjdGl2ZU5hbWUsIChlbCkgPT4gd2FybihgWW91IGNhbid0IHVzZSBbeC0ke2RpcmVjdGl2ZU5hbWV9XSB3aXRob3V0IGZpcnN0IGluc3RhbGxpbmcgdGhlIFwiJHtuYW1lfVwiIHBsdWdpbiBoZXJlOiBodHRwczovL2FscGluZWpzLmRldi9wbHVnaW5zLyR7c2x1Z31gLCBlbCkpO1xufVxuXG4vLyBwYWNrYWdlcy9jc3Avc3JjL2RpcmVjdGl2ZXMveC1odG1sLmpzXG5kaXJlY3RpdmUoXCJodG1sXCIsIChlbCwgeyBleHByZXNzaW9uIH0pID0+IHtcbiAgaGFuZGxlRXJyb3IobmV3IEVycm9yKFwiVXNpbmcgdGhlIHgtaHRtbCBkaXJlY3RpdmUgaXMgcHJvaGliaXRlZCBpbiB0aGUgQ1NQIGJ1aWxkXCIpLCBlbCk7XG59KTtcblxuLy8gcGFja2FnZXMvY3NwL3NyYy9pbmRleC5qc1xuYWxwaW5lX2RlZmF1bHQuc2V0RXZhbHVhdG9yKGNzcEV2YWx1YXRvcik7XG5hbHBpbmVfZGVmYXVsdC5zZXRSYXdFdmFsdWF0b3IoY3NwUmF3RXZhbHVhdG9yKTtcbmFscGluZV9kZWZhdWx0LnNldFJlYWN0aXZpdHlFbmdpbmUoeyByZWFjdGl2ZTogcmVhY3RpdmUyLCBlZmZlY3Q6IGVmZmVjdDIsIHJlbGVhc2U6IHN0b3AsIHJhdzogdG9SYXcgfSk7XG52YXIgc3JjX2RlZmF1bHQgPSBhbHBpbmVfZGVmYXVsdDtcblxuLy8gcGFja2FnZXMvY3NwL2J1aWxkcy9tb2R1bGUuanNcbnZhciBtb2R1bGVfZGVmYXVsdCA9IHNyY19kZWZhdWx0O1xuZXhwb3J0IHtcbiAgc3JjX2RlZmF1bHQgYXMgQWxwaW5lLFxuICBtb2R1bGVfZGVmYXVsdCBhcyBkZWZhdWx0XG59O1xuIiwgIi8qKlxuICogQnJvd3NlciBBUEkgY29tcGF0aWJpbGl0eSBsYXllciBmb3IgQ2hyb21lIC8gU2FmYXJpIC8gRmlyZWZveC5cbiAqXG4gKiBTYWZhcmkgYW5kIEZpcmVmb3ggZXhwb3NlIGBicm93c2VyLipgIChQcm9taXNlLWJhc2VkLCBXZWJFeHRlbnNpb24gc3RhbmRhcmQpLlxuICogQ2hyb21lIGV4cG9zZXMgYGNocm9tZS4qYCAoY2FsbGJhY2stYmFzZWQgaGlzdG9yaWNhbGx5LCBidXQgTVYzIHN1cHBvcnRzXG4gKiBwcm9taXNlcyBvbiBtb3N0IEFQSXMpLiBJbiBhIHNlcnZpY2Utd29ya2VyIGNvbnRleHQgYGJyb3dzZXJgIGlzIHVuZGVmaW5lZFxuICogb24gQ2hyb21lLCBzbyB3ZSBub3JtYWxpc2UgZXZlcnl0aGluZyBoZXJlLlxuICpcbiAqIFVzYWdlOiAgaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi91dGlsaXRpZXMvYnJvd3Nlci1wb2x5ZmlsbCc7XG4gKiAgICAgICAgIGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLilcbiAqXG4gKiBUaGUgZXhwb3J0ZWQgYGFwaWAgb2JqZWN0IG1pcnJvcnMgdGhlIHN1YnNldCBvZiB0aGUgV2ViRXh0ZW5zaW9uIEFQSSB0aGF0XG4gKiBOb3N0cktleSBhY3R1YWxseSB1c2VzLCB3aXRoIGV2ZXJ5IG1ldGhvZCByZXR1cm5pbmcgYSBQcm9taXNlLlxuICovXG5cbi8vIERldGVjdCB3aGljaCBnbG9iYWwgbmFtZXNwYWNlIGlzIGF2YWlsYWJsZS5cbmNvbnN0IF9icm93c2VyID1cbiAgICB0eXBlb2YgYnJvd3NlciAhPT0gJ3VuZGVmaW5lZCcgPyBicm93c2VyIDpcbiAgICB0eXBlb2YgY2hyb21lICAhPT0gJ3VuZGVmaW5lZCcgPyBjaHJvbWUgIDpcbiAgICBudWxsO1xuXG5pZiAoIV9icm93c2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdicm93c2VyLXBvbHlmaWxsOiBObyBleHRlbnNpb24gQVBJIG5hbWVzcGFjZSBmb3VuZCAobmVpdGhlciBicm93c2VyIG5vciBjaHJvbWUpLicpO1xufVxuXG4vKipcbiAqIFRydWUgd2hlbiBydW5uaW5nIG9uIENocm9tZSAob3IgYW55IENocm9taXVtLWJhc2VkIGJyb3dzZXIgdGhhdCBvbmx5XG4gKiBleHBvc2VzIHRoZSBgY2hyb21lYCBuYW1lc3BhY2UpLlxuICovXG5jb25zdCBpc0Nocm9tZSA9IHR5cGVvZiBicm93c2VyID09PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY2hyb21lICE9PSAndW5kZWZpbmVkJztcblxuLyoqXG4gKiBXcmFwIGEgQ2hyb21lIGNhbGxiYWNrLXN0eWxlIG1ldGhvZCBzbyBpdCByZXR1cm5zIGEgUHJvbWlzZS5cbiAqIElmIHRoZSBtZXRob2QgYWxyZWFkeSByZXR1cm5zIGEgcHJvbWlzZSAoTVYzKSB3ZSBqdXN0IHBhc3MgdGhyb3VnaC5cbiAqL1xuZnVuY3Rpb24gcHJvbWlzaWZ5KGNvbnRleHQsIG1ldGhvZCkge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBNVjMgQ2hyb21lIEFQSXMgcmV0dXJuIHByb21pc2VzIHdoZW4gbm8gY2FsbGJhY2sgaXMgc3VwcGxpZWQuXG4gICAgICAgIC8vIFdlIHRyeSB0aGUgcHJvbWlzZSBwYXRoIGZpcnN0OyBpZiB0aGUgcnVudGltZSBzaWduYWxzIGFuIGVycm9yXG4gICAgICAgIC8vIHZpYSBjaHJvbWUucnVudGltZS5sYXN0RXJyb3IgaW5zaWRlIGEgY2FsbGJhY2sgd2UgY2F0Y2ggdGhhdCB0b28uXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCB0byBjYWxsYmFjayB3cmFwcGluZ1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIG1ldGhvZC5hcHBseShjb250ZXh0LCBbXG4gICAgICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgICAgICAgICAoLi4uY2JBcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfYnJvd3Nlci5ydW50aW1lICYmIF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKF9icm93c2VyLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoY2JBcmdzLmxlbmd0aCA8PSAxID8gY2JBcmdzWzBdIDogY2JBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBCdWlsZCB0aGUgdW5pZmllZCBgYXBpYCBvYmplY3Rcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5jb25zdCBhcGkgPSB7fTtcblxuLy8gLS0tIHJ1bnRpbWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkucnVudGltZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZW5kTWVzc2FnZSBcdTIwMTMgYWx3YXlzIHJldHVybnMgYSBQcm9taXNlLlxuICAgICAqL1xuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb25NZXNzYWdlIFx1MjAxMyB0aGluIHdyYXBwZXIgc28gY2FsbGVycyB1c2UgYSBjb25zaXN0ZW50IHJlZmVyZW5jZS5cbiAgICAgKiBUaGUgbGlzdGVuZXIgc2lnbmF0dXJlIGlzIChtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkuXG4gICAgICogT24gQ2hyb21lIHRoZSBsaXN0ZW5lciBjYW4gcmV0dXJuIGB0cnVlYCB0byBrZWVwIHRoZSBjaGFubmVsIG9wZW4sXG4gICAgICogb3IgcmV0dXJuIGEgUHJvbWlzZSAoTVYzKS4gIFNhZmFyaSAvIEZpcmVmb3ggZXhwZWN0IGEgUHJvbWlzZSByZXR1cm4uXG4gICAgICovXG4gICAgb25NZXNzYWdlOiBfYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZSxcblxuICAgIC8qKlxuICAgICAqIGdldFVSTCBcdTIwMTMgc3luY2hyb25vdXMgb24gYWxsIGJyb3dzZXJzLlxuICAgICAqL1xuICAgIGdldFVSTChwYXRoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmdldFVSTChwYXRoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogb3Blbk9wdGlvbnNQYWdlXG4gICAgICovXG4gICAgb3Blbk9wdGlvbnNQYWdlKCkge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5vcGVuT3B0aW9uc1BhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnJ1bnRpbWUsIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFeHBvc2UgdGhlIGlkIGZvciBjb252ZW5pZW5jZS5cbiAgICAgKi9cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLmlkO1xuICAgIH0sXG59O1xuXG4vLyAtLS0gc3RvcmFnZS5sb2NhbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS5zdG9yYWdlID0ge1xuICAgIGxvY2FsOiB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLCBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgfSxcbn07XG5cbi8vIC0tLSB0YWJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnRhYnMgPSB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5jcmVhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcXVlcnkoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5xdWVyeSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucXVlcnkpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgcmVtb3ZlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgdXBkYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMudXBkYXRlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy51cGRhdGUpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXQpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgZ2V0Q3VycmVudCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLmdldEN1cnJlbnQpKC4uLmFyZ3MpO1xuICAgIH0sXG59O1xuXG5leHBvcnQgeyBhcGksIGlzQ2hyb21lIH07XG4iLCAiLyoqXG4gKiBWYXVsdCBTdG9yZSBcdTIwMTQgTG9jYWwgY2FjaGUgZm9yIGVuY3J5cHRlZCB2YXVsdCBkb2N1bWVudHNcbiAqXG4gKiBTdG9yYWdlIHNjaGVtYSBpbiBicm93c2VyLnN0b3JhZ2UubG9jYWw6XG4gKiAgIHZhdWx0RG9jczoge1xuICogICAgIFwicGF0aC90by9maWxlLm1kXCI6IHtcbiAqICAgICAgIHBhdGgsIGNvbnRlbnQsIHVwZGF0ZWRBdCwgc3luY1N0YXR1cywgZXZlbnRJZCwgcmVsYXlDcmVhdGVkQXRcbiAqICAgICB9XG4gKiAgIH1cbiAqXG4gKiBzeW5jU3RhdHVzOiBcInN5bmNlZFwiIHwgXCJsb2NhbC1vbmx5XCIgfCBcImNvbmZsaWN0XCJcbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5jb25zdCBTVE9SQUdFX0tFWSA9ICd2YXVsdERvY3MnO1xuXG5hc3luYyBmdW5jdGlvbiBnZXREb2NzKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtTVE9SQUdFX0tFWV06IHt9IH0pO1xuICAgIHJldHVybiBkYXRhW1NUT1JBR0VfS0VZXSB8fCB7fTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0RG9jcyhkb2NzKSB7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbU1RPUkFHRV9LRVldOiBkb2NzIH0pO1xufVxuXG4vKipcbiAqIEdldCB0aGUgZnVsbCB2YXVsdCBkb2NzIG9iamVjdC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IE1hcCBvZiBwYXRoIC0+IGRvY1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VmF1bHRJbmRleCgpIHtcbiAgICByZXR1cm4gZ2V0RG9jcygpO1xufVxuXG4vKipcbiAqIEdldCBhIHNpbmdsZSBkb2N1bWVudCBieSBwYXRoLlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdHxudWxsPn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldERvY3VtZW50KHBhdGgpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIHJldHVybiBkb2NzW3BhdGhdIHx8IG51bGw7XG59XG5cbi8qKlxuICogU2F2ZSBvciB1cGRhdGUgYSBkb2N1bWVudCBpbiB0aGUgbG9jYWwgY2FjaGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlRG9jdW1lbnRMb2NhbChwYXRoLCBjb250ZW50LCBzeW5jU3RhdHVzLCBldmVudElkID0gbnVsbCwgcmVsYXlDcmVhdGVkQXQgPSBudWxsKSB7XG4gICAgY29uc3QgZG9jcyA9IGF3YWl0IGdldERvY3MoKTtcbiAgICBkb2NzW3BhdGhdID0ge1xuICAgICAgICBwYXRoLFxuICAgICAgICBjb250ZW50LFxuICAgICAgICB1cGRhdGVkQXQ6IE1hdGguZmxvb3IoRGF0ZS5ub3coKSAvIDEwMDApLFxuICAgICAgICBzeW5jU3RhdHVzLFxuICAgICAgICBldmVudElkLFxuICAgICAgICByZWxheUNyZWF0ZWRBdCxcbiAgICB9O1xuICAgIGF3YWl0IHNldERvY3MoZG9jcyk7XG4gICAgcmV0dXJuIGRvY3NbcGF0aF07XG59XG5cbi8qKlxuICogRGVsZXRlIGEgZG9jdW1lbnQgZnJvbSB0aGUgbG9jYWwgY2FjaGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVEb2N1bWVudExvY2FsKHBhdGgpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIGRlbGV0ZSBkb2NzW3BhdGhdO1xuICAgIGF3YWl0IHNldERvY3MoZG9jcyk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgZG9jdW1lbnRzIHNvcnRlZCBieSB1cGRhdGVkQXQgZGVzY2VuZGluZy5cbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn0gU29ydGVkIGFycmF5IG9mIGRvYyBtZXRhZGF0YVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbGlzdERvY3VtZW50cygpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGRvY3MpLnNvcnQoKGEsIGIpID0+IGIudXBkYXRlZEF0IC0gYS51cGRhdGVkQXQpO1xufVxuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc3luYyBzdGF0dXMgKGFuZCBvcHRpb25hbGx5IGV2ZW50SWQvcmVsYXlDcmVhdGVkQXQpIGZvciBhIGRvY3VtZW50LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU3luY1N0YXR1cyhwYXRoLCBzdGF0dXMsIGV2ZW50SWQgPSBudWxsLCByZWxheUNyZWF0ZWRBdCA9IG51bGwpIHtcbiAgICBjb25zdCBkb2NzID0gYXdhaXQgZ2V0RG9jcygpO1xuICAgIGlmICghZG9jc1twYXRoXSkgcmV0dXJuIG51bGw7XG4gICAgZG9jc1twYXRoXS5zeW5jU3RhdHVzID0gc3RhdHVzO1xuICAgIGlmIChldmVudElkICE9PSBudWxsKSBkb2NzW3BhdGhdLmV2ZW50SWQgPSBldmVudElkO1xuICAgIGlmIChyZWxheUNyZWF0ZWRBdCAhPT0gbnVsbCkgZG9jc1twYXRoXS5yZWxheUNyZWF0ZWRBdCA9IHJlbGF5Q3JlYXRlZEF0O1xuICAgIGF3YWl0IHNldERvY3MoZG9jcyk7XG4gICAgcmV0dXJuIGRvY3NbcGF0aF07XG59XG4iLCAiaW1wb3J0IEFscGluZSBmcm9tICdAYWxwaW5lanMvY3NwJztcbmltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7XG4gICAgZ2V0VmF1bHRJbmRleCxcbiAgICBnZXREb2N1bWVudCxcbiAgICBzYXZlRG9jdW1lbnRMb2NhbCxcbiAgICBkZWxldGVEb2N1bWVudExvY2FsLFxuICAgIGxpc3REb2N1bWVudHMsXG4gICAgdXBkYXRlU3luY1N0YXR1cyxcbn0gZnJvbSAnLi4vdXRpbGl0aWVzL3ZhdWx0LXN0b3JlJztcblxuQWxwaW5lLmRhdGEoJ3ZhdWx0JywgKCkgPT4gKHtcbiAgICAvLyBTdGF0ZVxuICAgIGRvY3VtZW50czogW10sXG4gICAgc2VhcmNoUXVlcnk6ICcnLFxuICAgIHNlbGVjdGVkUGF0aDogbnVsbCxcbiAgICBlZGl0b3JUaXRsZTogJycsXG4gICAgZWRpdG9yQ29udGVudDogJycsXG4gICAgcHJpc3RpbmVUaXRsZTogJycsXG4gICAgcHJpc3RpbmVDb250ZW50OiAnJyxcbiAgICBnbG9iYWxTeW5jU3RhdHVzOiAnaWRsZScsIC8vIGlkbGUgfCBzeW5jaW5nIHwgZXJyb3JcbiAgICBzeW5jRXJyb3I6ICcnLFxuICAgIHNhdmluZzogZmFsc2UsXG4gICAgaXNOZXc6IGZhbHNlLFxuICAgIHRvYXN0OiAnJyxcbiAgICByZWxheUluZm86IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9LFxuXG4gICAgYXN5bmMgaW5pdCgpIHtcbiAgICAgICAgLy8gTG9hZCByZWxheSBpbmZvXG4gICAgICAgIGNvbnN0IHJlbGF5cyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3ZhdWx0LmdldFJlbGF5cycgfSk7XG4gICAgICAgIHRoaXMucmVsYXlJbmZvID0gcmVsYXlzIHx8IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9O1xuXG4gICAgICAgIC8vIExvYWQgbG9jYWwgY2FjaGVcbiAgICAgICAgdGhpcy5kb2N1bWVudHMgPSBhd2FpdCBsaXN0RG9jdW1lbnRzKCk7XG5cbiAgICAgICAgLy8gQXV0by1zeW5jIGZyb20gcmVsYXlzXG4gICAgICAgIGlmICh0aGlzLmhhc1JlbGF5cykge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zeW5jQWxsKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gLS0tIENSVUQgLS0tXG5cbiAgICBuZXdEb2N1bWVudCgpIHtcbiAgICAgICAgdGhpcy5pc05ldyA9IHRydWU7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRQYXRoID0gbnVsbDtcbiAgICAgICAgdGhpcy5lZGl0b3JUaXRsZSA9ICcnO1xuICAgICAgICB0aGlzLmVkaXRvckNvbnRlbnQgPSAnJztcbiAgICAgICAgdGhpcy5wcmlzdGluZVRpdGxlID0gJyc7XG4gICAgICAgIHRoaXMucHJpc3RpbmVDb250ZW50ID0gJyc7XG4gICAgfSxcblxuICAgIGFzeW5jIHNlbGVjdERvY3VtZW50KHBhdGgpIHtcbiAgICAgICAgY29uc3QgZG9jID0gYXdhaXQgZ2V0RG9jdW1lbnQocGF0aCk7XG4gICAgICAgIGlmICghZG9jKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5pc05ldyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNlbGVjdGVkUGF0aCA9IHBhdGg7XG4gICAgICAgIHRoaXMuZWRpdG9yVGl0bGUgPSBkb2MucGF0aDtcbiAgICAgICAgdGhpcy5lZGl0b3JDb250ZW50ID0gZG9jLmNvbnRlbnQ7XG4gICAgICAgIHRoaXMucHJpc3RpbmVUaXRsZSA9IGRvYy5wYXRoO1xuICAgICAgICB0aGlzLnByaXN0aW5lQ29udGVudCA9IGRvYy5jb250ZW50O1xuICAgIH0sXG5cbiAgICBhc3luYyBzYXZlRG9jdW1lbnQoKSB7XG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5lZGl0b3JUaXRsZS50cmltKCk7XG4gICAgICAgIGlmICghdGl0bGUpIHJldHVybjtcblxuICAgICAgICB0aGlzLnNhdmluZyA9IHRydWU7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBQdWJsaXNoIHRvIHJlbGF5c1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6ICd2YXVsdC5wdWJsaXNoJyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7IHBhdGg6IHRpdGxlLCBjb250ZW50OiB0aGlzLmVkaXRvckNvbnRlbnQgfSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aXRsZSBjaGFuZ2VkIG9uIGV4aXN0aW5nIGRvYywgZGVsZXRlIG9sZCBsb2NhbCBlbnRyeVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkUGF0aCAmJiB0aGlzLnNlbGVjdGVkUGF0aCAhPT0gdGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZGVsZXRlRG9jdW1lbnRMb2NhbCh0aGlzLnNlbGVjdGVkUGF0aCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gU2F2ZSB0byBsb2NhbCBjYWNoZVxuICAgICAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKFxuICAgICAgICAgICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGl0b3JDb250ZW50LFxuICAgICAgICAgICAgICAgICAgICAnc3luY2VkJyxcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LmV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jcmVhdGVkQXQsXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRQYXRoID0gdGl0bGU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc05ldyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJpc3RpbmVUaXRsZSA9IHRpdGxlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJpc3RpbmVDb250ZW50ID0gdGhpcy5lZGl0b3JDb250ZW50O1xuICAgICAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1RvYXN0KCdTYXZlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBTYXZlIGxvY2FsbHkgaWYgcmVsYXkgcHVibGlzaCBmYWlsZWRcbiAgICAgICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbCh0aXRsZSwgdGhpcy5lZGl0b3JDb250ZW50LCAnbG9jYWwtb25seScpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGVkUGF0aCAmJiB0aGlzLnNlbGVjdGVkUGF0aCAhPT0gdGl0bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgZGVsZXRlRG9jdW1lbnRMb2NhbCh0aGlzLnNlbGVjdGVkUGF0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRQYXRoID0gdGl0bGU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc05ldyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJpc3RpbmVUaXRsZSA9IHRpdGxlO1xuICAgICAgICAgICAgICAgIHRoaXMucHJpc3RpbmVDb250ZW50ID0gdGhpcy5lZGl0b3JDb250ZW50O1xuICAgICAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1RvYXN0KCdTYXZlZCBsb2NhbGx5IChyZWxheSBlcnJvcjogJyArIChyZXN1bHQuZXJyb3IgfHwgJ3Vua25vd24nKSArICcpJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIE5ldHdvcmsgZmFpbHVyZSBcdTIwMTQgc2F2ZSBsb2NhbGx5XG4gICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbCh0aGlzLmVkaXRvclRpdGxlLnRyaW0oKSwgdGhpcy5lZGl0b3JDb250ZW50LCAnbG9jYWwtb25seScpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFBhdGggPSB0aGlzLmVkaXRvclRpdGxlLnRyaW0oKTtcbiAgICAgICAgICAgIHRoaXMuaXNOZXcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucHJpc3RpbmVUaXRsZSA9IHRoaXMuZWRpdG9yVGl0bGU7XG4gICAgICAgICAgICB0aGlzLnByaXN0aW5lQ29udGVudCA9IHRoaXMuZWRpdG9yQ29udGVudDtcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICAgICAgdGhpcy5zaG93VG9hc3QoJ1NhdmVkIGxvY2FsbHkgKG9mZmxpbmUpJyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zYXZpbmcgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgYXN5bmMgZGVsZXRlRG9jdW1lbnQoKSB7XG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RlZFBhdGgpIHJldHVybjtcbiAgICAgICAgaWYgKCFjb25maXJtKGBEZWxldGUgXCIke3RoaXMuc2VsZWN0ZWRQYXRofVwiP2ApKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZG9jID0gYXdhaXQgZ2V0RG9jdW1lbnQodGhpcy5zZWxlY3RlZFBhdGgpO1xuXG4gICAgICAgIC8vIFB1Ymxpc2ggZGVsZXRpb24gdG8gcmVsYXlzIGlmIHdlIGhhdmUgYW4gZXZlbnRJZFxuICAgICAgICBpZiAoZG9jPy5ldmVudElkKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAga2luZDogJ3ZhdWx0LmRlbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgcGF0aDogdGhpcy5zZWxlY3RlZFBhdGgsIGV2ZW50SWQ6IGRvYy5ldmVudElkIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAgICAgLy8gQ29udGludWUgd2l0aCBsb2NhbCBkZWxldGlvbiBldmVuIGlmIHJlbGF5IGZhaWxzXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCBkZWxldGVEb2N1bWVudExvY2FsKHRoaXMuc2VsZWN0ZWRQYXRoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZFBhdGggPSBudWxsO1xuICAgICAgICB0aGlzLmlzTmV3ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZWRpdG9yVGl0bGUgPSAnJztcbiAgICAgICAgdGhpcy5lZGl0b3JDb250ZW50ID0gJyc7XG4gICAgICAgIHRoaXMucHJpc3RpbmVUaXRsZSA9ICcnO1xuICAgICAgICB0aGlzLnByaXN0aW5lQ29udGVudCA9ICcnO1xuICAgICAgICB0aGlzLmRvY3VtZW50cyA9IGF3YWl0IGxpc3REb2N1bWVudHMoKTtcbiAgICAgICAgdGhpcy5zaG93VG9hc3QoJ0RlbGV0ZWQnKTtcbiAgICB9LFxuXG4gICAgLy8gLS0tIFN5bmMgLS0tXG5cbiAgICBhc3luYyBzeW5jQWxsKCkge1xuICAgICAgICB0aGlzLmdsb2JhbFN5bmNTdGF0dXMgPSAnc3luY2luZyc7XG4gICAgICAgIHRoaXMuc3luY0Vycm9yID0gJyc7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3ZhdWx0LmZldGNoJyB9KTtcblxuICAgICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgICAgICAgICAgdGhpcy5zeW5jRXJyb3IgPSByZXN1bHQuZXJyb3IgfHwgJ1N5bmMgZmFpbGVkJztcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1lcmdlIHJlbW90ZSBkb2N1bWVudHMgd2l0aCBsb2NhbCBjYWNoZVxuICAgICAgICAgICAgY29uc3QgbG9jYWxEb2NzID0gYXdhaXQgZ2V0VmF1bHRJbmRleCgpO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlbW90ZSBvZiByZXN1bHQuZG9jdW1lbnRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWwgPSBsb2NhbERvY3NbcmVtb3RlLnBhdGhdO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFsb2NhbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBOZXcgZG9jdW1lbnQgZnJvbSByZWxheSBcdTIwMTQgYWRkIHRvIGxvY2FsIGNhY2hlXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHNhdmVEb2N1bWVudExvY2FsKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3RlLnBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdGUuY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzeW5jZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3RlLmV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdGUuY3JlYXRlZEF0LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobG9jYWwuc3luY1N0YXR1cyA9PT0gJ2xvY2FsLW9ubHknKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIExvY2FsIGhhcyB1bnNhdmVkIGNoYW5nZXMgXHUyMDE0IGtlZXAgbG9jYWwsIG1hcmsgY29uZmxpY3QgaWYgcmVsYXkgaGFzIGRpZmZlcmVudCBjb250ZW50XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2NhbC5jb250ZW50ICE9PSByZW1vdGUuY29udGVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdXBkYXRlU3luY1N0YXR1cyhyZW1vdGUucGF0aCwgJ2NvbmZsaWN0JywgcmVtb3RlLmV2ZW50SWQsIHJlbW90ZS5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghbG9jYWwucmVsYXlDcmVhdGVkQXQgfHwgcmVtb3RlLmNyZWF0ZWRBdCA+IGxvY2FsLnJlbGF5Q3JlYXRlZEF0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbGF5IHZlcnNpb24gaXMgbmV3ZXIgXHUyMDE0IHVwZGF0ZSBsb2NhbFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBzYXZlRG9jdW1lbnRMb2NhbChcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW90ZS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3RlLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3luY2VkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW90ZS5ldmVudElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3RlLmNyZWF0ZWRBdCxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBkb2MgaXMgY3VycmVudGx5IHNlbGVjdGVkLCByZWZyZXNoIGVkaXRvclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3RlZFBhdGggPT09IHJlbW90ZS5wYXRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVkaXRvckNvbnRlbnQgPSByZW1vdGUuY29udGVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJpc3RpbmVDb250ZW50ID0gcmVtb3RlLmNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRzID0gYXdhaXQgbGlzdERvY3VtZW50cygpO1xuICAgICAgICAgICAgdGhpcy5nbG9iYWxTeW5jU3RhdHVzID0gJ2lkbGUnO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmdsb2JhbFN5bmNTdGF0dXMgPSAnZXJyb3InO1xuICAgICAgICAgICAgdGhpcy5zeW5jRXJyb3IgPSBlLm1lc3NhZ2UgfHwgJ1N5bmMgZmFpbGVkJztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyAtLS0gQ29tcHV0ZWQgLS0tXG5cbiAgICBnZXQgZmlsdGVyZWREb2N1bWVudHMoKSB7XG4gICAgICAgIGlmICghdGhpcy5zZWFyY2hRdWVyeSkgcmV0dXJuIHRoaXMuZG9jdW1lbnRzO1xuICAgICAgICBjb25zdCBxID0gdGhpcy5zZWFyY2hRdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuZmlsdGVyKGQgPT4gZC5wYXRoLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocSkpO1xuICAgIH0sXG5cbiAgICBnZXQgaXNEaXJ0eSgpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yQ29udGVudCAhPT0gdGhpcy5wcmlzdGluZUNvbnRlbnQgfHxcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yVGl0bGUgIT09IHRoaXMucHJpc3RpbmVUaXRsZVxuICAgICAgICApO1xuICAgIH0sXG5cbiAgICBnZXQgaGFzUmVsYXlzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWxheUluZm8ucmVhZC5sZW5ndGggPiAwIHx8IHRoaXMucmVsYXlJbmZvLndyaXRlLmxlbmd0aCA+IDA7XG4gICAgfSxcblxuICAgIC8vIC0tLSBIZWxwZXJzIC0tLVxuXG4gICAgc2hvd1RvYXN0KG1zZykge1xuICAgICAgICB0aGlzLnRvYXN0ID0gbXNnO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy50b2FzdCA9ICcnOyB9LCAyMDAwKTtcbiAgICB9LFxufSkpO1xuXG5BbHBpbmUuc3RhcnQoKTtcblxuLy8gQ2xvc2UgYnV0dG9uIGhhbmRsZXJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgd2luZG93LmNsb3NlKCk7XG4gICAgY2hyb21lLnRhYnM/LmdldEN1cnJlbnQ/Lih0ID0+IGNocm9tZS50YWJzLnJlbW92ZSh0LmlkKSk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBQ0EsTUFBSSxlQUFlO0FBQ25CLE1BQUksV0FBVztBQUNmLE1BQUksUUFBUSxDQUFDO0FBQ2IsTUFBSSxtQkFBbUI7QUFDdkIsTUFBSSxvQkFBb0I7QUFDeEIsV0FBUyxVQUFVLFVBQVU7QUFDM0IsYUFBUyxRQUFRO0FBQUEsRUFDbkI7QUFDQSxXQUFTLG1CQUFtQjtBQUMxQix3QkFBb0I7QUFBQSxFQUN0QjtBQUNBLFdBQVMsb0JBQW9CO0FBQzNCLHdCQUFvQjtBQUNwQixlQUFXO0FBQUEsRUFDYjtBQUNBLFdBQVMsU0FBUyxLQUFLO0FBQ3JCLFFBQUksQ0FBQyxNQUFNLFNBQVMsR0FBRztBQUNyQixZQUFNLEtBQUssR0FBRztBQUNoQixlQUFXO0FBQUEsRUFDYjtBQUNBLFdBQVMsV0FBVyxLQUFLO0FBQ3ZCLFFBQUksUUFBUSxNQUFNLFFBQVEsR0FBRztBQUM3QixRQUFJLFVBQVUsTUFBTSxRQUFRO0FBQzFCLFlBQU0sT0FBTyxPQUFPLENBQUM7QUFBQSxFQUN6QjtBQUNBLFdBQVMsYUFBYTtBQUNwQixRQUFJLENBQUMsWUFBWSxDQUFDLGNBQWM7QUFDOUIsVUFBSTtBQUNGO0FBQ0YscUJBQWU7QUFDZixxQkFBZSxTQUFTO0FBQUEsSUFDMUI7QUFBQSxFQUNGO0FBQ0EsV0FBUyxZQUFZO0FBQ25CLG1CQUFlO0FBQ2YsZUFBVztBQUNYLGFBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxRQUFRLEtBQUs7QUFDckMsWUFBTSxDQUFDLEVBQUU7QUFDVCx5QkFBbUI7QUFBQSxJQUNyQjtBQUNBLFVBQU0sU0FBUztBQUNmLHVCQUFtQjtBQUNuQixlQUFXO0FBQUEsRUFDYjtBQUdBLE1BQUk7QUFDSixNQUFJO0FBQ0os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
