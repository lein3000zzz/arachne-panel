const themeToggle = document.getElementById('themeToggle');
const themeToggleState = document.getElementById('themeToggleState');
const root = document.documentElement;
const sidebarToggle = document.getElementById('sidebarToggle');
const appRoot = document.getElementById('appRoot');
const authOpenBtn = document.getElementById('authOpenBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userStatus = document.getElementById('userStatus');
const statusMessage = document.getElementById('statusMessage');
const healthStatus = document.getElementById('healthStatus');
const authModal = document.getElementById('authModal');
const authCloseBtn = document.getElementById('authCloseBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const pageLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const historyTableBody = document.getElementById('historyTableBody');
const historyMeta = document.getElementById('historyMeta');
const historyEmpty = document.getElementById('historyEmpty');
const historyLocked = document.getElementById('historyLocked');
const historyTableWrap = document.getElementById('historyTableWrap');
const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
const loadMoreHistoryBtn = document.getElementById('loadMoreHistoryBtn');
const historySignInBtn = document.getElementById('historySignInBtn');
const historyNavLink = document.querySelector('[data-auth-required="true"]');

const state = {
    user: null,
    sessionId: null,
    historyOffset: 0,
    historyLimit: 10,
    pendingRoute: null,
    statusTimeout: null,
};

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

function showStatus(message, isError = false) {
    if (!statusMessage) {
        return;
    }
    statusMessage.textContent = message;
    statusMessage.style.borderColor = isError ? 'var(--accent)' : 'var(--border)';
    statusMessage.style.color = isError ? 'var(--accent-strong)' : 'var(--text)';
    statusMessage.classList.add('is-visible');
    if (state.statusTimeout) {
        clearTimeout(state.statusTimeout);
    }
    state.statusTimeout = setTimeout(() => {
        statusMessage.classList.remove('is-visible');
    }, 3000);
}

function updateAuthUI() {
    const signedIn = Boolean(state.user);
    if (userStatus) {
        userStatus.textContent = signedIn ? `Signed in as ${state.user.username}` : 'Signed out';
    }

    if (authOpenBtn) {
        authOpenBtn.classList.toggle('is-hidden', signedIn);
    }

    if (logoutBtn) {
        logoutBtn.classList.toggle('is-hidden', !signedIn);
    }

    if (historyNavLink) {
        historyNavLink.classList.toggle('is-hidden', !signedIn);
    }
}

function setAuthMode(mode) {
    tabButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (authModal) {
        const title = authModal.querySelector('#authModalTitle');
        if (title) {
            title.textContent = mode === 'login' ? 'Sign in' : 'Create account';
        }
    }

    if (loginForm && registerForm) {
        loginForm.classList.toggle('is-hidden', mode !== 'login');
        registerForm.classList.toggle('is-hidden', mode !== 'register');
    }
}

function openAuthModal(mode = 'login') {
    if (!authModal) {
        return;
    }
    setAuthMode(mode);
    authModal.classList.remove('is-hidden');
}

function closeAuthModal() {
    if (!authModal) {
        return;
    }
    authModal.classList.add('is-hidden');
}

async function apiRequest(path, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    if (state.sessionId) {
        headers['Authorization'] = `Bearer ${state.sessionId}`;
    }

    const response = await fetch(path, {
        credentials: 'same-origin',
        ...options,
        headers,
    });

    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        data = await response.json();
    }

    if (!response.ok) {
        const error = new Error(data?.error || data?.message || 'Request failed');
        error.status = response.status;
        error.payload = data;
        throw error;
    }

    return data;
}

async function checkHealth() {
    try {
        await apiRequest('/api/health');
        if (healthStatus) {
            healthStatus.textContent = 'API: Healthy';
        }
    } catch (error) {
        if (healthStatus) {
            healthStatus.textContent = 'API: Unavailable';
        }
    }
}

async function loadSession() {
    try {
        const data = await apiRequest('/api/sessions/me');
        state.user = data.user;
        updateAuthUI();
    } catch (error) {
        state.user = null;
        updateAuthUI();
    }
}

async function login(payload) {
    const data = await apiRequest('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    state.user = data.user;
    state.sessionId = data.sessionId;
    updateAuthUI();
    showStatus('Signed in successfully.');
    closeAuthModal();
    if (state.pendingRoute) {
        navigate(state.pendingRoute);
        state.pendingRoute = null;
    }
}

async function register(payload) {
    await apiRequest('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    showStatus('Account created. Please sign in.', false);
    setAuthMode('login');
}

async function logout() {
    try {
        await apiRequest('/api/sessions/logout', { method: 'POST' });
    } catch (error) {
        // Continue logout even if server rejects.
    }
    state.user = null;
    state.sessionId = null;
    updateAuthUI();
    showStatus('Signed out.');
    navigate('send');
}

function renderHistoryRows(runs, isReset) {
    if (!historyTableBody) {
        return;
    }
    if (isReset) {
        historyTableBody.innerHTML = '';
    }

    runs.forEach((run) => {
        const row = document.createElement('tr');
        const cfg = run.config || run;
        const flags = [];
        if (cfg.extra_flags?.should_screenshot) {
            flags.push('Screenshot');
        }
        if (cfg.extra_flags?.parse_rendered_html) {
            flags.push('Rendered HTML');
        }
        row.innerHTML = `
            <td>${run.id}</td>
            <td><span class="status-badge status-${run.status || 'queued'}">${run.status || 'queued'}</span></td>
            <td>${cfg.start_url ?? '-'}</td>
            <td>${cfg.max_depth ?? '-'}</td>
            <td>${cfg.max_links ?? '-'}</td>
            <td>${cfg.use_cache_flag ? 'Yes' : 'No'}</td>
            <td>${flags.length ? flags.join(', ') : 'None'}</td>
        `;
        historyTableBody.appendChild(row);
    });
}

async function loadHistory(isReset = false) {
    if (!state.user) {
        toggleHistoryLocked(true);
        return;
    }

    if (isReset) {
        state.historyOffset = 0;
    }

    const params = new URLSearchParams({
        offset: String(state.historyOffset),
        limit: String(state.historyLimit),
    });

    try {
        const data = await apiRequest(`/api/runs/history?${params.toString()}`);
        const runs = Array.isArray(data.data) ? data.data : [];
        renderHistoryRows(runs, isReset);
        state.historyOffset += runs.length;
        updateHistoryMeta();
        toggleHistoryLocked(false);
        toggleHistoryEmpty(runs.length === 0 && state.historyOffset === 0);
    } catch (error) {
        if (error.status === 401) {
            state.user = null;
            updateAuthUI();
            toggleHistoryLocked(true);
        }
        showStatus(error.message || 'Failed to load history.', true);
    }
}

function updateHistoryMeta() {
    if (!historyMeta) {
        return;
    }
    historyMeta.textContent = `Loaded ${state.historyOffset} runs`;
}

function toggleHistoryEmpty(show) {
    if (historyEmpty) {
        historyEmpty.classList.toggle('is-hidden', !show);
    }
    if (historyTableWrap) {
        historyTableWrap.classList.toggle('is-hidden', show);
    }
}

function toggleHistoryLocked(show) {
    if (historyLocked) {
        historyLocked.classList.toggle('is-hidden', !show);
    }
    if (historyTableWrap) {
        historyTableWrap.classList.toggle('is-hidden', show);
    }
}

function setActivePage(route) {
    pages.forEach((page) => {
        page.classList.toggle('is-hidden', page.dataset.page !== route);
    });

    pageLinks.forEach((link) => {
        const isActive = link.dataset.route === route;
        link.classList.toggle('active', isActive);
        if (isActive) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

function navigate(route) {
    window.location.hash = route;
}

function handleRouteChange() {
    const route = window.location.hash.replace('#', '') || 'send';
    if (route === 'history' && !state.user) {
        state.pendingRoute = 'history';
        openAuthModal('login');
        setActivePage('send');
        showStatus('Sign in to access runs history.', true);
        return;
    }

    setActivePage(route);
    if (route === 'history') {
        loadHistory(true);
    }
}

if (authOpenBtn) {
    authOpenBtn.addEventListener('click', () => openAuthModal('login'));
    authOpenBtn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openAuthModal('login');
        }
    });
}

document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }
    const authTrigger = target.closest('[data-auth-open]');
    if (authTrigger) {
        event.preventDefault();
        const mode = authTrigger.getAttribute('data-auth-open') || 'login';
        openAuthModal(mode);
    }
});

if (authCloseBtn) {
    authCloseBtn.addEventListener('click', closeAuthModal);
}
if (authModal) {
    authModal.addEventListener('click', (event) => {
        if (event.target === authModal) {
            closeAuthModal();
        }
    });
}

if (tabButtons) {
    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => setAuthMode(btn.dataset.mode));
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
            username: document.getElementById('loginUsername').value.trim(),
            password: document.getElementById('loginPassword').value,
        };
        try {
            await login(payload);
        } catch (error) {
            showStatus(error.message || 'Login failed.', true);
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
            username: document.getElementById('registerUsername').value.trim(),
            password: document.getElementById('registerPassword').value,
        };
        try {
            await register(payload);
        } catch (error) {
            showStatus(error.message || 'Registration failed.', true);
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}
if (historySignInBtn) {
    historySignInBtn.addEventListener('click', () => openAuthModal('login'));
}
if (refreshHistoryBtn) {
    refreshHistoryBtn.addEventListener('click', () => loadHistory(true));
}
if (loadMoreHistoryBtn) {
    loadMoreHistoryBtn.addEventListener('click', () => loadHistory(false));
}

window.addEventListener('hashchange', handleRouteChange);

const runForm = document.getElementById('runForm');
if (runForm) {
    runForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const run = {
            start_url: document.getElementById('start_url').value,
            max_depth: parseInt(document.getElementById('max_depth').value),
            max_links: parseInt(document.getElementById('max_links').value),
            use_cache_flag: document.getElementById('use_cache_flag').checked,
            extra_flags: {
                should_screenshot: document.getElementById('should_screenshot').checked,
                parse_rendered_html: document.getElementById('parse_rendered_html').checked,
            },
        };

        try {
            await apiRequest('/api/runs/send', {
                method: 'POST',
                body: JSON.stringify(run),
            });
            showStatus('Run sent to Kafka.');
            runForm.reset();
        } catch (error) {
            if (error.status === 401) {
                state.pendingRoute = 'send';
                openAuthModal('login');
                showStatus('Sign in to send a run.', true);
                return;
            }
            showStatus(error.message || 'Failed to send run.', true);
        }
    });
}

checkHealth();
loadSession().finally(handleRouteChange);
