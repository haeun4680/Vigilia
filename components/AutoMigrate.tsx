"use client";

import { useEffect } from "react";

// 앱 마운트 시 한 번만 마이그레이션 실행
// 이미 적용된 마이그레이션은 IF NOT EXISTS 로 안전하게 건너뜀
export function AutoMigrate() {
  useEffect(() => {
    const key = "migrate_last_run";
    const last = localStorage.getItem(key);
    const now = Date.now();
    // 24시간에 한 번만 호출 (매 페이지로드마다 호출하지 않도록)
    if (last && now - Number(last) < 24 * 60 * 60 * 1000) return;

    const isInTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    const url = isInTauri
      ? "https://habit-tracker-nine-sigma.vercel.app/api/migrate"
      : "/api/migrate";

    fetch(url, { method: "POST" })
      .then(() => localStorage.setItem(key, String(now)))
      .catch(() => {}); // 조용히 실패
  }, []);

  return null;
}
