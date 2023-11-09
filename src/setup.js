/**
 * Initialize most of the needed variables.
 */
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

const MIN_PERCENTAGE_TO_SHOW_LINK = 1;
const NUM_YEARS = 4;                                // Amount of years that survey data is available including starting year
const AMOUNT_OF_OCCUPATION_CATEGORIES_PER_YEAR = 9  // Here we look at regular years
const NUM_OCCUPATION_CATEGORIES_YEARS = Array.from({ length: NUM_YEARS }, (_, index) => (index === 0 ? 1 : AMOUNT_OF_OCCUPATION_CATEGORIES_PER_YEAR));
const TOTAL_WEIGHTS_YEARS = Array.from({ length: NUM_YEARS }).fill(0);

// Importantly the first connection matrix is just a 1 dimensional vector as everyone was in obligatory school in the first year
const CONNECTIONS_YEARS = NUM_OCCUPATION_CATEGORIES_YEARS.map((numCategories) => {
    return Array.from({ length: numCategories }, () => Array(AMOUNT_OF_OCCUPATION_CATEGORIES_PER_YEAR).fill(0));
});



let TOT_NUM_NODES = 38;
let NUM_THIRD_NODES = 10; // including invisible node
let NUM_FIRST_NODES = 10; // including elementary node
let REM_NUM_NODES = TOT_NUM_NODES - NUM_THIRD_NODES;

/* YEARS */
let years = ["2016", "2017", "2018", "2019"];

let t1weigth = 0;
let t2weigth = 0;
let t3weigth = 0;

let marginleft = 20;
let margintop = 30;

/* Boolean to check if the titles are really drawn once! */
let titlesDrawn = false;

let nodesFilter;

// Define each color
let obligatorische_schule = "#666";
let nicht_in_ausbildung = "#E24c4f";
let praktikum = "#f1ff57";
let zehntes_schuljahr = "#ffbe57";
let zwischenloesung = "#ff9e57";
let berufsausbildung_2jahre = "#aeff57";
let berufsausbildung_34jahre = "#5edf00";
let berufsmaturitaet = "#337800";
let allgemeinbildende_Schule = "#00a8ff";
let andere_loesung = "#00ffcc";

let notsure = "#FF0";

// Language of the page
let lang;

/**
 * Will be executed when the page is visited.
 * The main method.
 */
function buildPage() {
    appSize();
    initLinkSize();
    setLegendColor();
    initSankey();
    readData(updateSankey);
}

/**
 * If the window is changed, then the app will be adapted to the new size.
 * It gets the new size, deletes the old and draws the whole sankey new.
 */
function adaptSize() {
    appSize();
    clearSankey();
    initSankey();
    updateSankey();
    drawTitles();
}

/**
 * Clears the whole sankey, so it can be drawn to the new size if the window is changed.
 */
function clearSankey() {
    svg.selectAll('path').remove();
    svg.selectAll('rect').remove();
    svg.selectAll('text').remove();
    svg.selectAll('g').remove();
    // Because the titles are removed too, then the titles need to be drawn again.
    titlesDrawn = false;
}

/**
 * Get the window/client height to determine the size of the sankey.
 */
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

    // For small displays like mobiles
    if (window.innerWidth >= 992) {
        right.style.height = "" + leftHeight + "px";
    } else {
        if (right.clientHeight >= 500) {
            right.style.height = "" + window.innerHeight * 0.95 + "px";
        } else {
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

/**
 * Initialize the linkSize array.
 */
function initLinkSize() {
    // linkSize[i][j] will contain the width of the link from node i to node j.
    // It is used for cleaning up the sankey (look at calculateLinks).
    linkSize = new Array(TOT_NUM_NODES);
    for (let i = 0; i < TOT_NUM_NODES; i++) {
        linkSize[i] = new Array(TOT_NUM_NODES).fill(0);
    }
}

/**
 * Set color for legend.
 */
function setLegendColor() {
    var list = document.getElementsByClassName("legend-labels");
    for (var x = 0; x < list[0].children.length; x++) {
        // Switch German labels
        if (lang == "ger") {
            switch (list[0].children[x].innerText) {
                case "Obligatorische Schule":
                    list[0].children[x].firstChild.style.background = obligatorische_schule;
                    break;
                // ... (Repeat for other cases)
                default:
                    list[0].children[x].firstChild.style.background = "white";
           
            }
        }
    }
}