# --- ビルド環境 ---
FROM node:18-alpine as build-stage

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci

# ソースコードをコピーしてビルド
COPY . .
RUN npm run build

# --- 本番環境 (Nginx) ---
FROM nginx:alpine as production-stage

# ビルドした成果物（distフォルダ）をNginxの公開フォルダにコピー
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 作成したnginx設定ファイルをコピー
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run はポート8080を期待するので指定
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]