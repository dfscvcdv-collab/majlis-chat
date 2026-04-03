import streamlit as st
import random
import time

# 1. إعدادات الصفحة
st.set_page_config(page_title="عجلة الحظ الجماعية", page_icon="🎡", layout="centered")

# 2. تهيئة الذاكرة
if 'players' not in st.session_state:
    st.session_state.players = []
if 'game_stage' not in st.session_state:
    st.session_state.game_stage = 'setup' # setup or round
if 'winner_name' not in st.session_state:
    st.session_state.winner_name = ""
if 'lucky_char' not in st.session_state:
    st.session_state.lucky_char = ""

ARABIC_CHARS = "أبتثجحخدذرزسشصضطظعغفقكلمنهوي"

# 3. CSS للأنيميشن والسهم والدوران
st.markdown("""
    <style>
    .main { background-color: #0e1117; text-align: center; }
    
    /* أنيميشن السهم */
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(3600deg); } /* يدور 10 مرات */
    }

    .arrow-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
        position: relative;
        margin: 50px 0;
    }

    .spinning-arrow {
        font-size: 80px;
        transition: transform 3s cubic-bezier(0.15, 0, 0.15, 1);
        display: inline-block;
        z-index: 10;
    }

    .player-circle {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px dashed #444;
    }

    .result-card {
        background-color: #1e1e1e;
        padding: 20px;
        border-radius: 20px;
        border: 2px solid #ff4b4b;
        margin-top: 20px;
    }

    .char-big {
        font-size: 70px;
        color: #03dac6;
        font-weight: bold;
    }
    
    button { height: 50px !important; }
    </style>
    """, unsafe_allow_html=True)

# --- المرحلة الأولى: إعداد الأسماء ---
if st.session_state.game_stage == 'setup':
    st.title("🎡 إعداد لعبة السهم")
    st.write("أضف الأسماء وحط الجوال بالنص")

    col1, col2 = st.columns([3, 1])
    with col1:
        name_in = st.text_input("اسم اللاعب:", key="add_name_input")
    with col2:
        st.write("##")
        if st.button("➕"):
            if name_in.strip() and name_in not in st.session_state.players:
                st.session_state.players.append(name_in.strip())
                st.rerun()

    if st.session_state.players:
        st.write("👥 **اللاعبون المضافون:**")
        cols = st.columns(3)
        for i, p in enumerate(st.session_state.players):
            cols[i % 3].info(p)
        
        st.divider()
        if len(st.session_state.players) >= 2:
            if st.button("🚀 ابدأ الجولة - حط الجوال بالنص"):
                st.session_state.game_stage = 'round'
                st.session_state.winner_name = ""
                st.rerun()
        
        if st.button("🗑️ مسح الكل"):
            st.session_state.players = []
            st.rerun()

# --- المرحلة الثانية: شاشة الدوران (الجولة) ---
elif st.session_state.game_stage == 'round':
    st.title("🎯 من المحظوظ؟")
    st.write("الجوال في المنتصف..")

    # حاوية السهم
    arrow_placeholder = st.empty()
    
    # زر اللف
    if st.session_state.winner_name == "":
        if st.button("🔄 لـف السهم!"):
            # نختار فائز وحرف سراً
            st.session_state.winner_name = random.choice(st.session_state.players)
            st.session_state.lucky_char = random.choice(ARABIC_CHARS)
            
            # أنيميشن وهمي بسيط قبل العرض
            with arrow_placeholder.container():
                st.markdown('<div class="arrow-container"><div class="spinning-arrow" style="animation: spin 1s infinite linear;">⬆️</div></div>', unsafe_allow_html=True)
                time.sleep(2)
            st.rerun()
        else:
            # السهم ثابت قبل البدء
            st.markdown('<div class="arrow-container"><div class="spinning-arrow">⬆️</div></div>', unsafe_allow_html=True)
    
    # عرض النتيجة بعد اللف
    if st.session_state.winner_name != "":
        # السهم مائل بزاوية عشوائية للجمالية
        random_angle = random.randint(0, 360)
        st.markdown(f'''
            <div class="arrow-container">
                <div class="spinning-arrow" style="transform: rotate({random_angle}deg);">⬆️</div>
            </div>
            <div class="result-card">
                <h3>وقع الاختيار على:</h3>
                <h1 style="color: #ff4b4b;">{st.session_state.winner_name}</h1>
                <p>اذكر (جماد، حيوان، اسم) بحرف:</p>
                <div class="char-big">{st.session_state.lucky_char}</div>
            </div>
        ''', unsafe_allow_html=True)
        
        st.balloons()
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🔄 جولة ثانية"):
                st.session_state.winner_name = ""
                st.rerun()
        with col2:
            if st.button("⚙️ تغيير الأسماء"):
                st.session_state.game_stage = 'setup'
                st.rerun()
