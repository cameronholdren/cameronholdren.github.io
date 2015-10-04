var items = 0;
var money = 0;
var cost = 20;
var makers = [];
var upgrades = [];
var ticks_per_second = 10;
var collect_base_rate = 0.05;

var makersDef = [
        {
            name: 'Scuba diver',
            price: 50,
            speed: .05,
            buy_factor: .2,
            sell_factor: .5,
            available: 0
        },
        {
            name: 'Dinghy',
            price: 1000,
            speed: .5,
            buy_factor: .2,
            sell_factor: .5,
            available: 0
        },
        {
            name: 'Sailboat',
            price: 1000,
            speed: 3,
            buy_factor: .2,
            sell_factor: .5,
            available: 0
        },
        {
            name: 'Yacht',
            price: 1000,
            speed: 3,
            buy_factor: .2,
            sell_factor: .5,
            available: 0
        }
    ];

var upgradesDef = [
        {
            name: 'Pamphlet',
            price: 100,
            speed: .1,
            buy_factor: .2,
            sell_factor: .5,
            available: 0
        },
        {
            name: 'Website',
            price: 1000,
            speed: .5,
            buy_factor: .2,
            sell_factor: .5,
            available: 1000
        },
        {
            name: 'Email List',
            price: 10000,
            speed: 1,
            buy_factor: .2,
            sell_factor: .5,
            available: 100000
        }
    ];

function init(){
    items = 0;
    money = 0;
    all_items = 0;
    all_money = 0;
    makers = [];
    upgrades = [];

}

init();

var savegame = JSON.parse(localStorage.getItem("whale_save"));

if (typeof savegame.items !== "undefined") items = savegame.items;
if (typeof savegame.money !== "undefined") money = savegame.money;
if (typeof savegame.items !== "undefined") all_items = savegame.all_items;
if (typeof savegame.money !== "undefined") all_money = savegame.all_money;
if (typeof savegame.makers !== "undefined") makers = savegame.makers;
if (typeof savegame.upgrades !== "undefined") upgrades = savegame.upgrades;

function itemMake(number){
    items = items + number;
    all_items = all_items + number;
    setValue();
};


function makerBuy(idx,sell){
    var makerCost = getMakersBuyPrice(idx);
    if (sell) {
        if (makers[idx].count>0) {
            money = money + getMakersSellPrice(idx);
            makers[idx].count = makers[idx].count - 1;
        }
    }
    else if(money >= makerCost){
        makers[idx].count = makers[idx].count + 1;
        money = money - makerCost;
    };
    setValue();
    document.getElementById('makerCount'+idx).innerHTML = makers[idx].count;  
    document.getElementById('makerCost'+idx).innerHTML = getMakersBuyPrice(idx).toLocaleString();;
    document.getElementById('makerSell'+idx).innerHTML = getMakersSellPrice(idx).toLocaleString();;
    if (makers[idx].count>0) {
        document.getElementById('makerSellButton'+idx).style.display = "";
    } else {            
        document.getElementById('makerSellButton'+idx).style.display = "none";
    }

};

function upgradeBuy(idx,sell){
    if (upgrades[idx] == true) {
        return;
    }
    if(money >= upgradesDef[idx].price){
        upgrades[idx] = true;
        money = money - upgradesDef[idx].price;
    };
    setValue();
    if (upgrades[idx] == true) {
        document.getElementById('upgradeButton'+idx).style.display = "none";
    }

};


function autoMake(ticks_per_second) {
    if (typeof ticks_per_second == "undefined") ticks_per_second = 1;
    var items_per_second = 0;
    for(idx = 0; idx < makers.length; ++idx) {
        items_per_second = items_per_second + (makers[idx].count * makersDef[idx].speed);
    }
    document.getElementById('make_per_second').innerHTML = niceNum(items_per_second, 4);
    itemMake(items_per_second/ticks_per_second);
}

function autoCollect(ticks_per_second) {
    if (typeof ticks_per_second == "undefined") ticks_per_second = 1;

    var rate = collect_base_rate;

    for(idx = 0; idx < upgradesDef.length; ++idx) {
        if (typeof upgrades[idx] !== "undefined" && upgrades[idx] == true){
            rate = rate * (1 + upgradesDef[idx].speed);
        }
    }

    amount = items * rate / ticks_per_second;
    money = money + amount;
    all_money = all_money + amount;
    document.getElementById('sell_per_second').innerHTML = niceNum(amount, 4);
    setValue();
}

window.setInterval(function(){
    autoMake(ticks_per_second);
    autoCollect(ticks_per_second);
}, 1000/ticks_per_second);

window.setInterval(function(){
    saveGame();
}, 30000);

function getMakersBuyPrice(idx) {
    return Math.floor(makersDef[idx].price * Math.pow(1+makersDef[idx].buy_factor,makers[idx].count));
}

function getMakersSellPrice(idx) {
    return Math.floor(makersDef[idx].sell_factor * makersDef[idx].price * Math.pow(1+makersDef[idx].buy_factor,makers[idx].count-1));
}

function getSellersBuyPrice(idx) {
    return Math.floor(upgradesDef[idx].price * Math.pow(1+upgradesDef[idx].buy_factor,upgrades[idx].count));
}

function getSellersSellPrice(idx) {
    return Math.floor(upgradesDef[idx].sell_factor * upgradesDef[idx].price * Math.pow(1+upgradesDef[idx].buy_factor,upgrades[idx].count-1));
}

function niceNum(value, dec) {
    return (Math.ceil(value * Math.pow(10,dec)) / Math.pow(10,dec)).toLocaleString();
}


function saveGame(clear){
	if(clear) {
        init();
    }
	var save = {
        items: items,
        money: money,
        all_items: all_items,
        all_money: all_money,
        makers: makers,
        upgrades: upgrades
    }
	localStorage.setItem("whale_save",JSON.stringify(save));
    if(clear) {
        location.reload();
    }
}

function setValue(){
    document.getElementById('items').innerHTML = niceNum(items, 0);
    document.getElementById('money').innerHTML = niceNum(money, 0);
    document.getElementById('all_items').innerHTML = niceNum(all_items, 0);
    document.getElementById('all_money').innerHTML = niceNum(all_money, 0);
    if (items==1){
        document.getElementById('plural').innerHTML = '';
    } else{
        document.getElementById('plural').innerHTML = 's';        
    }
    for(idx = 0; idx < makersDef.length; ++idx) {
        var row = document.getElementById('makerRow'+idx);
        if (all_items >= makersDef[idx].available) {row.style.display = "";}
    }
    for(idx = 0; idx < upgradesDef.length; ++idx) {
        var row = document.getElementById('sellerRow'+idx);
        if (all_money >= upgradesDef[idx].available) {row.style.display = "";}
    }

}

function loadDisplay(){
    var makertable = document.getElementById("makerTable");
    var sellertable = document.getElementById("sellerTable");
    for(idx = 0; idx < makersDef.length; ++idx) {
        var row = makertable.insertRow(-1);
        row.id = "makerRow"+idx;
        if (all_items < makersDef[idx].available) {row.style.display = "none";}
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        cell1.innerHTML = '<span class="bignum" id="makerCount'+idx+'">0</span><br><span class="small" id="makerRate'+idx+'"></span>';
        cell2.innerHTML = '<span class="imagelabel" id="makerLabel'+idx+'"></span>';
        cell3.innerHTML = '<button onclick="makerBuy('+idx+')">Buy for $<span id="makerCost'+idx+'">0</span></button><br><button id="makerSellButton'+idx+'" class="small" onclick="makerBuy('+idx+',true)">Sell for $<span id="makerSell'+idx+'">0</span></button>';
        if (typeof makers[idx] == "undefined"){
            makers[idx] = {count: 0};
        }
        if (makers[idx].count>0) {
            document.getElementById('makerSellButton'+idx).style.display = "";
        } else {            
            document.getElementById('makerSellButton'+idx).style.display = "none";
        }
        document.getElementById('makerLabel'+idx).innerHTML = makersDef[idx].name;
        document.getElementById('makerSell'+idx).innerHTML = getMakersSellPrice(idx).toLocaleString();
        document.getElementById('makerCount'+idx).innerHTML = makers[idx].count;
        document.getElementById('makerCost'+idx).innerHTML = getMakersBuyPrice(idx).toLocaleString();
        document.getElementById('makerRate'+idx).innerHTML = makersDef[idx].speed + "/sec";
    }
    for(idx = 0; idx < upgradesDef.length; ++idx) {
        var row = sellertable.insertRow(-1);
        row.id = "sellerRow"+idx;
        if (all_money < upgradesDef[idx].available) {row.style.display = "none";}
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = '<span class="imagelabel" id="upgradeLabel'+idx+'"></span><br>Increase donations by <span id="upgradeRate'+idx+'"></span>';
        cell2.innerHTML = '<button id="upgradeButton'+idx+'" onclick="upgradeBuy('+idx+')">Buy for $<span id="upgradeCost'+idx+'">0</span></button>';
        if (typeof upgrades[idx] == "undefined"){
            upgrades[idx] = false;
        }
        if (upgrades[idx] == true) {
            document.getElementById('upgradeButton'+idx).style.display = "none";
        }
        document.getElementById('upgradeLabel'+idx).innerHTML = upgradesDef[idx].name;
        document.getElementById('upgradeCost'+idx).innerHTML = upgradesDef[idx].price.toLocaleString();
        document.getElementById('upgradeRate'+idx).innerHTML = (upgradesDef[idx].speed * 100) + "%";
    }
    setValue();
}






