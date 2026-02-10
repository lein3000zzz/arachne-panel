const themeToggle = document.getElementById('themeToggle');
const themeToggleState = document.getElementById('themeToggleState');
const root = document.documentElement;
const sidebarToggle = document.getElementById('sidebarToggle');
const appRoot = document.getElementById('appRoot');

function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
    if (themeToggleState) {
        themeToggleState.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
}

function getInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

if (themeToggle) {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    themeToggle.addEventListener('click', function () {
        const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', nextTheme);
        applyTheme(nextTheme);
    });
}

function updateSidebarState(isExpanded) {
    if (!appRoot) {
        return;
    }
    appRoot.classList.toggle('is-collapsed', !isExpanded);
    if (sidebarToggle) {
        sidebarToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        sidebarToggle.textContent = isExpanded ? 'Menu' : 'Show Menu';
    }
}

if (sidebarToggle) {
    updateSidebarState(true);
    sidebarToggle.addEventListener('click', function () {
        const isExpanded = !appRoot.classList.contains('is-collapsed');
        updateSidebarState(!isExpanded);
    });
}

document.getElementById('runForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const run = {
        // самый величайший костыль, который я обязательно поправлю потом с добавлением жвт токенов (когда-то)
        // нужен, чтобы не дублировались id, и распределенный семафор в редисе работал адекватно
        id: document.getElementById('id').value + Date.now() + Math.random().toString(36).substring(2, 9),
        start_url: document.getElementById('start_url').value,
        max_depth: parseInt(document.getElementById('max_depth').value),
        max_links: parseInt(document.getElementById('max_links').value),
        use_cache_flag: document.getElementById('use_cache_flag').checked,
        extra_flags: {
            should_screenshot: document.getElementById('should_screenshot').checked,
            parse_rendered_html: document.getElementById('parse_rendered_html').checked
        }
    };

    console.log('Run data:', run);

    fetch('/api/runs/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(run) })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch(error => console.error('Error:', error));

});
