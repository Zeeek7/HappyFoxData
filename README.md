# HappyFoxData

Small app to pull info from HappyFox and store it in an SQL database.

### Prerequisites

* Node.JS installed
* A running postgres database 

### Database Setup

Launch the psql command line:

`sudo -i -u postgres`

`psql`

Create a database for the project:

```sql
CREATE DATABASE happyfoxdata;
```

Select the database you just created:

```sql
\connect happyfoxdata
```

Create a few tables in the database:

```sql
CREATE TABLE vrstickets (timestamp text, ticketcount integer);
```

```sql
CREATE TABLE mainttickets (timestamp text, ticketcount integer);
```


```sql
CREATE TABLE logontickets (timestamp text, ticketcount integer);
```

### Installation

`npm install`

### Setup

`cp config.json.example config.json`

Change the database connection details and happyfox api credential details in config.json

### Running

`node app.js`
