TODO:
[x] Write simple express server in ES5
[x] Write simple frontend - PI calculating
[x] nodejs receive cpu num and sends computation to particular nodes
[x] Make result to get to nodejs
[x] Set up postgres - column with user, results
[x] Make result to persist in database
[x] set up endpoints to get results from postgres
[x] input data - range or incremental - also in postgres
[x] input data - computation config
[x] input data having add methods, delete all and browsing all already created
[x] add separate tab for browsing and adding new data
[x] input data and config given to clients
[x]  every post make to .ajax() to encode it
[x] implement loading bar to wait on inputdata to be saved to db
[x] code in configuration
[x] code to be send after user connects
[x] config to be changed after altering it in db
[x] getting input data (not assigned) from DB and send it to users - field to which worker goes
[] result browsing and sorting it by inputData_id
[] method in worker to fetch results from db (for genetic alg) - alter the config instead and make users verify before
[] Disconnect events handling
[x] Redundancy factor - socket id usage? mac adress usage?
[] browser plugin refactor
[] intensity of computation - CPU usage selection
[x] tracking user's performance: a CPU number test
[] tracking user's performance, adaptive scheduling
[] db replication and failover
[] own input Data as array
[] function to generate custom inputData
[x] submission of computation code as a service, not file
[] validation of submitted code
[] frontend for browsing results
[] Genetic algorithm
[] Colony optimization
[] Brute force search
[] Monte Carlo simulation
[x] Giving points for computation - JWT and results save with username
[] set up docker-compose
[] securing management and results enpoints with JWT
[] check if sequelize prevents sql injection
[] documentation + examples based on created algs

SEPTEMBER:
[] highlight textareas
[] csses
[] saving showCustomFunctionField