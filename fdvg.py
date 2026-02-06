import streamlit as st
import os

# إعداد الصفحة
st.set_page_config(page_title="مجلس الربع", page_icon="💬")

# إنشاء مخزن للرسائل إذا لم يكن موجوداً
if "messages" not in st.session_state:
    st.session_state.messages = []

st.title("💬 غرفة سوالف العيال")
st.write("---")

# عرض الرسايل القديمة
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])
        if "file" in msg:
            if msg["type"].startswith("image"):
                st.image(msg["file"])
            else:
                st.download_button("تحميل ملف", msg["file"], file_name=msg["file_name"])

# منطقة الإدخال
prompt = st.chat_input("اكتب شيئاً...")
uploaded_file = st.sidebar.file_uploader("ارفع صورة أو ملف صوتي", type=['png', 'jpg', 'mp3', 'pdf'])

if prompt:
    # عرض رسالتك فوراً
    with st.chat_message("user"):
        st.write(prompt)
    # حفظها في الذاكرة
    st.session_state.messages.append({"role": "user", "content": prompt})

if uploaded_file is not None:
    file_bytes = uploaded_file.getvalue()
    st.session_state.messages.append({
        "role": "user", 
        "content": f"أرسل ملف: {uploaded_file.name}",
        "file": file_bytes,
        "type": uploaded_file.type,
        "file_name": uploaded_file.name
    })
    st.sidebar.success("تم الرفع!")
    st.rerun()