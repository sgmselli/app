#!/bin/sh

echo "Starting Nginx web server..."

if [ "$ENVIRONMENT" = "development" ]; then
    cp /etc/nginx/development/nginx.conf /etc/nginx/nginx.conf
    cp /etc/nginx/conf.d/development/default.conf /etc/nginx/conf.d/default.conf
else
    cp /etc/nginx/production/nginx.conf /etc/nginx/nginx.conf
    cp /etc/nginx/conf.d/production/default.conf /etc/nginx/conf.d/default.conf
fi

# Prevent Nginx from reading both configs
rm -f /etc/nginx/development/nginx.conf /etc/nginx/production/nginx.conf
rm -f /etc/nginx/conf.d/development/default.conf /etc/nginx/conf.d/production/default.conf

exec nginx -g 'daemon off;'