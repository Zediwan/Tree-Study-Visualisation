/**
 * converts the gender or language value in the person objects to an integer used from @link filterForm
 * for the according property
 */
function convertToInteger(jsonData, type) {
    /* starting with index 0 the details of a person is converted to an integer
     * is connected to the radio buttons !
     *
     * */
    
        /**
     * gender in dataset: 1 = female, 2 = male
     * for it to be 0 we have to substract 1 -->
     * 0 = female, male 1 = male
     */

    if(type == "gender")
    {
        return jsonData.t0sex
     - 1;
    }
   
     /**
      * language region in dataset: 1 = german, 2 = french, 3 = italian
      * for it to be 0 we have to substract 1 -->
      * 0 = german, 1 = french, 3 = italian
      */
    if(type == "language")
    {
        return jsonData.aes_langreg 
        -1;
    }
    /**
     * in dataset: 
     * 1 = High requirements
     * 2 = Advanced requirements & Alternative/non-assignable study program
     * 3 = Basic/low requirements
      */

    if(type == "school-requirements")
    {
        return jsonData.t3educ_class_1_r 
        -1;
        /**
         * let st = jsonData.t0st_nprog_req3;
        if(st == 3){
            st = 2
        }
        else{
            st = 1
        }
        return st
         */
        /**result of the newest wave */
    }
    /** in dataset: 
     * 1 = low, 2 = medium, 3 = high
     * for it to be 0 we substract 1 -->
     * 0 = low, 1 = medium, 2 = high
     */
    if(type == "status")
    {
        return jsonData.t0hisei08_3q 
        -1;
    }
    /**
     * Education of parents in dataset:
     * 0 = compulsary schooling only
     * 1 = upper secondary education
     * 2 = tertiary education
     * 
     * no adujstments needed
     */
    if(type == "parents")
    {
        return jsonData.t0fmedu_comp ;
    }

    /**
     * New category: Immigration. Needs to be integrated!
     * in dataset:
     * 1 = native (at least 1 parent born in Switzerland)
     * 2 = 2nd generation (respondent born in Switzerland, no parent born in Switzerland)
     * 2 = first generation (respondent and parents born abroad)
     * for it to be 0 we substract 1 -->
     * 0 = native, 1 = 2nd generation, 2 = first generation 
     */
    if(type == "immigration")
    {
        return jsonData.t0immig ;
    }
}


/**
 * filter jsonData and fill selected elements into jsonDataFiltered
 * @todo @zediwan create filter for immigration
 */
function filter() {
    jsonDataFiltered = [];
    var form = document.getElementById("filterForm");
    var i;
    var length = jsonData.length;   // Amount of Data elements.

    // If all is selected just add all elements.
    if(form.selAll.checked){
        jsonDataFiltered = jsonData;
        return;
    }
    /*
     * Filter the original Data for every person, based on selected filters
     *  */
    for (i = 0; i<length; i++)
    {   
        var selGend = getCheckedBoxes(form.selGend);
        var selLang = getCheckedBoxes(form.selLang);
        var selEdu = getCheckedBoxes(form.selEdu);
        var selEco = getCheckedBoxes(form.selEco);
        var selEduPar = getCheckedBoxes(form.selEduPar);

        // Check whether the person's data matches any of the selected categories if none selected add all of said category
        if ((selGend.length == 0 || selGend.includes(convertToInteger(jsonData[i], "gender"))) &&
            (selLang.length == 0 || selLang.includes(convertToInteger(jsonData[i], "language"))) &&
            (selEdu.length == 0 || selEdu.includes(convertToInteger(jsonData[i], "school-requirements"))) &&
            (selEco.length == 0 || selEco.includes(convertToInteger(jsonData[i], "status"))) &&
            (selEduPar.length == 0 || selEduPar.includes(convertToInteger(jsonData[i], "parents"))))
        {
            jsonDataFiltered.push(jsonData[i]);
        }
    }
}

function getCheckedBoxes(boxesArray){
    var boxesChecked = []; // Array of checked boxes
    // Go through all the boxes
    for (var k = 0; k < boxesArray.length; k++) {
        if (boxesArray[k].checked) {
            boxesChecked.push(k);   // If the Box is checked add it to the return list
        }
    }
    return boxesChecked;
}

/**
 Read each Person and convert information into links
 */
 function calculateLinks() {
    var length = jsonDataFiltered.length;
    var index;
    var from = new Array(2);
    var to;

    /* for the calculation of the weigths for that we can break the links down in percentage*/
    t1weigth = 0;
    t2weigth = 0;
    t3weigth = 0;

    //Read each person object and manipulate links accordingly
    for (index = 0; index < length; index++) {
        /*
         * for the obligatory school node (look at the labels.json , all "nodes" are indexed according to the json
         * so for example "Nicht in Ausbildung" exists more than once because it appears in diffrent years, so every of them has
         * a diffrent index), if more nodes and other years are implemented, then this code needs to be expanded!
         * */
        from[0] = 0;

        /*
         * read t1baum, note target of links coming from node 0, note source of links goingt to t2baum
         * we go from node 0 "obligatory school" to one of the 4 nodes of the first survey, so only
         * Nicht in Ausbildung with index 1, Zwischenlösung with index 2 etc.
         * */
        switch (jsonDataFiltered[index].t1educ_class_1_r) {
            case 1:
                to = 1;
                from[1] = 1;
                break;
            case 2:
                to = 2
                from[1] = 2;
                break;
            case 3:
                to = 3
                from[1] = 3;
                break;
            case 4:
                to = 4
                from[1] = 4;
                break;
            case 5:
                to = 5
                from[1] = 5;
                break;
            case 6:
                to = 6
                from[1] = 6;
                break;
            case 7:
                to = 7
                from[1] = 7;
                break;       
            case 8:
                to = 8;
                from[1] = 8;
                break;
            case 9:
                to = 9;
                from[1] = 9;
                break;
            default:
                to = null;
                from[1] = null;
        }
        /*
         * sum all links together of the first year
         * should a source or target node be empty (because some people didn't answer that year then it will not be included)
         * */
        if (from[0] != null && to != null) {
            //console.log(jsonDataFiltered[index].t1wt)
            linkSize[from[0]][to] += (parseFloat(jsonDataFiltered[index].t1wt));
        }

        // same as above but this time it begins with index 5 because thats the first node in the second survey
        switch (jsonDataFiltered[index].t2educ_class_1_r) {
            case 1:
                to = 10;
                from[0] = 10;
                break;
            case 2:
                to = 11
                from[0] = 11;
                break;
            case 3:
                to = 12
                from[0] = 12;
                break;
            case 4:
                to = 13
                from[0] = 13;
                break;
            case 5:
                to = 14
                from[0] = 14;
                break;
            case 6:
                to = 15
                from[0] = 15;
                break;
            case 7:
                to = 16
                from[0] = 16;
                break;       
            case 8:
                to = 17;
                from[0] = 17;
                break;
            case 9:
                to = 18;
                from[0] = 18;
                break;
            default:
                to = null;
                from[0] = null;
        }
        if (from[1] != null && to != null) {
            linkSize[from[1]][to] += (parseFloat(jsonDataFiltered[index].t2wt));
        }
        
    }

     /*
     *calculate weight of links
     *for every survey year we collect the total amount of "movement" to get the weight
     *if more nodes and other years are implemented, then this code needs to be expanded!
     * */
    const TOT_NUM_NODES = 29    // Total amount of nodes specified in labels.json
    const NUM_LAST_NODES = 10    // Amount of nodes in the last group including invis node
    const REM_NUM_NODES = TOT_NUM_NODES - NUM_LAST_NODES  // Remaining number of nodes

    const FIRST_YEAR_START = 1
    const FIRST_AMOUNT= 9
    const FIRST_YEAR_END = FIRST_YEAR_START + FIRST_AMOUNT
    for (i = FIRST_YEAR_START; i < FIRST_YEAR_END; i++){
        for (j=0; j < REM_NUM_NODES; j++){
            t1weigth += linkSize[j][i];
        }
    }

    const SECOND_YEAR_START = FIRST_YEAR_END
    const SECOND_AMOUNT= 9
    const SECOND_END = FIRST_YEAR_END + SECOND_AMOUNT
    for (i = SECOND_YEAR_START; i < SECOND_END; i++){
        for (j=0; j < REM_NUM_NODES; j++){
            t2weigth += linkSize[j][i];
        }
    }

    

    //Break linksize down to %, if more nodes and other years are implemented, then this code needs to be expanded!
    for (i=FIRST_YEAR_START; i<FIRST_YEAR_END; i++){
        for (j=0; j < REM_NUM_NODES; j++){
            linkSize[j][i] = linkSize[j][i]/t1weigth*100;
        }
    }

    for (SECOND_YEAR_START; i<=SECOND_END; i++){
        for (j=0; j < REM_NUM_NODES; j++){
            linkSize[j][i] = linkSize[j][i]/t2weigth*100;
        }
    }



    /**
     * Guillotine 4%
     * if a node is smaller than 4% then its links have to be smaller than 4% too, so we give the 63.
     * "invisible" node the links, and empty the normal links
     */

    // for the "value" of a node
    var summe;

    /*
     *for every node index 0 to 61 we calculate its value and then if it is smaller than 4%, we remove it
     *
     * if the node size changes 62 needs to be changed too !
     * it begins by 1 because 0 should be always 100%
     *
     * to remember is that the array linkSize is linkSize[FROM][TO]
     */
    const GUILLOTINE = 0    // Min amount of % that a connection needs to be shown
    const RELEVANT_NODES = TOT_NUM_NODES-1   // All nodes except the invisible one
    for (i = 1; i < RELEVANT_NODES; i++){
        summe = 0;
        for (j = 0; j < i; j++){
            summe = summe + linkSize[j][i];
        }

        // 4% guillotine
        if (summe < GUILLOTINE) {
            for (j = 0; j < i; j++) {
                linkSize[j][i] = 0;
            }

            for (j = 0; j < RELEVANT_NODES; j++) {
                linkSize[RELEVANT_NODES][j] = linkSize[i][j];
                linkSize[i][j] = 0;
            }

        }
    }

    /*
     * now after everything is filtered we can send the links in the right format to customLinks
     * which the helper function in sankey.js uses
     *
     * if more nodes are implemented 63 needs to be changed!
     */
    for (i = 0; i < TOT_NUM_NODES; i++) {
        for (j = 0; j < TOT_NUM_NODES; j++) {
            if (linkSize[i][j] > 0) {
                customLinks.push({ "source": i, "target": j, "value": linkSize[i][j] });
            }
        }
    }
}