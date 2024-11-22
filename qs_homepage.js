(function(require, requirejs, define) {
require([], function() {
	console.log("JS File Loaded:Loop");
    // Added because variable isn't declared on the homepage
    var loginform = document.loginform, keyCodes = {
        'ENTER': 13,
        'TAB': 9,
        'ESC': 27,
        'SPACE': 32,
        'PAGEUP': 33,
        'PAGEDOWN': 34,
        'END': 35,
        'HOME': 36,
        'LEFT': 37,
        'UP': 38,
        'RIGHT': 39,
        'DOWN': 40
    };

    // ------------------ TAB FUNCTIONALITY --------------------- //
    var tabHelper = {
        directions: {
            37: -1,
            38: -1,
            39: 1,
            40: 1
        },
        setActiveTab: function(tab){
            var $ = jQuery, $tabEl = $(tab.el), currentId, hp_cookies, hp_pf, hp_pl,
                controlsEl = document.getElementById(tab.controls);
            this.clearTabs(tab);
            $tabEl.removeAttr('tabindex');
            $tabEl.attr('aria-selected', 'true');
            controlsEl.removeAttribute('hidden');
            controlsEl.style.display = "";
            $tabEl.focus();
            // DOM Manipulations
            currentId = $tabEl.attr('id');
            $tabEl.parent().addClass('active');

            Bm.Common.CookieUtils.setCookie('hp-' + _BM_USER_LOGIN + '-pf', currentId); // sets pf cookie
            hp_cookies = checkCookies();
            hp_pf = hp_cookies[0];
            $('#content-' + currentId).show();
        },
        clearTabs: function(tab){
            var tmp = tab.tabs.length, $ = jQuery;
            while(tmp--){
                tab.tabs[tmp].setAttribute('aria-selected', 'false');
                tab.tabs[tmp].setAttribute('tabindex', '-1');
            }
            tmp = tab.panels.length;
            while(tmp--){
                tab.panels[tmp].setAttribute('hidden', 'hidden');
                tab.panels[tmp].style.display = "none";
            }
            tmp = document.querySelectorAll(".product-family-content");
            for (var i = 0; i < tmp.length; i++){
                tmp[i].style.display = 'none';
            }
            $("#family-nav .active").removeClass("active");
        },
        moveTabFocus: function(e, tab){
            var kCode = e.keyCode;
            if (this.directions[kCode]){
                var targEl = e.target;
                if (targEl.dataset.idx){
                    if (tab.tabs[+targEl.dataset.idx + this.directions[kCode]]){
                        tab.tabs[+targEl.dataset.idx + this.directions[kCode]].focus();
                    } else if (this.directions[kCode] > 0) {
                        this.firstTab(tab.tabs);
                    } else if (this.directions[kCode] < 0) {
                        this.lastTab(tab.tabs);
                    }
                }
            }
        },
        firstTab: function(tabs){
            tabs[0].focus();
        },
        lastTab: function(tabs){
            tabs[tabs.length - 1].focus();
        }
    };
    // ------------------ PRODUCT FAMILY START ------------------ //
    var ProductFamily = function(el){
        this.el = el;
        this.productLines = [];
    };
    ProductFamily.prototype.init = function(){
        var pLines = [], pLine;
        this.el.setAttribute('aria-selected', "false");
        this.el.addEventListener('keydown', this.handleKeydown.bind(this));
        this.el.addEventListener('click', this.handleClick.bind(this));
        this.el.addEventListener('keyup', this.handleKeyup.bind(this));

        this.tabs = document.getElementById('family-nav').querySelectorAll('[role="tab"]');
        this.panels = document.querySelectorAll('#wrapper-inner > #content > div[role="tabpanel"]');
        this.controls = this.el.getAttribute('aria-controls');

        var plTab = document.getElementById(this.controls);
        if(plTab) {
            pLines = plTab.querySelectorAll('.pl-expando-hdr');

            var i = pLines.length;
            while(i--){
                pLine = new ProductLine(pLines[i]);
                pLine.init();
                this.productLines.unshift(pLine);
            }
        }
    };
    ProductFamily.prototype.handleKeydown = function(e){
        switch (e.keyCode) {
            case keyCodes.END: // First Tab
                e.preventDefault();
                tabHelper.lastTab(this.tabs);
                break;
            case keyCodes.HOME: // Last Tab
                e.preventDefault();
                tabHelper.firstTab(this.tabs);
                break;
            case keyCodes.UP: // Prevent page scroll
            case keyCodes.DOWN:
                e.preventDefault();
                tabHelper.moveTabFocus(e, this);
                break;
        }
    };
    ProductFamily.prototype.handleClick = function(e){
    	tabHelper.setActiveTab(this);
    	e.preventDefault();
    };
    ProductFamily.prototype.handleKeyup = function(e){
        switch (e.keyCode) {
            case keyCodes.LEFT:
            case keyCodes.RIGHT:
                tabHelper.moveTabFocus(e, this);
                break;
            case keyCodes.ENTER: // Select Tab
            case keyCodes.SPACE:
                tabHelper.setActiveTab(this);
                break;
        }
    };
    // ------------------ PRODUCT FAMILY END ------------------ //
    // ------------------ PRODUCT LINE START ------------------ //
    var ProductLine = function(el){
        this.el = el;
        this.expando = el.querySelector('.pl-expando');
        this.contentPanel = el.nextElementSibling;
    };
    ProductLine.prototype.init = function(){
        this.el.addEventListener('click', this.handleClick.bind(this));
        this.expando.addEventListener('click', this.handleClick.bind(this));
    };
    ProductLine.prototype.handleClick = function(e){
        if (this.expando.getAttribute('aria-expanded') === 'true') {
            this.doCollapse();
        } else {
            this.doExpand();
        }
        if (e.currentTarget.classList.contains('pl-expando')){
            e.stopPropagation();
            e.preventDefault();
        }
    };
    ProductLine.prototype.doExpand = function(){ this.toggleState(true); };
    ProductLine.prototype.doCollapse = function(){ this.toggleState(false); };
    ProductLine.prototype.toggleState = function(state){
        var $panel = jQuery(this.contentPanel);
        if (state) {
            if (!$panel.is(':visible')) {
                this.expando.setAttribute('aria-expanded', 'true');
                $panel.slideDown(100);
            }
        } else {
            if ($panel.is(':visible')) {
                this.expando.setAttribute('aria-expanded', 'false');
                $panel.slideUp(100);
            }
        }
        this.expando.classList.toggle('expanded', state);
    };
    // ------------------ PRODUCT LINE END ------------------ //

    // ------------------ LAYOUT START ------------------ //
    var qs_layoutLogic = function (){
        (function($){
            //IE7 Temp Fix
            // adds class if not logged in and Products show (guest access)
            var productCount = $('#family-nav').length;
            if ((_BM_USER_LOGIN == 'guest1' || _BM_USER_COMPANY == 'GuestCompany') && productCount > 0 ) {
                $('body').addClass('guest-access');
                $('#login-form-wrap').prepend('<div class="login-toggle"></div>');// adds close button for login-toggle
            }
            else if(_BM_USER_LOGIN != "" || productCount == 0){
                $('body').addClass('login-view');
            }
            // Initialize Search popups (Parts and Serial#)
            initSearchPopup('#search-outer-wrapper', '.parts-search-toggle', '#simple-search');
            initSearchPopup('#serial-search-outer-wrapper', '.serial-num-search-toggle', '#serial-number');

            // Close the Parts Search/Serial Number Search popup on clicking outside the popup.
            window.onclick = function(event) {
                var isPartsSearchVisible = $("#search-outer-wrapper").css("display");
                var isSerialNumSearchVisible = $("#serial-search-outer-wrapper").css("display");
                if (isPartsSearchVisible == 'block' && event.target.closest('#search-outer-wrapper') == null) {
                    closeSearchPopup('#search-outer-wrapper');
                } else if(isSerialNumSearchVisible == 'block' && event.target.closest('#serial-search-outer-wrapper') == null) {
                    closeSearchPopup('#serial-search-outer-wrapper');
                }
            }

            function initSearchPopup(outer, toggle, input){
            	var $wrapper = $('#search-login-toggle-wrapper');
            	// Clicking search button opens popup form
                $wrapper.children(toggle).click(function () {
                    $wrapper.slideUp(100, function() {
                    	$(outer).slideDown(100, function(){ $(input).focus(); }).attr('tabindex','0');
                    });
                });
                // Clicking interior toggle (X) closes popup form
                // (and returns focus to original link/button)
                $(toggle, outer).click(function () {
                    closeSearchPopup(outer, toggle);
                });
                // On Esc, close popup form
                $(outer).keydown(function(e){
                  var code = e.keyCode || e.which;
                  if(code === 27 ) closeSearchPopup(outer, toggle);
                });
                // On pressing Enter on close icon, close popup form
                $(toggle, outer).keydown(function(e){
                    var code = e.keyCode || e.which;
                    if(code === 13 ) closeSearchPopup(outer, toggle);
                });
            }

            function closeSearchPopup(outer, toggle){
            	var $wrapper = $('#search-login-toggle-wrapper');
                $(outer).slideUp(100, function() {
                    $wrapper.slideDown(100);
                    if (toggle) $wrapper.children(toggle).focus();
                });
            }

            function bringLoginToFront() {
                $('form[name="loginform"]').css('z-index', '100');
            }
            // ---------- Login Form ----------------///
            // show/hide login
            $('#search-login-toggle-wrapper .login-toggle').click(function () {
                $('#search-login-toggle-wrapper').slideUp(100, function() {
                    $('#login-form-wrap').slideDown(100);
                    bringLoginToFront();
                });
            });
            if ($('.error-text').length) {
                $('#search-login-toggle-wrapper').slideUp();
                bringLoginToFront();
            }

            $('#login-form-wrap .login-toggle').click(function () {
                $('#login-form-wrap').slideUp(100, function() {
                    $('#search-login-toggle-wrapper').slideDown(100);
                });
            });
        })(jQuery);
    };

    // ------------------ CONTENT START ------------------ //
    var qs_contentLogic = function(){
        (function($){
            // if just parts takes user to the parts search results page and not logged in as services
            if($("#parts-only").length && _BM_USER_COMPANY != "BigMachines.com"){
                document.parts_simple.submit();
            }

            // if not logged in, removes cookie
            if(_BM_USER_LOGIN =="" || _BM_USER_LOGIN == 'guest1' || _BM_USER_COMPANY == 'GuestCompany'){
                Bm.Common.CookieUtils.setCookie("last_transaction", null, {path: '/'});
            }

            var tab, qsCookies = checkCookies(); // gets cookies for PF

            if(qsCookies[0]){
                tab = $('#' + qsCookies[0]);
            } else { // if no cookie
                tab = $('#family-nav li:first-child a[role="tab"]');
            }
            if (tab.length) {
                tab[0].click();
                document.activeElement.blur();
            }

        })(jQuery);
    };
	// ------------------ Company SSO Login IPR-798 START:Ramesh Rathod 06-Sep-2024 ------------------ //
	var qs_SSOLogic = function(){
        (function($){
			console.log("Inside SSO Funcnction");
			var $div = $('<div />').appendTo('#login-form'); // #login-form
			$div.attr('id', 'CompanySSO');
			$( "#CompanySSO" ).addClass( "sso-container" );

			$div = $('<a />').appendTo('.sso-container');
  			$div.attr('id', 'ssoBtn');   
			
			//---- Please remove comment for Active instances if we are moving/deploying the code---------------------
			
			//-------------------Development(Test 3)--------------------------
			$div.attr('href',"https://"+_BM_HOST_COMPANY+".bigmachines.com/sso/saml_request.jsp?");
			
			console.log("https://"+_BM_HOST_COMPANY+".bigmachines.com/sso/saml_request.jsp?");
			//------------------UAT(Test 2)-----------------
		    //$div.attr('href','https://badgerinctest2.bigmachines.com/sso/saml_request.jsp?');
		
			
			//------------------  Regression(DEV 2) :Start ---------------------
			//$div.attr('href','https://badgerincdev2.bigmachines.com/sso/saml_request.jsp?');
			
			
			//------------------ CPQ TEST(DEV 5) :Start ---------------------
			//$div.attr('href','https://badgerinctest.bigmachines.com/sso/saml_request.jsp?');
			
			
			//-----------------------------End -----------------------------------------------------------------------
			
			$("#ssoBtn").append("Company Single Sign-On");		
			$div = $('<br>').appendTo('.sso-container');	
			$div = $('<h3 />').appendTo('.sso-container');
			$div.attr('class', 'horizontal-divider');
			 
			$div = $('<span />').appendTo('.horizontal-divider');
			$div.attr('id', 'orText');
			$("#orText").append("or");


        })(jQuery);
    };
	//-------------------------------------- END --------------------------------------------------------------------
	
    // Check PF/PL cookies
    function checkCookies(){
        var hp_pf = Bm.Common.CookieUtils.checkCookie('hp-'+_BM_USER_LOGIN+'-pf'); // gets cookie for PF
        return [hp_pf];
    }
    (function($){
        $(document).ready(function(){

            var pFamilyTabs = document.getElementById('family-nav'),
                pFamilyTab;

            if (pFamilyTabs){
                pFamilyTabs = pFamilyTabs.querySelectorAll('[role="tab"]');
                var i = pFamilyTabs.length;
                while(i--) {
                    pFamilyTab = new ProductFamily(pFamilyTabs[i]);
                    pFamilyTab.init();
                    pFamilyTab.el.dataset.idx = i;
                }
            }
			
            // call layout logic
            qs_layoutLogic();
            // call content logic
            qs_contentLogic();
			
			// SSO Logic added for IPR-798
			qs_SSOLogic();
			
			

        });
    })(jQuery);
    // ------------------ CONTENT END ------------------ //
    });
})(bmref.require, bmref.requirejs, bmref.define);
