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
