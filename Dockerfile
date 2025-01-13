# Use the official Node.js image as the base image
FROM node:23-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . ./

# Build the application for production
RUN npm run build

# Use a lightweight web server for serving the static files
FROM nginx:stable-alpine AS production

# Copy the build output to the Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port Nginx will run on
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]