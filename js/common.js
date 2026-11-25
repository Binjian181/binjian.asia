/**
 * 公共 JS 文件 - 所有页面共用
 * 版本: 3.0
 */
(function() {
    'use strict';
    
    // ========== SVG 图标定义 ==========
    var ICONS = {
        sun: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
        moon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
        menu: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
        x: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    };
    
    // ========== DOM 元素缓存 ==========
    var root = document.documentElement;
    var menuToggle = document.getElementById('menuToggle');
    var navSidebar = document.getElementById('navSidebar');
    
    // ========== 主题管理（明暗 · 与纸色正交） ==========
    var ThemeManager = {
        STORAGE_KEY: 'theme',

        init: function() {
            var savedTheme = this.getSavedTheme();
            if (savedTheme) {
                root.setAttribute('data-theme', savedTheme);
            }
            this.updateAllIcons(this.getCurrentTheme());
            this.updateModeButtons();
        },

        getSavedTheme: function() {
            try {
                var t = localStorage.getItem(this.STORAGE_KEY);
                return (t === 'light' || t === 'dark') ? t : null;
            } catch (e) {
                return null;
            }
        },

        getCurrentTheme: function() {
            var currentTheme = root.getAttribute('data-theme');
            if (!currentTheme) {
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                currentTheme = prefersDark ? 'dark' : 'light';
            }
            return currentTheme;
        },

        // mode: 'light' | 'dark' | 'system'
        setMode: function(mode) {
            if (mode === 'light' || mode === 'dark') {
                root.setAttribute('data-theme', mode);
                try {
                    localStorage.setItem(this.STORAGE_KEY, mode);
                } catch (e) {
                    // localStorage 不可用时静默失败
                }
            } else {
                root.removeAttribute('data-theme');
                try {
                    localStorage.removeItem(this.STORAGE_KEY);
                } catch (e) {}
            }
            this.updateAllIcons(this.getCurrentTheme());
            this.updateModeButtons();
        },

        updateAllIcons: function(theme) {
            var icon = theme === 'dark' ? ICONS.sun : ICONS.moon;
            var label = '配色与明暗';

            var buttons = document.querySelectorAll('.theme-toggle, .theme-toggle-mobile, .theme-toggle-desktop');
            buttons.forEach(function(btn) {
                var oldIcon = btn.querySelector('svg');
                if (oldIcon) {
                    oldIcon.outerHTML = icon;
                } else {
                    btn.insertAdjacentHTML('afterbegin', icon);
                }
                btn.title = label;
                btn.setAttribute('aria-label', label);
                btn.setAttribute('aria-haspopup', 'dialog');
                if (!btn.hasAttribute('aria-expanded')) {
                    btn.setAttribute('aria-expanded', 'false');
                }
            });
        },

        updateModeButtons: function() {
            var mode = this.getSavedTheme() || 'system';
            document.querySelectorAll('.mode-btn').forEach(function(btn) {
                var on = btn.getAttribute('data-mode') === mode;
                btn.classList.toggle('active', on);
                btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
        }
    };

    // ========== 纸色管理 ==========
    var PALETTES = [
        { id: 'xuanzhi', label: '宣纸', name: '宣纸 · 朱砂' },
        { id: 'qingjian', label: '青笺', name: '青笺 · 石青' },
        { id: 'songyan', label: '松烟', name: '松烟 · 墨绿' },
        { id: 'piaoxiang', label: '缥缃', name: '缥缃 · 藤黄' },
        { id: 'sujian', label: '素笺', name: '素笺 · 松墨' }
    ];

    var PaletteManager = {
        STORAGE_KEY: 'palette',
        DEFAULT: 'xuanzhi',

        init: function() {
            var saved = this.getSaved();
            if (saved) {
                root.setAttribute('data-palette', saved);
            }
            this.updateButtons();
        },

        getSaved: function() {
            try {
                var p = localStorage.getItem(this.STORAGE_KEY);
                return this.isValid(p) ? p : null;
            } catch (e) {
                return null;
            }
        },

        getCurrent: function() {
            var p = root.getAttribute('data-palette');
            return this.isValid(p) ? p : this.DEFAULT;
        },

        isValid: function(id) {
            return PALETTES.some(function(p) { return p.id === id; });
        },

        set: function(id) {
            if (!this.isValid(id)) return;
            root.setAttribute('data-palette', id);
            try {
                localStorage.setItem(this.STORAGE_KEY, id);
            } catch (e) {}
            this.updateButtons();
        },

        updateButtons: function() {
            var current = this.getCurrent();
            document.querySelectorAll('.palette-btn').forEach(function(btn) {
                var on = btn.getAttribute('data-palette') === current;
                btn.classList.toggle('active', on);
                btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
        }
    };

    // ========== 配色面板 · 印谱 ==========
    var ThemePanel = {
        el: null,
        opener: null,

        build: function() {
            if (this.el) return;
            var el = document.createElement('div');
            el.className = 'theme-panel';
            el.id = 'themePanel';
            el.hidden = true;
            el.setAttribute('role', 'dialog');
            el.setAttribute('aria-label', '配色与明暗');

            var modes = [
                ['system', '跟随系统'],
                ['light', '亮'],
                ['dark', '暗']
            ].map(function(m) {
                return '<button type="button" class="mode-btn" data-mode="' + m[0] + '">' + m[1] + '</button>';
            }).join('');

            var swatches = PALETTES.map(function(p) {
                return '<button type="button" class="palette-btn" data-palette="' + p.id + '" title="' + p.name + '">'
                    + '<span class="palette-swatch"></span><span>' + p.label + '</span></button>';
            }).join('');

            el.innerHTML = '<div class="theme-panel-title">配色<small>印谱</small></div>'
                + '<div class="mode-row" role="group" aria-label="明暗模式">' + modes + '</div>'
                + '<div class="palette-grid" role="group" aria-label="纸色">' + swatches + '</div>';

            el.addEventListener('click', function(e) {
                var modeBtn = e.target.closest('.mode-btn');
                if (modeBtn) {
                    ThemeManager.setMode(modeBtn.getAttribute('data-mode'));
                    return;
                }
                var paletteBtn = e.target.closest('.palette-btn');
                if (paletteBtn) {
                    PaletteManager.set(paletteBtn.getAttribute('data-palette'));
                }
            });

            document.body.appendChild(el);
            this.el = el;
        },

        open: function(opener) {
            this.build();
            this.opener = opener;
            MenuManager.close();
            this.el.hidden = false;
            this.place(opener);
            this.syncOpeners(true);
            ThemeManager.updateModeButtons();
            PaletteManager.updateButtons();

            var self = this;
            this._outside = function(e) {
                if (self.el.contains(e.target)) return;
                if (opener.contains(e.target)) return;
                self.close();
            };
            this._onScroll = function() { self.close(); };
            this._onResize = function() { self.close(); };
            this._onKey = function(e) {
                if (e.key === 'Escape') {
                    self.close();
                    opener.focus();
                }
            };
            // 延迟一帧再挂外部点击，避免本次点击立刻关闭
            setTimeout(function() {
                document.addEventListener('click', self._outside, true);
            }, 0);
            window.addEventListener('scroll', this._onScroll, true);
            window.addEventListener('resize', this._onResize);
            document.addEventListener('keydown', this._onKey);

            var first = this.el.querySelector('.mode-btn');
            if (first) first.focus();
        },

        close: function() {
            if (!this.el || this.el.hidden) return;
            this.el.hidden = true;
            this.syncOpeners(false);
            document.removeEventListener('click', this._outside, true);
            window.removeEventListener('scroll', this._onScroll, true);
            window.removeEventListener('resize', this._onResize);
            document.removeEventListener('keydown', this._onKey);
        },

        toggle: function(opener) {
            var wasOpen = !!this.el && !this.el.hidden;
            var same = wasOpen && this.opener === opener;
            if (wasOpen) this.close();
            if (!same) this.open(opener);
        },

        syncOpeners: function(open) {
            document.querySelectorAll('.theme-toggle, .theme-toggle-mobile, .theme-toggle-desktop').forEach(function(btn) {
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        },

        place: function(anchor) {
            var r = anchor.getBoundingClientRect();
            var panelW = this.el.offsetWidth || 288;
            var panelH = this.el.offsetHeight || 180;

            var left = r.left;
            if (left + panelW > window.innerWidth - 12) left = window.innerWidth - 12 - panelW;
            if (left < 12) left = 12;

            var top = r.bottom + 8;
            if (top + panelH > window.innerHeight - 12) {
                top = Math.max(12, r.top - panelH - 8);
            }

            this.el.style.left = Math.round(left) + 'px';
            this.el.style.top = Math.round(top) + 'px';
        }
    };
    
    // ========== 移动端菜单管理 ==========
    var MenuManager = {
        isOpen: false,
        
        toggle: function() {
            this.isOpen = !this.isOpen;
            
            if (navSidebar) {
                navSidebar.classList.toggle('open', this.isOpen);
            }
            
            if (menuToggle) {
                menuToggle.innerHTML = this.isOpen ? ICONS.x : ICONS.menu;
                menuToggle.setAttribute('aria-expanded', this.isOpen ? 'true' : 'false');
            }
        },
        
        close: function() {
            if (!this.isOpen) return;
            
            this.isOpen = false;
            
            if (navSidebar) {
                navSidebar.classList.remove('open');
            }
            
            if (menuToggle) {
                menuToggle.innerHTML = ICONS.menu;
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        }
    };
    
    // ========== 事件绑定 ==========
    function bindEvents() {
        // 主题按钮 → 打开配色印谱
        document.querySelectorAll('.theme-toggle, .theme-toggle-mobile, .theme-toggle-desktop').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                ThemePanel.toggle(btn);
            });
        });
        
        // 移动端菜单
        if (menuToggle) {
            menuToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                MenuManager.toggle();
            });
        }
        
        // 点击导航链接后关闭菜单
        var navLinks = document.querySelectorAll('.nav-btn');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                MenuManager.close();
            });
        });
        
        // 点击菜单外部关闭菜单
        document.addEventListener('click', function(e) {
            if (menuToggle && navSidebar) {
                var isToggle = menuToggle.contains(e.target);
                var isInSidebar = navSidebar.contains(e.target);
                
                if (!isToggle && !isInSidebar && MenuManager.isOpen) {
                    MenuManager.close();
                }
            }
        });
        
        // ESC 键关闭菜单
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                MenuManager.close();
            }
        });
        
        // 监听系统主题变化
        var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', function(e) {
                if (!ThemeManager.getSavedTheme()) {
                    ThemeManager.updateAllIcons(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
    
    // ========== 初始化 ==========
    function init() {
        PaletteManager.init();
        ThemeManager.init();
        bindEvents();
    }
    
    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
