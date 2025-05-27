# How to use
First run 
```
npm install
```
 to install all node_modules

there are 2 env variables that must be defined,
SLACK_BOT_TOKEN= token to the slack bot which is going to print the messages
SLACK_CHANNEL_ID= channel id present in slack.

Note that the bot must have write in slack channel permissions.

the third env variable 'PORT' should be defined if you want to run locally on a port.
If you are hosting the website, then just comment out 
``` 
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```
present in index.js

# code logic
There are 3 main variables, messageOpen, messageClose and currentBroStatus.
Every call to /api/message/sendMsg will first invert the currentBroStatus, and then print the corresponding variable's value.

if currentBroStatus was true, it will invert it's state to false and print messageClose, and vice verca.  


# customizing
As of now, every time the server starts, the first call to /api/message/sendMsg will print whatever string is in the variable messageClose in printFromBro.js
To customize the values of whatever is printed and the first message to be printed, change the values of those 3 variables accordingly

# endpoints

1. hostname/api/message/sendMsg To send alternating message in slack channel
2. hostname/api/keyHolders/getHolders to get all current key holders
3. hostname/api/keyHolders/addHolder (post request with enroll_num as body of request) to add enrollment number to keyholders table.

# env variables

1. SLACK_BOT_TOKEN
2. SLACK_CHANNEL_ID
These both are for the sendMSg route
3. DATABASE_URL
To connect with database
4. PORT (to specify port for localhost)
