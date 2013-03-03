var body = document.getElementsByTagName("body")[0];

/** Display last tweets **/

var tweetsContainer = document.getElementById("last_tweets");
var twitterApiUrl = "https://api.twitter.com/1/statuses/user_timeline/sethpolma.json?count=3&include_rts=1&callback=displayTweets";

function htmlizeTweet(tweet) {
	// Standard links
	tweet = tweet.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+\w/g, function (link) {
    return '<a href="' + link + '">' + link + '</a>';
  });
  // Hash tags
  tweet = tweet.replace(/#[A-Za-z0-9]+/g, function(hash) {
  	return '<a href="https://twitter.com/search?q=%23' + hash.substring(1) + '&src=hash">' + hash + '</a>';
  });
  // Mentions
  tweet = tweet.replace(/@[A-Za-z0-9]+/g, function(mention) {
  	return '<a href="https://twitter.com/' + mention.substring(1) + '">' + mention + '</a>';
  });
  return tweet;
}

function displayTweets(tweets) {
	for(var i = 0 ; i < tweets.length ; i++) {

		var tweet = tweets[i];
		if(tweet.retweeted_status) {
			tweet = tweet.retweeted_status;
		}

		var tweetElement = document.createElement("div");
		tweetElement.classList.add("tweet");

		var profileLink = document.createElement("a");
		profileLink.setAttribute("href", "http://twitter.com/" + tweet.user.screen_name);

		var avatar = document.createElement("img");
		avatar.setAttribute("src", tweet.user.profile_image_url);
		avatar.setAttribute("alt", tweet.user.screen_name);
		avatar.setAttribute("title", "By " + tweet.user.screen_name);
		avatar.classList.add("avatar");
		profileLink.appendChild(avatar);
		tweetElement.appendChild(profileLink);

		var message = document.createElement("span");
		message.innerHTML = htmlizeTweet(tweet.text);
		tweetElement.appendChild(message);

		var clearDiv = document.createElement("div");
		clearDiv.classList.add("clear");
		tweetElement.appendChild(clearDiv);

		tweetsContainer.appendChild(tweetElement);
	}
}

var script = document.createElement("script");
script.setAttribute("src", twitterApiUrl);
body.appendChild(script);

/** Display recent GitHub activity **/

var githubContainer = document.getElementById("github_activity");
var githubApiUrl = "https://api.github.com/users/jpetitcolas/events?callback=displayGithubActivity";

function displayGithubActivity(activities) {
	for(var i = 0 ; i < 4 ; i++) {
		var activity = activities.data[i];

		var activityElement = document.createElement("div");
		activityElement.classList.add("github");
		activityElement.classList.add(activity.type);

		var message = "";
		switch(activity.type) {
			case "FollowEvent":
				var payload = activity.payload.target;
				message = "Just followed <a href='http://github.com/" + payload.login  + "'>" + payload.login + "</a>.";
				break;
			case "WatchEvent":
				var repository = activity.repo;
				message = "Watching <a href='http://github.com/" + repository.name + "'>" + repository.name + "</a> repository.";
				break;
			case "PushEvent":
				var lastCommit = activity.payload.commits.pop();
				var repository = activity.repo;
				var detailsUrl = 'http://github.com/' + repository.name + "/commit/" + lastCommit.sha;
				message  = "Pushed to <a href='http://github.com/" + repository.name + "'>" + repository.name + "</a>: " + lastCommit.message;
				message += " (<a href='" + detailsUrl + "'>see details</a>)";
				break;
			default:
				console.warn("Event '" + activity.type + "' not dealed.");
				continue;
		}

		var messageContainer = document.createElement('span');
		messageContainer.innerHTML = message;
		activityElement.appendChild(messageContainer);

		githubContainer.appendChild(activityElement);
	}
}

var script = document.createElement("script");
script.setAttribute("src", githubApiUrl);
body.appendChild(script);