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
COPY ./nginx/development/default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx/production/default.conf /etc/nginx/conf.d/default.conf

# Copy the build output from React
COPY --from=build ./frontend/build /usr/share/nginx/html

COPY run.sh /run.sh
RUN chmod +x /run.sh

EXPOSE 80

ENTRYPOINT ["./run.sh"]