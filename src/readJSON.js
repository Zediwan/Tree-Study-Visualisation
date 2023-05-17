
/**
 read json and convert information into Array of Person Objects.
 call callback function in the end since this function is asynchronous
 */
 function readData(callback) {
    //Read json and store data in array
    $(function () {
        $.getJSON('data/data_nolable.json', function (data) {
            $.each(data.person, function () {
                jsonData.push(this);
            });
            callback();
        });
    });
}