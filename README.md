# Node.js Server

## Hello All

Welcome to my example of a node.js server that uses a MongoDB database.

### Why node.js?

Because it's efficient. In PHP when you execute a blocking code '$output = mysql_query('SELECT * FROM Users');' the process or the thread will remain idle while it waits. This wastes system resources. Because node.js is written in a non-blocking, event-driven programming language called JavaScript, executing a query such as 'User.find({}, function(users){ });' will not block and the callback 'function(users){ }' containing the users will be called when the query finishes. The thread doesn't have to wait. It can move on to process succeeding executions.

### Why MongoDB?

Speed and horizontal scaling. MongoDB stores data in a JSON-like storage format called Binary JSON or BSON. One of the advantages of this storage system is that it allows MongoDB to internally index and map document properties, even nested documents. This makes it possible to scan collections efficiently, allowing MongoDB's high read/write throughput. It also makes it possible to perform complex queries on the database. Another reason why I decided to use MongoDB is because it has a feature called sharding, which splits data into pieces called shards and distributes them among different machines. This makes it possible to scale just by simply adding a machine.