/**
 * Initialize Sankey
 */
function initSankey() {
    /*simple initialisation of the sankey, should explain itself*/

    svg = d3.select("svg"),
        width = +svg.attr("width") - 2*marginleft,
        height = +svg.attr("height") - margintop;

    formatNumber = d3.format(",.0f"),
        format = function (d) { return formatNumber(d) + " %"; },
        color = d3.scaleOrdinal(d3.schemeCategory10);

    sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[1, 1], [width - 1, height - 6]])
        .iterations(0);

    t = d3.transition()
        .duration(1500)
        .ease(d3.easeLinear);

    //set attributes for all links
    titleGroup = svg.append("g")
        .attr("class", "titles")
        .attr("font-family", "sans-serif")
        .attr("font-size", "150%");

    diagram= svg.append("g")
        .attr("class", "sankey")
        .attr("transform", "translate(" + marginleft + "," + margintop + ")");

    linkGroup = diagram.append("g")
        .attr("class", "links")
        .attr("fill", "none");
        //.attr("stroke", "#000")
        //.attr("stroke-opacity", 0.2);

    //set attributes for all nodes
    nodeGroup = diagram.append("g")
        .attr("class", "nodes")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);
}

/**
 * for the filtering and transition by selecting a filter we need to update the sankey and "draw" it new
 * */
function updateSankey() {
    flush();
    filter();
    calculateLinks();
    switch (lang)
    {
        case "ger":
            d3.json("data/labels_2nd-cohort-de.json", helper);
            break;
        case "eng":
            d3.json("data/labels_2nd-cohort-en.json", helper);
            break;
        default:
            d3.json("data/labels_2nd-cohort-de.json", helper);
    }
}

/**
 * Reset Array for link size calculation, we logically need to do this to calculate the links new
 */
function flush() {
    const TOT_NUM_NODES = 29
    // needs to be changed if more nodes are implemented
    customLinks = [];
    for (i = 0; i < TOT_NUM_NODES; i++) {
        for (j = 0; j < TOT_NUM_NODES; j++) {
            linkSize[i][j] = 0;
        }
    }

    columnCoord = [];
}

/**
 * is used for the years "title" above the nodes in the sankey, remove all excess x position, so that the array has only
 * from each other differently x positions and remove the doubles
 * */
function filterArray(array) {
    var filtered = [];
    $.each(array, function(i, el){
        if($.inArray(el, filtered) === -1) filtered.push(el);
    });

    for (var i = 0; i<filtered.length; i++)
    {
        filtered[i] += marginleft;
    }
    return filtered;
}

/**
 *  the main function for "drawing" the saneky, takes the customLinks that where calculated and returns the saneky
 * */
function helper(error, labels) {
    if (error)
        throw error;
    labels.links = customLinks;
    sankey(labels);
    var links = linkGroup.selectAll('path')
        .data(labels.links);

    //Set attributes for each link separately
    links.enter().append("g")
        .attr("id",function (d,i) {return "path"+i;})
        .attr("from",function (d) { return d.source.name; })
        .attr("to",function (d) { return d.target.name; })
        .append("path")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.15)
        .attr("display", function (d) {
            /* don't display a link if the link is smaller than 4%, else it will be just displayed*/
            if(d.value < guillotine){return "none";}
            else{return "inline";}
        })
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", function (d) {return Math.max(1, d.width); })
        .attr("onmouseover",function (d,i) { return "appendGradient(" + i + ")" })
        .attr("onmouseout",function (d,i) { return "removeGradient(" + i + ")" })
        .append("title")
        .text(function (d) {
            //tooltip info for the links
            return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

    linkGroup.selectAll("g").transition(t)
        .attr("id",function (d,i) {return "path"+i;})
        .attr("from",function (d) { return d.source.name; })
        .attr("to",function (d) { return d.target.name; });

    links.transition(t)
        //.attr("from",function (d) { return d.source.name; })
        //.attr("to",function (d) { return d.target.name; })
        //.attr("onmouseover",function (d,i) { return "appendGradient(" + i + ")" })
        //.attr("onmouseout",function (d,i) { return "removeGradient(" + i + ")" })
        .attr("display", function (d) {
            //again if the link is smaller than 4% don't display it, we have to do this method again because of the
            // transition, if another filter is selected
            if(d.value < guillotine){return "none";}
            else{return "inline";}
        })
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", function (d) { return Math.max(1, d.width); })
        .select('title')
        .text(function (d) {
            //same argumentation as above, we need the method again for the transition
            return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

    //remove the unneeded links
    links.exit().remove();

    var nodes = nodeGroup.selectAll('.node')
        .data(labels.nodes);

    var nodesEnter = nodes.enter()
        .append("g")
        .attr('class', 'node');

    //set attributes for each node separately
    nodesEnter.append("rect")
        .attr("x", function (d) { return d.x0; })
        .attr("y", function (d) { return d.y0; })
        .attr("height", function (d) { return d.y1 - d.y0; })
        .attr("width", function (d) {
            var width = d.x1 - d.x0;
            if(d.value > 0)
            {
                //this is used for the years above the nodes, every x position of all nodes is pushed in an array
                columnCoord.push(d.x0 + width/2);
            }
            return width;
        })
        .attr("fill", setColor)
        .attr("stroke", "#000")
        .attr("fill-opacity", 0.5)

    //specify Pop-Up when hovering over node
    nodesEnter.append("title")
        .text(function (d) { return d.name + "\n" + format(d.value); });

    //Update selection
    var nodesUpdate = nodes.transition(t);

    //same as the links we have to state the methods again in the update
    nodesUpdate.select("rect")
        .attr("y", function (d) { return d.y0; })
        .attr("x", function (d) { return d.x0; })
        .attr("height", function (d) { return d.y1 - d.y0; });

    nodesUpdate.select("title")
        .text(function (d) { return d.name + "\n" + format(d.value); });

    //Exit selection
    nodes.exit().remove();

    //we filter all arrays
    columnCoord = filterArray(columnCoord);
    if(!titlesDrawn)
    {
        drawTitles();
        titlesDrawn = true;
    }
}

/**
 * Drawing the years above the sankey
 * */
function drawTitles() {

    var titles = titleGroup.selectAll('.titles')
        .data(years);

    var titlesEnter = titles.enter()
        .append("g")
        .attr('class', 'title');

    /* give the years a specific x position, to expand it just add in setup another year in the variable years like 2019
     * and write a switch statement for "2019" with the next index which would logically be columnCoord[10]
     *
     * the titles have NO transition because they only need to be drawn once!
     * */
    titlesEnter.append('text')
        .attr("x", function (d) {
            switch (d)
            {
                case "2016":
                    return columnCoord[0];
                case "2017":
                    return columnCoord[1];
                case "2018":
                    return columnCoord[2];
                default:
                    return 0;
            }
        })
        .attr("y", 10)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function (d) {
            return d;
        });

    /*
     * If a title has the x position 0 (in this case it would be 10) in the sankey, it is in the wrong place
     * because it has not a position from a columnCoord, so we have to remove it, because if not it would appear
     * in the left upper corner
     */
    svg.selectAll('.title')
        .selectAll('text')
        .filter(function (d, i, q) {
            return q[0].attributes[0].nodeValue == 10;
        })
        .remove();
}


/**
 * Set the color of each node
 * @param d the node
 */
function setColor(d) {

    /* the colors are specified in the setup!*/
    //set colors for german labels
    if(lang == "ger")
    {
        switch(d.name)
        {
            case "Obligatorische Schule":
                return ;
            case "Nicht in Ausbildung":
                return nicht_in_ausbildung;
             case "Praktikum":
                return praktikum;
            case "10. Schuljahr":
                 return zehntes_schuljahr;
            case "Zwischenlösung":
                return zwischenloesung;
            case "Nicht in Ausbildung":
                return nicht_in_ausbildung;
            case "Berufsausbildung: 2 jährig":
                return berufsausbildung_2jahre;
            case "Berufsausbildung: 3-4 jährig":
                 return berufsausbildung_34jahre;
            case "BBerufsmaturität":
                return berufsmaturitaet;
            case "allgemeine Weiterbildung":
                return allgemeinbildende_Schule;
                case "Bandere Lösungen":
                    return andere_loesung;
            default:
                return notsure;
        }
    }
}

function appendGradient(id){
    var pathGroup = svg.select('#path' + id);
    var path = pathGroup.select("path");

    var from = document.getElementById("path" + id).__data__.source;
    var to = document.getElementById("path" + id).__data__.target;


    var pathGradient = pathGroup.append("defs")
        .append("linearGradient")
        .attr("id","grad" + id)
        .attr("gradientUnit","userSpaceOnUse")
        .attr("style","mix-blend-mode: multiply;")
        .attr("x1","0%")
        .attr("x2","100%")
        .attr("y1","0%")
        .attr("y2","0%");

    pathGradient.append("stop")
        .attr("class","from")
        .attr("offset","0%")
        .attr("style", function () {
            var color = setColor(from);
            return "stop-color:" + color + ";stop-opacity:1";
        });

    pathGradient.append("stop")
        .attr("class","to")
        .attr("offset","100%")
        .attr("style",function () {
            var color = setColor(to);
            return "stop-color:" + color + ";stop-opacity:1";
        });

    path.attr("stroke","url(#grad"+id+")")
        .attr("stroke-opacity","0.95");

/*
    pathGradient.transition(t).select(".from")
        .attr("style", function (d) {
            var color = setColor(d.source);
            return "stop-color:" + color + ";stop-opacity:1";
        });
    pathGradient.transition(t).select(".to")
        .attr("style",function (d) {
            var color = setColor(d.target);
            return "stop-color:" + color + ";stop-opacity:1";
        });
*/
}

function removeGradient(id){
    pathGroup = svg.select('#path' + id);
    var path = pathGroup.select("path");

    var pathGradient = pathGroup.select("defs")
        .remove();

    path.attr("stroke","#000")
        .attr("stroke-opacity","0.15");

}

function setGradientColor(bla) {

}

/**
 * Updates the selection state of checkboxes based on the user's input.
 * If the 'all' checkbox is selected, all other checkboxes will be deselected.
 * If another checkbox is selected, the 'all' checkbox will be deselected.
 * 
 * @param checkbox The checkbox that was just clicked
 * @author Jeremy Moser
 * @since 08.05.2023
 */
function updateSelections(checkbox) {
    const allCheckbox = document.getElementById('cb13');
    const checkboxes = document.querySelectorAll('input[type=checkbox][class=cb]:not(#cb13)');

    let areAllChecked = true;      // Are all checkboxes (exept the all checkbox) checked?
    let areAllUnchecked = true;    // Are all checkboxes (exept the all checkbox) unchecked?

    if(checkbox === allCheckbox){
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
        });
        allCheckbox.disabled = true;
    }
    else{
        // Check if all are either checked or unchecked
        checkboxes.forEach((checkbox) => {
            if(checkbox.checked){
                areAllUnchecked = false;
            }
            else{
                areAllChecked = false;
            }
        });
        
        // If all checkboxes are checked just check the all checkbox and uncheck the others
        /**
        if(areAllChecked){
            allCheckbox.checked = true;
            // Uncheck all the boxes
            checkboxes.forEach((checkbox) => {
                checkbox.checked = false;
            });
        }else 
         */
        // If all checkboxes are unchecked just check the all checkbox
        if(areAllUnchecked){
            allCheckbox.checked = true;
            allCheckbox.disabled = true;
        }
        // Uncheck 'all' checkbox if another checkbox is selected
        else {
            allCheckbox.checked = false;
            allCheckbox.disabled = false;
        }
    }
}