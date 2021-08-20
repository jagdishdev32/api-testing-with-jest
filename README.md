# API Testing with Jest

API testing with **Jest** and **Supertest**

## Commands

Before running commands make have running postgresql database running, and update database details in db.js file

```bash
npm install	# Install dependencies
npm start	# Start project

# If Jest is not installed
# npm install jest -g	# Install jest globally
jest	# Start testing
```

## Testing Routes

### Student Modal API Testing

Routes Details:

    - GET /students - Get All Students List
    - POST /students - Create New Student
    - PATCH /students/:id - Update Student Details
    - DELETE /students/:id - Delete Student

### User Modal API Testing

Routes Details:

    - POST /users/auth - returns a JWT when a successful username and password are sent
    - GET /users/ - returns all of the users, requires a valid JWT
    - GET /users/secure/:id - returns a simple messages, requires a valid JWT and the id in the URL has to match the id stored in the JWT
