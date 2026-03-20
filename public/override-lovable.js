// วางไฟล์นี้ที่ /public/override-lovable.js
// FIXED: ไม่มี cache busting + ไม่โหลดซ้ำ

(function() {
  'use strict';
  
  console.log('%c🎨 LearnHub Branding Override', 'color: #6366f1; font-size: 16px; font-weight: bold');
  
  const LEARNHUB_FAVICON = '/favicon.svg';
  const LEARNHUB_TITLE = 'LearnHub - แพลตฟอร์มเรียนออนไลน์คุณภาพสูง';
  
  let faviconUpdated = false; // ป้องกันอัปเดตซ้ำ
  
  // ฟังก์ชันเปลี่ยน Favicon (ไม่มี cache busting)
  function updateFavicon() {
    // ถ้าอัปเดตแล้ว ไม่ต้องทำซ้ำ
    if (faviconUpdated) return;
    
    // ลบ Lovable favicons ทั้งหมด
    const lovableIcons = document.querySelectorAll('link[rel*="icon"][href*="lovable"]');
    lovableIcons.forEach(icon => {
      console.log('🗑️ Removing Lovable icon:', icon.href);
      icon.remove();
    });
    
    // เช็คว่ามี LearnHub favicon แล้วหรือยัง
    const existingIcon = document.querySelector(`link[rel="icon"][href="${LEARNHUB_FAVICON}"]`);
    if (existingIcon) {
      faviconUpdated = true;
      return;
    }
    
    // ลบ icon ทั้งหมดที่ไม่ใช่ LearnHub
    const allIcons = document.querySelectorAll('link[rel*="icon"]');
    allIcons.forEach(icon => {
      if (!icon.href.includes('favicon.svg')) {
        icon.remove();
      }
    });
    
    // สร้าง LearnHub favicon (ไม่มี ?t=)
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = LEARNHUB_FAVICON; // ← ลบ ?t= ออก!
    document.head.appendChild(link);
    
    faviconUpdated = true;
    console.log('✅ LearnHub favicon installed (no cache busting)');
  }
  
  // ฟังก์ชันเปลี่ยน Title
  function updateTitle() {
    if (document.title !== LEARNHUB_TITLE) {
      document.title = LEARNHUB_TITLE;
      console.log('✅ Title updated to:', LEARNHUB_TITLE);
    }
  }
  
  // ฟังก์ชันเปลี่ยน Meta Tags
  function updateMetaTags() {
    // อัพเดท og:title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content !== LEARNHUB_TITLE) {
      ogTitle.content = LEARNHUB_TITLE;
    }
    
    // อัพเดท og:image
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content.includes('lovable')) {
      ogImage.content = '/og-image.png';
    }
    
    // อัพเดท twitter:image
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && twitterImage.content.includes('lovable')) {
      twitterImage.content = '/og-image.png';
    }
  }
  
  // Execute immediately
  updateFavicon();
  updateTitle();
  updateMetaTags();
  
  // Execute on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      updateFavicon();
      updateTitle();
      updateMetaTags();
    });
  }
  
  // Execute on window load (เช็คครั้งสุดท้าย)
  window.addEventListener('load', function() {
    updateFavicon();
    updateTitle();
    updateMetaTags();
  });
  
  // Watch for Lovable trying to revert changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          // ถ้าเป็น link tag ที่ Lovable เพิ่มเข้ามา
          if (node.tagName === 'LINK' && node.rel && node.rel.includes('icon')) {
            if (node.href.includes('lovable')) {
              console.log('🚫 Blocking Lovable icon injection');
              node.remove();
              updateFavicon();
            }
          }
          
          // ถ้าเป็น meta tag ของ Lovable
          if (node.tagName === 'META') {
            if (node.content && node.content.includes('lovable')) {
              console.log('🚫 Blocking Lovable meta tag');
              updateMetaTags();
            }
          }
        });
      }
      
      // ถ้า title เปลี่ยนเป็น Lovable
      if (mutation.target === document.querySelector('title') || 
          (mutation.target.parentNode && mutation.target.parentNode === document.querySelector('title'))) {
        if (document.title.includes('Lovable')) {
          updateTitle();
        }
      }
    });
  });
  
  // เริ่ม observe
  observer.observe(document.head, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  // ลบ setInterval ออก! ไม่ต้องเช็คซ้ำ
  // observer จะดูแลให้แล้ว
  
  console.log('%c✅ LearnHub branding active (optimized)', 'color: #10b981; font-weight: bold');
})();