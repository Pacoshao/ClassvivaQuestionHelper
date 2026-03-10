/**
 * 代码不注释，同事两行泪！（给！爷！写！）
 * Elegance is not a dispensable luxury but a quality that decides between success and failure!
 * Created by Wu Qizhen on 2025.12.06
 */

// ==UserScript==
// @name         Classviva Question Helper | 题式精萃
// @description  智能提取 Classviva 题目、处理 LaTeX 公式，支持一键复制
// @author       Code IntelliX
// @version      0.2
// @icon         https://www.classviva.org/pluginfile.php?file=%2F1%2Fcore_admin%2Flogocompact%2F100x100%2F1731391655%2Ffavicon.png
// @match        *://*.classviva.org/*
// @match        *://*.classviva.hkust-gz.edu.cn/*
// @namespace    http://tampermonkey.net/
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // ========== 配置 ==========
    const CONFIG = {
        debug: false,
        version: '0.2',
        author: 'Code IntelliX',
        github: 'https://github.com/Wu-Qizhen/ClassvivaQuestionHelper'
    };

    // ========== 日志工具 ==========
    const logger = {
        log: (...args) => CONFIG.debug && console.log('[CQH] ', ...args),
        error: (...args) => console.error('[CQH] ', ...args),
        warn: (...args) => console.warn('[CQH] ', ...args)
    };

    logger.log('脚本已加载，版本 ', CONFIG.version);

    // ========== 样式管理 ==========
    const StyleManager = {
        init() {
            if (typeof GM_addStyle === "undefined") return;

            GM_addStyle(`
                /* 按钮样式覆盖 */
                .cv-copy-btn {
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                
                .cv-copy-btn:focus {
                    box-shadow: 0 0 0 3px rgba(45, 142, 10, 0.3) !important;
                }
                
                /* 模态框样式 */
                .cv-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    z-index: 9998;
                    display: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .cv-modal-backdrop.show {
                    display: block;
                    opacity: 1;
                }
                
                .cv-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    z-index: 9999;
                    width: 90%;
                    max-width: 500px;
                    opacity: 0;
                    transition: all 0.3s ease;
                    overflow: hidden;
                }
                
                .cv-modal.show {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                
                .cv-modal-header {
                    background: linear-gradient(135deg, #67c23a 0%, #3ecc5f 100%);
                    color: white;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .cv-modal-title {
                    font-size: 20px;
                    font-weight: 600;
                    margin: 0;
                }
                
                .cv-modal-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                }
                
                .cv-modal-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .cv-fun-close {}
                
                .cv-modal-body {
                    padding: 25px 25px 10px 25px;
                    max-height: 60vh;
                    overflow-y: auto;
                }
                
                .cv-modal-footer {
                    padding: 20px;
                    border-top: 1px solid #eee;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                
                .cv-feature-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    transition: background-color 0.2s;
                }
                
                .cv-feature-item:hover {
                    background: #e9ecef;
                }
                
                .cv-feature-icon {
                    color: #67c23a;
                    font-size: 20px;
                }
                
                .cv-feature-text {
                    flex: 1;
                    font-size: 14px;
                    line-height: 1.4;
                }
                
                .cv-version-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #555;
                    font-size: 14px;
                    font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                    margin-right: auto;
                }
                
                .cv-button {
                    padding: 6px 12px;
                    background: #67c23a;
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                    outline: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                
                .cv-button:hover {
                    background: #509f6c;
                    transform: translateY(-1px) !important;
                }
                
                .cv-button:active {
                    transform: scale(0.98) !important;
                }
                
                .cv-button-secondary {
                    background: #409eff;
                }
                
                .cv-button-secondary:hover {
                    background: #3375b9;
                }
                
                .cv-button:focus,
                .cv-button:active {
                    transform: scale(0.98) !important;
                }
                
                /* 导航栏图标样式 */
                .cv-nav-icon {
                    position: relative;
                    cursor: pointer;
                }
                
                .cv-nav-badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #dc3545;
                    color: white;
                    font-size: 12px;
                    padding: 2px 5px;
                    border-radius: 10px;
                    min-width: 16px;
                    text-align: center;
                }
                
                /* 通知样式 */
                .cv-notification {
                    animation: cv-slideIn 0.3s ease;
                }
                
                @keyframes cv-slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `);
        }
    };

    // ========== 模态框管理 ==========
    const ModalManager = {
        backdrop: null,
        modal: null,
        isInitialized: false,

        init() {
            if (this.isInitialized) return;

            // 创建背景遮罩
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'cv-modal-backdrop';
            this.backdrop.addEventListener('click', (e) => {
                if (e.target === this.backdrop) this.hide();
            });

            // 创建模态框
            this.modal = document.createElement('div');
            this.modal.className = 'cv-modal';
            this.modal.innerHTML = `
                <div class="cv-modal-header">
                    <h3 class="cv-modal-title">Classviva Question Helper | 题式精萃</h3>
                    <button class="cv-modal-close cv-fun-close cv-button" style="
                        background: transparent !important;
                        color: white !important;
                        padding: 0 !important;
                        min-width: auto !important;
                    ">✕</button>
                </div>
                <div class="cv-modal-body">
                    <!-- 特征项保持不变 -->
                    <div class="cv-feature-item">
                        <span class="cv-feature-icon">📋</span>
                        <div class="cv-feature-text">
                            <strong>智能提取</strong><br>
                            自动识别并提取题目，保持格式完整
                        </div>
                    </div>
                    <div class="cv-feature-item">
                        <span class="cv-feature-icon">🧮</span>
                        <div class="cv-feature-text">
                            <strong>公式处理</strong><br>
                            支持行内公式和显式公式，LaTeX 格式完美适配 AI 分析
                        </div>
                    </div>
                    <div class="cv-feature-item">
                        <span class="cv-feature-icon">⚡</span>
                        <div class="cv-feature-text">
                            <strong>一键复制</strong><br>
                            点击按钮即可复制题目内容，无需手动选择
                        </div>
                    </div>
                    <div class="cv-feature-item">
                        <span class="cv-feature-icon">🎯</span>
                        <div class="cv-feature-text">
                            <strong>即将推出</strong><br>
                            自动跳转与自动填充、批量处理等功能
                        </div>
                    </div>
                </div>
                <div class="cv-modal-footer">
                    <div class="cv-version-info">
                        <span>Version ${CONFIG.version} | Developed by ${CONFIG.author}</span>
                    </div>
                    <button class="cv-button" id="cv-copy-all-btn">
                        复制全部题目
                    </button>
                    <button class="cv-button cv-button-secondary" onclick="window.open('${CONFIG.github}', '_blank')">
                        项目主页
                    </button>
                    <button class="cv-button cv-fun-close">
                        确定
                    </button>
                </div>
            `;

            // 添加事件监听
            this.modal.querySelectorAll('.cv-fun-close').forEach(btn => {
                // 添加鼠标事件
                /*btn.addEventListener('mouseover', (e) => {
                    e.target.style.background = '#509f6c';
                });

                btn.addEventListener('mouseout', (e) => {
                    e.target.style.background = '#67c23a';
                });*/

                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.target.style.transform = 'scale(0.98)';
                });

                btn.addEventListener('mouseup', (e) => {
                    e.target.style.transform = 'scale(1)';
                });

                // 点击关闭功能
                btn.addEventListener('click', () => this.hide());
            });

            const copyAllButton = this.modal.querySelector('#cv-copy-all-btn');
            if (copyAllButton) {
                copyAllButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    ButtonManager.copyAllQuestions();
                });
            }

            document.body.appendChild(this.backdrop);
            document.body.appendChild(this.modal);
            this.isInitialized = true;

            logger.log('模态框已初始化');
        },

        show() {
            if (!this.isInitialized) this.init();

            this.backdrop.classList.add('show');
            this.modal.classList.add('show');
            document.body.style.overflow = 'hidden';

            logger.log('模态框显示');
        },

        hide() {
            this.backdrop.classList.remove('show');
            this.modal.classList.remove('show');
            document.body.style.overflow = '';

            logger.log('模态框隐藏');
        }
    };

    // ========== 通知管理 ==========
    const NotificationManager = {
        notificationElement: null,
        notificationTimeout: null,

        show(message) {
            this.clear();

            const aboutLi = document.getElementById('cv-nav-icon');
            const notificationsLi = document.querySelector('li.nav-item div#nav-notification-popover-container')?.closest('li');
            const targetInsertionPoint = aboutLi || notificationsLi;
            const navUl = targetInsertionPoint?.parentNode;

            if (!navUl || !targetInsertionPoint) {
                logger.error('无法显示通知：找不到导航栏');
                return;
            }

            this.notificationElement = document.createElement('li');
            this.notificationElement.className = 'nav-item d-flex align-items-center cv-notification mr-3';
            this.notificationElement.innerHTML = `
                <span style="
                    background: linear-gradient(135deg, #67c23a 0%, #3ecc5f 100%);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(45, 142, 10, 0.2);
                    white-space: nowrap;
                ">${message}</span>
            `;

            navUl.insertBefore(this.notificationElement, targetInsertionPoint);

            this.notificationTimeout = setTimeout(() => this.clear(), 3000);
            logger.log('通知显示：', message);
        },

        clear() {
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
                this.notificationTimeout = null;
            }

            if (this.notificationElement?.parentNode) {
                this.notificationElement.remove();
                this.notificationElement = null;
            }
        }
    };

    // ========== 内容提取器 ==========
    const ContentExtractor = {
        extract(container) {
            const clone = container.cloneNode(true);

            // 保留用户当前填写的答案（运行时 value），避免 clone 丢失输入值。
            this._syncFormValues(container, clone);

            // 清理不需要的元素
            this._cleanElements(clone);

            // 提取内容
            const contentPieces = [];
            this._traverseNodes(clone, contentPieces);

            // 处理结果
            return this._processContent(contentPieces);
        },

        _syncFormValues(sourceRoot, targetRoot) {
            const sourceControls = sourceRoot.querySelectorAll('input, textarea, select');
            const targetControls = targetRoot.querySelectorAll('input, textarea, select');

            sourceControls.forEach((sourceControl, index) => {
                const targetControl = targetControls[index];
                if (!targetControl) return;

                if (sourceControl.tagName === 'TEXTAREA') {
                    targetControl.value = sourceControl.value;
                    targetControl.textContent = sourceControl.value;
                } else if (sourceControl.tagName === 'SELECT') {
                    targetControl.value = sourceControl.value;
                } else if (sourceControl.tagName === 'INPUT') {
                    const inputType = (sourceControl.type || '').toLowerCase();
                    if (inputType === 'checkbox' || inputType === 'radio') {
                        targetControl.checked = sourceControl.checked;
                    } else {
                        targetControl.value = sourceControl.value;
                    }
                }
            });
        },

        _cleanElements(element) {
            const selectors = [
                'input[type="hidden"]',
                'script:not([type*="math/tex"])',
                'button',
                '.material-icons',
                '.MathJax_Preview',
                '.MathJax_CHTML_no_print',
                '.MathJax_no_print',
                '.MathJax_Display_no_print',
                '.MJX_Assistive_MathML',
                '.MathJax',
                '.mjx-chtml',
                '.MathJax_CHTML',
                'p.footer'
            ];

            selectors.forEach(selector => {
                element.querySelectorAll(selector).forEach(el => el.remove());
            });
        },

        _traverseNodes(node, pieces) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) pieces.push(text);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName)) {
                    const controlValue = this._extractFormControlValue(node);
                    if (controlValue) pieces.push(controlValue);
                    return;
                }

                if (node.tagName === 'SCRIPT' && node.type?.includes('math/tex')) {
                    const latex = node.textContent.trim();
                    if (latex) {
                        const isDisplay = node.type.includes('mode=display');
                        pieces.push(isDisplay ? `\\[${latex}\\]` : `\\(${latex}\\)`);
                    }
                } else if (!this._isMathJaxElement(node)) {
                    const isBlockElement = ['P', 'BR', 'DIV'].includes(node.tagName);
                    Array.from(node.childNodes).forEach(child => this._traverseNodes(child, pieces));
                    if (isBlockElement) pieces.push('\n\n');
                }
            }
        },

        _extractFormControlValue(element) {
            if (element.tagName === 'TEXTAREA') {
                const value = (element.value || element.textContent || '').trim();
                return value || '';
            }

            if (element.tagName === 'SELECT') {
                const selectedOption = element.options?.[element.selectedIndex];
                const label = selectedOption?.textContent?.trim() || '';
                const value = (element.value || '').trim();
                return label || value;
            }

            if (element.tagName === 'INPUT') {
                const inputType = (element.type || '').toLowerCase();

                if (inputType === 'hidden') return '';

                if (inputType === 'checkbox' || inputType === 'radio') {
                    if (!element.checked) return '';
                    const labelText = this._extractControlLabelText(element);
                    if (labelText) return `[已选->] ${labelText}`;
                    const value = (element.value || '').trim();
                    return value && value.toLowerCase() !== 'on' ? value : '已勾选';
                }

                return (element.value || '').trim();
            }

            return '';
        },

        _extractControlLabelText(control) {
            const controlId = control.id || '';
            let labelElement = null;

            if (controlId) {
                try {
                    labelElement = control.ownerDocument?.querySelector(`label[for="${CSS.escape(controlId)}"]`);
                } catch (error) {
                    labelElement = control.ownerDocument?.querySelector(`label[for="${controlId}"]`);
                }
            }

            if (!labelElement) {
                labelElement = control.closest('label');
            }

            if (!labelElement) return '';

            const labelClone = labelElement.cloneNode(true);
            labelClone.querySelectorAll('input, textarea, select, script, style').forEach(el => el.remove());
            return (labelClone.textContent || '').trim();
        },

        _isMathJaxElement(element) {
            if (!element.classList) return false;
            const mathJaxClasses = ['MathJax_Preview', 'mjx-chtml', 'MathJax_CHTML', 'MathJax'];
            return mathJaxClasses.some(cls => element.classList.contains(cls));
        },

        _processContent(pieces) {
            return pieces
                .join(' ')
                .replace(/\s+/g, ' ')
                .replace(/\n\s*\n\s*\n/g, '\n\n')
                .trim();
        }
    };

    // ========== 按钮管理器 ==========
    const ButtonManager = {
        init() {
            this._setupCopyButtons();
            this._setupNavIcon();
        },

        copyAllQuestions() {
            const allContent = this._collectQuestionContents();

            if (allContent.length === 0) {
                NotificationManager.show('⚠ 未找到可复制题目');
                logger.warn('未找到可复制题目');
                return;
            }

            const mergedContent = allContent
                .map(item => `【题目 ${item.number}】\n${item.content}`)
                .join('\n\n--------------------\n\n');

            GM_setClipboard(mergedContent);
            NotificationManager.show(`✓ 已复制全部题目（${allContent.length} 题）`);
            logger.log(`已复制全部题目，共 ${allContent.length} 题`);
        },

        _setupCopyButtons() {
            const questions = document.querySelectorAll('div[id^="question-"], div.que.description');
            let addedCount = 0;

            questions.forEach(questionDiv => {
                const isDescription = questionDiv.classList.contains('description');
                if (!isDescription && !/^question-\d+-\d+$/.test(questionDiv.id)) return;

                const infoElement = questionDiv.querySelector('.info');
                const contentElement = questionDiv.querySelector('.content');

                if (infoElement && contentElement && !infoElement.querySelector('.cv-copy-btn')) {
                    const button = this._createCopyButton(questionDiv.id || 'desc', contentElement);
                    infoElement.appendChild(button);
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                logger.log(`添加了 ${addedCount} 个复制按钮`);
            }
        },

        _collectQuestionContents() {
            const questions = Array.from(document.querySelectorAll('div[id^="question-"], div.que.description'));

            return questions
                .filter(questionDiv => {
                    return questionDiv.classList.contains('description') || /^question-\d+-\d+$/.test(questionDiv.id);
                })
                .map((questionDiv, index) => {
                    const contentElement = questionDiv.querySelector('.content');
                    const isDescription = questionDiv.classList.contains('description');
                    const rawId = questionDiv.id || `desc-${index}`;
                    const rawNumber = isDescription ? '资料' : rawId.split('-').pop();
                    const number = isDescription ? NaN : Number.parseInt(rawNumber, 10);

                    if (!contentElement) return null;

                    const content = ContentExtractor.extract(contentElement);
                    if (!content) return null;

                    return {
                        number: isDescription ? '说明/背景' : rawNumber,
                        order: Number.isNaN(number) ? index - 1000 : number, // 资料通常在前面，给个较小的 order
                        content
                    };
                })
                .filter(Boolean)
                .sort((a, b) => a.order - b.order);
        },

        _createCopyButton(questionId, contentElement) {
            const button = document.createElement('button');
            button.className = 'cv-copy-btn';
            const isDesc = questionId === 'desc' || questionId.startsWith('desc-');
            button.textContent = isDesc ? '复制说明' : '复制题目';

            Object.assign(button.style, {
                width: '100%',
                boxSizing: 'border-box',
                marginTop: '10px',
                padding: '6px 12px',
                background: '#67c23a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                fontFamily: "'Roboto', 'Helvetica Neue', Arial, sans-serif"
            });

            // 事件处理
            button.addEventListener('mouseover', () => {
                button.style.background = '#509f6c';
                button.style.transform = 'translateY(-1px)';
                button.style.boxShadow = '0 4px 12px rgba(45, 142, 10, 0.3)';
            });

            button.addEventListener('mouseout', () => {
                button.style.background = '#67c23a';
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = 'none';
            });

            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                button.style.transform = 'scale(0.98)';
            });

            button.addEventListener('mouseup', () => {
                button.style.transform = 'scale(1)';
            });

            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const content = ContentExtractor.extract(contentElement);
                GM_setClipboard(content);

                // 显示反馈
                button.textContent = '✓ 已复制';
                button.style.background = 'linear-gradient(135deg, #4caf50 0%, #3ecc5f 100%)';
                const lastNumber = isDesc ? '背景说明' : questionId.split('-').pop();
                NotificationManager.show(`✓ ${isDesc ? '' : '题目 '}${lastNumber} 已复制`);

                setTimeout(() => {
                    button.textContent = isDesc ? '复制说明' : '复制题目';
                    button.style.background = 'linear-gradient(135deg, #67c23a 0%, #3ecc5f 100%)';
                }, 1500);

                logger.log(`已复制内容 ${lastNumber}`);
            });

            return button;
        },

        _setupNavIcon() {
            const notificationsLi = document.querySelector('li.nav-item div#nav-notification-popover-container')?.closest('li');
            const navUl = notificationsLi?.parentNode;

            if (!navUl || !notificationsLi) {
                logger.warn('导航栏未找到，无法添加图标');
                return;
            }

            // 移除旧的（如果存在）
            const oldIcon = document.getElementById('cv-nav-icon');
            if (oldIcon) oldIcon.remove();

            // 创建新图标
            const navIcon = document.createElement('li');
            navIcon.id = 'cv-nav-icon';
            navIcon.className = 'nav-item cv-nav-icon';
            navIcon.title = '题式精萃';
            navIcon.style.cursor = 'pointer';
            navIcon.style.marginRight = '10px';
            navIcon.style.display = 'flex';
            navIcon.style.flexDirection = 'column';
            navIcon.style.alignItems = 'center';
            navIcon.style.justifyContent = 'center';
            navIcon.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #67c23a 0%, #3ecc5f 100%);
                    padding: 6px 12px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                    box-shadow: 0 4px 8px rgba(45, 142, 10, 0.2);
                    transition: all 0.2s ease;
                ">
                    题式精萃
                </div>
            `;

            /*navIcon.addEventListener('mouseover', () => {
                navIcon.style.background = 'linear-gradient(135deg, #3ecc5f 0%, #67c23a 100%)';
            });

            navIcon.addEventListener('mouseout', () => {
                navIcon.style.background = 'linear-gradient(135deg, #67c23a 0%, #3ecc5f 100%)';
            });*/

            navIcon.addEventListener('click', (e) => {
                e.preventDefault();
                ModalManager.show();
            });

            navUl.insertBefore(navIcon, notificationsLi);
            logger.log('导航栏图标已添加');
        }
    };

    // ========== 主控制器 ==========
    const MainController = {
        init() {
            logger.log('正在初始化');

            // 初始化样式
            StyleManager.init();

            // 初始化组件
            ButtonManager.init();

            // 设置观察者
            this._setupObserver();

            // 显示欢迎通知
            setTimeout(() => {
                NotificationManager.show('✓ 就绪');
            }, 1000);

            logger.log('初始化完成');
        },

        _setupObserver() {
            const observer = new MutationObserver((mutations) => {
                let shouldUpdate = false;

                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // 检测新题目
                                if (node.matches('div[id^="question-"]') || node.querySelector('div[id^="question-"]')) {
                                    shouldUpdate = true;
                                }
                                // 检测导航栏变化
                                if (node.matches('li.nav-item') || node.closest('li.nav-item')) {
                                    if (!document.getElementById('cv-nav-icon')) {
                                        ButtonManager._setupNavIcon();
                                    }
                                }
                            }
                        });
                    }
                });

                if (shouldUpdate) {
                    setTimeout(() => ButtonManager._setupCopyButtons(), 200);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            logger.log('DOM 观察者已启动');
        }
    };

    // ========== 启动脚本 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MainController.init());
    } else {
        MainController.init();
    }

    window.addEventListener('load', () => {
        // 确保在页面完全加载后再次检查
        setTimeout(() => ButtonManager._setupCopyButtons(), 500);
    });

})();
