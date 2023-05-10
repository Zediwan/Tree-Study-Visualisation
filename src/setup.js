
/**
 * initialise most of the needed variables
 * */

var linkSize;
var jsonData = [];
var jsonDataFiltered = [];
var customLinks = [];
var svg;
var diagram;
var t;
var formatNumber;
var sankey;
var linkGroup;
var nodeGroup;
var titleGroup;
var columnCoord = [];

/* YEARS*/
var years = ["2016", "2017", "2018"];

var t1weigth = 0;
var t2weigth = 0;
var t3weigth = 0;


var marginleft = 20;
var margintop = 30;

/* boolean to check if the titles are really drawn once!*/
var titlesDrawn = false;

var nodesFilter;

//define each color
var compulsary_education = "#666";
var vocational_education = "#6CA";
var general_education = "#088";
var intermediate_solutions = "#F68";
var not_in_education = "#F18";


//language of the page
var lang;

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
    // it has normally only 62 nodes (including the 0. node obligatory school), the 63. node is an invisible node
    // it is used for cleaning up the sankey (look at calculateLinks)
    linkSize = new Array(63);
    var i;
    var j;
    for (i = 0; i < 63; i++) {
        linkSize[i] = new Array(63);
    }

    //set every element of Array to 0
    for (i = 0; i < 63; i++) {
        for (j = 0; j < 63; j++) {
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
                    list[0].children[x].firstChild.style.background = school;
                    break;
                case "Nicht in Ausbildung":
                    list[0].children[x].firstChild.style.background = not_in_education;
                    break;
                case "Zwischenlösung":
                    list[0].children[x].firstChild.style.background = intermediate;
                    break;
                case "Sekundarstufe II Berufsbildung":
                    list[0].children[x].firstChild.style.background = coational_education;
                    break;
                case "Sekundarstufe II Allgemeinbildung":
                    list[0].children[x].firstChild.style.background = general_education;
                    break;
                case "Erwerbstätig mit Sek. II-Abschluss":
                    list[0].children[x].firstChild.style.background = work_dipl;
                    break;
                case "Erwerbstätig ohne Abschluss":
                    list[0].children[x].firstChild.style.background = work_no_dipl;
                    break;
                case "Weder in Ausbildung noch erwerbstätig":
                    list[0].children[x].firstChild.style.background = no_edu_no_emp;
                    break;
                case "Tertiär A = Universität oder Fachhochschule":
                    list[0].children[x].firstChild.style.background = tertiary_a;
                    break;
                case "Tertiär B = Höhere Fachschulen, Fach- und Berufsprüfungen":
                    list[0].children[x].firstChild.style.background = tertiary_b;
                    break;
                default:
                    list[0].children[x].firstChild.style.background = "white";
            }
        }
        //switch french labels
        else if(lang == "fra")
        {
            switch(list[0].children[x].innerText)
            {
                case "Scolarité obligatoire":
                    list[0].children[x].firstChild.style.background = school;
                    break;
                case "Hors formation":
                    list[0].children[x].firstChild.style.background = not_in_education;
                    break;
                case "Solutions intermédiaires":
                    list[0].children[x].firstChild.style.background = intermediate;
                    break;
                case "Formation professionnelle sec.II":
                    list[0].children[x].firstChild.style.background = coational_education;
                    break;
                case "Formation générale secondaire II":
                    list[0].children[x].firstChild.style.background = general_education;
                    break;
                case "Actif après obtention d‘un diplôme du sec. II":
                    list[0].children[x].firstChild.style.background = work_dipl;
                    break;
                case "Actif sans diplôme sec. II":
                    list[0].children[x].firstChild.style.background = work_no_dipl;
                    break;
                case "Ni en formation ni actif":
                    list[0].children[x].firstChild.style.background = no_edu_no_emp;
                    break;
                case "Tertiaire A = universités, hautes écoles (spécialisées)":
                    list[0].children[x].firstChild.style.background = tertiary_a;
                    break;
                case "Tertiaire B = Ecoles supérieures, préparations aux examens professionnels supérieurs (diplôme ou brevet fédéral)":
                    list[0].children[x].firstChild.style.background = tertiary_b;
                    break;
                default:
                    list[0].children[x].firstChild.style.background = "white";
            }
        }
        //switch english labels
        else
        {
            switch(list[0].children[x].innerText)
            {
                case "9th grade of compulsory school":
                    list[0].children[x].firstChild.style.background = school;
                    break;
                case "Not in education or training":
                    list[0].children[x].firstChild.style.background = not_in_education;
                    break;
                case "Intermediate solutions":
                    list[0].children[x].firstChild.style.background = intermediate;
                    break;
                case "Vocational education and training":
                    list[0].children[x].firstChild.style.background = coational_education;
                    break;
                case "General education":
                    list[0].children[x].firstChild.style.background = general_education;
                    break;
                case "Economically active with upper sec. diploma":
                    list[0].children[x].firstChild.style.background = work_dipl;
                    break;
                case "Economically active without upper sec. diploma":
                    list[0].children[x].firstChild.style.background = work_no_dipl;
                    break;
                case "Neither economically active nor in education or training":
                    list[0].children[x].firstChild.style.background = no_edu_no_emp;
                    break;
                case "Tertiary A = Universities and Universities of Applied Sciences":
                    list[0].children[x].firstChild.style.background = tertiary_a;
                    break;
                case "Tertiary B = other postsecondary education and training":
                    list[0].children[x].firstChild.style.background = tertiary_b;
                    break;
                default:
                    list[0].children[x].firstChild.style.background = "white";
            }
        }
    }
}