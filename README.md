# dhcpcd-ui

A user interface for setting dhcpcd.conf.

By now, can not be used to manage more than **ONE** interface.

## Hosting

The build **must be hosted** by a device with **dhcpcd.conf based networking**.

The device must also be runnig an app using:

* **@clysema/dhcpcd** module
* **@clysema/http** module (optional but recommended)
* The user runnig the app must have password-less-enabled **sudo** (like user
  pi in Raspbian)

Using this `config/http.json` for the @clysema/http module, the whole thing is
easy to setup:
```
{
  "host": "0.0.0.0",
  "root": "/home/pi/axion-freecooling/www",
  "post": ["dhcpcd"]
}
```

## Security

There is NO SSL. The only security measure you can take is running the device
app using basic auth option of the `@clysema/http` module:

```
USERNAME=<username> PASSWORD=<password> npm start
```

## The device handles the config changes and reboot

The `@clysema/dhcpcd` module updates the `dhcpcd.conf` file and reboots the device.

## POST data

Uses an XMLHttpRequest to POST config data:
```
{
  interface: '...',
  dhcp: '...',
  ip_address: '...',
  routers: '...',
  domain_name_servers: '...'
}
```

to:
```
`http://${window.location.host}/dhcpcd`
```
