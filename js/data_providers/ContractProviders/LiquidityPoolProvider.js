function LiquidityPoolProvider(lpTokenAddress, type) {
    let self = this;

    self.lpTokenAddress = null;
    self.poolContract = null;
    self.isSingleTokenPool = false;
    
    self.init = () => {
        return init();
    }

    self.callFunction = (functionName, params, fallback) => {
        return callFunction(self.poolContract, functionName, params, fallback);
    }

    async function init() {
        self.lpTokenAddress = lpTokenAddress;
        self.poolContract = await getLpContract(lpTokenAddress, type);
    }

    // init();

    async function getLpContract(lpTokenAddress, type) {
        if (type) {
            switch(type) {
                default: 
                    return getUniTokenContract(lpTokenAddress);
                case 'uniswap':
                    return getUniTokenContract(lpTokenAddress);           
            }
        }
        else {
            try {
                let lpContract = getUniTokenContract(lpTokenAddress);
                await lpContract.methods.token0().call();
                return lpContract;
            } catch { }
            try {
                let lpContract = getErc20TokenContract(lpTokenAddress);
                await lpContract.methods.name().call();
                self.isSingleTokenPool = true;
                return lpContract;
            } catch { }

            console.log('Couldn\'t match the LP contract type');
            return null;
        }
    }

    function getUniTokenContract(address) {
        const tokenContract = new web3.eth.Contract(UNI_ABI, address);
        return tokenContract;
    }

    function getErc20TokenContract(address) {
        const tokenContract = new web3.eth.Contract(ERC20_ABI, address);
        return tokenContract;
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