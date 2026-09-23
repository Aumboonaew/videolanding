/* script.js - Signmanstudio Landing Page Interactions */

// ===== AUTO VIDEO THUMBNAIL =====
// ดึงเฟรมแรกของวิดีโอมาใช้เป็นปกการ์ดอัตโนมัติ
function generateVideoThumbnail(card) {
  const videoSrc = card.getAttribute('data-video');
  if (!videoSrc || videoSrc.startsWith('http')) return; // ข้ามถ้าเป็น YouTube

  const video = document.createElement('video');
  video.src = videoSrc + '#t=2.0'; // เลื่อนไปวินาทีที่ 2 เพื่อหลบฉากสีขาวตอนเริ่มคลิป
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.style.position = 'absolute';
  video.style.inset = '0';
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'cover';
  video.style.zIndex = '0';
  video.style.opacity = '1'; 
  video.style.transition = 'opacity 0.3s';

  // บังคับเลื่อนเฟรมเผื่อ Browser บางตัวไม่รองรับ #t=
  video.addEventListener('loadedmetadata', () => {
    video.currentTime = 2.0;
  });

  // เลื่อนปุ่ม Play และข้อความให้อยู่บนสุด
  const overlay = card.querySelector('.video-poster-overlay');
  if (overlay) overlay.style.zIndex = '2';
  
  const info = card.querySelector('.showcase-info');
  if (info) {
    info.style.position = 'relative';
    info.style.zIndex = '2';
  }

  // เอาวิดีโอใส่เข้าไปในการ์ด
  card.style.position = 'relative';
  card.insertBefore(video, card.firstChild);
}

// รันกับทุก video-card ใน showcase
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.showcase-thumb.video-card').forEach(card => {
    generateVideoThumbnail(card);
  });
});


// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('mobile-open');
  if (navLinks.classList.contains('mobile-open')) {
    navLinks.style.display = 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '70px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'rgba(3,7,18,0.97)';
    navLinks.style.padding = '20px 24px';
    navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
    navLinks.style.backdropFilter = 'blur(20px)';
  } else {
    navLinks.style.display = '';
  }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (navLinks.classList.contains('mobile-open')) {
        navLinks.classList.remove('mobile-open');
        navLinks.style.display = '';
      }
    }
  });
});

// ===== SCROLL REVEAL ANIMATION =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Add reveal class and observe elements
const revealEls = document.querySelectorAll('.feature-card, .step, .showcase-item, .testimonial-card, .pricing-card');
revealEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s, border-color 0.3s ease, box-shadow 0.3s ease`;
  observer.observe(el);
});

// Add revealed style dynamically
const style = document.createElement('style');
style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);

// ===== PARALLAX FOR HERO ORBS =====
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  document.querySelectorAll('.hero-orb').forEach((orb, i) => {
    const factor = (i + 1) * 0.5;
    orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
});

// ===== PLAY BUTTON CLICK =====
document.querySelectorAll('.play-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const item = btn.closest('.showcase-item');
    const thumb = item.querySelector('.showcase-thumb');
    // Flash animation
    thumb.style.transition = 'all 0.2s';
    thumb.style.filter = 'brightness(1.3)';
    setTimeout(() => { thumb.style.filter = ''; }, 300);
    btn.textContent = '⏸';
    setTimeout(() => { btn.textContent = '▶'; }, 2000);
  });
});

console.log('%c Signmanstudio Landing Page Loaded!', 'color: #a78bfa; font-size: 16px; font-weight: bold;');

// ===== VIDEO MODAL SYSTEM =====
// รองรับทั้ง: ไฟล์ MP4/WebM ปกติ และ YouTube
const modal      = document.getElementById('videoModal');
const modalBody  = document.getElementById('videoModalBody');
const modalTitle = document.getElementById('videoModalTitle');
const modalClose = document.getElementById('videoModalClose');
const modalBg    = document.getElementById('videoModalBackdrop');

function getYouTubeEmbedUrl(url) {
  // รองรับ: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;
  }
  return null;
}

function isVideoFile(url) {
  return /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(url);
}

function openVideoModal(videoSrc, title) {
  modalTitle.textContent = title || 'ผลงาน';
  modalBody.innerHTML = '';

  const ytEmbed = getYouTubeEmbedUrl(videoSrc);

  if (ytEmbed) {
    // YouTube — ใช้ iframe
    const iframe = document.createElement('iframe');
    iframe.src = ytEmbed;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    modalBody.appendChild(iframe);
  } else {
    // ไฟล์วิดีโอปกติ — ใช้ HTML5 <video>
    const video = document.createElement('video');
    video.src = videoSrc;
    video.controls = true;
    video.autoplay = true;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.background = '#000';
    // รองรับหลาย format
    const ext = videoSrc.split('.').pop().split('?')[0].toLowerCase();
    const typeMap = { mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg', mov: 'video/mp4' };
    if (typeMap[ext]) video.type = typeMap[ext];
    modalBody.appendChild(video);
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  // หยุดวิดีโอ / unload iframe
  setTimeout(() => { modalBody.innerHTML = ''; }, 300);
}

// ผูก event กับ video-card ทุกอัน
document.querySelectorAll('.video-card').forEach(card => {
  card.addEventListener('click', () => {
    const src   = card.getAttribute('data-video');
    const title = card.getAttribute('data-title') || 'ผลงาน';
    if (!src || src === '#') {
      alert('ยังไม่ได้ใส่ไฟล์วิดีโอ — กรุณาแก้ data-video ใน index.html');
      return;
    }
    openVideoModal(src, title);
  });
});

// ปิด modal
modalClose.addEventListener('click', closeVideoModal);
modalBg.addEventListener('click', closeVideoModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideoModal(); });
