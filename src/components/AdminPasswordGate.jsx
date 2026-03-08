import { useState } from "react";
import styles from "../utils/styles";

// 環境変数 REACT_APP_ADMIN_PASSWORD が未設定の場合は開発用のデフォルト（本番では必ず .env で設定すること）
const EXPECTED_PASSWORD = 
  process.env.REACT_APP_ADMIN_PASSWORD || "admin";

export default function AdminPasswordGate({ onSuccess, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (password.trim() === "") {
      setError("パスワードを入力してください");
      return;
    }
    if (password !== EXPECTED_PASSWORD) {
      setError("パスワードが正しくありません");
      setPassword("");
      return;
    }
    onSuccess();
  };

  return (
    <div style={styles.page}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "32px 24px",
          maxWidth: 360,
          margin: "40px auto 0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            ...styles.sectionTitle,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          管理者パスワード
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#666",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          管理者画面を開くにはパスワードを入力してください。
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="パスワード"
            autoFocus
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: 15,
              border: `2px solid ${error ? "#FF4757" : "#e0e0e0"}`,
              borderRadius: 10,
              outline: "none",
              boxSizing: "border-box",
              marginBottom: error ? 8 : 16,
            }}
          />
          {error && (
            <p
              style={{
                fontSize: 12,
                color: "#FF4757",
                marginBottom: 12,
              }}
            >
              {error}
            </p>
          )}
            <button
              type="submit"
              style={{
                ...styles.smBtn,
                textAlign: "center",
                width: "100%",
                flex: 1,
                background: "#FF4757",
                color: "#fff",
              }}
            >
              開く
            </button>
        </form>
      </div>
    </div>
  );
}
