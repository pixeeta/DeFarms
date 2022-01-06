function MasterchefProvider(masterchefJson) {
    let self = this;

    self.masterchefJson = null;
    self.masterchef = null;
    
    self.makeMasterchefCall = (functionName, params, fallback) => {
        return makeMasterchefCall(self.masterchef, functionName, params, fallback);
    }

    function init() {
        self.masterchefJson = masterchefJson;
        self.masterchef = getMasterChef(masterchefJson.chefAbi, masterchefJson.chefContract);
    }

    init();

    function getMasterChef(chefAbi, chefAddress) {
        const masterChefContract = new web3.eth.Contract(chefAbi, chefAddress);
        return masterChefContract.methods;
    }

    async function makeMasterchefCall(masterchef, functionName, params, fallback) {
        let result;
        try {
            if (params) {
                result = await (masterchef[functionName].apply(null, params)).call();
            } else {
                result = await masterchef[functionName]().call();
            }
        } catch {
            result = fallback;
        }

        return result;
    }

}