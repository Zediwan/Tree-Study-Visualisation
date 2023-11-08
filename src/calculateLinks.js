/**
 * Converts the gender or language value in the person objects to an integer
 * used for filtering based on the specified property in the filterForm.
 *
 * @param {Object} jsonData - The person object containing data to be converted.
 * @param {string} type - The property type (e.g., 'gender' or 'language') for which the conversion is needed.
 * @returns {number} An integer value representing the converted property.
 */
function convertToInteger(jsonData, type) {
    // Create a conversion table using an object literal.
    const conversionTable = {
        // For the "gender" type, subtract 1 from the "t0sex" field.
        gender: jsonData.t0sex - 1,

        // For the "language" type, map values from "aes_langreg" to the desired result.
        // For example, if "aes_langreg" is 1, map it to 0; if 2 or 3, map to 1.
        language: {
            1: 0, // 1 maps to 0
            2: 1, // 2 maps to 1
            3: 1, // 3 maps to 1
        }[jsonData.aes_langreg],

        // Similar mapping is applied for other types like "school-requirements," "status," etc.
        'school-requirements': {
            1: 1,
            2: 1,
            3: 0,
        }[jsonData.t0st_nprog_req3],
        status: jsonData.t0hisei08_3q - 1,
        parents: jsonData.t0fmedu_comp,
        immigration: jsonData.t0immig - 1,
    };

    // Return the result based on the specified type.
    return conversionTable[type];
}

/**
 * Filters the `jsonData` array based on selected categories in the filter form and populates
 * the `jsonDataFiltered` array with matching elements.
 *
 * @function
 * @name filter
 *
 * @description This function is responsible for filtering the `jsonData` array of person objects
 * based on selected categories in the filter form. It iterates through the data and checks whether
 * each person's data matches the selected categories. If no categories are selected for a particular
 * property, all data for that property is included. The filtered data is stored in the `jsonDataFiltered` array.
 *
 * @global
 *
 * @returns {void} This function does not return a value directly, but it populates the global `jsonDataFiltered`
 * array with the filtered data.
 */
function filter() {
    jsonDataFiltered = [];
    var form = document.getElementById("filterForm");
    var length = jsonData.length;

    var selectedCategories = {
        gender: getCheckedBoxes(form.selGend),
        language: getCheckedBoxes(form.selLang),
        'school-requirements': getCheckedBoxes(form.selEdu),
        status: getCheckedBoxes(form.selEco),
        parents: getCheckedBoxes(form.selEduPar),
        immigration: getCheckedBoxes(form.selImmig),
    };

    /*
     * Filter the original Data for every person, based on selected filters
     *  */
    for (var i = 0; i < length; i++) {
        var personData = jsonData[i];

        // Check whether the person's data matches any of the selected categories.
        // If no categories are selected, include all data.
        var includePerson = Object.keys(selectedCategories).every(function(category) {
            return selectedCategories[category].length === 0 ||
                selectedCategories[category].includes(convertToInteger(personData, category));
        });

        if (includePerson) {
            jsonDataFiltered.push(personData);
        }
    }
}

/**
 * Returns an array of indices (zero-based) of checked checkboxes in the given array.
 *
 * @param {HTMLInputElement[]} boxesArray - An array of checkbox elements to check.
 * @returns {number[]} An array of indices representing the positions of checked checkboxes.
 */
function getCheckedBoxes(boxesArray) {
    var checkedIndices = [];

    boxesArray.forEach(function(checkbox, index) {
        if (checkbox.checked) {
            checkedIndices.push(index);
        }
    });
    
    return checkedIndices;
}


/**
 Read each Person and convert information into links
 */
function calculateLinks() {
    /* for the calculation of the weigths for that we can break the links down in percentage*/
    t1weigth = 0;
    t2weigth = 0;
    t3weigth = 0;   

    const FIRST_YEAR_START = 1
    const FIRST_AMOUNT= 9
    const FIRST_YEAR_END = FIRST_YEAR_START + FIRST_AMOUNT
    const SECOND_YEAR_START = FIRST_YEAR_END
    const SECOND_AMOUNT= 9
    const SECOND_END = FIRST_YEAR_END + SECOND_AMOUNT
    const THIRD_YEAR_START = SECOND_END
    const THIRD_AMOUNT= 9
    const THIRD_YEAR_END = THIRD_AMOUNT + THIRD_YEAR_START

    var from = new Array(4);
    var to;

    //Read each person object and manipulate links accordingly
    //todo: update this method
    //todo automise this method so that it works for n amount of years
    jsonDataFiltered.forEach(person => {
        /*
         * for the obligatory school node (look at the labels.json , all "nodes" are indexed according to the json
         * so for example "Nicht in Ausbildung" exists more than once because it appears in diffrent years, so every of them has
         * a diffrent index), if more nodes and other years are implemented, then this code needs to be expanded!
         * */
        from[0] = 0;

        /*
         * read t1educ_class_1_r, note target of links coming from node 0, note source of links goingt to t2educ_class_1_r
         * we go from node 0 "obligatory school" to one of the 4 nodes of the first survey, so only
         * Nicht in Ausbildung with index 1, Zwischenlösung with index 2 etc.
         * */
        switch (person.t1educ_class_1_r) {
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
        //from[1] = person.t1educ_class_1_r
        //to = from[1]
        /*
         * sum all links together of the first year
         * should a source or target node be empty (because some people didn't answer that year then it will not be included)
         * */
        if (to != null) {
            linkSize[from[0]][to] += (parseFloat(person.t1wt));
        }

        // same as above but this time it begins with index 5 because thats the first node in the second survey
        switch (person.t2educ_class_1_r) {
            case 1:
                to = 10;
                from[2] = 10;
                break;
            case 2:
                to = 11
                from[2] = 11;
                break;
            case 3:
                to = 12
                from[2] = 12;
                break;
            case 4:
                to = 13
                from[2] = 13;
                break;
            case 5:
                to = 14
                from[2] = 14;
                break;
            case 6:
                to = 15
                from[2] = 15;
                break;
            case 7:
                to = 16
                from[2] = 16;
                break;       
            case 8:
                to = 17;
                from[2] = 17;
                break;
            case 9:
                to = 18;
                from[2] = 18;
                break;
            default:
                to = null;
                from[2] = null;
        }
        //from[2] = jsonDataFiltered[index].t2educ_class_1_r + FIRST_AMOUNT
        //to = from[2]
        
        if (from[1] != null && to != null) {
            linkSize[from[1]][to] += (parseFloat(person.t2wt));
        }

        switch (person.t3educ_class_1_r) {
            case 1:
                to = 19;
                from[3] = 19;
                break;
            case 2:
                to = 20
                from[3] = 20;
                break;
            case 3:
                to = 21
                from[3] = 21;
                break;
            case 4:
                to = 22
                from[3] = 22;
                break;
            case 5:
                to = 23
                from[3] = 23;
                break;
            case 6:
                to = 24
                from[3] = 24;
                break;
            case 7:
                to = 25
                from[3] = 25;
                break;       
            case 8:
                to = 26;
                from[3] = 26;
                break;
            case 9:
                to = 27;
                from[3] = 27;
                break;
            default:
                to = null;
                from[3] = null;
        }
        //from[3] = jsonDataFiltered[index].t3educ_class_1_r + FIRST_AMOUNT + SECOND_AMOUNT
        //to = from[3]
        if (from[2] != null && to != null) {
            linkSize[from[2]][to] += parseFloat(person.t3wt);
        }   
    })

    t1weigth = calculateTotalWeight(linkSize, FIRST_YEAR_START, FIRST_YEAR_END);
    t2weigth = calculateTotalWeight(linkSize, SECOND_YEAR_START, SECOND_END);
    t3weigth = calculateTotalWeight(linkSize, THIRD_YEAR_START, THIRD_YEAR_END);

    applyGuillotineTotalValue(linkSize)
    
    convertToPercentagesForYear(linkSize, FIRST_YEAR_START, FIRST_AMOUNT, t1weigth)
    convertToPercentagesForYear(linkSize, SECOND_YEAR_START, SECOND_AMOUNT, t2weigth)
    convertToPercentagesForYear(linkSize, THIRD_YEAR_START, THIRD_AMOUNT, t3weigth)
    
    applyGuillotinePercentage(linkSize);

    /*
     * now after everything is filtered we can send the links in the right format to customLinks
     * which the helper function in sankey.js uses
     */
    for (i = 0; i < TOT_NUM_NODES; i++) {
        for (j = 0; j < TOT_NUM_NODES; j++) {
            if (linkSize[i][j] > 0) {
                //todo add total observations for each link
                customLinks.push({ "source": i, "target": j, "value": linkSize[i][j] });
            }
        }
    }
}

/**
 * Calculate the total weight for a specific year range.
 * @param {number[][]} linkSize - The 2D array for link weights.
 * @param {number} startYear - The starting year of the range.
 * @param {number} endYear - The ending year of the range.
 * @returns {number} The total weight for the specified year range.
 */
// todo refactor as it should return an array with the total weights per year
function calculateTotalWeight(linkSize, startYear, endYear) {
    let totalWeight = 0;
    for (let i = startYear; i < endYear; i++) {
        for (let j = 0; j < REM_NUM_NODES; j++) {
            totalWeight += linkSize[j][i];
        }
    }
    return totalWeight;
}

/**
 * Convert linkSize values to percentages for a specific year and number of categories.
 * @param {number[][]} linkSize - The 2D array for link weights.
 * @param {number} yearStart - The starting year of the survey data.
 * @param {number} numCategories - The number of categories for the year.
 * @param {number} yearTotalWeight - The total weight for the year.
 */
// todo turn this into a method that just returns a new converted matrix instead of replacing actual values of the original
function convertToPercentagesForYear(linkSize, yearStart, numCategories, yearTotalWeight) {
    for (let j = yearStart; j < yearStart + numCategories; j++) {
        for (let k = 0; k < linkSize.length; k++) {
            if (yearTotalWeight !== 0) {
                linkSize[k][j] = (linkSize[k][j] / yearTotalWeight) * 100;
            } else {
                linkSize[k][j] = 0;
            }
        }
    }
}

/**
 * Apply a guillotine percentage filter to remove links with a percentage below the specified threshold.
 *
 * @param {number[][]} linkSize - 2D array representing link weights between nodes.
 * @param {number} guillotinePercentage - The threshold for link removal in % (default: 1%).
 */
function applyGuillotinePercentage(linkSize, guillotinePercentage = 1) {
    // Iterate through all nodes and apply guillotine.
    for (let i = 0; i < TOT_NUM_NODES; i++) {
        // Calculate the total weight of incoming links.
        for (let j = 0; j < TOT_NUM_NODES; j++) {
            if (linkSize[j][i] < guillotinePercentage) {
                // If the total weight is below the guillotine threshold, clear links.
                linkSize[j][i] = 0;
            }
        }
    }
}

/**
 * Apply a guillotine total value filter to remove links with a total weight below the specified threshold.
 *
 * @param {number[][]} linkSize - 2D array representing link weights between nodes.
 * @param {number} guillotineTotalValue - The threshold for link removal in total observations (default: 30).
 */
function applyGuillotineTotalValue(linkSize, guillotineTotalValue = 30) {
    // Iterate through all nodes and apply guillotine.
    for (let i = 0; i < TOT_NUM_NODES; i++) {
        // Calculate the total weight of incoming links.
        for (let j = 0; j < TOT_NUM_NODES; j++) {
            if (linkSize[j][i] < guillotineTotalValue) {
                // If the total weight is below the guillotine threshold, clear links.
                linkSize[j][i] = 0;
            }
        }
    }
}