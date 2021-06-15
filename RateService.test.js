const assert = require('assert');
const Rate = require('./RateService');
const {
    CountryRate,
    getDate,
    verifyDuplicateRow,
    includes,
    sortRateData,
    chopArray,
    compareDate,
    inBetween,
    getRateBasedOnCountryCode,
    verifyOverlappingDate,
    verifyMissingDays,
    getDateDifference
} = Rate

const originalData = [
    new CountryRate("AU", getDate("2021-08-03"), getDate("9999-01-01")),
    new CountryRate("AU", getDate("2021-06-01"), getDate("9999-01-01")),
    new CountryRate("AU", getDate("2021-08-01"), getDate("9999-01-01"))
];

const sorted = [
    new CountryRate("AU", getDate("2021-06-01"), getDate("9999-01-01")),
    new CountryRate("AU", getDate("2021-08-01"), getDate("9999-01-01")),
    new CountryRate("AU", getDate("2021-08-03"), getDate("9999-01-01")),
];

expect("sortRateData return new sorted array and keep the original array state", () => {
    const keptOriginalData = new Array().concat(originalData);//create copy of new data
    assert.deepStrictEqual(sorted, sortRateData(originalData));
    assert.deepStrictEqual(originalData, keptOriginalData);
});

expect("includes to return 0 (included item's index)", () => {
    const newData = new CountryRate("AU", getDate("2021-08-03"), getDate("9999-01-01"));
    const duplicateData = [...originalData, newData]
    assert.strictEqual(includes(duplicateData, newData), 0);
});

expect("chopArray to return new array from original array with new desired index only", () => {
    const desiredArray = [
        new CountryRate("AU", getDate("2021-06-01"), getDate("9999-01-01")),
        new CountryRate("AU", getDate("2021-08-01"), getDate("9999-01-01"))
    ];
    assert.deepStrictEqual(desiredArray, chopArray(originalData, 1, 2));
});

expect("chopArray to throw error when given out of bound index & length", () => {
    assert.throws(() => {
        chopArray(originalData, 1, 3);
    });
});

expect("verifyDuplicateRow to return index of duped item", () => {
    const duplicateRowArray = [...originalData, new CountryRate("AU", getDate("2021-08-01"), getDate("9999-01-01"))];
    const desiredDupedResult = {
        isDupe: true,
        index: 2
    }
    assert.deepStrictEqual(desiredDupedResult, verifyDuplicateRow(duplicateRowArray));
});

expect("compareDate to return correct value when given different inputs", () => {
    const date1 = getDate("2021-01-01");
    const date2 = getDate("2022-06-30");
    const date3 = getDate("2021-01-01");
    const date4 = getDate("2023-01-01");
    assert.strictEqual(compareDate(date1, date2), -1);
    assert.strictEqual(compareDate(date1, date3), 0);
    assert.strictEqual(compareDate(date4, date2), 1);
});

expect("inBetween return true and false given the correct data", () => {
    const date1 = getDate("2021-01-01");
    const date2 = getDate("2022-06-30");
    const date3 = getDate("2020-06-01");
    const date4 = getDate("2020-05-31");
    const date5 = getDate("2021-12-15");
    const startDate = getDate("2020-06-01");
    const endDate = getDate("2021-12-15");
    assert.strictEqual(inBetween(date1, startDate, endDate), true);
    assert.strictEqual(inBetween(date2, startDate, endDate), false);
    assert.strictEqual(inBetween(date3, startDate, endDate), true);
    assert.strictEqual(inBetween(date4, startDate, endDate), false);
    assert.strictEqual(inBetween(date5, startDate, endDate), true);
});

expect("groupRateBasedOnCountryCode to return rate object grouped by country code", () => {
    const indonesiaRate = [
        new CountryRate("ID", getDate("2021-08-03"), getDate("9999-01-01")),
        new CountryRate("ID", getDate("2021-06-01"), getDate("9999-01-01")),
        new CountryRate("ID", getDate("2021-08-01"), getDate("9999-01-01"))
    ];
    const malaysiaRate = [
        new CountryRate("MY", getDate("2021-08-03"), getDate("9999-01-01")),
        new CountryRate("MY", getDate("2021-06-01"), getDate("9999-01-01")),
        new CountryRate("MY", getDate("2021-08-01"), getDate("9999-01-01"))
    ];
    const mixedCountryRate = [
        new CountryRate("NZ", getDate("2021-08-03"), getDate("9999-01-01")),
        new CountryRate("US", getDate("2021-06-01"), getDate("9999-01-01")),
        new CountryRate("UK", getDate("2021-08-01"), getDate("9999-01-01"))
    ]
    const testData = [...originalData, ...indonesiaRate, ...malaysiaRate, ...mixedCountryRate];
    assert.deepStrictEqual(getRateBasedOnCountryCode(testData, "ID"), indonesiaRate);
    assert.deepStrictEqual(getRateBasedOnCountryCode(testData, "MY"), malaysiaRate);
    assert.deepStrictEqual(getRateBasedOnCountryCode(testData, "NZ"), [new CountryRate("NZ", getDate("2021-08-03"), getDate("9999-01-01"))]);
});

expect("verifyOverlappingDate to return array of overlapping data when given overlapping date", () => {
    const indonesiaRate = [
        new CountryRate("ID", getDate("2021-08-03"), getDate("9999-01-01")),
        new CountryRate("ID", getDate("2021-06-01"), getDate("9999-01-01")),
        new CountryRate("ID", getDate("2021-08-01"), getDate("9999-01-01"))
    ];
    assert.strictEqual(verifyOverlappingDate(indonesiaRate).length, 2);
});

expect("verifyOverlappingDate to return empty array when given valid date", () => {
    const indonesiaRate = [
        new CountryRate("ID", getDate("2021-08-03"), getDate("9999-01-01")),
        new CountryRate("ID", getDate("2021-06-01"), getDate("2021-07-31")),
        new CountryRate("ID", getDate("2021-08-01"), getDate("2021-08-02"))
    ];
    assert.notStrictEqual(verifyOverlappingDate(indonesiaRate), []);
});

expect("getDateDifference to return the correct amount of days", () => {
    const date1 = getDate("2021-01-05");
    const date2 = getDate("2021-01-20");
    const date3 = getDate("2021-01-20");
    const date4 = getDate("2021-06-30");
    const date5 = getDate("2021-07-01");
    assert.strictEqual(getDateDifference(date2, date1), 15);
    assert.strictEqual(getDateDifference(date3, date2), 0);
    assert.strictEqual(getDateDifference(date5, date4), 1);
});

expect("verifyMissingDays to return row that has missing days with it's subsequent row", () => {
    const indonesiaRate = [
        new CountryRate("ID", getDate("2021-08-03"), getDate("9999-01-01")),
        new CountryRate("ID", getDate("2021-06-01"), getDate("2021-08-02")),
    ];

    const malaysiaRate = [
        new CountryRate("MY", getDate("2021-12-03"), getDate("9999-01-01")),
        new CountryRate("MY", getDate("2021-02-01"), getDate("2021-07-06")),
        new CountryRate("MY", getDate("2021-08-01"), getDate("2021-12-01"))
    ];
    const testDate = [...indonesiaRate, ...malaysiaRate];
    const missingDaysResult = verifyMissingDays(testDate);
    assert.notDeepStrictEqual(missingDaysResult.length, 0);
    assert.deepStrictEqual(missingDaysResult, [
        {
            date: new CountryRate("MY", getDate("2021-02-01"), getDate("2021-07-06")),
            subsequentDate: new CountryRate("MY", getDate("2021-08-01"), getDate("2021-12-01")),
            missingDays: 26
        },
        {
            date: new CountryRate("MY", getDate("2021-08-01"), getDate("2021-12-01")),
            subsequentDate: new CountryRate("MY", getDate("2021-12-03"), getDate("9999-01-01")),
            missingDays: 2
        }
    ])
});


//wrapper test function
function expect(expectation, assertion) {
    try {
        assertion();
        console.info(`[PASS] expect ${expectation}`);
    } catch (error) {
        if (error.code == 'ERR_ASSERTION') {
            console.info(`[FAIL] expect ${expectation}`);
            console.error(error.message);
        } else {
            console.error(error)
        }
    }
}