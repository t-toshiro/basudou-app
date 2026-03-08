// src/App.jsx
import { useState, useEffect } from "react";
import styles from "./utils/styles";
import { ROSTER, distributeTeams } from "./utils/data";
import Header from "./components/Header";
import PracticeSelectPage from "./components/PracticeSelectPage";
import AttendancePage from "./components/AttendancePage";
import AdminView from "./components/AdminView";
import AdminPasswordGate from "./components/AdminPasswordGate";
import SlideTransition from "./components/SlideTransition";

// 🔥 Firebase用のインポートを追加
import { db } from "./utils/firebase";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

export default function App() {
  const [view, setView] = useState("home"); // home | admin
  const [adminUnlocked, setAdminUnlocked] = useState(false); // 管理者パスワード通過済みか
  const [homeStep, setHomeStep] = useState("selectDate"); // selectDate | attendance
  const [slideDirection, setSlideDirection] = useState(1); // 1=右から, -1=左から
  const [isFirstRender, setIsFirstRender] = useState(true);

  // 初回表示ではスライドアニメーションをスキップ
  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  // 管理者画面からホームに戻ったらロックを解除
  useEffect(() => {
    if (view !== "admin") setAdminUnlocked(false);
  }, [view]);

  // 画面遷移の状態管理と、画面ごとの一意なキー作成処理
  // - pageKey: 現在の画面(view)やサブステップ(homeStep, adminUnlocked)によって
  //   Reactコンポーネント用の一意なキーを生成。スライドアニメーションの適用のためにも用いる。
  //   "home"の時はhomeStepごと、"admin"の時はパスワード通過済みかどうかで値が変わる。
  const pageKey =
    view === "home"
      ? `home-${homeStep}`
      : `admin-${adminUnlocked ? "view" : "gate"}`;

  // 画面(view)を切り替える時に呼ぶ関数。
  // - 次の画面が"admin"なら右からスライド、"home"に戻る時は左からスライドするよう
  //   direction（アニメーション方向）も管理している。
  const handleSetView = (nextView) => {
    setSlideDirection(nextView === "admin" ? 1 : -1);
    setView(nextView);
  };

  // "home"画面内でのsub-step（selectDate⇄attendance）切替用ハンドラ。
  // - 次が"attendance"画面なら右、"selectDate"なら左からスライド
  const handleSetHomeStep = (nextStep) => {
    setSlideDirection(nextStep === "attendance" ? 1 : -1);
    setHomeStep(nextStep);
  };

  // 🔥 初期値を空配列にし、Firebaseから取得するように変更
  const [practices, setPractices] = useState([]);
  const [selectedPracticeId, setSelectedPracticeId] = useState("");

  // ==========================================
  // 🔥 1. リアルタイム同期（Firebaseからデータを受信）
  // ==========================================
  useEffect(() => {
    // データベースの "practices" コレクションを監視
    const unsubscribe = onSnapshot(collection(db, "practices"), (snapshot) => {
      const practicesData = snapshot.docs.map((doc) => doc.data());

      // 日付が新しい順に並び替え
      practicesData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPractices(practicesData);

      // 初回ロード時などにIDが未設定なら、一番新しい練習日を選択
      if (practicesData.length > 0 && !selectedPracticeId) {
        setSelectedPracticeId(practicesData[0].id);
      }
    });

    return () => unsubscribe(); // コンポーネント破棄時に監視を解除
  }, [selectedPracticeId]);

  const currentPractice =
    practices.find((p) => p.id === selectedPracticeId) || null;

  // ==========================================
  // 🔥 2. 各種操作（Firebaseへデータを送信）
  // ==========================================

  // 新しい練習日の追加
  const addPractice = async (dateStr) => {
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

    // Firestoreに直接保存！
    await setDoc(doc(db, "practices", newId), newPractice);
    setSelectedPracticeId(newId);
  };

  // 練習日の削除
  const deletePractice = async (practiceId) => {
    if (!practiceId) return;
    if (!window.confirm("この練習日データを完全に削除しますか？")) return;

    try {
      await deleteDoc(doc(db, "practices", practiceId));
      // 削除後、選択されているIDをリセットして、useEffectでの自動選択に任せる
      if (selectedPracticeId === practiceId) {
        setSelectedPracticeId("");
      }
    } catch (error) {
      console.error("Error deleting practice: ", error);
      alert("削除に失敗しました。");
    }
  };

  // 出席の切り替え
  const toggleAttend = async (memberId) => {
    if (!currentPractice) return;
    const updatedAttendance = currentPractice.attendance.map((m) =>
      m.id === memberId
        ? {
            ...m,
            attending: !m.attending,
            arrived: m.attending ? false : m.arrived,
          }
        : m,
    );

    // Firestoreのデータを上書き！
    await setDoc(doc(db, "practices", currentPractice.id), {
      ...currentPractice,
      teamsGenerated: false,
      teams: [],
      attendance: updatedAttendance,
    });
  };

  // 到着の切り替え
  const toggleArrived = async (memberId) => {
    if (!currentPractice) return;
    const updatedAttendance = currentPractice.attendance.map((m) => {
      if (m.id !== memberId) return m;
      if (!m.attending) return m; // 出席してないと到着できない
      return { ...m, arrived: !m.arrived };
    });

    // Firestoreのデータを上書き！
    await setDoc(doc(db, "practices", currentPractice.id), {
      ...currentPractice,
      attendance: updatedAttendance,
    });
  };

  // チーム振り分け
  const generateTeams = async (numTeams) => {
    if (!currentPractice) return;
    const present = currentPractice.attendance.filter((m) => m.arrived);
    if (present.length < numTeams) return;

    const result = distributeTeams(present, numTeams);
    const updatedAttendance = currentPractice.attendance.map((m) => {
      const found = result.find((t) => t.members.some((tm) => tm.id === m.id));
      return { ...m, team: found ? found.id : null };
    });

    // Firestoreのデータを上書き！
    await setDoc(doc(db, "practices", currentPractice.id), {
      ...currentPractice,
      attendance: updatedAttendance,
      teams: result,
      teamsGenerated: true,
    });
  };

  return (
    <div style={styles.root}>
      <Header view={view} setView={handleSetView} />
      <main style={{ ...styles.main, overflow: "hidden" }}>
        <SlideTransition
          key={pageKey}
          direction={slideDirection}
          animate={!isFirstRender}
        >
          {view === "home" && homeStep === "selectDate" && (
            <PracticeSelectPage
              practices={practices}
              setSelectedPracticeId={setSelectedPracticeId}
              setHomeStep={handleSetHomeStep}
            />
          )}
          {view === "home" && homeStep === "attendance" && (
            <AttendancePage
              currentPractice={currentPractice}
              setHomeStep={handleSetHomeStep}
              toggleAttend={toggleAttend}
              toggleArrived={toggleArrived}
            />
          )}
          </SlideTransition>
          {view === "admin" && !adminUnlocked && (
          <AdminPasswordGate onSuccess={() => setAdminUnlocked(true)} />
          )}
          {view === "admin" && adminUnlocked && (
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
