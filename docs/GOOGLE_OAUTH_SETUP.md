# Google OAuth セットアップ手順

## 前提
- コード側は完全対応済み（login/register/callback/server action）
- 以下はダッシュボード操作のみ

---

## 1. Google Cloud Console

### 1-1. プロジェクト作成
1. https://console.cloud.google.com/ にアクセス
2. 新しいプロジェクト作成（名前: `quest-app`）

### 1-2. OAuth同意画面
1. APIs & Services > OAuth consent screen
2. User Type: **External**
3. App name: `Quest App`
4. User support email: 自分のメール
5. Authorized domains: `quest-app-eight.vercel.app`
6. Developer contact: 自分のメール
7. Scopes: `email`, `profile`, `openid`
8. Test users: 自分のメール（本番公開前はテストモード）

### 1-3. OAuth 2.0 クライアント作成
1. APIs & Services > Credentials > Create Credentials > OAuth client ID
2. Application type: **Web application**
3. Name: `Quest App Web`
4. Authorized JavaScript origins:
   - `https://quest-app-eight.vercel.app`
   - `http://localhost:3000`
5. Authorized redirect URIs:
   - `https://yabrrdonqlttzwrfpqdu.supabase.co/auth/v1/callback`
6. **Client ID** と **Client Secret** をコピー

---

## 2. Supabase Dashboard

1. https://supabase.com/dashboard/project/yabrrdonqlttzwrfpqdu/auth/providers にアクセス
2. **Google** プロバイダを展開
3. **Enable Google provider** をON
4. Client ID: Google Cloud Consoleでコピーした値
5. Client Secret: Google Cloud Consoleでコピーした値
6. **Save**

---

## 3. 動作確認

```bash
npm run dev
# http://localhost:3000/login にアクセス
# 「Googleでログイン」ボタンをクリック
# Google認証画面 → 同意 → コールバック → ホーム画面
```

---

## コード対応状況

| ファイル | 状態 |
|---------|------|
| `src/features/auth/actions/index.ts` (`signInWithGoogle`) | 対応済み |
| `src/app/(auth)/login/page.tsx` (Googleボタン) | 対応済み |
| `src/app/(auth)/register/page.tsx` (Googleボタン) | 対応済み |
| `src/app/auth/callback/route.ts` (コールバック) | 対応済み |
