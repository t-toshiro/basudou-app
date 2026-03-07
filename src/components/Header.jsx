import styles from "../utils/styles";

export default function Header({ view, setView }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerInner}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🏀</span>
          <span style={styles.logoText}>CIRCLE MANAGER</span>
        </div>
        <nav style={styles.nav}>
          <button
            style={{
              ...styles.navBtn,
              ...(view === "home" ? styles.navBtnActive : {}),
            }}
            onClick={() => setView("home")}
          >
            出欠入力
          </button>
          <button
            style={{
              ...styles.navBtn,
              ...(view === "admin" ? styles.navBtnActive : {}),
            }}
            onClick={() => setView("admin")}
          >
            管理者
          </button>
        </nav>
      </div>
    </header>
  );
}
