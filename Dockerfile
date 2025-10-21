# Official node
FROM node:22-alpine

# Working directory inside container
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your code
COPY . .

# Run the bot
CMD ["node", "index.js"]