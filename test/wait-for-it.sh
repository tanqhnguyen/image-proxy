#!/bin/sh
ENV_FILE="/app/.env"
set -a
[ -f $ENV_FILE ] && . $ENV_FILE
set +a

set -e
cmd="$@"

>&2 echo "Checking for postgres $TYPEORM_HOST:$TYPEORM_PORT"
until PGPASSWORD=$TYPEORM_PASSWORD psql -h "$TYPEORM_HOST" -U "$TYPEORM_USERNAME" -p "$TYPEORM_PORT" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up"

exec $cmd