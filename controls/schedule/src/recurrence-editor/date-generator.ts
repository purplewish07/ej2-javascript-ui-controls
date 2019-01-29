import { isNullOrUndefined, L10n, getDefaultDateObject, getValue, cldrData } from '@syncfusion/ej2-base';
import { MS_PER_DAY, addDays, resetTime } from '../schedule/base/util';
import { CalendarUtil, Islamic, Gregorian, CalendarType } from '../common/calendar-util';

/**
 * Date Generator from Recurrence Rule
 */
export function generateSummary(rule: string, localeObject: L10n, locale: string, calendarMode: string = 'gregorian'): string {
    let ruleObject: RecRule = extractObjectFromRule(rule);
    let summary: string = localeObject.getConstant(EVERY) + ' ';
    let cldrObj: string[];
    let cldrObj1: string[];
    if (locale === 'en' || locale === 'en-US') {
        cldrObj1 = <string[]>(getValue('months.stand-alone.abbreviated', getDefaultDateObject()));
        cldrObj = <string[]>(getValue('days.stand-alone.abbreviated', getDefaultDateObject()));
    } else {
        cldrObj1 =
            <string[]>(getValue('main.' + '' + locale + '.dates.calendars.' + calendarMode + '.months.stand-alone.abbreviated', cldrData));
        cldrObj =
            <string[]>(getValue('main.' + '' + locale + '.dates.calendars.' + calendarMode + '.days.stand-alone.abbreviated', cldrData));
    }
    if (ruleObject.interval > 1) {
        summary += ruleObject.interval + ' ';
    }
    switch (ruleObject.freq) {
        case 'DAILY':
            summary += localeObject.getConstant(DAYS);
            break;
        case 'WEEKLY':
            summary += localeObject.getConstant(WEEKS) + ' ' + localeObject.getConstant(ON) + ' ';
            ruleObject.day.forEach((day: string, index: number) => {
                summary += getValue(DAYINDEXOBJECT[day], cldrObj);
                summary += (((ruleObject.day.length - 1) === index) ? '' : ', ');
            });
            break;
        case 'MONTHLY':
            summary += localeObject.getConstant(MONTHS) + ' ' + localeObject.getConstant(ON) + ' ';
            summary += getMonthSummary(ruleObject, cldrObj, localeObject);
            break;
        case 'YEARLY':
            summary += localeObject.getConstant(YEARS) + ' ' + localeObject.getConstant(ON) + ' ';
            summary += getValue((ruleObject.month[0]).toString(), cldrObj1) + ' ';
            summary += getMonthSummary(ruleObject, cldrObj, localeObject);
            break;
    }
    if (ruleObject.count) {
        summary += ', ' + (ruleObject.count) + ' ' + localeObject.getConstant(TIMES);
    } else if (ruleObject.until) {
        let tempDate: Date = ruleObject.until;
        summary += ', ' + localeObject.getConstant(UNTIL)
            + ' ' + tempDate.getDate()
            + ' ' + getValue((tempDate.getMonth() + 1).toString(), cldrObj1)
            + ' ' + tempDate.getFullYear();
    }
    return summary;
}
function getMonthSummary(ruleObject: RecRule, cldrObj: string[], localeObj: L10n, ): string {
    let summary: string = '';
    if (ruleObject.monthDay.length) {
        summary += ruleObject.monthDay[0];
    } else if (ruleObject.day) {
        let pos: number = ruleObject.setPosition - 1;
        summary += localeObj.getConstant(WEEKPOS[pos > -1 ? pos : (WEEKPOS.length - 1)])
            + ' ' + getValue(DAYINDEXOBJECT[ruleObject.day[0]], cldrObj);
    }
    return summary;
}

export function generate(
    startDate: Date,
    rule: string,
    excludeDate: string,
    startDayOfWeek: number,
    maximumCount: number = MAXOCCURRENCE,
    viewDate: Date = null,
    calendarMode: CalendarType = 'Gregorian'): number[] {
    let ruleObject: RecRule = extractObjectFromRule(rule);
    let cacheDate: Date; calendarUtil = getCalendarUtil(calendarMode);
    let data: number[] = [];
    let modifiedDate: Date = new Date(startDate.getTime());
    if (viewDate && viewDate > startDate && !ruleObject.count) {
        tempViewDate = new Date(new Date(viewDate.getTime()).setHours(0, 0, 0));
    } else {
        tempViewDate = null;
    }
    if (!ruleObject.until && tempViewDate) {
        cacheDate = new Date(tempViewDate.getTime());
        cacheDate.setDate(tempViewDate.getDate() + 42 * (ruleObject.interval));
        ruleObject.until = cacheDate;
    }
    if (ruleObject.until && startDate > ruleObject.until) {
        return data;
    }
    maxOccurrence = maximumCount;
    setFirstDayOfWeek(DAYINDEX[startDayOfWeek]);
    tempExcludeDate = [];
    let tempDate: string[] = isNullOrUndefined(excludeDate) ? [] : excludeDate.split(',');
    tempDate.forEach((content: string) => {
        let parsedDate: Date = getDateFromRecurrenceDateString(content);
        tempExcludeDate.push(new Date(parsedDate.getTime()).setHours(0, 0, 0, 0));
    });
    switch (ruleObject.freq) {
        case 'DAILY':
            dailyType(modifiedDate, ruleObject.until, data, ruleObject);
            break;
        case 'WEEKLY':
            weeklyType(modifiedDate, ruleObject.until, data, ruleObject);
            break;
        case 'MONTHLY':
            monthlyType(modifiedDate, ruleObject.until, data, ruleObject);
            break;
        case 'YEARLY':
            yearlyType(modifiedDate, ruleObject.until, data, ruleObject);
    }
    return data;
}

function getDateFromRecurrenceDateString(recDateString: string): Date {
    return new Date(recDateString.substr(0, 4) +
        '-' + recDateString.substr(4, 2) +
        '-' + recDateString.substr(6, 5) +
        ':' + recDateString.substr(11, 2) +
        ':' + recDateString.substr(13));
}

function excludeDateHandler(data: number[], date: number): void {
    let zeroIndex: number = new Date(date).setHours(0, 0, 0, 0);
    if (tempExcludeDate.indexOf(zeroIndex) === -1 && (!tempViewDate || zeroIndex >= tempViewDate.getTime())) {
        data.push(date);
    }
}

function dailyType(startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    let tempDate: Date = new Date(startDate.getTime());
    let interval: number = ruleObject.interval;
    let expectedCount: Number = ruleObject.count ? ruleObject.count : maxOccurrence;
    let state: boolean;
    let expectedDays: string[] = ruleObject.day;
    while (compareDates(tempDate, endDate)) {
        state = true;
        state = validateRules(tempDate, ruleObject);
        if (state && (expectedDays.indexOf(DAYINDEX[tempDate.getDay()]) > -1 || expectedDays.length === 0)) {
            excludeDateHandler(data, tempDate.getTime());
            if (expectedCount && (data.length + tempExcludeDate.length) >= expectedCount) {
                break;
            }
        }
        tempDate.setDate(tempDate.getDate() + interval);
    }
}
function weeklyType(startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    let tempDate: Date = new Date(startDate.getTime());
    if (!ruleObject.day.length) {
        ruleObject.day.push(DAYINDEX[startDate.getDay()]);
    }
    let interval: number = ruleObject.interval;
    let expectedDays: string[] = ruleObject.day;
    let expectedCount: Number = ruleObject.count ? ruleObject.count : maxOccurrence;
    let weekState: boolean = true;
    let wkstIndex: number;
    let weekCollection: number[][] = [];
    if (expectedDays.length > 1) {
        if (isNullOrUndefined(ruleObject.wkst) || ruleObject.wkst === '') {
            ruleObject.wkst = dayIndex[0];
        }
        wkstIndex = DAYINDEX.indexOf(ruleObject.wkst);
        while (compareDates(tempDate, endDate)) {
            let startDateDiff: number = DAYINDEX.indexOf(DAYINDEX[tempDate.getDay()]) - wkstIndex;
            startDateDiff = startDateDiff === -1 ? 6 : startDateDiff;
            let weekstartDate: Date = addDays(tempDate, -startDateDiff);
            let weekendDate: Date = addDays(weekstartDate, 6);
            let compareTempDate: Date = new Date(tempDate.getTime());
            resetTime(weekendDate);
            resetTime(compareTempDate);
            while (weekendDate >= compareTempDate) {
                if (expectedDays.indexOf(DAYINDEX[tempDate.getDay()]) > -1) {
                    weekCollection.push([tempDate.getTime()]);
                }
                if (expectedCount && (data.length + tempExcludeDate.length) >= expectedCount) {
                    break;
                }
                tempDate.setDate(tempDate.getDate() + 1);
                compareTempDate = new Date(tempDate.getTime());
                resetTime(compareTempDate);
            }
            tempDate.setDate(tempDate.getDate() - 1);
            if (expectedCount && (data.length + tempExcludeDate.length) >= expectedCount) {
                break;
            }
            tempDate.setDate((tempDate.getDate()) + 1 + ((interval - 1) * 7));
            insertWeekCollection(weekCollection, weekState, startDate, endDate, data, ruleObject);
            weekCollection = [];
        }
    } else {
        tempDate = getStartDateForWeek(startDate, ruleObject.day);
        while (compareDates(tempDate, endDate)) {
            weekState = validateRules(tempDate, ruleObject);
            if (weekState && (expectedDays.indexOf(DAYINDEX[tempDate.getDay()]) > -1)) {
                excludeDateHandler(data, tempDate.getTime());
            }
            if (expectedCount && (data.length + tempExcludeDate.length) >= expectedCount) {
                break;
            }
            tempDate.setDate(tempDate.getDate() + (interval * 7));
        }
        insertWeekCollection(weekCollection, weekState, startDate, endDate, data, ruleObject);
        weekCollection = [];
    }
}

function monthlyType(startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    // Set monthday value if BYDAY, BYMONTH and Month day property is not set based on start date
    if (!ruleObject.month.length && !ruleObject.day.length && !ruleObject.monthDay.length) {
        ruleObject.monthDay.push(startDate.getDate());
        if (ruleObject.freq === 'YEARLY') {
            ruleObject.month.push(startDate.getMonth() + 1);
        }
    } else if (ruleObject.month.length > 0 && !ruleObject.day.length && !ruleObject.monthDay.length) {
        ruleObject.monthDay.push(startDate.getDate());
    }
    let ruleType: MonthlyType = validateMonthlyRuleType(ruleObject);
    switch (ruleType) {
        case 'day':
            switch (ruleObject.freq) {
                case 'MONTHLY':
                    monthlyDayTypeProcessforMonthFreq(startDate, endDate, data, ruleObject);
                    break;
                case 'YEARLY':
                    monthlyDayTypeProcess(startDate, endDate, data, ruleObject);
                    break;
            }
            break;
        case 'both':
        case 'date':
            monthlyDateTypeProcess(startDate, endDate, data, ruleObject);
            break;
    }
}

function yearlyType(startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    let typeValue: YearRuleType = checkYearlyType(ruleObject);
    switch (typeValue) {
        case 'MONTH':
            monthlyType(startDate, endDate, data, ruleObject);
            break;
        case 'WEEKNO':
            processWeekNo(startDate, endDate, data, ruleObject);
            break;
        case 'YEARDAY':
            processYearDay(startDate, endDate, data, ruleObject);
            break;
    }
}

function processWeekNo(startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    let stDate: Date = calendarUtil.getYearLastDate(startDate, 0);
    let tempDate: Date;
    let expectedCount: Number = ruleObject.count ? ruleObject.count : maxOccurrence;
    let state: boolean;
    let startDay: number;
    let firstWeekSpan: number;
    let weekNos: number[] = ruleObject.weekNo;
    let weekNo: number;
    let maxDate: number;
    let minDate: number;
    while (compareDates(stDate, endDate)) {
        startDay = dayIndex.indexOf(DAYINDEX[stDate.getDay()]);
        firstWeekSpan = (6 - startDay) + 1;
        for (let index: number = 0; index < weekNos.length; index++) {
            weekNo = weekNos[index];
            weekNo = (weekNo > 0) ? weekNo : 53 + weekNo + 1;
            maxDate = (weekNo === 1) ? firstWeekSpan : firstWeekSpan + ((weekNo - 1) * 7);
            minDate = (weekNo === 1) ? firstWeekSpan - 7 : firstWeekSpan + ((weekNo - 2) * 7);
            while (minDate < maxDate) {
                tempDate = new Date(stDate.getTime() + (MS_PER_DAY * minDate));
                state = validateRules(tempDate, ruleObject);
                if ((tempDate >= startDate) && state && compareDates(tempDate, endDate)) {
                    excludeDateHandler(data, tempDate.getTime());
                    if (expectedCount && (data.length + tempExcludeDate.length) >= expectedCount) {
                        return;
                    }
                }
                minDate++;
            }
        }
        stDate = calendarUtil.getYearLastDate(tempDate, ruleObject.interval);
    }
}

function processYearDay(startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    let stDate: Date = calendarUtil.getYearLastDate(startDate, 0);
    let tempDate: Date;
    let expectedCount: Number = ruleObject.count ? ruleObject.count : maxOccurrence;
    let state: boolean;
    let date: number;
    while (compareDates(stDate, endDate)) {
        for (let index: number = 0; index < ruleObject.yearDay.length; index++) {
            date = ruleObject.yearDay[index];
            tempDate = new Date(stDate.getTime());
            if ((date === calendarUtil.getLeapYearDaysCount() || date === -calendarUtil.getLeapYearDaysCount()) &&
                (!calendarUtil.isLeapYear(calendarUtil.getFullYear(tempDate), 1))) {
                tempDate.setDate(tempDate.getDate() + 1);
                continue;
            }
            tempDate.setDate(tempDate.getDate() + ((date < 0) ?
                calendarUtil.getYearDaysCount(tempDate, 1) + 1 + date : date));
            state = validateRules(tempDate, ruleObject);
            if ((tempDate >= startDate) && state && compareDates(tempDate, endDate)) {
                excludeDateHandler(data, tempDate.getTime());
                if (expectedCount && (data.length + tempExcludeDate.length) >= expectedCount) {
                    return;
                }
            }
        }
        stDate = calendarUtil.getYearLastDate(tempDate, ruleObject.interval);
    }
}

function checkYearlyType(ruleObject: RecRule): YearRuleType {
    if (ruleObject.yearDay.length) {
        return 'YEARDAY';
    } else if (ruleObject.weekNo.length) {
        return 'WEEKNO';
    }
    return 'MONTH';
}

function monthlyDateTypeProcess(startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    let tempDate: Date = new Date(startDate.getTime());
    let mainDate: Date = new Date(startDate.getTime());
    let expectedCount: Number = ruleObject.count ? ruleObject.count : maxOccurrence;
    let interval: number = ruleObject.interval;
    let monthInit: number = 0;
    let date: number;
    let state: boolean;
    let beginDate: Date;
    tempDate = calendarUtil.getMonthStartDate(tempDate);
    mainDate = calendarUtil.getMonthStartDate(mainDate);
    if (ruleObject.month.length) {
        calendarUtil.setMonth(tempDate, ruleObject.month[0], 1);
    }
    while (compareDates(tempDate, endDate)) {
        beginDate = new Date(tempDate.getTime());
        for (let index: number = 0; index < ruleObject.monthDay.length; index++) {
            tempDate = calendarUtil.getMonthStartDate(tempDate);
            date = ruleObject.monthDay[index];
            let maxDate: number = calendarUtil.getMonthDaysCount(tempDate);
            date = date > 0 ? date : (maxDate + date + 1);
            if ((date > 0) && validateProperDate(tempDate, date, mainDate)) {
                calendarUtil.setDate(tempDate, date);
                if (endDate && tempDate > endDate) {
                    return;
                }
                state = validateRules(tempDate, ruleObject);
                if ((tempDate >= startDate) && state && compareDates(tempDate, endDate)) {
                    excludeDateHandler(data, tempDate.getTime());
                    if (expectedCount && (data.length + tempExcludeDate.length) >= expectedCount) {
                        return;
                    }
                }
            }
        }
        monthInit = setNextValidDate(tempDate, ruleObject, monthInit, interval, beginDate);
    }
}

function setNextValidDate(tempDate: Date, ruleObject: RecRule, monthInit: number, interval: number, beginDate: Date = null): number {
    let monthData: number = beginDate ? beginDate.getMonth() : 0;
    let startDate: Date = calendarUtil.getMonthStartDate(tempDate);
    tempDate.setFullYear(startDate.getFullYear());
    tempDate.setMonth(startDate.getMonth());
    tempDate.setDate(startDate.getDate());
    if (ruleObject.month.length) {
        monthInit++;
        monthInit = monthInit % ruleObject.month.length;
        calendarUtil.setMonth(tempDate, ruleObject.month[monthInit], 1);
        if (monthInit === 0) {
            calendarUtil.addYears(tempDate, interval, ruleObject.month[0]);
        }
    } else {
        if (beginDate && (beginDate.getFullYear() < tempDate.getFullYear())) {
            monthData = tempDate.getMonth() - 1;
        }
        calendarUtil.setValidDate(tempDate, interval, 1, monthData, beginDate);
    }
    return monthInit;
}

// To get month collection when BYDAY property having more than one value in list.
function getMonthCollection
    (startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    let expectedDays: string[] = ruleObject.day;
    let tempDate: Date = new Date(startDate.getTime());
    tempDate = calendarUtil.getMonthStartDate(tempDate);
    let interval: number = ruleObject.interval;
    let monthCollection: number[][] = [];
    let dateCollection: number[][] = [];
    let dates: number[] = [];
    let index: number;
    let state: boolean;
    let expectedCount: Number = ruleObject.count ? ruleObject.count : maxOccurrence;
    let monthInit: number = 0;
    let beginDate: Date;
    if (ruleObject.month.length) {
        calendarUtil.setMonth(tempDate, ruleObject.month[0], 1);
    }
    tempDate = getStartDateForWeek(tempDate, ruleObject.day);
    while (compareDates(tempDate, endDate)
        && (expectedCount && (data.length + tempExcludeDate.length) < expectedCount)) {
        let currentMonthDate: Date = new Date(tempDate.getTime());
        let isHavingNumber: boolean[] = expectedDays.map((item: string) => HASNUMBER.test(item));
        if (isHavingNumber.indexOf(true) > -1) {
            for (let j: number = 0; j <= expectedDays.length - 1; j++) {
                let expectedDaysArray: string[] = expectedDays[j].match(SPLITNUMBERANDSTRING);
                let position: number = parseInt(expectedDaysArray[0], 10);
                tempDate = new Date(tempDate.getTime());
                tempDate = calendarUtil.getMonthStartDate(tempDate);
                tempDate = getStartDateForWeek(tempDate, expectedDays);
                currentMonthDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
                while (calendarUtil.isSameYear(currentMonthDate, tempDate) && calendarUtil.isSameMonth(currentMonthDate, tempDate)) {
                    if (expectedDaysArray[expectedDaysArray.length - 1] === DAYINDEX[currentMonthDate.getDay()]) {
                        monthCollection.push([currentMonthDate.getTime()]);
                    }
                    currentMonthDate.setDate(currentMonthDate.getDate() + (1));
                }
                currentMonthDate.setDate(currentMonthDate.getDate() - (1));
                if (expectedDaysArray[0].indexOf('-') > -1) {
                    index = monthCollection.length - (-1 * position);
                } else {
                    index = position - 1;
                }
                index = isNaN(index) ? 0 : index;
                if (monthCollection.length > 0) {
                    (ruleObject.setPosition === null) ?
                        insertDatasIntoExistingCollection(monthCollection, index, state, startDate, endDate, data, ruleObject) :
                        dateCollection = [(filterDateCollectionByIndex(monthCollection, index, dates))];
                }
                if (expectedCount && (data.length + tempExcludeDate.length) >= expectedCount) {
                    return;
                }
                monthCollection = [];
            }
            if (ruleObject.setPosition !== null) {
                insertDateCollectionBasedonBySetPos(dateCollection, state, startDate, endDate, data, ruleObject);
                dates = [];
            }
            monthInit = setNextValidDate(tempDate, ruleObject, monthInit, interval, beginDate);
            tempDate = getStartDateForWeek(tempDate, ruleObject.day);
            monthCollection = [];
        } else {
            let weekCollection: number[] = [];
            let dayCycleData: { [key: string]: number } = processWeekDays(expectedDays);
            currentMonthDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
            let initialDate: Date = new Date(tempDate.getTime());
            beginDate = new Date(tempDate.getTime());
            while (calendarUtil.isSameMonth(initialDate, tempDate)) {
                weekCollection.push(tempDate.getTime());
                if (expectedDays.indexOf(DAYINDEX[tempDate.getDay()]) > -1) {
                    monthCollection.push(weekCollection);
                    weekCollection = [];
                }
                tempDate.setDate(tempDate.getDate()
                    + dayCycleData[DAYINDEX[tempDate.getDay()]]);
            }
            index = ((ruleObject.setPosition < 1) ? (monthCollection.length + ruleObject.setPosition) : ruleObject.setPosition - 1);
            if (ruleObject.setPosition === null) {
                index = 0;
                let datas: number[] = [];
                for (let week: number = 0; week < monthCollection.length; week++) {
                    for (let row: number = 0; row < monthCollection[week].length; row++) {
                        datas.push(monthCollection[week][row]);
                    }
                }
                monthCollection = [datas];
            }
            if (monthCollection.length > 0) {
                insertDatasIntoExistingCollection(monthCollection, index, state, startDate, endDate, data, ruleObject);
            }
            if (expectedCount && (data.length + tempExcludeDate.length) >= expectedCount) {
                return;
            }
            monthInit = setNextValidDate(tempDate, ruleObject, monthInit, interval, beginDate);
            tempDate = getStartDateForWeek(tempDate, ruleObject.day);
            monthCollection = [];
        }
    }
}

// To process monday day type for FREQ=MONTHLY
function monthlyDayTypeProcessforMonthFreq(startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    let expectedDays: string[] = ruleObject.day;
    // When BYDAY property having more than 1 value.
    if (expectedDays.length > 1) {
        getMonthCollection(startDate, endDate, data, ruleObject);
        return;
    }
    let tempDate: Date = new Date(startDate.getTime());
    let expectedCount: Number = ruleObject.count ? ruleObject.count : maxOccurrence;
    let interval: number = ruleObject.interval;
    let state: boolean;
    let monthCollection: number[][] = [];
    let month: number;
    let index: number;
    let beginDate: Date;
    let monthInit: number = 0;
    tempDate = calendarUtil.getMonthStartDate(tempDate);
    if (ruleObject.month.length) {
        calendarUtil.setMonth(tempDate, ruleObject.month[0], 1);
    }
    tempDate = getStartDateForWeek(tempDate, ruleObject.day);
    while (compareDates(tempDate, endDate) && (expectedCount && (data.length + tempExcludeDate.length) < expectedCount)) {
        month = tempDate.getMonth();
        beginDate = new Date(tempDate.getTime());
        let currentMonthDate: Date = new Date(tempDate.getTime());
        while (calendarUtil.isSameMonth(tempDate, currentMonthDate)) {
            monthCollection.push([currentMonthDate.getTime()]);
            currentMonthDate.setDate(currentMonthDate.getDate() + (7));
        }
        index = ((ruleObject.setPosition < 1) ? (monthCollection.length + ruleObject.setPosition) : ruleObject.setPosition - 1);
        if (ruleObject.setPosition === null) {
            let recurrenceCollections: ProcessCollectionForEmptyBySetPos;
            recurrenceCollections = getRecurrenceCollection(monthCollection, expectedDays);
            monthCollection = recurrenceCollections.monthCollection;
            index = recurrenceCollections.index;
        }
        if (monthCollection.length > 0) {
            insertDatasIntoExistingCollection(monthCollection, index, state, startDate, endDate, data, ruleObject);
        }
        monthInit = setNextValidDate(tempDate, ruleObject, monthInit, interval, beginDate);
        tempDate = getStartDateForWeek(tempDate, ruleObject.day);
        monthCollection = [];
    }
}

// To process monday day type for FREQ=YEARLY
function monthlyDayTypeProcess(startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    let expectedDays: string[] = ruleObject.day;
    let isHavingNumber: boolean[] = expectedDays.map((item: string) => HASNUMBER.test(item));
    // If BYDAY property having more than 1 value in list
    if (expectedDays.length > 1 && isHavingNumber.indexOf(true) > -1) {
        processDateCollectionforByDayWithInteger(startDate, endDate, data, ruleObject);
        return;
    }
    let tempDate: Date = new Date(startDate.getTime());
    let index: number;
    let currentMonthDate: Date;
    let expectedCount: Number = ruleObject.count ? ruleObject.count : maxOccurrence;
    let interval: number = ruleObject.interval;
    let state: boolean;
    let monthCollection: number[][] = [];
    if (ruleObject.month.length) {
        calendarUtil.setMonth(tempDate, ruleObject.month[0], tempDate.getDate());
        let compareTempDate: Date = new Date(tempDate.getTime());
        resetTime(compareTempDate);
    }
    // Set the date as start date of the yeear if yearly freq having ByDay property alone
    if (ruleObject.setPosition === null && ruleObject.month.length === 0 && ruleObject.weekNo.length === 0) {
        tempDate = new Date(startDate.getFullYear(), 0, 1);
    }
    tempDate = calendarUtil.getMonthStartDate(tempDate);
    tempDate = getStartDateForWeek(tempDate, ruleObject.day);
    while (compareDates(tempDate, endDate)) {
        currentMonthDate = new Date(tempDate.getTime());
        while (calendarUtil.isSameYear(currentMonthDate, tempDate) &&
            (expectedCount && (data.length + tempExcludeDate.length) <= expectedCount)) {
            currentMonthDate = new Date(tempDate.getTime());
            while (calendarUtil.isSameYear(currentMonthDate, tempDate)) {
                if (ruleObject.month.length === 0 || (ruleObject.month.length > 0
                    && !calendarUtil.checkMonth(tempDate, ruleObject.month))) {
                    if (expectedDays.length > 1) {
                        if (calendarUtil.compareMonth(currentMonthDate, tempDate)) {
                            calendarUtil.setValidDate(tempDate, 1, 1);
                            tempDate = getStartDateForWeek(tempDate, ruleObject.day);
                            break;
                        }
                        if (expectedDays.indexOf(DAYINDEX[currentMonthDate.getDay()]) > -1) {
                            monthCollection.push([currentMonthDate.getTime()]);
                        }
                        currentMonthDate.setDate(currentMonthDate.getDate() + (1));
                    } else {
                        // If BYDAY property having 1 value in list
                        if (currentMonthDate.getFullYear() > tempDate.getFullYear()) {
                            calendarUtil.setValidDate(tempDate, 1, 1);
                            tempDate = getStartDateForWeek(tempDate, ruleObject.day);
                            break;
                        }
                        let newstr: string = getDayString(expectedDays[0]);
                        if (DAYINDEX[currentMonthDate.getDay()] === newstr
                            && new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 0)
                            > new Date(startDate.getFullYear())) {
                            monthCollection.push([currentMonthDate.getTime()]);
                        }
                        currentMonthDate.setDate(currentMonthDate.getDate() + (7));
                    }
                } else {
                    calendarUtil.setValidDate(tempDate, 1, 1);
                    tempDate = getStartDateForWeek(tempDate, ruleObject.day);
                    break;
                }
            }
        }
        tempDate = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), currentMonthDate.getDate());
        index = ((ruleObject.setPosition < 1) ? (monthCollection.length + ruleObject.setPosition) : ruleObject.setPosition - 1);
        if (ruleObject.setPosition === null) {
            let recurrenceObject: ProcessCollectionForEmptyBySetPos;
            recurrenceObject = getRecurrenceCollection(monthCollection, expectedDays);
            monthCollection = recurrenceObject.monthCollection;
            index = recurrenceObject.index;
        }
        if (monthCollection.length > 0) {
            insertDatasIntoExistingCollection(monthCollection, index, state, startDate, endDate, data, ruleObject);
        }
        if (calendarUtil.isLastMonth(tempDate)) {
            calendarUtil.setValidDate(tempDate, 1, 1);
            tempDate = getStartDateForWeek(tempDate, ruleObject.day);
        }
        tempDate.setFullYear(tempDate.getFullYear() + interval - 1);
        if (expectedCount && (data.length + tempExcludeDate.length) >= expectedCount) {
            return;
        }
        tempDate = getStartDateForWeek(tempDate, ruleObject.day);
        monthCollection = [];
    }
}

// To process the recurrence rule when BYDAY property having values with integer
function processDateCollectionforByDayWithInteger(startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    let expectedDays: string[] = ruleObject.day;
    let expectedCount: Number = ruleObject.count ? ruleObject.count : maxOccurrence;
    let tempDate: Date = new Date(startDate.getTime());
    let interval: number = ruleObject.interval;
    let monthCollection: number[][] = [];
    let dateCollection: number[][] = [];
    let index: number;
    let state: boolean;
    let monthInit: number = 0;
    let currentMonthDate: Date;
    let currentDate: Date;
    let beginDate: Date;
    tempDate = calendarUtil.getMonthStartDate(tempDate);
    let datas: number[] = [];
    if (ruleObject.month.length) {
        calendarUtil.setMonth(tempDate, ruleObject.month[0], 1);
    }
    tempDate = getStartDateForWeek(tempDate, ruleObject.day);
    while (compareDates(tempDate, endDate)) {
        currentMonthDate = new Date(tempDate.getTime());
        for (let i: number = 0; i <= ruleObject.month.length; i++) {
            for (let j: number = 0; j <= expectedDays.length - 1; j++) {
                tempDate = calendarUtil.getMonthStartDate(tempDate);
                tempDate = getStartDateForWeek(tempDate, ruleObject.day);
                monthCollection = [];
                while (calendarUtil.isSameYear(currentMonthDate, tempDate) &&
                    (expectedCount && (data.length + tempExcludeDate.length) <= expectedCount)) {
                    while (calendarUtil.isSameYear(currentMonthDate, tempDate)) {
                        currentMonthDate = new Date(tempDate.getTime());
                        if (ruleObject.month.length === 0 ||
                            (ruleObject.month.length > 0 && ruleObject.month[i] === calendarUtil.getMonth(currentMonthDate))) {
                            let expectedDaysArray: string[] = expectedDays[j].match(SPLITNUMBERANDSTRING);
                            let position: number = parseInt(expectedDaysArray[0], 10);
                            currentDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
                            while (calendarUtil.isSameYear(currentDate, tempDate)
                                && calendarUtil.isSameMonth(currentDate, tempDate)) {
                                if (expectedDaysArray[expectedDaysArray.length - 1] === DAYINDEX[currentDate.getDay()]) {
                                    monthCollection.push([currentDate.getTime()]);
                                }
                                currentDate.setDate(currentDate.getDate() + (1));
                            }
                            currentDate.setDate(currentDate.getDate() - (1));
                            if (expectedDaysArray[0].indexOf('-') > -1) {
                                index = monthCollection.length - (-1 * position);
                            } else {
                                index = position - 1;
                            }
                            index = isNaN(index) ? 0 : index;
                        }
                        monthInit = setNextValidDate(tempDate, ruleObject, monthInit, 1, beginDate);
                        tempDate = getStartDateForWeek(tempDate, ruleObject.day);
                    }
                }
                tempDate = j === 0 && currentDate ? new Date(currentDate.getTime()) : new Date(currentMonthDate.getTime());
                if (monthCollection.length > 0) {
                    (ruleObject.setPosition === null) ?
                        insertDatasIntoExistingCollection(monthCollection, index, state, startDate, endDate, data, ruleObject) :
                        dateCollection = [(filterDateCollectionByIndex(monthCollection, index, datas))];
                }
                if (expectedCount && (data.length + tempExcludeDate.length) >= expectedCount) {
                    return;
                }
            }
        }
        if (ruleObject.setPosition !== null) {
            insertDateCollectionBasedonBySetPos(dateCollection, state, startDate, endDate, data, ruleObject);
            datas = [];
        }
        if (calendarUtil.isLastMonth(tempDate)) {
            calendarUtil.setValidDate(tempDate, 1, 1);
            tempDate.setFullYear(tempDate.getFullYear() + interval - 1);
        } else {
            tempDate.setFullYear(tempDate.getFullYear() + interval);
        }
        tempDate = getStartDateForWeek(tempDate, ruleObject.day);
        if (ruleObject.month.length) {
            calendarUtil.setMonth(tempDate, ruleObject.month[0], tempDate.getDate());
        }
    }
}

// To get recurrence collection if BYSETPOS is null
function getRecurrenceCollection(monthCollection: number[][], expectedDays: string[]): ProcessCollectionForEmptyBySetPos {
    let index: number;
    let recurrenceCollectionObject: ProcessCollectionForEmptyBySetPos = {
        monthCollection: [],
        index: 0,
    };
    if (expectedDays.length === 1) {
        // To split numeric value from BYDAY property value
        let expectedDaysArrays: string[] = expectedDays[0].match(SPLITNUMBERANDSTRING);
        let arrPosition: number;
        if (expectedDaysArrays.length > 1) {
            arrPosition = parseInt(expectedDaysArrays[0], 10);
            index = ((arrPosition < 1) ? (monthCollection.length + arrPosition) : arrPosition - 1);
        } else {
            index = 0;
            monthCollection = getDateCollectionforBySetPosNull(monthCollection);
        }
    } else {
        index = 0;
        monthCollection = getDateCollectionforBySetPosNull(monthCollection);
    }
    recurrenceCollectionObject.monthCollection = monthCollection;
    recurrenceCollectionObject.index = index;

    return recurrenceCollectionObject;
}

function
    insertWeekCollection(weekCollection: number[][], state: boolean, startDate: Date, endDate: Date, data: number[], ruleObject: RecRule)
    : void {

    let index: number = ((ruleObject.setPosition < 1) ?
        (weekCollection.length + ruleObject.setPosition) : ruleObject.setPosition - 1);
    if (ruleObject.setPosition === null) {
        index = 0;
        weekCollection = getDateCollectionforBySetPosNull(weekCollection);
    }
    if (weekCollection.length > 0) {
        insertDatasIntoExistingCollection(weekCollection, index, state, startDate, endDate, data, ruleObject);
    }
}

// To process month collection if BYSETPOS is null
function getDateCollectionforBySetPosNull(monthCollection: number[][]): number[][] {
    let datas: number[] = [];
    for (let week: number = 0; week < monthCollection.length; week++) {
        for (let row: number = 0; row < monthCollection[week].length; row++) {
            datas.push(new Date(monthCollection[week][row]).getTime());
        }
    }
    monthCollection = datas.length > 0 ? [datas] : [];
    return monthCollection;
}

// To filter date collection when BYDAY property having values with number
function filterDateCollectionByIndex
    (monthCollection: number[][], index: number, datas: number[])
    : number[] {
    for (let week: number = 0; week < monthCollection[index].length; week++) {
        datas.push(monthCollection[index][week]);
    }
    return datas;
}

// To insert processed date collection in final array element
function insertDateCollection
    (state: boolean, startDate: Date, endDate: Date, data: number[], ruleObject: RecRule, dayData: number)
    : void {
    let expectedCount: Number = ruleObject.count ? ruleObject.count : maxOccurrence;
    let chDate: Date = new Date(dayData);
    state = validateRules(chDate, ruleObject);
    if ((chDate >= startDate) && compareDates(chDate, endDate) && state
        && expectedCount && (data.length + tempExcludeDate.length) < expectedCount) {
        excludeDateHandler(data, dayData);
    }
}

// To process datte collection based on Byset position after process the collection based on BYDAY property value index: EX:BYDAY=1SUm-1SU
function insertDateCollectionBasedonBySetPos
    (monthCollection: number[][], state: boolean, startDate: Date, endDate: Date, data: number[], ruleObject: RecRule): void {
    if (monthCollection.length > 0) {
        let index: number = ((ruleObject.setPosition < 1) ? (monthCollection.length + ruleObject.setPosition) : ruleObject.setPosition - 1);
        for (let week: number = 0; week < monthCollection.length; week++) {
            let dayData: number = monthCollection[week][index];
            insertDateCollection(state, startDate, endDate, data, ruleObject, dayData);
        }
    }
}

// To insert datas into existing collection which is processed from previous loop.
function insertDatasIntoExistingCollection
    (monthCollection: number[][], index: number, state: boolean, startDate: Date, endDate: Date, data: number[], ruleObject: RecRule)
    : void {
    for (let week: number = 0; week < monthCollection[index].length; week++) {
        let dayData: number = monthCollection[index][week];
        insertDateCollection(state, startDate, endDate, data, ruleObject, dayData);
    }
}
function compareDates(startDate: Date, endDate: Date): boolean {
    return endDate ? (startDate <= endDate) : true;
}
function getDayString(expectedDays: string): string {
    // To get BYDAY value without numeric value
    let newstr: string = expectedDays.replace(REMOVENUMBERINSTRING, '');
    return newstr;
}
function checkDayIndex(day: number, expectedDays: string[]): boolean {
    let sortedExpectedDays: string[] = [];
    expectedDays.forEach((element: string) => {
        let expectedDaysNumberSplit: string[] = element.match(SPLITNUMBERANDSTRING);
        if (expectedDaysNumberSplit.length === 2) {
            sortedExpectedDays.push(expectedDaysNumberSplit[1]);
        } else {
            sortedExpectedDays.push(expectedDaysNumberSplit[0]);
        }
    });
    return (sortedExpectedDays.indexOf(DAYINDEX[day]) === -1);
}
function getStartDateForWeek(startDate: Date, expectedDays: string[]): Date {
    let tempDate: Date = new Date(startDate.getTime());
    let newstr: string;
    if (expectedDays.length > 0) {
        let expectedDaysArr: string[] = [];
        for (let i: number = 0; i <= expectedDays.length - 1; i++) {
            newstr = getDayString(expectedDays[i]);
            expectedDaysArr.push(newstr);
        }
        if (expectedDaysArr.indexOf(DAYINDEX[tempDate.getDay()]) === -1) {
            do {
                tempDate.setDate(tempDate.getDate() + 1);
            } while (expectedDaysArr.indexOf(DAYINDEX[tempDate.getDay()]) === -1);
        }
    }
    return tempDate;
}
export function extractObjectFromRule(rules: String): RecRule {
    let ruleObject: RecRule = {
        freq: null,
        interval: 1,
        count: null,
        until: null,
        day: [],
        wkst: null,
        month: [],
        weekNo: [],
        monthDay: [],
        yearDay: [],
        setPosition: null,
        validRules: []
    };
    let rulesList: string[] = rules.split(';');
    let splitData: string[] = [];
    let temp: string;
    rulesList.forEach((data: string) => {
        splitData = data.split('=');
        switch (splitData[0]) {
            case 'UNTIL':
                temp = splitData[1];
                ruleObject.until = getDateFromRecurrenceDateString(temp);
                break;
            case 'BYDAY':
                ruleObject.day = splitData[1].split(',');
                ruleObject.validRules.push(splitData[0]);
                break;
            case 'BYMONTHDAY':
                ruleObject.monthDay = splitData[1].split(',').map(Number);
                ruleObject.validRules.push(splitData[0]);
                break;
            case 'BYMONTH':
                ruleObject.month = splitData[1].split(',').map(Number);
                ruleObject.validRules.push(splitData[0]);
                break;
            case 'BYYEARDAY':
                ruleObject.yearDay = splitData[1].split(',').map(Number);
                ruleObject.validRules.push(splitData[0]);
                break;
            case 'BYWEEKNO':
                ruleObject.weekNo = splitData[1].split(',').map(Number);
                ruleObject.validRules.push(splitData[0]);
                break;
            case 'INTERVAL':
                ruleObject.interval = parseInt(splitData[1], 10);
                break;
            case 'COUNT':
                ruleObject.count = parseInt(splitData[1], 10);
                break;
            case 'BYSETPOS':
                ruleObject.setPosition = parseInt(splitData[1], 10);
                break;
            case 'FREQ':
                ruleObject.freq = <FreqType>splitData[1];
                break;
            case 'WKST':
                ruleObject.wkst = splitData[1];
                break;
        }
    });
    if ((ruleObject.freq === 'MONTHLY') && (ruleObject.monthDay.length === 0)) {
        let index: number = ruleObject.validRules.indexOf('BYDAY');
        ruleObject.validRules.splice(index, 1);
    }
    return ruleObject;
}

function validateProperDate(tempDate: Date, data: number, startDate: Date): boolean {
    let maxDate: number = calendarUtil.getMonthDaysCount(tempDate);
    return (data <= maxDate) && (tempDate >= startDate);
}

function processWeekDays(expectedDays: string[]): { [key: string]: number } {
    let dayCycle: { [key: string]: number } = {};
    expectedDays.forEach((element: string, index: number) => {
        if (index === expectedDays.length - 1) {
            let startIndex: number = dayIndex.indexOf(element);
            let temp: number = startIndex;
            while (temp % 7 !== dayIndex.indexOf(expectedDays[0])) {
                temp++;
            }
            dayCycle[element] = temp - startIndex;
        } else {
            dayCycle[element] = dayIndex.indexOf(expectedDays[(<number>index + 1)]) - dayIndex.indexOf(element);
        }
    });
    return dayCycle;
}

function checkDate(tempDate: Date, expectedDate: Number[]): boolean {
    let temp: Number[] = expectedDate.slice(0);
    let data: Number;
    let maxDate: number = calendarUtil.getMonthDaysCount(tempDate);
    data = temp.shift();
    while (data) {
        if (data < 0) {
            data = <number>data + maxDate + 1;
        }
        if (data === tempDate.getDate()) {
            return false;
        }
        data = temp.shift();
    }
    return true;
}

function checkYear(tempDate: Date, expectedyearDay: Number[]): boolean {
    let temp: Number[] = expectedyearDay.slice(0);
    let data: Number;
    let yearDay: Number = getYearDay(tempDate);
    data = temp.shift();
    while (data) {
        if (data < 0) {
            data = <number>data + calendarUtil.getYearDaysCount(tempDate, 0) + 1;
        }
        if (data === yearDay) {
            return false;
        }
        data = temp.shift();
    }
    return true;
}

function getYearDay(currentDate: Date): Number {
    if (!startDateCollection[calendarUtil.getFullYear(currentDate)]) {
        startDateCollection[calendarUtil.getFullYear(currentDate)] = calendarUtil.getYearLastDate(currentDate, 0);
    }
    let tempDate: Date = startDateCollection[calendarUtil.getFullYear(currentDate)];
    let diff: number = currentDate.getTime() - tempDate.getTime();
    return Math.ceil(diff / MS_PER_DAY);
}

function validateMonthlyRuleType(ruleObject: RecRule): MonthlyType {
    if (ruleObject.monthDay.length && !ruleObject.day.length) {
        return 'date';
    } else if (!ruleObject.monthDay.length && ruleObject.day.length) {
        return 'day';
    }
    return 'both';
}

function rotate(days: string[]): void {
    let data: string = days.shift();
    days.push(data);
}

function setFirstDayOfWeek(day: string): void {
    while (dayIndex[0] !== day) {
        rotate(dayIndex);
    }
}

function validateRules(tempDate: Date, ruleObject: RecRule): boolean {
    let state: boolean = true;
    let expectedDays: string[] = ruleObject.day;
    let expectedMonth: Number[] = ruleObject.month;
    let expectedDate: Number[] = calendarUtil.getExpectedDays(tempDate, ruleObject.monthDay);
    let expectedyearDay: Number[] = ruleObject.yearDay;
    ruleObject.validRules.forEach((rule: string) => {
        switch (rule) {
            case 'BYDAY':
                if (checkDayIndex(tempDate.getDay(), expectedDays)) {
                    state = false;
                }
                break;
            case 'BYMONTH':
                if (calendarUtil.checkMonth(tempDate, expectedMonth)) {
                    state = false;
                }
                break;
            case 'BYMONTHDAY':
                if (checkDate(tempDate, expectedDate)) {
                    state = false;
                }
                break;
            case 'BYYEARDAY':
                if (checkYear(tempDate, expectedyearDay)) {
                    state = false;
                }
                break;
        }
    });
    return state;
}

export function getCalendarUtil(calendarMode: CalendarType): CalendarUtil {
    if (calendarMode === 'Islamic') {
        return new Islamic();
    }
    return new Gregorian();
}

let startDateCollection: { [key: string]: Date } = {};

export interface RecRule {
    freq: FreqType;
    interval: number;
    count: Number;
    until: Date;
    day: string[];
    wkst: string;
    month: number[];
    weekNo: number[];
    monthDay: number[];
    yearDay: number[];
    setPosition: number;
    validRules: string[];
}

// To use the object type to process the date collection when bysetposition is null
interface ProcessCollectionForEmptyBySetPos {
    monthCollection: number[][];
    index: number;
}

export type FreqType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
type MonthlyType = 'date' | 'day' | 'both';
type YearRuleType = 'MONTH' | 'WEEKNO' | 'YEARDAY';
let tempExcludeDate: number[];
let dayIndex: string[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
let maxOccurrence: number;
let tempViewDate: Date;
let calendarUtil: CalendarUtil;
const DAYINDEX: string[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const MAXOCCURRENCE: number = 43;
const WEEKPOS: string[] = ['first', 'second', 'third', 'fourth', 'last'];
const TIMES: string = 'summaryTimes';
const ON: string = 'summaryOn';
const EVERY: string = 'every';
const UNTIL: string = 'summaryUntil';
const DAYS: string = 'summaryDay';
const WEEKS: string = 'summaryWeek';
const MONTHS: string = 'summaryMonth';
const YEARS: string = 'summaryYear';
const DAYINDEXOBJECT: { [key: string]: string } = {
    SU: 'sun',
    MO: 'mon',
    TU: 'tue',
    WE: 'wed',
    TH: 'thu',
    FR: 'fri',
    SA: 'sat'
};

// To check string has number
const HASNUMBER: RegExp = /\d/;

// To find the numbers in string
const REMOVENUMBERINSTRING: RegExp = /[^A-Z]+/;

// To split number and string
const SPLITNUMBERANDSTRING: RegExp = /[a-z]+|[^a-z]+/gi;

export function getRecurrenceStringFromDate(date: Date): string {
    return [date.getUTCFullYear(),
    roundDateValues(date.getUTCMonth() + 1),
    roundDateValues(date.getUTCDate()),
        'T',
    roundDateValues(date.getUTCHours()),
    roundDateValues(date.getUTCMinutes()),
    roundDateValues(date.getUTCSeconds()),
        'Z'].join('');
}

function roundDateValues(date: string | number): string {
    return ('0' + date).slice(-2);
}