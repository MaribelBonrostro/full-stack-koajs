# Getting Started

Here are instructions for how to run the applications on your host machine

## Postgres

Before you run your application you should ensure that the application has access to Postgres database that has the required migrations applied to it. There is an easy to use Docker Compose file to do this for you.

We won't provide you with the Docker Compose commands, but you should be easily able to get this running.

The API is already configured to access the Postgres database defined in the `docker-compose.yml` file using the credentials set there.

## API

There is a Postgres database available for you to run using Docker Compose. You should use the Docker Compose command(s) to get this running before running the API.

Once you have the Postgres database running you can then run the following to start the API

```bash
cd app/api
npm start
```

The API by default runs on port `9000` by default and also ships with Swagger documentation and UI. You can navigate to `http://localhost:9000/docs` in your browser to view the Swagger UI and `http://localhost:9000/docs/spec` to view the Swagger spec.

### Configuring the API

The default configuration for the API application is found in the `app/api/config/default.yaml` file. You can override this by creating a configuration YAML file in `app/api/config/local.yaml`. The simplest way to do this is to copy the `default.yaml` file in the configuration directory and change the values you would prefer, i.e.

```bash
cp app/api/config/default.yaml app/api/config/local.yaml
```

The other way to override default values is to use environment variables. The mapping between environment variables and the configuration they bind to is set in the `app/api/config/custom-environment-variables.yaml` file. You can set environment variables when running the application, such as

```bash
cd app/api
LOG_LEVEL=trace npm start
```

### Running tests

Once you have the Postgres database running you can run the tests for the API with the following

```bash
cd app/api
npm t
```

Or if you would like to run coverage tests you can run

```bash
cd app/api
npm run test:coverage
```

## UI

This where the UI component of the test will reside. You will choose a framework to build it in and provide instructions for how to run it.
