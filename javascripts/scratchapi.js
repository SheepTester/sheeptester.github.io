const apis = {
  "news": {
    "name": "GET /news",
    "description": "Gets news items. Returns an array of news objects. Limited to 40 results per request.",
    "options": [],
    "query": "https://api.scratch.mit.edu/news",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/news.md#get-news"
  },
  "project_count": {
    "name": "GET /projects/count/all",
    "description": "Gets the total number of projects that have been shared on the Scratch site.",
    "options": [],
    "query": "https://api.scratch.mit.edu/",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/projects.md#get-projectscountall"
  },
  "front_page": {
    "name": "GET /proxy/featured",
    "description": "Gets the projects featured on the homepage. Returns an object of which each of its properties' values are arrays of /proxy-specific project objects (not normal project objects). Each item in any of those arrays is a project.",
    "options": [],
    "query": "https://api.scratch.mit.edu/proxy/featured",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/proxy.md#get-proxyfeatured"
  },
  "whats_happening": {
    "name": "GET /proxy/users/<name>/activity",
    "description": "Gets activity events that appear in the user's activity feed. Returns an array of activity event objects.",
    "options": ["username", "string:username"],
    "query": "https://api.scratch.mit.edu/proxy/users/$1/activity",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/proxy.md#get-proxyusersnameactivity"
  },
  "deprecated_message_count": {
    "name": "GET /proxy/users/<name>/activity/count",
    "description": "Gets the number of messages the user has. (This endpoint is deprecated in favor of /users/<name>/messages/count.)",
    "options": ["username", "string:username"],
    "query": "https://api.scratch.mit.edu/proxy/users/$1/activity/count",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/proxy.md#get-proxyusersnameactivitycount"
  },
  "follow_based": {
    "name": "GET /proxy/users/<id>/featured",
    "description": "Gets projects on the homepage that are featured to user personally. Returns an object of which each of its properties' values are arrays of project objects.",
    "options": ["user ID", "id"],
    "query": "https://api.scratch.mit.edu/proxy/users/$1/featured",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/proxy.md#get-proxyusersidfeatured"
  },
  "user_info": {
    "name": "GET /users/<username>",
    "description": "Gets metadata about the user. Returns a user object.",
    "options": ["username", "string:username"],
    "query": "https://api.scratch.mit.edu/users/$1",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/users.md#get-usersusername"
  },
  "shared_projects": {
    "name": "GET /users/<username>/projects",
    "description": "Gets a list of projects that have been shared by the user. Note that it returns oldest projects first; use offset to find more recent projects.\n\nReturns an array of project objects. Limited to 40 results per request.",
    "options": ["username", "string:username"],
    "query": "https://api.scratch.mit.edu/users/$1/projects",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/users.md#get-usersusernameprojects"
  },
  "project_info": {
    "name": "GET /users/<username>/projects/<projectID>",
    "description": "Gets a specific project created by the user, given its unique project ID. Returns a project object.",
    "options": ["username", "string:username", "project ID", "id:project"],
    "query": "https://api.scratch.mit.edu/users/$1/projects/$2",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/users.md#get-usersusernameprojectsprojectid"
  },
  "user_faves": {
    "name": "GET /users/<username>/favorites",
    "description": "Gets a list of projects that have recently been favorited by the user. Returns an array of project objects. Limited to 40 results per request.",
    "options": ["username", "string:username"],
    "query": "https://api.scratch.mit.edu/users/$1/favorites",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/users.md#get-usersusernamefavorites"
  },
  "user_followers": {
    "name": "GET /users/<username>/followers",
    "description": "Gets the users that are following the user. Returns an array of user objects. Limited to 40 results per request.",
    "options": ["username", "string:username"],
    "query": "https://api.scratch.mit.edu/users/$1/followers",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/users.md#get-usersusernamefollowers"
  },
  "user_follows": {
    "name": "GET /users/<username>/following",
    "description": "Gets the users that the user is following. Returns an array of user objects. Limited to 40 results per request.",
    "options": ["username", "string:username"],
    "query": "https://api.scratch.mit.edu/users/$1/following",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/users.md#get-usersusernamefollowing"
  },
  "message_count": {
    "name": "GET /users/<username>/messages/count",
    "description": "Gets the number of notifications the user currently has (this is the bubble-number displayed in the navigation bar).",
    "options": ["username", "string:username"],
    "query": "https://api.scratch.mit.edu/users/$1/messages/count",
    "type": "json",
    "help": "https://github.com/towerofnix/scratch-api-unofficial-docs/blob/master/api/users.md#get-usersusernamefollowingusersprojects"
  },
  "health": {
    "name": "GET /health",
    "description": "Used to return the status of the Scratch website.",
    "options": [],
    "query": "https://api.scratch.mit.edu/health",
    "type": "json",
    "help": "https://wiki.scratch.mit.edu/wiki/Scratch_API_(2.0)#GET_.2Fhealth"
  },
  "comments_studio": {
    "name": "GET /comments/gallery/<studio_id>/",
    "description": "Returns the comments on a studio in the form of raw HTML. Note: This API is deprecated, meaning that it has been superseded or is no longer considered safe. If possible, use the newer api interface.",
    "options": ["studio ID", "id"],
    "query": "https://scratch.mit.edu/site-api/comments/gallery/$1/",
    "type": "html",
    "help": "https://wiki.scratch.mit.edu/wiki/Scratch_API_(2.0)#GET_.2Fcomments.2Fgallery.2F.3Cstudio_id.3E.2F"
  },
  "comments_project": {
    "name": "GET /comments/project/<project_id>/",
    "description": "Returns the comments on a project in the form of raw HTML. Note: This API is deprecated, meaning that it has been superseded or is no longer considered safe. If possible, use the newer api interface.",
    "options": ["project ID", "id:project"],
    "query": "https://scratch.mit.edu/site-api/comments/project/$1/",
    "type": "html",
    "help": "https://wiki.scratch.mit.edu/wiki/Scratch_API_(2.0)#GET_.2Fcomments.2Fproject.2F.3Cproject_id.3E.2F"
  },
  "comments_user": {
    "name": "GET /comments/user/<username>/",
    "description": "Returns the comments on a given user's profile in the form of raw HTML. Note: This API is deprecated, meaning that it has been superseded or is no longer considered safe. If possible, use the newer api interface.",
    "options": ["username", "string:username"],
    "query": "https://scratch.mit.edu/site-api/comments/user/$1/",
    "type": "html",
    "help": "https://wiki.scratch.mit.edu/wiki/Scratch_API_(2.0)#GET_.2Fcomments.2Fuser.2F.3Cusername.3E.2F"
  },
  "v1": {
    "name": "GET /",
    "description": "The root of the API v1 interface provides basic information regarding the API.",
    "options": [],
    "query": "https://scratch.mit.edu/api/v1/",
    "type": "json",
    "help": "https://wiki.scratch.mit.edu/wiki/Scratch_API_(2.0)#GET_.2F_2"
  },
  "v1_project_info": {
    "name": "GET /project/<project_id>/",
    "description": "Returns information regarding a project and its author.",
    "options": ["project ID", "id:project"],
    "query": "https://scratch.mit.edu/api/v1/project/$1/",
    "type": "json",
    "help": "https://wiki.scratch.mit.edu/wiki/Scratch_API_(2.0)#GET_.2Fproject.2F.3Cproject_id.3E.2F"
  },
  "v1_projects": {
    "name": "GET /project/set/<project_ids>/",
    "description": "Returns information regarding a set of projects and their authors. Project IDs are separated with a semicolon.",
    "options": ["project IDs, separated by semicolons", "string"],
    "query": "https://scratch.mit.edu/api/v1/project/set/$1/",
    "type": "json",
    "help": "https://wiki.scratch.mit.edu/wiki/Scratch_API_(2.0)#GET_.2Fproject.2Fset.2F.3Cproject_ids.3E.2F"
  },
  "v1_user_info": {
    "name": "GET /user/<username>/",
    "description": "Returns information regarding the given user.",
    "options": ["username", "string:username"],
    "query": "https://scratch.mit.edu/api/v1/user/$1/",
    "type": "json",
    "help": "https://wiki.scratch.mit.edu/wiki/Scratch_API_(2.0)#GET_.2Fuser.2F.3Cusername.3E.2F"
  },
  "v1_users": {
    "name": "GET /user/set/<usernames>/",
    "description": "Returns information regarding the given users. Names should be separated with semicolons. The \"userprofile\" value for each user object is currently empty making this feature of the API effectively useless. One should note that the single user feature remains functional.",
    "options": ["usernames separated by semicolons", "string:username"],
    "query": "https://scratch.mit.edu/api/v1/user/set/$1/",
    "type": "json",
    "help": "https://wiki.scratch.mit.edu/wiki/Scratch_API_(2.0)#GET_.2Fuser.2Fset.2F.3Cusernames.3E.2F"
  },
  "project_json": {
    "name": "GET /internalapi/project/<project_id>/get/",
    "description": "Gets project.json of project",
    "options": ["project ID", "id:project"],
    "query": "https://projects.scratch.mit.edu/internalapi/project/$1/get/",
    "type": "json"
  },
  "project_asset": {
    "name": "GET /internalapi/asset/<md5>/get/",
    "description": "Gets asset of project",
    "options": ["md5 hash of asset", "string"],
    "query": "https://cdn.assets.scratch.mit.edu/internalapi/asset/$1/get/",
    "type": "asset"
  }
};
function ajax(url, callback, error = () => {}) {
  let xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = () => {
    if (xmlHttp.readyState === 4) {
      xmlHttp.status === 200 ? callback(xmlHttp.responseText, xmlHttp.status) : error(xmlHttp.responseText, xmlHttp.status);
    }
  };
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);
}
function exploreJSON(json, unparsed = false) {
  if (unparsed) json = JSON.parse(json);
  if (typeof json !== "object") {
    let span = document.createElement("span");
    span.textContent = String(json);
    switch (typeof json) {
      case "string":
        span.textContent = JSON.stringify(json);
        span.classList.add("string");
        break;
      case "number":
        span.classList.add("number");
        break;
      case "boolean":
        span.classList.add("boolean");
        break;
    }
    return span;
  } else {
    let object = document.createElement("span"),
    open = document.createElement("span"),
    close = document.createElement("span"),
    collapseBtn = document.createElement("button"),
    collapseIndicator = document.createElement("span"),
    collapsed = false;
    object.classList.add("object");
    open.classList.add("bracket");
    close.classList.add("bracket");
    collapseIndicator.textContent = "...";
    collapseIndicator.classList.add("ellipsis");
    collapseBtn.textContent = "-";
    collapseBtn.addEventListener("click", e => {
      if (collapsed) {
        collapseBtn.textContent = "-";
        object.classList.remove("collapsed");
      } else {
        collapseBtn.textContent = "+";
        object.classList.add("collapsed");
      }
      collapsed = !collapsed;
    }, false);
    object.appendChild(collapseBtn);
    if (Array.isArray(json)) {
      open.textContent = "[";
      close.textContent = "]";
      object.appendChild(open);
      for (let i = 0; i < json.length; i++) {
        let line = document.createElement("span");
        line.classList.add("line");
        line.appendChild(exploreJSON(json[i]));
        if (i < json.length - 1) line.appendChild(document.createTextNode(","));
        object.appendChild(line);
      }
    } else {
      open.textContent = "{";
      close.textContent = "}";
      object.appendChild(open);
      let properties = [];
      for (let prop in json) {
        if (!json.hasOwnProperty(prop)) continue;
        properties.push(prop);
      }
      properties.sort();
      for (let i = 0; i < properties.length; i++) {
        let line = document.createElement("span"),
        propertySpan = document.createElement("span");
        line.classList.add("line");
        propertySpan.classList.add("property");
        propertySpan.textContent = `"${properties[i]}"`;
        line.appendChild(propertySpan);
        line.appendChild(document.createTextNode(": "));
        line.appendChild(exploreJSON(json[properties[i]]));
        if (i < properties.length - 1) line.appendChild(document.createTextNode(","));
        object.appendChild(line);
      }
    }
    object.appendChild(collapseIndicator);
    object.appendChild(close);
    return object;
  }
}
let defaults;
try {
  defaults = JSON.parse(localStorage.getItem("scratch-api-explorer") || "{}");
} catch (e) {
  defaults = {};
}
function setDefaultItem(prop, val) {
  defaults[prop] = val;
  localStorage.setItem("scratch-api-explorer", JSON.stringify(defaults));
}
document.addEventListener("DOMContentLoaded", e => {
  const apiList = document.querySelector("#list"),
  executor = document.querySelector("#executor"),
  executeBtn = document.querySelector("#execute"),
  options = document.querySelector("#options"),
  requestPre = document.querySelector("#req"),
  responsePre = document.querySelector("#res"),
  defaultUsername = document.querySelector("#username"),
  defaultProject = document.querySelector("#project"),
  apiName = document.querySelector("#name"),
  apiDesc = document.querySelector("#desc");

  defaultUsername.value = defaults.username || "";
  defaultUsername.addEventListener("input", e => {
    setDefaultItem("username", defaultUsername.value);
  }, false);
  defaultProject.value = defaults.project || "";
  defaultProject.addEventListener("input", e => {
    setDefaultItem("project", defaultProject.value);
  }, false);

  let params = {};
  if (window.location.search) {
    let searchString = window.location.search;
    if (searchString[0] === "?") searchString = searchString.slice(1);
    searchString = searchString.split("&")
      .map(param => params[param.slice(0, param.indexOf("="))] = param.slice(param.indexOf("=") + 1));
  }
  if (params.api) {
    apiList.style.display = "none";
    const api = apis[params.api];
    if (api) {
      let rows = document.createDocumentFragment(),
      inputs = [];
      for (let i = 0; i < api.options.length; i += 2) {
        let row = document.createElement("tr"),
        label = document.createElement("td"),
        inputTd = document.createElement("td"),
        input = document.createElement("input"),
        colonPos = api.options[i + 1].indexOf(":");
        label.textContent = api.options[i];
        input.type = api.options[i + 1].slice(0, ~colonPos ? colonPos : undefined) === "id" ? "number" : "text";
        if (~colonPos) input.value = defaults[api.options[i + 1].slice(colonPos + 1)] || "";
        inputs.push(input);
        inputTd.appendChild(input);
        row.appendChild(label);
        row.appendChild(inputTd);
        rows.appendChild(row);
      }
      options.appendChild(rows);
      execute.addEventListener("click", e => {
        let query = api.query;
        for (let i = 0; i < inputs.length; i++) {
          query = query.replace("$" + (i + 1), inputs[i].value);
        }
        requestPre.textContent = "GET " + query;
        responsePre.innerHTML = "";
        let callback = (res, status) => {
          let statusSpan = document.createElement("span");
          statusSpan.classList.add("status");
          statusSpan.textContent = status;
          responsePre.appendChild(statusSpan);
          if (api.type === "json") responsePre.appendChild(exploreJSON(res, true));
          else responsePre.appendChild(document.createTextNode(res));
        };
        if (api.type === "asset") {
          let embed;
          if (inputs[0].value.slice(-3) === "wav") embed = document.createElement("audio"), embed.controls = true;
          else embed = document.createElement("img");
          embed.src = query;
          responsePre.appendChild(embed);
        } else ajax(query, callback, callback);
      }, false);
      apiName.textContent = api.name;
      apiDesc.textContent = api.description;
      if (api.help) {
        let helpLink = document.createElement("a");
        helpLink.href = api.help;
        helpLink.textContent = "read more";
        apiDesc.appendChild(helpLink);
      }
    } else {
      responsePre.textContent = "Such API doesn't exist.";
    }
  } else {
    executor.style.display = "none";
    let lis = document.createDocumentFragment();
    for (let api in apis) {
      if (!apis.hasOwnProperty(api)) continue;
      let li = document.createElement("a"),
      name = document.createElement("span"),
      desc = document.createElement("span");
      name.textContent = apis[api].name;
      desc.textContent = apis[api].description;
      li.href = "?api=" + api;
      li.appendChild(name);
      li.appendChild(desc);
      lis.appendChild(li);
    }
    apiList.appendChild(lis);
  }
}, false);
