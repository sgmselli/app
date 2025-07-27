# ---- Build React App ----
FROM node:24 as build

WORKDIR /frontend

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Serve with Nginx ----
FROM nginx:1.29.0-alpine

# Create non-root user
# RUN adduser -D myuser

# Copy custom Nginx config
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy the build output from React
COPY --from=build ./frontend/build /usr/share/nginx/html

# RUN chown -R myuser:myuser /usr/share/nginx/html /var/cache/nginx /var/run/nginx
# USER myuser

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]