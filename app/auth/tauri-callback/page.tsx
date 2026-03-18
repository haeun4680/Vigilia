"use client";

import { useEffect, useState } from "react";

export default function TauriCallbackPage() {
  const [appUrl, setAppUrl] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");
    const errorDesc = params.get("error_description");

    if (code) {
      // code만 Tauri 앱으로 전달 — 교환은 code_verifier가 있는 앱에서 수행
      setAppUrl(`vigilia://auth?code=${encodeURIComponent(code)}`);
    } else if (error) {
      setErrMsg(errorDesc ?? error);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-center space-y-6 max-w-xs w-full px-6">
        {appUrl ? (
          <>
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl"
              style={{ background: "rgba(136,192,224,0.15)", border: "1px solid rgba(136,192,224,0.3)" }}>
              ✓
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: "var(--text-1)" }}>
                구글 인증 완료!
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
                아래 버튼을 눌러 앱으로 돌아가세요
              </p>
            </div>
            <a
              href={appUrl}
              className="block w-full py-3 rounded-xl text-sm font-semibold text-center"
              style={{
                background: "rgba(136,192,224,0.15)",
                border: "1px solid rgba(136,192,224,0.35)",
                color: "var(--blue)",
                textDecoration: "none",
              }}
            >
              Vigilia 앱 열기
            </a>
            <p className="text-xs" style={{ color: "var(--text-4)" }}>
              팝업이 뜨면 &ldquo;열기&rdquo;를 눌러주세요
            </p>
          </>
        ) : errMsg ? (
          <>
            <p className="text-sm font-semibold" style={{ color: "#f87171" }}>로그인 실패</p>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>{errMsg}</p>
            <a href="/" style={{ color: "var(--blue)", fontSize: 13 }}>돌아가기</a>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full border-2 animate-spin mx-auto"
              style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
            <p className="text-sm" style={{ color: "var(--text-2)" }}>인증 확인 중...</p>
          </>
        )}
      </div>
    </div>
  );
}
