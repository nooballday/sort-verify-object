class CountryRate {
    countryCode;
    activeDate;
    endDate;

    constructor(countryCode, activeDate, endDate) {
        this.countryCode = countryCode;
        this.activeDate = activeDate;
        this.endDate = endDate;
    }
}

function getDate(date) {
    return new Date(date);
}

//return true with index if there is duplicate, otherwise return false
function verifyDuplicateRow(listOfRate) {
    let dupeResult = {
        isDupe: false,
        index: -1
    }
    const dataLength = listOfRate.length;
    for (let i = 0; i < dataLength; i++) {
        const item = listOfRate[i]
        const arrayToCheck = chopArray(listOfRate, i + 1, dataLength - (i + 1));
        const includeResult = includes(arrayToCheck, item);
        if (includeResult != -1) {
            dupeResult.isDupe = true;
            dupeResult.index = i;
            break;
        }
    }
    return dupeResult;
}

//from index start to index finish of an array 
function chopArray(array, start, length) {
    const arrayLength = array.length;
    if (start < 0 || start + length > arrayLength) throw new Error("RateService : createNewArray start or finish out of bound");
    const newArray = []
    for (let i = start; i < start + length; i++) newArray.push(array[i]);
    return newArray;
}

function verifyOverlappingDate(listOfRate) {
    const overlappedRow = [];
    const groupedRateByCountryCode = getRateBasedOnCountryCode(listOfRate);
    for (let rate in groupedRateByCountryCode) {
        const rowOfEachCountry = sortRateData(groupedRateByCountryCode[rate]);
        for (let index = 0; index < rowOfEachCountry.length - 1; index++) {
            const row = rowOfEachCountry[index];
            const nextRow = rowOfEachCountry[index + 1];
            if (compareDate(row.endDate, nextRow.activeDate) >= 0) {
                overlappedRow.push({
                    data: row,
                    overlapWith: nextRow
                })
            }
        }
    }
    return overlappedRow;
}

function verifyMissingDays(listOfRate) {
    const missingDays = [];
    const groupedRateByCountryCode = getRateBasedOnCountryCode(listOfRate);
    for (let rate in groupedRateByCountryCode) {
        const rowOfEachCountry = sortRateData(groupedRateByCountryCode[rate]);
        for (let index = 0; index < rowOfEachCountry.length - 1; index++) {
            const row = rowOfEachCountry[index];
            const nextRow = rowOfEachCountry[index + 1];
            const daysDifference = getDateDifference(nextRow.activeDate, row.endDate);
            if (daysDifference != 1) {
                missingDays.push({
                    date: row,
                    subsequentDate: nextRow,
                    missingDays: daysDifference
                })
            }
        }
    }
    return missingDays;
}

//return
//difference in days
function getDateDifference(a, b) {
    return Math.ceil((a - b) / (1000 * 60 * 60 * 24));
}

//if given countryCode return an array of rate data
//else return all rate grouped by each country
function getRateBasedOnCountryCode(listOfRate, countryCode) {
    const groupedCountryCode = {};
    listOfRate.forEach(rateObject => {
        if (!groupedCountryCode[rateObject.countryCode]) groupedCountryCode[rateObject.countryCode] = [];
        groupedCountryCode[rateObject.countryCode].push(rateObject);
    });
    return countryCode ? groupedCountryCode[countryCode] : groupedCountryCode;
}

//check if given date is in between the given range
function inBetween(date, start, end) {
    const startComparison = compareDate(date, start);
    const endComparison = compareDate(date, end);
    return startComparison >= 0 && endComparison <= 0;
}

//return sorted list
function sortRateData(list) {
    let listOfRate = new Array().concat(list); //create copy of list to avoid mutating the original list
    let pass = false;
    while (!pass) {
        let iPass = true;
        listOfRate.forEach((_, j) => {
            if (j < listOfRate.length - 1) {
                const date = listOfRate[j].activeDate;
                const nextDate = listOfRate[j + 1].activeDate;
                if (nextDate < date) {
                    swapPosition(listOfRate, j, j + 1);
                    iPass = false;
                }
            }
        })
        pass = iPass
    }
    return listOfRate
}

function compareRateObject(a, b) {
    const c = a.countryCode == b.countryCode;
    const d = isTheSameDate(a.activeDate, b.activeDate);
    const e = isTheSameDate(a.endDate, b.endDate);
    return c && d && e;
}

/**
 * Check if two dates are the same
 * comparing each date property (year, month, date)
 * to make sure it's not comparing hour/minutes/seconds
 * 
 * @param {javascript Date object} a 
 * @param {javascript Date object} b 
 */
function isTheSameDate(a, b) {
    return compareDate(a, b) == 0;
}

//return 
//-1 if a is less than b
//0 if a is equal to b
//1 if a is later than b
function compareDate(a, b) {
    const dateA = new Date(a.getYear(), a.getMonth(), a.getDate()).getTime();
    const dateB = new Date(b.getYear(), b.getMonth(), b.getDate()).getTime();
    return dateA < dateB ? -1 : (dateA == dateB ? 0 : 1);
}

function swapPosition(array, indexA, indexB) {
    const s = array[indexA];
    array[indexA] = array[indexB];
    array[indexB] = s;
}

/**
 * time complexity
 * worst case scenario  O(n^2) <-- bad
 * best case scenario O(1)
 * return the index of included item, otherwise return -1
 * 
 */
function includes(array, item) {
    let isInclude = -1;
    for (let i = 0; i < array.length; i++) {
        if (compareRateObject(array[i], item)) {
            isInclude = i
            break;
        }
    }
    return isInclude;
}

module.exports = {
    getDate,
    verifyDuplicateRow,
    verifyMissingDays,
    verifyOverlappingDate,
    sortRateData,
    CountryRate,
    includes,
    chopArray,
    compareDate,
    inBetween,
    getRateBasedOnCountryCode,
    getDateDifference
}