import React from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {AsyncCreatable} from 'react-select';

import 'react-select/dist/react-select.css';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css'

import ViewResults from './viewResults'

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            from: '',
            to: '',
            startDate: moment(),
            flights: [],
            nextFlights: [],
            prevFlights: [],
            submitted: false,
            locationOptions: [],
            next: '',
            prev: '',
            isLoading:false,
        };
    }

    componentDidMount() {
        axios.get(`https://api.skypicker.com/locations/?term=Brn&v=2&locale=en-US`)
            .then(res => {
                const locationOptions = res.data;
                this.setState({
                    locationOptions: locationOptions.locations.map(location => ({
                        value: location.id,
                        label: location.name
                    }))
                });
            })
    }

    handleFromChange = (selectedOption) => {
        this.setState({from: selectedOption});
    };

    handleToChange = (selectedOption) => {
        this.setState({to: selectedOption});
    };

    handleStartDateChange = date => {
        this.setState({startDate: date});
    };

    handleSubmit = async event => {
        event.preventDefault();

        this.setState({isLoading: true});
        const from = this.state.from.label.toLowerCase();
        const to = this.state.to.label.toLowerCase();
        const date = this.state.startDate.format().split('T')[0].split('-');
        const day = date[2];
        const month = date[1];
        const year = date[0];

        await axios.get(`https://api.skypicker.com/flights?flyFrom=${from}&to=${to}&dateFrom=${day}%2F${month}%2F${year}&offset=0&limit=5`)
            .then(res => {
                const flights = res.data;

                this.setState({flights});
                this.setState({next: flights._next});
                this.setState({prev: flights._prev});
                this.setState({isLoading: false});

            });
        this.setState({submitted: true})

    };

    handleClickNext = async event => {
        event.preventDefault();
        this.setState({isLoading: true});

        let url = this.state.next.split(':10010');
        url = url[0].concat(url[1]);
        try {
            let res = await axios.get(url);
            const flights = res.data;

            this.setState({nextFlights: flights});
            this.setState({next: flights._next});
            this.setState({prev: flights._prev});
            this.setState({isLoading: false});

        } catch (err) {
            console.log(err)
        }
        this.setState({submitted: false})
    };

    handleClickPrev = async event => {
        event.preventDefault();
        this.setState({isLoading: true});


        let url = this.state.prev.split(':10010');
        url = url[0].concat(url[1]);
        try {
            let res = await axios.get(url);
            const flights = res.data;
            this.setState({nextFlights: flights});
            this.setState({next: flights._next});
            this.setState({prev: flights._prev});
            this.setState({isLoading: false});

        } catch (err) {
            console.log(err)
        }
        this.setState({submitted: false})
    };

    render() {

        const getOptions = (input, callback) => {
            setTimeout(() => {
                callback(null, {
                    options: !input ? [] : this.state.locationOptions,
                    complete: true
                });
            }, 500);
        };

        return ( <div className="formDetails">
                <h3>Select your flight</h3>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        From:
                        <AsyncCreatable
                            name="form-field-from"
                            loadOptions={getOptions}
                            onChange={this.handleFromChange}
                            value={this.state.from || ''}
                            placeholder={"Type location and confirm with enter or select from the suggestions..."}
                        />
                    </label>
                    <br/>
                    <label>
                        To:
                        <AsyncCreatable
                            name="form-field-to"
                            loadOptions={getOptions}
                            onChange={this.handleToChange}
                            value={this.state.to || ''}
                            placeholder={"Type location and confirm with enter or select from the suggestions..."}
                        />
                    </label>
                    <br/>
                    <label>
                        Date:
                        <br/>
                        <DatePicker
                            selected={this.state.startDate}
                            onChange={this.handleStartDateChange}
                        />
                    </label>
                    <br/>
                    <button className="submitButton" type="submit">Search</button>
                    <br/>
                    <br/>
                </form>
                <br/>
                <div>
                    {this.state.isLoading ? <p>Data are loading ...</p> : <div/>}
                    {this.state.submitted === true && this.state.flights ? <ViewResults> {this.state.flights.data}</ViewResults> : <div/>}
                    {this.state.next && this.state.nextFlights.data ? <ViewResults> {this.state.nextFlights.data}</ViewResults> : <div/>}
                    {this.state.prev && this.state.prevFlights.data? <ViewResults> {this.state.prevFlights.data}</ViewResults> : <div/>}
                    <br/>
                    {this.state.next ? <button type="button" onClick={this.handleClickNext}>next</button> : <div/>}

                    {this.state.prev ? <button  type="button" onClick={this.handleClickPrev}>prev</button> : <div/>}
                </div>
                <div>
                    {this.state.submitted === true && this.state.flights.data.length === 0 ? 'Sorry, no flights from ' + this.state.from.label + ' to ' + this.state.to.label + ' were found on ' + this.state.startDate.format() + '.' : ''}
                </div>
            </div>
        )
    }
}


