// วางไฟล์นี้ที่ /public/override-lovable.js
// AGGRESSIVE FAVICON OVERRIDE FOR LOVABLE PLATFORM

(function() {
  'use strict';
  
  console.log('%c🎨 LearnHub Branding Override', 'color: #6366f1; font-size: 16px; font-weight: bold');
  
  const LEARNHUB_FAVICON = '/favicon.svg';
  const LEARNHUB_TITLE = 'LearnHub - แพลตฟอร์มเรียนออนไลน์คุณภาพสูง';
  
  // ฟังก์ชันเปลี่ยน Favicon
  function updateFavicon() {
    // ลบ Lovable favicons ทั้งหมด
    const lovableIcons = document.querySelectorAll('link[rel*="icon"][href*="lovable"]');
    lovableIcons.forEach(icon => {
      console.log('🗑️ Removing Lovable icon:', icon.href);
      icon.remove();
    });
    
    // ลบ icon ทั้งหมดที่ไม่ใช่ LearnHub
    const allIcons = document.querySelectorAll('link[rel*="icon"]');
    allIcons.forEach(icon => {
      if (!icon.href.includes('favicon.svg')) {
        icon.remove();
      }
    });
    
    // สร้าง LearnHub favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = LEARNHUB_FAVICON + '?t=' + Date.now();
    document.head.appendChild(link);
    
    // สร้าง shortcut icon
    const shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    shortcut.type = 'image/svg+xml';
    shortcut.href = LEARNHUB_FAVICON + '?t=' + Date.now();
    document.head.appendChild(shortcut);
    
    console.log('✅ LearnHub favicon installed');
  }
  
  // ฟังก์ชันเปลี่ยน Title
  function updateTitle() {
    if (document.title.includes('Lovable')) {
      document.title = LEARNHUB_TITLE;
      console.log('✅ Title updated to:', LEARNHUB_TITLE);
    }
  }
  
  // ฟังก์ชันเปลี่ยน Meta Tags
  function updateMetaTags() {
    // อัพเดท og:title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content.includes('Lovable')) {
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
  
  // Execute on window load
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
          // ถ้าเป็น link tag ที่เพิ่มเข้ามา
          if (node.tagName === 'LINK' && node.rel.includes('icon')) {
            if (node.href.includes('lovable') || !node.href.includes('favicon.svg')) {
              console.log('🚫 Blocking Lovable icon injection');
              node.remove();
            }
          }
          
          // ถ้าเป็น meta tag
          if (node.tagName === 'META') {
            if (node.content && node.content.includes('lovable')) {
              console.log('🚫 Blocking Lovable meta tag');
              updateMetaTags();
            }
          }
        });
      }
      
      // ถ้า title เปลี่ยน
      if (mutation.type === 'characterData' || mutation.type === 'childList') {
        if (mutation.target === document.querySelector('title') || 
            mutation.target.parentNode === document.querySelector('title')) {
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
  
  // Double check ทุก 2 วินาที (aggressive!)
  setInterval(function() {
    updateFavicon();
    updateTitle();
  }, 2000);
  
  console.log('%c✅ LearnHub branding active - watching for changes', 'color: #10b981; font-weight: bold');
})();
