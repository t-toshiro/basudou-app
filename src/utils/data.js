// ===== 名簿と設定データ =====
export const ROSTER = [
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

export const TEAM_COLORS = [
  { bg: "#FF4757", light: "#FFE8EA", name: "レッド" },
  { bg: "#2ED573", light: "#E3FFF0", name: "グリーン" },
  { bg: "#1E90FF", light: "#E3F2FF", name: "ブルー" },
  { bg: "#FFA502", light: "#FFF5E3", name: "オレンジ" },
  { bg: "#A55EEA", light: "#F5EEFF", name: "パープル" },
  { bg: "#FF6B81", light: "#FFE8EC", name: "ピンク" },
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

/** 2コート用：全チームの試合組み合わせを過不足なくラウンド分けする（1ラウンド最大2試合＝4チーム） */
export function getMatchSchedule(teams, courts = 2) {
  if (!teams || teams.length < 2) return [];

  const pairs = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairs.push([teams[i], teams[j]]);
    }
  }

  const rounds = [];
  const used = new Set();

  while (used.size < pairs.length) {
    const round = [];
    const teamsInRound = new Set();

    for (let i = 0; i < pairs.length; i++) {
      if (used.has(i)) continue;
      const [a, b] = pairs[i];
      if (teamsInRound.has(a.id) || teamsInRound.has(b.id)) continue;
      round.push([a, b]);
      teamsInRound.add(a.id);
      teamsInRound.add(b.id);
      used.add(i);
      if (round.length >= courts) break;
    }
    rounds.push(round);
  }

  return rounds;
}
