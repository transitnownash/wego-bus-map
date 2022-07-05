# WeGo Transit Map

![screenshot](screenshot.png)

Implementation of the General Transit Feed Specification (GTFS) Realtime feed for Nashville's WeGo Public Transit bus system. Displays all vehicle locations on a map.

Requires a [separate application](https://github.com/transitnownash/gtfs-rails-api) to be up and running for the static data components (route, shapes, trips, etc.) to work properly. Configure the endpoint as `GTFS_BASE_URL` in your environment.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Development

```bash
$ npm run start
```
