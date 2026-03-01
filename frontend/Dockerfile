FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Build the Next.js application
RUN npm run build

EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]