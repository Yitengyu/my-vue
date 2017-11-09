import Directives from "./directives";
import Filters from "./filters";
const prefix = "v";
const selector = Object.keys(Directives).map(function(d) {
    return "[" + prefix + "-" + d + "]";
}).join();

let Seed = function(opts) {
    let self = this,
        el = document.getElementById(opts.id), //Seed element
        els = el.querySelectorAll(selector),  //elements with v attribute
        bindings = {};  //key => array(directives)

    self.scope = {};    //data scope
    els.forEach(processNode);
    Object.keys(opts.scope).forEach( function(key) {
        self.scope[key] = opts.scope[key];
    });

    function processNode(el) {
        cloneAttributes(el.attributes).forEach(function(attr) {
            let directive = parseDirective(attr);
            directive && bindDirective(self, el, bindings, directive);
        })
    }
    function cloneAttributes(attributes) {
        return [].map.call(attributes, function(attr) {
            return {
                name: attr.name,
                value: attr.value
            };
        });
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
            directives: []
        });
        directive.el = el;
        binding.directives.push(directive);

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
                binding.directives.forEach(function (directive) {
                   let value = applyFilters(directive.filters, newVal);
                   directive.def(directive.el, value);
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