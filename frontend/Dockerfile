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

# Copy custom Nginx conf
COPY ./nginx/development/nginx.conf /etc/nginx/development/nginx.conf
COPY ./nginx/production/nginx.conf /etc/nginx/production/nginx.conf
COPY ./nginx/development/default.conf /etc/nginx/conf.d/development/default.conf
COPY ./nginx/production/default.conf /etc/nginx/conf.d/production/default.conf

# Copy the build output from React
COPY --from=build ./frontend/dist /usr/share/nginx/html

COPY run.sh /run.sh
RUN chmod +x /run.sh

EXPOSE 80

ENTRYPOINT ["./run.sh"]