import styles from "../utils/styles";

/**
 * 練習日選択ページ
 * どの練習日の出席・到着を入力するか選ぶ
 */
export default function PracticeSelectPage({
  practices,
  setSelectedPracticeId,
  setHomeStep,
}) {
  if (!practices || practices.length === 0)
    return (
      <div style={styles.page}>
        <div style={styles.heroSection}>
          <h1 style={styles.heroTitle}>練習日がありません。</h1>
          <p style={styles.heroSub}>
            管理者に練習日を追加してもらってください。
          </p>
        </div>
      </div>
    );

  const goToAttendance = (practiceId) => {
    setSelectedPracticeId(practiceId);
    setHomeStep("attendance");
  };

  return (
    <div style={styles.page}>
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>
          どの練習日の
          <br />
          出席・到着を入力する？
        </h1>
        <p style={styles.heroSub}>
          練習日を選んでから、出席と到着を入力できます。
        </p>
      </div>

      <div style={styles.sectionTitle}>📅 練習日を選択</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {practices.map((p) => {
          const attending = p.attendance.filter((m) => m.attending).length;
          const arrived = p.attendance.filter((m) => m.arrived).length;
          return (
            <div
              key={p.id}
              style={{
                ...styles.adminCard,
                cursor: "pointer",
                border: "2px solid transparent",
                transition: "all 0.2s",
              }}
              onClick={() => goToAttendance(p.id)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}
                  >
                    {p.date}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#888",
                    }}
                  >
                    出席 {attending} / 到着 {arrived} / {p.attendance.length}名
                  </div>
                </div>
                <button
                  style={{
                    ...styles.smBtn,
                    background: "#FF4757",
                    color: "#fff",
                    padding: "10px 18px",
                    fontSize: 13,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToAttendance(p.id);
                  }}
                >
                  出席・到着を入力 →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
