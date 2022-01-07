function LiquidityPoolProvider(lpTokenAddress, type) {
    let self = this;

    self.lpTokenAddress = null;
    self.poolContract = null;
    
    self.callFunction = (functionName, params, fallback) => {
        return callFunction(self.poolContract, functionName, params, fallback);
    }

    function init() {
        self.lpTokenAddress = lpTokenAddress;
        self.poolContract = getLpContract(lpTokenAddress, type);
    }

    init();

    function getLpContract(lpTokenAddress, type) {
        switch(type) {
            default: 
                return getUniTokenContract(lpTokenAddress);
            case 'uniswap':
                return getUniTokenContract(lpTokenAddress);           
        }
    }

    function getUniTokenContract(address) {
        const tokenContract = new web3.eth.Contract(UNI_ABI, address);
        return tokenContract;
    }

    function getErc20TokenContract(address) {
        const tokenContract = new web3.eth.Contract(ERC20_ABI, address);
        return tokenContract.methods;
    }

    async function callFunction(poolContract, functionName, params, fallback) {
        let result;
        try {
            if (params) {
                result = await (poolContract.methods[functionName].apply(null, params)).call();
            } else {
                result = await poolContract.methods[functionName]().call();
            }
        } catch {
            result = fallback;
        }

        return result;
    }

}