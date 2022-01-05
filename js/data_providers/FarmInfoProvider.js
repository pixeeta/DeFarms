function FarmInfoProvider() {
    const self = this;

    self.getFarmInfo = async function(masterchefContractInfo) {
        return getFarmInfo(masterchefContractInfo);
    }

    function init() {
        return self;
    }

    init();
    
    async function getFarmInfo(masterchefContractInfo) {
        const masterchef = getMasterChef(masterchefContractInfo.chefAbi, masterchefContractInfo.chefContract);
        let poolLength;
        try {
            poolLength = await masterchef.poolLength().call();  	
        } catch {
            poolLength = 2;
        }

        let poolIds = [];	
        for (let i = 0; i < poolLength; i++) {
            poolIds.push(i);
        }

        let rewardTokenAddress = null;
        try {
            rewardTokenAddress = await masterchef[masterchefContractInfo.rewardTokenFunctionName]().call();
        } catch {
            rewardTokenAddress = masterchefContractInfo.rewardTokenAddress;
        }

        const blockNumber = await web3.eth.getBlockNumber();
        let multiplier;
        try {
            multiplier = await masterchef.getMultiplier(blockNumber, blockNumber+1).call();
        } catch {
            multiplier = 1;
        }
        
        const totalAllocationPoints = await masterchef.totalAllocPoint().call();

        let rewardPerBlock = null;
        try {
            rewardPerBlock = await masterchef[masterchefContractInfo.blockRewardFunctionName]().call();
        } catch {
            console.log("couldn't access reward per block method of the masterchef");
        }
        const rewardsPerWeek = rewardPerBlock / 1e18 * multiplier * 604800 / 2;
                
        const poolInfoProvider = new PoolInfoProvider({
            masterchef: masterchef, 
            chefContract: masterchefContractInfo.chefContract, 
            rewardTokenAddress: rewardTokenAddress, 
            totalAllocationPoints: Number(totalAllocationPoints),
            rewardsPerWeek: Number(rewardsPerWeek)
        });
        
        let farmPools = [];
        await Promise.all(poolIds.map(async (poolId) => {	
            try {
                farmPools[poolId] = await poolInfoProvider.getPoolInfo(poolId);
            }	
            catch {
                farmPools[poolId] = null;
            }
        }));
        
        let totalStakedValue = 0;
        let totalDiscoveredTvl = 0;
        farmPools.forEach((pool) => {
            if (pool) {
                if (!isNaN(pool.userStaking.stakedValue)) {
                    totalStakedValue += pool.userStaking.stakedValue;
                }

                if (!isNaN(pool.tvl)) {
                    totalDiscoveredTvl += pool.tvl;
                }
            }
        });

        const farmInfo = {
            name: masterchefContractInfo.farm,
            farmId: masterchefContractInfo.farmId,
            masterchefAddress: masterchefContractInfo.chefContract,
            pools: farmPools,
            rewardToken: {
                symbol: prices[rewardTokenAddress]?.symbol,
                address: rewardTokenAddress,
                price: prices[rewardTokenAddress]?.usd,
            },
            bestAprPool: getBestAprPool(farmPools),
            totalStakedValue: totalStakedValue,
            totalDiscoveredTvl: totalDiscoveredTvl
        };

        return farmInfo;
    }

    function getMasterChef(chefAbi, chefAddress) {
        const masterChefContract = new web3.eth.Contract(chefAbi, chefAddress);
        return masterChefContract.methods;
    }

    function getBestAprPool(pools) {
        let bestAprPool = null; 
        if (pools && pools.length > 0) {            
            pools.forEach((pool) => {
                if (pool && !isNaN(pool.apr)) {
                    if (bestAprPool) {
                        if (pool.apr > bestAprPool.apr) {
                            bestAprPool = pool;
                        } 
                    } else {
                        bestAprPool = pool;
                    }
                }   
            });
        }

        if (bestAprPool) {
            if (bestAprPool.apr === null || isNaN(bestAprPool.apr)) {                
                bestAprPool = null;
            }
        }

        return bestAprPool;
    }
}
