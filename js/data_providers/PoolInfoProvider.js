function PoolInfoProvider(options) {
    const self = this;

    self.masterchefProvider = null;
    self.masterchefContract = null;
    self.rewardTokenAddress = null;
    self.rewardsPerWeek = null;
    self.totalAllocationPoints = null;
    self.lpTokenPropertyName = null;

    self.getPoolInfo = async function(poolId) {
        return getPoolInfo(poolId);
    }

    function init() {
        self.masterchefProvider = options.masterchefProvider;
        self.masterchefContract = options.masterchefContract;
        self.rewardTokenAddress = options.rewardTokenAddress;
        self.rewardsPerWeek = options.rewardsPerWeek;
        self.totalAllocationPoints = options.totalAllocationPoints;
        self.lpTokenPropertyName = options.lpTokenPropertyName;

        return self;
    }

    init();

    async function getPoolInfo(poolId) {
        if (DEBUG && DEBUG_POOL_ID === poolId) {
            // put a breakpoint here
            console.log ('hit debugging pool');
        }

        let lpTokenPropertyName = "lpToken";
        if (self.lpTokenPropertyName) {
            lpTokenPropertyName = self.lpTokenPropertyName;
        }
        const pool = await self.masterchefProvider.makeMasterchefCall('poolInfo', [ poolId ] , null);
        const lpTokenContract = getTokenContract(pool[lpTokenPropertyName], "uniswap");

        const poolName = await lpTokenContract.name().call();
        const poolSymbol = await lpTokenContract.symbol().call();
        
        const poolDecimals = Number(await lpTokenContract.decimals().call());
        const reserves = await lpTokenContract.getReserves().call();
        const poolTotalSupply = await lpTokenContract.totalSupply().call() / Math.pow(10, poolDecimals);
                
        const token0Address = await lpTokenContract.token0().call();
        const token1Address = await lpTokenContract.token1().call();
        const token0Data = await getTokenData(token0Address, "erc20");
        const token1Data = await getTokenData(token1Address, "erc20");

        ///////////////////////////////////////
        ///////////////////////////////////////
        ///////////////////////////////////////

        const q0 = Number(reserves[0]) / Math.pow(10, token0Data.decimals);
        const q1 = Number(reserves[1]) / Math.pow(10, token1Data.decimals);	
        let p0 = prices[token0Address]?.usd;
        let p1 = prices[token1Address]?.usd;

        if (isNaN(p0) || p0 === null)
        {
            p0 = q1 * p1 / q0;
            prices[token0Address] = { usd : p0, symbol: token0Data.symbol };
        }
        if (isNaN(p1) || p1 === null)
        {
            p1 = q0 * p0 / q1;
            prices[token1Address] = { usd : p1, symbol: token1Data.symbol };
        }

        if (isNaN(p0) || p1 === null || isNaN(p1) || p1 === null) {
            console.log("prices not found for: " + token0Data.symbol, token1Data.symbol)
        }
        
        const tvl = q0 * p0 + q1 * p1;
        const poolPrice = tvl / poolTotalSupply;
        const poolStaked = await lpTokenContract.balanceOf(self.masterchefContract).call() / Math.pow(10, poolDecimals);
        const stakedTvl = poolStaked * poolPrice;

        const poolAllocationPoints = Number(pool.allocPoint);
        const poolRewardAllocation = poolAllocationPoints / self.totalAllocationPoints;
        const poolRewardsPerWeek = poolAllocationPoints / self.totalAllocationPoints * self.rewardsPerWeek;
        const usdPerWeek = poolRewardsPerWeek === 0 ? null : poolRewardsPerWeek * prices[self.rewardTokenAddress]?.usd;
        const weeklyAPR = poolRewardsPerWeek === 0 ? null : usdPerWeek / stakedTvl * 100;
        const dailyAPR = poolRewardsPerWeek === 0 ? null : weeklyAPR / 7;
        const yearlyAPR = poolRewardsPerWeek === 0 ? null : weeklyAPR * 52;
        
        ///////////////////////////////////////
        ///////////////////////////////////////	
        ///////////////////////////////////////

        let stakedLpTokenAmount = null;
        let stakedValue = null;
        let userPoolPercent = null;
        let stakedQuantity0 = null;
        let stakedQuantity1 = null;
        let isStaked = false;
        if (userWalletIsConnected){
            const userInfo = await self.masterchefProvider.makeMasterchefCall('userInfo', [ poolId, storageProvider.getUserWalletAddress()], null);
            stakedLpTokenAmount = Number(userInfo.amount) / Math.pow(10, poolDecimals);
            stakedValue = stakedLpTokenAmount * poolPrice;
            if (stakedLpTokenAmount > 0) {
                isStaked = true;
            }

            userPoolPercent = stakedLpTokenAmount / poolTotalSupply;
            stakedQuantity0 = userPoolPercent * q0;
            stakedQuantity1 = userPoolPercent * q1;
        }

        const poolInfo = {
            address: pool[lpTokenPropertyName],
            poolId: poolId,
            symbol: poolSymbol,
            name: poolName,
            tvl: tvl,
            stakedTvl: stakedTvl,
            apr: yearlyAPR,
            userStaking: {
                isStaked: isStaked,
                stakedLpTokenAmount: stakedLpTokenAmount,
                stakedToken0Amount: stakedQuantity0,
                stakedToken1Amount: stakedQuantity1,
                stakedValue: stakedValue,
                percentOfPool: userPoolPercent,
            },
            token0: { 
                symbol: token0Data.symbol,
                address: token0Address,
                price: p0,
                formattedPrice: !isNaN(p0) ? p0.toFixed(4) : '--',
                reserves: reserves[0]
            },
            token1: { 
                symbol: token1Data.symbol,
                address: token1Address,
                price: p1,
                formattedPrice: !isNaN(p1) ? p1.toFixed(4) : '--',
                reserves: reserves[1]
            },
            technicals: {
                totalSupply: poolTotalSupply,
                decimals: poolDecimals,
                poolPrice: poolPrice,
                poolAllocationPoints: poolAllocationPoints,
                poolRewardAllocation: poolRewardAllocation,
                isIncentivised: !isNaN(poolAllocationPoints) && poolAllocationPoints > 0 ? poolRewardsPerWeek > 0 ? true : false : false
            }
        };

        return poolInfo;
    } 
    
    async function getTokenData(address, type) {
        const tokenContract = getTokenContract(address, type);	
        const symbol = await tokenContract.symbol().call();   
        const decimals = await tokenContract.decimals().call();

        return {
            symbol: symbol,
            decimals: Number(decimals)
        }
    }

    function getTokenContract(address, type) {
        switch(type) {
            case "uniswap": 
                return getUniTokenContract(address);
            case "erc20": 
                return getErc20TokenContract(address);
        }
    }

    function getUniTokenContract(address) {
        const tokenContract = new web3.eth.Contract(UNI_ABI, address);
        return tokenContract.methods;
    }

    function getErc20TokenContract(address) {
        const tokenContract = new web3.eth.Contract(ERC20_ABI, address);
        return tokenContract.methods;
    }
}