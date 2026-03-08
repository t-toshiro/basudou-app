// src/App.jsx
import { useState, useEffect } from "react";
import styles from "./utils/styles";
import { ROSTER, distributeTeams } from "./utils/data";
import Header from "./components/Header";
import PracticeSelectPage from "./components/PracticeSelectPage";
import AttendancePage from "./components/AttendancePage";
import AdminView from "./components/AdminView";
import AdminPasswordGate from "./components/AdminPasswordGate";

// 🔥 Firebase用のインポートを追加
import { db } from "./utils/firebase";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";

export default function App() {
  const [view, setView] = useState("home"); // home | admin
  const [adminUnlocked, setAdminUnlocked] = useState(false); // 管理者パスワード通過済みか
  const [homeStep, setHomeStep] = useState("selectDate"); // selectDate | attendance

  // 管理者画面からホームに戻ったらロックを解除
  useEffect(() => {
    if (view !== "admin") setAdminUnlocked(false);
  }, [view]);

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

  // 🔑 サーバーに「この名前の鍵穴はあるか？」だけを確認しに行く
  const handleAdminLogin = async () => {
    if (!passInput) return;

    try {
      // ユーザーが入力したパスワードをそのままドキュメントIDとして指定
      const docRef = doc(db, "admin_keys", passInput);
      const docSnap = await getDoc(docRef);

      // 存在していれば、パスワード一致！（サーバー側で照合が完了した証拠）
      if (docSnap.exists()) {
        setIsAdminAuth(true);
        setPassInput("");
      } else {
        alert("パスコードが違います！");
        setPassInput("");
      }
    } catch (error) {
      // ルールで弾かれた場合などもここに来ます
      alert("パスコードが違います！（または通信エラー）");
      setPassInput("");
    }
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
        {view === "admin" && !adminUnlocked && (
          <AdminPasswordGate
            onSuccess={() => setAdminUnlocked(true)}
          />
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
