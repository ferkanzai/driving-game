FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install serve globally
RUN npm install -g serve

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Expose port (default is 3000 for serve)
EXPOSE 3000

# Start the server
CMD ["serve", "-s", "dist", "-l", "3000"]