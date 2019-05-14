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

    // Make API call to open cage data to get the latitude and longitude coordinates of the user selected city to be passed into the API call to get the time zone 
    getCoordinatesByCity = async (city, country) => {
        const url = new URL("https://api.opencagedata.com/geocode/v1/json"),
            params = {
                key: geocodingApiKey,
                q: `${city}+${country}`
            };

        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        const res = await fetch(url);
        return await res.json();
    };

    // Use the coordinates from the previous API call to get the time zone of the user selected city
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
        console.log(e.target)
        const city = e.target.elements.cityInput.value;
        const country = e.target.elements.countryInput.value;

        if (city) {
            this.getCoordinatesByCity(city, country)
                .then(res => {
                    res = res.results;
                    return res[0].geometry;
                })
                .then(res => {
                    return this.getTimeZoneByCoordinates(res);
                })
                .then(res => {
                    this.props.getCurrentTimeZone(res.abbreviation);
                })
                .catch(error => {
                    console.log(error)
                })
            
        } else {
            console.log('please enter city')
        }
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
                    />
                    <select
                        name="countryInput"
                        id="countryInput"
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