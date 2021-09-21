

function getPulseData() {
    var request = new XMLHttpRequest();
    request.open("GET", "../res/scrubbedData.json", false);
    request.send(null)
    var my_JSON_object = JSON.parse(request.responseText);
    return my_JSON_object;
}
