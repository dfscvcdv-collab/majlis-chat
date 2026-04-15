from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

app = FastAPI()

# دالة لقراءة ملفات الـ HTML اللي أنت صممتها
def get_html(folder_name):
    path = f"{folder_name}/code.html"
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>الملف غير موجود! تأكد من المسار</h1>"

# الصفحة الرئيسية (المنصة)
@app.get("/")
async def home():
    return HTMLResponse(content=get_html("_1"))

# صفحة اللوبيات (Lobbies)
@app.get("/lobbies")
async def lobbies():
    return HTMLResponse(content=get_html("_2"))

# صفحة المتجر (Shop)
@app.get("/shop")
async def shop():
    return HTMLResponse(content=get_html("_3"))

# صفحة الرتب (Rank)
@app.get("/rank")
async def rank():
    return HTMLResponse(content=get_html("_4"))

# --- نظام الأونلاين (المخ) ---
@app.websocket("/ws/game")
async def game_socket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # هنا نستقبل الحركات والرسم والأسئلة من أخوياك
            data = await websocket.receive_text()
            # نرسلها للكل في نفس اللحظة
            await websocket.send_text(f"Update: {data}")
    except WebSocketDisconnect:
        print("أحد أخوياك طلع من اللعبة")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)