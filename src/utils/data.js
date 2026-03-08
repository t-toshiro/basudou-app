// ===== 名簿と設定データ =====
export const ROSTER = [
  { id: 1,  name: "田中 翔",   position: "front" ,gender:"male"},
  { id: 2,  name: "佐藤 健",   position: "back"  ,gender:"male"},
  { id: 3,  name: "鈴木 大輝", position: "front" ,gender:"male"},
  { id: 4,  name: "高橋 涼",   position: "back"  ,gender:"male"},
  { id: 5,  name: "伊藤 航",   position: "front" ,gender:"male"},
  { id: 6,  name: "渡辺 蓮",   position: "back"  ,gender:"male"},
  { id: 7,  name: "山本 颯",   position: "front" ,gender:"male"},
  { id: 8,  name: "中村 陸",   position: "back"  ,gender:"male"},
  { id: 9,  name: "小林 律",   position: "front" ,gender:"male"},
  { id: 10, name: "加藤 海斗", position: "back"  ,gender:"male"},
  { id: 11, name: "吉田 蒼",   position: "front" ,gender:"male"},
  { id: 12, name: "山田 悠",   position: "back"  ,gender:"male"},
  { id: 13, name: "松本 光",   position: "front" ,gender:"male"},
  { id: 14, name: "井上 空",   position: "back"  ,gender:"male"},
  { id: 15, name: "木村 晴",   position: "front" ,gender:"male"},
  { id: 16, name: "林 奏太",   position: "back"  ,gender:"male"},
  { id: 17, name: "清水 陽向", position: "front" ,gender:"male"},
  { id: 18, name: "斎藤 凌",   position: "back"  ,gender:"male"},
  { id: 19, name: "山口 湊",   position: "front" ,gender:"male"},
  { id: 20, name: "池田 蒼太", position: "back"  ,gender:"male"},
  { id: 21, name: "橋本 樹",   position: "front" ,gender:"male"},
  { id: 22, name: "石川 碧",   position: "back"  ,gender:"male"},
  { id: 23, name: "前田 悠真", position: "front" ,gender:"male"},
  { id: 24, name: "藤田 煌",   position: "back"  ,gender:"male"},
  { id: 25, name: "岡田 司",   position: "front" ,gender:"male"},
  { id: 26, name: "後藤 颯真", position: "back"  ,gender:"male"},
  { id: 27, name: "西村 朔",   position: "front" ,gender:"male"},
  { id: 28, name: "福田 蓮太", position: "back"  ,gender:"male"},
  { id: 29, name: "坂本 昊",   position: "front" ,gender:"male"},
  { id: 30, name: "遠藤 碧斗", position: "back"  ,gender:"male"},
];

export const TEAM_COLORS = [
  { bg: "#FF4757", light: "#FFE8EA", name: "1" },
  { bg: "#2ED573", light: "#E3FFF0", name: "2" },
  { bg: "#1E90FF", light: "#E3F2FF", name: "3" },
  { bg: "#FFA502", light: "#FFF5E3", name: "4" },
  { bg: "#A55EEA", light: "#F5EEFF", name: "5" },
  { bg: "#FF6B81", light: "#FFE8EC", name: "6" },
];

// チーム振り分けロジック
export function distributeTeams(presentMembers, numTeams) {
  const fronts = presentMembers.filter((m) => m.position === "front");
  const backs = presentMembers.filter((m) => m.position === "back");

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

/** @internal ラウンドロビンの各スロット（チーム重複なしの試合群）を生成 */
function buildRoundRobinSlots(teams) {
  const hasBye = teams.length % 2 !== 0;
  const list = hasBye ? [...teams, null] : [...teams]; // null = 不戦チーム
  const m = list.length; // 偶数に揃える

  const fixed = list[0];
  const rotating = list.slice(1);
  const slots = [];

  for (let r = 0; r < m - 1; r++) {
    // rotating を r 個後ろにシフト
    const rot =
      r === 0
        ? [...rotating]
        : [...rotating.slice(rotating.length - r), ...rotating.slice(0, rotating.length - r)];

    const slot = [];
    // fixed と rot[0] のペア
    if (fixed !== null && rot[0] !== null) slot.push([fixed, rot[0]]);
    // rot[i] と rot[末尾-i] のペア
    for (let i = 1; i < m / 2; i++) {
      const a = rot[i];
      const b = rot[m - 1 - i];
      if (a !== null && b !== null) slot.push([a, b]);
    }
    slots.push(slot);
  }

  return slots;
}

/**
 * 2コート用：全チームの試合組み合わせをラウンド数最小でスケジュールする
 * ① ラウンドロビンでスロット生成（各スロット内はチーム被りなし）
 * ② courts サイズにチャンク化
 * ③ 端数チャンク同士を貪欲マージしてさらに削減
 */
export function getMatchSchedule(teams, courts = 2) {
  if (!teams || teams.length < 2) return [];

  // ① ラウンドロビンスロット → courts ごとにチャンク化
  const slots = buildRoundRobinSlots(teams);
  const chunks = slots.flatMap((slot) => {
    const result = [];
    for (let i = 0; i < slot.length; i += courts) result.push(slot.slice(i, i + courts));
    return result;
  });

  // ② 端数チャンク同士を貪欲マージ
  const rounds = [];
  const used = new Set();

  for (let i = 0; i < chunks.length; i++) {
    if (used.has(i)) continue;

    const chunk = chunks[i];
    if (chunk.length >= courts) {
      rounds.push(chunk);
      used.add(i);
      continue;
    }

    // 端数 → 後続の端数と合体を試みる
    const round = [...chunk];
    const teamsInRound = new Set(round.flatMap(([a, b]) => [a.id, b.id]));
    used.add(i);

    for (let j = i + 1; j < chunks.length; j++) {
      if (used.has(j) || round.length >= courts) continue;
      const candidate = chunks[j];
      if (round.length + candidate.length > courts) continue;
      const fits = candidate.every(([a, b]) => !teamsInRound.has(a.id) && !teamsInRound.has(b.id));
      if (fits) {
        round.push(...candidate);
        candidate.forEach(([a, b]) => { teamsInRound.add(a.id); teamsInRound.add(b.id); });
        used.add(j);
      }
    }

    rounds.push(round);
  }

  return rounds;
}