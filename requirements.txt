import streamlit as st
import random

# 1. إعدادات الصفحة
st.set_page_config(page_title="لعبة التخمين السرية - المطور", page_icon="🕵️‍♂️")

# 2. تهيئة المتغيرات في الذاكرة
if 'stage' not in st.session_state:
    st.session_state.stage = 'setup'
if 'player_list' not in st.session_state:
    st.session_state.player_list = []
if 'players_data' not in st.session_state:
    st.session_state.players_data = []
if 'current_idx' not in st.session_state:
    st.session_state.current_idx = 0

# 3. تنسيق CSS
st.markdown("""
    <style>
    .main { background-color: #121212; }
    div.stButton > button {
        width: 100%;
        border-radius: 12px;
        background-color: #6200ee;
        color: white;
        font-weight: bold;
    }
    .secret-box {
        background-color: #1e1e1e;
        padding: 25px;
        border-radius: 20px;
        text-align: center;
        border: 3px solid #03dac6;
    }
    .player-tag {
        background-color: #333;
        padding: 5px 15px;
        border-radius: 20px;
        margin: 5px;
        display: inline-block;
        border: 1px solid #555;
    }
    h1, h2, h3, p { text-align: center; }
    </style>
    """, unsafe_allow_html=True)

# --- المرحلة 1: الإعداد ---
if st.session_state.stage == 'setup':
    st.title("🕵️‍♂️ إعداد اللعبة")
    
    range_choice = st.selectbox("اختر نطاق الأرقام:", ["0 - 100", "0 - 1000", "500 - 1000", "100 - 1000"])
    
    col1, col2 = st.columns([4, 1])
    with col1:
        new_name = st.text_input("أدخل اسم اللاعب:", key="name_input_text", placeholder="اكتب الاسم هنا...")
    with col2:
        st.write("##")
        if st.button("➕"):
            if new_name.strip():
                if new_name.strip() not in st.session_state.player_list:
                    st.session_state.player_list.append(new_name.strip())
                    st.rerun()
                else:
                    st.warning("الاسم موجود!")
            else:
                st.error("اكتب اسم!")

    if st.session_state.player_list:
        st.write("### اللاعبين المضافين:")
        names_html = "".join([f'<div class="player-tag">{name}</div>' for name in st.session_state.player_list])
        st.markdown(names_html, unsafe_allow_html=True)
        
        if st.button("🗑️ مسح قائمة الأسماء نهائياً"):
            st.session_state.player_list = []
            st.rerun()

    st.divider()
    
    if st.button("🚀 ابدأ اللعب"):
        if len(st.session_state.player_list) >= 2:
            # تحديد النطاق
            if range_choice == "0 - 100": r_min, r_max = 0, 100
            elif range_choice == "0 - 1000": r_min, r_max = 0, 1000
            elif range_choice == "500 - 1000": r_min, r_max = 500, 1000
            else: r_min, r_max = 100, 1000
            
            # توليد أرقام جديدة للأسماء الموجودة
            st.session_state.players_data = [{"name": name, "number": random.randint(r_min, r_max)} for name in st.session_state.player_list]
            st.session_state.current_idx = 0
            st.session_state.stage = 'distribute'
            st.rerun()
        else:
            st.error("أضف شخصين على الأقل!")

# --- المرحلة 2: توزيع الأرقام ---
elif st.session_state.stage == 'distribute':
    idx = st.session_state.current_idx
    if idx < len(st.session_state.players_data):
        player = st.session_state.players_data[idx]
        st.subheader(f"دور اللاعب: {player['name']}")
        st.info(f"عط الجوال لـ {player['name']}")
        
        if st.checkbox(f"أنا {player['name']}.. عرض الرقم"):
            st.markdown(f"""
            <div class="secret-box">
                <p>رقمك السري هو:</p>
                <h1 style="color: #03dac6; font-size: 50px;">{player['number']}</h1>
                <p>احفظه ولا تعلم أحد!</p>
            </div>
            """, unsafe_allow_html=True)
            
            if st.button("تم، اللي بعده ➡️"):
                st.session_state.current_idx += 1
                st.rerun()
    else:
        st.session_state.stage = 'play'
        st.rerun()

# --- المرحلة 3: شاشة اللعب ---
elif st.session_state.stage == 'play':
    st.title("🎮 بدأت اللعبة!")
    st.balloons()
    
    st.write("### كشف الأرقام (للتأكد من المصداقية 🔍):")
    
    # عرض الأسماء مع إمكانية كشف الرقم السري
    for p in st.session_state.players_data:
        with st.expander(f"👤 اللاعب: {p['name']}"):
            st.write(f"الرقم السري الحقيقي لـ **{p['name']}** هو: `{p['number']}`")

    st.divider()
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔄 جولة جديدة (نفس الأسماء)"):
            # نرجع لمرحلة الإعداد بس الأسماء تبقى محفوظة
            st.session_state.stage = 'setup'
            st.rerun()
    with col2:
        if st.button("🚫 إنهاء ومسح الكل"):
            st.session_state.clear()
            st.rerun()
