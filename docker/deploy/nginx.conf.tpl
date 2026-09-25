server {
    listen __PORT__ default_server;
    listen [::]:__PORT__ default_server;
    server_name _;

    root /var/www/html/public;
    index index.php;

    charset utf-8;
    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        # Debian's fastcgi_params maps HTTP_HOST to $host, which drops the port.
        # Laravel then generates URLs without it and every asset/link breaks
        # whenever the app is served on a non-default port. Restore $http_host.
        fastcgi_param HTTP_HOST $http_host;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
