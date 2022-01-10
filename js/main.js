const DEBUG = false;
const DEBUG_FARM_ID = null;
const DEBUG_POOL_ID = null;

let appInitializer = null;
let web3 = null;
let storageProvider = null;
let userWalletIsConnected = false;
let prices = [];
let farmInfoViewModels = [];
let listOfFilteredFarms = [];
let masterChefContractList = [];
let readyToLoadFarms = false;

window.addEventListener('load', async function () {
	storageProvider = new StorageProvider();
	appInitializer = new AppInitializer();
	await appInitializer.initializeBlockchainConnection();
	appInitializer.initializeHeaderControls();

	main();
	
	$('#clear-wallet-address-button').on('click', () => {
		$('#wallet-address-input').val(null);
		storageProvider.setUserWalletAddress(null);
		userWalletIsConnected = false;
	});

	$('#load-farms-button').on('click', () => {
		let walletAddressInputValue = $('#wallet-address-input').val();
		if (walletAddressInputValue && walletAddressInputValue !== '') {
			storageProvider.setUserWalletAddress(walletAddressInputValue);
			userWalletIsConnected = true;
		}

		loadFarms();
	});
})

async function main() {	
	const networkId = await web3.eth.net.getId();
	if (networkId === NETWORKS.HARMONY_S0.chainIdInt) {
		const tokenPriceProvider = new TokenPriceProvider();
		prices = await tokenPriceProvider.getHarmonyPrices();
		masterChefContractList = HARMONY_MASTERCHEF_CONTRACT_LIST;
		readyToLoadFarms = true;
	} else {
		$('#wrong-network-message').show();
	}
	
	let storedWalletAddress = storageProvider.getUserWalletAddress();
	if (storedWalletAddress && storedWalletAddress !== '' && storedWalletAddress !== 'null') {
		$('#wallet-address-input').val(storedWalletAddress);
		userWalletIsConnected = true;
		loadFarms();
	}
}

async function loadFarms() {
	disableHeaderButtons();
	if (readyToLoadFarms) {
		$('#farms-container').empty();
		listOfFilteredFarms = getListOfFilteredFarms(masterChefContractList);
		appInitializer.initializeFarmFilterDropdown(listOfFilteredFarms);
		renderFarmInfoContainers(masterChefContractList);
		const farmInfoProvider = new FarmInfoProvider();
		for (let i = 0; i < masterChefContractList.length; i++) {
			let farmInfo = null;
			const isFarmVisible = getIsFarmVisible(masterChefContractList[i].farmId);
			const isFarmInfoCollapsed = storageProvider.getFarmCollapseSettings(masterChefContractList[i].farmId);
			if (isFarmVisible){
				if (masterChefContractList[i].isSupported) {
					farmInfo = farmInfoProvider.getFarmInfo(masterChefContractList[i]).then((farmInfo) => {
						console.log(farmInfo);
						const impermanentLossSettings = storageProvider.getImpermanentLossSettingsForFarm(farmInfo?.farmId);
						renderFarmInfo(farmInfo, isFarmVisible, isFarmInfoCollapsed, impermanentLossSettings);
					});
				} else {
					farmInfo = {
						name: masterChefContractList[i].name,
						farmId: masterChefContractList[i].farmId,
						masterchefAddress: masterChefContractList[i].chefContract,
						isSupported: false,
						pools: []
					}
				}
			}

			console.log(farmInfo);
			// const impermanentLossSettings = storageProvider.getImpermanentLossSettingsForFarm(farmInfo?.farmId);
			// renderFarmInfo(farmInfo, isFarmVisible, isFarmInfoCollapsed, impermanentLossSettings);
		}

		enableHeaderButtons();
	}
}

function getListOfFilteredFarms(masterChefContractList) {
	let storedList = storageProvider.getAllFarmVisibilitySettings();
	if (!storedList) {
		let newList = storageProvider.initializeFarmVisibilitySettings(masterChefContractList);
		storedList = newList;
	}	

	return storedList;
}

function getIsFarmVisible(farmId) {
	return listOfFilteredFarms[farmId].isVisible;
}

function renderFarmInfoContainers(masterChefContractList) {
	const templateHtml = $('#farm-info-container-template').html();
	const compiledTemplate = Handlebars.compile(templateHtml);
	masterChefContractList.forEach(masterchefDetails => {
		const farmInfoContainerVm = new FarmInfoViewModel(masterchefDetails, getIsFarmVisible(masterchefDetails.farmId), null, null, true);
		$('#farms-container').append(compiledTemplate(farmInfoContainerVm));	
	})
}

function renderFarmInfo(farmInfo, isVisible, isCollapsed, impermanentLossSettings, optionalFarmInfoViewModel) {
	const templateHtml = $('#farm-info-content-template').html();
	const compiledTemplate = Handlebars.compile(templateHtml);
	let farmInfoViewModel;
	if (optionalFarmInfoViewModel) {
		farmInfoViewModel = optionalFarmInfoViewModel;
	} else {
		farmInfoViewModel = new FarmInfoViewModel(farmInfo, isVisible, isCollapsed, impermanentLossSettings, false);
	}
	if (farmInfoViewModel.hasData) {
		farmInfoViewModels.push(farmInfoViewModel);
		$farmContainer =  $('.farm-info[data-farm-id=' + farmInfoViewModel.farmId + ']');
		$farmContainer.empty();
		$farmContainer.append(compiledTemplate(farmInfoViewModel));	
		bindFarmInfoControls($farmContainer);
		if (isVisible) {
			$($farmContainer).show();
		} else {
			$($farmContainer).hide();
		}
	}
}

function bindFarmInfoControls(element) {
	$(element).find('.fold-farm-info-button').on('click', (ele) => {
		const target = ele.target;
		const farmId = $(target).data('farm-id');
		const caret = $(target).find('.custom-caret');
		if ($(caret).hasClass('up')) {
			$(caret).removeClass('up');
			$(caret).addClass('down');
			hideFarmInfo(farmId);
			storageProvider.setCollapseSettingsForFarm(farmId, true);
		} else {
			$(caret).removeClass('down');
			$(caret).addClass('up');			
			showFarmInfo(farmId);
			storageProvider.setCollapseSettingsForFarm(farmId, false);
		}
	});

	$(element).find('.impernanent-loss-settings-button').on('click', (ele) => {
		const farmId = $(ele.target).data('farm-id');
		const poolId = $(ele.target).data('pool-id');

		showImpermanentLossModal(farmId, poolId);
	});
}

function hideFarmInfo(farmInfoId) {
	$('.farm-info[data-farm-id=' + farmInfoId + ']').find('.farm-pools-container').addClass('collapsed');
}

function showFarmInfo(farmInfoId) {
	$('.farm-info[data-farm-id=' + farmInfoId + ']').find('.farm-pools-container').removeClass('collapsed');
}

function showImpermanentLossModal(farmId, poolId) {
	const templateHtml = $('#impermanent-loss-settings-modal-template').html();
	const compiledTemplate = Handlebars.compile(templateHtml);

	const farmInfoViewModel = farmInfoViewModels.filter(f => f.farmId === farmId)[0];
	const poolInfoViewModel = farmInfoViewModel.pools.filter(p => p.poolId === poolId)[0];

	let modalViewModel = {
		token0Symbol: poolInfoViewModel.token0Symbol,
		token1Symbol: poolInfoViewModel.token1Symbol,
		preferredToken: poolInfoViewModel.impermanentLossInfo?.initialTokenSymbol,
		preferredTokenInitialAmount: poolInfoViewModel.impermanentLossInfo?.initialTokenAmount
	}

	$('#modal-container').empty();
	$('#modal-container').append(compiledTemplate(modalViewModel));
	$('#modal-container').modal();	

	if (modalViewModel.preferredToken) {
		$('#preferred-token-input').val(modalViewModel.preferredToken);
	}
	
	$('#modal-container').find('.btn-primary').on('click', (ele) => {
		let impermanentLossSettings = {
			preferredTokenSymbol: $('#preferred-token-input').val(),
			prefferedTokenInitialAmount: $('#preferred-token-initial-amount-input').val()
		};

		storageProvider.setImpermanentLossSettingsForPool(farmId, poolId, impermanentLossSettings.preferredTokenSymbol, impermanentLossSettings.prefferedTokenInitialAmount);
		console.log('impermanent loss settings saved');
		poolInfoViewModel.updateImpermanentLossInfo(impermanentLossSettings);
		renderFarmInfo(null, getIsFarmVisible(farmInfoViewModel.farmId), false , impermanentLossSettings, farmInfoViewModel);
		$('#modal-container').modal('hide');
	});
}
