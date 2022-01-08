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


    self.getFarmAccordionSettings = function(farmId) {
        return getFarmAccordionSettings(farmId);
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

    self.getTokenType = (address) => {
        return getTokenType(address)
    }
    self.setTokenType = (address, type) => {
        return setTokenType(address, type)
    }

    self.getImpermanentLossSettingsForFarm = (farmId) => {
        return getImpermanentLossSettingsForFarm(farmId)
    }
    self.getImpermanentLossSettingsForPool = (farmId, poolId) => {
        return getImpermanentLossSettingsForPool(farmId, poolId)
    }
    self.setImpermanentLossSettingsForPool = (farmId, poolId, tokenSymbol, initialAmount) => {
        return setImpermanentLossSettingsForPool(farmId, poolId, tokenSymbol, initialAmount)
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


    function getFarmAccordionSettings(farmId) {
        let isCollapsed = null;
        let settingsList = JSON.parse(window.localStorage.getItem('farmAccordionSettings'));
        if (settingsList) {
            isCollapsed = settingsList[farmId]?.isCollapsed;
        }

        return isCollapsed;
    }

    function getAllFarmAccordionSettings() {
        return JSON.parse(window.localStorage.getItem('farmAccordionSettings'));
    }

    function setAccordionSettingsForFarm(farmId, isCollapsed) {
        let farmAccordionSettings = getAllFarmAccordionSettings();
        if (!farmAccordionSettings) {
            farmAccordionSettings = {};
        }

        farmAccordionSettings[farmId] = {
            isCollapsed: isCollapsed
        };

        window.localStorage.setItem('farmAccordionSettings', JSON.stringify(farmAccordionSettings));
    }

    function getTokenType(address) {
        let tokenType = null;
        let savedTokens = JSON.parse(window.localStorage.getItem('lpTokens'));
        if (savedTokens) {
            tokenType = savedTokens[address]?.type;
        }

        return tokenType;
    }

    function setTokenType(address, type) {
        let tokenTypes = JSON.parse(window.localStorage.getItem('lpTokens'));
        if (!tokenTypes) {
            tokenTypes = {};
        }

        tokenTypes[address] = {
            type: type
        };

        window.localStorage.setItem('lpTokens', JSON.stringify(tokenTypes));
    }

    function getImpermanentLossSettingsForFarm(farmId) {
        let farmIlSettings = null;
        let ilSettingsList = JSON.parse(window.localStorage.getItem('impermanentLossSettings'));
        if (ilSettingsList) {
            farmIlSettings = ilSettingsList[farmId];
        }

        return farmIlSettings;
    }

    function getImpermanentLossSettingsForPool(farmId, poolId) {
        let poolIlSettings = null;
        const farmIlSettings = getImpermanentLossSettingsForFarm(farmId);
        if (farmIlSettings) {
            poolIlSettings = farmIlSettings[poolId];
        }

        return poolIlSettings;
    }

    function setImpermanentLossSettingsForPool(farmId, poolId, tokenSymbol, initialAmount) {
        let ilSettingsList = JSON.parse(window.localStorage.getItem('impermanentLossSettings'));
        if (!ilSettingsList) {
            ilSettingsList = {};            
            ilSettingsList[farmId] = {};
        }

        if (!ilSettingsList[farmId]) {  
            ilSettingsList[farmId] = {};
        }
        ilSettingsList[farmId][poolId] = {
            preferredTokenSymbol: tokenSymbol,
            prefferedTokenInitialAmount: initialAmount
        };

        window.localStorage.setItem('impermanentLossSettings', JSON.stringify(ilSettingsList));
    }
}