# Node.js 22 مطلوب لدعم node:sqlite المدمجة (لا حاجة لأي مكتبة خارجية
# أو أدوات بناء C++ بعد الآن - هذا يحل مشاكل التوافق بين معماريات المعالج
# المختلفة نهائيًا)
FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
