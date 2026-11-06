import { format } from 'date-fns'

type DateMismatchParams = {
    dateInRequest: Date
    datesInBhavcopy: Date
}

class DateMismatch extends Error {
    private accessor _dateInRequest: Date
    public get dateInRequest() {
        return this._dateInRequest
    }

    private accessor _datesInBhavcopy: Date
    public get dateInBhavcopy() {
        return this._datesInBhavcopy
    }

    constructor({ dateInRequest, datesInBhavcopy }: DateMismatchParams) {
        super(
            `Dates in the bhavcopy (${format(
                datesInBhavcopy,
                'dd-MM-yyyy'
            )}) doesn't match the date in the http request (${format(
                dateInRequest,
                'dd-MM-yyyy'
            )}).`
        )
        this._dateInRequest = dateInRequest
        this._datesInBhavcopy = datesInBhavcopy
    }
}

class AlreadyExist extends Error {
    constructor(date: Date) {
        super(
            `Bhavcopy for the date '${format(
                date,
                'dd-MM-yyyy'
            )} already downloaded and stored`
        )
    }
}

export { DateMismatch, AlreadyExist }
