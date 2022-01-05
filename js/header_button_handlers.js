
function enableHeaderButtons() {
	$('#sort-farms-by-apr-button, #sort-pools-by-apr-button').removeClass('disabled');
	$('#sort-farms-by-apr-button, #sort-pools-by-apr-button').attr('disabled', null);
}

function toggleShowStakedOnlyPools(isActive) {
	if (isActive == null || !isActive) {
		storageProvider.setShowStakedOnlyPoolsSetting(true);
	} else {
		if (isActive) {
			storageProvider.setShowStakedOnlyPoolsSetting(false);
		}
	}	

	$('#content-container').toggleClass('show-staked-only-pools');
}

function toggleShowNonIncentivisedPools(isActive) {
	if (isActive == null || !isActive) {
		storageProvider.setShowNonIncentivizedPoolsSetting(true);
	} else {
		if (isActive) {
			storageProvider.setShowNonIncentivizedPoolsSetting(false);
		}
	}	

	$('#content-container').toggleClass('show-non-incentivised-pools');
}

function toggleDarkMode() {
	let darkModeIsActive = storageProvider.getDarkModeSetting();
	if (darkModeIsActive == null || !darkModeIsActive) {
		storageProvider.setDarkModeSetting(true);
	} else {
		if (darkModeIsActive) {
			storageProvider.setDarkModeSetting(false);
		}
	}
	
	$('body').toggleClass('dark-mode');
	$('#toggle-dark-mode-button').toggleClass('active');
}

function sortFarmsByApr(isActive) {
	if (farmInfoViewModels.length > 0) {
		if (isActive) {
			farmInfoViewModels.sort((a, b) => (a?.farmId > b?.farmId) ? 1 : -1);
            changeFarmsOrder(farmInfoViewModels);
		} else {
            sortPoolsDescending(farmInfoViewModels, 'farmBestApr');
            changeFarmsOrder(farmInfoViewModels);
		}
	}
}

function sortPoolsByApr(isActive) {
	if (farmInfoViewModels.length > 0) {
		if (isActive) {
			farmInfoViewModels.forEach(farm => {
				const sortedPools = farm.pools.sort((a, b) => (a?.poolId > b?.poolId) ? 1 : -1);
				changePoolsOrder(sortedPools, farm.masterchefAddress);
			});
		} else {
			farmInfoViewModels.forEach(farm => {
                sortPoolsDescending(farm.pools, 'poolRewardAllocation');
                sortPoolsDescending(farm.pools, 'apr');
			// 	const sortedPools = farm.pools.sort((a, b) => {
			// 		if (!a.hasData || isNaN(a.apr)) {
			// 			return 1;
			// 		} else if ((!b.hasData || isNaN(b.apr))){
			// 			return -1;
			// 		}

			// 		if (a.apr < b.apr) {
			// 			return 1;
			// 		} else {
            //             if (a.apr === b.apr) {
            //                 return (a?.poolRewardAllocation < b?.poolRewardAllocation) ? 1 : -1;
            //                 // return (a?.poolId > b?.poolId) ? 1 : -1;
            //             }
            //         }

			// 		return -1;
			// 	});
			// 	changePoolsOrder(sortedPools, farm.masterchefAddress);
			// });
				changePoolsOrder(farm.pools, farm.masterchefAddress);
            });
		}
	}
}

function sortPoolsDescending(poolViewModels, propertyName) {
    poolViewModels.sort((a, b) => {
        if (!a.hasData || isNaN(a[propertyName])) {
            return 1;
        } else if ((!b.hasData || isNaN(b[propertyName]))){
            return -1;
        }

        if (a[propertyName] <= b[propertyName]) {
            return 1;
        } else {
            return -1;
        }
    })
}

function changeFarmsOrder(farmViewModelList) {
	for (let i = 0; i < farmViewModelList.length; i++) {
        $('.farm-info[data-farm-id=' + farmViewModelList[i].farmId + ']').css('order', i);
	}	
}

function changePoolsOrder(poolViewModelList, masterchefAddress) {
	for (let i = 0; i < poolViewModelList.length; i++) {
		let poolId = poolViewModelList[i]?.poolId;
		if (!isNaN(poolId)) {
			$('.pool-item[data-farm-masterchef-address=' + masterchefAddress + '][data-pool-id=' + poolId + ']').css('order', i);
		}
	}	
}