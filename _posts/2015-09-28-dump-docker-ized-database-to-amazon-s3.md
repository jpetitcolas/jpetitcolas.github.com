---
layout: post
title: "How-to dump your Docker-ized database on Amazon S3?"
excerpt: "I got a few side-projects in production, a majority using Docker containers. Who says production also says data backup. Here is a post describing how I regularly upload my database dumps directly from a Docker container to Amazon S3 servers."
illustration: "/img/posts/s3-backup/backup.jpg"
illustration_thumbnail: "/img/posts/s3-backup/backup-thumb.jpg"
---

I got a few side-projects in production, a majority using Docker containers. Who
says production also says data backup. Here is a post describing how I regularly
upload my database dumps directly from a Docker container to Amazon S3 servers.

## Dumping Docker-ized database on host

First step is to create a dump of our database. Let's consider we have an
`awesomeproject_pgsql` container:

``` sh
#!/bin/bash

# Configuration
CONTAINER_NAME="awesomeproject_pgsql"
FILENAME="awesomeproject-`date +%Y-%m-%d-%H:%M:%S`.sql"
DUMPS_FOLDER = "/home/awesomeproject/dumps/"

# Backup from docker container
docker exec $CONTAINER_NAME sh -c "PGPASSWORD=\"\$POSTGRES_PASSWORD\" pg_dump --username=\$POSTGRES_USER \$POSTGRES_USER > /tmp/$FILENAME"
docker cp $CONTAINER_NAME:/tmp/$FILENAME $DUMPS_FOLDER
docker exec $CONTAINER_NAME sh -c "rm /tmp/awesomeproject-*.sql"
```

After setting a few configuration variables to ease re-use of this script, we
execute via the `docker exec` command a dump of our PSQL database. For a MySQL
one, process would be quite the same, just replace `pg_dump` by `mysqldump`. We
put the dump into the container `/tmp` folder.

Note the `sh -c` command. This way, we can pass a whole command (including file
redirections) as a string, without worrying about conflicts between host and
container paths.

Database credentials are passed via environment variables. Note the `\` inside
the Docker shell command: it is important as we want these variables to be
interpreted in the Docker container, not when host interpret the command. In
this example, I'm using the [official PostGreSQL](https://hub.docker.com/_/postgres/)
image from Docker Hub setting these variables at container creation.

We then copy the file from the container to the host using the `docker cp`
command, and clean the container temporary folder.

## Keeping only last backups

I generally keep my data backups for a week. You should then have 7 days to
detect some data anomalies and to restore a dump. Some developers prefers to
keep another backup per month, but except in very sensitive environment, data
are too outdated to be useful. So, let's focus on last 7 days:

``` sh
# Keep only 7 most recent backups
cd $DUMPS_FOLDER && (ls -t | head -n 7 ; ls -t) | uniq -u | xargs --no-run-if-empty rm
cd $DUMPS_FOLDER && bzip2 --best $FILENAME
```

The first command probably looks like voodoo. Let's explicit it. First step, we
go into the dumps folder. Note we need to repeat it on all following lines.
Indeed, commands are executed each in their own sub-process. Thus, the `cd` only
affect current command, on a single line.

The `(ls -t | head -n 7 ; ls -t)` command is a parallel command. We actually
execute two different commands at the same time, to send their result on the
standard output. We list (`ls`) our files by modification time (`-t`), newer
first. We then keep the 7 first lines (`head -n 7`).

In addition, we also display all available files. So, all files we should keep
are displayed twice.

Finally, we keep only the unique lines, using `uniq -u`, and `rm` each result.
The `--no-run-if-empty` is just to prevent an error when no file needs to be
deleted.

As we pay Amazon depending of the amount of data stored on Amazon S3, we also
compress at the maximum our dumps, using `bzip2 --best`. Even if prices are
really cheap, it is always worthy to use a single command to save money, isn't it?

## Uploading database dumps on Amazon S3

Storing dumps on the same machine than databases is not a good idea. Hard disk
may crash, user may block itself from connecting because of too restrictive
`iptables` rules (true story), etc. So, let's use a cheap and easy-to-use
solution: moving our dumps to Amazon S3.

For those unfamiliar with Amazon services, S3 should have been called "Amazon
Unlimited FTP Servers", according to the [AWS in Plain English](https://www.expeditedssl.com/aws-in-plain-english)
post. It is used to:

> Store images and other assets for websites. Keep backups and share files
between services. Host static websites. Also, many of the other AWS services
write and read from S3.

Of course, you can restrict access to your files, as we are going to configure it.

### Creating bucket

First step is to create a S3 bucket. You can replace `bucket` by `hosting` for a
better understanding. So, log on your [Amazon Web Services (AWS) console](https://console.aws.amazon.com/console/home),
and select S3. Then, `Create bucket` and give it a name and locate it.

<div class="image">
    <img src="/img/posts/db-dumps/s3-create-bucket.png" alt="Create a bucket on Amazon S3" title="Create a bucket on Amazon S3" class="responsive" />
</div>

Keep defaut values for all others parameters. We are now going to restrict access to our bucket creating a specific user.

### Creating restricted access to our bucket

This is the only painful step: creating a user with correct permissions to
access our bucket. Indeed, our server script needs to connect on AWS. We can of
course give it our own root AWS credentials. But, as it is safer to use a
low-privileges account instead of `root` on Linux, we are going to create an
`awesomeproject` user.

So, go on the [IAM service](https://console.aws.amazon.com/iam/home) (`Identity
and Access Management`). On the left menu, choose `Policies` and create a new
one from scratch. Give it a name, a description, and add the following content:

``` json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListAllMyBuckets"
            ],
            "Resource": "arn:aws:s3:::*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::awesomeproject-private"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::awesomeproject-private/*"
            ]
        }
    ]
}
```

This policy allows three operations, respectively:

* Listing all buckets available to user (required to connect on S3),
* List bucket content on the specified resource,
* Write, read and delete permissions on bucket content.

<p class="image">
    <img src="/img/posts/db-dumps/s3-policy.png" alt="Create a Amazon IAM policy" title="Create a Amazon IAM policy" class="responsive" />
</p>

Validate the policy and create a new user (in the `Users` menu). Do not forget to
save her credentials, as you will never be able to retrieve her secret access key
anymore.

Finally, select the fresh new user, and attach it your `AwesomeProjectPrivate`
policy. This cumbersome configuration is now completed. Let's write our last
lines of Bash.

### Uploading our dumps on Amazon S3

To upload our files, we use the AWS-CLI tools. Installing them is as simple as:

``` sh
sudo pip install awscli
```

After configuring user credentials through the `aws configure` command, we can
complete our script with the following lines:

``` sh
# Configuration
BUCKET_NAME="awesomeproject-private"

# [...]

# Upload on S3
/usr/bin/aws s3 sync --delete $DUMPS_FOLDER s3://$BUCKET_NAME
```

We synchronize our dumps folder (removing obsolete files) to our bucket. Do not
forget to use a full path to the AWS binary. Otherwise, you may get some errors
when launched from a Cron job.

## Final Script

For the record, here is the full script:

``` sh
#!/bin/bash

# Configuration
CONTAINER_NAME="awesomeproject_pgsql"
FILENAME="awesomeproject-`date +%Y-%m-%d-%H:%M:%S`.sql"
DUMPS_FOLDER = "/home/awesomeproject/dumps/"
BUCKET_NAME="awesomeproject-private"

# Backup from docker container
docker exec $CONTAINER_NAME sh -c "PGPASSWORD=\"\$POSTGRES_PASSWORD\" pg_dump --username=\$POSTGRES_USER \$POSTGRES_USER > /tmp/$FILENAME"
docker cp $CONTAINER_NAME:/tmp/$FILENAME $DUMPS_FOLDER
docker exec $CONTAINER_NAME sh -c "rm /tmp/awesomeproject-*.sql"

# Keep only 7 most recent backups
cd $DUMPS_FOLDER && (ls -t | head -n 7 ; ls -t) | uniq -u | xargs --no-run-if-empty rm
cd $DUMPS_FOLDER && bzip2 --best $FILENAME

# Upload on S3
/usr/bin/aws s3 sync --delete $DUMPS_FOLDER s3://$BUCKET_NAME
```

## Cron task

Finally, let's cron our script to automatically save our data each day. Add the
following file into `/etc/cron.d/awesomeproject`:

```
# Daily DB backup
00 23 * * * awesomeproject /home/ubuntu/awesomeproject/bin/db-save.sh >> /home/ubuntu/cron.out.log 2>&1
```

It launches the script every day at 11pm as `awesomeproject` user. Rather use
absolute paths instead of relative one. It would prevent you from serious headaches.

Another useful tip when you deal with crons is to redirect their output to a file.
It is really essential for debugging. Here, we redirect standard output to the
`cron.out.log` file (via the `>>` operator), and redirect the error output to the
standard output, thanks to `2>&1`.

We can now enjoy the security of daily database dumps. Great!
