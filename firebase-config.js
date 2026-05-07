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
  apiKey: "AIzaSyAv51MvQfh9PpzeVaYSZTc_yN_zhgGVlHs",
  authDomain: "stickyboard-e0086.firebaseapp.com",
  projectId: "stickyboard-e0086",
  storageBucket: "stickyboard-e0086.firebasestorage.app",
  messagingSenderId: "1003564403931",
  appId: "1:1003564403931:web:98be48c3fe90a8e1ec10fe",
  measurementId: "G-V31H6RXE7W"
};
