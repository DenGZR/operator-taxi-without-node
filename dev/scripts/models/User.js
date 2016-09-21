export class User {
    constructor(data) {
        this._data = data || {};
    }

    get id() {
        return this._data.id;
    }

    get phone() {
        return this._data.phone;
    }

    get firstName() {
        return this._data.first_name;
    }

    get middleName() {
        return this._data.middle_name;
    }

    get lastName() {
        return this._data.last_name;
    }

    get fullName() {
        return `${this.firstName} ${this.middleName} ${this.lastName}`;
    }

    get gender() {
        return this._data.gender;
    }

    get serviceId() {
        return this._data.service_id;
    }

    get name() {
        return this.fullName;
    }
}
