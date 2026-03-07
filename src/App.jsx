import { useState } from "react";

// ===== 名簿データ =====
const ROSTER = [
  { id: 1, name: "田中 翔", position: "front" },
  { id: 2, name: "佐藤 健", position: "back" },
  { id: 3, name: "鈴木 大輝", position: "front" },
  { id: 4, name: "高橋 涼", position: "back" },
  { id: 5, name: "伊藤 航", position: "front" },
  { id: 6, name: "渡辺 蓮", position: "back" },
  { id: 7, name: "山本 颯", position: "front" },
  { id: 8, name: "中村 陸", position: "back" },
  { id: 9, name: "小林 律", position: "front" },
  { id: 10, name: "加藤 海斗", position: "back" },
  { id: 11, name: "吉田 蒼", position: "front" },
  { id: 12, name: "山田 悠", position: "back" },
  { id: 13, name: "松本 光", position: "front" },
  { id: 14, name: "井上 空", position: "back" },
  { id: 15, name: "木村 晴", position: "front" },
  { id: 16, name: "林 奏太", position: "back" },
];

const TEAM_COLORS = [
  { bg: "#FF4757", light: "#FFE8EA", name: "レッド" },
  { bg: "#2ED573", light: "#E3FFF0", name: "グリーン" },
  { bg: "#1E90FF", light: "#E3F2FF", name: "ブルー" },
  { bg: "#FFA502", light: "#FFF5E3", name: "オレンジ" },
  { bg: "#A55EEA", light: "#F5EEFF", name: "パープル" },
  { bg: "#FF6B81", light: "#FFE8EC", name: "ピンク" },
];

function distributeTeams(presentMembers, numTeams) {
  const fronts = presentMembers.filter((m) => m.position === "front");
  const backs = presentMembers.filter((m) => m.position === "back");

  // shuffle
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const sf = shuffle(fronts);
  const sb = shuffle(backs);

  const teams = Array.from({ length: numTeams }, (_, i) => ({
    id: i + 1,
    color: TEAM_COLORS[i % TEAM_COLORS.length],
    members: [],
  }));

  [...sf, ...sb].forEach((member, i) => {
    teams[i % numTeams].members.push(member);
  });

  return teams;
}

// ===== コンポーネント =====
export default function App() {
  const [view, setView] = useState("home"); // home | admin | member
  const [members, setMembers] = useState(
    ROSTER.map((m) => ({ ...m, attending: false, arrived: false, team: null }))
  );
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState([]);
  const [teamsGenerated, setTeamsGenerated] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const attendingCount = members.filter((m) => m.attending).length;
  const arrivedCount = members.filter((m) => m.arrived).length;

  const toggleAttend = (id) => {
    setTeamsGenerated(false);
    setTeams([]);
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, attending: !m.attending, arrived: m.attending ? false : m.arrived }
          : m
      )
    );
  };

  const toggleArrived = (id) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        if (!m.attending) return m; // 出席してないと到着できない
        return { ...m, arrived: !m.arrived };
      })
    );
  };

  const generateTeams = () => {
    const present = members.filter((m) => m.arrived);
    if (present.length < numTeams) return;
    const result = distributeTeams(present, numTeams);
    const updated = members.map((m) => {
      const found = result.find((t) => t.members.some((tm) => tm.id === m.id));
      return { ...m, team: found ? found.id : null };
    });
    setMembers(updated);
    setTeams(result);
    setTeamsGenerated(true);
    setView("admin");
  };

  return (
    <div style={styles.root}>
      {/* ヘッダー */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🏀</span>
            <span style={styles.logoText}>CIRCLE MANAGER</span>
          </div>
          <nav style={styles.nav}>
            <button
              style={{ ...styles.navBtn, ...(view === "home" ? styles.navBtnActive : {}) }}
              onClick={() => setView("home")}
            >
              HOME
            </button>
            <button
              style={{ ...styles.navBtn, ...(view === "member" ? styles.navBtnActive : {}) }}
              onClick={() => { setView("member"); setSelectedMember(null); }}
            >
              メンバー
            </button>
            <button
              style={{ ...styles.navBtn, ...(view === "admin" ? styles.navBtnActive : {}) }}
              onClick={() => setView("admin")}
            >
              管理
            </button>
          </nav>
        </div>
      </header>

      <main style={styles.main}>
        {/* ===== HOME ===== */}
        {view === "home" && (
          <div style={styles.page}>
            <div style={styles.heroSection}>
              <h1 style={styles.heroTitle}>今日の練習、<br />準備はいい？</h1>
              <p style={styles.heroSub}>出席 → 到着 → チーム分け</p>
            </div>

            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <div style={styles.statNum}>{attendingCount}</div>
                <div style={styles.statLabel}>出席予定</div>
              </div>
              <div style={styles.statDivider}>/</div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNum, color: "#2ED573" }}>{arrivedCount}</div>
                <div style={styles.statLabel}>到着済み</div>
              </div>
              <div style={styles.statDivider}>/</div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statNum, color: "#888" }}>{ROSTER.length}</div>
                <div style={styles.statLabel}>総メンバー</div>
              </div>
            </div>

            {/* メンバーボタン一覧 */}
            <div style={styles.sectionTitle}>📋 出欠・到着確認</div>
            <div style={styles.memberGrid}>
              {members.map((m) => (
                <div key={m.id} style={{
                  ...styles.memberCard,
                  ...(m.arrived ? styles.memberCardArrived : m.attending ? styles.memberCardAttending : {})
                }}>
                  <div style={styles.memberName}>{m.name}</div>
                  <div style={styles.memberPos}>
                    <span style={{
                      ...styles.posBadge,
                      background: m.position === "front" ? "#FF475720" : "#1E90FF20",
                      color: m.position === "front" ? "#FF4757" : "#1E90FF"
                    }}>
                      {m.position === "front" ? "F" : "B"}
                    </span>
                  </div>
                  <div style={styles.memberBtns}>
                    <button
                      style={{
                        ...styles.smBtn,
                        background: m.attending ? "#FF4757" : "#f0f0f0",
                        color: m.attending ? "#fff" : "#555"
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
                        cursor: m.attending ? "pointer" : "not-allowed"
                      }}
                      onClick={() => toggleArrived(m.id)}
                    >
                      {m.arrived ? "到着✓" : "到着"}
                    </button>
                  </div>
                  {teamsGenerated && m.team && (
                    <div style={{
                      ...styles.teamBadge,
                      background: teams.find(t => t.id === m.team)?.color.bg || "#ccc"
                    }}>
                      {teams.find(t => t.id === m.team)?.color.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== MEMBER (個人ビュー) ===== */}
        {view === "member" && (
          <div style={styles.page}>
            <div style={styles.sectionTitle}>👤 メンバー選択</div>
            {!selectedMember ? (
              <div style={styles.memberListSelect}>
                {members.map((m) => (
                  <button
                    key={m.id}
                    style={styles.memberSelectBtn}
                    onClick={() => setSelectedMember(m.id)}
                  >
                    <span style={styles.memberSelectName}>{m.name}</span>
                    <span style={{
                      ...styles.posBadge,
                      background: m.position === "front" ? "#FF475720" : "#1E90FF20",
                      color: m.position === "front" ? "#FF4757" : "#1E90FF",
                      marginLeft: 8
                    }}>
                      {m.position === "front" ? "フロント" : "バック"}
                    </span>
                    {m.arrived && <span style={styles.greenDot}></span>}
                  </button>
                ))}
              </div>
            ) : (() => {
              const m = members.find((x) => x.id === selectedMember);
              const myTeam = teamsGenerated && m.team ? teams.find((t) => t.id === m.team) : null;
              return (
                <div style={styles.personalView}>
                  <button style={styles.backBtn} onClick={() => setSelectedMember(null)}>← 戻る</button>
                  <div style={styles.personalCard}>
                    <div style={styles.personalName}>{m.name}</div>
                    <div style={styles.personalPos}>
                      {m.position === "front" ? "🏃 フロント" : "🎯 バック"}
                    </div>

                    <div style={styles.personalBtnRow}>
                      <button
                        style={{
                          ...styles.bigBtn,
                          background: m.attending ? "#FF4757" : "#f5f5f5",
                          color: m.attending ? "#fff" : "#333",
                          border: m.attending ? "none" : "2px solid #ddd"
                        }}
                        onClick={() => toggleAttend(m.id)}
                      >
                        {m.attending ? "✓ 出席中" : "出席する"}
                      </button>
                      <button
                        style={{
                          ...styles.bigBtn,
                          background: m.arrived ? "#2ED573" : "#f5f5f5",
                          color: m.arrived ? "#fff" : "#333",
                          border: m.arrived ? "none" : "2px solid #ddd",
                          opacity: m.attending ? 1 : 0.4,
                          cursor: m.attending ? "pointer" : "not-allowed"
                        }}
                        onClick={() => toggleArrived(m.id)}
                      >
                        {m.arrived ? "✓ 到着済み" : "到着する"}
                      </button>
                    </div>

                    {myTeam ? (
                      <div style={{ ...styles.myTeamBox, background: myTeam.color.light, borderColor: myTeam.color.bg }}>
                        <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>あなたのチーム</div>
                        <div style={{ ...styles.myTeamName, color: myTeam.color.bg }}>
                          {myTeam.color.name}チーム
                        </div>
                        <div style={{ marginTop: 8, fontSize: 13, color: "#555" }}>
                          メンバー: {myTeam.members.map((x) => x.name).join("、")}
                        </div>
                      </div>
                    ) : teamsGenerated ? (
                      <div style={styles.noTeamBox}>今回は不参加です</div>
                    ) : (
                      <div style={styles.noTeamBox}>チームはまだ決まっていません</div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ===== ADMIN ===== */}
        {view === "admin" && (
          <div style={styles.page}>
            <div style={styles.sectionTitle}>⚙️ 管理者パネル</div>

            <div style={styles.adminCard}>
              <div style={styles.adminRow}>
                <div style={styles.adminStat}>
                  <span style={styles.adminStatNum}>{attendingCount}</span>
                  <span style={styles.adminStatLabel}>出席</span>
                </div>
                <div style={styles.adminStat}>
                  <span style={{ ...styles.adminStatNum, color: "#2ED573" }}>{arrivedCount}</span>
                  <span style={styles.adminStatLabel}>到着</span>
                </div>
              </div>

              <div style={styles.teamInputRow}>
                <label style={styles.teamLabel}>チーム数</label>
                <div style={styles.teamCounter}>
                  <button style={styles.counterBtn} onClick={() => setNumTeams(Math.max(2, numTeams - 1))}>−</button>
                  <span style={styles.counterNum}>{numTeams}</span>
                  <button style={styles.counterBtn} onClick={() => setNumTeams(Math.min(6, numTeams + 1))}>＋</button>
                </div>
                <span style={styles.perTeam}>
                  {arrivedCount > 0 ? `約${Math.floor(arrivedCount / numTeams)}人/チーム` : ""}
                </span>
              </div>

              <button
                style={{
                  ...styles.generateBtn,
                  opacity: arrivedCount >= numTeams ? 1 : 0.4,
                  cursor: arrivedCount >= numTeams ? "pointer" : "not-allowed"
                }}
                onClick={generateTeams}
                disabled={arrivedCount < numTeams}
              >
                🏀 チームを自動振り分け
              </button>
              {arrivedCount < numTeams && (
                <div style={styles.warnText}>到着済み人数がチーム数より少ないです</div>
              )}
            </div>

            {teamsGenerated && teams.length > 0 && (
              <div>
                <div style={{ ...styles.sectionTitle, marginTop: 24 }}>チーム結果</div>
                <div style={styles.teamsGrid}>
                  {teams.map((team) => (
                    <div key={team.id} style={{ ...styles.teamCard, borderTop: `4px solid ${team.color.bg}` }}>
                      <div style={{ ...styles.teamCardTitle, color: team.color.bg }}>
                        {team.color.name}チーム
                      </div>
                      <div style={styles.teamMembers}>
                        {team.members.map((m) => (
                          <div key={m.id} style={styles.teamMemberRow}>
                            <span style={styles.teamMemberName}>{m.name}</span>
                            <span style={{
                              ...styles.posBadge,
                              background: m.position === "front" ? "#FF475720" : "#1E90FF20",
                              color: m.position === "front" ? "#FF4757" : "#1E90FF",
                            }}>
                              {m.position === "front" ? "F" : "B"}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={styles.teamCount}>{team.members.length}人</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 出欠管理テーブル */}
            <div style={{ ...styles.sectionTitle, marginTop: 24 }}>📊 出欠状況一覧</div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>名前</th>
                    <th style={styles.th}>ポジション</th>
                    <th style={styles.th}>出席</th>
                    <th style={styles.th}>到着</th>
                    <th style={styles.th}>チーム</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => {
                    const myTeam = teamsGenerated && m.team ? teams.find((t) => t.id === m.team) : null;
                    return (
                      <tr key={m.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={styles.td}>{m.name}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.posBadge,
                            background: m.position === "front" ? "#FF475720" : "#1E90FF20",
                            color: m.position === "front" ? "#FF4757" : "#1E90FF"
                          }}>
                            {m.position === "front" ? "フロント" : "バック"}
                          </span>
                        </td>
                        <td style={styles.td}>{m.attending ? "✓" : "−"}</td>
                        <td style={styles.td}>{m.arrived ? "✓" : "−"}</td>
                        <td style={styles.td}>
                          {myTeam ? (
                            <span style={{ ...styles.posBadge, background: myTeam.color.light, color: myTeam.color.bg }}>
                              {myTeam.color.name}
                            </span>
                          ) : "−"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ===== スタイル =====
const styles = {
  root: {
    fontFamily: "'Noto Sans JP', 'Helvetica Neue', sans-serif",
    background: "#F7F8FC",
    minHeight: "100vh",
    color: "#1a1a2e",
  },
  header: {
    background: "#1a1a2e",
    padding: "0 16px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
  },
  headerInner: {
    maxWidth: 720,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
  },
  logo: { display: "flex", alignItems: "center", gap: 8 },
  logoIcon: { fontSize: 22 },
  logoText: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "#FF4757",
  },
  nav: { display: "flex", gap: 4 },
  navBtn: {
    background: "transparent",
    border: "none",
    color: "#aaa",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  navBtnActive: {
    background: "#FF475718",
    color: "#FF4757",
  },
  main: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "20px 16px 60px",
  },
  page: {},
  heroSection: {
    padding: "28px 0 20px",
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: 900,
    lineHeight: 1.25,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  heroSub: {
    marginTop: 8,
    color: "#888",
    fontSize: 13,
    letterSpacing: "0.05em",
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    background: "#fff",
    borderRadius: 14,
    padding: "16px 24px",
    marginBottom: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  statCard: { flex: 1, textAlign: "center" },
  statNum: { fontSize: 32, fontWeight: 800, color: "#FF4757", lineHeight: 1 },
  statLabel: { fontSize: 11, color: "#aaa", marginTop: 4, letterSpacing: "0.05em" },
  statDivider: { fontSize: 24, color: "#e0e0e0", padding: "0 8px" },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#888",
    letterSpacing: "0.08em",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 10,
  },
  memberCard: {
    background: "#fff",
    borderRadius: 12,
    padding: "12px 10px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    border: "2px solid transparent",
    transition: "all 0.2s",
    position: "relative",
  },
  memberCardAttending: {
    border: "2px solid #FF475740",
    background: "#FFF8F8",
  },
  memberCardArrived: {
    border: "2px solid #2ED57340",
    background: "#F5FFFB",
  },
  memberName: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 4,
  },
  memberPos: { marginBottom: 8 },
  posBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 20,
  },
  memberBtns: { display: "flex", gap: 4, flexWrap: "wrap" },
  smBtn: {
    fontSize: 11,
    fontWeight: 700,
    border: "none",
    borderRadius: 6,
    padding: "5px 8px",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  teamBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    fontSize: 10,
    fontWeight: 700,
    color: "#fff",
    padding: "2px 7px",
    borderRadius: 20,
  },
  // Member view
  memberListSelect: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  memberSelectBtn: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: "14px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    textAlign: "left",
    transition: "all 0.15s",
    fontSize: 14,
    fontWeight: 600,
  },
  memberSelectName: { flex: 1 },
  greenDot: {
    width: 8,
    height: 8,
    background: "#2ED573",
    borderRadius: "50%",
    display: "inline-block",
  },
  personalView: {},
  backBtn: {
    background: "none",
    border: "none",
    color: "#888",
    cursor: "pointer",
    fontSize: 13,
    marginBottom: 16,
    padding: 0,
  },
  personalCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
  },
  personalName: {
    fontSize: 24,
    fontWeight: 900,
    marginBottom: 4,
  },
  personalPos: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
  },
  personalBtnRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
  },
  bigBtn: {
    flex: 1,
    padding: "14px",
    fontSize: 14,
    fontWeight: 700,
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  myTeamBox: {
    border: "2px solid",
    borderRadius: 12,
    padding: 16,
    textAlign: "center",
  },
  myTeamName: {
    fontSize: 22,
    fontWeight: 900,
  },
  noTeamBox: {
    background: "#f7f7f7",
    borderRadius: 12,
    padding: 16,
    textAlign: "center",
    color: "#aaa",
    fontSize: 13,
  },
  // Admin
  adminCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  adminRow: {
    display: "flex",
    gap: 24,
    marginBottom: 20,
  },
  adminStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  adminStatNum: {
    fontSize: 36,
    fontWeight: 900,
    color: "#FF4757",
    lineHeight: 1,
  },
  adminStatLabel: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 2,
  },
  teamInputRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  teamLabel: {
    fontSize: 14,
    fontWeight: 700,
  },
  teamCounter: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#f5f5f5",
    borderRadius: 10,
    padding: "6px 12px",
  },
  counterBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    color: "#555",
    lineHeight: 1,
    padding: "0 4px",
  },
  counterNum: {
    fontSize: 20,
    fontWeight: 900,
    minWidth: 24,
    textAlign: "center",
  },
  perTeam: {
    fontSize: 12,
    color: "#aaa",
  },
  generateBtn: {
    width: "100%",
    background: "#FF4757",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "14px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.04em",
    transition: "all 0.2s",
  },
  warnText: {
    fontSize: 12,
    color: "#FF4757",
    marginTop: 8,
    textAlign: "center",
  },
  teamsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 12,
  },
  teamCard: {
    background: "#fff",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  teamCardTitle: {
    fontSize: 15,
    fontWeight: 800,
    marginBottom: 12,
    letterSpacing: "0.02em",
  },
  teamMembers: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  teamMemberRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamMemberName: {
    fontSize: 13,
    fontWeight: 600,
  },
  teamCount: {
    marginTop: 10,
    fontSize: 11,
    color: "#aaa",
    textAlign: "right",
  },
  tableWrap: {
    overflowX: "auto",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    fontSize: 13,
  },
  th: {
    background: "#1a1a2e",
    color: "#fff",
    padding: "10px 14px",
    textAlign: "left",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.06em",
  },
  td: {
    padding: "10px 14px",
    borderBottom: "1px solid #f0f0f0",
  },
};