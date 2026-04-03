import streamlit as st
import random
import time

# 1. إعدادات الصفحة
st.set_page_config(page_title="عجلة الحظ - حيوان جماد", page_icon="🎡")

# 2. تهيئة الذاكرة (حفظ الأسماء والحالات)
if 'players' not in st.session_state:
    st.session_state.players = []
if 'winner' not in st.session_state:
    st.session_state.winner = None
if 'char' not in st.session_state:
    st.session_state.char = ""

# --- قائمة الحروف العربية ---
ARABIC_CHARS = "أبتثجحخدذرزسشصضطظعغفقكلمنهوي"

# 3. تنسيق الواجهة (CSS)
st.markdown("""
    <style>
    .main { background-color: #0e1117; }
    div.stButton > button {
        width: 100%;
        border-radius: 15px;
        height: 60px;
        font-size: 20px;
        font-weight: bold;
        background-color: #ff4b4b;
        color: white;
        border: none;
        transition: 0.3s;
    }
    div.stButton > button:hover {
        background-color: #ff2b2b;
        transform: scale(1.02);
    }
    .winner-card {
        background-color: #1e1e1e;
        padding: 40px;
        border-radius: 30px;
        text-align: center;
        border: 5px solid #ff4b4b;
        box-shadow: 0px 10px 30px rgba(255, 75, 75, 0.3);
    }
    .char-display {
        font-size: 100px;
        color: #00d4ff;
        font-weight: bold;
        margin: 20px 0;
    }
    .player-tag {
        background-color: #262730;
        padding: 8px 15px;
        border-radius: 10px;
        margin: 4px;
        display: inline-block;
        border: 1px solid #444;
    }
    h1, h2, h3 { text-align: center; color: white; }
    </style>
    """, unsafe_allow_html=True)

# --- واجهة الإعداد ---
st.title("🎡 لعبة عجلة الحظ")
st.write("أضف أسماء الربع، حط الجوال بالنص، والعب!")

# إضافة لاعبين
col1, col2 = st.columns([3, 1])
with col1:
    name_in = st.text_input("اسم اللاعب:", placeholder="اكتب الاسم هنا...", key="input_name")
with col2:
    st.write("##") # موازنة المسافة
    if st.button("➕"):
        if name_in.strip():
            if name_in not in st.session_state.players:
                st.session_state.players.append(name_in.strip())
                st.rerun()

# عرض الأسماء الحالية
if st.session_state.players:
    st.write("---")
    st.write("👥 **اللاعبون الآن:**")
    names_html = "".join([f'<div class="player-tag">{p}</div>' for p in st.session_state.players])
    st.markdown(names_html, unsafe_allow_html=True)
    
    if st.button("🗑️ مسح جميع الأسماء"):
        st.session_state.players = []
        st.session_state.winner = None
        st.rerun()

st.divider()

# --- منطق اللعبة ---
if len(st.session_state.players) < 2:
    st.info("💡 أضف لاعبين (2 على الأقل) عشان تبدأ اللفة!")
else:
    if st.button("🚀 لـف العجلة!"):
        # أنيميشن الدوران العشوائي
        placeholder = st.empty()
        for i in range(15):
            temp_p = random.choice(st.session_state.players)
            placeholder.markdown(f"<h2 style='color: #555;'>🔄 يدور... {temp_p}</h2>", unsafe_allow_html=True)
            time.sleep(0.08)
        
        # اختيار الفائز والحرف
        st.session_state.winner = random.choice(st.session_state.players)
        st.session_state.char = random.choice(ARABIC_CHARS)
        st.balloons()

    # عرض النتيجة
    if st.session_state.winner:
        st.markdown(f"""
        <div class="winner-card">
            <p style="font-size: 20px; color: #aaa;">وقع الاختيار على:</p>
            <h1 style="font-size: 50px; color: white;">{st.session_state.winner}</h1>
            <hr style="border-color: #444;">
            <p style="font-size: 18px; color: #aaa;">لازم يذكر (اسم، حيوان، جماد، بلاد) بحرف:</p>
            <div class="char-display">{st.session_state.char}</div>
        </div>
        """, unsafe_allow_html=True)
        
        if st.button("🔄 جولة جديدة"):
            st.session_state.winner = None
            st.rerun()
