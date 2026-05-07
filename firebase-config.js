/**
 * StickyBoard Firebase 配置
 *
 * 创建步骤：
 * 1. 打开 https://console.firebase.google.com → 新建项目
 * 2. 左侧 Authentication → 登录方式 → 启用 Google
 * 3. Authentication → Settings → 授权网域 → 添加 kanewangcs.github.io
 * 4. 左侧 Firestore Database → 创建数据库（生产模式）
 *    规则改为：
 *      match /users/{uid} {
 *        allow read, write: if request.auth.uid == uid;
 *      }
 * 5. 项目设置 → 你的应用 → 添加 Web 应用 → 复制 firebaseConfig 填到下方
 */
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
