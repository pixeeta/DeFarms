const DEBUG = true;
const DEBUG_FARM_ID = 37;
const DEBUG_POOL_ID = null;

let appInitializer = null;
let web3 = null;
let storageProvider = null;
let userWalletIsConnected = false;
let prices = [];
let farmInfoViewModels = [];

window.addEventListener('load', async function () {
	storageProvider = new StorageProvider();
	appInitializer = new AppInitializer();
	await appInitializer.initializeBlockchainConnection();
	appInitializer.initializeHeaderControls();

	main();
})

async function main() {	
	const networkId = await web3.eth.net.getId();
	if (networkId === NETWORKS.HARMONY_S0.chainIdInt) {
		const tokenPriceProvider = new TokenPriceProvider();
		prices = await tokenPriceProvider.getHarmonyPrices();

		const masterChefContractList = HARMONY_MASTERCHEF_CONTRACT_LIST;
		const listOfFilteredFarms = getListOfFilteredFarms(masterChefContractList);
		renderFarmInfoContainers(masterChefContractList, listOfFilteredFarms);
		const farmInfoProvider = new FarmInfoProvider();
		const farmAccordionSettings = storageProvider.getFarmAccordionSettings();
		if (DEBUG) {		
			const farmInfo = await farmInfoProvider.getFarmInfo(masterChefContractList[DEBUG_FARM_ID]);
			console.log(farmInfo);
			const impermanentLossSettings = storageProvider.getImpermanentLossSettingsForFarm(farmInfo.farmId);
			renderFarmInfo(farmInfo, farmAccordionSettings, true, impermanentLossSettings);
		} else {
			for (let i = 0; i < masterChefContractList.length; i++) {
				let farmInfo = null;
				let isVisible = listOfFilteredFarms[masterChefContractList[i].farmId].isVisible;
				if (isVisible){
					if (masterChefContractList[i].isSupported) {
						farmInfo = await farmInfoProvider.getFarmInfo(masterChefContractList[i]);
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
				const impermanentLossSettings = storageProvider.getImpermanentLossSettingsForFarm(farmInfo.farmId);
				renderFarmInfo(farmInfo, farmAccordionSettings, isVisible, impermanentLossSettings);
			}
		}
	} else {
		$('#wrong-network-message').show();
	}

	enableHeaderButtons();
}

function getListOfFilteredFarms(masterChefContractList) {
	let list = {};
	masterChefContractList.forEach(item => {
		list[item.farmId] = {
			name: item.name,
			isVisible: item.showByDefault
		}
	});	

	return list;
}

function renderFarmInfoContainers(masterChefContractList, listOfFilteredFarms) {
	const templateHtml = $('#farm-info-container-template').html();
	const compiledTemplate = Handlebars.compile(templateHtml);
	masterChefContractList.forEach(masterchefDetails => {
		const farmInfoContainerVm = new FarmInfoViewModel(masterchefDetails, null, listOfFilteredFarms[masterchefDetails.farmId].isVisible, null, true);
		$('#content-container').append(compiledTemplate(farmInfoContainerVm));	
	})
}

function renderFarmInfo(farmInfo, farmAccordionSettings, isVisible, impermanentLossSettings) {
	const templateHtml = $('#farm-info-content-template').html();
	const compiledTemplate = Handlebars.compile(templateHtml);
	const farmInfoViewModel = new FarmInfoViewModel(farmInfo, farmAccordionSettings, isVisible, impermanentLossSettings, false);
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
			storageProvider.setAccordionSettingsForFarm(farmId, true);
		} else {
			$(caret).removeClass('down');
			$(caret).addClass('up');			
			showFarmInfo(farmId);
			storageProvider.setAccordionSettingsForFarm(farmId, false);
		}
	});

	$(element).find('.impernanent-loss-settings-button').on('click', (ele) => {
		const templateHtml = $('#impermanent-loss-settings-modal-template').html();
		const compiledTemplate = Handlebars.compile(templateHtml);

		const farmId = $(ele.target).data('farm-id');
		const poolId = $(ele.target).data('pool-id');
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
			console.log($('#preferred-token-input').val());
			console.log($('#preferred-token-initial-amount-input').val());
			storageProvider.setImpermanentLossSettingsForPool(farmId, poolId, $('#preferred-token-input').val(), $('#preferred-token-initial-amount-input').val())
			console.log('impermanent loss settings saved');
			$('#modal-container').modal('hide');
		});
	});
}

function hideFarmInfo(farmInfoId) {
	$('.farm-info[data-farm-id=' + farmInfoId + ']').find('.farm-pools-container').addClass('collapsed');
}

function showFarmInfo(farmInfoId) {
	$('.farm-info[data-farm-id=' + farmInfoId + ']').find('.farm-pools-container').removeClass('collapsed');
}
