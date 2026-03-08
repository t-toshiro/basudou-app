import { useState, useEffect } from "react";

/**
 * 子要素を横スライドで表示するラッパー。
 * direction: 1 = 右から入る、-1 = 左から入る
 * animate: false のときはアニメーションなし（初回表示用）
 */
export default function SlideTransition({ children, direction = 1, animate = true }) {
  const [entered, setEntered] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [animate]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        transform: entered ? "translateX(0)" : `translateX(${direction * 100}%)`,
        transition: "transform 0.3s ease-out",
      }}
    >
      {children}
    </div>
  );
}
