
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

let guillotine = 0.4
let TOT_NUM_NODES = 38
let NUM_THIRD_NODES = 10 // including invis node
let NUM_FIRST_NODES = 10 // including elementary node
let REM_NUM_NODES = TOT_NUM_NODES - NUM_THIRD_NODES



/* YEARS*/
let years = ["2016", "2017", "2018", "2019"];

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
    linkSize = new Array(TOT_NUM_NODES);
    var i;
    var j;
    for (i = 0; i < TOT_NUM_NODES; i++) {
        linkSize[i] = new Array(TOT_NUM_NODES);
    }

    //set every element of Array to 0
    for (i = 0; i < TOT_NUM_NODES; i++) {
        for (j = 0; j < TOT_NUM_NODES; j++) {
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
                case "Zwischenlösung: Praktikum":
                    list[0].children[x].firstChild.style.background = praktikum;
                    break;
                case "Zwischenlösung: 10. Schuljahr" :
                    list[0].children[x].firstChild.style.background = zehntes_schuljahr;
                    break;
                case "Zwischenlösung: übrige":
                    list[0].children[x].firstChild.style.background = zwischenloesung;
                    break;
                case "Berufsbildung: 2 jährig" :
                     list[0].children[x].firstChild.style.background = berufsausbildung_2jahre;
                     break;
                case "Berufsbildung: 3-4 jährig (EFZ)":
                    list[0].children[x].firstChild.style.background = berufsausbildung_34jahre;
                    break;
                case "Berufsbildung: 3-4 jährig (EFZ + BMI)" :
                    list[0].children[x].firstChild.style.background = berufsmaturitaet;
                    break;
                case "Allgemeinbildung: Gymnasien" :
                    list[0].children[x].firstChild.style.background = allgemeinbildende_Schule;
                    break;
                case "Allgemeinbildung: übrige":
                    list[0].children[x].firstChild.style.background = andere_loesung;
                    break;
                default:
                    list[0].children[x].firstChild.style.background = "white";
                
            }
        }
        //switch english labels
        else if(lang == "eng")
        {
            switch(list[0].children[x].innerText)
            {
                case "compulsory school":
                    list[0].children[x].firstChild.style.background = obligatorische_schule;
                    break;
                    case "not in education or training":
                    list[0].children[x].firstChild.style.background = nicht_in_ausbildung;
                    break;
                case "Interim solution: Internship":
                    list[0].children[x].firstChild.style.background = praktikum;
                    break;
                case "Interim solution: 10th school year" :
                    list[0].children[x].firstChild.style.background = zehntes_schuljahr;
                    break;
                case "interim solution: other":
                    list[0].children[x].firstChild.style.background = zwischenloesung;
                    break;
                case "VET: 2 years" :
                     list[0].children[x].firstChild.style.background = berufsausbildung_2jahre;
                     break;
                case "VET: 3-4 years":
                    list[0].children[x].firstChild.style.background = berufsausbildung_34jahre;
                    break;
                case "VET: 3-4 years VB1" :
                    list[0].children[x].firstChild.style.background = berufsmaturitaet;
                    break;
                case "General education: Baccalaureate schools" :
                    list[0].children[x].firstChild.style.background = allgemeinbildende_Schule;
                    break;
                case "General education: other":
                    list[0].children[x].firstChild.style.background = andere_loesung;
                    break;
                default:
                    list[0].children[x].firstChild.style.background = "white";
                
                }
            }
        else if (lang == "fr")
            //switch french labels
            {
            switch(list[0].children[x].innerText)
                {
                case "École obligatoire":
                    list[0].children[x].firstChild.style.background = obligatorische_schule;
                    break;
                    case "Pas en formation":
                    list[0].children[x].firstChild.style.background = nicht_in_ausbildung;
                    break;
                case "Solution transitoire: stage":
                    list[0].children[x].firstChild.style.background = praktikum;
                    break;
                case "Solution transitoire: 10ème année scolaire" :
                    list[0].children[x].firstChild.style.background = zehntes_schuljahr;
                    break;
                case "Solution transitoire: autre":
                    list[0].children[x].firstChild.style.background = zwischenloesung;
                    break;
                case "Formation professionelle: 2 ans" :
                    list[0].children[x].firstChild.style.background = berufsausbildung_2jahre;
                    break;
                case "Formation professionelle: 3-4 ans":
                    list[0].children[x].firstChild.style.background = berufsausbildung_34jahre;
                    break;
                case "Formation professionelle: 3-4 ans (CFEC + MP1)" :
                    list[0].children[x].firstChild.style.background = berufsmaturitaet;
                    break;
                case "Formation générale: gymnase" :
                    list[0].children[x].firstChild.style.background = allgemeinbildende_Schule;
                    break;
                case "Formation générale: autre":
                    list[0].children[x].firstChild.style.background = andere_loesung;
                    break;
                default:
                    list[0].children[x].firstChild.style.background = "white";
                    
                }
            }
        }
    }