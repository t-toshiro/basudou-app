import { useState } from "react";
import styles from "./utils/styles";
import { ROSTER, distributeTeams } from "./utils/data";
import Header from "./components/Header";
import PracticeSelectPage from "./components/PracticeSelectPage";
import AttendancePage from "./components/AttendancePage";
import AdminView from "./components/AdminView";

export default function App() {
  const [view, setView] = useState("home"); // home | admin
  const [homeStep, setHomeStep] = useState("selectDate"); // selectDate | attendance

  // 練習日のデータリスト（初期状態として1日分を入れておく）
  const [practices, setPractices] = useState([
    {
      id: "p_init",
      date: "2026-03-07",
      attendance: ROSTER.map((m) => ({
        ...m,
        attending: false,
        arrived: false,
        team: null,
      })),
      teams: [],
      teamsGenerated: false,
    },
  ]);
  const [selectedPracticeId, setSelectedPracticeId] = useState("p_init");

  // 選択中の練習日データを取得
  const currentPractice =
    practices.find((p) => p.id === selectedPracticeId) || null;

  // 新しい練習日の追加
  const addPractice = (dateStr) => {
    if (!dateStr) return;
    const newId = "p_" + Date.now();
    const newPractice = {
      id: newId,
      date: dateStr,
      attendance: ROSTER.map((m) => ({
        ...m,
        attending: false,
        arrived: false,
        team: null,
      })),
      teams: [],
      teamsGenerated: false,
    };
    setPractices([...practices, newPractice]);
    setSelectedPracticeId(newId); // 追加した日を自動で選択
  };

  // 出席の切り替え
  const toggleAttend = (memberId) => {
    setPractices((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPracticeId) return p;
        return {
          ...p,
          teamsGenerated: false,
          teams: [],
          attendance: p.attendance.map((m) =>
            m.id === memberId
              ? {
                  ...m,
                  attending: !m.attending,
                  arrived: m.attending ? false : m.arrived,
                }
              : m,
          ),
        };
      }),
    );
  };

  // 到着の切り替え
  const toggleArrived = (memberId) => {
    setPractices((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPracticeId) return p;
        return {
          ...p,
          attendance: p.attendance.map((m) => {
            if (m.id !== memberId) return m;
            if (!m.attending) return m; // 出席してないと到着できない
            return { ...m, arrived: !m.arrived };
          }),
        };
      }),
    );
  };

  // チーム振り分け
  const generateTeams = (numTeams) => {
    if (!currentPractice) return;
    const present = currentPractice.attendance.filter((m) => m.arrived);
    if (present.length < numTeams) return;

    const result = distributeTeams(present, numTeams);

    setPractices((prev) =>
      prev.map((p) => {
        if (p.id !== selectedPracticeId) return p;
        const updatedAttendance = p.attendance.map((m) => {
          const found = result.find((t) =>
            t.members.some((tm) => tm.id === m.id),
          );
          return { ...m, team: found ? found.id : null };
        });
        return {
          ...p,
          attendance: updatedAttendance,
          teams: result,
          teamsGenerated: true,
        };
      }),
    );
  };

  return (
    <div style={styles.root}>
      <Header view={view} setView={setView} />
      <main style={styles.main}>
        {view === "home" && homeStep === "selectDate" && (
          <PracticeSelectPage
            practices={practices}
            setSelectedPracticeId={setSelectedPracticeId}
            setHomeStep={setHomeStep}
          />
        )}
        {view === "home" && homeStep === "attendance" && (
          <AttendancePage
            currentPractice={currentPractice}
            setHomeStep={setHomeStep}
            toggleAttend={toggleAttend}
            toggleArrived={toggleArrived}
          />
        )}
        {view === "admin" && (
          <AdminView
            practices={practices}
            currentPractice={currentPractice}
            setSelectedPracticeId={setSelectedPracticeId}
            addPractice={addPractice}
            generateTeams={generateTeams}
          />
        )}
      </main>
    </div>
  );
}
