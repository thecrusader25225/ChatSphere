# Base image for building the application
FROM node:16-alpine AS build

# Setting the working directory
WORKDIR /app

# Copying the package files and configuration files
COPY package.json package-lock.json tailwind.config.js vite.config.js firebase-config.js postcss.config.js eslint.config.js ./

# Install dependencies (including devDependencies)
RUN npm install

# Copying the rest of the application files
COPY . .

# Building the static files
RUN npm run build

# Production image using Nginx
FROM nginx:alpine

# Copying built files to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposing container port
EXPOSE 80

# Running Nginx server
CMD ["nginx", "-g", "daemon off;"]
