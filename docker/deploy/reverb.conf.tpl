; Reverb WebSocket server — copied into conf.d by entrypoint when START_REVERB=true.
[program:reverb]
command=/usr/local/bin/php __APP_DIR__/artisan reverb:start --host=0.0.0.0 --port=8080 --no-interaction
directory=__APP_DIR__
environment=HOME="__APP_DIR__"
autorestart=true
startretries=5
startsecs=2
redirect_stderr=true
stdout_logfile=/dev/fd/1
stdout_logfile_maxbytes=0