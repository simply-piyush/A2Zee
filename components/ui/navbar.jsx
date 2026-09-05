"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";

const LANDING_NAV_ITEMS = [
  { id: "home", label: "HOME" },
  { id: "about", label: "ABOUT" },
  { id: "services", label: "SERVICES" },
  { id: "contact", label: "CONTACT" },
  { id: "portal", label: "LOGIN", href: "/auth" },
];

// After login: strictly home, search, book, cart
const USER_PORTAL_NAV_ITEMS = [
  { id: "home", label: "HOME" },
  { id: "search", label: "SEARCH" },
  { id: "book", label: "BOOK" },
  { id: "cart", label: "CART" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  const isUserPortal = pathname?.startsWith('/user');
  const navItems = isUserPortal ? USER_PORTAL_NAV_ITEMS : LANDING_NAV_ITEMS;

  const [activeTab, setActiveTab] = useState("home");
  const [userView, setUserView] = useState("home");


  const activeTabRef = useRef("home");
  const navRefs = useRef({});
  const containerRef = useRef(null);
  const pillRef = useRef(null);
  const targetScrollIdRef = useRef(null);
  const scrollEndTimerRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Listen to tab changes and view changes dispatched by user portal
  useEffect(() => {
    if (!isUserPortal) return;

    const handleTabChange = (e) => {
      const targetId = e.detail;
      if (targetId && navItems.some(n => n.id === targetId)) {
        setActiveTab(targetId);
      }
    };

    const handleViewChange = (e) => {
      if (typeof e.detail === 'string') {
        setUserView(e.detail);
      }
    };

    window.addEventListener('a2zee-user-tab-change', handleTabChange);
    window.addEventListener('a2zee-user-view', handleViewChange);


    return () => {
      window.removeEventListener('a2zee-user-tab-change', handleTabChange);
      window.removeEventListener('a2zee-user-view', handleViewChange);

    };
  }, [isUserPortal, navItems]);

  // Smoothly glide the pill using GSAP with fluid easing
  const movePill = useCallback((tabId, immediate = false) => {
    const activeEl = navRefs.current[tabId];
    const containerEl = containerRef.current;
    const pillEl = pillRef.current;

    if (activeEl && containerEl && pillEl) {
      const activeRect = activeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      const targetX = activeRect.left - containerRect.left;
      const targetWidth = activeRect.width;

      if (immediate) {
        gsap.set(pillEl, {
          x: targetX,
          width: targetWidth,
          opacity: 1,
        });
      } else {
        gsap.to(pillEl, {
          x: targetX,
          width: targetWidth,
          opacity: 1,
          duration: 0.35,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    }
  }, []);

  // Update pill position when activeTab changes
  useEffect(() => {
    movePill(activeTab);
  }, [activeTab, movePill]);

  // Initial layout calculation and resize handler
  useEffect(() => {
    const handleResize = () => {
      movePill(activeTabRef.current, true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [movePill]);

  // Handle scroll detection on landing page
  useEffect(() => {
    if (pathname !== "/") return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (targetScrollIdRef.current) {
            ticking = false;
            return;
          }

          const isAtBottom =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 80;

          if (isAtBottom) {
            const lastItem = LANDING_NAV_ITEMS[LANDING_NAV_ITEMS.length - 2];
            if (activeTabRef.current !== lastItem.id) {
              setActiveTab(lastItem.id);
            }
            ticking = false;
            return;
          }

          const scrollPos = window.scrollY + window.innerHeight * 0.35;

          for (let i = LANDING_NAV_ITEMS.length - 2; i >= 0; i--) {
            const item = LANDING_NAV_ITEMS[i];
            const el = document.getElementById(item.id);
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY;
              if (scrollPos >= top) {
                if (activeTabRef.current !== item.id) {
                  setActiveTab(item.id);
                }
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollEndTimerRef.current);
    };
  }, [pathname]);

  const handleNavClick = async (id, href) => {
    setActiveTab(id);
    movePill(id);

    // 1. Handle User Portal In-App Tab Switch
    if (isUserPortal) {
      window.dispatchEvent(new CustomEvent("a2zee-user-tab", { detail: id }));
      return;
    }

    // 2. Handle External Route (e.g. LOGIN -> /auth)
    if (href) {
      router.push(href);
      return;
    }

    // 3. Handle Landing Page Navigation
    if (pathname !== "/") {
      router.push(`/#${id}`);
      return;
    }

    targetScrollIdRef.current = id;
    const element = document.getElementById(id);
    if (element) {
      const top = Math.max(0, element.getBoundingClientRect().top + window.scrollY - 30);
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }

    clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(() => {
      targetScrollIdRef.current = null;
    }, 1800);
  };

  // Hide floating navbar on worker/admin portals, or when in create job page/view
  if (
    pathname?.startsWith('/worker') || 
    pathname?.startsWith('/admin') ||
    pathname === '/user/create-job' ||
    (isUserPortal && userView === 'create')
  ) {
    return null;
  }

  return (
    <header className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 select-none max-w-[96vw] pointer-events-auto">
      <nav
        ref={containerRef}
        className="relative inline-flex items-center bg-white border-2 border-black rounded-full p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.18)]"
      >
        {/* Hardware-Accelerated GSAP Sliding Active Navy Pill */}
        <span
          ref={pillRef}
          aria-hidden="true"
          className="absolute top-1.5 bottom-1.5 left-0 bg-[#1F4072] text-white rounded-full pointer-events-none opacity-0 shadow-sm"
        />

        <ul className="relative flex items-center list-none m-0 p-0 font-display text-xs md:text-sm tracking-wide">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <li key={item.id} className="relative">
                <button
                  ref={(el) => {
                    if (el) navRefs.current[item.id] = el;
                  }}
                  onClick={() => handleNavClick(item.id, item.href)}
                  className={`relative z-10 px-3.5 sm:px-5 py-2 rounded-full uppercase tracking-wider transition-colors duration-300 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "text-white"
                      : "text-black hover:text-black/60"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
