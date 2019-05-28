import React, { Component } from 'react';
import './App.css';

const IPREXP = /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/;

// 192.168.1.1

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interface: 'eth0',
      dhcp: false,
      ip_address: '',
      routers: '',
      domain_name_servers: '',
      formErrors: {ip_address: '', routers: '', domain_name_servers: ''},
      addressValid: false,
      routersValid: false,
      dnsValid: false,
      formValid: false
    }
    // this.handleUserInput = this.handleUserInput.bind(this);
  }

  makeRequest (data, done) {
    const request = new XMLHttpRequest();
    request.open('POST', `http://${window.location.host}/dhcpcd`, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.send(JSON.stringify(data));
    request.onload = function () {
      done(null, request.response);
    };
    request.onerror = function () {
      done(request.response);
    };
  }

  handleFormSubmit( event ) {
    event.preventDefault();
    // disable submit
    this.setState({formValid: false});

    const dhcpcd = {
      interface: this.state.interface,
      dhcp: this.state.dhcp,
      ip_address: this.state.ip_address,
      routers: this.state.routers,
      domain_name_servers: this.state.domain_name_servers
    };

    this.makeRequest(dhcpcd, (err) => {
      if (err) throw err;
      setTimeout(() => alert("Device is rebooting"), 500);
      setTimeout(() => window.location.reload(true), 500);
    });

  }

  handleUserInput = (event) => {
    const target = event.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({[name]: value},
      () => { this.validateField(name, value) });
  }

  validateField(fieldName, value) {
    let fieldValidationErrors = this.state.formErrors;
    let addressValid = this.state.addressValid;
    let routersValid = this.state.routersValid;
    let dnsValid = this.state.dnsValid;
    let splited;

    switch(fieldName) {
      case 'ip_address':
        addressValid = false;
        splited = value.split('/');
        if (splited.length === 2) {
          const add = splited[0];
          let mask;
          try { mask = parseInt(splited[1]); }
          catch (e) {}
          if (mask > 23 && mask < 33) {
            addressValid = add.match(IPREXP);
          }
        }
        fieldValidationErrors.ip_address = addressValid ? '' : ' is invalid';
        break;
      case 'routers':
        routersValid = value.match(IPREXP);
        fieldValidationErrors.routers = routersValid ? '': ' is too short';
        break;
      case 'domain_name_servers':
        splited = value.split(" ");
        dnsValid = splited
          .map(add => add.match(IPREXP) ? 1 : 0)
            .reduce((a, b) => a + b) === splited.length ? true : false;
        fieldValidationErrors.dnsValid = dnsValid ? '': ' is too short';
        break;
      default:
        break;
    }
    this.setState({
      formErrors: fieldValidationErrors, addressValid, routersValid, dnsValid
    }, this.validateForm);
  }

  validateForm() {
    this.setState({
      formValid: (this.state.addressValid && this.state.routersValid
        && this.state.dnsValid) || this.state.dhcp
    });
  }

  routers() {
    const splited = window.location.hostname.split('.');
    splited.pop();
    splited.push('1');
    return splited.join('.');
  }

  dns() {
    return `${this.routers()} 8.8.8.8`;
  }

  errorClass(error) {
    return(error.length === 0 ? '' : 'has-error');
  }

  render() {
    return (
      <div className="App">
        <p>dhcpcd.conf</p>
        <div>
          <form action="#">

            <label>Interface</label>
            <input
              type="text"
              id="interface"
              name="interface"
              placeholder={this.state.interface}
              value={this.state.interface}
              onChange={this.handleUserInput}
            />

            <div className="dhcp">
              <input
                name="dhcp"
                type="checkbox"
                checked={this.state.dhcp}
                onChange={this.handleUserInput}
              />
              <label className="stacked">
                DHCP
              </label>
            </div>

            <label>Address/Mask</label>
            <input
              type="text"
              id="ip_address"
              name="ip_address"
              placeholder={window.location.hostname}
              value={this.state.ip_address}
              onChange={this.handleUserInput}
              disabled={this.state.dhcp}
            />

            <label>Router</label>
            <input
              type="text"
              id="routers"
              name="routers"
              placeholder={this.routers()}
              value={this.state.routers}
              onChange={this.handleUserInput}
              disabled={this.state.dhcp}
            />

            <label>DNS Servers</label>
            <input
              type="text"
              id="domain_name_servers"
              name="domain_name_servers"
              placeholder={this.dns()}
              value={this.state.domain_name_servers}
              onChange={this.handleUserInput}
              disabled={this.state.dhcp}
            />

            <button
              type="submit"
              onClick={e => this.handleFormSubmit(e)}
              disabled={!this.state.formValid}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    )
  }
}

export default App;
