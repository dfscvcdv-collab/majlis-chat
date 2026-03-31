import streamlit as st
import os

# إعدادات الصفحة
st.set_page_config(page_title="مركز تحميل الملفات", page_icon="📥")

# تنسيق بسيط للموقع
st.markdown("""
    <style>
    .main { background-color: #0e1117; color: white; }
    .upload-box {
        border: 2px dashed #6200ee;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
    }
    div.stButton > button {
        width: 100%;
        background-color: #03dac6;
        color: black;
        font-weight: bold;
    }
    </style>
    """, unsafe_allow_html=True)

st.title("📥 مركز رفع وتحميل الملفات")
st.write("ارفع ملفك هنا، وأي شخص معه الرابط يقدر يحمله")

# --- قسم الرفع (للمسؤول أو أي شخص) ---
uploaded_file = st.file_uploader("اختر الملف لرفعه", type=None) # type=None يعني يقبل كل الأنواع

if uploaded_file is not None:
    # عرض تفاصيل الملف
    st.success(f"تم تجهيز الملف: {uploaded_file.name}")
    
    # تحويل الملف لبيانات قابلة للتحميل
    bytes_data = uploaded_file.getvalue()
    
    st.divider()
    
    # --- قسم التحميل ---
    st.subheader("⬇️ رابط التحميل المباشر")
    st.download_button(
        label=f"اضغط هنا لتحميل {uploaded_file.name}",
        data=bytes_data,
        file_name=uploaded_file.name,
        mime="application/octet-stream"
    )
    
    st.info("ملاحظة: الرابط شغال طالما الصفحة مفتوحة. إذا سويت تحديث (Refresh) لازم ترفع الملف مرة ثانية.")

# إضافة لمسة "عبود" الخاصة
st.sidebar.markdown("### الإعدادات")
if st.sidebar.button("مسح الملف الحالي"):
    st.rerun()
