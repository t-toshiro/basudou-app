// src/components/AdminView.jsx
import { useState } from "react";
import styles from "../utils/styles";

export default function AdminView({
  practices,
  currentPractice,
  setSelectedPracticeId,
  addPractice,
  deletePractice,
  generateTeams,
}) {
  const [newDate, setNewDate] = useState("");
  const [numTeams, setNumTeams] = useState(2);

  // currentPracticeがない時（データが0件の時）にエラーにならないよう安全に計算
  const attendingCount = currentPractice
    ? currentPractice.attendance.filter((m) => m.attending).length
    : 0;
  const arrivedCount = currentPractice
    ? currentPractice.attendance.filter((m) => m.arrived).length
    : 0;

  return (
    <div style={styles.page}>
      <div style={styles.sectionTitle}>⚙️ 管理者パネル</div>

      {/* ==========================================
          常に表示するエリア（練習日の追加）
          ========================================== */}
      <div style={styles.adminCard}>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          新しい練習日を追加
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            type="date"
            style={styles.dateInput}
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <button
            style={{
              ...styles.smBtn,
              background: "#1E90FF",
              color: "#fff",
              padding: "0 16px",
            }}
            onClick={() => {
              addPractice(newDate);
              setNewDate("");
            }}
          >
            ＋ 追加
          </button>
        </div>

        {/* 練習日が1件以上ある場合のみ「選択プルダウン」を表示 */}
        {practices && practices.length > 0 && (
          <>
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
              管理する練習日を選択
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <select
                style={styles.selectBox}
                value={currentPractice ? currentPractice.id : ""}
                onChange={(e) => setSelectedPracticeId(e.target.value)}
              >
                {practices.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.date} の練習データ
                  </option>
                ))}
              </select>
              <button
                style={{
                  ...styles.smBtn,
                  background: "#FF4757",
                  color: "#fff",
                  padding: "0 12px",
                }}
                onClick={() => deletePractice(currentPractice?.id)}
                disabled={!currentPractice}
              >
                🗑 削除
              </button>
            </div>
          </>
        )}
      </div>

      {/* ==========================================
          練習日が選択されている時だけ表示するエリア（チーム分け）
          ========================================== */}
      {currentPractice ? (
        <>
          <div style={styles.adminCard}>
            <div style={styles.adminRow}>
              <div style={styles.adminStat}>
                <span style={styles.adminStatNum}>{attendingCount}</span>
                <span style={styles.adminStatLabel}>出席</span>
              </div>
              <div style={styles.adminStat}>
                <span style={{ ...styles.adminStatNum, color: "#2ED573" }}>
                  {arrivedCount}
                </span>
                <span style={styles.adminStatLabel}>到着</span>
              </div>
            </div>

            <div style={styles.teamInputRow}>
              <label style={styles.teamLabel}>チーム数</label>
              <div style={styles.teamCounter}>
                <button
                  className="counter-btn"
                  style={styles.counterBtn}
                  onClick={() => setNumTeams(Math.max(2, numTeams - 1))}
                >
                  <span className="counter-btn-char">−</span>
                </button>
                <span style={styles.counterNum}>{numTeams}</span>
                <button
                  className="counter-btn"
                  style={styles.counterBtn}
                  onClick={() => setNumTeams(Math.min(8, numTeams + 1))}
                >
                  <span className="counter-btn-char">＋</span>
                </button>
              </div>
            </div>

            <button
              style={{
                ...styles.generateBtn,
                opacity: arrivedCount >= numTeams ? 1 : 0.4,
                cursor: arrivedCount >= numTeams ? "pointer" : "not-allowed",
              }}
              onClick={() => generateTeams(numTeams)}
              disabled={arrivedCount < numTeams}
            >
              🏀 チームを自動振り分け
            </button>
          </div>

          {/* チーム結果表示 */}
          {currentPractice.teamsGenerated &&
            currentPractice.teams &&
            currentPractice.teams.length > 0 && (
              <div>
                <div style={{ ...styles.sectionTitle, marginTop: 24 }}>
                  チーム結果
                </div>
                <div style={styles.teamsGrid}>
                  {currentPractice.teams.map((team) => (
                    <div
                      key={team.id}
                      style={{
                        ...styles.teamCard,
                        borderTop: `4px solid ${team.color.bg}`,
                      }}
                    >
                      <div
                        style={{
                          ...styles.teamCardTitle,
                          color: team.color.bg,
                        }}
                      >
                        {team.color.name}チーム
                      </div>
                      <div style={styles.teamMembers}>
                        {team.members.map((m) => (
                          <div key={m.id} style={styles.teamMemberRow}>
                            <span style={styles.teamMemberName}>{m.name}</span>
                            <span
                              style={{
                                ...styles.posBadge,
                                background:
                                  m.position === "front"
                                    ? "#FF475720"
                                    : "#1E90FF20",
                                color:
                                  m.position === "front"
                                    ? "#FF4757"
                                    : "#1E90FF",
                              }}
                            >
                              {m.position === "front" ? "F" : "B"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </>
      ) : (
        <div
          style={{
            ...styles.adminCard,
            textAlign: "center",
            color: "#888",
            padding: "32px 16px",
          }}
        >
          まだ練習日が登録されていません。
          <br />
          上のフォームから新しい練習日を追加してください。
        </div>
      )}
    </div>
  );
}
