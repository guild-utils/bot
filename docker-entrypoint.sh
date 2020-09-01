#!/bin/sh
set -e
export BUILD_DATE=$(cat /build-date)

if [ "${1#-}" != "${1}" ] || [ -z "$(command -v "${1}")" ]; then
  set -- node "$@"
fi

exec "$@"