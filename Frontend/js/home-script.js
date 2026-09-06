
export function initHelpTours(...toursList) {
    const buttons = document.querySelectorAll('.tour-help-btn');
    
    buttons.forEach(btn => {
        const uniqueId = 'tooltip_' + Math.random().toString(36).substring(2, 9);

        const tooltipWrapper = document.createElement('div');
        tooltipWrapper.innerHTML = `
            <div id="${uniqueId}" class="hidden fixed w-max max-w-[200px] p-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-xl shadow-2xl border border-indigo-500/30 z-[99999] animate-bounce text-center">
                <div class="relative">
                    <p class="font-bold mb-1.5 whitespace-nowrap">🎬 فيديو شرح هذه الصفحة</p>
                    <button class="open-video-btn w-full py-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-semibold transition-colors shadow-md">
                        مشاهدة الآن
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(tooltipWrapper.firstElementChild);
        const tooltip = document.getElementById(uniqueId);
        const videoBtn = tooltip.querySelector('.open-video-btn');
        let autoHideTimer = null;

        const showTooltipNearButton = () => {
            const rect = btn.getBoundingClientRect();
            let top = rect.bottom + 8;
            let left = rect.left + (rect.width / 2) - 100;
            if (left < 10) left = 10;
            if (left + 200 > window.innerWidth) left = window.innerWidth - 210;

            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
            tooltip.classList.remove('hidden');
        };

        // دالة مساعدة تبحث وتجيب الجولة والفيديو النشطين حالياً في الصفحة
        const getActiveTour = () => {
            for (let tour of toursList) {
                if (!tour || !tour.steps) continue;
                
                // فحص هل فيه أي عنصر ظاهر للمجموعة دي في الصفحة؟
                let hasVisible = false;
                try {
                    for (let step of tour.steps) {
                        if (step && step.element) {
                            const el = document.querySelector(step.element);
                            if (el && el.offsetParent !== null) {
                                hasVisible = true;
                                break;
                            }
                        }
                    }
                } catch (e) {}

                if (hasVisible) {
                    return tour; // رجع المجموعة دي عشان هي اللي ظاهرة قدام اليوزر دلوقتي
                }
            }
            return null; // لو مفيش ولا مجموعة ظاهرة
        };
btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!window.driver || !window.driver.js) return;

            // 1. فتح الدراور (Drawer) أوتوماتيك لو كان مغلقاً عشان العناصر جواه تظهر
            const drawer = document.getElementById('drawer-navigation');
            if (drawer && drawer.style.transform !== 'translateX(0px)') {
                drawer.style.transform = 'translateX(0)';
            }

            // بنشوف أنهي مجموعة عناصر تخص الصفحة أو التبويب المفتوح حالياً
            const activeTour = getActiveTour();

            if (!activeTour) {
                showToast({
                    type: 'warning',
                    title: 'تنبيه هام لعرض الإرشادات',
                    message: 'عناصر هذا الدليل موجودة في تبويب (Tab) آخر، يرجى فتحه أولاً لتتمكن من تشغيل الجولة بنجاح.'
                });
                return;
            }
            // ... باقي الكود زي ما هو

            tooltip.classList.add('hidden');

            btn.classList.remove('bg-slate-200', 'dark:bg-slate-800', 'text-slate-500', 'dark:text-slate-400');
            btn.classList.add('bg-indigo-600', 'text-white', 'shadow-indigo-500/50', 'ring-2', 'ring-indigo-400');

            const driver = window.driver.js.driver;
            const driverObj = driver({
                showProgress: false,
                steps: activeTour.steps, // بنشغل الخطوات الصح بتاعت المجموعة النشطة
                onDestroyStarted: () => {
                    driverObj.destroy();
                    
                    btn.classList.add('bg-slate-200', 'dark:bg-slate-800', 'text-slate-500', 'dark:text-slate-400');
                    btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-indigo-500/50', 'ring-2', 'ring-indigo-400');

                    if (tooltip) {
                        showTooltipNearButton();
                        if (autoHideTimer) clearTimeout(autoHideTimer);
                        autoHideTimer = setTimeout(() => { 
                            tooltip.classList.add('hidden'); 
                        }, 6000);
                    }
                },
                nextBtnText: 'التالي',
                prevBtnText: 'السابق',
                doneBtnText: 'إنهاء'
            });

            driverObj.drive();
        });

        videoBtn.addEventListener('click', () => {
            // بنجيب فيديو المجموعة النشطة حالياً
            const activeTour = getActiveTour();
            const activeVideo = activeTour ? (activeTour.video || "#") : "#";

            if(activeVideo !== "#") {
                window.open(activeVideo, '_blank');
            } else {
                alert("عذراً، فيديو الشرح غير متوفر حالياً.");
            }
            if(tooltip) tooltip.classList.add('hidden');
            if(autoHideTimer) clearTimeout(autoHideTimer);
        });
    });
}
// دالة إظهار التوست (الرسائل السريعةالعادية)
export function showToast(options = {}) {
    const containerId = options.containerId || 'modern-toast-container';
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        // موبايل: أسفل الشاشة في المنتصف | ديسكتوب (sm): أعلى الشاشة في أقصى الشمال
        container.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-6 sm:left-6 sm:translate-x-0 z-[99999] w-full max-w-sm px-4 pointer-events-none flex flex-col gap-2';
        document.body.appendChild(container);
    }

    const type = options.type || 'info'; // info, success, warning, error
    const mainTitle = options.title || 'تنبيه';
    const message = options.message || '';

    const config = {
        info: {
            stripBg: 'bg-blue-500',
            iconBg: 'bg-blue-100 text-blue-600',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`
        },
        success: {
            stripBg: 'bg-emerald-500',
            iconBg: 'bg-emerald-100 text-emerald-600',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`
        },
        warning: {
            stripBg: 'bg-amber-500',
            iconBg: 'bg-amber-100 text-amber-600',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>`
        },
        error: {
            stripBg: 'bg-rose-500',
            iconBg: 'bg-rose-100 text-rose-600',
            icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>`
        }
    };

    const current = config[type] || config.info;

    const toastElement = document.createElement('div');
    // موبايل: يأتي من الأسفل (translate-y-12) | ديسكتوب (sm): يأتي من الأعلى (-translate-y-12)
    toastElement.className = `pointer-events-auto relative flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 transform translate-y-12 sm:-translate-y-12 opacity-0`;

    toastElement.innerHTML = `
        <!-- العمود الملون في أقصى اليمين -->
        <div class="absolute top-0 right-0 bottom-0 w-2 ${current.stripBg}"></div>

        <div class="flex items-center gap-3 pr-2">
            <div class="p-2 rounded-xl ${current.iconBg} flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${current.icon}
                </svg>
            </div>
            <div>
                <h4 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">${mainTitle}</h4>
                ${message ? `<p class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">${message}</p>` : ''}
            </div>
        </div>

        <button class="close-toast-btn p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold transition-colors ml-2">
            ✕
        </button>
    `;

    container.appendChild(toastElement);

    // تفعيل الأنيميشن للاستقرار في المنتصف
    setTimeout(() => {
        toastElement.classList.remove('translate-y-12', 'sm:-translate-y-12', 'opacity-0');
    }, 10);

    const removeToast = () => {
        toastElement.classList.add('translate-y-12', 'sm:-translate-y-12', 'opacity-0');
        setTimeout(() => toastElement.remove(), 300);
    };

    toastElement.querySelector('.close-toast-btn').addEventListener('click', removeToast);
    setTimeout(removeToast, 4500);
}
window.showToast = showToast;
// دالة نافذة التأكيد المخصصة (تعتمد على Promises للانتظار)
export function showConfirm(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        const titleEl = document.getElementById('confirm-title');
        const msgEl = document.getElementById('confirm-msg');
        const okBtn = document.getElementById('confirm-ok-btn');
        const cancelBtn = document.getElementById('confirm-cancel-btn');

        if (!modal) return resolve(false);

        titleEl.innerText = title;
        msgEl.innerText = message;

        modal.classList.add('active');

        const handleOk = () => {
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            modal.classList.remove('active');
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
    });
}
window.showConfirm = showConfirm;

// ==========================================
// 🚀 إدارة شاشة البداية (Splash Screen Handler)
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
    const splashScreen = document.getElementById('splash-screen');
    const subtitleElement = document.getElementById("splash-dynamic-subtitle");

    // مصفوفة التايتلات اللي هتتغير ورا بعضها
    const titles = [
        "جارِ تحميل لوحة التحكم وتجهيز النظام...",
        "جاري فحص قاعدة البيانات والاتصال...",
        "إعداد الصلاحيات وواجهات الاستخدام...",
        "النظام جاهز تقريباً، مرحباً بك..."
    ];

    let titleInterval;
    if (subtitleElement) {
        let currentIndex = 0;
        // تغيير التايتل كل 1.5 ثانية لحد ما الـ Promise يخلص
        titleInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % titles.length;
            subtitleElement.style.opacity = 0;
            setTimeout(() => {
                subtitleElement.textContent = titles[currentIndex];
                subtitleElement.style.opacity = 1;
            }, 200);
        }, 1500);
    }

    try {
        // 1. تحديد الحد الأدنى لوقت ظهور السبلاش
        const minSplashTime = new Promise(resolve => setTimeout(resolve, 2000));
        // 2. دالة تحميل بياناتك
        const loadDataTask = new Promise(resolve => {
// هنا هنحط اى دالة عاوزينها تشتغل مع السبلاش        
            
            
            setTimeout(resolve, 5000); 
        });
        // 3. انتظار انتهاء المهمة والوقت الأدنى
        await Promise.all([loadDataTask, minSplashTime]);

    } catch (error) {
        console.error("حصل مشكلة أثناء التحميل:", error);
    } finally {
        // إيقاف حركة تغيير التايتل فور انتهاء التحميل
        if (titleInterval) clearInterval(titleInterval);

        if (splashScreen) {
            // 1. إظهار شاشة اللوجن فوراً
            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) {
                loginScreen.style.opacity = '1';
            }

            // 2. بدء تلاشي السبلاش بسلاسة
            splashScreen.style.transition = 'opacity 0.6s ease';
            splashScreen.style.opacity = '0';

            // 3. مسح السبلاش تماماً بعد التلاشي
            setTimeout(() => {
                splashScreen.remove();
        
});
