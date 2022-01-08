const DEBUG = false;
const DEBUG_FARM_ID = 30;
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
			renderFarmInfo(farmInfo, farmAccordionSettings, true)
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
				renderFarmInfo(farmInfo, farmAccordionSettings, isVisible);
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
		const farmInfoContainerVm = new FarmInfoViewModel(masterchefDetails, null, listOfFilteredFarms[masterchefDetails.farmId].isVisible, true);
		$('#content-container').append(compiledTemplate(farmInfoContainerVm));	
	})
}

function renderFarmInfo(farmInfo, farmAccordionSettings, isVisible) {
	const templateHtml = $('#farm-info-content-template').html();
	const compiledTemplate = Handlebars.compile(templateHtml);
	const farmInfoViewModel = new FarmInfoViewModel(farmInfo, farmAccordionSettings);
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
		const caret = $(target).find('.caret');
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
}

function hideFarmInfo(farmInfoId) {
	$('.farm-info[data-farm-id=' + farmInfoId + ']').find('.farm-pools-container').addClass('collapsed');
}

function showFarmInfo(farmInfoId) {
	$('.farm-info[data-farm-id=' + farmInfoId + ']').find('.farm-pools-container').removeClass('collapsed');
}
