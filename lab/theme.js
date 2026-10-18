/* Dark/light for the lab pages, sharing the home page's "theme" localStorage
   key so a choice made on either side survives the crossing.

   Loaded from <head> rather than the end of the body: the attribute has to be
   on <html> before the first paint or a visitor who picked light gets a frame
   of dark on the way in. The button wiring waits for the DOM; only the
   attribute is urgent.

   The 3D viewer already watches data-theme and re-reads the palette off the
   CSS variables, so the models follow without this file knowing about them. */
(function () {
    const KEY = 'theme';
    const root = document.documentElement;
    root.setAttribute('data-theme', localStorage.getItem(KEY) || 'dark');

    function paintIcon() {
        const icon = document.querySelector('.theme-icon');
        if (icon) icon.textContent = root.getAttribute('data-theme') === 'light' ? '☀️' : '🌙';
    }

    addEventListener('DOMContentLoaded', function () {
        const btn = document.querySelector('.theme-toggle');
        if (btn) {
            btn.addEventListener('click', function () {
                const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                root.setAttribute('data-theme', next);
                localStorage.setItem(KEY, next);
                paintIcon();
            });
        }
        paintIcon();
    });
})();
