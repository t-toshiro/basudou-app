import { useState } from "react";
import styles from "../utils/styles";
import { getMatchSchedule } from "../utils/data";

export default function AdminView({
  practices,
  currentPractice,
  setSelectedPracticeId,
  addPractice,
  generateTeams,
}) {
  const [newDate, setNewDate] = useState("");
  const [numTeams, setNumTeams] = useState(2);

  if (!currentPractice)
    return <div style={styles.page}>練習日がありません。</div>;

  const matchSchedule =
    currentPractice.teamsGenerated && currentPractice.teams.length >= 2
      ? getMatchSchedule(currentPractice.teams, 2)
      : [];

  const attendingCount = currentPractice.attendance.filter(
    (m) => m.attending,
  ).length;
  const arrivedCount = currentPractice.attendance.filter(
    (m) => m.arrived,
  ).length;

  return (
    <div style={styles.page}>
      <div style={styles.sectionTitle}>⚙️ 管理者パネル</div>

      {/* 練習日の追加・選択 */}
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

        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          管理する練習日を選択
        </div>
        <select
          style={styles.selectBox}
          value={currentPractice.id}
          onChange={(e) => setSelectedPracticeId(e.target.value)}
        >
          {practices.map((p) => (
            <option key={p.id} value={p.id}>
              {p.date} の練習データ
            </option>
          ))}
        </select>
      </div>

      {/* チーム分け */}
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
              style={styles.counterBtn}
              onClick={() => setNumTeams(Math.max(2, numTeams - 1))}
            >
              −
            </button>
            <span style={styles.counterNum}>{numTeams}</span>
            <button
              style={styles.counterBtn}
              onClick={() => setNumTeams(Math.min(6, numTeams + 1))}
            >
              ＋
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
      {currentPractice.teamsGenerated && currentPractice.teams.length > 0 && (
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
                <div style={{ ...styles.teamCardTitle, color: team.color.bg }}>
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
                            m.position === "front" ? "#FF475720" : "#1E90FF20",
                          color: m.position === "front" ? "#FF4757" : "#1E90FF",
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

          {/* 試合組み合わせ（2コート・最大4チーム/ラウンド） */}
          {matchSchedule.length > 0 && (
            <>
              <div style={{ ...styles.sectionTitle, marginTop: 24 }}>
                試合組み合わせ（2コート）
              </div>
              <div style={styles.adminCard}>
                {matchSchedule.map((round, roundIdx) => (
                  <div
                    key={roundIdx}
                    style={{
                      marginBottom:
                        roundIdx < matchSchedule.length - 1 ? 16 : 0,
                      paddingBottom:
                        roundIdx < matchSchedule.length - 1 ? 16 : 0,
                      borderBottom:
                        roundIdx < matchSchedule.length - 1
                          ? "1px solid #eee"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#888",
                        marginBottom: 8,
                        letterSpacing: "0.05em",
                      }}
                    >
                      ラウンド {roundIdx + 1}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {round.map((match, matchIdx) => (
                        <div
                          key={matchIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            background: "#f8f9fa",
                            borderRadius: 10,
                            padding: "10px 14px",
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          <span
                            style={{
                              color: match[0].color.bg,
                              minWidth: 72,
                              textAlign: "center",
                            }}
                          >
                            {match[0].color.name}
                          </span>
                          <span style={{ color: "#999", fontSize: 12 }}>
                            vs
                          </span>
                          <span
                            style={{
                              color: match[1].color.bg,
                              minWidth: 72,
                              textAlign: "center",
                            }}
                          >
                            {match[1].color.name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#aaa",
                              marginLeft: 4,
                            }}
                          >
                            コート{matchIdx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 12,
                    color: "#888",
                    textAlign: "center",
                  }}
                >
                  全{currentPractice.teams.length}チーム・
                  {(currentPractice.teams.length *
                    (currentPractice.teams.length - 1)) /
                    2}
                  試合を過不足なく表示
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
