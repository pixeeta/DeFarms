function StorageProvider() {
    const self = this;

    self.getDarkModeSetting = function () {
        return getDarkModeSetting();
    }

    self.setDarkModeSetting = function (isActive) {
        return setDarkModeSetting(isActive);
    }


    self.getShowStakedOnlyPoolsSetting = function () {
        return getShowStakedOnlyPoolsSetting();
    }

    self.setShowStakedOnlyPoolsSetting = function (isActive) {
        return setShowStakedOnlyPoolsSetting(isActive);
    }


    self.getShowNonIncentivizedPoolsSetting = function () {
        return getShowNonIncentivizedPoolsSetting();
    }

    self.setShowNonIncentivizedPoolsSetting = function (isActive) {
        return setShowNonIncentivizedPoolsSetting(isActive);
    }


    self.getFarmAccordionSettings = function() {
        return getFarmAccordionSettings();
    }

    self.setAccordionSettingsForFarm = function(farmId, isCollapsed) {
        return setAccordionSettingsForFarm(farmId, isCollapsed);
    }

    
    self.getUserWalletAddress = function() {
        return getUserWalletAddress();
    }

    self.setUserWalletAddress = function(address) {
        return setUserWalletAddress(address);
    }


    function init(){
        return self;
    };

    init();

    function getDarkModeSetting() {
        return JSON.parse(window.localStorage.getItem('darkModeIsActive'));
    }

    function setDarkModeSetting(isActive) {
        window.localStorage.setItem('darkModeIsActive', JSON.stringify(isActive));
    }


    function getShowStakedOnlyPoolsSetting() {
        return JSON.parse(window.localStorage.getItem('showStakedOnlyPoolsIsActive'));
    }

    function setShowStakedOnlyPoolsSetting(isActive) {
        window.localStorage.setItem('showStakedOnlyPoolsIsActive', JSON.stringify(isActive));
    }


    function getShowNonIncentivizedPoolsSetting() {
        return JSON.parse(window.localStorage.getItem('showNonIncentivisedPoolsIsActive'));
    }

    function setShowNonIncentivizedPoolsSetting(isActive) {
        window.localStorage.setItem('showNonIncentivisedPoolsIsActive', JSON.stringify(isActive));
    }


    function getUserWalletAddress() {
        return window.localStorage.getItem('userWalletAddress');
    }

    function setUserWalletAddress(address) {
        window.localStorage.setItem('userWalletAddress', address);
    }


    function getFarmAccordionSettings() {
        return JSON.parse(window.localStorage.getItem('farmAccordionSettings'));
    }

    function setAccordionSettingsForFarm(farmId, isCollapsed) {
        let farmAccordionSettings = getFarmAccordionSettings();
        if (!farmAccordionSettings) {
            farmAccordionSettings = {};
        }

        farmAccordionSettings[farmId] = {
            isCollapsed: isCollapsed
        };

        window.localStorage.setItem('farmAccordionSettings', JSON.stringify(farmAccordionSettings));
    }
}