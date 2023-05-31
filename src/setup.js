
/**
 * initialise most of the needed variables
 * */

let linkSize;
let jsonData = [];
let jsonDataFiltered = [];
let customLinks = [];
let svg;
let diagram;
let t;
let formatNumber;
let sankey;
let linkGroup;
let nodeGroup;
let titleGroup;
let columnCoord = [];

const guillotine = 0.0
const TOT_NUM_NODES = 29
const NUM_LAST_NODES = 10    // Amount of nodes in the last group including invis node
const NUM_FIRST_NODES = 10 //
const REM_NUM_NODES = TOT_NUM_NODES - NUM_LAST_NODES


/* YEARS*/
let years = ["2016", "2017", "2018"];

let t1weigth = 0;
let t2weigth = 0;
let t3weigth = 0;


let marginleft = 20;
let margintop = 30;

/* boolean to check if the titles are really drawn once!*/
let titlesDrawn = false;

let nodesFilter;

//define each color
let obligatorische_schule = "#666";
let nicht_in_ausbildung = "#fa6eeb";
let praktikum = "#b28ff5";
let zehntes_schuljahr = "#6ab0ff";
let zwischenloesung = "#00B2CA";
let berufsausbildung_2jahre = "#67cc8e";
let berufsausbildung_34jahre = "#b5e655";
let berufsmaturitaet = "#f7ff75";
let allgemeinbildende_Schule = "#ffd26e";
let andere_loesung = "#cb5050";


let notsure = "#FF0";

//language of the page
let lang;

/**
 * Will be executed when the page is visited
 * the main method
 * */
function buildPage() {
    appSize();
    initLinkSize();
    setLegendColor();
    initSankey();
    readData(updateSankey);
}

/**
 * If the window is changed, then the app will be adapted to the new size
 * it gets the new size, deletes the old and draws the whole sankey new
 * */
function adaptSize() {
    appSize();
    clearSankey();
    initSankey();
    updateSankey();
    drawTitles();
}

/**
 * clears the whole sankey, so it can be drawn to the new size if the window is changed
 * */
function clearSankey() {
    svg.selectAll('path').remove();
    svg.selectAll('rect').remove();
    svg.selectAll('text').remove();
    svg.selectAll('g').remove();
    /* because the titles are removed too, then the titles need to be drawn again*/
    titlesDrawn = false;
}

/**
 * get the window/client height to determine the size of the sankey!
 * */
function appSize() {
    var left = document.getElementById('left');
    var legendPanelHeight = document.getElementById('legendWrap').clientHeight;
    var filterPanelHeight = document.getElementById('filterWrap').clientHeight;
    left.style.height = legendPanelHeight + filterPanelHeight + 40 + "px";
    var leftHeight = left.clientHeight;
    var right = document.getElementById('right');
    var right_panel = document.getElementById('right-panel');
    var right_body = document.getElementById('right-body');
    var svgWrap = document.getElementById('svgWrap');

    // for small displays like mobiles
    if(window.innerWidth >= 992)
    {
        right.style.height = "" + leftHeight + "px";
    }
    else
    {
        if(right.clientHeight >= 500)
        {
            right.style.height = "" + window.innerHeight * 0.95 + "px";
        }
        else
        {
            right.style.height = "450px";
        }
    }

    right_panel.style.height = right.clientHeight - 20 + "px";
    right_body.style.height = "100%";
    svgWrap.style.height = "100%";

    var clientHeight = document.getElementById('svgWrap').clientHeight;
    var clientWidth = document.getElementById('svgWrap').clientWidth;
    document.getElementById('diagram').setAttribute("width", clientWidth);
    document.getElementById('diagram').setAttribute("height", clientHeight);
}

function initLinkSize() {
    //linkSize[i][j] will contain the width of the link from node i to node j
    // it is used for cleaning up the sankey (look at calculateLinks)
    const NUMBER_OF_NODES = 29
    linkSize = new Array(NUMBER_OF_NODES);
    var i;
    var j;
    for (i = 0; i < NUMBER_OF_NODES; i++) {
        linkSize[i] = new Array(NUMBER_OF_NODES);
    }

    //set every element of Array to 0
    for (i = 0; i < NUMBER_OF_NODES; i++) {
        for (j = 0; j < NUMBER_OF_NODES; j++) {
            linkSize[i][j] = 0;
        }
    }
}

function setLegendColor() {
    /*
     *set color for legend, look at the top of the script to see the hex for the colors!
     * */
    var list = document.getElementsByClassName("legend-labels");
    for (var x = 0; x<list[0].children.length; x++)
    {
        //switch german labels
        if(lang == "ger")
        {
            switch(list[0].children[x].innerText)
            {
                case "Obligatorische Schule":
                    list[0].children[x].firstChild.style.background = obligatorische_schule;
                    break;
                    case "Nicht in Ausbildung":
                    list[0].children[x].firstChild.style.background = nicht_in_ausbildung;
                    break;
                case "Praktikum":
                    list[0].children[x].firstChild.style.background = praktikum;
                    break;
                case "10. Schuljahr" :
                    list[0].children[x].firstChild.style.background = zehntes_schuljahr;
                    break;
                case "Zwischenlösung":
                    list[0].children[x].firstChild.style.background = zwischenloesung;
                    break;
                case "Berufsausbildung: 2 jährig" :
                     list[0].children[x].firstChild.style.background = berufsausbildung_2jahre;
                     break;
                case "Berufsausbildung: 3-4 jährig":
                    list[0].children[x].firstChild.style.background = berufsausbildung_34jahre;
                    break;
                case "Berufsmaturität" :
                    list[0].children[x].firstChild.style.background = berufsmaturitaet;
                    break;
                case "allgemeine Weiterbildung" :
                    list[0].children[x].firstChild.style.background = allgemeinbildende_Schule;
                    break;
                case "andere Lösung":
                    list[0].children[x].firstChild.style.background = andere_loesung;
                    break;
                default:
                    list[0].children[x].firstChild.style.background = "white";
                    break;
            }
        }
    }
}