function MasterchefProvider(masterchefJson) {
    let self = this;

    self.masterchefJson = null;
    self.masterchef = null;
    
    self.callFunction = (functionName, params, fallback) => {
        return callFunction(self.masterchef, functionName, params, fallback);
    }

    function init() {
        self.masterchefJson = masterchefJson;
        self.masterchef = getMasterChef(masterchefJson.chefAbi, masterchefJson.chefContract);
    }

    init();

    function getMasterChef(chefAbi, chefAddress) {
        const masterChefContract = new web3.eth.Contract(chefAbi, chefAddress);
        return masterChefContract;
    }

    async function callFunction(masterchef, functionName, params, fallback) {
        let result;
        try {
            if (params) {
                result = await (masterchef.methods[functionName].apply(null, params)).call();
            } else {
                result = await masterchef.methods[functionName]().call();
            }
        } catch {
            result = fallback;
        }

        return result;
    }

}