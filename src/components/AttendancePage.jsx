import styles from "../utils/styles";

/**
 * 出席・到着入力ページ
 * 選択した練習日で、メンバーの出席・到着を入力する
 */
export default function AttendancePage({
  currentPractice,
  setHomeStep,
  toggleAttend,
  toggleArrived,
}) {
  if (!currentPractice)
    return (
      <div style={styles.page}>
        <div style={styles.heroSection}>
          <h1 style={styles.heroTitle}>練習日がありません。</h1>
          <p style={styles.heroSub}>管理者に連絡してください。</p>
        </div>
      </div>
    );

  const attendingCount = currentPractice.attendance.filter(
    (m) => m.attending,
  ).length;
  const arrivedCount = currentPractice.attendance.filter(
    (m) => m.arrived,
  ).length;
  const totalCount = currentPractice.attendance.length;

  return (
    <div style={styles.page}>
      <style dangerouslySetInnerHTML={{ __html: styles.backBtnHoverCSS }} />
      <button
        className="back-btn"
        style={styles.backBtn}
        onClick={() => setHomeStep("selectDate")}
        type="button"
      >
        <span style={styles.backBtnIcon}>←</span>
        戻る
      </button>
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>
          今日の練習、
          <br />
          準備はいい？
        </h1>
        <p style={styles.heroSub}>📅 {currentPractice.date}</p>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNum}>{attendingCount}</div>
          <div style={styles.statLabel}>出席予定</div>
        </div>
        <div style={styles.statDivider}>/</div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: "#2ED573" }}>
            {arrivedCount}
          </div>
          <div style={styles.statLabel}>到着済み</div>
        </div>
        <div style={styles.statDivider}>/</div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statNum, color: "#888" }}>{totalCount}</div>
          <div style={styles.statLabel}>総メンバー</div>
        </div>
      </div>

      <div style={styles.sectionTitle}>📋 出欠・到着確認</div>
      <div style={styles.memberGrid}>
        {currentPractice.attendance.map((m) => (
          <div
            key={m.id}
            style={{
              ...styles.memberCard,
              ...(m.arrived
                ? styles.memberCardArrived
                : m.attending
                  ? styles.memberCardAttending
                  : {}),
            }}
          >
            <div style={styles.memberName}>{m.name}</div>
            <div style={styles.memberPos}>
              <span
                style={{
                  ...styles.posBadge,
                  background:
                    m.position === "front" ? "#FF475720" : "#1E90FF20",
                  color: m.position === "front" ? "#FF4757" : "#1E90FF",
                }}
              >
                {m.position === "front" ? "F" : "B"}
              </span>
            </div>
            <div style={styles.memberBtns}>
              <button
                style={{
                  ...styles.smBtn,
                  background: m.attending ? "#FF4757" : "#f0f0f0",
                  color: m.attending ? "#fff" : "#555",
                }}
                onClick={() => toggleAttend(m.id)}
              >
                {m.attending ? "出席✓" : "出席"}
              </button>
              <button
                style={{
                  ...styles.smBtn,
                  background: m.arrived ? "#2ED573" : "#f0f0f0",
                  color: m.arrived ? "#fff" : "#555",
                  opacity: m.attending ? 1 : 0.35,
                  cursor: m.attending ? "pointer" : "not-allowed",
                }}
                onClick={() => toggleArrived(m.id)}
              >
                {m.arrived ? "到着✓" : "到着"}
              </button>
            </div>
            {currentPractice.teamsGenerated && m.team && (
              <div
                style={{
                  ...styles.teamBadge,
                  background:
                    currentPractice.teams.find((t) => t.id === m.team)?.color
                      .bg || "#ccc",
                }}
              >
                {currentPractice.teams.find((t) => t.id === m.team)?.color.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
