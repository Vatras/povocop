#!/usr/bin/env bash
docker run -dti --name povocop --link postgres:pg_ip -v ~/logs:/var/logs -p 9000:9000 \
-e "dbName=povocop_1" \
-e "dbUser=postgres" \
-e "dbPassword=povocop" \
-e "dbHost=pg_ip" \
-e "dbLoggings=true" \
-e "cachedInputDataSize=150" \
-e "secretToSignJWT=112233" \
-e "minimumCachedInputDataSize=130" \
pjesek/povocop:scheduler