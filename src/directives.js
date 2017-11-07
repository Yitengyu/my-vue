module.exports = {
    text: function(el, value) {
        el.textContent = value || '';
    },
    show: function(el, value) {
        el.style.display = value ? "" : "none";
    }
};