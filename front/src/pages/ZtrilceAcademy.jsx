/**
 * ZtrilceAcademy.jsx  —  src/pages/ZtrilceAcademy.jsx
 *
 * Landing page pública de la Academia Ztrilce.
 * El botón "Iniciar sesión" del navbar abre un modal que usa
 * el servicio real de autenticación (auth.service).
 * Al hacer login exitoso → setIsAuth(true) + navigate según rol.
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate }                 from "react-router-dom";
import { login }                       from "../services/auth.service";
import { enviarMensaje }               from "../services/contactos.service";

/* ══════════════════════════════════════════
   ESTILOS GLOBALES EMBEBIDOS
══════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;500;600;700;800;900&display=swap');

.zt-wrap *, .zt-wrap *::before, .zt-wrap *::after { box-sizing:border-box;margin:0;padding:0; }
.zt-wrap {
  font-family:'Nunito',sans-serif;
  background:#06101f;color:#e8f0fe;
  -webkit-font-smoothing:antialiased;overflow-x:hidden;min-height:100vh;
  --navy:#06101f;--navy2:#0b1e38;--blue:#1565c0;--blue-lt:#1e88e5;
  --cyan:#00b4d8;--gold:#ffb703;--gold-dk:#d4900a;--white:#ffffff;
  --muted:#90a4c0;--border:rgba(255,255,255,.08);
  --glow:0 0 40px rgba(0,180,216,.25);--r:14px;
}
.zt-math-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0;}
.zt-sym{position:absolute;font-family:'Bebas Neue',sans-serif;color:rgba(0,180,216,.06);font-size:clamp(2rem,6vw,5rem);user-select:none;animation:zt-float 8s ease-in-out infinite;}
@keyframes zt-float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-18px) rotate(4deg)}}
/* NAVBAR */
.zt-nav{position:fixed;top:0;left:0;right:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:0 6%;height:70px;background:rgba(6,16,31,.92);backdrop-filter:blur(18px);border-bottom:1px solid var(--border);transition:box-shadow .3s;}
.zt-nav.sc{box-shadow:0 4px 30px rgba(0,0,0,.5);}
.zt-brand{display:flex;align-items:center;gap:10px;text-decoration:none;}
.zt-brand-icon{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--blue),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 4px 14px rgba(0,180,216,.35);}
.zt-brand-name{font-family:'Bebas Neue',sans-serif;font-size:1.7rem;letter-spacing:.06em;background:linear-gradient(90deg,var(--white),var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.zt-nav-links{display:flex;align-items:center;gap:28px;list-style:none;}
.zt-nav-links a{color:var(--muted);font-size:.88rem;font-weight:600;text-decoration:none;letter-spacing:.03em;text-transform:uppercase;transition:color .2s;}
.zt-nav-links a:hover{color:var(--cyan);}
.zt-btn-login{padding:9px 22px;border-radius:9px;border:none;background:linear-gradient(135deg,var(--blue),var(--blue-lt));color:#fff;font-family:'Nunito',sans-serif;font-size:.85rem;font-weight:800;cursor:pointer;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 4px 16px rgba(21,101,192,.4);transition:transform .2s,box-shadow .2s;}
.zt-btn-login:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(21,101,192,.55);}
/* HERO */
.zt-hero{min-height:100vh;position:relative;display:flex;align-items:center;padding:100px 6% 60px;background:radial-gradient(ellipse 80% 60% at 60% 40%,rgba(21,101,192,.18) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 10% 80%,rgba(0,180,216,.1) 0%,transparent 60%),var(--navy);overflow:hidden;}
.zt-hero-inner{max-width:1100px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;position:relative;z-index:1;}
.zt-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:5px 14px;border-radius:999px;background:rgba(0,180,216,.12);border:1px solid rgba(0,180,216,.25);color:var(--cyan);font-size:.75rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:20px;}
.zt-dot{width:6px;height:6px;border-radius:50%;background:var(--cyan);animation:zt-pulse 1.5s ease infinite;}
@keyframes zt-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
.zt-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,6vw,5.2rem);line-height:.95;letter-spacing:.02em;color:var(--white);margin-bottom:18px;}
.zt-title .acc{background:linear-gradient(90deg,var(--gold),#ffd60a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.zt-title .line2{display:block;font-size:clamp(2rem,4vw,3.5rem);background:linear-gradient(90deg,var(--cyan),var(--blue-lt));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.zt-desc{font-size:1rem;line-height:1.75;color:var(--muted);max-width:460px;margin-bottom:32px;}
.zt-tags{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:32px;}
.zt-tag{padding:6px 14px;border-radius:8px;background:rgba(255,255,255,.05);border:1px solid var(--border);font-size:.8rem;font-weight:700;color:var(--muted);letter-spacing:.02em;}
.zt-tag.hl{background:rgba(0,180,216,.1);border-color:rgba(0,180,216,.25);color:var(--cyan);}
.zt-ctas{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:48px;}
.zt-btn-wa{padding:13px 26px;border-radius:10px;border:none;background:linear-gradient(135deg,#128c3e,#25d366);color:#fff;font-family:'Nunito',sans-serif;font-size:.92rem;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(37,211,102,.3);transition:transform .2s,box-shadow .2s;text-decoration:none;}
.zt-btn-wa:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(37,211,102,.45);}
.zt-btn-outline{padding:13px 24px;border-radius:10px;border:1.5px solid rgba(0,180,216,.4);background:transparent;color:var(--cyan);font-family:'Nunito',sans-serif;font-size:.92rem;font-weight:700;cursor:pointer;transition:background .2s,border-color .2s;}
.zt-btn-outline:hover{background:rgba(0,180,216,.1);border-color:var(--cyan);}
.zt-stats{display:flex;gap:36px;}
.zt-stat{border-left:3px solid var(--cyan);padding-left:16px;}
.zt-stat-n{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;color:var(--white);line-height:1;}
.zt-stat-l{font-size:.75rem;font-weight:700;color:var(--muted);margin-top:3px;letter-spacing:.04em;text-transform:uppercase;}
/* VISUAL CARD */
.zt-visual{position:relative;display:flex;align-items:center;justify-content:center;}
.zt-badge{position:absolute;top:-20px;right:0;z-index:10;width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dk),var(--gold));display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 8px 30px rgba(255,183,3,.45);animation:zt-spin 12s linear infinite;border:3px solid rgba(255,255,255,.3);}
@keyframes zt-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.zt-badge-pct{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--navy);line-height:1;animation:zt-spin 12s linear infinite reverse;}
.zt-badge-txt{font-size:.5rem;font-weight:900;color:var(--navy);text-transform:uppercase;letter-spacing:.05em;animation:zt-spin 12s linear infinite reverse;text-align:center;}
.zt-card{background:rgba(11,30,56,.9);border:1px solid rgba(0,180,216,.25);border-radius:20px;padding:32px;width:320px;box-shadow:0 20px 60px rgba(0,0,0,.5),var(--glow);position:relative;}
.zt-card-hd{display:flex;align-items:center;gap:12px;margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid var(--border);}
.zt-card-logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--blue),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:1.5rem;}
.zt-card-ttl{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;letter-spacing:.04em;color:var(--white);}
.zt-card-sub{font-size:.72rem;color:var(--muted);font-weight:600;letter-spacing:.04em;text-transform:uppercase;}
.zt-sched{background:rgba(0,180,216,.1);border:1px solid rgba(0,180,216,.2);border-radius:10px;padding:14px;margin-bottom:18px;text-align:center;}
.zt-days{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:.08em;color:var(--cyan);}
.zt-time{font-size:.85rem;color:var(--muted);font-weight:600;margin-top:2px;}
.zt-price-row{display:flex;align-items:center;gap:10px;background:rgba(255,183,3,.08);border:1px solid rgba(255,183,3,.2);border-radius:10px;padding:12px 16px;margin-bottom:18px;}
.zt-price{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--gold);}
.zt-price-lbl{font-size:.75rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;}
.zt-card-srvs{display:flex;flex-direction:column;gap:8px;}
.zt-card-srv{display:flex;align-items:center;gap:10px;font-size:.82rem;font-weight:600;color:var(--muted);}
.zt-sdot{width:8px;height:8px;border-radius:50%;background:var(--cyan);flex-shrink:0;}
.zt-teacher{margin-top:18px;padding-top:16px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px;}
.zt-tav{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:1rem;border:2px solid rgba(0,180,216,.3);}
.zt-tname{font-size:.82rem;font-weight:800;color:var(--white);}
.zt-trole{font-size:.72rem;color:var(--muted);letter-spacing:.03em;}
/* BAND */
.zt-band{background:linear-gradient(135deg,var(--gold-dk) 0%,var(--gold) 50%,#ffd60a 100%);padding:18px 6%;display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;position:relative;overflow:hidden;}
.zt-band::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0,rgba(255,255,255,.05) 1px,transparent 0,transparent 50%);background-size:12px 12px;}
.zt-band-txt{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:.06em;color:var(--navy);position:relative;z-index:1;}
.zt-band-txt strong{font-size:1.5rem;}
.zt-band-btn{padding:8px 20px;border-radius:8px;border:2px solid var(--navy);background:var(--navy);color:var(--gold);font-family:'Nunito',sans-serif;font-size:.82rem;font-weight:900;cursor:pointer;letter-spacing:.04em;text-transform:uppercase;transition:background .2s,color .2s;position:relative;z-index:1;text-decoration:none;display:inline-block;}
.zt-band-btn:hover{background:transparent;color:var(--navy);}
/* SECTION */
.zt-section{padding:90px 6%;}
.zt-inner{max-width:1100px;margin:0 auto;}
.zt-stag{font-size:.72rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--cyan);margin-bottom:10px;}
.zt-stitle{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.2rem,4vw,3.2rem);letter-spacing:.03em;color:var(--white);margin-bottom:14px;line-height:1;}
.zt-ssub{font-size:.95rem;color:var(--muted);line-height:1.75;max-width:520px;margin-bottom:52px;}
/* NIVELES */
.zt-lv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:2px;border-radius:var(--r);overflow:hidden;border:1px solid rgba(0,180,216,.15);}
.zt-lv{background:rgba(6,16,31,.8);padding:32px 28px;transition:background .25s;position:relative;overflow:hidden;}
.zt-lv::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;opacity:0;transition:opacity .25s;}
.zt-lv.prim::after{background:linear-gradient(90deg,#4caf50,#81c784);}
.zt-lv.sec::after{background:linear-gradient(90deg,var(--blue),var(--cyan));}
.zt-lv.univ::after{background:linear-gradient(90deg,var(--gold-dk),var(--gold));}
.zt-lv:hover{background:rgba(21,101,192,.08);}
.zt-lv:hover::after{opacity:1;}
.zt-lv-icon{font-size:2.2rem;margin-bottom:14px;}
.zt-lv-badge{display:inline-block;padding:3px 10px;border-radius:6px;font-size:.7rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;margin-bottom:12px;}
.zt-lv.prim .zt-lv-badge{background:rgba(76,175,80,.15);color:#81c784;}
.zt-lv.sec  .zt-lv-badge{background:rgba(0,180,216,.12);color:var(--cyan);}
.zt-lv.univ .zt-lv-badge{background:rgba(255,183,3,.12);color:var(--gold);}
.zt-lv-name{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:.04em;color:var(--white);margin-bottom:16px;}
.zt-lv-subs{display:flex;flex-direction:column;gap:7px;}
.zt-lv-sub{display:flex;align-items:center;gap:9px;font-size:.83rem;font-weight:600;color:var(--muted);}
.zt-lv-bul{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.zt-lv.prim .zt-lv-bul{background:#81c784;}
.zt-lv.sec  .zt-lv-bul{background:var(--cyan);}
.zt-lv.univ .zt-lv-bul{background:var(--gold);}
/* SERVICIOS */
.zt-srv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;}
.zt-srv-card{padding:28px 24px;border-radius:var(--r);background:rgba(11,30,56,.7);border:1px solid var(--border);transition:border-color .25s,transform .25s,box-shadow .25s;text-align:center;}
.zt-srv-card:hover{border-color:rgba(0,180,216,.4);transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,180,216,.12);}
.zt-srv-ic{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,var(--blue),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin:0 auto 16px;box-shadow:0 6px 20px rgba(0,180,216,.25);}
.zt-srv-ttl{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.04em;color:var(--white);margin-bottom:8px;}
.zt-srv-desc{font-size:.82rem;color:var(--muted);line-height:1.6;}
/* WHY */
.zt-why-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;}
.zt-proof{background:rgba(6,16,31,.8);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;}
.zt-proof-row{display:flex;align-items:center;gap:16px;padding:18px 24px;border-bottom:1px solid var(--border);transition:background .2s;}
.zt-proof-row:last-child{border-bottom:none;}
.zt-proof-row:hover{background:rgba(0,180,216,.05);}
.zt-proof-ic{width:42px;height:42px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.2rem;}
.pi-blue{background:rgba(21,101,192,.2);}
.pi-gold{background:rgba(255,183,3,.15);}
.pi-green{background:rgba(76,175,80,.15);}
.pi-cyan{background:rgba(0,180,216,.15);}
.zt-proof-ttl{font-weight:800;font-size:.9rem;color:var(--white);margin-bottom:3px;}
.zt-proof-desc{font-size:.78rem;color:var(--muted);}
/* TESTIMONIOS */
.zt-testi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;}
.zt-testi{background:rgba(11,30,56,.8);border:1px solid var(--border);border-radius:var(--r);padding:24px;transition:border-color .2s,box-shadow .2s;}
.zt-testi:hover{border-color:rgba(0,180,216,.3);box-shadow:0 8px 30px rgba(0,0,0,.3);}
.zt-stars{color:var(--gold);font-size:.9rem;margin-bottom:10px;letter-spacing:2px;}
.zt-testi-txt{font-size:.87rem;color:var(--muted);line-height:1.7;margin-bottom:16px;font-style:italic;}
.zt-testi-auth{display:flex;align-items:center;gap:10px;}
.zt-testi-av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.9rem;background:linear-gradient(135deg,var(--blue),var(--cyan));border:2px solid rgba(0,180,216,.3);}
.zt-testi-name{font-size:.82rem;font-weight:800;color:var(--white);}
.zt-testi-niv{font-size:.72rem;color:var(--muted);}
/* CONTACTO */
.zt-contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start;}
.zt-cinfo{display:flex;flex-direction:column;gap:18px;}
.zt-crow{display:flex;align-items:flex-start;gap:14px;padding:16px;border-radius:10px;background:rgba(11,30,56,.7);border:1px solid var(--border);}
.zt-cic{width:40px;height:40px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;background:linear-gradient(135deg,var(--blue),var(--cyan));}
.zt-clabel{font-size:.72rem;font-weight:900;color:var(--cyan);letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;}
.zt-cval{font-size:.9rem;font-weight:700;color:var(--white);}
.zt-cform{background:rgba(11,30,56,.7);border:1px solid var(--border);border-radius:var(--r);padding:32px;}
.zt-cform-ttl{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;letter-spacing:.04em;color:var(--white);margin-bottom:22px;}
.zt-cgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.zt-cfield{display:flex;flex-direction:column;gap:6px;}
.zt-cfield.full{grid-column:1/-1;}
.zt-clbl{font-size:.76rem;font-weight:800;color:var(--muted);letter-spacing:.04em;text-transform:uppercase;}
.zt-cinput{padding:11px 14px;border-radius:9px;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:var(--white);font-family:'Nunito',sans-serif;font-size:.88rem;outline:none;transition:border-color .2s,box-shadow .2s;}
.zt-cinput::placeholder{color:rgba(255,255,255,.2);}
.zt-cinput:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,180,216,.12);}
.zt-cinput.err{border-color:#f44336 !important;}
.zt-cinput.ta{resize:vertical;min-height:100px;}
.zt-csend{width:100%;margin-top:16px;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,var(--blue),var(--cyan));color:#fff;font-family:'Nunito',sans-serif;font-size:.9rem;font-weight:900;cursor:pointer;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 4px 20px rgba(0,180,216,.3);transition:transform .2s,box-shadow .2s,opacity .2s;display:flex;align-items:center;justify-content:center;gap:10px;}
.zt-csend:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,180,216,.45);}
.zt-csend:disabled{opacity:.65;cursor:not-allowed;transform:none;}
/* ALERTAS FORM */
.zt-form-alert{padding:12px 16px;border-radius:9px;font-size:.84rem;font-weight:700;margin-top:14px;display:flex;align-items:center;gap:8px;animation:zt-fi .3s ease;}
.zt-form-alert.ok{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);color:#6ee7b7;}
.zt-form-alert.er{background:rgba(244,67,54,.1);border:1px solid rgba(244,67,54,.25);color:#ef9a9a;}
/* SPINNER */
.zt-spin{width:16px;height:16px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:zt-sp .6s linear infinite;}
@keyframes zt-sp{to{transform:rotate(360deg)}}
/* FOOTER */
.zt-footer{padding:40px 6% 24px;background:rgba(0,0,0,.6);border-top:1px solid var(--border);}
.zt-footer-inner{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px;padding-bottom:20px;border-bottom:1px solid var(--border);margin-bottom:20px;}
.zt-flinks{display:flex;gap:22px;}
.zt-flinks a{color:var(--muted);text-decoration:none;font-size:.82rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;transition:color .2s;}
.zt-flinks a:hover{color:var(--cyan);}
.zt-fcopy{max-width:1100px;margin:0 auto;font-size:.76rem;color:rgba(144,164,192,.5);text-align:center;}
/* MODAL */
.zt-ov{position:fixed;inset:0;z-index:999;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;animation:zt-fi .2s ease;}
@keyframes zt-fi{from{opacity:0}to{opacity:1}}
.zt-modal{background:#0b1e38;border:1px solid rgba(0,180,216,.2);border-radius:20px;padding:40px;width:100%;max-width:410px;box-shadow:0 30px 80px rgba(0,0,0,.7),var(--glow);position:relative;animation:zt-su .25s ease;}
@keyframes zt-su{from{opacity:0;transform:translateY(28px) scale(.96)}to{opacity:1;transform:none}}
.zt-mx{position:absolute;top:14px;right:16px;width:30px;height:30px;border-radius:8px;border:none;background:rgba(255,255,255,.07);color:var(--muted);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s;}
.zt-mx:hover{background:rgba(255,255,255,.12);color:var(--white);}
.zt-mhead{text-align:center;margin-bottom:30px;}
.zt-mav{width:58px;height:58px;border-radius:15px;background:linear-gradient(135deg,var(--blue),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto 14px;box-shadow:0 6px 20px rgba(0,180,216,.35);}
.zt-mttl{font-family:'Bebas Neue',sans-serif;font-size:1.9rem;letter-spacing:.04em;color:var(--white);}
.zt-mstt{font-size:.82rem;color:var(--muted);margin-top:4px;}
.zt-fg{margin-bottom:4px;}
.zt-lbl{display:block;font-size:.75rem;font-weight:900;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px;}
.zt-fw{position:relative;display:flex;align-items:center;margin-bottom:6px;}
.zt-fic{position:absolute;left:13px;font-size:.95rem;color:var(--muted);pointer-events:none;}
.zt-fi2{width:100%;padding:11px 14px 11px 38px;border:1.5px solid rgba(255,255,255,.1);border-radius:10px;background:rgba(255,255,255,.05);color:var(--white);font-family:'Nunito',sans-serif;font-size:.9rem;outline:none;transition:border-color .2s,box-shadow .2s;}
.zt-fi2::placeholder{color:rgba(255,255,255,.2);}
.zt-fi2:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(0,180,216,.12);}
.zt-fi2.err{border-color:#f44336;}
.zt-ferr{font-size:.75rem;color:#f44336;display:flex;align-items:center;gap:4px;margin-bottom:14px;}
.zt-eye{position:absolute;right:12px;background:none;border:none;cursor:pointer;color:var(--muted);font-size:.95rem;padding:3px;transition:color .2s;}
.zt-eye:hover{color:var(--white);}
.zt-mopts{display:flex;justify-content:space-between;align-items:center;margin:14px 0 20px;}
.zt-mrem{display:flex;align-items:center;gap:6px;font-size:.78rem;color:var(--muted);cursor:pointer;}
.zt-mfgt{background:none;border:none;color:var(--cyan);font-size:.78rem;font-weight:700;cursor:pointer;transition:opacity .2s;}
.zt-mfgt:hover{opacity:.7;}
.zt-mbtn{width:100%;padding:13px;border-radius:10px;border:none;background:linear-gradient(135deg,var(--blue),var(--cyan));color:#fff;font-family:'Nunito',sans-serif;font-size:.9rem;font-weight:900;cursor:pointer;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 4px 16px rgba(0,180,216,.3);transition:transform .2s,box-shadow .2s,opacity .2s;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:18px;}
.zt-mbtn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(0,180,216,.45);}
.zt-mbtn:disabled{opacity:.65;cursor:not-allowed;transform:none;}
.zt-banner{padding:11px 14px;border-radius:9px;background:rgba(244,67,54,.1);border:1px solid rgba(244,67,54,.25);color:#ef9a9a;font-size:.82rem;display:flex;align-items:center;gap:8px;margin-bottom:16px;}
.zt-div{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:.76rem;margin-bottom:14px;}
.zt-div::before,.zt-div::after{content:'';flex:1;height:1px;background:var(--border);}
.zt-mreg{text-align:center;font-size:.82rem;color:var(--muted);}
.zt-mreg a{color:var(--cyan);font-weight:800;text-decoration:none;}
/* RESPONSIVE */
@media(max-width:900px){.zt-hero-inner,.zt-why-grid,.zt-contact-grid{grid-template-columns:1fr;}.zt-visual{display:none;}.zt-nav-links{display:none;}}
@media(max-width:600px){.zt-ctas{flex-direction:column;}.zt-stats{gap:20px;}.zt-lv-grid{grid-template-columns:1fr;}.zt-cgrid{grid-template-columns:1fr;}.zt-modal{padding:32px 22px;}}
`;

/* ══ DATOS ══ */
const MATH_SYMS = ["π","∑","√","∫","∞","α","Δ","θ","∂","φ","Ω","λ"];
const SYM_POS   = [
  {top:"8%", left:"3%", delay:"0s"},  {top:"15%",left:"88%",delay:"1s"},
  {top:"30%",left:"6%", delay:"2s"},  {top:"45%",left:"92%",delay:".5s"},
  {top:"60%",left:"2%", delay:"3s"},  {top:"72%",left:"85%",delay:"1.5s"},
  {top:"85%",left:"10%",delay:"2.5s"},{top:"90%",left:"78%",delay:".8s"},
];
const LEVELS = [
  {cls:"prim",icon:"📘",badge:"Primaria",           name:"PRIMARIA",
   subs:["Matemática","Comunicación Integral"]},
  {cls:"sec", icon:"📐",badge:"Secundaria / Pre-uni",name:"SECUNDARIA",
   subs:["Razonamiento Matemático","Razonamiento Verbal","Razonamiento Lógico","Álgebra","Aritmética","Geometría","Trigonometría","Física"]},
  {cls:"univ",icon:"🎓",badge:"Universitario",       name:"UNIVERSITARIO",
   subs:["Resolución de prácticas de Matemática","Cálculo diferencial e integral","Álgebra lineal","Estadística aplicada"]},
];
const SERVICES = [
  {icon:"📝",title:"TAREAS Y PRÁCTICAS",        desc:"Te ayudamos paso a paso a resolver y comprender tus tareas del colegio o universidad."},
  {icon:"📈",title:"NIVELACIÓN Y REFORZAMIENTO",desc:"Identificamos tus debilidades y trabajamos en ellas hasta que domines el tema."},
  {icon:"🏆",title:"PREPARACIÓN PARA EXÁMENES", desc:"Técnicas de resolución rápida y simulacros para que llegues seguro al examen."},
  {icon:"🔢",title:"CLASES PERSONALIZADAS",      desc:"Atención individualizada adaptada a tu ritmo, nivel y objetivos académicos."},
];
const TESTIMONIALS = [
  {stars:"★★★★★",text:"Gracias a Ztrilce pude ingresar a la UPN. El ingeniero Deivy explica de forma muy clara y tiene mucha paciencia.",name:"Carlos M.",nivel:"Ingresante UPN"},
  {stars:"★★★★★",text:"Mi hijo mejoró sus notas de 11 a 18 en solo dos meses. Las clases son muy dinámicas y ordenadas.",name:"Sra. Rosa P.",nivel:"Madre de alumno de secundaria"},
  {stars:"★★★★★",text:"Las prácticas universitarias ya no me dan miedo. El profe tiene un método único para resolver rápido.",name:"Andrea L.",nivel:"Estudiante universitaria"},
];
const WHY_ITEMS = [
  {icon:"🦉",cls:"pi-blue", title:"Más de 11 años de experiencia",    desc:"Una trayectoria sólida formando estudiantes exitosos en Cajamarca."},
  {icon:"🎓",cls:"pi-cyan", title:"Egresados UNC y UPN",               desc:"Nuestros docentes tienen formación universitaria de primer nivel."},
  {icon:"👥",cls:"pi-green",title:"Grupos reducidos y personalizados", desc:"Máximo 8 alumnos por grupo para garantizar atención de calidad."},
  {icon:"📍",cls:"pi-gold", title:"Ubicación céntrica",                desc:"Jr. Revilla Pérez 325, a media cuadra del Estadio Municipal."},
];

/* ══ LOGIN MODAL ══ */
function LoginModal({ onClose, setIsAuth }) {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ username:"", password:"" });
  const [showPwd, setShowPwd] = useState(false);
  const [rem,     setRem]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [banner,  setBanner]  = useState("");
  const ovRef = useRef();

  useEffect(() => {
    const fn = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: "" }));
    setBanner("");
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Usuario requerido.";
    if (!form.password)        e.password = "Contraseña requerida.";
    return e;
  };

  const handleSubmit = async () => {
    setBanner("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      const res   = await login(form);
      const token = res.data.token
                 || res.data.access_token
                 || res.data.accessToken
                 || res.data.jwt;
      if (!token) { setBanner("No se recibió token del servidor."); setLoading(false); return; }
      localStorage.setItem("token", token);
      setIsAuth(true);
      try {
        const rol = JSON.parse(atob(token.split(".")[1])).rol;
        navigate(rol === "visitante" ? "/reporte-asistencia" : "/alumnos");
      } catch { navigate("/alumnos"); }
    } catch {
      setBanner("Usuario o contraseña incorrectos.");
      setLoading(false);
    }
  };

  return (
    <div className="zt-ov" ref={ovRef}
         onClick={e => e.target === ovRef.current && onClose()}>
      <div className="zt-modal" role="dialog" aria-modal="true">
        <button className="zt-mx" onClick={onClose}>✕</button>
        <div className="zt-mhead">
          <div className="zt-mav">🦉</div>
          <div className="zt-mttl">BIENVENIDO</div>
          <div className="zt-mstt">Ingresa a tu cuenta Academia Ztrilce</div>
        </div>
        {banner && <div className="zt-banner">⚠️ {banner}</div>}
        <div className="zt-fg">
          <label className="zt-lbl">Usuario</label>
          <div className="zt-fw">
            <span className="zt-fic">👤</span>
            <input className={`zt-fi2${errors.username?" err":""}`}
              name="username" placeholder="Ingresa tu usuario"
              value={form.username} onChange={handleChange}
              autoComplete="username"
              onKeyDown={e=>e.key==="Enter"&&!loading&&handleSubmit()}/>
          </div>
          {errors.username && <div className="zt-ferr">⚠ {errors.username}</div>}
        </div>
        <div className="zt-fg">
          <label className="zt-lbl">Contraseña</label>
          <div className="zt-fw">
            <span className="zt-fic">🔒</span>
            <input className={`zt-fi2${errors.password?" err":""}`}
              name="password" type={showPwd?"text":"password"}
              placeholder="Ingresa tu contraseña"
              value={form.password} onChange={handleChange}
              autoComplete="current-password"
              onKeyDown={e=>e.key==="Enter"&&!loading&&handleSubmit()}/>
            <button className="zt-eye" type="button"
                    onClick={()=>setShowPwd(p=>!p)}>
              {showPwd?"🙈":"👁️"}
            </button>
          </div>
          {errors.password && <div className="zt-ferr">⚠ {errors.password}</div>}
        </div>
        <div className="zt-mopts">
          <label className="zt-mrem">
            <input type="checkbox" checked={rem} onChange={e=>setRem(e.target.checked)}/> Recordarme
          </label>
          <button className="zt-mfgt" type="button">¿Olvidaste tu contraseña?</button>
        </div>
        <button className="zt-mbtn" onClick={handleSubmit} disabled={loading}>
          {loading ? <><div className="zt-spin"/>Verificando...</> : "Ingresar al sistema"}
        </button>
        <div className="zt-div">o</div>
        <div className="zt-mreg">
          ¿No tienes cuenta? <a href="/register" onClick={onClose}>Regístrate aquí</a>
        </div>
      </div>
    </div>
  );
}

/* ══ NAVBAR ══ */
function Navbar({ onLogin }) {
  const [sc, setSc] = useState(false);
  useEffect(()=>{
    const fn = ()=>setSc(window.scrollY>20);
    window.addEventListener("scroll",fn);
    return ()=>window.removeEventListener("scroll",fn);
  },[]);
  return (
    <nav className={`zt-nav${sc?" sc":""}`}>
      <a href="#inicio" className="zt-brand">
        <div className="zt-brand-icon">🦉</div>
        <span className="zt-brand-name">ZTRILCE</span>
      </a>
      <ul className="zt-nav-links">
        <li><a href="#inicio">Inicio</a></li>
        <li><a href="#niveles">Niveles</a></li>
        <li><a href="#servicios">Servicios</a></li>
        <li><a href="#porqué">Nosotros</a></li>
        <li><a href="#contacto">Contacto</a></li>
      </ul>
      <button className="zt-btn-login" onClick={onLogin}>Iniciar sesión</button>
    </nav>
  );
}

/* ══ FORMULARIO DE CONTACTO ══ */
const FORM_INIT = { nombre: "", nivel: "", celular: "", correo: "", mensaje: "" };

function ContactForm() {
  const [form,    setForm]    = useState(FORM_INIT);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState(null); // { type: "ok"|"er", msg }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: "" }));
    setAlert(null);
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim())  e.nombre  = true;
    if (!form.mensaje.trim()) e.mensaje = true;
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    setAlert(null);
    try {
      await enviarMensaje(form);
      setAlert({ type: "ok", msg: "✅ Mensaje enviado correctamente. ¡Te contactaremos pronto!" });
      setForm(FORM_INIT);
      setErrors({});
    } catch {
      setAlert({ type: "er", msg: "❌ Hubo un error al enviar el mensaje. Inténtalo de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zt-cform">
      <div className="zt-cform-ttl">ENVÍANOS UN MENSAJE</div>
      <div className="zt-cgrid">
        <div className="zt-cfield">
          <label className="zt-clbl">Nombre *</label>
          <input
            className={`zt-cinput${errors.nombre ? " err" : ""}`}
            placeholder="Tu nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />
        </div>
        <div className="zt-cfield">
          <label className="zt-clbl">Nivel</label>
          <input
            className="zt-cinput"
            placeholder="Primaria / Secundaria / Uni"
            name="nivel"
            value={form.nivel}
            onChange={handleChange}
          />
        </div>
        <div className="zt-cfield">
          <label className="zt-clbl">Celular</label>
          <input
            className="zt-cinput"
            placeholder="9XX XXX XXX"
            name="celular"
            value={form.celular}
            onChange={handleChange}
          />
        </div>
        <div className="zt-cfield">
          <label className="zt-clbl">Correo (opcional)</label>
          <input
            className="zt-cinput"
            placeholder="tu@correo.com"
            name="correo"
            value={form.correo}
            onChange={handleChange}
          />
        </div>
        <div className="zt-cfield full">
          <label className="zt-clbl">Mensaje *</label>
          <textarea
            className={`zt-cinput ta${errors.mensaje ? " err" : ""}`}
            placeholder="¿En qué materia necesitas apoyo? ¿Tienes alguna consulta?"
            name="mensaje"
            value={form.mensaje}
            onChange={handleChange}
          />
        </div>
      </div>

      {alert && (
        <div className={`zt-form-alert ${alert.type}`}>
          {alert.msg}
        </div>
      )}

      <button className="zt-csend" onClick={handleSubmit} disabled={loading}>
        {loading ? <><div className="zt-spin"/>Enviando...</> : "Enviar mensaje →"}
      </button>
    </div>
  );
}

/* ══ COMPONENTE PRINCIPAL ══ */
function ZtrilceAcademy({ setIsAuth }) {
  const [showModal, setShowModal] = useState(false);

  useEffect(()=>{
    document.body.style.overflow = showModal ? "hidden" : "";
    return ()=>{ document.body.style.overflow = ""; };
  },[showModal]);

  return (
    <div className="zt-wrap">
      <style>{css}</style>
      <Navbar onLogin={()=>setShowModal(true)} />

      {/* HERO */}
      <section id="inicio" className="zt-hero">
        <div className="zt-math-bg">
          {SYM_POS.map((p,i)=>(
            <span key={i} className="zt-sym"
                  style={{top:p.top,left:p.left,animationDelay:p.delay}}>
              {MATH_SYMS[i]}
            </span>
          ))}
        </div>
        <div className="zt-hero-inner">
          <div>
            <div className="zt-eyebrow">
              <span className="zt-dot"/> # 1 Academia de Matemáticas · Cajamarca
            </div>
            <h1 className="zt-title">
              <span className="acc">DOMINA</span> LAS MATEMÁTICAS
              <span className="line2">Y ASEGURA TU INGRESO</span>
            </h1>
            <p className="zt-desc">
              Clases personalizadas de Primaria, Secundaria y Preuniversitario.
              Más de <strong style={{color:"#fff"}}>11 años</strong> formando estudiantes
              que ingresan a la <strong style={{color:"#fff"}}>UNC y la UPN</strong> con confianza.
            </p>
            <div className="zt-tags">
              <span className="zt-tag hl">📐 Matemáticas</span>
              <span className="zt-tag hl">🔣 Razonamiento</span>
              <span className="zt-tag">Álgebra · Geometría · Trigonometría</span>
              <span className="zt-tag">Física · Aritmética</span>
            </div>
            <div className="zt-ctas">
              <a href="https://wa.me/51946323273" className="zt-btn-wa"
                 target="_blank" rel="noreferrer">
                💬 Escribir por WhatsApp
              </a>
              <button className="zt-btn-outline"
                      onClick={()=>document.getElementById("niveles")?.scrollIntoView({behavior:"smooth"})}>
                Ver niveles →
              </button>
            </div>
            <div className="zt-stats">
              <div className="zt-stat"><div className="zt-stat-n">11+</div><div className="zt-stat-l">Años de experiencia</div></div>
              <div className="zt-stat"><div className="zt-stat-n">S/160</div><div className="zt-stat-l">Al mes</div></div>
              <div className="zt-stat"><div className="zt-stat-n">98%</div><div className="zt-stat-l">Aprobación</div></div>
            </div>
          </div>
          <div className="zt-visual">
            <div className="zt-badge">
              <div className="zt-badge-pct">20%</div>
              <div className="zt-badge-txt">DSCTO primeros 10</div>
            </div>
            <div className="zt-card">
              <div className="zt-card-hd">
                <div className="zt-card-logo">🦉</div>
                <div>
                  <div className="zt-card-ttl">ZTRILCE</div>
                  <div className="zt-card-sub">Academia de Matemáticas</div>
                </div>
              </div>
              <div className="zt-sched">
                <div className="zt-days">LUN · MIÉ · VIE</div>
                <div className="zt-time">09:00 am — 11:00 am</div>
              </div>
              <div className="zt-price-row">
                <div className="zt-price">S/ 160</div>
                <div className="zt-price-lbl">mensual<br/>por alumno</div>
              </div>
              <div className="zt-card-srvs">
                {["Apoyo con tus tareas","Reforzamiento y nivelación","Preparación para exámenes"].map((s,i)=>(
                  <div key={i} className="zt-card-srv"><span className="zt-sdot"/>{s}</div>
                ))}
              </div>
              <div className="zt-teacher">
                <div className="zt-tav">👨‍🏫</div>
                <div>
                  <div className="zt-tname">Ing. Deivy Saldaña</div>
                  <div className="zt-trole">Docente titular · Egresado UNC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OFERTA */}
      <div className="zt-band">
        <span style={{fontSize:"1.4rem",position:"relative",zIndex:1}}>🔥</span>
        <span className="zt-band-txt">
          ¡OFERTA ESPECIAL! Los primeros <strong>10 inscritos</strong> obtienen <strong>20% DE DESCUENTO</strong>
        </span>
        <a href="https://wa.me/51946323273" className="zt-band-btn"
           target="_blank" rel="noreferrer">¡Me inscribo ya!</a>
      </div>

      {/* NIVELES */}
      <section id="niveles" className="zt-section">
        <div className="zt-inner">
          <div className="zt-stag">Lo que enseñamos</div>
          <h2 className="zt-stitle">NIVELES Y MATERIAS</h2>
          <p className="zt-ssub">Cubrimos todos los niveles académicos con un plan de estudios estructurado y orientado a resultados.</p>
          <div className="zt-lv-grid">
            {LEVELS.map((l,i)=>(
              <div key={i} className={`zt-lv ${l.cls}`}>
                <div className="zt-lv-icon">{l.icon}</div>
                <div className="zt-lv-badge">{l.badge}</div>
                <div className="zt-lv-name">{l.name}</div>
                <div className="zt-lv-subs">
                  {l.subs.map((s,j)=>(<div key={j} className="zt-lv-sub"><span className="zt-lv-bul"/>{s}</div>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="zt-section" style={{background:"var(--navy2)"}}>
        <div className="zt-inner">
          <div className="zt-stag">Nuestros servicios</div>
          <h2 className="zt-stitle">¿QUÉ HACEMOS POR TI?</h2>
          <p className="zt-ssub">Cada clase está diseñada para que no solo apruebes, sino que de verdad entiendas cada tema.</p>
          <div className="zt-srv-grid">
            {SERVICES.map((s,i)=>(
              <div key={i} className="zt-srv-card">
                <div className="zt-srv-ic">{s.icon}</div>
                <div className="zt-srv-ttl">{s.title}</div>
                <div className="zt-srv-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS */}
      <section id="porqué" className="zt-section">
        <div className="zt-inner">
          <div className="zt-why-grid">
            <div>
              <div className="zt-stag">Por qué elegirnos</div>
              <h2 className="zt-stitle">UNA ACADEMIA CON RESULTADOS REALES</h2>
              <p className="zt-ssub" style={{marginBottom:0}}>Nuestra metodología combina experiencia, dedicación y acompañamiento cercano.</p>
            </div>
            <div className="zt-proof">
              {WHY_ITEMS.map((w,i)=>(
                <div key={i} className="zt-proof-row">
                  <div className={`zt-proof-ic ${w.cls}`}>{w.icon}</div>
                  <div>
                    <div className="zt-proof-ttl">{w.title}</div>
                    <div className="zt-proof-desc">{w.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="zt-section" style={{background:"var(--navy2)"}}>
        <div className="zt-inner">
          <div className="zt-stag">Testimonios</div>
          <h2 className="zt-stitle">LO QUE DICEN NUESTROS ALUMNOS</h2>
          <p className="zt-ssub">Resultados que hablan por sí solos.</p>
          <div className="zt-testi-grid">
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="zt-testi">
                <div className="zt-stars">{t.stars}</div>
                <div className="zt-testi-txt">"{t.text}"</div>
                <div className="zt-testi-auth">
                  <div className="zt-testi-av">{t.name[0]}</div>
                  <div>
                    <div className="zt-testi-name">{t.name}</div>
                    <div className="zt-testi-niv">{t.nivel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="zt-section">
        <div className="zt-inner">
          <div className="zt-stag">Contáctanos</div>
          <h2 className="zt-stitle">MATRÍCULAS ABIERTAS</h2>
          <p className="zt-ssub">¿Listo para mejorar tus notas? Escríbenos o visítanos.</p>
          <div className="zt-contact-grid">
            <div className="zt-cinfo">
              {[
                {ic:"📍",label:"Dirección",           val:"Jr. Revilla Pérez 325\nA media cuadra del Estadio Municipal"},
                {ic:"📞",label:"Celular / WhatsApp",   val:"946 323 273"},
                {ic:"🕐",label:"Horario de clases",    val:"Lunes · Miércoles · Viernes\n09:00 am – 11:00 am"},
                {ic:"💰",label:"Costo mensual",        val:"S/ 160 por alumno"},
                {ic:"👨‍🏫",label:"Docente titular",    val:"Ing. Deivy Saldaña"},
              ].map((r,i)=>(
                <div key={i} className="zt-crow">
                  <div className="zt-cic">{r.ic}</div>
                  <div>
                    <div className="zt-clabel">{r.label}</div>
                    <div className="zt-cval" style={{whiteSpace:"pre-line"}}>{r.val}</div>
                  </div>
                </div>
              ))}
              <a href="https://wa.me/51946323273" className="zt-btn-wa"
                 target="_blank" rel="noreferrer" style={{justifyContent:"center"}}>
                💬 Escribir por WhatsApp ahora
              </a>
            </div>

            {/* FORMULARIO CON LÓGICA */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="zt-footer">
        <div className="zt-footer-inner">
          <a href="#inicio" className="zt-brand" style={{textDecoration:"none"}}>
            <div className="zt-brand-icon">🦉</div>
            <span className="zt-brand-name">ZTRILCE</span>
          </a>
          <div className="zt-flinks">
            <a href="#niveles">Niveles</a>
            <a href="#servicios">Servicios</a>
            <a href="#porqué">Nosotros</a>
            <a href="#contacto">Contacto</a>
          </div>
        </div>
        <div className="zt-fcopy">
          © 2026 Academia Ztrilce · Jr. Revilla Pérez 325, Cajamarca · 946 323 273 · Todos los derechos reservados.
        </div>
      </footer>

      {/* MODAL LOGIN */}
      {showModal && (
        <LoginModal
          onClose={()=>setShowModal(false)}
          setIsAuth={setIsAuth}
        />
      )}
    </div>
  );
}

export default ZtrilceAcademy;
