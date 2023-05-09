
/**
 read json and convert information into Array of Person Objects.
 call callback function in the end since this function is asynchronous
 */
function readData(callback) {
    //Read json and store data in array
    $(function () {
        $.getJSON('data/t1-t9baumforstudents_random_ID.json', function (data) {
            $.each(data.person, function () {
                jsonData.push(this);
            });
            callback();
        });
    });
}