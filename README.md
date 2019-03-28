# HappyFoxData

Small app to pull info from HappyFox and store it in an SQL database.

### Prerequisites

* Node.JS installed
* A running postgres database 

### Database Setup

Launch the psql command line:

`sudo -i -u postgres`

Create a database for the project:

```sql
CREATE DATABASE happyfoxdata;
```

Select the database you just created:

```
postgres=# \connect happyfoxdata
You are now connected to database "happyfoxdata" as user "postgres".
```

Create a few tables in the database:

```
CREATE TABLE vrstickets (timestamp text, ticketcount integer);
```

```
CREATE TABLE mainttickets (timestamp text, ticketcount integer);
```


```
CREATE TABLE logontickets (timestamp text, ticketcount integer);
```

### Installation

`npm install`

### Setup

`cp auth.json.example auth.json`

Change the token in auth.json to your HappyFox API credentials.

### Running

`node app.js`
