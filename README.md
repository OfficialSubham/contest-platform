This file is my frustration/thoughts got while coding this project

30/1/26
-> So today while doing the signup route i was not able to compile my project even with using gpt and all i was not able to figure it out
in my previous project i had done the same things kind of like using these dependencies
I don't know why but importing things with the extensions like .js .ts there looks kind of odd so i decided to not to do that and tried almost every thing but still not able to do that
these are the things i faced in my previous hotel booking project
Then some how with the help of AI i came to know about the tsup package which compile ts code easily without kind of any folder i saw the compiled code there is actually no imports at all it is just dumping all the code in one index.js file and using it these are the thing of my previous project
Now coming to this project I was not able to figure out how can i compile this project and run then i started to compare this project with my previous project after reading the error i find out OF MY OWN that the error is because of dotenv file then i noticed that my dotenv file dependency was in devdepedencies which kind of vanishes after begin compiled so we mostly install types there then i move it out from there to dependencies then everything works as fine as \*\*\*\*;

- learned about datetime zod and offset true for allowing timezones

31/01/26

- Thinking about implementing boundary check for the start and end time of creating a contest
- I will do it tomorrow noting it in my work log

02/02/26

- Today I created the Submit dsa ans route
  Elaborating all the problem s I faced while creating this route
  First of all I know I will face problems cause i am building it fully locally
  Locally means I am not using any external thing to run the user's code

-> The thing I am doing to run the user code is
Using a docker container
Docker file is added here in the project

This is the most important part of the project which will teach me a lot of things

So my docker container is like I am using a node alpine image where i am defining a user
who is not a root user so the user cannot hijack my cloud machine by running malicious code init
like infinite loop/ deleting all files and all

There i am coping run.sh file from here to that image

in run.sh file i am taking all the input which i give from the post dsa submission route
then extraction the input and the code from that file and putting it to main.js and input.txt

at last i am running the main.js file and also providing the input that it requires

Another thing which is, as i sovle this with the help of ai I know there is another good way to solve this but not particularly know how can i do that I will do it in future when I will devlop this again with bun.
There it was doing two seperate streams instead of doing stdin it was mounting the code as a file

Now everything is simple which is just route handles nothing more

So the actual learning from this project is
More about docker stuff which is hard and I choose it.
I am creating and deleting after running a container for each test case locally on my machine using code
I stuck at "-i" use. There actually I was not able to figure out how can i actually write user's program to that container then after using -i it was writing before that docker was not giving any time to write files inside it.

Few more things to learn after this project and after completing the websocket one is docker (IMP) and Linux mostly for now the bash commands

03/02/26

- Completed the full project but still I have to recheck all the routes cause i want to make sure I pass as much testcases as possible
  Today I relearn/learn cause I previously know that but still forget about the upsert method of prisma which create it in db if it is not there.
  Also learned about the use of @@unique in db schema
  It is actually doing something like this in every row it can have same contestid or userId but together the same userid and contestId cannot exist
  And using @index which will make the contestid or anything you will specify to be indexed which help to find the data fast
  These are the thing which i think a lot to learn as a beginner from this project

See you in the next sportz-websocket-elite project
