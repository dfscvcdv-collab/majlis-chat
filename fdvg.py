import os
import json
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import uvicorn

app = FastAPI()

# --- محرك الألعاب (منطق الأونلاين) ---
class QallabiServer:
    def __init__(self):
        self.rooms = {}

    async def connect(self, ws: WebSocket, room: str):
        await ws.accept()
        if room not in self.rooms: self.rooms[room] = []
        self.rooms[room].append(ws)

    async def broadcast(self, room: str, data: dict):
        if room in self.rooms:
            for conn in self.rooms[room]:
                await conn.send_json(data)

server = QallabiServer()

# --- واجهة الموقع الرئيسية (تصميم نيون فخم للبي سي) ---
@app.get("/")
async def index():
    html_content = """
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>منصة القلابي | AL-QALLABI</title>
        <style>
            body { background: #000; color: #39FF14; font-family: 'Cairo', sans-serif; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
            .launcher { width: 900px; height: 600px; border: 2px solid #39FF14; box-shadow: 0 0 30px #39FF1450; display: flex; background: #0a0a0a; border-radius: 15px; }
            .sidebar { width: 250px; border-left: 1px solid #39FF1430; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
            .game-list { flex-grow: 1; padding: 30px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .game-card { border: 1px solid #39FF1440; padding: 20px; text-align: center; cursor: pointer; transition: 0.3s; border-radius: 10px; background: #111; }
            .game-card:hover { background: #39FF14; color: black; transform: translateY(-5px); box-shadow: 0 0 20px #39FF14; }
            h1 { text-shadow: 0 0 10px #39FF14; }
            .btn-nav { padding: 10px; border: 1px solid #39FF14; color: #39FF14; text-decoration: none; text-align: center; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>☢️ مـنـصـة الـقـلابـي ☢️</h1>
        <div class="launcher">
            <div class="sidebar">
                <h3>القائمة</h3>
                <a href="/" class="btn-nav">الرئيسية</a>
                <a href="#" class="btn-nav">المتجر</a>
                <a href="#" class="btn-nav">الرتب</a>
                <div style="margin-top: auto; font-size: 12px; color: #39FF1480;">RTX 5060 DETECTED</div>
            </div>
            <div class="game-list">
                <div class="game-card" onclick="location.href='/play/horror'">👹 هروب الرعب</div>
                <div class="game-card" onclick="location.href='/play/outlier'">🕵️ برا السالفة</div>
                <div class="game-card" onclick="location.href='/play/shooter'">🔫 شوتر نيون</div>
                <div class="game-card" onclick="location.href='/play/racing'">🏎️ سباق سيارات</div>
                <div class="game-card" onclick="location.href='/play/draw'">🎨 رسم وتخمين</div>
                <div class="game-card" onclick="location.href='/play/numbers'">🔢 فوق ولا تحت</div>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

# --- نظام تشغيل الألعاب ---
@app.get("/play/{game_id}")
async def play(game_id: str):
    return HTMLResponse(content=f"""
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>القلابي - {game_id}</title>
        <style>
            body {{ background: #000; color: #39FF14; font-family: 'Cairo', sans-serif; text-align: center; margin: 0; }}
            canvas {{ border: 2px solid #39FF14; background: #050505; margin-top: 20px; cursor: crosshair; }}
            .ui {{ padding: 20px; border-bottom: 2px solid #39FF14; background: #0a0a0a; }}
        </style>
    </head>
    <body>
        <div class="ui">
            <h2>لعبة: {game_id.upper()} | أونلاين 🟢</h2>
            <button onclick="location.href='/'" style="background:red; color:white; border:none; padding:10px;">خروج</button>
        </div>
        <canvas id="screen" width="900" height="500"></canvas>
        <script>
            let ws = new WebSocket(`ws://${{window.location.host}}/ws/{game_id}`);
            let canvas = document.getElementById('screen');
            let ctx = canvas.getContext('2d');
            
            // نظام الحركة أونلاين للبي سي (WASD)
            window.addEventListener('keydown', (e) => {{
                ws.send(JSON.stringify({{ action: 'move', key: e.key, x: Math.random()*800, y: Math.random()*400 }}));
            }});

            ws.onmessage = (event) => {{
                let data = JSON.parse(event.data);
                // هنا المحرك يرسم تحركات أخوياك
                ctx.clearRect(0,0,900,500);
                ctx.fillStyle = "#39FF14";
                ctx.fillRect(data.x || 100, data.y || 100, 50, 50);
                ctx.fillText("لاعب يتحرك...", (data.x || 100), (data.y || 100) - 10);
            }};
        </script>
    </body>
    </html>
    """)

# --- WebSocket قلب الأونلاين ---
@app.websocket("/ws/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str):
    await server.connect(websocket, game_id)
    try:
        while True:
            data = await websocket.receive_json()
            await server.broadcast(game_id, data)
    except WebSocketDisconnect:
        server.rooms[game_id].remove(websocket)

if __name__ == "__main__":
    print("🚀 منصة القلابي انطلقت! الرابط: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
