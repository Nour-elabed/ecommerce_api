# Use official Node.js LTS (Long Term Support) image on Alpine Linux for a tiny footprint
FROM node:22-alpine
# Set the working directory inside the container to isolate our app code
WORKDIR /usr/src/app

# Copy dependency manifests first to leverage Docker's layer caching mechanism
COPY package*.json ./

# Install npm dependencies (both dependencies and devDependencies so nodemon is available)
RUN npm install

# Copy all remaining source files from our project into the container
COPY . .

# Inform Docker that the container listens on port 5000 at runtime
EXPOSE 5000

# Execute the start script (which runs nodemon for hot-reloading)
CMD ["npm", "start"]
