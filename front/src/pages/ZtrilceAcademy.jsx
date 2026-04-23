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
/* HAMBURGER */
.zt-hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;cursor:pointer;background:none;border:none;padding:6px;border-radius:8px;transition:background .2s;}
.zt-hamburger:hover{background:rgba(255,255,255,.07);}
.zt-hamburger span{display:block;width:22px;height:2px;background:var(--white);border-radius:2px;transition:all .3s;}
.zt-hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
.zt-hamburger.open span:nth-child(2){opacity:0;}
.zt-hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
/* MOBILE MENU */
.zt-mobile-menu{display:none;position:fixed;top:70px;left:0;right:0;background:rgba(6,16,31,.98);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);z-index:199;padding:16px 6% 20px;flex-direction:column;gap:4px;animation:zt-fi .2s ease;}
.zt-mobile-menu.open{display:flex;}
.zt-mobile-menu a{color:var(--muted);font-size:.9rem;font-weight:600;text-decoration:none;letter-spacing:.03em;text-transform:uppercase;padding:12px 4px;border-bottom:1px solid var(--border);transition:color .2s;}
.zt-mobile-menu a:last-of-type{border-bottom:none;}
.zt-mobile-menu a:hover{color:var(--cyan);}
.zt-mobile-login-btn{margin-top:10px;width:100%;padding:12px;border-radius:9px;border:none;background:linear-gradient(135deg,var(--blue),var(--blue-lt));color:#fff;font-family:'Nunito',sans-serif;font-size:.88rem;font-weight:800;cursor:pointer;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 4px 16px rgba(21,101,192,.4);transition:opacity .2s;}
.zt-mobile-login-btn:hover{opacity:.88;}
/* RESPONSIVE */
@media(max-width:900px){
  .zt-nav-links{display:none;}
  .zt-btn-login{display:none;}
  .zt-hamburger{display:flex;}
  .zt-hero-inner{grid-template-columns:1fr;gap:36px;}
  .zt-visual{display:flex;justify-content:center;}
  .zt-card{width:100%;max-width:380px;}
  .zt-why-grid{grid-template-columns:1fr;gap:28px;}
  .zt-contact-grid{grid-template-columns:1fr;gap:28px;}
  .zt-hero{padding:100px 5% 50px;}
  .zt-section{padding:70px 5%;}
}
@media(max-width:600px){
  .zt-ctas{flex-direction:column;}
  .zt-ctas .zt-btn-wa,.zt-ctas .zt-btn-outline{width:100%;justify-content:center;}
  .zt-stats{gap:16px;flex-wrap:wrap;}
  .zt-lv-grid{grid-template-columns:1fr;}
  .zt-cgrid{grid-template-columns:1fr;}
  .zt-modal{padding:28px 18px;}
  .zt-section{padding:56px 5%;}
  .zt-hero{padding:88px 5% 40px;}
  .zt-band{flex-direction:column;text-align:center;gap:10px;padding:18px 5%;}
  .zt-band-btn{width:100%;text-align:center;}
  .zt-testi-grid{grid-template-columns:1fr;}
  .zt-srv-grid{grid-template-columns:1fr 1fr;}
  .zt-footer-inner{flex-direction:column;align-items:flex-start;gap:14px;}
  .zt-flinks{flex-wrap:wrap;gap:14px;}
  .zt-card{max-width:100%;}
  .zt-badge{top:-14px;right:10px;width:90px;height:90px;}
  .zt-badge-pct{font-size:1.6rem;}
}
@media(max-width:420px){
  .zt-srv-grid{grid-template-columns:1fr;}
  .zt-stats{flex-direction:column;gap:12px;}
  .zt-stitle{font-size:2rem;}
}
/* QR PAGO */
.zt-qr-card{background:linear-gradient(135deg,rgba(6,16,31,.95),rgba(11,30,56,.95));border:1px solid rgba(255,183,3,.25);border-radius:16px;padding:24px 20px;text-align:center;position:relative;overflow:hidden;}
.zt-qr-card::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(255,183,3,.08) 0%,transparent 70%);pointer-events:none;}
.zt-qr-top{font-size:.72rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-bottom:6px;position:relative;z-index:1;}
.zt-qr-title{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:.04em;color:var(--white);line-height:1.1;margin-bottom:4px;position:relative;z-index:1;}
.zt-qr-sub{font-size:.8rem;color:var(--muted);font-weight:600;margin-bottom:16px;position:relative;z-index:1;}
.zt-qr-frame{display:inline-block;padding:10px;background:white;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.4),0 0 0 1px rgba(255,183,3,.3);position:relative;z-index:1;}
.zt-qr-frame img{display:block;width:160px;height:160px;border-radius:6px;}
.zt-qr-label{margin-top:4px;font-size:.65rem;font-weight:800;color:rgba(0,0,0,.5);text-transform:uppercase;letter-spacing:.06em;}
.zt-qr-footer{margin-top:14px;font-size:.8rem;font-weight:700;color:var(--muted);display:flex;align-items:center;justify-content:center;gap:7px;position:relative;z-index:1;}
.zt-qr-footer a{color:var(--gold);text-decoration:none;font-weight:800;}
.zt-qr-footer a:hover{text-decoration:underline;}
.zt-qr-steps{display:flex;flex-direction:column;gap:8px;margin-top:14px;text-align:left;position:relative;z-index:1;}
.zt-qr-step{display:flex;align-items:flex-start;gap:10px;font-size:.78rem;color:var(--muted);font-weight:600;}
.zt-qr-step-n{width:20px;height:20px;border-radius:50%;background:rgba(255,183,3,.15);border:1px solid rgba(255,183,3,.3);color:var(--gold);font-size:.68rem;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}

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

/* == NAVBAR == */
function Navbar({ onLogin }) {
  const [sc, setSc] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(()=>{
    const fn = ()=>setSc(window.scrollY>20);
    window.addEventListener("scroll",fn);
    return ()=>window.removeEventListener("scroll",fn);
  },[]);
  const closeMenu = () => setMenuOpen(false);
  return (
    <>
      <nav className={`zt-nav${sc?" sc":""}`}>
        <a href="#inicio" className="zt-brand">
          <div className="zt-brand-icon">&#x1F989;</div>
          <span className="zt-brand-name">ZTRILCE</span>
        </a>
        <ul className="zt-nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#niveles">Niveles</a></li>
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#porqu&#xE9;">Nosotros</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
        <button className="zt-btn-login" onClick={onLogin}>Iniciar sesi&#xF3;n</button>
        <button className={`zt-hamburger${menuOpen?" open":""}`}
                onClick={()=>setMenuOpen(p=>!p)} aria-label="Men&#xFA;">
          <span/><span/><span/>
        </button>
      </nav>
      <div className={`zt-mobile-menu${menuOpen?" open":""}`}>
        <a href="#inicio"    onClick={closeMenu}>Inicio</a>
        <a href="#niveles"   onClick={closeMenu}>Niveles</a>
        <a href="#servicios" onClick={closeMenu}>Servicios</a>
        <a href="#porqu&#xE9;"    onClick={closeMenu}>Nosotros</a>
        <a href="#contacto"  onClick={closeMenu}>Contacto</a>
        <button className="zt-mobile-login-btn"
                onClick={()=>{ closeMenu(); onLogin(); }}>
          Iniciar sesi&#xF3;n
        </button>
      </div>
    </>
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
              <div className="zt-stat"><div className="zt-stat-n" style={{fontSize:"1.1rem",lineHeight:"1.4"}}>PRECIOS<br/>ACCESIBLES</div><div className="zt-stat-l">Para todos</div></div>
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
                <div className="zt-time">☀️ Mañana: 9:00 – 11:00 am</div>
                <div className="zt-time" style={{marginTop:4}}>🌇 Tarde: 3:00–5:00 pm · 4:00–6:00 pm</div>
              </div>
              <div className="zt-price-row">
                <div style={{fontSize:"1.4rem"}}>💰</div>
                <div>
                  <div className="zt-price" style={{fontSize:"1.15rem",letterSpacing:".01em",lineHeight:1.2}}>PRECIOS ACCESIBLES</div>
                  <div className="zt-price-lbl">consulta disponibilidad</div>
                </div>
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
                {ic:"🕐",label:"Horario de clases",    val:"Lunes · Miércoles · Viernes\n☀️ Mañana: 9:00 – 11:00 am\n🌇 Tarde: 3:00–5:00 pm  ·  4:00–6:00 pm"},
                {ic:"💰",label:"Costo mensual",        val:"Precios accesibles\nConsúltanos por WhatsApp"},
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
              {/* QR DE PAGO */}
              <div className="zt-qr-card">
                <div className="zt-qr-top">💳 Reserva tu vacante ahora</div>
                <div className="zt-qr-title">Paga con Plin</div>
                <div className="zt-qr-sub">Escanea el QR y asegura tu cupo</div>
                <div className="zt-qr-frame">
                  <img src="data:image/png;base64,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" alt="QR Plin - Pago Academia Ztrilce" />
                  <div className="zt-qr-label">plin · Deivy Saldaña</div>
                </div>
                <div className="zt-qr-steps">
                  <div className="zt-qr-step">
                    <div className="zt-qr-step-n">1</div>
                    <span>Escanea el código QR con tu app bancaria o Plin</span>
                  </div>
                  <div className="zt-qr-step">
                    <div className="zt-qr-step-n">2</div>
                    <span>Realiza el pago de la matrícula o adelanto</span>
                  </div>
                  <div className="zt-qr-step">
                    <div className="zt-qr-step-n">3</div>
                    <span>📲 Envíanos tu comprobante por WhatsApp</span>
                  </div>
                </div>
              </div>

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
