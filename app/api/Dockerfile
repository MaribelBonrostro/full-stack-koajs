##
## 1. Add multi-stage build steps
##


##
## 2. Set the runtime image
##
FROM ... AS runtime

ENV NODE_ENV production
ENV NODE_CONFIG_STRICT_MODE false
ENV VERSION ${VERSION}
ENV LOG_LEVEL error

WORKDIR /opt/app

RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

##
## 3. Add runtime dependencies
##

##
## 4. Add transpiled project files
##


##
## 5. Add any other files needed
##


##
## 6. Optional considerations:
##
##  - Container security
##  - File Permissions
##

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

## 7. Add the command to run the application
CMD []
