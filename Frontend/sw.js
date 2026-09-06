/* ==========================================================================
   FILE: public/sw.js
   TITLE: Ultimate SmartPOS Service Worker (PWA, Offline, External Libraries & PDF Cache)
   ========================================================================== */

const CACHE_NAME = 'smartpos-ultimate-v2';

// 1. الملفات الأساسية الداخلية للتطبيق (المطابقة للملفات الحقيقية)
const LOCAL_ASSETS = [
    // 1. الصفحة الرئيسية والواجهات الأساسية
    '/',
    '/index.html',
    '/manifest.json',

    // 2. ملفات التصميم والخطوط (CSS)
    '/css/style.css',
    '/css/fonts.css',
    '/css/flowbite.min.css',
    '/css/driver.css',
    
    // مسارات الفونتات الجديدة جوه الـ CSS (لو حابب السيرفر يكاشيها):
  '/css/fonts/cairo-v31-arabic_latin-200.woff2',
    '/css/fonts/cairo-v31-arabic_latin-300.woff2',
    '/css/fonts/cairo-v31-arabic_latin-500.woff2',
    '/css/fonts/cairo-v31-arabic_latin-600.woff2',
    '/css/fonts/cairo-v31-arabic_latin-700.woff2',
    '/css/fonts/cairo-v31-arabic_latin-800.woff2',
    '/css/fonts/cairo-v31-arabic_latin-regular.woff2',
    // 3. ملفات المكتبات المحلية (Assets / Libraries)
 
   
    '/assets/dexie.js',
    '/assets/jspdf.umd.min.js',
    '/assets/html2canvas.min.js',
    '/assets/html5-qrcode.min.js',
// 4. ملفات الجافاسكريبت والتطبيق
'/js/tailwindcss.js',
'/js/driver.iife.js',
'/js/flowbite.min.js',
    '/js/home-script.js',
    '/js/admin-script.js'    // <--- ده آخر عنصر من غير فاصلة
];

// 2. التثبيت وحفظ الملفات الأساسية في الكاش
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching core local assets');
            return cache.addAll(LOCAL_ASSETS);
        })
    );
    self.skipWaiting();
});

// 3. التفعيل وتطهير أي كاش قديم
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 4. معالجة طلبات الشبكة (Fetch) للروابط الخارجية، المكتبات، ومشاركة الملفات
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // نتأكد إن الطلب HTTP/HTTPS ومن نوع GET فقط
    if (!url.protocol.startsWith('http') || event.request.method !== 'GET') {
        return;
    }

    // استثناء خدمات فايربيس وقواعد البيانات السحابية لضمان قراءة البيانات الحية دائماً
    if (url.hostname.includes('googleapis.com') || url.hostname.includes('firebase') || url.hostname.includes('cloud.google.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // تحديث الكاش في الخلفية
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse);
                        });
                    }
                }).catch(() => {/* نت مقطوع مش مشكلة الكاش موجود */});
                
                return cachedResponse;
            }

            // لو مش في الكاش، هاته من النت واحفظه في الكاش
            return fetch(event.request)
                .then((networkResponse) => {
                    if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque')) {
                        return networkResponse;
                    }

                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                })
                .catch(() => {
                    console.log('[Service Worker] Fetch failed, offline mode active for:', event.request.url);
                });
        })
    );
});