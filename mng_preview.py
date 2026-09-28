#!/usr/bin/env python3
import base64, hmac, os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

USER = os.environ.get("PREVIEW_USER", "preview")
PASSWORD = os.environ.get("PREVIEW_PASSWORD", "MNG-360-2026")
PORT = int(os.environ.get("PORT", "10000"))

PAGE = r'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Mr. Nice Guys — Explore Brevard 360 Private Preview</title>
<style>
:root{--bg:#071018;--ink:#f7f8fb;--muted:#a7b0bd;--cyan:#23d5ff;--pink:#ff3ca6;--lime:#72ff7e;--orange:#ff9b35;--purple:#875dff}
*{box-sizing:border-box} html,body{margin:0;background:#05080d;color:var(--ink);font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
body{overflow-x:hidden}.top{position:fixed;z-index:30;left:0;right:0;top:0;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(#05080dea,#05080d70,transparent);backdrop-filter:blur(5px)}
.brand{font-weight:900;letter-spacing:.06em}.brand b{color:var(--cyan)}.private{font-size:12px;border:1px solid #ff496a;color:#ff8399;padding:7px 10px;border-radius:999px;background:#2a0711cc}
.viewer{height:72vh;min-height:520px;position:relative;overflow:hidden;touch-action:none;cursor:grab;background:#142030}.viewer:active{cursor:grabbing}
.world{position:absolute;height:100%;width:280%;left:-90%;top:0;will-change:transform;background:
radial-gradient(circle at 49% 34%,#ffb45a 0 4%,#d9677b 10%,transparent 27%),
linear-gradient(180deg,#181944 0%,#59295d 32%,#ff865c 50%,#101c25 51%,#061018 100%);}
.skyGlow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 0 40%,#02060b88 85%)}
.water{position:absolute;left:0;right:0;bottom:0;height:27%;background:linear-gradient(#142631,#081219);border-top:1px solid #ffb86980}
.palms{position:absolute;bottom:26%;left:0;right:0;height:45%;opacity:.82;background:
repeating-linear-gradient(87deg,transparent 0 8%,#071017 8.2% 8.45%,transparent 8.7% 17%)}
.street{position:absolute;left:0;right:0;bottom:0;height:37%;background:linear-gradient(175deg,#1d2028 0 35%,#11141c 35% 100%);clip-path:polygon(0 44%,100% 44%,100% 100%,0 100%)}
.neonRoad{position:absolute;bottom:11%;left:0;right:0;height:5px;background:linear-gradient(90deg,var(--cyan),var(--pink),var(--lime),var(--orange),var(--cyan));box-shadow:0 0 28px #28d6ff}
.shop{position:absolute;left:47.6%;bottom:24%;width:16%;min-width:390px;height:42%;transform:translateX(-50%);background:linear-gradient(145deg,#12151c,#25212b);border:2px solid #402c48;border-radius:26px 26px 5px 5px;box-shadow:0 0 50px #ff3ca633, inset 0 0 80px #000}
.shop:before{content:"";position:absolute;left:5%;right:5%;top:14%;height:22%;border-radius:12px;background:
linear-gradient(100deg,#16d8dd,#ff2f95,#fd9b38,#765cff,#14e5a8);filter:saturate(1.35);box-shadow:0 0 25px #ff42ac88}
.shopSign{position:absolute;top:18%;left:50%;transform:translate(-50%,-50%) rotate(-2deg);font-size:clamp(22px,3.2vw,58px);font-weight:1000;white-space:nowrap;color:white;text-shadow:5px 5px 0 #111,0 0 18px #fff,0 0 38px var(--pink)}
.shopSub{position:absolute;top:34%;left:50%;transform:translateX(-50%);font-size:clamp(11px,1vw,18px);font-weight:800;letter-spacing:.18em;color:#ffe18b}
.windows{position:absolute;left:7%;right:7%;bottom:9%;height:43%;display:flex;gap:3%}.window{flex:1;border:2px solid #775d8f;background:linear-gradient(#13141b,#211329);box-shadow:inset 0 0 35px #ff3ca622,0 0 20px #23d5ff25}
.mural{position:absolute;inset:0;opacity:.28;background:repeating-radial-gradient(circle at 30% 40%,#ff3ca6 0 7px,transparent 8px 32px),repeating-linear-gradient(23deg,transparent 0 28px,#23d5ff 29px 31px,transparent 32px 54px)}
.bus{position:absolute;left:35.5%;bottom:16%;width:15.5%;min-width:360px;height:24%;border-radius:60px 32px 22px 18px;background:linear-gradient(12deg,#16c9c6 0 18%,#ff376b 20% 34%,#f5cd29 36% 44%,#7b5cff 48% 61%,#1bd0c4 65% 100%);border:4px solid #20232a;box-shadow:0 14px 35px #000b,0 0 25px #21e9ff44;transform:skewX(-2deg)}
.bus:before{content:"";position:absolute;left:10%;right:6%;top:14%;height:26%;background:repeating-linear-gradient(90deg,#0a1118 0 13%,#98d6df 13.5% 14.5%,#0a1118 15% 27%);border:4px solid #191d23}
.busText{position:absolute;left:20%;top:53%;font-weight:1000;font-size:clamp(17px,2.25vw,45px);transform:rotate(-4deg);text-shadow:4px 4px #111;color:white;white-space:nowrap}
.wheel{position:absolute;width:14%;aspect-ratio:1;border-radius:50%;background:#10131a;border:7px solid #262b32;bottom:-11%}.w1{left:11%}.w2{right:9%}
.crossover{position:absolute;left:66%;bottom:24%;width:10%;height:35%;border:3px solid #8a6cff;border-radius:50% 50% 8px 8px;box-shadow:0 0 25px #805dff, inset 0 0 25px #5d4fff;background:radial-gradient(circle,#6b50ff44,transparent 62%)}.crossover:after{content:"THE CROSSOVER →";position:absolute;bottom:-28px;left:50%;transform:translateX(-50%);white-space:nowrap;color:#bfb5ff;font-weight:800;font-size:12px}
.busLabel{position:absolute;left:39%;bottom:9%;transform:translateX(-50%);font-size:11px;letter-spacing:.12em;color:#b8fbff}
.hint{position:absolute;z-index:20;bottom:17px;left:50%;transform:translateX(-50%);background:#05080dcc;border:1px solid #ffffff32;border-radius:999px;padding:9px 14px;font-size:12px;color:#d9e1ea}
.actions{position:absolute;z-index:20;left:15px;bottom:60px;display:flex;flex-wrap:wrap;max-width:330px;gap:8px}.action{background:#09111ddb;color:white;border:1px solid #ffffff2c;border-radius:999px;padding:9px 12px;font-weight:750;font-size:12px}.action.active{border-color:var(--cyan);box-shadow:0 0 18px #23d5ff33}
.intro{position:absolute;z-index:20;left:15px;top:76px;max-width:min(560px,88vw);background:#071018d4;border:1px solid #ffffff28;border-radius:18px;padding:18px;backdrop-filter:blur(10px)}.intro small{color:#80f4ff;font-weight:800;letter-spacing:.14em}.intro h1{margin:.35rem 0 .5rem;font-size:clamp(28px,4vw,56px);line-height:.92}.intro p{margin:0;color:#d0d6de;line-height:1.45}
.content{max-width:1120px;margin:0 auto;padding:38px 18px 80px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.card{background:#0b1118;border:1px solid #ffffff19;border-radius:18px;padding:18px}.card h3{margin-top:0}.label{font-size:11px;font-weight:900;letter-spacing:.12em;color:#7cecff}.facts{display:grid;gap:10px}.fact{padding:11px 12px;border-radius:12px;background:#080d13;border:1px solid #ffffff10}.pending{color:#ffc66d}.footer{margin-top:22px;padding:16px;border-radius:14px;background:#190b12;border:1px solid #ff486a55;color:#ffdce2}
@media(max-width:800px){.grid{grid-template-columns:1fr}.viewer{height:78vh}.shop{min-width:320px}.bus{min-width:300px}.intro{top:67px}.actions{bottom:54px}}
</style>
</head>
<body>
<div class="top"><div class="brand">EXPLORE <b>BREVARD 360</b> / BUSINESS PREVIEW</div><div class="private">PRIVATE REVIEW</div></div>
<section class="viewer" id="viewer">
  <div class="world" id="world">
    <div class="skyGlow"></div><div class="palms"></div><div class="water"></div><div class="street"></div><div class="neonRoad"></div>
    <div class="shop"><div class="mural"></div><div class="shopSign">MR. NICE GUYS!</div><div class="shopSub">CREATIVE EDGE • DOWNTOWN ENERGY</div><div class="windows"><div class="window"></div><div class="window"></div><div class="window"></div></div></div>
    <div class="bus"><div class="busText">MR NICE GUYS!</div><div class="wheel w1"></div><div class="wheel w2"></div></div>
    <div class="busLabel">PROMOTIONAL BUS — SIGNATURE LANDMARK</div>
    <div class="crossover"></div>
  </div>
  <div class="intro"><small>PRIVATE CONCEPT • NOT ON THE PUBLIC WORLD</small><h1>Mr. Nice Guys<br>— The Creative Edge</h1><p>A proposed Explore Brevard 360 pocket built around the business's street-art personality and promotional bus. Clean enough for the public world, raw enough to sit near The Crossover.</p></div>
  <div class="actions"><button class="action active">EXPLORE</button><button class="action">LEARN</button><button class="action">MESSAGE</button><button class="action">CALL</button><button class="action">WEBSITE</button><button class="action">SOCIAL</button></div>
  <div class="hint">Drag left/right to explore the concept</div>
</section>
<main class="content">
  <div class="grid">
    <article class="card"><div class="label">PLACEMENT CONCEPT</div><h3>Main Street → Creative Edge District</h3><p>Proposed near—but still on the public side of—The Crossover. The business keeps its real-world identity while getting a more expressive district around it.</p></article>
    <article class="card"><div class="label">SIGNATURE LANDMARK</div><h3>The art bus stays recognizable</h3><p>The bus becomes the first visual cue that tells visitors they found Mr. Nice Guys. It is treated as a landmark, not random decoration.</p></article>
    <article class="card"><div class="label">VISUAL LANGUAGE</div><h3>Street art × Space Coast future</h3><p>Color, murals, layered materials, warm shop lighting and downtown culture—connected to Explore Brevard with restrained near-future lighting and navigation.</p></article>
  </div>
  <h2>Business review record</h2>
  <div class="facts">
    <div class="fact"><b>Business:</b> Mr. Nice Guys Smoke Emporium / Mr. Nice Guys Bodega and Beyond</div>
    <div class="fact"><b>Website:</b> melbournesmokeshop.com</div>
    <div class="fact pending"><b>Current location:</b> PENDING DIRECT CONFIRMATION. Public sources currently disagree because the business is moving.</div>
    <div class="fact"><b>Preview actions:</b> Visit / Learn / Message / Call / Website / Social. These are mock preview controls only; no ordering or product purchase is implemented here.</div>
    <div class="fact"><b>Publish status:</b> NOT APPROVED / NOT PUBLIC. Nothing from this preview is automatically added to Explore Brevard 360.</div>
  </div>
  <div class="footer"><b>What I need from Mr. Nice Guys before publication:</b> confirm the final location, preferred business name, visual direction, contact/action links, and any changes to the environment. Business approval comes before publish.</div>
</main>
<script>
const viewer=document.getElementById('viewer'), world=document.getElementById('world');
let x=0, start=0, dragging=false, base=0;
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function apply(){world.style.transform='translateX('+x+'px)'}
function down(e){dragging=true; start=(e.touches?e.touches[0].clientX:e.clientX); base=x}
function move(e){if(!dragging)return; let cx=(e.touches?e.touches[0].clientX:e.clientX); x=clamp(base+(cx-start)*1.15,-viewer.clientWidth*.78,viewer.clientWidth*.78); apply()}
function up(){dragging=false}
viewer.addEventListener('mousedown',down);window.addEventListener('mousemove',move);window.addEventListener('mouseup',up);
viewer.addEventListener('touchstart',down,{passive:true});viewer.addEventListener('touchmove',move,{passive:true});viewer.addEventListener('touchend',up);
</script>
</body></html>'''

def auth_ok(header):
    if not header or not header.startswith("Basic "): return False
    try:
        raw=base64.b64decode(header.split(" ",1)[1]).decode()
        u,p=raw.split(":",1)
        return hmac.compare_digest(u,USER) and hmac.compare_digest(p,PASSWORD)
    except Exception: return False

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            self.send_response(200); self.end_headers(); self.wfile.write(b"ok"); return
        if not auth_ok(self.headers.get("Authorization")):
            self.send_response(401)
            self.send_header("WWW-Authenticate",'Basic realm="Explore Brevard 360 Private Preview"')
            self.send_header("Cache-Control","no-store")
            self.end_headers()
            self.wfile.write(b"Private preview")
            return
        body=PAGE.encode()
        self.send_response(200)
        self.send_header("Content-Type","text/html; charset=utf-8")
        self.send_header("Content-Length",str(len(body)))
        self.send_header("Cache-Control","no-store, private")
        self.send_header("X-Robots-Tag","noindex, nofollow, noarchive")
        self.send_header("Referrer-Policy","no-referrer")
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, fmt, *args): pass

ThreadingHTTPServer(("0.0.0.0",PORT),Handler).serve_forever()
