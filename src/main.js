import Directives from "./directives";
import Filters from "./filters";
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
            def = Directives[arg];

        let exp = attr.value;
        const pipeIndex = exp.indexOf("|");
        let key = pipeIndex === -1
            ? exp
            : exp.slice(0, pipeIndex).trim();
        let filters = pipeIndex === -1
            ? null
            : exp.slice(pipeIndex + 1).split("|").map(function (filter) {
                return filter.trim();
            });

        return {
            attr: attr,
            key: key,
            def: def,
            filters: filters
        }
    }
    function bindDirective(self, el, bindings, directive) {
        el.removeAttribute(directive.attr.name);
        let key = directive.key;
        let binding = bindings[key]
            ? bindings[key]
            : (bindings[key] = {
            value: undefined,
            directive: '',
            els: [],
            filters: null
        });
        binding.directive = directive.def;
        binding.els.push(el);
        binding.filters = directive.filters;

        if (!self.scope.hasOwnProperty(key)) {
            bindAccessors(self, key, binding);
        }
    }
    function bindAccessors(self, key, binding) {
        Object.defineProperty(self.scope, key, {
            get: function() {
                return binding.value;
            },
            set: function(newVal) {
                binding.value = newVal;
                binding.els.forEach(function(el) {
                    let value = applyFilters(binding.filters, newVal);
                    binding.directive(el, value);
                });
            }
        })
    }
    function applyFilters(filters, value) {
        filters
        && filters.forEach(function(filter) {
            Filters[filter]
            && ( value = Filters[filter](value) );
        });
        return value;
    }
};
let app = new Seed({
    id: 'test',
    scope: {
        msg: 'hello',
        show: false
    }
});