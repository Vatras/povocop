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
[] input data and config given to clients
[] securing management and results enpoints with JWT
[] implement loading bar to wait on inputdata to be saved to db
[] getting input data (not assigned) from DB and send it to users
[] result browsing and sorting it by inputData_id
[] method in worker to fetch results from db (for genetic alg)
[] Disconnect events handling
[] Redundancy factor
[] browser plugin refactor
[] intensity of computation - CPU usage selection
[x] tracking user's performance: a CPU number test
[] tracking user's performance, adaptive scheduling
[] db replication and failover
[] submission of computation code as a service, not file
[] validation of submitted code
[] frontend for browsing results
[] Genetic algorithm
[] Colony optimization
[] Brute force search
[] Monte Carlo simulation
[x] Giving points for computation - JWT and results save with username
[] set up docker-compose
[] check if sequelize prevents sql injection
[] documentation + examples based on created algs