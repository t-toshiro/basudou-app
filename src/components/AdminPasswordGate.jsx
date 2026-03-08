import { useState } from "react";
import styles from "../utils/styles";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminPasswordGate({ onSuccess, onCancel }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.trim() === "") {
      setError("パスワードを入力してください");
      return;
    }

    setIsChecking(true);
    try {
      // 入力値をドキュメントIDとして admin_keys コレクションを参照
      const docRef = doc(db, "admin_keys", password.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        onSuccess();
        setPassword("");
      } else {
        setError("パスワードが違います");
        setPassword("");
      }
    } catch (err) {
      setError("パスワードが違います（または通信エラー）");
      setPassword("");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div style={styles.page}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "26px 24px",
          maxWidth: 360,
          minHeight: 160,
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
            marginBottom: 15,
            textAlign: "center",
          }}
        >
          管理者画面を開くにはパスワードを入力してください。
        </p>
        <form onSubmit={handleSubmit} >
          
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
              padding: "12px 10px",
              fontSize: 15,
              border: `2px solid ${error ? "#FF4757" : "#e0e0e0"}`,
              borderRadius: 10,
              outline: "none",
              boxSizing: "border-box",
              marginBottom: error ? 8 : 16,
            }}
          />
          {error && (
            <div
              style={{
                fontSize: 12,
                color: "#FF4757",
                marginBottom: 8,
              }}
            >
              {error}
            </div>
          )}
            <button
              type="submit"
              style={{
                ...styles.smBtn,
                display: "block", 
                margin: "0 auto",
                width: "100%",
                height: "100%",
                background: "#FF4757",
                color: "#fff",
              }}
            >
              {isChecking ? "確認中…" : "開く"}
            </button>
        </form>
      </div>
    </div>
  );
}
