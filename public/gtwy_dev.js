/* eslint-disable */
// IIFE Scope ( for avoiding global scope pollution )
(function () {
    class GtwyEmbedManager {
        constructor() {
            this.props = {};
            this.parentContainer = null;
            this.scriptIds = {}; // Store all script IDs
            this.config = {
                height: '100',
                heightUnit: 'vh', // Changed from % to vh for full height
                width: '100',
                widthUnit: 'vw', // Changed from % to vw for full width
                buttonName: '',
                slide: 'full', // default slide behavior
                hideCloseButton: 'false',
                hideFullScreenButton: 'false',
                hideHeader: 'false',
                skipLoadGtwy: false // New flag to control loadGtwyEmbed behavior
            };
            this.urls = {
                gtwyUrl: 'https://dev-ai.viasocket.com/embed',
                login: 'https://dev-db.gtwy.ai/gtwyEmbed/login'
            };
            this.state = {
                bodyLoaded: false,
                fullscreen: false,
                tempDataToSend: {
                    "hideHomeButton": true,
                    "showHistory": true,
                    "showConfigType": false,
                },
                isInitialized: false, // Added initialization flag
                hasParentContainer: false // Track if we're in a parent container
            };

            this.initializeEventListeners();
        }

        extractScriptProps() {
            const interfaceScript = document.getElementById('gtwy-user-script') ? document.getElementById('gtwy-user-script') : document.getElementById('gtwy-main-script');
            if (!interfaceScript) {
                //console.log('Script tag not found');
                return {};
            }


            const attributes = ['embedToken', 'hideCloseButton', 'parentId', 'hideFullScreenButton', 'hideHeader', 'defaultOpen', 'slide', 'agent_id', 'agent_name','version_id', 'token', 'gtwy_user', 'org_id', 'skipLoadGtwy', 'customIframeId'];
            return attributes.reduce((props, attr) => {
                if (interfaceScript.hasAttribute(attr)) {
                    let value = interfaceScript.getAttribute(attr);

                    if (['config', 'headerButtons', 'eventsToSubscribe'].includes(attr)) {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            console.error(`Error parsing ${attr}:`, e);
                        }
                    }
                    if (attr === 'defaultOpen') {
                        this.config.defaultOpen = value || false;
                    }
                    if (attr === 'slide' && (value === 'full' || value === 'left' || value === 'right')) {
                        this.config.slide = value || 'full';
                    }
                    if (attr === 'skipLoadGtwy') {
                        this.config.skipLoadGtwy = value === 'true' || value === true;
                    }
                    if(attr === 'hideHeader' || attr === 'hideCloseButton' || attr === 'hideFullScreenButton'){
                        this.config[attr] = value;
                    }
                    props[attr] = value;
                    this.state.tempDataToSend = { ...this.state.tempDataToSend, [attr]: value }
                }
                // console.log(this.config)
                return props;
            }, {});
        }

        initializeEventListeners() {
            this.observeScriptChanges();
            this.setupMessageListeners();
        }

        observeScriptChanges() {
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        this.handleScriptMutations(mutation);
                    }
                }
            });
            observer.observe(document.head, { childList: true });
        }

        handleScriptMutations(mutation) {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'SCRIPT' && (node.id === 'gtwy-user-script' || node.id === 'gtwy-main-script')) {
                    this.props = this.extractScriptProps();
                }
            });

            mutation.removedNodes.forEach(node => {
                if (node.tagName === 'SCRIPT' && (node.id === 'gtwy-user-script' || node.id === 'gtwy-main-script')) {
                    this.cleanupGtwyEmbed();
                }
            });
        }

        cleanupGtwyEmbed() {
            ['gtwy-iframe-parent-container', 'gtwyInterfaceEmbed', 'gtwyEmbed-style', 'gtwy-embed-header']
                .forEach(id => {
                    const element = document.getElementById(id);
                    if (element) element.remove();
                });
        }

        setupMessageListeners() {
            window.addEventListener('message', (event) => {
                this.handleIncomingMessages(event);
            });
        }

        handleIncomingMessages(event) {
            const { type, data } = event.data || {};
            //console.log(data)   
            switch (type) {
                case 'CLOSE_GTWY_EMBED':
                case 'CLOSE_GTWY':
                    this.closeGtwy();
                    break;
                case 'gtwyLoaded':
                    this.sendInitialData();
                    break;
                case 'configLoaded':
                    this.sendInitialData();
                    break;
            }
        }

        // Create header with fullscreen and close buttons
        createEmbedHeader() {
            // Don't create header if we have a parent container
            if (this.state.hasParentContainer) {
                return null;
            }

            const header = document.createElement('div');
            header.id = 'gtwy-embed-header';
            header.className = 'gtwy-embed-header';
            header.style.cssText = 'background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px);';

            // Create header content container
            const headerContent = document.createElement('div');
            headerContent.className = 'gtwy-header-content';

            // Create "Powered by GTWY" link
            const poweredBy = document.createElement('a');
            poweredBy.className = 'gtwy-powered-by';
            poweredBy.href = 'https://gtwy.ai';
            poweredBy.target = '_blank';
            poweredBy.rel = 'noopener noreferrer';
            poweredBy.style.textDecoration = 'none';
            poweredBy.innerHTML = `
                <span class="gtwy-powered-text" style="color: #ccc; font-size: 12px; margin-right: 6px; font-weight: 300;">Powered by</span>
                <span class="gtwy-brand" style="color: #fff; font-weight: 500; font-size: 12px;">GTWY AI</span>
            `;

            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'gtwy-header-buttons';

            // Create fullscreen button
            const fullscreenBtn = document.createElement('button');
            fullscreenBtn.id = 'gtwy-fullscreen-btn';
            fullscreenBtn.className = 'gtwy-header-btn gtwy-fullscreen-btn';
            fullscreenBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
            `;
            fullscreenBtn.title = 'Toggle Fullscreen';
            fullscreenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFullscreen(!this.state.fullscreen);
            });

            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.id = 'gtwy-close-btn';
            closeBtn.className = 'gtwy-header-btn gtwy-close-btn';
            closeBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;
            closeBtn.title = 'Close Embed';
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeGtwy();
            });

            // Assemble header
                if (this.config.hideFullScreenButton === "false" || this.config.hideFullScreenButton === false) {
                    buttonsContainer.appendChild(fullscreenBtn);
                } else {
                    buttonsContainer.appendChild(fullscreenBtn);
                    // fullscreenBtn.style.display = 'none';
                }
            if (this.config.hideCloseButton === "false" || this.config.hideCloseButton === false) {
                buttonsContainer.appendChild(closeBtn);
            } else {
                buttonsContainer.appendChild(closeBtn);
                // closeBtn.style.display = 'none';
            }
            headerContent.appendChild(poweredBy);
            headerContent.appendChild(buttonsContainer);
            header.appendChild(headerContent);

            return header;
        }

        // Add header styles
        addHeaderStyles() {
            if (!document.getElementById('gtwy-header-styles')) {
                const style = document.createElement('style');
                style.id = 'gtwy-header-styles';
                style.textContent = `
                    .gtwy-embed-header {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 50px;
                        background: #808080;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        z-index: 10000;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0 16px;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        backdrop-filter: blur(10px);
                    }
                    
                    .gtwy-header-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                    }
                    
                    .gtwy-header-title {
                        color: white;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        font-size: 14px;
                        font-weight: 600;
                        margin: 0;
                    }
                    
                    .gtwy-header-buttons {
                        display: flex;
                        gap: 8px;
                        align-items: center;
                    }
                    
                    .gtwy-header-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 32px;
                        height: 32px;
                        border: none;
                        border-radius: 6px;
                        background: rgba(255, 255, 255, 0.1);
                        color: white;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        backdrop-filter: blur(10px);
                    }
                    
                    .gtwy-header-btn:hover {
                        background: rgba(255, 255, 255, 0.2);
                        transform: translateY(-1px);
                    }
                    
                    .gtwy-header-btn:active {
                        transform: translateY(0);
                        background: rgba(255, 255, 255, 0.15);
                    }
                    
                    .gtwy-fullscreen-btn.fullscreen {
                        background: rgba(255, 255, 255, 0.2);
                    }
                    
                    .gtwy-close-btn:hover {
                        background: rgba(255, 59, 48, 0.8);
                    }
                    
                    /* Adjust iframe container to account for header */
                    #gtwy-iframe-parent-container.with-header #iframe-component-gtwyInterfaceEmbed {
                        margin-top: 50px;
                        height: calc(100% - 50px);
                    }

                    /* No header adjustments for parent container */
                    #gtwy-iframe-parent-container.parent-container #iframe-component-gtwyInterfaceEmbed {
                        margin-top: 0;
                        height: 100%;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        // Enhanced slide functionality
        applySlideStyles(slideType) {
            const iframeContainer = document.getElementById('gtwy-iframe-parent-container');
            if (!iframeContainer) return;

            // Don't apply slide styles if we have a parent container
            if (this.state.hasParentContainer) {
                return;
            }

            // Remove existing slide classes
            iframeContainer.classList.remove('slide-left', 'slide-right', 'slide-full');

            switch (slideType) {
                case 'left':
                    iframeContainer.classList.add('slide-left');
                    this.addSlideStyles();
                    break;
                case 'right':
                    iframeContainer.classList.add('slide-right');
                    this.addSlideStyles();
                    break;
                case 'full':
                default:
                    iframeContainer.classList.add('slide-full');
                    this.addSlideStyles();
                    break;
            }
        }

        addSlideStyles() {
            // Add CSS styles for slide animations if not already present
            if (!document.getElementById('gtwy-slide-styles')) {
                const style = document.createElement('style');
                style.id = 'gtwy-slide-styles';
                style.textContent = `
                    .slide-left {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 999px !important;
                        max-height: 98vh !important;
                        z-index: 9999 !important;
                        transform: translateX(-100%) !important;
                        transition: transform 0.3s ease-in-out !important;
                    }
                    
                    .slide-left.open {
                        transform: translateX(0) !important;
                    }
                    
                    .slide-right {
                        position: fixed !important;
                        right: 0 !important;
                        top: 0 !important;
                        width: 999px !important;
                        max-height: 98vh !important;
                        z-index: 9999 !important;
                        transform: translateX(100%) !important;
                        transition: transform 0.3s ease-in-out !important;
                    }
                    
                    .slide-right.open {
                        transform: translateX(0) !important;
                    }
                    
                    .slide-full {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100vw !important;
                        max-height: 98vh !important;
                        z-index: 9999 !important;
                        opacity: 0 !important;
                        transition: opacity 0.3s ease-in-out !important;
                    }
                    
                    .slide-full.open {
                        opacity: 1 !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        openGtwy(agent_id = null, meta={}, agent_name=null) {
            if (!this.state.isInitialized) {
                this.initializeGtwyEmbed().then(() => {
                    this.openGtwy(); // Retry after initialization
                });
                return;
            }
            if(agent_id)
            {
                SendDataToGtwyEmbed(agent_id)
            }
            if(agent_id && meta)
            {
                SendDataToGtwyEmbed({agent_id, meta})
            }
            if (agent_name)
            {
                SendDataToGtwyEmbed({agent_name})
            }

            const gtwyInterfaceEmbed = document.getElementById('gtwyInterfaceEmbed');
            const iframeContainer = document.getElementById('gtwy-iframe-parent-container');

            //console.log('gtwyInterfaceEmbed:', gtwyInterfaceEmbed);
            //console.log('iframeContainer:', iframeContainer);

            if (iframeContainer) {
                if (gtwyInterfaceEmbed) {
                    gtwyInterfaceEmbed.style.display = 'none';
                }
                iframeContainer.style.display = 'block';

                // Only apply slide behavior if not in parent container
                if (!this.state.hasParentContainer) {
                    const slideType = this.props?.slide || this.config.slide || 'full';
                    //console.log('slideType:', slideType);
                    this.applySlideStyles(slideType);

                    // Trigger slide animation
                    requestAnimationFrame(() => {
                        iframeContainer.classList.add('open');
                    });
                }

                //console.log('GTWY Embed opened successfully');
            } else {
                console.error('gtwy-iframe-parent-container not found');
            }


            if (window.parent) {
                window.parent.postMessage?.({ type: 'open', data: {} }, '*');
            }

            const iframeComponent = document.getElementById('iframe-component-gtwyInterfaceEmbed');
            iframeComponent?.contentWindow?.postMessage({ type: 'open', data: {} }, '*');
        }

        closeGtwy() {
            const iframeContainer = document.getElementById('gtwy-iframe-parent-container');

            if (iframeContainer?.style?.display === 'block') {
                // Only apply slide animation if not in parent container
                if (!this.state.hasParentContainer) {
                    // Remove open class for slide animation
                    iframeContainer.classList.remove('open');
                }

                const animationDelay = this.state.hasParentContainer ? 0 : 300;

                setTimeout(() => {
                    // Send message to parent window normally, but stringify for ReactNativeWebView
                    if (window.parent) {
                        window.parent.postMessage?.({ type: 'close', data: {} }, '*');
                    }
                    iframeContainer.style.display = 'none';
                }, animationDelay); // Wait for animation to complete
            }
        }

        toggleFullscreen(enable) {
            // Don't allow fullscreen if we have a parent container
            if (this.state.hasParentContainer) {
                //console.log('Fullscreen not available in parent container');
                return;
            }

            const iframeContainer = document.getElementById('gtwy-iframe-parent-container');
            const fullscreenBtn = document.getElementById('gtwy-fullscreen-btn');

            // If enable parameter is not provided, toggle based on current state
            if (enable === undefined) {
                enable = !this.state.fullscreen;
            }

            // If already in the desired state, do nothing
            if (this.state.fullscreen === enable) {
                //console.log(`Already ${enable ? 'in fullscreen' : 'not in fullscreen'} mode`);
                return;
            }

            this.state.fullscreen = enable;

            if (iframeContainer) {
                // Add transition for smooth animation
                iframeContainer.style.transition = 'width 0.3s ease-in-out, height 0.3s ease-in-out';

                if (enable) {
                    // Entering fullscreen mode
                    iframeContainer.style.width = '100vw';
                    iframeContainer.style.maxHeight = '98vh';
                    iframeContainer.classList.add('full-screen-without-border');
                    iframeContainer.classList.add('slide-full');

                    if (fullscreenBtn) {
                        fullscreenBtn.classList.add('fullscreen');
                        fullscreenBtn.title = 'Exit Fullscreen';
                        fullscreenBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                            </svg>
                        `;
                    }
                } else {
                    // Exiting fullscreen mode
                    iframeContainer.classList.remove('full-screen-without-border');
                    iframeContainer.classList.remove('slide-full');

                    if (fullscreenBtn) {
                        fullscreenBtn.classList.remove('fullscreen');
                        fullscreenBtn.title = 'Toggle Fullscreen';
                        fullscreenBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                            </svg>
                        `;
                    }

                    // Restore original dimensions
                    const height = this.props?.config?.height || this.config.height;
                    const heightUnit = this.props?.config?.heightUnit || this.config.heightUnit;
                    const width = this.props?.config?.width || this.config.width;
                    const widthUnit = this.props?.config?.widthUnit || this.config.widthUnit;

                    iframeContainer.style.maxHeight = `${height}${heightUnit}`;
                    iframeContainer.style.width = `${width}${widthUnit}`;
                }
            }
        }

        async initializeGtwyEmbed() {
            //console.log('Initializing GTWY Embed...');

            return new Promise((resolve) => {
                const initialize = () => {
                    if (this.state.bodyLoaded) {
                        resolve();
                        return;
                    }

                    this.loadContent();
                    this.state.isInitialized = true;
                    //console.log('GTWY Embed initialized');
                    resolve();
                };

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initialize);
                } else {
                    initialize();
                }
            });
        }

        loadContent() {
            if (this.state.bodyLoaded) return;
            this.extractScriptProps();
            this.createIframeContainer();
            
            // Only call loadGtwyEmbed if skipLoadGtwy is false and gtwy_user is not present
            if (!this.config.skipLoadGtwy && !this.state.tempDataToSend?.gtwy_user) {
                this.loadGtwyEmbed();
            } else {
                // If skipLoadGtwy is true, create iframe with custom content
                this.createCustomIframe();
            }
            
            this.updateProps(this.state.tempDataToSend || {});
            this.state.bodyLoaded = true;
        }

        createCustomIframe() {
            const iframeComponent = document.getElementById('iframe-component-gtwyInterfaceEmbed');
            if (!iframeComponent) return;

            // Check if this is a GTWY user - if so, open in new tab instead of iframe
            if (this.state.tempDataToSend?.gtwy_user === 'true') {
                const customIframeId = this.scriptIds.customIframeId || this.props.customIframeId;
                if (customIframeId) {
                    // Open configuration in new browser tab for GTWY users
                    window.open(customIframeId, '_blank', 'noopener,noreferrer');
                    // Close the current iframe since we opened new tab
                    this.closeGtwy();
                    return;
                }
            }

            // For non-GTWY users, proceed with normal iframe behavior
            const customIframeId = this.scriptIds.customIframeId || this.props.customIframeId;
            
            if (customIframeId) {
                // Set src to custom URL or embed content
                iframeComponent.src = customIframeId;
            } else {
                // Send the script data directly to the iframe without loading from server
                const encodedData = encodeURIComponent(JSON.stringify(this.state.tempDataToSend));
                const modifiedUrl = `${this.urls.gtwyUrl}?interfaceDetails=${encodedData}`;
                iframeComponent.src = modifiedUrl;
            }

            // Apply any config from script attributes
            this.applyConfig(this.config);
            
            if (this.state.isInitialized) {
                window.postMessage({
                    type: 'configLoaded',
                    data: this.props.config
                }, '*');
            }
        }

        createIframeContainer() {
            this.parentContainer = document.createElement('div');
            
            // Use custom ID if provided from script, otherwise use default
            const customContainerId = this.scriptIds.customContainerId || 'gtwy-iframe-parent-container';
            this.parentContainer.id = customContainerId;

            // Check if we have a parent container
            const parentId = this.props.parentId || this.state.tempDataToSend?.parentId || '';
            this.state.hasParentContainer = !!parentId && !!document.getElementById(parentId);

            // Set appropriate classes based on parent container
            if (this.state.hasParentContainer) {
                this.parentContainer.className = 'popup-parent-container parent-container';
            } else {
                this.parentContainer.className = 'popup-parent-container with-header';
            }

            this.parentContainer.style.display = 'none'; // Initially hidden
            this.parentContainer.style.position = 'relative'; // Needed for header positioning

            // Only create and add header if not in parent container
            if (!this.state.hasParentContainer) {
                const header = this.createEmbedHeader();
                if (header) {
                    this.addHeaderStyles();
                    this.parentContainer.appendChild(header);
                    if (this.config.hideHeader === "true" || this.config.hideHeader === true) {
                        header.style.display = 'none';
                    } else {
                        header.style.display = 'block';
                    }
                }
            } else {
                // No header when in parent container
            }

            const iframe = document.createElement('iframe');
            
            // Use custom iframe ID if provided from script, otherwise use default
            const customIframeId = this.scriptIds.customIframeId || 'iframe-component-gtwyInterfaceEmbed';
            iframe.id = customIframeId;
            
            iframe.title = 'iframe';
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
            iframe.allow = 'microphone *; camera *; midi *; encrypted-media *';

            // Set initial dimensions for the iframe
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';

            // Only set minimum height if not in parent container
            if (!this.state.hasParentContainer) {
                if (this.config.hideHeader === "true" || this.config.hideHeader === true) {
                    iframe.style.marginTop = '0vh';
                    iframe.style.maxHeight = '100vh';
                } else {
                    iframe.style.marginTop = '5vh';
                    iframe.style.maxHeight = '95vh';
                }
            }

            this.parentContainer.appendChild(iframe);
            this.changeContainer(parentId, this.parentContainer);
        }

        changeContainer(parentId, parentContainer = this.parentContainer) {
            // Update hasParentContainer state
            this.state.hasParentContainer = !!parentId && !!document.getElementById(parentId);

            if (this.state.hasParentContainer) {
                const container = document.getElementById(parentId);
                container.style.position = 'relative';
                this.parentContainer.style.position = 'absolute';
                this.parentContainer.style.top = '0';
                this.parentContainer.style.left = '0';
                this.parentContainer.style.width = '100%';
                this.parentContainer.style.height = '100%';
                this.parentContainer.style.minHeight = 'unset'; // Remove min height in parent container

                // Update class to reflect parent container status
                this.parentContainer.className = 'popup-parent-container parent-container';

                container.appendChild(parentContainer);
            } else {
                // Not in parent container - use default positioning
                this.parentContainer.style.position = 'fixed';
                this.parentContainer.style.maxHeight = '100vh';

                // Update class to reflect standalone status
                this.parentContainer.className = 'popup-parent-container with-header';

                if (document.getElementById('interface-gtwy-embed')) {
                    document.getElementById('interface-gtwy-embed').appendChild(parentContainer);
                } else {
                    document.body.appendChild(parentContainer);
                }
            }
        }

        async loadGtwyEmbed() {
            try {
                const response = await this.fetchGtwyDetails();
                this.processGtwyDetails(response);
            } catch (error) {
                console.error('GTWY embed loading error:', error);
            }
        }

        async fetchGtwyDetails() {
            try {
                const script = document.getElementById('gtwy-main-script');
                const embedToken = script?.getAttribute('embedToken');

                const requestOptions = embedToken && this.createTokenBasedRequest(embedToken)

                const response = await fetch(this.urls.login, requestOptions);
                return response.json();
            } catch (error) {
                console.error('Fetch login user error:', error)
            }
        }

        createTokenBasedRequest(embedToken) {
            return {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: embedToken
                }
            };
        }

        processGtwyDetails(data) {
            const iframeComponent = document.getElementById('iframe-component-gtwyInterfaceEmbed');
            if (!iframeComponent) return;
            let encodedData = '';
            let tempData = data.data;
            this.state.tempDataToSend?.agent_id && (tempData.agent_id = this.state.tempDataToSend?.agent_id);
            this.state.tempDataToSend?.agent_name && (tempData.agent_name = this.state.tempDataToSend?.agent_name);
            encodedData = encodeURIComponent(JSON.stringify(tempData));
            const modifiedUrl = `${this.urls.gtwyUrl}?interfaceDetails=${encodedData}`;
            iframeComponent.src = modifiedUrl;

            this.config = { ...this.config, ...(data?.data?.config || {}) };
            this.applyConfig(this?.config);
        if (this.state.isInitialized) {
            window.postMessage({
                type: 'configLoaded',
                data: this.props.config
            }, '*');
        }
        }

        applyConfig(config = {}) {
            const iframeParentContainer = document.getElementById('gtwy-iframe-parent-container');
            if (!iframeParentContainer) return;

            if (config && Object.keys(config).length > 0) {
                // Handle header configurations
                if ('hideHeader' in config) {
                    this.config.hideHeader = config.hideHeader;
                    iframeParentContainer.classList.toggle('with-header', !config.hideHeader);
                }
                if ('hideCloseButton' in config) {
                    this.config.hideCloseButton = config.hideCloseButton;
                    const closeBtn = document.getElementById('gtwy-close-btn');
                    if (closeBtn) {
                        closeBtn.style.display = (config.hideCloseButton === true || config.hideCloseButton === 'true') ? 'none' : 'flex';
                    }
                }
                if ('hideFullScreenButton' in config) {
                    this.config.hideFullScreenButton = config.hideFullScreenButton;
                    const fullscreenBtn = document.getElementById('gtwy-fullscreen-btn');
                    if (fullscreenBtn) {
                        fullscreenBtn.style.display = (config.hideFullScreenButton === true || config.hideFullScreenButton === 'true') ? 'none' : 'flex';
                    }
                }
                if ('hideHeader' in config) {
                    this.config.hideHeader = config.hideHeader;
                    const header = document.getElementById('gtwy-embed-header');
                    const iframe = document.getElementById('iframe-component-gtwyInterfaceEmbed');
                    if (header) {
                        if (config.hideHeader === true || config.hideHeader === 'true'){
                            header.style.display = 'none';
                            if (iframe) {
                                iframe.style.marginTop = '0px';
                                iframe.style.maxHeight = '100vh';
                            }
                        } else {
                            iframe.style.marginTop = '5vh';
                            iframe.style.maxHeight = '95vh';
                            header.style.display = 'flex';
                        }
                    }
                }

                // Handle slide configuration
                if (config.slide) {
                    this.props.slide = config.slide;
                }
            }

            // Only apply dimensions if not in parent container
            if (!this.state.hasParentContainer) {
                const height = config?.height || this.config.height;
                const heightUnit = config?.heightUnit || this.config.heightUnit;
                const width = config?.width || this.config.width;
                const widthUnit = config?.widthUnit || this.config.widthUnit;

                iframeParentContainer.style.height = `${height}${heightUnit}`;
                iframeParentContainer.style.width = `${width}${widthUnit}`;
                iframeParentContainer.style.minHeight = '100vh'; // Ensure minimum height
            }
        }

        updateProps(newProps) {
            this.props = { ...this.props, ...newProps };
            this.setPropValues(newProps);
        }

        setPropValues(newprops) {
            if (newprops.fullScreen === true || newprops.fullScreen === 'true') {
                document.getElementById('gtwy-iframe-parent-container')?.classList.add('full-screen-gtwyInterfaceEmbed');
                this.state.tempDataToSend = { ...this.state.tempDataToSend, hideFullScreenButton: true };
                sendMessageToGtwy({ type: 'gtwyInterfaceData', data: { hideFullScreenButton: true } });
            }
            // Handle slide property
            if ('slide' in newprops) {
                this.props.slide = newprops.slide;
            }
        }

        sendInitialData() {
            if (this.state.tempDataToSend) {
                sendMessageToGtwy({ type: 'gtwyInterfaceData', data: this.state.tempDataToSend });
                if (this?.state?.tempDataToSend?.defaultOpen === true || this?.state?.tempDataToSend?.defaultOpen === "true" || this?.state?.config?.defaultOpen === true || this?.state?.config?.defaultOpen === "true" || this.config.defaultOpen === true || this.config.defaultOpen === "true") {
                    this.openGtwy();
                }
                this.state.tempDataToSend = null;
            }
        }
    }

    const gtwyEmbedManager = new GtwyEmbedManager();

    const SendDataToGtwyEmbed = function (dataToSend) {
        const iframeComponent = document.getElementById('iframe-component-gtwyInterfaceEmbed');

        // Parse string data if needed
        if (typeof dataToSend === 'string') {
            try {
                dataToSend = JSON.parse(dataToSend);
            } catch (e) {
                console.error('Failed to parse dataToSend:', e);
                return;
            }
        }

        // Handle parent container changes
        if ('parentId' in dataToSend) {
            gtwyEmbedManager.state.tempDataToSend = {
                ...gtwyEmbedManager.state.tempDataToSend,
                ...dataToSend
            };
            const previousParentId = gtwyEmbedManager.props['parentId'];
            const existingParent = document.getElementById(previousParentId);

            if (existingParent?.contains(gtwyEmbedManager.parentContainer)) {
                if (previousParentId !== dataToSend.parentId) {
                    if (previousParentId) {
                        if (existingParent && gtwyEmbedManager.parentContainer && existingParent.contains(gtwyEmbedManager.parentContainer)) {
                            existingParent.removeChild(gtwyEmbedManager.parentContainer);
                        }
                    } else if (gtwyEmbedManager.parentContainer && document.body.contains(gtwyEmbedManager.parentContainer)) {
                        document.body.removeChild(gtwyEmbedManager.parentContainer);
                    }
                    gtwyEmbedManager.updateProps({ parentId: dataToSend.parentId });
                    gtwyEmbedManager.changeContainer(dataToSend.parentId || '');
                }
            } else {
                gtwyEmbedManager.updateProps({ parentId: dataToSend.parentId });
                gtwyEmbedManager.changeContainer(dataToSend.parentId || '');
            }
        }

        // Process other properties
        processDataProperties(dataToSend, iframeComponent);
    };

    const processDataProperties = (data, iframeComponent) => {
        // Create a props object for all UI-related properties
        const propsToUpdate = {};

        // Collect all UI properties in one object
        if ('hideCloseButton' in data) propsToUpdate.hideCloseButton = data.hideCloseButton || false;
        if (data.fullScreen === true || data.fullScreen === 'true' ||
            data.fullScreen === false || data.fullScreen === 'false') {
            propsToUpdate.fullScreen = data.fullScreen;
        }
        if ('slide' in data) propsToUpdate.slide = data.slide;

        // Update props in a single call if we have any
        if (Object.keys(propsToUpdate).length > 0) {
            gtwyEmbedManager.updateProps(propsToUpdate);
        }

        // Handle iframe communication
        if (iframeComponent?.contentWindow) {
            // Send general data
            if (data) {
                gtwyEmbedManager.state.tempDataToSend = {
                    ...gtwyEmbedManager.state.tempDataToSend,
                    ...data
                };
                sendMessageToGtwy({ type: 'gtwyInterfaceData', data: data });
            }
        }

        // Handle config updates
        if ('config' in data && data.config) {
            const newConfig = { ...gtwyEmbedManager.config, ...data.config };
            gtwyEmbedManager.applyConfig(newConfig);
            gtwyEmbedManager.updateProps({ config: newConfig });
        }
    }

    // New GTWY specific functions - FIXED WITH PROPER INITIALIZATION
    window.openGtwy = ({agent_id = "", meta={}, agent_name=""} = "") => {
        gtwyEmbedManager.openGtwy(agent_id, meta, agent_name);
    };
    window.closeGtwy = () => gtwyEmbedManager.closeGtwy();

    window.GtwyEmbed = {
        open: () => {
            gtwyEmbedManager.openGtwy(agent_id = "", meta={}, agent_name="");
        },
        close: () => {
            gtwyEmbedManager.closeGtwy();
        },
        show: () => {
            const gtwyInterfaceEmbed = document.getElementById('iframe-component-gtwyInterfaceEmbed');
            if (gtwyInterfaceEmbed) {
                gtwyInterfaceEmbed.style.display = 'unset';
            }
        },
        hide: () => {
            const gtwyInterfaceEmbed = document.getElementById('iframe-component-gtwyInterfaceEmbed');
            if (gtwyInterfaceEmbed) {
                gtwyInterfaceEmbed.style.display = 'none';
            }
        },
        sendDataToGtwy: (data) => {
            SendDataToGtwyEmbed(data);
        },
        // New methods for header control
        toggleFullscreen: () => {
            gtwyEmbedManager.toggleFullscreen(!gtwyEmbedManager.state.fullscreen);
        },
        enterFullscreen: () => {
            gtwyEmbedManager.toggleFullscreen(true);
        },
        exitFullscreen: () => {
            gtwyEmbedManager.toggleFullscreen(false);
        }
    }

    // Helper function to send messages to the iframe
    function sendMessageToGtwy(messageObj) {
        const iframeComponent = document.getElementById('iframe-component-gtwyInterfaceEmbed');
        if (iframeComponent?.contentWindow) {
            iframeComponent?.contentWindow?.postMessage({type: 'gtwyMessage', data: messageObj}, '*');
        }
    }

    // Initialize the manager
    gtwyEmbedManager.initializeGtwyEmbed();
})();