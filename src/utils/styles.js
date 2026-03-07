const styles = {
  // ... (元々の styles の中身をここにすべて貼り付けます) ...
  // ※長すぎるため省略しますが、ご提示いただいた styles オブジェクトをそのまま置いてください。

  // 以下、練習日の選択UI用に追加するスタイル
  practiceSelectRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    background: "#fff",
    padding: "12px 16px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  dateInput: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  selectBox: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    flex: 1,
  },
};

export default styles;
