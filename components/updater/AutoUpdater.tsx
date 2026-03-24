"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AutoUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [version, setVersion] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Tauri 환경에서만 실행
    if (typeof window === "undefined" || !(window as any).__TAURI__) return;

    async function checkUpdate() {
      try {
        const { check } = await import("@tauri-apps/plugin-updater");
        const update = await check();
        if (update?.available) {
          setVersion(update.version);
          setUpdateAvailable(true);
        }
      } catch (e) {
        // 업데이트 체크 실패 시 조용히 무시
      }
    }

    // 앱 시작 3초 후 체크 (로딩 완료 후)
    const timer = setTimeout(checkUpdate, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdate = async () => {
    if (typeof window === "undefined" || !(window as any).__TAURI__) return;
    setDownloading(true);
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const { relaunch } = await import("@tauri-apps/plugin-process");
      const update = await check();
      if (update?.available) {
        await update.downloadAndInstall((event: any) => {
          if (event.event === "Progress") {
            const pct = Math.round((event.data.chunkLength / event.data.contentLength) * 100);
            setProgress(prev => Math.min(100, prev + pct));
          }
        });
        await relaunch();
      }
    } catch (e) {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {updateAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 dawn-card p-4 w-72"
        >
          <div className="flex items-start gap-3">
            <motion.span className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}>
              ✨
            </motion.span>
            <div className="flex-1">
              <p className="text-sm font-bold mb-0.5" style={{ color: "var(--text-1)" }}>
                새 버전이 있어요!
              </p>
              <p className="text-[11px] mb-3" style={{ color: "var(--text-3)" }}>
                v{version} — 새로운 동반자와 기능이 추가됐어요
              </p>

              {downloading ? (
                <div>
                  <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "rgba(43,143,240,0.08)" }}>
                    <motion.div className="h-full rounded-full"
                      animate={{ width: `${progress}%` }}
                      style={{ background: "var(--blue)", boxShadow: "0 0 6px rgba(43,143,240,0.5)" }} />
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>
                    다운로드 중... {progress}%
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleUpdate}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "var(--blue)", color: "#fff" }}>
                    지금 업데이트
                  </button>
                  <button onClick={() => setUpdateAvailable(false)}
                    className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(43,143,240,0.08)", color: "var(--text-3)" }}>
                    나중에
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
