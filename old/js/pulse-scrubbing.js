function scrubData() {
    var clientDataArr;
    var pulseData = getPulseData();
    var segmentData;

    const myList = pulseData.map(e => e.Segment);
    const unique = [...new Set(myList)];


    clientDataArr = unique.map(e => new PulseData(e, new Array(), new Array()));

    for (var i = 0; i < pulseData.length; i++) {
        var segmentName = pulseData[i]["Segment"];
        for (var j = 0; j < clientDataArr.length; j++) {
            if (clientDataArr[j].client == segmentName) {
                //j.getDate.slice(5)
                clientDataArr[j].segmentDataArr.push(new SegmentData(pulseData[i].date, pulseData[i].score, pulseData[i].size, pulseData[i].client));
            }
        }
        console.log(clientDataArr);
    }

    for (var i = 0; i < clientDataArr.length; i++) {
        clientDataArr[i].score = new Score(clientDataArr[i].segmentDataArr);
        clientDataArr[i].size = new Population(clientDataArr[i].segmentDataArr);
    }
    return clientDataArr;
}

class PulseData {
    constructor(client, segmentDataArr) {
        this.client = client;
        this.name = client;
        this.segmentDataArr = segmentDataArr;
        this.score = new Score();
        this.population = new Population();
    }
}

class SegmentData {
    constructor (date, score, size, client) {
        this.score = score;
        this.date = date;
        this.size = size;
        this.year = this.date.slice(5);
        this.client = client;
    }
}

class Score {
    constructor(segmentDataArr) {
        // For every month, add a date and a score average
        // Sort the array by date
        this.scoreArr = new Array();
        if (segmentDataArr != undefined) {
            segmentDataArr.sort(function (a, b) {
                var aa = a.date.split('/'),
                    bb = b.date.split('/');
                return aa[2] - bb[2] || aa[1] - bb[1] || aa[0] - bb[0];
            });
            for (var i = 0; i < segmentDataArr.length; i++) {
                this.scoreArr.push([segmentDataArr[i].date.slice(5), segmentDataArr[i].score])
            }
        }
    }
}

class Population {
    constructor(segmentDataArr) {
        // For every month, add a date and a score average
        // Sort the array by date
        this.sizeArr = new Array();
        if (segmentDataArr != undefined) {
            segmentDataArr.sort(function (a, b) {
                var aa = a.date.split('/'),
                    bb = b.date.split('/');
                return aa[2] - bb[2] || aa[1] - bb[1] || aa[0] - bb[0];
            });
            for (var i = 0; i < segmentDataArr.length; i++) {
                this.sizeArr.push([segmentDataArr[i].date.slice(5), segmentDataArr[i].size])
            }
        }
    }
}
