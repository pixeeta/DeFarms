function PoolInfoViewModel(poolInfo, isBestApr) {
    if (poolInfo) {
        this.address = poolInfo.address;
        this.poolId = poolInfo.poolId;
        this.lpTokenType = poolInfo.name;

        this.token0Symbol = poolInfo.token0.symbol;
        this.token1Symbol = poolInfo.token1.symbol;
        this.token0FormattedPrice = '$' + formatDecimalNumber(poolInfo.token0.price, 4);
        this.token1FormattedPrice = '$' + formatDecimalNumber(poolInfo.token1.price, 4);

        this.formattedTvl = formatCurrency(poolInfo.tvl);
        this.formattedStakedTvl = formatCurrency(poolInfo.stakedTvl);
        this.apr = poolInfo.apr;
        this.formattedApr = poolInfo.technicals.isIncentivised ? poolInfo.apr < 1 ?  formatDecimalNumber(poolInfo.apr, 4) + '%' : formatDecimalNumber(poolInfo.apr, 2) + '%' : 'N/A';

        this.poolRewardAllocation = poolInfo.technicals.poolRewardAllocation;
        this.formattedPoolRewardAllocation = !isNaN(this.poolRewardAllocation) ? formatDecimalNumber(this.poolRewardAllocation * 100) + '%' : '--%';

        this.isStaked = poolInfo.userStaking.isStaked;
        
        this.isBestAprClass = isBestApr ? 'pool-is-best-apr' : '';
        this.isStakedClass = this.isStaked ? 'pool-is-staked' : '';
        this.isIncentivisedClass = poolInfo.technicals.isIncentivised ? '' : 'pool-is-not-incentivised';
        
        this.hasData = true;
    } else {
        this.hasData = false;
    }
}