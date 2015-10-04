var items = 0;
var money = 0;
var cost = 20;
var makers = [];
var sellers = [];
var ticks_per_second = 10;

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

var sellersDef = [
        {
            name: 'Newspaper Ad',
            price: 100,
            speed: .1,
            buy_factor: .2,
            sell_factor: .5,
            available: 0
        },
        {
            name: 'Pedovan',
            price: 1000,
            speed: .5,
            buy_factor: .2,
            sell_factor: .5,
            available: 1000
        },
        {
            name: 'Tasting Room',
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
    makers = [
        {
            count: 0
        },
        {
            count: 0
        }
    ];
    sellers = [
        {
            count: 0
        },
        {
            count: 0
        }
    ];
}

init();

var savegame = JSON.parse(localStorage.getItem("whale_save"));

if (typeof savegame.items !== "undefined") items = savegame.items;
if (typeof savegame.money !== "undefined") money = savegame.money;
if (typeof savegame.items !== "undefined") all_items = savegame.all_items;
if (typeof savegame.money !== "undefined") all_money = savegame.all_money;
if (typeof savegame.makers !== "undefined") makers = savegame.makers;
if (typeof savegame.sellers !== "undefined") sellers = savegame.sellers;

function itemMake(number){
    items = items + number;
    all_items = all_items + number;
    setValue();
};

function itemSell(number){
    if (items < number) {
        number = items;
    }
    if (number>0) {
        items = items - number;
        money = money + ( number * cost);
        all_money = all_money + ( number * cost);
        setValue();
    }
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

function sellerBuy(idx,sell){
    var sellerCost = getSellersBuyPrice(idx);
    if (sell) {
        if (sellers[idx].count>0) {
            money = money + getSellersSellPrice(idx);
            sellers[idx].count = sellers[idx].count - 1;
        }
    }
    else if(money >= sellerCost){
        sellers[idx].count = sellers[idx].count + 1;
        money = money - sellerCost;
    };
    setValue();
    document.getElementById('sellerCount'+idx).innerHTML = sellers[idx].count;  
    document.getElementById('sellerCost'+idx).innerHTML = getSellersBuyPrice(idx).toLocaleString();;
    document.getElementById('sellerSell'+idx).innerHTML = getSellersSellPrice(idx).toLocaleString();;
    if (sellers[idx].count>0) {
        document.getElementById('sellerSellButton'+idx).style.display = "";
    } else {            
        document.getElementById('sellerSellButton'+idx).style.display = "none";
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

function autoSell(ticks_per_second) {
    if (typeof ticks_per_second == "undefined") ticks_per_second = 1;
    var items = 0;
    for(idx = 0; idx < sellers.length; ++idx) {
        items = items + (sellers[idx].count * sellersDef[idx].speed);
    }
    itemSell(items/ticks_per_second);
}

window.setInterval(function(){
    autoMake(ticks_per_second);
    autoSell(ticks_per_second);
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
    return Math.floor(sellersDef[idx].price * Math.pow(1+sellersDef[idx].buy_factor,sellers[idx].count));
}

function getSellersSellPrice(idx) {
    return Math.floor(sellersDef[idx].sell_factor * sellersDef[idx].price * Math.pow(1+sellersDef[idx].buy_factor,sellers[idx].count-1));
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
        sellers: sellers
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
    for(idx = 0; idx < sellersDef.length; ++idx) {
        var row = document.getElementById('sellerRow'+idx);
        if (all_money >= sellersDef[idx].available) {row.style.display = "";}
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
    for(idx = 0; idx < sellersDef.length; ++idx) {
        var row = sellertable.insertRow(-1);
        row.id = "sellerRow"+idx;
        if (all_money < sellersDef[idx].available) {row.style.display = "none";}
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        cell1.innerHTML = '<span class="bignum" id="sellerCount'+idx+'">0</span><br><span class="small" id="sellerRate'+idx+'"></span>';
        cell2.innerHTML = '<span class="imagelabel" id="sellerLabel'+idx+'"></span>';
        cell3.innerHTML = '<button onclick="sellerBuy('+idx+')">Buy for $<span id="sellerCost'+idx+'">0</span></button><br><button id="sellerSellButton'+idx+'" class="small" onclick="sellerBuy('+idx+',true)">Sell for $<span id="sellerSell'+idx+'">0</span></button>';
        if (typeof sellers[idx] == "undefined"){
            sellers[idx] = {count: 0};
        }
        if (sellers[idx].count>0) {
            document.getElementById('sellerSellButton'+idx).style.display = "";
        } else {            
            document.getElementById('sellerSellButton'+idx).style.display = "none";
        }
        document.getElementById('sellerLabel'+idx).innerHTML = sellersDef[idx].name;
        document.getElementById('sellerSell'+idx).innerHTML = getSellersSellPrice(idx).toLocaleString();
        document.getElementById('sellerCount'+idx).innerHTML = sellers[idx].count;
        document.getElementById('sellerCost'+idx).innerHTML = getSellersBuyPrice(idx).toLocaleString();
        document.getElementById('sellerRate'+idx).innerHTML = sellersDef[idx].speed + "/sec";
    }
    setValue();
}






