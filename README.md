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
[] CRUCIAL reassigning verification and inputData
[] CRUCIAL cache update after giving 500 inputs
[] CRUCIAL optionally provide the last approved result in config and onConfig invoke on every new (default: no)
[] CRUCIAL programmistic config change should optionally terminate the workers
[] sending random pendingVerifies
[] if redundancyFactor == 1 and rejected - make a double verification
[] result browsing and sorting it by inputData_id
[] Disconnect events handling
[x] Redundancy factor - socket id usage? mac adress usage?
[] browser plugin refactor
[] intensity of computation - CPU usage selection
[x] tracking user's performance: a CPU number test
[] tracking user's performance, adaptive scheduling
[] db replication and failover
[] own input Data as array
[] add a field in results - from which domain was the result produced (from header in sockets)
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
[] timeouts on on results computation and on validating results
SEPTEMBER:
[] highlight textareas
[] csses
[] saving showCustomFunctionField
[] validation - if user has redundancy factor but no onValidate - warn etc.
[] ranking najlepszych userow - podpiac jakiegos redisa?
[] protect results verifies to not be sent duplicated by same ip (even generate another uuid for each one)