/*! Drake.css framework 0.1.1 | MIT License | based on UIkit, (c) 2014 - 2026 YOOtheme (https://getuikit.com) */

import { noop, toArray, trigger, matches, removeClass, addClass, on, assign } from './../drake-util.esm.js';

for (const key of [
  "events",
  "watch",
  "observe",
  "created",
  "beforeConnect",
  "connected",
  "beforeDisconnect",
  "disconnected",
  "destroy"
]) {
}
function defineComponent(options) {
  return ((component) => component);
}
function defineMixin(options) {
  return ((mixin) => mixin);
}

var I18n = defineMixin()({
  props: {
    i18n: Object
  },
  data: {
    i18n: null
  },
  methods: {
    t(key, ...params) {
      var _a, _b, _c;
      let i = 0;
      return ((_c = ((_a = this.i18n) == null ? void 0 : _a[key]) || ((_b = this.$options.i18n) == null ? void 0 : _b[key])) == null ? void 0 : _c.replace(
        /%s/g,
        () => params[i++] || ""
      )) || "";
    }
  }
});

var Component = defineComponent()({
  mixins: [I18n],
  i18n: {
    invalidMime: "Invalid File Type: %s",
    invalidName: "Invalid File Name: %s",
    invalidSize: "Invalid File Size: %s Kilobytes Max"
  },
  props: {
    allow: String,
    clsDragover: String,
    concurrent: Number,
    maxSize: Number,
    method: String,
    mime: String,
    multiple: Boolean,
    name: String,
    params: Object,
    type: String,
    url: String
  },
  data: {
    allow: false,
    clsDragover: "drk-dragover",
    concurrent: 1,
    maxSize: 0,
    method: "POST",
    mime: false,
    multiple: false,
    name: "files[]",
    params: {},
    type: "",
    url: "",
    abort: noop,
    beforeAll: noop,
    beforeSend: noop,
    complete: noop,
    completeAll: noop,
    error: noop,
    fail: noop,
    load: noop,
    loadEnd: noop,
    loadStart: noop,
    progress: noop
  },
  events: [
    {
      name: "change",
      handler(e) {
        if (!(e.target instanceof HTMLInputElement) || !matches(e.target, 'input[type="file"]')) {
          return;
        }
        e.preventDefault();
        if (e.target.files) {
          this.upload(e.target.files);
        }
        e.target.value = "";
      }
    },
    {
      name: "drop",
      handler(e) {
        stop(e);
        const transfer = e instanceof DragEvent ? e.dataTransfer : null;
        if (!(transfer == null ? void 0 : transfer.files)) {
          return;
        }
        removeClass(this.$el, this.clsDragover);
        this.upload(transfer.files);
      }
    },
    {
      name: "dragenter",
      handler(e) {
        stop(e);
      }
    },
    {
      name: "dragover",
      handler(e) {
        stop(e);
        addClass(this.$el, this.clsDragover);
      }
    },
    {
      name: "dragleave",
      handler(e) {
        stop(e);
        removeClass(this.$el, this.clsDragover);
      }
    }
  ],
  methods: {
    async upload(files) {
      files = toArray(files);
      if (!files.length) {
        return;
      }
      if (!this.multiple) {
        files = files.slice(0, 1);
      }
      trigger(this.$el, "upload", [files]);
      for (const file of files) {
        if (this.maxSize && this.maxSize * 1e3 < file.size) {
          this.fail(this.t("invalidSize", String(this.maxSize)));
          return;
        }
        if (this.allow && !match(this.allow, file.name)) {
          this.fail(this.t("invalidName", this.allow));
          return;
        }
        if (this.mime && !match(this.mime, file.type)) {
          this.fail(this.t("invalidMime", this.mime));
          return;
        }
      }
      this.beforeAll(this, files);
      const chunks = chunk(files, this.concurrent);
      const upload = async (currentFiles) => {
        const data = new FormData();
        currentFiles.forEach((file) => data.append(this.name, file));
        for (const key in this.params) {
          const value = this.params[key];
          data.append(key, value instanceof Blob ? value : String(value));
        }
        try {
          const xhr = await ajax(this.url, {
            data,
            method: this.method,
            responseType: this.type,
            beforeSend: (env) => {
              const { xhr: xhr2 } = env;
              on(xhr2.upload, "progress", this.progress);
              for (const type of uploadEventNames) {
                on(xhr2, type.toLowerCase(), this[type]);
              }
              return this.beforeSend(env);
            }
          });
          this.complete(xhr);
          const nextChunk = chunks.shift();
          if (nextChunk) {
            await upload(nextChunk);
          } else {
            this.completeAll(xhr);
          }
        } catch (error) {
          if (!(error instanceof Error) || error.name !== "AbortError") {
            this.error(error);
          }
        }
      };
      const firstChunk = chunks.shift();
      if (firstChunk) {
        await upload(firstChunk);
      }
    }
  }
});
const uploadEventNames = ["loadStart", "load", "loadEnd", "abort"];
function match(pattern, path) {
  return path.match(
    new RegExp(
      `^${pattern.replace(/\//g, "\\/").replace(/\*\*/g, "(\\/[^\\/]+)*").replace(/\*/g, "[^\\/]+").replace(/((?!\\))\?/g, "$1.")}$`,
      "i"
    )
  );
}
function chunk(files, size) {
  const chunks = [];
  for (let i = 0; i < files.length; i += size) {
    chunks.push(files.slice(i, i + size));
  }
  return chunks;
}
function stop(e) {
  e.preventDefault();
  e.stopPropagation();
}
async function ajax(url, options) {
  const env = {
    url,
    headers: {},
    xhr: new XMLHttpRequest(),
    ...options
  };
  if (await env.beforeSend(env) === false) {
    throw abortError(env.xhr);
  }
  return send(env.url, env);
}
function send(url, env) {
  return new Promise((resolve, reject) => {
    const { xhr } = env;
    for (const prop in env) {
      if (prop in xhr) {
        try {
          Reflect.set(xhr, prop, Reflect.get(env, prop));
        } catch {
        }
      }
    }
    xhr.open(env.method.toUpperCase(), url);
    for (const header in env.headers) {
      const value = env.headers[header];
      if (value !== void 0) {
        xhr.setRequestHeader(header, value);
      }
    }
    on(xhr, "load", () => {
      if (xhr.status === 0 || xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
        resolve(xhr);
      } else {
        reject(
          assign(Error(xhr.statusText), {
            xhr,
            status: xhr.status
          })
        );
      }
    });
    on(xhr, "error", () => reject(assign(Error("Network Error"), { xhr })));
    on(xhr, "timeout", () => reject(assign(Error("Network Timeout"), { xhr })));
    on(xhr, "abort", () => reject(abortError(xhr)));
    xhr.send(env.data);
  });
}
function abortError(xhr) {
  return assign(Error("Network Abort"), { xhr, name: "AbortError" });
}

var name = 'upload';

if (typeof window !== "undefined" && window.Drake) {
  window.Drake.component(name, Component);
}

export { Component as default };
