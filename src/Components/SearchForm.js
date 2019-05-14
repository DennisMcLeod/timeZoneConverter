import React, { Component } from 'react';

const timeZoneApiKey = process.env.REACT_APP_TIME_ZONE_API_KEY;
const geocodingApiKey = process.env.REACT_APP_GEOCODING_API_KEY;


class SearchForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            city: "",
            country: ""
        }
    }
    
    handleCityChange = event => {
        this.setState({
            city: event.target.value
        });
    };

    handleCountryChange = event => {
        this.setState({
            country: event.target.value
        });
    };

    getCoordinatesByCity = async () => {
        const url = new URL("https://api.opencagedata.com/geocode/v1/json"),
            params = {
                key: geocodingApiKey,
                q: `${this.state.city}+${this.state.country}`
            };

        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        const res = await fetch(url);
        return await res.json();
    };

    getTimeZoneByCoordinates = async coordinates => {
        const url = new URL("http://api.timezonedb.com/v2.1/get-time-zone"),
            params = {
                key: timeZoneApiKey,
                format: "json",
                by: "position",
                lat: coordinates.lat,
                lng: coordinates.lng
            };

        Object.keys(params).forEach(key =>
            url.searchParams.append(key, params[key])
        );
        const res = await fetch(url).then(response => response.json());
        return res;
    };

    convertTimeZoneToLocalTime = async foreignTimeZone => {
        const url = new URL("http://api.timezonedb.com/v2.1/convert-time-zone"),
            params = {
                key: timeZoneApiKey,
                format: "json",
                from: "",
                to: foreignTimeZone
            };

        Object.keys(params).forEach(key =>
            url.searchParams.append(key, params[key])
        );
        const res = await fetch(url).then(response => response.json());
        return res;
    };

    handleSearchSubmit = e => {
        e.preventDefault();
        this.getCoordinatesByCity()
            .then(res => {
                res = res.results;
                return res[0].geometry;
            })
            .then(res => {
                return this.getTimeZoneByCoordinates(res);
            })
            .then(res => {
                this.props.getCurrentTimeZone(res.abbreviation);
            });
    };

    render() {
        return (
            <div>
                <form onSubmit={this.handleSearchSubmit}>
                    <input
                        type="text"
                        id="cityInput"
                        placeholder="City"
                        name="cityInput"
                        value={this.state.city}
                        onChange={this.handleCityChange}
                    />
                    <select
                        name="countryInput"
                        id="countryInput"
                        onChange={this.handleCountryChange}
                    >
                        <option value="Canada">Canada</option>
                        <option value="USA">USA</option>
                    </select>
                    <input type="submit" />
                </form>
            </div>
        );
    }
}

export default SearchForm;