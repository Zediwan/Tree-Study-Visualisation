/**
 * Converts the specified property value in the person objects to an integer
 * used for filtering based on the specified property in the filterForm.
 *
 * @param {Object} person - The person object containing data to be converted.
 * @param {string} type - The property type (e.g., 'gender' or 'language') for which the conversion is needed.
 * @returns {number} An integer value representing the converted property.
 */
function convertToInteger(person, type) {
    const conversionTable = {
        gender: person.t0sex - 1,
        language: { 1: 0, 2: 1, 3: 1 }[person.aes_langreg],
        'school-requirements': { 1: 1, 2: 1, 3: 0 }[person.t0st_nprog_req3],
        status: person.t0hisei08_3q - 1,
        parents: person.t0fmedu_comp,
        immigration: person.t0immig - 1,
    };
    return conversionTable[type];
}

/**
 * Filters the `jsonData` array based on selected categories in the filter form and populates
 * the `jsonDataFiltered` array with matching elements.
 *
 * This function iterates through the data and checks whether
 * each person's data matches the selected categories. If no categories are selected for a particular
 * property, all data for that property is included. The filtered data is stored in the `jsonDataFiltered` array.
 */
function filterPersons() {
    jsonDataFiltered = [];
    const form = document.getElementById("filterForm");

    const selectedCategories = {
        gender: getCheckedBoxes(form.selGend),
        language: getCheckedBoxes(form.selLang),
        'school-requirements': getCheckedBoxes(form.selEdu),
        status: getCheckedBoxes(form.selEco),
        parents: getCheckedBoxes(form.selEduPar),
        immigration: getCheckedBoxes(form.selImmig),
    };

    jsonData.forEach(person => {
        if(Object.keys(selectedCategories).every(category =>
            selectedCategories[category].length === 0 ||
            selectedCategories[category].includes(convertToInteger(person, category))
        )){
            jsonDataFiltered.push(person);
        }
    })
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
 * Reads each person's education information and converts it into links for three survey years.
 * @function
 */
function calculateLinks() {
    resetArrays()
    
    // Loop through each person in the filtered data
    jsonDataFiltered.forEach(person => {
        processPerson(person)
    });

    processYears()
}

/**
 * Resets the arrays used for calculations.
 * @function
 */
function resetArrays(){
    TOTAL_WEIGHTS_YEARS.fill(0);

    for (let i = 0; i < NUM_YEARS; i++) {
        CONNECTIONS_YEARS[i] = Array.from({ length: NUM_OCCUPATION_CATEGORIES_YEARS[i] }, () =>
            Array(AMOUNT_OF_OCCUPATION_CATEGORIES_PER_YEAR).fill(0)
        );
    }
}

/**
 * Processes a person's education information for each survey year.
 * @function
 * @param {Object} person - The person's data.
 */
function processPerson(person){
    const OCCUPATION_IN_YEAR = Array.from({ length: NUM_YEARS }).fill(null);

    OCCUPATION_IN_YEAR[0] = 0       // As we assume everyone was in obligatory school at the start
    TOTAL_WEIGHTS_YEARS[0] += 1     // As no weights were given for the first year

    for (let year = 1; year < NUM_YEARS; year++) {
        // @see data_2nd-cohort.json
        const OCCUPATION_PROPERTY_NAME = `t${year}educ_class_1_r`;
        const WEIGHT_PROPERTY_NAME = `t${year}wt`;

        OCCUPATION_IN_YEAR[year] = person[OCCUPATION_PROPERTY_NAME];

        // Needs to be done as categories are from 1 to AMOUNT_OF_OCCUPATION_CATEGORIES_PER_YEAR and our matrices are indexed from 0 to AMOUNT_OF_OCCUPATION_CATEGORIES_PER_YEAR-1
        if(OCCUPATION_IN_YEAR[year] !== null) {
            OCCUPATION_IN_YEAR[year] = OCCUPATION_IN_YEAR[year] -1
        }

        if (OCCUPATION_IN_YEAR[year - 1] !== null && OCCUPATION_IN_YEAR[year] !== null) {
            const WEIGHT = parseFloat(person[WEIGHT_PROPERTY_NAME]) || 0;
            CONNECTIONS_YEARS[year-1][OCCUPATION_IN_YEAR[year - 1]][OCCUPATION_IN_YEAR[year]] += WEIGHT;
            TOTAL_WEIGHTS_YEARS[year-1] += WEIGHT;
        }
    }
}

/**
 * Processes the survey years and applies thresholds.
 * @function
 */
function processYears(){
    let startOffset = 0
    let endOffset = 0

    for (let year = 0; year < NUM_YEARS; year++) {
        if (year > 0){
            endOffset += NUM_OCCUPATION_CATEGORIES_YEARS[year+1]
        }
        if (year > 1){
            startOffset += NUM_OCCUPATION_CATEGORIES_YEARS[year]
        } 

        for (let occupationStart = 0; occupationStart < CONNECTIONS_YEARS[year].length; occupationStart++){
            for (let occupationEnd = 0; occupationEnd < CONNECTIONS_YEARS[year][occupationStart].length; occupationEnd++){
                const SOURCE_OFFSET = year === 0 ? 0 : startOffset + 1;
                const TARGET_OFFSET = endOffset + 1;

                CONNECTIONS_YEARS[year][occupationStart][occupationEnd] /= TOTAL_WEIGHTS_YEARS[year] || 0;
                CONNECTIONS_YEARS[year][occupationStart][occupationEnd] *= 100 || 0;

                if (CONNECTIONS_YEARS[year][occupationStart][occupationEnd] < MIN_PERCENTAGE_TO_SHOW_LINK) {
                    CONNECTIONS_YEARS[year][occupationStart][occupationEnd] = 0;
                }

                if (CONNECTIONS_YEARS[year][occupationStart][occupationEnd] > 0) {
                    customLinks.push({
                        source: occupationStart + SOURCE_OFFSET,
                        target: occupationEnd + TARGET_OFFSET,
                        value: CONNECTIONS_YEARS[year][occupationStart][occupationEnd],
                    });
                }
            }
        }
    }
}