import Directives from "./directives";
const prefix = "v";
const selector = Object.keys(Directives).map(function(d) {
    return "[" + prefix + "-" + d + "]";
}).join();

let Seed = function(opts) {
    let self = this,
        el = document.getElementById(opts.id),
        els = el.querySelectorAll(selector),
        bindings = {};

    self.scope = {};
    els.forEach(processNode);
    Object.keys(opts.scope).forEach( function(key) {
        self.scope[key] = opts.scope[key];
    });

    function processNode(el) {
        [].forEach.call(el.attributes, function(attr) {
            let attrCopy = {
                name: attr.name,
                value: attr.value
            };
            let directive = parseDirective(attrCopy);
            directive && bindDirective(self, el, bindings, directive);
        })
    }
    function parseDirective(attr) {
        let arg = attr.name.slice(prefix.length + 1),
            key = attr.value,
            def = Directives[arg];
        return {
            attr: attr,
            key: key,
            def: def
        }
    }
    function bindDirective(self, el, bindings, directive) {
        el.removeAttribute(directive.attr.name);
        let key = directive.key;
        bindings[key] || (bindings[key] = {
            value: undefined,
            directive: '',
            els: []
        });
        bindings[key].directive = directive.def;
        bindings[key].els.push(el);

        if (!self.scope.hasOwnProperty(key)) {
            bindAccessors(self, key, bindings);
        }
    }
    function bindAccessors(self, key, bindings) {
        Object.defineProperty(self.scope, key, {
            get: function() {
                return bindings[key].value;
            },
            set: function(NewVal) {
                bindings[key].value = NewVal;
                bindings[key].els.forEach(function(el) {
                    bindings[key].directive(el, NewVal);
                });
            }
        })
    }
};
var app = new Seed({
    id: 'test',
    scope: {
        msg: 'hello',
        show: false
    }
});