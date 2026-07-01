"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import { NODES, sideFactor } from "./spineData";

// Karanlık sinematik tema (Active Theory yönü)
const L = { bg: "#06060b", ink: "#f2f3f7", gray: "#9a9bad", faint: "#5f6070", line: "rgba(255,255,255,0.12)", surface: "#0e0e18" };

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Ağır WebGL Orb radarı — yalnız node açılınca yüklenir (merkezden büyüyen overlay)
const OrbRadar = dynamic(() => import("@/components/CraftAbyssRadar"), {
  ssr: false,
  loading: () => <div style={{ position: "fixed", inset: 0, background: "#07060b" }} />,
});

// AISpear üye/admin alanı (login + panel) — yalnız açılınca yüklenir
const AdminOverlay = dynamic(() => import("./AdminOverlay"), {
  ssr: false,
  loading: () => <div style={{ position: "fixed", inset: 0, background: "#0B0710" }} />,
});

// FAZ A: gerçek 3B omurga sahnesi (R3F) — sabit arka plan, ssr'siz
const Spine3D = dynamic(() => import("./Spine3D"), { ssr: false });

export default function SpineHome() {
  const router = useRouter();
  const [lang, setLang] = useState("tr");
  const [open, setOpen] = useState(null); // açık düğüm index'i
  const [experience, setExperience] = useState(null); // 'orb' | 'admin' — tam ekran overlay
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState({ x: 0, y: 0 }); // tıklanan öğenin ekran merkezi (overlay buradan doğar)
  // NOT: scroll ilerlemesi state değil, progressRef (re-render'sız → 3B sahne + perf)
  const [geom, setGeom] = useState({ w: 1200, h: 3000, amp: 180, pts: [] });
  const [ready, setReady] = useState(false);
  const [drawn, setDrawn] = useState(false); // giriş: omurga kökten çizilir

  const rootRef = useRef(null);
  const budRefs = useRef([]);
  const lenisRef = useRef(null);
  const scrollRef = useRef(0); // her frame okunur (re-render'sız)
  const progressRef = useRef(0); // 3B sahne scroll ilerlemesini buradan okur
  const geomRef = useRef(geom); // onScroll reflow'suz aktif-düğüm tespiti için

  // Dil tercihi (mevcut siteyle uyumlu)
  useEffect(() => {
    try {
      const s = localStorage.getItem("ka_lang");
      if (s === "tr" || s === "en") setLang(s);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("ka_lang", lang); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const amplitudeFor = (w) => (w < 720 ? 0 : Math.min(w * 0.16, 200));

  // Tomurcuk merkezlerini ölç → omurga eğrisi noktaları
  const measure = () => {
    const w = window.innerWidth;
    const amp = amplitudeFor(w);
    const docH = rootRef.current ? rootRef.current.scrollHeight : document.body.scrollHeight;
    const pts = budRefs.current.map((el, i) => {
      if (!el) return { x: w / 2 + amp * sideFactor(i), y: (i + 0.5) * (docH / NODES.length) };
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY };
    });
    setGeom({ w, h: docH, amp, pts });
    setReady(true);
  };

  useIso(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    // Fontlar yüklenince yeniden ölç (konum kayması olmasın)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure).catch(() => {});
    const t = setTimeout(measure, 400);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Giriş çizimini tetikle (ölçüm hazır olunca). setTimeout ile — rAF
  // throttle edilse (arka plan sekmesi) bile omurga çizilir.
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => setDrawn(true), 60);
    return () => clearTimeout(id);
  }, [ready]);

  // Lenis akıcı scroll + scroll'a bağlı ilerleme/aktif düğüm
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenisRef.current = lenis;
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onScroll = ({ scroll, limit }) => {
      scrollRef.current = scroll; // kordon senkronu (re-render yok)
      const p = limit > 0 ? Math.min(scroll / limit, 1) : 0;
      progressRef.current = p; // 3B sahne okur (re-render yok)
      // Aktif düğüm: ölçülmüş pts.y (belge uzayı) ile — her-frame reflow YOK
      const mid = scroll + window.innerHeight / 2;
      const pts = geomRef.current.pts || [];
      let best = 0, bestD = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const d = Math.abs(pts[i].y - mid);
        if (d < bestD) { bestD = d; best = i; }
      }
      setActive(best);
    };
    lenis.on("scroll", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Panel/experience açıkken scroll kilidi
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (open != null || experience) lenis.stop();
    else lenis.start();
  }, [open, experience]);

  // Panel / experience: Esc ile kapat
  useEffect(() => {
    if (open == null && !experience) return;
    const onKey = (e) => { if (e.key === "Escape") { setExperience(null); setOpen(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, experience]);

  geomRef.current = geom; // en güncel eğri onScroll'a

  const scrollToNode = (i) => {
    const el = budRefs.current[i];
    if (el && lenisRef.current) lenisRef.current.scrollTo(el, { offset: -window.innerHeight / 2 + el.offsetHeight / 2 });
  };

  // Tıklanan öğenin ekran merkezini yakala → overlay/panel oradan büyür
  const captureOrigin = (e) => {
    try { const r = e.currentTarget.getBoundingClientRect(); setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 }); } catch {}
  };
  const openNode = (i, e) => { captureOrigin(e); setOpen(i); };

  // Overlay'in doğacağı nokta için viewport merkezine göre delta
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;

  const css = `
    .spine-bud{cursor:pointer;transition:transform .5s cubic-bezier(.22,1,.36,1)}
    .spine-bud:hover{transform:scale(1.12)}
    .spine-title{transition:color .4s ease,opacity .5s ease,transform .6s cubic-bezier(.22,1,.36,1)}
    .mini-dot{cursor:pointer;transition:transform .3s ease,background .3s ease,border-color .3s ease}
    .mini-dot:hover{transform:scale(1.5)}
    .lang-btn{cursor:pointer;transition:background .2s,color .2s}
    .panel-cta{transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .4s ease}
    .panel-cta:hover{transform:translateY(-2px)}
    .panel-cta:hover .pca{transform:translateX(4px)}
    .pca{display:inline-flex;transition:transform .35s cubic-bezier(.22,1,.36,1)}
    /* Sinematik canlı düğüm */
    @keyframes spineCore{0%,100%{transform:scale(1)}50%{transform:scale(1.28)}}
    @keyframes spineHalo{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
    @keyframes spineRing{to{transform:rotate(1turn)}}
    .spine-core{animation:spineCore 3.2s ease-in-out infinite}
    .spine-halo{animation:spineHalo 4s ease-in-out infinite}
    .spine-ring{animation:spineRing 9s linear infinite}
    .spine-bud.is-active .spine-ring{animation-duration:4s}
    .spine-bud.is-active .spine-core{animation-duration:2s}
    @media (prefers-reduced-motion:reduce){.spine-bud,.spine-title,.mini-dot,.panel-cta,.spine-core,.spine-halo,.spine-ring{animation:none !important;transition:none}}
    /* Mobil: panel tam ekran, mini-omurga gizli */
    @media (max-width:640px){
      .spine-panel-wrap{padding:0 !important;}
      .spine-panel{max-width:100% !important;width:100% !important;max-height:100svh !important;height:100svh !important;border-radius:0 !important;}
      .spine-minimap{display:none !important;}
    }
  `;

  return (
    <div ref={rootRef} style={{ position: "relative", background: L.bg, color: L.ink, minHeight: "100vh", overflow: "hidden",
      fontFamily: "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ---- FAZ A: gerçek 3B omurga sahnesi (sabit arka plan) ---- */}
      <Spine3D progressRef={progressRef} />

      {/* ---- NAV: logo (sol üst) + dil (sağ üst) ---- */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 40, display: "flex",
        justifyContent: "space-between", alignItems: "center", padding: "18px 24px", mixBlendMode: "normal", pointerEvents: "none" }}>
        <button onClick={() => scrollToNode(0)} style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ width: 26, height: 26, borderRadius: 7, background: L.ink, color: L.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>K</span>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: L.ink }}>Kerem Alkan</span>
        </button>
        <div style={{ pointerEvents: "auto", display: "flex", border: `1px solid ${L.line}`, borderRadius: 99, overflow: "hidden", background: "rgba(14,14,24,0.6)", backdropFilter: "blur(10px)" }}>
          {["tr", "en"].map((lng) => (
            <button key={lng} className="lang-btn" onClick={() => setLang(lng)}
              style={{ padding: "6px 11px", fontSize: 11, letterSpacing: 1, border: "none",
                fontFamily: "ui-monospace,'SF Mono',Menlo,Consolas,monospace",
                background: lang === lng ? L.ink : "transparent", color: lang === lng ? L.bg : L.gray }}>
              {lng.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ---- YAN MİNİ-OMURGA ---- */}
      <div className="spine-minimap" style={{ position: "fixed", right: 22, top: "50%", transform: "translateY(-50%)", zIndex: 40,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {NODES.map((n, i) => (
          <div key={n.id} className="mini-dot" onClick={() => scrollToNode(i)} title={n[lang].title}
            style={{ width: active === i ? 11 : 7, height: active === i ? 11 : 7, borderRadius: 99,
              background: active === i ? n.color : "transparent", border: `1.5px solid ${active === i ? n.color : "rgba(255,255,255,0.3)"}` }} />
        ))}
      </div>

      {/* ---- OMURGA BÖLÜMLERİ ---- */}
      <main style={{ position: "relative", zIndex: 10 }}>
        {NODES.map((node, i) => {
          const t = node[lang];
          const side = sideFactor(i) >= 0 ? 1 : -1; // metin dış tarafa
          const x = 0; // FAZ A: düğümler merkezde (3B omurga sahnenin ortasında)
          const isActive = active === i;
          return (
            <section key={node.id}
              style={{ position: "relative", minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "relative", width: "min(1080px,100%)", padding: "0 24px", display: "flex", justifyContent: "center" }}>
                <div style={{ position: "relative", transform: `translateX(${x}px)`, transition: "transform .6s cubic-bezier(.22,1,.36,1)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center", maxWidth: 520 }}>

                  {/* Tomurcuk düğüm — sinematik canlı */}
                  <div ref={(el) => (budRefs.current[i] = el)} className={`spine-bud${isActive ? " is-active" : ""}`} onClick={(e) => openNode(i, e)}
                    style={{ position: "relative", width: 64, height: 64, display: "grid", placeItems: "center",
                      transform: isActive ? "scale(1.18)" : "scale(1)" }}>
                    {/* dönen enerji halkası */}
                    <span className="spine-ring" aria-hidden style={{ position: "absolute", inset: -7, borderRadius: "50%",
                      background: `conic-gradient(from 0deg, transparent 0%, ${node.color} 22%, transparent 52%)`,
                      WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
                      mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
                      opacity: isActive ? 0.95 : 0.4, transition: "opacity .5s ease" }} />
                    {/* nefes alan hâle (opacity aktife bağlı → karartma korunur) */}
                    <span className="spine-halo" style={{ position: "absolute", inset: -8, borderRadius: 99, background: node.color,
                      opacity: isActive ? 0.24 : 0.09, filter: "blur(11px)", transition: "opacity .5s ease" }} />
                    {/* petaller (açılınca çiçek) */}
                    {[0, 1, 2, 3, 4].map((k) => (
                      <span key={k} style={{ position: "absolute", width: 10, height: 22, borderRadius: 99,
                        background: node.color, opacity: isActive ? 0.5 : 0.18, transformOrigin: "50% 120%",
                        transform: `rotate(${k * 72}deg) translateY(-16px) scale(${isActive ? 1 : 0.6})`,
                        transition: "opacity .5s ease, transform .6s cubic-bezier(.22,1,.36,1)" }} />
                    ))}
                    {/* pulslayan çekirdek */}
                    <span className="spine-core" style={{ position: "relative", width: 16, height: 16, borderRadius: 99, background: node.color,
                      boxShadow: `0 0 0 4px ${L.bg}, 0 0 16px ${node.color}` }} />
                  </div>

                  <div className="m" style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,Consolas,monospace",
                    fontSize: 11, letterSpacing: 2, color: node.color, opacity: isActive ? 1 : 0.6, transition: "opacity .4s ease" }}>{t.kicker}</div>

                  <h2 className="spine-title" style={{ margin: 0, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05,
                    fontSize: node.kind === "root" ? "clamp(34px,6.5vw,64px)" : "clamp(28px,5vw,48px)",
                    color: L.ink, opacity: isActive ? 1 : 0.5, transform: isActive ? "translateY(0)" : "translateY(6px)" }}>{t.title}</h2>

                  <p style={{ margin: 0, fontSize: "clamp(15px,2vw,18px)", lineHeight: 1.5, color: L.gray, opacity: isActive ? 1 : 0.5, transition: "opacity .4s ease" }}>{t.summary}</p>

                  {node.kind !== "root" && node.kind !== "crown" && (
                    <button onClick={(e) => openNode(i, e)} style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 7,
                      background: "transparent", color: L.ink, border: `1px solid ${L.line}`, borderRadius: 99, padding: "10px 18px",
                      fontSize: 14, cursor: "pointer" }}>
                      {lang === "tr" ? "Aç" : "Open"} <ArrowUpRight size={15} />
                    </button>
                  )}
                  {node.kind === "crown" && (
                    <a href={`mailto:${node.email}`} style={{ marginTop: 4, fontSize: "clamp(22px,5vw,40px)", fontWeight: 600,
                      letterSpacing: "-0.02em", color: L.ink, textDecoration: "none" }}>{node.email}</a>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </main>

      {/* ---- YERİNDE AÇILAN PANEL (tomurcuk çiçek açar) ---- */}
      <AnimatePresence>
        {open != null && (
          <motion.div className="spine-panel-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            onClick={() => setOpen(null)}
            style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "24px", background: "rgba(4,4,9,0.66)", backdropFilter: "blur(16px)" }}>
            <motion.div className="spine-panel" data-lenis-prevent
              initial={{ opacity: 0, scale: 0.2, x: origin.x - vw / 2, y: origin.y - vh / 2 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.4, x: (origin.x - vw / 2) * 0.7, y: (origin.y - vh / 2) * 0.7, transition: { duration: 0.32, ease: [0.4, 0, 1, 1] } }}
              transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.9 }} onClick={(e) => e.stopPropagation()}
              style={{ position: "relative", width: "min(760px,100%)", maxHeight: "86vh", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", background: L.surface,
                border: `1px solid ${L.line}`, borderRadius: 24, padding: "clamp(24px,4vw,44px)",
                boxShadow: "0 40px 100px -40px rgba(20,20,30,0.4)" }}>
              {(() => {
                const node = NODES[open];
                const t = node[lang];
                return (
                  <>
                    <button onClick={() => setOpen(null)} aria-label="Kapat"
                      style={{ position: "absolute", top: 18, right: 18, width: 38, height: 38, borderRadius: 99, border: `1px solid ${L.line}`,
                        background: L.surface, cursor: "pointer", display: "grid", placeItems: "center", color: L.gray }}>
                      <X size={18} />
                    </button>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 99, background: node.color, boxShadow: `0 0 10px ${node.color}` }} />
                      <span className="m" style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,Consolas,monospace", fontSize: 11, letterSpacing: 2, color: node.color }}>{t.kicker}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: "clamp(28px,5vw,48px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, color: L.ink }}>{t.title}</h3>
                    <p style={{ marginTop: 16, fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.5, color: L.gray }}>{t.summary}</p>

                    {t.body && (
                      <div style={{ marginTop: 24, fontSize: 16, lineHeight: 1.65, color: L.ink }}>
                        {t.body.map((para, k) => <p key={k} style={{ margin: k ? "0 0 0" : 0, marginTop: k ? 16 : 0, color: k ? L.gray : L.ink }}>{para}</p>)}
                      </div>
                    )}

                    {node.gallery && node.gallery.length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 26 }}>
                        {node.gallery.map((src) => (
                          <div key={src} style={{ height: 128, borderRadius: 14, overflow: "hidden", border: `1px solid ${L.line}`,
                            background: `radial-gradient(120% 120% at 30% 18%, ${node.color}22, #0b0710 60%, #0e0a14)`, display: "grid", placeItems: "center" }}>
                            <img src={src} alt="" loading="lazy" style={{ maxWidth: "82%", maxHeight: "78%", objectFit: "contain" }} />
                          </div>
                        ))}
                      </div>
                    )}

                    {t.process && (
                      <div style={{ marginTop: 26 }}>
                        <div className="m" style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,Consolas,monospace", fontSize: 11, letterSpacing: 2, color: L.faint, marginBottom: 8 }}>{lang === "tr" ? "SÜREÇ" : "PROCESS"}</div>
                        {t.process.map(([h, d], k) => (
                          <div key={k} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "baseline", padding: "13px 0", borderTop: `1px solid ${L.line}` }}>
                            <span className="m" style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,Consolas,monospace", fontSize: 12, color: node.color }}>{String(k + 1).padStart(2, "0")}</span>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: L.ink }}>{h}</div>
                              <div style={{ fontSize: 14, color: L.gray, marginTop: 2, lineHeight: 1.45 }}>{d}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {t.tags && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 26 }}>
                        {t.tags.map((tag) => (
                          <span key={tag} className="m" style={{ fontFamily: "ui-monospace,'SF Mono',Menlo,Consolas,monospace", fontSize: 12, color: L.gray, border: `1px solid ${L.line}`, borderRadius: 99, padding: "6px 13px" }}>{tag}</span>
                        ))}
                      </div>
                    )}

                    {(node.experience || node.href) && t.cta && (
                      <button className="panel-cta" onClick={(e) => {
                        captureOrigin(e);
                        setOpen(null);
                        if (node.experience) setExperience(node.experience);
                        else if (node.href) router.push(node.href);
                      }}
                        style={{ width: "100%", marginTop: 30, border: "none", borderRadius: 18, padding: "22px 24px", cursor: "pointer", textAlign: "left",
                          position: "relative", overflow: "hidden",
                          background: `radial-gradient(120% 160% at 20% 0%, ${node.color}22, #0b0710 55%, #0e0a14)` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <span style={{ width: 12, height: 12, borderRadius: 99, background: node.color, boxShadow: `0 0 12px ${node.color}` }} />
                          <span style={{ flex: 1, fontSize: 19, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{t.cta}</span>
                          <span className="pca"><ArrowRight size={20} color="#fff" /></span>
                        </div>
                      </button>
                    )}

                    {node.socials && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 20, fontSize: 15 }}>
                        {node.socials.map((s) => (
                          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                            style={{ color: L.gray, textDecoration: "none", borderBottom: `1px solid ${L.line}`, paddingBottom: 2 }}>{s.label}</a>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tam ekran "experience" overlay — merkezden büyür (Orb radarı; admin sonraki adım) */}
      <AnimatePresence>
        {experience && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ position: "fixed", inset: 0, zIndex: 80, background: "#07060b" }}>
            <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.55, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "absolute", inset: 0, transformOrigin: `${origin.x}px ${origin.y}px` }}>
              {experience === "orb" && <OrbRadar />}
              {experience === "aispear" && <AdminOverlay />}
            </motion.div>
            <button onClick={() => setExperience(null)} aria-label="Kapat"
              style={{ position: "fixed", top: 18, right: 18, zIndex: 90, width: 42, height: 42, borderRadius: 99,
                border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
                color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
